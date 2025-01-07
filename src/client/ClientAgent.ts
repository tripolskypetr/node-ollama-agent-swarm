import { not, queued, Subject } from "functools-kit";
import { omit } from "lodash-es";
import { Message, Tool } from "ollama";
import { CC_OLLAMA_EMIT_TOOL_PROTOCOL } from "src/config/params";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import { AgentName } from "../utils/getAgentMap";
import ConnectionPrivateService from "src/services/private/ConnectionPrivateService";
import HistoryPrivateService from "src/services/private/HistoryPrivateService";
import CompletionService from "src/services/api/CompletionService";
import { TContextService } from "src/services/base/ContextService";
import validateNoToolCall from "src/validation/validateNoToolCall";

/**
 * @see https://github.com/ollama/ollama/blob/86a622cbdc69e9fd501764ff7565e977fc98f00a/server/model.go#L158
 */
const TOOL_PROTOCOL_PROMPT = `For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{"name": <function-name>, "arguments": <args-json-object>}
</tool_call>
`;

export interface IAgentTool<T = Record<string, unknown>> {
  call(agentName: AgentName, params: T): Promise<void>;
  validate(agentName: AgentName, params: T): Promise<boolean> | boolean;
  getToolSignature(): AgentToolSignature<T>;
}

export interface AgentToolSignature<T = Record<string, unknown>>
  extends Tool,
    Omit<
      IAgentTool<T>,
      keyof {
        call: never;
        getToolSignature: never;
      }
    > {
  implementation(agentName: AgentName, params: T): Promise<void>;
}

interface IAgentParams {
  agentName: AgentName;
  clientId: string;
  prompt: string;
  tools?: AgentToolSignature[];
}

export interface IAgent {
  execute: (input: string[]) => Promise<void>;
  beginChat: () => Promise<void>;
  commitToolOutput(content: string): Promise<void>;
  commitSystemMessage(message: string): Promise<void>;
}

/**
 * @description `ask for agent function` in `llama3.1:8b` to troubleshoot
 */
const TOOL_CALL_EXCEPTION_PROMPT = "Start the conversation";

export class ClientAgent implements IAgent {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly contextService = inject<TContextService>(TYPES.contextService);
  readonly completionService = inject<CompletionService>(
    TYPES.completionService
  );
  readonly connectionPrivateService = inject<ConnectionPrivateService>(
    TYPES.connectionPrivateService
  );

  readonly historyPrivateService = inject<HistoryPrivateService>(
    TYPES.historyPrivateService
  );

  readonly _toolCommitSubject = new Subject<void>();

  constructor(readonly params: IAgentParams) {}

  getCompletion = async (): Promise<{ message: Message }> => {
    this.loggerService.debugCtx(
      `ClientAgent agentName=${this.params.agentName} getCompletion`
    );
    return await this.completionService.getCompletion(
      this.contextService.context,
      await this.historyPrivateService.toArray(this.params.agentName),
      this.params.tools?.map((t) => omit(t, "implementation"))
    );
  };

  beginChat = async () => {
    this.loggerService.debugCtx(
      `ClientAgent agentName=${this.params.agentName} beginChat`
    );
    await this.historyPrivateService.push(this.params.agentName, {
      role: "system",
      content: this.params.prompt.trim(),
    });
    if (CC_OLLAMA_EMIT_TOOL_PROTOCOL) {
      await this.historyPrivateService.push(this.params.agentName, {
        role: "system",
        content: TOOL_PROTOCOL_PROMPT,
      });
    }
  };

  commitSystemMessage = async (message: string): Promise<void> => {
    this.loggerService.debugCtx(
      `ClientAgent agentName=${this.params.agentName} commitSystemMessage`
    );
    await this.historyPrivateService.push(this.params.agentName, {
      role: "system",
      content: message.trim(),
    });
  };

  commitToolOutput = async (content: string): Promise<void> => {
    this.loggerService.debugCtx(
      `ClientAgent agentName=${this.params.agentName} commitToolOutput content=${content}`
    );
    await this.historyPrivateService.push(this.params.agentName, {
      role: "tool",
      content,
    });
    await this._toolCommitSubject.next();
  };

  execute = queued(async (messages: string[]) => {
    this.loggerService.debugCtx(
      `ClientAgent agentName=${this.params.agentName} execute begin`,
      { messages }
    );
    if (await not(this.historyPrivateService.length(this.params.agentName))) {
      await this.beginChat();
    }
    for (const message of messages) {
      await this.historyPrivateService.push(this.params.agentName, {
        role: "user",
        content: message.trim(),
      });
    }
    const response = await this.getCompletion();
    if (response.message.tool_calls) {
      this.loggerService.debugCtx(
        `ClientAgent agentName=${this.params.agentName} tool call begin`
      );
      for (const tool of response.message.tool_calls) {
        const targetFn = this.params.tools?.find(
          (t) => t.function.name === tool.function.name
        );
        await this.historyPrivateService.push(
          this.params.agentName,
          response.message
        );
        if (
          targetFn &&
          (await targetFn.validate(
            this.params.agentName,
            tool.function.arguments
          ))
        ) {
          await targetFn.implementation(
            this.params.agentName,
            tool.function.arguments
          );
          this.loggerService.debugCtx(
            `ClientAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool call executing`
          );
          await Promise.race([
            this._toolCommitSubject.toPromise(),
            this.connectionPrivateService.waitForOutput(),
          ]);
          this.loggerService.debugCtx(
            `ClientAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool call end`
          );
          return;
        }
        this.loggerService.debugCtx(
          `ClientAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool function not found`
        );
        await this.historyPrivateService.clear(this.params.agentName);
        await this.beginChat();
        await this.historyPrivateService.push(this.params.agentName, {
          role: "user",
          content: TOOL_CALL_EXCEPTION_PROMPT,
        });
        {
          const response = await this.getCompletion();
          const result = response.message.content;
          await this.historyPrivateService.push(
            this.params.agentName,
            response.message
          );
          this.loggerService.debugCtx(
            `ClientAgent agentName=${this.params.agentName} execute end result=${result}`
          );
          await this.connectionPrivateService.emit(
            result,
            this.params.agentName
          );
        }
        return;
      }
    }
    if (!response.message.tool_calls) {
      this.loggerService.debugCtx(
        `ClientAgent agentName=${this.params.agentName} execute no tool calls detected`
      );
    }
    const result = response.message.content;
    await this.historyPrivateService.push(
      this.params.agentName,
      response.message
    );
    this.loggerService.debugCtx(
      `ClientAgent agentName=${this.params.agentName} execute end result=${result}`
    );
    debugger
    if (result) {
      await validateNoToolCall(result, this.contextService.context);
      await this.connectionPrivateService.emit(result, this.params.agentName);
    }
    return;
  }) as unknown as IAgent["execute"];

  dispose = async () => {
    this.loggerService.debugCtx(
      `ClientAgent agentName=${this.params.agentName} dispose`
    );
    await this.historyPrivateService.dispose(this.params.agentName);
  };
}

export default ClientAgent;

import { factory } from 'di-factory';
import { not, PubsubArrayAdapter, singlerun } from 'functools-kit';
import { omit } from 'lodash-es';
import { Ollama, Message, Tool } from 'ollama'
import { CC_OLLAMA_HOST, CC_OLLAMA_MESSAGES, CC_OLLAMA_MODEL } from 'src/config/params';
import TYPES from 'src/config/types';
import { inject } from 'src/core/di';
import LoggerService from 'src/services/base/LoggerService';
import { AgentName } from '../utils/getAgentMap';
import ConnectionPrivateService from 'src/services/private/ConnectionPrivateService';
import HistoryPrivateService from 'src/services/private/HistoryPrivateService';

const ollama = new Ollama({ host: CC_OLLAMA_HOST });

export interface AgentTool extends Tool {
  implementation(...args: any[]): Promise<string> | string;
}

interface IAgentParams {
  agentName: AgentName;
  clientId: string;
  prompt: string;
  tools?: AgentTool[];
}

export interface IAgent {
  execute: (input: string) => Promise<void>;
  beginChat: () => Promise<void>;
}

export const BaseAgent = factory(class implements IAgent {

  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly connectionPrivateService = inject<ConnectionPrivateService>(TYPES.connectionPrivateService);

  readonly historyPrivateService = inject<HistoryPrivateService>(TYPES.historyPrivateService);

  constructor(readonly params: IAgentParams) { }

  getChat = async () => await ollama.chat({
    model: CC_OLLAMA_MODEL,
    keep_alive: "24h",
    messages: await this.historyPrivateService.toArray(this.params.agentName),
    tools:  this.params.tools?.map((t) => omit(t, 'implementation')),
  });

  beginChat = async () => {
    this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} beginChat`);
    await this.historyPrivateService.push(this.params.agentName,{
      'role': 'system',
      'content': this.params.prompt.trim(),
    });
  };

  execute = singlerun(async (message: string) => {
    this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} execute begin message=${message}`);
    if (await not(this.historyPrivateService.length(this.params.agentName))) {
      await this.beginChat();
    }
    await this.historyPrivateService.push(this.params.agentName,{
      'role': 'user',
      'content': message.trim(),
    });
    const response = await this.getChat();
    if (response.message.tool_calls) {
      this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} tool call begin`);
      for (const tool of response.message.tool_calls) {
        const targetFn = this.params.tools?.find((t) => t.function.name === tool.function.name);
        if (targetFn) {
          const output = await targetFn.implementation(tool.function.arguments);
          const content = output.toString();
          this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool call end output=${content}`);
          await this.historyPrivateService.push(this.params.agentName,response.message)
          await this.historyPrivateService.push(this.params.agentName,{
            role: 'tool',
            content,
          });
        }
        if (!targetFn) {
          this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} functionName=${tool.function.name} function not found`);
        }
        const finalResponse = await this.getChat();
        const result = finalResponse .message.content;
        this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} execute end result=${result}`);
        await this.connectionPrivateService.emit(result, this.params.agentName);
        return;
      }
    }
    if (!response.message.tool_calls) {
      this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} execute no tool calls detected`);
    }
    const result = response.message.content;
    this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} execute end result=${result}`);
    await this.connectionPrivateService.emit(result, this.params.agentName);
    return;
  });

  dispose = async () => {
    this.loggerService.debugCtx(`BaseAgent agentName=${this.params.agentName} dispose`);
    await this.historyPrivateService.dispose(this.params.agentName);
  };
  
})

export type TBaseAgent = InstanceType<ReturnType<typeof BaseAgent>>;

export default BaseAgent;

import { factory } from 'di-factory';
import { not, PubsubArrayAdapter, singlerun } from 'functools-kit';
import { omit } from 'lodash-es';
import { Ollama, Message, Tool } from 'ollama'
import { CC_OLLAMA_HOST, CC_OLLAMA_MESSAGES, CC_OLLAMA_MODEL } from 'src/config/params';
import TYPES from 'src/config/types';
import { inject } from 'src/core/di';
import LoggerService from 'src/services/base/LoggerService';
import { AgentName } from './BaseSwarm';

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
  createCompletion: (input: string) => Promise<string>;
}

export const BaseAgent = factory(class implements IAgent {

  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  messages = new PubsubArrayAdapter<Message>(CC_OLLAMA_MESSAGES);

  getMessageList = async () => {
    const result: Message[] = [];
    for await (const message of this.messages) {
      result.push(message)
    }
    this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} history`, {
      history: result,
    });
    return result;
  };

  constructor(readonly params: IAgentParams) { }

  getChat = async () => await ollama.chat({
    model: CC_OLLAMA_MODEL,
    messages: await this.getMessageList(),
    tools:  this.params.tools?.map((t) => omit(t, 'implementation')),
  });

  createCompletion = singlerun(async (message: string) => {
    this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} completion begin message=${message}`);
    if (await not(this.messages.length())) {
      await this.messages.push({
        'role': 'system',
        'content': this.params.prompt.trim(),
      });
    }
    await this.messages.push({
      'role': 'user',
      'content': message.trim(),
    });
    const response = await this.getChat();
    if (response.message.tool_calls) {
      this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} tool call begin`);
      for (const tool of response.message.tool_calls) {
        const targetFn = this.params.tools?.find((t) => t.function.name === tool.function.name);
        if (targetFn) {
          const output = await targetFn.implementation(tool.function.arguments);
          const content = output.toString();
          this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} functionName=${tool.function.name} tool call end output=${content}`);
          await this.messages.push(response.message)
          await this.messages.push({
            role: 'tool',
            content,
          });
        }
        if (!targetFn) {
          this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} functionName=${tool.function.name} function not found`);
        }
        const finalResponse = await this.getChat();
        const result = finalResponse .message.content;
        this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} completion end result=${result}`);
        return result;
      }
    }
    const result = response.message.content;
    this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} completion end result=${result}`);
    return result;
  });

  dispose = async () => {
    this.loggerService.debug(`BaseAgent clientId=${this.params.clientId} agentName=${this.params.agentName} dispose`);
    await this.messages.clear();
  };
  
})

export type TBaseAgent = InstanceType<ReturnType<typeof BaseAgent>>;

export default BaseAgent;

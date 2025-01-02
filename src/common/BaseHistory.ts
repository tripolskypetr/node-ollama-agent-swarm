import { factory } from "di-factory";
import { PubsubArrayAdapter, Subject } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import { AgentName } from "../utils/getAgentMap";
import RootSwarmService from "src/services/logic/RootSwarmService";
import { Message } from "ollama";
import { CC_OLLAMA_MESSAGES } from "src/config/params";

interface IHistoryParams {
  agentName: AgentName;
  clientId: string;
}

export interface IHistory {
  length(): Promise<number>;
  push(message: Message): Promise<void>;
  toArray(): Promise<Message[]>;
  dispose(): Promise<void>;
}

export const BaseHistory = factory(
  class {
    readonly rootSwarmService = inject<RootSwarmService>(
      TYPES.rootSwarmService
    );

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    messages = new PubsubArrayAdapter<Message>(CC_OLLAMA_MESSAGES);

    constructor(readonly params: IHistoryParams) {}

    length = async () => {
      this.loggerService.debugCtx(
        `BaseHistory agentName=${this.params.agentName} length`
      );
      return await this.messages.length();
    };

    push = async (message: Message) => {
      this.loggerService.debugCtx(
        `BaseHistory agentName=${this.params.agentName} push`,
        { message }
      );
      return await this.messages.push(message);
    };

    toArray = async () => {
      const result: Message[] = [];
      for await (const message of this.messages) {
        result.push(message);
      }
      this.loggerService.debugCtx(
        `BaseHistory agentName=${this.params.agentName} toArray`,
        {
          history: result,
        }
      );
      return result;
    };

    dispose = async () => {
      this.loggerService.debugCtx(
        `BaseHistory agentName=${this.params.agentName} dispose`,
        {
          agentName: this.params.agentName,
        }
      );
      await this.messages.clear();
    };
  }
);

export type TBaseHistory = InstanceType<ReturnType<typeof BaseHistory>>;

export default BaseHistory;

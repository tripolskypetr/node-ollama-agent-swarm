import { singleshot } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import { AgentName } from "../utils/getAgentMap";
import RootSwarmService from "src/services/logic/RootSwarmService";
import BaseList from "src/common/BaseList";
import { IModelMessage } from "src/model/ModelMessage.model";
import {
  CC_CLIENT_SESSION_EXPIRE_SECONDS,
  CC_OLLAMA_MESSAGES,
} from "src/config/params";

interface IHistoryParams {
  agentName: AgentName;
  clientId: string;
}

export interface IHistory {
  length(): Promise<number>;
  push(message: IModelMessage): Promise<void>;
  toArrayForRaw(): Promise<IModelMessage[]>;
  toArrayForAgent(): Promise<IModelMessage[]>;
  dispose(): Promise<void>;
}

const MESSAGE_INIT_FN = Symbol("init");

export class ClientHistory implements IHistory {
  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);

  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  getMessageList = singleshot(async () => {

    class MessageList extends BaseList(
      `node-ollama-agent-swarm__clientHistoryChat__${this.params.clientId}`,
      {
        TTL_EXPIRE_SECONDS: CC_CLIENT_SESSION_EXPIRE_SECONDS,
      }
    ) {

      _items: IModelMessage[] = [];

      public push = async (message: IModelMessage) => {
        console.log({ message })
        await super.push(message);
        this._items.push(message);
      };

      public pop = async () => {
        await super.pop();
        return this._items.pop();
      };

      public length = async () => {
        return this._items.length;
      };

      public clear = async () => {
        await super.clear();
        this._items.splice(0, this._items.length);
      };
     
      public [MESSAGE_INIT_FN] = async () => {
        for await (const item of this) {
          console.log(item)
          this._items.push(item);
        }
      }
    }
    const instance = new MessageList();
    await instance[MESSAGE_INIT_FN]();
    return instance;
  });

  constructor(readonly params: IHistoryParams) {}

  length = async () => {
    this.loggerService.debugCtx(
      `ClientHistory agentName=${this.params.agentName} length`
    );
    const messages = await this.getMessageList();
    return await messages.length();
  };

  push = async (message: IModelMessage) => {
    this.loggerService.debugCtx(
      `ClientHistory agentName=${this.params.agentName} push`,
      { message }
    );
    const messages = await this.getMessageList();
    return await messages.push(message);
  };

  pop = async () => {
    this.loggerService.debugCtx(
      `ClientHistory agentName=${this.params.agentName} pop`
    );
    const messages = await this.getMessageList();
    return await messages.pop();
  };

  clear = async () => {
    this.loggerService.debugCtx(
      `ClientHistory agentName=${this.params.agentName} clear`
    );
    const messages = await this.getMessageList();
    return await messages.clear();
  };

  toArrayForRaw = async () => {
    this.loggerService.debugCtx(
      `ClientHistory agentName=${this.params.agentName} toArrayForRaw`
    );
    const result: IModelMessage[] = [];
    const messages = await this.getMessageList();
    for await (const message of messages) {
      result.push(message);
    }
    return result;
  };

  toArrayForAgent = async () => {
    this.loggerService.debugCtx(
      `ClientHistory agentName=${this.params.agentName} toArrayForAgent`
    );
    const result: IModelMessage[] = [];
    const messages = await this.getMessageList();
    for await (const content of messages) {
      const message: IModelMessage = content;
      let isOk = true;
      if (message.role === "resque") {
        result.splice(0, result.length);
        continue;
      }
      if (message.role === "system") {
        isOk = isOk && message.agentName === this.params.agentName;
      }
      if (message.tool_calls) {
        isOk = isOk && message.agentName === this.params.agentName;
      }
      if (isOk) {
        result.push(message);
      }
    }
    const systemMessages = result.filter(({ role }) => role === "system");
    const commonMessages = result
      .filter(({ role }) => role !== "system")
      .slice(-CC_OLLAMA_MESSAGES);
    return [...systemMessages, ...commonMessages];
  };

  dispose = async () => {
    this.loggerService.debugCtx(
      `ClientHistory agentName=${this.params.agentName} dispose`,
      {
        agentName: this.params.agentName,
      }
    );
    return Promise.resolve();
  };
}

export default ClientHistory;

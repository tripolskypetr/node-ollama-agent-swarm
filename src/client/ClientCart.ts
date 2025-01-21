import { singleshot } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import { AgentName } from "../utils/getAgentMap";
import RootSwarmService from "src/services/logic/RootSwarmService";
import BaseList from "src/common/BaseList";
import { ICartItem } from "src/model/CartItem.model";
import { CC_CLIENT_SESSION_EXPIRE_SECONDS } from "src/config/params";

interface ICartParams {
  agentName: AgentName;
  clientId: string;
}

export interface ICart {
  length(): Promise<number>;
  push(message: ICartItem): Promise<void>;
  toArray(): Promise<ICartItem[]>;
  clear(): Promise<void>;
  dispose(): Promise<void>;
}

const CART_INIT_FN = Symbol("init");

export class ClientCart implements ICart {
  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);

  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  getCartList = singleshot(async () => {

    class CartList extends BaseList(
      `node-ollama-agent-swarm__clientCartList__${this.params.clientId}`,
      {
        TTL_EXPIRE_SECONDS: CC_CLIENT_SESSION_EXPIRE_SECONDS,
      }
    ) {
      _items: ICartItem[] = [];

      public push = async (message: ICartItem) => {
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

      public [CART_INIT_FN] = async () => {
        for await (const item of this) {
          this._items.push(item);
        }
      };
    }
    const instance = new CartList();
    await instance[CART_INIT_FN]();
    return instance;
  });

  constructor(readonly params: ICartParams) {}

  length = async () => {
    this.loggerService.debugCtx(
      `ClientCart agentName=${this.params.agentName} length`
    );
    const entities = await this.getCartList();
    return await entities.length();
  };

  push = async (message: ICartItem) => {
    this.loggerService.debugCtx(
      `ClientCart agentName=${this.params.agentName} push`,
      { message }
    );
    const entities = await this.getCartList();
    return await entities.push(message);
  };

  pop = async () => {
    this.loggerService.debugCtx(
      `ClientCart agentName=${this.params.agentName} pop`
    );
    const entities = await this.getCartList();
    return await entities.pop();
  };

  toArray = async () => {
    this.loggerService.debugCtx(
      `ClientCart agentName=${this.params.agentName} toArrayForRaw`
    );
    const result: ICartItem[] = [];
    const entities = await this.getCartList();
    for await (const entity of entities) {
      result.push(entity);
    }
    return result;
  };

  dispose = async () => {
    this.loggerService.debugCtx(
      `ClientCart agentName=${this.params.agentName} dispose`,
      {
        agentName: this.params.agentName,
      }
    );
    return Promise.resolve();
  };

  clear = async () => {
    this.loggerService.debugCtx(
      `ClientCart agentName=${this.params.agentName} clear`,
      {
        agentName: this.params.agentName,
      }
    );
    const entities = await this.getCartList();
    return await entities.clear();
  };
}

export default ClientCart;

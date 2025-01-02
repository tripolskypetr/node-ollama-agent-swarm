import { factory } from "di-factory";
import { Subject } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import getAgentMap from "../utils/getAgentMap";
import RootSwarmService from "src/services/logic/RootSwarmService";

interface IConnectionParams {
  connectionName: string;
  clientId: string;
}

export interface IMessage {
  clientId: string;
  stamp: string;
  data: string;
}

export type SendMessageFn = (outgoing: IMessage) => Promise<void>;

export interface IConnection {
  dispose(): Promise<void>;
  connect(connector: SendMessageFn): SendMessageFn;
  emit(outgoing: string): Promise<void>;
}

export const BaseConnection = factory(
  class {
    readonly rootSwarmService = inject<RootSwarmService>(
      TYPES.rootSwarmService
    );

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    readonly outgoingSubject = new Subject<IMessage>();

    constructor(readonly params: IConnectionParams) {}

    execute = async (message: string) => {
      this.loggerService.debugCtx("BaseConnection execute", {
        message,
        connectionName: this.params.connectionName,
      });
      const agent = await this.rootSwarmService.getAgent();
      return await agent.createCompletion(message);
    };

    connect = (
      connector: (outgoing: IMessage) => void | Promise<void>
    ) => {
      this.loggerService.debugCtx("BaseConnection connect", {
        connectionName: this.params.connectionName,
      });
      this.outgoingSubject.subscribe(async (outgoing) => {
        await connector(outgoing);
      });
      return async (incoming: IMessage) => {
        this.loggerService.debugCtx("BaseConnection connect call", {
          connectionName: this.params.connectionName,
        });
        const output = await this.execute(incoming.data);
        await connector({
          clientId: this.params.clientId,
          stamp: Date.now().toString(),
          data: output,
        });
      };
    };

    emit = async (outgoing: string) => {
      this.loggerService.debugCtx("BaseConnection emit", {
        connectionName: this.params.connectionName,
      });
      await this.outgoingSubject.next({
        clientId: this.params.clientId,
        stamp: Date.now().toString(),
        data: outgoing,
      });
    };

    dispose = async () => {
      this.loggerService.debugCtx("BaseConnection dispose", {
        connectionName: this.params.connectionName,
      });
      for (const agent of Object.values(getAgentMap())) {
        await agent.dispose();
      }
      await this.rootSwarmService.dispose();
      this.outgoingSubject.unsubscribeAll();
    };
  }
);

export type TBaseConnection = InstanceType<ReturnType<typeof BaseConnection>>;

export default BaseConnection;

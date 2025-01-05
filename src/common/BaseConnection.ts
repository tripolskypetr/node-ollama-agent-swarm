import { factory } from "di-factory";
import { Subject } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import getAgentMap, { AgentName } from "../utils/getAgentMap";
import RootSwarmService from "src/services/logic/RootSwarmService";
import IMessage from "src/model/Message.model";

interface IConnectionParams {
  connectionName: string;
  clientId: string;
}

export type SendMessageFn = (outgoing: IMessage) => Promise<void>;

export interface IConnection {
  dispose(): Promise<void>;
  connect(connector: SendMessageFn): SendMessageFn;
  commitToolOutput(content: string, agentName: AgentName): Promise<void>;
  commitSystemMessage(message: string, agentName: AgentName): Promise<void>;
  emit(outgoing: string, agentName: AgentName): Promise<void>;
}

export const BaseConnection = factory(
  class {
    readonly rootSwarmService = inject<RootSwarmService>(
      TYPES.rootSwarmService
    );

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    readonly outgoingSubject = new Subject<IMessage>();

    constructor(readonly params: IConnectionParams) {}

    execute = async (message: string[]) => {
      this.loggerService.debugCtx("BaseConnection execute", {
        message,
        connectionName: this.params.connectionName,
      });
      const agent = await this.rootSwarmService.getAgent();
      return await agent.execute(message);
    };

    commitToolOutput = async (content: string, agentName: AgentName) => {
      this.loggerService.debugCtx("BaseConnection commitToolOutput", {
        content,
        connectionName: this.params.connectionName,
        agentName,
      });
      if (await this.rootSwarmService.getAgentName() !== agentName) {
        return;
      }
      const agent = await this.rootSwarmService.getAgent();
      return await agent.commitToolOutput(content);
    };

    commitSystemMessage = async (message: string, agentName: AgentName) => {
      this.loggerService.debugCtx("BaseConnection commitSystemMessage", {
        message,
        connectionName: this.params.connectionName,
        agentName,
      });
      if (await this.rootSwarmService.getAgentName() !== agentName) {
        return;
      }
      const agent = await this.rootSwarmService.getAgent();
      return await agent.commitSystemMessage(message);
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
        await this.execute([incoming.data]);
      };
    };

    emit = async (outgoing: string, agentName: AgentName) => {
      this.loggerService.debugCtx("BaseConnection emit", {
        connectionName: this.params.connectionName,
        agentName,
      });
      if (await this.rootSwarmService.getAgentName() !== agentName) {
        return;
      }
      await this.outgoingSubject.next({
        clientId: this.params.clientId,
        stamp: Date.now().toString(),
        agentName,
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

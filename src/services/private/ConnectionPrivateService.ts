import { CANCELED_PROMISE_SYMBOL, memoize } from "functools-kit";
import { TContextService } from "../base/ContextService";
import { inject } from "src/core/di";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import BaseConnection, { IConnection } from "src/common/BaseConnection";
import { AgentName } from "src/utils/getAgentMap";
import { IIncomingMessage, IOutgoingMessage } from "src/model/Message.model";

export class ConnectionPrivateService implements IConnection {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly contextService = inject<TContextService>(TYPES.contextService);

  private getClientConnection = memoize(
    ([clientId]) => clientId,
    (clientId: string) =>
      new (class extends BaseConnection({
        clientId,
        connectionName: "root-connection",
      }) {})()
  );

  public connect = (
    connector: (outgoing: IOutgoingMessage) => void | Promise<void>
  ) => {
    this.loggerService.logCtx("connectionPrivateService connect");
    return this.getClientConnection(
      this.contextService.context.clientId
    ).connect(connector);
  };

  public execute = async (
    messages: string[]
  ) => {
    this.loggerService.logCtx("connectionPrivateService execute", {
      messages,
    });
    const connection = await this.getClientConnection(this.contextService.context.clientId);
    const output = connection.waitForOutput();
    await connection.execute(messages);
    return await output;
  };

  public commitToolOutput = async (content: string, agentName: AgentName) => {
    this.loggerService.logCtx("connectionPrivateService commitToolOutput", {
      content,
      agentName,
    });
    return await this.getClientConnection(
      this.contextService.context.clientId
    ).commitToolOutput(content, agentName);
  };

  public commitSystemMessage = async (message: string, agentName: AgentName) => {
    this.loggerService.logCtx("connectionPrivateService commitSystemMessage", {
      message,
      agentName,
    });
    return await this.getClientConnection(
      this.contextService.context.clientId
    ).commitSystemMessage(message, agentName);
  };

  public dispose = async () => {
    this.loggerService.logCtx("connectionPrivateService dispose");
    await this.getClientConnection(
      this.contextService.context.clientId
    ).dispose();
    this.getClientConnection.clear(this.contextService.context.clientId);
  };

  public emit = async (outgoing: string, agentName: AgentName) => {
    this.loggerService.logCtx("connectionPrivateService emit", {
      outgoing,
      agentName,
    });
    return await this.getClientConnection(
      this.contextService.context.clientId
    ).emit(outgoing, agentName);
  };
}

export default ConnectionPrivateService;

import { CANCELED_PROMISE_SYMBOL, memoize } from "functools-kit";
import { TContextService } from "../base/ContextService";
import { inject } from "src/core/di";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import BaseHistory, { IHistory } from "src/common/BaseHistory";
import { AgentName } from "src/utils/getAgentMap";
import { Message } from "ollama";

type THistory = {
    [key in keyof IHistory]: any;
}

export class HistoryPrivateService implements THistory {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly contextService = inject<TContextService>(TYPES.contextService);

  private getClientHistory = memoize(
    ([clientId]) => `${clientId}`,
    (clientId: string, agentName: AgentName) =>
      new (class extends BaseHistory({
        clientId,
        agentName,
      }) {})()
  );

  public length = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService length");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName,
    ).length();
  };

  public toArray = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService toArray");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName,
    ).toArray();
  };

  public push = async (agentName: AgentName, message: Message) => {
    this.loggerService.logCtx("historyPrivateService push", { message });
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName,
    ).push(message);
  };

  public dispose = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService dispose");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName,
    ).dispose();
  };
}

export default HistoryPrivateService;

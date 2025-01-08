import { memoize } from "functools-kit";
import { TContextService } from "../base/ContextService";
import { inject } from "src/core/di";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import ClientHistory, { IHistory } from "src/client/ClientHistory";
import { AgentName, getAgent } from "src/utils/getAgentMap";
import { IModelMessage } from "src/model/ModelMessage.model";

type THistory = {
  [key in keyof IHistory]: any;
};

export class HistoryPrivateService implements THistory {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly contextService = inject<TContextService>(TYPES.contextService);

  private getClientHistory = memoize(
    ([clientId]) => `${clientId}`,
    (clientId: string, agentName: AgentName) =>
      new ClientHistory({
        clientId,
        agentName,
      })
  );

  public length = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService length");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName
    ).length();
  };

  public toArrayForAgent = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService toArrayForAgent");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName
    ).toArrayForAgent();
  };

  public toArrayForRaw = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService toArrayForRaw");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName
    ).toArrayForRaw();
  };

  public push = async (agentName: AgentName, message: IModelMessage) => {
    this.loggerService.logCtx("historyPrivateService push", { message });
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName
    ).push(message);
  };

  public pop = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService pop");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName
    ).pop();
  };

  public clear = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService clear");
    return await this.getClientHistory(
      this.contextService.context.clientId,
      agentName
    ).clear();
  };

  public dispose = async (agentName: AgentName) => {
    this.loggerService.logCtx("historyPrivateService dispose");
    await this.getClientHistory(
      this.contextService.context.clientId,
      agentName
    ).dispose();
    this.getClientHistory.clear(this.contextService.context.clientId);
  };
}

export default HistoryPrivateService;

import TYPES from "../config/types";
import "../config/provide";
import { inject, init } from "../core/di";
import type LoggerService from "./base/LoggerService";
import ErrorService from "./base/ErrorService";
import { TContextService } from "./base/ContextService";
import RefundsAgentService from "./logic/agent/RefundsAgentService";
import SalesAgentService from "./logic/agent/SalesAgentService";
import TriageAgentService from "./logic/agent/TriageAgentService";
import RootSwarmService from "./logic/RootSwarmService";
import NavigateToRefundAgentTool from "./tools/NavigateToRefundAgentTool";
import NavigateToSalesAgentTool from "./tools/NavigateToSalesAgentTool";
import ConnectionPublicService from "./public/ConnectionPublicService";
import ConnectionPrivateService from "./private/ConnectionPrivateService";
import HistoryPrivateService from "./private/HistoryPrivateService";
import EmbeddingService from "./api/EmbeddingService";
import CompletionService from "./api/CompletionService";

const apiServices = {
    embeddingService: inject<EmbeddingService>(TYPES.embeddingService),
    completionService: inject<CompletionService>(TYPES.completionService),
};

const baseServices = {
    loggerService: inject<LoggerService>(TYPES.loggerService),
    errorService: inject<ErrorService>(TYPES.errorService),
    contextService: inject<TContextService>(TYPES.contextService),
};

const publicServices = {
    connectionPublicService: inject<ConnectionPublicService>(TYPES.connectionPublicService),
};

const privateServices = {
    connectionPrivateService: inject<ConnectionPrivateService>(TYPES.connectionPrivateService),
    historyPrivateService: inject<HistoryPrivateService>(TYPES.historyPrivateService),
};

const logicServices = {
    refundsAgentService: inject<RefundsAgentService>(TYPES.refundsAgentService),
    salesAgentService: inject<SalesAgentService>(TYPES.salesAgentService),
    triageAgentService: inject<TriageAgentService>(TYPES.triageAgentService),
    rootSwarmService: inject<RootSwarmService>(TYPES.rootSwarmService),
};

const toolsServices = {
    navigateToRefundAgentTool: inject<NavigateToRefundAgentTool>(TYPES.navigateToRefundAgentTool),
    navigateToSalesAgentTool: inject<NavigateToSalesAgentTool>(TYPES.navigateToSalesAgentTool),
};

init();

export const ioc = {
    ...apiServices,
    ...baseServices,
    ...publicServices,
    ...privateServices,
    ...logicServices,
    ...toolsServices,
};

Object.assign(globalThis, { ioc });

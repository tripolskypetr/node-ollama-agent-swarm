const baseServices = {
    loggerService: Symbol('loggerService'),
    errorService: Symbol('errorService'),
    contextService: Symbol('contextService'),
};

const publicServices = {
    connectionPublicService: Symbol('connectionPublicService'),
};

const privateServices = {
    connectionPrivateService: Symbol('connectionPrivateService'),
    historyPrivateService: Symbol('historyPrivateService'),
};

const logicServices = {
    refundsAgentService: Symbol('refundsAgentService'),
    salesAgentService: Symbol('salesAgentService'),
    triageAgentService: Symbol('triageAgentService'),
    rootSwarmService: Symbol('rootSwarmService'),
};

const toolsServices = {
    navigateToRefundAgentTool: Symbol('navigateToRefundAgentTool'),
    navigateToSalesAgentTool: Symbol('navigateToSalesAgentTool'),
};

export const TYPES = {
    ...baseServices,
    ...publicServices,
    ...privateServices,
    ...logicServices,
    ...toolsServices,
};

export default TYPES;

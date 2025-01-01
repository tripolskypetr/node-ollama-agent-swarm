const baseServices = {
    loggerService: Symbol('loggerService'),
    errorService: Symbol('errorService'),
    contextService: Symbol('contextService'),
};

const globalServices = {
    connectionService: Symbol('connectionService'),
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
    ...globalServices,
    ...logicServices,
    ...toolsServices,
};

export default TYPES;

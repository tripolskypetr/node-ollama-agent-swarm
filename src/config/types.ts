const apiServices = {
    completionService: Symbol('completionService'),
    embeddingService: Symbol('embeddingService'),
};

const baseServices = {
    loggerService: Symbol('loggerService'),
    errorService: Symbol('errorService'),
    contextService: Symbol('contextService'),
    mongooseService: Symbol('mongooseService'),
    redisService: Symbol('redisService'),
};

const publicServices = {
    connectionPublicService: Symbol('connectionPublicService'),
};

const privateServices = {
    connectionPrivateService: Symbol('connectionPrivateService'),
    historyPrivateService: Symbol('historyPrivateService'),
};

const dbServices = {
    clientSwarmDbService: Symbol('clientSwarmDbService'),
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
    ...apiServices,
    ...baseServices,
    ...publicServices,
    ...privateServices,
    ...dbServices,
    ...logicServices,
    ...toolsServices,
};

export default TYPES;

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
    migrationPublicService: Symbol('migrationPublicService'),
};

const privateServices = {
    connectionPrivateService: Symbol('connectionPrivateService'),
    migrationPrivateService: Symbol('migrationPrivateService'),
};

const dbServices = {
    clientSwarmDbService: Symbol('clientSwarmDbService'),
    clientHistoryDbService: Symbol('clientHistoryDbService'),
    productDbService: Symbol('productDbService'),
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

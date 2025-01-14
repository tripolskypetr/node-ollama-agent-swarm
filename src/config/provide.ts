import { provide } from '../core/di';

import TYPES from './types';

import LoggerService from '../services/base/LoggerService';
import ErrorService from '../services/base/ErrorService';
import ContextService from 'src/services/base/ContextService';
import ConnectionPublicService from 'src/services/public/ConnectionPublicService';
import RefundsAgentService from 'src/services/logic/agent/RefundsAgentService';
import SalesAgentService from 'src/services/logic/agent/SalesAgentService';
import TriageAgentService from 'src/services/logic/agent/TriageAgentService';
import RootSwarmService from 'src/services/logic/RootSwarmService';
import NavigateToRefundAgentTool from 'src/services/tools/NavigateToRefundAgentTool';
import NavigateToSalesAgentTool from 'src/services/tools/NavigateToSalesAgentTool';
import ConnectionPrivateService from 'src/services/private/ConnectionPrivateService';
import CompletionService from "src/services/api/CompletionService";
import EmbeddingService from "src/services/api/EmbeddingService";
import MongooseService from 'src/services/base/MongooseService';
import RedisService from 'src/services/base/RedisService';
import ClientSwarmDbService from 'src/services/db/ClientSwarmDbService';
import ProductDbService from 'src/services/db/ProductDbService';
import MigrationPublicService from 'src/services/public/MigrationPublicService';
import MigrationPrivateService from 'src/services/private/MigrationPrivateService';
import ClientHistoryDbService from 'src/services/db/ClientHistoryDbService';

{
    provide(TYPES.completionService, () => new CompletionService());
    provide(TYPES.embeddingService, () => new EmbeddingService());
}

{
    provide(TYPES.loggerService, () => new LoggerService());
    provide(TYPES.errorService, () => new ErrorService());
    provide(TYPES.contextService, () => new ContextService());
    provide(TYPES.mongooseService, () => new MongooseService());
    provide(TYPES.redisService, () => new RedisService());
}

{
    provide(TYPES.connectionPublicService, () => new ConnectionPublicService());
    provide(TYPES.migrationPublicService, () => new MigrationPublicService());
}

{
    provide(TYPES.connectionPrivateService, () => new ConnectionPrivateService());
    provide(TYPES.clientHistoryDbService, () => new ClientHistoryDbService());
    provide(TYPES.migrationPrivateService, () => new MigrationPrivateService());
}

{
    provide(TYPES.clientSwarmDbService, () => new ClientSwarmDbService());
    provide(TYPES.productDbService, () => new ProductDbService());
}

{
    provide(TYPES.refundsAgentService, () => new RefundsAgentService());
    provide(TYPES.salesAgentService, () => new SalesAgentService());
    provide(TYPES.triageAgentService, () => new TriageAgentService());
    provide(TYPES.rootSwarmService, () => new RootSwarmService());
}

{
    provide(TYPES.navigateToRefundAgentTool, () => new NavigateToRefundAgentTool());
    provide(TYPES.navigateToSalesAgentTool, () => new NavigateToSalesAgentTool());
}

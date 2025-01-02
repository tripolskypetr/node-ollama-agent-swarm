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
import HistoryPrivateService from 'src/services/private/HistoryPrivateService';

{
    provide(TYPES.loggerService, () => new LoggerService());
    provide(TYPES.errorService, () => new ErrorService());
    provide(TYPES.contextService, () => new ContextService());
}

{
    provide(TYPES.connectionPublicService, () => new ConnectionPublicService());
}

{
    provide(TYPES.connectionPrivateService, () => new ConnectionPrivateService());
    provide(TYPES.historyPrivateService, () => new HistoryPrivateService());
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

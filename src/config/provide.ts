import { provide } from '../core/di';

import TYPES from './types';

import LoggerService from '../services/base/LoggerService';
import ErrorService from '../services/base/ErrorService';
import ContextService from 'src/services/base/ContextService';
import ConnectionService from 'src/services/global/ConnectionService';
import RefundsAgentService from 'src/services/logic/agent/RefundsAgentService';
import SalesAgentService from 'src/services/logic/agent/SalesAgentService';
import TriageAgentService from 'src/services/logic/agent/TriageAgentService';
import RootSwarmService from 'src/services/logic/RootSwarmService';
import NavigateToRefundAgentTool from 'src/services/tools/NavigateToRefundAgentTool';
import NavigateToSalesAgentTool from 'src/services/tools/NavigateToSalesAgentTool';

{
    provide(TYPES.loggerService, () => new LoggerService());
    provide(TYPES.errorService, () => new ErrorService());
    provide(TYPES.contextService, () => new ContextService());
}

{
    provide(TYPES.connectionService, () => new ConnectionService());
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

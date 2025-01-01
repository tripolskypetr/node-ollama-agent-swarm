import { factory } from "di-factory";
import { PubsubMapAdapter, singleshot } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import RefundsAgentService from "src/services/logic/agent/RefundsAgentService";
import SalesAgentService from "src/services/logic/agent/SalesAgentService";
import TriageAgentService from "src/services/logic/agent/TriageAgentService";

const swarmMap = new PubsubMapAdapter<AgentName>();

const getAgentMap = singleshot(() => ({
    "refunds-agent": inject<RefundsAgentService>(TYPES.refundsAgentService),
    "sales-agent": inject<SalesAgentService>(TYPES.salesAgentService),
    "triage-agent": inject<TriageAgentService>(TYPES.triageAgentService),
}));

export type AgentName = keyof ReturnType<typeof getAgentMap>;

const DEFAULT_AGENT = "triage-agent";

interface ISwarmParams {
  swarmName: string;
  clientId: string;
}

export interface ISwarm {
  getAgent(): Promise<ReturnType<typeof getAgentMap>[AgentName]>;
  setAgent(agentName: AgentName): Promise<void>;
}

export const BaseSwarm = factory(
  class {
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    constructor(readonly params: ISwarmParams) {}

    getAgent = async () => {
      this.loggerService.debug(
        `BaseSwarm clientId=${this.params.clientId} swarmName=${this.params.swarmName} getAgent`
      );
      let agent = await swarmMap.get(this.params.clientId);
      const agentMap = getAgentMap();
      if (!agent) {
        agent = DEFAULT_AGENT;
      }
      return agentMap[agent];
    };

    setAgent = async (agentName: AgentName) => {
      this.loggerService.debug(
        `BaseSwarm clientId=${this.params.clientId} swarmName=${this.params.swarmName} setAgent agentName=${agentName}`
      );
      await swarmMap.set(this.params.clientId, agentName);
    };

    dispose = async () => {
      this.loggerService.debug(
        `BaseAgent clientId=${this.params.clientId} swarmName=${this.params.swarmName} dispose`
      );
      await swarmMap.delete(this.params.clientId);
    };
  }
);

export type TBaseSwarm = InstanceType<ReturnType<typeof BaseSwarm>>;

export default BaseSwarm;

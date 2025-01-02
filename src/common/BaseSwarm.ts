import { factory } from "di-factory";
import { PubsubMapAdapter, singleshot } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import getAgentMap, { Agent, AgentName } from '../utils/getAgentMap';

const swarmMap = new PubsubMapAdapter<AgentName>();

const DEFAULT_AGENT = "triage-agent";

interface ISwarmParams {
  swarmName: string;
  clientId: string;
}

export interface ISwarm {
  getAgentName(): Promise<AgentName>;
  getAgent(): Promise<Agent>;
  setAgent(agentName: AgentName): Promise<void>;
}

export const BaseSwarm = factory(
  class {
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    constructor(readonly params: ISwarmParams) {}

    getAgentName = async () => {
      this.loggerService.debug(
        `BaseSwarm clientId=${this.params.clientId} swarmName=${this.params.swarmName} getAgentName`
      );
      let agent = await swarmMap.get(this.params.clientId);
      if (!agent) {
        agent = DEFAULT_AGENT;
      }
      return agent;
    };

    getAgent = async () => {
      this.loggerService.debug(
        `BaseSwarm clientId=${this.params.clientId} swarmName=${this.params.swarmName} getAgent`
      );
      const agent = await this.getAgentName();
      const agentMap = getAgentMap();
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

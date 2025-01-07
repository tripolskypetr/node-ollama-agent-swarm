import { PubsubMapAdapter, singleshot } from "functools-kit";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import LoggerService from "src/services/base/LoggerService";
import getAgentMap, { Agent, AgentName } from "../utils/getAgentMap";
import ClientSwarmDbService from "src/services/db/ClientSwarmDbService";

const DEFAULT_AGENT = "triage-agent";

interface ISwarmParams {
  swarmName: string;
  clientId: string;
}

export interface ISwarm {
  getAgentName(): Promise<AgentName>;
  getAgent(): Promise<Agent>;
  setAgent(agentName: AgentName): Promise<void>;
  dispose(): Promise<void>;
}

export class ClientSwarm {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly clientSwarmDbService = inject<ClientSwarmDbService>(TYPES.clientSwarmDbService);

  constructor(readonly params: ISwarmParams) {}

  _beginChat = async () => {
    this.loggerService.debugCtx(
      `ClientSwarm swarmName=${this.params.swarmName} getAgentName`
    );
    const agent = await this.getAgent();
    await agent.beginChat();
  };

  getAgentName = async () => {
    this.loggerService.debugCtx(
      `ClientSwarm swarmName=${this.params.swarmName} getAgentName`
    );
    let agent = await this.clientSwarmDbService.get(this.params.clientId);
    if (!agent) {
      agent = DEFAULT_AGENT;
    }
    return agent;
  };

  getAgent = async () => {
    this.loggerService.debugCtx(
      `ClientSwarm swarmName=${this.params.swarmName} getAgent`
    );
    const agent = await this.getAgentName();
    const agentMap = getAgentMap();
    return agentMap[agent];
  };

  setAgent = async (agentName: AgentName) => {
    this.loggerService.debugCtx(
      `ClientSwarm swarmName=${this.params.swarmName} setAgent agentName=${agentName}`
    );
    await this.clientSwarmDbService.set(this.params.clientId, agentName);
    await this._beginChat();
  };

  dispose = async () => {
    this.loggerService.debugCtx(
      `ClientAgent swarmName=${this.params.swarmName} dispose`
    );
    await this.clientSwarmDbService.delete(this.params.clientId);
  };
}

export default ClientSwarm;

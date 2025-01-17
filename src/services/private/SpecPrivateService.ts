import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import RootSwarmService from "../logic/RootSwarmService";
import ConnectionPrivateService from "./ConnectionPrivateService";
import { AgentName } from "src/utils/getAgentMap";

export class SpecPrivateService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
    private readonly connectionPrivateService = inject<ConnectionPrivateService>(TYPES.connectionPrivateService);

    public getAgentName = async () => {
        this.loggerService.logCtx('specPrivateService getAgentName');
        return await this.rootSwarmService.getAgentName();
    };

    public getAgent = async () => {
        this.loggerService.logCtx('specPrivateService getAgent');
        return await this.rootSwarmService.getAgent();
    };

    public setAgent = async (agentName: AgentName) => {
        this.loggerService.logCtx('specPrivateService setAgent', { agentName });
        return await this.rootSwarmService.setAgent(agentName);
    };

    public complete = async (msg: string) => {
        this.loggerService.logCtx('specPrivateService complete', { msg });
        return await this.connectionPrivateService.complete([msg]);
    };

}

export default SpecPrivateService;

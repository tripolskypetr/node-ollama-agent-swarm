import TYPES from "src/config/types";
import { inject } from "src/core/di";
import { TContextService } from "../base/ContextService";
import { memoize } from "functools-kit";
import BaseSwarm, { ISwarm } from "src/common/BaseSwarm";
import LoggerService from "../base/LoggerService";

export class RootSwarmService implements ISwarm {
    readonly contextService = inject<TContextService>(TYPES.contextService);
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private getClientSwarm = memoize(
        ([clientId]) => clientId,
        (clientId: string) =>
          new class extends BaseSwarm({
            clientId,
            swarmName: "root-swarm",
          }) { }
    );

    public getAgent = async () => {
        this.loggerService.logCtx("rootSwarmService getAgent");
        const swarm = this.getClientSwarm(this.contextService.context.clientId);
        return await swarm.getAgent();
    };

    public setAgent = async (agentName) => {
        this.loggerService.logCtx("rootSwarmService setAgent", { agentName });
        const swarm = this.getClientSwarm(this.contextService.context.clientId);
        return await swarm.setAgent(agentName);
    };

    public dispose = async () => {
        this.loggerService.logCtx("rootSwarmService dispose");
        const swarm = this.getClientSwarm(this.contextService.context.clientId);
        await swarm.dispose();
        this.getClientSwarm.clear(this.contextService.context.clientId);
    };

}

export default RootSwarmService;

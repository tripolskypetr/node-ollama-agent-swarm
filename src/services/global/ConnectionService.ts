import { CANCELED_PROMISE_SYMBOL, execpool, memoize } from "functools-kit";
import ContextService from "../base/ContextService";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import RefundsAgentService from "../logic/agent/RefundsAgentService";
import TriageAgentService from "../logic/agent/TriageAgentService";
import SalesAgentService from "../logic/agent/SalesAgentService";

export interface IMessage {
  clientId: string;
  stamp: string;
  data: string;
}

export type SendMessageFn = (
  outgoing: IMessage
) => Promise<void | typeof CANCELED_PROMISE_SYMBOL>;

export class ConnectionService {

  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);

  readonly refundsAgentService = inject<RefundsAgentService>(TYPES.refundsAgentService);
  readonly triageAgentService = inject<TriageAgentService>(TYPES.triageAgentService);
  readonly salesAgentService = inject<SalesAgentService>(TYPES.salesAgentService);

  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private execute = execpool(async (clientId: string, message: string) => {
    this.loggerService.log("ConnectionService execute", { clientId, message });
    return await ContextService.runInContext(async () => {
      const agent = await this.rootSwarmService.getAgent();
      return await agent.createCompletion(message);
    }, {
      clientId,
    });
  }, {
    maxExec: 10,
  });

  public connect = (
    clientId: string,
    connector: (outgoing: IMessage) => void | Promise<void>
  ) => {
    this.loggerService.log("ConnectionService connect", { clientId });
    return async (incoming: IMessage) => {
      this.loggerService.log("ConnectionService connect call", { clientId });
      const output = await this.execute(clientId, incoming.data);
      await connector({
        clientId,
        stamp: Date.now().toString(),
        data: output,
      });
    };
  };

  public dispose = async (clientId: string) => {
    this.loggerService.log("ConnectionService dispose", { clientId});
    return await ContextService.runInContext(async () => {
      await this.rootSwarmService.dispose();
      await this.refundsAgentService.dispose();
      await this.salesAgentService.dispose();
      await this.triageAgentService.dispose();
    }, {
      clientId,
    });
  }
}

export default ConnectionService;

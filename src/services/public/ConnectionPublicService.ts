import { CANCELED_PROMISE_SYMBOL, memoize } from "functools-kit";
import ContextService from "../base/ContextService";
import { inject } from "src/core/di";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import { IConnection } from "src/common/BaseConnection";
import ConnectionPrivateService from "../private/ConnectionPrivateService";
import { AgentName } from "src/utils/getAgentMap";

export interface IMessage {
  clientId: string;
  stamp: string;
  data: string;
}

type TConnection = {
  [key in keyof IConnection]: any;
};

export class ConnectionPublicService implements TConnection {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly connectionPrivateService = inject<ConnectionPrivateService>(TYPES.connectionPrivateService);

  public connect = (
    clientId: string,
    connector: (outgoing: IMessage) => void | Promise<void>
  ) => {
    this.loggerService.log("connectionPublicService connect", { clientId });
    return ContextService.runInContext(
      () => {
        const receive = this.connectionPrivateService.connect(async (outgoing) => {
          return await ContextService.runInContext(
            async () => {
              return await connector(outgoing);
            },
            {
              clientId,
            }
          );
        });
        return async (incoming: IMessage) => {
          return await ContextService.runInContext(async () => {
            return await receive(incoming);
          }, {
            clientId,
          })
        }
      },
      {
        clientId,
      }
    );
  };

  public dispose = async (clientId: string) => {
    this.loggerService.log("connectionPublicService dispose", { clientId });
    return await ContextService.runInContext(
      async () => {
        return await this.connectionPrivateService.dispose();
      },
      {
        clientId,
      }
    );
  };

  public emit = async (clientId: string, outgoing: string, agentName: AgentName) => {
    this.loggerService.log("connectionPublicService emit", { clientId, outgoing, agentName });
    return await ContextService.runInContext(
      async () => {
        return await this.connectionPrivateService.emit(outgoing, agentName);
      },
      {
        clientId,
      }
    );
  };
}

export default ConnectionPublicService;

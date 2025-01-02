import { createLogger } from "pinolog";
import { inject } from "src/core/di";
import { TContextService } from "./ContextService";
import TYPES from "src/config/types";

export class LoggerService {
  protected readonly contextService = inject<TContextService>(
    TYPES.contextService
  );
  private _logger = createLogger("node-ollanma-agent.log");

  private _debug = false;

  public log = (...args: any[]) => {
    this._debug && console.log(JSON.stringify(args, null, 2), "\n\n");
    this._logger.log(...args);
  };

  public debug = (...args: any[]) => {
    if (this._debug) {
      console.log(JSON.stringify(args, null, 2), "\n\n");
      this._logger.log(...args);
    }
  };

  public debugCtx = (...args: any[]) => {
    if (this._debug) {
      console.log(
        JSON.stringify([...args, this.contextService.context], null, 2),
        "\n\n"
      );
      this._logger.log(...args, this.contextService.context);
    }
  };

  public setPrefix = (prefix: string) => {
    this._logger = createLogger(`node-ollanma-agent_${prefix}.log`);
  };

  public setDebug = (debug: boolean) => {
    this._debug = debug;
  };

  public logCtx = (...args: any[]) => {
    this._debug &&
      console.log(
        JSON.stringify([...args, this.contextService.context], null, 2),
        "\n\n"
      );
    this._logger.log(...args, this.contextService.context);
  };
}

export default LoggerService;

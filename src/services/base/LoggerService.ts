import { createLogger } from 'pinolog';
import { inject } from 'src/core/di';
import { TContextService } from './ContextService';
import TYPES from 'src/config/types';

export class LoggerService {

    protected readonly contextService = inject<TContextService>(TYPES.contextService);
    private _logger = createLogger("node-ollanma-agent.log");

    private _debug = false;

    public log = (...args: any[]) => {
        this._logger.log(...args);
    }

    public debug = (...args: any[]) => {
        this._debug && this._logger.log(...args);
    };

    public setPrefix = (prefix: string) => {
        this._logger = createLogger(`node-ollanma-agent_${prefix}.log`);
    }

    public setDebug = (debug: boolean) => {
        this._debug = debug;
    };

    public logCtx = (...args: any[]) => {
        this._logger.log(...args, this.contextService.context);
    };

}

export default LoggerService
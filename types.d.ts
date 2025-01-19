import * as functools_kit from 'functools-kit';
import { TSubject } from 'functools-kit';
import * as src_services_base_ContextService from 'src/services/base/ContextService';
import { IAgent } from 'src/client/ClientAgent';
import LoggerService$1 from 'src/services/base/LoggerService';
import NavigationRegistryService$1 from 'src/services/function/NavigationRegistryService';
import PharmaProductRegistryService$1 from 'src/services/function/PharmaProductRegistryService';
import { ISwarm } from 'src/client/ClientSwarm';
import { IConnection } from 'src/client/ClientConnection';
import * as src_model_WsMessage_model from 'src/model/WsMessage.model';
import { IOutgoingMessage, IIncomingMessage } from 'src/model/WsMessage.model';
import { AgentName as AgentName$1 } from 'src/utils/getAgentMap';
import { Message, Tool } from 'ollama';
import Redis from 'ioredis';
import * as src_common_BaseMap from 'src/common/BaseMap';
import * as mongoose from 'mongoose';
import { IProductDto as IProductDto$1, IProductRow as IProductRow$1, IProductFilterData } from 'src/schema/Product.schema';
import { IHistory } from 'src/client/ClientHistory';
import { IModelMessage } from 'src/model/ModelMessage.model';
import { ICart } from 'src/client/ClientCart';
import { ICartItem } from 'src/model/CartItem.model';
import RefundsAgentService$1 from 'src/services/logic/agent/RefundsAgentService';
import SalesAgentService$1 from 'src/services/logic/agent/SalesAgentService';
import TriageAgentService$1 from 'src/services/logic/agent/TriageAgentService';

interface IContext {
    clientId: string;
}

declare class LoggerService {
    protected readonly contextService: {
        readonly context: IContext;
    };
    private _logger;
    private _debug;
    log: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    debugCtx: (...args: any[]) => void;
    setPrefix: (prefix: string) => void;
    setDebug: (debug: boolean) => void;
    logCtx: (...args: any[]) => void;
}

declare class ErrorService {
    get beforeExitSubject(): TSubject<void>;
    handleGlobalError: (error: Error) => Promise<void>;
    private _listenForError;
    protected init: () => void;
}

declare class RefundsAgentService implements IAgent {
    readonly contextService: {
        readonly context: src_services_base_ContextService.IContext;
    };
    readonly loggerService: LoggerService$1;
    readonly navigationRegistryService: NavigationRegistryService$1;
    readonly pharmaProductRegistryService: PharmaProductRegistryService$1;
    private getClientAgent;
    commitSystemMessage: (message: string) => Promise<void>;
    commitToolOutput: (content: string) => Promise<void>;
    execute: (input: string[]) => Promise<void>;
    beginChat: () => Promise<void>;
    dispose: () => Promise<void>;
}

declare class SalesAgentService implements IAgent {
    readonly contextService: {
        readonly context: src_services_base_ContextService.IContext;
    };
    readonly loggerService: LoggerService$1;
    readonly navigationRegistryService: NavigationRegistryService$1;
    readonly pharmaProductRegistryService: PharmaProductRegistryService$1;
    private getClientAgent;
    execute: (input: string[]) => Promise<void>;
    beginChat: () => Promise<void>;
    commitSystemMessage: (message: string) => Promise<void>;
    commitToolOutput: (content: string) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class TriageAgentService implements IAgent {
    readonly contextService: {
        readonly context: src_services_base_ContextService.IContext;
    };
    readonly loggerService: LoggerService$1;
    readonly navigationRegistryService: NavigationRegistryService$1;
    private getClientAgent;
    execute: (input: string[]) => Promise<void>;
    beginChat: () => Promise<void>;
    commitSystemMessage: (message: string) => Promise<void>;
    commitToolOutput: (content: string) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class RootSwarmService implements ISwarm {
    readonly contextService: {
        readonly context: IContext;
    };
    readonly loggerService: LoggerService;
    private getClientSwarm;
    waitForAgentChange: () => Promise<void>;
    getAgentName: () => Promise<"refunds-agent" | "sales-agent" | "triage-agent">;
    getAgent: () => Promise<RefundsAgentService | SalesAgentService | TriageAgentService>;
    setAgent: (agentName: any) => Promise<void>;
    dispose: () => Promise<void>;
}

declare class ConnectionPrivateService implements IConnection {
    readonly loggerService: LoggerService;
    readonly contextService: {
        readonly context: IContext;
    };
    readonly rootSwarmService: RootSwarmService;
    private getClientConnection;
    waitForOutput: () => Promise<string>;
    connect: (connector: (outgoing: IOutgoingMessage) => void | Promise<void>) => (incoming: src_model_WsMessage_model.IIncomingMessage) => Promise<void> | void;
    complete: (messages: string[]) => Promise<string>;
    execute: (messages: string[], agentName: AgentName$1) => Promise<string>;
    commitToolOutput: (content: string, agentName: AgentName$1) => Promise<void>;
    commitSystemMessage: (message: string, agentName: AgentName$1) => Promise<void>;
    dispose: () => Promise<void>;
    emit: (outgoing: string, agentName: AgentName$1) => Promise<void>;
}

type TConnection = {
    [key in keyof IConnection]: any;
};
declare class ConnectionPublicService implements TConnection {
    readonly loggerService: LoggerService;
    readonly connectionPrivateService: ConnectionPrivateService;
    execute: (clientId: string, messages: string[], agentName: AgentName$1) => Promise<string>;
    waitForOutput: (clientId: string) => Promise<string>;
    complete: (clientId: string, messages: string[]) => Promise<string>;
    connect: (clientId: string, connector: (outgoing: IOutgoingMessage) => void | Promise<void>) => (incoming: IIncomingMessage) => Promise<void>;
    commitToolOutput: (clientId: string, content: string, agentName: AgentName$1) => Promise<void>;
    commitSystemMessage: (clientId: string, message: string, agentName: AgentName$1) => Promise<void>;
    dispose: (clientId: string) => Promise<void>;
    emit: (clientId: string, outgoing: string, agentName: AgentName$1) => Promise<void>;
}

type Embeddings = number[];
declare class EmbeddingService {
    readonly loggerService: LoggerService;
    createEmbedding: (text: string) => Promise<Embeddings>;
    compareEmbeddings: (a: Embeddings, b: Embeddings) => Promise<boolean>;
    compareStrings: (t1: string, t2: string) => Promise<boolean>;
}

declare class CompletionService {
    readonly loggerService: LoggerService;
    getCompletion: (messages: Message[], tools?: Tool[]) => Promise<{
        message: Message;
    }>;
}

declare class MongooseService {
    readonly loggerService: LoggerService;
    init: () => Promise<void>;
}

declare class RedisService {
    private readonly loggerService;
    getRedis: (() => Promise<Redis>) & functools_kit.ISingleshotClearable;
    private makePingInterval;
    protected init: (() => Promise<void>) & functools_kit.ISingleshotClearable;
}

declare const ClientSwarmDbService_base: (new () => {
    readonly redisService: RedisService;
    readonly loggerService: LoggerService;
    readonly connectionKey: string;
    readonly config: Partial<src_common_BaseMap.IConfig>;
    _enforceMaxItems(): Promise<void>;
    setWithKeepExpire(key: string, value: any): Promise<void>;
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any | null>;
    delete(key: string): Promise<void>;
    has(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(): AsyncIterableIterator<string>;
    values(): AsyncIterableIterator<any>;
    getFirst(): Promise<any | null>;
    shift(): Promise<any | null>;
    size(): Promise<number>;
    [Symbol.asyncIterator](): AsyncIterableIterator<[string, any]>;
}) & Omit<{
    new (connectionKey: string, config?: Partial<src_common_BaseMap.IConfig>): {
        readonly redisService: RedisService;
        readonly loggerService: LoggerService;
        readonly connectionKey: string;
        readonly config: Partial<src_common_BaseMap.IConfig>;
        _enforceMaxItems(): Promise<void>;
        setWithKeepExpire(key: string, value: any): Promise<void>;
        set(key: string, value: any): Promise<void>;
        get(key: string): Promise<any | null>;
        delete(key: string): Promise<void>;
        has(key: string): Promise<boolean>;
        clear(): Promise<void>;
        keys(): AsyncIterableIterator<string>;
        values(): AsyncIterableIterator<any>;
        getFirst(): Promise<any | null>;
        shift(): Promise<any | null>;
        size(): Promise<number>;
        [Symbol.asyncIterator](): AsyncIterableIterator<[string, any]>;
    };
}, "prototype">;
declare class ClientSwarmDbService extends ClientSwarmDbService_base {
    setWithKeepExpire: (key: string, value: any) => Promise<void>;
    set: (key: string, value: any) => Promise<void>;
    get: (key: string) => Promise<any | null>;
    delete: (key: string) => Promise<void>;
    has: (key: string) => Promise<boolean>;
    clear: () => Promise<void>;
    getFirst: () => Promise<any>;
    shift: () => Promise<any>;
    size: () => Promise<number>;
}

declare const ProductDbService_base: (new () => {
    readonly loggerService: LoggerService;
    readonly TargetModel: mongoose.Model<any>;
    create(dto: object): Promise<any>;
    update(id: string, dto: object): Promise<any>;
    remove(id: string): Promise<any>;
    findAll(filterData?: object, sort?: object): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByFilter(filterData: object, sort?: object): Promise<any>;
    iterate(filterData?: object, sort?: object): AsyncGenerator<any, void, unknown>;
    paginate(filterData: object, pagination: {
        limit: number;
        offset: number;
    }, sort?: object): Promise<{
        rows: any[];
        total: number;
    }>;
}) & Omit<{
    new (TargetModel: mongoose.Model<any>): {
        readonly loggerService: LoggerService;
        readonly TargetModel: mongoose.Model<any>;
        create(dto: object): Promise<any>;
        update(id: string, dto: object): Promise<any>;
        remove(id: string): Promise<any>;
        findAll(filterData?: object, sort?: object): Promise<any[]>;
        findById(id: string): Promise<any>;
        findByFilter(filterData: object, sort?: object): Promise<any>;
        iterate(filterData?: object, sort?: object): AsyncGenerator<any, void, unknown>;
        paginate(filterData: object, pagination: {
            limit: number;
            offset: number;
        }, sort?: object): Promise<{
            rows: any[];
            total: number;
        }>;
    };
}, "prototype">;
declare class ProductDbService extends ProductDbService_base {
    readonly loggerService: LoggerService;
    readonly contextService: {
        readonly context: IContext;
    };
    readonly embeddingService: EmbeddingService;
    create: (dto: IProductDto$1) => Promise<IProductRow$1>;
    update: (id: string, dto: IProductDto$1) => Promise<any>;
    remove: (id: string) => Promise<IProductRow$1>;
    findByVector: (search: string) => Promise<IProductRow$1[]>;
    findAll: (filterData?: Partial<IProductFilterData>) => Promise<IProductRow$1[]>;
    findByFilter: (filterData: Partial<IProductFilterData>) => Promise<IProductRow$1 | null>;
    findById: (id: string) => Promise<IProductRow$1>;
    iterate: (filterData?: Partial<IProductFilterData>) => AsyncGenerator<IProductRow$1, void, unknown>;
    paginate: (filterData: Partial<IProductFilterData>, pagination: {
        limit: number;
        offset: number;
    }) => Promise<{
        rows: any[];
        total: number;
    }>;
}

interface IProductInternal {
    embeddings: number[];
    createdAt: Date;
    updatedAt: Date;
}
interface IProductDto {
    title: string;
    description: string;
}
interface IProductRow extends IProductInternal, IProductDto {
    id: string;
}

declare class MigrationPrivateService {
    private readonly loggerService;
    private readonly productDbService;
    createProduct: (title: string, description: string) => Promise<IProductRow>;
    listProduct: () => Promise<IProductRow[]>;
    findProduct: (search: string) => Promise<IProductRow[]>;
    importProducts: (path: string) => Promise<void>;
}

interface IMigrationPrivateService extends MigrationPrivateService {
}
type TMigrationPrivateService = {
    [key in keyof IMigrationPrivateService]: any;
};
declare class MigrationPublicService implements TMigrationPrivateService {
    readonly loggerService: LoggerService;
    readonly migrationPrivateService: MigrationPrivateService;
    listProduct: () => Promise<IProductRow[]>;
    createProduct: (title: string, description: string) => Promise<IProductRow>;
    findProduct: (search: string) => Promise<IProductRow[]>;
    importProducts: (path: string) => Promise<void>;
}

type THistory = {
    [key in keyof IHistory]: any;
};
declare class ClientHistoryDbService implements THistory {
    readonly loggerService: LoggerService;
    readonly contextService: {
        readonly context: IContext;
    };
    private getClientHistory;
    length: (agentName: AgentName$1) => Promise<number>;
    toArrayForAgent: (agentName: AgentName$1) => Promise<IModelMessage[]>;
    toArrayForRaw: (agentName: AgentName$1) => Promise<IModelMessage[]>;
    push: (agentName: AgentName$1, message: IModelMessage) => Promise<void>;
    pop: (agentName: AgentName$1) => Promise<any>;
    clear: (agentName: AgentName$1) => Promise<void>;
    dispose: (agentName: AgentName$1) => Promise<void>;
}

type TCart = {
    [key in keyof ICart]: any;
};
declare class ClientCartDbService implements TCart {
    readonly loggerService: LoggerService;
    readonly contextService: {
        readonly context: IContext;
    };
    private getClientCart;
    length: (agentName: AgentName$1) => Promise<number>;
    toArray: (agentName: AgentName$1) => Promise<ICartItem[]>;
    push: (agentName: AgentName$1, message: ICartItem) => Promise<void>;
    pop: (agentName: AgentName$1) => Promise<any>;
    clear: (agentName: AgentName$1) => Promise<void>;
    dispose: (agentName: AgentName$1) => Promise<void>;
}

declare class SpecPrivateService {
    private readonly loggerService;
    private readonly rootSwarmService;
    private readonly connectionPrivateService;
    private readonly embeddingService;
    getAgentName: () => Promise<"refunds-agent" | "sales-agent" | "triage-agent">;
    getAgent: () => Promise<RefundsAgentService | SalesAgentService | TriageAgentService>;
    setAgent: (agentName: AgentName$1) => Promise<void>;
    complete: (msg: string) => Promise<string>;
    compareStrings: (a: string, b: string) => Promise<boolean>;
}

interface ISpecPrivateService extends SpecPrivateService {
}
type TSpecPrivateService = {
    [key in keyof ISpecPrivateService]: any;
};
declare class SpecPublicService implements TSpecPrivateService {
    private readonly loggerService;
    private readonly specPrivateService;
    complete: (msg: string) => Promise<string>;
    getAgentName: () => Promise<"refunds-agent" | "sales-agent" | "triage-agent">;
    getAgent: () => Promise<RefundsAgentService | SalesAgentService | TriageAgentService>;
    setAgent: (agentName: AgentName$1) => Promise<void>;
    compareStrings: (a: string, b: string) => Promise<boolean>;
}

declare const getAgentMap: (() => {
    "refunds-agent": RefundsAgentService$1;
    "sales-agent": SalesAgentService$1;
    "triage-agent": TriageAgentService$1;
}) & functools_kit.ISingleshotClearable;
type AgentName = keyof ReturnType<typeof getAgentMap>;

declare class NavigationRegistryService {
    readonly loggerService: LoggerService;
    private registry;
    useNavigateToRefund: () => {
        implementation: (agentName: AgentName) => Promise<void>;
        validate: (agentName: AgentName, params: Record<string, unknown>) => Promise<boolean>;
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {};
                required: any[];
            };
        };
    };
    useNavigateToSales: () => {
        validate: (agentName: AgentName, params: Record<string, unknown>) => Promise<boolean>;
        implementation: (agentName: AgentName) => Promise<void>;
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {};
                required: any[];
            };
        };
    };
    useNavigateToTriage: () => {
        validate: (agentName: AgentName, params: Record<string, unknown>) => Promise<boolean>;
        implementation: (agentName: AgentName) => Promise<void>;
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {};
                required: any[];
            };
        };
    };
    protected init: () => void;
}

declare class PharmaProductRegistryService {
    readonly loggerService: LoggerService;
    private registry;
    useListPharmaProduct: () => {
        implementation: (agentName: AgentName) => Promise<void>;
        validate: (agentName: AgentName, params: Record<string, unknown>) => Promise<boolean>;
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {};
                required: any[];
            };
        };
    };
    useFindPharmaProductByKeyword: () => {
        implementation: (agentName: AgentName, { keyword }: {
            keyword?: string;
        }) => Promise<void>;
        validate: (agentName: AgentName, params: Record<string, unknown>) => Promise<boolean>;
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {
                    keyword: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
        };
    };
    protected init: () => void;
}

declare const ioc: {
    refundsAgentService: RefundsAgentService;
    salesAgentService: SalesAgentService;
    triageAgentService: TriageAgentService;
    rootSwarmService: RootSwarmService;
    navigationRegistryService: NavigationRegistryService;
    pharmaProductRegistryService: PharmaProductRegistryService;
    clientSwarmDbService: ClientSwarmDbService;
    clientHistoryDbService: ClientHistoryDbService;
    clientCartDbService: ClientCartDbService;
    productDbService: ProductDbService;
    connectionPrivateService: ConnectionPrivateService;
    migrationPrivateService: MigrationPrivateService;
    specPrivateService: SpecPrivateService;
    connectionPublicService: ConnectionPublicService;
    migrationPublicService: MigrationPublicService;
    specPublicService: SpecPublicService;
    loggerService: LoggerService;
    errorService: ErrorService;
    contextService: {
        readonly context: IContext;
    };
    mongooseService: MongooseService;
    redisService: RedisService;
    embeddingService: EmbeddingService;
    completionService: CompletionService;
};

export { ioc };

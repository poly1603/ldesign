import { App, Plugin as Plugin$1 } from 'vue';

/**
 * 插件接口
 */
interface IPlugin {
    /** 插件名称 */
    name: string;
    /** 插件版本 */
    version: string;
    /** 插件描述 */
    description?: string;
    /** 插件依赖 */
    dependencies?: string[];
    /** 插件安装方法 */
    install(engine: IEngine, options?: any): void | Promise<void>;
    /** 插件卸载方法 */
    uninstall?(engine: IEngine): void | Promise<void>;
}
/**
 * 引擎接口
 */
interface IEngine {
    /** 引擎版本 */
    version: string;
    /** Vue应用实例 */
    app?: App;
    /** 事件总线 */
    eventBus: IEventBus;
    /** 生命周期管理器 */
    lifecycle: ILifecycle;
    /** 安装插件 */
    use(plugin: IPlugin | PluginInstaller, options?: any): Promise<this>;
    /** 卸载插件 */
    unuse(pluginName: string): Promise<this>;
    /** 获取插件 */
    getPlugin(name: string): IPlugin | undefined;
    /** 获取所有插件 */
    getPlugins(): IPlugin[];
    /** 启动引擎 */
    start(): Promise<void>;
    /** 停止引擎 */
    stop(): Promise<void>;
    /** 销毁引擎 */
    destroy(): Promise<void>;
}
/**
 * 事件总线接口
 */
interface IEventBus {
    /** 监听事件 */
    on(event: string, handler: EventHandler): void;
    /** 监听一次事件 */
    once(event: string, handler: EventHandler): void;
    /** 取消监听事件 */
    off(event: string, handler?: EventHandler): void;
    /** 触发事件 */
    emit(event: string, ...args: any[]): void;
    /** 清空所有事件监听器 */
    clear(): void;
}
/**
 * 生命周期接口
 */
interface ILifecycle {
    /** 注册生命周期钩子 */
    hook(phase: LifecyclePhase, handler: LifecycleHandler): void;
    /** 执行生命周期钩子 */
    execute(phase: LifecyclePhase, ...args: any[]): Promise<void>;
    /** 获取当前阶段 */
    getCurrentPhase(): LifecyclePhase | null;
}
/**
 * 事件处理器类型
 */
type EventHandler = (...args: any[]) => void;
/**
 * 生命周期处理器类型
 */
type LifecycleHandler = (...args: any[]) => void | Promise<void>;
/**
 * 插件安装器类型
 */
type PluginInstaller = (engine: IEngine, options?: any) => void | Promise<void>;
/**
 * 生命周期阶段
 */
declare enum LifecyclePhase {
    BEFORE_START = "before:start",
    STARTING = "starting",
    STARTED = "started",
    BEFORE_STOP = "before:stop",
    STOPPING = "stopping",
    STOPPED = "stopped",
    BEFORE_DESTROY = "before:destroy",
    DESTROYING = "destroying",
    DESTROYED = "destroyed"
}
/**
 * 引擎配置
 */
interface EngineConfig {
    /** 是否启用调试模式 */
    debug?: boolean;
    /** 插件配置 */
    plugins?: PluginConfig[];
    /** 自定义配置 */
    [key: string]: any;
}
/**
 * 插件配置
 */
interface PluginConfig {
    /** 插件实例或安装器 */
    plugin: IPlugin | PluginInstaller;
    /** 插件选项 */
    options?: any;
    /** 是否启用 */
    enabled?: boolean;
}
/**
 * 引擎状态
 */
declare enum EngineState {
    IDLE = "idle",
    STARTING = "starting",
    RUNNING = "running",
    STOPPING = "stopping",
    STOPPED = "stopped",
    DESTROYED = "destroyed"
}

/**
 * 事件总线实现
 */
declare class EventBus implements IEventBus {
    private readonly events;
    private readonly onceEvents;
    private readonly logger;
    /**
     * 监听事件
     */
    on(event: string, handler: EventHandler): void;
    /**
     * 监听一次事件
     */
    once(event: string, handler: EventHandler): void;
    /**
     * 取消监听事件
     */
    off(event: string, handler?: EventHandler): void;
    /**
     * 触发事件
     */
    emit(event: string, ...args: any[]): void;
    /**
     * 清空所有事件监听器
     */
    clear(): void;
    /**
     * 获取事件监听器数量
     */
    getListenerCount(event: string): number;
    /**
     * 获取所有事件名称
     */
    getEventNames(): string[];
}

/**
 * 生命周期管理器实现
 */
declare class Lifecycle implements ILifecycle {
    private readonly hooks;
    private readonly logger;
    private currentPhase;
    /**
     * 注册生命周期钩子
     */
    hook(phase: LifecyclePhase, handler: LifecycleHandler): void;
    /**
     * 执行生命周期钩子
     */
    execute(phase: LifecyclePhase, ...args: any[]): Promise<void>;
    /**
     * 获取当前阶段
     */
    getCurrentPhase(): LifecyclePhase | null;
    /**
     * 移除生命周期钩子
     */
    unhook(phase: LifecyclePhase, handler?: LifecycleHandler): void;
    /**
     * 清空所有钩子
     */
    clear(): void;
    /**
     * 获取指定阶段的钩子数量
     */
    getHookCount(phase: LifecyclePhase): number;
    /**
     * 获取所有已注册的阶段
     */
    getRegisteredPhases(): LifecyclePhase[];
}

/**
 * LDesign引擎核心实现
 */
declare class Engine implements IEngine {
    readonly version = "1.0.0";
    app?: App;
    readonly eventBus: EventBus;
    readonly lifecycle: Lifecycle;
    private readonly plugins;
    private readonly logger;
    private state;
    private config;
    constructor(config?: EngineConfig);
    /**
     * 设置日志记录器
     */
    private setupLogger;
    /**
     * 设置生命周期钩子
     */
    private setupLifecycleHooks;
    /**
     * 安装插件
     */
    use(plugin: IPlugin | PluginInstaller, options?: any): Promise<this>;
    /**
     * 卸载插件
     */
    unuse(pluginName: string): Promise<this>;
    /**
     * 获取插件
     */
    getPlugin(name: string): IPlugin | undefined;
    /**
     * 获取所有插件
     */
    getPlugins(): IPlugin[];
    /**
     * 启动引擎
     */
    start(): Promise<void>;
    /**
     * 停止引擎
     */
    stop(): Promise<void>;
    /**
     * 销毁引擎
     */
    destroy(): Promise<void>;
    /**
     * 获取引擎状态
     */
    getState(): EngineState;
    /**
     * 设置Vue应用实例
     */
    setApp(app: App): void;
}
/**
 * 创建引擎实例
 */
declare function createEngine(config?: EngineConfig): Engine;

/**
 * 插件基类
 */
declare abstract class BasePlugin implements IPlugin {
    abstract readonly name: string;
    abstract readonly version: string;
    readonly description?: string;
    readonly dependencies?: string[];
    protected readonly logger: Logger;
    protected engine?: IEngine;
    /**
     * 插件安装方法
     */
    install(engine: IEngine, options?: any): Promise<void>;
    /**
     * 插件卸载方法
     */
    uninstall(engine: IEngine): Promise<void>;
    /**
     * 插件安装时的具体实现
     */
    protected abstract onInstall(engine: IEngine, options?: any): void | Promise<void>;
    /**
     * 插件卸载时的具体实现
     */
    protected onUninstall(engine: IEngine): void | Promise<void>;
    /**
     * 获取引擎实例
     */
    protected getEngine(): IEngine;
}
/**
 * 创建简单插件
 */
declare function createPlugin(name: string, version: string, installer: (engine: IEngine, options?: any) => void | Promise<void>, options?: {
    description?: string;
    dependencies?: string[];
    uninstaller?: (engine: IEngine) => void | Promise<void>;
}): IPlugin;
/**
 * 插件装饰器
 */
declare function Plugin(config: {
    name: string;
    version: string;
    description?: string;
    dependencies?: string[];
}): <T extends new (...args: any[]) => BasePlugin>(constructor: T) => T;
/**
 * 插件管理器
 */
declare class PluginManager {
    private readonly plugins;
    private readonly logger;
    /**
     * 注册插件
     */
    register(plugin: IPlugin): void;
    /**
     * 注销插件
     */
    unregister(name: string): void;
    /**
     * 获取插件
     */
    get(name: string): IPlugin | undefined;
    /**
     * 获取所有插件
     */
    getAll(): IPlugin[];
    /**
     * 检查插件是否已注册
     */
    has(name: string): boolean;
    /**
     * 清空所有插件
     */
    clear(): void;
    /**
     * 解析插件依赖关系
     */
    resolveDependencies(plugins: IPlugin[]): IPlugin[];
}

/**
 * 日志级别
 */
declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}
/**
 * 日志接口
 */
interface ILogger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    setLevel(level: LogLevel | keyof typeof LogLevel): void;
}
/**
 * 日志实现
 */
declare class Logger implements ILogger {
    private level;
    private readonly prefix;
    constructor(name: string);
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    setLevel(level: LogLevel | keyof typeof LogLevel): void;
}
/**
 * 创建日志实例
 */
declare function createLogger(name: string): Logger;
/**
 * 设置全局日志级别
 */
declare function setGlobalLogLevel(level: LogLevel | keyof typeof LogLevel): void;
/**
 * 获取全局日志级别
 */
declare function getGlobalLogLevel(): LogLevel;

/**
 * 深度克隆对象
 */
declare function deepClone<T>(obj: T): T;
/**
 * 深度合并对象
 */
declare function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
/**
 * 检查是否为对象
 */
declare function isObject(item: any): item is Record<string, any>;
/**
 * 检查是否为函数
 */
declare function isFunction(item: any): item is Function;
/**
 * 检查是否为字符串
 */
declare function isString(item: any): item is string;
/**
 * 检查是否为数字
 */
declare function isNumber(item: any): item is number;
/**
 * 检查是否为布尔值
 */
declare function isBoolean(item: any): item is boolean;
/**
 * 检查是否为数组
 */
declare function isArray(item: any): item is any[];
/**
 * 检查是否为Promise
 */
declare function isPromise(item: any): item is Promise<any>;
/**
 * 防抖函数
 */
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number, immediate?: boolean): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * 生成唯一ID
 */
declare function generateId(prefix?: string): string;
/**
 * 延迟执行
 */
declare function delay(ms: number): Promise<void>;
/**
 * 重试函数
 */
declare function retry<T>(fn: () => Promise<T>, maxAttempts?: number, delayMs?: number): Promise<T>;
/**
 * 格式化字节大小
 */
declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 获取对象的嵌套属性值
 */
declare function get(obj: any, path: string, defaultValue?: any): any;
/**
 * 设置对象的嵌套属性值
 */
declare function set(obj: any, path: string, value: any): void;

/**
 * 验证插件对象
 */
declare function validatePlugin(plugin: any): plugin is IPlugin;
/**
 * 验证引擎配置
 */
declare function validateEngineConfig(config: any): config is EngineConfig;
/**
 * 验证版本号格式
 */
declare function validateVersion(version: string): boolean;
/**
 * 验证插件名称格式
 */
declare function validatePluginName(name: string): boolean;
/**
 * 验证事件名称格式
 */
declare function validateEventName(name: string): boolean;
/**
 * 验证URL格式
 */
declare function validateUrl(url: string): boolean;
/**
 * 验证邮箱格式
 */
declare function validateEmail(email: string): boolean;
/**
 * 验证JSON字符串
 */
declare function validateJson(jsonString: string): boolean;
/**
 * 验证对象是否有必需的属性
 */
declare function validateRequiredProperties(obj: any, requiredProps: string[], objectName?: string): boolean;
/**
 * 验证数组中的所有元素是否满足条件
 */
declare function validateArrayElements<T>(arr: any[], validator: (item: any) => item is T, arrayName?: string): arr is T[];
/**
 * 验证数值范围
 */
declare function validateNumberRange(value: number, min?: number, max?: number, valueName?: string): boolean;
/**
 * 验证字符串长度
 */
declare function validateStringLength(value: string, minLength?: number, maxLength?: number, valueName?: string): boolean;

/**
 * LDesign引擎Vue插件
 */
declare const LDesignEnginePlugin: Plugin$1;

export { BasePlugin, Engine, EngineState, EventBus, LDesignEnginePlugin as LDesignEngine, Lifecycle, LifecyclePhase, LogLevel, Logger, Plugin, PluginManager, createEngine, createLogger, createPlugin, debounce, deepClone, deepMerge, delay, formatBytes, generateId, get, getGlobalLogLevel, isArray, isBoolean, isFunction, isNumber, isObject, isPromise, isString, retry, set, setGlobalLogLevel, throttle, validateArrayElements, validateEmail, validateEngineConfig, validateEventName, validateJson, validateNumberRange, validatePlugin, validatePluginName, validateRequiredProperties, validateStringLength, validateUrl, validateVersion };
export type { EngineConfig, EventHandler, IEngine, IEventBus, ILifecycle, ILogger, IPlugin, LifecycleHandler, PluginConfig, PluginInstaller };

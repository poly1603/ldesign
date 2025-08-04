/**
 * 错误相关类型定义
 */
declare enum WatermarkErrorCode {
    INVALID_CONFIG = 1000,
    MISSING_CONTENT = 1001,
    INVALID_CONTAINER = 1002,
    INVALID_STYLE = 1003,
    INVALID_LAYOUT = 1004,
    INVALID_ANIMATION = 1005,
    INVALID_SECURITY = 1006,
    RENDER_FAILED = 1100,
    CANVAS_NOT_SUPPORTED = 1101,
    SVG_NOT_SUPPORTED = 1102,
    IMAGE_LOAD_FAILED = 1103,
    LAYOUT_CALCULATION_FAILED = 1104,
    STYLE_APPLICATION_FAILED = 1105,
    INSTANCE_NOT_FOUND = 1200,
    INSTANCE_ALREADY_EXISTS = 1201,
    INSTANCE_CREATION_FAILED = 1202,
    INSTANCE_UPDATE_FAILED = 1203,
    INSTANCE_DESTROY_FAILED = 1204,
    INVALID_INSTANCE_STATE = 1205,
    SECURITY_VIOLATION = 1300,
    SECURITY_INIT_FAILED = 1301,
    MUTATION_OBSERVER_FAILED = 1302,
    STYLE_PROTECTION_FAILED = 1303,
    CANVAS_PROTECTION_FAILED = 1304,
    ANIMATION_FAILED = 1400,
    ANIMATION_NOT_SUPPORTED = 1401,
    ANIMATION_TIMEOUT = 1402,
    INVALID_ANIMATION_CONFIG = 1403,
    RESPONSIVE_INIT_FAILED = 1500,
    BREAKPOINT_NOT_FOUND = 1501,
    MEDIA_QUERY_FAILED = 1502,
    RESIZE_OBSERVER_FAILED = 1503,
    EVENT_HANDLER_FAILED = 1600,
    EVENT_LISTENER_FAILED = 1601,
    INVALID_EVENT_TYPE = 1602,
    EVENT_TIMEOUT = 1603,
    MEMORY_LEAK = 1700,
    PERFORMANCE_DEGRADATION = 1701,
    RESOURCE_EXHAUSTED = 1702,
    TIMEOUT = 1703,
    BROWSER_NOT_SUPPORTED = 1800,
    FEATURE_NOT_SUPPORTED = 1801,
    API_NOT_AVAILABLE = 1802,
    NETWORK_ERROR = 1900,
    IMAGE_FETCH_FAILED = 1901,
    RESOURCE_LOAD_FAILED = 1902,
    UNKNOWN_ERROR = 9999
}
declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum ErrorCategory {
    CONFIG = "config",
    RENDER = "render",
    INSTANCE = "instance",
    SECURITY = "security",
    ANIMATION = "animation",
    RESPONSIVE = "responsive",
    EVENT = "event",
    PERFORMANCE = "performance",
    COMPATIBILITY = "compatibility",
    NETWORK = "network",
    UNKNOWN = "unknown"
}
declare class WatermarkError extends Error {
    /** 错误代码 */
    readonly code: WatermarkErrorCode;
    /** 错误严重程度 */
    readonly severity: ErrorSeverity;
    /** 错误类别 */
    readonly category: ErrorCategory;
    /** 实例ID */
    readonly instanceId?: string;
    /** 错误上下文 */
    readonly context?: Record<string, any>;
    /** 原始错误 */
    readonly originalError?: Error;
    /** 错误时间戳 */
    readonly timestamp: number;
    /** 堆栈跟踪 */
    readonly stackTrace?: string;
    constructor(message: string, code: WatermarkErrorCode, severity?: ErrorSeverity, options?: {
        instanceId?: string;
        context?: Record<string, any>;
        originalError?: Error;
        category?: ErrorCategory;
    });
    private getCategoryFromCode;
    /** 转换为JSON格式 */
    toJSON(): {
        name: string;
        message: string;
        code: WatermarkErrorCode;
        severity: ErrorSeverity;
        category: ErrorCategory;
        instanceId: string | undefined;
        context: Record<string, any> | undefined;
        timestamp: number;
        stack: string | undefined;
        originalError: {
            name: string;
            message: string;
            stack: string | undefined;
        } | undefined;
    };
    /** 获取用户友好的错误信息 */
    getUserFriendlyMessage(): string;
}
interface ErrorHandler {
    /** 处理错误 */
    handle(error: WatermarkError): void | Promise<void>;
    /** 是否可以处理此错误 */
    canHandle(error: WatermarkError): boolean;
    /** 处理器优先级 */
    priority: number;
}
interface ErrorRecoveryStrategy {
    /** 策略名称 */
    name: string;
    /** 是否可以恢复 */
    canRecover(error: WatermarkError): boolean;
    /** 执行恢复 */
    recover(error: WatermarkError): Promise<boolean>;
    /** 恢复超时时间 */
    timeout?: number;
}
interface ErrorReport {
    /** 错误信息 */
    error: WatermarkError;
    /** 用户代理 */
    userAgent: string;
    /** 页面URL */
    url: string;
    /** 时间戳 */
    timestamp: number;
    /** 用户ID(如果有) */
    userId?: string;
    /** 会话ID */
    sessionId?: string;
    /** 额外信息 */
    extra?: Record<string, any>;
}
interface ErrorManager {
    /** 注册错误处理器 */
    registerHandler(handler: ErrorHandler): void;
    /** 注销错误处理器 */
    unregisterHandler(handler: ErrorHandler): void;
    /** 注册恢复策略 */
    registerRecoveryStrategy(strategy: ErrorRecoveryStrategy): void;
    /** 处理错误 */
    handleError(error: WatermarkError): Promise<void>;
    /** 尝试恢复错误 */
    tryRecover(error: WatermarkError): Promise<boolean>;
    /** 报告错误 */
    reportError(error: WatermarkError): Promise<void>;
    /** 获取错误统计 */
    getErrorStats(): ErrorStats;
    /** 清空错误历史 */
    clearErrorHistory(): void;
}
interface ErrorStats {
    /** 总错误数 */
    totalErrors: number;
    /** 各类别错误数 */
    errorsByCategory: Record<ErrorCategory, number>;
    /** 各严重程度错误数 */
    errorsBySeverity: Record<ErrorSeverity, number>;
    /** 最近错误 */
    recentErrors: WatermarkError[];
    /** 错误率 */
    errorRate: number;
    /** 恢复成功率 */
    recoveryRate: number;
}
interface ErrorConfig {
    /** 是否启用错误处理 */
    enabled?: boolean;
    /** 是否自动恢复 */
    autoRecover?: boolean;
    /** 是否报告错误 */
    reportErrors?: boolean;
    /** 报告URL */
    reportUrl?: string;
    /** 最大错误历史数量 */
    maxErrorHistory?: number;
    /** 是否在控制台输出错误 */
    logErrors?: boolean;
    /** 日志级别 */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /** 自定义错误处理器 */
    customHandlers?: ErrorHandler[];
    /** 自定义恢复策略 */
    customRecoveryStrategies?: ErrorRecoveryStrategy[];
}
declare const DEFAULT_ERROR_CONFIG: Required<Omit<ErrorConfig, 'reportUrl' | 'customHandlers' | 'customRecoveryStrategies'>>;

export { DEFAULT_ERROR_CONFIG, ErrorCategory, ErrorSeverity, WatermarkError, WatermarkErrorCode };
export type { ErrorConfig, ErrorHandler, ErrorManager, ErrorRecoveryStrategy, ErrorReport, ErrorStats };

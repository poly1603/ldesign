import { ErrorManager as ErrorManager$1, ErrorConfig, WatermarkError, ErrorCategory, ErrorHandler, WatermarkErrorCode, ErrorRecoveryStrategy, ErrorStats, ErrorReport } from '../types/error.js';

/**
 * 错误管理器
 */

/**
 * 错误管理器
 * 负责错误的捕获、处理、恢复和统计
 */
declare class ErrorManager implements ErrorManager$1 {
    private handlers;
    private recoveryStrategies;
    private config;
    private stats;
    private errorHistory;
    private recoveryTimes;
    private initialized;
    constructor(config?: Partial<ErrorConfig>);
    /**
     * 初始化错误管理器
     */
    init(): Promise<void>;
    /**
     * 处理错误
     */
    handleError(error: WatermarkError): Promise<void>;
    /**
     * 注册错误处理器
     */
    registerHandler(category: ErrorCategory, handler: ErrorHandler): string;
    /**
     * 移除错误处理器
     */
    unregisterHandler(category: ErrorCategory, handler: ErrorHandler): boolean;
    /**
     * 注册恢复策略
     */
    registerRecoveryStrategy(errorCode: WatermarkErrorCode, strategy: ErrorRecoveryStrategy): void;
    /**
     * 移除恢复策略
     */
    unregisterRecoveryStrategy(errorCode: WatermarkErrorCode): boolean;
    /**
     * 获取错误统计
     */
    getStats(): ErrorStats;
    /**
     * 获取错误历史
     */
    getHistory(limit?: number): ErrorReport[];
    /**
     * 清空错误历史
     */
    clearHistory(): void;
    /**
     * 获取指定类别的错误处理器数量
     */
    getHandlerCount(category: ErrorCategory): number;
    /**
     * 检查是否有指定类别的错误处理器
     */
    hasHandlers(category: ErrorCategory): boolean;
    /**
     * 获取所有错误类别
     */
    getCategories(): ErrorCategory[];
    /**
     * 重置统计信息
     */
    resetStats(): void;
    /**
     * 导出错误报告
     */
    exportReport(): {
        stats: ErrorStats;
        history: ErrorReport[];
        config: ErrorConfig;
    };
    /**
     * 销毁错误管理器
     */
    dispose(): Promise<void>;
    private createErrorReport;
    private updateStats;
    private updateRecoveryTime;
    private addToHistory;
    private logError;
    private getLogLevel;
    private executeHandlers;
    private attemptRecovery;
    private shouldReport;
    private sendErrorReport;
    private fallbackErrorHandling;
    private notifyUser;
    private registerDefaultHandlers;
    private registerDefaultRecoveryStrategies;
}

export { ErrorManager };

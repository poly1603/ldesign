"use strict";
/**
 * 错误处理工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ErrorHandler = exports.BuilderError = void 0;
exports.createErrorHandler = createErrorHandler;
exports.setupGlobalErrorHandling = setupGlobalErrorHandling;
exports.isBuilderError = isBuilderError;
exports.getErrorCode = getErrorCode;
exports.formatError = formatError;
const errors_1 = require("../constants/errors");
/**
 * 构建器错误类
 */
class BuilderError extends Error {
    constructor(code, message, options = {}) {
        const errorMessage = message || errors_1.ERROR_MESSAGES[code] || '未知错误';
        super(errorMessage);
        this.name = 'BuilderError';
        this.code = code;
        this.suggestion = options.suggestion || errors_1.ERROR_SUGGESTIONS[code];
        this.details = options.details;
        this.phase = options.phase;
        this.file = options.file;
        if (options.cause) {
            this.cause = options.cause;
        }
        // 保持堆栈跟踪
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BuilderError);
        }
    }
    /**
     * 获取完整的错误信息
     */
    getFullMessage() {
        let message = `[${this.code}] ${this.message}`;
        if (this.phase) {
            message += ` (阶段: ${this.phase})`;
        }
        if (this.file) {
            message += ` (文件: ${this.file})`;
        }
        if (this.suggestion) {
            message += `\n建议: ${this.suggestion}`;
        }
        return message;
    }
    /**
     * 转换为 JSON 格式
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            suggestion: this.suggestion,
            details: this.details,
            phase: this.phase,
            file: this.file,
            stack: this.stack
        };
    }
}
exports.BuilderError = BuilderError;
/**
 * 错误处理器类
 */
class ErrorHandler {
    constructor(options = {}) {
        this.logger = options.logger;
        this.showStack = options.showStack ?? false;
        this.showSuggestions = options.showSuggestions ?? true;
        this.onError = options.onError;
        this.exitOnError = options.exitOnError ?? false;
        this.exitCode = options.exitCode ?? 1;
    }
    /**
     * 处理错误
     */
    handle(error, context) {
        // 调用错误回调
        if (this.onError) {
            try {
                this.onError(error);
            }
            catch (callbackError) {
                this.logger?.error('错误回调执行失败:', callbackError);
            }
        }
        // 记录错误日志
        this.logError(error, context);
        // 是否退出进程
        if (this.exitOnError) {
            process.exit(this.exitCode);
        }
    }
    /**
     * 处理异步错误 - 优化性能，避免不必要的Promise包装
     */
    async handleAsync(error, context) {
        // 直接调用同步处理方法，避免Promise包装开销
        this.handle(error, context);
    }
    /**
     * 包装函数以处理错误
     */
    wrap(fn, context) {
        return ((...args) => {
            try {
                const result = fn(...args);
                // 处理 Promise
                if (result && typeof result === 'object' && 'catch' in result && typeof result.catch === 'function') {
                    return result.catch((error) => {
                        const err = error instanceof Error ? error : new Error(String(error));
                        this.handle(err, context);
                        throw err;
                    });
                }
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                this.handle(err, context);
                throw err;
            }
        });
    }
    /**
     * 包装异步函数以处理错误
     */
    wrapAsync(fn, context) {
        return async (...args) => {
            try {
                return await fn(...args);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                await this.handleAsync(err, context);
                throw err;
            }
        };
    }
    /**
     * 创建构建器错误
     */
    createError(code, message, options) {
        return new BuilderError(code, message, options);
    }
    /**
     * 抛出构建器错误
     */
    throwError(code, message, options) {
        throw this.createError(code, message, options);
    }
    /**
     * 格式化错误信息
     */
    formatError(error, includeStack) {
        const showStack = includeStack ?? this.showStack;
        if (isBuilderError(error)) {
            return error.getFullMessage();
        }
        let message = error.message;
        if (showStack && error.stack) {
            message += `\n${error.stack}`;
        }
        return message;
    }
    /**
     * 获取错误建议
     */
    getSuggestions(error) {
        if (isBuilderError(error) && error.suggestion) {
            return [error.suggestion];
        }
        // 根据错误类型提供通用建议
        const suggestions = [];
        if (error.message.includes('ENOENT')) {
            suggestions.push('检查文件或目录是否存在');
        }
        if (error.message.includes('EACCES')) {
            suggestions.push('检查文件权限');
        }
        if (error.message.includes('MODULE_NOT_FOUND')) {
            suggestions.push('运行 npm install 安装依赖');
        }
        return suggestions;
    }
    /**
     * 记录错误日志
     */
    logError(error, context) {
        if (!this.logger) {
            console.error(error);
            return;
        }
        // 构建错误消息
        let message = error.message;
        if (context) {
            message = `${context}: ${message}`;
        }
        // 记录基本错误信息
        this.logger.error(message);
        // 如果是构建器错误，显示额外信息
        if (error instanceof BuilderError) {
            if (error.phase) {
                this.logger.error(`阶段: ${error.phase}`);
            }
            if (error.file) {
                this.logger.error(`文件: ${error.file}`);
            }
            if (error.details) {
                this.logger.debug('错误详情:', error.details);
            }
            if (this.showSuggestions && error.suggestion) {
                this.logger.info(`建议: ${error.suggestion}`);
            }
        }
        // 显示堆栈跟踪
        if (this.showStack && error.stack) {
            this.logger.debug('堆栈跟踪:');
            this.logger.debug(error.stack);
        }
        // 显示原因链
        if (error.cause) {
            this.logger.debug('原因:');
            this.logError(error.cause);
        }
    }
}
exports.ErrorHandler = ErrorHandler;
/**
 * 默认错误处理器实例
 */
exports.errorHandler = new ErrorHandler();
/**
 * 创建错误处理器
 */
function createErrorHandler(options = {}) {
    return new ErrorHandler(options);
}
/**
 * 处理未捕获的异常
 */
function setupGlobalErrorHandling(handler = exports.errorHandler) {
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
        handler.handle(error, '未捕获的异常');
        process.exit(1);
    });
    // 处理未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason, _promise) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        handler.handle(error, '未处理的 Promise 拒绝');
    });
    // 处理警告
    process.on('warning', (warning) => {
        if (handler['logger']) {
            handler['logger'].warn(`Node.js 警告: ${warning.message}`);
        }
    });
}
/**
 * 判断是否为构建器错误
 */
function isBuilderError(error) {
    return error instanceof BuilderError;
}
/**
 * 从错误中提取错误码
 */
function getErrorCode(error) {
    if (isBuilderError(error)) {
        return error.code;
    }
    return undefined;
}
/**
 * 格式化错误信息
 */
function formatError(error, includeStack = false) {
    if (isBuilderError(error)) {
        return error.getFullMessage();
    }
    let message = error.message;
    if (includeStack && error.stack) {
        message += `\n${error.stack}`;
    }
    return message;
}

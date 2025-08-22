/**
 * 服务层 - 统一导出
 * 
 * 提供业务服务和中间件功能，包括：
 * - 错误处理服务
 * - 事件系统服务
 * - 性能监控服务
 * - 缓存服务封装
 * - 存储服务
 * - 设备检测服务
 */

// 错误处理服务
export { ErrorHandler, TemplateError, TemplateErrorType } from './error-handler'

// 事件系统服务
export { EventEmitter, TemplateEventType } from './event-emitter'

// 性能监控服务
export { PerformanceMonitor, PerformanceMetrics } from './performance-monitor'

// 缓存服务封装
export { CacheService, type CacheConfig, type CacheStats } from './cache-service'

// 存储服务
export { StorageService, type StorageConfig, type StorageStats } from './storage-service'

// 设备检测服务
export { DeviceService, type DeviceInfo, type DeviceServiceConfig, type DeviceChangeEvent } from './device-service'

// 日志服务
export { Logger, LogLevel } from './logger'

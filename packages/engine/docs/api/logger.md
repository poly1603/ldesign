# 日志系统（Logger）

统一的日志记录器，支持级别、格式化和多通道输出。

## 快速上手

```ts
engine.logger.debug('调试信息', { meta: 1 })
engine.logger.info('普通信息')
engine.logger.warn('警告信息')
engine.logger.error('错误信息', new Error('oops'))

// 调整日志级别
engine.logger.setLevel('debug')

// 获取当前级别
const level = engine.logger.getLevel()

// 获取日志历史
const logs = engine.logger.getLogs()

// 清理日志
engine.logger.clearLogs()

// 设置最大日志数量
engine.logger.setMaxLogs(2000)
```

## API

- setLevel(level: LogLevel): void
- getLevel(): LogLevel
- debug(message: string, data?: unknown): void
- info(message: string, data?: unknown): void
- warn(message: string, data?: unknown): void
- error(message: string, data?: unknown): void
- getLogs(): LogEntry[]
- clearLogs(): void
- setMaxLogs(max: number): void
- getMaxLogs(): number

## 日志级别

- `debug`: 调试信息（开发环境）
- `info`: 一般信息
- `warn`: 警告信息
- `error`: 错误信息

## 最佳实践

- 生产环境建议使用 info 或 warn 级别
- 配合配置系统实现动态切换级别
- 在关键路径添加结构化日志，便于排查
- 使用 data 参数传递结构化信息

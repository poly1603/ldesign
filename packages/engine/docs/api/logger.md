# 日志系统（Logger）

统一的日志记录器，支持级别、格式化和多通道输出。

## 快速上手

```ts
engine.logger.debug('调试信息', { meta: 1 })
engine.logger.info('普通信息')
engine.logger.warn('警告信息')
engine.logger.error('错误信息', new Error('oops'))

// 调整日志级别（支持 run-time 调整）
engine.config.set('logger.level', 'debug')
```

## API

- setLevel(level)
- getLevel()
- debug(...args)
- info(...args)
- warn(...args)
- error(...args)
- clearLogs()

## 最佳实践

- 生产环境建议使用 info 或 warn 级别
- 配合配置系统实现动态切换级别
- 在关键路径添加结构化日志，便于排查

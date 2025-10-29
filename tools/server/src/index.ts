import { App } from './app'
import { logger } from './utils/logger'

const config = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '127.0.0.1',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  enableWebSocket: process.env.ENABLE_WS !== 'false',
}

const app = new App(config)

// 启动服务器
app.start().catch((error) => {
  logger.error('服务器启动失败', error)
  process.exit(1)
})

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器...')
  await app.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器...')
  await app.stop()
  process.exit(0)
})

// 错误处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝', { reason, promise })
  process.exit(1)
})

export { app }
export * from './types'

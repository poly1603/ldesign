/**
 * 开发模式入口文件
 * 用于 tsx watch 启动开发服务器
 */

import { createServer } from './app.js'
import { logger } from '../utils/logger.js'

const port = 3000
const host = 'localhost'

const serverLogger = logger.withPrefix('Dev')
serverLogger.info('启动开发服务器...')

createServer({ port, host, debug: true })
  .then(({ server, wss }) => {
    server.listen(port, host, () => {
      serverLogger.success(`服务器已启动`)
                                  })

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        serverLogger.error(`端口 ${port} 已被占用`)
      } else {
        serverLogger.error('服务器错误:', error)
      }
      process.exit(1)
    })

    // 处理进程退出
    const gracefulShutdown = () => {
      serverLogger.info('正在关闭服务器...')
      
      setTimeout(() => {
        server.close(() => {
          serverLogger.success('HTTP 服务器已关闭')
        })
        
        wss.close(() => {
          serverLogger.success('WebSocket 服务器已关闭')
        })

        setTimeout(() => {
          process.exit(0)
        }, 500)
      }, 500)
    }

    process.on('SIGINT', gracefulShutdown)
    process.on('SIGTERM', gracefulShutdown)
  })
  .catch(error => {
    serverLogger.error('启动服务器失败:', error)
    process.exit(1)
  })


/**
 * Express 服务器应用
 * 提供 API 接口和静态文件服务
 */

import express from 'express'
import cors from 'cors'
import { createServer as createHttpServer } from 'http'
import { WebSocketServer } from 'ws'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { logger } from '../utils/logger.js'
import { apiRouter } from './routes/api.js'
import { fnmRouter } from './routes/fnm.js'
import { voltaRouter } from './routes/volta.js'
import { npmSourcesRouter } from './routes/npm-sources.js'
import { setupWebSocket, connectionManager } from './websocket.js'
import { initializeDatabase, closeDatabase } from './database/index.js'

// 获取当前文件的目录路径，兼容 ESM 和 CJS
let __dirname: string
try {
  const __filename = fileURLToPath(import.meta.url)
  __dirname = dirname(__filename)
} catch {
  // CJS 环境下，使用相对于 process.cwd() 的路径
  __dirname = resolve(process.cwd(), 'dist/server')
}

/**
 * 服务器配置选项
 */
export interface ServerOptions {
  port: number
  host: string
  debug?: boolean
}

/**
 * 创建 Express 服务器
 */
export async function createServer(options: ServerOptions) {
  const { port, host, debug = false } = options
  const serverLogger = logger.withPrefix('Server')

  // 初始化数据库
  try {
    const dbResult = await initializeDatabase({
      verbose: debug,
      autoMigrate: true,
    })
    
    if (!dbResult.success) {
      serverLogger.error('数据库初始化失败:', dbResult.message)
      throw new Error(dbResult.message)
    }
    
    serverLogger.info('✅ 数据库初始化成功')
  } catch (error) {
    serverLogger.error('数据库初始化错误:', error)
    throw error
  }

  // 创建 Express 应用
  const app = express()

  // 中间件配置
  app.use(cors({
    origin: true,
    credentials: true
  }))

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // 请求日志中间件
  if (debug) {
    app.use((req, res, next) => {
      serverLogger.debug(`${req.method} ${req.path}`)
      next()
    })
  }

  // API 路由
  app.use('/api', apiRouter)
  app.use('/api/fnm', fnmRouter)
  app.use('/api/volta', voltaRouter)
  app.use('/api/npm-sources', npmSourcesRouter)

  // 静态文件服务
  // 尝试多个可能的路径，优先使用构建后的文件
  const possiblePaths = [
    resolve(__dirname, './web'),            // 构建模式：dist/web (复制后的位置)
    resolve(__dirname, '../src/web/dist'),  // 开发模式：src/web/dist
    resolve(__dirname, '../../src/web/dist'), // 其他情况
    resolve(__dirname, '../src/web')        // 备用：src/web (源码目录)
  ]

  let webPath: string | null = null
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      webPath = path
      break
    }
  }

  if (webPath) {
    app.use(express.static(webPath))
    logger.info(`静态文件服务: ${webPath}`)
  } else {
    logger.warn('未找到 Web 文件，将创建默认页面')
    logger.debug('尝试的路径:', possiblePaths)
    logger.debug('当前 __dirname:', __dirname)
  }

  // SPA 路由支持 - 所有未匹配的路由都返回 index.html
  app.get('*', (req, res) => {
    let indexPath: string | null = null

    // 尝试在已找到的 webPath 中查找 index.html
    if (webPath) {
      const indexFile = resolve(webPath, 'index.html')
      if (existsSync(indexFile)) {
        indexPath = indexFile
      }
    }

    if (indexPath) {
      res.sendFile(indexPath)
    } else {
      // 如果没有找到 index.html，返回默认页面
      res.send(createDefaultPage())
    }
  })

  // 错误处理中间件
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    serverLogger.error('服务器错误:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: debug ? error.message : undefined
    })
  })

  // 创建 HTTP 服务器
  const server = createHttpServer(app)

  // 设置 WebSocket
  const wss = new WebSocketServer({ server })
  setupWebSocket(wss, debug)

  // 监听进程退出信号
  const handleShutdown = (signal: string) => {
    serverLogger.info(`收到 ${signal} 信号，准备关闭服务器...`)

    // 广播服务器关闭消息
    connectionManager.broadcast({
      type: 'server-shutdown',
      data: {
        message: '服务器正在关闭',
        timestamp: new Date().toISOString()
      }
    })

    // 等待消息发送完成后关闭服务器
    setTimeout(() => {
      // 关闭数据库
      try {
        closeDatabase()
        serverLogger.info('✅ 数据库连接已关闭')
      } catch (error) {
        serverLogger.error('关闭数据库时出错:', error)
      }

      server.close(() => {
        serverLogger.info('服务器已关闭')
        process.exit(0)
      })

      // 强制关闭 WebSocket 连接
      wss.close(() => {
        serverLogger.info('WebSocket 服务器已关闭')
      })
    }, 500) // 等待 500ms 确保消息发送完成
  }

  process.on('SIGINT', () => handleShutdown('SIGINT'))
  process.on('SIGTERM', () => handleShutdown('SIGTERM'))

  return { server, wss }
}

/**
 * 创建默认页面
 */
function createDefaultPage(): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LDesign UI 管理界面</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            color: white;
            padding: 2rem;
        }
        .logo {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        .status {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">LDesign</div>
        <div class="subtitle">UI 管理界面</div>
        <div class="status">
            <p>🚀 服务器已启动</p>
            <p>⚠️ 前端资源正在构建中...</p>
            <p>请稍后刷新页面</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}


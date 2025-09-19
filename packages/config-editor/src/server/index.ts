/**
 * 配置编辑器服务器入口文件
 * 
 * 启动 Express 服务器提供 API 接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import express from 'express'
import cors from 'cors'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { ConfigEditorServer } from './ConfigEditorServer'
import { DEFAULT_SERVER_CONFIG } from '../constants/defaults'

// 获取当前文件的目录路径（ESM 兼容）
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 创建并启动服务器
 */
async function startServer() {
  const app = express()
  const port = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_SERVER_CONFIG.port
  const host = process.env.HOST || DEFAULT_SERVER_CONFIG.host

  // 中间件配置
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // 创建配置编辑器服务器实例
  const configServer = new ConfigEditorServer()

  // 初始化服务器
  await configServer.initialize()

  // 注册 API 路由
  app.use('/api', configServer.getRouter())

  // 静态文件服务 - 提供前端构建文件
  const clientDistPath = path.join(__dirname, '..', 'client')
  if (existsSync(clientDistPath)) {
    console.log(`📁 静态文件目录: ${clientDistPath}`)
    app.use(express.static(clientDistPath))

    // SPA 路由支持 - 所有非API请求都返回 index.html
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        res.sendFile(path.join(clientDistPath, 'index.html'))
      }
    })
  } else {
    console.warn('⚠️  前端构建文件未找到，仅提供 API 服务')
  }

  // 健康检查端点
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  })

  // 启动服务器
  app.listen(port, host, () => {
    console.log(`🚀 配置编辑器服务器已启动`)
    console.log(`📍 地址: http://${host}:${port}`)
    console.log(`🔗 API: http://${host}:${port}/api`)
    console.log(`💚 健康检查: http://${host}:${port}/health`)

    if (existsSync(path.join(__dirname, '..', 'client'))) {
      console.log(`🌐 前端界面: http://${host}:${port}`)

      // 自动打开浏览器（如果不是通过环境变量禁用）
      if (process.env.NO_OPEN !== 'true') {
        const open = async () => {
          try {
            const { default: openBrowser } = await import('open')
            await openBrowser(`http://${host}:${port}`)
            console.log(`🔗 已自动打开浏览器`)
          } catch (error) {
            console.log(`💡 请手动打开浏览器访问: http://${host}:${port}`)
          }
        }
        setTimeout(open, 1000) // 延迟1秒打开浏览器
      }
    }
  })

  // 错误处理
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason)
    process.exit(1)
  })
}

// 启动服务器
startServer().catch((error) => {
  console.error('启动服务器失败:', error)
  process.exit(1)
})

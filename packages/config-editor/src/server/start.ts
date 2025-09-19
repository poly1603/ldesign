#!/usr/bin/env node

/**
 * 配置编辑器服务器启动文件
 * 用于启动集成的前后端服务
 */

import express from 'express'
import cors from 'cors'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { ConfigEditorServer } from './ConfigEditorServer.js'

// 获取当前文件的目录路径（ESM 兼容）
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 启动配置编辑器服务器
 */
async function startServer() {
  const port = parseInt(process.env.PORT || '3002')
  const host = process.env.HOST || 'localhost'
  const cwd = process.env.CWD || process.cwd()
  const noOpen = process.env.NO_OPEN === 'true'

  console.log(`🚀 正在启动配置编辑器服务器...`)
  console.log(`📍 工作目录: ${cwd}`)
  console.log(`🌐 服务地址: http://${host}:${port}`)

  try {
    const app = express()

    // 基础中间件
    app.use(cors())
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // 健康检查
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      })
    })

    // API 路由
    const configServer = new ConfigEditorServer()
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
      console.log(`⚠️  前端构建文件未找到: ${clientDistPath}`)
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
          res.json({
            error: '前端文件未找到',
            message: '请先运行 pnpm run build:client 构建前端文件'
          })
        }
      })
    }

    // 启动服务器
    const server = app.listen(port, host, () => {
      console.log(`✅ 配置编辑器已启动`)
      console.log(`🔗 访问地址: http://${host}:${port}`)

      // 自动打开浏览器
      if (!noOpen) {
        setTimeout(async () => {
          try {
            const open = (await import('open')).default
            await open(`http://${host}:${port}`)
            console.log(`🔗 已自动打开浏览器`)
          } catch (error) {
            console.log(`💡 请手动打开浏览器访问: http://${host}:${port}`)
          }
        }, 1000) // 延迟1秒打开浏览器
      }
    })

    // 错误处理
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${port} 已被占用，请尝试其他端口`)
      } else {
        console.error(`❌ 服务器启动失败:`, error)
      }
      process.exit(1)
    })

    // 优雅关闭
    process.on('SIGTERM', () => {
      console.log('收到 SIGTERM 信号，正在关闭服务器...')
      server.close(() => {
        console.log('服务器已关闭')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('收到 SIGINT 信号，正在关闭服务器...')
      server.close(() => {
        console.log('服务器已关闭')
        process.exit(0)
      })
    })

  } catch (error) {
    console.error('❌ 启动服务器失败:', error)
    process.exit(1)
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
  process.exit(1)
})

// 启动服务器
startServer().catch((error) => {
  console.error('启动服务器失败:', error)
  process.exit(1)
})

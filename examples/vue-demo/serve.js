#!/usr/bin/env node

/**
 * 简单的开发服务器
 * 用于快速启动 Vue Demo 项目
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = 3000

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.vue': 'text/plain',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }

    const mimeType = getMimeType(filePath)
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url)
  let pathname = parsedUrl.pathname

  // 默认文件
  if (pathname === '/') {
    pathname = '/index.html'
  }

  const filePath = path.join(__dirname, pathname)

  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      // 如果是 SPA 路由，返回 index.html
      if (!path.extname(pathname)) {
        serveFile(res, path.join(__dirname, 'index.html'))
        return
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }

    serveFile(res, filePath)
  })
})

server.listen(PORT, () => {
  console.log('🎨 LDesign Theme Vue Demo')
  console.log(`🚀 开发服务器启动在 http://localhost:${PORT}`)
  console.log(`📁 服务目录: ${__dirname}`)
  console.log('⏹️  按 Ctrl+C 停止服务器')
  console.log('-'.repeat(50))
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ 端口 ${PORT} 已被占用，请尝试其他端口`)
  } else {
    console.log(`❌ 启动服务器时出错: ${err.message}`)
  }
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('\n👋 服务器已停止')
  process.exit(0)
})

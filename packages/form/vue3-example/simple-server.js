const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')
const url = require('node:url')

const PORT = 3001

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
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

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('File not found')
      return
    }

    const mimeType = getMimeType(filePath)
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  let pathname = parsedUrl.pathname

  // 处理根路径
  if (pathname === '/') {
    pathname = '/index.html'
  }

  // 处理模块导入
  if (pathname.startsWith('/@ldesign/form/dist/')) {
    const distPath = pathname.replace('/@ldesign/form/dist/', '../dist/')
    const filePath = path.join(__dirname, distPath)
    serveFile(filePath, res)
    return
  }

  // 处理Vue模块
  if (pathname === '/vue') {
    res.writeHead(302, {
      Location: 'https://unpkg.com/vue@3/dist/vue.esm-browser.js',
    })
    res.end()
    return
  }

  // 处理静态文件
  const filePath = path.join(__dirname, pathname)

  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('File not found')
      return
    }

    serveFile(filePath, res)
  })
})

server.listen(PORT, () => {
  console.log(`🚀 开发服务器启动成功！`)
  console.log(`📱 本地访问: http://localhost:${PORT}`)
  console.log(`🌐 网络访问: http://localhost:${PORT}`)
  console.log(`\n按 Ctrl+C 停止服务器`)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

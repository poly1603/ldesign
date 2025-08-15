const http = require('http')
const fs = require('fs')
const path = require('path')

const port = 8080

// 避免 PowerShell 钩子问题
process.env.NODE_ENV = 'development'

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
}

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  let filePath = '.' + req.url
  if (filePath === './') {
    filePath = './index.html'
  }

  const extname = String(path.extname(filePath)).toLowerCase()
  const mimeType = mimeTypes[extname] || 'application/octet-stream'

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404)
        res.end('File not found')
      } else {
        res.writeHead(500)
        res.end('Server error: ' + error.code)
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType })
      res.end(content, 'utf-8')
    }
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${port}/`)
  console.log('Press Ctrl+C to stop')
})

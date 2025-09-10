/**
 * 简单的开发服务器
 * 用于测试编辑器功能
 */

import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PORT = 3000

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

// 创建服务器
const server = createServer((req, res) => {
  let filePath = req.url === '/' ? '/examples/index.html' : req.url
  
  // 移除查询参数
  filePath = filePath.split('?')[0]
  
  // 构建完整路径
  const fullPath = join(__dirname, filePath)
  
  // 检查文件是否存在
  if (!existsSync(fullPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('File not found')
    return
  }
  
  try {
    // 读取文件
    const content = readFileSync(fullPath)
    
    // 获取文件扩展名
    const ext = extname(fullPath)
    const contentType = mimeTypes[ext] || 'text/plain'
    
    // 设置响应头
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal server error')
  }
})

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 开发服务器已启动`)
  console.log(`📍 本地地址: http://localhost:${PORT}`)
  console.log(`📁 根目录: ${__dirname}`)
  console.log(`🎯 示例首页: http://localhost:${PORT}`)
  console.log(`📝 基础示例: http://localhost:${PORT}/examples/basic.html`)
  console.log(`⚡ 高级功能: http://localhost:${PORT}/examples/advanced.html`)
  console.log(`🎨 主题演示: http://localhost:${PORT}/examples/themes-demo.html`)
  console.log(`⚛️ React 集成: http://localhost:${PORT}/examples/react-example.html`)
  console.log(`💚 Vue 集成: http://localhost:${PORT}/examples/vue-example.html`)
  console.log(`📊 性能测试: http://localhost:${PORT}/examples/performance-test.html`)
  console.log('')
  console.log('按 Ctrl+C 停止服务器')
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...')
  server.close(() => {
    console.log('✅ 服务器已关闭')
    process.exit(0)
  })
})

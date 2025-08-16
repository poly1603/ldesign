const http = require('node:http')
const url = require('node:url')

// 模拟用户数据
const users = [
  { id: '1', name: '张三', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', email: 'lisi@example.com' },
  { id: '3', name: '王五', email: 'wangwu@example.com' },
]

let nextId = 4

// 创建服务器
const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const method = req.method

  console.log(`${method} ${path}`)

  // 设置响应头
  res.setHeader('Content-Type', 'application/json')

  try {
    if (path === '/api/users' && method === 'GET') {
      // 获取用户列表
      res.writeHead(200)
      res.end(JSON.stringify(users))
    }
    else if (path.startsWith('/api/users/') && method === 'GET') {
      // 获取单个用户
      const id = path.split('/')[3]
      const user = users.find(u => u.id === id)
      if (user) {
        res.writeHead(200)
        res.end(JSON.stringify(user))
      }
      else {
        res.writeHead(404)
        res.end(JSON.stringify({ error: 'User not found' }))
      }
    }
    else if (path === '/api/users' && method === 'POST') {
      // 创建用户
      let body = ''
      req.on('data', (chunk) => {
        body += chunk.toString()
      })
      req.on('end', () => {
        try {
          const userData = JSON.parse(body)
          const newUser = {
            id: String(nextId++),
            name: userData.name,
            email: userData.email,
          }
          users.push(newUser)
          res.writeHead(201)
          res.end(JSON.stringify(newUser))
        }
        catch (error) {
          res.writeHead(400)
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
    }
    else if (path.startsWith('/api/users/') && method === 'PUT') {
      // 更新用户
      const id = path.split('/')[3]
      let body = ''
      req.on('data', (chunk) => {
        body += chunk.toString()
      })
      req.on('end', () => {
        try {
          const userData = JSON.parse(body)
          const userIndex = users.findIndex(u => u.id === id)
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...userData }
            res.writeHead(200)
            res.end(JSON.stringify(users[userIndex]))
          }
          else {
            res.writeHead(404)
            res.end(JSON.stringify({ error: 'User not found' }))
          }
        }
        catch (error) {
          res.writeHead(400)
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
    }
    else if (path.startsWith('/api/users/') && method === 'DELETE') {
      // 删除用户
      const id = path.split('/')[3]
      const userIndex = users.findIndex(u => u.id === id)
      if (userIndex !== -1) {
        const deletedUser = users.splice(userIndex, 1)[0]
        res.writeHead(200)
        res.end(JSON.stringify(deletedUser))
      }
      else {
        res.writeHead(404)
        res.end(JSON.stringify({ error: 'User not found' }))
      }
    }
    else {
      // 404
      res.writeHead(404)
      res.end(JSON.stringify({ error: 'Not found' }))
    }
  }
  catch (error) {
    console.error('Server error:', error)
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log('  GET    /api/users      - 获取用户列表')
  console.log('  GET    /api/users/:id  - 获取单个用户')
  console.log('  POST   /api/users      - 创建用户')
  console.log('  PUT    /api/users/:id  - 更新用户')
  console.log('  DELETE /api/users/:id  - 删除用户')
})

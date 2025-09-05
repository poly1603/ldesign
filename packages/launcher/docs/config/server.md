# 服务器配置 (server)

开发服务器配置选项，用于控制本地开发环境的行为。

## 基本配置

### port

- **类型**: `number`
- **默认值**: `3000`
- **描述**: 指定开发服务器端口

```typescript
export default defineConfig({
  server: {
    port: 8080
  }
})
```

### host

- **类型**: `string | boolean`
- **默认值**: `'localhost'`
- **描述**: 指定服务器监听的主机地址

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',     // 监听所有地址
    // host: 'localhost', // 仅监听本地
    // host: true,        // 相当于 '0.0.0.0'
  }
})
```

### open

- **类型**: `boolean | string`
- **默认值**: `false`
- **描述**: 启动时自动在浏览器中打开应用程序

```typescript
export default defineConfig({
  server: {
    open: true,                    // 使用默认浏览器打开
    // open: '/docs/guide',        // 打开指定路径
    // open: 'chrome',             // 使用特定浏览器
    // open: 'chrome --incognito', // 带参数启动
  }
})
```

## 代理配置

### proxy

- **类型**: `Record<string, string | ProxyOptions>`
- **描述**: 配置开发服务器代理，解决跨域问题

```typescript
export default defineConfig({
  server: {
    proxy: {
      // 字符串简写方式
      '/api': 'http://localhost:4000',
      
      // 选项写法
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      
      // 正则表达式
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      },
      
      // 使用 proxy 实例
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true
      }
    }
  }
})
```

### ProxyOptions 详细配置

```typescript
interface ProxyOptions {
  target: string              // 目标服务器
  changeOrigin?: boolean     // 改变源头
  ws?: boolean               // WebSocket 代理
  rewrite?: (path: string) => string  // 路径重写
  configure?: (proxy, options) => void // 自定义配置
  headers?: Record<string, string>     // 自定义请求头
  timeout?: number           // 超时时间
  secure?: boolean          // 验证 SSL 证书
  auth?: string             // 基本认证
  agent?: any               // HTTP 代理
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent'
}
```

## HTTPS 配置

### https

- **类型**: `boolean | https.ServerOptions`
- **默认值**: `false`
- **描述**: 启用 HTTPS 开发服务器

```typescript
export default defineConfig({
  server: {
    https: true,  // 使用自签名证书
    
    // 或者提供证书配置
    https: {
      key: fs.readFileSync(path.join(__dirname, 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
    }
  }
})
```

## 中间件配置

### middlewareMode

- **类型**: `boolean`
- **默认值**: `false`
- **描述**: 以中间件模式创建 Vite 服务器

```typescript
export default defineConfig({
  server: {
    middlewareMode: true  // 用于集成到现有服务器
  }
})
```

### base

- **类型**: `string`
- **默认值**: `'/'`
- **描述**: 开发或生产环境服务的公共基础路径

```typescript
export default defineConfig({
  base: '/my-app/',
  server: {
    // 服务器会在 http://127.0.0.1:3000/my-app/ 下提供文件
  }
})
```

## 文件监听

### fs

- **类型**: `{ strict?: boolean, allow?: string[], deny?: string[] }`
- **描述**: 限制为工作区 root 路径以外的文件的访问

```typescript
export default defineConfig({
  server: {
    fs: {
      strict: true,        // 严格模式
      allow: ['..'],       // 允许的目录
      deny: ['.env', '.env.*', '*.{crt,pem}']  // 拒绝的文件
    }
  }
})
```

### watch

- **类型**: `object`
- **描述**: 传递给 chokidar 的文件系统监听器选项

```typescript
export default defineConfig({
  server: {
    watch: {
      // 忽略监听的文件
      ignored: ['!**/node_modules/**']
    }
  }
})
```

## CORS 配置

### cors

- **类型**: `boolean | CorsOptions`
- **默认值**: `true`
- **描述**: 为开发服务器配置 CORS

```typescript
export default defineConfig({
  server: {
    cors: {
      origin: ['http://localhost:3000', 'https://mydomain.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  }
})
```

## 源码映射

### sourcemapIgnoreList

- **类型**: `false | (sourcePath: string, sourcemapPath: string) => boolean`
- **默认值**: `(sourcePath) => sourcePath.includes('node_modules')`
- **描述**: 源码映射忽略列表

```typescript
export default defineConfig({
  server: {
    sourcemapIgnoreList: (sourcePath) => {
      return sourcePath.includes('node_modules') || 
             sourcePath.includes('virtual:')
    }
  }
})
```

## 预加载配置

### preTransformRequests

- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 预热常用文件以提高初始页面加载速度

```typescript
export default defineConfig({
  server: {
    preTransformRequests: true  // 启用预转换请求
  }
})
```

## 完整配置示例

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  server: {
    // 基础配置
    host: '0.0.0.0',
    port: 3000,
    open: true,
    
    // HTTPS 配置
    https: {
      key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
    },
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'Authorization': 'Bearer token'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url)
          })
        }
      },
      
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true
      }
    },
    
    // CORS 配置
    cors: {
      origin: true,
      credentials: true
    },
    
    // 文件系统配置
    fs: {
      strict: false,
      allow: ['..', '../shared']
    },
    
    // 监听配置
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  }
})
```

## 环境变量配置

可以通过环境变量来覆盖服务器配置：

```bash
# .env.local
VITE_HOST=0.0.0.0
VITE_PORT=8080
VITE_HTTPS=true
```

```typescript
// launcher.config.ts
export default defineConfig({
  server: {
    host: process.env.VITE_HOST || 'localhost',
    port: parseInt(process.env.VITE_PORT || '3000'),
    https: process.env.VITE_HTTPS === 'true'
  }
})
```

## 开发服务器钩子

```typescript
export default defineConfig({
  plugins: [
    {
      name: 'dev-server-hooks',
      configureServer(server) {
        // 服务器创建后的钩子
        server.middlewares.use('/health', (req, res, next) => {
          res.statusCode = 200
          res.end('OK')
        })
      },
      
      configurePreviewServer(server) {
        // 预览服务器配置钩子
        server.middlewares.use('/api', myApiHandler)
      }
    }
  ]
})
```

## 调试配置

### 查看服务器配置

```bash
# 查看完整服务器配置
launcher config get server

# 查看特定配置项
launcher config get server.port
launcher config get server.proxy

# 启动时显示配置
launcher dev --debug
```

### 常见配置问题

#### 1. 端口冲突

```typescript
export default defineConfig({
  server: {
    port: 3000,
    strictPort: false,  // 端口被占用时自动尝试下一个端口
  }
})
```

#### 2. 代理不生效

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,  // 必须设置为 true
        secure: false,       // 如果目标是 https，设置为 false
        logLevel: 'debug',   // 启用代理日志
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url)
          })
        }
      }
    }
  }
})
```

#### 3. CORS 问题

```typescript
export default defineConfig({
  server: {
    cors: {
      origin: true,        // 允许所有源
      credentials: true,   // 允许携带 cookie
      optionsSuccessStatus: 200
    }
  }
})
```

---

**相关文档**:
- [构建配置](./build) - 生产构建设置
- [预览配置](./preview) - 预览服务器配置
- [Launcher 配置](./launcher) - 特有功能配置

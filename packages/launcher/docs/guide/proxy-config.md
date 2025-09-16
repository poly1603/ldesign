# 代理配置指南

@ldesign/launcher 提供了强大而灵活的代理配置功能，支持标准代理配置和简化代理配置两种方式。

## 概述

代理配置功能允许您：

- 解决开发环境的跨域问题
- 转发 API 请求到后端服务
- 代理静态资源请求
- 支持 WebSocket 代理
- 使用简化语法快速配置常见场景

## 标准代理配置

### 基本用法

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    proxy: {
      // 简单字符串代理
      '/api': 'http://localhost:8080',
      
      // 详细配置
      '/api/v2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v2/, '/api')
      }
    }
  }
})
```

### 高级配置

```typescript
export default defineConfig({
  server: {
    proxy: {
      // API 代理
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理错误:', err.message)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url)
          })
        }
      },
      
      // WebSocket 代理
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true,
        changeOrigin: true
      },
      
      // 正则表达式匹配
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      }
    }
  }
})
```

## 简化代理配置

为了简化常见代理场景的配置，launcher 提供了 `simpleProxy` 配置选项。

### API 代理

```typescript
export default defineConfig({
  simpleProxy: {
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api',           // 默认 '/api'
      rewrite: true,                // 自动移除路径前缀
      headers: {
        'X-Forwarded-Host': 'localhost'
      },
      timeout: 5000
    }
  }
})
```

等价于标准配置：

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'X-Forwarded-Host': 'localhost'
        },
        timeout: 5000
      }
    }
  }
})
```

### 静态资源代理

```typescript
export default defineConfig({
  simpleProxy: {
    assets: {
      target: 'http://localhost:9000',
      pathPrefix: '/assets',        // 默认 '/assets'
      cache: {
        maxAge: 3600,              // 缓存时间（秒）
        etag: true                 // 启用 ETag
      }
    }
  }
})
```

### WebSocket 代理

```typescript
export default defineConfig({
  simpleProxy: {
    websocket: {
      target: 'http://localhost:8080',  // 自动转换为 ws://
      pathPrefix: '/ws'                 // 默认 '/ws'
    }
  }
})
```

### 自定义代理规则

```typescript
export default defineConfig({
  simpleProxy: {
    custom: [
      {
        path: '/upload',
        target: 'http://localhost:9001',
        options: {
          timeout: 30000,
          headers: {
            'X-Upload-Service': 'true'
          }
        }
      },
      {
        path: /^\/mock\/.*/, // 支持正则表达式
        target: 'http://localhost:3001',
        options: {
          rewrite: (path) => path.replace(/^\/mock/, '')
        }
      }
    ]
  }
})
```

### 完整示例

```typescript
export default defineConfig({
  simpleProxy: {
    // API 代理
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api/v1',
      rewrite: true,
      headers: {
        'X-API-Version': 'v1'
      }
    },
    
    // 静态资源代理
    assets: {
      target: 'http://localhost:9000',
      pathPrefix: '/static',
      cache: {
        maxAge: 7200,
        etag: true
      }
    },
    
    // WebSocket 代理
    websocket: {
      target: 'ws://localhost:8080',
      pathPrefix: '/socket'
    },
    
    // 自定义规则
    custom: [
      {
        path: '/upload',
        target: 'http://localhost:9001'
      },
      {
        path: '/auth',
        target: 'http://localhost:8081',
        options: {
          changeOrigin: true,
          headers: {
            'X-Auth-Service': 'true'
          }
        }
      }
    ]
  }
})
```

## 配置合并

如果同时使用 `server.proxy` 和 `simpleProxy`，系统会自动合并配置：

1. `simpleProxy` 会被转换为标准代理配置
2. 转换后的配置与 `server.proxy` 进行合并
3. `server.proxy` 中的同名规则优先级更高

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080'  // 优先级高
      }
    }
  },
  simpleProxy: {
    api: {
      target: 'http://localhost:9000'    // 会被覆盖
    }
  }
})
```

## 环境特定代理配置

结合多环境配置系统，可以为不同环境设置不同的代理：

**开发环境** (`.ldesign/launcher.development.config.ts`):

```typescript
export default defineConfig({
  simpleProxy: {
    api: {
      target: 'http://localhost:8080',   // 本地开发服务器
      pathPrefix: '/api',
      headers: {
        'X-Environment': 'development'
      }
    }
  }
})
```

**生产环境** (`.ldesign/launcher.production.config.ts`):

```typescript
export default defineConfig({
  simpleProxy: {
    api: {
      target: 'https://api.production.com',  // 生产 API 服务器
      pathPrefix: '/api',
      headers: {
        'X-Environment': 'production'
      }
    }
  }
})
```

## 代理配置验证

系统会自动验证代理配置的有效性：

### 错误检测

- 无效的目标 URL
- 缺少必需的配置项
- 配置格式错误

### 警告提示

- WebSocket 代理使用 HTTP 协议
- HTTPS 目标禁用安全验证

### 调试信息

使用 `--debug` 参数查看代理配置的详细信息：

```bash
launcher dev --debug --environment development
```

## 常见场景

### 1. 微服务架构

```typescript
export default defineConfig({
  simpleProxy: {
    custom: [
      {
        path: '/user-service',
        target: 'http://localhost:8001'
      },
      {
        path: '/order-service', 
        target: 'http://localhost:8002'
      },
      {
        path: '/payment-service',
        target: 'http://localhost:8003'
      }
    ]
  }
})
```

### 2. 前后端分离

```typescript
export default defineConfig({
  simpleProxy: {
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api'
    },
    assets: {
      target: 'http://localhost:8080',
      pathPrefix: '/uploads'
    }
  }
})
```

### 3. 第三方服务集成

```typescript
export default defineConfig({
  simpleProxy: {
    custom: [
      {
        path: '/oauth',
        target: 'https://oauth.provider.com',
        options: {
          changeOrigin: true,
          secure: true
        }
      },
      {
        path: '/cdn',
        target: 'https://cdn.example.com',
        options: {
          changeOrigin: true
        }
      }
    ]
  }
})
```

## 故障排除

### 1. 代理不工作

- 检查目标服务器是否运行
- 确认代理配置语法正确
- 查看控制台错误信息

### 2. CORS 问题

```typescript
export default defineConfig({
  server: {
    cors: true,  // 启用 CORS
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true  // 修改请求来源
      }
    }
  }
})
```

### 3. WebSocket 连接失败

```typescript
export default defineConfig({
  simpleProxy: {
    websocket: {
      target: 'ws://localhost:8080',  // 确保使用 ws:// 协议
      pathPrefix: '/socket'
    }
  }
})
```

## 相关文档

- [多环境配置](./environment-config.md)
- [服务器配置](../config/server.md)
- [开发服务器指南](./dev-server.md)

# LDesign 智能代理配置指南

本文档详细说明了 LDesign Launcher 的智能代理配置系统。

## 🌟 特性概览

- **专业的服务类型配置**: 按服务类型组织代理配置，更加直观和专业
- **智能协议转换**: 自动处理 HTTP/WebSocket 协议转换
- **环境感知**: 根据环境自动调整配置和日志级别
- **类型安全**: 完整的 TypeScript 类型支持
- **向后兼容**: 支持标准 Vite 代理配置

## 🔧 基础配置

### 简单示例

```typescript
// launcher.config.ts
export default defineConfig({
  proxy: {
    // API 服务代理
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api',
      rewrite: true
    },

    // 静态资源代理
    assets: {
      target: 'http://localhost:9000',
      pathPrefix: '/assets'
    }
  }
})
```

### 完整配置示例

```typescript
// launcher.config.ts
export default defineConfig({
  proxy: {
    // API 服务代理
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Service': 'ldesign-api',
        'X-Version': 'v1'
      },
      timeout: 10000,
      auth: {
        username: 'api-user',
        password: 'api-pass'
      }
    },

    // 静态资源代理
    assets: {
      target: 'http://localhost:9000',
      pathPrefix: '/assets',
      cache: {
        maxAge: 3600, // 缓存时间（秒）
        etag: true
      }
    },

    // WebSocket 代理
    websocket: {
      target: 'http://localhost:8080', // 自动转换为 ws://
      pathPrefix: '/ws'
    },

    // 上传服务代理
    upload: {
      target: 'http://localhost:9001',
      pathPrefix: '/upload',
      timeout: 30000,
      maxFileSize: '100MB'
    },

    // 自定义代理规则
    custom: [
      {
        path: '/auth',
        target: 'http://localhost:8081',
        options: {
          headers: {
            'X-Auth-Service': 'oauth2'
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
    ],

    // 全局代理配置
    global: {
      timeout: 10000,
      verbose: true, // 是否显示详细日志
      secure: false, // 是否启用 HTTPS
      environment: 'development',
      headers: {
        'X-Client': 'ldesign-app'
      }
    }
  }
})
```

## 📋 服务类型详解

### 1. API 服务代理 (`api`)

**用途**: 代理 API 请求到后端服务

**配置选项**:
- `target`: 目标服务器地址
- `pathPrefix`: 路径前缀，默认 `/api`
- `rewrite`: 是否重写路径，移除前缀
- `headers`: 自定义请求头
- `timeout`: 请求超时时间（毫秒）
- `auth`: 认证配置

**示例**:
```typescript
api: {
  target: 'http://localhost:8080',
  pathPrefix: '/api/v1',
  rewrite: true,
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  timeout: 15000
}
```

**请求转换**:
- `/api/v1/users` → `http://localhost:8080/users`

### 2. 静态资源代理 (`assets`)

**用途**: 代理静态资源请求到 CDN 或文件服务器

**配置选项**:
- `target`: 目标服务器地址
- `pathPrefix`: 路径前缀，默认 `/assets`
- `cache`: 缓存配置
  - `maxAge`: 缓存时间（秒）
  - `etag`: 是否启用 ETag

**示例**:
```typescript
assets: {
  target: 'https://cdn.example.com',
  pathPrefix: '/static',
  cache: {
    maxAge: 86400, // 24小时
    etag: true
  }
}
```

**请求转换**:
- `/static/images/logo.png` → `https://cdn.example.com/images/logo.png`

### 3. WebSocket 代理 (`websocket`)

**用途**: 代理 WebSocket 连接

**配置选项**:
- `target`: 目标服务器地址（自动转换协议）
- `pathPrefix`: 路径前缀，默认 `/ws`

**示例**:
```typescript
websocket: {
  target: 'http://localhost:8080', // 自动转换为 ws://
  pathPrefix: '/socket'
}
```

**协议转换**:
- `http://` → `ws://`
- `https://` → `wss://`

### 4. 上传服务代理 (`upload`)

**用途**: 代理文件上传请求

**配置选项**:
- `target`: 目标服务器地址
- `pathPrefix`: 路径前缀，默认 `/upload`
- `timeout`: 请求超时时间（毫秒）
- `maxFileSize`: 最大文件大小

**示例**:
```typescript
upload: {
  target: 'http://upload.example.com',
  pathPrefix: '/files',
  timeout: 60000, // 60秒
  maxFileSize: '50MB'
}
```

### 5. 自定义代理规则 (`custom`)

**用途**: 灵活的自定义代理配置

**配置选项**:
- `path`: 匹配路径（字符串或正则表达式）
- `target`: 目标服务器地址
- `options`: 额外选项（标准 Vite 代理选项）

**示例**:
```typescript
custom: [
  {
    path: '/auth',
    target: 'http://auth.example.com',
    options: {
      changeOrigin: true,
      headers: {
        'X-Auth-Service': 'oauth2'
      }
    }
  },
  {
    path: /^\/v\d+\/.*/, // 匹配版本化 API
    target: 'http://api.example.com',
    options: {
      rewrite: (path) => path.replace(/^\/v\d+/, '')
    }
  }
]
```

## 🌍 环境配置

### 开发环境

```typescript
// launcher.development.config.ts
export default defineConfig({
  proxy: {
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Development': 'true'
      }
    },
    
    global: {
      verbose: true, // 显示详细日志
      secure: false,
      environment: 'development'
    }
  }
})
```

### 生产环境

```typescript
// launcher.production.config.ts
export default defineConfig({
  proxy: {
    api: {
      target: 'https://api.example.com',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Environment': 'production'
      }
    },
    
    global: {
      verbose: false, // 不显示详细日志
      secure: true, // 启用 SSL 验证
      environment: 'production'
    }
  }
})
```

## 🔍 调试和日志

### 启用详细日志

```typescript
proxy: {
  global: {
    verbose: true // 显示详细的代理日志
  }
}
```

### 日志输出示例

```
🔄 [DEVELOPMENT] API: GET /api/users
✅ [DEVELOPMENT] API: /api/users -> 200
🔌 [DEVELOPMENT] WebSocket 连接已建立
📤 [DEVELOPMENT] Upload: /upload/avatar
```

## 🚀 最佳实践

### 1. 环境变量配置

```typescript
proxy: {
  api: {
    target: process.env.VITE_API_URL || 'http://localhost:8080'
  },
  assets: {
    target: process.env.VITE_CDN_URL || 'http://localhost:9000'
  }
}
```

### 2. 错误处理

代理系统会自动处理常见错误，并提供详细的错误日志。

### 3. 性能优化

- 开发环境使用短缓存
- 生产环境使用长缓存
- 合理设置超时时间

### 4. 安全配置

- 生产环境启用 SSL 验证
- 使用环境变量管理敏感信息
- 配置适当的请求头

## 📚 迁移指南

### 从旧版本迁移

如果您使用的是旧的 `simpleProxy` 配置，系统会自动提供向后兼容支持，但建议迁移到新的专业配置格式：

```typescript
// 旧格式（仍然支持）
simpleProxy: {
  api: { ... }
}

// 新格式（推荐）
proxy: {
  api: { ... }
}
```

新格式更加专业、直观，并提供更好的类型支持和开发体验。

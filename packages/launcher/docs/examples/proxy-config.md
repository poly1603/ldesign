---
title: 代理配置
description: 常见 API 代理场景（路径改写、Cookie、WebSocket、CORS）与调试方法
---

# 代理配置

跨域与反向代理的配置与调试。

## 基础代理

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:7001'
    }
  }
})
```

## 路径改写 + 跨域

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7001',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, '')
      }
    }
  }
})
```

## WebSocket 代理

```ts
export default defineConfig({
  server: {
    proxy: {
      '/socket': {
        target: 'ws://127.0.0.1:6001',
        ws: true
      }
    }
  }
})
```

## Cookie 与跨域

```ts
export default defineConfig({
  server: {
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        cookieDomainRewrite: '127.0.0.1'
      }
    },
    cors: {
      origin: ['http://127.0.0.1:5173'],
      credentials: true
    }
  }
})
```

## 调试建议

- 启用 `--debug`，观察代理、HMR 相关日志
- 用浏览器 Network 面板查看请求是否被代理与响应头
- 确认后端允许跨域（CORS）、Cookie 与 WebSocket

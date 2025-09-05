---
title: 开发服务器指南
description: 启动选项、HMR 调试、代理配置（含 WebSocket/CORS/Cookie）、HTTPS 与常见问题
---

# 开发服务器指南

开发服务器提供 HMR、代理、CORS、HTTPS、自动打开浏览器等能力。

## 启动

- 命令行：`launcher dev --port 3000 --open`
- 配置文件：

```ts
export default defineConfig({
  server: { port: 3000, host: '127.0.0.1', open: true }
})
```

提示：本项目示例默认使用 127.0.0.1 作为本机地址，避免系统解析“localhost”带来的差异。

## 常用选项

- port: 端口（默认 3000）
- host: 主机（默认 127.0.0.1；设为 '0.0.0.0' 允许外部访问）
- open: 启动后自动打开浏览器
- https: 启用 HTTPS
- proxy: 反向代理配置
- hmr: 热更新配置（代理/跨网段时常用）

## HMR 调试

- 确认浏览器控制台无 HMR 连接报错（如 WebSocket 失败）
- 代理或容器网络下，建议指定 `server.hmr.port` 或 `server.hmr.host`
- 配合 `--debug` 查看详细日志

```ts
export default defineConfig({
  server: {
    hmr: {
      port: 24678,
      host: '127.0.0.1'
    }
  }
})
```

## 代理

最简：
```ts
export default defineConfig({
  server: {
    proxy: { '/api': 'http://127.0.0.1:7001' }
  }
})
```

高级：
```ts
export default defineConfig({
  server: {
    proxy: {
      // 基础代理 + 路径改写
      '/api': {
        target: 'http://127.0.0.1:7001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      // WebSocket 代理
      '/socket': {
        target: 'ws://127.0.0.1:6001',
        ws: true
      },
      // 携带 Cookie 的跨域代理
      '/auth': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        cookieDomainRewrite: '127.0.0.1'
      }
    }
  }
})
```

## CORS 与自定义请求头
```ts
export default defineConfig({
  server: {
    cors: {
      origin: ['http://127.0.0.1:5173'],
      credentials: true
    },
    headers: { 'X-Powered-By': '@ldesign/launcher' }
  }
})
```

## HTTPS

```ts
export default defineConfig({
  server: {
    https: false // 或提供 { key, cert }
  }
})
```

## 常见问题

- 端口被占用：使用 `--port` 或修改配置端口
- HMR 不生效：为代理/容器指定 `server.hmr.port/host`，必要时回退 full reload
- 无法外部访问：将 `host` 设为 `'0.0.0.0'` 并确认防火墙设置

更多见：[server 配置](../config/server.md) 与 [CLI dev](../cli/dev.md)。

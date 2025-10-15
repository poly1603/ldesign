---
layout: home

hero:
  name: "@ldesign/http"
  text: "现代化 HTTP 客户端"
  tagline: 功能强大、类型安全、开箱即用
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/http

features:
  - icon: 🎯
    title: 多适配器架构
    details: 支持 Fetch、Axios、Alova，自动选择最佳适配器，满足不同场景需求

  - icon: 🔧
    title: 强大拦截器
    details: 完整的请求/响应拦截器链，支持异步处理，灵活定制请求流程

  - icon: 💾
    title: 智能缓存
    details: 高级缓存系统，支持标签失效、依赖管理、LRU策略，提升应用性能

  - icon: 🔄
    title: 自动重试
    details: 智能重试机制，支持指数退避和自定义策略，确保请求可靠性

  - icon: 🛡️
    title: 错误恢复
    details: 内置错误恢复策略，自动处理网络异常和服务故障

  - icon: ⚡
    title: 并发控制
    details: 内置并发限制、请求去重和队列管理，优化资源使用

  - icon: 🎯
    title: TypeScript 优先
    details: 完整类型支持，丰富的类型工具，提供最佳开发体验

  - icon: 🌟
    title: Vue 3 深度集成
    details: 专为 Vue 3 设计的 Composition API，简化状态管理

  - icon: 📊
    title: 性能监控
    details: 内置统计分析和性能监控，实时追踪请求状态
---

## ⚡ 快速上手

### 安装

```bash
pnpm add @ldesign/http
```

### 基础使用

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端实例
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  cache: { enabled: true },
  retry: { enabled: true }
})

// 发送请求
const response = await client.get('/users')
console.log(response.data)
```

### Vue 3 集成

```typescript
// main.ts
import { createHttpPlugin } from '@ldesign/http'

app.use(createHttpPlugin({
  baseURL: 'https://api.example.com'
}))
```

```vue
<!-- 组件中使用 -->
<script setup>
import { useGet } from '@ldesign/http/vue'

const { data, loading, error } = useGet('/users')
</script>
```

## 🎯 主要特性

- **多适配器支持**：Fetch、Axios、Alova
- **智能缓存**：标签失效、依赖管理、LRU 策略
- **自动重试**：指数退避、自定义策略
- **并发控制**：请求去重、队列管理
- **拦截器系统**：请求/响应/错误拦截器
- **文件操作**：上传/下载进度、分片上传
- **错误处理**：自动恢复、错误分析
- **性能监控**：实时统计、慢请求检测
- **Vue 3 集成**：丰富的 Composables
- **TypeScript**：完整类型支持

## 📚 文档导航

- [快速开始](/guide/getting-started) - 5分钟快速上手
- [API 参考](/api/) - 完整 API 文档
- [Vue 集成](/vue/) - Vue 3 使用指南
- [示例](/examples/) - 实际应用示例

## 🤝 社区

- [GitHub](https://github.com/ldesign/http) - 源码和问题反馈
- [NPM](https://www.npmjs.com/package/@ldesign/http) - 包信息
- [讨论区](https://github.com/ldesign/http/discussions) - 提问和交流

## 📄 许可证

[MIT License](https://github.com/ldesign/http/blob/main/LICENSE)

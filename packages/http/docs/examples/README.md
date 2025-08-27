# 示例代码

本目录包含了 @ldesign/http 的各种使用示例，帮助你快速上手和了解最佳实践。

## 目录结构

```
examples/
├── basic.md              # 基础用法示例
├── advanced/             # 高级用法示例
│   ├── interceptors.md   # 拦截器示例
│   ├── caching.md        # 缓存示例
│   ├── retry.md          # 重试示例
│   └── error-handling.md # 错误处理示例
├── vue/                  # Vue 集成示例
│   ├── composition-api.md # Composition API 示例
│   ├── plugin.md         # 插件使用示例
│   └── state-management.md # 状态管理示例
├── real-world/           # 真实场景示例
│   ├── auth.md           # 认证示例
│   ├── file-upload.md    # 文件上传示例
│   ├── pagination.md     # 分页示例
│   └── websocket.md      # WebSocket 集成示例
└── typescript/           # TypeScript 示例
    ├── typed-client.md   # 类型化客户端
    └── api-layer.md      # API 层设计
```

## 快速开始

### 基础 HTTP 请求

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端
const http = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

// 发送 GET 请求
const users = await http.get('/users')
console.log(users.data)

// 发送 POST 请求
const newUser = await http.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
console.log(newUser.data)
```

### Vue 3 集成

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <ul v-else>
      <li v-for="user in data" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRequest } from '@ldesign/http'

interface User {
  id: number
  name: string
  email: string
}

const { data, loading, error } = useRequest<User[]>('/users', {
  immediate: true
})
</script>
```

## 示例分类

### 基础示例

适合初学者的简单示例：

- [基础用法](./basic.md) - 最基本的 HTTP 请求
- [配置选项](./basic.md#配置选项) - 客户端配置
- [请求方法](./basic.md#请求方法) - 各种 HTTP 方法

### 高级示例

展示高级功能的示例：

- [拦截器](./advanced/interceptors.md) - 请求/响应拦截器
- [缓存](./advanced/caching.md) - 请求缓存机制
- [重试](./advanced/retry.md) - 自动重试配置
- [错误处理](./advanced/error-handling.md) - 错误处理策略

### Vue 集成示例

Vue 3 特定的示例：

- [Composition API](./vue/composition-api.md) - Vue 3 hooks
- [插件使用](./vue/plugin.md) - Vue 插件集成
- [状态管理](./vue/state-management.md) - 与 Pinia/Vuex 集成

### 真实场景示例

实际项目中的使用场景：

- [用户认证](./real-world/auth.md) - 登录/注册/token 管理
- [文件上传](./real-world/file-upload.md) - 文件上传和进度监控
- [分页查询](./real-world/pagination.md) - 分页数据加载
- [WebSocket 集成](./real-world/websocket.md) - 与 WebSocket 结合使用

### TypeScript 示例

类型安全的示例：

- [类型化客户端](./typescript/typed-client.md) - 完整的类型定义
- [API 层设计](./typescript/api-layer.md) - 类型安全的 API 层

## 在线演示

你可以在以下平台查看和运行这些示例：

- [CodeSandbox](https://codesandbox.io/s/ldesign-http-examples) - 在线编辑器
- [StackBlitz](https://stackblitz.com/github/ldesign/http/tree/main/examples) - 在线 IDE
- [GitHub](https://github.com/ldesign/http/tree/main/examples) - 源代码

## 本地运行

### 克隆仓库

```bash
git clone https://github.com/ldesign/http.git
cd http/examples
```

### 安装依赖

```bash
pnpm install
```

### 运行示例

```bash
# 运行 Vue 示例
cd vue-example
pnpm dev

# 运行原生 JS 示例
cd vanilla-example
pnpm dev

# 运行 React 示例
cd react-example
pnpm dev
```

## 贡献示例

我们欢迎社区贡献更多示例！如果你有好的使用场景或最佳实践，请：

1. Fork 仓库
2. 创建新的示例文件
3. 添加详细的注释和说明
4. 提交 Pull Request

### 示例格式

每个示例应该包含：

```markdown
# 示例标题

## 概述
简要描述示例的用途和场景

## 完整代码
\`\`\`typescript
// 完整的可运行代码
\`\`\`

## 关键点解释
- 重点功能的解释
- 注意事项
- 最佳实践

## 相关文档
- [相关指南链接]
- [API 文档链接]
```

## 常见问题

### Q: 示例代码可以直接复制使用吗？

A: 是的，所有示例都是完整可运行的代码，你可以直接复制到你的项目中使用。

### Q: 如何适配我的项目需求？

A: 示例提供了基础模板，你可以根据具体需求进行修改。每个示例都包含了详细的注释说明。

### Q: 示例支持哪些环境？

A: 示例支持现代浏览器和 Node.js 环境，具体要求请查看各示例的说明。

### Q: 如何获取更多帮助？

A: 你可以：
- 查看 [完整文档](../guide/)
- 提交 [GitHub Issue](https://github.com/ldesign/http/issues)
- 参与 [社区讨论](https://github.com/ldesign/http/discussions)

## 下一步

- [基础示例](./basic.md) - 从基础示例开始
- [Vue 示例](./vue/) - 如果你使用 Vue 3
- [TypeScript 示例](./typescript/) - 如果你使用 TypeScript
- [API 文档](../api/) - 查看完整 API 参考

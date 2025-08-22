# @ldesign/http Vanilla JavaScript 示例

这个示例展示了如何在原生 JavaScript 项目中使用 `@ldesign/http` 库的各种功能。

## 🚀 快速开始

### 安装依赖

```bash
# 在示例目录中安装依赖
pnpm install

# 或者从根目录安装
cd ../../.. && pnpm install
```

### 运行示例

```bash
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

## 📋 功能演示

### 1. 基础 HTTP 请求

- **GET 请求**: 获取数据
- **POST 请求**: 创建新数据
- **PUT 请求**: 更新数据
- **DELETE 请求**: 删除数据

### 2. 拦截器系统

- **认证拦截器**: 自动添加 Authorization 头部
- **日志拦截器**: 记录请求和响应信息
- **响应时间拦截器**: 测量请求耗时
- **拦截器管理**: 动态添加和移除拦截器

### 3. 错误处理

- **网络错误**: 模拟网络连接失败
- **超时错误**: 模拟请求超时
- **HTTP 错误**: 模拟 4xx/5xx 状态码
- **重试机制**: 自动重试失败的请求

### 4. 缓存功能

- **内存缓存**: 缓存 GET 请求响应
- **缓存控制**: 启用/禁用缓存
- **缓存清理**: 手动清除缓存
- **缓存统计**: 显示缓存命中率

### 5. 并发控制

- **并发请求**: 同时发送多个请求
- **请求队列**: 管理请求队列
- **请求取消**: 取消进行中的请求
- **限流控制**: 控制并发请求数量

### 6. 自定义请求

- **灵活配置**: 自定义请求方法、URL、头部和数据
- **JSON 支持**: 自动处理 JSON 数据
- **错误处理**: 完整的错误处理机制

## 🔧 代码示例

### 基础用法

```javascript
import { createHttpClient } from '@ldesign/http'

// 创建客户端
const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 发送请求
const response = await http.get('/users')
console.log(response.data)
```

### 使用拦截器

```javascript
// 添加认证拦截器
http.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 添加响应拦截器
http.interceptors.response.use(
  (response) => {
    console.log('请求成功:', response)
    return response
  },
  (error) => {
    console.error('请求失败:', error)
    throw error
  }
)
```

### 启用缓存

```javascript
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000, // 5分钟缓存
  },
})

// 第一次请求从网络获取
const data1 = await http.get('/users')

// 第二次请求从缓存返回
const data2 = await http.get('/users') // 瞬间返回
```

### 错误处理

```javascript
try {
  const response = await http.get('/users')
  console.log(response.data)
}
catch (error) {
  if (error.isNetworkError) {
    console.error('网络错误:', error.message)
  }
  else if (error.isTimeoutError) {
    console.error('请求超时:', error.message)
  }
  else {
    console.error('其他错误:', error.message)
  }
}
```

## 📊 实时统计

示例页面显示以下实时统计信息：

- **活跃请求数**: 当前正在进行的请求数量
- **完成请求数**: 已完成的请求总数
- **缓存命中数**: 从缓存返回的请求数量
- **错误数量**: 发生错误的请求数量

## 🎯 学习要点

1. **模块化设计**: 了解如何组织和使用不同的功能模块
2. **拦截器模式**: 学习如何使用拦截器处理横切关注点
3. **错误处理**: 掌握完整的错误处理策略
4. **性能优化**: 了解缓存和并发控制的使用
5. **类型安全**: 体验 TypeScript 带来的类型安全

## 🔗 相关链接

- [完整文档](../../docs/README.md)
- [API 参考](../../docs/api.md)
- [Vue 3 示例](../vue3/README.md)
- [最佳实践](../../docs/best-practices.md)

## 💡 提示

- 打开浏览器开发者工具查看网络请求和控制台日志
- 尝试修改代码来测试不同的配置选项
- 查看源代码了解具体的实现细节
- 参考文档获取更多高级用法

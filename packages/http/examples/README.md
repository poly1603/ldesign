# @ldesign/http 示例项目

本目录包含两个功能完全一致的示例项目，展示了 `@ldesign/http` 库的所有核心功能。

## 📁 项目结构

```
examples/
├── vanilla/          # 原生 JavaScript 示例
│   ├── index.html    # 主页面
│   ├── main.js       # 主要逻辑
│   └── package.json  # 依赖配置
├── vue3/             # Vue 3 示例
│   ├── src/
│   │   ├── App.vue   # 主组件
│   │   └── main.ts   # 入口文件
│   ├── index.html    # HTML 模板
│   ├── package.json  # 依赖配置
│   └── vite.config.ts # Vite 配置
└── README.md         # 本文件
```

## 🚀 快速开始

### Vanilla JavaScript 示例

```bash
cd examples/vanilla
pnpm install
pnpm dev
```

### Vue 3 示例

```bash
cd examples/vue3
pnpm install
pnpm dev
```

## ✨ 功能展示

两个示例项目都包含以下完整功能模块：

### 1. 📊 实时统计面板
- **总请求数**: 显示已发送的请求总数
- **成功率**: 显示请求成功的百分比
- **平均响应时间**: 显示请求的平均响应时间
- **缓存命中率**: 显示缓存命中的百分比

### 2. 🚀 基础请求功能
- **GET 请求**: 获取数据
- **POST 请求**: 创建新数据
- **PUT 请求**: 更新完整数据
- **DELETE 请求**: 删除数据
- **PATCH 请求**: 部分更新数据

### 3. 🔧 适配器切换系统
- **Fetch API**: 现代浏览器原生支持
- **Axios**: 流行的HTTP客户端库
- **Alova**: 轻量级请求库
- **性能对比**: 比较不同适配器的性能表现

### 4. 🔧 拦截器系统
- **认证拦截器**: 自动添加Authorization头部
- **日志拦截器**: 记录请求和响应信息
- **响应时间拦截器**: 测量和记录响应时间
- **拦截器管理**: 动态添加和移除拦截器

### 5. 💾 智能缓存系统
- **缓存策略**:
  - LRU (最近最少使用)
  - LFU (最少使用频率)
  - FIFO (先进先出)
- **缓存控制**: 启用/禁用缓存
- **缓存测试**: 验证缓存命中效果
- **缓存清理**: 手动清除缓存数据

### 6. 🔄 智能重试系统
- **重试策略**:
  - 固定延迟
  - 指数退避
  - 线性增长
  - 自适应重试
- **断路器模式**: 防止级联故障
- **重试统计**: 查看重试次数和成功率

### 7. 📊 性能监控
- **实时监控**: 开始/停止性能监控
- **性能报告**: 生成详细的性能分析报告
- **数据清理**: 重置性能统计数据
- **可视化展示**: 直观显示性能指标

### 8. 🚀 高级功能
- **优先级请求**: 不同优先级的请求调度
- **批量请求**: 同时处理多个请求
- **流式请求**: 处理大数据量的流式响应
- **请求调度器**: 管理并发请求队列
- **并发控制**: 限制同时进行的请求数量

## 🎯 技术特点

### 共同特点
- **完全一致的功能**: 两个示例实现完全相同的功能
- **实时统计**: 动态更新请求统计信息
- **错误处理**: 完善的错误捕获和显示
- **响应式设计**: 适配不同屏幕尺寸
- **代码注释**: 详细的中文注释说明

### Vanilla JavaScript 特点
- **零依赖**: 除了 @ldesign/http 外无其他依赖
- **原生实现**: 使用原生 JavaScript 和 DOM API
- **模块化**: ES6 模块化代码组织
- **现代语法**: 使用 async/await 等现代特性

### Vue 3 特点
- **组合式API**: 使用 Vue 3 Composition API
- **响应式数据**: 利用 Vue 的响应式系统
- **组件化**: 单文件组件 (SFC) 开发
- **TypeScript**: 完整的 TypeScript 类型支持

## 🔍 代码亮点

### 统计跟踪
```javascript
// 自动跟踪请求统计
http.interceptors.request.use((config) => {
  stats.activeRequests++
  stats.totalRequests++
  return config
})

http.interceptors.response.use(
  (response) => {
    stats.activeRequests--
    stats.successfulRequests++
    if (response.fromCache) {
      stats.cacheHits++
    }
    return response
  },
  (error) => {
    stats.activeRequests--
    stats.failedRequests++
    throw error
  }
)
```

### 智能缓存测试
```javascript
// 测试缓存效果
const start1 = Date.now()
const response1 = await http.get('/posts/1')
const time1 = Date.now() - start1

const start2 = Date.now()
const response2 = await http.get('/posts/1')
const time2 = Date.now() - start2

console.log(`第一次请求: ${time1}ms (${response1.fromCache ? '缓存' : '网络'})`)
console.log(`第二次请求: ${time2}ms (${response2.fromCache ? '缓存' : '网络'})`)
```

### 拦截器管理
```javascript
// 动态添加认证拦截器
const authInterceptor = http.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  config.headers.Authorization = 'Bearer token-123'
  return config
})

// 移除拦截器
http.interceptors.request.eject(authInterceptor)
```

## 📚 学习路径

1. **基础使用**: 从基础请求开始，了解 HTTP 客户端的基本用法
2. **拦截器**: 学习如何使用拦截器处理请求和响应
3. **缓存系统**: 了解智能缓存如何提升应用性能
4. **错误处理**: 掌握重试机制和错误恢复策略
5. **性能优化**: 学习性能监控和并发控制
6. **高级特性**: 探索优先级请求、批量处理等高级功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进示例项目！

## 📄 许可证

MIT License

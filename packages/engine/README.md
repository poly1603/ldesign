<div align="center">

# LDesign Engine

![LDesign Engine Logo](./docs/assets/logo.svg)

**强大的 Vue3 应用引擎，提供插件化架构和完整的开发工具链**

[![npm version](https://img.shields.io/npm/v/@ldesign/engine.svg)](https://www.npmjs.com/package/@ldesign/engine)
[![npm downloads](https://img.shields.io/npm/dm/@ldesign/engine.svg)](https://www.npmjs.com/package/@ldesign/engine)
[![License](https://img.shields.io/npm/l/@ldesign/engine.svg)](https://github.com/ldesign/engine/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.3+-green.svg)](https://vuejs.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ldesign/engine/ci.yml)](https://github.com/ldesign/engine/actions)
[![Coverage](https://img.shields.io/codecov/c/github/ldesign/engine)](https://codecov.io/gh/ldesign/engine)

[📖 文档](https://ldesign.github.io/engine/) ·
[🚀 快速开始](https://ldesign.github.io/engine/guide/quick-start.html) ·
[🎯 示例](https://ldesign.github.io/engine/examples/) ·
[💬 讨论](https://github.com/ldesign/engine/discussions)

</div>

---

一个现代化、功能丰富的 Vue 3 应用程序引擎，为企业级应用提供完整的基础设施支持。

## 🎉 最新更新 - 通知系统全面升级

我们刚刚完成了通知系统的重大升级，带来了令人兴奋的新功能：

### 🎯 新增功能

- **🎪 多位置支持**: 6 个不同位置的通知显示（左上、上中、右上、左下、下中、右下）
- **🎨 平滑动画效果**: 5 种内置动画（滑入、淡入、弹跳、缩放、翻转），包含高度自适应
- **✨ 即时响应**: 通知消失时，其他通知立即开始平滑移动，提供即时视觉反馈
- **🌈 主题系统**: 浅色、深色、自动主题切换
- **🔘 操作按钮**: 支持自定义操作按钮和确认对话框
- **📊 进度通知**: 内置进度条显示
- **⏳ 加载状态**: 优雅的加载动画
- **🎯 高级交互**: 点击回调、关闭回调、显示回调
- **📦 批量管理**: 批量显示、分组管理
- **⭐ 优先级系统**: 通知优先级排序
- **📌 持久化选项**: 支持持久通知
- **📱 响应式设计**: 适配各种屏幕尺寸
- **♿ 无障碍支持**: 完整的键盘导航和屏幕阅读器支持

### 🎨 视觉体验

- **GPU 加速动画**: 基于 Web Animations API 的流畅动画
- **高度自适应**: 所有动画都包含平滑的高度变化
- **即时响应**: 其他通知立即开始移动，无需等待前一个通知完全消失
- **现代设计**: 毛玻璃效果、阴影和自适应颜色
- **自然缓动**: 使用贝塞尔曲线提供自然的动画感觉

### 🚀 快速体验

```typescript
import { createNotificationManager, createNotificationHelpers } from '@ldesign/engine'

// 创建通知管理器
const notificationManager = createNotificationManager()
const notifications = createNotificationHelpers(notificationManager)

// 显示不同类型的通知
notifications.success('操作成功！', '成功', {
  position: 'top-right',
  animation: 'bounce',
})

notifications.error('操作失败', '错误', {
  position: 'bottom-center',
  animation: 'shake',
  actions: [
    { label: '重试', style: 'primary', action: () => retry() },
    { label: '取消', style: 'secondary', action: () => cancel() },
  ],
})

// 进度通知
const progress = notifications.progress('正在上传...', 0)
// 更新进度...
progress.complete('上传完成！')

// 确认对话框
const confirmed = await notifications.confirm('确定要删除吗？')
```

[🎮 查看完整演示](./docs/examples/notification-demo.html)

## ✨ 为什么选择 LDesign Engine？

### 🎯 专注开发体验

- **TypeScript 优先** - 完整的类型支持和智能提示
- **热重载支持** - 快速开发迭代
- **丰富的调试工具** - 强大的开发者工具
- **详细的错误信息** - 快速定位问题

### 🔧 生产就绪

- **性能优化** - 内置性能监控和优化
- **安全防护** - 多层安全机制
- **错误处理** - 完善的错误捕获和报告
- **可扩展性** - 插件化架构支持无限扩展

### 📈 企业级特性

- **状态持久化** - 支持多种存储方式
- **多环境配置** - 灵活的配置管理
- **监控和分析** - 实时性能和用户行为分析
- **国际化支持** - 多语言和本地化

### 🤝 社区驱动

- **开源免费** - MIT 许可证
- **活跃社区** - 持续更新和维护
- **丰富生态** - 大量插件和扩展
- **专业支持** - 企业级技术支持

## 🚀 核心特性

### 🔌 插件化架构

模块化的插件系统，让你可以按需加载功能，保持应用轻量化的同时具备强大的扩展能力。

```typescript
const myPlugin = {
  name: 'my-plugin',
  install: engine => {
    // 插件逻辑
  },
}

engine.use(myPlugin)
```

### ⚡ 中间件系统

强大的中间件管道，支持请求/响应处理、权限验证、日志记录等横切关注点。

```typescript
const authMiddleware = {
  name: 'auth',
  handler: async (context, next) => {
    // 认证逻辑
    await next()
  },
}
```

### 📡 事件系统

基于发布订阅模式的事件系统，支持优先级、命名空间、一次性监听等高级功能。

```typescript
// 监听事件
engine.events.on('user:login', user => {
  console.log('用户登录:', user)
})

// 触发事件
engine.events.emit('user:login', userData)
```

### 💾 状态管理

响应式状态管理，支持模块化、持久化、历史记录、计算属性等功能。

```typescript
// 设置状态
engine.state.set('user.profile', userProfile)

// 监听状态变化
engine.state.subscribe('user.profile', newValue => {
  console.log('用户资料更新:', newValue)
})
```

### 🛡️ 安全管理

内置多层安全防护，包括 XSS 防护、CSRF 防护、内容安全策略等。

```typescript
// XSS 防护
const safeContent = engine.security.sanitize(userInput)

// CSRF 验证
const isValid = engine.security.validateCSRF(token)
```

### ⚡ 性能监控

实时性能监控和分析，帮助你优化应用性能，提供性能预算和自动优化建议。

```typescript
// 性能标记
engine.performance.mark('operation-start')
await performOperation()
engine.performance.mark('operation-end')

// 性能测量
engine.performance.measure('operation', 'operation-start', 'operation-end')
```

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/engine

# 使用 npm
npm install @ldesign/engine

# 使用 yarn
yarn add @ldesign/engine
```

### 基础使用

```typescript
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  config: {
    debug: true,
    appName: 'My Application',
    version: '1.0.0',
  },
})

// 创建 Vue 应用
const app = createApp(App)

// 使用引擎
app.use(engine)

// 挂载应用
app.mount('#app')
```

### 在组件中使用

```vue
<template>
  <div>
    <h1>{{ appName }}</h1>
    <p>用户: {{ user?.name || '未登录' }}</p>
    <button @click="login">登录</button>

    <!-- 使用内置指令 -->
    <input v-debounce="handleInput" placeholder="防抖输入" />
    <div v-loading="isLoading">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEngine } from '@ldesign/engine/vue'

const engine = useEngine()

const appName = computed(() => engine.config.appName)
const user = computed(() => engine.state.get('user.profile'))
const isLoading = ref(false)

const login = async () => {
  try {
    isLoading.value = true
    const userData = await loginUser()
    engine.state.set('user.profile', userData)
    engine.events.emit('user:login', userData)
    engine.notifications.success('登录成功')
  } catch (error) {
    engine.notifications.error('登录失败')
  } finally {
    isLoading.value = false
  }
}

const handleInput = (value: string) => {
  engine.logger.debug('输入内容:', value)
  engine.cache.set('user-input', value, 60000) // 缓存1分钟
}
</script>
```

## 📚 核心功能

### 🔌 插件系统

```typescript
// 创建自定义插件
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  install(engine) {
    // 插件安装逻辑
    engine.logger.info('我的插件已安装')
  },

  uninstall(engine) {
    // 插件卸载逻辑
    engine.logger.info('我的插件已卸载')
  },
}

// 注册插件
engine.plugins.register(myPlugin)

// 启用插件
engine.plugins.enable('my-plugin')
```

### 📡 事件系统

```typescript
// 监听事件
engine.events.on('user:login', user => {
  console.log('用户登录:', user)
})

// 触发事件
engine.events.emit('user:login', { id: 1, name: 'Alice' })

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('应用已准备就绪')
})

// 移除监听器
const unsubscribe = engine.events.on('data:update', handler)
unsubscribe() // 移除监听
```

### 💾 状态管理

```typescript
// 设置状态
engine.state.set('user.profile', {
  name: 'Alice',
  email: 'alice@example.com',
})

// 获取状态
const profile = engine.state.get('user.profile')

// 监听状态变化
engine.state.watch('user.profile', (newValue, oldValue) => {
  console.log('用户资料已更新:', newValue)
})

// 批量更新
engine.state.batch(() => {
  engine.state.set('user.name', 'Bob')
  engine.state.set('user.age', 30)
})
```

### 🔒 安全管理

```typescript
// HTML 清理
const result = engine.security.sanitizeHTML('<div>Safe</div><script>alert("xss")</script>')
console.log(result.sanitized) // '<div>Safe</div>'
console.log(result.safe) // false
console.log(result.threats) // ['Script tags detected']

// 输入验证
const isValidText = engine.security.validateInput('Hello World')
// 结果: true

const isValidHtml = engine.security.validateInput('<p>Safe HTML</p>', 'html')
// 结果: true

const isValidUrl = engine.security.validateInput('https://example.com', 'url')
// 结果: true

// CSRF 令牌
const csrfToken = engine.security.generateCSRFToken()
const isValidToken = engine.security.validateCSRFToken(csrfToken.token)
// 结果: true
```

### ⚡ 性能监控

```typescript
// 开始性能监控
engine.performance.startMonitoring()

// 添加性能标记
engine.performance.mark('operation-start')
await someAsyncOperation()
engine.performance.mark('operation-end')

// 测量性能
const duration = engine.performance.measure(
  'operation-duration',
  'operation-start',
  'operation-end'
)
console.log('操作耗时:', duration)

// 获取性能数据
const metrics = engine.performance.getMetrics()
console.log('性能指标:', metrics)

// 获取内存使用情况
const memoryInfo = engine.performance.getMemoryInfo()
console.log('内存使用:', memoryInfo)

// 停止监控
engine.performance.stopMonitoring()
```

## 🎯 高级功能

### 缓存管理

```typescript
// 基础缓存
engine.cache.set('user:123', userData, 3600000) // 缓存1小时
const user = engine.cache.get('user:123')

// 命名空间缓存
const userCache = engine.cache.namespace('users')
userCache.set('123', userData)

// 缓存策略
engine.cache.setStrategy('api-data', {
  maxSize: 1000,
  defaultTTL: 300000,
  evictionPolicy: 'lru',
})
```

### 指令系统

```vue
<template>
  <!-- 防抖处理 -->
  <input v-debounce:input="handleInput" placeholder="防抖输入" />

  <!-- 节流处理 -->
  <button v-throttle:click="handleClick">节流点击</button>

  <!-- 点击外部 -->
  <div v-click-outside="handleClickOutside">点击外部关闭</div>

  <!-- 自动聚焦 -->
  <input v-focus="shouldFocus" placeholder="自动聚焦" />

  <!-- 复制功能 -->
  <button v-copy="textToCopy">复制文本</button>

  <!-- 懒加载 -->
  <img v-lazy="handleLazyLoad" data-src="image.jpg" />

  <!-- 权限控制 -->
  <button v-permission="'admin'">管理员按钮</button>
  <div v-permission.hide="'user'">用户隐藏内容</div>
</template>
```

### 错误处理

```typescript
// 捕获错误
engine.errors.captureError(new Error('Something went wrong'))

// 获取所有错误
const errors = engine.errors.getErrors()
console.log('错误列表:', errors)

// 按类型获取错误
const networkErrors = engine.errors.getErrorsByType('NetworkError')

// 清除错误
engine.errors.clearErrors()

// 设置错误处理器
engine.errors.setErrorHandler(error => {
  console.error('全局错误处理:', error)

  // 发送错误报告
  sendErrorReport(error)
})

// 错误恢复
const recovered = engine.errors.recoverFromError('error-id')
console.log('恢复结果:', recovered)
```

## 📖 学习资源

### 📚 文档

- [📖 完整文档](https://ldesign.github.io/engine/) - 详细的使用指南和 API 参考
- [🚀 快速开始](https://ldesign.github.io/engine/guide/quick-start.html) - 5 分钟快速体验
- [📘 入门指南](https://ldesign.github.io/engine/guide/getting-started.html) - 详细的入门教程
- [📙 API 参考](https://ldesign.github.io/engine/api/) - 完整的 API 文档
- [📗 示例集合](https://ldesign.github.io/engine/examples/) - 丰富的使用示例
- [📕 最佳实践](https://ldesign.github.io/engine/guide/best-practices.html) - 开发最佳实践
- [⚡ 性能优化](https://ldesign.github.io/engine/guide/performance-optimization.html) - 性能优化指南

### 🎯 实战项目

- [📝 博客系统](https://ldesign.github.io/engine/examples/projects/blog.html) - 完整的博客应用
- [🛒 电商平台](https://ldesign.github.io/engine/examples/projects/ecommerce.html) - 电商系统实战
- [📊 管理后台](https://ldesign.github.io/engine/examples/projects/admin.html) - 后台管理系统
- [📈 数据大屏](https://ldesign.github.io/engine/examples/projects/dashboard.html) - 数据可视化

### 🌐 生态系统集成

- [🧭 Vue Router](./docs/ecosystem/vue-router.md) - 路由管理集成
- [🎨 Element Plus](./docs/ecosystem/element-plus.md) - UI 组件库集成
- [⚡ Vite](./docs/ecosystem/vite.md) - 构建工具集成

### 🧪 在线演示

运行示例项目查看所有功能的实际效果：

```bash
# 克隆项目
git clone https://github.com/ldesign/engine.git
cd engine/packages/engine

# 安装依赖
pnpm install

# 运行示例
pnpm run example:dev
```

访问 `http://localhost:5173` 查看演示页面。

## 🛠️ 开发指南

### 环境要求

- **Node.js** >= 16.0.0
- **pnpm** >= 7.0.0 (推荐) 或 npm >= 8.0.0
- **Vue** >= 3.3.0
- **TypeScript** >= 4.9.0 (可选，但推荐)

### 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式 (监听文件变化)
pnpm run dev

# 构建生产版本
pnpm run build

# 运行测试
pnpm run test

# 测试覆盖率
pnpm run test:coverage

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 文档开发服务器
pnpm run docs:dev

# 构建文档
pnpm run docs:build

# 示例项目开发
pnpm run example:dev
```

### 项目结构

```
packages/engine/
├── src/                    # 源代码
│   ├── core/              # 核心模块
│   ├── plugins/           # 插件系统
│   ├── middleware/        # 中间件系统
│   ├── state/             # 状态管理
│   ├── events/            # 事件系统
│   ├── cache/             # 缓存管理
│   ├── security/          # 安全管理
│   ├── performance/       # 性能监控
│   ├── notifications/     # 通知系统
│   ├── directives/        # 指令系统
│   ├── errors/            # 错误处理
│   └── types/             # 类型定义
├── docs/                  # 文档
├── example/               # 示例项目
├── tests/                 # 测试文件
└── dist/                  # 构建输出
```

## 🤝 参与贡献

我们欢迎所有形式的贡献！

### 贡献方式

- 🐛 [报告 Bug](https://github.com/ldesign/engine/issues/new?template=bug_report.md)
- 💡 [功能建议](https://github.com/ldesign/engine/issues/new?template=feature_request.md)
- 📖 [改进文档](https://github.com/ldesign/engine/blob/main/CONTRIBUTING.md)
- 💻 [提交代码](https://github.com/ldesign/engine/pulls)

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 开发
- 遵循 ESLint 规则
- 编写单元测试
- 更新相关文档

## 🌟 社区

### 获取帮助

- 📖 [官方文档](https://ldesign.github.io/engine/)
- 💬 [GitHub Discussions](https://github.com/ldesign/engine/discussions)
- 🏷️ [Stack Overflow](https://stackoverflow.com/questions/tagged/ldesign-engine)
- 📧 [邮件支持](mailto:support@ldesign.com)

### 社交媒体

- 🐦 [Twitter](https://twitter.com/ldesign_engine)
- 📘 [微信公众号](https://mp.weixin.qq.com/ldesign)
- 📺 [哔哩哔哩](https://space.bilibili.com/ldesign)

## 📊 项目状态

![GitHub stars](https://img.shields.io/github/stars/ldesign/engine?style=social)
![GitHub forks](https://img.shields.io/github/forks/ldesign/engine?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/ldesign/engine?style=social)

![GitHub issues](https://img.shields.io/github/issues/ldesign/engine)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ldesign/engine)
![GitHub last commit](https://img.shields.io/github/last-commit/ldesign/engine)

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和社区成员！

### 核心贡献者

- [@author1](https://github.com/author1) - 项目创始人
- [@author2](https://github.com/author2) - 核心开发者
- [@author3](https://github.com/author3) - 文档维护者

### 特别感谢

- [Vue.js](https://vuejs.org/) - 优秀的前端框架
- [TypeScript](https://www.typescriptlang.org/) - 强大的类型系统
- [Vite](https://vitejs.dev/) - 快速的构建工具

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

**让我们一起构建更好的 Vue 应用！** 🚀

[开始使用](https://ldesign.github.io/engine/guide/quick-start.html) ·
[加入社区](https://github.com/ldesign/engine/discussions) ·
[关注更新](https://github.com/ldesign/engine)

Made with ❤️ by [LDesign Team](https://github.com/ldesign)

</div>

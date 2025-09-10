---
layout: home

hero:
  name: '🚀 LDesign Engine'
  text: '让Vue3开发变得像喝咖啡一样简单'
  tagline: 一个强大而有趣的Vue3应用引擎，让你的代码像超级英雄一样拯救世界！
  image:
    src: /logo.svg
    alt: LDesign Engine
  actions:
    - theme: brand
      text: 🎯 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 🎪 查看示例
      link: /examples/basic
    - theme: alt
      text: 📚 API 文档
      link: /api/
    - theme: alt
      text: ⭐ GitHub
      link: https://github.com/ldesign/engine

features:
  - title: 🔌 插件化架构
    details: 像搭积木一样组装你的应用！模块化插件系统，支持热重载，让你的功能扩展变得像变魔术一样简单
  - title: ⚡ 中间件系统
    details: 强大的中间件管道，就像超级英雄的装备一样，处理请求、验证权限、记录日志，无所不能！
  - title: 📡 事件系统
    details: 强化的事件系统，支持命名空间、防抖节流、条件监听、事件管道，性能提升25-50倍，让你的组件通信像5G网络一样快速
  - title: 💾 状态管理
    details: 响应式状态管理，支持模块化和持久化，让你的数据像记忆一样可靠
  - title: 🛡️ 安全管理
    details: 内置多层安全防护，像超级英雄的护盾一样，保护你的应用免受XSS、CSRF等攻击
  - title: 📊 性能监控
    details: 实时性能监控，像体检报告一样详细，帮你发现性能瓶颈并自动优化
  - title: 💾 缓存管理
    details: 全新升级的智能缓存系统，支持预热、预加载、统计分析，性能提升10-20倍，让你的应用像光速一样快
  - title: 🎯 指令系统
    details: 丰富的Vue指令，防抖、节流、权限控制，让你的组件像瑞士军刀一样多功能
  - title: 📝 日志系统
    details: 结构化日志记录，支持多级别和格式化，让你的调试像侦探破案一样有趣
  - title: 🔔 通知管理
    details: 全局通知系统，支持多种类型和自定义样式，让你的用户反馈像烟花一样绚丽
  - title: ❌ 错误处理
    details: 全面的错误捕获和处理，像医生一样诊断问题并提供恢复方案
  - title: 🔧 开发工具
    details: 完整的开发体验，调试工具、热重载、TypeScript支持，让你的开发像游戏一样快乐
---

## 🎯 快速开始

### 📦 安装

```bash
# 使用 npm（推荐给传统派）
npm install @ldesign/engine

# 使用 pnpm（推荐给速度派）
pnpm add @ldesign/engine

# 使用 yarn（推荐给怀旧派）
yarn add @ldesign/engine
```

### 🚀 基础使用

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎实例（就像组装一台超级跑车）
const engine = createEngine({
  config: {
    debug: true, // 开启调试模式，像开了透视眼一样
    app: {
      name: 'My Awesome Vue3 App',
      version: '1.0.0'
    }
  },
})

// 创建Vue应用
const app = createApp(App)

// 安装引擎（就像给应用装上火箭推进器）
engine.install(app)

// 挂载应用（准备起飞！）
app.mount('#app')

// 体验新功能（像解锁超能力一样）
const userEvents = engine.events.namespace('user')
userEvents.on('login', (user) => console.log('用户登录:', user))

// 缓存预热（像给引擎预热一样）
await engine.cache.warmup([
  { key: 'config', loader: () => fetchConfig() }
])
```

### ⚙️ 使用预设配置

```typescript
import { createEngine, presets } from '@ldesign/engine'

// 开发环境预设（像开了上帝模式一样）
const engine = createEngine(presets.development())

// 生产环境预设（像穿了隐身衣一样）
const engine = createEngine(presets.production())
```

## 🎪 核心特性演示

### 🔌 插件系统

```typescript
// 创建插件（就像制作一个魔法道具）
const myPlugin = {
  name: 'my-awesome-plugin',
  install: (engine) => {
    // 插件逻辑
    engine.logger.info('🎉 插件安装成功！')
    
    // 添加一些有趣的功能
    engine.state.set('mood', 'happy')
  },
}

// 注册插件（激活魔法！）
engine.use(myPlugin)
```

### 🔄 中间件

```typescript
// 创建中间件（就像设置一个安全检查站）
const loggerMiddleware = {
  name: 'request-logger',
  handler: async (context, next) => {
    console.log('🚀 请求开始：', context.path)
    const startTime = Date.now()
    
    await next()
    
    const duration = Date.now() - startTime
    console.log(`✅ 请求完成，耗时：${duration}ms`)
  },
}

// 注册中间件
engine.middleware.use(loggerMiddleware)
```

### 💾 全局状态

```typescript
// 设置全局状态（就像在宇宙中放置一个信标）
engine.state.set('user', { 
  name: 'Super Developer', 
  level: 99,
  superpower: 'coding' 
})

// 获取状态（就像读取记忆一样）
const user = engine.state.get('user')

// 监听状态变化（就像安装了监控摄像头）
engine.state.watch('user', (newValue, oldValue) => {
  console.log('👀 用户状态变化：', newValue)
})
```

### 📡 事件管理

```typescript
// 监听事件（就像安装了一个超级监听器）
engine.events.on('user:login', (user) => {
  console.log('🎉 用户登录成功：', user.name)
  engine.notifications.show({
    type: 'success',
    title: '欢迎回来！',
    message: `你好，${user.name}！`
  })
})

// 发布事件（就像发送一个信号弹）
engine.events.emit('user:login', { 
  name: 'Super Developer',
  timestamp: Date.now()
})
```

## 🎯 为什么选择 LDesign Engine？

- **🎯 专注开发体验**：提供统一的API，让你的代码像诗歌一样优雅
- **🔧 开箱即用**：内置常用功能，就像瑞士军刀一样多功能
- **🚀 高性能**：基于Vue3响应式系统，性能像火箭一样快
- **📦 模块化设计**：插件化架构，按需加载，像乐高积木一样灵活
- **🛡️ 类型安全**：完整的TypeScript支持，让你的代码像堡垒一样坚固
- **📚 完善文档**：详细的文档和示例，让你学习像看漫画一样轻松

## 🎪 有趣的特性

### 🎭 智能错误处理
```typescript
// 引擎会自动捕获错误并显示友好的通知
try {
  // 你的代码
} catch (error) {
  // 引擎会自动处理，就像有一个贴心的助手
  engine.errors.capture(error)
}
```

### 🎨 主题系统
```typescript
// 支持动态主题切换，就像换衣服一样简单
engine.theme.set('dark') // 切换到暗黑模式
engine.theme.set('light') // 切换到明亮模式
```

### 🔔 智能通知
```typescript
// 支持多种通知类型，让你的用户反馈丰富多彩
engine.notifications.show({
  type: 'success',
  title: '🎉 操作成功！',
  message: '你的代码已经拯救了世界！'
})
```

## 🎪 社区

- [⭐ GitHub](https://github.com/ldesign/engine) - 给我们的项目点个星吧！
- [🐛 Issues](https://github.com/ldesign/engine/issues) - 报告bug或提出建议
- [💬 Discussions](https://github.com/ldesign/engine/discussions) - 加入我们的讨论

## 📄 许可证

[MIT](https://github.com/ldesign/engine/blob/main/LICENSE) - 像自由一样自由！

---

<div style="text-align: center; margin-top: 2rem; padding: 1rem; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
  <h3>🎉 准备好开始你的Vue3超级英雄之旅了吗？</h3>
  <p>让LDesign Engine成为你的超级装备，一起创造下一个伟大的应用！</p>
</div>

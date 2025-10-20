# 🚀 插件状态共享 - 快速参考

> 一页纸速查手册 - 常用操作和最佳实践

## 📋 基础用法

### 创建插件并共享状态

```typescript
import type { Plugin, PluginContext } from '@ldesign/engine/types'

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  dependencies: ['other-plugin'],  // 可选：声明依赖
  
  async install(context: PluginContext) {
    const { sharedState, logger } = context
    
    // 1. 创建公共状态
    const configRef = sharedState.createSharedState(
      'my-plugin',    // 插件名
      'config',       // 状态键
      { theme: 'blue' },  // 初始值
      {
        access: 'public',      // 访问级别
        persist: true,         // 持久化
        description: 'My config'
      }
    )
    
    // 2. 访问其他插件的状态
    const localeRef = sharedState.accessSharedState(
      'my-plugin',       // 当前插件
      'i18n-plugin',     // 目标插件
      'locale'           // 状态键
    )
    
    // 3. 监听状态变化
    sharedState.watchSharedState(
      'my-plugin',
      'i18n-plugin',
      'locale',
      (newLocale) => {
        logger.info(`Locale changed: ${newLocale}`)
      }
    )
    
    // 4. 发送消息
    sharedState.sendMessage(
      'my-plugin',  // 发送者
      '*',          // 接收者 ('*' = 广播)
      'MY_EVENT',   // 消息类型
      { data: 123 } // 消息数据
    )
    
    // 5. 监听消息
    sharedState.onMessage('my-plugin', (message) => {
      if (message.type === 'OTHER_EVENT') {
        // 处理消息
      }
    })
  }
}
```

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { useSharedState, useLocale } from '@ldesign/engine/vue'

// 方式 1: 使用快捷函数
const locale = useLocale()  // 访问 i18n-plugin 的 locale

// 方式 2: 使用通用函数
const theme = useSharedState('color-plugin', 'currentTheme')

// 直接修改
const changeLocale = (code: string) => {
  if (locale) locale.value = code
}
</script>

<template>
  <div>
    <p>Locale: {{ locale }}</p>
    <p>Theme: {{ theme }}</p>
    <button @click="changeLocale('en-US')">English</button>
  </div>
</template>
```

---

## 🔐 访问控制级别

| 级别 | 可访问者 | 使用场景 |
|------|---------|---------|
| `public` | 所有插件 | 全局配置、语言、主题 |
| `protected` | 所有者 + 依赖插件 | 内部配置、工具函数 |
| `private` | 仅所有者 | 敏感数据、临时状态 |

```typescript
// Public - 任何插件都可以访问
sharedState.createSharedState('plugin', 'locale', 'zh-CN', {
  access: 'public'
})

// Protected - 只有声明依赖的插件可访问
sharedState.createSharedState('plugin', 'internal', data, {
  access: 'protected'
})

// Private - 只有插件自己可访问
sharedState.createSharedState('plugin', 'secret', token, {
  access: 'private'
})
```

---

## 📨 消息通信模式

### 点对点通信

```typescript
// 发送者
sharedState.sendMessage('sender-plugin', 'receiver-plugin', 'ACTION', data)

// 接收者
sharedState.onMessage('receiver-plugin', (message) => {
  if (message.from === 'sender-plugin' && message.type === 'ACTION') {
    // 处理
  }
})
```

### 广播通信

```typescript
// 发送者
sharedState.sendMessage('sender-plugin', '*', 'BROADCAST_EVENT', data)

// 所有监听者都会收到
sharedState.onMessage('listener-plugin-1', handleMessage)
sharedState.onMessage('listener-plugin-2', handleMessage)
```

### 消息过滤

```typescript
sharedState.onMessage(
  'my-plugin',
  (message) => {
    // 处理消息
  },
  // 过滤器：只接收特定类型
  (message) => message.type.startsWith('USER_')
)
```

---

## 🔄 状态同步

### 双向同步

```typescript
// 同步多个插件的相同配置
sharedState.synchronize(
  ['plugin-a', 'plugin-b', 'plugin-c'],
  'sharedConfig',
  {
    bidirectional: true,  // 双向同步
    debounce: 300         // 防抖 300ms
  }
)

// 现在修改任意一个，其他自动同步
pluginA.config = newValue
// pluginB.config === newValue
// pluginC.config === newValue
```

### 单向桥接

```typescript
// 从源状态到目标状态，支持转换
sharedState.createBridge(
  'source-plugin',
  'sourceState',
  'target-plugin',
  'targetState',
  (value) => transformValue(value)  // 可选的转换函数
)
```

---

## 🧰 调试工具

### 查看依赖图

```typescript
const graph = engine.pluginSharedState.getDependencyGraph()
console.table(graph)
```

### 查看统计信息

```typescript
const stats = engine.pluginSharedState.getStats()
console.log(`
  Plugins: ${stats.totalPlugins}
  States: ${stats.totalSharedStates}
  Messages: ${stats.totalMessages}
  Memory: ${stats.memoryUsage}
`)
```

### 监听所有消息（调试）

```typescript
if (import.meta.env.DEV) {
  engine.pluginSharedState.onMessage('*', (msg) => {
    console.log(`[${msg.from}→${msg.to}] ${msg.type}`, msg.data)
  })
}
```

### 导出状态快照

```typescript
// 导出所有状态
const snapshot = engine.pluginSharedState.serialize()
console.log(snapshot)

// 恢复状态
engine.pluginSharedState.hydrate(snapshot)
```

---

## ⚡ 性能优化

### 使用浅响应

```typescript
// 对于大对象，使用浅响应避免深度监听
const dataRef = sharedState.getShallowRef('my-plugin', 'largeData')
```

### 防抖状态更新

```typescript
import { debounce } from '@ldesign/engine/utils'

const updateState = debounce((value) => {
  stateRef.value = value
}, 300)
```

### 批量更新

```typescript
sharedState.batch([
  { key: 'config.theme', value: 'dark' },
  { key: 'config.size', value: 'large' },
  { key: 'config.locale', value: 'en-US' }
])
```

---

## 🎯 常见模式

### 模式 1: 全局配置管理

```typescript
// config-plugin
const configPlugin: Plugin = {
  name: 'config-plugin',
  install(context) {
    const config = context.sharedState.createSharedState(
      'config-plugin',
      'appConfig',
      { theme: 'blue', size: 'medium', locale: 'zh-CN' },
      { access: 'public', persist: true }
    )
  }
}

// 其他插件访问
const config = sharedState.accessSharedState('my-plugin', 'config-plugin', 'appConfig')
```

### 模式 2: 主题系统

```typescript
// theme-plugin
const themePlugin: Plugin = {
  name: 'theme-plugin',
  dependencies: ['config-plugin'],
  install(context) {
    const theme = context.sharedState.createSharedState(
      'theme-plugin',
      'currentTheme',
      'blue',
      { access: 'public', persist: true }
    )
    
    // 当主题变化时通知所有插件
    watch(theme, (newTheme) => {
      context.sharedState.sendMessage(
        'theme-plugin',
        '*',
        'THEME_CHANGED',
        { theme: newTheme }
      )
    })
  }
}

// 其他插件响应主题变化
sharedState.onMessage('my-plugin', (msg) => {
  if (msg.type === 'THEME_CHANGED') {
    applyTheme(msg.data.theme)
  }
})
```

### 模式 3: 用户会话管理

```typescript
// auth-plugin
const authPlugin: Plugin = {
  name: 'auth-plugin',
  install(context) {
    const user = context.sharedState.createSharedState(
      'auth-plugin',
      'currentUser',
      null,
      { access: 'public', persist: false }  // 不持久化敏感信息
    )
    
    const login = async (credentials) => {
      const userData = await loginAPI(credentials)
      user.value = userData
      
      // 通知其他插件
      context.sharedState.sendMessage(
        'auth-plugin',
        '*',
        'USER_LOGIN',
        { user: userData }
      )
    }
  }
}
```

---

## ✅ 最佳实践清单

### ✅ DO

- ✅ 明确声明插件依赖关系
- ✅ 使用合适的访问级别（public/protected/private）
- ✅ 为状态添加描述信息
- ✅ 使用消息总线进行松耦合通信
- ✅ 启用持久化保存重要状态
- ✅ 使用调试工具监控状态流动
- ✅ 编写单元测试验证状态共享

### ❌ DON'T

- ❌ 不要绕过 sharedState 直接操作
- ❌ 不要创建循环依赖
- ❌ 不要在 public 状态中存储敏感信息
- ❌ 不要过度使用消息广播
- ❌ 不要忘记清理事件监听器
- ❌ 不要在生产环境启用详细日志

---

## 🔍 故障排查

### 问题：状态访问返回 undefined

```typescript
// 检查 1: 插件是否注册
console.log(engine.plugins.has('target-plugin'))

// 检查 2: 依赖关系是否声明
console.log(myPlugin.dependencies)  // 应包含 'target-plugin'

// 检查 3: 访问权限是否足够
const graph = engine.pluginSharedState.getDependencyGraph()
console.log(graph)
```

### 问题：状态更新不响应

```typescript
// 检查 1: 是否正确使用 Ref
console.log(isRef(stateRef))  // 应该是 true

// 检查 2: watcher 是否设置
sharedState.watchSharedState('my-plugin', 'target-plugin', 'state', () => {
  console.log('State changed')  // 应该触发
})

// 检查 3: 查看消息流
engine.pluginSharedState.onMessage('*', (msg) => {
  console.log('Message:', msg)
})
```

### 问题：性能问题

```typescript
// 检查 watcher 数量
const stats = engine.pluginSharedState.getStats()
console.log('Total watchers:', stats.totalWatchers)

// 检查内存使用
console.log('Memory usage:', stats.memoryUsage)

// 使用性能分析
const start = performance.now()
stateRef.value = newValue
const duration = performance.now() - start
console.log('Update took:', duration, 'ms')
```

---

## 📚 更多资源

- 📖 [完整迁移指南](./plugin-state-migration-guide.md)
- 📊 [方案对比分析](./plugin-state-comparison.md)
- 🔍 [深度分析报告](./PLUGIN_STATE_SHARING_ANALYSIS.md)
- 💻 [示例代码](../examples/shared-state-demo.ts)
- 📘 [API 文档](./enhanced-features.md)

---

**快速开始**: 复制上面的基础用法代码，替换插件名和状态键即可！🚀








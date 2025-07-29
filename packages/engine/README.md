# @ldesign/engine

LDesign核心引擎 - 提供插件系统和基础架构

## 特性

- 🔌 **插件系统** - 完整的插件生命周期管理
- 🚀 **事件总线** - 高效的事件通信机制
- 🔄 **生命周期** - 完善的生命周期钩子
- 🎯 **Vue集成** - 原生Vue 3支持
- 📦 **TypeScript** - 完整的类型定义
- 🧪 **测试覆盖** - 全面的单元测试

## 安装

```bash
npm install @ldesign/engine
# 或
pnpm add @ldesign/engine
# 或
yarn add @ldesign/engine
```

## 基础用法

### 创建引擎实例

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine({
  debug: true,
  plugins: [
    {
      plugin: myPlugin,
      options: { /* 插件配置 */ }
    }
  ]
})

// 启动引擎
await engine.start()
```

### Vue集成

```typescript
import { createApp } from 'vue'
import LDesignEngine from '@ldesign/engine'
import App from './App.vue'

const app = createApp(App)

// 安装LDesign引擎插件
app.use(LDesignEngine, {
  debug: true,
  autoStart: true
})

app.mount('#app')
```

### 在组件中使用

```vue
<template>
  <div>
    <h1>LDesign Engine Demo</h1>
    <button @click="loadPlugin">加载插件</button>
  </div>
</template>

<script setup>
import { useEngine, useEventBus } from '@ldesign/engine'

const engine = useEngine()
const eventBus = useEventBus()

// 监听事件
eventBus.on('plugin:loaded', (plugin) => {
  console.log('插件已加载:', plugin.name)
})

const loadPlugin = async () => {
  await engine.use({
    name: 'demo-plugin',
    version: '1.0.0',
    install(engine) {
      console.log('Demo插件已安装')
      engine.eventBus.emit('plugin:loaded', this)
    }
  })
}
</script>
```

## 插件开发

### 简单插件

```typescript
import { createPlugin } from '@ldesign/engine'

const myPlugin = createPlugin(
  'my-plugin',
  '1.0.0',
  (engine, options) => {
    // 插件安装逻辑
    console.log('插件安装完成', options)
    
    // 监听引擎事件
    engine.eventBus.on('engine:started', () => {
      console.log('引擎已启动')
    })
  },
  {
    description: '我的第一个插件',
    dependencies: ['other-plugin'],
    uninstaller: (engine) => {
      // 插件卸载逻辑
      console.log('插件已卸载')
    }
  }
)
```

### 类式插件

```typescript
import { BasePlugin, Plugin } from '@ldesign/engine'

@Plugin({
  name: 'my-class-plugin',
  version: '1.0.0',
  description: '类式插件示例'
})
class MyClassPlugin extends BasePlugin {
  protected async onInstall(engine, options) {
    // 插件安装逻辑
    this.logger.info('类式插件安装完成')
    
    // 注册生命周期钩子
    engine.lifecycle.hook('started', () => {
      this.logger.info('引擎已启动')
    })
  }
  
  protected async onUninstall(engine) {
    // 插件卸载逻辑
    this.logger.info('类式插件已卸载')
  }
}

export default new MyClassPlugin()
```

## API参考

### Engine

#### 方法

- `use(plugin, options?)` - 安装插件
- `unuse(pluginName)` - 卸载插件
- `getPlugin(name)` - 获取插件
- `getPlugins()` - 获取所有插件
- `start()` - 启动引擎
- `stop()` - 停止引擎
- `destroy()` - 销毁引擎
- `getState()` - 获取引擎状态

#### 属性

- `version` - 引擎版本
- `eventBus` - 事件总线
- `lifecycle` - 生命周期管理器
- `app` - Vue应用实例（如果有）

### EventBus

#### 方法

- `on(event, handler)` - 监听事件
- `once(event, handler)` - 监听一次事件
- `off(event, handler?)` - 取消监听
- `emit(event, ...args)` - 触发事件
- `clear()` - 清空所有监听器

### Lifecycle

#### 方法

- `hook(phase, handler)` - 注册生命周期钩子
- `execute(phase, ...args)` - 执行生命周期钩子
- `getCurrentPhase()` - 获取当前阶段

#### 生命周期阶段

- `before:start` - 启动前
- `starting` - 启动中
- `started` - 已启动
- `before:stop` - 停止前
- `stopping` - 停止中
- `stopped` - 已停止
- `before:destroy` - 销毁前
- `destroying` - 销毁中
- `destroyed` - 已销毁

## 工具函数

```typescript
import {
  deepClone,
  deepMerge,
  debounce,
  throttle,
  retry,
  delay,
  generateId,
  validatePlugin,
  validateEngineConfig
} from '@ldesign/engine'

// 深度克隆
const cloned = deepClone(originalObject)

// 防抖
const debouncedFn = debounce(() => {
  console.log('防抖执行')
}, 300)

// 重试
const result = await retry(async () => {
  // 可能失败的异步操作
}, 3, 1000)
```

## 许可证

MIT License
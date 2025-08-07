# 🎨 LDesign App - 统一应用启动器

> 一个现代化的 Vue 3 应用启动器，统一集成所有 LDesign 模块，让你的应用开发变得简单而强大！

## ✨ 特性

- 🚀 **一键启动** - 只需几行代码即可启动完整的 LDesign 应用
- 🧩 **模块化集成** - 自动集成所有 LDesign 模块（engine、color、crypto、device、http、i18n 等）
- ⚙️ **灵活配置** - 支持选择性启用/禁用模块，自定义配置
- 🎯 **类型安全** - 完整的 TypeScript 类型定义
- 📱 **响应式设计** - 自动适配移动端和桌面端
- 🎨 **主题系统** - 内置主题管理，支持亮色/暗色模式切换
- 🔐 **安全加密** - 集成加密解密功能
- 🌐 **国际化** - 多语言支持
- 📡 **HTTP 请求** - 统一的 API 请求管理
- 📱 **设备检测** - 智能设备信息检测

## 🚀 快速开始

### 安装

```bash
npm install @ldesign/app
# 或
pnpm add @ldesign/app
# 或
yarn add @ldesign/app
```

### 最简单的使用方式

```typescript
import { quickStart } from '@ldesign/app'

// 一行代码启动完整的 LDesign 应用！
quickStart('#app')
```

### 自定义配置

```typescript
import { createApp } from '@ldesign/app'
import MyApp from './MyApp.vue'

const app = createApp(MyApp, {
  appName: 'My Awesome App',
  version: '1.0.0',
  debug: true,
  modules: {
    engine: true,
    color: true,
    crypto: true,
    device: true,
    http: true,
    i18n: true,
    router: false,  // 可选择性禁用
    store: false,
    template: false
  },
  moduleConfig: {
    color: {
      defaultTheme: 'blue',
      defaultMode: 'light'
    },
    http: {
      baseURL: 'https://api.example.com',
      timeout: 5000
    },
    i18n: {
      defaultLocale: 'zh-CN',
      fallbackLocale: 'en-US'
    }
  }
})

app.mount('#app')
```

## 📖 API 文档

### `quickStart(selector?: string)`

最简单的启动方式，使用默认配置启动应用。

**参数：**
- `selector` (可选): 挂载元素选择器，默认为 `'#app'`

**返回：** `LDesignApp` 实例

### `createApp(rootComponent, options?)`

自定义配置启动应用。

**参数：**
- `rootComponent`: Vue 根组件
- `options`: 配置选项

**配置选项：**

```typescript
interface LDesignAppOptions {
  appName?: string          // 应用名称
  version?: string          // 应用版本
  description?: string      // 应用描述
  debug?: boolean          // 是否启用调试模式
  
  // 模块开关
  modules?: {
    engine?: boolean
    color?: boolean
    crypto?: boolean
    device?: boolean
    http?: boolean
    i18n?: boolean
    router?: boolean
    store?: boolean
    template?: boolean
  }
  
  // 模块配置
  moduleConfig?: {
    color?: {
      defaultTheme?: string
      defaultMode?: 'light' | 'dark'
      autoDetect?: boolean
    }
    crypto?: {
      defaultAlgorithm?: string
      keySize?: number
    }
    device?: {
      enableBattery?: boolean
      enableGeolocation?: boolean
      enableNetwork?: boolean
    }
    http?: {
      baseURL?: string
      timeout?: number
    }
    i18n?: {
      defaultLocale?: string
      fallbackLocale?: string
    }
  }
  
  // 事件回调
  onModuleIntegrated?: (moduleName: string) => void
  onError?: (moduleName: string, error: Error) => void
}
```

### `LDesignApp` 实例方法

```typescript
interface LDesignApp {
  engine: any                    // 引擎实例
  vueApp: VueApp                // Vue 应用实例
  mount: (selector: string) => void      // 挂载应用
  unmount: () => void                    // 卸载应用
  getModuleStatus: () => Record<string, boolean>  // 获取模块状态
}
```

## 🎯 使用示例

### 基础示例

```vue
<template>
  <div class="my-app">
    <h1>{{ $t('app.title', '我的应用') }}</h1>
    <button @click="switchTheme">切换主题</button>
    <button @click="encryptData">加密数据</button>
  </div>
</template>

<script setup lang="ts">
import { useTheme, useCrypto } from '@ldesign/app'

const { toggleMode } = useTheme()
const { encryptAES } = useCrypto()

const switchTheme = () => {
  toggleMode()
}

const encryptData = async () => {
  const result = await encryptAES('Hello World', 'my-key')
  console.log('加密结果:', result)
}
</script>
```

### 完整配置示例

```typescript
import { createApp } from '@ldesign/app'
import App from './App.vue'

const app = createApp(App, {
  appName: 'LDesign Demo',
  version: '2.0.0',
  debug: process.env.NODE_ENV === 'development',
  
  modules: {
    engine: true,
    color: true,
    crypto: true,
    device: true,
    http: true,
    i18n: true,
    router: false,
    store: false,
    template: false
  },
  
  moduleConfig: {
    color: {
      defaultTheme: 'blue',
      defaultMode: 'light',
      autoDetect: true
    },
    crypto: {
      defaultAlgorithm: 'aes',
      keySize: 256
    },
    device: {
      enableBattery: true,
      enableGeolocation: false,
      enableNetwork: true
    },
    http: {
      baseURL: 'https://api.myapp.com',
      timeout: 10000
    },
    i18n: {
      defaultLocale: 'zh-CN',
      fallbackLocale: 'en-US'
    }
  },
  
  onModuleIntegrated: (moduleName) => {
    console.log(`✅ ${moduleName} 模块已集成`)
  },
  
  onError: (moduleName, error) => {
    console.error(`❌ ${moduleName} 模块集成失败:`, error)
  }
})

app.mount('#app')

// 获取模块状态
console.log('模块状态:', app.getModuleStatus())
```

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建库
pnpm build:lib

# 运行测试
pnpm test

# 类型检查
pnpm type-check
```

## 📦 包含的模块

- **@ldesign/engine** - 核心引擎系统
- **@ldesign/color** - 主题色彩管理
- **@ldesign/crypto** - 加密解密功能
- **@ldesign/device** - 设备检测适配
- **@ldesign/http** - HTTP 请求管理
- **@ldesign/i18n** - 国际化多语言
- **@ldesign/router** - 路由导航系统
- **@ldesign/store** - 状态管理系统
- **@ldesign/template** - 模板渲染系统

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

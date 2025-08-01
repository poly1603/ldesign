# 快速开始

本指南将帮助您快速上手 LDesign Vue引擎，从安装到创建第一个应用。

## 环境要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **Vue**: >= 3.3.0
- **TypeScript**: >= 5.0.0 (可选，但推荐)

## 安装

### 使用包管理器安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/engine
```

```bash [npm]
npm install @ldesign/engine
```

```bash [yarn]
yarn add @ldesign/engine
```

:::

### 安装其他核心包

根据您的需求，可以安装其他核心包：

```bash
# 路由系统
pnpm add @ldesign/router

# HTTP请求库
pnpm add @ldesign/http

# 加密工具
pnpm add @ldesign/crypto

# 设备检测
pnpm add @ldesign/device

# 模板系统
pnpm add @ldesign/template

# 颜色工具
pnpm add @ldesign/color

# 国际化
pnpm add @ldesign/i18n
```

## 创建第一个应用

### 1. 基础设置

创建一个新的Vue项目或在现有项目中集成LDesign：

```typescript
// main.ts
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import App from './App.vue'

// 创建LDesign引擎
const engine = createEngine({
  // 引擎配置
  debug: true, // 开发模式下启用调试
  performance: true // 启用性能监控
})

// 创建Vue应用
const app = engine.createApp(App)

// 挂载应用
app.mount('#app')
```

### 2. 添加路由

```typescript
// main.ts
import { createEngine } from '@ldesign/engine'
import { createRouter } from '@ldesign/router'
import App from './App.vue'
import Home from './views/Home.vue'
import About from './views/About.vue'

// 创建路由
const router = createRouter({
  history: 'hash', // 或 'history'
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})

// 创建引擎并安装路由
const engine = createEngine()
engine.use(router)

const app = engine.createApp(App)
app.mount('#app')
```

### 3. 配置HTTP客户端

```typescript
// main.ts
import { createEngine } from '@ldesign/engine'
import { createHttpClient } from '@ldesign/http'

// 创建HTTP客户端
const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  interceptors: {
    request: [
      // 请求拦截器
      (config) => {
        // 添加认证头
        config.headers.Authorization = `Bearer ${getToken()}`
        return config
      }
    ],
    response: [
      // 响应拦截器
      (response) => {
        return response.data
      },
      (error) => {
        console.error('请求失败:', error)
        return Promise.reject(error)
      }
    ]
  }
})

// 创建引擎并安装HTTP客户端
const engine = createEngine()
engine.use(http)

function getToken() {
  return localStorage.getItem('token') || ''
}
```

## 应用模板

### App.vue

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
    </nav>
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// 可以在这里使用LDesign的composables
import { useEngine } from '@ldesign/engine'

const engine = useEngine()
console.log('引擎实例:', engine)
</script>

<style scoped>
nav {
  padding: 20px;
  background: #f5f5f5;
}

nav a {
  margin-right: 10px;
  text-decoration: none;
  color: #1890ff;
}

nav a:hover {
  text-decoration: underline;
}

main {
  padding: 20px;
}
</style>
```

### Home.vue

```vue
<template>
  <div class="home">
    <h1>欢迎使用 LDesign</h1>
    <p>这是一个基于Vue3的现代化前端开发引擎</p>
    
    <div class="features">
      <div class="feature">
        <h3>🚀 高性能</h3>
        <p>基于Vue3构建，提供卓越的性能表现</p>
      </div>
      
      <div class="feature">
        <h3>🔧 插件化</h3>
        <p>完整的插件系统，支持按需加载</p>
      </div>
      
      <div class="feature">
        <h3>📱 跨平台</h3>
        <p>支持多种平台和设备类型</p>
      </div>
    </div>
    
    <button @click="fetchData">获取数据</button>
    <div v-if="loading">加载中...</div>
    <div v-else-if="data">{{ data }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHttp } from '@ldesign/http'

const http = useHttp()
const loading = ref(false)
const data = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const result = await http.get('/api/data')
    data.value = result
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home {
  text-align: center;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.feature {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.feature h3 {
  margin: 0 0 10px 0;
  color: #1890ff;
}

button {
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #40a9ff;
}
</style>
```

## 配置选项

### 引擎配置

```typescript
const engine = createEngine({
  // 调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 性能监控
  performance: {
    enabled: true,
    thresholds: {
      responseTime: 1000,
      fps: 30,
      memory: 100 * 1024 * 1024 // 100MB
    }
  },
  
  // 缓存配置
  cache: {
    strategy: 'lru',
    maxSize: 100,
    ttl: 5 * 60 * 1000 // 5分钟
  },
  
  // 安全配置
  security: {
    xss: true,
    csrf: true,
    csp: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"]
      }
    }
  },
  
  // 错误处理
  errorHandler: (error, instance, info) => {
    console.error('应用错误:', error, info)
    // 可以发送错误到监控服务
  }
})
```

## TypeScript 支持

LDesign 提供完整的 TypeScript 支持。创建类型声明文件：

```typescript
// types/ldesign.d.ts
import type { Engine } from '@ldesign/engine'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $engine: Engine
  }
}

export {}
```

## 下一步

现在您已经成功创建了第一个 LDesign 应用！接下来可以：

- [了解插件系统](./plugins) - 学习如何使用和创建插件
- [探索核心包](../packages/) - 深入了解各个核心包的功能
- [查看示例项目](../examples/) - 学习最佳实践和高级用法
- [性能优化指南](./performance) - 优化应用性能

## 常见问题

### Q: 如何在现有Vue项目中集成LDesign？

A: 只需要将 `createApp` 替换为 `engine.createApp` 即可：

```typescript
// 之前
const app = createApp(App)

// 现在
const engine = createEngine()
const app = engine.createApp(App)
```

### Q: 是否支持Vue 2？

A: LDesign 专为 Vue 3 设计，不支持 Vue 2。如果您使用的是 Vue 2，建议先升级到 Vue 3。

### Q: 如何启用调试模式？

A: 在创建引擎时设置 `debug: true`：

```typescript
const engine = createEngine({
  debug: true
})
```

### Q: 如何自定义错误处理？

A: 可以在引擎配置中设置自定义错误处理器：

```typescript
const engine = createEngine({
  errorHandler: (error, instance, info) => {
    // 自定义错误处理逻辑
    console.error('错误:', error)
    // 发送到错误监控服务
    errorReporting.captureException(error)
  }
})
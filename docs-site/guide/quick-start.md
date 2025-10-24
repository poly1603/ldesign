# 快速开始

本指南将帮助你快速上手 LDesign，从安装到创建第一个应用。

## 环境准备

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0（推荐）或 npm >= 9.0.0
- **Git** >= 2.30.0
- 现代浏览器（Chrome、Firefox、Safari、Edge 的最新版本）

### 安装 pnpm（推荐）

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 corepack（Node.js 16.13+ 自带）
corepack enable
corepack prepare pnpm@latest --activate
```

## 快速体验

### 方式一：使用 CLI 创建项目（推荐）

```bash
# 安装 LDesign CLI
npm install -g @ldesign/cli

# 创建新项目
ldesign create my-app

# 选择项目模板
? 选择项目模板 › 
❯ Vue 3 + TypeScript
  React + TypeScript  
  Vanilla TypeScript
  自定义配置

# 进入项目目录
cd my-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 方式二：手动安装

#### 1. 创建 Vue 3 项目

```bash
# 使用 Vite 创建项目
pnpm create vite my-app --template vue-ts

# 进入项目目录
cd my-app

# 安装依赖
pnpm install
```

#### 2. 安装 LDesign 包

```bash
# 安装你需要的包
pnpm add @ldesign/cache @ldesign/http @ldesign/store

# 安装开发依赖
pnpm add -D @ldesign/config
```

#### 3. 配置项目

创建或更新 `vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVueViteConfig } from '@ldesign/config/vite'

export default defineConfig({
  ...createVueViteConfig(),
  plugins: [vue()]
})
```

更新 `tsconfig.json`：

```json
{
  "extends": "@ldesign/config/tsconfig.vue.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 第一个示例

### 使用缓存管理器

```vue
<template>
  <div class="app">
    <h1>LDesign Cache 示例</h1>
    
    <div class="form">
      <input 
        v-model="inputValue" 
        placeholder="输入要缓存的内容"
      />
      <button @click="saveToCache">保存到缓存</button>
      <button @click="loadFromCache">从缓存读取</button>
      <button @click="clearCache">清空缓存</button>
    </div>
    
    <div v-if="cachedValue" class="result">
      缓存的值：{{ cachedValue }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createCache } from '@ldesign/cache'

// 创建缓存实例
const cache = createCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'my-app_'
})

const inputValue = ref('')
const cachedValue = ref('')

// 保存到缓存
const saveToCache = async () => {
  await cache.set('demo-key', inputValue.value, {
    ttl: 5 * 60 * 1000 // 5分钟过期
  })
  alert('已保存到缓存！')
}

// 从缓存读取
const loadFromCache = async () => {
  const value = await cache.get<string>('demo-key')
  cachedValue.value = value || '缓存为空'
}

// 清空缓存
const clearCache = async () => {
  await cache.remove('demo-key')
  cachedValue.value = ''
  alert('缓存已清空！')
}
</script>

<style scoped>
.app {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}

.form {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background: #3451b2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #3a5ccc;
}

.result {
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
```

### 使用 HTTP 客户端

```ts
// src/api/index.ts
import { createHttpClient, presets } from '@ldesign/http'

// 创建 HTTP 客户端实例
export const api = createHttpClient({
  ...presets.restful,
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 添加请求拦截器
api.interceptors.request.use((config) => {
  // 添加认证 token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 添加响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理认证失败
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

在组件中使用：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get<User[]>('/users')
    users.value = response.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
```

## 项目结构

使用 CLI 创建的项目具有以下结构：

```
my-app/
├── src/
│   ├── api/          # API 接口定义
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── composables/  # 组合式函数
│   ├── layouts/      # 布局组件
│   ├── pages/        # 页面组件
│   ├── router/       # 路由配置
│   ├── stores/       # 状态管理
│   ├── styles/       # 全局样式
│   ├── utils/        # 工具函数
│   ├── App.vue       # 根组件
│   └── main.ts       # 入口文件
├── public/           # 公共资源
├── tests/            # 测试文件
├── .env              # 环境变量
├── .eslintrc.js      # ESLint 配置
├── .gitignore        # Git 忽略文件
├── index.html        # HTML 模板
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
├── vite.config.ts    # Vite 配置
└── README.md         # 项目说明
```

## 下一步

恭喜！你已经成功创建了第一个 LDesign 应用。接下来你可以：

- 📖 阅读[核心概念](/guide/concepts)深入了解 LDesign
- 🎯 查看[最佳实践](/guide/best-practices)学习项目组织
- 📦 浏览[包文档](/packages/)了解各个包的功能
- 🎨 探索[组件库](/libraries/)找到需要的组件
- 🛠️ 使用[开发工具](/tools/)提升开发效率

## 常见问题

### 为什么推荐使用 pnpm？

pnpm 提供了更快的安装速度、更小的磁盘占用和更严格的依赖管理。LDesign 使用 pnpm workspace 管理 monorepo，使用 pnpm 可以获得最佳体验。

### 如何只使用部分功能？

LDesign 的每个包都是独立的，你可以只安装需要的包：

```bash
# 只使用缓存功能
pnpm add @ldesign/cache

# 只使用 HTTP 客户端
pnpm add @ldesign/http
```

### 如何获取 TypeScript 类型支持？

所有 LDesign 包都是用 TypeScript 编写的，自带类型定义。确保你的 `tsconfig.json` 配置正确：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true
  }
}
```

### 遇到问题怎么办？

1. 查看[故障排除指南](/guide/troubleshooting)
2. 搜索 [GitHub Issues](https://github.com/ldesign/ldesign/issues)
3. 加入[社区讨论](https://github.com/ldesign/ldesign/discussions)
4. 提交新的 [Issue](https://github.com/ldesign/ldesign/issues/new)

# 快速开始

欢迎使用 LDesign Template！本指南将帮助您在几分钟内开始使用这个强大的模板管理系统。

## 📦 安装

### 使用包管理器安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/template
```

```bash [npm]
npm install @ldesign/template
```

```bash [yarn]
yarn add @ldesign/template
```

:::

### 依赖要求

- **Node.js**: >= 16.0.0
- **Vue**: >= 3.3.0
- **TypeScript**: >= 5.0.0 (可选，但推荐)

## 🏗️ 项目结构

在开始之前，让我们了解一下模板的目录结构：

```
src/templates/
├── login/                    # 登录模板分类
│   ├── desktop/             # 桌面端版本
│   │   ├── default/         # 默认模板
│   │   │   ├── index.vue    # 模板组件
│   │   │   ├── config.ts    # 配置文件
│   │   │   └── style.css    # 样式文件
│   │   ├── modern/          # 现代风格模板
│   │   └── classic/         # 经典风格模板
│   ├── tablet/              # 平板端版本
│   └── mobile/              # 移动端版本
└── dashboard/               # 仪表板模板分类
    ├── desktop/
    ├── tablet/
    └── mobile/
```

## 🚀 基础使用

### 1. 创建模板目录

首先，在您的项目中创建模板目录结构：

```
src/
├── templates/
│   ├── login/
│   │   ├── desktop/
│   │   │   └── default/
│   │   │       ├── index.vue
│   │   │       ├── config.ts
│   │   │       └── style.css
│   │   ├── tablet/
│   │   └── mobile/
│   ├── dashboard/
│   └── user/
└── main.ts
```

### 2. 创建您的第一个模板

创建一个简单的登录模板：

::: code-group

```vue [src/templates/login/desktop/default/index.vue]
<script setup lang="ts">
import { reactive } from 'vue'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户登录'
})

const form = reactive({
  username: '',
  password: ''
})

function handleLogin() {
  console.log('登录信息:', form)
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>{{ title }}</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="form.username"
            type="text"
            placeholder="用户名"
            required
          >
        </div>
        <div class="form-group">
          <input
            v-model="form.password"
            type="password"
            placeholder="密码"
            required
          >
        </div>
        <button type="submit" class="login-button">
          登录
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.login-button:hover {
  background: #2563eb;
}
</style>
```

```typescript [src/templates/login/desktop/default/config.ts]
import type { TemplateConfig } from '@ldesign/template/types'

export default {
  name: 'login-desktop-default',
  displayName: '默认登录页面',
  description: '简洁的桌面端登录页面',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'login',
  device: 'desktop',
  tags: ['simple', 'responsive'],

  props: {
    title: {
      type: String,
      default: '用户登录',
      description: '登录页面标题'
    }
  },

  events: [
    {
      name: 'login',
      description: '用户登录事件',
      payload: '{ username: string, password: string }'
    }
  ]
} as TemplateConfig
```

:::

### 3. 在 Vue 应用中使用

在您的 Vue 应用中集成模板系统：

```typescript
import { TemplatePlugin } from '@ldesign/template'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装模板插件
app.use(TemplatePlugin, {
  templatesDir: 'src/templates',
  autoScan: true,
  enableHMR: true
})

app.mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import {
  TemplateRenderer,
  useDeviceDetection,
  useTemplateScanner
} from '@ldesign/template'
import { computed, onMounted, ref } from 'vue'

// 扫描模板
const {
  templates,
  isLoading,
  error,
  scan
} = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: true
})

// 设备检测
const { currentDevice } = useDeviceDetection()

// 当前状态
const selectedTemplateId = ref('')
const currentTemplate = ref(null)

// 模板属性
const templateProps = ref({
  title: '欢迎登录'
})

// 可用模板（过滤当前设备）
const availableTemplates = computed(() => {
  return Array.from(templates.value.values())
    .filter(template => template.device === currentDevice.value)
})

// 加载模板
async function loadTemplate() {
  if (!selectedTemplateId.value) {
    currentTemplate.value = null
    return
  }

  const template = templates.value.get(selectedTemplateId.value)
  if (template) {
    currentTemplate.value = template
  }
}

// 处理登录事件
function handleLogin(loginData: any) {
  console.log('用户登录:', loginData)
  // 处理登录逻辑
}

// 初始化
onMounted(async () => {
  await scan()

  // 自动选择第一个可用模板
  if (availableTemplates.value.length > 0) {
    selectedTemplateId.value = availableTemplates.value[0].name
    await loadTemplate()
  }
})
</script>

<template>
  <div id="app">
    <div v-if="isLoading">
      加载模板中...
    </div>
    <div v-else-if="error">
      {{ error }}
    </div>
    <div v-else>
      <!-- 模板选择器 -->
      <div class="template-selector">
        <select v-model="selectedTemplateId" @change="loadTemplate">
          <option value="">
            选择模板
          </option>
          <option
            v-for="template in availableTemplates"
            :key="template.name"
            :value="template.name"
          >
            {{ template.displayName }}
          </option>
        </select>
      </div>

      <!-- 模板渲染器 -->
      <TemplateRenderer
        v-if="currentTemplate"
        :template="currentTemplate"
        :props="templateProps"
        @login="handleLogin"
      />
    </div>
  </div>
</template>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.template-selector {
  padding: 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.template-selector select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
</style>
```

## 🎯 核心概念

### 模板结构

每个模板都遵循标准的目录结构：

```
template-name/
├── index.vue          # 主组件文件 (必需)
├── config.ts          # 配置文件 (必需)
├── style.css          # 样式文件 (可选)
├── preview.png        # 预览图片 (推荐)
└── README.md          # 说明文档 (推荐)
```

### 设备类型

LDesign Template 支持三种设备类型：

- **desktop**: 桌面端 (≥ 1024px)
- **tablet**: 平板端 (768px - 1023px)
- **mobile**: 移动端 (< 768px)

### 模板分类

模板按功能分类组织：

- **auth**: 认证相关 (login, register, reset-password)
- **dashboard**: 仪表板 (overview, analytics, reports)
- **user**: 用户管理 (profile, settings, permissions)
- **form**: 表单 (contact, survey, feedback)
- **ecommerce**: 电商 (product, cart, checkout)

## 🔧 配置选项

### 全局配置

```typescript
import { TemplatePlugin } from '@ldesign/template'

app.use(TemplatePlugin, {
  // 模板目录
  templatesDir: 'src/templates',

  // 是否自动扫描
  autoScan: true,

  // 是否启用热更新
  enableHMR: process.env.NODE_ENV === 'development',

  // 默认设备类型
  defaultDevice: 'desktop',

  // 调试模式
  debug: process.env.NODE_ENV === 'development',

  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 60000
  }
})
```

## 🎉 下一步

恭喜！您已经成功创建了第一个模板。接下来您可以：

- 📖 阅读 [基础概念](./concepts) 了解更多核心概念
- 🔧 查看 [配置指南](./configuration) 学习高级配置
- 🎨 浏览 [模板库](../templates/overview) 查看更多预制模板
- 💡 查看 [示例](../examples/basic) 学习最佳实践

## 🆘 遇到问题？

如果您在使用过程中遇到问题：

1. 查看 [故障排除指南](./troubleshooting)
2. 搜索 [GitHub Issues](https://github.com/ldesign-org/template/issues)
3. 加入我们的 [Discord 社区](https://discord.gg/ldesign)
4. 提交新的 [Issue](https://github.com/ldesign-org/template/issues/new)

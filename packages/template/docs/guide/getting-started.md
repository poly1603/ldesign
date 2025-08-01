# 快速开始

本指南将帮助你在几分钟内上手 LDesign Template，体验其强大的模板管理功能。

## 第一步：安装插件

首先，在你的 Vue 3 应用中安装并注册 LDesign Template 插件：

```typescript
import TemplatePlugin from '@ldesign/template'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 注册插件
app.use(TemplatePlugin, {
  // 可选配置
  defaultDevice: 'desktop',
  autoScan: true,
  autoDetectDevice: true
})

app.mount('#app')
```

## 第二步：创建模板

在你的项目中创建模板目录结构：

```
src/
  templates/
    login/           # 模板分类
      desktop/       # 设备类型
        classic/     # 模板名称
          index.vue  # 模板组件
          config.ts  # 模板配置
        modern/
          index.vue
          config.ts
      mobile/
        simple/
          index.vue
          config.ts
```

### 创建模板组件

创建 `src/templates/login/desktop/classic/index.vue`：

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 接收外部传入的属性
interface Props {
  title?: string
  onLogin?: (data: { username: string, password: string }) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户登录'
})

const username = ref('')
const password = ref('')

function handleLogin() {
  const loginData = {
    username: username.value,
    password: password.value
  }

  props.onLogin?.(loginData)
}
</script>

<template>
  <div class="classic-login">
    <div class="login-card">
      <h2>{{ title || '用户登录' }}</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            required
          >
        </div>
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            required
          >
        </div>
        <button type="submit" class="login-btn">
          登录
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.classic-login {
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

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #5a6fd8;
}
</style>
```

### 创建模板配置

创建 `src/templates/login/desktop/classic/config.ts`：

```typescript
import type { TemplateConfig } from '@ldesign/template'

export const config: TemplateConfig = {
  name: 'classic',
  title: '经典登录页',
  description: '传统的登录页面设计，简洁大方',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'login',
  device: 'desktop',
  tags: ['经典', '简洁', '商务'],
  preview: '/previews/login-classic.png',

  // 支持的属性
  props: {
    title: {
      type: 'string',
      default: '用户登录',
      description: '登录页标题'
    },
    onLogin: {
      type: 'function',
      description: '登录回调函数'
    }
  },

  // 依赖的其他模板或组件
  dependencies: [],

  // 兼容性信息
  compatibility: {
    vue: '>=3.2.0',
    browsers: ['Chrome >= 88', 'Firefox >= 85', 'Safari >= 14']
  }
}
```

## 第三步：使用模板

现在你可以在组件中使用模板了：

### 方式一：使用组件

```vue
<script setup lang="ts">
function handleLogin(data: { username: string, password: string }) {
  console.log('登录数据:', data)
  // 处理登录逻辑
}

function onTemplateLoad(component: any) {
  console.log('模板加载成功:', component)
}

function onTemplateError(error: Error) {
  console.error('模板加载失败:', error)
}
</script>

<template>
  <div>
    <!-- 使用模板渲染器组件 -->
    <LTemplateRenderer
      category="login"
      device="desktop"
      template="classic"
      :template-props="{
        title: '欢迎登录',
        onLogin: handleLogin,
      }"
      @load="onTemplateLoad"
      @error="onTemplateError"
    />
  </div>
</template>
```

### 方式二：使用 Composable

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template'

const {
  currentTemplate,
  loading,
  error,
  render
} = useTemplate()

// 渲染指定模板
render({
  category: 'login',
  device: 'desktop',
  template: 'classic'
})

function handleLogin(data: { username: string, password: string }) {
  console.log('登录数据:', data)
}
</script>

<template>
  <div>
    <div v-if="loading">
      加载中...
    </div>
    <div v-else-if="error">
      加载失败: {{ error.message }}
    </div>
    <component
      :is="currentTemplate"
      v-else-if="currentTemplate"
      title="欢迎登录"
      :on-login="handleLogin"
    />
  </div>
</template>
```

### 方式三：使用指令

```vue
<script setup lang="ts">
function handleLogin(data: { username: string, password: string }) {
  console.log('登录数据:', data)
}
</script>

<template>
  <div
    v-template="{
      category: 'login',
      device: 'desktop',
      template: 'classic',
      props: {
        title: '欢迎登录',
        onLogin: handleLogin,
      },
    }"
  />
</template>
```

## 第四步：响应式适配

LDesign Template 支持自动设备检测，你可以为不同设备创建不同的模板：

```vue
<template>
  <!-- 会根据当前设备自动选择合适的模板 -->
  <LTemplateRenderer
    category="login"
    template="classic"
    :template-props="{ onLogin: handleLogin }"
  />
</template>
```

当用户在移动设备上访问时，系统会自动尝试加载 `login/mobile/classic` 模板，如果不存在则回退到桌面版本。

## 下一步

恭喜！你已经成功创建并使用了第一个模板。接下来你可以：

- 了解 [基础概念](./concepts.md) 深入理解系统架构
- 学习 [模板管理](./template-management.md) 掌握高级功能
- 查看 [API 参考](../api/) 了解完整的 API
- 浏览 [示例](../examples/) 获取更多灵感

## 小贴士

1. **模板命名**：使用有意义的名称，便于团队协作
2. **配置完整**：完善的配置信息有助于模板管理和维护
3. **响应式设计**：考虑不同设备的用户体验
4. **性能优化**：利用懒加载和缓存机制提升性能

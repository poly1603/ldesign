# Provider 模式使用指南

## 概述

Provider 模式是 LDesign Template 系统的核心特性之一，它提供了全局的模板配置和状态管理能力，让你可以在整个应用中共享模板配置，简化子组件的使用。

## 基础用法

### 1. 设置 Provider

首先在应用的根组件中设置 TemplateProvider：

```vue
<!-- App.vue -->
<template>
  <TemplateProvider :config="providerConfig">
    <router-view />
  </TemplateProvider>
</template>

<script setup lang="ts">
import {
  TemplateProvider,
  createTemplateProviderConfig,
} from '@ldesign/template'

const providerConfig = createTemplateProviderConfig({
  enableCache: true,
  autoDetectDevice: true,
  enableGlobalState: true,
  defaultSelectorConfig: {
    enabled: true,
    position: 'top',
    showPreview: true,
    layout: 'grid',
    columns: 3,
  },
  theme: {
    primaryColor: '#1890ff',
    borderRadius: '8px',
    spacing: '16px',
  },
})
</script>
```

### 2. 在子组件中使用

在任何子组件中，你都可以使用`useTemplateProvider`来访问全局配置和状态：

```vue
<!-- LoginPage.vue -->
<template>
  <div class="login-page">
    <h1>用户登录</h1>

    <!-- 简化的模板渲染器，自动使用Provider配置 -->
    <TemplateRenderer category="login" :selector="true" />

    <!-- 显示当前状态 -->
    <div class="status-info">
      <p>当前设备: {{ currentDevice }}</p>
      <p>加载状态: {{ loading ? '加载中' : '已完成' }}</p>
      <p v-if="error" class="error">错误: {{ error.message }}</p>
    </div>

    <!-- 模板切换按钮 -->
    <div class="template-controls">
      <button
        v-for="template in availableTemplates"
        :key="template.template"
        @click="switchToTemplate(template.template)"
        :disabled="loading"
      >
        {{ template.config.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TemplateRenderer, useTemplateProvider } from '@ldesign/template'

const { currentDevice, loading, error, getTemplates, switchTemplate } =
  useTemplateProvider()

// 获取可用的登录模板
const availableTemplates = computed(() => {
  return getTemplates('login', currentDevice.value)
})

// 切换到指定模板
const switchToTemplate = async (templateName: string) => {
  try {
    await switchTemplate('login', currentDevice.value, templateName)
  } catch (err) {
    console.error('模板切换失败:', err)
  }
}
</script>
```

## 高级配置

### 1. 自定义主题

```typescript
const providerConfig = createTemplateProviderConfig({
  theme: {
    // 主色调
    primaryColor: '#1890ff',

    // 圆角
    borderRadius: '8px',

    // 间距
    spacing: '16px',

    // 自定义CSS变量
    '--template-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    '--template-transition': 'all 0.3s ease',

    // 响应式断点
    '--template-mobile-breakpoint': '768px',
    '--template-tablet-breakpoint': '1024px',
  },
})
```

### 2. 全局模板属性

```typescript
const providerConfig = createTemplateProviderConfig({
  globalTemplateProps: {
    // 全局传递给所有模板的属性
    appName: 'My App',
    version: '1.0.0',
    apiBaseUrl: process.env.VUE_APP_API_BASE_URL,

    // 全局事件处理器
    onError: (error: Error) => {
      console.error('模板错误:', error)
      // 发送错误报告
    },

    onSuccess: (data: any) => {
      console.log('模板操作成功:', data)
    },
  },
})
```

### 3. 默认选择器配置

```typescript
const providerConfig = createTemplateProviderConfig({
  defaultSelectorConfig: {
    enabled: true,
    position: 'overlay',
    showPreview: true,
    showSearch: true,
    showInfo: true,
    layout: 'grid',
    columns: 4,

    // 高级配置
    collapsible: true,
    defaultExpanded: false,
    trigger: 'manual',
    animation: true,
    animationDuration: 300,

    // 自定义样式
    className: 'my-template-selector',
    style: {
      maxHeight: '500px',
      borderRadius: '12px',
    },
  },
})
```

## 实际应用场景

### 1. 多页面应用

```vue
<!-- 在不同页面中使用相同的Provider配置 -->

<!-- HomePage.vue -->
<template>
  <TemplateRenderer category="homepage" :selector="true" />
</template>

<!-- ProductPage.vue -->
<template>
  <TemplateRenderer category="product" :selector="true" />
</template>

<!-- UserProfile.vue -->
<template>
  <TemplateRenderer category="profile" :selector="true" />
</template>
```

### 2. 条件渲染

```vue
<template>
  <div>
    <!-- 根据用户权限显示不同的模板选择器 -->
    <TemplateRenderer
      category="admin"
      :selector="userRole === 'admin'"
      :allowTemplateSwitch="canSwitchTemplate"
      :canSwitchTemplate="checkTemplatePermission"
    />
  </div>
</template>

<script setup>
import { useTemplateProvider } from '@ldesign/template'

const { currentDevice } = useTemplateProvider()

const userRole = ref('user') // 从用户状态获取
const canSwitchTemplate = computed(() => userRole.value === 'admin')

const checkTemplatePermission = (template: string) => {
  // 检查用户是否有权限使用特定模板
  if (userRole.value === 'admin') return true
  if (template === 'basic') return true
  return false
}
</script>
```

### 3. 动态配置

```vue
<template>
  <div>
    <!-- 配置面板 -->
    <div class="config-panel">
      <h3>模板配置</h3>
      <label>
        <input type="checkbox" v-model="selectorEnabled" />
        启用模板选择器
      </label>

      <select v-model="selectorPosition">
        <option value="top">顶部</option>
        <option value="bottom">底部</option>
        <option value="overlay">覆盖层</option>
      </select>
    </div>

    <!-- 动态配置的模板渲染器 -->
    <TemplateRenderer
      category="demo"
      :selector="{
        enabled: selectorEnabled,
        position: selectorPosition,
        showPreview: true,
      }"
    />
  </div>
</template>

<script setup>
const selectorEnabled = ref(true)
const selectorPosition = ref('top')
</script>
```

## 最佳实践

### 1. 配置分离

将 Provider 配置提取到单独的文件中：

```typescript
// config/template-provider.ts
import { createTemplateProviderConfig } from '@ldesign/template'

export const templateProviderConfig = createTemplateProviderConfig({
  enableCache: true,
  autoDetectDevice: true,
  enableGlobalState: true,

  defaultSelectorConfig: {
    enabled: process.env.NODE_ENV === 'development',
    position: 'overlay',
    showPreview: true,
  },

  theme: {
    primaryColor: process.env.VUE_APP_PRIMARY_COLOR || '#1890ff',
  },
})
```

### 2. 环境配置

根据不同环境使用不同的配置：

```typescript
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

const providerConfig = createTemplateProviderConfig({
  debug: isDevelopment,
  enableCache: isProduction,

  defaultSelectorConfig: {
    enabled: isDevelopment, // 只在开发环境启用选择器
    position: 'overlay',
  },
})
```

### 3. 错误处理

```typescript
const providerConfig = createTemplateProviderConfig({
  globalTemplateProps: {
    onError: (error: Error) => {
      // 统一的错误处理
      if (process.env.NODE_ENV === 'development') {
        console.error('模板错误:', error)
      } else {
        // 生产环境发送错误报告
        sendErrorReport(error)
      }
    },
  },
})
```

## 注意事项

1. **Provider 层级**: 确保 TemplateProvider 在需要使用模板功能的组件的父级
2. **配置更新**: Provider 配置在运行时不会自动更新，需要重新挂载组件
3. **性能考虑**: 全局状态会在所有子组件间共享，注意避免不必要的重渲染
4. **类型安全**: 使用 TypeScript 时，确保配置对象的类型正确

通过 Provider 模式，你可以大大简化模板系统的使用，提供一致的用户体验和开发体验。

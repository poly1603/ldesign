# useSimpleTemplate

简化版模板管理 Hook，提供最简单的模板使用方式。

## 📋 概述

`useSimpleTemplate` 是一个简化的模板管理 Hook，它返回一个可以直接在模板中使用的组件，大大简化了模板的使用流程。这是推荐的新 API，特别适合快速原型开发和简单的模板使用场景。

> **注意**: `useSimpleTemplate` 内部使用 `useTemplate` 作为底层实现，提供了更简单的接口，同时保持了完整的功能和性能。

## ✨ 特性

- **🚀 开箱即用**：返回可直接渲染的组件
- **🎛️ 简化配置**：最少的配置选项
- **🔄 响应式**：自动响应设备变化
- **🎨 可定制**：支持模板选择器和自定义属性
- **📱 设备适配**：自动适配不同设备类型
- **🔒 类型安全**：完整的 TypeScript 支持

## 🚀 基础用法

### 最简单的使用

```vue
<script setup lang="ts">
import { useSimpleTemplate } from '@ldesign/template'

const { TemplateComponent } = useSimpleTemplate({
  category: 'login'
})
</script>

<template>
  <TemplateComponent />
</template>
```

### 带选择器的使用

```vue
<script setup lang="ts">
import { useSimpleTemplate } from '@ldesign/template'

const {
  TemplateComponent,
  showSelector,
  selectedTemplate,
  openSelector,
  closeSelector,
  switchTemplate,
} = useSimpleTemplate({
  category: 'login',
  showSelector: false,
  selectorConfig: {
    theme: 'default',
    animation: 'slide',
    showSearch: false,
    showTags: false,
    showSort: false,
  },
  templateProps: {
    title: '用户登录',
    subtitle: '欢迎回来，请登录您的账户',
  },
})

// 处理模板切换
function handleTemplateSwitch(templateName: string) {
  switchTemplate(templateName)
}
</script>

<template>
  <div>
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="openSelector">选择模板</button>
      <span v-if="selectedTemplate">当前模板: {{ selectedTemplate }}</span>
    </div>
    
    <!-- 模板组件 -->
    <TemplateComponent />
  </div>
</template>
```

## 📚 API 参考

### 参数选项

```typescript
interface UseSimpleTemplateOptions {
  /** 模板分类（可选，默认 'login'） */
  category?: string
  /** 设备类型（可选，默认自动检测） */
  device?: DeviceType
  /** 是否显示模板选择器（可选，默认 false） */
  showSelector?: boolean
  /** 模板选择器配置（可选） */
  selectorConfig?: Partial<TemplateSelectorConfig>
  /** 传递给模板的属性（可选） */
  templateProps?: Record<string, any>
}
```

### 返回值

```typescript
interface UseSimpleTemplateReturn {
  /** 可直接渲染的模板组件 */
  TemplateComponent: Component
  /** 是否显示选择器 */
  showSelector: Ref<boolean>
  /** 当前选中的模板名称 */
  selectedTemplate: Ref<string | undefined>
  /** 打开选择器 */
  openSelector: () => void
  /** 关闭选择器 */
  closeSelector: () => void
  /** 切换模板 */
  switchTemplate: (templateName: string) => void
}
```

## 🎯 使用场景

### 1. 快速原型开发

```vue
<script setup lang="ts">
import { useSimpleTemplate } from '@ldesign/template'

// 快速创建登录页面原型
const { TemplateComponent } = useSimpleTemplate({
  category: 'login',
  templateProps: {
    title: '快速原型',
    onLogin: (credentials: any) => {
      console.log('登录:', credentials)
    }
  }
})
</script>

<template>
  <TemplateComponent />
</template>
```

### 2. 动态模板切换

```vue
<script setup lang="ts">
import { useSimpleTemplate } from '@ldesign/template'
import { ref } from 'vue'

const currentCategory = ref('login')

const { TemplateComponent, switchTemplate } = useSimpleTemplate({
  category: currentCategory.value,
  showSelector: true
})

// 切换模板分类
function switchCategory(category: string) {
  currentCategory.value = category
}
</script>

<template>
  <div>
    <nav>
      <button @click="switchCategory('login')">登录模板</button>
      <button @click="switchCategory('dashboard')">仪表板模板</button>
    </nav>
    <TemplateComponent />
  </div>
</template>
```

### 3. 自定义配置

```vue
<script setup lang="ts">
import { useSimpleTemplate } from '@ldesign/template'

const { TemplateComponent } = useSimpleTemplate({
  category: 'login',
  device: 'desktop',
  selectorConfig: {
    theme: 'dark',
    animation: 'fade',
    showSearch: true,
    showTags: true,
    position: 'top-right'
  },
  templateProps: {
    title: '企业登录系统',
    subtitle: '安全可靠的企业级登录',
    theme: 'corporate',
    logo: '/assets/company-logo.png'
  }
})
</script>

<template>
  <TemplateComponent />
</template>
```

## 🔗 相关链接

- [useTemplate](/api/use-template) - 完整版模板管理 Hook
- [TemplateRenderer](/api/template-renderer) - 模板渲染器组件
- [模板选择器](/api/template-selector) - 模板选择器组件
- [设备检测](/guide/device-detection) - 设备检测指南

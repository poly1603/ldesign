# 内置模板选择器使用指南

## 概述

内置模板选择器是 LDesign Template 系统的一个重要特性，它直接集成在 TemplateRenderer 组件中，无需额外的组件配置，就能为用户提供直观的模板切换功能。

## 基础用法

### 1. 启用选择器

最简单的方式是将`selector`属性设置为`true`：

```vue
<template>
  <!-- 使用默认配置启用选择器 -->
  <TemplateRenderer category="login" :selector="true" />
</template>
```

### 2. 自定义选择器配置

通过传递配置对象来自定义选择器行为：

```vue
<template>
  <TemplateRenderer
    category="dashboard"
    :selector="{
      enabled: true,
      position: 'top',
      showPreview: true,
      showSearch: true,
      layout: 'grid',
      columns: 3,
    }"
  />
</template>
```

## 选择器位置

### 1. 顶部位置 (top)

```vue
<template>
  <TemplateRenderer
    category="header"
    :selector="{
      enabled: true,
      position: 'top',
    }"
  />
</template>
```

### 2. 底部位置 (bottom)

```vue
<template>
  <TemplateRenderer
    category="footer"
    :selector="{
      enabled: true,
      position: 'bottom',
    }"
  />
</template>
```

### 3. 左侧位置 (left)

```vue
<template>
  <TemplateRenderer
    category="sidebar"
    :selector="{
      enabled: true,
      position: 'left',
    }"
  />
</template>
```

### 4. 右侧位置 (right)

```vue
<template>
  <TemplateRenderer
    category="content"
    :selector="{
      enabled: true,
      position: 'right',
    }"
  />
</template>
```

### 5. 覆盖层位置 (overlay)

```vue
<template>
  <TemplateRenderer
    category="modal"
    :selector="{
      enabled: true,
      position: 'overlay',
      trigger: 'manual',
    }"
  />
</template>
```

## 触发方式

### 1. 点击触发 (click)

```vue
<template>
  <TemplateRenderer
    category="card"
    :selector="{
      enabled: true,
      trigger: 'click',
      showTitle: true,
      title: '选择卡片模板',
    }"
  />
</template>
```

### 2. 悬停触发 (hover)

```vue
<template>
  <TemplateRenderer
    category="button"
    :selector="{
      enabled: true,
      trigger: 'hover',
      animationDuration: 200,
    }"
  />
</template>
```

### 3. 手动触发 (manual)

```vue
<template>
  <div>
    <button @click="toggleSelector">
      {{ selectorVisible ? '隐藏' : '显示' }}模板选择器
    </button>

    <TemplateRenderer
      category="form"
      :selector="{
        enabled: true,
        trigger: 'manual',
      }"
      @selector-visibility-change="onSelectorVisibilityChange"
    />
  </div>
</template>

<script setup>
const selectorVisible = ref(false)

const toggleSelector = () => {
  // 手动触发选择器显示/隐藏
  selectorVisible.value = !selectorVisible.value
}

const onSelectorVisibilityChange = visible => {
  selectorVisible.value = visible
}
</script>
```

## 布局模式

### 1. 网格布局 (grid)

```vue
<template>
  <TemplateRenderer
    category="gallery"
    :selector="{
      enabled: true,
      layout: 'grid',
      columns: 4,
      showPreview: true,
      showInfo: true,
    }"
  />
</template>
```

### 2. 列表布局 (list)

```vue
<template>
  <TemplateRenderer
    category="article"
    :selector="{
      enabled: true,
      layout: 'list',
      showPreview: true,
      showSearch: true,
    }"
  />
</template>
```

## 高级功能

### 1. 搜索功能

```vue
<template>
  <TemplateRenderer
    category="product"
    :selector="{
      enabled: true,
      showSearch: true,
      searchPlaceholder: '搜索产品模板...',
      searchFields: ['name', 'description', 'tags'],
    }"
  />
</template>
```

### 2. 预览功能

```vue
<template>
  <TemplateRenderer
    category="theme"
    :selector="{
      enabled: true,
      showPreview: true,
      previewMode: 'hover', // 'hover' | 'click'
      previewSize: 'large', // 'small' | 'medium' | 'large'
    }"
  />
</template>
```

### 3. 可折叠选择器

```vue
<template>
  <TemplateRenderer
    category="widget"
    :selector="{
      enabled: true,
      collapsible: true,
      defaultExpanded: false,
      title: '选择小部件模板',
    }"
  />
</template>
```

### 4. 权限控制

```vue
<template>
  <TemplateRenderer
    category="admin"
    :selector="selectorConfig"
    :allowTemplateSwitch="canSwitchTemplate"
    :canSwitchTemplate="checkTemplatePermission"
    @template-change="onTemplateChange"
  />
</template>

<script setup>
const userRole = ref('user')

const selectorConfig = computed(() => ({
  enabled: userRole.value === 'admin',
  position: 'top',
  showPreview: true,
}))

const canSwitchTemplate = computed(() => {
  return userRole.value === 'admin' || userRole.value === 'editor'
})

const checkTemplatePermission = template => {
  // 检查用户是否有权限使用特定模板
  const restrictedTemplates = ['premium', 'enterprise']

  if (userRole.value === 'admin') return true
  if (restrictedTemplates.includes(template)) return false

  return true
}

const onTemplateChange = template => {
  console.log('模板已切换到:', template)
  // 记录用户操作
  logUserAction('template_switch', { template })
}
</script>
```

## 自定义样式

### 1. 主题定制

```vue
<template>
  <TemplateRenderer
    category="custom"
    :selector="{
      enabled: true,
      className: 'my-custom-selector',
      style: {
        '--selector-primary-color': '#ff6b6b',
        '--selector-border-radius': '12px',
        '--selector-shadow': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    }"
  />
</template>

<style>
.my-custom-selector {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #fff;
}

.my-custom-selector .template-item {
  transition: transform 0.3s ease;
}

.my-custom-selector .template-item:hover {
  transform: scale(1.05);
}
</style>
```

### 2. 响应式设计

```vue
<template>
  <TemplateRenderer
    category="responsive"
    :selector="responsiveSelectorConfig"
  />
</template>

<script setup>
import { useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
})

const responsiveSelectorConfig = computed(() => {
  const isMobile = breakpoints.smaller('mobile')
  const isTablet = breakpoints.between('mobile', 'desktop')

  return {
    enabled: true,
    position: isMobile.value ? 'bottom' : 'top',
    layout: isMobile.value ? 'list' : 'grid',
    columns: isMobile.value ? 1 : isTablet.value ? 2 : 3,
    showSearch: !isMobile.value,
    showPreview: !isMobile.value,
  }
})
</script>
```

## 事件处理

### 1. 模板变化事件

```vue
<template>
  <TemplateRenderer
    category="event-demo"
    :selector="true"
    @template-change="onTemplateChange"
    @template-preview="onTemplatePreview"
    @selector-visibility-change="onSelectorVisibilityChange"
  />
</template>

<script setup>
const onTemplateChange = template => {
  console.log('模板已切换:', template)

  // 保存用户偏好
  localStorage.setItem('preferred-template', template)

  // 发送分析事件
  analytics.track('template_changed', { template })
}

const onTemplatePreview = template => {
  console.log('预览模板:', template)

  // 预加载模板资源
  preloadTemplate(template)
}

const onSelectorVisibilityChange = visible => {
  console.log('选择器可见性:', visible)

  if (visible) {
    // 选择器打开时的逻辑
    analytics.track('selector_opened')
  }
}
</script>
```

## 最佳实践

### 1. 性能优化

```vue
<template>
  <TemplateRenderer
    category="performance"
    :selector="{
      enabled: true,
      // 延迟加载选择器内容
      lazy: true,
      // 虚拟滚动大量模板
      virtualScroll: true,
      // 缓存模板预览
      cachePreview: true,
    }"
  />
</template>
```

### 2. 用户体验

```vue
<template>
  <TemplateRenderer
    category="ux"
    :selector="{
      enabled: true,
      // 显示加载状态
      showLoading: true,
      // 空状态提示
      emptyText: '暂无可用模板',
      // 错误状态处理
      showError: true,
      // 键盘导航支持
      keyboardNavigation: true,
    }"
  />
</template>
```

### 3. 无障碍访问

```vue
<template>
  <TemplateRenderer
    category="accessibility"
    :selector="{
      enabled: true,
      // ARIA标签
      ariaLabel: '模板选择器',
      // 键盘快捷键
      shortcuts: {
        toggle: 'Ctrl+T',
        next: 'ArrowRight',
        prev: 'ArrowLeft',
      },
      // 高对比度支持
      highContrast: true,
    }"
  />
</template>
```

通过内置模板选择器，你可以为用户提供直观、灵活的模板切换体验，同时保持代码的简洁和可维护性。

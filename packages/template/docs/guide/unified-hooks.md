# 统一 Hook 架构

## 📋 概述

本文档介绍了 LDesign Template 系统中统一的 Hook 架构设计，包括 `useTemplate` 和 `useSimpleTemplate` 的关系和使用方式。

## 🏗️ 架构设计

### 核心理念

我们采用了**统一底层，分层接口**的设计理念：

- **`useTemplate`**: 完整功能的底层 Hook，提供所有模板管理功能
- **`useSimpleTemplate`**: 简化接口的上层 Hook，内部使用 `useTemplate` 实现

### 架构图

```
┌─────────────────────────────────────────┐
│              用户层                      │
├─────────────────────────────────────────┤
│  useSimpleTemplate  │   useTemplate     │
│  (简化接口)         │   (完整功能)      │
├─────────────────────────────────────────┤
│              useTemplate                │
│              (统一底层)                 │
├─────────────────────────────────────────┤
│  TemplateScanner │ DeviceDetection │... │
│              (核心模块)                 │
└─────────────────────────────────────────┘
```

## 🎯 Hook 对比

### useTemplate (完整版)

**适用场景**: 需要完整控制和高级功能的场景

**特性**:
- ✅ 完整的模板管理功能
- ✅ 详细的状态管理 (loading, error, templates)
- ✅ 高级功能 (预加载, 缓存管理, 设备检测)
- ✅ 灵活的组件渲染控制
- ✅ 完整的生命周期管理

**使用示例**:
```typescript
const {
  currentTemplate,
  currentComponent,
  availableTemplates,
  loading,
  error,
  deviceType,
  switchTemplate,
  refreshTemplates,
  preloadTemplate,
  clearCache,
  TemplateTransition,
  showSelector,
  openSelector,
  closeSelector,
} = useTemplate({
  category: 'login',
  autoDetectDevice: true,
  enableCache: true,
  showSelector: false,
})
```

### useSimpleTemplate (简化版)

**适用场景**: 快速原型开发和简单使用场景

**特性**:
- ✅ 简化的接口设计
- ✅ 开箱即用的组件
- ✅ 内置错误处理和加载状态
- ✅ 基于 `useTemplate` 的可靠实现
- ✅ 保持向后兼容性

**使用示例**:
```typescript
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
  templateProps: {
    title: '用户登录',
    subtitle: '欢迎回来',
  },
})
```

## 🔄 统一实现

### useSimpleTemplate 的内部实现

```typescript
export function useSimpleTemplate(options = {}) {
  // 使用 useTemplate 作为底层实现
  const {
    currentTemplate,
    currentComponent,
    loading,
    error,
    switchTemplate: switchTemplateInternal,
    showSelector: showSelectorInternal,
    openSelector: openSelectorInternal,
    closeSelector: closeSelectorInternal,
    TemplateTransition,
  } = useTemplate({
    category: options.category,
    device: options.device,
    autoDetectDevice: !options.device,
    enableCache: true,
    showSelector: options.showSelector,
    selectorConfig: options.selectorConfig,
  })

  // 创建简化的渲染组件
  const TemplateComponent = defineComponent({
    name: 'SimpleTemplateComponent',
    setup() {
      return () => {
        if (loading.value) {
          return h('div', { class: 'template-loading' }, '正在加载模板...')
        }
        
        if (error.value) {
          return h('div', { class: 'template-error' }, `加载失败: ${error.value}`)
        }
        
        if (currentComponent.value) {
          return h(TemplateTransition, {}, {
            default: () => h(currentComponent.value, options.templateProps)
          })
        }
        
        return h('div', { class: 'template-empty' }, '没有可用的模板')
      }
    }
  })

  // 返回简化的接口
  return {
    TemplateComponent: markRaw(TemplateComponent),
    showSelector: showSelectorInternal,
    selectedTemplate: computed(() => currentTemplate.value?.name),
    openSelector: openSelectorInternal,
    closeSelector: closeSelectorInternal,
    switchTemplate: switchTemplateInternal,
  }
}
```

## 📚 使用指南

### 选择合适的 Hook

**使用 `useTemplate` 当你需要**:
- 完整的状态控制
- 高级功能 (预加载、缓存管理)
- 自定义渲染逻辑
- 详细的错误处理
- 性能优化控制

**使用 `useSimpleTemplate` 当你需要**:
- 快速原型开发
- 简单的模板渲染
- 最少的配置
- 开箱即用的体验

### 迁移指南

#### 从 useSimpleTemplate 迁移到 useTemplate

```typescript
// 之前 (useSimpleTemplate)
const { TemplateComponent } = useSimpleTemplate({
  category: 'login',
  templateProps: { title: '登录' }
})

// 之后 (useTemplate)
const { currentComponent, TemplateTransition } = useTemplate({
  category: 'login'
})

// 在模板中
<TemplateTransition>
  <component 
    v-if="currentComponent" 
    :is="currentComponent"
    :title="'登录'"
  />
</TemplateTransition>
```

#### 从 useTemplate 迁移到 useSimpleTemplate

```typescript
// 之前 (useTemplate)
const { 
  currentComponent, 
  TemplateTransition,
  loading,
  error 
} = useTemplate({ category: 'login' })

// 之后 (useSimpleTemplate)
const { TemplateComponent } = useSimpleTemplate({
  category: 'login',
  templateProps: { title: '登录' }
})

// 在模板中 - 大大简化
<TemplateComponent />
```

## 🎯 最佳实践

### 1. 项目初期使用 useSimpleTemplate

```typescript
// 快速开始，专注业务逻辑
const { TemplateComponent } = useSimpleTemplate({
  category: 'login'
})
```

### 2. 需要高级功能时迁移到 useTemplate

```typescript
// 需要更多控制时
const {
  currentTemplate,
  loading,
  error,
  switchTemplate,
  preloadTemplate
} = useTemplate({
  category: 'login',
  enableCache: true
})
```

### 3. 混合使用

```typescript
// 在同一个项目中可以混合使用
const simpleLogin = useSimpleTemplate({ category: 'login' })
const advancedDashboard = useTemplate({ 
  category: 'dashboard',
  enableCache: true,
  autoDetectDevice: true
})
```

## 🔗 相关链接

- [useTemplate API 文档](/api/use-template)
- [useSimpleTemplate API 文档](/api/use-simple-template)
- [模板系统架构](/guide/architecture)
- [性能优化指南](/guide/performance)

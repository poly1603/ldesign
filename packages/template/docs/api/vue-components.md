# Vue 组件 API

本文档介绍 LDesign Template 提供的 Vue 组件，包括最新的性能优化组件。

## TemplateRenderer

模板渲染器组件，用于渲染指定的模板。

### Props

| 属性                       | 类型         | 默认值  | 描述                |
| -------------------------- | ------------ | ------- | ------------------- |
| `category`                 | `string`     | -       | 模板分类            |
| `templateId`               | `string`     | -       | 模板 ID             |
| `deviceType`               | `DeviceType` | -       | 设备类型            |
| `showSelector`             | `boolean`    | `false` | 是否显示选择器      |
| `autoDetectDevice`         | `boolean`    | `true`  | 是否自动检测设备    |
| `config`                   | `object`     | `{}`    | 模板配置            |
| `lazy`                     | `boolean`    | `false` | 🆕 是否启用懒加载   |
| `preload`                  | `boolean`    | `false` | 🆕 是否启用预加载   |
| `enablePerformanceMonitor` | `boolean`    | `false` | 🆕 是否启用性能监控 |

### Events

| 事件                 | 参数                     | 描述                  |
| -------------------- | ------------------------ | --------------------- |
| `template-change`    | `templateId: string`     | 模板切换时触发        |
| `device-change`      | `device: DeviceType`     | 设备切换时触发        |
| `render-error`       | `error: Error`           | 渲染错误时触发        |
| `performance-update` | `data: PerformanceData`  | 🆕 性能数据更新时触发 |
| `load-start`         | -                        | 🆕 开始加载时触发     |
| `load-end`           | `{ renderTime: number }` | 🆕 加载完成时触发     |

### 示例

```vue
<script setup>
function handleTemplateChange(templateId) {
  console.log('模板切换:', templateId)
}

function handlePerformanceUpdate(data) {
  console.log('性能数据:', data)
}

function handleLoadStart() {
  console.log('开始加载')
}

function handleLoadEnd({ renderTime }) {
  console.log('加载完成，耗时:', renderTime, 'ms')
}
</script>

<template>
  <TemplateRenderer
    category="login"
    template-id="default"
    device-type="desktop"
    :lazy="true"
    :preload="true"
    :enable-performance-monitor="true"
    @template-change="handleTemplateChange"
    @performance-update="handlePerformanceUpdate"
    @load-start="handleLoadStart"
    @load-end="handleLoadEnd"
  />
</template>
```

## 🆕 LazyTemplate

懒加载模板组件，支持 Intersection Observer API 进行可视区域检测。

### Props

| 属性                | 类型         | 默认值   | 描述           |
| ------------------- | ------------ | -------- | -------------- |
| `category`          | `string`     | -        | 模板分类       |
| `device`            | `DeviceType` | -        | 设备类型       |
| `template`          | `string`     | -        | 模板名称       |
| `placeholderHeight` | `number`     | `200`    | 占位符高度     |
| `rootMargin`        | `string`     | `'50px'` | 根边距         |
| `threshold`         | `number`     | `0.1`    | 阈值           |
| `lazy`              | `boolean`    | `true`   | 是否启用懒加载 |

### Events

| 事件      | 参数                   | 描述               |
| --------- | ---------------------- | ------------------ |
| `load`    | `component: Component` | 模板加载完成时触发 |
| `error`   | `error: Error`         | 加载错误时触发     |
| `visible` | -                      | 进入可视区域时触发 |

### Slots

| 插槽          | 参数                                | 描述         |
| ------------- | ----------------------------------- | ------------ |
| `loading`     | -                                   | 加载状态插槽 |
| `error`       | `{ error: Error, retry: Function }` | 错误状态插槽 |
| `placeholder` | -                                   | 占位符插槽   |

### 示例

```vue
<script setup>
function handleLoad(component) {
  console.log('模板加载完成:', component)
}

function handleVisible() {
  console.log('模板进入可视区域')
}

function handleError(error) {
  console.error('模板加载失败:', error)
}
</script>

<template>
  <LazyTemplate
    category="login"
    device="desktop"
    template="default"
    :lazy="true"
    :placeholder-height="300"
    root-margin="50px"
    :threshold="0.1"
    @load="handleLoad"
    @visible="handleVisible"
    @error="handleError"
  >
    <template #loading>
      <div class="loading-spinner">加载中...</div>
    </template>

    <template #error="{ error, retry }">
      <div class="error-message">
        <p>加载失败: {{ error.message }}</p>
        <button @click="retry">重试</button>
      </div>
    </template>

    <template #placeholder>
      <div class="skeleton-loader" />
    </template>
  </LazyTemplate>
</template>
```

## 🆕 PerformanceMonitor

性能监控组件，提供实时性能指标显示。

### Props

| 属性             | 类型      | 默认值  | 描述             |
| ---------------- | --------- | ------- | ---------------- |
| `detailed`       | `boolean` | `false` | 是否显示详细信息 |
| `updateInterval` | `number`  | `1000`  | 更新间隔（毫秒） |
| `autoHide`       | `boolean` | `false` | 是否自动隐藏     |

### Events

| 事件     | 参数                    | 描述               |
| -------- | ----------------------- | ------------------ |
| `update` | `data: PerformanceData` | 性能数据更新时触发 |

### 示例

```vue
<script setup>
function handlePerformanceUpdate(data) {
  console.log('性能数据:', data)

  // 性能警告
  if (data.rendering?.fps < 30) {
    console.warn('FPS 过低:', data.rendering.fps)
  }

  if (data.memory?.percentage > 80) {
    console.warn('内存使用率过高:', `${data.memory.percentage}%`)
  }
}
</script>

<template>
  <div class="app">
    <!-- 你的应用内容 -->
    <TemplateRenderer
      category="login"
      :enable-performance-monitor="true"
      @performance-update="handlePerformanceUpdate"
    />

    <!-- 性能监控面板 -->
    <PerformanceMonitor
      :detailed="true"
      :update-interval="1000"
      @update="handlePerformanceUpdate"
    />
  </div>
</template>
```

## 类型定义

### PerformanceData

```typescript
interface PerformanceData {
  /** 内存使用情况 */
  memory?: {
    used: number
    total: number
    percentage: number
  }
  /** 渲染性能 */
  rendering?: {
    fps: number
    frameTime: number
  }
  /** 模板加载性能 */
  templates?: {
    cacheHits: number
    cacheMisses: number
    averageLoadTime: number
    preloadQueueSize: number
  }
}
```

### DeviceType

```typescript
type DeviceType = 'desktop' | 'tablet' | 'mobile'
```

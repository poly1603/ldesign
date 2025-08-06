# Vue Composables API

本文档介绍 LDesign Template 提供的 Vue Composables，包括最新的性能优化功能。

## useTemplate

模板管理 Composable，提供模板加载和管理功能。

### 用法

```typescript
import { useTemplate } from '@ldesign/template/vue'

const {
  currentTemplate,
  isLoading,
  error,
  loadTemplate,
  switchTemplate,
  clearCache,
} = useTemplate(options)
```

### 参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `options` | `UseTemplateOptions` | `{}` | 配置选项 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| `currentTemplate` | `Ref<TemplateMetadata \| null>` | 当前模板 |
| `isLoading` | `Ref<boolean>` | 是否正在加载 |
| `error` | `Ref<Error \| null>` | 错误信息 |
| `loadTemplate` | `Function` | 加载模板函数 |
| `switchTemplate` | `Function` | 切换模板函数 |
| `clearCache` | `Function` | 清空缓存函数 |

### 示例

```vue
<script setup>
import { useTemplate } from '@ldesign/template/vue'

const {
  currentTemplate,
  isLoading,
  error,
  loadTemplate,
  switchTemplate,
} = useTemplate({
  category: 'login',
  device: 'desktop',
  enableCache: true,
})

// 加载模板
const handleLoadTemplate = async () => {
  try {
    await loadTemplate('default')
  } catch (err) {
    console.error('加载失败:', err)
  }
}

// 切换模板
const handleSwitchTemplate = async (templateId) => {
  await switchTemplate(templateId)
}
</script>

<template>
  <div>
    <div v-if="isLoading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="currentTemplate">
      当前模板: {{ currentTemplate.name }}
    </div>
  </div>
</template>
```

## 🆕 useVirtualScroll

虚拟滚动 Composable，用于优化大量数据的渲染性能。

### 用法

```typescript
import { useVirtualScroll } from '@ldesign/template/vue'

const {
  containerRef,
  visibleItems,
  visibleRange,
  totalHeight,
  offsetY,
  scrollTop,
  handleScroll,
  scrollToItem,
  scrollToTop,
  scrollToBottom,
} = useVirtualScroll(items, options)
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `items` | `Ref<VirtualScrollItem[]>` | 数据列表 |
| `options` | `VirtualScrollOptions` | 配置选项 |

### VirtualScrollOptions

| 属性 | 类型 | 描述 |
|------|------|------|
| `containerHeight` | `number` | 容器高度 |
| `itemHeight` | `number` | 每项高度 |
| `buffer` | `number` | 缓冲区大小（可选，默认5） |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| `containerRef` | `Ref<HTMLElement>` | 容器引用 |
| `visibleItems` | `ComputedRef<VirtualScrollItem[]>` | 可见项目 |
| `visibleRange` | `ComputedRef<{start: number, end: number}>` | 可见范围 |
| `totalHeight` | `ComputedRef<number>` | 总高度 |
| `offsetY` | `ComputedRef<number>` | Y轴偏移量 |
| `scrollTop` | `Ref<number>` | 滚动位置 |
| `handleScroll` | `Function` | 滚动处理函数 |
| `scrollToItem` | `Function` | 滚动到指定项目 |
| `scrollToTop` | `Function` | 滚动到顶部 |
| `scrollToBottom` | `Function` | 滚动到底部 |

### 示例

```vue
<script setup>
import { ref } from 'vue'
import { useVirtualScroll } from '@ldesign/template/vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  // ... 更多数据
])

const {
  containerRef,
  visibleItems,
  totalHeight,
  handleScroll,
  scrollToItem,
} = useVirtualScroll(items, {
  containerHeight: 400,
  itemHeight: 60,
  buffer: 5,
})

const jumpToItem = (index) => {
  scrollToItem(index)
}
</script>

<template>
  <div>
    <button @click="jumpToItem(50)">跳转到第50项</button>
    
    <div
      ref="containerRef"
      class="virtual-container"
      :style="{ height: '400px', overflow: 'auto' }"
      @scroll="handleScroll"
    >
      <div
        class="virtual-content"
        :style="{ height: totalHeight + 'px', position: 'relative' }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="virtual-item"
          :style="{
            position: 'absolute',
            top: item.top + 'px',
            height: '60px',
            width: '100%',
          }"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
```

## 🆕 useSimpleVirtualScroll

简化版虚拟滚动 Composable，适用于简单的列表场景。

### 用法

```typescript
import { useSimpleVirtualScroll } from '@ldesign/template/vue'

const {
  containerRef,
  visibleItems,
  totalHeight,
  handleScroll,
} = useSimpleVirtualScroll(items, itemHeight, containerHeight)
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `items` | `Ref<any[]>` | 数据列表 |
| `itemHeight` | `number` | 每项高度 |
| `containerHeight` | `number` | 容器高度 |

### 示例

```vue
<script setup>
import { ref } from 'vue'
import { useSimpleVirtualScroll } from '@ldesign/template/vue'

const items = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
})))

const {
  containerRef,
  visibleItems,
  totalHeight,
  handleScroll,
} = useSimpleVirtualScroll(items, 50, 300)
</script>

<template>
  <div
    ref="containerRef"
    class="simple-virtual-container"
    :style="{ height: '300px', overflow: 'auto' }"
    @scroll="handleScroll"
  >
    <div
      class="virtual-content"
      :style="{ height: totalHeight + 'px', position: 'relative' }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="simple-item"
        :style="{
          position: 'absolute',
          top: item.top + 'px',
          height: '50px',
          width: '100%',
        }"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
```

## 类型定义

### UseTemplateOptions

```typescript
interface UseTemplateOptions {
  category?: string
  device?: DeviceType
  enableCache?: boolean
  cacheLimit?: number
}
```

### VirtualScrollItem

```typescript
interface VirtualScrollItem {
  id: string | number
  [key: string]: unknown
}
```

### VirtualScrollOptions

```typescript
interface VirtualScrollOptions {
  /** 容器高度 */
  containerHeight: number
  /** 每项高度 */
  itemHeight: number
  /** 缓冲区大小 */
  buffer?: number
}
```

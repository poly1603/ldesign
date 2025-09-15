# Loading 加载

用于页面和区块的加载中状态，支持自定义文本和遮罩层。

## 基础用法

最简单的加载状态。

<div>
  <l-button @click="toggleLoading">切换加载状态</l-button>
  <l-loading :loading="loading" text="加载中..." />
</div>

```vue
<template>
  <div>
    <l-button @click="toggleLoading">切换加载状态</l-button>
    <l-loading :loading="loading" text="加载中..." />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const toggleLoading = () => {
  loading.value = !loading.value
}
</script>
```

## 自定义加载文本

通过 `text` 属性或默认插槽自定义加载文本。

```vue
<template>
  <div>
    <!-- 使用 text 属性 -->
    <l-loading :loading="true" text="数据加载中..." />
    
    <!-- 使用默认插槽 -->
    <l-loading :loading="true">
      <div>
        <div>正在处理您的请求</div>
        <div style="font-size: 12px; color: #999;">请稍候...</div>
      </div>
    </l-loading>
  </div>
</template>
```

## 不同尺寸

通过 `size` 属性设置加载动画大小。

```vue
<template>
  <div style="display: flex; gap: 32px; align-items: center;">
    <l-loading :loading="true" size="small" text="小" />
    <l-loading :loading="true" size="medium" text="中" />
    <l-loading :loading="true" size="large" text="大" />
  </div>
</template>
```

## 无遮罩层

通过 `overlay` 属性控制是否显示遮罩层。

```vue
<template>
  <div style="position: relative; height: 200px; background: #f5f5f5; display: flex; align-items: center; justify-content: center;">
    <div>背景内容</div>
    <l-loading :loading="true" :overlay="false" text="无遮罩" />
  </div>
</template>
```

## 绝对定位

通过 `absolute` 属性使用绝对定位而非固定定位。

```vue
<template>
  <div style="position: relative; height: 300px; border: 1px solid #ddd;">
    <div style="padding: 20px;">
      <h3>容器内容</h3>
      <p>这是一个相对定位的容器</p>
    </div>
    <l-loading :loading="true" absolute text="区域加载中..." />
  </div>
</template>
```

## 局部加载

结合容器使用，实现局部区域的加载状态。

```vue
<template>
  <div>
    <l-card title="数据列表">
      <div style="position: relative; min-height: 200px;">
        <div v-if="!loading">
          <div v-for="item in data" :key="item.id" style="padding: 8px 0; border-bottom: 1px solid #eee;">
            {{ item.name }}
          </div>
        </div>
        <l-loading :loading="loading" absolute text="加载数据中..." />
      </div>
      <template #footer>
        <l-button @click="loadData" :disabled="loading">
          {{ loading ? '加载中...' : '加载数据' }}
        </l-button>
      </template>
    </l-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const data = ref([])

const loadData = async () => {
  loading.value = true
  
  // 模拟异步请求
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  data.value = [
    { id: 1, name: '数据项 1' },
    { id: 2, name: '数据项 2' },
    { id: 3, name: '数据项 3' }
  ]
  
  loading.value = false
}
</script>
```

## 全屏加载

默认情况下，Loading 组件会覆盖整个屏幕。

```vue
<template>
  <div>
    <l-button @click="showFullLoading">显示全屏加载</l-button>
    <l-loading :loading="fullLoading" text="全屏加载中..." />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fullLoading = ref(false)

const showFullLoading = () => {
  fullLoading.value = true
  
  setTimeout(() => {
    fullLoading.value = false
  }, 3000)
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| loading | 是否显示加载状态 | `boolean` | `true` |
| text | 加载文本 | `string` | `undefined` |
| size | 加载动画大小 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| overlay | 是否显示遮罩层 | `boolean` | `true` |
| absolute | 是否使用绝对定位 | `boolean` | `false` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 自定义加载文本内容 |

## 主题定制

Loading 组件使用以下 CSS 变量：

```css
.ld-loading {
  --ldesign-brand-color: #722ed1;
  --ldesign-text-color-secondary: #666666;
  --ldesign-font-size-xs: 12px;
  --ldesign-font-size-sm: 14px;
  --ldesign-font-size-base: 16px;
  --ldesign-spacing-sm: 8px;
  --ldesign-z-index-modal: 1050;
}
```

## 无障碍访问

- 加载状态会自动添加 `aria-busy="true"` 属性
- 支持屏幕阅读器识别加载状态
- 加载文本会被屏幕阅读器朗读

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const toggleLoading = () => {
  loading.value = !loading.value
}
</script>

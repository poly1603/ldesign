# Vue3 水印系统集成

本模块提供了完整的 Vue3 水印系统集成，包括组合式 API、组件、指令和插件等多种使用方式。

## 快速开始

### 安装插件

```typescript
import { createApp } from 'vue'
import { WatermarkPlugin } from '@ldesign/watermark/vue'
import App from './App.vue'

const app = createApp(App)

// 使用默认配置
app.use(WatermarkPlugin)

// 或者使用自定义配置
app.use(WatermarkPlugin, {
  globalConfig: {
    style: {
      fontSize: 16,
      color: '#000000',
      opacity: 0.1
    }
  },
  componentPrefix: 'L',
  directiveName: 'watermark'
})

app.mount('#app')
```

## 使用方式

### 1. 组合式 API (useWatermark)

```vue
<template>
  <div ref="container" class="watermark-container">
    <p>内容区域</p>
    <button @click="create">创建水印</button>
    <button @click="update">更新水印</button>
    <button @click="destroy">销毁水印</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWatermark } from '@ldesign/watermark/vue'

const container = ref()

const {
  instance,
  loading,
  error,
  isCreated,
  create,
  update,
  destroy
} = useWatermark(container)

const createWatermark = () => {
  create({
    content: '我的水印',
    style: {
      fontSize: 16,
      color: '#1890ff',
      opacity: 0.15
    }
  })
}
</script>
```

### 2. Watermark 组件

```vue
<template>
  <Watermark 
    :config="watermarkConfig"
    :security="true"
    :responsive="true"
    @created="onCreated"
    @error="onError"
  >
    <div class="content">
      <!-- 你的内容 -->
    </div>
  </Watermark>
</template>

<script setup>
import { ref } from 'vue'
import { Watermark } from '@ldesign/watermark/vue'

const watermarkConfig = ref({
  content: '版权所有',
  style: {
    fontSize: 14,
    color: '#000000',
    opacity: 0.1
  }
})

const onCreated = (instance) => {
  console.log('水印创建成功', instance)
}

const onError = (error) => {
  console.error('水印错误', error)
}
</script>
```

### 3. WatermarkProvider 组件

```vue
<template>
  <WatermarkProvider 
    :config="globalConfig"
    :global-security="true"
    :global-responsive="true"
  >
    <!-- 子组件会继承全局配置 -->
    <Watermark content="局部水印" />
    
    <div>
      <Watermark :config="{ content: '另一个水印' }" />
    </div>
  </WatermarkProvider>
</template>

<script setup>
import { ref } from 'vue'
import { WatermarkProvider, Watermark } from '@ldesign/watermark/vue'

const globalConfig = ref({
  style: {
    fontSize: 16,
    color: '#1890ff',
    opacity: 0.1
  },
  layout: {
    gapX: 100,
    gapY: 100
  }
})
</script>
```

### 4. v-watermark 指令

```vue
<template>
  <!-- 基础用法 -->
  <div v-watermark="'简单水印'">
    内容区域
  </div>

  <!-- 配置对象 -->
  <div v-watermark="watermarkConfig">
    内容区域
  </div>

  <!-- 使用修饰符 -->
  <div v-watermark.secure.responsive="watermarkConfig">
    安全且响应式的水印
  </div>

  <!-- 指定渲染器 -->
  <div v-watermark.canvas="watermarkConfig">
    使用 Canvas 渲染
  </div>
</template>

<script setup>
import { ref } from 'vue'

const watermarkConfig = ref({
  content: '指令水印',
  style: {
    fontSize: 14,
    color: '#52c41a',
    opacity: 0.2
  }
})
</script>
```

## API 参考

### useWatermark

组合式 API，提供完整的水印管理功能。

```typescript
function useWatermark(
  container?: Ref<Element | undefined> | Element,
  options?: UseWatermarkOptions
): UseWatermarkReturn
```

**参数：**
- `container`: 水印容器元素或 ref
- `options`: 配置选项

**返回值：**
- `instance`: 水印实例
- `loading`: 加载状态
- `error`: 错误信息
- `isCreated`: 是否已创建
- `create`: 创建水印方法
- `update`: 更新水印方法
- `destroy`: 销毁水印方法
- `pause`: 暂停水印方法
- `resume`: 恢复水印方法

### Watermark 组件

**Props：**
- `config`: 水印配置
- `security`: 是否启用安全模式
- `responsive`: 是否启用响应式
- `renderer`: 渲染器类型

**Events：**
- `created`: 水印创建成功
- `updated`: 水印更新成功
- `destroyed`: 水印销毁成功
- `error`: 发生错误

### WatermarkProvider 组件

**Props：**
- `config`: 全局水印配置
- `globalSecurity`: 全局安全模式
- `globalResponsive`: 全局响应式

### v-watermark 指令

**指令值：**
- `string`: 简单文本水印
- `WatermarkConfig`: 完整配置对象

**修饰符：**
- `.secure`: 启用安全模式
- `.responsive`: 启用响应式
- `.canvas`: 使用 Canvas 渲染器
- `.svg`: 使用 SVG 渲染器
- `.dom`: 使用 DOM 渲染器

### 插件选项

```typescript
interface WatermarkPluginOptions {
  globalConfig?: Partial<WatermarkConfig>
  componentPrefix?: string
  directiveName?: string
  registerComponents?: boolean
  registerDirective?: boolean
  registerGlobalMethods?: boolean
}
```

## 类型定义

所有的 TypeScript 类型定义都可以从 `@ldesign/watermark/vue` 导入：

```typescript
import type {
  UseWatermarkOptions,
  UseWatermarkReturn,
  WatermarkComponentProps,
  WatermarkProviderProps,
  WatermarkDirectiveValue,
  WatermarkPluginOptions
} from '@ldesign/watermark/vue'
```

## 最佳实践

### 1. 性能优化

- 使用 `WatermarkProvider` 避免重复配置
- 合理使用 `security` 和 `responsive` 选项
- 在不需要时及时销毁水印实例

### 2. 安全考虑

- 在敏感页面启用 `security` 模式
- 使用复杂的水印内容增加破解难度
- 定期更新水印内容

### 3. 响应式设计

- 启用 `responsive` 选项适配不同屏幕
- 使用相对单位设置字体大小
- 考虑移动端的显示效果

### 4. 错误处理

- 监听 `error` 事件处理异常情况
- 提供降级方案
- 记录错误日志便于调试

## 示例项目

查看 `examples/vue/` 目录下的完整示例项目，了解各种使用场景和最佳实践。
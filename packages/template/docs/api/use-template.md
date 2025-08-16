# useTemplate API

`useTemplate` 是一个 Vue 3 Composition API，提供响应式的模板管理功能。

## 基础用法

```typescript
import { useTemplate } from '@ldesign/template'

const { currentTemplate, loading, error, render, clearCache } = useTemplate()
```

## 返回值

### 响应式状态

#### `currentTemplate`

- **类型**: `Ref<TemplateComponent | null>`
- **描述**: 当前加载的模板组件
- **默认值**: `null`

#### `loading`

- **类型**: `Ref<boolean>`
- **描述**: 模板加载状态
- **默认值**: `false`

#### `error`

- **类型**: `Ref<Error | null>`
- **描述**: 加载错误信息
- **默认值**: `null`

### 方法

#### `render(options)`

加载并渲染指定模板。

**参数:**

- `options`: `TemplateRenderOptions` - 渲染选项

**返回值:** `Promise<TemplateLoadResult>`

**示例:**

```typescript
await render({
  category: 'auth',
  device: 'desktop',
  template: 'login',
  props: {
    title: '用户登录',
  },
})
```

#### `preload(templates)`

预加载模板列表。

**参数:**

- `templates`: `TemplateIdentifier[]` - 模板标识符列表

**返回值:** `Promise<void>`

**示例:**

```typescript
await preload([
  { category: 'auth', device: 'desktop', template: 'login' },
  { category: 'dashboard', device: 'desktop', template: 'admin' },
])
```

#### `clearCache(category?, device?, template?)`

清空缓存。

**参数:**

- `category` (可选): `string` - 模板分类
- `device` (可选): `DeviceType` - 设备类型
- `template` (可选): `string` - 模板名称

**示例:**

```typescript
// 清空所有缓存
clearCache()

// 清空指定模板缓存
clearCache('auth', 'desktop', 'login')
```

## 完整示例

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template'
import { ref } from 'vue'

const { currentTemplate, loading, error, render, clearCache } = useTemplate()

const templateProps = ref({
  title: '示例应用',
  onLogin: handleLogin,
})

const lastRenderOptions = ref(null)

async function loadLogin() {
  const options = {
    category: 'auth',
    device: 'desktop',
    template: 'login',
  }

  lastRenderOptions.value = options
  await render(options)
}

async function loadDashboard() {
  const options = {
    category: 'dashboard',
    device: 'desktop',
    template: 'admin',
  }

  lastRenderOptions.value = options
  await render(options)
}

function clearAll() {
  clearCache()
  currentTemplate.value = null
}

function retry() {
  if (lastRenderOptions.value) {
    render(lastRenderOptions.value)
  }
}

function handleLogin(credentials) {
  console.log('登录:', credentials)
}
</script>

<template>
  <div class="template-container">
    <div class="controls">
      <button @click="loadLogin">加载登录页</button>
      <button @click="loadDashboard">加载仪表板</button>
      <button @click="clearAll">清空缓存</button>
    </div>

    <div class="template-display">
      <div v-if="loading" class="loading">正在加载模板...</div>

      <div v-else-if="error" class="error">
        加载失败: {{ error.message }}
        <button @click="retry">重试</button>
      </div>

      <component
        :is="currentTemplate"
        v-else-if="currentTemplate"
        v-bind="templateProps"
        @login="handleLogin"
      />

      <div v-else class="empty">请选择一个模板</div>
    </div>
  </div>
</template>
```

## 高级用法

### 条件渲染

```typescript
import { useTemplate } from '@ldesign/template'
import { computed } from 'vue'

const { render } = useTemplate()

const userRole = ref('user')

const templateToLoad = computed(() => {
  const templateMap = {
    admin: 'admin-dashboard',
    user: 'user-dashboard',
    guest: 'guest-dashboard',
  }
  return templateMap[userRole.value]
})

// 监听角色变化，自动加载对应模板
watch(userRole, async newRole => {
  await render({
    category: 'dashboard',
    device: 'desktop',
    template: templateToLoad.value,
  })
})
```

### 错误处理

```typescript
const { render, error } = useTemplate()

async function loadTemplateWithErrorHandling() {
  try {
    await render({
      category: 'auth',
      device: 'desktop',
      template: 'login',
    })
  } catch (err) {
    console.error('模板加载失败:', err)

    // 尝试加载备用模板
    try {
      await render({
        category: 'auth',
        device: 'desktop',
        template: 'simple-login',
      })
    } catch (fallbackErr) {
      console.error('备用模板也加载失败:', fallbackErr)
    }
  }
}
```

### 性能优化

```typescript
import { useTemplate } from '@ldesign/template'
import { onMounted } from 'vue'

const { preload } = useTemplate()

// 应用启动时预加载常用模板
onMounted(async () => {
  await preload([
    { category: 'layout', device: 'desktop', template: 'header' },
    { category: 'layout', device: 'desktop', template: 'footer' },
    { category: 'auth', device: 'desktop', template: 'login' },
  ])
})
```

## 类型定义

### `TemplateRenderOptions`

```typescript
interface TemplateRenderOptions {
  category: string
  device?: DeviceType
  template: string
  props?: Record<string, any>
}
```

### `TemplateIdentifier`

```typescript
interface TemplateIdentifier {
  category: string
  device: DeviceType
  template: string
}
```

### `TemplateLoadResult`

```typescript
interface TemplateLoadResult {
  component: TemplateComponent
  metadata: TemplateMetadata
  fromCache: boolean
  loadTime: number
}
```

## 注意事项

1. **组件生命周期**: 确保在组件的 `setup()` 函数中调用 `useTemplate`
2. **错误处理**: 始终处理加载错误，提供用户友好的错误信息
3. **内存管理**: 适时清理不需要的缓存，避免内存泄漏
4. **性能优化**: 使用预加载功能提升用户体验

## 最佳实践

1. **统一错误处理**: 创建统一的错误处理逻辑
2. **加载状态管理**: 提供清晰的加载状态反馈
3. **缓存策略**: 根据应用需求制定合适的缓存策略
4. **类型安全**: 使用 TypeScript 确保类型安全

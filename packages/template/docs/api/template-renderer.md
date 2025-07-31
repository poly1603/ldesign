# TemplateRenderer API

`TemplateRenderer` 是一个 Vue 组件，用于渲染指定的模板。它提供了声明式的模板渲染方式。

## 基础用法

```vue
<template>
  <LTemplateRenderer
    category="auth"
    device="desktop"
    template="login"
    :template-props="loginProps"
    @load="onLoad"
    @error="onError"
  />
</template>
```

## 属性 (Props)

### `category`
- **类型**: `string`
- **必需**: 是
- **描述**: 模板分类

### `device`
- **类型**: `DeviceType`
- **必需**: 否
- **默认值**: 自动检测
- **描述**: 设备类型 (`'desktop'` | `'tablet'` | `'mobile'`)

### `template`
- **类型**: `string`
- **必需**: 是
- **描述**: 模板名称

### `templateProps`
- **类型**: `Record<string, any>`
- **必需**: 否
- **默认值**: `{}`
- **描述**: 传递给模板组件的属性

### `cache`
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否启用缓存

### `preload`
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 是否预加载模板

## 事件 (Events)

### `@load`
模板加载成功时触发。

**参数:**
- `component`: `TemplateComponent` - 加载的模板组件
- `metadata`: `TemplateMetadata` - 模板元数据

**示例:**
```vue
<LTemplateRenderer
  category="auth"
  template="login"
  @load="onTemplateLoad"
/>

<script setup>
function onTemplateLoad(component, metadata) {
  console.log('模板加载成功:', metadata.name)
}
</script>
```

### `@error`
模板加载失败时触发。

**参数:**
- `error`: `Error` - 错误对象

**示例:**
```vue
<LTemplateRenderer
  category="auth"
  template="login"
  @error="onTemplateError"
/>

<script setup>
function onTemplateError(error) {
  console.error('模板加载失败:', error.message)
}
</script>
```

### `@before-load`
模板开始加载前触发。

**参数:**
- `options`: `TemplateRenderOptions` - 渲染选项

### `@after-load`
模板加载完成后触发（无论成功或失败）。

## 插槽 (Slots)

### `#loading`
自定义加载状态。

**作用域参数:**
- `loading`: `boolean` - 加载状态

**示例:**
```vue
<LTemplateRenderer category="auth" template="login">
  <template #loading>
    <div class="custom-loading">
      <div class="spinner"></div>
      <p>正在加载模板...</p>
    </div>
  </template>
</LTemplateRenderer>
```

### `#error`
自定义错误状态。

**作用域参数:**
- `error`: `Error` - 错误对象
- `retry`: `Function` - 重试函数

**示例:**
```vue
<LTemplateRenderer category="auth" template="login">
  <template #error="{ error, retry }">
    <div class="custom-error">
      <h3>加载失败</h3>
      <p>{{ error.message }}</p>
      <button @click="retry">重试</button>
    </div>
  </template>
</LTemplateRenderer>
```

### `#empty`
自定义空状态（模板不存在时）。

**示例:**
```vue
<LTemplateRenderer category="auth" template="login">
  <template #empty>
    <div class="custom-empty">
      <p>未找到指定模板</p>
    </div>
  </template>
</LTemplateRenderer>
```

## 完整示例

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const selectedTemplate = ref('login')
const selectedDevice = ref('desktop')

const templateProps = computed(() => ({
  title: `${selectedTemplate.value} - ${selectedDevice.value}`,
  onSubmit: handleSubmit,
  onCancel: handleCancel
}))

function onTemplateLoad(component, metadata) {
  console.log('模板加载成功:', {
    name: metadata.name,
    version: metadata.config.version,
    device: metadata.device
  })
}

function onTemplateError(error) {
  console.error('模板加载失败:', error)
  // 可以在这里上报错误到监控系统
}

function onBeforeLoad(options) {
  console.log('开始加载模板:', options)
}

function handleSubmit(data) {
  console.log('表单提交:', data)
}

function handleCancel() {
  console.log('取消操作')
}

function resetTemplate() {
  selectedTemplate.value = 'login'
  selectedDevice.value = 'desktop'
}
</script>

<template>
  <div class="app">
    <div class="controls">
      <select v-model="selectedTemplate">
        <option value="login">
          登录页
        </option>
        <option value="register">
          注册页
        </option>
      </select>
      
      <select v-model="selectedDevice">
        <option value="desktop">
          桌面端
        </option>
        <option value="tablet">
          平板端
        </option>
        <option value="mobile">
          移动端
        </option>
      </select>
    </div>
    
    <div class="template-container">
      <LTemplateRenderer
        category="auth"
        :device="selectedDevice"
        :template="selectedTemplate"
        :template-props="templateProps"
        :cache="true"
        @load="onTemplateLoad"
        @error="onTemplateError"
        @before-load="onBeforeLoad"
      >
        <!-- 自定义加载状态 -->
        <template #loading>
          <div class="loading-container">
            <div class="loading-spinner" />
            <p>正在加载 {{ selectedTemplate }} 模板...</p>
          </div>
        </template>
        
        <!-- 自定义错误状态 -->
        <template #error="{ error, retry }">
          <div class="error-container">
            <h3>😞 加载失败</h3>
            <p>{{ error.message }}</p>
            <div class="error-actions">
              <button class="retry-btn" @click="retry">
                重新加载
              </button>
              <button class="reset-btn" @click="resetTemplate">
                重置
              </button>
            </div>
          </div>
        </template>
        
        <!-- 自定义空状态 -->
        <template #empty>
          <div class="empty-container">
            <h3>🤔 模板不存在</h3>
            <p>请检查模板配置是否正确</p>
          </div>
        </template>
      </LTemplateRenderer>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.template-container {
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #e74c3c;
  text-align: center;
  padding: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.retry-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #6c757d;
  text-align: center;
}
</style>
```

## 高级用法

### 动态模板切换

```vue
<script setup>
import { computed } from 'vue'

const currentCategory = ref('auth')
const currentTemplate = ref('login')

// 使用 key 强制重新渲染
const templateKey = computed(() => 
  `${currentCategory.value}-${currentTemplate.value}`
)

const dynamicProps = computed(() => ({
  // 根据模板类型返回不同的属性
  ...(currentTemplate.value === 'login' ? loginProps : registerProps)
}))
</script>

<template>
  <LTemplateRenderer
    :key="templateKey"
    :category="currentCategory"
    :template="currentTemplate"
    :template-props="dynamicProps"
  />
</template>
```

### 条件渲染

```vue
<script setup>
const shouldRenderTemplate = computed(() => {
  return userRole.value !== 'guest'
})
</script>

<template>
  <LTemplateRenderer
    v-if="shouldRenderTemplate"
    :category="category"
    :template="template"
    :template-props="templateProps"
  />
  
  <div v-else class="fallback">
    使用默认内容
  </div>
</template>
```

### 事件透传

```vue
<script setup>
// 定义组件事件
defineEmits(['submit', 'cancel', 'field-change'])
</script>

<template>
  <LTemplateRenderer
    category="form"
    template="contact"
    :template-props="formProps"
    @submit="$emit('submit', $event)"
    @cancel="$emit('cancel')"
    @field-change="$emit('field-change', $event)"
  />
</template>
```

## 性能优化

### 预加载

```vue
<template>
  <LTemplateRenderer
    category="dashboard"
    template="admin"
    :preload="true"
    :template-props="dashboardProps"
  />
</template>
```

### 缓存控制

```vue
<template>
  <!-- 禁用缓存，每次都重新加载 -->
  <LTemplateRenderer
    category="dynamic"
    template="realtime"
    :cache="false"
    :template-props="realtimeProps"
  />
</template>
```

## 注意事项

1. **属性响应性**: `templateProps` 的变化会自动传递给模板组件
2. **事件处理**: 模板组件触发的事件会自动向上冒泡
3. **生命周期**: 模板组件的生命周期与 `TemplateRenderer` 组件同步
4. **错误边界**: 建议使用 Vue 的错误边界处理模板渲染错误

## 最佳实践

1. **错误处理**: 始终提供自定义的错误状态
2. **加载状态**: 为长时间加载提供友好的加载提示
3. **类型安全**: 使用 TypeScript 定义模板属性类型
4. **性能监控**: 监听加载事件，跟踪性能指标

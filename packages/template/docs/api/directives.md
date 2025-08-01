# 指令 API

LDesign Template 提供了 `v-template` 指令，用于声明式地渲染模板。

## v-template 指令

### 基础用法

```vue
<script setup>
const templateConfig = {
  category: 'auth',
  device: 'desktop',
  template: 'login',
  props: {
    title: '用户登录'
  }
}
</script>

<template>
  <div v-template="templateConfig" />
</template>
```

### 指令值类型

#### 对象形式

```vue
<template>
  <div
    v-template="{
      category: 'dashboard',
      device: 'desktop',
      template: 'admin',
      props: {
        title: '管理后台',
        user: currentUser,
      },
    }"
  />
</template>
```

#### 字符串形式

```vue
<template>
  <!-- 使用默认设备和空属性 -->
  <div v-template="'auth/login'" />

  <!-- 指定设备 -->
  <div v-template="'auth/mobile/login'" />
</template>
```

#### 响应式配置

```vue
<script setup>
import { computed } from 'vue'

const userRole = ref('user')

const dynamicConfig = computed(() => ({
  category: 'dashboard',
  template: userRole.value === 'admin' ? 'admin' : 'user',
  props: {
    role: userRole.value
  }
}))
</script>

<template>
  <div v-template="dynamicConfig" />
</template>
```

## 配置选项

### `TemplateDirectiveConfig`

```typescript
interface TemplateDirectiveConfig {
  category: string
  device?: DeviceType
  template: string
  props?: Record<string, any>
  cache?: boolean
  onLoad?: (component: any) => void
  onError?: (error: Error) => void
}
```

### 属性说明

#### `category`

- **类型**: `string`
- **必需**: 是
- **描述**: 模板分类

#### `device`

- **类型**: `DeviceType`
- **必需**: 否
- **默认值**: 自动检测
- **描述**: 设备类型

#### `template`

- **类型**: `string`
- **必需**: 是
- **描述**: 模板名称

#### `props`

- **类型**: `Record<string, any>`
- **必需**: 否
- **默认值**: `{}`
- **描述**: 传递给模板的属性

#### `cache`

- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否启用缓存

#### `onLoad`

- **类型**: `(component: any) => void`
- **必需**: 否
- **描述**: 模板加载成功回调

#### `onError`

- **类型**: `(error: Error) => void`
- **必需**: 否
- **描述**: 模板加载失败回调

## 完整示例

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

// 主题切换
const selectedTheme = ref('light')

const themeConfig = computed(() => ({
  category: 'layout',
  template: selectedTheme.value,
  props: {
    title: `${selectedTheme.value} 主题`,
    content: '主题内容区域'
  }
}))

// 认证状态
const isAuthenticated = ref(false)

const authConfig = computed(() => ({
  category: 'auth',
  template: isAuthenticated.value ? 'profile' : 'login',
  props: {
    user: isAuthenticated.value ? { name: '用户' } : null,
    onLogin: handleLogin,
    onLogout: handleLogout
  }
}))

// 错误处理
const loadError = ref(null)

const errorConfig = computed(() => ({
  category: 'nonexistent',
  template: 'invalid',
  onError: (error) => {
    loadError.value = error
    console.error('模板加载失败:', error)
  }
}))

function toggleAuth() {
  isAuthenticated.value = !isAuthenticated.value
}

function handleLogin(credentials) {
  console.log('登录:', credentials)
  isAuthenticated.value = true
}

function handleLogout() {
  console.log('退出登录')
  isAuthenticated.value = false
}
</script>

<template>
  <div class="app">
    <h1>指令示例</h1>

    <!-- 基础用法 -->
    <div class="section">
      <h2>基础用法</h2>
      <div
        v-template="{
          category: 'greeting',
          template: 'hello',
          props: {
            title: '你好',
            message: '这是通过指令渲染的模板',
          },
        }"
      />
    </div>

    <!-- 动态配置 -->
    <div class="section">
      <h2>动态配置</h2>
      <div class="controls">
        <select v-model="selectedTheme">
          <option value="light">
            浅色主题
          </option>
          <option value="dark">
            深色主题
          </option>
        </select>
      </div>
      <div v-template="themeConfig" />
    </div>

    <!-- 条件渲染 -->
    <div class="section">
      <h2>条件渲染</h2>
      <div class="controls">
        <button @click="toggleAuth">
          {{ isAuthenticated ? '退出登录' : '登录' }}
        </button>
      </div>
      <div v-template="authConfig" />
    </div>

    <!-- 错误处理 -->
    <div class="section">
      <h2>错误处理</h2>
      <div v-template="errorConfig" />
      <div v-if="loadError" class="error-message">
        加载失败: {{ loadError.message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.section h2 {
  margin-top: 0;
  color: #333;
}

.controls {
  margin-bottom: 1rem;
}

.controls select,
.controls button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
```

## 高级用法

### 指令修饰符

虽然 `v-template` 指令本身不支持修饰符，但可以通过配置选项实现类似功能：

```vue
<template>
  <!-- 禁用缓存 -->
  <div
    v-template="{
      category: 'dynamic',
      template: 'realtime',
      cache: false,
    }"
  />

  <!-- 静默错误 -->
  <div
    v-template="{
      category: 'optional',
      template: 'feature',
      onError: () => {}, // 静默处理错误
    }"
  />
</template>
```

### 与其他指令结合

```vue
<script setup>
const templateConfigs = [
  {
    id: 1,
    category: 'card',
    template: 'product',
    props: { product: product1 }
  },
  {
    id: 2,
    category: 'card',
    template: 'product',
    props: { product: product2 }
  }
]
</script>

<template>
  <!-- 条件渲染 -->
  <div
    v-if="showTemplate"
    v-template="templateConfig"
  />

  <!-- 列表渲染 -->
  <div
    v-for="config in templateConfigs"
    :key="config.id"
    v-template="config"
  />

  <!-- 动画过渡 -->
  <transition name="template-fade">
    <div
      v-if="currentTemplate"
      v-template="currentTemplate"
    />
  </transition>
</template>

<style>
.template-fade-enter-active,
.template-fade-leave-active {
  transition: opacity 0.3s;
}

.template-fade-enter-from,
.template-fade-leave-to {
  opacity: 0;
}
</style>
```

### 自定义指令包装

```vue
<script setup>
// 在应用中注册自定义指令
app.directive('auth-template', {
  mounted(el, binding) {
    const config = {
      category: 'auth',
      template: binding.value,
      props: {
        onLogin: handleLogin
      }
    }
    // 使用 v-template 指令的逻辑
  }
})

app.directive('dashboard-template', {
  mounted(el, binding) {
    const config = {
      category: 'dashboard',
      template: binding.value === 'admin' ? 'admin' : 'user',
      props: {
        role: binding.value
      }
    }
    // 使用 v-template 指令的逻辑
  }
})
</script>

<template>
  <!-- 创建自定义指令简化使用 -->
  <div v-auth-template="'login'" />
  <div v-dashboard-template="userRole" />
</template>
```

## 性能考虑

### 避免频繁更新

```vue
<script setup>
const stableConfig = computed(() => ({
  category: 'dashboard',
  template: 'admin',
  props: {
    data: processedData.value
  }
}))
</script>

<template>
  <!-- ❌ 避免：每次都创建新对象 -->
  <div
    v-template="{
      category: 'dashboard',
      template: 'admin',
      props: { timestamp: Date.now() },
    }"
  />

  <!-- ✅ 推荐：使用计算属性 -->
  <div v-template="stableConfig" />
</template>
```

### 缓存控制

```vue
<template>
  <!-- 对于静态内容启用缓存 -->
  <div
    v-template="{
      category: 'static',
      template: 'about',
      cache: true,
    }"
  />

  <!-- 对于动态内容禁用缓存 -->
  <div
    v-template="{
      category: 'dynamic',
      template: 'live-data',
      cache: false,
    }"
  />
</template>
```

## 错误处理

### 全局错误处理

```typescript
// 在应用配置中设置全局错误处理
app.config.globalProperties.$templateErrorHandler = (error, config) => {
  console.error('模板指令错误:', error)
  // 上报到错误监控系统
  errorReporting.captureException(error, {
    extra: { templateConfig: config }
  })
}
```

### 组件级错误处理

```vue
<script setup>
const templateConfigWithErrorHandling = computed(() => ({
  category: 'feature',
  template: 'advanced',
  onError: (error) => {
    // 组件级错误处理
    console.warn('功能模板加载失败，使用备用方案')

    // 可以触发备用模板加载
    loadFallbackTemplate()
  }
}))

function loadFallbackTemplate() {
  // 加载备用模板的逻辑
}
</script>

<template>
  <div v-template="templateConfigWithErrorHandling" />
</template>
```

## 最佳实践

1. **配置稳定性**: 使用计算属性避免不必要的重新渲染
2. **错误处理**: 始终提供错误处理回调
3. **性能优化**: 合理使用缓存机制
4. **类型安全**: 使用 TypeScript 定义配置类型
5. **调试友好**: 在开发环境提供详细的错误信息

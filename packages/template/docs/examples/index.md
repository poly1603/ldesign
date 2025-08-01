# 示例

这里提供了一系列实用的示例，帮助你快速理解和使用 LDesign Template 的各种功能。

## 🚀 基础示例

### [基础用法](./basic.md)

学习如何创建和使用第一个模板，包括模板组件、配置文件和基本渲染。

```vue
<LTemplateRenderer
  category="login"
  device="desktop"
  template="classic"
/>
```

### [响应式模板](./responsive.md)

了解如何创建适配不同设备的响应式模板，实现一套代码多端适配。

```vue
<!-- 自动根据设备选择合适的模板 -->
<LTemplateRenderer
  category="dashboard"
  template="admin"
/>
```

### [动态切换](./dynamic.md)

掌握如何在运行时动态切换模板，实现主题切换、布局变更等功能。

```vue
<template>
  <div>
    <select v-model="currentTheme" @change="switchTheme">
      <option value="classic">
        经典主题
      </option>
      <option value="modern">
        现代主题
      </option>
      <option value="dark">
        暗黑主题
      </option>
    </select>

    <LTemplateRenderer
      category="layout"
      :template="currentTheme"
    />
  </div>
</template>
```

## 🎨 进阶示例

### [自定义组件](./custom.md)

学习如何创建复杂的自定义模板组件，包括状态管理、事件处理和插槽使用。

```vue
<!-- 带有复杂交互的模板 -->
<LTemplateRenderer
  category="form"
  template="wizard"
  :template-props="{
    steps: formSteps,
    onStepChange: handleStepChange,
    onSubmit: handleSubmit
  }"
>
  <template #header>
    <h2>表单向导</h2>
  </template>

  <template #footer="{ currentStep, totalSteps }">
    <div>步骤 {{ currentStep }} / {{ totalSteps }}</div>
  </template>
</LTemplateRenderer>
```

### [完整应用](./full-app.md)

查看一个完整的应用示例，展示如何在实际项目中组织和使用模板系统。

## 📱 设备适配示例

### 桌面端模板

```vue
<!-- src/templates/dashboard/desktop/admin/index.vue -->
<template>
  <div class="desktop-dashboard">
    <aside class="sidebar">
      <!-- 侧边栏导航 -->
    </aside>
    <main class="main-content">
      <!-- 主要内容区域 -->
    </main>
  </div>
</template>
```

### 移动端模板

```vue
<!-- src/templates/dashboard/mobile/admin/index.vue -->
<template>
  <div class="mobile-dashboard">
    <header class="mobile-header">
      <!-- 移动端头部 -->
    </header>
    <main class="mobile-main">
      <!-- 移动端主要内容 -->
    </main>
    <nav class="bottom-nav">
      <!-- 底部导航 -->
    </nav>
  </div>
</template>
```

## 🔧 实用工具示例

### 设备检测

```typescript
import { createDeviceWatcher, detectDevice } from '@ldesign/template'

// 监听设备变化
const watcher = createDeviceWatcher((newDevice, oldDevice) => {
  console.log(`设备从 ${oldDevice} 切换到 ${newDevice}`)
  // 可以在这里触发模板重新渲染
})

// 手动检测当前设备
const currentDevice = detectDevice()
console.log('当前设备:', currentDevice)
```

### 缓存管理

```typescript
import { TemplateCache } from '@ldesign/template'

// 创建自定义缓存
const cache = new TemplateCache(50, 10 * 60 * 1000) // 50个项目，10分钟TTL

// 手动缓存模板
cache.setComponent('login', 'desktop', 'classic', LoginComponent)

// 获取缓存统计
const stats = cache.getStats()
console.log('缓存命中率:', stats.hits / (stats.hits + stats.misses))
```

## 🎪 高级用法示例

### 模板继承

```typescript
// 基础模板配置
const baseConfig = {
  version: '1.0.0',
  author: 'LDesign Team',
  compatibility: {
    vue: '>=3.2.0'
  }
}

// 继承基础配置
export const config = {
  ...baseConfig,
  name: 'modern-login',
  title: '现代登录页',
  category: 'login',
  device: 'desktop'
}
```

### 模板组合

```vue
<template>
  <div class="composite-template">
    <!-- 头部模板 -->
    <LTemplateRenderer
      category="layout"
      template="header"
      :template-props="headerProps"
    />

    <!-- 主要内容模板 -->
    <LTemplateRenderer
      category="content"
      :template="contentTemplate"
      :template-props="contentProps"
    />

    <!-- 底部模板 -->
    <LTemplateRenderer
      category="layout"
      template="footer"
      :template-props="footerProps"
    />
  </div>
</template>
```

### 条件渲染

```vue
<template>
  <div>
    <!-- 根据用户权限渲染不同模板 -->
    <LTemplateRenderer
      v-if="userRole === 'admin'"
      category="dashboard"
      template="admin"
    />

    <LTemplateRenderer
      v-else-if="userRole === 'user'"
      category="dashboard"
      template="user"
    />

    <LTemplateRenderer
      v-else
      category="auth"
      template="login"
    />
  </div>
</template>
```

## 🔍 调试示例

### 开发模式调试

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  debug: true, // 启用调试模式
  logLevel: 'debug' // 设置日志级别
})

// 监听所有事件
manager.on('*', (event) => {
  console.log('模板事件:', event)
})
```

### 错误处理

```vue
<script setup>
function handleError(error) {
  console.error('模板错误:', error)
  // 可以上报错误到监控系统
}

function handleLoad(component) {
  console.log('模板加载成功:', component)
  // 可以记录加载时间等性能指标
}
</script>

<template>
  <LTemplateRenderer
    category="dashboard"
    template="admin"
    @error="handleError"
    @load="handleLoad"
  >
    <!-- 加载状态 -->
    <template #loading>
      <div class="loading">
        正在加载模板...
      </div>
    </template>

    <!-- 错误状态 -->
    <template #error="{ error, retry }">
      <div class="error">
        <p>模板加载失败: {{ error.message }}</p>
        <button @click="retry">
          重试
        </button>
      </div>
    </template>

    <!-- 空状态 -->
    <template #empty>
      <div class="empty">
        未找到指定模板
      </div>
    </template>
  </LTemplateRenderer>
</template>
```

## 📊 性能优化示例

### 预加载策略

```typescript
import { useTemplate } from '@ldesign/template'

const { preload } = useTemplate()

// 在应用启动时预加载常用模板
preload([
  { category: 'layout', template: 'header' },
  { category: 'layout', template: 'footer' },
  { category: 'dashboard', template: 'admin' }
])
```

### 懒加载实现

```vue
<template>
  <div>
    <!-- 只有在需要时才加载模板 -->
    <LTemplateRenderer
      v-if="showDashboard"
      category="dashboard"
      template="admin"
      :cache="true"
    />
  </div>
</template>
```

## 🎯 最佳实践示例

查看 [最佳实践](../guide/best-practices.md) 了解更多关于：

- 模板组织结构
- 命名规范
- 性能优化
- 错误处理
- 测试策略

## 🔗 相关链接

- [API 参考](../api/) - 完整的 API 文档
- [指南](../guide/installation) - 详细的使用指南
- [GitHub 仓库](https://github.com/ldesign/template) - 源代码和更多示例

# 基础用法示例

本页面展示 `@ldesign/template` 的基础使用方法和常见场景。

## 简单的登录表单

### 创建模板文件

首先创建不同设备的登录模板：

::: code-group

```vue [desktop/LoginForm.vue]
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const username = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('登录成功:', { username: username.value, remember: remember.value })
    alert('登录成功！')
  }
  catch (error) {
    console.error('登录失败:', error)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-form-desktop">
    <div class="login-container">
      <h2>{{ title || '用户登录' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" required>
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" required>
        </div>
        <div class="form-options">
          <label>
            <input v-model="remember" type="checkbox">
            记住我
          </label>
          <a href="#" class="forgot-link">忘记密码？</a>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-form-desktop {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

```vue [mobile/LoginForm.vue]
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const username = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('登录成功:', { username: username.value, remember: remember.value })
    alert('登录成功！')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-form-mobile">
    <div class="login-container">
      <h2>{{ title || '登录' }}</h2>
      <form @submit.prevent="handleSubmit">
        <input v-model="username" type="text" placeholder="用户名" required>
        <input v-model="password" type="password" placeholder="密码" required>
        <label class="remember">
          <input v-model="remember" type="checkbox">
          记住我
        </label>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <a href="#" class="forgot-link">忘记密码？</a>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-form-mobile {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  display: flex;
  align-items: center;
}

.login-container {
  background: white;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.login-container h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.login-container input[type="text"],
.login-container input[type="password"] {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

button {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.forgot-link {
  display: block;
  text-align: center;
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}
</style>
```

:::

### 使用模板

#### 方式一：组件方式

```vue
<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template/vue'

function onLoaded(component: any) {
  console.log('模板加载成功:', component)
}

function onError(error: Error) {
  console.error('模板加载失败:', error)
}
</script>

<template>
  <div id="app">
    <TemplateRenderer
      template="login"
      :template-props="{ title: '欢迎登录' }"
      @template-loaded="onLoaded"
      @template-error="onError"
    />
  </div>
</template>
```

#### 方式二：组合式API

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'

const { templateComponent, loading, error } = useTemplate({
  template: 'login',
  autoLoad: true
})
</script>

<template>
  <div>
    <div v-if="loading">
      加载中...
    </div>
    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>
    <component :is="templateComponent" v-else-if="templateComponent" title="动态登录" />
  </div>
</template>
```

#### 方式三：指令方式

```vue
<template>
  <div>
    <!-- 自动检测设备 -->
    <div v-template="'login'" />

    <!-- 指定设备类型 -->
    <div v-template="{ template: 'login', deviceType: 'mobile' }" />
  </div>
</template>
```

## 响应式仪表板

### 创建仪表板模板

::: code-group

```vue [desktop/Dashboard.vue]
<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const stats = reactive([
  { label: '总访问量', value: '12,345', change: '+12.5%', trend: 'positive', icon: '👥' },
  { label: '新用户', value: '1,234', change: '+8.2%', trend: 'positive', icon: '🆕' },
  { label: '转化率', value: '3.45%', change: '-2.1%', trend: 'negative', icon: '📈' },
  { label: '收入', value: '¥45,678', change: '+15.3%', trend: 'positive', icon: '💰' }
])

const chartData = ref([65, 45, 78, 52, 89, 67, 43, 76, 58, 91])

function refresh() {
  console.log('刷新数据')
  // 模拟数据更新
  stats.forEach((stat) => {
    const change = (Math.random() * 20 - 10).toFixed(1)
    stat.change = `${change > 0 ? '+' : ''}${change}%`
    stat.trend = change > 0 ? 'positive' : 'negative'
  })
}

function openSettings() {
  console.log('打开设置')
}
</script>

<template>
  <div class="dashboard-desktop">
    <header class="dashboard-header">
      <h1>{{ title || '仪表板' }}</h1>
      <div class="actions">
        <button @click="refresh">
          刷新
        </button>
        <button @click="openSettings">
          设置
        </button>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-icon">
            {{ stat.icon }}
          </div>
          <div class="stat-content">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.label }}</p>
            <span class="stat-change" :class="stat.trend">{{ stat.change }}</span>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>访问趋势</h3>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div
                v-for="height in chartData" :key="height" class="bar"
                :style="{ height: `${height}%` }"
              />
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>用户分布</h3>
          <div class="chart-placeholder">
            <div class="pie-chart" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-desktop {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.stat-content p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.stat-change {
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.stat-change.positive {
  background: #d4edda;
  color: #155724;
}

.stat-change.negative {
  background: #f8d7da;
  color: #721c24;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 200px;
}

.bar {
  background: #667eea;
  width: 20px;
  border-radius: 2px 2px 0 0;
}

.pie-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(#667eea 0deg 120deg, #48bb78 120deg 240deg, #ed8936 240deg 360deg);
  margin: 0 auto;
}
</style>
```

```vue [mobile/Dashboard.vue]
<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const stats = reactive([
  { label: '访问量', value: '12.3K', change: '+12.5%', trend: 'positive', icon: '👥' },
  { label: '新用户', value: '1.2K', change: '+8.2%', trend: 'positive', icon: '🆕' },
  { label: '转化率', value: '3.45%', change: '-2.1%', trend: 'negative', icon: '📈' },
  { label: '收入', value: '¥45.7K', change: '+15.3%', trend: 'positive', icon: '💰' }
])

const chartData = ref([65, 45, 78, 52, 89, 67, 43])

function refresh() {
  console.log('刷新移动端数据')
  stats.forEach((stat) => {
    const change = (Math.random() * 20 - 10).toFixed(1)
    stat.change = `${change > 0 ? '+' : ''}${change}%`
    stat.trend = change > 0 ? 'positive' : 'negative'
  })
}
</script>

<template>
  <div class="dashboard-mobile">
    <header class="dashboard-header">
      <h1>{{ title || '仪表板' }}</h1>
      <button class="refresh-btn" @click="refresh">
        🔄
      </button>
    </header>

    <main class="dashboard-content">
      <!-- 统计卡片 - 移动端2列布局 -->
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-icon">
            {{ stat.icon }}
          </div>
          <div class="stat-content">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.label }}</p>
            <span class="stat-change" :class="stat.trend">{{ stat.change }}</span>
          </div>
        </div>
      </div>

      <!-- 简化的图表 -->
      <div class="chart-card">
        <h3>访问趋势</h3>
        <div class="mini-chart">
          <div
            v-for="height in chartData.slice(0, 7)" :key="height" class="bar"
            :style="{ height: `${height}%` }"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-mobile {
  padding: 1rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.dashboard-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.stat-content p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.8rem;
}

.stat-change {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.stat-change.positive {
  background: #d4edda;
  color: #155724;
}

.stat-change.negative {
  background: #f8d7da;
  color: #721c24;
}

.chart-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mini-chart {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 100px;
  margin-top: 1rem;
}

.bar {
  background: #667eea;
  flex: 1;
  border-radius: 2px 2px 0 0;
}
</style>
```

:::

### 使用响应式仪表板

```vue
<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template/vue'
import { onMounted, ref } from 'vue'

const currentDevice = ref('desktop')

function updateDevice() {
  const width = window.innerWidth
  if (width <= 768) {
    currentDevice.value = 'mobile'
  }
  else if (width <= 1024) {
    currentDevice.value = 'tablet'
  }
  else {
    currentDevice.value = 'desktop'
  }
}

onMounted(() => {
  updateDevice()
  window.addEventListener('resize', updateDevice)
})
</script>

<template>
  <div id="app">
    <!-- 自动根据设备类型选择模板 -->
    <TemplateRenderer
      template="dashboard"
      :template-props="{ title: '数据仪表板' }"
    />

    <!-- 显示当前设备信息 -->
    <div class="device-info">
      当前设备: {{ currentDevice }}
    </div>
  </div>
</template>

<style>
.device-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
```

## 高级用法

### 预加载和缓存

```vue
<script setup lang="ts">
import { useTemplate, useTemplateCache } from '@ldesign/template/vue'

// 预加载关键模板
const { preloadTemplate } = useTemplate()
const { preloadTemplates, cacheStats } = useTemplateCache()

// 预加载登录模板的所有设备版本
await preloadTemplates([
  { category: 'login', deviceType: 'desktop' },
  { category: 'login', deviceType: 'mobile' },
  { category: 'login', deviceType: 'tablet' }
])

// 监控缓存状态
console.log('缓存命中率:', cacheStats.value.hitRate)
</script>
```

### 错误处理和回退

```vue
<script setup lang="ts">
import { ref } from 'vue'

const showError = ref(false)
const errorMessage = ref('')

function handleError(error: Error) {
  console.error('模板错误:', error)
  showError.value = true
  errorMessage.value = error.message
}

function retry() {
  showError.value = false
  // 重新加载模板
  location.reload()
}
</script>

<template>
  <div>
    <TemplateRenderer
      template="dashboard"
      @template-error="handleError"
    />

    <!-- 错误回退UI -->
    <div v-if="showError" class="error-fallback">
      <h3>模板加载失败</h3>
      <p>{{ errorMessage }}</p>
      <button @click="retry">
        重试
      </button>
    </div>
  </div>
</template>
```

### 性能监控

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'

const { manager } = useTemplate()

// 监听性能事件
manager.on('performance:warning', (data) => {
  console.warn('性能警告:', data)

  if (data.type === 'slow_loading') {
    // 处理加载缓慢的情况
    console.log('模板加载缓慢:', data.template)
  }
})

// 获取性能报告
const report = manager.getPerformanceReport()
console.log('性能报告:', report)
</script>
```

## 最佳实践

### 1. 模板组织

```
src/templates/
├── auth/                 # 认证相关
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── dashboard/            # 仪表板
│   ├── admin/
│   ├── user/
│   └── analytics/
└── common/              # 通用组件
    ├── header/
    ├── footer/
    └── sidebar/
```

### 2. 性能优化

```typescript
// 配置预加载策略
const config = {
  loader: {
    preloadStrategy: 'critical', // 预加载关键模板
    enableCache: true,
    maxCacheSize: 50
  },
  performance: {
    enabled: true,
    sampleRate: 0.1 // 10% 采样率
  }
}
```

### 3. 错误边界

```vue
<script setup lang="ts">
import { ErrorBoundary } from '@/components/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <TemplateRenderer template="dashboard" />
  </ErrorBoundary>
</template>
```

这些示例展示了 `@ldesign/template` 的基础用法，从简单的登录表单到复杂的响应式仪表板，帮助你快速上手并掌握核心功能。

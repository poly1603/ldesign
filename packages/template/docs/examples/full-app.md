# 完整应用示例

本示例展示如何构建一个完整的企业级应用，充分利用 `@ldesign/template` 的所有功能特性。

## 🏗️ 项目概览

我们将构建一个企业管理系统，包含以下功能模块：

- **用户认证**：登录、注册、密码重置
- **仪表板**：数据概览、图表展示
- **用户管理**：用户列表、用户详情、权限管理
- **系统设置**：配置管理、主题切换

## 📁 项目结构

```
enterprise-app/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── App.vue                    # 根组件
│   ├── router/                    # 路由配置
│   │   └── index.ts
│   ├── store/                     # 状态管理
│   │   ├── index.ts
│   │   ├── modules/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   └── settings.ts
│   ├── templates/                 # 模板目录
│   │   ├── auth/                  # 认证模板
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── dashboard/             # 仪表板模板
│   │   │   ├── overview/
│   │   │   ├── analytics/
│   │   │   └── reports/
│   │   ├── user-management/       # 用户管理模板
│   │   │   ├── user-list/
│   │   │   ├── user-detail/
│   │   │   └── user-permissions/
│   │   └── settings/              # 设置模板
│   │       ├── general/
│   │       ├── security/
│   │       └── appearance/
│   ├── components/                # 通用组件
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   └── Common/
│   ├── composables/               # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   └── useTheme.ts
│   ├── services/                  # API 服务
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── user.ts
│   └── utils/                     # 工具函数
│       ├── constants.ts
│       ├── helpers.ts
│       └── validators.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🚀 应用入口配置

### main.ts

```typescript
import { TemplatePlugin } from '@ldesign/template/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import routes from './router'
import { useAuthStore } from './store/modules/auth'

// 创建应用实例
const app = createApp(App)

// 状态管理
const pinia = createPinia()
app.use(pinia)

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  else {
    next()
  }
})

app.use(router)

// 模板系统配置
app.use(TemplatePlugin, {
  // 组件配置
  componentName: 'TemplateRenderer',
  registerGlobalComponent: true,
  registerDirectives: true,

  // 扫描器配置
  scanner: {
    scanPaths: [
      'src/templates/**/*.vue'
    ],
    enableCache: true,
    watchMode: import.meta.env.DEV
  },

  // 加载器配置
  loader: {
    enableCache: true,
    maxCacheSize: 100,
    preloadStrategy: 'critical',
    timeout: 5000
  },

  // 设备适配配置
  deviceAdapter: {
    autoDetect: true,
    watchDeviceChange: true,
    customDetector: () => {
      const width = window.innerWidth
      const userAgent = navigator.userAgent

      // 自定义设备检测逻辑
      if (/Mobile|Android|iPhone/.test(userAgent) && width <= 480) {
        return 'mobile'
      }

      if (/iPad|Tablet/.test(userAgent) || (width <= 1024 && width > 768)) {
        return 'tablet'
      }

      return 'desktop'
    }
  },

  // 缓存配置
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30分钟
    compression: true
  },

  // 性能监控
  performance: {
    enabled: true,
    sampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    reportInterval: 60000
  },

  // 调试模式
  debug: import.meta.env.DEV
})

// 挂载应用
app.mount('#app')
```

### App.vue

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppNavigation from './components/Layout/AppNavigation.vue'
import AppNotifications from './components/Layout/AppNotifications.vue'

import PerformancePanel from './components/Layout/PerformancePanel.vue'
import { useAuthStore } from './store/modules/auth'
import { useSettingsStore } from './store/modules/settings'

// 状态管理
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const route = useRoute()

// 模板系统
const { manager } = useTemplate()

// 响应式状态
const isInitializing = ref(true)

// 计算属性
const showNavigation = computed(() => {
  return authStore.isAuthenticated && !route.meta.hideNavigation
})

const themeClass = computed(() => {
  return `theme-${settingsStore.theme}`
})

const showPerformancePanel = computed(() => {
  return import.meta.env.DEV && settingsStore.showPerformancePanel
})

// 方法
function getTransitionName(route: any) {
  return route.meta.transition || 'fade'
}

async function initializeApp() {
  try {
    // 初始化认证状态
    await authStore.initializeAuth()

    // 加载用户设置
    if (authStore.isAuthenticated) {
      await settingsStore.loadUserSettings()
    }

    // 预加载关键模板
    await manager.preloadTemplates([
      { category: 'dashboard', deviceType: 'desktop' },
      { category: 'auth', deviceType: 'desktop' }
    ])
  }
  catch (error) {
    console.error('应用初始化失败:', error)
  }
  finally {
    isInitializing.value = false
  }
}

// 性能监控
function setupPerformanceMonitoring() {
  manager.on('performance:warning', (data) => {
    console.warn('性能警告:', data)

    // 发送到监控系统
    if (import.meta.env.PROD) {
      // analytics.track('performance_warning', data)
    }
  })

  manager.on('template:error', (error) => {
    console.error('模板错误:', error)

    // 错误上报
    if (import.meta.env.PROD) {
      // errorReporting.captureException(error)
    }
  })
}

// 生命周期
onMounted(async () => {
  setupPerformanceMonitoring()
  await initializeApp()
})
</script>

<template>
  <div id="app" :class="themeClass">
    <!-- 全局加载状态 -->
    <div v-if="isInitializing" class="app-loading">
      <div class="loading-spinner" />
      <p>应用初始化中...</p>
    </div>

    <!-- 主应用内容 -->
    <div v-else class="app-container">
      <!-- 导航栏 -->
      <AppNavigation v-if="showNavigation" />

      <!-- 主要内容区域 -->
      <main class="app-main" :class="{ 'with-navigation': showNavigation }">
        <router-view v-slot="{ Component, route }">
          <transition :name="getTransitionName(route)" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>

      <!-- 全局通知 -->
      <AppNotifications />

      <!-- 性能监控面板（开发模式） -->
      <PerformancePanel v-if="showPerformancePanel" />
    </div>
  </div>
</template>

<style scoped>
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding: 1rem;
  transition: margin-left 0.3s ease;
}

.app-main.with-navigation {
  margin-left: 250px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 主题样式 */
.theme-light {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e2e8f0;
  --primary-color: #007bff;
}

.theme-dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --border-color: #404040;
  --primary-color: #4dabf7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-main.with-navigation {
    margin-left: 0;
  }
}
</style>
```

## 🔐 认证模块

### 登录模板

```vue
<!-- src/templates/auth/login/desktop/LoginForm.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { validateLoginForm } from '@/utils/validators'

interface Props {
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: '/dashboard'
})

const emit = defineEmits<{
  loginSuccess: [user: any]
  loginError: [error: Error]
}>()

// 状态管理
const authStore = useAuthStore()
const router = useRouter()

// 响应式状态
const isLoading = ref(false)
const showPassword = ref(false)
const form = reactive({
  username: '',
  password: '',
  remember: false
})
const errors = ref<Record<string, string>>({})

// 方法
async function handleLogin() {
  // 表单验证
  const validationResult = validateLoginForm(form)
  if (!validationResult.isValid) {
    errors.value = validationResult.errors
    return
  }

  errors.value = {}
  isLoading.value = true

  try {
    const user = await authStore.login({
      username: form.username,
      password: form.password,
      remember: form.remember
    })

    emit('loginSuccess', user)

    // 登录成功后跳转
    await router.push(props.redirectTo)
  }
  catch (error) {
    console.error('登录失败:', error)
    emit('loginError', error as Error)

    // 显示错误信息
    if (error.response?.status === 401) {
      errors.value.general = '用户名或密码错误'
    }
    else {
      errors.value.general = '登录失败，请稍后重试'
    }
  }
  finally {
    isLoading.value = false
  }
}

async function handleSocialLogin(provider: string) {
  try {
    await authStore.socialLogin(provider)
    await router.push(props.redirectTo)
  }
  catch (error) {
    console.error(`${provider} 登录失败:`, error)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.png" alt="Logo" class="logo">
        <h1>企业管理系统</h1>
        <p>请登录您的账户</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            :class="{ error: errors.username }"
            required
          >
          <span v-if="errors.username" class="error-message">
            {{ errors.username }}
          </span>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :class="{ error: errors.password }"
              required
            >
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-message">
            {{ errors.password }}
          </span>
        </div>

        <div class="form-options">
          <label class="checkbox">
            <input v-model="form.remember" type="checkbox">
            <span class="checkmark" />
            记住我
          </label>

          <router-link to="/forgot-password" class="forgot-link">
            忘记密码？
          </router-link>
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner" />
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <div class="register-link">
          还没有账户？
          <router-link to="/register">
            立即注册
          </router-link>
        </div>
      </form>

      <!-- 第三方登录 -->
      <div class="social-login">
        <div class="divider">
          <span>或使用以下方式登录</span>
        </div>

        <div class="social-buttons">
          <button class="social-btn google" @click="handleSocialLogin('google')">
            <img src="/icons/google.svg" alt="Google">
            Google
          </button>

          <button class="social-btn github" @click="handleSocialLogin('github')">
            <img src="/icons/github.svg" alt="GitHub">
            GitHub
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}

.login-header h1 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.5rem;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error {
  border-color: #e53e3e;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox input {
  margin-right: 0.5rem;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background: #5a67d8;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.social-login {
  margin-top: 2rem;
}

.divider {
  text-align: center;
  margin-bottom: 1rem;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.8rem;
}

.social-buttons {
  display: flex;
  gap: 0.5rem;
}

.social-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.social-btn:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.social-btn img {
  width: 20px;
  height: 20px;
}
</style>
```

## 📊 仪表板模块

### 概览仪表板

```vue
<!-- src/templates/dashboard/overview/desktop/DashboardOverview.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import LineChart from '@/components/Charts/LineChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'
import ActivityItem from '@/components/Dashboard/ActivityItem.vue'
import StatCard from '@/components/Dashboard/StatCard.vue'
import { useDashboardStore } from '@/store/modules/dashboard'

interface Props {
  userId?: string
  showAdvanced?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAdvanced: true
})

const emit = defineEmits<{
  dataLoaded: [data: any]
  error: [error: Error]
}>()

// 状态管理
const dashboardStore = useDashboardStore()

// 响应式状态
const isRefreshing = ref(false)
const isChartLoading = ref(false)
const selectedPeriod = ref('week')
const selectedChartType = ref('visits')

const chartTypes = [
  { value: 'visits', label: '访问量' },
  { value: 'users', label: '用户数' },
  { value: 'revenue', label: '收入' }
]

// 计算属性
const stats = computed(() => dashboardStore.stats)
const chartData = computed(() => dashboardStore.getChartData(selectedChartType.value))
const userDistribution = computed(() => dashboardStore.userDistribution)
const recentActivities = computed(() => dashboardStore.recentActivities)

// 方法
async function refreshData() {
  isRefreshing.value = true

  try {
    await dashboardStore.fetchDashboardData({
      period: selectedPeriod.value,
      userId: props.userId
    })

    emit('dataLoaded', dashboardStore.data)
  }
  catch (error) {
    console.error('刷新数据失败:', error)
    emit('error', error as Error)
  }
  finally {
    isRefreshing.value = false
  }
}

async function handlePeriodChange() {
  await refreshData()
}

async function loadChartData() {
  isChartLoading.value = true

  try {
    await dashboardStore.fetchChartData({
      type: selectedChartType.value,
      period: selectedPeriod.value
    })
  }
  catch (error) {
    console.error('加载图表数据失败:', error)
  }
  finally {
    isChartLoading.value = false
  }
}

// 监听器
watch(selectedChartType, loadChartData)

// 生命周期
onMounted(async () => {
  await refreshData()
  await loadChartData()
})
</script>

<template>
  <div class="dashboard-overview">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <h1>仪表板概览</h1>
      <div class="header-actions">
        <button :disabled="isRefreshing" class="refresh-btn" @click="refreshData">
          <span :class="{ spinning: isRefreshing }">🔄</span>
          刷新数据
        </button>

        <select v-model="selectedPeriod" class="period-select" @change="handlePeriodChange">
          <option value="today">
            今天
          </option>
          <option value="week">
            本周
          </option>
          <option value="month">
            本月
          </option>
          <option value="quarter">
            本季度
          </option>
        </select>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.id"
        :title="stat.title"
        :value="stat.value"
        :change="stat.change"
        :trend="stat.trend"
        :icon="stat.icon"
        :color="stat.color"
      />
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-header">
          <h3>访问趋势</h3>
          <div class="chart-controls">
            <button
              v-for="type in chartTypes"
              :key="type.value"
              :class="{ active: selectedChartType === type.value }"
              class="chart-type-btn"
              @click="selectedChartType = type.value"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="chart-container">
          <LineChart
            :data="chartData"
            :type="selectedChartType"
            :loading="isChartLoading"
          />
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>用户分布</h3>
        </div>

        <div class="chart-container">
          <PieChart :data="userDistribution" />
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <div class="activity-header">
        <h3>最近活动</h3>
        <router-link to="/activities" class="view-all-link">
          查看全部
        </router-link>
      </div>

      <div class="activity-list">
        <ActivityItem
          v-for="activity in recentActivities"
          :key="activity.id"
          :activity="activity"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-overview {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

.period-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-type-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.chart-type-btn:hover {
  background: #f7fafc;
}

.chart-type-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.chart-container {
  height: 300px;
}

.recent-activities {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-controls {
    flex-wrap: wrap;
  }
}
</style>
```

这个完整的应用示例展示了：

1. **完整的项目结构**：包含路由、状态管理、模板系统等
2. **企业级配置**：性能监控、错误处理、缓存策略等
3. **响应式设计**：支持多设备适配
4. **模块化架构**：清晰的代码组织和职责分离
5. **最佳实践**：TypeScript、组合式API、状态管理等

这个示例可以作为构建大型企业应用的参考模板。

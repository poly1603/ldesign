# 最佳实践

基于 LDesign 的最佳开发实践，帮助您构建高质量、高性能的应用程序。

## 🏗️ 架构设计

### 项目结构

<div class="practice-section">
  <h4>推荐的项目结构</h4>
  <div class="code-example">
    <pre><code>src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   ├── business/       # 业务组件
│   └── layout/         # 布局组件
├── views/              # 页面组件
│   ├── home/
│   ├── user/
│   └── admin/
├── stores/             # 状态管理
│   ├── modules/
│   └── index.ts
├── services/           # API 服务
│   ├── api/
│   ├── http/
│   └── index.ts
├── utils/              # 工具函数
│   ├── helpers/
│   ├── validators/
│   └── constants/
├── assets/             # 静态资源
│   ├── images/
│   ├── styles/
│   └── fonts/
├── router/             # 路由配置
├── plugins/            # 插件配置
└── main.ts             # 入口文件</code></pre>
  </div>
</div>

### 模块化设计

<div class="practice-section">
  <h4>功能模块划分</h4>
  <div class="practice-grid">
    <div class="practice-card">
      <h5>🔧 核心模块</h5>
      <ul>
        <li>引擎初始化</li>
        <li>路由配置</li>
        <li>状态管理</li>
        <li>HTTP 客户端</li>
      </ul>
    </div>
    <div class="practice-card">
      <h5>🎨 UI 模块</h5>
      <ul>
        <li>组件库</li>
        <li>主题系统</li>
        <li>布局管理</li>
        <li>响应式设计</li>
      </ul>
    </div>
    <div class="practice-card">
      <h5>🔐 安全模块</h5>
      <ul>
        <li>用户认证</li>
        <li>权限控制</li>
        <li>数据加密</li>
        <li>安全策略</li>
      </ul>
    </div>
    <div class="practice-card">
      <h5>📊 业务模块</h5>
      <ul>
        <li>数据处理</li>
        <li>业务逻辑</li>
        <li>工作流程</li>
        <li>集成接口</li>
      </ul>
    </div>
  </div>
</div>

## ⚡ 性能优化

### 代码分割

<div class="practice-section">
  <h4>路由级代码分割</h4>
  <div class="code-example">
    <pre><code class="language-typescript">// ✅ 推荐：使用动态导入
const routes = [
  {
    path: '/home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/user',
    component: () => import('@/views/User.vue')
  }
]

// ❌ 避免：同步导入所有组件
import Home from '@/views/Home.vue'
import User from '@/views/User.vue'</code></pre>

  </div>
</div>

<div class="practice-section">
  <h4>组件级代码分割</h4>
  <div class="code-example">
    <pre><code class="language-typescript">// ✅ 推荐：按需加载重型组件
const HeavyChart = defineAsyncComponent({
  loader: () => import('@/components/HeavyChart.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})

// ✅ 推荐：条件加载
const AdminPanel = computed(() => {
return user.isAdmin
? defineAsyncComponent(() => import('@/components/AdminPanel.vue'))
: null
})</code></pre>

  </div>
</div>

### 缓存策略

<div class="practice-section">
  <h4>HTTP 缓存配置</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { HttpClient } from '@ldesign/http'

const http = new HttpClient({
baseURL: 'https://api.example.com',
cache: {
// 静态数据长期缓存
'/api/config': { ttl: 3600000 }, // 1小时
// 用户数据短期缓存
'/api/user': { ttl: 300000 }, // 5分钟
// 实时数据不缓存
'/api/realtime': { ttl: 0 }
}
})</code></pre>

  </div>
</div>

<div class="practice-section">
  <h4>模板缓存优化</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { TemplateManager } from '@ldesign/template'

const templateManager = new TemplateManager({
cache: {
enabled: true,
maxSize: 50, // 最大缓存数量
ttl: 1800000, // 30分钟过期
strategy: 'lru' // LRU 淘汰策略
},
preload: [
'common/header',
'common/footer',
'common/sidebar'
]
})</code></pre>

  </div>
</div>

### 性能监控

<div class="practice-section">
  <h4>关键指标监控</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { Engine } from '@ldesign/engine'

const engine = new Engine({
performance: {
monitoring: true,
metrics: {
// 首屏加载时间
fcp: { threshold: 1500 },
// 最大内容绘制
lcp: { threshold: 2500 },
// 累积布局偏移
cls: { threshold: 0.1 },
// 首次输入延迟
fid: { threshold: 100 }
},
reporting: {
endpoint: '/api/performance',
interval: 30000
}
}
})</code></pre>

  </div>
</div>

## 🔒 安全实践

### 数据加密

<div class="practice-section">
  <h4>敏感数据处理</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { AESCrypto, RSACrypto } from '@ldesign/crypto'

// ✅ 推荐：敏感数据加密存储
class SecureStorage {
private crypto = new AESCrypto(process.env.ENCRYPTION_KEY)

setSecureItem(key: string, value: any) {
const encrypted = this.crypto.encrypt(JSON.stringify(value))
localStorage.setItem(key, encrypted)
}

getSecureItem(key: string) {
const encrypted = localStorage.getItem(key)
if (!encrypted) return null

    const decrypted = this.crypto.decrypt(encrypted)
    return JSON.parse(decrypted)

}
}

// ✅ 推荐：API 通信加密
class SecureAPI {
private rsaCrypto = new RSACrypto()

async sendSecureData(data: any) {
const encrypted = await this.rsaCrypto.encrypt(data)
return http.post('/api/secure', { data: encrypted })
}
}</code></pre>

  </div>
</div>

### 权限控制

<div class="practice-section">
  <h4>路由权限守卫</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { Router } from '@ldesign/router'

const router = new Router({
routes: [
{
path: '/admin',
component: () => import('@/views/Admin.vue'),
meta: { requiresAuth: true, roles: ['admin'] }
}
]
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
const { requiresAuth, roles } = to.meta

if (requiresAuth) {
const user = await authService.getCurrentUser()
if (!user) {
return next('/login')
}

    if (roles && !roles.some(role => user.roles.includes(role))) {
      return next('/403')
    }

}

next()
})</code></pre>

  </div>
</div>

### 输入验证

<div class="practice-section">
  <h4>数据验证策略</h4>
  <div class="code-example">
    <pre><code class="language-typescript">// ✅ 推荐：多层验证
class UserService {
  async createUser(userData: any) {
    // 1. 前端验证
    const validation = this.validateUserData(userData)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

    // 2. 数据清理
    const cleanData = this.sanitizeUserData(userData)

    // 3. 服务端验证（后端也需要验证）
    return http.post('/api/users', cleanData)

}

private validateUserData(data: any) {
const rules = {
email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%\*?&]{8,}$/,
      phone: /^\+?[1-9]\d{1,14}$/
}

    // 验证逻辑...

}

private sanitizeUserData(data: any) {
// 数据清理逻辑...
}
}</code></pre>

  </div>
</div>

## 🎨 UI/UX 最佳实践

### 响应式设计

<div class="practice-section">
  <h4>设备适配策略</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { DeviceDetector, TemplateManager } from '@ldesign/device'

class ResponsiveManager {
private device = new DeviceDetector()
private template = new TemplateManager()

async initializeLayout() {
const deviceInfo = await this.device.getDeviceInfo()

    // 根据设备类型选择模板
    const templateName = this.getTemplateForDevice(deviceInfo)
    await this.template.useTemplate(templateName)

    // 监听屏幕方向变化
    this.device.onOrientationChange((orientation) => {
      this.handleOrientationChange(orientation)
    })

}

private getTemplateForDevice(device: DeviceInfo) {
if (device.isMobile) {
return device.screen.width < 375 ? 'mobile-small' : 'mobile'
}
if (device.isTablet) {
return 'tablet'
}
return 'desktop'
}
}</code></pre>

  </div>
</div>

### 主题系统

<div class="practice-section">
  <h4>动态主题切换</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { ColorManager } from '@ldesign/color'

class ThemeManager {
private colorManager = new ColorManager()

async setTheme(themeName: string) {
const theme = await this.loadTheme(themeName)

    // 生成完整色板
    const palette = this.colorManager.generatePalette(theme.primary)

    // 应用 CSS 变量
    this.applyCSSVariables(palette)

    // 保存用户偏好
    localStorage.setItem('theme', themeName)

}

async enableDarkMode() {
const currentTheme = this.getCurrentTheme()
const darkTheme = this.colorManager.generateDarkTheme(currentTheme)

    this.applyCSSVariables(darkTheme)
    document.documentElement.setAttribute('data-theme', 'dark')

}

private applyCSSVariables(palette: ColorPalette) {
Object.entries(palette).forEach(([key, value]) => {
document.documentElement.style.setProperty(`--color-${key}`, value)
})
}
}</code></pre>

  </div>
</div>

### 无障碍访问

<div class="practice-section">
  <h4>可访问性优化</h4>
  <div class="code-example">
    <pre><code class="language-vue"><!-- ✅ 推荐：完整的可访问性支持 -->
<template>
  <div class="form-group">
    <label
      :for="inputId"
      class="form-label"
      :class="{ 'required': required }"
    >
      {{ label }}
      <span v-if="required" aria-label="必填项">*</span>
    </label>

    <input
      :id="inputId"
      v-model="value"
      :type="type"
      :required="required"
      :aria-describedby="errorId"
      :aria-invalid="hasError"
      class="form-input"
      @blur="validate"
    />

    <div
      v-if="hasError"
      :id="errorId"
      class="error-message"
      role="alert"
      aria-live="polite"
    >
      {{ errorMessage }}
    </div>

  </div>
</template>

<script setup lang="ts">
const inputId = `input-${Math.random().toString(36).substr(2, 9)}`
const errorId = `error-${inputId}`
</script></code></pre>
  </div>
</div>

## 🌍 国际化实践

### 多语言配置

<div class="practice-section">
  <h4>语言资源管理</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { I18nManager } from '@ldesign/i18n'

// 语言资源结构
const messages = {
'zh-CN': {
common: {
save: '保存',
cancel: '取消',
confirm: '确认'
},
user: {
profile: '个人资料',
settings: '设置'
}
},
'en-US': {
common: {
save: 'Save',
cancel: 'Cancel',
confirm: 'Confirm'
},
user: {
profile: 'Profile',
settings: 'Settings'
}
}
}

const i18n = new I18nManager({
locale: 'zh-CN',
fallbackLocale: 'en-US',
messages,
// 懒加载语言包
lazy: true,
loadPath: '/locales/{locale}.json'
})</code></pre>

  </div>
</div>

### 本地化处理

<div class="practice-section">
  <h4>日期时间格式化</h4>
  <div class="code-example">
    <pre><code class="language-typescript">class LocalizationService {
  private i18n = new I18nManager()

formatDate(date: Date, format: string = 'short') {
const locale = this.i18n.getCurrentLocale()

    const options: Intl.DateTimeFormatOptions = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      },
      time: { hour: '2-digit', minute: '2-digit' }
    }[format] || {}

    return new Intl.DateTimeFormat(locale, options).format(date)

}

formatNumber(number: number, type: 'currency' | 'percent' | 'decimal' = 'decimal') {
const locale = this.i18n.getCurrentLocale()

    const options: Intl.NumberFormatOptions = {
      currency: { style: 'currency', currency: 'CNY' },
      percent: { style: 'percent' },
      decimal: { minimumFractionDigits: 2 }
    }[type] || {}

    return new Intl.NumberFormat(locale, options).format(number)

}
}</code></pre>

  </div>
</div>

## 🧪 测试策略

### 单元测试

<div class="practice-section">
  <h4>组件测试</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
it('should render user information correctly', () => {
const user = {
name: 'John Doe',
email: 'john@example.com',
avatar: '/avatar.jpg'
}

    const wrapper = mount(UserProfile, {
      props: { user }
    })

    expect(wrapper.find('.user-name').text()).toBe(user.name)
    expect(wrapper.find('.user-email').text()).toBe(user.email)
    expect(wrapper.find('.user-avatar').attributes('src')).toBe(user.avatar)

})

it('should emit update event when user data changes', async () => {
const wrapper = mount(UserProfile)

    await wrapper.find('.edit-button').trigger('click')
    await wrapper.find('.save-button').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()

})
})</code></pre>

  </div>
</div>

### 集成测试

<div class="practice-section">
  <h4>API 集成测试</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { describe, it, expect, beforeEach } from 'vitest'
import { HttpClient } from '@ldesign/http'
import { setupMockServer } from '@/test/utils'

describe('User API Integration', () => {
let http: HttpClient
let mockServer: any

beforeEach(() => {
mockServer = setupMockServer()
http = new HttpClient({ baseURL: 'http://localhost:3000' })
})

it('should fetch user list with pagination', async () => {
mockServer.get('/api/users').reply(200, {
data: [{ id: 1, name: 'User 1' }],
pagination: { page: 1, total: 10 }
})

    const response = await http.get('/api/users', {
      params: { page: 1, limit: 10 }
    })

    expect(response.data).toHaveLength(1)
    expect(response.pagination.total).toBe(10)

})
})</code></pre>

  </div>
</div>

## 📊 监控和调试

### 错误监控

<div class="practice-section">
  <h4>全局错误处理</h4>
  <div class="code-example">
    <pre><code class="language-typescript">import { Engine } from '@ldesign/engine'

class ErrorMonitor {
private engine: Engine

constructor(engine: Engine) {
this.engine = engine
this.setupGlobalErrorHandling()
}

private setupGlobalErrorHandling() {
// Vue 错误处理
this.engine.app.config.errorHandler = (err, instance, info) => {
this.reportError({
type: 'vue-error',
error: err,
component: instance?.$options.name,
info
})
}

    // 全局 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: 'promise-rejection',
        error: event.reason,
        promise: event.promise
      })
    })

    // JavaScript 错误
    window.addEventListener('error', (event) => {
      this.reportError({
        type: 'javascript-error',
        error: event.error,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

}

private async reportError(errorInfo: any) {
// 发送错误报告到监控服务
try {
await fetch('/api/errors', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
...errorInfo,
timestamp: Date.now(),
userAgent: navigator.userAgent,
url: window.location.href
})
})
} catch (e) {
console.error('Failed to report error:', e)
}
}
}</code></pre>

  </div>
</div>

### 性能分析

<div class="practice-section">
  <h4>性能指标收集</h4>
  <div class="code-example">
    <pre><code class="language-typescript">class PerformanceAnalyzer {
  private metrics: Map<string, number[]> = new Map()

startTiming(label: string) {
performance.mark(`${label}-start`)
}

endTiming(label: string) {
performance.mark(`${label}-end`)
performance.measure(label, `${label}-start`, `${label}-end`)

    const measure = performance.getEntriesByName(label)[0]
    this.recordMetric(label, measure.duration)

}

private recordMetric(label: string, value: number) {
if (!this.metrics.has(label)) {
this.metrics.set(label, [])
}

    const values = this.metrics.get(label)!
    values.push(value)

    // 保持最近 100 个记录
    if (values.length > 100) {
      values.shift()
    }

}

getMetricSummary(label: string) {
const values = this.metrics.get(label) || []
if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }

}
}</code></pre>

  </div>
</div>

## 🚀 部署优化

### 构建优化

<div class="practice-section">
  <h4>Vite 配置优化</h4>
  <div class="code-example">
    <pre><code class="language-typescript">// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
plugins: [vue()],

build: {
// 代码分割
rollupOptions: {
output: {
manualChunks: {
// 第三方库单独打包
vendor: ['vue', 'vue-router'],
// LDesign 核心包
ldesign: [
'@ldesign/engine',
'@ldesign/router',
'@ldesign/http'
],
// 工具库
utils: ['lodash', 'dayjs']
}
}
},

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // 资源内联阈值
    assetsInlineLimit: 4096

},

// 别名配置
resolve: {
alias: {
'@': resolve(**dirname, 'src'),
'@components': resolve(**dirname, 'src/components'),
'@utils': resolve(\_\_dirname, 'src/utils')
}
}
})</code></pre>

  </div>
</div>

### CDN 配置

<div class="practice-section">
  <h4>静态资源 CDN</h4>
  <div class="code-example">
    <pre><code class="language-typescript">// 生产环境 CDN 配置
const CDN_CONFIG = {
  css: [
    'https://cdn.jsdelivr.net/npm/@ldesign/theme@latest/dist/index.css'
  ],
  js: [
    'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
    'https://cdn.jsdelivr.net/npm/@ldesign/engine@latest/dist/index.umd.js'
  ]
}

// Vite 外部化配置
export default defineConfig({
build: {
rollupOptions: {
external: ['vue', '@ldesign/engine'],
output: {
globals: {
vue: 'Vue',
'@ldesign/engine': 'LDesignEngine'
}
}
}
}
})</code></pre>

  </div>
</div>

## 📋 代码规范

### ESLint 配置

<div class="practice-section">
  <h4>推荐的 ESLint 规则</h4>
  <div class="code-example">
    <pre><code class="language-json">{
  "extends": [
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier"
  ],
  "rules": {
    // Vue 相关
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/component-definition-name-casing": ["error", "PascalCase"],
    "vue/no-unused-vars": "error",

    // TypeScript 相关
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",

    // 代码质量
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "no-debugger": "error"

}
}</code></pre>

  </div>
</div>

### 提交规范

<div class="practice-section">
  <h4>Conventional Commits</h4>
  <div class="code-example">
    <pre><code># 功能开发
feat: 添加用户认证功能
feat(router): 支持动态路由配置

# 问题修复

fix: 修复登录状态丢失问题
fix(http): 解决请求重复发送问题

# 文档更新

docs: 更新 API 文档
docs(readme): 添加安装说明

# 样式调整

style: 统一代码格式

# 重构代码

refactor: 重构用户服务模块

# 性能优化

perf: 优化路由切换性能

# 测试相关

test: 添加用户组件单元测试

# 构建相关

build: 更新构建配置
ci: 添加 GitHub Actions 工作流</code></pre>

  </div>
</div>

<style>
.practice-section {
  margin: 32px 0;
  padding: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  background: white;
}

.practice-section h4 {
  margin: 0 0 16px 0;
  color: #1890ff;
  font-size: 1.2rem;
}

.practice-section h5 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1rem;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.practice-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.practice-card h5 {
  margin: 0 0 12px 0;
  color: #1890ff;
}

.practice-card ul {
  margin: 0;
  padding: 0 0 0 16px;
  list-style-type: disc;
}

.practice-card li {
  margin: 4px 0;
  color: #666;
  line-height: 1.5;
}

.code-example {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.code-example pre {
  margin: 0;
  padding: 20px;
  background: #fafafa;
  overflow-x: auto;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.code-example code {
  color: #333;
}

/* 语法高亮样式 */
.language-typescript .token.keyword {
  color: #0066cc;
  font-weight: bold;
}

.language-typescript .token.string {
  color: #009900;
}

.language-typescript .token.comment {
  color: #999;
  font-style: italic;
}

.language-typescript .token.function {
  color: #cc6600;
}

.language-typescript .token.class-name {
  color: #cc0066;
}

.language-vue .token.tag {
  color: #0066cc;
}

.language-vue .token.attr-name {
  color: #cc6600;
}

.language-vue .token.attr-value {
  color: #009900;
}

.language-json .token.property {
  color: #0066cc;
}

.language-json .token.string {
  color: #009900;
}

.language-json .token.number {
  color: #cc6600;
}

.language-json .token.boolean {
  color: #cc0066;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .practice-grid {
    grid-template-columns: 1fr;
  }

  .practice-section {
    padding: 16px;
  }

  .code-example pre {
    padding: 12px;
    font-size: 0.8rem;
  }
}

/* 代码块滚动条样式 */
.code-example pre::-webkit-scrollbar {
  height: 8px;
}

.code-example pre::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.code-example pre::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.code-example pre::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 提示样式 */
.practice-section .tip {
  padding: 12px 16px;
  margin: 16px 0;
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
  border-radius: 4px;
}

.practice-section .warning {
  padding: 12px 16px;
  margin: 16px 0;
  background: #fff7e6;
  border-left: 4px solid #fa8c16;
  border-radius: 4px;
}

.practice-section .danger {
  padding: 12px 16px;
  margin: 16px 0;
  background: #fff2f0;
  border-left: 4px solid #ff4d4f;
  border-radius: 4px;
}
</style>

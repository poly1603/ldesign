# 高级示例

本文档展示了 Vue3 Engine 的高级用法和实际应用场景。

## 完整的应用示例

### 1. 用户管理应用

创建一个包含用户认证、数据管理和通知的完整应用。

```typescript
import { createApp, creators, presets } from '@ldesign/engine'
// main.ts
import App from './App.vue'

// 用户认证插件
const authPlugin = creators.plugin('auth', (engine) => {
  // 初始化认证状态
  engine.state.set('auth', {
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('auth_token'),
  })

  // 登录方法
  const login = async (credentials: LoginCredentials) => {
    try {
      engine.logger.info('开始用户登录', { username: credentials.username })

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        const { user, token } = await response.json()

        // 更新状态
        engine.state.set('auth', {
          user,
          isAuthenticated: true,
          token,
        })

        // 保存token
        localStorage.setItem('auth_token', token)

        // 发送登录成功事件
        engine.events.emit('auth:login:success', user)

        // 显示成功通知
        engine.notifications.success(`欢迎回来，${user.name}！`)

        engine.logger.info('用户登录成功', { userId: user.id })
      }
      else {
        throw new Error('登录失败')
      }
    }
    catch (error) {
      engine.logger.error('用户登录失败', error)
      engine.events.emit('auth:login:error', error)
      engine.notifications.error('登录失败，请检查用户名和密码')
      throw error
    }
  }

  // 登出方法
  const logout = () => {
    const currentUser = engine.state.get('auth.user')

    engine.state.set('auth', {
      user: null,
      isAuthenticated: false,
      token: null,
    })

    localStorage.removeItem('auth_token')

    engine.events.emit('auth:logout', currentUser)
    engine.notifications.info('您已安全退出')
    engine.logger.info('用户已退出', { userId: currentUser?.id })
  }

  // 暴露认证方法
  engine.auth = { login, logout }

  // 监听路由变化，检查认证状态
  engine.events.on('router:beforeEach', (to) => {
    const isAuthenticated = engine.state.get('auth.isAuthenticated')
    const requiresAuth = to.meta?.requiresAuth

    if (requiresAuth && !isAuthenticated) {
      engine.events.emit('auth:required', to)
      engine.notifications.warning('请先登录')
    }
  })
})

// 数据管理插件
const dataPlugin = creators.plugin('data', (engine) => {
  // 数据缓存
  const cache = new Map()

  // 通用数据获取方法
  const fetchData = async (endpoint: string, options: RequestOptions = {}) => {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`

    // 检查缓存
    if (cache.has(cacheKey) && !options.force) {
      engine.logger.debug('从缓存获取数据', { endpoint })
      return cache.get(cacheKey)
    }

    try {
      engine.logger.info('开始获取数据', { endpoint })

      const token = engine.state.get('auth.token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      }

      const response = await fetch(endpoint, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // 缓存数据
      cache.set(cacheKey, data)

      engine.logger.info('数据获取成功', { endpoint, dataSize: JSON.stringify(data).length })
      engine.events.emit('data:fetched', { endpoint, data })

      return data
    }
    catch (error) {
      engine.logger.error('数据获取失败', { endpoint, error })
      engine.events.emit('data:error', { endpoint, error })
      throw error
    }
  }

  // 清除缓存
  const clearCache = (pattern?: string) => {
    if (pattern) {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key)
        }
      }
    }
    else {
      cache.clear()
    }
    engine.logger.info('缓存已清除', { pattern })
  }

  // 暴露数据方法
  engine.data = { fetchData, clearCache }

  // 监听认证状态变化，清除缓存
  engine.events.on('auth:logout', () => {
    clearCache()
  })
})

// 性能监控中间件
const performanceMiddleware = creators.middleware('performance', async (context, next) => {
  const startTime = performance.now()

  await next()

  const endTime = performance.now()
  const duration = endTime - startTime

  // 记录性能数据
  engine.logger.info('中间件性能', {
    phase: context.phase,
    duration: `${duration.toFixed(2)}ms`,
  })

  // 如果执行时间过长，发出警告
  if (duration > 100) {
    engine.notifications.warning(`${context.phase}阶段执行时间较长: ${duration.toFixed(2)}ms`)
  }
})

// 创建应用
const engine = createApp(App, {
  ...presets.development(),
  config: {
    appName: '用户管理系统',
    version: '1.0.0',
    debug: true,
  },
  plugins: [authPlugin, dataPlugin],
  middleware: [performanceMiddleware],
})

// 挂载应用
engine.mount('#app')

// 导出引擎实例
export { engine }
```

### 2. 用户列表组件

```vue
<!-- UserList.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { engine } from '../main'

// 响应式数据
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 计算属性
const currentUser = computed(() => engine.state.get('auth.user'))

// 加载用户数据
async function loadUsers() {
  loading.value = true
  error.value = null

  try {
    const data = await engine.data.fetchData('/api/users')
    users.value = data.users

    engine.logger.info('用户列表加载成功', { count: data.users.length })
  }
  catch (err) {
    error.value = '加载用户数据失败'
    engine.logger.error('用户列表加载失败', err)
  }
  finally {
    loading.value = false
  }
}

// 刷新用户数据
async function refreshUsers() {
  try {
    const data = await engine.data.fetchData('/api/users', { force: true })
    users.value = data.users

    engine.notifications.success('用户列表已刷新')
  }
  catch (err) {
    engine.notifications.error('刷新失败')
  }
}

// 编辑用户
function editUser(user: User) {
  engine.events.emit('user:edit', user)
  engine.logger.info('开始编辑用户', { userId: user.id })
}

// 删除用户
async function deleteUser(user: User) {
  const confirmed = await showConfirmDialog(`确定要删除用户 ${user.name} 吗？`)

  if (confirmed) {
    try {
      await engine.data.fetchData(`/api/users/${user.id}`, {
        method: 'DELETE',
      })

      // 从列表中移除
      users.value = users.value.filter(u => u.id !== user.id)

      engine.notifications.success(`用户 ${user.name} 已删除`)
      engine.logger.info('用户删除成功', { userId: user.id })
    }
    catch (err) {
      engine.notifications.error('删除用户失败')
      engine.logger.error('用户删除失败', { userId: user.id, error: err })
    }
  }
}

// 确认对话框
function showConfirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    engine.notifications.warning(message, {
      persistent: true,
      actions: [
        {
          label: '确定',
          action: () => resolve(true),
          style: 'danger',
        },
        {
          label: '取消',
          action: () => resolve(false),
        },
      ],
    })
  })
}

// 监听事件
engine.events.on('user:created', (newUser) => {
  users.value.push(newUser)
  engine.notifications.success(`用户 ${newUser.name} 已创建`)
})

engine.events.on('user:updated', (updatedUser) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = updatedUser
    engine.notifications.success(`用户 ${updatedUser.name} 已更新`)
  }
})

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h2>用户列表</h2>
      <button :disabled="loading" @click="refreshUsers">
        {{ loading ? '加载中...' : '刷新' }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      正在加载用户数据...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="loadUsers">
        重试
      </button>
    </div>

    <div v-else class="users">
      <div v-for="user in users" :key="user.id" class="user-card">
        <img :src="user.avatar" :alt="user.name" class="avatar">
        <div class="info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <span class="role">{{ user.role }}</span>
        </div>
        <div class="actions">
          <button @click="editUser(user)">
            编辑
          </button>
          <button class="danger" @click="deleteUser(user)">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #e74c3c;
}

.users {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.user-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.info {
  flex: 1;
}

.info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.info p {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
}

.role {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
}

.actions button:hover {
  background: #f5f5f5;
}

.actions button.danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.actions button.danger:hover {
  background: #fdf2f2;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

## 插件开发示例

### 1. 主题切换插件

```typescript
// plugins/theme.ts
import { creators } from '@ldesign/engine'

interface ThemeConfig {
  themes: Record<string, ThemeDefinition>
  defaultTheme: string
  storageKey: string
}

interface ThemeDefinition {
  name: string
  colors: Record<string, string>
  variables: Record<string, string>
}

export function createThemePlugin(config: ThemeConfig) {
  return creators.plugin('theme', (engine) => {
    // 初始化主题状态
    const savedTheme = localStorage.getItem(config.storageKey) || config.defaultTheme
    engine.state.set('theme', {
      current: savedTheme,
      available: Object.keys(config.themes),
    })

    // 应用主题
    const applyTheme = (themeName: string) => {
      const theme = config.themes[themeName]
      if (!theme) {
        engine.logger.warn('主题不存在', { themeName })
        return
      }

      // 更新CSS变量
      const root = document.documentElement
      Object.entries(theme.variables).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })

      // 更新状态
      engine.state.set('theme.current', themeName)

      // 保存到本地存储
      localStorage.setItem(config.storageKey, themeName)

      // 发送主题变化事件
      engine.events.emit('theme:changed', { theme: themeName, definition: theme })

      engine.logger.info('主题已切换', { theme: themeName })
    }

    // 切换主题
    const switchTheme = (themeName: string) => {
      if (config.themes[themeName]) {
        applyTheme(themeName)
        engine.notifications.success(`已切换到${config.themes[themeName].name}主题`)
      }
      else {
        engine.notifications.error('主题不存在')
      }
    }

    // 获取当前主题
    const getCurrentTheme = () => {
      return engine.state.get('theme.current')
    }

    // 获取可用主题
    const getAvailableThemes = () => {
      return Object.entries(config.themes).map(([key, theme]) => ({
        key,
        name: theme.name,
      }))
    }

    // 暴露主题API
    engine.theme = {
      switch: switchTheme,
      getCurrent: getCurrentTheme,
      getAvailable: getAvailableThemes,
      apply: applyTheme,
    }

    // 初始化时应用保存的主题
    applyTheme(savedTheme)

    engine.logger.info('主题插件已安装', { defaultTheme: config.defaultTheme })
  })
}

// 使用主题插件
const themePlugin = createThemePlugin({
  themes: {
    light: {
      name: '浅色主题',
      colors: {
        primary: '#1976d2',
        secondary: '#424242',
        background: '#ffffff',
        surface: '#f5f5f5',
      },
      variables: {
        'color-primary': '#1976d2',
        'color-background': '#ffffff',
        'color-text': '#333333',
      },
    },
    dark: {
      name: '深色主题',
      colors: {
        primary: '#90caf9',
        secondary: '#b0bec5',
        background: '#121212',
        surface: '#1e1e1e',
      },
      variables: {
        'color-primary': '#90caf9',
        'color-background': '#121212',
        'color-text': '#ffffff',
      },
    },
  },
  defaultTheme: 'light',
  storageKey: 'app_theme',
})
```

### 2. 国际化插件

```typescript
// plugins/i18n.ts
import { creators } from '@ldesign/engine'

interface I18nConfig {
  defaultLocale: string
  fallbackLocale: string
  messages: Record<string, Record<string, string>>
  storageKey: string
}

export function createI18nPlugin(config: I18nConfig) {
  return creators.plugin('i18n', (engine) => {
    // 初始化语言状态
    const savedLocale = localStorage.getItem(config.storageKey) || config.defaultLocale
    engine.state.set('i18n', {
      locale: savedLocale,
      available: Object.keys(config.messages),
    })

    // 翻译函数
    const t = (key: string, params?: Record<string, any>): string => {
      const locale = engine.state.get('i18n.locale')
      const messages = config.messages[locale] || config.messages[config.fallbackLocale]

      let message = messages[key] || key

      // 参数替换
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value))
        })
      }

      return message
    }

    // 切换语言
    const setLocale = (locale: string) => {
      if (!config.messages[locale]) {
        engine.logger.warn('语言不支持', { locale })
        return false
      }

      engine.state.set('i18n.locale', locale)
      localStorage.setItem(config.storageKey, locale)

      // 发送语言变化事件
      engine.events.emit('i18n:locale:changed', { locale })

      engine.logger.info('语言已切换', { locale })
      engine.notifications.success(t('language.switched', { language: locale }))

      return true
    }

    // 获取当前语言
    const getLocale = () => {
      return engine.state.get('i18n.locale')
    }

    // 获取可用语言
    const getAvailableLocales = () => {
      return Object.keys(config.messages)
    }

    // 暴露国际化API
    engine.i18n = {
      t,
      setLocale,
      getLocale,
      getAvailableLocales,
    }

    // 全局注册翻译函数
    if (typeof window !== 'undefined') {
      ;(window as any).$t = t
    }

    engine.logger.info('国际化插件已安装', { locale: savedLocale })
  })
}

// 使用国际化插件
const i18nPlugin = createI18nPlugin({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      'app.title': '用户管理系统',
      'user.list': '用户列表',
      'user.create': '创建用户',
      'user.edit': '编辑用户',
      'user.delete': '删除用户',
      'language.switched': '语言已切换到{language}',
    },
    'en-US': {
      'app.title': 'User Management System',
      'user.list': 'User List',
      'user.create': 'Create User',
      'user.edit': 'Edit User',
      'user.delete': 'Delete User',
      'language.switched': 'Language switched to {language}',
    },
  },
  storageKey: 'app_locale',
})
```

## 中间件开发示例

### 1. 请求拦截中间件

```typescript
// middleware/request-interceptor.ts
import { creators } from '@ldesign/engine'

export const requestInterceptorMiddleware = creators.middleware(
  'request-interceptor',
  async (context, next) => {
    // 只在应用挂载后执行
    if (context.phase === 'afterMount') {
      // 拦截fetch请求
      const originalFetch = window.fetch

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // 记录请求开始
        context.engine.logger.info('HTTP请求开始', {
          requestId,
          url,
          method: init?.method || 'GET',
        })

        const startTime = performance.now()

        try {
          // 添加认证头
          const token = context.engine.state.get('auth.token')
          if (token && !init?.headers?.Authorization) {
            init = {
              ...init,
              headers: {
                ...init?.headers,
                Authorization: `Bearer ${token}`,
              },
            }
          }

          // 执行请求
          const response = await originalFetch(input, init)

          const endTime = performance.now()
          const duration = endTime - startTime

          // 记录请求完成
          context.engine.logger.info('HTTP请求完成', {
            requestId,
            url,
            status: response.status,
            duration: `${duration.toFixed(2)}ms`,
          })

          // 处理认证失败
          if (response.status === 401) {
            context.engine.events.emit('auth:unauthorized', { url, response })
            context.engine.notifications.error('认证失败，请重新登录')
          }

          return response
        }
        catch (error) {
          const endTime = performance.now()
          const duration = endTime - startTime

          // 记录请求错误
          context.engine.logger.error('HTTP请求失败', {
            requestId,
            url,
            error: error.message,
            duration: `${duration.toFixed(2)}ms`,
          })

          context.engine.events.emit('http:error', { url, error })

          throw error
        }
      }

      context.engine.logger.info('请求拦截器已安装')
    }

    await next()
  }
)
```

### 2. 错误边界中间件

```typescript
// middleware/error-boundary.ts
import { creators } from '@ldesign/engine'

export const errorBoundaryMiddleware = creators.middleware(
  'error-boundary',
  async (context, next) => {
    try {
      await next()
    }
    catch (error) {
      // 记录错误
      context.engine.logger.error('中间件执行错误', {
        phase: context.phase,
        error: error.message,
        stack: error.stack,
      })

      // 发送错误事件
      context.engine.events.emit('middleware:error', {
        phase: context.phase,
        error,
        middleware: 'error-boundary',
      })

      // 显示错误通知
      if (context.phase === 'beforeMount') {
        context.engine.notifications.error('应用启动失败，请刷新页面重试')
      }
      else {
        context.engine.notifications.error('系统出现错误，请稍后重试')
      }

      // 在开发环境中重新抛出错误
      if (context.engine.config.debug) {
        throw error
      }
    }
  }
)
```

这些示例展示了如何使用 Vue3 Engine 构建复杂的应用，包括插件开发、中间件创建和组件集成。通过这些模式
，你可以构建可维护、可扩展的 Vue3 应用。

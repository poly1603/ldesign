/**
 * 增强功能使用示例
 * 展示生命周期、中间件、插件互访和全局响应式状态的使用
 */

import { createEngineApp } from '../src/core/create-engine-app'
import { EnhancedPlugin } from '../src/plugins/enhanced-plugin-system'
import { ref, computed } from 'vue'

// ==================== 1. 创建增强的插件 ====================

/**
 * 用户管理插件
 */
const userPlugin: EnhancedPlugin = {
  name: 'user',
  version: '1.0.0',
  
  // 插件私有状态
  state: {
    currentUser: null,
    users: []
  },
  
  // 共享状态
  sharedState: {
    isAuthenticated: false,
    permissions: []
  },
  
  // 导出的 API
  exports: {
    login: async (username: string, password: string) => {
      // 登录逻辑
      return { success: true, user: { id: 1, username } }
    },
    logout: async () => {
      // 登出逻辑
      return { success: true }
    },
    getPermissions: () => ['read', 'write']
  },
  
  // 生命周期钩子
  beforeInstall: async (context) => {
    context.logger.info('User plugin: preparing installation')
  },
  
  install: async (context) => {
    // 设置共享状态
    context.setSharedState('user:currentUser', { id: 1, name: 'Admin' })
    
    // 监听其他插件的状态变化
    context.watchSharedState('theme:current', (theme) => {
      console.log('Theme changed to:', theme)
    })
    
    // 注册中间件
    context.registerMiddleware({
      name: 'auth-check',
      phase: 'before',
      handler: async (ctx, next) => {
        const isAuthenticated = context.getSharedState('user:isAuthenticated')
        if (!isAuthenticated && ctx.method === 'protectedAction') {
          throw new Error('Authentication required')
        }
        if (next) await next()
      },
      priority: 10
    })
  },
  
  afterInstall: async (context) => {
    context.logger.info('User plugin installed successfully')
  },
  
  // 响应状态变化
  onStateChange: (key, value, oldValue) => {
    console.log(`User plugin detected state change: ${key}`, { value, oldValue })
  },
  
  // 响应其他插件注册
  onPluginRegistered: (plugin) => {
    console.log(`User plugin: ${plugin.name} was registered`)
  }
}

/**
 * 主题管理插件
 */
const themePlugin: EnhancedPlugin = {
  name: 'theme',
  version: '1.0.0',
  dependencies: ['user'], // 依赖用户插件
  
  sharedState: {
    current: 'light',
    available: ['light', 'dark', 'auto']
  },
  
  exports: {
    switchTheme: function(theme: string) {
      // 通过上下文访问共享状态
      this.context.setSharedState('theme:current', theme)
      return theme
    },
    
    applyUserPreference: async function() {
      // 调用其他插件的方法
      const userApi = this.context.usePlugin('user')
      const permissions = userApi.getPermissions()
      
      if (permissions.includes('theme-customize')) {
        // 应用用户偏好
      }
    }
  },
  
  install: async (context) => {
    // 保存上下文供后续使用
    (themePlugin.exports as any).context = context
    
    // 获取用户插件状态
    const currentUser = context.getSharedState('user:currentUser')
    console.log('Theme plugin: Current user is', currentUser)
    
    // 注册生命周期钩子
    context.onLifecycle('app:mounted', () => {
      console.log('App mounted, applying theme')
    })
  },
  
  middleware: [
    {
      name: 'theme-logger',
      phase: 'after',
      handler: async (ctx) => {
        if (ctx.method === 'switchTheme') {
          console.log('Theme switched:', ctx.result)
        }
      }
    }
  ]
}

/**
 * 数据管理插件
 */
const dataPlugin: EnhancedPlugin = {
  name: 'data',
  version: '1.0.0',
  dependencies: ['user', 'theme'],
  
  install: async (context) => {
    // 创建响应式数据
    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    
    // 监听多个共享状态
    context.watchSharedState('user:isAuthenticated', (isAuth) => {
      if (isAuth) {
        // 加载用户数据
        console.log('Loading user data...')
      }
    })
    
    // 插件间通信示例
    setTimeout(() => {
      // 调用其他插件方法
      context.callPlugin('theme', 'switchTheme', 'dark')
      
      // 获取其他插件状态
      const theme = context.getSharedState('theme:current')
      console.log('Current theme:', theme)
    }, 1000)
  }
}

// ==================== 2. 创建引擎应用 ====================

async function createEnhancedApp() {
  const engine = await createEngineApp({
    rootComponent: null, // 实际应用中传入根组件
    mountElement: '#app',
    
    config: {
      name: 'Enhanced App',
      version: '1.0.0',
      debug: true,
      
      // 启用状态历史
      state: {
        history: {
          maxSize: 100,
          debounce: 500
        }
      },
      
      // 启用性能监控
      performance: {
        enabled: true,
        metrics: ['fps', 'memory', 'network']
      }
    },
    
    // 注册增强插件
    enhancedPlugins: [userPlugin, themePlugin, dataPlugin],
    
    // 生命周期钩子
    lifecycle: {
      beforeInit: async (context) => {
        console.log('App: Before init')
      },
      afterInit: async (context) => {
        console.log('App: After init')
      },
      beforeMount: async (context) => {
        console.log('App: Before mount')
      },
      afterMount: async (context) => {
        console.log('App: After mount')
      }
    },
    
    // 中间件配置
    middleware: [
      {
        name: 'global-logger',
        handler: async (context, next) => {
          console.log('Request:', context)
          await next()
          console.log('Response:', context.result)
        },
        priority: 1
      },
      {
        name: 'error-handler',
        handler: async (context, next) => {
          try {
            await next()
          } catch (error) {
            console.error('Middleware caught error:', error)
            context.error = error
          }
        },
        priority: 100
      }
    ]
  })
  
  return engine
}

// ==================== 3. 使用示例 ====================

async function demonstrateFeatures() {
  const engine = await createEnhancedApp()
  
  // 1. 全局响应式状态
  console.log('\n=== Global Reactive State ===')
  
  // 设置状态
  engine.state.setState('app.title', 'My Enhanced App', {
    persist: true, // 持久化到 localStorage
    validator: (value) => typeof value === 'string'
  })
  
  // 监听状态变化
  engine.state.watch('app.title', (newTitle, oldTitle) => {
    console.log(`Title changed from ${oldTitle} to ${newTitle}`)
  })
  
  // 创建计算属性
  const titleLength = engine.state.createComputed('titleLength', () => {
    const title = engine.state.getState('app.title')
    return title ? title.length : 0
  })
  
  console.log('Title length:', titleLength.value)
  
  // 批量更新
  engine.state.batchUpdate({
    'app.title': 'Updated Title',
    'app.version': '2.0.0',
    'app.features': ['state', 'plugin', 'middleware']
  })
  
  // 2. 状态模块
  console.log('\n=== State Modules ===')
  
  engine.state.registerModule({
    namespace: 'counter',
    state: {
      count: 0
    },
    getters: {
      doubled: (state) => state.count * 2,
      isEven: (state) => state.count % 2 === 0
    },
    actions: {
      increment: function() {
        this.count++
      },
      decrement: function() {
        this.count--
      }
    }
  })
  
  // 使用模块
  const counterModule = engine.state.getModule('counter')
  console.log('Counter module:', counterModule)
  
  // 3. 时间旅行
  console.log('\n=== Time Travel ===')
  
  // 启用历史记录
  engine.state.enableHistory({ maxSize: 50 })
  
  // 保存快照
  const snapshotId = engine.state.saveSnapshot({ 
    description: 'Before changes' 
  })
  
  // 修改状态
  engine.state.setState('app.title', 'Changed Title')
  
  // 撤销
  if (engine.state.canUndo()) {
    engine.state.undo()
    console.log('Undone! Title:', engine.state.getState('app.title'))
  }
  
  // 重做
  if (engine.state.canRedo()) {
    engine.state.redo()
    console.log('Redone! Title:', engine.state.getState('app.title'))
  }
  
  // 恢复快照
  engine.state.restoreSnapshot(snapshotId)
  console.log('Restored! Title:', engine.state.getState('app.title'))
  
  // 4. 插件互访
  console.log('\n=== Plugin Interaction ===')
  
  // 获取插件
  const userApi = engine.plugins.usePlugin('user')
  const result = await userApi.login('admin', 'password')
  console.log('Login result:', result)
  
  // 调用插件方法
  const permissions = engine.plugins.callPlugin('user', 'getPermissions')
  console.log('Permissions:', permissions)
  
  // 获取插件共享状态
  const currentTheme = engine.plugins.getSharedState('theme:current')
  console.log('Current theme:', currentTheme)
  
  // 设置插件共享状态
  engine.plugins.setSharedState('theme:current', 'dark')
  
  // 5. 生命周期
  console.log('\n=== Lifecycle ===')
  
  // 触发生命周期事件
  await engine.lifecycle.execute('beforeDestroy', engine)
  await engine.lifecycle.execute('destroy', engine)
  await engine.lifecycle.execute('afterDestroy', engine)
  
  // 获取生命周期统计
  const stats = engine.lifecycle.getStats()
  console.log('Lifecycle stats:', stats)
  
  // 6. 中间件
  console.log('\n=== Middleware ===')
  
  // 执行中间件链
  await engine.middleware.execute({
    type: 'request',
    data: { action: 'fetchData' }
  })
  
  // 添加动态中间件
  engine.middleware.use({
    name: 'dynamic-middleware',
    handler: async (context, next) => {
      console.log('Dynamic middleware executed')
      await next()
    },
    priority: 50
  })
}

// ==================== 4. 高级使用场景 ====================

/**
 * 微前端场景下的状态共享
 */
function microFrontendStateSharing(engine: any) {
  // 父应用设置全局状态
  engine.state.setState('global.user', {
    id: 1,
    name: 'Admin',
    token: 'xxx'
  }, {
    persist: true,
    transformer: {
      // 加密敏感信息
      in: (value: any) => ({ ...value, token: btoa(value.token) }),
      out: (value: any) => ({ ...value, token: atob(value.token) })
    }
  })
  
  // 子应用监听全局状态
  engine.state.watch('global.user', (user) => {
    console.log('User changed in micro app:', user)
    // 更新子应用的认证状态
  })
  
  // 跨应用通信
  engine.plugins.setSharedState('microApp:ready', true)
  engine.plugins.watchSharedState('parentApp:command', (command) => {
    console.log('Received command from parent:', command)
  })
}

/**
 * 复杂的插件协作场景
 */
function complexPluginCollaboration(engine: any) {
  // 数据流: User -> Auth -> API -> Cache -> UI
  
  engine.plugins.callPlugin('auth', 'authenticate')
    .then(() => engine.plugins.callPlugin('api', 'fetchUserData'))
    .then(data => engine.plugins.callPlugin('cache', 'store', data))
    .then(() => engine.plugins.callPlugin('ui', 'updateUserInterface'))
    .catch(error => {
      engine.errors.handle(error, {
        module: 'plugin-collaboration',
        action: 'data-flow'
      })
    })
}

// 执行示例
if (typeof window !== 'undefined') {
  demonstrateFeatures().catch(console.error)
}

export {
  createEnhancedApp,
  demonstrateFeatures,
  userPlugin,
  themePlugin,
  dataPlugin
}
/**
 * Advanced Features Example
 * 
 * Demonstrates the new enhanced features of LDesign Engine:
 * - Enhanced Reactive State Management
 * - Plugin Shared State System
 * - Advanced Caching Strategies
 */

import { createEngine } from '@ldesign/engine'
import { createReactiveStateManager } from '@ldesign/engine/state/reactive-state'
import { createPluginSharedStateManager, usePluginState } from '@ldesign/engine/plugins/plugin-shared-state'
import { 
  createAdvancedCache, 
  LRUCache, 
  LFUCache, 
  MultiTierCache,
  DependencyCache,
  useAdvancedCache 
} from '@ldesign/engine/cache/advanced-cache'
import { defineComponent, h, computed, watchEffect } from 'vue'
import type { Plugin } from '@ldesign/engine'

// ==================== 1. Enhanced Reactive State Example ====================

async function demonstrateReactiveState() {
  const stateManager = createReactiveStateManager()
  
  // Create reactive references
  const userRef = stateManager.getRef<{ name: string; age: number }>('user')
  const configRef = stateManager.getShallowRef<Record<string, unknown>>('config')
  
  // Define computed states
  const userDisplayName = stateManager.defineComputed('userDisplayName', () => {
    const user = userRef.value
    return user ? `${user.name} (${user.age})` : 'Guest'
  })
  
  const isAdult = stateManager.defineComputed('isAdult', {
    get: () => {
      const user = userRef.value
      return user ? user.age >= 18 : false
    },
    set: (value: boolean) => {
      if (userRef.value && !value) {
        userRef.value.age = 17
      }
    }
  })
  
  // Create reactive collections
  const todoList = stateManager.createCollection<{ id: number; text: string; done: boolean }>('todos', [
    { id: 1, text: 'Learn Vue 3', done: true },
    { id: 2, text: 'Master LDesign Engine', done: false }
  ])
  
  // Add new todo
  todoList.add({ id: 3, text: 'Build awesome app', done: false })
  
  // Filter completed todos
  const completedTodos = computed(() => todoList.filter(todo => todo.done))
  
  // Use transactions for atomic updates
  await stateManager.transaction(async () => {
    stateManager.set('user', { name: 'John Doe', age: 25 })
    stateManager.set('config.theme', 'dark')
    stateManager.set('config.language', 'en')
    
    // This will be atomic - either all succeed or all rollback
    const result = await fetch('/api/user/update')
    if (!result.ok) {
      throw new Error('Failed to update user')
    }
  }, { retries: 3 })
  
  // Setup persistence
  stateManager.persist('user', {
    key: 'app:user',
    storage: localStorage,
    version: 2,
    migrate: (oldState, oldVersion) => {
      if (oldVersion < 2) {
        // Migrate from v1 to v2
        return { ...oldState, migratedAt: Date.now() }
      }
      return oldState
    }
  })
  
  // Batch updates for performance
  stateManager.batch([
    { key: 'settings.notifications', value: true },
    { key: 'settings.darkMode', value: false },
    { key: 'settings.language', value: 'zh-CN' }
  ])
  
  // Subscribe to pattern-based changes
  const unsubscribe = stateManager.subscribe('settings.*', (key, value) => {
    console.log(`Setting changed: ${key} = ${value}`)
  })
  
  // Select derived state
  const appState = stateManager.select(state => ({
    user: state.user,
    theme: state['config.theme'],
    todosCount: todoList.size.value
  }))
  
  console.log('App State:', appState.value)
  
  return stateManager
}

// ==================== 2. Plugin Shared State Example ====================

// Define plugins that share state
const authPlugin: Plugin = {
  name: 'auth-plugin',
  version: '1.0.0',
  
  install(context) {
    const sharedState = context.engine.pluginSharedState
    
    // Register the plugin
    sharedState.registerPlugin(this)
    
    // Create public shared state
    const userState = sharedState.createSharedState('auth-plugin', 'currentUser', null, {
      access: 'public',
      description: 'Current authenticated user',
      persist: true
    })
    
    // Create protected shared state
    const tokenState = sharedState.createSharedState('auth-plugin', 'authToken', '', {
      access: 'protected',
      description: 'Authentication token',
      readonly: false,
      persist: true
    })
    
    // Listen for messages
    sharedState.onMessage('auth-plugin', (message) => {
      if (message.type === 'LOGIN_REQUEST') {
        // Handle login
        userState.value = message.data.user
        tokenState.value = message.data.token
        
        // Broadcast success
        sharedState.sendMessage('auth-plugin', '*', 'LOGIN_SUCCESS', {
          user: message.data.user
        })
      }
    })
  }
}

const themePlugin: Plugin = {
  name: 'theme-plugin',
  version: '1.0.0',
  dependencies: ['auth-plugin'],
  
  install(context) {
    const sharedState = context.engine.pluginSharedState
    
    // Register the plugin
    sharedState.registerPlugin(this)
    
    // Access auth plugin's shared state
    const userState = sharedState.accessSharedState(
      'theme-plugin',
      'auth-plugin',
      'currentUser'
    )
    
    // Create theme state
    const themeState = sharedState.createSharedState('theme-plugin', 'theme', 'light', {
      access: 'public',
      persist: true
    })
    
    // Create computed state based on user preferences
    const userTheme = sharedState.createGlobalComputed('userTheme', () => {
      if (userState?.value?.preferences?.theme) {
        return userState.value.preferences.theme
      }
      return themeState.value
    })
    
    // Watch for user changes
    if (userState) {
      sharedState.watchSharedState('theme-plugin', 'auth-plugin', 'currentUser', (newUser) => {
        if (newUser?.preferences?.theme) {
          themeState.value = newUser.preferences.theme
        }
      })
    }
    
    // Create a bridge to sync theme with another plugin
    sharedState.createBridge(
      'theme-plugin',
      'theme',
      'ui-plugin',
      'currentTheme',
      (theme) => theme === 'dark' ? 'dark-mode' : 'light-mode'
    )
  }
}

// ==================== 3. Advanced Caching Example ====================

async function demonstrateAdvancedCaching() {
  // LRU Cache Example
  const lruCache = new LRUCache<string>({
    maxEntries: 100,
    ttl: 60000, // 1 minute
    onEvict: (entry) => {
      console.log(`Evicted: ${entry.key}`)
    }
  })
  
  lruCache.set('user:1', 'John Doe', { tags: ['user', 'active'] })
  lruCache.set('user:2', 'Jane Smith', { tags: ['user', 'premium'] })
  lruCache.set('post:1', 'Hello World', { tags: ['post', 'featured'] })
  
  // Invalidate by tags
  lruCache.invalidateByTags(['user']) // Removes all user entries
  
  // Invalidate by pattern
  lruCache.invalidateByPattern(/^post:.*/) // Removes all posts
  
  // LFU Cache Example
  const lfuCache = new LFUCache<unknown>({
    maxEntries: 50,
    maxSize: 1024 * 1024 // 1MB
  })
  
  // Access frequency affects eviction
  lfuCache.set('popular', { data: 'frequently accessed' })
  lfuCache.get('popular') // Increases frequency
  lfuCache.get('popular') // Increases frequency
  
  // Multi-tier Cache Example
  const multiTierCache = new MultiTierCache([
    {
      strategy: 'lru',
      options: {
        maxEntries: 10,
        ttl: 10000 // 10 seconds
      }
    },
    {
      strategy: 'lfu',
      options: {
        maxEntries: 100,
        ttl: 60000 // 1 minute
      }
    }
  ])
  
  // Data automatically promotes between tiers
  multiTierCache.set('data:1', { value: 'important' })
  const data = multiTierCache.get('data:1') // Checks all tiers
  
  // Dependency Cache Example
  const depCache = new DependencyCache<unknown>()
  
  // Set with dependencies
  depCache.setWithDependencies('userProfile', { name: 'John' }, ['user:1'])
  depCache.setWithDependencies('userPosts', [1, 2, 3], ['user:1', 'posts'])
  depCache.setWithDependencies('userComments', ['comment1'], ['user:1', 'comments'])
  
  // Cascade invalidation
  const invalidatedCount = depCache.invalidateCascade('user:1') 
  // Invalidates userProfile, userPosts, and userComments
  
  console.log(`Invalidated ${invalidatedCount} dependent entries`)
  
  // Get cache statistics
  const stats = lruCache.getStats()
  console.log(`Cache hit rate: ${(stats.hitRate.value * 100).toFixed(2)}%`)
  console.log(`Cache size: ${stats.size} bytes`)
  console.log(`Evictions: ${stats.evictions}`)
}

// ==================== 4. Vue Component Using Advanced Features ====================

const AdvancedFeaturesComponent = defineComponent({
  name: 'AdvancedFeatures',
  
  setup() {
    // Use plugin shared state
    const { state: userState, setState: setUser } = usePluginState<{
      name: string
      email: string
    }>('auth-plugin', 'currentUser')
    
    // Use advanced cache
    const { get, set, invalidate, stats } = useAdvancedCache<unknown>('lru', {
      maxEntries: 50,
      ttl: 30000
    })
    
    // Cache API responses
    const fetchUserData = async (userId: string) => {
      const cached = get(`user:${userId}`)
      if (cached) return cached
      
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      
      set(`user:${userId}`, data, { 
        ttl: 60000,
        tags: ['user', `user:${userId}`]
      })
      
      return data
    }
    
    // Reactive state with transactions
    const stateManager = createReactiveStateManager()
    
    // Create a complex form with transaction support
    const saveForm = async (formData: Record<string, unknown>) => {
      try {
        await stateManager.transaction(async () => {
          // Update multiple states atomically
          stateManager.set('form.data', formData)
          stateManager.set('form.status', 'saving')
          
          const response = await fetch('/api/save', {
            method: 'POST',
            body: JSON.stringify(formData)
          })
          
          if (!response.ok) throw new Error('Save failed')
          
          stateManager.set('form.status', 'saved')
          stateManager.set('form.lastSaved', Date.now())
        }, { retries: 3 })
      } catch (error) {
        // Transaction rolled back automatically
        stateManager.set('form.status', 'error')
        stateManager.set('form.error', error.message)
      }
    }
    
    // Watch for changes with pattern matching
    watchEffect(() => {
      stateManager.subscribe('form.*', (key, value) => {
        console.log(`Form field changed: ${key}`, value)
      })
    })
    
    return () => h('div', [
      h('h2', 'Advanced Features Demo'),
      
      h('div', { class: 'cache-stats' }, [
        h('h3', 'Cache Statistics'),
        h('p', `Hit Rate: ${(stats.value.hitRate.value * 100).toFixed(2)}%`),
        h('p', `Entries: ${stats.value.count}`),
        h('p', `Size: ${stats.value.size} bytes`),
        h('p', `Evictions: ${stats.value.evictions}`)
      ]),
      
      h('div', { class: 'user-state' }, [
        h('h3', 'User State'),
        h('p', userState.value ? `User: ${userState.value.name}` : 'Not logged in'),
        h('button', {
          onClick: () => setUser({
            name: 'Demo User',
            email: 'demo@example.com'
          })
        }, 'Set User')
      ]),
      
      h('button', {
        onClick: () => saveForm({ 
          title: 'Test', 
          content: 'Example content' 
        })
      }, 'Save Form (with transaction)')
    ])
  }
})

// ==================== 5. Main Application Setup ====================

async function main() {
  // Create engine with enhanced features
  const engine = await createEngine({
    config: {
      name: 'Advanced Features App',
      version: '2.0.0',
      debug: true
    }
  })
  
  // Initialize plugin shared state manager
  engine.pluginSharedState = createPluginSharedStateManager(engine.logger)
  
  // Register plugins
  await engine.use(authPlugin)
  await engine.use(themePlugin)
  
  // Demonstrate all features
  console.log('=== Reactive State Demo ===')
  await demonstrateReactiveState()
  
  console.log('=== Advanced Caching Demo ===')
  await demonstrateAdvancedCaching()
  
  // Synchronize state between plugins
  engine.pluginSharedState.synchronize(
    ['auth-plugin', 'theme-plugin'],
    'locale',
    { bidirectional: true, debounce: 300 }
  )
  
  // Create global computed state
  const globalStats = engine.pluginSharedState.createGlobalComputed('appStats', () => {
    const stats = engine.pluginSharedState.getStats()
    return {
      plugins: stats.totalPlugins,
      sharedStates: stats.totalSharedStates,
      memory: stats.memoryUsage
    }
  })
  
  console.log('Global Stats:', globalStats.value)
  
  // Get dependency graph
  const depGraph = engine.pluginSharedState.getDependencyGraph()
  console.log('State Dependency Graph:', depGraph)
  
  // Create Vue app with the component
  const app = engine.createApp(AdvancedFeaturesComponent)
  await engine.mount('#app')
  
  console.log('Advanced features application started successfully!')
  
  return engine
}

// Start the application
main().catch(console.error)

export { main }
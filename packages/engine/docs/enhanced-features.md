# 🚀 Enhanced Features Documentation

## 📋 Table of Contents
1. [Enhanced Reactive State Management](#enhanced-reactive-state-management)
2. [Plugin Shared State System](#plugin-shared-state-system)
3. [Advanced Caching Strategies](#advanced-caching-strategies)

---

## 🎯 Enhanced Reactive State Management

The new reactive state system provides Vue 3-like reactivity with advanced features:

### Features
- ✅ **Computed States**: Define derived state with automatic dependency tracking
- ✅ **State Transactions**: Atomic updates with automatic rollback on failure
- ✅ **State Persistence**: Save and restore state with versioning and migration
- ✅ **Reactive Collections**: Array-like structures with helper methods
- ✅ **Pattern Subscriptions**: Subscribe to state changes using patterns
- ✅ **Batch Updates**: Update multiple states efficiently

### Basic Usage

```typescript
import { createReactiveStateManager } from '@ldesign/engine/state/reactive-state'

const stateManager = createReactiveStateManager()

// Create reactive references
const userRef = stateManager.getRef<User>('user')
const configRef = stateManager.getShallowRef<Config>('config')

// Define computed states
const fullName = stateManager.defineComputed('fullName', () => {
  const user = userRef.value
  return user ? `${user.firstName} ${user.lastName}` : 'Guest'
})

// Create reactive collections
const todos = stateManager.createCollection<Todo>('todos')
todos.add({ id: 1, text: 'Learn Vue 3', done: false })

// Use transactions
await stateManager.transaction(async () => {
  stateManager.set('user.profile', { name: 'John' })
  stateManager.set('user.settings', { theme: 'dark' })
  
  const response = await saveToAPI()
  if (!response.ok) throw new Error('Save failed')
})
```

### State Persistence

```typescript
// Setup persistence with versioning
stateManager.persist('user', {
  key: 'app:user',
  storage: localStorage,
  version: 2,
  migrate: (oldState, oldVersion) => {
    if (oldVersion < 2) {
      return { ...oldState, newField: 'default' }
    }
    return oldState
  }
})
```

### Pattern-based Subscriptions

```typescript
// Subscribe to all settings changes
stateManager.subscribe('settings.*', (key, value) => {
  console.log(`Setting ${key} changed to ${value}`)
})

// Subscribe to specific user fields
stateManager.subscribe('user.profile.*', (key, value) => {
  syncProfileToServer(key, value)
})
```

---

## 🔗 Plugin Shared State System

Enable plugins to share reactive state with proper isolation and access control.

### Features
- ✅ **Namespace Isolation**: Each plugin has its own isolated state space
- ✅ **Access Control**: Private, protected, and public state visibility
- ✅ **Inter-plugin Messages**: Message bus for plugin communication
- ✅ **State Bridges**: Sync state between plugins with transformation
- ✅ **Global Computed**: Derive state from multiple plugins
- ✅ **State Synchronization**: Keep state in sync across plugins

### Plugin Definition

```typescript
const authPlugin: Plugin = {
  name: 'auth-plugin',
  version: '1.0.0',
  
  install(context) {
    const sharedState = context.engine.pluginSharedState
    
    // Register plugin
    sharedState.registerPlugin(this)
    
    // Create public shared state
    const userState = sharedState.createSharedState(
      'auth-plugin', 
      'currentUser', 
      null,
      {
        access: 'public',
        description: 'Current authenticated user',
        persist: true
      }
    )
    
    // Listen for messages
    sharedState.onMessage('auth-plugin', (message) => {
      if (message.type === 'LOGIN') {
        userState.value = message.data.user
        sharedState.sendMessage('auth-plugin', '*', 'USER_LOGGED_IN', {
          user: message.data.user
        })
      }
    })
  }
}
```

### Accessing Shared State

```typescript
const themePlugin: Plugin = {
  name: 'theme-plugin',
  dependencies: ['auth-plugin'],
  
  install(context) {
    const sharedState = context.engine.pluginSharedState
    
    // Access another plugin's state
    const userState = sharedState.accessSharedState(
      'theme-plugin',
      'auth-plugin',
      'currentUser'
    )
    
    // Watch for changes
    sharedState.watchSharedState(
      'theme-plugin',
      'auth-plugin',
      'currentUser',
      (newUser) => {
        applyUserTheme(newUser.preferences.theme)
      }
    )
  }
}
```

### State Synchronization

```typescript
// Sync state between multiple plugins
sharedState.synchronize(
  ['plugin-a', 'plugin-b', 'plugin-c'],
  'sharedConfig',
  { 
    bidirectional: true,
    debounce: 300 
  }
)

// Create a bridge with transformation
sharedState.createBridge(
  'source-plugin',
  'sourceState',
  'target-plugin',
  'targetState',
  (value) => transformValue(value)
)
```

---

## 💾 Advanced Caching Strategies

Multiple sophisticated caching strategies for different use cases.

### Available Strategies
- **LRU (Least Recently Used)**: Evicts least recently accessed items
- **LFU (Least Frequently Used)**: Evicts least frequently accessed items
- **Multi-tier Cache**: Multiple cache layers with promotion
- **Dependency Cache**: Cascade invalidation based on dependencies

### LRU Cache

```typescript
import { LRUCache } from '@ldesign/engine/cache/advanced-cache'

const cache = new LRUCache<UserData>({
  maxEntries: 100,
  ttl: 60000, // 1 minute
  onEvict: (entry) => {
    console.log(`Evicted: ${entry.key}`)
  }
})

// Set with tags
cache.set('user:123', userData, {
  tags: ['user', 'active'],
  ttl: 30000
})

// Invalidate by tags
cache.invalidateByTags(['user'])

// Invalidate by pattern
cache.invalidateByPattern(/^user:.*/)
```

### LFU Cache

```typescript
import { LFUCache } from '@ldesign/engine/cache/advanced-cache'

const cache = new LFUCache({
  maxEntries: 50,
  maxSize: 1024 * 1024 // 1MB
})

// Frequently accessed items are less likely to be evicted
cache.set('popular-item', data)
cache.get('popular-item') // Increases frequency
```

### Multi-tier Cache

```typescript
import { MultiTierCache } from '@ldesign/engine/cache/advanced-cache'

const cache = new MultiTierCache([
  {
    strategy: 'lru',
    options: {
      maxEntries: 10,
      ttl: 10000 // Hot cache - 10 seconds
    }
  },
  {
    strategy: 'lfu',
    options: {
      maxEntries: 100,
      ttl: 60000 // Warm cache - 1 minute
    }
  }
])

// Data automatically promotes between tiers
const data = cache.get('key') // Checks all tiers
```

### Dependency Cache

```typescript
import { DependencyCache } from '@ldesign/engine/cache/advanced-cache'

const cache = new DependencyCache()

// Set with dependencies
cache.setWithDependencies('userProfile', profile, ['user:123'])
cache.setWithDependencies('userPosts', posts, ['user:123', 'posts'])
cache.setWithDependencies('userComments', comments, ['user:123'])

// Cascade invalidation
const count = cache.invalidateCascade('user:123')
// Invalidates userProfile, userPosts, and userComments
```

### Vue Composable

```typescript
import { useAdvancedCache } from '@ldesign/engine/cache/advanced-cache'

export default {
  setup() {
    const { get, set, invalidate, stats } = useAdvancedCache('lru', {
      maxEntries: 50,
      ttl: 30000
    })
    
    const fetchData = async (id: string) => {
      const cached = get(`data:${id}`)
      if (cached) return cached
      
      const data = await api.getData(id)
      set(`data:${id}`, data, { tags: ['api-data'] })
      return data
    }
    
    return {
      fetchData,
      cacheStats: stats
    }
  }
}
```

---

## 🎨 Complete Example

Here's a complete example combining all enhanced features:

```typescript
import { createEngine } from '@ldesign/engine'
import { createReactiveStateManager } from '@ldesign/engine/state/reactive-state'
import { createPluginSharedStateManager } from '@ldesign/engine/plugins/plugin-shared-state'
import { MultiTierCache } from '@ldesign/engine/cache/advanced-cache'

async function setupAdvancedApp() {
  const engine = await createEngine({
    config: {
      name: 'Advanced App',
      version: '2.0.0'
    }
  })
  
  // Setup reactive state
  const stateManager = createReactiveStateManager(engine.logger)
  
  // Setup plugin shared state
  engine.pluginSharedState = createPluginSharedStateManager(engine.logger)
  
  // Setup multi-tier cache
  const cache = new MultiTierCache([
    { strategy: 'lru', options: { maxEntries: 10 } },
    { strategy: 'lfu', options: { maxEntries: 100 } }
  ])
  
  // Use transaction for atomic updates
  await stateManager.transaction(async () => {
    stateManager.set('app.initialized', true)
    stateManager.set('app.cache', cache)
    
    // Initialize plugins
    await engine.use(authPlugin)
    await engine.use(themePlugin)
  })
  
  // Setup state persistence
  stateManager.persist('app.settings', {
    key: 'app:settings',
    version: 1
  })
  
  // Create global computed state
  const appStatus = engine.pluginSharedState.createGlobalComputed('appStatus', () => ({
    pluginsLoaded: engine.plugins.getAll().length,
    cacheHitRate: cache.getStats()[0].stats.hitRate.value,
    stateSize: stateManager.getStats().totalKeys
  }))
  
  return engine
}
```

---

## 📊 Performance Considerations

### State Management
- Use `getShallowRef()` for large objects to avoid deep reactivity
- Batch updates when modifying multiple states
- Use transactions for atomic operations
- Enable persistence selectively for important state

### Caching
- Choose appropriate cache strategy based on access patterns
- Set reasonable TTL values to balance freshness and performance
- Use tags for efficient bulk invalidation
- Monitor cache hit rates and adjust sizes accordingly

### Plugin Communication
- Use message filtering to reduce overhead
- Debounce state synchronization for frequently changing values
- Use protected/private access levels to minimize cross-plugin dependencies
- Clean up event listeners when plugins are unregistered

---

## 🔄 Migration Guide

### From Basic State to Reactive State

```typescript
// Before
engine.state.set('user', userData)
const user = engine.state.get('user')

// After
const stateManager = createReactiveStateManager()
const userRef = stateManager.getRef('user')
userRef.value = userData
// Automatically reactive!
```

### From Simple Cache to Advanced Cache

```typescript
// Before
engine.cache.set('key', value, ttl)
const cached = engine.cache.get('key')

// After
const cache = new LRUCache({ maxEntries: 100, ttl: 60000 })
cache.set('key', value, { tags: ['category'] })
cache.invalidateByTags(['category'])
```

---

## 🎯 Best Practices

1. **State Management**
   - Use computed states for derived values
   - Wrap related updates in transactions
   - Persist only essential state
   - Use pattern subscriptions judiciously

2. **Plugin Communication**
   - Define clear message protocols
   - Use appropriate access levels
   - Document shared state contracts
   - Handle message failures gracefully

3. **Caching**
   - Profile to choose the right strategy
   - Set appropriate cache sizes
   - Use tags for logical grouping
   - Monitor and tune cache performance

---

## 🚀 What's Next?

- **SSR Support**: Server-side rendering with state hydration
- **WebWorker Integration**: Offload heavy computations
- **GraphQL Cache**: Specialized caching for GraphQL
- **State Time Travel**: Debug with state history
- **Distributed State**: Multi-tab/window state sync

Stay tuned for more exciting features! 🎉
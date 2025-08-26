# 实现细节

## 技术实现

### 1. 状态管理实现

#### Store 基础结构
```typescript
// 基础 Store 模板
export const useBaseStore = defineStore('base', {
  state: () => ({
    loading: false,
    error: null as string | null,
    data: [] as any[]
  }),
  
  getters: {
    hasData: (state) => state.data.length > 0,
    isReady: (state) => !state.loading && !state.error
  },
  
  actions: {
    async fetchData() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.getData()
        this.data = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    reset() {
      this.loading = false
      this.error = null
      this.data = []
    }
  }
})
```

#### 装饰器实现
```typescript
// 装饰器的实现原理
function State(target: any, propertyKey: string) {
  // 将属性标记为状态
  if (!target._states) target._states = []
  target._states.push(propertyKey)
}

function Action(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // 包装 action 方法
  const originalMethod = descriptor.value
  
  descriptor.value = function(...args: any[]) {
    // 添加错误处理、日志等
    try {
      return originalMethod.apply(this, args)
    } catch (error) {
      console.error(`Action ${propertyKey} failed:`, error)
      throw error
    }
  }
}

function Getter(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // 将方法转换为计算属性
  const originalMethod = descriptor.get
  
  descriptor.get = function() {
    // 添加缓存逻辑
    if (!this._getterCache) this._getterCache = new Map()
    
    const cacheKey = propertyKey
    if (this._getterCache.has(cacheKey)) {
      return this._getterCache.get(cacheKey)
    }
    
    const result = originalMethod?.call(this)
    this._getterCache.set(cacheKey, result)
    return result
  }
}
```

### 2. 性能优化实现

#### 防抖和节流
```typescript
// 防抖实现
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// 节流实现
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return function(...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func.apply(this, args)
    }
  }
}

// 装饰器形式
export function Debounced(delay: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = debounce(originalMethod, delay)
  }
}

export function Throttled(delay: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = throttle(originalMethod, delay)
  }
}
```

#### 缓存机制
```typescript
// LRU 缓存实现
class LRUCache<K, V> {
  private capacity: number
  private cache: Map<K, V>
  
  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
  }
  
  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // 移到最后（最近使用）
      const value = this.cache.get(key)!
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return undefined
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
}

// 缓存装饰器
export function Cached(maxSize: number = 100) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const cache = new LRUCache(maxSize)
    
    descriptor.value = function(...args: any[]) {
      const key = JSON.stringify(args)
      
      if (cache.get(key)) {
        return cache.get(key)
      }
      
      const result = originalMethod.apply(this, args)
      cache.set(key, result)
      return result
    }
  }
}
```

### 3. 持久化实现

#### 存储适配器
```typescript
// 存储接口
interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

// localStorage 适配器
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }
  
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }
  
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }
  
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

// 持久化插件
export function createPersistencePlugin(options: {
  key: string
  storage: StorageAdapter
  paths?: string[]
}) {
  return (store: any) => {
    // 加载保存的状态
    const savedState = options.storage.getItem(options.key)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        store.$patch(parsed)
      } catch (error) {
        console.warn('Failed to parse saved state:', error)
      }
    }
    
    // 监听状态变化并保存
    store.$subscribe((mutation: any, state: any) => {
      try {
        const stateToSave = options.paths 
          ? pick(state, options.paths)
          : state
        
        options.storage.setItem(
          options.key,
          JSON.stringify(stateToSave)
        )
      } catch (error) {
        console.warn('Failed to save state:', error)
      }
    })
  }
}
```

### 4. 实时同步实现

#### WebSocket 管理器
```typescript
class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Function[]> = new Map()
  
  constructor(url: string) {
    this.url = url
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        
        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit(data.type, data.payload)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
        
        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.reconnect()
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
  
  send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    } else {
      console.warn('WebSocket is not connected')
    }
  }
  
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }
  
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
```

### 5. 企业级功能实现

#### 权限管理
```typescript
// 权限系统
interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

interface Role {
  id: string
  name: string
  permissions: string[]
}

interface User {
  id: string
  username: string
  roles: string[]
}

class PermissionManager {
  private permissions: Map<string, Permission> = new Map()
  private roles: Map<string, Role> = new Map()
  
  addPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission)
  }
  
  addRole(role: Role): void {
    this.roles.set(role.id, role)
  }
  
  hasPermission(user: User, permissionId: string): boolean {
    // 检查用户的所有角色是否包含该权限
    return user.roles.some(roleId => {
      const role = this.roles.get(roleId)
      return role?.permissions.includes(permissionId)
    })
  }
  
  hasResource(user: User, resource: string, action: string): boolean {
    // 检查用户是否有对特定资源的特定操作权限
    const permission = Array.from(this.permissions.values()).find(
      p => p.resource === resource && p.action === action
    )
    
    return permission ? this.hasPermission(user, permission.id) : false
  }
}

// 权限装饰器
export function RequirePermission(permissionId: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args: any[]) {
      const userStore = useUserStore()
      const permissionManager = inject<PermissionManager>('permissionManager')
      
      if (!permissionManager?.hasPermission(userStore.currentUser, permissionId)) {
        throw new Error(`Permission denied: ${permissionId}`)
      }
      
      return originalMethod.apply(this, args)
    }
  }
}
```

#### 模块管理
```typescript
// 模块系统
interface Module {
  id: string
  name: string
  version: string
  enabled: boolean
  dependencies: string[]
  load: () => Promise<void>
  unload: () => Promise<void>
}

class ModuleManager {
  private modules: Map<string, Module> = new Map()
  private loadedModules: Set<string> = new Set()
  
  register(module: Module): void {
    this.modules.set(module.id, module)
  }
  
  async load(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId)
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`)
    }
    
    if (this.loadedModules.has(moduleId)) {
      return // 已经加载
    }
    
    // 加载依赖
    for (const depId of module.dependencies) {
      await this.load(depId)
    }
    
    // 加载模块
    await module.load()
    this.loadedModules.add(moduleId)
    
    console.log(`Module loaded: ${moduleId}`)
  }
  
  async unload(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId)
    if (!module || !this.loadedModules.has(moduleId)) {
      return
    }
    
    // 检查是否有其他模块依赖此模块
    const dependents = Array.from(this.modules.values()).filter(
      m => m.dependencies.includes(moduleId) && this.loadedModules.has(m.id)
    )
    
    if (dependents.length > 0) {
      throw new Error(`Cannot unload module ${moduleId}: has dependents`)
    }
    
    await module.unload()
    this.loadedModules.delete(moduleId)
    
    console.log(`Module unloaded: ${moduleId}`)
  }
  
  isLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId)
  }
  
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules)
  }
}
```

## 关键技术决策

### 1. 为什么使用 Pinia 而不是 Vuex?

**优势对比**:
- **类型安全**: Pinia 提供更好的 TypeScript 支持
- **开发体验**: 更简洁的 API 和更好的 DevTools 集成
- **性能**: 更好的 tree-shaking 和代码分割
- **维护性**: Vue 3 官方推荐，长期支持保证

### 2. 为什么选择装饰器模式?

**设计考虑**:
- **声明式**: 更直观的代码表达
- **可组合**: 装饰器可以组合使用
- **关注点分离**: 业务逻辑和横切关注点分离
- **可扩展**: 易于添加新的功能装饰器

### 3. 为什么实现自定义缓存?

**技术原因**:
- **控制粒度**: 可以精确控制缓存策略
- **性能优化**: 针对特定场景优化
- **内存管理**: 避免内存泄漏
- **调试友好**: 便于监控和调试

## 性能优化细节

### 1. 渲染优化
```typescript
// 使用 shallowRef 避免深度响应式
const largeData = shallowRef([])

// 使用 markRaw 标记不需要响应式的对象
const staticConfig = markRaw({
  apiUrl: 'https://api.example.com',
  timeout: 5000
})

// 使用 v-memo 缓存渲染结果
// <div v-memo="[item.id, item.status]">{{ item.name }}</div>
```

### 2. 内存优化
```typescript
// 组件卸载时清理资源
onUnmounted(() => {
  // 清理定时器
  clearInterval(intervalId)
  
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
  
  // 清理 WebSocket 连接
  websocket?.disconnect()
  
  // 清理缓存
  cache.clear()
})
```

### 3. 网络优化
```typescript
// 请求去重
const pendingRequests = new Map()

async function request(url: string) {
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url)
  }
  
  const promise = fetch(url).then(res => res.json())
  pendingRequests.set(url, promise)
  
  try {
    const result = await promise
    return result
  } finally {
    pendingRequests.delete(url)
  }
}
```

## 测试实现

### 1. Store 测试
```typescript
// Store 单元测试
describe('ProductStore', () => {
  let store: ReturnType<typeof useProductStore>
  
  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductStore()
  })
  
  it('should add product to cart', async () => {
    await store.addToCart(1, 2)
    
    expect(store.cart).toHaveLength(1)
    expect(store.cart[0]).toMatchObject({
      productId: 1,
      quantity: 2
    })
  })
  
  it('should calculate cart total correctly', async () => {
    await store.addToCart(1, 2) // $100 * 2
    await store.addToCart(2, 1) // $50 * 1
    
    expect(store.cartTotal).toBe(250)
  })
})
```

### 2. 组件测试
```typescript
// 组件集成测试
describe('ProductCard', () => {
  it('should display product information', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 100,
      inStock: true
    }
    
    const wrapper = mount(ProductCard, {
      props: { product }
    })
    
    expect(wrapper.text()).toContain('Test Product')
    expect(wrapper.text()).toContain('$100')
  })
  
  it('should emit add-to-cart event', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })
    
    await wrapper.find('[data-test="add-to-cart"]').trigger('click')
    
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
  })
})
```

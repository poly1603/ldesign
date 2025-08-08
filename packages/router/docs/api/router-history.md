# RouterHistory API

RouterHistory 是 LDesign Router 的历史管理接口，提供了不同的历史模式和强大的历史操作功能。

## 📋 历史模式

### createWebHistory

创建 HTML5 History 模式：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 自定义 base URL
const router = createRouter({
  history: createWebHistory('/app/'),
  routes,
})
```

**特点：**

- URL 格式：`https://example.com/user/123`
- 需要服务器配置支持
- SEO 友好
- 支持服务端渲染

**服务器配置示例：**

```nginx
# Nginx 配置
location / {
  try_files $uri $uri/ /index.html;
}
```

```apache
# Apache 配置
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### createWebHashHistory

创建 Hash 模式：

```typescript
import { createRouter, createWebHashHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 自定义 base URL
const router = createRouter({
  history: createWebHashHistory('/app/'),
  routes,
})
```

**特点：**

- URL 格式：`https://example.com/#/user/123`
- 无需服务器配置
- 兼容性好
- 不支持服务端渲染

### createMemoryHistory

创建内存模式（主要用于 SSR 和测试）：

```typescript
import { createMemoryHistory, createRouter } from '@ldesign/router'

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

// 指定初始路径
const router = createRouter({
  history: createMemoryHistory('/initial-path'),
  routes,
})
```

**特点：**

- 不依赖浏览器环境
- 适用于服务端渲染
- 适用于单元测试
- 历史记录存储在内存中

## 🎯 RouterHistory 接口

### 基础属性

```typescript
interface RouterHistory {
  readonly base: string // 基础路径
  readonly location: HistoryLocation // 当前位置
  readonly state: HistoryState // 当前状态
}
```

### 核心方法

#### push()

添加新的历史记录：

```typescript
// 基础用法
history.push('/user/123')

// 带状态
history.push('/user/123', { from: 'search' })

// 完整参数
history.push(
  {
    pathname: '/user/123',
    search: '?tab=profile',
    hash: '#section1',
  },
  { timestamp: Date.now() }
)
```

#### replace()

替换当前历史记录：

```typescript
// 替换当前记录
history.replace('/login')

// 带状态
history.replace('/login', { reason: 'session_expired' })
```

#### go()

在历史记录中导航：

```typescript
// 后退一步
history.go(-1)

// 前进一步
history.go(1)

// 后退两步
history.go(-2)
```

#### back()

后退一步：

```typescript
history.back()
// 等同于 history.go(-1)
```

#### forward()

前进一步：

```typescript
history.forward()
// 等同于 history.go(1)
```

### 事件监听

#### listen()

监听历史变化：

```typescript
const unlisten = history.listen((location, action) => {
  console.log('历史变化:', {
    location: location.pathname,
    action, // 'PUSH' | 'REPLACE' | 'POP'
    state: location.state,
  })
})

// 取消监听
unlisten()
```

#### beforeUnload()

监听页面卸载前事件：

```typescript
const unregister = history.beforeUnload((location, action) => {
  // 返回字符串会显示确认对话框
  if (hasUnsavedChanges()) {
    return '您有未保存的更改，确定要离开吗？'
  }
})

// 取消监听
unregister()
```

## 🔧 高级功能

### 状态管理

```typescript
// 保存状态到历史记录
function saveStateToHistory(data) {
  history.replace(history.location.pathname, {
    ...history.location.state,
    userData: data,
    timestamp: Date.now(),
  })
}

// 从历史记录恢复状态
function restoreStateFromHistory() {
  const state = history.location.state
  if (state?.userData) {
    return state.userData
  }
  return null
}

// 监听状态变化
history.listen((location, action) => {
  if (action === 'POP' && location.state?.userData) {
    // 恢复用户数据
    restoreUserData(location.state.userData)
  }
})
```

### 自定义历史实现

```typescript
// 创建自定义历史实现
class CustomHistory implements RouterHistory {
  private _location: HistoryLocation
  private _listeners: Set<HistoryListener> = new Set()

  constructor(base: string = '') {
    this.base = base
    this._location = this.createLocation(window.location.pathname)
  }

  get location(): HistoryLocation {
    return this._location
  }

  get state(): HistoryState {
    return window.history.state
  }

  push(to: string | Partial<Path>, state?: HistoryState): void {
    const location = this.createLocation(to)
    window.history.pushState(state, '', location.fullPath)
    this._location = location
    this.notify(location, 'PUSH')
  }

  replace(to: string | Partial<Path>, state?: HistoryState): void {
    const location = this.createLocation(to)
    window.history.replaceState(state, '', location.fullPath)
    this._location = location
    this.notify(location, 'REPLACE')
  }

  go(delta: number): void {
    window.history.go(delta)
  }

  back(): void {
    this.go(-1)
  }

  forward(): void {
    this.go(1)
  }

  listen(listener: HistoryListener): () => void {
    this._listeners.add(listener)
    return () => this._listeners.delete(listener)
  }

  private createLocation(to: string | Partial<Path>): HistoryLocation {
    // 实现位置创建逻辑
    // ...
  }

  private notify(location: HistoryLocation, action: HistoryAction): void {
    this._listeners.forEach(listener => listener(location, action))
  }
}

// 使用自定义历史
const customHistory = new CustomHistory('/app')
const router = createRouter({
  history: customHistory,
  routes,
})
```

## 🎯 实际应用

### 页面状态保存

```typescript
// 保存页面滚动位置
function saveScrollPosition() {
  const scrollY = window.scrollY
  history.replace(history.location.pathname, {
    ...history.location.state,
    scrollPosition: scrollY,
  })
}

// 恢复页面滚动位置
function restoreScrollPosition() {
  const state = history.location.state
  if (state?.scrollPosition) {
    window.scrollTo(0, state.scrollPosition)
  }
}

// 监听滚动并保存位置
let scrollTimer: number
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(saveScrollPosition, 100)
})

// 页面加载时恢复位置
window.addEventListener('load', restoreScrollPosition)
```

### 表单数据保存

```typescript
// 保存表单数据
function saveFormData(formData: any) {
  history.replace(history.location.pathname, {
    ...history.location.state,
    formData,
    savedAt: Date.now(),
  })
}

// 恢复表单数据
function restoreFormData(): any {
  const state = history.location.state
  if (state?.formData && state?.savedAt) {
    // 检查数据是否过期（例如：1小时）
    const isExpired = Date.now() - state.savedAt > 60 * 60 * 1000
    if (!isExpired) {
      return state.formData
    }
  }
  return null
}

// 在表单组件中使用
const FormComponent = {
  setup() {
    const formData = ref(restoreFormData() || {})

    // 监听表单变化并保存
    watch(
      formData,
      newData => {
        saveFormData(newData)
      },
      { deep: true }
    )

    return { formData }
  },
}
```

### 导航历史分析

```typescript
// 导航历史跟踪
class NavigationTracker {
  private history: Array<{
    path: string
    timestamp: number
    action: string
  }> = []

  constructor(routerHistory: RouterHistory) {
    routerHistory.listen((location, action) => {
      this.history.push({
        path: location.pathname,
        timestamp: Date.now(),
        action,
      })

      // 限制历史记录数量
      if (this.history.length > 50) {
        this.history.shift()
      }
    })
  }

  getNavigationStats() {
    const totalNavigations = this.history.length
    const uniquePaths = new Set(this.history.map(h => h.path)).size
    const averageTimePerPage = this.calculateAverageTime()

    return {
      totalNavigations,
      uniquePaths,
      averageTimePerPage,
      mostVisitedPaths: this.getMostVisitedPaths(),
    }
  }

  private calculateAverageTime(): number {
    if (this.history.length < 2) return 0

    const times = []
    for (let i = 1; i < this.history.length; i++) {
      times.push(this.history[i].timestamp - this.history[i - 1].timestamp)
    }

    return times.reduce((a, b) => a + b, 0) / times.length
  }

  private getMostVisitedPaths(): Array<{ path: string; count: number }> {
    const pathCounts = new Map<string, number>()

    this.history.forEach(h => {
      pathCounts.set(h.path, (pathCounts.get(h.path) || 0) + 1)
    })

    return Array.from(pathCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}

// 使用导航跟踪
const tracker = new NavigationTracker(router.history)

// 获取统计信息
const stats = tracker.getNavigationStats()
console.log('导航统计:', stats)
```

## 🎯 最佳实践

### 1. 选择合适的历史模式

```typescript
// ✅ 推荐：生产环境使用 HTML5 History
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ 推荐：开发环境或兼容性要求高时使用 Hash
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// ✅ 推荐：SSR 或测试环境使用 Memory
const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
```

### 2. 合理使用状态

```typescript
// ✅ 推荐：保存必要的状态信息
history.push('/user/123', {
  from: 'search',
  searchQuery: 'vue router',
  timestamp: Date.now(),
})

// ❌ 避免：保存大量数据到状态
history.push('/user/123', {
  userData: largeUserObject, // 可能导致内存问题
  allProducts: productList, // 应该从 API 重新获取
})
```

### 3. 错误处理

```typescript
// ✅ 推荐：处理历史操作错误
try {
  history.push('/new-path')
} catch (error) {
  console.error('导航失败:', error)
  // 回退到安全路径
  history.replace('/')
}

// ✅ 推荐：监听历史错误
history.listen((location, action) => {
  try {
    // 处理位置变化
    handleLocationChange(location)
  } catch (error) {
    console.error('位置变化处理失败:', error)
  }
})
```

RouterHistory 是路由系统的基础，理解其工作原理和正确使用方法对于构建稳定的路由应用至关重要。

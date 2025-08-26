# 防抖和节流

防抖（Debounce）和节流（Throttle）是优化高频操作的重要技术。@ldesign/store 提供了内置的装饰器支持。

## 🎯 基本概念

### 防抖 (Debounce)
在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。

### 节流 (Throttle)
规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效。

## 🔧 基本用法

### 防抖装饰器

```typescript
import { BaseStore, State, Action, Debounce } from '@ldesign/store'

export class SearchStore extends BaseStore {
  @State
  query = ''
  
  @State
  results = []

  @Action
  @Debounce(300) // 防抖300毫秒
  async search(query: string) {
    this.query = query
    if (query.length < 2) {
      this.results = []
      return
    }
    
    console.log('执行搜索:', query)
    this.results = await api.search(query)
  }
}
```

### 节流装饰器

```typescript
export class ScrollStore extends BaseStore {
  @State
  scrollPosition = 0

  @Action
  @Throttle(100) // 节流100毫秒
  updateScrollPosition(position: number) {
    console.log('更新滚动位置:', position)
    this.scrollPosition = position
  }
}
```

## ⚙️ 高级配置

### 防抖配置选项

```typescript
export class FormStore extends BaseStore {
  @State
  formData = {}

  @Action
  @Debounce({
    wait: 500,           // 等待时间
    leading: false,      // 是否在延迟开始前调用
    trailing: true,      // 是否在延迟结束后调用
    maxWait: 2000       // 最大等待时间
  })
  async saveForm(data: any) {
    this.formData = data
    await api.saveForm(data)
  }
}
```

### 节流配置选项

```typescript
export class ApiStore extends BaseStore {
  @Action
  @Throttle({
    wait: 1000,          // 节流间隔
    leading: true,       // 是否在节流开始前执行
    trailing: false      // 是否在节流结束后执行
  })
  async syncData() {
    console.log('同步数据')
    await api.syncData()
  }
}
```

## 🚀 实际应用场景

### 搜索输入优化

```typescript
export class SearchStore extends BaseStore {
  @State
  searchQuery = ''
  
  @State
  searchResults = []
  
  @State
  loading = false

  @Action
  @Debounce(300)
  async performSearch(query: string) {
    this.searchQuery = query
    
    if (query.length < 2) {
      this.searchResults = []
      return
    }

    try {
      this.loading = true
      this.searchResults = await api.search(query)
    } finally {
      this.loading = false
    }
  }

  @Action
  @Debounce(1000)
  async saveSearchHistory(query: string) {
    if (query.length >= 2) {
      await api.saveSearchHistory(query)
    }
  }
}
```

### 滚动事件优化

```typescript
export class ScrollStore extends BaseStore {
  @State
  scrollTop = 0
  
  @State
  isScrolling = false

  @Action
  @Throttle(16) // 约60fps
  handleScroll(scrollTop: number) {
    this.scrollTop = scrollTop
    this.isScrolling = true
  }

  @Action
  @Debounce(150)
  handleScrollEnd() {
    this.isScrolling = false
  }
}
```

### 表单自动保存

```typescript
export class FormStore extends BaseStore {
  @State
  formData = {
    title: '',
    content: '',
    tags: []
  }

  @State
  lastSaved = null

  @Action
  updateField(field: string, value: any) {
    this.formData[field] = value
    this.autoSave()
  }

  @Action
  @Debounce(2000) // 2秒后自动保存
  async autoSave() {
    try {
      await api.saveForm(this.formData)
      this.lastSaved = Date.now()
      console.log('表单已自动保存')
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }
}
```

### API 请求优化

```typescript
export class DataStore extends BaseStore {
  @State
  data = []

  @Action
  @Throttle(5000) // 5秒内最多执行一次
  async refreshData() {
    console.log('刷新数据')
    this.data = await api.getData()
  }

  @Action
  @Debounce(300)
  async updateData(updates: any) {
    // 批量更新，避免频繁请求
    await api.updateData(updates)
    await this.refreshData()
  }
}
```

## 🎨 Vue 组件中的使用

### 搜索组件

```vue
<template>
  <div class="search-component">
    <input
      v-model="localQuery"
      @input="handleInput"
      placeholder="搜索..."
      class="search-input"
    />
    
    <div v-if="loading" class="loading">搜索中...</div>
    
    <div class="results">
      <div
        v-for="result in results"
        :key="result.id"
        class="result-item"
      >
        {{ result.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSearchStore } from '@/stores/SearchStore'

const searchStore = useSearchStore()
const localQuery = ref('')

const results = computed(() => searchStore.searchResults)
const loading = computed(() => searchStore.loading)

const handleInput = (event: Event) => {
  const query = (event.target as HTMLInputElement).value
  localQuery.value = query
  searchStore.performSearch(query) // 自动防抖
}
</script>
```

### 滚动监听组件

```vue
<template>
  <div
    class="scroll-container"
    @scroll="handleScroll"
  >
    <div class="content">
      <!-- 内容 -->
    </div>
    
    <div v-if="isScrolling" class="scroll-indicator">
      滚动中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScrollStore } from '@/stores/ScrollStore'

const scrollStore = useScrollStore()

const isScrolling = computed(() => scrollStore.isScrolling)

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollStore.handleScroll(target.scrollTop) // 自动节流
  scrollStore.handleScrollEnd() // 自动防抖
}
</script>
```

## 🛠️ 自定义实现

### 手动防抖函数

```typescript
export class CustomDebounceStore extends BaseStore {
  private debounceTimers = new Map<string, NodeJS.Timeout>()

  @Action
  customDebounce(key: string, fn: Function, delay: number) {
    // 清除之前的定时器
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!)
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      fn()
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }

  @Action
  searchWithCustomDebounce(query: string) {
    this.customDebounce('search', () => {
      this.performActualSearch(query)
    }, 300)
  }
}
```

### 手动节流函数

```typescript
export class CustomThrottleStore extends BaseStore {
  private throttleFlags = new Map<string, boolean>()

  @Action
  customThrottle(key: string, fn: Function, delay: number) {
    if (this.throttleFlags.get(key)) {
      return // 正在节流中，忽略调用
    }

    // 执行函数
    fn()
    
    // 设置节流标志
    this.throttleFlags.set(key, true)
    
    // 延迟后清除标志
    setTimeout(() => {
      this.throttleFlags.set(key, false)
    }, delay)
  }

  @Action
  updateWithCustomThrottle(data: any) {
    this.customThrottle('update', () => {
      this.performActualUpdate(data)
    }, 1000)
  }
}
```

## 📊 性能监控

### 监控防抖节流效果

```typescript
export class PerformanceStore extends BaseStore {
  @State
  callStats = {
    totalCalls: 0,
    executedCalls: 0,
    savedCalls: 0
  }

  @Action
  @Debounce({
    wait: 300,
    onCall: () => {
      this.callStats.totalCalls++
    },
    onExecute: () => {
      this.callStats.executedCalls++
      this.callStats.savedCalls = this.callStats.totalCalls - this.callStats.executedCalls
    }
  })
  async monitoredSearch(query: string) {
    console.log('执行搜索:', query)
    return await api.search(query)
  }

  @Getter
  get performanceStats() {
    const { totalCalls, executedCalls, savedCalls } = this.callStats
    return {
      totalCalls,
      executedCalls,
      savedCalls,
      efficiency: totalCalls > 0 ? (savedCalls / totalCalls * 100).toFixed(2) + '%' : '0%'
    }
  }
}
```

## 🎯 最佳实践

### 1. 选择合适的延迟时间

```typescript
// ✅ 根据场景选择合适的延迟
@Debounce(300)   // 搜索输入：300ms
@Debounce(1000)  // 表单保存：1秒
@Debounce(2000)  // 数据同步：2秒

@Throttle(16)    // 滚动事件：约60fps
@Throttle(100)   // 窗口调整：100ms
@Throttle(1000)  // API调用：1秒
```

### 2. 合理组合使用

```typescript
export class OptimizedStore extends BaseStore {
  @Action
  @Debounce(300)
  async search(query: string) {
    // 防抖搜索输入
  }

  @Action
  @Throttle(1000)
  async saveProgress() {
    // 节流进度保存
  }
}
```

### 3. 避免过度使用

```typescript
// ❌ 避免对简单操作使用防抖节流
@Debounce(100)
setSimpleValue(value: string) {
  this.simpleValue = value // 不需要防抖
}

// ✅ 只对需要优化的操作使用
@Debounce(300)
async complexSearch(query: string) {
  return await api.complexSearch(query) // 需要防抖
}
```

防抖和节流是优化用户体验和应用性能的重要工具，合理使用可以显著减少不必要的计算和网络请求。

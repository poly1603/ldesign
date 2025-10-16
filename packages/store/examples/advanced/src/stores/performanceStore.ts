import {
  Action,
  AsyncAction,
  BaseStore,
  CachedAction,
  CachedGetter,
  DebouncedAction,
  getOptimizationSuggestions,
  Getter,
  MonitorAction,
  MonitorGetter,
  State,
  ThrottledAction,
  usePerformanceMonitor,
} from '@ldesign/store'

interface UserData {
  id: number
  name: string
  email: string
}

interface SearchResult {
  id: number
  title: string
  content: string
}

export class PerformanceStore extends BaseStore {
  @State({ default: [] })
  data: number[] = []

  @State({ default: '' })
  searchQuery: string = ''

  @State({ default: [] })
  searchResults: SearchResult[] = []

  @State({ default: 0 })
  scrollPosition: number = 0

  @State({ default: null })
  userData: UserData | null = null

  @State({ default: 0 })
  expensiveComputationResult: number = 0

  @State({ default: false })
  isCacheHit: boolean = false

  @State({ default: 'empty' })
  apiCacheStatus: 'empty' | 'cached' | 'expired' = 'empty'

  constructor() {
    super('performance-store')
    // 初始化一些测试数据
    this.data = Array.from({ length: 1000 }, () => Math.random() * 100)
  }

  // 性能监控示例
  @MonitorAction
  @Action()
  async performSlowAction(): Promise<void> {
    // 模拟慢速操作
    await new Promise(resolve => setTimeout(resolve, 100))
    
  }

  @MonitorAction
  @Action()
  performFastAction(): void {
    // 快速操作
    
  }

  // 缓存示例
  @MonitorGetter
  @CachedGetter(['data'])
  get complexCalculation(): number {
    
    // 模拟复杂计算
    let result = 0
    for (let i = 0; i < this.data.length; i++) {
      result += Math.sin(this.data[i]) * Math.cos(this.data[i])
    }
    return result
  }

  @Action()
  performExpensiveComputation(): number {
    const startTime = performance.now()
    const result = this.complexCalculation
    const endTime = performance.now()

    this.expensiveComputationResult = result
    this.isCacheHit = endTime - startTime < 1 // 如果计算很快，说明命中缓存

    return result
  }

  // API 缓存示例
  @CachedAction(60000) // 缓存1分钟
  @AsyncAction()
  async fetchUserData(): Promise<UserData> {
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const userData: UserData = {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
    }

    this.userData = userData
    this.apiCacheStatus = 'cached'

    return userData
  }

  @Action()
  clearApiCache(): void {
    this.userData = null
    this.apiCacheStatus = 'empty'
  }

  // 防抖搜索示例
  @DebouncedAction(300)
  @Action()
  performSearch(query: string): void {
    this.searchQuery = query

    if (!query.trim()) {
      this.searchResults = []
      return
    }

    

    // 模拟搜索结果
    const mockResults: SearchResult[] = [
      { id: 1, title: `${query} 相关结果 1`, content: '这是搜索结果的内容...' },
      { id: 2, title: `${query} 相关结果 2`, content: '这是另一个搜索结果...' },
      { id: 3, title: `${query} 相关结果 3`, content: '更多相关内容...' },
    ]

    this.searchResults = mockResults
  }

  // 节流滚动示例
  @ThrottledAction(16) // 约60fps
  @Action()
  updateScrollPosition(position: number): void {
    this.scrollPosition = position
  }

  // 性能监控相关
  @Getter()
  get performanceReport() {
    const monitor = usePerformanceMonitor()
    return monitor.getPerformanceReport()
  }

  @Getter()
  get optimizationSuggestions() {
    return getOptimizationSuggestions(this.performanceReport)
  }

  @Action()
  clearPerformanceMetrics(): void {
    const monitor = usePerformanceMonitor()
    monitor.clearMetrics()
  }

  @Action()
  initializePerformanceMonitoring(): void {
    

    // 模拟一些初始的性能数据
    const monitor = usePerformanceMonitor()
    monitor.recordActionTime('初始化', 10)
    monitor.updateMemoryUsage(5, 200)
  }
}

// 导出Hook式用法
export function usePerformanceStore() {
  return new PerformanceStore()
}

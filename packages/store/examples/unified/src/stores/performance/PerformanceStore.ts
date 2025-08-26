import { defineStore } from 'pinia'

export interface DataItem {
  id: number
  name: string
  value: number
  category: string
  timestamp: number
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

/**
 * 性能优化示例 Store
 *
 * 展示缓存、防抖、节流等性能优化功能
 */
export const usePerformanceStore = defineStore('performance', {
  state: () => ({
    // 数据列表
    dataItems: [] as DataItem[],

    // 搜索关键词
    searchKeyword: '',

    // 过滤条件
    selectedCategory: 'all',

    // 排序方式
    sortBy: 'name' as 'name' | 'value' | 'timestamp',

    // 加载状态
    loading: false,

    // 错误信息
    error: null as string | null,

    // 缓存统计
    cacheStats: {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0
    } as CacheStats,

    // 防抖计数器
    debounceCount: 0,

    // 节流计数器
    throttleCount: 0,

    // 性能统计
    performanceStats: {
      searchTime: 0,
      filterTime: 0,
      sortTime: 0,
      renderTime: 0
    },

    // 实时数据更新
    realTimeData: {
      cpu: 0,
      memory: 0,
      network: 0,
      timestamp: Date.now()
    },

    // 历史数据（用于图表）
    historyData: [] as Array<{
      timestamp: number
      cpu: number
      memory: number
      network: number
    }>
  }),

  actions: {
    // 初始化数据
    initializeData() {
      const categories = ['frontend', 'backend', 'database', 'cache', 'network']
      const names = [
        'React Component',
'Vue Component',
'API Endpoint',
'Database Query',
        'Redis Cache',
'CDN Request',
'WebSocket Connection',
'File Upload',
        'Image Processing',
'Data Validation'
      ]

      this.dataItems = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        name: `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`,
        value: Math.floor(Math.random() * 1000) + 1,
        category: categories[index % categories.length],
        timestamp: Date.now() - Math.random() * 86400000 * 30 // 最近30天
      }))
    },

    // 模拟防抖搜索
    debouncedSearch(keyword: string) {
      this.debounceCount++
      this.searchKeyword = keyword

      // 模拟搜索性能统计
      const startTime = performance.now()
      // 这里会触发 filteredItems 的重新计算
      const filtered = this.filteredItems
      this.performanceStats.searchTime = performance.now() - startTime
    },

    // 模拟节流更新
    throttledUpdate() {
      this.throttleCount++

      // 更新实时数据
      this.realTimeData = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        timestamp: Date.now()
      }

      // 添加到历史数据
      this.historyData.push({ ...this.realTimeData })

      // 保持历史数据在合理范围内
      if (this.historyData.length > 100) {
        this.historyData.shift()
      }
    },

    // 设置过滤条件
    setFilter(category: string) {
      const startTime = performance.now()
      this.selectedCategory = category
      this.performanceStats.filterTime = performance.now() - startTime
    },

    // 设置排序
    setSorting(sortBy: 'name' | 'value' | 'timestamp') {
      const startTime = performance.now()
      this.sortBy = sortBy
      this.performanceStats.sortTime = performance.now() - startTime
    },

    // 模拟缓存操作
    simulateCacheOperation(useCache: boolean = true) {
      if (useCache) {
        // 模拟缓存命中
        this.cacheStats.hits++
      } else {
        // 模拟缓存未命中
        this.cacheStats.misses++
      }

      this.cacheStats.size = Math.floor(Math.random() * 100) + 50
      this.cacheStats.hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100
    },

    // 批量操作（测试性能）
    batchOperation(count: number = 100) {
      this.loading = true

      const startTime = performance.now()

      // 模拟批量数据处理
      const newItems = Array.from({ length: count }, (_, index) => ({
        id: this.dataItems.length + index + 1,
        name: `Batch Item ${index + 1}`,
        value: Math.floor(Math.random() * 1000),
        category: 'batch',
        timestamp: Date.now()
      }))

      this.dataItems.push(...newItems)

      const endTime = performance.now()
      console.log(`批量操作 ${count} 项耗时: ${endTime - startTime}ms`)

      this.loading = false
    },

    // 清理数据
    clearData() {
      this.dataItems = []
      this.searchKeyword = ''
      this.selectedCategory = 'all'
      this.cacheStats = {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0
      }
      this.debounceCount = 0
      this.throttleCount = 0
      this.historyData = []
    },

    // 重置性能统计
    resetPerformanceStats() {
      this.performanceStats = {
        searchTime: 0,
        filterTime: 0,
        sortTime: 0,
        renderTime: 0
      }
    }
  },

  getters: {
    // 过滤后的数据项（模拟缓存计算属性）
    filteredItems: (state) => {
      let filtered = state.dataItems

      // 按关键词搜索
      if (state.searchKeyword) {
        const keyword = state.searchKeyword.toLowerCase()
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(keyword)
        )
      }

      // 按分类过滤
      if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.category === state.selectedCategory)
      }

      // 排序
      filtered.sort((a, b) => {
        switch (state.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'value':
            return b.value - a.value
          case 'timestamp':
            return b.timestamp - a.timestamp
          default:
            return 0
        }
      })

      return filtered
    },

    // 分类统计
    categoryStats: (state) => {
      const stats = new Map<string, number>()

      state.dataItems.forEach(item => {
        stats.set(item.category, (stats.get(item.category) || 0) + 1)
      })

      return Array.from(stats.entries()).map(([category, count]) => ({
        category,
        count,
        percentage: (count / state.dataItems.length) * 100
      }))
    },

    // 数据统计
    dataStats: (state) => {
      if (state.dataItems.length === 0) {
        return {
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          sum: 0
        }
      }

      const values = state.dataItems.map(item => item.value)
      const sum = values.reduce((a, b) => a + b, 0)

      return {
        total: state.dataItems.length,
        average: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        sum
      }
    },

    // 性能指标
    performanceMetrics: (state) => {
      const totalTime = Object.values(state.performanceStats).reduce((a, b) => a + b, 0)

      return {
        totalTime,
        searchPercentage: totalTime > 0 ? (state.performanceStats.searchTime / totalTime) * 100 : 0,
        filterPercentage: totalTime > 0 ? (state.performanceStats.filterTime / totalTime) * 100 : 0,
        sortPercentage: totalTime > 0 ? (state.performanceStats.sortTime / totalTime) * 100 : 0,
        renderPercentage: totalTime > 0 ? (state.performanceStats.renderTime / totalTime) * 100 : 0
      }
    },

    // 实时数据趋势
    realtimeTrend: (state) => {
      if (state.historyData.length < 2) return { cpu: 0, memory: 0, network: 0 }

      const recent = state.historyData.slice(-10)
      const prev = recent.slice(0, -1)
      const current = recent.slice(-1)[0]

      const avgPrev = {
        cpu: prev.reduce((sum, item) => sum + item.cpu, 0) / prev.length,
        memory: prev.reduce((sum, item) => sum + item.memory, 0) / prev.length,
        network: prev.reduce((sum, item) => sum + item.network, 0) / prev.length
      }

      return {
        cpu: current.cpu - avgPrev.cpu,
        memory: current.memory - avgPrev.memory,
        network: current.network - avgPrev.network
      }
    }
  }
})

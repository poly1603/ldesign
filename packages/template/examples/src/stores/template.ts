import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTemplate } from '@ldesign/template/vue'

export const useTemplateStore = defineStore('template', () => {
  const currentTheme = ref('light')
  const deviceOverride = ref<string | null>(null)
  const performanceMetrics = ref<Array<{
    name: string
    loadTime: number
    fromCache: boolean
    timestamp: number
  }>>([])
  
  const { preload, clearCache } = useTemplate()

  // 计算属性
  const cacheStats = computed(() => {
    const total = performanceMetrics.value.length
    const cached = performanceMetrics.value.filter(m => m.fromCache).length
    const hitRate = total > 0 ? (cached / total * 100).toFixed(2) : '0'
    
    return {
      total,
      cached,
      hitRate: `${hitRate}%`,
      avgLoadTime: total > 0 
        ? (performanceMetrics.value.reduce((sum, m) => sum + m.loadTime, 0) / total).toFixed(2)
        : '0'
    }
  })

  async function setTheme(theme: string) {
    currentTheme.value = theme
    
    // 预加载新主题的模板
    try {
      await preload([
        { category: 'layout', template: theme },
        { category: 'dashboard', template: theme },
        { category: 'auth', template: theme }
      ])
    } catch (error) {
      console.warn('预加载主题模板失败:', error)
    }
  }

  function setDeviceOverride(device: string | null) {
    deviceOverride.value = device
  }

  function clearTemplateCache() {
    clearCache()
    performanceMetrics.value = []
  }

  function recordMetric(name: string, loadTime: number, fromCache: boolean) {
    performanceMetrics.value.push({
      name,
      loadTime,
      fromCache,
      timestamp: Date.now()
    })
    
    // 只保留最近100条记录
    if (performanceMetrics.value.length > 100) {
      performanceMetrics.value = performanceMetrics.value.slice(-100)
    }
  }

  function getMetricsByTemplate(templateName: string) {
    return performanceMetrics.value.filter(m => m.name.includes(templateName))
  }

  function clearMetrics() {
    performanceMetrics.value = []
  }

  // 预加载常用模板
  async function preloadCommonTemplates() {
    const commonTemplates = [
      { category: 'layout', template: 'public' },
      { category: 'layout', template: 'user' },
      { category: 'layout', template: 'admin' },
      { category: 'auth', template: 'login' },
      { category: 'dashboard', template: 'user' },
      { category: 'dashboard', template: 'admin' }
    ]
    
    try {
      await preload(commonTemplates)
      console.log('常用模板预加载完成')
    } catch (error) {
      console.warn('预加载常用模板失败:', error)
    }
  }

  return {
    currentTheme,
    deviceOverride,
    performanceMetrics,
    cacheStats,
    setTheme,
    setDeviceOverride,
    clearTemplateCache,
    recordMetric,
    getMetricsByTemplate,
    clearMetrics,
    preloadCommonTemplates
  }
})

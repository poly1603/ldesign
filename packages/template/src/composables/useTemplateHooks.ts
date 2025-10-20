/**
 * Template Hooks System
 * 
 * Advanced composable hooks for template lifecycle management
 */

import type { Component, ComputedRef, Ref, WatchStopHandle } from 'vue'
import type { DeviceType, TemplateLoadOptions, TemplateMetadata } from '../types'
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { getManager } from '../core/manager'

/**
 * Template lifecycle events
 */
export interface TemplateLifecycle {
  onBeforeLoad?: (metadata: TemplateMetadata) => void | Promise<void>
  onLoaded?: (component: Component, metadata: TemplateMetadata) => void
  onBeforeUnload?: (component: Component) => void
  onError?: (error: Error, retry: () => void) => void
  onRetry?: (attemptNumber: number) => void
  onTransition?: (from: string | null, to: string) => void
}

/**
 * Template prefetch options
 */
export interface TemplatePrefetchOptions {
  strategy?: 'eager' | 'lazy' | 'smart' | 'idle'
  delay?: number
  priority?: 'high' | 'normal' | 'low'
  maxConcurrent?: number
}

/**
 * Template hook result
 */
export interface TemplateHookResult {
  component: ComputedRef<Component | null>
  metadata: ComputedRef<TemplateMetadata | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  retry: () => Promise<void>
  prefetch: (templates: string[]) => Promise<void>
  transition: (category: string, device?: string, name?: string) => Promise<void>
  dispose: () => void
}

/**
 * Advanced template lifecycle hook
 */
export function useTemplateLifecycle(
  category: Ref<string> | string,
  device?: Ref<DeviceType | string> | DeviceType | string,
  name?: Ref<string> | string,
  lifecycle?: TemplateLifecycle,
  options?: TemplateLoadOptions
): TemplateHookResult {
  const manager = getManager()
  
  // Normalize refs
  const categoryRef = ref(category)
  const deviceRef = ref(device || detectDevice())
  const nameRef = ref(name || 'default')
  
  // State
  const component = shallowRef<Component | null>(null)
  const metadata = shallowRef<TemplateMetadata | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const retryCount = ref(0)
  
  // Watchers collection for cleanup
  const watchers: WatchStopHandle[] = []
  
  /**
   * Load template with lifecycle hooks
   */
  async function loadTemplate() {
    try {
      loading.value = true
      error.value = null
      
      // Get metadata first
      const templates = await manager.queryTemplates({
        category: categoryRef.value,
        device: deviceRef.value as DeviceType,
        name: nameRef.value
      })
      
      const meta = templates[0]
      if (!meta) {
        throw new Error(`Template not found: ${categoryRef.value}/${deviceRef.value}/${nameRef.value}`)
      }
      
      metadata.value = meta
      
      // Call before load hook
      await lifecycle?.onBeforeLoad?.(meta)
      
      // Load component
      const loadedComponent = await manager.loadTemplate(
        categoryRef.value,
        deviceRef.value,
        nameRef.value,
        options
      )
      
      // Update state
      component.value = loadedComponent
      
      // Call loaded hook
      lifecycle?.onLoaded?.(loadedComponent, meta)
      
      // Reset retry count on success
      retryCount.value = 0
    } catch (e) {
      error.value = e as Error
      lifecycle?.onError?.(e as Error, retry)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Retry loading with exponential backoff
   */
  async function retry() {
    retryCount.value++
    lifecycle?.onRetry?.(retryCount.value)
    
    // Exponential backoff: 1s, 2s, 4s, 8s, max 8s
    const delay = Math.min(1000 * 2**(retryCount.value - 1), 8000)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    await loadTemplate()
  }
  
  /**
   * Prefetch templates
   */
  const prefetch = async (templates: string[]) => {
    const tasks = templates.map(template => {
      const [cat, dev, nm] = template.split('/')
      return manager.preloadTemplate(cat, dev, nm)
    })
    
    await Promise.allSettled(tasks)
  }
  
  /**
   * Transition to another template
   */
  const transition = async (category: string, device?: string, name?: string) => {
    const oldTemplate = `${categoryRef.value}/${deviceRef.value}/${nameRef.value}`
    const newTemplate = `${category}/${device || deviceRef.value}/${name || nameRef.value}`
    
    // Call transition hook
    lifecycle?.onTransition?.(oldTemplate, newTemplate)
    
    // Call before unload for current component
    if (component.value) {
      lifecycle?.onBeforeUnload?.(component.value)
    }
    
    // Update refs
    categoryRef.value = category
    if (device) deviceRef.value = device
    if (name) nameRef.value = name
    
    // Load new template
    await loadTemplate()
  }
  
  /**
   * Dispose and cleanup
   */
  const dispose = () => {
    // Stop all watchers
    watchers.forEach(stop => stop())
    watchers.length = 0
    
    // Call before unload
    if (component.value) {
      lifecycle?.onBeforeUnload?.(component.value)
    }
    
    // Clear state
    component.value = null
    metadata.value = null
    error.value = null
    retryCount.value = 0
  }
  
  // Watch for changes
  const stopWatcher = watch(
    [categoryRef, deviceRef, nameRef],
    () => loadTemplate(),
    { immediate: false }
  )
  watchers.push(stopWatcher)
  
  // Initial load
  onMounted(() => {
    loadTemplate()
  })
  
  // Cleanup
  onUnmounted(() => {
    dispose()
  })
  
  return {
    component: computed(() => component.value),
    metadata: computed(() => metadata.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    retry,
    prefetch,
    transition,
    dispose
  }
}

/**
 * Smart template prefetching hook
 */
export function useTemplatePrefetch(
  options: TemplatePrefetchOptions = {}
): {
  prefetch: (templates: string[]) => Promise<void>
  prefetchRelated: (category: string, device: string) => Promise<void>
  cancelPrefetch: () => void
} {
  const manager = getManager()
  const prefetchQueue = ref<string[]>([])
  const isPrefetching = ref(false)
  const abortController = ref<AbortController | null>(null)
  
  const {
    strategy = 'smart',
    delay = 0,
    // priority = 'normal', // Not used currently
    maxConcurrent = 3
  } = options
  
  /**
   * Prefetch templates based on strategy
   */
  const prefetch = async (templates: string[]) => {
    // Cancel ongoing prefetch
    if (abortController.value) {
      abortController.value.abort()
    }
    
    abortController.value = new AbortController()
    prefetchQueue.value = templates
    isPrefetching.value = true
    
    try {
      switch (strategy) {
        case 'eager':
          // Load all immediately
          await Promise.all(
            templates.map(t => {
              const [cat, dev, nm] = t.split('/')
              return manager.preloadTemplate(cat, dev, nm)
            })
          )
          break
          
        case 'lazy':
          // Load one by one with delay
          for (const template of templates) {
            if (abortController.value.signal.aborted) break
            
            const [cat, dev, nm] = template.split('/')
            await manager.preloadTemplate(cat, dev, nm)
            
            if (delay > 0) {
              await new Promise(resolve => setTimeout(resolve, delay))
            }
          }
          break
          
        case 'smart': {
          // Load in batches
          const batches = []
          for (let i = 0; i < templates.length; i += maxConcurrent) {
            batches.push(templates.slice(i, i + maxConcurrent))
          }
          
          for (const batch of batches) {
            if (abortController.value.signal.aborted) break
            
            await Promise.all(
              batch.map(t => {
                const [cat, dev, nm] = t.split('/')
                return manager.preloadTemplate(cat, dev, nm)
              })
            )
            
            if (delay > 0) {
              await new Promise(resolve => setTimeout(resolve, delay))
            }
          }
          break
        }
          
        case 'idle':
          // Use requestIdleCallback if available
          if ('requestIdleCallback' in window) {
            for (const template of templates) {
              if (abortController.value.signal.aborted) break
              
              await new Promise<void>(resolve => {
                (window as any).requestIdleCallback(() => {
                  const [cat, dev, nm] = template.split('/')
                  manager.preloadTemplate(cat, dev, nm).then(() => resolve())
                })
              })
            }
          } else {
            // Fallback to lazy strategy
            await prefetch(templates)
          }
          break
      }
    } finally {
      isPrefetching.value = false
      prefetchQueue.value = []
    }
  }
  
  /**
   * Prefetch related templates
   */
  const prefetchRelated = async (category: string, device: string) => {
    // Get all templates in the same category
    const templates = await manager.getTemplatesByCategory(category)
    
    // Filter by device and create prefetch list
    const prefetchList = templates
      .filter(t => t.device === device)
      .map(t => `${t.category}/${t.device}/${t.name}`)
    
    await prefetch(prefetchList)
  }
  
  /**
   * Cancel ongoing prefetch
   */
  const cancelPrefetch = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    isPrefetching.value = false
    prefetchQueue.value = []
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    cancelPrefetch()
  })
  
  return {
    prefetch,
    prefetchRelated,
    cancelPrefetch
  }
}

/**
 * Template navigation hook
 */
export function useTemplateNavigation() {
  const history = ref<string[]>([])
  const currentIndex = ref(-1)
  
  /**
   * Navigate to template
   */
  const navigate = (template: string) => {
    // Remove forward history when navigating to new template
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }
    
    history.value.push(template)
    currentIndex.value = history.value.length - 1
  }
  
  /**
   * Go back in history
   */
  const back = (): string | null => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      return history.value[currentIndex.value]
    }
    return null
  }
  
  /**
   * Go forward in history
   */
  const forward = (): string | null => {
    if (currentIndex.value < history.value.length - 1) {
      currentIndex.value++
      return history.value[currentIndex.value]
    }
    return null
  }
  
  /**
   * Check if can go back
   */
  const canGoBack = computed(() => currentIndex.value > 0)
  
  /**
   * Check if can go forward
   */
  const canGoForward = computed(() => currentIndex.value < history.value.length - 1)
  
  /**
   * Get current template
   */
  const current = computed(() => 
    currentIndex.value >= 0 ? history.value[currentIndex.value] : null
  )
  
  /**
   * Clear history
   */
  const clearHistory = () => {
    history.value = []
    currentIndex.value = -1
  }
  
  return {
    navigate,
    back,
    forward,
    canGoBack,
    canGoForward,
    current,
    history: computed(() => [...history.value]),
    clearHistory
  }
}

/**
 * Template performance monitoring hook
 */
export function useTemplatePerformance() {
  const metrics = ref<Map<string, PerformanceEntry>>(new Map())
  const observer = ref<PerformanceObserver | null>(null)
  
  /**
   * Start monitoring
   */
  const startMonitoring = () => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }
    
    observer.value = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('template-load')) {
          metrics.value.set(entry.name, entry)
        }
      }
    })
    
    observer.value.observe({ entryTypes: ['measure', 'navigation'] })
  }
  
  /**
   * Stop monitoring
   */
  const stopMonitoring = () => {
    observer.value?.disconnect()
    observer.value = null
  }
  
  /**
   * Mark template load start
   */
  const markLoadStart = (templateId: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`template-load-start-${templateId}`)
    }
  }
  
  /**
   * Mark template load end and measure
   */
  const markLoadEnd = (templateId: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const endMark = `template-load-end-${templateId}`
      const startMark = `template-load-start-${templateId}`
      
      performance.mark(endMark)
      performance.measure(
        `template-load-${templateId}`,
        startMark,
        endMark
      )
    }
  }
  
  /**
   * Get load time for template
   */
  const getLoadTime = (templateId: string): number | null => {
    const entry = metrics.value.get(`template-load-${templateId}`)
    return entry ? entry.duration : null
  }
  
  /**
   * Get average load time
   */
  const getAverageLoadTime = (): number => {
    const times = Array.from(metrics.value.values())
      .map(e => e.duration)
      .filter(d => d > 0)
    
    if (times.length === 0) return 0
    return times.reduce((a, b) => a + b, 0) / times.length
  }
  
  /**
   * Clear metrics
   */
  const clearMetrics = () => {
    metrics.value.clear()
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }
  
  // Auto start monitoring
  onMounted(() => {
    startMonitoring()
  })
  
  // Cleanup
  onUnmounted(() => {
    stopMonitoring()
    clearMetrics()
  })
  
  return {
    markLoadStart,
    markLoadEnd,
    getLoadTime,
    getAverageLoadTime,
    clearMetrics,
    metrics: computed(() => new Map(metrics.value))
  }
}

/**
 * Detect device type
 */
function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}
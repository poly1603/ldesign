/**
 * 预渲染 Composable
 * 
 * 提供 Vue 组件中使用预渲染的便捷接口
 */

import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import {
  type PrerenderEngine,
  type PrerenderResult,
  type PrerenderConfig,
  type PrerenderPriority,
  createPrerenderEngine,
} from '../core/prerender'
import type { DeviceType } from '../types/template'
import type { Dictionary } from '../types/common'

/**
 * 预渲染状态
 */
export interface PrerenderState {
  /** 是否正在渲染 */
  isRendering: boolean
  /** 队列中的任务数 */
  pendingCount: number
  /** 活跃任务数 */
  activeCount: number
  /** 缓存统计 */
  cacheStats: {
    total: number
    valid: number
    expired: number
  }
}

/**
 * 预渲染 Composable 返回值
 */
export interface UsePrerenderReturn {
  /** 预渲染引擎 */
  engine: PrerenderEngine
  /** 当前状态 */
  state: Readonly<Ref<PrerenderState>>
  /** 是否正在渲染 */
  isRendering: Readonly<Ref<boolean>>
  /** 预渲染单个模板 */
  prerenderTemplate: (
    templatePath: string,
    deviceType: DeviceType,
    options?: {
      priority?: PrerenderPriority
      initialData?: Dictionary
      routeParams?: Dictionary
    }
  ) => Promise<PrerenderResult>
  /** 批量预渲染 */
  batchPrerender: (
    templates: Array<{
      templatePath: string
      deviceType: DeviceType
      priority?: PrerenderPriority
      initialData?: Dictionary
      routeParams?: Dictionary
    }>
  ) => Promise<PrerenderResult[]>
  /** 清除缓存 */
  clearCache: (templatePath?: string) => void
  /** 刷新状态 */
  refreshState: () => void
}

/**
 * 使用预渲染
 */
export function usePrerender(config?: Partial<PrerenderConfig>): UsePrerenderReturn {
  // 创建预渲染引擎
  const engine = createPrerenderEngine(config)

  // 状态
  const state = ref<PrerenderState>({
    isRendering: false,
    pendingCount: 0,
    activeCount: 0,
    cacheStats: {
      total: 0,
      valid: 0,
      expired: 0,
    },
  })

  // 是否正在渲染
  const isRendering = computed(() => state.value.isRendering)

  /**
   * 刷新状态
   */
  function refreshState() {
    const queueStatus = engine.getQueueStatus()
    const cacheStats = engine.getCacheStats()

    state.value = {
      isRendering: queueStatus.active > 0 || queueStatus.pending > 0,
      pendingCount: queueStatus.pending,
      activeCount: queueStatus.active,
      cacheStats,
    }
  }

  /**
   * 预渲染单个模板
   */
  async function prerenderTemplate(
    templatePath: string,
    deviceType: DeviceType,
    options?: {
      priority?: PrerenderPriority
      initialData?: Dictionary
      routeParams?: Dictionary
    }
  ): Promise<PrerenderResult> {
    state.value.isRendering = true
    refreshState()

    try {
      const result = await engine.prerenderTemplate(templatePath, deviceType, options)
      return result
    } finally {
      refreshState()
      state.value.isRendering = false
    }
  }

  /**
   * 批量预渲染
   */
  async function batchPrerender(
    templates: Array<{
      templatePath: string
      deviceType: DeviceType
      priority?: PrerenderPriority
      initialData?: Dictionary
      routeParams?: Dictionary
    }>
  ): Promise<PrerenderResult[]> {
    state.value.isRendering = true
    refreshState()

    try {
      // 确保所有任务都有 priority
      const tasksWithDefaults = templates.map(t => ({
        ...t,
        priority: t.priority || 'normal' as PrerenderPriority,
      }))
      const results = await engine.batchPrerender(tasksWithDefaults)
      return results
    } finally {
      refreshState()
      state.value.isRendering = false
    }
  }

  /**
   * 清除缓存
   */
  function clearCache(templatePath?: string) {
    engine.clearCache(templatePath)
    refreshState()
  }

  // 初始化时刷新状态
  onMounted(() => {
    refreshState()
  })

  return {
    engine,
    state: computed(() => state.value),
    isRendering,
    prerenderTemplate,
    batchPrerender,
    clearCache,
    refreshState,
  }
}

/**
 * 使用SSR预渲染
 * 
 * 专门用于SSR场景的简化版本
 */
export function useSSRPrerender() {
  return usePrerender({
    mode: 'ssr',
    strategy: 'eager',
    ssr: {
      streaming: true,
      prefetch: true,
      inlineCriticalCSS: true,
      preloadResources: true,
    },
  })
}

/**
 * 使用SSG预渲染
 * 
 * 专门用于静态生成场景的简化版本
 */
export function useSSGPrerender(outputDir?: string) {
  return usePrerender({
    mode: 'ssg',
    strategy: 'lazy',
    ssg: {
      outputDir: outputDir || './dist/prerendered',
      generateSitemap: true,
      minifyHTML: true,
      extractCriticalCSS: true,
    },
  })
}

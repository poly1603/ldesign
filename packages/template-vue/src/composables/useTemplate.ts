/**
 * Vue 组合式函数 - 模板管理
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref, type Component, markRaw } from 'vue'
import type { DeviceType, TemplateFilter, TemplateLoadOptions, TemplateMetadata } from '@ldesign/template-core'
import { getVueTemplateManager } from '../managers/VueTemplateManager'

/**
 * 使用模板
 */
export function useTemplate(
  category: Ref<string> | string,
  device: Ref<string | DeviceType> | string | DeviceType,
  name: Ref<string> | string,
  options?: TemplateLoadOptions
) {
  // 转换为 Ref
  const categoryRef = typeof category === 'string' ? ref(category) : category as Ref<string>
  const deviceRef = typeof device === 'string' ? ref(device) : device as Ref<string | DeviceType>
  const nameRef = typeof name === 'string' ? ref(name) : name as Ref<string>

  const component = ref<Component | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const metadata = ref<TemplateMetadata | null>(null)

  // 延迟获取 manager
  let manager: ReturnType<typeof getVueTemplateManager> | null = null
  const getManagerLazy = () => {
    if (!manager) manager = getVueTemplateManager()
    return manager
  }

  /**
   * 加载模板
   */
  const load = async () => {
    const cat = categoryRef.value
    const dev = deviceRef.value
    const nm = nameRef.value

    if (!cat || !dev || !nm) return

    loading.value = true
    error.value = null

    try {
      const mgr = getManagerLazy()
      const loaded = await mgr.loadTemplate(cat, dev, nm, options)
      component.value = markRaw(loaded) // markRaw 避免响应式转换

      // 获取元数据
      if (!metadata.value || metadata.value.name !== nm) {
        const templates = await mgr.queryTemplates({
          category: cat,
          device: dev as DeviceType,
          name: nm,
        })
        metadata.value = templates[0] || null
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('[useTemplate] 加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新加载模板
   */
  const reload = () => {
    component.value = null
    metadata.value = null
    return load()
  }

  /**
   * 预加载模板
   */
  const preload = async () => {
    const mgr = getManagerLazy()
    await mgr.preloadTemplate(
      categoryRef.value,
      deviceRef.value,
      nameRef.value
    )
  }

  // 监听参数变化
  watch([categoryRef, deviceRef, nameRef], () => {
    load()
  })

  // 自动加载
  onMounted(() => {
    load()
  })

  // 清理
  onUnmounted(() => {
    component.value = null
    metadata.value = null
  })

  return {
    component,
    loading,
    error,
    metadata,
    load,
    reload,
    preload,
  }
}

/**
 * 使用默认模板
 */
export function useDefaultTemplate(
  category: Ref<string> | string,
  device: Ref<DeviceType> | DeviceType
) {
  const categoryRef = typeof category === 'string' ? ref(category) : category
  const deviceRef = typeof device === 'string' ? ref(device as DeviceType) : device as Ref<DeviceType>

  const template = ref<TemplateMetadata | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null

    try {
      const manager = getVueTemplateManager()
      template.value = await manager.getDefaultTemplate(
        categoryRef.value,
        deviceRef.value
      )
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  watch([categoryRef, deviceRef], load)
  onMounted(load)

  return {
    template,
    loading,
    error,
    reload: load,
  }
}

/**
 * 使用模板列表
 */
export function useTemplateList(filter: Ref<TemplateFilter> | TemplateFilter = {}) {
  const filterRef = typeof filter === 'object' && !('value' in filter) ? ref(filter) : filter as Ref<TemplateFilter>

  const templates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null

    try {
      const manager = getVueTemplateManager()
      templates.value = await manager.queryTemplates(filterRef.value)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  // 按分类分组
  const byCategory = computed(() => {
    const grouped: Record<string, TemplateMetadata[]> = {}
    for (const template of templates.value) {
      if (!grouped[template.category]) {
        grouped[template.category] = []
      }
      grouped[template.category].push(template)
    }
    return grouped
  })

  // 按设备分组
  const byDevice = computed(() => {
    const grouped: Record<DeviceType, TemplateMetadata[]> = {}
    for (const template of templates.value) {
      if (!grouped[template.device]) {
        grouped[template.device] = []
      }
      grouped[template.device].push(template)
    }
    return grouped
  })

  watch(filterRef, load, { deep: true })
  onMounted(load)

  return {
    templates,
    byCategory,
    byDevice,
    loading,
    error,
    reload: load,
  }
}

/**
 * 使用模板管理器
 */
export function useTemplateManager() {
  const manager = getVueTemplateManager()

  const initialized = ref(false)
  const metrics = ref(manager.getMetrics())

  const initialize = async () => {
    if (!initialized.value) {
      await manager.initialize()
      initialized.value = true
      metrics.value = manager.getMetrics()
    }
  }

  const clearCache = () => {
    manager.clearCache()
    metrics.value = manager.getMetrics()
  }

  const reset = async () => {
    await manager.reset()
    initialized.value = false
    metrics.value = manager.getMetrics()
  }

  onMounted(initialize)

  return {
    manager,
    initialized,
    metrics,
    initialize,
    clearCache,
    reset,
  }
}

export default useTemplate

/**
 * Vue 组合式函数 - 模板管理
 */

import type { DeviceType, TemplateFilter, TemplateLoadOptions, TemplateMetadata } from '../types'
import { type Component, computed, markRaw, onMounted, onUnmounted, ref, type Ref, watch } from 'vue'
import { getManager } from '../core/manager'

/**
 * 使用模板 - 内存优化版本
 */
export function useTemplate(
  category: Ref<string> | string,
  device: Ref<string | DeviceType> | string | DeviceType,
  name: Ref<string> | string,
  options?: TemplateLoadOptions
) {
  // 使用 unref 避免创建不必要的 ref
  const categoryRef = typeof category === 'string' ? ref(category) : category as Ref<string>
  const deviceRef = typeof device === 'string' ? ref(device) : device as Ref<string | DeviceType>
  const nameRef = typeof name === 'string' ? ref(name) : name as Ref<string>

  const component = ref<Component | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const metadata = ref<TemplateMetadata | null>(null)

  // 延迟获取 manager，避免过早初始化
  let manager: ReturnType<typeof getManager> | null = null
  const getManagerLazy = () => {
    if (!manager) manager = getManager()
    return manager
  }

  /**
   * 加载模板 - 优化版本
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

      // 获取元数据 - 只在需要时查询
      if (!metadata.value || metadata.value.name !== nm) {
        const templates = await mgr.queryTemplates({
          category: cat,
          device: dev as DeviceType,
          name: nm,
        })
        metadata.value = templates[0] || null
      }
    } catch (e) {
      error.value = e as Error
      component.value = null
      metadata.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新加载 - 优化版本
   */
  const reload = () => {
    const mgr = getManagerLazy()
    mgr.clearCache(categoryRef.value, deviceRef.value, nameRef.value)
    metadata.value = null // 清理元数据缓存
    return load()
  }

  // 监听参数变化 - 使用防抖
  let loadTimer: ReturnType<typeof setTimeout> | null = null
  watch([categoryRef, deviceRef, nameRef], () => {
    if (loadTimer) clearTimeout(loadTimer)
    loadTimer = setTimeout(() => {
      load()
      loadTimer = null
    }, 100) // 100ms 防抖
  })

  // 初始加载
  onMounted(() => {
    load()
  })

  // 清理定时器
  onUnmounted(() => {
    if (loadTimer) {
      clearTimeout(loadTimer)
      loadTimer = null
    }
  })

  return {
    // 直接返回 ref，避免不必要的 computed 包装
    component: component as Readonly<Ref<Component | null>>,
    loading: loading as Readonly<Ref<boolean>>,
    error: error as Readonly<Ref<Error | null>>,
    metadata: metadata as Readonly<Ref<TemplateMetadata | null>>,
    load,
    reload,
  }
}

/**
 * 使用模板列表 - 内存优化版本
 */
export function useTemplateList(filter?: Ref<TemplateFilter> | TemplateFilter) {
  const filterRef = typeof filter === 'object' && 'value' in filter ?
    filter as Ref<TemplateFilter> : ref(filter || {})
  const templates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 延迟获取 manager
  let manager: ReturnType<typeof getManager> | null = null
  const getManagerLazy = () => {
    if (!manager) manager = getManager()
    return manager
  }

  /**
   * 查询模板 - 优化版本
   */
  const query = async () => {
    loading.value = true
    error.value = null

    try {
      const mgr = getManagerLazy()
      templates.value = await mgr.queryTemplates(filterRef.value)
    } catch (e) {
      error.value = e as Error
      templates.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新列表 - 优化版本
   */
  const refresh = async () => {
    const mgr = getManagerLazy()
    await mgr.rescan()
    return query()
  }

  // 监听过滤条件变化 - 使用防抖以减少查询次数
  let queryTimer: ReturnType<typeof setTimeout> | null = null
  watch(filterRef, () => {
    if (queryTimer) clearTimeout(queryTimer)
    queryTimer = setTimeout(() => {
      query()
      queryTimer = null
    }, 200) // 200ms 防抖
  }, { deep: true })

  // 初始查询
  onMounted(() => {
    query()
  })

  // 清理定时器
  onUnmounted(() => {
    if (queryTimer) {
      clearTimeout(queryTimer)
      queryTimer = null
    }
  })

  return {
    // 直接返回 ref，避免 computed 开销
    templates: templates as Readonly<Ref<TemplateMetadata[]>>,
    loading: loading as Readonly<Ref<boolean>>,
    error: error as Readonly<Ref<Error | null>>,
    query,
    refresh,
  }
}

/**
 * 使用默认模板
 */
export function useDefaultTemplate(
  category: Ref<string> | string,
  device: Ref<string> | string
) {
  const categoryRef = ref(category)
  const deviceRef = ref(device)

  const template = ref<TemplateMetadata | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const manager = getManager()

  /**
   * 获取默认模板
   */
  const getDefault = async () => {
    if (!categoryRef.value || !deviceRef.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      template.value = await manager.getDefaultTemplate(
        categoryRef.value,
        deviceRef.value
      )
    } catch (e) {
      error.value = e as Error
      template.value = null
    } finally {
      loading.value = false
    }
  }

  // 监听参数变化
  watch([categoryRef, deviceRef], () => {
    getDefault()
  })

  // 初始加载
  onMounted(() => {
    getDefault()
  })

  return {
    template: computed(() => template.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getDefault,
  }
}

/**
 * 使用模板管理器
 */
export function useTemplateManager() {
  const manager = getManager()
  const initialized = ref(false)
  const scanResult = ref(manager.getScanResult())

  /**
   * 初始化
   */
  const initialize = async () => {
    if (initialized.value) {
      return scanResult.value ?? await manager.initialize()
    }

    const result = await manager.initialize()
    scanResult.value = result
    initialized.value = true
    return result
  }

  /**
   * 重新扫描
   */
  const rescan = async () => {
    const result = await manager.rescan()
    scanResult.value = result
    return result
  }

  return {
    manager,
    initialized: computed(() => initialized.value),
    scanResult: computed(() => scanResult.value),
    initialize,
    rescan,
    loadTemplate: manager.loadTemplate.bind(manager),
    preloadTemplate: manager.preloadTemplate.bind(manager),
    clearCache: manager.clearCache.bind(manager),
    getAllTemplates: manager.getAllTemplates.bind(manager),
    queryTemplates: manager.queryTemplates.bind(manager),
    getTemplatesByCategory: manager.getTemplatesByCategory.bind(manager),
    getTemplatesByDevice: manager.getTemplatesByDevice.bind(manager),
    getDefaultTemplate: manager.getDefaultTemplate.bind(manager),
  }
}

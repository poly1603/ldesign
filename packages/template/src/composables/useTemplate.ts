/**
 * Vue 组合式函数 - 模板管理
 */

import { ref, computed, watch, onMounted, markRaw, type Ref, type Component } from 'vue'
import type { TemplateFilter, TemplateLoadOptions, TemplateMetadata } from '../types'
import { getManager } from '../core/manager'

/**
 * 使用模板
 */
export function useTemplate(
  category: Ref<string> | string,
  device: Ref<string> | string,
  name: Ref<string> | string,
  options?: TemplateLoadOptions
) {
  const categoryRef = ref(category)
  const deviceRef = ref(device)
  const nameRef = ref(name)

  const component = ref<Component | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const metadata = ref<TemplateMetadata | null>(null)

  const manager = getManager()

  /**
   * 加载模板
   */
  const load = async () => {
    if (!categoryRef.value || !deviceRef.value || !nameRef.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const loaded = await manager.loadTemplate(
        categoryRef.value,
        deviceRef.value,
        nameRef.value,
        options
      )
      component.value = markRaw(loaded)

      // 获取元数据
      const templates = await manager.queryTemplates({
        category: categoryRef.value,
        device: deviceRef.value as any,
        name: nameRef.value,
      })
      metadata.value = templates[0] || null
    } catch (e) {
      error.value = e as Error
      component.value = null
      metadata.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新加载
   */
  const reload = () => {
    manager.clearCache(categoryRef.value, deviceRef.value, nameRef.value)
    return load()
  }

  // 监听参数变化
  watch([categoryRef, deviceRef, nameRef], () => {
    load()
  })

  // 初始加载
  onMounted(() => {
    load()
  })

  return {
    component: computed(() => component.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    metadata: computed(() => metadata.value),
    load,
    reload,
  }
}

/**
 * 使用模板列表
 */
export function useTemplateList(filter?: Ref<TemplateFilter> | TemplateFilter) {
  const filterRef = ref(filter || {})
  const templates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const manager = getManager()

  /**
   * 查询模板
   */
  const query = async () => {
    loading.value = true
    error.value = null

    try {
      templates.value = await manager.queryTemplates(filterRef.value)
    } catch (e) {
      error.value = e as Error
      templates.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新列表
   */
  const refresh = async () => {
    await manager.rescan()
    return query()
  }

  // 监听过滤条件变化
  watch(filterRef, () => {
    query()
  }, { deep: true })

  // 初始查询
  onMounted(() => {
    query()
  })

  return {
    templates: computed(() => templates.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
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
      return scanResult.value!
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

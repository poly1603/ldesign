/**
 * 模板 Composable - 简化的高层API
 */

import { ref, computed, onMounted, watch, markRaw, type Component } from 'vue'
import type { DeviceType, TemplateMetadata } from '../../types'
import { useDevice } from './useDevice'
import { useTemplateManager } from './useTemplateManager'

export interface UseTemplateOptions {
  category: string
  device?: DeviceType
  name?: string
  autoDeviceSwitch?: boolean
  enableCache?: boolean
}

export function useTemplate(options: UseTemplateOptions) {
  const {
    category,
    device: fixedDevice,
    name: initialName,
    autoDeviceSwitch = true,
    enableCache = true,
  } = options

  // 设备检测
  const { device: detectedDevice } = useDevice()
  const device = fixedDevice ? ref(fixedDevice) : detectedDevice

  // 模板管理
  const { manager } = useTemplateManager()

  // 响应式状态
  const component = ref<Component | null>(null)
  const metadata = ref<TemplateMetadata | null>(null)
  const templates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 加载模板列表
  const loadTemplates = async () => {
    const results = manager.query({
      category,
      device: device.value,
    })
    templates.value = results.map(r => r.metadata)
  }

  // 加载模板组件
  const loadTemplate = async (name?: string) => {
    loading.value = true
    error.value = null

    try {
      const result = await manager.load(category, device.value, name, {
        cache: enableCache,
      })
      component.value = markRaw(result.component)
      metadata.value = result.metadata
    } catch (err) {
      error.value = err as Error
      console.error('[useTemplate] Failed to load template:', err)
    } finally {
      loading.value = false
    }
  }

  // 切换模板
  const switchTemplate = async (name: string) => {
    await loadTemplate(name)
  }

  // 刷新模板列表
  const refresh = async () => {
    await loadTemplates()
    if (!component.value && templates.value.length > 0) {
      await loadTemplate(initialName)
    }
  }

  // 监听设备变化，自动重新加载模板
  watch(device, async (newDevice) => {
    console.log('[useTemplate] Device changed to:', newDevice)
    await loadTemplates()
    // 设备变化时加载新设备的默认模板，而不是指定名称的模板
    await loadTemplate(undefined)
  })

  // 初始化
  onMounted(async () => {
    await loadTemplates()
    await loadTemplate(initialName)
  })

  return {
    // 组件
    component: computed(() => component.value),
    currentComponent: computed(() => component.value), // 别名
    
    // 元数据
    metadata: computed(() => metadata.value),
    currentTemplate: computed(() => metadata.value), // 别名
    
    // 列表
    templates: computed(() => templates.value),
    availableTemplates: computed(() => templates.value), // 别名
    
    // 其他状态
    device: computed(() => device.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // 方法
    switchTemplate,
    refresh,
    refreshTemplates: refresh, // 别名
  }
}

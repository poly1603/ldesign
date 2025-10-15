/**
 * 模板 Composable - 简化的高层API
 */

import type { DeviceType, TemplateMetadata } from '../../types'
import { type Component, computed, markRaw, onMounted, onUnmounted, ref, watch } from 'vue'
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
    name: templateName,
    autoDeviceSwitch = true,
    enableCache = true,
  } = options

  // 设备检测
  const { device: detectedDevice } = useDevice()
  const device = fixedDevice ? ref(fixedDevice) : detectedDevice

  // 防抖计时器
  let loadDebounceTimer: NodeJS.Timeout | null = null

  // 追踪上一次的设备类型，防止重复加载
  let lastDevice = device.value

  // 模板管理
  const { manager } = useTemplateManager()

  // 响应式状态
  const component = ref<Component | null>(null)
  const metadata = ref<TemplateMetadata | null>(null)
  const templates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const isInitialized = ref(false)

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
    console.log('[useTemplate] loadTemplate called with name:', name, 'device:', device.value)
    
    // 避免重复加载
    if (loading.value) {
      console.log('[useTemplate] Already loading, skipping...')
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const result = await manager.load(category, device.value, name)
      // 确保组件存在且有效
      if (result.component) {
        component.value = markRaw(result.component)
        metadata.value = result.metadata
        lastDevice = device.value // 更新最后的设备类型
      } else {
        throw new Error('Component load failed')
      }
    } catch (err) {
      error.value = err as Error
      console.error('[useTemplate] Failed to load template:', err)
      
      // 只在没有明确指定模板名称时尝试回退
      if (!name) {
        // 尝试加载该设备的第一个可用模板
        try {
          const availableTemplates = manager.query({
            category,
            device: device.value,
          })
          
          // 优先选择默认模板，如果没有则选择第一个
          const defaultTemplate = availableTemplates.find(t => t.metadata.isDefault)
          const fallbackTemplate = defaultTemplate || availableTemplates[0]
          
          if (fallbackTemplate) {
            console.log('[useTemplate] Falling back to template:', fallbackTemplate.metadata.name)
            const fallbackResult = await manager.load(
              category, 
              device.value, 
              fallbackTemplate.metadata.name
            )
            
            if (fallbackResult.component) {
              component.value = markRaw(fallbackResult.component)
              metadata.value = fallbackResult.metadata
              lastDevice = device.value
              error.value = null // 清除错误，因为我们找到了回退方案
              console.log('[useTemplate] Fallback successful')
            }
          } else {
            // 如果没有任何可用模板，保持错误状态
            console.error('[useTemplate] No templates available for device:', device.value)
          }
        } catch (fallbackErr) {
          console.error('[useTemplate] Fallback failed:', fallbackErr)
          // 保持原始错误
        }
      }
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
    if (!component.value && templates.value.length > 0 && !loading.value) {
      await loadTemplate(templateName)
    }
  }

  // 监听设备变化，自动重新加载模板
  watch(device, (newDevice, oldDevice) => {
    // 只在自动设备切换模式下重新加载
    if (!autoDeviceSwitch) return
    if (newDevice === oldDevice) return
    
    // 防止初始化时重复加载
    if (!isInitialized.value) return
    
    // 防止与上次设备相同时重复加载
    if (newDevice === lastDevice) return
    
    // 防止在加载过程中重复触发
    if (loading.value) {
      console.log('[useTemplate] Already loading, skipping device change handler')
      return
    }
    
    console.log('[useTemplate] Device changed from', lastDevice, 'to:', newDevice)
    
    // 立即更新lastDevice以防止重复触发
    lastDevice = newDevice
    
    // 清除之前的定时器
    if (loadDebounceTimer) {
      clearTimeout(loadDebounceTimer)
      loadDebounceTimer = null
    }
    
    // 防抖处理
    loadDebounceTimer = setTimeout(async () => {
      // 再次检查是否真的需要加载
      if (loading.value) {
        console.log('[useTemplate] Still loading, skipping')
        return
      }
      
      await loadTemplates()
      // 设备变化时，不传递任何名称，让manager使用getDefault找到标记为isDefault的模板
      // 只有当用户明确通过props传递了templateName时才使用
      await loadTemplate(templateName || undefined)
      
      loadDebounceTimer = null
    }, 300) // 增加防抖时间到300ms
  })

  // 初始化
  onMounted(async () => {
    console.log('[useTemplate] Initializing with:', { category, device: device.value, templateName })
    await loadTemplates()

    // 只在没有组件时加载
    if (!component.value && !loading.value) {
      await loadTemplate(templateName)
    }

    // 标记为已初始化
    isInitialized.value = true
  })

  // 清理
  onUnmounted(() => {
    if (loadDebounceTimer) {
      clearTimeout(loadDebounceTimer)
    }
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

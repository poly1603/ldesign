/**
 * 模板管理Hook
 *
 * 主要的模板管理Hook，提供模板加载、切换、缓存等功能
 * 支持简化模式，可以返回可直接渲染的组件
 */

import { ref, computed, markRaw, onMounted, onUnmounted, unref, watch, defineComponent, type Component, type Ref, h } from 'vue'
import type {
  DeviceType,
  TemplateMetadata,
  UseTemplateOptions,
  UseTemplateReturn,
} from '../types/template'

import { HookTemplateRenderer } from '../components/TemplateTransition'
import { TemplateRenderer } from '../components/TemplateRenderer'
import { TemplateScanner } from '../scanner'
import { componentCache } from '../utils/cache'
import { componentLoader } from '../utils/loader'
import { useDeviceDetection } from './useDeviceDetection'

/**
 * 全局模板扫描器实例
 */
let globalScanner: TemplateScanner | null = null

/**
 * 获取或创建全局扫描器
 */
function getGlobalScanner(): TemplateScanner {
  if (!globalScanner) {
    globalScanner = new TemplateScanner({
      templatesDir: 'src/templates',
      enableCache: true,
      enableHMR: import.meta.env.DEV,
    })
  }
  return globalScanner
}

/**
 * 简化版模板Hook - 返回可直接渲染的组件
 */
export function useTemplate(options: UseTemplateOptions = {}) {
  const {
    category = 'login',
    device: initialDevice,
    autoDetectDevice = true,
    enableCache = true,
    showSelector: showSelectorOption = false,
    selectorConfig: selectorConfigOption = {},
  } = options

  // 设备检测
  const { deviceType: detectedDevice } = useDeviceDetection({
    initialDevice: initialDevice || 'desktop',
    enableResponsive: autoDetectDevice,
  })

  // 响应式状态
  const currentTemplate = ref<TemplateMetadata | null>(null)
  const currentComponent = ref<Component | null>(null)
  const availableTemplates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 选择器相关状态
  const showSelector = ref(showSelectorOption)
  const selectorConfig = ref({
    theme: 'default',
    position: 'bottom',
    triggerStyle: 'dropdown',
    modalStyle: 'dropdown',
    animation: 'slide',
    showSearch: false,
    showTags: false,
    showSort: false,
    ...selectorConfigOption,
  })

  // 当前设备类型
  const deviceType = computed(() => initialDevice || detectedDevice.value)

  // 扫描器实例
  const scanner = getGlobalScanner()

  /**
   * 加载模板列表
   */
  async function loadTemplates(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // 扫描模板
      const scanResult = await scanner.scan()

      if (scanResult.errors.length > 0) {
        console.warn('Template scan errors:', scanResult.errors)
      }

      // 获取当前分类和设备的模板列表
      const templates = scanner.getTemplates(category || 'default', deviceType.value)
      availableTemplates.value = templates

      // 如果没有当前模板或当前模板不在列表中，选择默认模板
      if (!currentTemplate.value || !templates.find(t => t.id === currentTemplate.value!.id || t.name === currentTemplate.value!.name)) {
        const defaultTemplate = templates.find(t => t.isDefault) || templates[0]
        if (defaultTemplate) {
          await switchTemplate(defaultTemplate.id || defaultTemplate.name)
        }
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load templates'
      console.error('Failed to load templates:', err)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 切换模板
   */
  async function switchTemplate(templateName: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // 如果模板列表还没有加载，先等待加载完成
      if (availableTemplates.value.length === 0) {
        await loadTemplates()
      }

      // 查找模板元数据（优先使用ID匹配，然后使用name匹配）
      const template = availableTemplates.value.find(t =>
        t.id === templateName || t.name === templateName,
      )
      if (!template) {
        throw new Error(`Template not found: ${templateName}`)
      }

      // 检查缓存
      if (enableCache) {
        const cachedComponent = componentCache.getComponent(
          template.category,
          template.device,
          template.name,
        )
        if (cachedComponent) {
          currentTemplate.value = template
          // 使用 markRaw 防止组件被包装成响应式对象
          currentComponent.value = markRaw(cachedComponent)
          loading.value = false
          return
        }
      }

      // 加载组件
      const loadResult = await componentLoader.loadComponent(template)

      currentTemplate.value = template
      // 使用 markRaw 防止组件被包装成响应式对象
      currentComponent.value = markRaw(loadResult.component)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to switch template'
      console.error('Failed to switch template:', err)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 刷新模板列表
   */
  async function refreshTemplates(): Promise<void> {
    // 清除缓存
    if (enableCache) {
      componentCache.clear()
    }

    // 重新加载
    await loadTemplates()
  }

  /**
   * 预加载模板
   */
  async function preloadTemplate(templateName: string): Promise<void> {
    try {
      const template = availableTemplates.value.find(t => t.name === templateName)
      if (!template) {
        throw new Error(`Template not found: ${templateName}`)
      }

      await componentLoader.preloadComponent(template)
    }
    catch (err) {
      console.warn(`Failed to preload template: ${templateName}`, err)
    }
  }

  /**
   * 清除缓存
   */
  function clearCache(): void {
    if (enableCache) {
      componentCache.clear()
    }
    componentLoader.clearLoadingPromises()
  }

  /**
   * 预加载常用模板
   */
  async function preloadCommonTemplates(): Promise<void> {
    const templates = availableTemplates.value
    if (templates.length === 0)
      return

    // 预加载默认模板和前3个模板
    const toPreload = [
      ...templates.filter(t => t.isDefault),
      ...templates.slice(0, 3),
    ].slice(0, 5) // 最多预加载5个

    await Promise.allSettled(
      toPreload.map(template => componentLoader.preloadComponent(template)),
    )
  }

  // 监听设备类型变化
  watch(deviceType, async (newDevice, oldDevice) => {
    if (newDevice !== oldDevice) {
      await loadTemplates()
    }
  })

  // 监听模板变化，预加载相关模板
  watch(currentTemplate, async (newTemplate) => {
    if (newTemplate && availableTemplates.value.length > 1) {
      // 预加载下一个模板（简单策略）
      const currentIndex = availableTemplates.value.findIndex(t => t.name === newTemplate.name)
      const nextIndex = (currentIndex + 1) % availableTemplates.value.length
      const nextTemplate = availableTemplates.value[nextIndex]

      if (nextTemplate) {
        componentLoader.preloadComponent(nextTemplate).catch(() => {
          // 忽略预加载错误
        })
      }
    }
  })

  // 初始化
  onMounted(async () => {
    await loadTemplates()

    // 延迟预加载常用模板
    setTimeout(() => {
      preloadCommonTemplates().catch(() => {
        // 忽略预加载错误
      })
    }, 1000)
  })

  // 清理
  /**
   * 打开选择器
   */
  function openSelector() {
    showSelector.value = true
  }

  /**
   * 关闭选择器
   */
  function closeSelector() {
    showSelector.value = false
  }

  onUnmounted(() => {
    // 清理加载中的Promise
    componentLoader.clearLoadingPromises()
  })

  return {
    currentTemplate,
    currentComponent,
    availableTemplates,
    loading,
    error,
    deviceType,
    switchTemplate,
    refreshTemplates,
    preloadTemplate,
    clearCache,
    TemplateTransition: markRaw(HookTemplateRenderer),
    showSelector,
    selectorConfig,
    openSelector,
    closeSelector,
  }
}

/**
 * 简化版模板Hook（仅用于获取模板列表）
 */
export function useTemplateList(category: string, device?: DeviceType | Ref<DeviceType>) {
  const availableTemplates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { deviceType } = useDeviceDetection({
    initialDevice: unref(device) || 'desktop',
    enableResponsive: !device,
  })

  const currentDevice = computed(() => unref(device) || deviceType.value)

  async function loadTemplates() {
    try {
      loading.value = true
      error.value = null

      const scanner = getGlobalScanner()
      const scanResult = await scanner.scan()

      if (scanResult.errors.length > 0) {
        console.warn('Template scan errors:', scanResult.errors)
      }

      const templates = scanner.getTemplates(category, currentDevice.value)
      availableTemplates.value = templates
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load templates'
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadTemplates()
  })

  watch(currentDevice, () => {
    loadTemplates()
  })

  return {
    availableTemplates,
    loading,
    error,
    deviceType: currentDevice,
    refresh: loadTemplates,
  }
}

/**
 * 简化版模板Hook - 返回可直接渲染的组件
 * 这是新的推荐API，简化了使用方式
 */
export function useSimpleTemplate(options: {
  category?: string
  device?: DeviceType
  showSelector?: boolean
  selectorConfig?: any
  templateProps?: any
} = {}) {
  const {
    category = 'login',
    device,
    showSelector = false,
    selectorConfig = {},
    templateProps = {},
  } = options

  // 内部状态
  const showSelectorModal = ref(showSelector)
  const selectedTemplate = ref<string>()

  // 创建渲染组件
  const TemplateComponent = defineComponent({
    name: 'SimpleTemplateComponent',
    setup() {
      return () => h(TemplateRenderer, {
        category,
        device: device || 'desktop',
        templateName: selectedTemplate.value || undefined,
        showSelector: showSelectorModal.value,
        selectorConfig,
        props: templateProps,
        onTemplateChange: (templateName: string) => {
          selectedTemplate.value = templateName
          showSelectorModal.value = false
        }
      })
    }
  })

  // 控制方法
  const openSelector = () => {
    showSelectorModal.value = true
  }

  const closeSelector = () => {
    showSelectorModal.value = false
  }

  const switchTemplate = (templateName: string) => {
    selectedTemplate.value = templateName
    showSelectorModal.value = false
  }

  return {
    TemplateComponent: markRaw(TemplateComponent),
    showSelector: showSelectorModal,
    selectedTemplate,
    openSelector,
    closeSelector,
    switchTemplate,
  }
}

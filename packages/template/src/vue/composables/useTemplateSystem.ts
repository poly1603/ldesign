import type { Component, ComputedRef, Ref } from 'vue'
import { computed, defineAsyncComponent, isRef, markRaw, onMounted, onUnmounted, reactive, readonly, ref, watch } from 'vue'

// ============ 智能模板切换功能 ============

import { getCachedTemplate, setCachedTemplate } from '../../core/cache'
import { type DeviceInfo, getDeviceInfo, watchDeviceChange } from '../../core/device'
import { templateLoader } from '../../core/template-loader'
import type { TemplateMetadata } from '../../types'

// 设备类型
export type DeviceType = 'desktop' | 'mobile' | 'tablet'

// 模板信息
export interface TemplateInfo {
  id: string
  name: string
  description: string
  category: string
  deviceType: DeviceType
  component: any // 使用any类型避免复杂的组件类型问题
  preview?: string
  config?: Record<string, any>
}

// 模板注册表
const templateRegistry = reactive<Map<string, TemplateInfo>>(new Map())

// 新的模板系统状态
const scannedTemplates = ref<TemplateMetadata[]>([])
const templatesScanned = ref(false)

// 注册模板
export function registerTemplate(template: TemplateInfo) {
  const key = `${template.category}-${template.deviceType}-${template.id}`
  templateRegistry.set(key, template)
}

// 扫描模板（使用新的 TemplateLoader 系统）
async function scanTemplates() {
  if (templatesScanned.value) return scannedTemplates.value

  try {
    const templates = await templateLoader.scanAndRegisterTemplates()
    scannedTemplates.value = templates
    templatesScanned.value = true
    console.log(`✅ 扫描到 ${templates.length} 个模板`)
    return templates
  } catch (error) {
    console.warn('扫描模板失败:', error)
    return []
  }
}

// 将 TemplateMetadata 转换为 TemplateInfo
function convertTemplateMetadata(metadata: TemplateMetadata): TemplateInfo {
  return {
    id: metadata.template,
    name: metadata.config.name || metadata.template,
    description: metadata.config.description || '',
    category: metadata.category,
    deviceType: metadata.device as DeviceType,
    component: markRaw(defineAsyncComponent(() => templateLoader.loadTemplateComponent(metadata))),
    preview: metadata.config.preview,
    config: metadata.config
  }
}

// 获取设备类型
function getDeviceType(): DeviceType {
  if (typeof window === 'undefined')
    return 'desktop'

  const width = window.innerWidth
  if (width <= 768)
    return 'mobile'
  if (width <= 1024)
    return 'tablet'
  return 'desktop'
}

// useTemplate Hook 选项
export interface UseTemplateOptions {
  category: string
  deviceType?: DeviceType
  defaultTemplate?: string
  autoSwitch?: boolean | Ref<boolean> // 是否自动根据设备切换，支持响应式
}

// useTemplate Hook 返回值
export interface UseTemplateReturn {
  // 当前模板
  currentTemplate: Ref<TemplateInfo | null>
  currentTemplateId: Ref<string>

  // 可用模板列表
  availableTemplates: ComputedRef<TemplateInfo[]>

  // 设备信息
  deviceType: Ref<DeviceType>

  // 操作方法
  switchTemplate: (templateId: string) => void
  switchDevice: (device: DeviceType) => void

  // 渲染组件
  TemplateComponent: ComputedRef<Component | null>

  // 配置
  templateConfig: ComputedRef<Record<string, any>>
}

/**
 * 模板系统 Hook
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 模板选择器 -->
 *     <select v-model="currentTemplateId">
 *       <option v-for="template in availableTemplates" :key="template.id" :value="template.id">
 *         {{ template.name }}
 *       </option>
 *     </select>
 *
 *     <!-- 渲染当前模板 -->
 *     <component
 *       :is="TemplateComponent"
 *       v-bind="templateConfig"
 *       @login="handleLogin"
 *     />
 *   </div>
 * </template>
 *
 * <script setup>
 * const {
 *   currentTemplateId,
 *   availableTemplates,
 *   TemplateComponent,
 *   templateConfig
 * } = useTemplate({ category: 'login' })
 *
 * const handleLogin = (data) => {
 *   console.log('登录:', data)
 * }
 * </script>
 * ```
 */
export function useTemplate(options: UseTemplateOptions): UseTemplateReturn {
  const { category } = options

  // 处理响应式的autoSwitch参数
  const autoSwitchRef = isRef(options.autoSwitch) ? options.autoSwitch : ref(options.autoSwitch ?? true)

  // 响应式状态
  const deviceType = ref<DeviceType>(options.deviceType || getDeviceType())
  const currentTemplateId = ref<string>(options.defaultTemplate || '')

  // 获取当前分类和设备的可用模板
  const availableTemplates = computed(() => {
    const templates: TemplateInfo[] = []

    // 首先从新的扫描系统获取模板
    for (const metadata of scannedTemplates.value) {
      if (metadata.category === category && metadata.device === deviceType.value) {
        templates.push(convertTemplateMetadata(metadata))
      }
    }

    // 然后从旧的注册系统获取模板（向后兼容）
    for (const [, template] of templateRegistry) {
      if (template.category === category && template.deviceType === deviceType.value) {
        // 避免重复添加
        if (!templates.find(t => t.id === template.id)) {
          templates.push({
            ...template,
            component: markRaw(template.component),
          })
        }
      }
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name))
  })

  // 当前模板
  const currentTemplate = computed(() => {
    if (!currentTemplateId.value)
      return null
    return availableTemplates.value.find(t => t.id === currentTemplateId.value) || null
  })

  // 当前模板组件（带fallback机制）
  const TemplateComponent = computed(() => {
    // 如果当前模板存在，返回异步组件
    if (currentTemplate.value) {
      // 查找对应的 TemplateMetadata
      const metadata = scannedTemplates.value.find(
        m => m.category === category &&
          m.device === deviceType.value &&
          m.template === currentTemplateId.value
      )

      if (metadata) {
        // 使用新的模板加载器创建异步组件
        return markRaw(defineAsyncComponent(() => templateLoader.loadTemplateComponent(metadata)))
      }

      // 回退到旧系统
      if (currentTemplate.value.component) {
        return markRaw(currentTemplate.value.component)
      }
    }

    // 如果当前设备类型没有模板，尝试fallback到桌面版本
    if (deviceType.value !== 'desktop') {
      const desktopMetadata = scannedTemplates.value.find(
        m => m.category === category &&
          m.device === 'desktop' &&
          m.template === currentTemplateId.value
      )

      if (desktopMetadata) {
        return markRaw(defineAsyncComponent(() => templateLoader.loadTemplateComponent(desktopMetadata)))
      }

      // 回退到旧系统
      const desktopTemplate = templateRegistry.get(`${category}-desktop-${currentTemplateId.value}`)
      if (desktopTemplate?.component) {
        return markRaw(desktopTemplate.component)
      }
    }

    // 最后的fallback：获取第一个可用模板
    const firstTemplate = availableTemplates.value[0]
    if (firstTemplate) {
      const metadata = scannedTemplates.value.find(
        m => m.category === category &&
          m.device === firstTemplate.deviceType &&
          m.template === firstTemplate.id
      )

      if (metadata) {
        return markRaw(defineAsyncComponent(() => templateLoader.loadTemplateComponent(metadata)))
      }

      if (firstTemplate.component) {
        return markRaw(firstTemplate.component)
      }
    }

    return null
  })

  // 模板配置
  const templateConfig = computed(() => {
    return currentTemplate.value?.config || {}
  })

  // 切换模板
  const switchTemplate = (templateId: string) => {
    const template = availableTemplates.value.find(t => t.id === templateId)
    if (template) {
      currentTemplateId.value = templateId
    }
  }

  // 切换设备
  const switchDevice = (device: DeviceType) => {
    // const oldDevice = deviceType.value // 暂时注释掉未使用的变量
    deviceType.value = device

    // 如果当前模板在新设备上不可用，切换到第一个可用模板
    const currentTemplateExists = availableTemplates.value.some(t => t.id === currentTemplateId.value)
    if (!currentTemplateExists && availableTemplates.value.length > 0) {
      const newTemplateId = availableTemplates.value[0].id
      currentTemplateId.value = newTemplateId
    }
  }

  // 动态监听窗口大小变化
  let resizeCleanup: (() => void) | null = null

  const setupResizeListener = () => {
    if (typeof window === 'undefined')
      return

    const handleResize = () => {
      const newDeviceType = getDeviceType()
      if (newDeviceType !== deviceType.value) {
        switchDevice(newDeviceType)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }

  const cleanupResizeListener = () => {
    if (resizeCleanup) {
      resizeCleanup()
      resizeCleanup = null
    }
  }

  // 监听 autoSwitch 变化，动态管理事件监听器
  watch(autoSwitchRef, (newAutoSwitch) => {
    cleanupResizeListener()
    if (newAutoSwitch) {
      resizeCleanup = setupResizeListener() || null
    }
  }, { immediate: true })

  onUnmounted(() => {
    cleanupResizeListener()
  })

  // 初始化默认模板
  onMounted(async () => {
    // 扫描模板
    await scanTemplates()

    // 设置默认模板
    if (!currentTemplateId.value && availableTemplates.value.length > 0) {
      currentTemplateId.value = availableTemplates.value[0].id
    }
  })

  return {
    currentTemplate: computed(() => currentTemplate.value),
    currentTemplateId,
    availableTemplates: computed(() => availableTemplates.value),
    deviceType,
    switchTemplate,
    switchDevice,
    TemplateComponent: computed(() => TemplateComponent.value),
    templateConfig: computed(() => templateConfig.value),
  }
}

// 预设模板配置
export const templateConfigs = {
  login: {
    default: {
      title: '用户登录',
      subtitle: '请输入您的账号信息',
      showRememberMe: true,
      showForgotPassword: true,
      showThirdPartyLogin: false,
    },
    classic: {
      title: 'LDesign 管理系统',
      subtitle: '欢迎回来',
      showRememberMe: true,
      showForgotPassword: true,
      showThirdPartyLogin: true,
      thirdPartyProviders: ['github', 'google', 'wechat'],
    },
    modern: {
      title: '欢迎登录',
      subtitle: '开始您的数字化之旅',
      showRememberMe: true,
      showForgotPassword: true,
      showThirdPartyLogin: true,
      thirdPartyProviders: ['github', 'google', 'wechat'],
    },
    mobile: {
      title: '登录',
      subtitle: '欢迎回来',
      showRememberMe: false,
      showForgotPassword: true,
      showThirdPartyLogin: true,
      thirdPartyProviders: ['wechat', 'qq', 'weibo'],
    },
    tablet: {
      title: '用户登录',
      subtitle: '请输入您的账户信息',
      showRememberMe: true,
      showForgotPassword: true,
      showThirdPartyLogin: true,
      thirdPartyProviders: ['github', 'google', 'wechat', 'apple'],
    },
  },
}

export interface UseTemplateSwitchOptions {
  category: string
  initialVariant?: string
  autoSwitch?: boolean // 是否自动切换设备类型对应的模板
  cacheEnabled?: boolean // 是否启用缓存
  onDeviceChange?: (oldDevice: DeviceType, newDevice: DeviceType) => void
  onTemplateChange?: (template: TemplateInfo | null) => void
}

export interface UseTemplateSwitchReturn {
  // 状态
  deviceInfo: Readonly<Ref<DeviceInfo>>
  currentTemplate: Readonly<Ref<TemplateInfo | null>>
  currentVariant: Readonly<Ref<string>>
  availableTemplates: Readonly<Ref<TemplateInfo[]>>
  isLoading: Readonly<Ref<boolean>>

  // 方法
  switchTemplate: (variant: string) => Promise<boolean>
  switchToDefault: () => Promise<boolean>
  refreshDevice: () => void
  getTemplateComponent: () => any

  // 工具方法
  isCurrentTemplate: (variant: string) => boolean
  hasTemplate: (variant: string) => boolean
  getTemplateInfo: (variant: string) => TemplateInfo | null
}

/**
 * 智能模板切换组合式API
 */
export function useTemplateSwitch(options: UseTemplateSwitchOptions): UseTemplateSwitchReturn {
  const {
    category,
    initialVariant = '',
    autoSwitch = true,
    cacheEnabled = true,
    onDeviceChange,
    onTemplateChange,
  } = options

  // 响应式状态
  const deviceInfo = ref<DeviceInfo>(getDeviceInfo())
  const currentVariant = ref<string>(initialVariant)
  const isLoading = ref<boolean>(false)
  const unwatchDevice = ref<(() => void) | null>(null)

  // 计算属性
  const availableTemplates = computed(() => {
    return Array.from(templateRegistry.values()).filter((t: TemplateInfo) =>
      t.category === category && t.deviceType === deviceInfo.value.type
    )
  })

  const currentTemplate = computed(() => {
    if (!currentVariant.value)
      return null
    return availableTemplates.value.find((t: TemplateInfo) => t.id === currentVariant.value) || null
  })

  // 获取默认模板变体
  const getDefaultVariant = (): string => {
    // 1. 如果启用缓存，优先从缓存获取
    if (cacheEnabled) {
      const cached = getCachedTemplate(category, deviceInfo.value.type)
      if (cached && availableTemplates.value.some((t: TemplateInfo) => t.id === cached)) {
        return cached
      }
    }

    // 2. 返回第一个可用模板
    return availableTemplates.value[0]?.id || ''
  }

  // 切换模板
  const switchTemplate = async (variant: string): Promise<boolean> => {
    if (isLoading.value)
      return false

    const template = availableTemplates.value.find((t: TemplateInfo) => t.id === variant)
    if (!template) {
      // 模板未找到，静默返回false
      return false
    }

    isLoading.value = true

    try {
      // 更新当前变体
      currentVariant.value = variant

      // 缓存用户选择
      if (cacheEnabled) {
        setCachedTemplate(category, deviceInfo.value.type, variant)
      }

      // 触发回调
      onTemplateChange?.(template)

      return true
    }
    catch (error) {
      // 模板切换失败，静默处理
      return false
    }
    finally {
      isLoading.value = false
    }
  }

  // 切换到默认模板
  const switchToDefault = async (): Promise<boolean> => {
    const defaultVariant = getDefaultVariant()
    if (!defaultVariant)
      return false

    return await switchTemplate(defaultVariant)
  }

  // 刷新设备信息
  const refreshDevice = (): void => {
    deviceInfo.value = getDeviceInfo()
  }

  // 获取模板组件
  const getTemplateComponent = (): any => {
    return currentTemplate.value?.component || null
  }

  // 工具方法
  const isCurrentTemplate = (variant: string): boolean => {
    return currentVariant.value === variant
  }

  const hasTemplate = (variant: string): boolean => {
    return availableTemplates.value.some((t: TemplateInfo) => t.id === variant)
  }

  const getTemplateInfo = (variant: string): TemplateInfo | null => {
    return availableTemplates.value.find((t: TemplateInfo) => t.id === variant) || null
  }

  // 处理设备变化
  const handleDeviceChange = async (newDeviceInfo: DeviceInfo): Promise<void> => {
    const oldDevice = deviceInfo.value.type
    deviceInfo.value = newDeviceInfo

    if (oldDevice !== newDeviceInfo.type) {
      // 触发设备变化回调
      onDeviceChange?.(oldDevice, newDeviceInfo.type)

      // 如果启用自动切换，切换到新设备类型的默认模板
      if (autoSwitch) {
        const newVariant = getDefaultVariant()
        if (newVariant && newVariant !== currentVariant.value) {
          await switchTemplate(newVariant)
        }
      }
    }
  }

  // 监听当前变体变化
  watch(currentTemplate, (newTemplate) => {
    onTemplateChange?.(newTemplate)
  })

  // 初始化
  onMounted(async () => {
    // 如果没有初始变体，使用默认变体
    if (!currentVariant.value) {
      const defaultVariant = getDefaultVariant()
      if (defaultVariant) {
        currentVariant.value = defaultVariant
      }
    }

    // 监听设备变化
    unwatchDevice.value = watchDeviceChange(handleDeviceChange)
  })

  // 清理
  onUnmounted(() => {
    if (unwatchDevice.value) {
      unwatchDevice.value()
    }
  })

  return {
    // 状态
    deviceInfo: readonly(deviceInfo),
    currentTemplate: readonly(currentTemplate) as Readonly<Ref<TemplateInfo | null>>,
    currentVariant: readonly(currentVariant),
    availableTemplates: readonly(availableTemplates) as Readonly<Ref<TemplateInfo[]>>,
    isLoading: readonly(isLoading),

    // 方法
    switchTemplate,
    switchToDefault,
    refreshDevice,
    getTemplateComponent,

    // 工具方法
    isCurrentTemplate,
    hasTemplate,
    getTemplateInfo,
  }
}

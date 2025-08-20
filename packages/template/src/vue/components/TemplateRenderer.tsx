/**
 * TemplateRenderer 组件 - 重构版本
 *
 * 声明式的模板渲染组件，支持内置模板选择器
 */

import type { DeviceType, TemplateSelectorConfig, SlotConfig } from '../../types'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch, Transition, markRaw, type PropType } from 'vue'
import './TemplateRenderer.less'
import { TemplateManager } from '../../core/manager'
import { TemplateSelector } from './TemplateSelector'
import { useTemplateProvider } from '../composables/useTemplateProvider'

/**
 * 检测当前设备类型 - 统一的设备检测逻辑
 */
function detectCurrentDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth
  let device: DeviceType
  if (width < 768) {
    device = 'mobile'
  } else if (width < 1024) {
    device = 'tablet'
  } else {
    device = 'desktop'
  }

  return device
}

/**
 * TemplateRenderer 组件
 */
export const TemplateRenderer = defineComponent({
  name: 'TemplateRenderer',

  props: {
    /** 分类 */
    category: {
      type: String,
      required: true,
    },

    /** 设备类型 */
    device: {
      type: String as PropType<DeviceType>,
      default: undefined,
    },

    /** 模板名称（可选，不指定时使用默认模板）
     * 支持字符串或对象格式：
     * - 字符串：'default' - 所有设备使用相同模板
     * - 对象：{ desktop: 'classic', tablet: 'adaptive', mobile: 'simple' } - 不同设备使用不同模板
     */
    template: {
      type: [String, Object] as PropType<string | Record<DeviceType, string>>,
      required: false,
      default: undefined,
    },

    /** 传递给模板的属性 */
    templateProps: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },

    /** 是否使用缓存 */
    cache: {
      type: Boolean,
      default: true,
    },

    /** 是否启用切换动画 */
    transition: {
      type: Boolean,
      default: true,
    },

    /** 动画持续时间（毫秒） */
    transitionDuration: {
      type: Number,
      default: 300,
    },

    /** 动画类型 */
    transitionType: {
      type: String as PropType<'fade' | 'slide' | 'scale' | 'flip'>,
      default: 'fade',
    },

    /** 是否预加载 */
    preload: {
      type: Boolean,
      default: false,
    },

    /** 是否显示加载状态 */
    loading: {
      type: Boolean,
      default: false,
    },

    /** 是否显示错误状态 */
    error: {
      type: Boolean,
      default: false,
    },

    // ============ 内置模板选择器配置 ============
    /** 模板选择器配置 */
    selector: {
      type: [Boolean, Object] as PropType<boolean | TemplateSelectorConfig>,
      default: false,
    },

    /** 自定义插槽配置 */
    slots: {
      type: Array as PropType<SlotConfig[]>,
      default: () => [],
    },

    /** 是否允许用户切换模板 */
    allowTemplateSwitch: {
      type: Boolean,
      default: true,
    },

    /** 模板切换权限检查 */
    canSwitchTemplate: {
      type: Function as PropType<(template: string) => boolean>,
      default: () => true,
    },
  },

  emits: {
    /** 加载完成事件 */
    load: (result: any) => true,

    /** 加载错误事件 */
    error: (error: Error) => true,

    /** 加载前事件 */
    'before-load': () => true,

    /** 模板变化事件 */
    'template-change': (template: any) => true,

    /** 设备变化事件 */
    'device-change': (event: { oldDevice: DeviceType; newDevice: DeviceType }) => true,

    /** 模板选择器可见性变化事件 */
    'selector-visibility-change': (visible: boolean) => true,

    /** 模板预览事件 */
    'template-preview': (template: string) => true,
  },

  setup(props: any, { emit, slots }: any) {
    // 尝试使用Provider上下文
    const provider = useTemplateProvider()

    // 状态管理
    const isLoading = ref(false)
    const error = ref<Error | null>(null)
    const currentComponent = ref<any>(null)
    const currentLoadedTemplate = ref<any>(null) // 保存当前加载的模板元数据
    const manager = ref<TemplateManager | null>(null)
    // 设备类型状态 - 统一管理，避免冲突
    const currentDevice = ref<DeviceType>('desktop') // 先设置默认值，后续会同步
    const selectedTemplate = ref<string | null>(null)
    const selectorVisible = ref(false)
    const availableTemplates = ref<any[]>([])

    // 选择器配置
    const selectorConfig = computed(() => {
      if (props.selector === false) return null
      if (props.selector === true) {
        return (
          provider.config.value?.defaultSelectorConfig || {
            enabled: true,
            position: 'top',
            showPreview: true,
            showSearch: true,
            layout: 'grid',
            columns: 3,
            showInfo: true,
          }
        )
      }
      return props.selector
    })

    // 计算属性 - 目标设备类型
    const targetDevice = computed(() => {
      // 优先使用 props.device（手动指定），否则使用检测到的设备类型
      const device = props.device || currentDevice.value
      return device
    })

    // 获取当前设备对应的模板名称
    const currentTemplate = computed(() => {
      if (!props.template) {
        return undefined // 使用默认模板
      }

      if (typeof props.template === 'string') {
        return props.template
      }

      // 对象格式：根据设备类型选择模板
      return props.template[targetDevice.value] || undefined
    })

    const templateKey = computed(() => {
      return `${props.category}/${targetDevice.value}/${currentTemplate.value || 'default'}`
    })

    // 初始化管理器
    const initializeManager = async () => {
      // 如果在Provider上下文中，使用Provider的管理器
      if (provider.isInProvider.value && provider.config.value?.enableGlobalState) {
        // 使用Provider的全局状态
        currentDevice.value = provider.currentDevice.value

        // 获取可用模板 - 只按分类过滤，不按设备过滤
        availableTemplates.value = provider.getTemplates(props.category)

        return
      }

      // 否则创建本地管理器实例
      if (!manager.value) {
        manager.value = new TemplateManager({
          enableCache: props.cache,
          autoDetectDevice: !props.device, // 只有在没有手动指定设备时才启用自动检测
          debug: true, // 启用调试模式
          // 启用持久化存储
          storage: {
            key: 'ldesign-template-selections',
            storage: 'localStorage',
          },
        })

        // 统一设备类型检测和同步
        if (props.device) {
          // 如果手动指定了设备类型，使用指定的类型
          currentDevice.value = props.device
        } else {
          // 否则使用管理器检测的设备类型，确保一致性
          const detectedDevice = manager.value.getCurrentDevice()
          currentDevice.value = detectedDevice
        }

        // 设置设备变化监听器 - 统一处理，避免重复监听
        // 只有在启用自动检测时才监听设备变化
        if (manager.value.config.autoDetectDevice) {
          // 监听 manager 的设备变化事件
          manager.value.on('device:change', async (event: any) => {
            const newDevice = event.newDevice
            const oldDevice = event.oldDevice

            // 更新当前设备类型
            currentDevice.value = newDevice

            // 处理设备变化
            await handleDeviceChange(newDevice, oldDevice)
          })
        }

        // 设备变化处理函数
        async function handleDeviceChange(newDevice: string, oldDevice: string) {
          // 重新扫描模板以确保 TemplateSelector 获得最新的模板列表
          try {
            const result = await manager.value!.scanTemplates()
            availableTemplates.value = result.templates.filter(
              t => t.category === props.category
            )
          } catch (err) {
            console.warn('重新扫描模板失败:', err)
          }

          // 发射设备变化事件
          emit('device-change', {
            oldDevice,
            newDevice,
          })

          // 重新加载模板以适应新设备
          await loadTemplate()
        }

        // 扫描模板
        try {
          const result = await manager.value.scanTemplates()

          // 只按分类过滤，保留所有设备类型的模板，让 TemplateSelector 自己处理设备过滤
          availableTemplates.value = result.templates.filter(
            t => t.category === props.category
          )

          if (availableTemplates.value.length === 0) {
            console.warn(`⚠️ 没有找到 ${props.category} 分类的模板`)
          }
        } catch (err) {
          console.error('❌ 模板扫描失败:', err)
          availableTemplates.value = []
        }
      }
    }

    // 加载模板
    const loadTemplate = async () => {
      if (!manager.value) {
        await initializeManager()
      }

      if (!manager.value) {
        throw new Error('Template manager not initialized')
      }

      isLoading.value = true
      error.value = null

      try {
        emit('before-load')

        // 创建自动注入的 TemplateSelector 组件
        const autoTemplateSelector = () => (
          <TemplateSelector
            category={props.category}
            device={targetDevice.value}
            currentTemplate={(() => {
              if (selectedTemplate.value) return selectedTemplate.value
              if (provider.isInProvider.value && provider.currentTemplate.value) return provider.currentTemplate.value.template
              if (typeof currentTemplate.value === 'string') return currentTemplate.value
              return undefined
            })()}
            templates={availableTemplates.value}
            showPreview={true}
            showSearch={true}
            layout="grid"
            columns={3}
            showInfo={true}
            buttonText="选择模板"
            buttonIcon="⚙️"
            onTemplateChange={handleTemplateChange}
            onTemplatePreview={handleTemplatePreview}
          />
        )

        // 合并模板属性，自动注入 TemplateSelector
        const enhancedTemplateProps = {
          ...props.templateProps,
          templateSelector: autoTemplateSelector,
        }

        // 使用 selectedTemplate 优先，如果没有则使用 currentTemplate
        const templateToRender = selectedTemplate.value || currentTemplate.value

        const result = await manager.value.render({
          category: props.category,
          device: targetDevice.value,
          template: templateToRender,
          props: enhancedTemplateProps,
          cache: props.cache,
        })

        // 使用 markRaw 避免组件被响应式化
        currentComponent.value = markRaw(result.component)
        currentLoadedTemplate.value = result.metadata // 保存当前加载的模板元数据
        emit('load', result)
        emit('template-change', result.metadata)
      } catch (err) {
        const loadError = err as Error
        error.value = loadError
        emit('error', loadError)
        console.error('Template loading failed:', loadError)
      } finally {
        isLoading.value = false
      }
    }

    // 重试加载
    const retryLoad = () => {
      loadTemplate()
    }

    // 模板选择器事件处理
    const handleTemplateChange = async (template: string) => {
      if (!props.allowTemplateSwitch || !props.canSwitchTemplate(template)) {
        return
      }

      selectedTemplate.value = template

      // 如果在Provider上下文中，使用Provider的方法
      if (provider.isInProvider.value) {
        try {
          await provider.switchTemplate(props.category, currentDevice.value, template)
          emit('template-change', template)
        } catch (error) {
          console.error('Template switch failed:', error)
        }
      } else {
        // 否则直接加载模板
        await loadTemplate()
        emit('template-change', template)
      }
    }

    const handleTemplatePreview = (template: string) => {
      emit('template-preview', template)
    }

    const toggleSelector = () => {
      if (selectorConfig.value?.trigger === 'manual') {
        selectorVisible.value = !selectorVisible.value
        emit('selector-visibility-change', selectorVisible.value)
      }
    }

    // 监听Provider状态变化，同步selectedTemplate
    watch(
      () => provider.isInProvider.value ? provider.currentTemplate.value : null,
      (newTemplate) => {
        if (newTemplate && provider.isInProvider.value) {

          selectedTemplate.value = newTemplate.template
        }
      },
      { immediate: true }
    )

    // 监听属性变化
    watch(
      () => [props.category, props.device, props.template, currentTemplate.value],
      () => {
        loadTemplate()
      },
      { immediate: false }
    )

    // 监听设备变化（仅在未手动指定设备时）
    watch(
      () => currentDevice.value,
      (newDevice, oldDevice) => {
        if (!props.device && newDevice !== oldDevice) {
          // 设备变化时重新加载模板
          loadTemplate()
        }
      },
      { immediate: false }
    )

    // 监听模板属性变化
    watch(
      () => props.templateProps,
      () => {
        // 如果模板属性变化，重新渲染当前组件
        if (currentComponent.value) {
          // 这里可以触发组件重新渲染
        }
      },
      { deep: true }
    )

    // 初始化selectedTemplate
    const initializeSelectedTemplate = () => {
      // 优先级：Provider当前模板 > props.template > 默认
      if (provider.isInProvider.value && provider.currentTemplate.value) {
        selectedTemplate.value = provider.currentTemplate.value.template
      } else if (currentTemplate.value) {
        selectedTemplate.value = currentTemplate.value
      }
    }

    // 生命周期
    onMounted(async () => {
      // 先初始化selectedTemplate
      initializeSelectedTemplate()

      await loadTemplate()

      // 预加载
      if (props.preload && manager.value) {
        const templates = manager.value.getTemplates(props.category, targetDevice.value)
        manager.value.preloadTemplates(templates).catch(err => {
          console.warn('Template preloading failed:', err)
        })
      }
    })

    onUnmounted(() => {
      if (manager.value) {
        manager.value.destroy()
      }
    })

    // 计算过渡动画类名
    const transitionName = computed(() => {
      return `template-${props.transitionType}`
    })

    // 计算过渡动画样式
    const transitionStyle = computed(() => {
      return {
        '--transition-duration': `${props.transitionDuration}ms`,
      }
    })

    // 渲染模板选择器
    const renderSelector = () => {
      if (!selectorConfig.value?.enabled) return null

      const config = selectorConfig.value
      const position = config.position || 'top'

      // 根据触发方式决定是否显示
      let shouldShow = true
      if (config.trigger === 'manual') {
        shouldShow = selectorVisible.value
      }

      if (!shouldShow) return null

      // 计算当前模板名称，确保选中状态正确
      const getCurrentTemplateName = () => {
        // 优先使用selectedTemplate
        if (selectedTemplate.value) {
          return selectedTemplate.value
        }

        // 其次使用当前加载的模板元数据
        if (currentLoadedTemplate.value) {
          return currentLoadedTemplate.value.template
        }

        // 再次使用Provider的当前模板
        if (provider.isInProvider.value && provider.currentTemplate.value) {
          return provider.currentTemplate.value.template
        }

        // 最后使用computed的currentTemplate
        if (typeof currentTemplate.value === 'string') {
          return currentTemplate.value
        }

        return undefined
      }

      const currentTemplateName = getCurrentTemplateName()


      const selectorProps = {
        category: props.category,
        device: currentDevice.value,
        currentTemplate: currentTemplateName,
        templates: availableTemplates.value,
        // 从config对象中提取TemplateSelector支持的属性
        showPreview: config.showPreview ?? true,
        showSearch: config.showSearch ?? true,
        layout: config.layout ?? 'grid',
        columns: config.columns ?? 3,
        showInfo: config.showInfo ?? true,
        buttonText: config.buttonText ?? '选择模板',
        buttonIcon: config.buttonIcon ?? '⚙️',
        onTemplateChange: handleTemplateChange,
        onTemplatePreview: handleTemplatePreview,
        onVisibilityChange: (visible: boolean) => {
          selectorVisible.value = visible
          emit('selector-visibility-change', visible)
        },
      }

      return (
        <div class={`template-selector-wrapper template-selector-wrapper--${position}`}>
          <TemplateSelector {...selectorProps} />
        </div>
      )
    }

    // 渲染自定义插槽
    const renderCustomSlots = () => {
      if (!props.slots || props.slots.length === 0) return null

      return props.slots.map((slotConfig, index) => {
        const SlotComponent = slotConfig.content
        if (!SlotComponent) return null

        return (
          <div key={index} class={`custom-slot custom-slot--${slotConfig.name}`}>
            <SlotComponent {...(slotConfig.props || {})} />
          </div>
        )
      })
    }

    // 渲染内容的函数
    const renderContent = () => {
      // 显示加载状态
      if (isLoading.value || props.loading) {
        if (slots.loading) {
          return slots.loading()
        }
        return (
          <div class="template-loading">
            <div class="loading-spinner"></div>
            <p>模板加载中...</p>
          </div>
        )
      }

      // 显示错误状态
      if (error.value || props.error) {
        if (slots.error) {
          return slots.error({ error: error.value, retry: retryLoad })
        }
        return (
          <div class="template-error">
            <h3>模板加载失败</h3>
            <p>{error.value?.message || '未知错误'}</p>
            <button onClick={retryLoad}>重试</button>
          </div>
        )
      }

      // 渲染模板组件
      if (currentComponent.value) {
        const Component = currentComponent.value
        return <Component {...props.templateProps} />
      }

      // 默认状态
      return (
        <div class="template-placeholder">
          <p>模板未加载</p>
        </div>
      )
    }

    // 渲染函数
    return () => {
      const content = renderContent()
      const selector = renderSelector()
      const customSlots = renderCustomSlots()
      const selectorPosition = selectorConfig.value?.position || 'top'

      // 构建渲染元素数组
      const elements = []

      // 根据位置添加选择器
      if (selector && (selectorPosition === 'top' || selectorPosition === 'left')) {
        elements.push(selector)
      }

      // 添加自定义插槽（前置）
      if (customSlots) {
        elements.push(...customSlots.filter((slot: any) => slot.props?.position === 'before'))
      }

      // 添加主要内容
      const mainContent = props.transition ? (
        <Transition name={transitionName.value} mode="out-in" appear={true}>
          <div key={templateKey.value} class="template-content">
            {content}
          </div>
        </Transition>
      ) : (
        <div class="template-content">{content}</div>
      )

      elements.push(mainContent)

      // 添加自定义插槽（后置）
      if (customSlots) {
        elements.push(...customSlots.filter((slot: any) => slot.props?.position === 'after'))
      }

      // 根据位置添加选择器
      if (selector && (selectorPosition === 'bottom' || selectorPosition === 'right')) {
        elements.push(selector)
      }

      // 渲染容器
      const containerClass = [
        'template-renderer',
        `template-renderer--${selectorPosition}`,
        {
          'template-renderer--with-selector': !!selector,
          'template-renderer--loading': isLoading.value,
          'template-renderer--error': !!error.value,
        },
      ]

      return (
        <div class={containerClass} style={transitionStyle.value}>
          {selectorPosition === 'overlay' && selector ? (
            <>
              {mainContent}
              <div class="template-selector-overlay">{selector}</div>
            </>
          ) : (
            elements
          )}

          {/* 选择器切换按钮（手动触发模式） */}
          {selectorConfig.value?.trigger === 'manual' && (
            <button
              class="template-selector-toggle"
              onClick={toggleSelector}
              title={selectorVisible.value ? '隐藏模板选择器' : '显示模板选择器'}
            >
              {selectorVisible.value ? '✕' : '⚙️'}
            </button>
          )}
        </div>
      )
    }
  },
})

// 默认导出
export default TemplateRenderer

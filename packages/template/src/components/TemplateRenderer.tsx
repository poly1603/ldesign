/**
 * 模板渲染器组件
 *
 * 主渲染组件，支持动态模板加载、设备适配、错误处理等功能
 */

import type {
  DeviceType,
} from '../types/template'
import {
  type Component,
  computed,
  defineComponent,
  onMounted,
  type PropType,
  ref,
  Transition,
  watch,
} from 'vue'
import { useDeviceDetection } from '../composables/useDeviceDetection'
import { useTemplate } from '../composables/useTemplate'
import { useTemplateSelectorAnimation, useTemplateSwitchAnimation } from '../composables/useTemplateAnimation'
import { TemplateSelector } from './TemplateSelector'
import { TemplateTransition } from './TemplateTransition'
import './TemplateRenderer.less'

/**
 * 默认加载组件
 */
const DefaultLoadingComponent = defineComponent({
  name: 'DefaultLoading',
  setup() {
    return () => (
      <div class="template-loading">
        <div class="template-loading__spinner"></div>
        <div class="template-loading__text">加载模板中...</div>
      </div>
    )
  },
})

/**
 * 默认错误组件
 */
const DefaultErrorComponent = defineComponent({
  name: 'DefaultError',
  props: {
    error: {
      type: String,
      required: true,
    },
    retry: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="template-error">
        <div class="template-error__icon">⚠️</div>
        <div class="template-error__message">{props.error}</div>
        <button
          class="template-error__retry"
          onClick={props.retry}
        >
          重试
        </button>
      </div>
    )
  },
})

/**
 * 模板渲染器组件
 */
export const TemplateRenderer = defineComponent({
  name: 'TemplateRenderer',
  props: {
    /** 模板分类（必需） */
    category: {
      type: String,
      required: true,
    },
    /** 设备类型（可选，默认自动检测） */
    device: {
      type: String as PropType<DeviceType>,
      default: undefined,
    },
    /** 模板名称（可选，默认使用该分类下的默认模板） */
    templateName: {
      type: String,
      default: undefined,
    },
    /** 是否响应式跟随设备（默认: true） */
    responsive: {
      type: Boolean,
      default: true,
    },
    /** 是否显示模板选择器（默认: false） */
    showSelector: {
      type: Boolean,
      default: false,
    },
    /** 加载失败时的备用模板名称（可选） */
    fallbackTemplate: {
      type: String,
      default: undefined,
    },
    /** 自定义加载组件（可选） */
    loadingComponent: {
      type: Object as PropType<Component>,
      default: undefined,
    },
    /** 自定义错误组件（可选） */
    errorComponent: {
      type: Object as PropType<Component>,
      default: undefined,
    },
    /** 传递给模板的属性（可选） */
    props: {
      type: Object,
      default: () => ({}),
    },
    /** 模板选择器样式配置（可选） */
    selectorConfig: {
      type: Object,
      default: () => ({}),
    },
    /** 模板切换回调（可选） */
    onTemplateChange: {
      type: Function as PropType<(templateName: string) => void>,
      default: undefined,
    },
    /** 加载错误回调（可选） */
    onLoadError: {
      type: Function as PropType<(error: Error) => void>,
      default: undefined,
    },
  },
  emits: ['template-change', 'load-error', 'load-success'],
  setup(props, { emit, slots }) {
    // 设备检测
    const { deviceType } = useDeviceDetection({
      initialDevice: props.device || 'desktop',
      enableResponsive: props.responsive && !props.device,
    })

    // 当前使用的设备类型
    const currentDevice = computed(() => props.device || deviceType.value)

    // 模板管理
    const {
      currentTemplate,
      currentComponent,
      availableTemplates,
      loading,
      error,
      switchTemplate,
      refreshTemplates,
    } = useTemplate({
      category: props.category,
      device: currentDevice.value,
      autoDetectDevice: props.responsive && !props.device,
      enableCache: true,
    })

    // 内部状态
    const hasTriedFallback = ref(false)
    const retryCount = ref(0)
    const maxRetries = 3
    const showSelectorModal = ref(false)

    // 动画管理
    const selectorAnimation = useTemplateSelectorAnimation()
    const templateSwitchAnimation = useTemplateSwitchAnimation()

    // 计算属性
    const LoadingComponent = computed(() =>
      props.loadingComponent || DefaultLoadingComponent,
    )

    const ErrorComponent = computed(() =>
      props.errorComponent || DefaultErrorComponent,
    )

    const shouldShowSelector = computed(() =>
      props.showSelector && availableTemplates.value.length > 1,
    )

    /**
     * 处理模板切换
     */
    const handleTemplateSwitch = async (templateName: string) => {
      try {
        await switchTemplate(templateName)
        hasTriedFallback.value = false
        retryCount.value = 0

        // 触发回调和事件
        props.onTemplateChange?.(templateName)
        emit('template-change', templateName)
        emit('load-success', currentTemplate.value)
      }
      catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        handleLoadError(error)
      }
    }

    /**
     * 处理加载错误
     */
    const handleLoadError = async (err: Error) => {
      console.error('Template load error:', err)

      // 触发错误回调和事件
      props.onLoadError?.(err)
      emit('load-error', err)

      // 尝试备用模板
      if (props.fallbackTemplate && !hasTriedFallback.value) {
        hasTriedFallback.value = true
        try {
          await switchTemplate(props.fallbackTemplate)
          return
        }
        catch (fallbackErr) {
          console.error('Fallback template also failed:', fallbackErr)
        }
      }

      // 尝试默认模板
      if (!hasTriedFallback.value) {
        const defaultTemplate = availableTemplates.value.find(t => t.isDefault)
        if (defaultTemplate && defaultTemplate.name !== props.templateName) {
          hasTriedFallback.value = true
          try {
            await switchTemplate(defaultTemplate.name)
          }
          catch (defaultErr) {
            console.error('Default template also failed:', defaultErr)
          }
        }
      }
    }

    /**
     * 重试加载
     */
    const retryLoad = async () => {
      if (retryCount.value >= maxRetries) {
        console.warn('Max retries reached')
        return
      }

      retryCount.value++
      hasTriedFallback.value = false

      try {
        await refreshTemplates()

        if (props.templateName) {
          await handleTemplateSwitch(props.templateName)
        }
      }
      catch (err) {
        const error = err instanceof Error ? err : new Error('Retry failed')
        handleLoadError(error)
      }
    }

    /**
     * 处理模板选择
     */
    const handleTemplateSelect = async (templateName: string) => {
      try {
        // 先关闭选择器，让关闭动画正常播放
        await handleSelectorClose()

        // 然后切换模板
        await handleTemplateSwitch(templateName)
      } catch (error) {
        console.error('模板选择失败:', error)
        // 确保选择器关闭
        showSelectorModal.value = false
      }
    }

    /**
     * 处理选择器打开
     */
    const handleSelectorOpen = async () => {
      showSelectorModal.value = true
      await selectorAnimation.enter()
    }

    /**
     * 处理选择器关闭
     */
    const handleSelectorClose = async () => {
      // 立即设置关闭状态，让Vue Transition处理动画
      showSelectorModal.value = false

      // 等待动画完成（250ms离开动画时长）
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 270) // 稍微多一点时间确保动画完成
      })
    }

    /**
     * 渲染模板选择器
     */
    const renderSelector = () => {
      if (!shouldShowSelector.value)
        return null

      const transitionClasses = selectorAnimation.getTransitionClasses()
      const transitionStyles = selectorAnimation.getTransitionStyles()

      // 合并选择器配置 - 默认简化功能
      const config = {
        theme: 'default',
        position: 'top-left',
        triggerStyle: 'button',
        modalStyle: 'overlay',
        animation: 'scale',
        showSearch: false,  // 默认隐藏搜索
        showTags: false,    // 默认隐藏标签筛选
        showSort: false,    // 默认隐藏排序
        ...props.selectorConfig,
      }

      // 生成CSS类名
      const wrapperClass = [
        'template-selector-wrapper',
        `template-selector-wrapper--${config.theme}`,
        `template-selector-wrapper--${config.position}`,
        config.customClass,
      ].filter(Boolean).join(' ')

      const triggerClass = [
        'template-selector-trigger',
        `template-selector-trigger--${config.triggerStyle}`,
        `template-selector-trigger--${config.theme}`,
      ].filter(Boolean).join(' ')

      const modalClass = [
        'template-selector-modal',
        `template-selector-modal--${config.modalStyle}`,
        `template-selector-modal--${config.theme}`,
      ].filter(Boolean).join(' ')

      return (
        <div class={wrapperClass} style={config.customStyle}>
          <button
            class={triggerClass}
            onClick={handleSelectorOpen}
            style={transitionStyles}
          >
            <span class="template-selector-trigger__icon">🎨</span>
            <span class="template-selector-trigger__text">
              {currentTemplate.value?.displayName || '选择模板'}
            </span>
            <span
              class={[
                'template-selector-trigger__arrow',
                { 'template-selector-trigger__arrow--open': showSelectorModal.value },
              ]}
            >
              ▼
            </span>
          </button>

          <Transition
            name={`template-selector-modal-${config.animation}`}
            appear
          >
            {showSelectorModal.value && (
              <div
                class={modalClass}
                style={{
                  ...transitionStyles,
                  maxHeight: config.maxHeight,
                  maxWidth: config.maxWidth,
                }}
              >
                <div
                  class="template-selector-modal__backdrop"
                  onClick={handleSelectorClose}
                />
                <div class="template-selector-modal__content">
                  <TemplateSelector
                    category={props.category}
                    device={currentDevice.value}
                    currentTemplate={currentTemplate.value?.name}
                    visible={true}
                    showPreview={false}
                    showSearch={config.showSearch}
                    showTags={config.showTags}
                    showSort={config.showSort}
                    itemsPerRow={config.itemsPerRow}
                    searchable={true}
                    onSelect={handleTemplateSelect}
                    onClose={handleSelectorClose}
                  />
                </div>
              </div>
            )}
          </Transition>
        </div>
      )
    }

    /**
     * 渲染模板内容
     */
    const renderTemplate = () => {
      const templateTransitionClasses = templateSwitchAnimation.getTransitionClasses()
      const templateTransitionStyles = templateSwitchAnimation.getTransitionStyles()

      // 加载状态
      if (loading.value) {
        const loadingContent = slots.loading ? slots.loading() : <LoadingComponent.value />
        return (
          <TemplateTransition
            type="content"
            mode="out-in"
            appear={true}
          >
            <div
              key="loading"
              class="template-content-loading"
            >
              {loadingContent}
            </div>
          </TemplateTransition>
        )
      }

      // 错误状态
      if (error.value) {
        const errorContent = slots.error
          ? slots.error({ error: error.value, retry: retryLoad })
          : <ErrorComponent.value error={error.value} retry={retryLoad} />

        return (
          <TemplateTransition
            type="content"
            mode="out-in"
            appear={true}
          >
            <div
              key="error"
              class="template-content-error"
            >
              {errorContent}
            </div>
          </TemplateTransition>
        )
      }

      // 渲染模板组件
      if (currentComponent.value) {
        const TemplateComponent = currentComponent.value
        return (
          <TemplateTransition
            type="content"
            mode="out-in"
            appear={true}
          >
            <div
              key={currentTemplate.value?.name || 'template'}
              class="template-content-wrapper"
            >
              <TemplateComponent
                {...props.props}
                v-slots={slots}
              />
            </div>
          </TemplateTransition>
        )
      }

      // 无模板状态
      const emptyContent = slots.empty
        ? slots.empty()
        : (
          <div class="template-empty">
            <div class="template-empty__message">
              没有找到可用的模板
            </div>
            <button
              class="template-empty__retry"
              onClick={retryLoad}
            >
              重新加载
            </button>
          </div>
        )

      return (
        <TemplateTransition
          type="content"
          mode="out-in"
          appear={true}
        >
          <div
            key="empty"
            class="template-content-empty"
          >
            {emptyContent}
          </div>
        </TemplateTransition>
      )
    }

    // 添加防抖标志，避免重复切换
    const isSwitching = ref(false)

    // 监听模板名称变化
    watch(() => props.templateName, async (newName, oldName) => {
      if (newName && newName !== oldName && newName !== currentTemplate.value?.name && !isSwitching.value) {
        isSwitching.value = true
        try {
          await handleTemplateSwitch(newName)
        } finally {
          isSwitching.value = false
        }
      }
    })

    // 监听设备类型变化
    watch(currentDevice, async () => {
      // 设备变化时重新加载模板列表
      await refreshTemplates()
    })

    // 监听模板列表变化，当模板加载完成后尝试切换到指定模板
    watch(availableTemplates, async (templates) => {
      if (templates.length > 0 && props.templateName && !currentTemplate.value && !isSwitching.value) {
        isSwitching.value = true
        try {
          await handleTemplateSwitch(props.templateName)
        } finally {
          isSwitching.value = false
        }
      }
    }, { immediate: true })

    // 组件挂载时初始化
    onMounted(async () => {
      // 如果模板已经加载完成，直接切换
      if (availableTemplates.value.length > 0 && props.templateName) {
        await handleTemplateSwitch(props.templateName)
      }
    })

    return () => (
      <div class="template-renderer">
        {shouldShowSelector.value && renderSelector()}
        <div class="template-renderer__content template-content-transition">
          {renderTemplate()}
        </div>
      </div>
    )
  },
})

export default TemplateRenderer

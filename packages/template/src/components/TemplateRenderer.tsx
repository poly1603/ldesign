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
  isRef,
} from 'vue'
import { useDeviceDetection } from '../composables/useDeviceDetection'
import { useTemplate } from '../composables/useTemplate'
import { useTemplateSelectorAnimation } from '../composables/useTemplateAnimation'
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
    /** 是否缓存模板选择（默认: true） */
    cacheSelection: {
      type: Boolean,
      default: true,
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
    // 注意：仅当外部显式指定 device 时才传入 device，
    // 否则让 useTemplate 自行基于窗口尺寸响应式检测设备，
    // 以便在浏览器缩放时能够实时切换设备模板。
    const templateApi = useTemplate({
      category: props.category,
      ...(props.device ? { device: props.device as DeviceType } : {}),
      autoDetectDevice: props.responsive && !props.device,
      enableCache: true,
    })

    // 兼容性封装：同时支持 Ref 和 非 Ref 的返回值（用于测试环境的 mock）
    const toRefCompat = <T,>(val: any) => (isRef(val) ? val as any : ref(val as T))

    const currentTemplate = toRefCompat<import('../types/template').TemplateMetadata | null>(templateApi.currentTemplate)
    const currentComponent = toRefCompat<Component | null>(templateApi.currentComponent)
    const availableTemplates = toRefCompat<import('../types/template').TemplateMetadata[]>(templateApi.availableTemplates)
    const loading = toRefCompat<boolean>(templateApi.loading)
    const error = toRefCompat<Error | string | null>(templateApi.error)

    const switchTemplate = templateApi.switchTemplate as (name: string) => Promise<void>
    const refreshTemplates = templateApi.refreshTemplates as () => Promise<void>

    // 内部状态
    const hasTriedFallback = ref(false)
    const retryCount = ref(0)
    const maxRetries = 3
    const showSelectorModal = ref(false)

    // 动画管理
    const selectorAnimation = useTemplateSelectorAnimation()

    // 计算属性
    const LoadingComponent = computed(() =>
      props.loadingComponent || DefaultLoadingComponent,
    )


    const shouldShowSelector = computed(() =>
      props.showSelector && availableTemplates.value.length > 1,
    )


    // 选择持久化
    const SELECTION_STORAGE_KEY = 'ldesign:templateSelection'
    type SelectionMap = Record<string, Partial<Record<DeviceType, string>>>

    const saveSelection = (category: string, device: DeviceType, name: string) => {
      if (!props.cacheSelection) return
      try {
        const raw = localStorage.getItem(SELECTION_STORAGE_KEY)
        const map: SelectionMap = raw ? JSON.parse(raw) : {}
        if (!map[category]) map[category] = {}
        map[category]![device] = name
        localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(map))
      } catch { }
    }

    const loadSelection = (category: string, device: DeviceType): string | undefined => {
      try {
        const raw = localStorage.getItem(SELECTION_STORAGE_KEY)
        if (!raw) return undefined
        const map: SelectionMap = JSON.parse(raw)
        const hit = map?.[category]?.[device]
        return typeof hit === 'string' ? hit : undefined
      } catch {
        return undefined
      }
    }

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

        // 根据配置持久化本次选择
        saveSelection(props.category, currentDevice.value as DeviceType, templateName)

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
        const defaultTemplate = availableTemplates.value.find((t: import('../types/template').TemplateMetadata) => t.isDefault)
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

      // 等待动画完成（200ms离开动画时长）
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 220) // 稍微多一点时间确保动画完成
      })
    }

    /**
     * 渲染模板选择器
     */
    const renderSelector = () => {
      if (!shouldShowSelector.value)
        return null

      const transitionStyles = selectorAnimation.getTransitionStyles()

      // 合并选择器配置 - 默认简化功能
      const config: import('../types/template').TemplateSelectorConfig = {
        theme: 'default',
        position: 'top-left',
        triggerStyle: 'button',
        modalStyle: 'overlay',
        animation: 'scale',
        showSearch: false,  // 默认隐藏搜索
        showTags: false,    // 默认隐藏标签筛选
        showSort: false,    // 默认隐藏排序
        ...(props.selectorConfig as any),
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
                    showSearch={!!config.showSearch}
                    showTags={!!config.showTags}
                    showSort={!!config.showSort}
                    itemsPerRow={config.itemsPerRow ?? 3}
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

      // 加载状态
      if (loading.value) {
        const LoadingComp = LoadingComponent.value as any
        const loadingContent = slots.loading ? slots.loading() : <LoadingComp />
        return (
          <TemplateTransition
            type="content"
            mode="out-in"
            appear={true}
          >
            <div
              key="loading"
              class="template-loading"
            >
              {/* 兼容测试文案 */}
              <div class="template-loading__text">加载中</div>
              {loadingContent}
            </div>
          </TemplateTransition>
        )
      }

      // 错误状态
      if (error.value) {
        const errorContent = slots.error
          ? slots.error({ error: error.value, retry: retryLoad })
          : (
            <div class="template-error">
              <div class="template-error__message">{String(error.value)}</div>
              <button class="retry-button" onClick={() => retryLoad()}>重试</button>
            </div>
          )

        return (
          <TemplateTransition
            type="content"
            mode="out-in"
            appear={true}
          >
            <div
              key="error"
              class="template-error"
            >
              {errorContent}
            </div>
          </TemplateTransition>
        )
      }

      // 渲染模板组件
      if (currentComponent.value) {
        const TemplateComponent = currentComponent.value as any
        return (
          <TemplateTransition
            type="content"
            mode="out-in"
            appear={true}
          >
            <div
              key={currentTemplate.value?.name || 'template'}
              class="template-content"
            >
              <TemplateComponent
                {...props.props}
                v-slots={{
                  ...slots,
                  selector: () => (shouldShowSelector.value ? renderSelector() : null),
                }}
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
      // 设备变化时刷新对应设备下的模板列表
      await refreshTemplates()

      // 1) 优先读取并应用该设备的上次选择
      const preferName = props.templateName ?? loadSelection(props.category, currentDevice.value as DeviceType)
      if (preferName && !isSwitching.value) {
        const hasPrefer = availableTemplates.value.some((t: import('../types/template').TemplateMetadata) => t.name === preferName || t.id === preferName)
        if (hasPrefer && preferName !== currentTemplate.value?.name) {
          isSwitching.value = true
          try {
            await handleTemplateSwitch(preferName)
          } finally {
            isSwitching.value = false
          }
          return
        }
      }

      // 2) 若无上次选择或不可用，再尝试“同名模板跨设备沿用”
      const currentName = currentTemplate.value?.name
      if (currentName && currentTemplate.value?.device !== (currentDevice.value as DeviceType)) {
        const existsInNewDevice = availableTemplates.value.some((t: import('../types/template').TemplateMetadata) => t.name === currentName)
        if (existsInNewDevice && !isSwitching.value) {
          isSwitching.value = true
          try {
            await handleTemplateSwitch(currentName)
          } finally {
            isSwitching.value = false
          }
          return
        }
      }

      // 3) 其余情况交由内部默认逻辑处理（useTemplate 会兜底到默认模板）
    })

    // 监听模板列表变化，当模板加载完成后尝试切换到指定模板（或持久化的上次选择）
    watch(availableTemplates, async (templates) => {
      if (templates.length > 0 && !currentTemplate.value && !isSwitching.value) {
        const preferName = props.templateName ?? loadSelection(props.category, currentDevice.value as DeviceType)
        if (preferName && templates.some((t: import('../types/template').TemplateMetadata) => t.name === preferName || t.id === preferName)) {
          isSwitching.value = true
          try {
            await handleTemplateSwitch(preferName)
          } finally {
            isSwitching.value = false
          }
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
        <div class="template-renderer__content template-content-transition">
          {renderTemplate()}
        </div>
      </div>
    )
  },
})

export default TemplateRenderer

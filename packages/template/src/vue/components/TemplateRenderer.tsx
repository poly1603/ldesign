/**
 * 模板渲染器组件
 * 支持根据分类和设备类型渲染对应模板，内置模板选择器功能
 */

import { defineComponent, ref, computed, watch, onMounted, PropType, VNode } from 'vue'
import TemplateSelector from './TemplateSelector'
import { useTemplateManager } from '../composables/useTemplate'
import type { TemplateInfo, DeviceType, TemplateRendererProps, TemplateSelectorOptions } from '../../types'
import './TemplateRenderer.less'

export default defineComponent({
  name: 'TemplateRenderer',
  props: {
    /** 模板分类 */
    category: {
      type: String,
      required: true,
    },
    /** 设备类型（可选，自动检测） */
    deviceType: {
      type: String as PropType<DeviceType>,
      default: undefined,
    },
    /** 指定模板名称（可选） */
    template: {
      type: String,
      default: undefined,
    },
    /** 传递给模板的属性 */
    props: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /** 是否显示内置选择器 */
    showSelector: {
      type: Boolean,
      default: true,
    },
    /** 选择器配置 */
    selectorOptions: {
      type: Object as PropType<TemplateSelectorOptions>,
      default: () => ({}),
    },
    /** 加载状态 */
    loading: {
      type: Boolean,
      default: false,
    },
    /** 是否显示选择器按钮 */
    showSelectorButton: {
      type: Boolean,
      default: true,
    },
    /** 选择器按钮位置 */
    selectorButtonPosition: {
      type: String as PropType<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>,
      default: 'top-right',
    },
  },
  emits: ['error', 'template-change', 'template-loaded'],
  setup(props, { emit, slots }) {
    // 使用模板管理器
    const {
      currentTemplate,
      currentDevice,
      loading: templateLoading,
      error,
      availableTemplates,
      render,
      switchTemplate,
      getTemplates,
    } = useTemplateManager()

    // 响应式数据
    const isSelectorVisible = ref(false)
    const renderedComponent = ref<VNode | null>(null)
    const isRendering = ref(false)

    // 计算属性
    const targetDevice = computed(() => props.deviceType || currentDevice.value)

    const categoryTemplates = computed(() =>
      getTemplates(props.category, targetDevice.value)
    )

    const currentTemplateInfo = computed(() =>
      categoryTemplates.value.find(t => t.name === props.template) ||
      categoryTemplates.value.find(t => t.isDefault) ||
      categoryTemplates.value[0] ||
      null
    )

    const isLoading = computed(() =>
      props.loading || templateLoading.value || isRendering.value
    )

    const selectorButtonClass = computed(() => [
      'template-renderer__selector-btn',
      `template-renderer__selector-btn--${props.selectorButtonPosition}`
    ])

    // 方法
    const handleError = (err: Error) => {
      console.error('Template rendering error:', err)
      emit('error', err)
    }

    const handleTemplateChange = (template: TemplateInfo) => {
      emit('template-change', template)
    }

    const handleTemplateLoaded = (template: TemplateInfo) => {
      emit('template-loaded', template)
    }

    const showSelector = () => {
      isSelectorVisible.value = true
    }

    const hideSelector = () => {
      isSelectorVisible.value = false
    }

    const handleTemplateSelect = async (template: TemplateInfo) => {
      try {
        isRendering.value = true
        const result = await switchTemplate(props.category, template.name, targetDevice.value)
        renderedComponent.value = result.vnode || null
        handleTemplateChange(template)
        handleTemplateLoaded(template)
      } catch (err) {
        handleError(err as Error)
      } finally {
        isRendering.value = false
      }
    }

    const renderTemplate = async () => {
      if (!currentTemplateInfo.value) {
        console.warn(`No template found for category: ${props.category}, device: ${targetDevice.value}`)
        return
      }

      try {
        isRendering.value = true
        const result = await render(
          props.category,
          targetDevice.value,
          props.template,
          props.props
        )

        renderedComponent.value = result.vnode || null
        handleTemplateLoaded(result.template)
      } catch (err) {
        handleError(err as Error)
      } finally {
        isRendering.value = false
      }
    }

    // 监听器
    watch([() => props.category, () => props.template, targetDevice], () => {
      renderTemplate()
    }, { immediate: true })

    watch(() => props.props, () => {
      renderTemplate()
    }, { deep: true })

    // 生命周期
    onMounted(() => {
      renderTemplate()
    })

    // 渲染函数
    const renderLoadingState = () => (
      <div class="template-renderer__loading">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载模板中...</p>
      </div>
    )

    const renderErrorState = () => (
      <div class="template-renderer__error">
        <div class="error-icon">⚠️</div>
        <p class="error-message">模板加载失败</p>
        <p class="error-detail">{error.value?.message}</p>
        <button class="error-retry" onClick={renderTemplate}>
          重试
        </button>
      </div>
    )

    const renderEmptyState = () => (
      <div class="template-renderer__empty">
        <div class="empty-icon">📭</div>
        <p class="empty-message">暂无可用模板</p>
        <p class="empty-detail">
          分类: {props.category}, 设备: {targetDevice.value}
        </p>
      </div>
    )

    const renderSelectorButton = () => {
      if (!props.showSelectorButton || !props.showSelector || categoryTemplates.value.length <= 1) {
        return null
      }

      return (
        <button
          class={selectorButtonClass.value}
          onClick={showSelector}
          title="选择模板"
        >
          <span class="selector-btn-icon">🎨</span>
          <span class="selector-btn-text">选择模板</span>
        </button>
      )
    }

    const renderTemplateContent = () => {
      if (isLoading.value) {
        return slots.loading?.() || renderLoadingState()
      }

      if (error.value) {
        return slots.error?.({ error: error.value, retry: renderTemplate }) || renderErrorState()
      }

      if (!currentTemplateInfo.value) {
        return slots.empty?.() || renderEmptyState()
      }

      if (renderedComponent.value) {
        return renderedComponent.value
      }

      // 如果没有渲染的组件，显示占位符
      return (
        <div class="template-renderer__placeholder">
          <p>模板准备中...</p>
        </div>
      )
    }

    return () => (
      <div class="template-renderer">
        {/* 模板内容 */}
        <div class="template-renderer__content">
          {renderTemplateContent()}
        </div>

        {/* 选择器按钮 */}
        {renderSelectorButton()}

        {/* 模板选择器 */}
        {props.showSelector && (
          <TemplateSelector
            visible={isSelectorVisible.value}
            category={props.category}
            deviceType={targetDevice.value}
            currentTemplate={currentTemplateInfo.value?.name}
            templates={availableTemplates.value}
            options={props.selectorOptions}
            onUpdate:visible={hideSelector}
            onSelect={handleTemplateSelect}
            onClose={hideSelector}
          />
        )}

        {/* 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div class="template-renderer__debug">
            <details>
              <summary>调试信息</summary>
              <pre>{JSON.stringify({
                category: props.category,
                deviceType: targetDevice.value,
                template: props.template,
                currentTemplate: currentTemplateInfo.value?.name,
                availableTemplates: categoryTemplates.value.length,
                loading: isLoading.value,
                error: error.value?.message,
              }, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    )
  },
})

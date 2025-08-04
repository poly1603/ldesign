import type { DeviceType } from '../composables/useTemplateSystem'
import { defineComponent, watch } from 'vue'
import { useTemplate } from '../composables/useTemplateSystem'

export interface TemplateRendererProps {
  category: string
  templateId?: string
  deviceType?: DeviceType
  showSelector?: boolean
  selectorPosition?: 'top' | 'bottom' | 'left' | 'right'
  autoDetectDevice?: boolean
  config?: Record<string, any>
}

/**
 * 模板渲染组件
 *
 * @example
 * ```vue
 * <template>
 *   <TemplateRenderer
 *     category="login"
 *     :show-selector="true"
 *     @login="handleLogin"
 *   />
 * </template>
 * ```
 */
export const TemplateRenderer = defineComponent({
  name: 'TemplateRenderer',
  props: {
    category: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
      default: undefined,
    },
    deviceType: {
      type: String,
      default: undefined,
    },
    showSelector: {
      type: Boolean,
      default: false,
    },
    selectorPosition: {
      type: String,
      default: 'top',
    },
    autoDetectDevice: {
      type: Boolean,
      default: true,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['template-change', 'device-change', 'render-error'],
  setup(props, { emit, attrs }) {
    const {
      currentTemplate,
      currentTemplateId,
      availableTemplates,
      deviceType,
      switchTemplate,
      switchDevice,
      TemplateComponent,
      templateConfig,
    } = useTemplate({
      category: props.category,
      deviceType: props.deviceType as DeviceType,
      defaultTemplate: props.templateId,
      autoSwitch: props.autoDetectDevice,
    })

    // 监听模板变化
    watch(currentTemplateId, (newTemplateId) => {
      emit('template-change', newTemplateId)
    })

    // 监听设备变化
    watch(deviceType, (newDevice) => {
      emit('device-change', newDevice)
    })

    // 渲染模板选择器
    const renderSelector = () => {
      if (!props.showSelector)
        return null

      return (
        <div class="template-renderer__selector">
          <div class="template-renderer__selector-group">
            <label class="template-renderer__label">模板:</label>
            <select
              class="template-renderer__select"
              value={currentTemplateId.value}
              onChange={(e: Event) => {
                const target = e.target as HTMLSelectElement
                switchTemplate(target.value)
              }}
            >
              {availableTemplates.value.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div class="template-renderer__selector-group">
            <label class="template-renderer__label">设备:</label>
            <select
              class="template-renderer__select"
              value={deviceType.value}
              onChange={(e: Event) => {
                const target = e.target as HTMLSelectElement
                switchDevice(target.value as DeviceType)
              }}
            >
              <option value="desktop">桌面</option>
              <option value="tablet">平板</option>
              <option value="mobile">手机</option>
            </select>
          </div>
        </div>
      )
    }

    // 渲染模板内容
    const renderContent = () => {
      try {
        if (!TemplateComponent.value) {
          return <div class="template-renderer__error">未找到模板</div>
        }

        // 合并配置
        const finalConfig = {
          ...templateConfig.value,
          ...props.config,
        }

        const Component = TemplateComponent.value
        if (!Component) {
          return (
            <div class="template-renderer__empty">
              模板组件未找到
            </div>
          )
        }

        return (
          <Component
            {...finalConfig}
            {...attrs}
          />
        )
      }
      catch (error) {
        emit('render-error', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        return (
          <div class="template-renderer__error">
            模板渲染失败: {errorMessage}
          </div>
        )
      }
    }

    return () => {
      const selector = renderSelector()
      const content = renderContent()

      const className = [
        'template-renderer',
        props.selectorPosition === 'left' || props.selectorPosition === 'right'
          ? 'template-renderer--horizontal'
          : 'template-renderer--vertical',
      ].join(' ')

      if (props.selectorPosition === 'top') {
        return (
          <div class={className}>
            {selector}
            <div class="template-renderer__content">
              {content}
            </div>
          </div>
        )
      }
      else if (props.selectorPosition === 'bottom') {
        return (
          <div class={className}>
            <div class="template-renderer__content">
              {content}
            </div>
            {selector}
          </div>
        )
      }
      else if (props.selectorPosition === 'left') {
        return (
          <div class={className}>
            {selector}
            <div class="template-renderer__content">
              {content}
            </div>
          </div>
        )
      }
      else {
        return (
          <div class={className}>
            <div class="template-renderer__content">
              {content}
            </div>
            {selector}
          </div>
        )
      }
    }
  },
})

export default TemplateRenderer

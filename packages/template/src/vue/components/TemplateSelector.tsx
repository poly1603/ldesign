import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { getCachedTemplate, setCachedTemplate } from '../../core/cache'
import { getDeviceInfo, watchDeviceChange } from '../../core/device'
import { getDefaultTemplate, getTemplatesByDevice } from '../../core/TemplateManager'
import './TemplateSelector.less'

// 定义外部模板类型
interface ExternalTemplate {
  id: string
  name: string
  description?: string
}

// 统一的模板类型
interface UnifiedTemplate {
  id: string
  name: string
  description?: string
  variant: string
  config?: {
    description?: string
    tags?: string[]
    preview?: string | { thumbnail?: string; description?: string }
  }
  isDefault?: boolean
}

export interface TemplateSelectorProps {
  category: string
  value?: string
  deviceType?: string
  availableTemplates?: ExternalTemplate[]
  showDeviceInfo?: boolean
  showPreview?: boolean
  disabled?: boolean
  mode?: 'dropdown' | 'grid' | 'buttons'
  size?: 'small' | 'medium' | 'large'
  onTemplateChange?: (templateId: string) => void
  onDeviceChange?: (deviceType: string) => void
}

export default defineComponent({
  name: 'TemplateSelector',
  props: {
    category: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    deviceType: {
      type: String,
      default: '',
    },
    availableTemplates: {
      type: Array as () => ExternalTemplate[],
      default: () => [],
    },
    showDeviceInfo: {
      type: Boolean,
      default: true,
    },
    showPreview: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String as () => 'dropdown' | 'grid' | 'buttons',
      default: 'dropdown',
    },
    size: {
      type: String as () => 'small' | 'medium' | 'large',
      default: 'medium',
    },
    onTemplateChange: {
      type: Function,
      default: null,
    },
    onDeviceChange: {
      type: Function,
      default: null,
    },
  },
  emits: ['update:value', 'change', 'deviceChange', 'template-change'],
  setup(props, { emit }) {
    const deviceInfo = ref(getDeviceInfo())
    const selectedTemplate = ref<string>(props.value)
    const isOpen = ref(false)
    const unwatchDevice = ref<(() => void) | null>(null)

    // 获取可用模板列表（优先使用外部传入的，否则从系统获取）
    const availableTemplates = computed((): UnifiedTemplate[] => {
      if (props.availableTemplates && props.availableTemplates.length > 0) {
        return props.availableTemplates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          variant: t.id,
          config: {
            description: t.description || '',
            tags: [],
            preview: undefined,
          },
          isDefault: false,
        }))
      }
      // 系统模板已经是正确的格式，但需要确保类型兼容
      const systemTemplates = getTemplatesByDevice(props.category, deviceInfo.value.type)
      return systemTemplates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.config?.description || '',
        variant: t.variant || t.id,
        config: t.config,
        isDefault: t.isDefault,
      }))
    })

    // 获取当前选中的模板信息
    const currentTemplate = computed((): UnifiedTemplate | null => {
      return (
        availableTemplates.value.find(t => {
          const templateId = t.variant || t.id
          return templateId === selectedTemplate.value
        }) || null
      )
    })

    // 获取默认模板
    const getDefaultVariant = () => {
      // 1. 优先从缓存获取用户上次选择
      const cached = getCachedTemplate(props.category, deviceInfo.value.type)
      if (cached && availableTemplates.value.some(t => t.variant === cached)) {
        return cached
      }

      // 2. 获取设备类型的默认模板
      const defaultTemplate = getDefaultTemplate(props.category, deviceInfo.value.type)
      if (defaultTemplate) {
        return defaultTemplate.variant
      }

      // 3. 返回第一个可用模板
      return availableTemplates.value[0]?.variant || ''
    }

    // 切换模板
    const selectTemplate = (variant: string) => {
      if (props.disabled) return

      selectedTemplate.value = variant
      isOpen.value = false

      // 缓存用户选择
      setCachedTemplate(props.category, deviceInfo.value.type, variant)

      // 触发事件
      emit('update:value', variant)
      emit('change', {
        variant,
        template: currentTemplate.value,
        device: deviceInfo.value.type,
      })
      emit('template-change', variant)

      // 调用外部回调
      if (props.onTemplateChange) {
        props.onTemplateChange(variant)
      }
    }

    // 处理设备变化
    const handleDeviceChange = (newDeviceInfo: typeof deviceInfo.value) => {
      const oldDevice = deviceInfo.value.type
      deviceInfo.value = newDeviceInfo

      if (oldDevice !== newDeviceInfo.type) {
        // 设备类型改变，自动切换到对应设备的默认模板
        const newVariant = getDefaultVariant()
        if (newVariant && newVariant !== selectedTemplate.value) {
          selectTemplate(newVariant)
        }

        emit('deviceChange', {
          oldDevice,
          newDevice: newDeviceInfo.type,
          deviceInfo: newDeviceInfo,
        })
      }
    }

    // 切换下拉菜单
    const toggleDropdown = () => {
      if (props.disabled) return
      isOpen.value = !isOpen.value
    }

    // 关闭下拉菜单
    const closeDropdown = () => {
      isOpen.value = false
    }

    // 监听外部点击
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.template-selector')) {
        closeDropdown()
      }
    }

    // 监听props.value变化
    watch(
      () => props.value,
      newValue => {
        if (newValue !== selectedTemplate.value) {
          selectedTemplate.value = newValue || getDefaultVariant()
        }
      }
    )

    onMounted(() => {
      // 初始化选中的模板
      if (!selectedTemplate.value) {
        selectedTemplate.value = getDefaultVariant()
        emit('update:value', selectedTemplate.value)
      }

      // 监听设备变化
      unwatchDevice.value = watchDeviceChange(handleDeviceChange)

      // 监听外部点击
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      // 清理监听器
      if (unwatchDevice.value) {
        unwatchDevice.value()
      }
      document.removeEventListener('click', handleClickOutside)
    })

    // 渲染按钮模式
    const renderButtonsMode = () => (
      <div class="template-selector__buttons">
        {availableTemplates.value.map(template => {
          const templateId = template.variant || template.id
          return (
            <button
              key={templateId}
              type="button"
              class={[
                'template-selector__button',
                { 'template-selector__button--active': templateId === selectedTemplate.value },
              ]}
              onClick={() => selectTemplate(templateId)}
              disabled={props.disabled}
            >
              <span class="template-selector__button-name">{template.name}</span>
              {template.description && <span class="template-selector__button-desc">{template.description}</span>}
            </button>
          )
        })}
      </div>
    )

    // 渲染网格模式
    const renderGridMode = () => (
      <div class="template-selector__grid">
        {availableTemplates.value.map(template => {
          const templateId = template.variant || template.id
          return (
            <div
              key={templateId}
              class={[
                'template-selector__grid-item',
                { 'template-selector__grid-item--active': templateId === selectedTemplate.value },
              ]}
              onClick={() => selectTemplate(templateId)}
            >
              <div class="template-selector__grid-content">
                <h4 class="template-selector__grid-name">{template.name}</h4>
                {template.description && <p class="template-selector__grid-desc">{template.description}</p>}
              </div>
            </div>
          )
        })}
      </div>
    )

    return () => (
      <div
        class={[
          'template-selector',
          `template-selector--${props.mode}`,
          `template-selector--${props.size}`,
          {
            'template-selector--open': isOpen.value,
            'template-selector--disabled': props.disabled,
          },
        ]}
      >
        {props.showDeviceInfo && (
          <div class="template-selector__device-info">
            <span class="template-selector__device-type">
              {deviceInfo.value.type === 'desktop' && '🖥️ 桌面端'}
              {deviceInfo.value.type === 'tablet' && '📱 平板端'}
              {deviceInfo.value.type === 'mobile' && '📱 移动端'}
            </span>
            <span class="template-selector__device-size">
              {deviceInfo.value.width} ×{deviceInfo.value.height}
            </span>
          </div>
        )}

        {/* 根据模式渲染不同的界面 */}
        {props.mode === 'buttons' && renderButtonsMode()}
        {props.mode === 'grid' && renderGridMode()}
        {props.mode === 'dropdown' && (
          <div class="template-selector__dropdown">
            <button type="button" class="template-selector__trigger" onClick={toggleDropdown} disabled={props.disabled}>
              <div class="template-selector__current">
                <span class="template-selector__current-name">{currentTemplate.value?.name || '选择模板'}</span>
                {currentTemplate.value?.isDefault && <span class="template-selector__default-badge">默认</span>}
              </div>
              <svg class="template-selector__arrow" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>

            {isOpen.value && (
              <div class="template-selector__menu">
                {availableTemplates.value.map(template => {
                  const templateId = template.variant || template.id
                  return (
                    <button
                      key={templateId}
                      type="button"
                      class={[
                        'template-selector__option',
                        { 'template-selector__option--selected': templateId === selectedTemplate.value },
                      ]}
                      onClick={() => selectTemplate(templateId)}
                    >
                      <div class="template-selector__option-content">
                        <div class="template-selector__option-header">
                          <span class="template-selector__option-name">{template.name}</span>
                          {template.isDefault && <span class="template-selector__default-badge">默认</span>}
                        </div>
                        <p class="template-selector__option-description">
                          {template.description || template.config?.description}
                        </p>
                        {template.config?.tags && (
                          <div class="template-selector__option-tags">
                            {template.config.tags.map((tag: string) => (
                              <span key={tag} class="template-selector__tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {props.showPreview && template.config?.preview && (
                        <div class="template-selector__option-preview">
                          <img
                            src={
                              typeof template.config.preview === 'string'
                                ? template.config.preview
                                : template.config.preview.thumbnail
                            }
                            alt={template.name}
                          />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {availableTemplates.value.length === 0 && (
          <div class="template-selector__empty">
            <span>当前设备类型暂无可用模板</span>
          </div>
        )}
      </div>
    )
  },
})

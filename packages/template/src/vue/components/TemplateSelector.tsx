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
  // 显示模式：modal（模态对话框）、dropdown（下拉）、grid（网格）、buttons（按钮）
  mode?: 'modal' | 'dropdown' | 'grid' | 'buttons'
  size?: 'small' | 'medium' | 'large'
  // 触发按钮配置
  buttonText?: string
  buttonIcon?: string
  showCurrentTemplate?: boolean
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
      type: String as () => 'modal' | 'dropdown' | 'grid' | 'buttons',
      default: 'modal',
    },
    size: {
      type: String as () => 'small' | 'medium' | 'large',
      default: 'medium',
    },
    buttonText: {
      type: String,
      default: '选择模板',
    },
    buttonIcon: {
      type: String,
      default: '',
    },
    showCurrentTemplate: {
      type: Boolean,
      default: true,
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
    const isClosing = ref(false)
    const unwatchDevice = ref<(() => void) | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const popupRef = ref<HTMLElement | null>(null)
    const modalRef = ref<HTMLElement | null>(null)
    const previousActiveElement = ref<HTMLElement | null>(null)

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

    // 打开模态对话框
    const openModal = () => {
      if (props.disabled) return

      // 保存当前焦点元素
      previousActiveElement.value = document.activeElement as HTMLElement

      isOpen.value = true
      isClosing.value = false

      // 下一帧设置焦点到模态对话框
      requestAnimationFrame(() => {
        if (modalRef.value) {
          modalRef.value.focus()
        }
      })
    }

    // 关闭模态对话框
    const closeModal = () => {
      if (!isOpen.value) return

      isClosing.value = true

      // 等待动画完成后关闭
      setTimeout(() => {
        isOpen.value = false
        isClosing.value = false

        // 恢复焦点到触发元素
        if (previousActiveElement.value) {
          previousActiveElement.value.focus()
          previousActiveElement.value = null
        }
      }, 200) // 与 CSS 动画时间匹配
    }

    // 切换下拉菜单（兼容旧版本）
    const toggleDropdown = () => {
      if (props.disabled) return

      if (props.mode === 'modal') {
        if (isOpen.value) {
          closeModal()
        } else {
          openModal()
        }
      } else {
        isOpen.value = !isOpen.value
      }
    }

    // 关闭下拉菜单（兼容旧版本）
    const closeDropdown = () => {
      if (props.mode === 'modal') {
        closeModal()
      } else {
        isOpen.value = false
      }
    }

    // 监听外部点击
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.template-selector')) {
        closeDropdown()
      }
    }

    // 监听键盘事件
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen.value) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          closeDropdown()
          break
        case 'Tab':
          // 在模态对话框内循环 Tab 导航
          if (props.mode === 'modal' && modalRef.value) {
            const focusableElements = modalRef.value.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

            if (event.shiftKey) {
              // Shift + Tab
              if (document.activeElement === firstElement) {
                event.preventDefault()
                lastElement?.focus()
              }
            } else {
              // Tab
              if (document.activeElement === lastElement) {
                event.preventDefault()
                firstElement?.focus()
              }
            }
          }
          break
        case 'Enter':
        case ' ':
          // 如果焦点在模板项上，选择该模板
          const target = event.target as HTMLElement
          if (target.classList.contains('template-selector__template-item')) {
            event.preventDefault()
            const templateId = target.getAttribute('data-template-id')
            if (templateId) {
              selectTemplate(templateId)
              closeDropdown()
            }
          }
          break
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

      // 监听外部点击和键盘事件
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      // 清理监听器
      if (unwatchDevice.value) {
        unwatchDevice.value()
      }
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    })

    // 渲染触发按钮
    const renderTriggerButton = () => {
      const currentTemplate = availableTemplates.value.find(t => (t.variant || t.id) === selectedTemplate.value)

      return (
        <button
          ref={triggerRef}
          type="button"
          class={[
            'template-selector__trigger',
            `template-selector__trigger--${props.size}`,
            { 'template-selector__trigger--disabled': props.disabled },
          ]}
          onClick={toggleDropdown}
          onKeydown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleDropdown()
            }
          }}
          disabled={props.disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen.value}
          aria-label={`${props.buttonText}${currentTemplate ? ` - 当前选择: ${currentTemplate.name}` : ''}`}
        >
          {props.buttonIcon && <i class={['template-selector__trigger-icon', props.buttonIcon]}></i>}
          <span class="template-selector__trigger-text">
            {props.showCurrentTemplate && currentTemplate ? currentTemplate.name : props.buttonText}
          </span>
          <svg
            class={['template-selector__trigger-arrow', { 'template-selector__trigger-arrow--open': isOpen.value }]}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      )
    }

    // 渲染模态对话框
    const renderModalMode = () => (
      <>
        {renderTriggerButton()}
        {isOpen.value && (
          <div
            class={[
              'template-selector__modal-overlay',
              { 'template-selector__modal-overlay--closing': isClosing.value },
            ]}
            onClick={closeDropdown}
          >
            <div
              ref={modalRef}
              class={[
                'template-selector__modal',
                `template-selector__modal--${props.size}`,
                { 'template-selector__modal--closing': isClosing.value },
              ]}
              onClick={e => e.stopPropagation()}
              tabindex="-1"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <div class="template-selector__modal-header">
                <h3 id="modal-title" class="template-selector__modal-title">
                  选择模板
                </h3>
                {props.showDeviceInfo && (
                  <div class="template-selector__device-badge">
                    <span class="template-selector__device-icon">
                      {deviceInfo.value.type === 'desktop' && '🖥️'}
                      {deviceInfo.value.type === 'tablet' && '📱'}
                      {deviceInfo.value.type === 'mobile' && '📱'}
                    </span>
                    <span class="template-selector__device-text">
                      {deviceInfo.value.type === 'desktop' && '桌面端'}
                      {deviceInfo.value.type === 'tablet' && '平板端'}
                      {deviceInfo.value.type === 'mobile' && '移动端'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  class="template-selector__modal-close"
                  onClick={closeDropdown}
                  aria-label="关闭对话框"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div class="template-selector__modal-body">
                <p id="modal-description" class="template-selector__modal-description">
                  请选择一个适合您项目的模板。您可以使用键盘导航或点击选择。
                </p>
                <div class="template-selector__template-grid">
                  {availableTemplates.value.map(template => {
                    const templateId = template.variant || template.id
                    const isSelected = templateId === selectedTemplate.value

                    return (
                      <button
                        key={templateId}
                        type="button"
                        class={[
                          'template-selector__template-item',
                          { 'template-selector__template-item--selected': isSelected },
                        ]}
                        onClick={() => {
                          selectTemplate(templateId)
                          closeDropdown()
                        }}
                        onKeydown={(e: KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            selectTemplate(templateId)
                            closeDropdown()
                          }
                        }}
                        data-template-id={templateId}
                        aria-selected={isSelected}
                        aria-label={`选择模板: ${template.name}${
                          template.description ? ` - ${template.description}` : ''
                        }`}
                      >
                        <div class="template-selector__template-content">
                          <h4 class="template-selector__template-name">{template.name}</h4>
                          {template.description && (
                            <p class="template-selector__template-description">{template.description}</p>
                          )}
                          {template.config?.tags && (
                            <div class="template-selector__template-tags">
                              {template.config.tags.map((tag: string) => (
                                <span key={tag} class="template-selector__template-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div class="template-selector__template-check">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path
                                d="M20 6L9 17l-5-5"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )

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
        {props.mode === 'modal' && renderModalMode()}
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

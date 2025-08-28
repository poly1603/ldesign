import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { DeviceType } from '../../types'
import './TemplateSelector.less'

export interface TemplateOption {
  name: string
  displayName?: string
  description?: string
  version?: string
  tags?: string[]
  thumbnail?: string
}

interface SelectorConfig {
  position?: 'top' | 'bottom' | 'overlay'
  style?: 'tabs' | 'dropdown' | 'grid'
  showThumbnail?: boolean
  showDescription?: boolean
  layout?: 'slot' | 'header'
}

interface Props {
  category: string
  deviceType: DeviceType
  currentTemplate: string
  templates: TemplateOption[]
  config?: SelectorConfig
}

interface Emits {
  (e: 'template-select', templateName: string): void
  (e: 'selector-open'): void
  (e: 'selector-close'): void
}

export default defineComponent({
  name: 'TemplateSelector',
  props: {
    category: {
      type: String,
      required: true
    },
    deviceType: {
      type: String as () => DeviceType,
      required: true
    },
    currentTemplate: {
      type: String,
      required: true
    },
    templates: {
      type: Array as () => TemplateOption[],
      default: () => []
    },
    config: {
      type: Object as () => SelectorConfig,
      default: () => ({
        position: 'top',
        style: 'tabs',
        showThumbnail: true,
        showDescription: true,
        layout: 'header'
      })
    }
  },
  emits: ['template-select', 'selector-open', 'selector-close'],
  setup(props: Props, { emit }) {
    const isOpen = ref(false)
    const dropdownRef = ref<HTMLElement>()
    const selectedIndex = ref(0)

    // 计算属性
    const selectorClasses = computed(() => ({
      'template-selector': true,
      [`template-selector--${props.config?.style || 'tabs'}`]: true,
      [`template-selector--${props.config?.position || 'top'}`]: true,
      'template-selector--open': isOpen.value,
      'template-selector--with-thumbnails': props.config?.showThumbnail,
      'template-selector--with-descriptions': props.config?.showDescription,
    }))

    const currentTemplateOption = computed(() => {
      return props.templates.find(t => t.name === props.currentTemplate)
    })

    // 方法
    const selectTemplate = (template: TemplateOption) => {
      if (template.name !== props.currentTemplate) {
        emit('template-select', template.name)
      }
      closeSelector()
    }

    const openSelector = () => {
      isOpen.value = true
      emit('selector-open')
    }

    const closeSelector = () => {
      isOpen.value = false
      emit('selector-close')
    }

    const toggleSelector = () => {
      if (isOpen.value) {
        closeSelector()
      } else {
        openSelector()
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (!isOpen.value) return

      switch (event.key) {
        case 'Escape':
          closeSelector()
          break
        case 'ArrowUp':
          event.preventDefault()
          selectedIndex.value = Math.max(0, selectedIndex.value - 1)
          break
        case 'ArrowDown':
          event.preventDefault()
          selectedIndex.value = Math.min(props.templates.length - 1, selectedIndex.value + 1)
          break
        case 'Enter':
          event.preventDefault()
          if (props.templates[selectedIndex.value]) {
            selectTemplate(props.templates[selectedIndex.value])
          }
          break
      }
    }

    const handleClickOutside = (event: Event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        closeSelector()
      }
    }

    // 监听器
    watch(() => props.currentTemplate, (newTemplate) => {
      const index = props.templates.findIndex(t => t.name === newTemplate)
      if (index !== -1) {
        selectedIndex.value = index
      }
    })

    // 生命周期
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('click', handleClickOutside)
      
      // 设置初始选中索引
      const index = props.templates.findIndex(t => t.name === props.currentTemplate)
      if (index !== -1) {
        selectedIndex.value = index
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      isOpen,
      dropdownRef,
      selectedIndex,
      selectorClasses,
      currentTemplateOption,
      selectTemplate,
      openSelector,
      closeSelector,
      toggleSelector
    }
  },
  render() {
    const { config, templates } = this.$props

    // 标签页样式
    if (config?.style === 'tabs') {
      return (
        <div class={this.selectorClasses}>
          <div class="template-tabs">
            {templates.map((template, index) => (
              <button
                key={template.name}
                class={[
                  'template-tab',
                  { 
                    'template-tab--active': template.name === this.$props.currentTemplate,
                    'template-tab--selected': index === this.selectedIndex
                  }
                ]}
                onClick={() => this.selectTemplate(template)}
              >
                {config?.showThumbnail && template.thumbnail && (
                  <img 
                    src={template.thumbnail} 
                    alt={template.displayName || template.name}
                    class="template-thumbnail"
                  />
                )}
                <div class="template-info">
                  <span class="template-name">
                    {template.displayName || template.name}
                  </span>
                  {config?.showDescription && template.description && (
                    <span class="template-description">
                      {template.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }

    // 下拉选择样式
    if (config?.style === 'dropdown') {
      return (
        <div class={this.selectorClasses} ref="dropdownRef">
          <button 
            class="template-dropdown-trigger"
            onClick={this.toggleSelector}
          >
            <div class="current-template">
              {config?.showThumbnail && this.currentTemplateOption?.thumbnail && (
                <img 
                  src={this.currentTemplateOption.thumbnail} 
                  alt={this.currentTemplateOption.displayName || this.currentTemplateOption.name}
                  class="template-thumbnail"
                />
              )}
              <span class="template-name">
                {this.currentTemplateOption?.displayName || this.currentTemplateOption?.name || '选择模板'}
              </span>
            </div>
            <svg class="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {this.isOpen && (
            <div class="template-dropdown-menu">
              {templates.map((template, index) => (
                <button
                  key={template.name}
                  class={[
                    'template-dropdown-item',
                    { 
                      'template-dropdown-item--active': template.name === this.$props.currentTemplate,
                      'template-dropdown-item--selected': index === this.selectedIndex
                    }
                  ]}
                  onClick={() => this.selectTemplate(template)}
                >
                  {config?.showThumbnail && template.thumbnail && (
                    <img 
                      src={template.thumbnail} 
                      alt={template.displayName || template.name}
                      class="template-thumbnail"
                    />
                  )}
                  <div class="template-info">
                    <span class="template-name">
                      {template.displayName || template.name}
                    </span>
                    {config?.showDescription && template.description && (
                      <span class="template-description">
                        {template.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    // 网格样式
    if (config?.style === 'grid') {
      return (
        <div class={this.selectorClasses}>
          <div class="template-grid">
            {templates.map((template, index) => (
              <button
                key={template.name}
                class={[
                  'template-grid-item',
                  { 
                    'template-grid-item--active': template.name === this.$props.currentTemplate,
                    'template-grid-item--selected': index === this.selectedIndex
                  }
                ]}
                onClick={() => this.selectTemplate(template)}
              >
                {config?.showThumbnail && template.thumbnail && (
                  <div class="template-thumbnail-wrapper">
                    <img 
                      src={template.thumbnail} 
                      alt={template.displayName || template.name}
                      class="template-thumbnail"
                    />
                  </div>
                )}
                <div class="template-info">
                  <span class="template-name">
                    {template.displayName || template.name}
                  </span>
                  {config?.showDescription && template.description && (
                    <span class="template-description">
                      {template.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }

    return null
  }
})

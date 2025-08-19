/**
 * TemplateSelector 组件
 *
 * 模板选择器组件，提供模板浏览和选择功能
 */

import type { TemplateSelectorProps } from '../../types'
import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import './TemplateSelector.less'

export const TemplateSelector = defineComponent({
  name: 'TemplateSelector',
  props: {
    category: {
      type: String,
      required: true,
    },
    device: {
      type: String as PropType<'desktop' | 'mobile' | 'tablet'>,
      default: 'desktop',
    },
    currentTemplate: {
      type: String,
      default: '',
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    layout: {
      type: String as PropType<'grid' | 'list'>,
      default: 'grid',
    },
    columns: {
      type: Number,
      default: 3,
    },
    showInfo: {
      type: Boolean,
      default: true,
    },
    templates: {
      type: Array,
      default: () => [],
    },
    onTemplateChange: {
      type: Function as PropType<(template: string) => void>,
    },
    onTemplatePreview: {
      type: Function as PropType<(template: string) => void>,
    },
  },

  emits: ['template-change', 'template-preview'],

  setup(props, { emit }) {
    // 响应式状态
    const searchQuery = ref('')
    const selectedTemplate = ref(props.currentTemplate || '')
    const loading = ref(false)
    const error = ref<Error | null>(null)

    // 监听 currentTemplate 属性变化，同步更新选中状态
    watch(
      () => props.currentTemplate,
      newTemplate => {
        if (newTemplate !== selectedTemplate.value) {
          selectedTemplate.value = newTemplate || ''
        }
      },
      { immediate: true }
    )

    // 计算属性 - 可用模板列表
    const availableTemplates = computed(() => {
      const templates = Array.isArray(props.templates) ? props.templates : []
      if (templates.length === 0) return []

      return templates.filter(template => {
        // 按分类过滤
        if (template.category !== props.category) return false

        // 按设备类型过滤
        if (props.device && template.device !== props.device) return false

        return true
      })
    })

    // 计算属性 - 过滤后的模板列表
    const filteredTemplates = computed(() => {
      if (!searchQuery.value) return availableTemplates.value

      const query = searchQuery.value.toLowerCase()
      return availableTemplates.value.filter(template => {
        return (
          template.template.toLowerCase().includes(query) ||
          template.config.name.toLowerCase().includes(query) ||
          template.config.description?.toLowerCase().includes(query) ||
          template.config.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      })
    })

    // 选择模板
    const selectTemplate = (template: string) => {
      selectedTemplate.value = template
      props.onTemplateChange?.(template)
      emit('template-change', template)
    }

    // 预览模板
    const previewTemplate = (template: string) => {
      props.onTemplatePreview?.(template)
      emit('template-preview', template)
    }

    // 搜索模板
    const searchTemplates = (query: string) => {
      searchQuery.value = query
    }

    // 刷新模板列表
    const refreshTemplates = async () => {
      loading.value = true
      error.value = null
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (err) {
        error.value = err as Error
      } finally {
        loading.value = false
      }
    }

    // 计算样式类
    const containerClass = computed(() => [
      'template-selector',
      `template-selector--${props.layout}`,
      {
        'template-selector--loading': loading.value,
        'template-selector--error': error.value,
      },
    ])

    const gridStyle = computed(() => {
      if (props.layout === 'grid') {
        return {
          gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
        }
      }
      return {}
    })

    // 处理模板选择
    const handleTemplateSelect = (template: string) => {
      selectTemplate(template)
    }

    // 处理模板预览
    const handleTemplatePreview = (template: string) => {
      previewTemplate(template)
    }

    // 处理搜索
    const handleSearch = (event: Event) => {
      const target = event.target as HTMLInputElement
      searchTemplates(target.value)
    }

    // 渲染搜索框
    const renderSearchBox = () => {
      if (!props.showSearch) return null

      return (
        <div class="template-selector__search">
          <input
            type="text"
            class="template-selector__search-input"
            placeholder="搜索模板..."
            value={searchQuery.value}
            onInput={handleSearch}
          />
          <div class="template-selector__search-icon">🔍</div>
        </div>
      )
    }

    // 渲染模板项
    const renderTemplateItem = (template: any) => {
      const isSelected = selectedTemplate.value === template.template
      const itemClass = [
        'template-selector__item',
        {
          'template-selector__item--selected': isSelected,
        },
      ]

      return (
        <div
          key={template.template}
          class={itemClass}
          onClick={() => handleTemplateSelect(template.template)}
          onMouseenter={() => props.showPreview && handleTemplatePreview(template.template)}
        >
          {props.showPreview && (
            <div class="template-selector__item-preview">
              {template.config.preview ? (
                <img src={template.config.preview} alt={template.config.name} class="template-selector__item-image" />
              ) : (
                <div class="template-selector__item-placeholder">📄</div>
              )}
            </div>
          )}

          <div class="template-selector__item-content">
            <h4 class="template-selector__item-title">{template.config.name}</h4>

            {props.showInfo && template.config.description && (
              <p class="template-selector__item-description">{template.config.description}</p>
            )}

            {props.showInfo && template.config.tags && (
              <div class="template-selector__item-tags">
                {template.config.tags.map((tag: string) => (
                  <span key={tag} class="template-selector__item-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {template.config.isDefault && <div class="template-selector__item-badge">默认</div>}
          </div>

          {isSelected && <div class="template-selector__item-selected-indicator">✓</div>}
        </div>
      )
    }

    // 渲染模板列表
    const renderTemplateList = () => {
      if (loading.value) {
        return (
          <div class="template-selector__loading">
            <div class="template-selector__loading-spinner"></div>
            <p>加载模板中...</p>
          </div>
        )
      }

      if (error.value) {
        return (
          <div class="template-selector__error">
            <div class="template-selector__error-icon">⚠️</div>
            <h4>加载失败</h4>
            <p>{error.value.message}</p>
            <button class="template-selector__error-retry" onClick={refreshTemplates}>
              重试
            </button>
          </div>
        )
      }

      if (filteredTemplates.value.length === 0) {
        return (
          <div class="template-selector__empty">
            <div class="template-selector__empty-icon">📭</div>
            <h4>暂无模板</h4>
            <p>
              {searchQuery.value
                ? `没有找到匹配 "${searchQuery.value}" 的模板`
                : `当前分类 "${props.category}" 下暂无可用模板`}
            </p>
          </div>
        )
      }

      return (
        <div class="template-selector__list" style={gridStyle.value}>
          {filteredTemplates.value.map(renderTemplateItem)}
        </div>
      )
    }

    // 渲染函数
    return () => (
      <div class={containerClass.value}>
        <div class="template-selector__header">
          <h3 class="template-selector__title">
            选择模板 - {props.category} ({props.device})
          </h3>
          {renderSearchBox()}
        </div>

        <div class="template-selector__content">{renderTemplateList()}</div>

        <div class="template-selector__footer">
          <div class="template-selector__stats">
            共 {availableTemplates.value.length} 个模板
            {searchQuery.value && ` (筛选后 ${filteredTemplates.value.length} 个)`}
          </div>
        </div>
      </div>
    )
  },
})

export default TemplateSelector

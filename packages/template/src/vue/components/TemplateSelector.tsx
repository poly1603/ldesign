/**
 * 模板选择器组件
 * 支持弹窗显示当前设备类型下的所有模板，支持模板预览和切换
 */

import { defineComponent, ref, computed, watch, onMounted, PropType } from 'vue'
import type { TemplateInfo, DeviceType, TemplateSelectorOptions } from '../../types'
import './TemplateSelector.less'

export interface TemplateSelectorProps {
  /** 是否显示选择器 */
  visible: boolean
  /** 当前分类 */
  category: string
  /** 当前设备类型 */
  deviceType?: DeviceType
  /** 当前选中的模板 */
  currentTemplate?: string
  /** 可用模板列表 */
  templates: TemplateInfo[]
  /** 选择器配置 */
  options?: TemplateSelectorOptions
  /** 是否显示预览 */
  showPreview?: boolean
  /** 是否显示搜索 */
  showSearch?: boolean
  /** 布局模式 */
  layout?: 'grid' | 'list'
  /** 每行显示数量（网格模式） */
  columns?: number
}

export interface TemplateSelectorEmits {
  /** 更新显示状态 */
  'update:visible': (visible: boolean) => void
  /** 选择模板 */
  'select': (template: TemplateInfo) => void
  /** 预览模板 */
  'preview': (template: TemplateInfo) => void
  /** 关闭选择器 */
  'close': () => void
}

export default defineComponent({
  name: 'TemplateSelector',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String as PropType<DeviceType>,
      default: 'desktop',
    },
    currentTemplate: {
      type: String,
      default: '',
    },
    templates: {
      type: Array as PropType<TemplateInfo[]>,
      default: () => [],
    },
    options: {
      type: Object as PropType<TemplateSelectorOptions>,
      default: () => ({}),
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
  },
  emits: ['update:visible', 'select', 'preview', 'close'],
  setup(props, { emit }) {
    // 响应式数据
    const searchQuery = ref('')
    const previewTemplate = ref<TemplateInfo | null>(null)
    const isPreviewVisible = ref(false)

    // 计算属性
    const filteredTemplates = computed(() => {
      let templates = props.templates.filter(template => 
        template.category === props.category && 
        template.deviceType === props.deviceType
      )

      // 应用搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        templates = templates.filter(template =>
          template.name.toLowerCase().includes(query) ||
          template.displayName.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }

      // 应用自定义过滤器
      if (props.options?.filter) {
        templates = templates.filter(props.options.filter)
      }

      return templates
    })

    const gridStyle = computed(() => ({
      gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    }))

    // 方法
    const handleClose = () => {
      emit('update:visible', false)
      emit('close')
    }

    const handleSelect = (template: TemplateInfo) => {
      emit('select', template)
      handleClose()
    }

    const handlePreview = (template: TemplateInfo) => {
      previewTemplate.value = template
      isPreviewVisible.value = true
      emit('preview', template)
    }

    const handlePreviewClose = () => {
      isPreviewVisible.value = false
      previewTemplate.value = null
    }

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        handleClose()
      }
    }

    const clearSearch = () => {
      searchQuery.value = ''
    }

    // 监听器
    watch(() => props.visible, (visible) => {
      if (visible) {
        searchQuery.value = ''
      }
    })

    // 渲染函数
    const renderSearchBar = () => {
      if (!props.showSearch) return null

      return (
        <div class="template-selector__search">
          <div class="search-input">
            <input
              type="text"
              v-model={searchQuery.value}
              placeholder="搜索模板..."
              class="search-field"
            />
            {searchQuery.value && (
              <button
                class="search-clear"
                onClick={clearSearch}
                title="清除搜索"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )
    }

    const renderTemplateCard = (template: TemplateInfo) => {
      const isSelected = template.name === props.currentTemplate
      const cardClass = [
        'template-card',
        {
          'template-card--selected': isSelected,
          'template-card--default': template.isDefault,
        }
      ]

      return (
        <div
          key={template.id}
          class={cardClass}
          onClick={() => handleSelect(template)}
          onMouseenter={() => props.showPreview && handlePreview(template)}
        >
          {/* 模板缩略图 */}
          <div class="template-card__thumbnail">
            {template.thumbnail ? (
              <img src={template.thumbnail} alt={template.displayName} />
            ) : (
              <div class="template-card__placeholder">
                <span class="placeholder-icon">🎨</span>
              </div>
            )}
            {template.isDefault && (
              <div class="template-card__badge">默认</div>
            )}
          </div>

          {/* 模板信息 */}
          <div class="template-card__content">
            <h3 class="template-card__title">{template.displayName}</h3>
            <p class="template-card__description">{template.description}</p>
            
            {/* 标签 */}
            {template.tags.length > 0 && (
              <div class="template-card__tags">
                {template.tags.slice(0, 3).map(tag => (
                  <span key={tag} class="template-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* 版本信息 */}
            <div class="template-card__meta">
              <span class="template-version">v{template.version}</span>
              <span class="template-author">{template.author}</span>
            </div>
          </div>

          {/* 选中状态 */}
          {isSelected && (
            <div class="template-card__selected">
              <span class="selected-icon">✓</span>
            </div>
          )}
        </div>
      )
    }

    const renderTemplateList = () => {
      if (filteredTemplates.value.length === 0) {
        return (
          <div class="template-selector__empty">
            <div class="empty-icon">📭</div>
            <p class="empty-text">
              {searchQuery.value ? '没有找到匹配的模板' : '暂无可用模板'}
            </p>
            {searchQuery.value && (
              <button class="empty-action" onClick={clearSearch}>
                清除搜索条件
              </button>
            )}
          </div>
        )
      }

      const containerClass = [
        'template-selector__list',
        `template-selector__list--${props.layout}`
      ]

      const containerStyle = props.layout === 'grid' ? gridStyle.value : {}

      return (
        <div class={containerClass} style={containerStyle}>
          {filteredTemplates.value.map(renderTemplateCard)}
        </div>
      )
    }

    const renderPreview = () => {
      if (!isPreviewVisible.value || !previewTemplate.value) return null

      return (
        <div class="template-preview" onClick={handlePreviewClose}>
          <div class="template-preview__content" onClick={(e) => e.stopPropagation()}>
            <div class="template-preview__header">
              <h3>{previewTemplate.value.displayName}</h3>
              <button class="preview-close" onClick={handlePreviewClose}>×</button>
            </div>
            <div class="template-preview__body">
              <p>{previewTemplate.value.description}</p>
              {/* 这里可以添加模板的实际预览 */}
            </div>
          </div>
        </div>
      )
    }

    return () => {
      if (!props.visible) return null

      return (
        <div class="template-selector" onClick={handleBackdropClick}>
          <div class="template-selector__dialog">
            {/* 头部 */}
            <div class="template-selector__header">
              <h2 class="selector-title">
                选择{props.category}模板 ({props.deviceType})
              </h2>
              <button class="selector-close" onClick={handleClose}>
                ×
              </button>
            </div>

            {/* 搜索栏 */}
            {renderSearchBar()}

            {/* 模板列表 */}
            <div class="template-selector__body">
              {renderTemplateList()}
            </div>

            {/* 底部 */}
            <div class="template-selector__footer">
              <div class="selector-info">
                共 {filteredTemplates.value.length} 个模板
              </div>
              <div class="selector-actions">
                <button class="btn btn-secondary" onClick={handleClose}>
                  取消
                </button>
              </div>
            </div>
          </div>

          {/* 预览弹窗 */}
          {renderPreview()}
        </div>
      )
    }
  },
})

/**
 * 模板选择器组件
 * 
 * 提供模板选择界面，支持搜索、过滤、预览等功能
 */

import { 
  defineComponent, 
  ref, 
  computed, 
  watch,
  nextTick,
  type PropType 
} from 'vue'
import type { 
  TemplateSelectorProps, 
  TemplateMetadata, 
  DeviceType 
} from '../types/template'
import { useTemplateList } from '../composables/useTemplate'

/**
 * 模板选择器组件
 */
export const TemplateSelector = defineComponent({
  name: 'TemplateSelector',
  props: {
    /** 当前分类 */
    category: {
      type: String,
      required: true
    },
    /** 当前设备类型 */
    device: {
      type: String as PropType<DeviceType>,
      required: true
    },
    /** 当前选中的模板名称 */
    currentTemplate: {
      type: String,
      default: undefined
    },
    /** 是否显示预览 */
    showPreview: {
      type: Boolean,
      default: true
    },
    /** 是否支持搜索 */
    searchable: {
      type: Boolean,
      default: true
    },
    /** 每页显示数量 */
    pageSize: {
      type: Number,
      default: 12
    },
    /** 是否显示对话框 */
    visible: {
      type: Boolean,
      default: false
    },
    /** 选择回调 */
    onSelect: {
      type: Function as PropType<(templateName: string) => void>,
      default: undefined
    },
    /** 关闭回调 */
    onClose: {
      type: Function as PropType<() => void>,
      default: undefined
    }
  },
  emits: ['select', 'close', 'preview'],
  setup(props, { emit, slots }) {
    // 获取模板列表
    const { availableTemplates, loading, error } = useTemplateList(
      props.category, 
      props.device
    )

    // 内部状态
    const searchQuery = ref('')
    const selectedTags = ref<string[]>([])
    const currentPage = ref(1)
    const previewTemplate = ref<TemplateMetadata | null>(null)
    const sortBy = ref<'name' | 'displayName' | 'version' | 'author'>('displayName')
    const sortOrder = ref<'asc' | 'desc'>('asc')

    // 计算属性
    const allTags = computed(() => {
      const tags = new Set<string>()
      availableTemplates.value.forEach(template => {
        template.tags?.forEach(tag => tags.add(tag))
      })
      return Array.from(tags).sort()
    })

    const filteredTemplates = computed(() => {
      let filtered = availableTemplates.value

      // 搜索过滤
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(template => 
          template.name.toLowerCase().includes(query) ||
          template.displayName.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.author?.toLowerCase().includes(query) ||
          template.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }

      // 标签过滤
      if (selectedTags.value.length > 0) {
        filtered = filtered.filter(template =>
          template.tags?.some(tag => selectedTags.value.includes(tag))
        )
      }

      // 排序
      filtered.sort((a, b) => {
        const aValue = a[sortBy.value] || ''
        const bValue = b[sortBy.value] || ''
        const comparison = aValue.toString().localeCompare(bValue.toString())
        return sortOrder.value === 'asc' ? comparison : -comparison
      })

      return filtered
    })

    const paginatedTemplates = computed(() => {
      const start = (currentPage.value - 1) * props.pageSize
      const end = start + props.pageSize
      return filteredTemplates.value.slice(start, end)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredTemplates.value.length / props.pageSize)
    )

    const hasResults = computed(() => filteredTemplates.value.length > 0)

    /**
     * 处理模板选择
     */
    const handleSelect = (template: TemplateMetadata) => {
      props.onSelect?.(template.name)
      emit('select', template.name)
    }

    /**
     * 处理模板预览
     */
    const handlePreview = (template: TemplateMetadata) => {
      previewTemplate.value = template
      emit('preview', template)
    }

    /**
     * 处理关闭
     */
    const handleClose = () => {
      props.onClose?.()
      emit('close')
    }

    /**
     * 切换标签选择
     */
    const toggleTag = (tag: string) => {
      const index = selectedTags.value.indexOf(tag)
      if (index > -1) {
        selectedTags.value.splice(index, 1)
      } else {
        selectedTags.value.push(tag)
      }
      currentPage.value = 1 // 重置到第一页
    }

    /**
     * 清除所有过滤器
     */
    const clearFilters = () => {
      searchQuery.value = ''
      selectedTags.value = []
      currentPage.value = 1
    }

    /**
     * 切换排序
     */
    const toggleSort = (field: typeof sortBy.value) => {
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = field
        sortOrder.value = 'asc'
      }
    }

    /**
     * 渲染搜索栏
     */
    const renderSearchBar = () => {
      if (!props.searchable) return null

      return (
        <div class="template-selector__search">
          <div class="search-input">
            <input
              type="text"
              v-model={searchQuery.value}
              placeholder="搜索模板..."
              class="search-input__field"
            />
            <div class="search-input__icon">🔍</div>
          </div>
          
          {allTags.value.length > 0 && (
            <div class="search-tags">
              <div class="search-tags__label">标签筛选：</div>
              <div class="search-tags__list">
                {allTags.value.map(tag => (
                  <button
                    key={tag}
                    class={[
                      'search-tags__tag',
                      { 'search-tags__tag--active': selectedTags.value.includes(tag) }
                    ]}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(searchQuery.value || selectedTags.value.length > 0) && (
            <button 
              class="search-clear"
              onClick={clearFilters}
            >
              清除筛选
            </button>
          )}
        </div>
      )
    }

    /**
     * 渲染排序栏
     */
    const renderSortBar = () => (
      <div class="template-selector__sort">
        <span class="sort-label">排序：</span>
        {(['displayName', 'name', 'version', 'author'] as const).map(field => (
          <button
            key={field}
            class={[
              'sort-button',
              { 'sort-button--active': sortBy.value === field }
            ]}
            onClick={() => toggleSort(field)}
          >
            {field === 'displayName' ? '名称' : 
             field === 'name' ? '标识' :
             field === 'version' ? '版本' : '作者'}
            {sortBy.value === field && (
              <span class="sort-arrow">
                {sortOrder.value === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>
    )

    /**
     * 渲染模板卡片
     */
    const renderTemplateCard = (template: TemplateMetadata) => (
      <div 
        key={template.name}
        class={[
          'template-card',
          { 'template-card--selected': template.name === props.currentTemplate }
        ]}
      >
        {props.showPreview && template.preview && (
          <div class="template-card__preview">
            <img 
              src={template.preview} 
              alt={template.displayName}
              loading="lazy"
              onError={(e) => {
                // 预览图加载失败时隐藏
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div class="template-card__content">
          <div class="template-card__header">
            <h3 class="template-card__title">{template.displayName}</h3>
            <span class="template-card__version">v{template.version}</span>
          </div>
          
          <p class="template-card__description">{template.description}</p>
          
          {template.author && (
            <div class="template-card__author">作者: {template.author}</div>
          )}
          
          {template.tags && template.tags.length > 0 && (
            <div class="template-card__tags">
              {template.tags.map(tag => (
                <span key={tag} class="template-card__tag">{tag}</span>
              ))}
            </div>
          )}
          
          <div class="template-card__actions">
            {props.showPreview && (
              <button 
                class="template-card__preview-btn"
                onClick={() => handlePreview(template)}
              >
                预览
              </button>
            )}
            <button 
              class="template-card__select-btn"
              onClick={() => handleSelect(template)}
            >
              {template.name === props.currentTemplate ? '已选择' : '选择'}
            </button>
          </div>
        </div>
      </div>
    )

    /**
     * 渲染分页
     */
    const renderPagination = () => {
      if (totalPages.value <= 1) return null

      return (
        <div class="template-selector__pagination">
          <button 
            class="pagination-btn"
            disabled={currentPage.value === 1}
            onClick={() => currentPage.value--}
          >
            上一页
          </button>
          
          <span class="pagination-info">
            {currentPage.value} / {totalPages.value}
          </span>
          
          <button 
            class="pagination-btn"
            disabled={currentPage.value === totalPages.value}
            onClick={() => currentPage.value++}
          >
            下一页
          </button>
        </div>
      )
    }

    // 监听搜索变化，重置页码
    watch([searchQuery, selectedTags], () => {
      currentPage.value = 1
    })

    return () => {
      if (!props.visible) return null

      return (
        <div class="template-selector">
          <div class="template-selector__overlay" onClick={handleClose} />
          
          <div class="template-selector__dialog">
            <div class="template-selector__header">
              <h2 class="template-selector__title">选择模板</h2>
              <button 
                class="template-selector__close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
            
            <div class="template-selector__body">
              {renderSearchBar()}
              {renderSortBar()}
              
              {loading.value ? (
                <div class="template-selector__loading">加载中...</div>
              ) : error.value ? (
                <div class="template-selector__error">
                  加载失败: {error.value}
                </div>
              ) : !hasResults.value ? (
                <div class="template-selector__empty">
                  没有找到匹配的模板
                </div>
              ) : (
                <>
                  <div class="template-selector__grid">
                    {paginatedTemplates.value.map(renderTemplateCard)}
                  </div>
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
  }
})

export default TemplateSelector

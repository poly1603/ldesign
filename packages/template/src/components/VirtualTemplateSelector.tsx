/**
 * 虚拟滚动模板选择器组件
 * 
 * 支持大量模板时的虚拟滚动，提供更好的性能
 */

import { 
  defineComponent, 
  ref, 
  computed, 
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  type PropType 
} from 'vue'
import type { 
  TemplateSelectorProps, 
  TemplateMetadata, 
  DeviceType 
} from '../types/template'
import { useTemplateList } from '../composables/useTemplate'
import { 
  performanceMonitor, 
  intersectionManager, 
  debounce,
  runWhenIdle 
} from '../utils/performance'

/**
 * 虚拟滚动配置
 */
interface VirtualScrollConfig {
  /** 每行显示的列数 */
  columns: number
  /** 每个项目的高度 */
  itemHeight: number
  /** 缓冲区大小（屏幕数量） */
  bufferSize: number
  /** 容器高度 */
  containerHeight: number
}

/**
 * 虚拟滚动模板选择器
 */
export const VirtualTemplateSelector = defineComponent({
  name: 'VirtualTemplateSelector',
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
    /** 是否显示对话框 */
    visible: {
      type: Boolean,
      default: false
    },
    /** 虚拟滚动配置 */
    virtualConfig: {
      type: Object as PropType<Partial<VirtualScrollConfig>>,
      default: () => ({})
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
  setup(props, { emit }) {
    // 获取模板列表
    const { availableTemplates, loading, error } = useTemplateList(
      props.category, 
      props.device
    )

    // 虚拟滚动配置
    const virtualScrollConfig = computed<VirtualScrollConfig>(() => ({
      columns: 3,
      itemHeight: 320,
      bufferSize: 2,
      containerHeight: 600,
      ...props.virtualConfig
    }))

    // DOM 引用
    const containerRef = ref<HTMLElement>()
    const scrollContainerRef = ref<HTMLElement>()

    // 内部状态
    const searchQuery = ref('')
    const selectedTags = ref<string[]>([])
    const scrollTop = ref(0)
    const containerSize = ref({ width: 0, height: 0 })

    // 性能监控
    const renderStartTime = ref(0)

    // 计算属性
    const allTags = computed(() => {
      const tags = new Set<string>()
      availableTemplates.value.forEach(template => {
        template.tags?.forEach(tag => tags.add(tag))
      })
      return Array.from(tags).sort()
    })

    const filteredTemplates = computed(() => {
      const startTime = performance.now()
      
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

      const endTime = performance.now()
      performanceMonitor.recordMetric('template_filter_time', endTime - startTime)

      return filtered
    })

    // 虚拟滚动计算
    const virtualScrollData = computed(() => {
      const config = virtualScrollConfig.value
      const templates = filteredTemplates.value
      const totalRows = Math.ceil(templates.length / config.columns)
      const totalHeight = totalRows * config.itemHeight

      // 计算可见范围
      const visibleStart = Math.floor(scrollTop.value / config.itemHeight)
      const visibleEnd = Math.min(
        totalRows,
        Math.ceil((scrollTop.value + config.containerHeight) / config.itemHeight)
      )

      // 添加缓冲区
      const bufferStart = Math.max(0, visibleStart - config.bufferSize)
      const bufferEnd = Math.min(totalRows, visibleEnd + config.bufferSize)

      // 计算可见项目
      const visibleItems: Array<{
        index: number
        row: number
        templates: TemplateMetadata[]
        top: number
      }> = []

      for (let row = bufferStart; row < bufferEnd; row++) {
        const startIndex = row * config.columns
        const endIndex = Math.min(startIndex + config.columns, templates.length)
        const rowTemplates = templates.slice(startIndex, endIndex)

        if (rowTemplates.length > 0) {
          visibleItems.push({
            index: row,
            row,
            templates: rowTemplates,
            top: row * config.itemHeight
          })
        }
      }

      return {
        totalHeight,
        visibleItems,
        totalRows,
        visibleStart: bufferStart,
        visibleEnd: bufferEnd
      }
    })

    /**
     * 处理滚动
     */
    const handleScroll = debounce((event: Event) => {
      const target = event.target as HTMLElement
      scrollTop.value = target.scrollTop
    }, 16) // 60fps

    /**
     * 处理模板选择
     */
    const handleSelect = (template: TemplateMetadata) => {
      const selectTime = performanceMonitor.monitorComponentLoad(`select_${template.name}`)
      
      props.onSelect?.(template.name)
      emit('select', template.name)
      
      selectTime()
    }

    /**
     * 处理模板预览
     */
    const handlePreview = (template: TemplateMetadata) => {
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
    }

    /**
     * 清除所有过滤器
     */
    const clearFilters = () => {
      searchQuery.value = ''
      selectedTags.value = []
    }

    /**
     * 更新容器尺寸
     */
    const updateContainerSize = () => {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        containerSize.value = {
          width: rect.width,
          height: rect.height
        }
      }
    }

    /**
     * 渲染搜索栏
     */
    const renderSearchBar = () => {
      if (!props.searchable) return null

      return (
        <div class="virtual-template-selector__search">
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
     * 渲染模板卡片
     */
    const renderTemplateCard = (template: TemplateMetadata) => (
      <div 
        key={template.name}
        class={[
          'virtual-template-card',
          { 'virtual-template-card--selected': template.name === props.currentTemplate }
        ]}
        style={{
          width: `calc(${100 / virtualScrollConfig.value.columns}% - 1rem)`,
          height: `${virtualScrollConfig.value.itemHeight - 20}px`
        }}
      >
        {props.showPreview && template.preview && (
          <div class="virtual-template-card__preview">
            <img 
              src={template.preview} 
              alt={template.displayName}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div class="virtual-template-card__content">
          <div class="virtual-template-card__header">
            <h3 class="virtual-template-card__title">{template.displayName}</h3>
            <span class="virtual-template-card__version">v{template.version}</span>
          </div>
          
          <p class="virtual-template-card__description">{template.description}</p>
          
          {template.author && (
            <div class="virtual-template-card__author">作者: {template.author}</div>
          )}
          
          {template.tags && template.tags.length > 0 && (
            <div class="virtual-template-card__tags">
              {template.tags.slice(0, 3).map(tag => (
                <span key={tag} class="virtual-template-card__tag">{tag}</span>
              ))}
              {template.tags.length > 3 && (
                <span class="virtual-template-card__tag-more">+{template.tags.length - 3}</span>
              )}
            </div>
          )}
          
          <div class="virtual-template-card__actions">
            {props.showPreview && (
              <button 
                class="virtual-template-card__preview-btn"
                onClick={() => handlePreview(template)}
              >
                预览
              </button>
            )}
            <button 
              class="virtual-template-card__select-btn"
              onClick={() => handleSelect(template)}
            >
              {template.name === props.currentTemplate ? '已选择' : '选择'}
            </button>
          </div>
        </div>
      </div>
    )

    /**
     * 渲染虚拟行
     */
    const renderVirtualRow = (item: typeof virtualScrollData.value.visibleItems[0]) => (
      <div
        key={item.index}
        class="virtual-template-row"
        style={{
          position: 'absolute',
          top: `${item.top}px`,
          left: '0',
          right: '0',
          height: `${virtualScrollConfig.value.itemHeight}px`,
          display: 'flex',
          gap: '1rem',
          padding: '0 1rem'
        }}
      >
        {item.templates.map(renderTemplateCard)}
      </div>
    )

    // 监听容器尺寸变化
    onMounted(() => {
      updateContainerSize()
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updateContainerSize)
      }
    })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateContainerSize)
      }
    })

    // 监听可见性变化，进行性能监控
    watch(() => props.visible, (visible) => {
      if (visible) {
        renderStartTime.value = performance.now()
      } else {
        if (renderStartTime.value > 0) {
          const renderTime = performance.now() - renderStartTime.value
          performanceMonitor.recordMetric('selector_render_time', renderTime)
        }
      }
    })

    return () => {
      if (!props.visible) return null

      const scrollData = virtualScrollData.value

      return (
        <div class="virtual-template-selector">
          <div class="virtual-template-selector__overlay" onClick={handleClose} />
          
          <div class="virtual-template-selector__dialog" ref={containerRef}>
            <div class="virtual-template-selector__header">
              <h2 class="virtual-template-selector__title">选择模板</h2>
              <div class="virtual-template-selector__stats">
                共 {filteredTemplates.value.length} 个模板
              </div>
              <button 
                class="virtual-template-selector__close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
            
            <div class="virtual-template-selector__body">
              {renderSearchBar()}
              
              {loading.value ? (
                <div class="virtual-template-selector__loading">加载中...</div>
              ) : error.value ? (
                <div class="virtual-template-selector__error">
                  加载失败: {error.value}
                </div>
              ) : filteredTemplates.value.length === 0 ? (
                <div class="virtual-template-selector__empty">
                  没有找到匹配的模板
                </div>
              ) : (
                <div 
                  class="virtual-template-selector__scroll-container"
                  ref={scrollContainerRef}
                  style={{ height: `${virtualScrollConfig.value.containerHeight}px` }}
                  onScroll={handleScroll}
                >
                  <div 
                    class="virtual-template-selector__scroll-content"
                    style={{ height: `${scrollData.totalHeight}px`, position: 'relative' }}
                  >
                    {scrollData.visibleItems.map(renderVirtualRow)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  }
})

export default VirtualTemplateSelector

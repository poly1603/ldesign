/**
 * TemplateSelector 组件 - 重构版本
 *
 * 模板选择器组件，提供模板浏览和选择功能
 * 新设计：按钮触发 + 模态弹出层
 */

import { computed, defineComponent, nextTick, onMounted, onUnmounted, type PropType, ref, Teleport, watch } from 'vue'
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
      required: true, // 改为必需属性，由父组件传递
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
    buttonText: {
      type: String,
      default: '选择模板',
    },
    buttonIcon: {
      type: String,
      default: '⚙️',
    },
    onTemplateChange: {
      type: Function as PropType<(template: string) => void>,
    },
    onTemplatePreview: {
      type: Function as PropType<(template: string) => void>,
    },
    onVisibilityChange: {
      type: Function as PropType<(visible: boolean) => void>,
    },
  },

  emits: ['template-change', 'template-preview', 'visibility-change'],

  setup(props, { emit }) {
    // 响应式状态
    const searchQuery = ref('')
    const selectedTemplate = ref(props.currentTemplate || '')
    const loading = ref(false)
    const error = ref<Error | null>(null)
    const isModalVisible = ref(false) // 模态弹出层可见性
    const isClosing = ref(false) // 关闭动画状态

    // 强制刷新标志，用于解决状态异常问题
    const forceRefresh = ref(0)

    // 监听 currentTemplate 属性变化，同步更新选中状态
    watch(
      () => props.currentTemplate,
      (newTemplate) => {
        if (newTemplate !== selectedTemplate.value) {
          selectedTemplate.value = newTemplate || ''
        }
      },
      { immediate: true },
    )

    // 计算属性 - 可用模板列表
    const availableTemplates = computed(() => {
      // 触发强制刷新
      forceRefresh.value

      const templates = Array.isArray(props.templates) ? props.templates : []

      if (templates.length === 0) {
        return []
      }

      const filtered = templates.filter((template: any) => {
        // 按分类过滤
        if (template.category !== props.category)
          return false

        // 按设备类型过滤
        if (props.device && template.device !== props.device)
          return false

        return true
      })

      return filtered
    })

    // 监听设备类型变化
    watch(
      () => props.device,
      () => {
        // 设备类型变化时强制刷新模板列表
        forceRefresh.value++
        // 重置搜索查询
        searchQuery.value = ''
        // 如果模态框是打开的，保持打开状态但刷新内容
        if (isModalVisible.value) {
          nextTick(() => {
            forceRefresh.value++
          })
        }
      },
      { immediate: false },
    )

    // 计算属性 - 过滤后的模板列表
    const filteredTemplates = computed(() => {
      const available = availableTemplates.value

      if (!searchQuery.value) {
        return available
      }

      const query = searchQuery.value.toLowerCase()
      const filtered = available.filter((template: any) => {
        return (
          template.template.toLowerCase().includes(query)
          || template.config.name.toLowerCase().includes(query)
          || template.config.description?.toLowerCase().includes(query)
          || template.config.tags?.some((tag: any) => tag.toLowerCase().includes(query))
        )
      })

      return filtered
    })

    // 重置状态
    const resetState = () => {
      searchQuery.value = ''
      error.value = null
      loading.value = false
      forceRefresh.value++
    }

    // 选择模板
    const selectTemplate = (template: string) => {
      selectedTemplate.value = template
      props.onTemplateChange?.(template)
      emit('template-change', template)
      // 选择后关闭模态弹出层并重置状态
      closeModal()
      // 延迟重置状态，确保模态框完全关闭
      setTimeout(() => {
        resetState()
      }, 100)
    }

    // 预览模板
    const previewTemplate = (template: string) => {
      props.onTemplatePreview?.(template)
      emit('template-preview', template)
    }

    // 打开模态弹出层
    const openModal = () => {
      // 重置状态确保干净的开始
      resetState()

      isModalVisible.value = true
      props.onVisibilityChange?.(true)
      emit('visibility-change', true)
      // 阻止页面滚动
      document.body.style.overflow = 'hidden'

      // 强制刷新模板列表
      nextTick(() => {
        forceRefresh.value++
      })
    }

    // 关闭模态弹出层
    const closeModal = () => {
      if (isClosing.value)
        return // 防止重复触发

      isClosing.value = true

      // 延迟关闭，等待动画完成
      setTimeout(() => {
        isModalVisible.value = false
        isClosing.value = false
        props.onVisibilityChange?.(false)
        emit('visibility-change', false)
        // 恢复页面滚动
        document.body.style.overflow = ''
      }, 300) // 与CSS动画时间匹配
    }

    // 切换模态弹出层 - 简化逻辑，移除防抖
    const toggleModal = () => {
      if (isModalVisible.value) {
        closeModal()
      }
      else {
        openModal()
      }
    }

    // 刷新模板列表
    const refreshTemplates = async () => {
      loading.value = true
      error.value = null
      try {
        // 强制刷新
        forceRefresh.value++
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      catch (err) {
        console.error('❌ TemplateSelector 模板列表刷新失败:', err)
        error.value = err as Error
      }
      finally {
        loading.value = false
      }
    }

    // 键盘事件处理
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalVisible.value) {
        closeModal()
      }
    }

    // 生命周期钩子
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
      // 确保在组件卸载时恢复页面滚动
      document.body.style.overflow = ''
    })

    // 计算样式类
    const containerClass = computed(() => [
      'template-selector',
      `template-selector--${props.layout}`,
      {
        'template-selector--loading': loading.value,
        'template-selector--error': error.value,
      },
    ])

    const modalClass = computed(() => [
      'template-selector-modal',
      {
        'template-selector-modal--visible': isModalVisible.value && !isClosing.value,
        'template-selector-modal--closing': isClosing.value,
      },
    ])

    const triggerButtonClass = computed(() => [
      'template-selector-trigger',
      {
        'template-selector-trigger--active': isModalVisible.value,
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
          key={`${template.category}-${template.device}-${template.template}`}
          class={itemClass}
          onClick={() => handleTemplateSelect(template.template)}
          onMouseenter={() => props.showPreview && handleTemplatePreview(template.template)}
        >
          {props.showPreview && (
            <div class="template-selector__item-preview">
              {template.config.preview
                ? (
                    <img src={template.config.preview} alt={template.config.name} class="template-selector__item-image" />
                  )
                : (
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
      // 触发强制刷新检查
      forceRefresh.value

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

      // 检查可用模板数量
      if (availableTemplates.value.length === 0) {
        return (
          <div class="template-selector__empty">
            <div class="template-selector__empty-icon">📭</div>
            <h4>暂无模板</h4>
            <p>
              当前分类 "
              {props.category}
              " 和设备 "
              {props.device}
              " 下暂无可用模板
            </p>
            <button class="template-selector__error-retry" onClick={refreshTemplates}>
              刷新
            </button>
          </div>
        )
      }

      if (filteredTemplates.value.length === 0) {
        return (
          <div class="template-selector__empty">
            <div class="template-selector__empty-icon">🔍</div>
            <h4>无搜索结果</h4>
            <p>
              没有找到匹配 "
              {searchQuery.value}
              " 的模板
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

    // 渲染模态弹出层内容
    const renderModalContent = () => {
      return (
        <div class={containerClass.value}>
          <div class="template-selector__header">
            <h3 class="template-selector__title">
              选择模板 -
              {' '}
              {props.category}
              {' '}
              (
              {props.device}
              )
            </h3>
            <button class="template-selector__close" onClick={closeModal}>
              ✕
            </button>
          </div>

          <div class="template-selector__content">{renderTemplateList()}</div>

          <div class="template-selector__footer">
            <div class="template-selector__stats">
              共
              {' '}
              {availableTemplates.value.length}
              {' '}
              个模板
              {searchQuery.value && ` (筛选后 ${filteredTemplates.value.length} 个)`}
            </div>
            <button
              class="template-selector__refresh"
              onClick={refreshTemplates}
              title="刷新模板列表"
            >
              🔄 刷新
            </button>
          </div>
        </div>
      )
    }

    // 渲染函数
    return () => {
      return (
        <>
          {/* 触发按钮 */}
          <button class={triggerButtonClass.value} onClick={toggleModal} title={props.buttonText}>
            <span class="template-selector-trigger__icon">{props.buttonIcon}</span>
            <span class="template-selector-trigger__text">{props.buttonText}</span>
          </button>

          {/* 模态弹出层 - 只在可见时渲染内容 */}
          {isModalVisible.value && (
            <Teleport to="body">
              <div class={modalClass.value}>
                {/* 背景遮罩 - 直接绑定点击事件 */}
                <div
                  class="template-selector-modal__backdrop"
                  onClick={closeModal}
                >
                </div>

                {/* 模态内容 */}
                <div
                  class="template-selector-modal__content"
                  onClick={(e: Event) => e.stopPropagation()}
                >
                  {renderModalContent()}
                </div>
              </div>
            </Teleport>
          )}
        </>
      )
    }
  },
})

export default TemplateSelector

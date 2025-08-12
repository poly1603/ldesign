/**
 * 模板选择器组件
 *
 * 提供便捷的模板切换功能，可以灵活放置在任意位置
 */

import type { TemplateInfo } from '../types'
import { computed, defineComponent, onMounted, type PropType, ref } from 'vue'
// 导入 getCurrentInstance
import { getCurrentInstance } from 'vue'

import './TemplateSelector.less'

export interface TemplateSelectorProps {
  /** 当前模板 ID */
  currentTemplate?: string
  /** 显示模式 */
  mode?: 'dropdown' | 'grid' | 'list'
  /** 是否显示预览 */
  showPreview?: boolean
  /** 是否显示模板信息 */
  showInfo?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 模板切换回调 */
  onTemplateChange?: (templateId: string) => void
}

export default defineComponent({
  name: 'TemplateSelector',
  props: {
    currentTemplate: {
      type: String,
      default: '',
    },
    mode: {
      type: String as () => 'dropdown' | 'grid' | 'list',
      default: 'dropdown',
    },
    showPreview: {
      type: Boolean,
      default: false,
    },
    showInfo: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
      default: '',
    },
    onTemplateChange: {
      type: Function as PropType<(templateId: string) => void>,
      default: undefined,
    },
  },
  emits: ['template-change'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const availableTemplates = ref<TemplateInfo[]>([])
    const loading = ref(true)
    const selectedTemplate = ref(props.currentTemplate)

    // 获取模板管理器实例
    const getTemplateManager = () => {
      // 从全局属性或注入中获取模板管理器
      const instance = getCurrentInstance()
      return instance?.appContext.config.globalProperties.$templateManager
    }

    // 加载可用模板
    const loadTemplates = async () => {
      try {
        loading.value = true
        const templateManager = getTemplateManager()

        if (templateManager) {
          availableTemplates.value = await templateManager.getAvailableTemplates()
          console.log('📋 加载可用模板:', availableTemplates.value.length)
        } else {
          console.warn('⚠️ 模板管理器未找到')
        }
      } catch (error) {
        console.error('❌ 加载模板失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 当前模板信息
    const currentTemplateInfo = computed(() => {
      return availableTemplates.value.find((t: TemplateInfo) => t.id === selectedTemplate.value)
    })

    // 切换模板
    const switchTemplate = async (templateId: string) => {
      try {
        console.log(`🔄 切换模板: ${templateId}`)
        const templateManager = getTemplateManager()

        if (templateManager) {
          await templateManager.switchTemplate(templateId)
          selectedTemplate.value = templateId

          // 触发事件
          emit('template-change', templateId)
          props.onTemplateChange?.(templateId)

          console.log(`✅ 模板切换成功: ${templateId}`)
        }
      } catch (error) {
        console.error(`❌ 模板切换失败: ${templateId}`, error)
      } finally {
        isOpen.value = false
      }
    }

    // 获取模板预览图
    const getTemplatePreview = (template: TemplateInfo) => {
      return template.config.preview || '/placeholder-template.png'
    }

    // 获取设备图标
    const getDeviceIcon = (device: string) => {
      const icons = {
        mobile: '📱',
        tablet: '📟',
        desktop: '🖥️',
      }
      return icons[device as keyof typeof icons] || '📱'
    }

    onMounted(() => {
      loadTemplates()
    })

    // 渲染下拉模式
    const renderDropdown = () => (
      <div class={['template-selector', 'template-selector--dropdown', props.className]}>
        <div
          class={['template-selector__trigger', { 'is-open': isOpen.value }]}
          onClick={() => (isOpen.value = !isOpen.value)}
        >
          <div class="template-selector__current">
            {currentTemplateInfo.value ? (
              <>
                <span class="template-selector__icon">{getDeviceIcon(currentTemplateInfo.value.device)}</span>
                <span class="template-selector__name">{currentTemplateInfo.value.name}</span>
              </>
            ) : (
              <span class="template-selector__placeholder">选择模板</span>
            )}
          </div>
          <span class={['template-selector__arrow', { 'is-open': isOpen.value }]}>▼</span>
        </div>

        {isOpen.value && (
          <div class="template-selector__dropdown">
            {loading.value ? (
              <div class="template-selector__loading">加载中...</div>
            ) : (
              <div class="template-selector__list">
                {availableTemplates.value.map((template: TemplateInfo) => (
                  <div
                    key={template.id}
                    class={['template-selector__item', { 'is-active': template.id === selectedTemplate.value }]}
                    onClick={() => switchTemplate(template.id)}
                  >
                    <span class="template-selector__item-icon">{getDeviceIcon(template.device)}</span>
                    <div class="template-selector__item-content">
                      <div class="template-selector__item-name">{template.name}</div>
                      {props.showInfo && <div class="template-selector__item-desc">{template.config.description}</div>}
                    </div>
                    {template.id === selectedTemplate.value && <span class="template-selector__item-check">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )

    // 渲染网格模式
    const renderGrid = () => (
      <div class={['template-selector', 'template-selector--grid', props.className]}>
        <div class="template-selector__header">
          <h3>选择模板</h3>
        </div>
        {loading.value ? (
          <div class="template-selector__loading">加载中...</div>
        ) : (
          <div class="template-selector__grid">
            {availableTemplates.value.map((template: TemplateInfo) => (
              <div
                key={template.id}
                class={['template-selector__card', { 'is-active': template.id === selectedTemplate.value }]}
                onClick={() => switchTemplate(template.id)}
              >
                {props.showPreview && (
                  <div class="template-selector__preview">
                    <img src={getTemplatePreview(template)} alt={template.name} />
                  </div>
                )}
                <div class="template-selector__card-content">
                  <div class="template-selector__card-header">
                    <span class="template-selector__card-icon">{getDeviceIcon(template.device)}</span>
                    <span class="template-selector__card-name">{template.name}</span>
                  </div>
                  {props.showInfo && <div class="template-selector__card-desc">{template.config.description}</div>}
                </div>
                {template.id === selectedTemplate.value && <div class="template-selector__card-check">✓</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    )

    // 渲染列表模式
    const renderList = () => (
      <div class={['template-selector', 'template-selector--list', props.className]}>
        <div class="template-selector__header">
          <h3>可用模板</h3>
        </div>
        {loading.value ? (
          <div class="template-selector__loading">加载中...</div>
        ) : (
          <div class="template-selector__list">
            {availableTemplates.value.map((template: TemplateInfo) => (
              <div
                key={template.id}
                class={['template-selector__list-item', { 'is-active': template.id === selectedTemplate.value }]}
                onClick={() => switchTemplate(template.id)}
              >
                <div class="template-selector__list-icon">{getDeviceIcon(template.device)}</div>
                <div class="template-selector__list-content">
                  <div class="template-selector__list-name">{template.name}</div>
                  {props.showInfo && <div class="template-selector__list-desc">{template.config.description}</div>}
                  <div class="template-selector__list-meta">
                    设备: {template.device} | 版本: {template.config.version || '1.0.0'}
                  </div>
                </div>
                <div class="template-selector__list-actions">
                  {template.id === selectedTemplate.value ? (
                    <span class="template-selector__list-current">当前</span>
                  ) : (
                    <button class="template-selector__list-btn">切换</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )

    return () => {
      switch (props.mode) {
        case 'grid':
          return renderGrid()
        case 'list':
          return renderList()
        default:
          return renderDropdown()
      }
    }
  },
})

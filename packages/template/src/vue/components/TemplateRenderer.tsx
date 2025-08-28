import { computed, defineComponent, h, markRaw, nextTick, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import {
  type CacheConfig,
  type DeviceType,
  type ExternalTemplate,
  type TemplateRendererProps,
} from '../../types'
import { useTemplateExtension } from '../composables/useTemplateExtension'
import { useTemplateRegistry } from '../composables/useTemplateRegistry'
import TemplateSelector from './TemplateSelector'
import './TemplateRenderer.less'

// 定义TemplateOption接口
interface TemplateOption {
  name: string
  displayName?: string
  description?: string
  version?: string
  tags?: string[]
  thumbnail?: string
}

// 定义组件属性
interface Props extends TemplateRendererProps {
  template: string
  deviceType?: DeviceType
  category?: string
  showSelector?: boolean
  selectorConfig?: {
    /** 选择器位置：'top' 在模板上方，'bottom' 在模板下方，'overlay' 浮层显示 */
    position?: 'top' | 'bottom' | 'overlay'
    /** 选择器样式：'tabs' 标签页样式，'dropdown' 下拉选择，'grid' 网格布局 */
    style?: 'tabs' | 'dropdown' | 'grid'
    /** 是否显示模板预览图 */
    showThumbnail?: boolean
    /** 是否显示模板描述 */
    showDescription?: boolean
    /** 选择器布局模式：'slot' 通过插槽传递给模板，'header' 显示在头部 */
    layout?: 'slot' | 'header'
  }
  loadingConfig?: {
    showLoading?: boolean
    loadingComponent?: Component
    errorComponent?: Component
    loadingText?: string
    errorText?: string
  }
}

// 定义事件
interface Emits {
  (e: 'template-loaded', component: Component): void
  (e: 'template-error', error: Error): void
  (e: 'template-changed', oldTemplate: string, newTemplate: string): void
  (e: 'template-selected', templateName: string): void
  (e: 'selector-opened'): void
  (e: 'selector-closed'): void
  (e: 'device-changed', oldDeviceType: DeviceType, newDeviceType: DeviceType): void
}

export default defineComponent({
  name: 'TemplateRenderer',
  props: {
    template: {
      type: String,
      required: true
    },
    deviceType: {
      type: String as () => DeviceType,
      default: 'desktop'
    },
    category: String,
    showSelector: {
      type: Boolean,
      default: false
    },
    selectorConfig: {
      type: Object,
      default: () => ({
        position: 'top',
        style: 'tabs',
        showThumbnail: true,
        showDescription: true,
        layout: 'header'
      })
    },
    loadingConfig: {
      type: Object,
      default: () => ({
        showLoading: true,
        loadingText: '加载模板中...',
        errorText: '模板加载失败'
      })
    },
    cacheConfig: Object as () => CacheConfig,
    templateProps: Object,
    externalTemplates: Array as () => ExternalTemplate[]
  },
  emits: [
    'template-loaded',
    'template-error',
    'template-changed',
    'template-selected',
    'selector-opened',
    'selector-closed',
    'device-changed'
  ],
  setup(props: Props, { emit, slots }) {
    // 使用模板注册表和扩展
    const { getTemplatesByCategory, registerExternalTemplates, getAllTemplates } = useTemplateRegistry()
    const { setExtensionOptions, findExternalTemplate } = useTemplateExtension()

    // 简化的模板状态管理
    const templateComponent = ref<Component | null>(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)
    const currentDeviceType = computed(() => props.deviceType || 'desktop')

    // 获取组件名称
    function getComponentName(template: string) {
      if (template === 'login')
        return 'LoginForm'
      if (template === 'dashboard')
        return 'Dashboard'
      return template.charAt(0).toUpperCase() + template.slice(1)
    }

    // 加载模板的核心逻辑
    async function loadTemplate(templateName: string, targetDeviceType?: DeviceType) {
      if (!templateName) return

      const deviceType = targetDeviceType || currentDeviceType.value
      loading.value = true
      error.value = null

      try {
        // 首先尝试从外部模板中查找
        const externalTemplate = findExternalTemplate(
          templateName,
          deviceType,
          props.category
        )

        if (externalTemplate) {
          // 使用外部模板
          templateComponent.value = markRaw(externalTemplate.component)
        }
        else {
          // 回退到默认的模板加载逻辑
          // 根据模板注册表中的路径加载真实的模板组件
          const templates = getAllTemplates()
          const matchedTemplate = templates.find(t =>
            t.name === templateName &&
            t.deviceType === deviceType &&
            (!props.category || t.category === props.category)
          )

          if (matchedTemplate && matchedTemplate.path) {
            // 修复路径构建逻辑 - 根据当前文件位置构建正确的相对路径
            const importPath = matchedTemplate.path.replace('src/templates/', '../../templates/')
            const module = await import(/* @vite-ignore */ importPath)

            templateComponent.value = markRaw(module.default)
          }
          else {
            throw new Error(`未找到模板: ${templateName} (${targetDeviceType})`)
          }
        }
      }
      catch (err) {
        // 如果真实模板加载失败，创建模拟组件
        if (process.env.NODE_ENV === 'development') {
          console.warn('模板加载失败，使用模拟组件:', err)
        }
        const mockComponent = markRaw({
          name: `${templateName}-${targetDeviceType}`,
          render() {
            return h('div', {
              class: 'mock-template',
              style: {
                padding: '2rem',
                textAlign: 'center',
                border: '2px dashed #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#f7fafc'
              }
            }, [
              h('h3', { style: { margin: '0 0 1rem 0', color: '#2d3748' } }, `模板: ${templateName}`),
              h('p', { style: { margin: '0', color: '#718096' } }, '这是一个模拟的模板组件'),
            ])
          },
        })

        templateComponent.value = mockComponent
        error.value = err as Error
      }
      finally {
        loading.value = false
      }
    }

    // 其他方法
    const retry = () => loadTemplate(props.template, props.deviceType)
    const refresh = () => {
      templateComponent.value = null
      loadTemplate(props.template, props.deviceType)
    }
    const preload = (templateName: string, deviceType?: DeviceType) => {
      // 预加载逻辑
    }
    const clearCache = () => {
      // 清除缓存逻辑
    }
    const getTemplateInfo = () => {
      // 获取模板信息
    }

    // 计算属性
    const rendererClasses = computed(() => ({
      'template-renderer': true,
      'template-renderer--loading': loading.value,
      'template-renderer--error': !!error.value,
      'template-renderer--loaded': !!templateComponent.value,
      'template-renderer--with-selector': props.showSelector,
      [`template-renderer--${currentDeviceType.value}`]: currentDeviceType.value,
    }))

    const templateClasses = computed(() => ({
      'template-content-inner': true,
      [`template-${props.template}`]: props.template,
      [`device-${currentDeviceType.value}`]: currentDeviceType.value,
    }))

    // 选择器相关计算属性
    const availableTemplates = computed((): TemplateOption[] => {
      if (!props.category || !currentDeviceType.value)
        return []

      const templates = getTemplatesByCategory(props.category, currentDeviceType.value)
      return templates.map(template => ({
        name: template.name,
        displayName: template.displayName || template.name,
        description: template.description,
        version: template.version,
        tags: template.tags,
        thumbnail: template.thumbnail
      }))
    })

    const currentTemplate = computed(() => props.template)

    // 事件处理
    const handleTemplateEvent = (event: any) => {
      // 处理模板组件发出的事件
    }

    const handleTemplateSelect = (templateName: string) => {
      emit('template-selected', templateName)
    }

    const handleSelectorOpen = () => {
      emit('selector-opened')
    }

    const handleSelectorClose = () => {
      emit('selector-closed')
    }

    // 监听器
    watch(() => props.template, async (newTemplate, oldTemplate) => {
      if (newTemplate !== oldTemplate) {
        emit('template-changed', oldTemplate!, newTemplate)
        await loadTemplate(newTemplate, props.deviceType)
      }
    })

    watch(() => props.deviceType, async (newDeviceType, oldDeviceType) => {
      if (newDeviceType !== oldDeviceType) {
        emit('device-changed', oldDeviceType!, newDeviceType!)
        await loadTemplate(props.template, newDeviceType)
      }
    })

    watch(templateComponent, (component) => {
      if (component) {
        emit('template-loaded', component)
      }
    })

    watch(error, (err) => {
      if (err) {
        emit('template-error', err)
      }
    })

    // 生命周期
    onMounted(async () => {
      // 注册外部模板
      if (props.externalTemplates?.length) {
        registerExternalTemplates(props.externalTemplates)
      }

      // 设置扩展选项
      if (props.cacheConfig) {
        setExtensionOptions({
          cache: props.cacheConfig
        })
      }

      // 确保在下一个tick中加载，避免SSR问题
      await nextTick()

      if (!templateComponent.value && !loading.value && props.template) {
        await loadTemplate(props.template, props.deviceType)
      }
    })

    // 暴露方法给父组件
    return {
      retry,
      refresh,
      preload,
      clearCache,
      getTemplateInfo,
      templateComponent,
      loading,
      error,
      currentDeviceType,
      currentTemplate,
      availableTemplates,
      rendererClasses,
      templateClasses,
      handleTemplateEvent,
      handleTemplateSelect,
      handleSelectorOpen,
      handleSelectorClose
    }
  },
  render() {
    const {
      showSelector,
      category,
      selectorConfig,
      loadingConfig,
      templateProps
    } = this.$props

    return (
      <div class={this.rendererClasses}>
        {/* 选择器 - 顶部位置 */}
        {showSelector && category && selectorConfig?.position === 'top' && (
          <div class="template-selector-wrapper template-selector--top">
            <TemplateSelector
              category={category}
              deviceType={this.currentDeviceType}
              currentTemplate={this.currentTemplate}
              templates={this.availableTemplates}
              config={selectorConfig}
              onTemplateSelect={this.handleTemplateSelect}
              onSelectorOpen={this.handleSelectorOpen}
              onSelectorClose={this.handleSelectorClose}
            />
          </div>
        )}

        {/* 模板内容区域 */}
        <div class={[
          "template-content",
          { 'with-header-selector': showSelector && category && selectorConfig?.layout === 'header' }
        ]}>
          {/* 加载状态 */}
          {this.loading && loadingConfig.showLoading && (
            <div class="template-loading">
              {loadingConfig.loadingComponent ? (
                <loadingConfig.loadingComponent />
              ) : (
                <div class="template-loading-default">
                  <div class="loading-spinner" />
                  <p class="loading-text">
                    {loadingConfig.loadingText || '加载模板中...'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 错误状态 */}
          {this.error && !this.loading && (
            <div class="template-error">
              {loadingConfig.errorComponent ? (
                <loadingConfig.errorComponent error={this.error} />
              ) : (
                <div class="template-error-default">
                  <div class="error-icon">⚠️</div>
                  <h3 class="error-title">模板加载失败</h3>
                  <p class="error-message">
                    {loadingConfig.errorText || this.error.message}
                  </p>
                  <button class="retry-button" onClick={this.retry}>
                    重试
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 模板内容 */}
          {this.templateComponent && !this.loading && (
            <this.templateComponent
              {...templateProps}
              class={this.templateClasses}
              onTemplateEvent={this.handleTemplateEvent}
            >
              {/* 通过插槽传递选择器给模板组件（当 layout 为 'slot' 时） */}
              {showSelector && category && selectorConfig?.layout === 'slot' && (
                <template slot="selector">
                  <TemplateSelector
                    category={category}
                    deviceType={this.currentDeviceType}
                    currentTemplate={this.currentTemplate}
                    templates={this.availableTemplates}
                    config={selectorConfig}
                    onTemplateSelect={this.handleTemplateSelect}
                    onSelectorOpen={this.handleSelectorOpen}
                    onSelectorClose={this.handleSelectorClose}
                  />
                </template>
              )}

              {/* 传递其他插槽内容 */}
              {Object.keys(this.$slots).map(name => (
                <template slot={name}>
                  {this.$slots[name]?.()}
                </template>
              ))}
            </this.templateComponent>
          )}

          {/* 空状态 */}
          {!this.loading && !this.templateComponent && (
            <div class="template-empty">
              <p>未找到模板: {this.$props.template}</p>
            </div>
          )}
        </div>

        {/* 选择器 - 底部位置 */}
        {showSelector && category && selectorConfig?.position === 'bottom' && (
          <div class="template-selector-wrapper template-selector--bottom">
            <TemplateSelector
              category={category}
              deviceType={this.currentDeviceType}
              currentTemplate={this.currentTemplate}
              templates={this.availableTemplates}
              config={selectorConfig}
              onTemplateSelect={this.handleTemplateSelect}
              onSelectorOpen={this.handleSelectorOpen}
              onSelectorClose={this.handleSelectorClose}
            />
          </div>
        )}

        {/* 选择器 - 浮层位置 */}
        {showSelector && category && selectorConfig?.position === 'overlay' && (
          <div class="template-selector-overlay">
            <TemplateSelector
              category={category}
              deviceType={this.currentDeviceType}
              currentTemplate={this.currentTemplate}
              templates={this.availableTemplates}
              config={selectorConfig}
              onTemplateSelect={this.handleTemplateSelect}
              onSelectorOpen={this.handleSelectorOpen}
              onSelectorClose={this.handleSelectorClose}
            />
          </div>
        )}
      </div>
    )
  }
})

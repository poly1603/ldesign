<script setup lang="ts">
import type { Component } from 'vue'
import type { DeviceType, TemplateRendererProps, ExternalTemplate } from '../../types'
import { computed, ref, watch, markRaw, h, onMounted } from 'vue'
import { useTemplateRegistry } from '../composables/useTemplateRegistry'
import { useTemplateExtension } from '../composables/useTemplateExtension'
import TemplateSelector, { type TemplateOption } from './TemplateSelector.vue'

// 定义组件属性
interface Props extends TemplateRendererProps {
  template: string
  category: string
  deviceType?: DeviceType
  templateProps?: Record<string, any>
  showSelector?: boolean
  /** 外部模板列表 */
  externalTemplates?: ExternalTemplate[]
  /** 模板扩展选项 */
  extensionOptions?: {
    overrideDefaults?: boolean
    mergeConflicts?: boolean
    priorityStrategy?: 'external' | 'default' | 'version'
  }
  selectorConfig?: {
    disabled?: boolean
    searchable?: boolean
    showThumbnails?: boolean
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
  (e: 'device-changed', oldDevice: DeviceType, newDevice: DeviceType): void
  (e: 'template-event', event: any): void
}

// 组件属性和事件
const props = withDefaults(defineProps<Props>(), {
  showSelector: true,
  templateProps: () => ({}),
  selectorConfig: () => ({
    disabled: false,
    searchable: true,
    showThumbnails: true
  }),
  loadingConfig: () => ({
    showLoading: true,
    loadingText: '加载模板中...',
    errorText: '模板加载失败',
  }),
})

const emit = defineEmits<Emits>()

// 当前选中的模板
const currentTemplate = ref(props.template)

// 简化的模板管理状态
const templateComponent = ref<Component | null>(null)
const loading = ref(false)
const error = ref<Error | null>(null)
// 确保deviceType是字符串值而不是响应式对象
const currentDeviceType = computed(() => props.deviceType || 'desktop')

// 使用模板注册表和扩展
const { getTemplatesByCategory, registerExternalTemplates } = useTemplateRegistry()
const { setExtensionOptions } = useTemplateExtension()

// 计算属性
const availableTemplates = computed((): TemplateOption[] => {
  if (!props.category || !currentDeviceType.value) return []
  
  const templates = getTemplatesByCategory(props.category, currentDeviceType.value)
  return templates.map(template => ({
    name: template.name,
    displayName: template.displayName || template.name,
    description: template.description || '',
    version: template.version,
    tags: template.tags,
    thumbnail: template.thumbnail,
    path: template.path
  }))
})

const categoryLabel = computed(() => {
  const labels: Record<string, string> = {
    auth: '认证',
    login: '登录',
    dashboard: '仪表板',
    user: '用户管理',
    settings: '设置',
    common: '通用组件'
  }
  return labels[props.category] || props.category
})

const deviceTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端'
  }
  return labels[currentDeviceType.value] || currentDeviceType.value
})

const rendererClasses = computed(() => ({
  'template-renderer': true,
  'with-selector': props.showSelector,
  'loading': loading.value,
  'error': !!error.value
}))

// 模板加载方法
const loadTemplate = async (templateName: string, deviceType: DeviceType) => {
  if (!templateName || !deviceType) return

  loading.value = true
  error.value = null

  try {
    // 首先尝试查找外部模板
    const { findExternalTemplate } = useTemplateExtension()
    const externalTemplate = findExternalTemplate(`${templateName}-${deviceType}-default`)

    if (externalTemplate) {
      // 使用外部模板
      templateComponent.value = markRaw(externalTemplate.component)
      // 外部模板加载成功
    } else {
      // 回退到默认的模板加载逻辑
      // 根据模板注册表中的路径加载真实的模板组件
      const { getAllTemplates } = useTemplateRegistry()
      const templates = getAllTemplates()

      // 查找匹配的模板
      const matchedTemplate = templates.value.find((t: any) =>
        t.name === templateName && t.deviceType === deviceType
      )

      if (matchedTemplate && matchedTemplate.path) {
        // 修复路径构建逻辑 - 根据当前文件位置构建正确的相对路径
        // 当前文件位置: packages/template/src/vue/components/TemplateRendererWithSelector.vue
        // 目标路径: packages/template/src/templates/login/desktop/default/index.vue
        // 需要的相对路径: ../../templates/login/desktop/default/index.vue
        const importPath = matchedTemplate.path.replace('src/templates/', '../../templates/')
        const module = await import(/* @vite-ignore */ importPath)

        templateComponent.value = markRaw(module.default)
      } else {
        throw new Error(`未找到模板: ${templateName} (${deviceType})`)
      }
    }
  } catch (err) {
    // 如果真实模板加载失败，创建模拟组件
    // 减少控制台日志输出，只在开发环境显示详细错误
    if (process.env.NODE_ENV === 'development') {
      console.warn('模板加载失败，使用模拟组件:', err)
    }
    const mockComponent = markRaw({
      name: `${templateName}-${deviceType}`,
      render() {
        return h('div', {
          class: 'mock-template',
          style: {
            padding: '2rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: '#f7fafc',
            textAlign: 'center'
          }
        }, [
          h('h3', { style: { margin: '0 0 1rem', color: '#2d3748' } }, `模板: ${templateName}`),
          h('p', { style: { margin: '0 0 0.5rem', color: '#4a5568' } }, `设备类型: ${deviceType}`),
          h('p', { style: { margin: '0', color: '#718096' } }, '这是一个模拟的模板组件'),
          h('div', {
            style: {
              marginTop: '1rem',
              padding: '1rem',
              background: '#edf2f7',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }
          }, [
            h('strong', '模板信息:'),
            h('br'),
            `名称: ${templateName}`,
            h('br'),
            `设备: ${deviceType}`,
            h('br'),
            `时间: ${new Date().toLocaleTimeString()}`
          ])
        ])
      }
    })

    templateComponent.value = mockComponent
    error.value = err as Error
    emit('template-error', err as Error)
  } finally {
    loading.value = false
  }
}

const clearCache = (templateName: string, deviceType: DeviceType) => {
  // 清除模板缓存
}

const preloadTemplate = async (templateName: string, deviceType: DeviceType) => {
  // 预加载模板
}

const getTemplateInfo = (templateName: string, deviceType: DeviceType) => {
  return { name: templateName, deviceType }
}

// 方法
const handleTemplateSelected = async (templateName: string) => {
  const oldTemplate = currentTemplate.value
  currentTemplate.value = templateName
  
  try {
    await loadTemplate(templateName, currentDeviceType.value)
    emit('template-selected', templateName)
    emit('template-changed', oldTemplate, templateName)
  } catch (err) {
    console.error('切换模板失败:', err)
    // 回滚到之前的模板
    currentTemplate.value = oldTemplate
  }
}

const handleTemplateEvent = (event: any) => {
  emit('template-event', event)
}

const retry = async () => {
  await loadTemplate(currentTemplate.value, currentDeviceType.value)
}

const refresh = async () => {
  clearCache(currentTemplate.value, currentDeviceType.value)
  await loadTemplate(currentTemplate.value, currentDeviceType.value)
}

const preload = async (template?: string, deviceType?: DeviceType) => {
  await preloadTemplate(template || currentTemplate.value, deviceType || currentDeviceType.value)
}

// 监听器
watch(() => props.template, (newTemplate: string) => {
  if (newTemplate !== currentTemplate.value) {
    currentTemplate.value = newTemplate
    loadTemplate(newTemplate, currentDeviceType.value)
  }
})

watch(() => props.deviceType, (newDeviceType: DeviceType, oldDeviceType: DeviceType) => {
  if (newDeviceType && newDeviceType !== oldDeviceType) {
    loadTemplate(currentTemplate.value, newDeviceType)
    emit('device-changed', oldDeviceType!, newDeviceType)
  }
})

watch(templateComponent, (component: Component | null) => {
  if (component) {
    emit('template-loaded', component)
  }
})

watch(error, (err: Error | null) => {
  if (err) {
    emit('template-error', err)
  }
})

// 初始化外部模板和扩展选项
onMounted(() => {
  // 注册外部模板
  if (props.externalTemplates && props.externalTemplates.length > 0) {
    registerExternalTemplates(props.externalTemplates)
  }

  // 设置扩展选项
  if (props.extensionOptions) {
    setExtensionOptions(props.extensionOptions)
  }

  // 初始化加载模板
  if (props.template && currentDeviceType.value) {
    loadTemplate(props.template, currentDeviceType.value)
  }
})

// 暴露方法给父组件
defineExpose({
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
  availableTemplates
})
</script>

<template>
  <div class="template-renderer-with-selector" :class="rendererClasses">
    <!-- 模板选择器头部 -->
    <div v-if="showSelector && category" class="template-renderer-header">
      <div class="header-info">
        <span class="category-label">{{ categoryLabel }}</span>
        <span class="device-label">{{ deviceTypeLabel }}</span>
      </div>
      <TemplateSelector
        :current-template="currentTemplate"
        :category="category"
        :device-type="currentDeviceType"
        :available-templates="availableTemplates"
        :disabled="loading || (props.selectorConfig?.disabled || false)"
        @template-selected="handleTemplateSelected"
        @selector-opened="$emit('selector-opened')"
        @selector-closed="$emit('selector-closed')"
      />
    </div>

    <!-- 模板内容区域 -->
    <div class="template-content" :class="{ 'with-selector': showSelector && category }">
      <!-- 加载状态 -->
      <div v-if="loading && loadingConfig.showLoading" class="template-loading">
        <component
          :is="loadingConfig.loadingComponent"
          v-if="loadingConfig.loadingComponent"
        />
        <div v-else class="template-loading-default">
          <div class="loading-spinner" />
          <p class="loading-text">
            {{ loadingConfig.loadingText || '加载模板中...' }}
          </p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error && !loading" class="template-error">
        <component
          :is="loadingConfig.errorComponent"
          v-if="loadingConfig.errorComponent"
          :error="error"
        />
        <div v-else class="template-error-default">
          <div class="error-icon">⚠️</div>
          <p class="error-text">
            {{ loadingConfig.errorText || '模板加载失败' }}
          </p>
          <p class="error-detail">{{ error.message }}</p>
          <button class="retry-button" @click="retry">重试</button>
        </div>
      </div>

      <!-- 模板内容 -->
      <component
        :is="templateComponent"
        v-else-if="templateComponent && !loading"
        v-bind="templateProps"
        @template-event="handleTemplateEvent"
      />

      <!-- 空状态 -->
      <div v-else class="template-empty">
        <div class="empty-icon">📄</div>
        <h3>未选择模板</h3>
        <p>请选择一个模板进行渲染</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-renderer-with-selector {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.template-renderer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.device-label {
  font-size: 0.875rem;
  color: #718096;
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.template-content {
  min-height: 200px;
}

.template-content.with-selector {
  border-top: none;
}

.template-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.template-loading-default {
  text-align: center;
  color: #667eea;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  font-size: 0.875rem;
}

.template-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.template-error-default {
  text-align: center;
  color: #e53e3e;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-text {
  margin: 0 0 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.error-detail {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: #718096;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #c53030;
}

.template-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  text-align: center;
  color: #718096;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.template-empty h3 {
  margin: 0 0 0.5rem;
  color: #4a5568;
  font-size: 1.125rem;
}

.template-empty p {
  margin: 0;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-renderer-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-info {
    justify-content: center;
  }
}
</style>

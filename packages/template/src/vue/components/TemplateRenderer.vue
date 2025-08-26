<script setup lang="ts">
import type { Component } from 'vue'
import type {
  CacheConfig,
  DeviceType,
  TemplateRendererProps,
  ExternalTemplate,
} from '../../types'
import { computed, nextTick, onMounted, ref, watch, markRaw, h } from 'vue'
import TemplateSelector, { type TemplateOption } from './TemplateSelector.vue'
import { useTemplateRegistry } from '../composables/useTemplateRegistry'
import { useTemplateExtension } from '../composables/useTemplateExtension'

// 定义组件属性
interface Props extends TemplateRendererProps {
  template: string
  category?: string
  deviceType?: DeviceType
  scanPaths?: string | string[]
  templateProps?: Record<string, any>
  cacheConfig?: CacheConfig
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
  (e: 'device-changed', oldDevice: DeviceType, newDevice: DeviceType): void
  (e: 'template-event', event: any): void
}

// 组件属性和事件
const props = withDefaults(defineProps<Props>(), {
  showSelector: false,
  templateProps: () => ({}),
  cacheConfig: () => ({ enabled: true }),
  selectorConfig: () => ({
    disabled: false,
    searchable: true,
    showThumbnails: true,
    layout: 'slot'
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

// 使用模板注册表和扩展
const { getTemplatesByCategory, registerExternalTemplates, getAllTemplates } = useTemplateRegistry()
const { setExtensionOptions, findExternalTemplate } = useTemplateExtension()

// 简化的模板状态管理
const templateComponent = ref<Component | null>(null)
const loading = ref(false)
const error = ref<Error | null>(null)
const currentDeviceType = computed(() => props.deviceType || 'desktop')

// 获取组件名称
const getComponentName = (template: string) => {
  if (template === 'login') return 'LoginForm'
  if (template === 'dashboard') return 'Dashboard'
  return template.charAt(0).toUpperCase() + template.slice(1)
}

// 模板加载方法
const loadTemplate = async (templateName: string, deviceType?: DeviceType) => {
  if (!templateName) return

  const targetDeviceType = deviceType || currentDeviceType.value
  loading.value = true
  error.value = null

  try {
    // 首先尝试查找外部模板
    const externalTemplate = findExternalTemplate(`${templateName}-${targetDeviceType}-default`)

    if (externalTemplate) {
      // 使用外部模板
      templateComponent.value = markRaw(externalTemplate.component)
    } else {
      // 回退到默认的模板加载逻辑
      // 根据模板注册表中的路径加载真实的模板组件
      const templates = getAllTemplates()

      // 查找匹配的模板
      const matchedTemplate = templates.value.find((t: any) =>
        t.name === templateName && t.deviceType === targetDeviceType
      )

      if (matchedTemplate && matchedTemplate.path) {
        // 修复路径构建逻辑 - 根据当前文件位置构建正确的相对路径
        const importPath = matchedTemplate.path.replace('src/templates/', '../../templates/')
        const module = await import(/* @vite-ignore */ importPath)

        templateComponent.value = markRaw(module.default)
      } else {
        throw new Error(`未找到模板: ${templateName} (${targetDeviceType})`)
      }
    }
  } catch (err) {
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
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: '#f7fafc',
            textAlign: 'center'
          }
        }, [
          h('h3', { style: { margin: '0 0 1rem', color: '#2d3748' } }, `模板: ${templateName}`),
          h('p', { style: { margin: '0 0 0.5rem', color: '#4a5568' } }, `设备类型: ${targetDeviceType}`),
          h('p', { style: { margin: '0', color: '#718096' } }, '这是一个模拟的模板组件'),
        ])
      }
    })

    templateComponent.value = mockComponent
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

const clearCache = (template?: string, deviceType?: DeviceType) => {
  console.log('清除缓存:', template, deviceType)
}

const preloadTemplate = async (template?: string, deviceType?: DeviceType) => {
  console.log('预加载模板:', template, deviceType)
}

const getTemplateInfo = (template?: string, deviceType?: DeviceType) => {
  return { name: template, deviceType }
}

// 响应式数据
const retryCount = ref(0)
const maxRetries = 3

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
  'template-content': true,
  [`template-content--${props.template}`]: props.template,
  [`template-content--${currentDeviceType.value}`]: currentDeviceType.value,
}))

// 选择器相关计算属性
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
  return labels[props.category || ''] || props.category
})

const deviceTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端'
  }
  return labels[currentDeviceType.value] || currentDeviceType.value
})

// 监听器
watch(() => props.template, async (newTemplate, oldTemplate) => {
  if (newTemplate !== oldTemplate) {
    emit('template-changed', oldTemplate, newTemplate)
    retryCount.value = 0
    await loadTemplate(newTemplate, props.deviceType)
  }
})

watch(() => props.deviceType, async (newDeviceType, oldDeviceType) => {
  if (newDeviceType && newDeviceType !== oldDeviceType) {
    emit('device-changed', oldDeviceType!, newDeviceType)
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

// 方法
async function retry() {
  if (retryCount.value < maxRetries) {
    retryCount.value++
    await loadTemplate(props.template, props.deviceType)
  }
}

function handleTemplateEvent(event: any) {
  emit('template-event', event)
}

async function refresh() {
  clearCache(props.template, props.deviceType)
  await loadTemplate(props.template, props.deviceType)
}

async function preload(template?: string, deviceType?: DeviceType) {
  await preloadTemplate(template || props.template, deviceType || props.deviceType)
}

// 选择器事件处理
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

const handleSelectorOpened = () => {
  emit('selector-opened')
}

const handleSelectorClosed = () => {
  emit('selector-closed')
}

// 生命周期
onMounted(async () => {
  // 注册外部模板
  if (props.externalTemplates && props.externalTemplates.length > 0) {
    registerExternalTemplates(props.externalTemplates)
  }

  // 设置扩展选项
  if (props.extensionOptions) {
    setExtensionOptions(props.extensionOptions)
  }

  // 确保在下一个tick中加载，避免SSR问题
  await nextTick()

  if (!templateComponent.value && !loading.value && props.template) {
    await loadTemplate(props.template, props.deviceType)
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
  availableTemplates,
})
</script>

<template>
  <div class="template-renderer" :class="rendererClasses">
    <!-- 头部选择器（当 layout 为 'header' 时显示） -->
    <div v-if="showSelector && category && selectorConfig?.layout === 'header'" class="template-renderer-header">
      <div class="header-info">
        <span class="category-label">{{ categoryLabel }}</span>
        <span class="device-label">{{ deviceTypeLabel }}</span>
      </div>
      <TemplateSelector
        :current-template="currentTemplate"
        :category="category"
        :device-type="currentDeviceType"
        :available-templates="availableTemplates"
        :disabled="loading || (selectorConfig?.disabled || false)"
        :searchable="selectorConfig?.searchable"
        :show-thumbnails="selectorConfig?.showThumbnails"
        @template-selected="handleTemplateSelected"
        @selector-opened="handleSelectorOpened"
        @selector-closed="handleSelectorClosed"
      />
    </div>

    <!-- 模板内容区域 -->
    <div class="template-content" :class="{ 'with-header-selector': showSelector && category && selectorConfig?.layout === 'header' }">
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
          <div class="error-icon">
            ⚠️
          </div>
          <p class="error-text">
            {{ loadingConfig.errorText || '模板加载失败' }}
          </p>
          <p class="error-detail">
            {{ error.message }}
          </p>
          <button class="retry-button" @click="retry">
            重试
          </button>
        </div>
      </div>

      <!-- 模板内容 -->
      <component
        :is="templateComponent"
        v-else-if="templateComponent && !loading"
        v-bind="templateProps"
        :class="templateClasses"
        @template-event="handleTemplateEvent"
      >
        <!-- 通过插槽传递选择器给模板组件（当 layout 为 'slot' 时） -->
        <template v-if="showSelector && category && selectorConfig?.layout === 'slot'" #selector>
          <TemplateSelector
            :current-template="currentTemplate"
            :category="category"
            :device-type="currentDeviceType"
            :available-templates="availableTemplates"
            :disabled="loading || (selectorConfig?.disabled || false)"
            :searchable="selectorConfig?.searchable"
            :show-thumbnails="selectorConfig?.showThumbnails"
            @template-selected="handleTemplateSelected"
            @selector-opened="handleSelectorOpened"
            @selector-closed="handleSelectorClosed"
          />
        </template>

        <!-- 传递其他插槽内容 -->
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </component>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="template-empty">
        <p>未找到模板: {{ template }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-renderer {
  position: relative;
  width: 100%;
  min-height: 100px;
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
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
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
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}

.error-text {
  color: #e74c3c;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.error-detail {
  color: #666;
  font-size: 14px;
  margin: 0 0 1.5rem;
  word-break: break-word;
}

.retry-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #2980b9;
}

.template-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.template-content {
  width: 100%;
}

/* 头部选择器样式 */
.template-renderer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
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

.template-content.with-header-selector {
  border-top: none;
  border-radius: 0 0 8px 8px;
}

/* 设备类型特定样式 */
.template-renderer--mobile {
  /* 移动设备特定样式 */
}

.template-renderer--tablet {
  /* 平板设备特定样式 */
}

.template-renderer--desktop {
  /* 桌面设备特定样式 */
}

/* 响应式样式 */
@media (max-width: 768px) {
  .template-loading,
  .template-error,
  .template-empty {
    min-height: 150px;
    padding: 1rem;
  }

  .loading-spinner {
    width: 30px;
    height: 30px;
  }

  .error-icon {
    font-size: 36px;
  }

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

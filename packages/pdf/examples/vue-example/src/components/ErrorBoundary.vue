<script setup lang="ts">
import type { ErrorBoundaryProps } from '../types'
import { computed, nextTick, onErrorCaptured, ref } from 'vue'

// Props
const props = withDefaults(defineProps<ErrorBoundaryProps>(), {
  showDetails: true,
  showRetry: true,
  showReload: true,
  autoRetry: false,
  maxRetries: 3,
  retryDelay: 1000,
  theme: 'auto',
})

// Emits
const emit = defineEmits<{
  error: [error: Error, errorInfo: any]
  retry: []
  reload: []
  reset: []
}>()

// 本地状态
const hasError = ref(false)
const currentError = ref<Error | null>(null)
const errorDetails = ref<any>(null)
const retryCount = ref(0)
const retrying = ref(false)

// 计算属性
const themeClasses = computed(() => ({
  'error-boundary--dark': props.theme === 'dark',
  'error-boundary--light': props.theme === 'light',
}))

const errorTitle = computed(() => {
  if (currentError.value) {
    return getErrorTitle(currentError.value)
  }
  return '发生了未知错误'
})

const errorMessage = computed(() => {
  if (currentError.value) {
    return getErrorMessage(currentError.value)
  }
  return '应用程序遇到了一个意外错误，请尝试刷新页面或联系技术支持。'
})

const suggestions = computed(() => {
  if (currentError.value) {
    return getErrorSuggestions(currentError.value)
  }
  return []
})

// 错误处理
onErrorCaptured((error: Error, instance, errorInfo) => {
  console.error('ErrorBoundary caught an error:', error)
  console.error('Error info:', errorInfo)
  console.error('Component instance:', instance)

  // 设置错误状态
  hasError.value = true
  currentError.value = error
  errorDetails.value = {
    stack: error.stack,
    componentStack: errorInfo,
    props: instance?.props,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  // 发送错误事件
  emit('error', error, errorDetails.value)

  // 自动重试
  if (props.autoRetry && retryCount.value < props.maxRetries) {
    setTimeout(() => {
      handleRetry()
    }, props.retryDelay)
  }

  // 阻止错误继续传播
  return false
})

// 方法
function getErrorTitle(error: Error): string {
  if (error.name === 'ChunkLoadError') {
    return '资源加载失败'
  }
  if (error.name === 'TypeError') {
    return '类型错误'
  }
  if (error.name === 'ReferenceError') {
    return '引用错误'
  }
  if (error.name === 'SyntaxError') {
    return '语法错误'
  }
  if (error.message.includes('Network')) {
    return '网络错误'
  }
  if (error.message.includes('Permission')) {
    return '权限错误'
  }
  return '应用程序错误'
}

function getErrorMessage(error: Error): string {
  if (error.name === 'ChunkLoadError') {
    return '无法加载应用程序资源，这可能是由于网络问题或服务器更新导致的。'
  }
  if (error.message.includes('Network')) {
    return '网络连接出现问题，请检查您的网络连接并重试。'
  }
  if (error.message.includes('Permission')) {
    return '您没有执行此操作的权限，请联系管理员。'
  }

  // 返回原始错误消息（如果不太技术性）
  if (error.message && error.message.length < 200 && !error.message.includes('at ')) {
    return error.message
  }

  return '应用程序遇到了一个意外错误，请尝试刷新页面。如果问题持续存在，请联系技术支持。'
}

function getErrorSuggestions(error: Error): string[] {
  const suggestions: string[] = []

  if (error.name === 'ChunkLoadError') {
    suggestions.push('刷新页面重新加载资源')
    suggestions.push('清除浏览器缓存')
    suggestions.push('检查网络连接')
  }
  else if (error.message.includes('Network')) {
    suggestions.push('检查网络连接')
    suggestions.push('尝试使用其他网络')
    suggestions.push('稍后再试')
  }
  else if (error.message.includes('Permission')) {
    suggestions.push('联系管理员获取权限')
    suggestions.push('使用其他账户登录')
  }
  else {
    suggestions.push('刷新页面')
    suggestions.push('清除浏览器缓存')
    suggestions.push('尝试使用其他浏览器')
    suggestions.push('联系技术支持')
  }

  return suggestions
}

async function handleRetry() {
  if (retrying.value)
    return

  retrying.value = true
  retryCount.value++

  try {
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 500))

    // 重置错误状态
    hasError.value = false
    currentError.value = null
    errorDetails.value = null

    // 触发重试事件
    emit('retry')

    // 等待下一个tick确保组件重新渲染
    await nextTick()
  }
  catch (error) {
    console.error('Retry failed:', error)
  }
  finally {
    retrying.value = false
  }
}

function handleReload() {
  emit('reload')
  window.location.reload()
}

async function handleCopyError() {
  if (!errorDetails.value)
    return

  const errorInfo = {
    error: {
      name: currentError.value?.name,
      message: currentError.value?.message,
      stack: currentError.value?.stack,
    },
    details: errorDetails.value,
    timestamp: new Date().toISOString(),
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2))
    // 可以添加一个提示消息
    console.log('错误信息已复制到剪贴板')
  }
  catch (error) {
    console.error('复制失败:', error)
    // 降级方案：选择文本
    const textArea = document.createElement('textarea')
    textArea.value = JSON.stringify(errorInfo, null, 2)
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

function reset() {
  hasError.value = false
  currentError.value = null
  errorDetails.value = null
  retryCount.value = 0
  retrying.value = false
  emit('reset')
}

// 暴露方法给父组件
defineExpose({
  reset,
  hasError: () => hasError.value,
  getError: () => currentError.value,
  getErrorDetails: () => errorDetails.value,
})
</script>

<template>
  <div class="error-boundary" :class="themeClasses">
    <slot v-if="!hasError" />

    <!-- 错误显示界面 -->
    <div v-else class="error-display">
      <!-- 错误图标 -->
      <div class="error-icon">
        <svg class="icon icon--error" viewBox="0 0 24 24">
          <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
        </svg>
      </div>

      <!-- 错误信息 -->
      <div class="error-content">
        <h2 class="error-title">
          {{ errorTitle }}
        </h2>
        <p class="error-message">
          {{ errorMessage }}
        </p>

        <!-- 错误详情 -->
        <div v-if="showDetails && errorDetails" class="error-details">
          <details class="error-details-toggle">
            <summary class="error-details-summary">
              <span>查看详细信息</span>
              <svg class="chevron-icon" viewBox="0 0 24 24">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
              </svg>
            </summary>
            <div class="error-details-content">
              <div class="error-stack">
                <h4>错误堆栈:</h4>
                <pre class="stack-trace">{{ errorDetails.stack }}</pre>
              </div>
              <div v-if="errorDetails.componentStack" class="error-info">
                <h4>组件堆栈:</h4>
                <pre class="component-stack">{{ errorDetails.componentStack }}</pre>
              </div>
              <div v-if="errorDetails.props" class="error-props">
                <h4>组件属性:</h4>
                <pre class="props-info">{{ JSON.stringify(errorDetails.props, null, 2) }}</pre>
              </div>
            </div>
          </details>
        </div>

        <!-- 错误操作 -->
        <div class="error-actions">
          <button
            class="btn btn-primary"
            :disabled="retrying"
            @click="handleRetry"
          >
            <svg v-if="retrying" class="icon icon--spin" viewBox="0 0 24 24">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
            </svg>
            <svg v-else class="icon" viewBox="0 0 24 24">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            {{ retrying ? '重试中...' : '重试' }}
          </button>

          <button
            class="btn btn-secondary"
            @click="handleReload"
          >
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </svg>
            刷新页面
          </button>

          <button
            v-if="showDetails"
            class="btn btn-outline"
            @click="handleCopyError"
          >
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
            </svg>
            复制错误信息
          </button>
        </div>

        <!-- 建议操作 -->
        <div v-if="suggestions.length > 0" class="error-suggestions">
          <h4>建议解决方案:</h4>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
  font-family: var(--pdf-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.error-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--pdf-spacing-large, 24px);
  text-align: center;
  background: var(--pdf-color-background, #ffffff);
  color: var(--pdf-color-text, #212121);
}

/* 错误图标 */
.error-icon {
  margin-bottom: var(--pdf-spacing-large, 24px);
}

.icon {
  width: 64px;
  height: 64px;
  transition: all 0.3s ease;
}

.icon--error {
  fill: #f44336;
  animation: shake 0.5s ease-in-out;
}

.icon--spin {
  animation: spin 1s linear infinite;
}

/* 错误内容 */
.error-content {
  max-width: 600px;
  width: 100%;
}

.error-title {
  margin: 0 0 var(--pdf-spacing-medium, 16px) 0;
  font-size: var(--pdf-font-size-xlarge, 24px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.error-message {
  margin: 0 0 var(--pdf-spacing-large, 24px) 0;
  font-size: var(--pdf-font-size-medium, 16px);
  line-height: 1.6;
  color: var(--pdf-color-secondary, #757575);
}

/* 错误详情 */
.error-details {
  margin-bottom: var(--pdf-spacing-large, 24px);
  text-align: left;
}

.error-details-toggle {
  border: 1px solid var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius, 4px);
  overflow: hidden;
}

.error-details-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pdf-spacing-medium, 16px);
  background: var(--pdf-color-surface, #f5f5f5);
  cursor: pointer;
  font-weight: 500;
  color: var(--pdf-color-text, #212121);
  transition: background-color 0.2s ease;
}

.error-details-summary:hover {
  background: var(--pdf-color-border, #e0e0e0);
}

.chevron-icon {
  width: 20px;
  height: 20px;
  fill: var(--pdf-color-secondary, #757575);
  transition: transform 0.2s ease;
}

.error-details-toggle[open] .chevron-icon {
  transform: rotate(180deg);
}

.error-details-content {
  padding: var(--pdf-spacing-medium, 16px);
  background: var(--pdf-color-background, #ffffff);
}

.error-stack,
.error-info,
.error-props {
  margin-bottom: var(--pdf-spacing-medium, 16px);
}

.error-stack h4,
.error-info h4,
.error-props h4 {
  margin: 0 0 var(--pdf-spacing-small, 8px) 0;
  font-size: var(--pdf-font-size-small, 14px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.stack-trace,
.component-stack,
.props-info {
  background: var(--pdf-color-surface, #f5f5f5);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius, 4px);
  padding: var(--pdf-spacing-small, 8px);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--pdf-color-text, #212121);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 错误操作 */
.error-actions {
  display: flex;
  gap: var(--pdf-spacing-small, 8px);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--pdf-spacing-large, 24px);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--pdf-spacing-small, 8px);
  padding: 12px 20px;
  border: none;
  border-radius: var(--pdf-border-radius, 4px);
  cursor: pointer;
  font-size: var(--pdf-font-size-medium, 14px);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn .icon {
  width: 16px;
  height: 16px;
}

.btn-primary {
  background: var(--pdf-color-primary, #1976d2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--pdf-color-accent, #2196f3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-secondary {
  background: var(--pdf-color-secondary, #757575);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #616161;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(117, 117, 117, 0.3);
}

.btn-outline {
  background: transparent;
  color: var(--pdf-color-primary, #1976d2);
  border: 1px solid var(--pdf-color-primary, #1976d2);
}

.btn-outline:hover:not(:disabled) {
  background: var(--pdf-color-primary, #1976d2);
  color: white;
  transform: translateY(-1px);
}

/* 建议操作 */
.error-suggestions {
  text-align: left;
  background: var(--pdf-color-surface, #f5f5f5);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius, 4px);
  padding: var(--pdf-spacing-medium, 16px);
}

.error-suggestions h4 {
  margin: 0 0 var(--pdf-spacing-small, 8px) 0;
  font-size: var(--pdf-font-size-medium, 14px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.suggestions-list {
  margin: 0;
  padding-left: var(--pdf-spacing-medium, 16px);
  list-style: none;
}

.suggestion-item {
  position: relative;
  margin-bottom: var(--pdf-spacing-small, 8px);
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
  line-height: 1.4;
}

.suggestion-item::before {
  content: '•';
  position: absolute;
  left: -12px;
  color: var(--pdf-color-primary, #1976d2);
  font-weight: bold;
}

/* 动画 */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 主题样式 */
.error-boundary--dark {
  --pdf-color-background: #121212;
  --pdf-color-surface: #1e1e1e;
  --pdf-color-text: #ffffff;
  --pdf-color-secondary: #b0bec5;
  --pdf-color-border: #333333;
  --pdf-color-primary: #90caf9;
  --pdf-color-accent: #64b5f6;
}

.error-boundary--light {
  --pdf-color-background: #ffffff;
  --pdf-color-surface: #f5f5f5;
  --pdf-color-text: #212121;
  --pdf-color-secondary: #757575;
  --pdf-color-border: #e0e0e0;
  --pdf-color-primary: #1976d2;
  --pdf-color-accent: #2196f3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-display {
    padding: var(--pdf-spacing-medium, 16px);
    min-height: 300px;
  }

  .icon {
    width: 48px;
    height: 48px;
  }

  .error-title {
    font-size: var(--pdf-font-size-large, 20px);
  }

  .error-message {
    font-size: var(--pdf-font-size-small, 14px);
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .error-display {
    padding: var(--pdf-spacing-small, 8px);
  }

  .error-content {
    max-width: 100%;
  }

  .error-details-content {
    padding: var(--pdf-spacing-small, 8px);
  }

  .stack-trace,
  .component-stack,
  .props-info {
    font-size: 10px;
    padding: var(--pdf-spacing-small, 8px);
  }
}

/* 紧凑模式 */
.error-boundary--compact .error-display {
  min-height: 200px;
  padding: var(--pdf-spacing-medium, 16px);
}

.error-boundary--compact .icon {
  width: 32px;
  height: 32px;
}

.error-boundary--compact .error-title {
  font-size: var(--pdf-font-size-medium, 16px);
}

.error-boundary--compact .error-message {
  font-size: var(--pdf-font-size-small, 12px);
}

.error-boundary--compact .btn {
  padding: 8px 16px;
  font-size: var(--pdf-font-size-small, 12px);
  min-width: 80px;
}
</style>

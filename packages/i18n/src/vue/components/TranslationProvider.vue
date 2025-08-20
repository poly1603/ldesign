<!--
  TranslationProvider 组件

  提供翻译上下文的容器组件，支持：
  - 作用域翻译
  - 命名空间隔离
  - 错误边界
  - 加载状态
  - 回退机制
-->

<script setup lang="ts">
import type { TranslationParams } from '../../core/types'
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useI18n } from '../composables'

/**
 * 组件属性
 */
interface Props {
  /** 命名空间 */
  namespace?: string
  /** 是否启用错误边界 */
  errorBoundary?: boolean
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 自定义加载文本 */
  loadingText?: string
  /** 自定义错误标题 */
  errorTitle?: string
  /** 自定义错误消息 */
  errorMessage?: string
  /** 自定义重试文本 */
  retryText?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 回退语言 */
  fallbackLocale?: string
}

const props = withDefaults(defineProps<Props>(), {
  namespace: '',
  errorBoundary: true,
  showLoading: true,
  loadingText: 'Loading translations...',
  errorTitle: 'Translation Error',
  errorMessage: 'Failed to load translations',
  retryText: 'Retry',
  debug: false,
  fallbackLocale: 'en',
})

const emit = defineEmits<Emits>()

/**
 * 组件事件
 */
interface Emits {
  (e: 'loading', isLoading: boolean): void
  (e: 'error', error: Error): void
  (e: 'loaded', namespace: string): void
  (e: 'retry'): void
}

// 使用 I18n
const { t, locale } = useI18n()

// 状态管理
const isLoading = ref(false)
const error = ref<Error | null>(null)
const hasError = computed(() => !!error.value)
const currentLocale = computed(() => locale.value)

// 计算属性
const providerClasses = computed(() => ({
  'translation-provider--loading': isLoading.value,
  'translation-provider--error': hasError.value,
  'translation-provider--debug': props.debug,
}))

const defaultErrorMessage = computed(() => {
  return props.errorMessage || t('common.error', {}, { defaultValue: 'An error occurred' })
})

/**
 * 作用域翻译函数
 */
function scopedT(key: string, params?: TranslationParams, options?: any) {
  try {
    const fullKey = props.namespace ? `${props.namespace}.${key}` : key

    if (props.debug) {
      console.warn(`[TranslationProvider] Translating: ${fullKey}`, { params, options })
    }

    return t(fullKey, params, {
      ...options,
      fallbackLocale: props.fallbackLocale,
    })
  }
  catch (err) {
    if (props.errorBoundary) {
      handleError(err as Error)
      return key // 返回原始键作为回退
    }
    throw err
  }
}

/**
 * 错误处理
 */
function handleError(err: Error) {
  error.value = err
  emit('error', err)

  if (props.debug) {
    console.error('[TranslationProvider] Error:', err)
  }
}

/**
 * 重试函数
 */
async function retry() {
  error.value = null
  isLoading.value = true
  emit('retry')

  try {
    // 重新加载命名空间（如果需要）
    if (props.namespace) {
      await loadNamespace(props.namespace)
    }

    emit('loaded', props.namespace)
  }
  catch (err) {
    handleError(err as Error)
  }
  finally {
    isLoading.value = false
    emit('loading', false)
  }
}

/**
 * 加载命名空间
 */
async function loadNamespace(namespace: string) {
  if (!namespace)
    return

  // 这里可以实现动态加载命名空间的逻辑
  // 例如从服务器加载特定的翻译文件

  if (props.debug) {
    console.warn(`[TranslationProvider] Loading namespace: ${namespace}`)
  }

  // 模拟加载过程
  await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * 初始化
 */
async function initialize() {
  if (!props.showLoading)
    return

  isLoading.value = true
  emit('loading', true)

  try {
    await loadNamespace(props.namespace)
    emit('loaded', props.namespace)
  }
  catch (err) {
    handleError(err as Error)
  }
  finally {
    isLoading.value = false
    emit('loading', false)
  }
}

// 监听命名空间变化
watch(() => props.namespace, (newNamespace) => {
  if (newNamespace) {
    initialize()
  }
}, { immediate: true })

// 监听语言变化
watch(locale, () => {
  if (props.namespace) {
    initialize()
  }
})

// 提供作用域翻译函数
provide('scopedT', scopedT)
provide('translationNamespace', props.namespace)

// 组件挂载时初始化
onMounted(() => {
  if (props.namespace) {
    initialize()
  }
})
</script>

<template>
  <div class="translation-provider" :class="providerClasses">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="translation-provider__loading">
      <slot name="loading">
        <div class="loading-spinner">
          <div class="spinner" />
          <span class="loading-text">{{ loadingText }}</span>
        </div>
      </slot>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="translation-provider__error">
      <slot name="error" :error="error" :retry="retry">
        <div class="error-container">
          <div class="error-icon">
            ⚠️
          </div>
          <div class="error-content">
            <h3 class="error-title">
              {{ errorTitle }}
            </h3>
            <p class="error-message">
              {{ error?.message || defaultErrorMessage }}
            </p>
            <button class="retry-button" @click="retry">
              {{ retryText }}
            </button>
          </div>
        </div>
      </slot>
    </div>

    <!-- 正常内容 -->
    <div v-else class="translation-provider__content">
      <slot :t="scopedT" :locale="currentLocale" :namespace="namespace" />
    </div>
  </div>
</template>

<style scoped>
.translation-provider {
  position: relative;
}

.translation-provider--debug {
  border: 2px dashed #007acc;
  padding: 8px;
  margin: 4px;
}

.translation-provider--debug::before {
  content: 'TranslationProvider: ' attr(data-namespace);
  position: absolute;
  top: -12px;
  left: 8px;
  background: #007acc;
  color: white;
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 2px;
}

.translation-provider__loading,
.translation-provider__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 20px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 14px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-title {
  margin: 0;
  color: #d32f2f;
  font-size: 18px;
  font-weight: 600;
}

.error-message {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.retry-button {
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #005a9e;
}

.retry-button:active {
  background: #004080;
}
</style>

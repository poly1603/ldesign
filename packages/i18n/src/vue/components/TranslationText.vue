<!--
  TranslationText 组件

  智能翻译文本组件，支持：
  - 动态翻译键
  - 参数插值
  - 复数处理
  - HTML渲染
  - 回退机制
  - 加载状态
  - 错误处理
  - 性能优化
-->

<template>
  <component
    :is="tag"
    :class="textClasses"
    :title="showTooltip ? tooltipText : undefined"
    v-bind="$attrs"
  >
    <!-- 加载状态 -->
    <template v-if="isLoading">
      <slot name="loading">
        <span class="translation-loading">
          <span class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </span>
      </slot>
    </template>

    <!-- 错误状态 -->
    <template v-else-if="hasError && showError">
      <slot name="error" :error="error" :fallback="fallbackText">
        <span class="translation-error" :title="error?.message">
          {{ fallbackText }}
        </span>
      </slot>
    </template>

    <!-- 正常翻译内容 -->
    <template v-else>
      <!-- HTML 渲染模式 -->
      <span
        v-if="html"
        class="translation-html"
        v-html="translatedText"
      />

      <!-- 普通文本模式 -->
      <template v-else>
        {{ translatedText }}
      </template>
    </template>

    <!-- 调试信息 */
    <span v-if="debug" class="translation-debug">
      [{{ resolvedKey }}{{ params ? ` | ${JSON.stringify(params)}` : '' }}]
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from '../composables'
import type { TranslationParams } from '../../core/types'

/**
 * 组件属性
 */
interface Props {
  /** 翻译键 */
  keyPath: string
  /** 翻译参数 */
  params?: TranslationParams
  /** 复数计数 */
  count?: number
  /** 命名空间前缀 */
  namespace?: string
  /** HTML标签类型 */
  tag?: string
  /** 是否渲染HTML */
  html?: boolean
  /** 回退文本 */
  fallback?: string
  /** 是否显示错误 */
  showError?: boolean
  /** 是否显示工具提示 */
  showTooltip?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否启用缓存 */
  cache?: boolean
  /** 自定义CSS类 */
  customClass?: string | string[]
  /** 延迟加载（毫秒） */
  delay?: number
  /** 是否监听语言变化 */
  reactive?: boolean
  /** 转换函数 */
  transform?: (text: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'span',
  html: false,
  showError: true,
  showTooltip: false,
  debug: false,
  cache: true,
  delay: 0,
  reactive: true,
})

/**
 * 组件事件
 */
interface Emits {
  (e: 'translated', text: string, key: string): void
  (e: 'error', error: Error, key: string): void
  (e: 'loading', isLoading: boolean): void
}

const emit = defineEmits<Emits>()

// 使用 I18n
const { t, locale, exists } = useI18n()

// 组件状态
const isLoading = ref(false)
const error = ref<Error | null>(null)
const cachedTranslations = ref<Map<string, string>>(new Map())

// 计算属性
const resolvedKey = computed(() => {
  return props.namespace ? `${props.namespace}.${props.keyPath}` : props.keyPath
})

const hasError = computed(() => !!error.value)

const textClasses = computed(() => {
  const classes = ['translation-text']

  if (isLoading.value) classes.push('translation-text--loading')
  if (hasError.value) classes.push('translation-text--error')
  if (props.html) classes.push('translation-text--html')
  if (props.debug) classes.push('translation-text--debug')

  if (props.customClass) {
    if (Array.isArray(props.customClass)) {
      classes.push(...props.customClass)
    }
    else {
      classes.push(props.customClass)
    }
  }

  return classes
})

const cacheKey = computed(() => {
  const key = resolvedKey.value
  const params = props.params ? JSON.stringify(props.params) : ''
  const count = props.count !== undefined ? props.count.toString() : ''
  const lang = locale.value

  return `${lang}:${key}:${params}:${count}`
})

const fallbackText = computed(() => {
  return props.fallback || props.keyPath
})

const tooltipText = computed(() => {
  if (!props.showTooltip) return ''

  const parts = [
    `Key: ${resolvedKey.value}`,
    `Locale: ${locale.value}`,
  ]

  if (props.params) {
    parts.push(`Params: ${JSON.stringify(props.params)}`)
  }

  if (props.count !== undefined) {
    parts.push(`Count: ${props.count}`)
  }

  return parts.join('\n')
})

/**
 * 执行翻译
 */
const performTranslation = async (): Promise<string> => {
  const key = resolvedKey.value

  // 检查缓存
  if (props.cache && cachedTranslations.value.has(cacheKey.value)) {
    return cachedTranslations.value.get(cacheKey.value)!
  }

  // 检查键是否存在
  if (!exists(key)) {
    throw new Error(`Translation key "${key}" not found`)
  }

  try {
    // 构建翻译参数
    const translationParams = { ...props.params }
    if (props.count !== undefined) {
      translationParams.count = props.count
    }

    // 执行翻译
    let result = t(key, translationParams)

    // 应用转换函数
    if (props.transform) {
      result = props.transform(result)
    }

    // 缓存结果
    if (props.cache) {
      cachedTranslations.value.set(cacheKey.value, result)
    }

    return result
  }
  catch (err) {
    throw new Error(`Translation failed for key "${key}": ${err}`)
  }
}

/**
 * 翻译文本
 */
const translatedText = ref('')

/**
 * 更新翻译
 */
const updateTranslation = async () => {
  if (!props.keyPath) {
    translatedText.value = ''
    return
  }

  // 延迟加载
  if (props.delay > 0) {
    isLoading.value = true
    emit('loading', true)

    await new Promise(resolve => setTimeout(resolve, props.delay))
  }

  try {
    error.value = null

    const result = await performTranslation()
    translatedText.value = result

    emit('translated', result, resolvedKey.value)
  }
  catch (err) {
    const translationError = err as Error
    error.value = translationError
    translatedText.value = fallbackText.value

    emit('error', translationError, resolvedKey.value)
  }
  finally {
    isLoading.value = false
    emit('loading', false)
  }
}

/**
 * 清除缓存
 */
const clearCache = () => {
  cachedTranslations.value.clear()
}

/**
 * 重新翻译
 */
const retranslate = () => {
  if (props.cache) {
    cachedTranslations.value.delete(cacheKey.value)
  }
  updateTranslation()
}

// 监听器
watch(
  [() => props.keyPath, () => props.params, () => props.count, () => props.namespace],
  updateTranslation,
  { immediate: true }
)

// 监听语言变化
if (props.reactive) {
  watch(locale, () => {
    updateTranslation()
  })
}

// 组件挂载时初始化
onMounted(() => {
  updateTranslation()
})

// 暴露方法给父组件
defineExpose({
  retranslate,
  clearCache,
  translatedText: computed(() => translatedText.value),
  isLoading: computed(() => isLoading.value),
  hasError: computed(() => hasError.value),
  error: computed(() => error.value),
})
</script>

<style scoped>
.translation-text {
  display: inline;
}

.translation-text--loading {
  opacity: 0.7;
}

.translation-text--error {
  color: #d32f2f;
}

.translation-text--debug {
  position: relative;
}

.translation-loading {
  display: inline-flex;
  align-items: center;
}

.loading-dots {
  display: inline-flex;
  gap: 2px;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.translation-error {
  text-decoration: underline;
  text-decoration-style: wavy;
  text-decoration-color: #d32f2f;
}

.translation-debug {
  font-size: 0.7em;
  color: #666;
  font-family: monospace;
  margin-left: 4px;
  opacity: 0.8;
}

.translation-html {
  display: contents;
}

/* 调试模式样式 */
.translation-text--debug {
  outline: 1px dashed #007acc;
  outline-offset: 2px;
}

.translation-text--debug:hover {
  background: rgba(0, 122, 204, 0.1);
}

/* 错误状态动画 */
.translation-text--error {
  animation: error-shake 0.5s ease-in-out;
}

@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* 加载状态动画 */
.translation-text--loading {
  animation: loading-pulse 1.5s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>

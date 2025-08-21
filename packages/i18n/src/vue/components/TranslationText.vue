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
-->

<script setup lang="ts">
import type { TranslationParams } from '../../core/types'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from '../composables'

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
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 是否显示工具提示 */
  showTooltip?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
  /** 自定义CSS类 */
  class?: string | string[] | Record<string, boolean>
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'span',
  html: false,
  showError: true,
  showLoading: true,
  showTooltip: false,
  debug: false,
})

const emit = defineEmits<{
  translated: [text: string, key: string]
  error: [error: Error, key: string]
  loading: [key: string]
}>()

// 使用I18n组合式API
const { t, exists } = useI18n()

// 状态管理
const isLoading = ref(false)
const error = ref<Error | null>(null)

// 解析翻译键
const resolvedKey = computed(() => {
  if (props.namespace) {
    return `${props.namespace}.${props.keyPath}`
  }
  return props.keyPath
})

// 检查翻译键是否存在
const keyExists = computed(() => {
  return exists(resolvedKey.value)
})

// 是否有错误
const hasError = computed(() => {
  return error.value !== null || !keyExists.value
})

// 回退文本
const fallbackText = computed(() => {
  return props.fallback || resolvedKey.value
})

// 翻译文本
const translatedText = computed(() => {
  if (hasError.value && !props.showError) {
    return fallbackText.value
  }

  try {
    isLoading.value = true
    error.value = null

    const translationParams = { ...props.params }
    if (props.count !== undefined) {
      translationParams.count = props.count
    }

    const result = t(resolvedKey.value, translationParams, {
      defaultValue: fallbackText.value,
    })

    emit('translated', result, resolvedKey.value)
    return result
  }
  catch (err) {
    const translationError = err instanceof Error ? err : new Error(String(err))
    error.value = translationError
    emit('error', translationError, resolvedKey.value)
    return fallbackText.value
  }
  finally {
    isLoading.value = false
  }
})

// 工具提示文本
const tooltipText = computed(() => {
  if (props.debug) {
    return `Key: ${resolvedKey.value}${props.params ? ` | Params: ${JSON.stringify(props.params)}` : ''}`
  }
  return translatedText.value
})

// CSS类
const textClasses = computed(() => {
  const classes = ['translation-text']

  if (isLoading.value) {
    classes.push('is-loading')
  }

  if (hasError.value) {
    classes.push('has-error')
  }

  if (props.html) {
    classes.push('is-html')
  }

  if (props.debug) {
    classes.push('is-debug')
  }

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    }
    else if (Array.isArray(props.class)) {
      classes.push(...props.class)
    }
    else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) {
          classes.push(key)
        }
      })
    }
  }

  return classes
})

// 监听翻译键变化
watch(resolvedKey, () => {
  emit('loading', resolvedKey.value)
}, { immediate: true })

onMounted(() => {
  if (props.debug) {
    console.log(`[TranslationText] Mounted with key: ${resolvedKey.value}`)
  }
})
</script>

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
            <span />
            <span />
            <span />
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

    <!-- 调试信息 -->
    <span v-if="debug" class="translation-debug">
      [{{ resolvedKey }}{{ params ? ` | ${JSON.stringify(params)}` : '' }}]
    </span>
  </component>
</template>

<style scoped>
.translation-text {
  display: inline;
}

.translation-text.is-loading {
  opacity: 0.7;
}

.translation-text.has-error {
  color: #dc2626;
}

.translation-text.is-debug {
  position: relative;
}

.translation-loading {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.loading-dots {
  display: inline-flex;
  gap: 2px;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: loading-dot 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-dot {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.translation-error {
  color: #dc2626;
  text-decoration: underline;
  text-decoration-style: wavy;
}

.translation-debug {
  font-size: 10px;
  color: #6b7280;
  font-family: monospace;
  margin-left: 4px;
}

.translation-html {
  display: inline;
}
</style>

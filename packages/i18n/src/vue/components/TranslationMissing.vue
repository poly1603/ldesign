<!--
  TranslationMissing 翻译缺失组件

  当翻译键不存在时显示的占位组件，提供智能的缺失检测和提示功能

  @example
  <TranslationMissing keypath="missing.key" />
  <TranslationMissing keypath="missing.key" show-report-button />
  <TranslationMissing keypath="missing.key" :suggestions="['correct.key']" />
  <TranslationMissing keypath="missing.key" show-similar-keys />
-->

<template>
  <div class="translation-missing" :class="{
    'translation-missing--dev': isDev,
    'translation-missing--with-suggestions': hasSuggestions,
    'translation-missing--inline': inline
  }">
    <!-- 开发模式显示 -->
    <div v-if="isDev" class="translation-missing__dev">
      <div class="translation-missing__header">
        <span class="translation-missing__icon">⚠️</span>
        <span class="translation-missing__text">
          翻译缺失: <code class="translation-missing__key">{{ keypath }}</code>
        </span>
        <span v-if="currentLocale" class="translation-missing__locale">
          ({{ currentLocale }})
        </span>
      </div>

      <!-- 相似键建议 -->
      <div v-if="hasSuggestions" class="translation-missing__suggestions">
        <div class="translation-missing__suggestions-title">建议的键名:</div>
        <ul class="translation-missing__suggestions-list">
          <li v-for="suggestion in displaySuggestions" :key="suggestion.key" class="translation-missing__suggestion"
            :class="{ 'translation-missing__suggestion--exact': suggestion.exact }">
            <code @click="copySuggestion(suggestion.key)">{{ suggestion.key }}</code>
            <span v-if="suggestion.similarity" class="translation-missing__similarity">
              ({{ Math.round(suggestion.similarity * 100) }}% 匹配)
            </span>
          </li>
        </ul>
      </div>

      <!-- 操作按钮 -->
      <div class="translation-missing__actions">
        <button v-if="showReportButton" @click="reportMissing" class="translation-missing__report" title="报告缺失翻译">
          📝 报告
        </button>
        <button v-if="showCopyButton" @click="copyKeypath" class="translation-missing__copy" title="复制键名">
          📋 复制
        </button>
        <button v-if="showSimilarKeys && !hasSuggestions" @click="findSimilarKeys"
          class="translation-missing__find-similar" title="查找相似键名">
          🔍 查找相似
        </button>
      </div>
    </div>

    <!-- 生产模式显示 -->
    <span v-else class="translation-missing__fallback">
      {{ fallbackText || keypath }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, nextTick } from 'vue'
import type { I18nInjectionKey } from '../types'

/**
 * 键名建议接口
 */
interface KeySuggestion {
  key: string
  similarity?: number
  exact?: boolean
}

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 缺失的翻译键 */
  keypath: string
  /** 降级显示文本 */
  fallbackText?: string
  /** 是否显示报告按钮 */
  showReportButton?: boolean
  /** 是否显示复制按钮 */
  showCopyButton?: boolean
  /** 是否显示查找相似键按钮 */
  showSimilarKeys?: boolean
  /** 强制开发模式显示 */
  forceDev?: boolean
  /** 是否内联显示 */
  inline?: boolean
  /** 手动提供的建议键名 */
  suggestions?: string[]
  /** 最大建议数量 */
  maxSuggestions?: number
}>(), {
  showReportButton: true,
  showCopyButton: true,
  showSimilarKeys: true,
  forceDev: false,
  inline: false,
  maxSuggestions: 5
})

// 使用内联类型定义以避免私有 Emits 名称泄漏
const emit = defineEmits<{
  (e: 'report', keypath: string): void
  (e: 'copy', keypath: string): void
  (e: 'suggestion-click', suggestion: string): void
}>()

/**
 * 注入 I18n 实例
 */
const i18n = inject<I18nInjectionKey>('i18n')

/**
 * 响应式状态
 */
const foundSuggestions = ref<KeySuggestion[]>([])

/**
 * 是否为开发模式
 */
const isDev = computed(() => {
  return props.forceDev || process.env.NODE_ENV === 'development'
})

/**
 * 当前语言
 */
const currentLocale = computed(() => {
  return i18n?.getCurrentLanguage() || 'unknown'
})

/**
 * 是否有建议
 */
const hasSuggestions = computed(() => {
  return displaySuggestions.value.length > 0
})

/**
 * 显示的建议列表
 */
const displaySuggestions = computed(() => {
  const suggestions: KeySuggestion[] = []

  // 添加手动提供的建议
  if (props.suggestions) {
    suggestions.push(...props.suggestions.map(key => ({ key, exact: false })))
  }

  // 添加自动找到的建议
  suggestions.push(...foundSuggestions.value)

  // 去重并限制数量
  const uniqueSuggestions = suggestions.filter((suggestion, index, arr) =>
    arr.findIndex(s => s.key === suggestion.key) === index
  )

  return uniqueSuggestions.slice(0, props.maxSuggestions)
})

/**
 * 报告缺失翻译
 */
const reportMissing = () => {
  const reportData = {
    keypath: props.keypath,
    locale: currentLocale.value,
    timestamp: new Date().toISOString(),
    suggestions: displaySuggestions.value.map(s => s.key),
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  console.warn(`翻译缺失报告: ${props.keypath}`, reportData)

  emit('report', props.keypath)

  // 可以在这里添加发送到错误收集服务的逻辑
  // 例如发送到 Sentry、LogRocket 等
  if (typeof window !== 'undefined' && (window as any).__I18N_MISSING_HANDLER__) {
    (window as any).__I18N_MISSING_HANDLER__(reportData)
  }
}

/**
 * 复制键名到剪贴板
 */
const copyKeypath = async () => {
  try {
    await navigator.clipboard.writeText(props.keypath)
    console.log(`已复制键名: ${props.keypath}`)
    emit('copy', props.keypath)
  } catch (error) {
    console.warn('复制失败:', error)
    // 降级方案：选择文本
    const textArea = document.createElement('textarea')
    textArea.value = props.keypath
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

/**
 * 复制建议键名
 */
const copySuggestion = async (suggestion: string) => {
  try {
    await navigator.clipboard.writeText(suggestion)
    console.log(`已复制建议键名: ${suggestion}`)
    emit('suggestion-click', suggestion)
  } catch (error) {
    console.warn('复制建议失败:', error)
  }
}

/**
 * 查找相似键名
 */
const findSimilarKeys = () => {
  if (!i18n) {
    console.warn('I18n 实例不可用，无法查找相似键名')
    return
  }

  try {
    // 获取当前语言的所有键名
    const allKeys = i18n.getKeys ? i18n.getKeys() : []

    if (allKeys.length === 0) {
      console.warn('未找到任何翻译键')
      return
    }

    // 计算相似度并排序
    const similarities = allKeys
      .map(key => ({
        key,
        similarity: calculateSimilarity(props.keypath, key),
        exact: key === props.keypath
      }))
      .filter(item => item.similarity > 0.3) // 只保留相似度大于30%的
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, props.maxSuggestions)

    foundSuggestions.value = similarities

    if (similarities.length === 0) {
      console.log(`未找到与 "${props.keypath}" 相似的键名`)
    } else {
      console.log(`找到 ${similarities.length} 个相似键名:`, similarities.map(s => s.key))
    }
  } catch (error) {
    console.warn('查找相似键名失败:', error)
  }
}

/**
 * 计算两个字符串的相似度（使用编辑距离算法）
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length
  const len2 = str2.length

  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0

  // 创建编辑距离矩阵
  const matrix: number[][] = []
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // 计算编辑距离
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // 删除
        matrix[i][j - 1] + 1,     // 插入
        matrix[i - 1][j - 1] + cost // 替换
      )
    }
  }

  const editDistance = matrix[len1][len2]
  const maxLength = Math.max(len1, len2)

  // 转换为相似度（0-1之间）
  return 1 - editDistance / maxLength
}
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'TranslationMissing',
  inheritAttrs: false
}
</script>

<style lang="less">
@import './TranslationMissing.less';
</style>

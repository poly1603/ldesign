<!--
  TranslationMissing 翻译缺失组件
  
  当翻译键不存在时显示的占位组件
  
  @example
  <TranslationMissing keypath="missing.key" />
  <TranslationMissing keypath="missing.key" show-report-button />
-->

<template>
  <div class="translation-missing" :class="{ 'translation-missing--dev': isDev }">
    <!-- 开发模式显示 -->
    <div v-if="isDev" class="translation-missing__dev">
      <span class="translation-missing__icon">⚠️</span>
      <span class="translation-missing__text">
        翻译缺失: <code>{{ keypath }}</code>
      </span>
      <button 
        v-if="showReportButton"
        @click="reportMissing"
        class="translation-missing__report"
        title="报告缺失翻译"
      >
        📝
      </button>
    </div>

    <!-- 生产模式显示 -->
    <span v-else class="translation-missing__fallback">
      {{ fallbackText || keypath }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { I18nInjectionKey } from '../types'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 缺失的翻译键 */
  keypath: string
  /** 降级显示文本 */
  fallbackText?: string
  /** 是否显示报告按钮 */
  showReportButton?: boolean
  /** 强制开发模式显示 */
  forceDev?: boolean
}>(), {
  showReportButton: true,
  forceDev: false
})

// 使用内联类型定义以避免私有 Emits 名称泄漏
const emit = defineEmits<{
  (e: 'report', keypath: string): void
}>()

/**
 * 注入 I18n 实例
 */
const i18n = inject<I18nInjectionKey>('i18n')

/**
 * 是否为开发模式
 */
const isDev = computed(() => {
  return props.forceDev || process.env.NODE_ENV === 'development'
})

/**
 * 报告缺失翻译
 */
const reportMissing = () => {
  console.warn(`翻译缺失报告: ${props.keypath}`, {
    keypath: props.keypath,
    locale: i18n?.getCurrentLanguage(),
    timestamp: new Date().toISOString()
  })
  
  emit('report', props.keypath)
  
  // 可以在这里添加发送到错误收集服务的逻辑
  // 例如发送到 Sentry、LogRocket 等
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



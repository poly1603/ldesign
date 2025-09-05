<!--
  TranslationProvider 翻译提供者组件
  
  为子组件提供翻译上下文的容器组件
  
  @example
  <TranslationProvider namespace="user">
    <UserProfile />
  </TranslationProvider>
-->

<template>
  <div class="translation-provider">
    <slot 
      :t="scopedT" 
      :te="scopedTe" 
      :locale="currentLocale"
      :namespace="namespace"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { I18nInjectionKey } from '../plugin'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 命名空间前缀 */
  namespace?: string
  /** 是否自动添加命名空间前缀 */
  autoPrefix?: boolean
}>(), {
  autoPrefix: true
})

/**
 * 注入 I18n 实例
 */
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('TranslationProvider 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 当前语言
 */
const currentLocale = computed(() => i18n.getCurrentLanguage())

/**
 * 作用域翻译函数
 */
const scopedT = (key: string, params?: Record<string, unknown>) => {
  const fullKey = props.namespace && props.autoPrefix 
    ? `${props.namespace}.${key}` 
    : key
  return i18n.t(fullKey, params)
}

/**
 * 作用域键存在检查函数
 */
const scopedTe = (key: string, locale?: string) => {
  const fullKey = props.namespace && props.autoPrefix 
    ? `${props.namespace}.${key}` 
    : key
  return i18n.te(fullKey, locale)
}

/**
 * 提供作用域翻译上下文
 */
provide('translationNamespace', props.namespace)
provide('scopedT', scopedT)
provide('scopedTe', scopedTe)
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'TranslationProvider',
  inheritAttrs: false
}
</script>



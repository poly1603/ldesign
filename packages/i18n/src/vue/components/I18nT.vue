<!--
  I18nT 翻译组件
  
  用于声明式翻译的 Vue 组件
  
  @example
  <I18nT keypath="hello" />
  <I18nT keypath="welcome" :params="{ name: 'Vue' }" />
  <I18nT keypath="user.profile.name" tag="span" />
-->

<template>
  <component :is="tag" v-if="translatedText">
    {{ translatedText }}
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { I18nInjectionKey } from '../types'

/**
 * 组件属性定义
 */
interface Props {
  /** 翻译键路径 */
  keypath: string
  /** 插值参数 */
  params?: Record<string, unknown>
  /** 渲染的 HTML 标签 */
  tag?: string
  /** 指定语言（可选） */
  locale?: string
  /** 是否启用 HTML 渲染 */
  html?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'span',
  html: false
})

/**
 * 注入 I18n 实例
 */
const i18n = inject<I18nInjectionKey>('i18n')
if (!i18n) {
  throw new Error('I18nT 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 计算翻译文本
 */
const translatedText = computed(() => {
  try {
    if (props.locale) {
      // 如果指定了语言，临时切换语言进行翻译
      const currentLocale = i18n.getCurrentLanguage()
      if (currentLocale !== props.locale) {
        // 这里需要实现临时语言切换的逻辑
        // 暂时使用当前语言翻译
        return i18n.t(props.keypath, props.params)
      }
    }
    
    return i18n.t(props.keypath, props.params)
  } catch (error) {
    console.warn(`I18nT 翻译失败: ${props.keypath}`, error)
    return props.keypath // 降级显示键名
  }
})
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'I18nT',
  inheritAttrs: false
}
</script>



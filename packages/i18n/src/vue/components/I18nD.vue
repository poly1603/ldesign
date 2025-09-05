<!--
  I18nD 日期格式化组件
  
  用于日期格式化的 Vue 组件
  
  @example
  <I18nD :value="new Date()" />
  <I18nD :value="new Date()" format="long" />
  <I18nD :value="new Date()" format="short" />
-->

<template>
  <component :is="tag" v-if="formattedDate">
    {{ formattedDate }}
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { I18nInjectionKey } from '../types'


/**
 * 日期格式化类型
 */
type DateFormat = 'full' | 'long' | 'medium' | 'short' | 'relative'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 要格式化的日期 */
  value: Date | string | number
  /** 格式化类型 */
  format?: DateFormat
  /** 自定义格式选项 */
  options?: Intl.DateTimeFormatOptions
  /** 渲染的 HTML 标签 */
  tag?: string
  /** 指定语言（可选） */
  locale?: string
}>(), {
  format: 'medium',
  tag: 'span'
})

/**
 * 注入 I18n 实例
 */
const i18n = inject<I18nInjectionKey>('i18n')
if (!i18n) {
  throw new Error('I18nD 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 计算格式化后的日期
 */
const formattedDate = computed(() => {
  try {
    const locale = props.locale || i18n.getCurrentLanguage()
    const date = new Date(props.value)
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    
    // 如果提供了自定义选项，使用自定义选项
    if (props.options) {
      return new Intl.DateTimeFormat(locale, props.options).format(date)
    }
    
    // 根据格式类型选择预设选项
    switch (props.format) {
      case 'full':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date)
      
      case 'long':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date)
      
      case 'short':
        return new Intl.DateTimeFormat(locale, {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric'
        }).format(date)
      
      case 'relative':
        // 相对时间格式化
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
        
        if (Math.abs(diffInSeconds) < 60) {
          return '刚刚'
        } else if (Math.abs(diffInSeconds) < 3600) {
          const minutes = Math.floor(Math.abs(diffInSeconds) / 60)
          return diffInSeconds > 0 ? `${minutes}分钟前` : `${minutes}分钟后`
        } else if (Math.abs(diffInSeconds) < 86400) {
          const hours = Math.floor(Math.abs(diffInSeconds) / 3600)
          return diffInSeconds > 0 ? `${hours}小时前` : `${hours}小时后`
        } else {
          const days = Math.floor(Math.abs(diffInSeconds) / 86400)
          return diffInSeconds > 0 ? `${days}天前` : `${days}天后`
        }
      
      case 'medium':
      default:
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(date)
    }
  } catch (error) {
    console.warn(`I18nD 格式化失败: ${props.value}`, error)
    return String(props.value) // 降级显示原始值
  }
})
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'I18nD',
  inheritAttrs: false
}
</script>



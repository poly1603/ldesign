<!--
  I18nN 数字格式化组件
  
  用于数字格式化的 Vue 组件
  
  @example
  <I18nN :value="1234.56" />
  <I18nN :value="1234.56" format="currency" currency="USD" />
  <I18nN :value="0.85" format="percent" />
-->

<template>
  <component :is="tag" v-if="formattedValue">
    {{ formattedValue }}
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { I18nInjectionKey } from '../types'
import { formatCurrency } from '../../utils/formatters'

/**
 * 数字格式化类型
 */
type NumberFormat = 'number' | 'currency' | 'percent' | 'decimal'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 要格式化的数值 */
  value: number
  /** 格式化类型 */
  format?: NumberFormat
  /** 货币代码（当 format 为 currency 时使用） */
  currency?: string
  /** 小数位数 */
  minimumFractionDigits?: number
  /** 最大小数位数 */
  maximumFractionDigits?: number
  /** 渲染的 HTML 标签 */
  tag?: string
  /** 指定语言（可选） */
  locale?: string
}>(), {
  format: 'number',
  tag: 'span',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
})

/**
 * 注入 I18n 实例
 */
const i18n = inject<I18nInjectionKey>('i18n')
if (!i18n) {
  throw new Error('I18nN 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 计算格式化后的数值
 */
const formattedValue = computed(() => {
  try {
    const locale = props.locale || i18n.getCurrentLanguage()
    
    switch (props.format) {
      case 'currency':
        return formatCurrency(props.value, {
          locale,
          currency: props.currency,
          minimumFractionDigits: props.minimumFractionDigits,
          maximumFractionDigits: props.maximumFractionDigits
        })
      
      case 'percent':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: props.minimumFractionDigits,
          maximumFractionDigits: props.maximumFractionDigits
        }).format(props.value)
      
      case 'decimal':
        return new Intl.NumberFormat(locale, {
          style: 'decimal',
          minimumFractionDigits: props.minimumFractionDigits,
          maximumFractionDigits: props.maximumFractionDigits
        }).format(props.value)
      
      case 'number':
      default:
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: props.minimumFractionDigits,
          maximumFractionDigits: props.maximumFractionDigits
        }).format(props.value)
    }
  } catch (error) {
    console.warn(`I18nN 格式化失败: ${props.value}`, error)
    return String(props.value) // 降级显示原始数值
  }
})
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'I18nN',
  inheritAttrs: false
}
</script>



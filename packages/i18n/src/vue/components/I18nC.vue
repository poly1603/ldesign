<!--
  I18nC - 货币格式化组件
  
  功能：
  - 支持多种货币格式化
  - 自动本地化货币符号和格式
  - 支持自定义货币代码和精度
  - 支持货币转换（可选）
  
  使用示例：
  <I18nC :value="1234.56" currency="USD" />
  <I18nC :value="price" :currency="userCurrency" :precision="2" />
  <I18nC :value="amount" currency="CNY" show-code />
-->

<template>
  <span :class="['i18n-currency', currencyClass]" :title="fullCurrencyName">
    {{ formattedCurrency }}
  </span>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 货币格式化组件属性
 */
interface Props {
  /** 货币数值 */
  value: number
  /** 货币代码 (ISO 4217) */
  currency?: string
  /** 小数位精度 */
  precision?: number
  /** 是否显示货币代码 */
  showCode?: boolean
  /** 自定义区域设置 */
  locale?: string
  /** 格式化样式 */
  style?: 'currency' | 'decimal' | 'percent'
  /** 货币显示方式 */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'
  /** 是否使用分组分隔符 */
  useGrouping?: boolean
  /** 最小整数位数 */
  minimumIntegerDigits?: number
  /** 最小小数位数 */
  minimumFractionDigits?: number
  /** 最大小数位数 */
  maximumFractionDigits?: number
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'USD',
  precision: 2,
  showCode: false,
  style: 'currency',
  currencyDisplay: 'symbol',
  useGrouping: true,
  minimumIntegerDigits: 1
})

// 注入 I18n 实例
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('I18nC 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 当前区域设置
 */
const currentLocale = computed(() => {
  return props.locale || i18n.getCurrentLanguage()
})

/**
 * 格式化选项
 */
const formatOptions = computed((): Intl.NumberFormatOptions => {
  const options: Intl.NumberFormatOptions = {
    style: props.style,
    useGrouping: props.useGrouping,
    minimumIntegerDigits: props.minimumIntegerDigits
  }

  if (props.style === 'currency') {
    options.currency = props.currency
    options.currencyDisplay = props.currencyDisplay
  }

  // 设置小数位数
  if (props.precision !== undefined) {
    options.minimumFractionDigits = props.precision
    options.maximumFractionDigits = props.precision
  } else {
    if (props.minimumFractionDigits !== undefined) {
      options.minimumFractionDigits = props.minimumFractionDigits
    }
    if (props.maximumFractionDigits !== undefined) {
      options.maximumFractionDigits = props.maximumFractionDigits
    }
  }

  return options
})

/**
 * 格式化后的货币字符串
 */
const formattedCurrency = computed(() => {
  try {
    const formatter = new Intl.NumberFormat(currentLocale.value, formatOptions.value)
    let result = formatter.format(props.value)
    
    // 如果需要显示货币代码
    if (props.showCode && props.style === 'currency') {
      result += ` (${props.currency})`
    }
    
    return result
  } catch (error) {
    console.warn('I18nC: 货币格式化失败', error)
    return `${props.value} ${props.currency}`
  }
})

/**
 * 货币的完整名称（用于 title 属性）
 */
const fullCurrencyName = computed(() => {
  try {
    const displayNames = new Intl.DisplayNames([currentLocale.value], { type: 'currency' })
    return displayNames.of(props.currency)
  } catch (error) {
    return props.currency
  }
})

/**
 * 货币样式类名
 */
const currencyClass = computed(() => {
  return [
    `i18n-currency--${props.currency.toLowerCase()}`,
    `i18n-currency--${props.style}`,
    {
      'i18n-currency--with-code': props.showCode,
      'i18n-currency--no-grouping': !props.useGrouping
    }
  ]
})
</script>

<script lang="ts">
/**
 * I18nC - 货币格式化组件
 * 
 * 提供强大的货币格式化功能，支持：
 * - 多种货币和区域设置
 * - 自定义精度和显示格式
 * - 货币符号和代码显示
 * - 完整的本地化支持
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <I18nC :value="1234.56" currency="USD" />
 *   
 *   <!-- 自定义精度 -->
 *   <I18nC :value="price" currency="EUR" :precision="3" />
 *   
 *   <!-- 显示货币代码 -->
 *   <I18nC :value="amount" currency="JPY" show-code />
 *   
 *   <!-- 自定义显示方式 -->
 *   <I18nC :value="total" currency="GBP" currency-display="name" />
 * </template>
 * ```
 */
export default {
  name: 'I18nC'
}
</script>

<style lang="less">
.i18n-currency {
  display: inline;
  font-variant-numeric: tabular-nums;
  
  &--usd {
    color: var(--ldesign-success-color);
  }
  
  &--eur {
    color: var(--ldesign-brand-color);
  }
  
  &--cny,
  &--rmb {
    color: var(--ldesign-error-color);
  }
  
  &--jpy {
    color: var(--ldesign-warning-color);
  }
  
  &--with-code {
    font-weight: 500;
  }
  
  &--decimal {
    font-family: monospace;
  }
  
  &--percent {
    color: var(--ldesign-brand-color);
    font-weight: 500;
  }
}
</style>

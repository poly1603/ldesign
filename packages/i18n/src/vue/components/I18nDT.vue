<!--
  I18nDT - 日期时间格式化组件

  功能：
  - 支持多种日期时间格式
  - 自动本地化日期时间显示
  - 支持相对时间和绝对时间
  - 支持时区转换
  - 支持自定义格式模板

  使用示例：
  <I18nDT :value="new Date()" format="full" />
  <I18nDT :value="timestamp" format="relative" />
  <I18nDT :value="date" :options="{ timeZone: 'Asia/Shanghai' }" />
-->

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 日期时间格式化组件属性
 */
export interface I18nDTProps {
  /** 日期时间值 */
  value: Date | string | number
  /** 格式化类型 */
  format?: 'full' | 'long' | 'medium' | 'short' | 'relative' | 'custom'
  /** 自定义区域设置 */
  locale?: string
  /** Intl.DateTimeFormat 选项 */
  options?: Intl.DateTimeFormatOptions
  /** 自定义格式模板（当 format='custom' 时使用） */
  template?: string
  /** 相对时间更新间隔（毫秒，0 表示不自动更新） */
  updateInterval?: number
  /** 时区 */
  timeZone?: string
  /** 是否显示时区信息 */
  showTimeZone?: boolean
  /** 日期样式 */
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  /** 时间样式 */
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
}

const props = withDefaults(defineProps<I18nDTProps>(), {
  format: 'medium',
  updateInterval: 60000, // 1分钟
  showTimeZone: false,
})

// 注入 I18n 实例
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('I18nDT 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

// 自动更新定时器
let updateTimer: NodeJS.Timeout | null = null
const forceUpdate = ref(0)

/**
 * 当前区域设置
 */
const currentLocale = computed(() => {
  return props.locale || i18n.getCurrentLanguage()
})

/**
 * 日期对象
 */
const dateValue = computed(() => {
  if (props.value instanceof Date) {
    return props.value
  }
  else if (typeof props.value === 'string' || typeof props.value === 'number') {
    return new Date(props.value)
  }
  return new Date()
})

/**
 * ISO 字符串（用于 datetime 属性）
 */
const isoString = computed(() => {
  return dateValue.value.toISOString()
})

/**
 * 格式化选项
 */
const formatOptions = computed((): Intl.DateTimeFormatOptions => {
  let options: Intl.DateTimeFormatOptions = { ...props.options }

  // 设置时区
  if (props.timeZone) {
    options.timeZone = props.timeZone
  }

  // 根据格式类型设置选项
  switch (props.format) {
    case 'full':
      options = {
        ...options,
        dateStyle: 'full',
        timeStyle: 'full',
      }
      break
    case 'long':
      options = {
        ...options,
        dateStyle: 'long',
        timeStyle: 'long',
      }
      break
    case 'medium':
      options = {
        ...options,
        dateStyle: 'medium',
        timeStyle: 'medium',
      }
      break
    case 'short':
      options = {
        ...options,
        dateStyle: 'short',
        timeStyle: 'short',
      }
      break
  }

  // 使用自定义样式
  if (props.dateStyle) {
    options.dateStyle = props.dateStyle
  }
  if (props.timeStyle) {
    options.timeStyle = props.timeStyle
  }

  // 显示时区
  if (props.showTimeZone) {
    options.timeZoneName = 'short'
  }

  return options
})

/**
 * 格式化后的日期时间字符串
 */
const formattedDateTime = computed(() => {
  // 强制更新触发器
  forceUpdate.value

  try {
    if (props.format === 'relative') {
      return formatRelativeTime(dateValue.value)
    }
    else if (props.format === 'custom' && props.template) {
      return formatCustomTemplate(dateValue.value, props.template)
    }
    else {
      const formatter = new Intl.DateTimeFormat(currentLocale.value, formatOptions.value)
      return formatter.format(dateValue.value)
    }
  }
  catch (error) {
    console.warn('I18nDT: 日期时间格式化失败', error)
    return dateValue.value.toLocaleString()
  }
})

/**
 * 完整的日期时间字符串（用于 title 属性）
 */
const fullDateTime = computed(() => {
  try {
    const formatter = new Intl.DateTimeFormat(currentLocale.value, {
      dateStyle: 'full',
      timeStyle: 'full',
      timeZone: props.timeZone,
    })
    return formatter.format(dateValue.value)
  }
  catch (error) {
    return dateValue.value.toString()
  }
})

/**
 * 样式类名
 */
const datetimeClass = computed(() => {
  return [
    `i18n-datetime--${props.format}`,
    {
      'i18n-datetime--with-timezone': props.showTimeZone,
      'i18n-datetime--auto-update': props.updateInterval > 0 && props.format === 'relative',
    },
  ]
})

/**
 * 格式化相对时间
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSeconds = Math.round(diffMs / 1000)
  const diffMinutes = Math.round(diffSeconds / 60)
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)

  try {
    const rtf = new Intl.RelativeTimeFormat(currentLocale.value, { numeric: 'auto' })

    if (Math.abs(diffSeconds) < 60) {
      return rtf.format(diffSeconds, 'second')
    }
    else if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, 'minute')
    }
    else if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour')
    }
    else if (Math.abs(diffDays) < 30) {
      return rtf.format(diffDays, 'day')
    }
    else {
      // 超过30天使用绝对时间
      const formatter = new Intl.DateTimeFormat(currentLocale.value, {
        dateStyle: 'medium',
      })
      return formatter.format(date)
    }
  }
  catch (error) {
    console.warn('I18nDT: 相对时间格式化失败', error)
    return date.toLocaleString()
  }
}

/**
 * 格式化自定义模板
 */
function formatCustomTemplate(date: Date, template: string): string {
  const tokens: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    DD: date.getDate().toString().padStart(2, '0'),
    HH: date.getHours().toString().padStart(2, '0'),
    mm: date.getMinutes().toString().padStart(2, '0'),
    ss: date.getSeconds().toString().padStart(2, '0'),
  }

  let result = template
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value)
  }

  return result
}

/**
 * 启动自动更新
 */
function startAutoUpdate() {
  if (props.updateInterval > 0 && props.format === 'relative') {
    updateTimer = setInterval(() => {
      forceUpdate.value++
    }, props.updateInterval)
  }
}

/**
 * 停止自动更新
 */
function stopAutoUpdate() {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

onMounted(() => {
  startAutoUpdate()
})

onUnmounted(() => {
  stopAutoUpdate()
})
</script>

<script lang="ts">
/**
 * I18nDT - 日期时间格式化组件
 *
 * 提供强大的日期时间格式化功能，支持：
 * - 多种格式化样式
 * - 相对时间显示
 * - 时区转换
 * - 自定义模板
 * - 自动更新
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <I18nDT :value="new Date()" format="medium" />
 *
 *   <!-- 相对时间 -->
 *   <I18nDT :value="pastDate" format="relative" />
 *
 *   <!-- 自定义格式 -->
 *   <I18nDT :value="date" format="custom" template="YYYY-MM-DD HH:mm" />
 *
 *   <!-- 时区转换 -->
 *   <I18nDT :value="utcDate" time-zone="Asia/Shanghai" show-time-zone />
 * </template>
 * ```
 */
export default {
  name: 'I18nDT',
}
</script>

<template>
  <time
    class="i18n-datetime" :class="[datetimeClass]"
    :datetime="isoString"
    :title="fullDateTime"
  >
    {{ formattedDateTime }}
  </time>
</template>

<style lang="less">
.i18n-datetime {
  display: inline;

  &--relative {
    color: var(--ldesign-text-color-secondary);
    font-style: italic;
  }

  &--full {
    font-weight: 500;
  }

  &--custom {
    font-family: monospace;
  }

  &--with-timezone {
    .timezone {
      color: var(--ldesign-text-color-placeholder);
      font-size: 0.9em;
    }
  }

  &--auto-update {
    cursor: help;
  }
}
</style>

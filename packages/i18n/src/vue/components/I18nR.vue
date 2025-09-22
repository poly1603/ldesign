<!--
  I18nR 相对时间格式化组件
  
  用于显示相对时间，如 "2 minutes ago", "in 3 hours" 等
  
  @example
  <I18nR :value="new Date(Date.now() - 60000)" />  <!-- "1 minute ago" -->
  <I18nR :value="new Date(Date.now() + 3600000)" />  <!-- "in 1 hour" -->
  <I18nR :value="pastDate" format="narrow" />
  <I18nR :value="futureDate" :update-interval="30000" />
-->

<template>
  <component :is="tag" :title="absoluteTime">
    {{ relativeTime }}
  </component>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 相对时间格式类型
 */
type RelativeTimeFormat = 'long' | 'short' | 'narrow'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 要格式化的时间值 */
  value: Date | string | number
  /** 格式化样式 */
  format?: RelativeTimeFormat
  /** 渲染的 HTML 标签 */
  tag?: string
  /** 指定语言（可选） */
  locale?: string
  /** 自动更新间隔（毫秒），0 表示不自动更新 */
  updateInterval?: number
  /** 是否显示绝对时间作为 title */
  showAbsoluteTime?: boolean
  /** 绝对时间的格式 */
  absoluteTimeFormat?: Intl.DateTimeFormatOptions
}>(), {
  format: 'long',
  tag: 'time',
  updateInterval: 60000, // 默认每分钟更新一次
  showAbsoluteTime: true,
  absoluteTimeFormat: () => ({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

/**
 * 注入 I18n 实例
 */
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('I18nR 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 响应式状态
 */
const currentTime = ref(new Date())
let updateTimer: number | null = null

/**
 * 获取目标日期
 */
const targetDate = computed(() => {
  return new Date(props.value)
})

/**
 * 当前语言
 */
const currentLocale = computed(() => {
  return props.locale || i18n.getCurrentLanguage()
})

/**
 * 相对时间格式化器
 */
const relativeTimeFormatter = computed(() => {
  try {
    return new Intl.RelativeTimeFormat(currentLocale.value, {
      style: props.format,
      numeric: 'auto'
    })
  } catch (error) {
    console.warn('创建相对时间格式化器失败:', error)
    return null
  }
})

/**
 * 绝对时间格式化器
 */
const absoluteTimeFormatter = computed(() => {
  try {
    return new Intl.DateTimeFormat(currentLocale.value, props.absoluteTimeFormat)
  } catch (error) {
    console.warn('创建绝对时间格式化器失败:', error)
    return null
  }
})

/**
 * 计算时间差（秒）
 */
const timeDifferenceInSeconds = computed(() => {
  return Math.floor((targetDate.value.getTime() - currentTime.value.getTime()) / 1000)
})

/**
 * 获取最合适的时间单位和值
 */
const getTimeUnitAndValue = (seconds: number): { value: number; unit: Intl.RelativeTimeFormatUnit } => {
  const absSeconds = Math.abs(seconds)
  
  // 秒
  if (absSeconds < 60) {
    return { value: seconds, unit: 'second' }
  }
  
  // 分钟
  const minutes = Math.floor(seconds / 60)
  if (Math.abs(minutes) < 60) {
    return { value: minutes, unit: 'minute' }
  }
  
  // 小时
  const hours = Math.floor(seconds / 3600)
  if (Math.abs(hours) < 24) {
    return { value: hours, unit: 'hour' }
  }
  
  // 天
  const days = Math.floor(seconds / 86400)
  if (Math.abs(days) < 30) {
    return { value: days, unit: 'day' }
  }
  
  // 月
  const months = Math.floor(seconds / 2592000) // 30天
  if (Math.abs(months) < 12) {
    return { value: months, unit: 'month' }
  }
  
  // 年
  const years = Math.floor(seconds / 31536000) // 365天
  return { value: years, unit: 'year' }
}

/**
 * 相对时间文本
 */
const relativeTime = computed(() => {
  if (!relativeTimeFormatter.value) {
    // 降级处理
    const diff = timeDifferenceInSeconds.value
    if (diff > 0) {
      return `in ${Math.abs(diff)} seconds`
    } else {
      return `${Math.abs(diff)} seconds ago`
    }
  }
  
  try {
    const { value, unit } = getTimeUnitAndValue(timeDifferenceInSeconds.value)
    return relativeTimeFormatter.value.format(value, unit)
  } catch (error) {
    console.warn('相对时间格式化失败:', error)
    return targetDate.value.toLocaleString(currentLocale.value)
  }
})

/**
 * 绝对时间文本（用于 title 属性）
 */
const absoluteTime = computed(() => {
  if (!props.showAbsoluteTime) {
    return undefined
  }
  
  if (!absoluteTimeFormatter.value) {
    return targetDate.value.toLocaleString(currentLocale.value)
  }
  
  try {
    return absoluteTimeFormatter.value.format(targetDate.value)
  } catch (error) {
    console.warn('绝对时间格式化失败:', error)
    return targetDate.value.toLocaleString(currentLocale.value)
  }
})

/**
 * 启动自动更新
 */
const startAutoUpdate = () => {
  if (props.updateInterval > 0) {
    updateTimer = window.setInterval(() => {
      currentTime.value = new Date()
    }, props.updateInterval)
  }
}

/**
 * 停止自动更新
 */
const stopAutoUpdate = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

/**
 * 生命周期钩子
 */
onMounted(() => {
  startAutoUpdate()
})

onUnmounted(() => {
  stopAutoUpdate()
})

/**
 * 监听更新间隔变化
 */
const { updateInterval } = toRefs(props)
watch(updateInterval, () => {
  stopAutoUpdate()
  startAutoUpdate()
})
</script>

<script lang="ts">
import { toRefs, watch } from 'vue'

/**
 * 组件名称
 */
export default {
  name: 'I18nR',
  inheritAttrs: false
}
</script>

<style lang="less">
.i18n-relative-time {
  display: inline;
  cursor: help;
  border-bottom: 1px dotted var(--ldesign-text-color-placeholder, rgba(0, 0, 0, 0.3));
  
  &:hover {
    border-bottom-color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
  }
  
  &--future {
    color: var(--ldesign-success-color-5, #62cb62);
  }
  
  &--past {
    color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
  }
  
  &--recent {
    color: var(--ldesign-brand-color-5, #8c5ad3);
    font-weight: 500;
  }
}

/* 不同时间范围的样式 */
time[data-time-range="seconds"] {
  color: var(--ldesign-success-color-6, #42bd42);
}

time[data-time-range="minutes"] {
  color: var(--ldesign-brand-color-6, #7334cb);
}

time[data-time-range="hours"] {
  color: var(--ldesign-warning-color-6, #f0b80f);
}

time[data-time-range="days"] {
  color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
}

time[data-time-range="months"],
time[data-time-range="years"] {
  color: var(--ldesign-text-color-placeholder, rgba(0, 0, 0, 0.3));
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .i18n-relative-time {
    border-bottom-color: rgba(255, 255, 255, 0.3);
    
    &:hover {
      border-bottom-color: rgba(255, 255, 255, 0.7);
    }
  }
  
  time[data-time-range="days"] {
    color: rgba(255, 255, 255, 0.7);
  }
  
  time[data-time-range="months"],
  time[data-time-range="years"] {
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>

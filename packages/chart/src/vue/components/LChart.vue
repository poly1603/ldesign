<!--
  LChart 通用图表组件
  
  这是一个通用的 Vue 图表组件，支持所有图表类型
-->

<template>
  <div
    ref="chartContainer"
    class="l-chart"
    :class="chartClasses"
    :style="chartStyles"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="l-chart__loading">
      <div class="l-chart__loading-spinner"></div>
      <div v-if="loadingText" class="l-chart__loading-text">
        {{ loadingText }}
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="l-chart__error">
      <div class="l-chart__error-icon">⚠️</div>
      <div class="l-chart__error-message">
        {{ typeof error === 'string' ? error : error.message }}
      </div>
    </div>
    
    <!-- 空数据状态 -->
    <div v-else-if="isEmpty" class="l-chart__empty">
      <div class="l-chart__empty-icon">📊</div>
      <div class="l-chart__empty-message">
        {{ emptyText || '暂无数据' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useChart } from '../composables/useChart'
import type { ChartProps, ChartEmits } from '../types'

/**
 * 组件名称
 */
defineOptions({
  name: 'LChart'
})

/**
 * Props 定义
 */
const props = withDefaults(defineProps<ChartProps>(), {
  width: '100%',
  height: '400px',
  loading: false,
  error: null,
  autoResize: true,
  debounceDelay: 300
})

/**
 * 事件定义
 */
const emit = defineEmits<ChartEmits>()

/**
 * 使用 chart composable
 */
const {
  chartRef,
  chartInstance,
  loading: chartLoading,
  error: chartError,
  ready,
  updateData,
  updateConfig,
  setTheme,
  on,
  off
} = useChart({
  type: props.type,
  data: props.data,
  config: props.config,
  theme: props.theme,
  autoResize: props.autoResize,
  debounceDelay: props.debounceDelay
})

/**
 * 计算属性
 */

// 合并加载状态
const loading = computed(() => props.loading || chartLoading.value)

// 合并错误状态
const error = computed(() => props.error || chartError.value)

// 检查是否为空数据
const isEmpty = computed(() => {
  if (!props.data) return true
  if (Array.isArray(props.data)) {
    return props.data.length === 0
  }
  if (typeof props.data === 'object' && 'series' in props.data) {
    return !props.data.series || props.data.series.length === 0
  }
  return false
})

// 图表容器样式
const chartStyles = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

// 图表容器类名
const chartClasses = computed(() => ({
  'l-chart--loading': loading.value,
  'l-chart--error': !!error.value,
  'l-chart--empty': isEmpty.value,
  'l-chart--ready': ready.value,
  [`l-chart--${props.type}`]: true
}))

// 加载文本
const loadingText = computed(() => {
  if (typeof props.loading === 'string') return props.loading
  return '加载中...'
})

// 空数据文本
const emptyText = computed(() => {
  return '暂无数据'
})

/**
 * 监听 props 变化
 */

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData) {
    updateData(newData)
  }
}, { deep: true })

// 监听配置变化
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    updateConfig(newConfig)
  }
}, { deep: true })

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  if (newTheme) {
    setTheme(newTheme)
  }
})

/**
 * 事件处理
 */

// 注册图表事件监听器
const setupEventListeners = () => {
  if (!chartInstance.value) return

  // 点击事件
  on('click', (params) => emit('click', params))
  
  // 双击事件
  on('dblclick', (params) => emit('dblclick', params))
  
  // 鼠标悬停事件
  on('mouseover', (params) => emit('mouseover', params))
  
  // 鼠标移出事件
  on('mouseout', (params) => emit('mouseout', params))
  
  // 图例选择变化事件
  on('legendselectchanged', (params) => emit('legendselectchanged', params))
  
  // 数据缩放事件
  on('datazoom', (params) => emit('datazoom', params))
  
  // 刷选事件
  on('brush', (params) => emit('brush', params))
}

// 清理事件监听器
const cleanupEventListeners = () => {
  if (!chartInstance.value) return

  off('click')
  off('dblclick')
  off('mouseover')
  off('mouseout')
  off('legendselectchanged')
  off('datazoom')
  off('brush')
}

/**
 * 生命周期
 */

// 监听图表实例变化，设置事件监听器
watch(chartInstance, (newInstance, oldInstance) => {
  if (oldInstance) {
    cleanupEventListeners()
  }
  
  if (newInstance) {
    setupEventListeners()
    emit('ready', newInstance)
  }
})

// 监听图表准备状态变化
watch(ready, (isReady) => {
  if (isReady && chartInstance.value) {
    emit('updated', chartInstance.value)
  }
})

// 监听错误状态变化
watch(error, (newError) => {
  if (newError) {
    emit('error', newError instanceof Error ? newError : new Error(String(newError)))
  }
})

onMounted(() => {
  // 将容器引用赋值给 chartRef
  if (chartContainer.value) {
    chartRef.value = chartContainer.value
  }
})

onUnmounted(() => {
  cleanupEventListeners()
})

/**
 * 模板引用
 */
const chartContainer = chartRef
</script>

<style lang="less">
.l-chart {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;

  &__loading,
  &__error,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--ls-padding-lg);
    text-align: center;
  }

  &__loading {
    color: var(--ldesign-text-color-secondary);
  }

  &__loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ldesign-border-color);
    border-top-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: l-chart-spin 1s linear infinite;
    margin-bottom: var(--ls-margin-sm);
  }

  &__loading-text {
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-placeholder);
  }

  &__error {
    color: var(--ldesign-error-color);
  }

  &__error-icon {
    font-size: 32px;
    margin-bottom: var(--ls-margin-sm);
  }

  &__error-message {
    font-size: var(--ls-font-size-sm);
    max-width: 300px;
    word-break: break-word;
  }

  &__empty {
    color: var(--ldesign-text-color-placeholder);
  }

  &__empty-icon {
    font-size: 48px;
    margin-bottom: var(--ls-margin-sm);
    opacity: 0.5;
  }

  &__empty-message {
    font-size: var(--ls-font-size-base);
  }

  // 图表类型特定样式
  &--line {
    // 折线图特定样式
  }

  &--bar {
    // 柱状图特定样式
  }

  &--pie {
    // 饼图特定样式
  }

  &--scatter {
    // 散点图特定样式
  }

  // 状态样式
  &--loading {
    pointer-events: none;
  }

  &--error {
    border: 1px solid var(--ldesign-error-color-disabled);
    background-color: var(--ldesign-error-color-1);
  }

  &--empty {
    border: 1px dashed var(--ldesign-border-color);
  }

  &--ready {
    // 图表准备就绪时的样式
  }
}

@keyframes l-chart-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

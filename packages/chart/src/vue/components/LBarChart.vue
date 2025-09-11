<!--
  LBarChart 柱状图组件
  
  专门用于柱状图的 Vue 组件
-->

<template>
  <LChart
    type="bar"
    :data="data"
    :config="mergedConfig"
    :theme="theme"
    :width="width"
    :height="height"
    :loading="loading"
    :error="error"
    :auto-resize="autoResize"
    :debounce-delay="debounceDelay"
    @click="$emit('click', $event)"
    @dblclick="$emit('dblclick', $event)"
    @mouseover="$emit('mouseover', $event)"
    @mouseout="$emit('mouseout', $event)"
    @legendselectchanged="$emit('legendselectchanged', $event)"
    @datazoom="$emit('datazoom', $event)"
    @brush="$emit('brush', $event)"
    @ready="$emit('ready', $event)"
    @updated="$emit('updated', $event)"
    @error="$emit('error', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LChart from './LChart.vue'
import type { BarChartProps, ChartEmits } from '../types'

/**
 * 组件名称
 */
defineOptions({
  name: 'LBarChart'
})

/**
 * Props 定义
 */
const props = withDefaults(defineProps<BarChartProps>(), {
  width: '100%',
  height: '400px',
  loading: false,
  error: null,
  autoResize: true,
  debounceDelay: 300,
  stack: false,
  horizontal: false
})

/**
 * 事件定义
 */
defineEmits<ChartEmits>()

/**
 * 合并配置
 */
const mergedConfig = computed(() => {
  const config = { ...props.config }
  
  // 柱状图特定配置
  if (props.stack !== undefined) {
    config.stack = props.stack
  }
  
  if (props.horizontal !== undefined) {
    config.horizontal = props.horizontal
  }
  
  if (props.barWidth !== undefined) {
    config.barWidth = props.barWidth
  }
  
  if (props.barGap !== undefined) {
    config.barGap = props.barGap
  }

  return config
})
</script>

<style lang="less">
.l-bar-chart {
  // 柱状图特定样式
}
</style>

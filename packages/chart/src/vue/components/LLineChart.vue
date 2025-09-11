<!--
  LLineChart 折线图组件
  
  专门用于折线图的 Vue 组件
-->

<template>
  <LChart
    type="line"
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
import type { LineChartProps, ChartEmits } from '../types'

/**
 * 组件名称
 */
defineOptions({
  name: 'LLineChart'
})

/**
 * Props 定义
 */
const props = withDefaults(defineProps<LineChartProps>(), {
  width: '100%',
  height: '400px',
  loading: false,
  error: null,
  autoResize: true,
  debounceDelay: 300,
  smooth: false,
  area: false,
  stack: false,
  showSymbol: true
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
  
  // 折线图特定配置
  if (props.smooth !== undefined) {
    config.smooth = props.smooth
  }
  
  if (props.area !== undefined) {
    config.area = props.area
  }
  
  if (props.stack !== undefined) {
    config.stack = props.stack
  }
  
  if (props.showSymbol !== undefined) {
    config.showSymbol = props.showSymbol
  }

  return config
})
</script>

<style lang="less">
.l-line-chart {
  // 折线图特定样式
}
</style>

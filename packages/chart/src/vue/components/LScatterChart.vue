<!--
  LScatterChart 散点图组件
  
  专门用于散点图的 Vue 组件
-->

<template>
  <LChart
    type="scatter"
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
import type { ScatterChartProps, ChartEmits } from '../types'

/**
 * 组件名称
 */
defineOptions({
  name: 'LScatterChart'
})

/**
 * Props 定义
 */
const props = withDefaults(defineProps<ScatterChartProps>(), {
  width: '100%',
  height: '400px',
  loading: false,
  error: null,
  autoResize: true,
  debounceDelay: 300,
  regression: false,
  symbolSize: 10,
  symbol: 'circle'
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
  
  // 散点图特定配置
  if (props.regression !== undefined) {
    config.regression = props.regression
  }
  
  if (props.symbolSize !== undefined) {
    config.symbolSize = props.symbolSize
  }
  
  if (props.symbol !== undefined) {
    config.symbol = props.symbol
  }

  return config
})
</script>

<style lang="less">
.l-scatter-chart {
  // 散点图特定样式
}
</style>

<!--
  LPieChart 饼图组件
  
  专门用于饼图的 Vue 组件
-->

<template>
  <LChart
    type="pie"
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
import type { PieChartProps, ChartEmits } from '../types'

/**
 * 组件名称
 */
defineOptions({
  name: 'LPieChart'
})

/**
 * Props 定义
 */
const props = withDefaults(defineProps<PieChartProps>(), {
  width: '100%',
  height: '400px',
  loading: false,
  error: null,
  autoResize: true,
  debounceDelay: 300,
  donut: false,
  roseType: false
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
  
  // 饼图特定配置
  if (props.donut !== undefined) {
    config.donut = props.donut
  }
  
  if (props.innerRadius !== undefined) {
    config.innerRadius = props.innerRadius
  }
  
  if (props.outerRadius !== undefined) {
    config.outerRadius = props.outerRadius
  }
  
  if (props.roseType !== undefined) {
    config.roseType = props.roseType
  }

  return config
})
</script>

<style lang="less">
.l-pie-chart {
  // 饼图特定样式
}
</style>

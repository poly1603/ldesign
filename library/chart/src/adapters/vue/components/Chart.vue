<template>
  <div
    ref="chartRef"
    :class="['ldesign-chart', { 'is-loading': isLoading }]"
    :style="containerStyle"
  >
    <slot v-if="isLoading" name="loading">
      <div class="chart-loading">加载中...</div>
    </slot>
    <slot v-else-if="error" name="error" :error="error">
      <div class="chart-error">{{ error.message }}</div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, shallowRef } from 'vue'
import { Chart } from '../../../core/chart'
import type { ChartConfig, ChartData } from '../../../types'

// Props
interface Props {
  type: string
  data: ChartData
  title?: string
  theme?: string
  darkMode?: boolean
  fontSize?: number
  width?: number | string
  height?: number | string
  lazy?: boolean
  virtual?: boolean
  worker?: boolean
  cache?: boolean
  responsive?: boolean
  echarts?: any
}

const props = withDefaults(defineProps<Props>(), {
  responsive: true,
  cache: true,
  lazy: false,
  virtual: false,
  worker: false,
})

// Emits
const emit = defineEmits<{
  ready: [chart: Chart]
  error: [error: Error]
  dataUpdate: [data: any]
}>()

// State
const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<Chart>()
const isLoading = ref(true)
const error = ref<Error | null>(null)

// Computed
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height || '400px',
}))

const chartConfig = computed<ChartConfig>(() => ({
  type: props.type as any,
  data: props.data,
  title: props.title,
  theme: props.theme,
  darkMode: props.darkMode,
  fontSize: props.fontSize,
  lazy: props.lazy,
  virtual: props.virtual,
  worker: props.worker,
  cache: props.cache,
  responsive: props.responsive,
  echarts: props.echarts,
}))

// Methods
const initChart = async () => {
  if (!chartRef.value) return
  
  try {
    isLoading.value = true
    error.value = null
    
    // 销毁旧实例
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
    
    // 创建新实例
    chartInstance.value = new Chart(chartRef.value, chartConfig.value)
    
    isLoading.value = false
    emit('ready', chartInstance.value)
  } catch (err) {
    error.value = err as Error
    isLoading.value = false
    emit('error', err as Error)
  }
}

// Watch
watch(() => props.data, async (newData) => {
  if (chartInstance.value) {
    await chartInstance.value.updateData(newData)
    emit('dataUpdate', newData)
  }
}, { deep: true })

watch(() => props.theme, (newTheme) => {
  chartInstance.value?.setTheme(newTheme!)
})

watch(() => props.darkMode, (darkMode) => {
  chartInstance.value?.setDarkMode(!!darkMode)
})

watch(() => props.fontSize, (fontSize) => {
  if (fontSize) chartInstance.value?.setFontSize(fontSize)
})

// Lifecycle
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  chartInstance.value?.dispose()
})

// Expose
defineExpose({
  chart: chartInstance,
  refresh: () => chartInstance.value?.refresh(),
  resize: () => chartInstance.value?.resize(),
  getDataURL: () => chartInstance.value?.getDataURL(),
  getInstance: () => chartInstance.value?.getInstance(),
})
</script>

<style scoped>
.ldesign-chart {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.chart-loading,
.chart-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.chart-error {
  color: #f56c6c;
}
</style>


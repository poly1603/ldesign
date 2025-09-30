<template>
  <div class="bar-chart">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="bar-item"
      @mouseenter="hoveredIndex = index"
      @mouseleave="hoveredIndex = null"
      :class="{ 'hovered': hoveredIndex === index }"
    >
      <div class="bar-header">
        <div class="bar-rank">{{ index + 1 }}</div>
        <div class="bar-label" :title="item.label">
          {{ item.label }}
        </div>
        <div class="bar-value-text">
          {{ item.displayValue }}
        </div>
      </div>
      
      <div class="bar-wrapper">
        <div
          class="bar-fill"
          :style="{
            width: (item.value / maxValue * 100) + '%',
            backgroundColor: getBarColor(index)
          }"
        >
          <span class="bar-percentage">{{ item.percentage.toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface BarChartData {
  label: string
  value: number
  displayValue: string
  percentage: number
}

interface Props {
  data: BarChartData[]
  colorScheme?: 'gradient' | 'single' | 'rainbow'
}

const props = withDefaults(defineProps<Props>(), {
  colorScheme: 'gradient'
})

const hoveredIndex = ref<number | null>(null)

// 最大值
const maxValue = computed(() => {
  return Math.max(...props.data.map(item => item.value))
})

// 获取条形颜色
const getBarColor = (index: number): string => {
  if (props.colorScheme === 'single') {
    return 'var(--ldesign-brand-color)'
  }
  
  if (props.colorScheme === 'rainbow') {
    const colors = [
      '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336',
      '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#E91E63'
    ]
    return colors[index % colors.length]
  }
  
  // 渐变色方案（默认）
  const startColor = { r: 33, g: 150, b: 243 } // #2196F3
  const endColor = { r: 156, g: 39, b: 176 } // #9C27B0
  
  const ratio = index / (props.data.length - 1)
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio)
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio)
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio)
  
  return `rgb(${r}, ${g}, ${b})`
}
</script>

<style lang="less" scoped>
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
}

.bar-item {
  transition: all 0.2s ease;
  
  &.hovered {
    transform: translateX(4px);
    
    .bar-fill {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
  
  .bar-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-spacing-xs);
    
    .bar-rank {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, var(--ldesign-brand-color-light), var(--ldesign-brand-color-focus));
      color: var(--ldesign-brand-color);
      border-radius: 50%;
      font-size: var(--ls-font-size-xs);
      font-weight: 700;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .bar-label {
      flex: 1;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }
    
    .bar-value-text {
      font-size: var(--ls-font-size-sm);
      font-weight: 600;
      color: var(--ldesign-text-color-secondary);
      font-family: 'Consolas', 'Monaco', monospace;
      flex-shrink: 0;
    }
  }
  
  .bar-wrapper {
    position: relative;
    height: 24px;
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-radius-sm);
    overflow: hidden;
    
    .bar-fill {
      position: relative;
      height: 100%;
      border-radius: var(--ls-radius-sm);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      padding: 0 var(--ls-spacing-sm);
      min-width: 60px;
      
      .bar-percentage {
        font-size: var(--ls-font-size-xs);
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        margin-left: auto;
      }
    }
  }
}
</style>
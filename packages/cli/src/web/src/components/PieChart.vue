<template>
  <div class="pie-chart-wrapper">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="pie-chart-svg">
      <g :transform="`translate(${size / 2}, ${size / 2})`">
        <!-- 饼图片段 -->
        <g v-for="(segment, index) in segments" :key="index" class="pie-segment-group">
          <path
            :d="segment.path"
            :fill="segment.color"
            class="pie-segment"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
            :class="{ 'hovered': hoveredIndex === index }"
          />
        </g>
        
        <!-- 中心圆 -->
        <circle
          :r="innerRadius"
          fill="var(--ldesign-bg-color-container)"
          class="pie-center-circle"
        />
        
        <!-- 中心文字 -->
        <text
          x="0"
          y="-10"
          text-anchor="middle"
          class="pie-center-value"
        >
          {{ totalLabel }}
        </text>
        <text
          x="0"
          y="15"
          text-anchor="middle"
          class="pie-center-label"
        >
          总大小
        </text>
      </g>
    </svg>
    
    <!-- 悬停提示 -->
    <div v-if="hoveredIndex !== null" class="pie-tooltip">
      <div class="tooltip-header">
        <div class="tooltip-color" :style="{ backgroundColor: segments[hoveredIndex].color }"></div>
        <span class="tooltip-name">{{ data[hoveredIndex].name }}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span>大小:</span>
          <strong>{{ data[hoveredIndex].displayValue }}</strong>
        </div>
        <div class="tooltip-row">
          <span>占比:</span>
          <strong>{{ data[hoveredIndex].percentage.toFixed(1) }}%</strong>
        </div>
        <div class="tooltip-row" v-if="data[hoveredIndex].count">
          <span>数量:</span>
          <strong>{{ data[hoveredIndex].count }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface PieChartData {
  name: string
  value: number
  displayValue: string
  count?: number
  color?: string
}

interface Props {
  data: PieChartData[]
  size?: number
  innerRadius?: number
  totalLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 300,
  innerRadius: 70,
  totalLabel: '0 MB'
})

const hoveredIndex = ref<number | null>(null)

// 默认颜色
const defaultColors = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336',
  '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#E91E63'
]

// 计算总值
const total = computed(() => {
  return props.data.reduce((sum, item) => sum + item.value, 0)
})

// 计算饼图片段
const segments = computed(() => {
  if (total.value === 0) return []
  
  const outerRadius = props.size / 2 - 10
  const result: Array<{ path: string; color: string; percentage: number }> = []
  let currentAngle = -90 // 从顶部开始
  
  props.data.forEach((item, index) => {
    const percentage = (item.value / total.value) * 100
    const angle = (item.value / total.value) * 360
    const endAngle = currentAngle + angle
    
    // 计算路径
    const startRad = (currentAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = outerRadius * Math.cos(startRad)
    const y1 = outerRadius * Math.sin(startRad)
    const x2 = outerRadius * Math.cos(endRad)
    const y2 = outerRadius * Math.sin(endRad)
    
    const innerX1 = props.innerRadius * Math.cos(startRad)
    const innerY1 = props.innerRadius * Math.sin(startRad)
    const innerX2 = props.innerRadius * Math.cos(endRad)
    const innerY2 = props.innerRadius * Math.sin(endRad)
    
    const largeArc = angle > 180 ? 1 : 0
    
    const path = [
      `M ${innerX1} ${innerY1}`,
      `L ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${innerX2} ${innerY2}`,
      `A ${props.innerRadius} ${props.innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1}`,
      'Z'
    ].join(' ')
    
    result.push({
      path,
      color: item.color || defaultColors[index % defaultColors.length],
      percentage
    })
    
    currentAngle = endAngle
  })
  
  return result
})

// 为数据添加百分比
const dataWithPercentage = computed(() => {
  return props.data.map((item, index) => ({
    ...item,
    percentage: (item.value / total.value) * 100,
    color: item.color || defaultColors[index % defaultColors.length]
  }))
})
</script>

<style lang="less" scoped>
.pie-chart-wrapper {
  position: relative;
  display: inline-block;
}

.pie-chart-svg {
  display: block;
  
  .pie-segment {
    cursor: pointer;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    
    &.hovered {
      transform: scale(1.05);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }
  }
  
  .pie-center-circle {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
  }
  
  .pie-center-value {
    font-size: 24px;
    font-weight: 700;
    fill: var(--ldesign-text-color-primary);
    font-family: 'Consolas', 'Monaco', monospace;
  }
  
  .pie-center-label {
    font-size: 12px;
    fill: var(--ldesign-text-color-secondary);
  }
}

.pie-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-radius-md);
  padding: var(--ls-spacing-sm) var(--ls-spacing-base);
  box-shadow: var(--ldesign-shadow-3);
  pointer-events: none;
  z-index: 1000;
  min-width: 180px;
  
  .tooltip-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    margin-bottom: var(--ls-spacing-xs);
    padding-bottom: var(--ls-spacing-xs);
    border-bottom: 1px solid var(--ldesign-border-color);
    
    .tooltip-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    
    .tooltip-name {
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      font-size: var(--ls-font-size-sm);
    }
  }
  
  .tooltip-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: var(--ls-spacing-base);
      font-size: var(--ls-font-size-xs);
      
      span {
        color: var(--ldesign-text-color-secondary);
      }
      
      strong {
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }
    }
  }
}
</style>
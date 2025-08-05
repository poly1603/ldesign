<template>
  <div class="color-palette-card">
    <div class="palette-header" :style="{ backgroundColor: baseColor, color: getContrastColor(baseColor) }">
      <div class="palette-title">{{ title }}</div>
      <div class="palette-subtitle">{{ subtitle }}</div>
      <div class="base-info">
        <div class="base-name">{{ baseName }}</div>
        <div class="base-hex">{{ baseColor }}</div>
      </div>
    </div>
    
    <div class="palette-colors">
      <div 
        v-for="(color, index) in colors" 
        :key="index"
        class="color-item"
        :style="{ backgroundColor: color }"
        @click="copyColor(color)"
      >
        <div class="color-name">{{ colorName }}-{{ index + 1 }}</div>
        <div class="color-contrast">{{ getContrastRatio(color) }}</div>
        <div class="color-hex">{{ color.toUpperCase() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  subtitle: string
  baseName: string
  colorName: string
  baseColor: string
  colors: string[]
}

const props = defineProps<Props>()

// 计算对比度
const getContrastRatio = (color: string): string => {
  const rgb = hexToRgb(color)
  if (!rgb) return '0.00'
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  const whiteLuminance = 1
  const blackLuminance = 0
  
  const contrastWithWhite = (whiteLuminance + 0.05) / (luminance + 0.05)
  const contrastWithBlack = (luminance + 0.05) / (blackLuminance + 0.05)
  
  const contrast = Math.max(contrastWithWhite, contrastWithBlack)
  const rating = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'A' : ''
  
  return `${contrast.toFixed(2)} (${rating})`
}

// 获取对比色
const getContrastColor = (color: string): string => {
  const rgb = hexToRgb(color)
  if (!rgb) return '#000000'
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// 复制颜色
const copyColor = async (color: string) => {
  try {
    await navigator.clipboard.writeText(color)
    console.log(`已复制颜色: ${color}`)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 工具函数
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
</script>

<style scoped lang="less">
.color-palette-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  margin-bottom: 24px;
}

.palette-header {
  padding: 20px;
  position: relative;
  
  .palette-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .palette-subtitle {
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 16px;
  }
  
  .base-info {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .base-name {
      font-size: 16px;
      font-weight: 500;
    }
    
    .base-hex {
      font-size: 14px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      opacity: 0.9;
    }
  }
}

.palette-colors {
  .color-item {
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    &:hover {
      transform: translateX(4px);
      box-shadow: inset 4px 0 0 rgba(255, 255, 255, 0.3);
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .color-name {
      font-size: 14px;
      font-weight: 500;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .color-contrast {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    
    .color-hex {
      font-size: 14px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .color-palette-card {
    background: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
</style>

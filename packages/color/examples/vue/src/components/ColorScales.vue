<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'
import { computed } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { themeManager, currentTheme, currentMode } = useTheme()
const { showNotification } = useNotification()

const categoryNames = {
  primary: '主色调',
  success: '成功色',
  warning: '警告色',
  danger: '危险色',
  gray: '灰色',
}

const colorScales = computed(() => {
  const generatedTheme = themeManager.getGeneratedTheme(currentTheme.value)
  if (!generatedTheme)
    return {}

  const scales = generatedTheme[currentMode.value].scales
  const result: Record<
    string,
    { colors: string[], indices: Record<string, string>, baseColor: string }
  > = {}

  // 转换色阶数据格式
  for (const [category, scale] of Object.entries(scales)) {
    if (scale && typeof scale === 'object' && 'indices' in scale) {
      const indices = scale.indices as Record<string, string>
      const colors = Object.values(indices)
      result[category] = {
        colors,
        indices,
        baseColor: colors[5] || colors[Math.floor(colors.length / 2)] || colors[0] || '#000000', // 使用中间色作为基础色
      }
    }
  }

  return result
})

// 获取颜色的对比度文本颜色
function getContrastTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '')
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

// 计算对比度
function getContrastRatio(color: string): string {
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

// 工具函数
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getCategoryName(category: string) {
  return categoryNames[category as keyof typeof categoryNames] || category
}

async function copyColor(color: string) {
  try {
    await navigator.clipboard.writeText(color)
    showNotification(`已复制 ${color}`, 'success')
  }
  catch {
    showNotification('复制失败', 'error')
  }
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">
      🌈 色阶展示
    </h2>
    <p class="card-description">
      当前主题的完整色阶展示，点击色块可复制颜色值
    </p>

    <div class="scales-container">
      <div
        v-for="(scale, category) in colorScales"
        :key="category"
        class="color-palette-card"
      >
        <!-- 卡片头部 -->
        <div
          class="palette-header"
          :style="{
            backgroundColor: scale.baseColor,
            color: getContrastTextColor(scale.baseColor),
          }"
        >
          <div class="palette-title">{{ getCategoryName(category) }}</div>
          <div class="palette-subtitle">{{ category }}</div>
          <div class="base-info">
            <div class="base-name">{{ category }}-6</div>
            <div class="base-hex">{{ scale.baseColor }}</div>
          </div>
        </div>

        <!-- 颜色列表 -->
        <div class="palette-colors">
          <div
            v-for="(color, index) in scale.colors || []"
            :key="index"
            class="color-item"
            :style="{
              backgroundColor: color,
              color: getContrastTextColor(color),
            }"
            :title="`点击复制 ${color}`"
            @click="copyColor(color)"
          >
            <div class="color-name">{{ category }}-{{ index + 1 }}</div>
            <div class="color-contrast">{{ getContrastRatio(color) }}</div>
            <div class="color-hex">{{ color.toUpperCase() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-description {
  color: var(--color-text-secondary, #666);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.scales-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ColorPaletteCard 样式 */
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
}

.palette-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.palette-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 12px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.base-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base-name {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.base-hex {
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.palette-colors .color-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: none;
  border-radius: 0;
  margin: 0;
}

.palette-colors .color-item:hover {
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 rgba(255, 255, 255, 0.3);
}

.palette-colors .color-item:last-child {
  border-bottom: none;
}

.palette-colors .color-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.palette-colors .color-contrast {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.palette-colors .color-hex {
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .color-palette-card {
    background: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

@media (max-width: 768px) {
  .palette-header {
    padding: 16px;
  }

  .palette-colors .color-item {
    padding: 10px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .palette-colors .color-contrast {
    font-size: 11px;
  }
}
</style>

<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'
import { computed, ref } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { themeManager, currentTheme, currentMode } = useTheme()
const { showNotification } = useNotification()

const hoveredColor = ref<string | null>(null)

const categoryNames = {
  primary: '主色调',
  success: '成功色',
  warning: '警告色',
  danger: '危险色',
  gray: '灰色',
}

const colorScales = computed(() => {
  const generatedTheme = themeManager.getGeneratedTheme(currentTheme.value)
  if (!generatedTheme) return {}

  const scales = generatedTheme[currentMode.value].scales
  const result: Record<
    string,
    { colors: string[]; indices: Record<string, string> }
  > = {}

  // 转换色阶数据格式
  for (const [category, scale] of Object.entries(scales)) {
    if (scale && typeof scale === 'object' && 'indices' in scale) {
      const indices = scale.indices as Record<string, string>
      result[category] = {
        colors: Object.values(indices),
        indices,
      }
    }
  }

  return result
})

// 获取色阶中的特定颜色
function _getScaleColor(category: string, index: number): string {
  const scale = colorScales.value[category]
  if (!scale || !scale.colors) return ''
  return scale.colors[index] || ''
}

// 获取颜色的对比度文本颜色
function getContrastTextColor(backgroundColor: string): string {
  // 简单的对比度计算，实际项目中可以使用更精确的算法
  const hex = backgroundColor.replace('#', '')
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

function getCategoryName(category: string) {
  return categoryNames[category as keyof typeof categoryNames] || category
}

async function copyColor(color: string) {
  try {
    await navigator.clipboard.writeText(color)
    showNotification(`已复制 ${color}`, 'success')
  } catch {
    showNotification('复制失败', 'error')
  }
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">🌈 色阶展示</h2>
    <p class="card-description">当前主题的完整色阶展示，点击色块可复制颜色值</p>

    <div class="scales-container">
      <div
        v-for="(scale, category) in colorScales"
        :key="category"
        class="scale-group"
      >
        <div class="scale-header">
          <h3 class="scale-title">
            {{ getCategoryName(category) }}
          </h3>
          <span class="scale-count">10 级色阶</span>
        </div>

        <div class="scale-colors">
          <div
            v-for="(color, index) in scale.colors || []"
            :key="index"
            class="scale-color"
            :style="{
              backgroundColor: color,
              color: getContrastTextColor(color),
            }"
            :title="`${category}-${index + 1}: ${color}`"
            @click="copyColor(color)"
            @mouseenter="hoveredColor = color"
            @mouseleave="hoveredColor = null"
          >
            <span class="scale-index">{{ index + 1 }}</span>
            <span v-if="hoveredColor === color" class="color-value">{{
              color
            }}</span>
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

.scale-group {
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 8px;
  overflow: hidden;
}

.scale-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-gray-1, #fafafa);
  border-bottom: 1px solid var(--color-border, #e8e8e8);
}

.scale-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin: 0;
}

.scale-count {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #666);
  background: var(--color-background, #ffffff);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.scale-colors {
  display: flex;
  height: 60px;
}

.scale-color {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 60px;
}

.scale-color:hover {
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.scale-index {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.color-value {
  font-size: 0.7rem;
  opacity: 0.8;
  font-weight: 500;
  text-align: center;
  line-height: 1;
}

@media (max-width: 768px) {
  .scale-colors {
    flex-wrap: wrap;
    height: auto;
  }

  .scale-color {
    flex-basis: 20%;
    min-height: 50px;
  }
}
</style>

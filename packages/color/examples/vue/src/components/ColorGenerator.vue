<script setup lang="ts">
import {
  COLOR_GENERATION_PRESETS,
  type ColorConfig,
  createCustomTheme,
  generateColorConfig,
  generateColorScales,
  isValidHex,
} from '@ldesign/color'
import { useTheme } from '@ldesign/color/vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { registerTheme, setTheme, currentMode } = useTheme()
const { showNotification } = useNotification()

const primaryColor = ref('#1890ff')
const selectedPreset = ref('default')
const generatedColors = ref<ColorConfig | null>(null)
const generatedScales = ref<Record<string, any> | null>(null)
const error = ref('')
const isGenerating = ref(false)

const isValidColor = computed(() => {
  return isValidHex(primaryColor.value)
})

const categoryNames = {
  primary: '主色调',
  success: '成功色',
  warning: '警告色',
  danger: '危险色',
  gray: '灰色',
}

// 监听主色调变化，实时生成颜色
watch(
  primaryColor,
  async () => {
    if (isValidColor.value) {
      await generateColorsRealtime()
    }
  },
  { immediate: true },
)

// 监听预设变化，重新生成颜色
watch(selectedPreset, async () => {
  if (isValidColor.value) {
    await generateColorsRealtime()
  }
})

// 监听颜色模式变化，重新生成色阶
watch(currentMode, async () => {
  if (generatedColors.value) {
    await generateScalesRealtime()
  }
})

// 实时生成颜色和色阶
async function generateColorsRealtime() {
  if (!isValidColor.value) {
    error.value = '请输入有效的颜色值'
    generatedColors.value = null
    generatedScales.value = null
    return
  }

  isGenerating.value = true

  try {
    error.value = ''

    // 生成基础颜色配置
    const preset
      = COLOR_GENERATION_PRESETS[
        selectedPreset.value as keyof typeof COLOR_GENERATION_PRESETS
      ]
    const colors = generateColorConfig(primaryColor.value, preset)
    generatedColors.value = colors

    // 等待DOM更新后生成色阶
    await nextTick()
    await generateScalesRealtime()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '颜色生成失败'
    generatedColors.value = null
    generatedScales.value = null
  }
  finally {
    isGenerating.value = false
  }
}

// 实时生成色阶
async function generateScalesRealtime() {
  if (!generatedColors.value)
    return

  try {
    // 确保所有颜色值都存在
    const colors = {
      primary: generatedColors.value.primary,
      success: generatedColors.value.success || generatedColors.value.primary,
      warning: generatedColors.value.warning || generatedColors.value.primary,
      danger: generatedColors.value.danger || generatedColors.value.primary,
      gray: generatedColors.value.gray || '#8c8c8c',
    }
    const scales = generateColorScales(colors, currentMode.value)
    generatedScales.value = scales
  }
  catch (err) {
    console.warn('Failed to generate color scales:', err)
    generatedScales.value = null
  }
}

// 兼容性方法
function generateColors() {
  generateColorsRealtime()
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

async function applyAsTheme(category: string, color: string) {
  try {
    const themeName = `generated-${category}-${Date.now()}`
    const customTheme = createCustomTheme(themeName, color, {
      displayName: `生成的${getCategoryName(category)}主题`,
      description: `基于 ${color} 生成的主题`,
    })

    registerTheme(customTheme)
    await setTheme(themeName)

    showNotification(`已应用 ${getCategoryName(category)} 主题`, 'success')
  }
  catch {
    showNotification('应用主题失败', 'error')
  }
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">
      🎨 颜色生成器
    </h2>

    <div class="generator-controls">
      <div class="form-group">
        <label class="form-label">主色调</label>
        <div class="color-input-group">
          <input
            v-model="primaryColor"
            type="color"
            class="color-picker"
            @input="generateColors"
          >
          <input
            v-model="primaryColor"
            type="text"
            class="form-control"
            placeholder="#1890ff"
            @input="generateColors"
          >
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">生成策略</label>
        <select
          v-model="selectedPreset"
          class="form-control"
          @change="generateColors"
        >
          <option value="default">
            默认
          </option>
          <option value="soft">
            柔和
          </option>
          <option value="vibrant">
            鲜艳
          </option>
          <option value="monochrome">
            单色
          </option>
        </select>
      </div>

      <button
        class="btn btn-primary"
        :disabled="!isValidColor"
        @click="generateColors"
      >
        <span class="icon">✨</span>
        生成颜色
      </button>
    </div>

    <!-- 生成状态指示器 -->
    <div v-if="isGenerating" class="generating-indicator">
      <div class="spinner" />
      <span>正在生成颜色...</span>
    </div>

    <!-- 生成的颜色展示 -->
    <div v-if="generatedColors && !isGenerating" class="generated-colors">
      <div class="colors-grid">
        <div
          v-for="(color, category) in generatedColors"
          :key="category"
          class="color-card"
          @click="color && copyColor(color)"
        >
          <div
            v-if="color"
            class="color-preview"
            :style="{ backgroundColor: color }"
          >
            <span class="color-name">{{ getCategoryName(category) }}</span>
          </div>
          <div v-if="color" class="color-info">
            <div class="color-value">
              {{ color }}
            </div>
            <div class="color-actions">
              <button
                class="btn-icon"
                title="复制颜色值"
                @click.stop="copyColor(color)"
              >
                📋
              </button>
              <button
                class="btn-icon"
                title="应用为主题"
                @click.stop="applyAsTheme(category, color)"
              >
                🎨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 色阶预览 -->
    <div v-if="generatedScales && !isGenerating" class="color-scales-preview">
      <h3 class="scales-title">
        色阶预览
      </h3>
      <div class="scales-container">
        <div
          v-for="(scale, category) in generatedScales"
          :key="category"
          class="scale-group"
        >
          <div class="scale-header">
            <span class="scale-name">{{ getCategoryName(category) }}</span>
            <span class="scale-mode">{{
              currentMode === 'light' ? '亮色模式' : '暗色模式'
            }}</span>
          </div>
          <div class="scale-colors">
            <div
              v-for="(color, index) in scale.colors || []"
              :key="index"
              class="scale-color"
              :style="{ backgroundColor: color }"
              :title="`${category}-${index + 1}: ${color}`"
              @click="copyColor(color)"
            >
              <span class="scale-index">{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.generator-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.color-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 40px;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.color-card {
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.color-preview {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.color-name {
  font-size: 0.875rem;
}

.color-info {
  padding: 0.75rem;
  background: var(--color-background, #ffffff);
}

.color-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #666);
  margin-bottom: 0.5rem;
}

.color-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--color-gray-1, #fafafa);
  border-color: var(--color-primary, #1890ff);
}

.error-message {
  padding: 0.75rem 1rem;
  background: var(--color-danger-1, #fff2f0);
  color: var(--color-danger, #ff4d4f);
  border: 1px solid var(--color-danger-3, #ffccc7);
  border-radius: 6px;
  font-size: 0.875rem;
}

.icon {
  margin-right: 0.25rem;
}

/* 生成状态指示器 */
.generating-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--color-text-secondary, #666);
  font-size: 0.9rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border, #e8e8e8);
  border-top: 2px solid var(--color-primary-6, #1890ff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 色阶预览样式 */
.color-scales-preview {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border, #e8e8e8);
}

.scales-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 1rem;
}

.scales-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  padding: 0.5rem 1rem;
  background: var(--color-gray-1, #fafafa);
  border-bottom: 1px solid var(--color-border, #e8e8e8);
}

.scale-name {
  font-weight: 600;
  color: var(--color-text, #333);
  font-size: 0.9rem;
}

.scale-mode {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #666);
  background: var(--color-background, #ffffff);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.scale-colors {
  display: flex;
  height: 50px;
}

.scale-color {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.scale-color:hover {
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.scale-index {
  font-size: 0.7rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .colors-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .color-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .color-picker {
    width: 100%;
  }

  .scale-colors {
    flex-wrap: wrap;
    height: auto;
  }

  .scale-color {
    flex-basis: 20%;
    min-height: 40px;
  }
}
</style>

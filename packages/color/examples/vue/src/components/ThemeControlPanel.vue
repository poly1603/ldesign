<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTheme } from '@ldesign/color/vue'
import { getRandomPresetTheme } from '@ldesign/color'
import type { ColorMode } from '@ldesign/color'

const {
  currentTheme,
  currentMode,
  availableThemes,
  setTheme,
  setMode,
  toggleMode,
  getThemeConfig,
} = useTheme()

const selectedTheme = ref(currentTheme.value)

const modes = [
  { value: 'light' as ColorMode, label: '亮色', icon: '☀️' },
  { value: 'dark' as ColorMode, label: '暗色', icon: '🌙' },
]

// 监听当前主题变化，同步选择器
watch(currentTheme, (newTheme) => {
  selectedTheme.value = newTheme
})

// 预览颜色
const previewColors = computed(() => {
  return [
    { name: 'primary', label: '主色', value: 'var(--color-primary)' },
    { name: 'success', label: '成功', value: 'var(--color-success)' },
    { name: 'warning', label: '警告', value: 'var(--color-warning)' },
    { name: 'danger', label: '危险', value: 'var(--color-danger)' },
    { name: 'gray', label: '灰色', value: 'var(--color-gray-5)' },
  ]
})

// 获取主题显示名称
function getThemeDisplayName(themeName: string) {
  const config = getThemeConfig(themeName)
  return config?.displayName || themeName
}

// 处理主题变化
async function handleThemeChange() {
  if (selectedTheme.value && selectedTheme.value !== currentTheme.value) {
    await setTheme(selectedTheme.value)
  }
}

// 随机主题
async function randomTheme() {
  const randomThemeConfig = getRandomPresetTheme()
  await setTheme(randomThemeConfig.name)
}

// 重置为默认主题
async function resetToDefault() {
  await setTheme('default')
  await setMode('light')
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">
      🎨 主题控制面板
    </h2>

    <div class="controls-grid">
      <!-- 主题选择 -->
      <div class="control-group">
        <label class="form-label">选择主题</label>
        <select
          v-model="selectedTheme"
          class="form-control"
          @change="handleThemeChange"
        >
          <option
            v-for="theme in availableThemes"
            :key="theme"
            :value="theme"
          >
            {{ getThemeDisplayName(theme) }}
          </option>
        </select>
      </div>

      <!-- 模式选择 -->
      <div class="control-group">
        <label class="form-label">颜色模式</label>
        <div class="mode-selector">
          <button
            v-for="mode in modes"
            :key="mode.value"
            class="mode-btn" :class="[
              { active: currentMode === mode.value },
            ]"
            @click="setMode(mode.value)"
          >
            <span class="mode-icon">{{ mode.icon }}</span>
            <span class="mode-label">{{ mode.label }}</span>
          </button>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="control-group">
        <label class="form-label">快速操作</label>
        <div class="quick-actions">
          <button
            class="btn btn-secondary btn-sm"
            title="切换亮色/暗色模式"
            @click="toggleMode"
          >
            <span class="icon">🔄</span>
            切换模式
          </button>

          <button
            class="btn btn-secondary btn-sm"
            title="随机选择主题"
            @click="randomTheme"
          >
            <span class="icon">🎲</span>
            随机主题
          </button>

          <button
            class="btn btn-secondary btn-sm"
            title="重置为默认主题"
            @click="resetToDefault"
          >
            <span class="icon">🏠</span>
            重置默认
          </button>
        </div>
      </div>

      <!-- 主题预览 -->
      <div class="control-group full-width">
        <label class="form-label">主题预览</label>
        <div class="theme-preview">
          <div class="preview-colors">
            <div
              v-for="color in previewColors"
              :key="color.name"
              class="preview-color" :class="[color.name]"
              :title="`${color.label}: ${color.value}`"
            >
              <span class="color-label">{{ color.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

.mode-selector {
  display: flex;
  gap: 0.5rem;
}

.mode-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border: 2px solid var(--color-border, #e8e8e8);
  border-radius: 8px;
  background: var(--color-background, #ffffff);
  color: var(--color-text, #333);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  border-color: var(--color-primary, #1890ff);
  background: var(--color-primary-1, #e6f7ff);
}

.mode-btn.active {
  border-color: var(--color-primary, #1890ff);
  background: var(--color-primary, #1890ff);
  color: white;
}

.mode-icon {
  font-size: 1.25rem;
}

.mode-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-actions .btn {
  flex: 1;
  min-width: 120px;
}

.icon {
  margin-right: 0.25rem;
}

.theme-preview {
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 8px;
  overflow: hidden;
}

.preview-colors {
  display: flex;
  height: 80px;
}

.preview-color {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
}

.preview-color:hover {
  transform: scale(1.05);
  z-index: 1;
}

.preview-color.primary {
  background: var(--color-primary, #1890ff);
}

.preview-color.success {
  background: var(--color-success, #52c41a);
}

.preview-color.warning {
  background: var(--color-warning, #faad14);
}

.preview-color.danger {
  background: var(--color-danger, #ff4d4f);
}

.preview-color.gray {
  background: var(--color-gray-5, #8c8c8c);
}

.color-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .mode-selector {
    flex-direction: column;
  }

  .mode-btn {
    flex-direction: row;
    justify-content: center;
    padding: 0.5rem 1rem;
  }

  .quick-actions .btn {
    min-width: auto;
  }

  .preview-colors {
    flex-wrap: wrap;
    height: auto;
  }

  .preview-color {
    min-height: 50px;
    flex-basis: 50%;
  }
}
</style>

<script setup lang="ts">
import { getRandomPresetTheme, getSystemTheme } from '@ldesign/color'
import { useTheme } from '@ldesign/color/vue'
import { computed, ref, watch } from 'vue'

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
const systemTheme = ref(getSystemTheme())

// 监听当前主题变化，同步选择器
watch(currentTheme, (newTheme) => {
  selectedTheme.value = newTheme
})

// 预览颜色
const _previewColors = computed(() => {
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
async function _randomTheme() {
  const randomThemeConfig = getRandomPresetTheme()
  await setTheme(randomThemeConfig.name)
}

// 随机主题
async function handleRandomTheme() {
  const _randomTheme = getRandomPresetTheme()
  await setTheme(_randomTheme.name)
}

// 同步系统主题
function syncSystemTheme() {
  const currentSystemTheme = getSystemTheme()
  systemTheme.value = currentSystemTheme
  setMode(currentSystemTheme)
}

// 重置为默认主题
async function _resetToDefault() {
  await setTheme('default')
  await setMode('light')
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">
      🎛️ 主题控制
    </h2>

    <div class="control-group">
      <label for="theme-select">选择主题:</label>
      <select
        id="theme-select"
        v-model="selectedTheme"
        class="theme-select"
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

    <div class="control-group">
      <label for="mode-select">颜色模式:</label>
      <select
        id="mode-select"
        :value="currentMode"
        class="mode-select"
        @change="setMode(($event.target as HTMLSelectElement).value as any)"
      >
        <option value="light">
          亮色模式
        </option>
        <option value="dark">
          暗色模式
        </option>
      </select>
    </div>

    <div class="control-group">
      <button
        class="btn btn-primary"
        @click="toggleMode"
      >
        切换到{{ currentMode === 'light' ? '暗色' : '亮色' }}模式
      </button>
      <button
        class="btn btn-secondary"
        @click="handleRandomTheme"
      >
        随机主题
      </button>
      <button
        class="btn btn-secondary"
        @click="syncSystemTheme"
      >
        同步系统主题
      </button>
    </div>

    <div class="status-info">
      <div class="status-item">
        <span class="label">当前主题:</span>
        <span class="value">{{ getThemeDisplayName(currentTheme) }}</span>
      </div>
      <div class="status-item">
        <span class="label">当前模式:</span>
        <span class="value">{{ currentMode === 'light' ? '亮色模式' : '暗色模式' }}</span>
      </div>
      <div class="status-item">
        <span class="label">系统主题:</span>
        <span class="value">{{ systemTheme }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-group {
  margin-bottom: 1.5rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.875rem;
}

.theme-select,
.mode-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.theme-select:focus,
.mode-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: #0958d9;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background-light);
  border-color: var(--color-primary);
}

.status-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
}

.status-item .label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.status-item .value {
  font-weight: 600;
  color: var(--color-primary);
}
</style>

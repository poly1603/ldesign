<script setup lang="ts">
import {
  useSystemThemeSync,
  useTheme,
  useThemeSelector,
  useThemeToggle,
} from '@ldesign/color/vue'

// useTheme 演示
const { currentTheme, currentMode, isDark, availableThemes } = useTheme()

// useThemeToggle 演示
const { currentMode: toggleCurrentMode, toggle, isLight } = useThemeToggle()

// useThemeSelector 演示
const {
  currentTheme: selectorCurrentTheme,
  availableThemes: selectorAvailableThemes,
  selectTheme,
} = useThemeSelector()

// useSystemThemeSync 演示
const { systemTheme, isSystemDark, syncWithSystem } = useSystemThemeSync()
</script>

<template>
  <div class="card">
    <h2 class="card-title">
      🔧 组合式 API 演示
    </h2>

    <div class="demo-sections">
      <!-- useTheme 演示 -->
      <div class="demo-section">
        <h3 class="demo-title">
          useTheme
        </h3>
        <div class="demo-content">
          <p><strong>当前主题:</strong> {{ currentTheme }}</p>
          <p><strong>当前模式:</strong> {{ currentMode }}</p>
          <p><strong>是否暗色:</strong> {{ isDark ? '是' : '否' }}</p>
          <p><strong>可用主题:</strong> {{ availableThemes.length }} 个</p>
        </div>
      </div>

      <!-- useThemeToggle 演示 -->
      <div class="demo-section">
        <h3 class="demo-title">
          useThemeToggle
        </h3>
        <div class="demo-content">
          <p><strong>当前模式:</strong> {{ toggleCurrentMode }}</p>
          <div class="demo-actions">
            <button class="btn btn-sm btn-secondary" @click="toggle">
              切换模式
            </button>
            <span class="status">
              {{ isLight ? '亮色模式' : '暗色模式' }}
            </span>
          </div>
        </div>
      </div>

      <!-- useThemeSelector 演示 -->
      <div class="demo-section">
        <h3 class="demo-title">
          useThemeSelector
        </h3>
        <div class="demo-content">
          <select
            :value="selectorCurrentTheme"
            class="form-control"
            @change="(e) => selectTheme((e.target as HTMLSelectElement).value)"
          >
            <option
              v-for="theme in selectorAvailableThemes"
              :key="theme"
              :value="theme"
            >
              {{ theme }}
            </option>
          </select>
        </div>
      </div>

      <!-- useSystemThemeSync 演示 -->
      <div class="demo-section">
        <h3 class="demo-title">
          useSystemThemeSync
        </h3>
        <div class="demo-content">
          <p><strong>系统主题:</strong> {{ systemTheme }}</p>
          <p><strong>是否系统暗色:</strong> {{ isSystemDark ? '是' : '否' }}</p>
          <button class="btn btn-sm btn-secondary" @click="syncWithSystem">
            同步系统主题
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.demo-section {
  padding: 1rem;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  background: var(--color-background, #ffffff);
}

.demo-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary, #1890ff);
  margin-bottom: 0.75rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.demo-content p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text, #333);
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.status {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #666);
  font-weight: 500;
}
</style>

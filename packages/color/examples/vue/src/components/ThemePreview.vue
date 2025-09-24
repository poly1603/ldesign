<script setup lang="ts">
import { presetThemes, themeCategories } from '@ldesign/color'
import { useTheme } from '@ldesign/color/vue'
import { computed } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { setTheme, currentTheme, currentMode } = useTheme()
const { showNotification } = useNotification()

// 按分类组织主题
const categorizedThemes = computed(() => {
  return {
    basic: themeCategories.basic,
    colorful: themeCategories.colorful,
  }
})

// 应用主题预览
async function applyTheme(themeName: string) {
  try {
    await setTheme(themeName, currentMode.value)
    showNotification(`已应用 ${getThemeDisplayName(themeName)} 主题`, 'success')
  } catch (error) {
    showNotification('主题应用失败', 'error')
    console.error('Failed to apply theme:', error)
  }
}

// 获取主题显示名称
function getThemeDisplayName(themeName: string): string {
  const theme = presetThemes.find(t => t.name === themeName)
  return theme?.displayName || themeName
}

// 获取主题描述
function getThemeDescription(themeName: string): string {
  const theme = presetThemes.find(t => t.name === themeName)
  return theme?.description || ''
}

// 获取主题主色调
function getThemePrimaryColor(themeName: string): string {
  const theme = presetThemes.find(t => t.name === themeName)
  return theme?.light.primary || '#1890ff'
}

// 检查是否为当前主题
function isCurrentTheme(themeName: string): boolean {
  return currentTheme.value === themeName
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">🎨 主题预览</h2>
    <p class="card-description">选择一个预设主题来快速应用，这些主题都是精心设计的美观配色方案</p>

    <!-- 基础主题 -->
    <div class="theme-section">
      <h3 class="section-title">基础主题</h3>
      <div class="theme-grid">
        <div
          v-for="theme in categorizedThemes.basic"
          :key="theme.name"
          class="theme-card"
          :class="{ active: isCurrentTheme(theme.name) }"
          @click="applyTheme(theme.name)"
        >
          <div class="theme-preview" :style="{ backgroundColor: getThemePrimaryColor(theme.name) }">
            <div class="theme-overlay">
              <span v-if="isCurrentTheme(theme.name)" class="current-badge">当前</span>
            </div>
          </div>
          <div class="theme-info">
            <h4 class="theme-name">
              {{ getThemeDisplayName(theme.name) }}
            </h4>
            <p class="theme-description">
              {{ getThemeDescription(theme.name) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 彩色主题 -->
    <div class="theme-section">
      <h3 class="section-title">彩色主题</h3>
      <div class="theme-grid">
        <div
          v-for="theme in categorizedThemes.colorful"
          :key="theme.name"
          class="theme-card"
          :class="{ active: isCurrentTheme(theme.name) }"
          @click="applyTheme(theme.name)"
        >
          <div class="theme-preview" :style="{ backgroundColor: getThemePrimaryColor(theme.name) }">
            <div class="theme-overlay">
              <span v-if="isCurrentTheme(theme.name)" class="current-badge">当前</span>
            </div>
          </div>
          <div class="theme-info">
            <h4 class="theme-name">
              {{ getThemeDisplayName(theme.name) }}
            </h4>
            <p class="theme-description">
              {{ getThemeDescription(theme.name) }}
            </p>
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
  margin-bottom: 2rem;
}

.theme-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border, #e8e8e8);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.theme-card {
  border: 2px solid var(--color-border, #e8e8e8);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--color-background, #ffffff);
}

.theme-card:hover {
  border-color: var(--color-primary-5, #1890ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-card.active {
  border-color: var(--color-primary-6, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.theme-preview {
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-card:hover .theme-overlay {
  opacity: 1;
}

.theme-card.active .theme-overlay {
  opacity: 1;
}

.current-badge {
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-text, #333);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.theme-info {
  padding: 1rem;
}

.theme-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin: 0 0 0.5rem 0;
}

.theme-description {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .theme-preview {
    height: 60px;
  }

  .theme-info {
    padding: 0.75rem;
  }

  .theme-name {
    font-size: 0.9rem;
  }

  .theme-description {
    font-size: 0.75rem;
  }
}
</style>

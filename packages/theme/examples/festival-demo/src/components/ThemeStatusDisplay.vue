<template>
  <div class="theme-status-display">
    <div class="status-header">
      <h4>🎨 当前主题状态</h4>
      <button @click="toggleExpanded" class="toggle-btn">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>

    <div class="status-content" :class="{ expanded: isExpanded }">
      <div class="theme-info">
        <div class="info-item">
          <span class="label">主题名称:</span>
          <span class="value">{{ themeMetadata?.displayName || '未知' }}</span>
        </div>
        <div class="info-item">
          <span class="label">主题描述:</span>
          <span class="value">{{
            themeMetadata?.description || '无描述'
          }}</span>
        </div>
        <div class="info-item">
          <span class="label">主色调:</span>
          <span class="value">
            <span
              class="color-preview"
              :style="{ backgroundColor: themeMetadata?.primary }"
            ></span>
            {{ themeMetadata?.primary }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">装饰类型:</span>
          <span class="value">6 种</span>
        </div>
      </div>

      <div v-if="isExpanded" class="expanded-info">
        <div class="color-palette">
          <h5>🎨 色彩搭配</h5>
          <div class="color-grid">
            <div class="color-item">
              <div
                class="color-swatch"
                :style="{ backgroundColor: themeMetadata?.primary }"
              ></div>
              <span>主色</span>
            </div>
            <div class="color-item">
              <div
                class="color-swatch"
                :style="{ backgroundColor: themeMetadata?.secondary }"
              ></div>
              <span>辅色</span>
            </div>
            <div class="color-item">
              <div
                class="color-swatch"
                :style="{ backgroundColor: themeMetadata?.accent }"
              ></div>
              <span>强调色</span>
            </div>
          </div>
        </div>

        <div class="decoration-preview">
          <h5>🎨 装饰预览</h5>
          <div class="decoration-types">
            <div class="decoration-type">
              <span class="decoration-label">头像:</span>
              <span class="decoration-emoji">{{
                getCurrentDecorations()?.avatar?.emoji || '✨'
              }}</span>
            </div>
            <div class="decoration-type">
              <span class="decoration-label">按钮:</span>
              <span class="decoration-emoji">{{
                getCurrentDecorations()?.button?.emoji || '💫'
              }}</span>
            </div>
            <div class="decoration-type">
              <span class="decoration-label">卡片:</span>
              <span class="decoration-emoji">{{
                getCurrentDecorations()?.card?.emoji || '⭐'
              }}</span>
            </div>
            <div class="decoration-type">
              <span class="decoration-label">导航:</span>
              <span class="decoration-emoji">{{
                getCurrentDecorations()?.nav?.emoji || '🌟'
              }}</span>
            </div>
          </div>
        </div>

        <div class="animation-info">
          <h5>🎪 动画效果</h5>
          <div class="animation-tags">
            <span
              v-for="animation in themeMetadata?.animations?.slice(0, 6)"
              :key="animation"
              class="animation-tag"
            >
              {{ animation }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FestivalThemeMetadata } from '../lib/festival-themes'
import { uiDecorationManager } from '../lib/ui-decoration-demo'

interface Props {
  currentTheme: string
  themeMetadata: FestivalThemeMetadata | null
}

const props = defineProps<Props>()
const isExpanded = ref(true)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const getCurrentDecorations = () => {
  return uiDecorationManager.getCurrentThemeDecorations()
}
</script>

<style scoped>
.theme-status-display {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--festival-primary, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--festival-primary, #1a202c);
}

.toggle-btn {
  padding: 6px 12px;
  border: 1px solid var(--festival-primary, #e2e8f0);
  border-radius: 6px;
  background: transparent;
  color: var(--festival-primary, #1a202c);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--festival-primary, #3182ce);
  color: white;
}

.status-content {
  overflow: hidden;
  transition: all 0.3s ease;
}

.theme-info {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.label {
  font-weight: 500;
  color: var(--festival-text, #4a5568);
  font-size: 14px;
}

.value {
  font-weight: 600;
  color: var(--festival-primary, #1a202c);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.expanded-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.3s ease-out;
}

.expanded-info h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--festival-primary, #1a202c);
}

.color-palette {
  margin-bottom: 20px;
}

.color-grid {
  display: flex;
  gap: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-item span {
  font-size: 12px;
  color: var(--festival-text, #4a5568);
  font-weight: 500;
}

.decoration-preview {
  margin-bottom: 20px;
}

.decoration-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.decoration-type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.decoration-type:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.decoration-label {
  font-size: 12px;
  color: var(--festival-text, #4a5568);
  font-weight: 500;
}

.decoration-emoji {
  font-size: 16px;
}

.animation-info {
  margin-bottom: 0;
}

.animation-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.animation-tag {
  font-size: 11px;
  padding: 4px 8px;
  background: var(--festival-primary, #3182ce);
  color: white;
  border-radius: 12px;
  font-weight: 500;
  opacity: 0.8;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .theme-status-display {
    padding: 16px;
  }

  .color-grid {
    gap: 12px;
  }

  .color-swatch {
    width: 24px;
    height: 24px;
  }

  .widget-emoji {
    font-size: 16px;
  }
}
</style>

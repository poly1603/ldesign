<template>
  <div class="theme-settings">
    <button class="theme-toggle-btn" @click="togglePanel" :title="showPanel ? '关闭主题设置' : '打开主题设置'">
      <Palette :size="20" />
    </button>
    
    <transition name="slide-fade">
      <div v-if="showPanel" class="theme-panel">
        <div class="panel-header">
          <h3>主题设置</h3>
          <button class="close-btn" @click="togglePanel">
            <X :size="18" />
          </button>
        </div>
        
        <div class="panel-body">
          <!-- 主题模式切换 -->
          <div class="setting-section">
            <div class="section-title">
              <span>主题模式</span>
            </div>
            <div class="theme-mode-switch">
              <button 
                class="mode-btn" 
                :class="{ active: themeType === 'light' }"
                @click="setThemeType('light')"
              >
                <Sun :size="18" />
                <span>亮色</span>
              </button>
              <button 
                class="mode-btn" 
                :class="{ active: themeType === 'dark' }"
                @click="setThemeType('dark')"
              >
                <Moon :size="18" />
                <span>暗色</span>
              </button>
            </div>
          </div>
          
          <!-- 主题色选择 -->
          <div class="setting-section">
            <div class="section-title">
              <span>主题色</span>
            </div>
            <div class="color-palette">
              <button
                v-for="color in themeColors"
                :key="color.name"
                class="color-item"
                :class="{ active: themeColor === color.value }"
                :style="{ backgroundColor: color.value }"
                :title="color.label"
                @click="setThemeColor(color.value, color.name)"
              >
                <Check v-if="themeColor === color.value" :size="16" color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 遮罩层 -->
    <transition name="fade">
      <div v-if="showPanel" class="theme-overlay" @click="togglePanel"></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Palette, Sun, Moon, X, Check } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'

// 使用主题 Hook
const { themeType, themeColor, themeColors, setThemeType, setThemeColor } = useTheme()

// 面板显示状态
const showPanel = ref(false)

/**
 * 切换面板显示
 */
const togglePanel = () => {
  showPanel.value = !showPanel.value
}
</script>

<style lang="less" scoped>
.theme-settings {
  position: relative;
}

.theme-toggle-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--ls-border-radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ldesign-text-color-secondary);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover);
    color: var(--ldesign-text-color-primary);
  }
}

.theme-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: var(--ldesign-bg-color-container);
  border-left: 1px solid var(--ldesign-border-color);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ls-spacing-base);
  border-bottom: 1px solid var(--ldesign-border-color);

  h3 {
    margin: 0;
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-primary);
    font-weight: 600;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--ls-border-radius-base);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ldesign-text-color-secondary);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-text-color-primary);
    }
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--ls-spacing-base);
}

.setting-section {
  margin-bottom: var(--ls-spacing-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  margin-bottom: var(--ls-spacing-sm);
  font-size: var(--ls-font-size-sm);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
}

.theme-mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ls-spacing-sm);
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-spacing-base);
  border: 2px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--ldesign-border-color-hover);
    background: var(--ldesign-bg-color-component-hover);
  }

  &.active {
    border-color: var(--ldesign-brand-color);
    background: var(--ldesign-brand-color-1);
    color: var(--ldesign-brand-color);
  }

  span {
    font-size: var(--ls-font-size-sm);
    font-weight: 500;
  }
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--ls-spacing-sm);
}

.color-item {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.active {
    border-color: var(--ldesign-text-color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

// 动画
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .theme-panel {
    width: 100%;
  }
}
</style>


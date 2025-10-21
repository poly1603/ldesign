<template>
  <div class="settings-dialog-overlay" @click="handleClose">
    <div class="settings-dialog" @click.stop>
      <div class="dialog-header">
        <h3>{{ t('editor.toolbar.settings') }}</h3>
        <button class="close-btn" @click="handleClose">
          <Icon name="X" :size="20" />
        </button>
      </div>
      
      <div class="dialog-body">
        <!-- 主题模式 -->
        <div class="setting-section">
          <div class="section-title">
            <Icon name="Moon" :size="18" />
            <span>{{ t('editor.theme.mode') }}</span>
          </div>
          <div class="section-content">
            <div class="theme-mode-selector">
              <button
                class="mode-btn"
                :class="{ active: themeConfig.mode === 'light' }"
                @click="handleSetThemeMode('light')"
              >
                <Icon name="Sun" :size="20" />
                <span>{{ t('editor.theme.light') }}</span>
              </button>
              <button
                class="mode-btn"
                :class="{ active: themeConfig.mode === 'dark' }"
                @click="handleSetThemeMode('dark')"
              >
                <Icon name="Moon" :size="20" />
                <span>{{ t('editor.theme.dark') }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 主题颜色 -->
        <div class="setting-section">
          <div class="section-title">
            <Icon name="Palette" :size="18" />
            <span>{{ t('editor.theme.color') }}</span>
          </div>
          <div class="section-content">
            <div class="theme-color-grid">
              <button
                v-for="preset in themeColorPresets"
                :key="preset.value"
                class="color-btn"
                :class="{ active: themeConfig.color === preset.value }"
                :style="{ '--preset-color': preset.primaryColor }"
                @click="handleSetThemeColor(preset.value)"
                :title="preset.name"
              >
                <div class="color-preview" :style="{ background: preset.primaryColor }"></div>
                <span class="color-name">{{ t(`editor.theme.${preset.value}`) }}</span>
                <Icon v-if="themeConfig.color === preset.value" name="Check" :size="16" class="check-icon" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- 语言设置 -->
        <div class="setting-section">
          <div class="section-title">
            <Icon name="Languages" :size="18" />
            <span>{{ t('editor.toolbar.language') }}</span>
          </div>
          <div class="section-content">
            <select v-model="currentLocale" @change="handleLocaleChange" class="locale-select">
              <option
                v-for="option in localeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- 编辑器设置 -->
        <div class="setting-section">
          <div class="section-title">
            <Icon name="Settings" :size="18" />
            <span>{{ t('editor.toolbar.settings') }}</span>
          </div>
          <div class="section-content">
            <div class="setting-item">
              <label class="setting-label">
                <input
                  type="checkbox"
                  :checked="showGrid"
                  @change="$emit('toggle-grid')"
                />
                <span>{{ t('editor.toolbar.grid') }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="secondary-button" @click="handleClose">{{ t('common.cancel') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from '../composables/useTheme';
import { useI18n, type Locale } from '../composables/useI18n';
import type { ThemeMode, ThemeColor } from '../types/theme';
import Icon from './Icon.vue';

/**
 * SettingsPanel 组件属性
 */
interface SettingsPanelProps {
  /** 是否显示网格 */
  showGrid?: boolean;
}

/**
 * SettingsPanel 组件事件
 */
interface SettingsPanelEmits {
  (e: 'close'): void;
  (e: 'toggle-grid'): void;
}

defineProps<SettingsPanelProps>();
const emit = defineEmits<SettingsPanelEmits>();

// 主题管理
const { themeConfig, themeColorPresets, setThemeColor, setThemeMode } = useTheme();

// 国际化管理
const { locale, localeOptions, setLocale, t } = useI18n();
const currentLocale = ref<Locale>(locale.value);

/**
 * 设置主题模式
 */
function handleSetThemeMode(mode: ThemeMode) {
  setThemeMode(mode);
}

/**
 * 设置主题颜色
 */
function handleSetThemeColor(color: ThemeColor) {
  setThemeColor(color);
}

/**
 * 切换语言
 */
function handleLocaleChange() {
  setLocale(currentLocale.value);
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('close');
}
</script>

<style scoped lang="less">
.settings-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.settings-dialog {
  background: var(--bg-secondary);
  border-radius: 8px;
  width: 560px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-large);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    transition: all 0.2s;

    &:hover {
      background: var(--bg-hover);
      color: var(--text-color);
    }
  }
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.setting-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color);
  }

  .section-content {
    padding-left: 26px;
  }
}

.theme-mode-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-color);
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-color);

    &:hover {
      border-color: var(--primary-color);
    }

    &.active {
      border-color: var(--primary-color);
      background: var(--bg-secondary);
    }

    span {
      font-size: 13px;
    }
  }
}

.theme-color-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  .color-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-color);
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-color);

    &:hover {
      border-color: var(--preset-color);
    }

    &.active {
      border-color: var(--preset-color);
      background: var(--bg-secondary);
    }

    .color-preview {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .color-name {
      flex: 1;
      font-size: 13px;
      text-align: left;
    }

    .check-icon {
      color: var(--preset-color);
      flex-shrink: 0;
    }
  }
}

.locale-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.setting-item {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  .setting-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--text-color);
    font-size: 14px;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.secondary-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }
}

// 滚动条样式
.dialog-body::-webkit-scrollbar {
  width: 6px;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}
</style>



/**
 * 主题管理 Composable
 */

import { ref, onMounted } from 'vue';
import type { ThemeColor, ThemeMode, ThemeConfig } from '../types/theme';
import {
  THEME_COLOR_PRESETS,
  applyThemeColor,
  applyThemeMode,
  applyThemeVariables,
  LIGHT_THEME_VARIABLES
} from '../theme/theme-config';

const STORAGE_KEY = 'lowcode-theme-config';

/**
 * 默认主题配置
 */
const DEFAULT_THEME: ThemeConfig = {
  color: 'blue',
  mode: 'light'
};

/**
 * 从 localStorage 加载主题配置
 */
function loadThemeConfig(): ThemeConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load theme config:', error);
  }
  return { ...DEFAULT_THEME };
}

/**
 * 保存主题配置到 localStorage
 */
function saveThemeConfig(config: ThemeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save theme config:', error);
  }
}

// 全局主题状态
const themeConfig = ref<ThemeConfig>(loadThemeConfig());

/**
 * 使用主题管理
 */
export function useTheme() {
  /**
   * 设置主题颜色
   */
  function setThemeColor(color: ThemeColor) {
    themeConfig.value.color = color;
    applyThemeColor(color);
    saveThemeConfig(themeConfig.value);
  }

  /**
   * 设置主题模式
   */
  function setThemeMode(mode: ThemeMode) {
    themeConfig.value.mode = mode;
    applyThemeMode(mode);
    saveThemeConfig(themeConfig.value);
  }

  /**
   * 切换主题模式
   */
  function toggleThemeMode() {
    const newMode = themeConfig.value.mode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    // 应用初始主题变量
    applyThemeVariables(LIGHT_THEME_VARIABLES);
    // 应用保存的主题
    applyThemeColor(themeConfig.value.color);
    applyThemeMode(themeConfig.value.mode);
  }

  /**
   * 重置主题
   */
  function resetTheme() {
    themeConfig.value = { ...DEFAULT_THEME };
    applyThemeColor(DEFAULT_THEME.color);
    applyThemeMode(DEFAULT_THEME.mode);
    saveThemeConfig(DEFAULT_THEME);
  }

  // 自动初始化主题
  onMounted(() => {
    initTheme();
  });

  return {
    // 状态
    themeConfig,
    themeColorPresets: THEME_COLOR_PRESETS,

    // 方法
    setThemeColor,
    setThemeMode,
    toggleThemeMode,
    initTheme,
    resetTheme
  };
}



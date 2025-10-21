/**
 * 主题配置系统
 */

import type { ThemeColor, ThemeColorPreset, ThemeVariables } from '../types/theme';

/**
 * 主题颜色预设
 */
export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  {
    name: '拂晓蓝',
    value: 'blue',
    primaryColor: '#1890ff',
    hoverColor: '#40a9ff',
    activeColor: '#096dd9'
  },
  {
    name: '酱紫',
    value: 'purple',
    primaryColor: '#722ed1',
    hoverColor: '#9254de',
    activeColor: '#531dab'
  },
  {
    name: '极光绿',
    value: 'green',
    primaryColor: '#52c41a',
    hoverColor: '#73d13d',
    activeColor: '#389e0d'
  },
  {
    name: '日暮橙',
    value: 'orange',
    primaryColor: '#fa8c16',
    hoverColor: '#ffa940',
    activeColor: '#d46b08'
  },
  {
    name: '薄暮红',
    value: 'red',
    primaryColor: '#f5222d',
    hoverColor: '#ff4d4f',
    activeColor: '#cf1322'
  },
  {
    name: '明青',
    value: 'cyan',
    primaryColor: '#13c2c2',
    hoverColor: '#36cfc9',
    activeColor: '#08979c'
  }
];

/**
 * 亮色主题变量
 */
export const LIGHT_THEME_VARIABLES: ThemeVariables = {
  // 主色（动态设置）
  '--primary-color': '#1890ff',
  '--primary-hover': '#40a9ff',
  '--primary-active': '#096dd9',

  // 文本颜色
  '--text-color': '#333333',
  '--text-secondary': '#666666',
  '--text-disabled': '#999999',
  '--text-inverse': '#ffffff',

  // 背景颜色
  '--bg-color': '#f5f5f5',
  '--bg-secondary': '#fafafa',
  '--bg-hover': '#f0f0f0',
  '--bg-active': '#e8e8e8',

  // 边框颜色
  '--border-color': '#d9d9d9',
  '--border-hover': '#40a9ff',

  // 画布颜色
  '--canvas-bg': '#e8e8e8',
  '--grid-color': 'rgba(0, 0, 0, 0.05)',

  // 阴影
  '--shadow-small': '0 2px 4px rgba(0, 0, 0, 0.08)',
  '--shadow-medium': '0 4px 8px rgba(0, 0, 0, 0.12)',
  '--shadow-large': '0 8px 16px rgba(0, 0, 0, 0.16)'
};

/**
 * 暗色主题变量
 */
export const DARK_THEME_VARIABLES: ThemeVariables = {
  // 主色（动态设置）
  '--primary-color': '#1890ff',
  '--primary-hover': '#40a9ff',
  '--primary-active': '#096dd9',

  // 文本颜色
  '--text-color': '#e8e8e8',
  '--text-secondary': '#a8a8a8',
  '--text-disabled': '#666666',
  '--text-inverse': '#141414',

  // 背景颜色
  '--bg-color': '#1f1f1f',
  '--bg-secondary': '#2a2a2a',
  '--bg-hover': '#2f2f2f',
  '--bg-active': '#3a3a3a',

  // 边框颜色
  '--border-color': '#434343',
  '--border-hover': '#40a9ff',

  // 画布颜色
  '--canvas-bg': '#141414',
  '--grid-color': 'rgba(255, 255, 255, 0.08)',

  // 阴影
  '--shadow-small': '0 2px 4px rgba(0, 0, 0, 0.3)',
  '--shadow-medium': '0 4px 8px rgba(0, 0, 0, 0.4)',
  '--shadow-large': '0 8px 16px rgba(0, 0, 0, 0.5)'
};

/**
 * 根据主题颜色获取颜色预设
 */
export function getColorPreset(color: ThemeColor): ThemeColorPreset {
  return THEME_COLOR_PRESETS.find(preset => preset.value === color) || THEME_COLOR_PRESETS[0];
}

/**
 * 应用主题变量到 DOM
 */
export function applyThemeVariables(variables: ThemeVariables): void {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * 应用主题颜色
 */
export function applyThemeColor(color: ThemeColor): void {
  const preset = getColorPreset(color);
  const root = document.documentElement;
  root.style.setProperty('--primary-color', preset.primaryColor);
  root.style.setProperty('--primary-hover', preset.hoverColor);
  root.style.setProperty('--primary-active', preset.activeColor);
}

/**
 * 应用主题模式
 */
export function applyThemeMode(mode: 'light' | 'dark'): void {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark-theme');
    applyThemeVariables(DARK_THEME_VARIABLES);
  } else {
    root.classList.remove('dark-theme');
    applyThemeVariables(LIGHT_THEME_VARIABLES);
  }
}



/**
 * 主题相关类型定义
 */

/**
 * 主题颜色方案
 */
export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'cyan';

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark';

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题颜色 */
  color: ThemeColor;
  /** 主题模式 */
  mode: ThemeMode;
}

/**
 * 主题颜色预设
 */
export interface ThemeColorPreset {
  /** 颜色名称 */
  name: string;
  /** 颜色标识 */
  value: ThemeColor;
  /** 主色值 */
  primaryColor: string;
  /** 悬停色值 */
  hoverColor: string;
  /** 激活色值 */
  activeColor: string;
}

/**
 * 主题变量映射
 */
export interface ThemeVariables {
  // 主色
  '--primary-color': string;
  '--primary-hover': string;
  '--primary-active': string;

  // 文本颜色
  '--text-color': string;
  '--text-secondary': string;
  '--text-disabled': string;
  '--text-inverse': string;

  // 背景颜色
  '--bg-color': string;
  '--bg-secondary': string;
  '--bg-hover': string;
  '--bg-active': string;

  // 边框颜色
  '--border-color': string;
  '--border-hover': string;

  // 画布颜色
  '--canvas-bg': string;
  '--grid-color': string;

  // 阴影
  '--shadow-small': string;
  '--shadow-medium': string;
  '--shadow-large': string;
}



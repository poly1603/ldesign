/**
 * Theme utility functions for LDesign components
 */

export interface ThemeConfig {
  primaryColor?: string;
  dangerColor?: string;
  successColor?: string;
  warningColor?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
}

export type ThemeMode = 'light' | 'dark';

/**
 * Apply theme configuration to CSS variables
 */
export function applyTheme(config: ThemeConfig, element: HTMLElement = document.documentElement): void {
  const cssVarMap: Record<keyof ThemeConfig, string> = {
    primaryColor: '--ld-primary-color',
    dangerColor: '--ld-danger-color',
    successColor: '--ld-success-color',
    warningColor: '--ld-warning-color',
    textColor: '--ld-text-color',
    backgroundColor: '--ld-background-color',
    borderColor: '--ld-border-color',
    borderRadius: '--ld-border-radius-base',
    fontSize: '--ld-font-size-base',
    fontFamily: '--ld-font-family',
  };

  Object.entries(config).forEach(([key, value]) => {
    if (value && cssVarMap[key as keyof ThemeConfig]) {
      element.style.setProperty(cssVarMap[key as keyof ThemeConfig], value);
    }
  });
}

/**
 * Get current theme configuration from CSS variables
 */
export function getCurrentTheme(element: HTMLElement = document.documentElement): ThemeConfig {
  const computedStyle = getComputedStyle(element);
  
  return {
    primaryColor: computedStyle.getPropertyValue('--ld-primary-color').trim(),
    dangerColor: computedStyle.getPropertyValue('--ld-danger-color').trim(),
    successColor: computedStyle.getPropertyValue('--ld-success-color').trim(),
    warningColor: computedStyle.getPropertyValue('--ld-warning-color').trim(),
    textColor: computedStyle.getPropertyValue('--ld-text-color').trim(),
    backgroundColor: computedStyle.getPropertyValue('--ld-background-color').trim(),
    borderColor: computedStyle.getPropertyValue('--ld-border-color').trim(),
    borderRadius: computedStyle.getPropertyValue('--ld-border-radius-base').trim(),
    fontSize: computedStyle.getPropertyValue('--ld-font-size-base').trim(),
    fontFamily: computedStyle.getPropertyValue('--ld-font-family').trim(),
  };
}

/**
 * Switch between light and dark theme modes
 */
export function setThemeMode(mode: ThemeMode, element: HTMLElement = document.documentElement): void {
  element.setAttribute('data-theme', mode);
}

/**
 * Get current theme mode
 */
export function getThemeMode(element: HTMLElement = document.documentElement): ThemeMode {
  const theme = element.getAttribute('data-theme');
  return (theme as ThemeMode) || 'light';
}

/**
 * Toggle between light and dark theme modes
 */
export function toggleThemeMode(element: HTMLElement = document.documentElement): ThemeMode {
  const currentMode = getThemeMode(element);
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  setThemeMode(newMode, element);
  return newMode;
}

/**
 * Predefined theme configurations
 */
export const themes = {
  default: {
    primaryColor: '#1890ff',
    dangerColor: '#ff4d4f',
    successColor: '#52c41a',
    warningColor: '#faad14',
    textColor: 'rgba(0, 0, 0, 0.85)',
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: '4px',
    fontSize: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
  blue: {
    primaryColor: '#1890ff',
    dangerColor: '#ff4d4f',
    successColor: '#52c41a',
    warningColor: '#faad14',
  },
  green: {
    primaryColor: '#52c41a',
    dangerColor: '#ff4d4f',
    successColor: '#52c41a',
    warningColor: '#faad14',
  },
  red: {
    primaryColor: '#ff4d4f',
    dangerColor: '#ff4d4f',
    successColor: '#52c41a',
    warningColor: '#faad14',
  },
  purple: {
    primaryColor: '#722ed1',
    dangerColor: '#ff4d4f',
    successColor: '#52c41a',
    warningColor: '#faad14',
  },
  orange: {
    primaryColor: '#fa8c16',
    dangerColor: '#ff4d4f',
    successColor: '#52c41a',
    warningColor: '#faad14',
  },
} as const;

/**
 * Apply a predefined theme
 */
export function applyPredefinedTheme(
  themeName: keyof typeof themes,
  element: HTMLElement = document.documentElement
): void {
  applyTheme(themes[themeName], element);
}

/**
 * Reset theme to default values
 */
export function resetTheme(element: HTMLElement = document.documentElement): void {
  applyTheme(themes.default, element);
  setThemeMode('light', element);
}
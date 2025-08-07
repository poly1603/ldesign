// 预设主题

import type { ThemeConfig } from '../types/theme'

/**
 * 默认浅色主题
 */
export const lightTheme: ThemeConfig = {
  name: 'light',
  type: 'light',
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff',
    text: {
      primary: '#262626',
      secondary: '#595959',
      disabled: '#bfbfbf',
      placeholder: '#bfbfbf',
      link: '#1890ff',
    },
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      hover: '#f5f5f5',
      active: '#e6f7ff',
      disabled: '#f5f5f5',
    },
    border: {
      default: '#d9d9d9',
      hover: '#40a9ff',
      active: '#1890ff',
      error: '#f5222d',
      success: '#52c41a',
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 600,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    base: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  border: {
    width: '1px',
    style: 'solid',
    radius: {
      none: '0',
      sm: '2px',
      base: '4px',
      lg: '8px',
      full: '50%',
    },
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    enabled: true,
  },
}

/**
 * 暗色主题
 */
export const darkTheme: ThemeConfig = {
  ...lightTheme,
  name: 'dark',
  type: 'dark',
  colors: {
    ...lightTheme.colors,
    text: {
      primary: '#ffffff',
      secondary: '#a6a6a6',
      disabled: '#595959',
      placeholder: '#595959',
      link: '#40a9ff',
    },
    background: {
      primary: '#141414',
      secondary: '#1f1f1f',
      hover: '#262626',
      active: '#111b26',
      disabled: '#262626',
    },
    border: {
      default: '#434343',
      hover: '#40a9ff',
      active: '#1890ff',
      error: '#f5222d',
      success: '#52c41a',
    },
  },
}

/**
 * 蓝色主题
 */
export const blueTheme: ThemeConfig = {
  ...lightTheme,
  name: 'blue',
  colors: {
    ...lightTheme.colors,
    primary: '#2f54eb',
    info: '#2f54eb',
    text: {
      ...lightTheme.colors!.text!,
      link: '#2f54eb',
    },
    border: {
      ...lightTheme.colors!.border!,
      hover: '#597ef7',
      active: '#2f54eb',
    },
    background: {
      ...lightTheme.colors!.background!,
      active: '#f0f5ff',
    },
  },
}

/**
 * 绿色主题
 */
export const greenTheme: ThemeConfig = {
  ...lightTheme,
  name: 'green',
  colors: {
    ...lightTheme.colors,
    primary: '#52c41a',
    info: '#52c41a',
    text: {
      ...lightTheme.colors!.text!,
      link: '#52c41a',
    },
    border: {
      ...lightTheme.colors!.border!,
      hover: '#73d13d',
      active: '#52c41a',
    },
    background: {
      ...lightTheme.colors!.background!,
      active: '#f6ffed',
    },
  },
}

/**
 * 紫色主题
 */
export const purpleTheme: ThemeConfig = {
  ...lightTheme,
  name: 'purple',
  colors: {
    ...lightTheme.colors,
    primary: '#722ed1',
    info: '#722ed1',
    text: {
      ...lightTheme.colors!.text!,
      link: '#722ed1',
    },
    border: {
      ...lightTheme.colors!.border!,
      hover: '#9254de',
      active: '#722ed1',
    },
    background: {
      ...lightTheme.colors!.background!,
      active: '#f9f0ff',
    },
  },
}

/**
 * 紧凑主题
 */
export const compactTheme: ThemeConfig = {
  ...lightTheme,
  name: 'compact',
  spacing: {
    xs: '2px',
    sm: '4px',
    base: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
  },
  typography: {
    ...lightTheme.typography!,
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '20px',
    },
  },
}

/**
 * 宽松主题
 */
export const comfortableTheme: ThemeConfig = {
  ...lightTheme,
  name: 'comfortable',
  spacing: {
    xs: '6px',
    sm: '12px',
    base: '20px',
    lg: '28px',
    xl: '36px',
    xxl: '52px',
  },
  typography: {
    ...lightTheme.typography!,
    fontSize: {
      xs: '13px',
      sm: '15px',
      base: '17px',
      lg: '19px',
      xl: '22px',
      xxl: '26px',
    },
  },
}

/**
 * 圆角主题
 */
export const roundedTheme: ThemeConfig = {
  ...lightTheme,
  name: 'rounded',
  border: {
    ...lightTheme.border!,
    radius: {
      none: '0',
      sm: '6px',
      base: '12px',
      lg: '18px',
      full: '50%',
    },
  },
}

/**
 * 扁平主题
 */
export const flatTheme: ThemeConfig = {
  ...lightTheme,
  name: 'flat',
  shadow: {
    none: 'none',
    sm: 'none',
    base: 'none',
    lg: 'none',
    xl: 'none',
  },
  border: {
    ...lightTheme.border!,
    radius: {
      none: '0',
      sm: '0',
      base: '0',
      lg: '0',
      full: '50%',
    },
  },
}

/**
 * 所有预设主题
 */
export const presetThemes = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
  compact: compactTheme,
  comfortable: comfortableTheme,
  rounded: roundedTheme,
  flat: flatTheme,
}

/**
 * 获取预设主题
 */
export function getPresetTheme(name: keyof typeof presetThemes): ThemeConfig {
  return presetThemes[name]
}

/**
 * 获取所有预设主题名称
 */
export function getPresetThemeNames(): string[] {
  return Object.keys(presetThemes)
}

/**
 * 检查是否为预设主题
 */
export function isPresetTheme(name: string): name is keyof typeof presetThemes {
  return name in presetThemes
}

/**
 * 暗色主题
 * 
 * 基于LDESIGN设计系统的暗色主题配置
 */

import type { CalendarTheme } from '../types/theme'

/**
 * 暗色主题配置
 */
export const DarkTheme: CalendarTheme = {
  name: 'dark',
  displayName: '暗色主题',
  description: '基于LDESIGN设计系统的暗色主题',
  version: '1.0.0',
  author: 'ldesign',
  dark: true,

  colors: {
    primary: 'var(--ldesign-brand-color-4)',
    secondary: 'var(--ldesign-gray-color-4)',
    success: 'var(--ldesign-success-color-4)',
    warning: 'var(--ldesign-warning-color-4)',
    error: 'var(--ldesign-error-color-4)',
    info: 'var(--ldesign-brand-color-3)',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: 'var(--ldesign-font-white-1)',
    textSecondary: 'var(--ldesign-font-white-3)',
    border: '#404040',
    divider: '#333333',
    disabled: 'var(--ldesign-font-white-4)',
    hover: '#3a3a3a',
    active: '#4a4a4a',
    selected: 'var(--ldesign-brand-color-4)',
    focus: 'var(--ldesign-brand-color-3)',
  },

  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: 'var(--ls-font-size-sm, 16px)',
    sizeSmall: 'var(--ls-font-size-xs, 14px)',
    sizeLarge: 'var(--ls-font-size-base, 18px)',
    sizeTitle: 'var(--ls-font-size-lg, 20px)',
    weight: '400',
    weightBold: '600',
    lineHeight: '1.5',
    letterSpacing: '0',
  },

  spacing: {
    xs: 'var(--ls-spacing-xs, 6px)',
    sm: 'var(--ls-spacing-sm, 12px)',
    md: 'var(--ls-spacing-base, 20px)',
    lg: 'var(--ls-spacing-lg, 28px)',
    xl: 'var(--ls-spacing-xl, 36px)',
    xxl: 'var(--ls-spacing-xxl, 56px)',
  },

  borderRadius: {
    none: 'var(--ls-border-radius-none, 0)',
    sm: 'var(--ls-border-radius-sm, 3px)',
    md: 'var(--ls-border-radius-base, 6px)',
    lg: 'var(--ls-border-radius-lg, 12px)',
    full: 'var(--ls-border-radius-full, 50%)',
  },

  shadows: {
    none: 'none',
    sm: '0 3px 6px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 6px 16px rgba(0, 0, 0, 0.5)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.6)',
  },

  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  calendar: {
    grid: {
      lineColor: '#404040',
      lineWidth: '1px',
      backgroundColor: '#2d2d2d',
    },
    dateCell: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: '#3a3a3a',
      selectedBackgroundColor: 'rgba(114, 46, 209, 0.3)',
      todayBackgroundColor: 'rgba(114, 46, 209, 0.1)',
      otherMonthColor: '#666666',
      weekendColor: '#ff6b6b',
      holidayColor: '#ff4757',
    },
    event: {
      backgroundColor: 'var(--ldesign-brand-color-4)',
      textColor: '#ffffff',
      borderColor: 'var(--ldesign-brand-color-4)',
      borderWidth: '1px',
      borderRadius: 'var(--ls-border-radius-sm)',
      padding: 'var(--ls-spacing-xs) var(--ls-spacing-sm)',
      margin: '1px',
      fontSize: 'var(--ls-font-size-xs)',
      minHeight: '24px',
    },
    timeAxis: {
      backgroundColor: '#2d2d2d',
      textColor: '#cccccc',
      borderColor: '#404040',
      width: '60px',
      fontSize: 'var(--ls-font-size-xs)',
    },
    header: {
      backgroundColor: '#2d2d2d',
      textColor: '#ffffff',
      borderColor: '#404040',
      height: '48px',
      fontSize: 'var(--ls-font-size-sm)',
      fontWeight: '600',
    },
    lunar: {
      textColor: '#888888',
      fontSize: 'var(--ls-font-size-xs)',
      festivalColor: '#ff4757',
    },
    holiday: {
      textColor: '#ff4757',
      backgroundColor: 'rgba(255, 71, 87, 0.1)',
      markColor: '#ff4757',
    },
  },

  customVariables: {
    '--ldesign-calendar-transition': 'all 300ms ease',
    '--ldesign-calendar-z-index-dropdown': '1000',
    '--ldesign-calendar-z-index-modal': '1050',
    '--ldesign-calendar-z-index-tooltip': '1070',
  },

  customCSS: `
    .ldesign-calendar.dark-theme {
      background-color: #1a1a1a;
      color: #ffffff;
      border: 1px solid #404040;
    }

    .ldesign-calendar.dark-theme .ldesign-calendar-date-cell {
      border-color: #404040;
    }

    .ldesign-calendar.dark-theme .ldesign-calendar-date-cell:hover {
      background-color: #3a3a3a;
    }

    .ldesign-calendar.dark-theme .ldesign-calendar-event {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .ldesign-calendar.dark-theme .ldesign-calendar-event:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    }

    .ldesign-calendar.dark-theme .ldesign-calendar-weekday {
      background-color: #2d2d2d;
      color: #cccccc;
      border-color: #404040;
    }

    .ldesign-calendar.dark-theme .ldesign-calendar-time-axis {
      background-color: #2d2d2d;
      border-color: #404040;
    }

    .ldesign-calendar.dark-theme .ldesign-calendar-time-label {
      color: #cccccc;
    }
  `,
}

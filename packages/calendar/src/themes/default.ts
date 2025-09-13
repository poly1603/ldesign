/**
 * 默认主题
 * 
 * 基于LDESIGN设计系统的默认主题配置
 */

import type { CalendarTheme } from '../types/theme'

/**
 * 默认主题配置
 */
export const DefaultTheme: CalendarTheme = {
  name: 'default',
  displayName: '默认主题',
  description: '基于LDESIGN设计系统的默认主题',
  version: '1.0.0',
  author: 'ldesign',
  dark: false,

  colors: {
    // 基于LDESIGN设计系统的颜色配置
    primary: 'var(--ldesign-brand-color)',
    secondary: 'var(--ldesign-gray-color-6)',
    success: 'var(--ldesign-success-color)',
    warning: 'var(--ldesign-warning-color)',
    error: 'var(--ldesign-error-color)',
    info: 'var(--ldesign-brand-color-4)',
    background: 'var(--ldesign-bg-color-page, #ffffff)',
    surface: 'var(--ldesign-bg-color-container, #ffffff)',
    text: 'var(--ldesign-text-color-primary)',
    textSecondary: 'var(--ldesign-text-color-secondary)',
    border: 'var(--ldesign-border-color)',
    divider: 'var(--ldesign-border-level-1-color)',
    disabled: 'var(--ldesign-text-color-disabled)',
    hover: 'var(--ldesign-bg-color-container-hover)',
    active: 'var(--ldesign-bg-color-container-active)',
    selected: 'var(--ldesign-brand-color)',
    focus: 'var(--ldesign-brand-color-focus)',
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
    none: 'var(--ls-shadow-none, none)',
    sm: 'var(--ls-shadow-sm, 0 3px 6px rgba(0, 0, 0, 0.05))',
    md: 'var(--ls-shadow-base, 0 4px 12px rgba(0, 0, 0, 0.1))',
    lg: 'var(--ls-shadow-lg, 0 6px 16px rgba(0, 0, 0, 0.15))',
    xl: 'var(--ls-shadow-xl, 0 12px 32px rgba(0, 0, 0, 0.2))',
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
      lineColor: 'var(--ldesign-border-level-1-color)',
      lineWidth: '1px',
      backgroundColor: 'var(--ldesign-bg-color-container)',
    },
    dateCell: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: 'var(--ldesign-bg-color-container-hover)',
      selectedBackgroundColor: 'var(--ldesign-brand-color-focus)',
      todayBackgroundColor: 'var(--ldesign-brand-color-1)',
      otherMonthColor: 'var(--ldesign-text-color-placeholder)',
      weekendColor: 'var(--ldesign-error-color-4)',
      holidayColor: 'var(--ldesign-error-color)',
    },
    event: {
      backgroundColor: 'var(--ldesign-brand-color)',
      textColor: 'var(--ldesign-font-white-1)',
      borderColor: 'var(--ldesign-brand-color)',
      borderWidth: '1px',
      borderRadius: 'var(--ls-border-radius-sm)',
      padding: 'var(--ls-spacing-xs) var(--ls-spacing-sm)',
      margin: '1px',
      fontSize: 'var(--ls-font-size-xs)',
      minHeight: '24px',
    },
    timeAxis: {
      backgroundColor: 'var(--ldesign-bg-color-component)',
      textColor: 'var(--ldesign-text-color-secondary)',
      borderColor: 'var(--ldesign-border-level-1-color)',
      width: '60px',
      fontSize: 'var(--ls-font-size-xs)',
    },
    header: {
      backgroundColor: 'var(--ldesign-bg-color-container)',
      textColor: 'var(--ldesign-text-color-primary)',
      borderColor: 'var(--ldesign-border-level-1-color)',
      height: '48px',
      fontSize: 'var(--ls-font-size-sm)',
      fontWeight: '600',
    },
    lunar: {
      textColor: 'var(--ldesign-text-color-placeholder)',
      fontSize: 'var(--ls-font-size-xs)',
      festivalColor: 'var(--ldesign-error-color)',
    },
    holiday: {
      textColor: 'var(--ldesign-error-color)',
      backgroundColor: 'var(--ldesign-error-color-1)',
      markColor: 'var(--ldesign-error-color)',
    },
  },

  customVariables: {
    '--ldesign-calendar-transition': 'all var(--ls-animation-duration-normal, 300ms) ease',
    '--ldesign-calendar-z-index-dropdown': '1000',
    '--ldesign-calendar-z-index-modal': '1050',
    '--ldesign-calendar-z-index-tooltip': '1070',
  },

  customCSS: `
    .ldesign-calendar {
      font-family: var(--ldesign-calendar-font-family);
      font-size: var(--ldesign-calendar-font-size);
      color: var(--ldesign-calendar-color-text);
      background-color: var(--ldesign-calendar-color-background);
      border-radius: var(--ldesign-calendar-border-radius-md);
      box-shadow: var(--ldesign-calendar-shadow-md);
      transition: var(--ldesign-calendar-transition);
    }

    .ldesign-calendar * {
      box-sizing: border-box;
    }

    .ldesign-calendar-view {
      width: 100%;
      height: 100%;
    }

    .ldesign-calendar-month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: var(--ldesign-calendar-grid-lineColor);
    }

    .ldesign-calendar-date-cell {
      background-color: var(--ldesign-calendar-dateCell-backgroundColor);
      min-height: 100px;
      padding: var(--ldesign-calendar-spacing-xs);
      cursor: pointer;
      transition: var(--ldesign-calendar-transition);
    }

    .ldesign-calendar-date-cell:hover {
      background-color: var(--ldesign-calendar-dateCell-hoverBackgroundColor);
    }

    .ldesign-calendar-date-cell.is-selected {
      background-color: var(--ldesign-calendar-dateCell-selectedBackgroundColor);
    }

    .ldesign-calendar-date-cell.is-today {
      background-color: var(--ldesign-calendar-dateCell-todayBackgroundColor);
    }

    .ldesign-calendar-date-cell.is-other-month {
      color: var(--ldesign-calendar-dateCell-otherMonthColor);
    }

    .ldesign-calendar-date-cell.is-weekend {
      color: var(--ldesign-calendar-dateCell-weekendColor);
    }

    .ldesign-calendar-event {
      background-color: var(--ldesign-calendar-event-backgroundColor);
      color: var(--ldesign-calendar-event-textColor);
      border: var(--ldesign-calendar-event-borderWidth) solid var(--ldesign-calendar-event-borderColor);
      border-radius: var(--ldesign-calendar-event-borderRadius);
      padding: var(--ldesign-calendar-event-padding);
      margin: var(--ldesign-calendar-event-margin);
      font-size: var(--ldesign-calendar-event-fontSize);
      min-height: var(--ldesign-calendar-event-minHeight);
      cursor: pointer;
      transition: var(--ldesign-calendar-transition);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ldesign-calendar-event:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }
  `,
}

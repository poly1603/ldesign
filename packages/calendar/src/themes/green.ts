/**
 * 绿色主题
 * 
 * 基于绿色色调的自然主题配置
 */

import type { CalendarTheme } from '../types/theme'

/**
 * 绿色主题配置
 */
export const GreenTheme: CalendarTheme = {
  name: 'green',
  displayName: '绿色主题',
  description: '基于绿色色调的自然清新主题',
  version: '1.0.0',
  author: 'ldesign',
  dark: false,

  colors: {
    primary: '#52c41a',
    secondary: '#6c757d',
    success: '#389e0d',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2',
    background: '#ffffff',
    surface: '#f6ffed',
    text: '#333333',
    textSecondary: '#6c757d',
    border: '#d9f7be',
    divider: '#eaffe6',
    disabled: '#bfbfbf',
    hover: '#f6ffed',
    active: '#d9f7be',
    selected: '#52c41a',
    focus: '#73d13d',
  },

  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: '14px',
    sizeSmall: '12px',
    sizeLarge: '16px',
    sizeTitle: '18px',
    weight: '400',
    weightBold: '600',
    lineHeight: '1.5',
    letterSpacing: '0',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    none: '0',
    sm: '2px',
    md: '6px',
    lg: '8px',
    full: '50%',
  },

  shadows: {
    none: 'none',
    sm: '0 2px 4px rgba(82, 196, 26, 0.1)',
    md: '0 4px 8px rgba(82, 196, 26, 0.15)',
    lg: '0 6px 16px rgba(82, 196, 26, 0.2)',
    xl: '0 8px 24px rgba(82, 196, 26, 0.25)',
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
      lineColor: '#d9f7be',
      lineWidth: '1px',
      backgroundColor: '#ffffff',
    },
    dateCell: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: '#f6ffed',
      selectedBackgroundColor: '#d9f7be',
      todayBackgroundColor: '#f6ffed',
      otherMonthColor: '#bfbfbf',
      weekendColor: '#f5222d',
      holidayColor: '#fa541c',
    },
    event: {
      backgroundColor: '#52c41a',
      textColor: '#ffffff',
      borderColor: '#52c41a',
      borderWidth: '1px',
      borderRadius: '4px',
      padding: '4px 8px',
      margin: '1px',
      fontSize: '12px',
      minHeight: '20px',
    },
    timeAxis: {
      backgroundColor: '#f6ffed',
      textColor: '#8c8c8c',
      borderColor: '#d9f7be',
      width: '60px',
      fontSize: '12px',
    },
    header: {
      backgroundColor: '#ffffff',
      textColor: '#262626',
      borderColor: '#d9f7be',
      height: '48px',
      fontSize: '14px',
      fontWeight: '600',
    },
    lunar: {
      textColor: '#8c8c8c',
      fontSize: '10px',
      festivalColor: '#f5222d',
    },
    holiday: {
      textColor: '#fa541c',
      backgroundColor: '#fff2e8',
      markColor: '#fa541c',
    },
  },

  customVariables: {
    '--ldesign-calendar-transition': 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    '--ldesign-calendar-z-index-dropdown': '1000',
    '--ldesign-calendar-z-index-modal': '1050',
    '--ldesign-calendar-z-index-tooltip': '1070',
    '--ldesign-calendar-green-gradient': 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    '--ldesign-calendar-nature-pattern': 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23f6ffed" fill-opacity="0.4"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
  },

  customCSS: `
    .ldesign-calendar.green-theme {
      background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
      background-image: var(--ldesign-calendar-nature-pattern);
      border: 1px solid #d9f7be;
    }

    .ldesign-calendar.green-theme .ldesign-calendar-header {
      background: var(--ldesign-calendar-green-gradient);
      color: white;
      border-bottom: none;
    }

    .ldesign-calendar.green-theme .ldesign-calendar-nav-btn {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .ldesign-calendar.green-theme .ldesign-calendar-nav-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .ldesign-calendar.green-theme .ldesign-calendar-weekday {
      background-color: #f6ffed;
      color: #52c41a;
      font-weight: 600;
    }

    .ldesign-calendar.green-theme .ldesign-calendar-date-cell.is-today {
      background: radial-gradient(circle, #f6ffed 0%, #eaffe6 100%);
      border: 2px solid #52c41a;
      position: relative;
    }

    .ldesign-calendar.green-theme .ldesign-calendar-date-cell.is-today::after {
      content: '🌱';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 12px;
    }

    .ldesign-calendar.green-theme .ldesign-calendar-event {
      background: var(--ldesign-calendar-green-gradient);
      box-shadow: 0 2px 4px rgba(82, 196, 26, 0.2);
    }

    .ldesign-calendar.green-theme .ldesign-calendar-event:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(82, 196, 26, 0.3);
    }

    .ldesign-calendar.green-theme .ldesign-calendar-time-axis {
      background: linear-gradient(to bottom, #f6ffed 0%, #fafafa 100%);
    }

    .ldesign-calendar.green-theme .ldesign-calendar-weekend {
      background-color: rgba(82, 196, 26, 0.05);
    }
  `,
}

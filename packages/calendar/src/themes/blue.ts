/**
 * 蓝色主题
 * 
 * 基于蓝色色调的主题配置
 */

import type { CalendarTheme } from '../types/theme'

/**
 * 蓝色主题配置
 */
export const BlueTheme: CalendarTheme = {
  name: 'blue',
  displayName: '蓝色主题',
  description: '基于蓝色色调的清新主题',
  version: '1.0.0',
  author: 'ldesign',
  dark: false,

  colors: {
    primary: '#1890ff',
    secondary: '#6c757d',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#6c757d',
    border: '#d9d9d9',
    divider: '#e8e8e8',
    disabled: '#bfbfbf',
    hover: '#e6f7ff',
    active: '#bae7ff',
    selected: '#1890ff',
    focus: '#40a9ff',
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
    sm: '0 2px 4px rgba(24, 144, 255, 0.1)',
    md: '0 4px 8px rgba(24, 144, 255, 0.15)',
    lg: '0 6px 16px rgba(24, 144, 255, 0.2)',
    xl: '0 8px 24px rgba(24, 144, 255, 0.25)',
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
      lineColor: '#d9d9d9',
      lineWidth: '1px',
      backgroundColor: '#ffffff',
    },
    dateCell: {
      backgroundColor: 'transparent',
      hoverBackgroundColor: '#e6f7ff',
      selectedBackgroundColor: '#bae7ff',
      todayBackgroundColor: '#f0f9ff',
      otherMonthColor: '#bfbfbf',
      weekendColor: '#f5222d',
      holidayColor: '#fa541c',
    },
    event: {
      backgroundColor: '#1890ff',
      textColor: '#ffffff',
      borderColor: '#1890ff',
      borderWidth: '1px',
      borderRadius: '4px',
      padding: '4px 8px',
      margin: '1px',
      fontSize: '12px',
      minHeight: '20px',
    },
    timeAxis: {
      backgroundColor: '#fafafa',
      textColor: '#8c8c8c',
      borderColor: '#d9d9d9',
      width: '60px',
      fontSize: '12px',
    },
    header: {
      backgroundColor: '#ffffff',
      textColor: '#262626',
      borderColor: '#d9d9d9',
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
    '--ldesign-calendar-blue-gradient': 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
  },

  customCSS: `
    .ldesign-calendar.blue-theme {
      background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
      border: 1px solid #d9d9d9;
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-header {
      background: var(--ldesign-calendar-blue-gradient);
      color: white;
      border-bottom: none;
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-nav-btn {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-nav-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-weekday {
      background-color: #f0f9ff;
      color: #1890ff;
      font-weight: 600;
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-date-cell.is-today {
      background: radial-gradient(circle, #e6f7ff 0%, #f0f9ff 100%);
      border: 2px solid #1890ff;
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-event {
      background: var(--ldesign-calendar-blue-gradient);
      box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-event:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
    }

    .ldesign-calendar.blue-theme .ldesign-calendar-time-axis {
      background: linear-gradient(to bottom, #f0f9ff 0%, #fafafa 100%);
    }
  `,
}

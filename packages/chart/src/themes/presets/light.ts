/**
 * 浅色主题预设
 * 
 * 基于 ldesign 设计系统的浅色主题配置
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 浅色主题配置
 */
export const lightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    // 主色调
    primary: 'var(--ldesign-brand-color)',
    secondary: 'var(--ldesign-brand-color-6)',
    
    // 背景色
    background: 'var(--ldesign-bg-color-page, #ffffff)',
    surface: 'var(--ldesign-bg-color-container, #ffffff)',
    
    // 文本色
    text: 'var(--ldesign-text-color-primary)',
    textSecondary: 'var(--ldesign-text-color-secondary)',
    textDisabled: 'var(--ldesign-text-color-disabled)',
    
    // 边框色
    border: 'var(--ldesign-border-color)',
    borderHover: 'var(--ldesign-border-color-hover)',
    
    // 状态色
    success: 'var(--ldesign-success-color)',
    warning: 'var(--ldesign-warning-color)',
    error: 'var(--ldesign-error-color)',
    info: 'var(--ldesign-brand-color)',
    
    // 调色板
    palette: [
      'var(--ldesign-brand-color-7, #722ED1)',
      'var(--ldesign-brand-color-6, #8c5ad3)',
      'var(--ldesign-brand-color-5, #a67fdb)',
      'var(--ldesign-success-color, #52C41A)',
      'var(--ldesign-warning-color, #FAAD14)',
      'var(--ldesign-error-color, #F5222D)',
      '#1890FF',
      '#FA8C16',
      '#13C2C2',
      '#EB2F96',
    ],
    
    // 图表特定颜色
    grid: 'var(--ldesign-border-level-1-color, #f0f0f0)',
    axis: 'var(--ldesign-border-level-2-color, #d9d9d9)',
    tooltip: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: 'var(--ldesign-border-color)',
      text: 'var(--ldesign-text-color-primary)',
      shadow: 'var(--ldesign-shadow-2)',
    },
    legend: {
      text: 'var(--ldesign-text-color-primary)',
      inactive: 'var(--ldesign-text-color-disabled)',
    },
  },
  
  font: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: 14,
    weight: 'normal',
    lineHeight: 1.5,
  },
  
  spacing: {
    small: 'var(--ls-spacing-xs, 6px)',
    medium: 'var(--ls-spacing-sm, 12px)',
    large: 'var(--ls-spacing-base, 20px)',
    xlarge: 'var(--ls-spacing-lg, 28px)',
  },
  
  borderRadius: {
    small: 'var(--ls-border-radius-sm, 3px)',
    medium: 'var(--ls-border-radius-base, 6px)',
    large: 'var(--ls-border-radius-lg, 12px)',
  },
  
  shadow: {
    small: 'var(--ldesign-shadow-1)',
    medium: 'var(--ldesign-shadow-2)',
    large: 'var(--ldesign-shadow-3)',
  },
  
  animation: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // 图表特定配置
  chart: {
    // 网格配置
    grid: {
      backgroundColor: 'transparent',
      borderColor: 'var(--ldesign-border-level-1-color)',
      borderWidth: 1,
    },
    
    // 坐标轴配置
    axis: {
      lineColor: 'var(--ldesign-border-level-2-color)',
      labelColor: 'var(--ldesign-text-color-secondary)',
      tickColor: 'var(--ldesign-border-level-2-color)',
      splitLineColor: 'var(--ldesign-border-level-1-color)',
    },
    
    // 数据系列配置
    series: {
      lineWidth: 2,
      symbolSize: 6,
      areaOpacity: 0.3,
      barBorderRadius: 2,
    },
    
    // 交互状态
    hover: {
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    },
    
    // 选中状态
    select: {
      borderWidth: 2,
      borderColor: 'var(--ldesign-brand-color)',
    },
  },
}

/**
 * 浅色主题的 ECharts 配置
 */
export const lightEChartsTheme = {
  color: lightTheme.colors.palette,
  backgroundColor: 'transparent',
  
  textStyle: {
    fontFamily: lightTheme.font.family,
    fontSize: lightTheme.font.size,
    color: lightTheme.colors.text,
  },
  
  title: {
    textStyle: {
      color: lightTheme.colors.text,
      fontFamily: lightTheme.font.family,
      fontSize: 16,
      fontWeight: 'bold',
    },
    subtextStyle: {
      color: lightTheme.colors.textSecondary,
      fontFamily: lightTheme.font.family,
      fontSize: 12,
    },
  },
  
  legend: {
    textStyle: {
      color: lightTheme.colors.text,
      fontFamily: lightTheme.font.family,
      fontSize: 12,
    },
    inactiveColor: lightTheme.colors.textDisabled,
  },
  
  tooltip: {
    backgroundColor: lightTheme.colors.tooltip?.background,
    borderColor: lightTheme.colors.tooltip?.border,
    borderWidth: 1,
    textStyle: {
      color: lightTheme.colors.tooltip?.text,
      fontFamily: lightTheme.font.family,
      fontSize: 12,
    },
  },
  
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: lightTheme.colors.axis,
        width: 1,
      },
    },
    axisTick: {
      lineStyle: {
        color: lightTheme.colors.axis,
      },
    },
    axisLabel: {
      color: lightTheme.colors.textSecondary,
      fontFamily: lightTheme.font.family,
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: lightTheme.colors.grid,
        type: 'solid',
      },
    },
    splitArea: {
      areaStyle: {
        color: ['transparent'],
      },
    },
  },
  
  valueAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: lightTheme.colors.textSecondary,
      fontFamily: lightTheme.font.family,
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: lightTheme.colors.grid,
        type: 'solid',
      },
    },
    splitArea: {
      areaStyle: {
        color: ['transparent'],
      },
    },
  },
  
  line: {
    smooth: false,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: {
      width: 2,
    },
    areaStyle: {
      opacity: 0.3,
    },
  },
  
  bar: {
    borderRadius: [2, 2, 0, 0],
    itemStyle: {
      borderWidth: 0,
    },
  },
  
  pie: {
    itemStyle: {
      borderWidth: 1,
      borderColor: lightTheme.colors.background,
    },
    label: {
      color: lightTheme.colors.text,
      fontFamily: lightTheme.font.family,
      fontSize: 12,
    },
    labelLine: {
      lineStyle: {
        color: lightTheme.colors.textSecondary,
      },
    },
  },
  
  scatter: {
    symbol: 'circle',
    symbolSize: 8,
    itemStyle: {
      opacity: 0.8,
    },
  },
}

export default lightTheme

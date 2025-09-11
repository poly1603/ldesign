/**
 * 深色主题预设
 * 
 * 基于 ldesign 设计系统的深色主题配置
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 深色主题配置
 */
export const darkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    // 主色调
    primary: '#8c5ad3',
    secondary: '#a67fdb',
    
    // 背景色
    background: '#141414',
    surface: '#1f1f1f',
    
    // 文本色
    text: 'rgba(255, 255, 255, 0.85)',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    textDisabled: 'rgba(255, 255, 255, 0.25)',
    
    // 边框色
    border: '#434343',
    borderHover: '#595959',
    
    // 状态色
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    
    // 调色板
    palette: [
      '#8c5ad3',
      '#a67fdb',
      '#bfa4e5',
      '#52c41a',
      '#faad14',
      '#ff4d4f',
      '#1890ff',
      '#fa8c16',
      '#13c2c2',
      '#eb2f96',
    ],
    
    // 图表特定颜色
    grid: '#303030',
    axis: '#434343',
    tooltip: {
      background: 'rgba(0, 0, 0, 0.85)',
      border: '#434343',
      text: 'rgba(255, 255, 255, 0.85)',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    legend: {
      text: 'rgba(255, 255, 255, 0.85)',
      inactive: 'rgba(255, 255, 255, 0.25)',
    },
  },
  
  font: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: 14,
    weight: 'normal',
    lineHeight: 1.5,
  },
  
  spacing: {
    small: '6px',
    medium: '12px',
    large: '20px',
    xlarge: '28px',
  },
  
  borderRadius: {
    small: '3px',
    medium: '6px',
    large: '12px',
  },
  
  shadow: {
    small: '0 2px 8px rgba(0, 0, 0, 0.15)',
    medium: '0 4px 20px rgba(0, 0, 0, 0.25)',
    large: '0 8px 30px rgba(0, 0, 0, 0.35)',
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
      borderColor: '#303030',
      borderWidth: 1,
    },
    
    // 坐标轴配置
    axis: {
      lineColor: '#434343',
      labelColor: 'rgba(255, 255, 255, 0.65)',
      tickColor: '#434343',
      splitLineColor: '#303030',
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
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    },
    
    // 选中状态
    select: {
      borderWidth: 2,
      borderColor: '#8c5ad3',
    },
  },
}

/**
 * 深色主题的 ECharts 配置
 */
export const darkEChartsTheme = {
  color: darkTheme.colors.palette,
  backgroundColor: 'transparent',
  
  textStyle: {
    fontFamily: darkTheme.font.family,
    fontSize: darkTheme.font.size,
    color: darkTheme.colors.text,
  },
  
  title: {
    textStyle: {
      color: darkTheme.colors.text,
      fontFamily: darkTheme.font.family,
      fontSize: 16,
      fontWeight: 'bold',
    },
    subtextStyle: {
      color: darkTheme.colors.textSecondary,
      fontFamily: darkTheme.font.family,
      fontSize: 12,
    },
  },
  
  legend: {
    textStyle: {
      color: darkTheme.colors.text,
      fontFamily: darkTheme.font.family,
      fontSize: 12,
    },
    inactiveColor: darkTheme.colors.textDisabled,
  },
  
  tooltip: {
    backgroundColor: darkTheme.colors.tooltip?.background,
    borderColor: darkTheme.colors.tooltip?.border,
    borderWidth: 1,
    textStyle: {
      color: darkTheme.colors.tooltip?.text,
      fontFamily: darkTheme.font.family,
      fontSize: 12,
    },
  },
  
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: darkTheme.colors.axis,
        width: 1,
      },
    },
    axisTick: {
      lineStyle: {
        color: darkTheme.colors.axis,
      },
    },
    axisLabel: {
      color: darkTheme.colors.textSecondary,
      fontFamily: darkTheme.font.family,
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: darkTheme.colors.grid,
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
      color: darkTheme.colors.textSecondary,
      fontFamily: darkTheme.font.family,
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: darkTheme.colors.grid,
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
      borderColor: darkTheme.colors.background,
    },
    label: {
      color: darkTheme.colors.text,
      fontFamily: darkTheme.font.family,
      fontSize: 12,
    },
    labelLine: {
      lineStyle: {
        color: darkTheme.colors.textSecondary,
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

export default darkTheme

/**
 * 彩色主题预设
 * 
 * 基于 ldesign 设计系统的彩色主题配置，提供更丰富的色彩表现
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 彩色主题配置
 */
export const colorfulTheme: ThemeConfig = {
  name: 'colorful',
  colors: {
    // 主色调
    primary: '#722ED1',
    secondary: '#1890FF',
    
    // 背景色
    background: '#fafafa',
    surface: '#ffffff',
    
    // 文本色
    text: 'rgba(0, 0, 0, 0.85)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textDisabled: 'rgba(0, 0, 0, 0.25)',
    
    // 边框色
    border: '#d9d9d9',
    borderHover: '#40a9ff',
    
    // 状态色
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff',
    
    // 丰富的调色板
    palette: [
      '#722ED1', // 紫色
      '#1890FF', // 蓝色
      '#52C41A', // 绿色
      '#FAAD14', // 黄色
      '#F5222D', // 红色
      '#FA8C16', // 橙色
      '#13C2C2', // 青色
      '#EB2F96', // 粉色
      '#722ED1', // 深紫色
      '#FADB14', // 金黄色
      '#A0D911', // 青绿色
      '#FF7A45', // 橙红色
      '#FF85C0', // 浅粉色
      '#9254DE', // 中紫色
      '#36CFC9', // 浅青色
      '#FFC53D', // 浅黄色
    ],
    
    // 图表特定颜色
    grid: '#f0f0f0',
    axis: '#d9d9d9',
    tooltip: {
      background: 'rgba(255, 255, 255, 0.96)',
      border: '#d9d9d9',
      text: 'rgba(0, 0, 0, 0.85)',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    },
    legend: {
      text: 'rgba(0, 0, 0, 0.85)',
      inactive: 'rgba(0, 0, 0, 0.25)',
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
    small: '4px',
    medium: '6px',
    large: '12px',
  },
  
  shadow: {
    small: '0 2px 8px rgba(0, 0, 0, 0.06)',
    medium: '0 4px 20px rgba(0, 0, 0, 0.12)',
    large: '0 8px 30px rgba(0, 0, 0, 0.18)',
  },
  
  animation: {
    duration: 400,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  // 图表特定配置
  chart: {
    // 网格配置
    grid: {
      backgroundColor: 'transparent',
      borderColor: '#f0f0f0',
      borderWidth: 1,
    },
    
    // 坐标轴配置
    axis: {
      lineColor: '#d9d9d9',
      labelColor: 'rgba(0, 0, 0, 0.65)',
      tickColor: '#d9d9d9',
      splitLineColor: '#f0f0f0',
    },
    
    // 数据系列配置
    series: {
      lineWidth: 3,
      symbolSize: 8,
      areaOpacity: 0.4,
      barBorderRadius: 4,
    },
    
    // 交互状态
    hover: {
      shadowBlur: 15,
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffsetX: 0,
      shadowOffsetY: 4,
    },
    
    // 选中状态
    select: {
      borderWidth: 3,
      borderColor: '#722ED1',
    },
  },
}

/**
 * 彩色主题的 ECharts 配置
 */
export const colorfulEChartsTheme = {
  color: colorfulTheme.colors.palette,
  backgroundColor: 'transparent',
  
  textStyle: {
    fontFamily: colorfulTheme.font.family,
    fontSize: colorfulTheme.font.size,
    color: colorfulTheme.colors.text,
  },
  
  title: {
    textStyle: {
      color: colorfulTheme.colors.text,
      fontFamily: colorfulTheme.font.family,
      fontSize: 18,
      fontWeight: 'bold',
    },
    subtextStyle: {
      color: colorfulTheme.colors.textSecondary,
      fontFamily: colorfulTheme.font.family,
      fontSize: 14,
    },
  },
  
  legend: {
    textStyle: {
      color: colorfulTheme.colors.text,
      fontFamily: colorfulTheme.font.family,
      fontSize: 13,
    },
    inactiveColor: colorfulTheme.colors.textDisabled,
  },
  
  tooltip: {
    backgroundColor: colorfulTheme.colors.tooltip?.background,
    borderColor: colorfulTheme.colors.tooltip?.border,
    borderWidth: 1,
    borderRadius: 6,
    textStyle: {
      color: colorfulTheme.colors.tooltip?.text,
      fontFamily: colorfulTheme.font.family,
      fontSize: 12,
    },
  },
  
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: colorfulTheme.colors.axis,
        width: 1,
      },
    },
    axisTick: {
      lineStyle: {
        color: colorfulTheme.colors.axis,
      },
    },
    axisLabel: {
      color: colorfulTheme.colors.textSecondary,
      fontFamily: colorfulTheme.font.family,
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: colorfulTheme.colors.grid,
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
      color: colorfulTheme.colors.textSecondary,
      fontFamily: colorfulTheme.font.family,
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: colorfulTheme.colors.grid,
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
    smooth: true,
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: {
      width: 3,
    },
    areaStyle: {
      opacity: 0.4,
    },
  },
  
  bar: {
    borderRadius: [4, 4, 0, 0],
    itemStyle: {
      borderWidth: 0,
    },
  },
  
  pie: {
    itemStyle: {
      borderWidth: 2,
      borderColor: colorfulTheme.colors.background,
    },
    label: {
      color: colorfulTheme.colors.text,
      fontFamily: colorfulTheme.font.family,
      fontSize: 12,
      fontWeight: 'bold',
    },
    labelLine: {
      lineStyle: {
        color: colorfulTheme.colors.textSecondary,
        width: 2,
      },
    },
  },
  
  scatter: {
    symbol: 'circle',
    symbolSize: 10,
    itemStyle: {
      opacity: 0.8,
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  },
}

export default colorfulTheme

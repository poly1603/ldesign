/**
 * 预设主题
 */

import type { ThemeConfig } from '../types';

/**
 * 亮色主题
 */
export const lightTheme: ThemeConfig = {
  color: [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc',
  ],
  backgroundColor: '#ffffff',
  textStyle: {
    color: '#333333',
    fontSize: 12,
  },
  title: {
    textStyle: {
      color: '#333333',
      fontSize: 18,
      fontWeight: 'bold',
    },
    subtextStyle: {
      color: '#666666',
      fontSize: 14,
    },
  },
  line: {
    itemStyle: {
      borderWidth: 1,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 6,
    smooth: false,
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: '#cccccc',
    },
  },
  pie: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  scatter: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  legend: {
    textStyle: {
      color: '#333333',
    },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#cccccc',
    borderWidth: 1,
    textStyle: {
      color: '#333333',
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#cccccc',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#cccccc',
      },
    },
    axisLabel: {
      show: true,
      color: '#666666',
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: ['#e0e0e0'],
      },
    },
    splitArea: {
      show: false,
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: '#cccccc',
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: '#cccccc',
      },
    },
    axisLabel: {
      show: true,
      color: '#666666',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#e0e0e0'],
      },
    },
    splitArea: {
      show: false,
    },
  },
};

/**
 * 暗色主题
 */
export const darkTheme: ThemeConfig = {
  color: [
    '#4992ff',
    '#7cffb2',
    '#fddd60',
    '#ff6e76',
    '#58d9f9',
    '#05c091',
    '#ff8a45',
    '#8d48e3',
    '#dd79ff',
  ],
  backgroundColor: '#1a1a1a',
  textStyle: {
    color: '#eeeeee',
    fontSize: 12,
  },
  title: {
    textStyle: {
      color: '#eeeeee',
      fontSize: 18,
      fontWeight: 'bold',
    },
    subtextStyle: {
      color: '#aaaaaa',
      fontSize: 14,
    },
  },
  line: {
    itemStyle: {
      borderWidth: 1,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 6,
    smooth: false,
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: '#444444',
    },
  },
  pie: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#444444',
    },
  },
  scatter: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#444444',
    },
  },
  legend: {
    textStyle: {
      color: '#eeeeee',
    },
  },
  tooltip: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderColor: '#444444',
    borderWidth: 1,
    textStyle: {
      color: '#eeeeee',
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#444444',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#444444',
      },
    },
    axisLabel: {
      show: true,
      color: '#aaaaaa',
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: ['#333333'],
      },
    },
    splitArea: {
      show: false,
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: '#444444',
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: '#444444',
      },
    },
    axisLabel: {
      show: true,
      color: '#aaaaaa',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#333333'],
      },
    },
    splitArea: {
      show: false,
    },
  },
};

/**
 * 蓝色主题
 */
export const blueTheme: ThemeConfig = {
  ...lightTheme,
  color: [
    '#1890ff',
    '#2fc25b',
    '#facc14',
    '#223273',
    '#8543e0',
    '#13c2c2',
    '#3436c7',
    '#f04864',
  ],
};

/**
 * 绿色主题
 */
export const greenTheme: ThemeConfig = {
  ...lightTheme,
  color: [
    '#52c41a',
    '#13c2c2',
    '#1890ff',
    '#2f54eb',
    '#722ed1',
    '#eb2f96',
    '#fa541c',
    '#faad14',
  ],
};

/**
 * 紫色主题
 */
export const purpleTheme: ThemeConfig = {
  ...lightTheme,
  color: [
    '#722ed1',
    '#eb2f96',
    '#f5222d',
    '#fa541c',
    '#fa8c16',
    '#faad14',
    '#52c41a',
    '#13c2c2',
  ],
};

/**
 * 所有预设主题
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
};

/**
 * 获取主题
 */
export function getTheme(name: string): ThemeConfig | undefined {
  return themes[name as keyof typeof themes];
}

/**
 * 获取主题列表
 */
export function getThemeNames(): string[] {
  return Object.keys(themes);
}


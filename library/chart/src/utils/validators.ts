/**
 * 数据验证器
 */

import type { ChartConfig, ChartType } from '../types';

/**
 * 验证图表配置
 */
export function validateConfig(config: ChartConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证必填字段
  if (!config.type) {
    errors.push('图表类型 (type) 是必填项');
  }

  if (!config.data) {
    errors.push('图表数据 (data) 是必填项');
  }

  // 验证图表类型
  if (config.type && !isValidChartType(config.type)) {
    errors.push(`不支持的图表类型: ${config.type}`);
  }

  // 验证字体大小
  if (config.fontSize !== undefined) {
    if (typeof config.fontSize === 'number') {
      if (config.fontSize <= 0) {
        errors.push('字体大小必须大于 0');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证图表类型
 */
export function isValidChartType(type: string): type is ChartType {
  const validTypes: ChartType[] = [
    'line',
    'bar',
    'pie',
    'scatter',
    'radar',
    'effectScatter',
    'candlestick',
    'boxplot',
    'heatmap',
    'parallel',
    'gauge',
    'funnel',
    'sankey',
    'graph',
    'tree',
    'treemap',
    'sunburst',
    'map',
    'lines',
    'pictorialBar',
    'themeRiver',
    'custom',
    'mixed',
  ];

  return validTypes.includes(type as ChartType);
}

/**
 * 验证数据范围
 */
export function validateDataRange(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * 验证颜色值
 */
export function isValidColor(color: string): boolean {
  // 十六进制颜色
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) return true;

  // RGB/RGBA
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(color))
    return true;

  // HSL/HSLA
  if (/^hsla?\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(,\s*[\d.]+\s*)?\)$/i.test(color))
    return true;

  // CSS 颜色名称
  const cssColors = [
    'red',
    'blue',
    'green',
    'yellow',
    'orange',
    'purple',
    'pink',
    'black',
    'white',
    'gray',
    'transparent',
  ];
  if (cssColors.includes(color.toLowerCase())) return true;

  return false;
}

/**
 * 验证 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 清理配置对象（移除 undefined 值）
 */
export function cleanConfig<T extends Record<string, any>>(config: T): T {
  const cleaned: any = {};

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      const value = config[key];
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          cleaned[key] = cleanConfig(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
  }

  return cleaned;
}


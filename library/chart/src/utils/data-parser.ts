/**
 * 数据解析器 - 智能识别和解析各种数据格式
 */

import type { ChartData, ParsedChartData, SimpleArray, ObjectArray, SimpleChartData } from '../types';
import { isArray, isObject } from './helpers';

export class DataParser {
  /**
   * 解析图表数据
   */
  parse(data: ChartData): ParsedChartData {
    // 判断数据类型
    if (this.isSimpleArray(data)) {
      return this.parseSimpleArray(data);
    } else if (this.isObjectArray(data)) {
      return this.parseObjectArray(data);
    } else if (this.isStandardFormat(data)) {
      return this.parseStandardFormat(data);
    }

    // 默认返回空数据
    return {
      xData: [],
      series: [[]],
      seriesNames: ['Series 1'],
      dataType: 'simple',
      isTimeSeries: false,
      totalPoints: 0,
    };
  }

  /**
   * 判断是否是简单数组
   */
  private isSimpleArray(data: any): data is SimpleArray {
    return isArray(data) && data.length > 0 && typeof data[0] === 'number';
  }

  /**
   * 判断是否是对象数组
   */
  private isObjectArray(data: any): data is ObjectArray {
    return isArray(data) && data.length > 0 && isObject(data[0]);
  }

  /**
   * 判断是否是标准格式
   */
  private isStandardFormat(data: any): data is SimpleChartData {
    return isObject(data) && 'datasets' in data && isArray(data.datasets);
  }

  /**
   * 解析简单数组
   */
  private parseSimpleArray(data: SimpleArray): ParsedChartData {
    return {
      xData: data.map((_, index) => index),
      series: [data],
      seriesNames: ['Series 1'],
      dataType: 'simple',
      isTimeSeries: false,
      totalPoints: data.length,
    };
  }

  /**
   * 解析对象数组
   */
  private parseObjectArray(data: ObjectArray): ParsedChartData {
    if (data.length === 0) {
      return {
        xData: [],
        series: [[]],
        seriesNames: ['Series 1'],
        dataType: 'object',
        isTimeSeries: false,
        totalPoints: 0,
      };
    }

    // 获取所有键
    const keys = Object.keys(data[0]);

    // 尝试识别 X 轴字段
    const xField = this.identifyXField(keys, data);

    // 尝试识别 Y 轴字段
    const yFields = this.identifyYFields(keys, xField);

    // 提取 X 轴数据
    const xData = data.map((item) => item[xField]);

    // 提取系列数据
    const series = yFields.map((field) => data.map((item) => item[field]));

    // 判断是否是时间序列
    const isTimeSeries = this.isTimeSeriesData(xData);

    return {
      xData,
      series,
      seriesNames: yFields,
      dataType: 'object',
      isTimeSeries,
      totalPoints: data.length,
    };
  }

  /**
   * 解析标准格式
   */
  private parseStandardFormat(data: SimpleChartData): ParsedChartData {
    const { labels, datasets } = data;

    // X 轴数据
    const xData = labels || datasets[0]?.data.map((_, index) => index) || [];

    // 系列数据
    const series = datasets.map((dataset) => dataset.data);

    // 系列名称
    const seriesNames = datasets.map(
      (dataset, index) => dataset.name || `Series ${index + 1}`
    );

    // 判断是否是时间序列
    const isTimeSeries = this.isTimeSeriesData(xData);

    // 计算总数据点
    const totalPoints = series.reduce((sum, s) => sum + s.length, 0);

    return {
      xData,
      series,
      seriesNames,
      dataType: 'standard',
      isTimeSeries,
      totalPoints,
    };
  }

  /**
   * 识别 X 轴字段
   */
  private identifyXField(keys: string[], data: any[]): string {
    // 常见的 X 轴字段名
    const commonXFields = [
      'x',
      'date',
      'time',
      'timestamp',
      'name',
      'label',
      'category',
      'key',
    ];

    // 查找匹配的字段
    for (const field of commonXFields) {
      if (keys.includes(field)) {
        return field;
      }
    }

    // 查找字符串类型的字段
    for (const key of keys) {
      const value = data[0][key];
      if (typeof value === 'string' || value instanceof Date) {
        return key;
      }
    }

    // 默认使用第一个字段
    return keys[0] || 'x';
  }

  /**
   * 识别 Y 轴字段
   */
  private identifyYFields(keys: string[], xField: string): string[] {
    // 排除 X 轴字段
    const yFields = keys.filter((key) => key !== xField);

    // 如果没有其他字段，使用 X 轴字段
    if (yFields.length === 0) {
      return [xField];
    }

    return yFields;
  }

  /**
   * 判断是否是时间序列数据
   */
  private isTimeSeriesData(data: any[]): boolean {
    if (data.length === 0) return false;

    const first = data[0];

    // 检查是否是 Date 对象
    if (first instanceof Date) return true;

    // 检查是否是时间戳
    if (typeof first === 'number' && first > 1000000000) return true;

    // 检查是否是时间字符串
    if (typeof first === 'string') {
      const timestamp = Date.parse(first);
      if (!isNaN(timestamp)) return true;
    }

    return false;
  }

  /**
   * 统计数据特征
   */
  getDataStats(data: ChartData): {
    min: number;
    max: number;
    avg: number;
    total: number;
    count: number;
  } {
    const parsed = this.parse(data);
    const allValues = parsed.series.flat().filter((v) => typeof v === 'number');

    if (allValues.length === 0) {
      return { min: 0, max: 0, avg: 0, total: 0, count: 0 };
    }

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const total = allValues.reduce((sum, v) => sum + v, 0);
    const avg = total / allValues.length;

    return {
      min,
      max,
      avg,
      total,
      count: allValues.length,
    };
  }

  /**
   * 数据验证
   */
  validate(data: ChartData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push('数据不能为空');
      return { valid: false, errors };
    }

    if (isArray(data)) {
      if (data.length === 0) {
        errors.push('数据数组不能为空');
      }
    } else if (isObject(data)) {
      if (!('datasets' in data)) {
        errors.push('标准格式数据必须包含 datasets 字段');
      } else if (!isArray(data.datasets) || data.datasets.length === 0) {
        errors.push('datasets 必须是非空数组');
      }
    } else {
      errors.push('无效的数据格式');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


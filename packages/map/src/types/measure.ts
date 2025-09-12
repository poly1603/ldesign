/**
 * 测量相关类型定义
 */

import type { Geometry } from 'ol/geom';
import type { Style } from 'ol/style';

/**
 * 测量类型枚举
 */
export enum MeasureType {
  /** 距离测量 */
  DISTANCE = 'distance',
  /** 面积测量 */
  AREA = 'area',
  /** 角度测量 */
  ANGLE = 'angle'
}

/**
 * 测量结果接口
 */
export interface MeasureResult {
  /** 测量类型 */
  type: MeasureType;
  /** 测量值（原始数值） */
  value: number;
  /** 格式化后的测量值 */
  formattedValue: string;
  /** 单位 */
  unit: string;
  /** 几何对象 */
  geometry: Geometry;
  /** 时间戳 */
  timestamp: number;
  /** 精度信息 */
  accuracy?: number;
}

/**
 * 测量配置接口
 */
export interface MeasureConfig {
  /** 是否启用实时测量 */
  enableRealtime?: boolean;
  /** 是否显示测量标签 */
  showLabels?: boolean;
  /** 测量精度（小数位数） */
  precision?: number;
  /** 自定义样式 */
  style?: Style;
  /** 单位系统 */
  unitSystem?: 'metric' | 'imperial';
}

/**
 * 测量选项接口
 */
export interface MeasureOptions {
  /** 自定义样式 */
  style?: Style;
  /** 是否启用实时显示 */
  enableRealtime?: boolean;
  /** 测量精度 */
  precision?: number;
  /** 单位系统 */
  unitSystem?: 'metric' | 'imperial';
}

/**
 * 测量事件数据接口
 */
export interface MeasureEventData {
  /** 事件类型 */
  type: string;
  /** 测量类型 */
  measureType?: MeasureType;
  /** 相关要素 */
  feature?: any;
  /** 测量结果 */
  result?: MeasureResult;
  /** 测量ID */
  measureId?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 测量工具接口
 */
export interface IMeasureTools {
  /** 开始距离测量 */
  startDistanceMeasure(options?: MeasureOptions): void;
  
  /** 开始面积测量 */
  startAreaMeasure(options?: MeasureOptions): void;
  
  /** 停止测量 */
  stopMeasure(): void;
  
  /** 清空所有测量结果 */
  clear(): void;
  
  /** 删除指定测量结果 */
  removeMeasurement(measureId: string): boolean;
  
  /** 获取所有测量结果 */
  getMeasurements(): MeasureResult[];
  
  /** 获取指定测量结果 */
  getMeasurement(measureId: string): MeasureResult | null;
  
  /** 获取当前状态 */
  getState(): { isActive: boolean; currentType: MeasureType | null; measurementCount: number };
  
  /** 添加事件监听器 */
  addEventListener(event: string, listener: Function): void;
  
  /** 移除事件监听器 */
  removeEventListener(event: string, listener: Function): void;
  
  /** 销毁测量工具 */
  destroy(): void;
}

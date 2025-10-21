/**
 * 视图相关类型定义
 */

import { Position } from './model';

/**
 * 视口配置
 */
export interface ViewportConfig {
  /** 初始缩放比例 */
  zoom?: number;
  /** 最小缩放比例 */
  minZoom?: number;
  /** 最大缩放比例 */
  maxZoom?: number;
  /** 缩放步长 */
  zoomStep?: number;
  /** 初始位置 */
  position?: Position;
  /** 是否启用缩放 */
  enableZoom?: boolean;
  /** 是否启用平移 */
  enablePan?: boolean;
}

/**
 * 视口状态
 */
export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * 渲染配置
 */
export interface RenderConfig {
  /** 抗锯齿 */
  antialias?: boolean;
  /** 是否异步渲染 */
  async?: boolean;
}

/**
 * 边界框
 */
export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}



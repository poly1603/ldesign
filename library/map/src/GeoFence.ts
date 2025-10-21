import { PolygonLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';

/**
 * 围栏类型
 */
export type FenceType = 'polygon' | 'circle' | 'rectangle' | 'corridor';

/**
 * 围栏状态
 */
export type FenceStatus = 'active' | 'inactive' | 'warning' | 'alarming';

/**
 * 围栏事件类型
 */
export type FenceEventType = 'enter' | 'leave' | 'dwell' | 'cross';

/**
 * 围栏基础配置
 */
export interface GeoFenceOptions {
  id: string;
  name?: string;
  type: FenceType;
  coordinates: number[][];  // 多边形顶点或圆心/矩形角点
  radius?: number;          // 圆形围栏半径（米）
  width?: number;           // 走廊围栏宽度（米）
  status?: FenceStatus;
  color?: number[];
  fillColor?: number[];
  strokeColor?: number[];
  strokeWidth?: number;
  opacity?: number;
  visible?: boolean;
  enabled?: boolean;
  checkInterval?: number;   // 检查间隔（毫秒）
  dwellTime?: number;       // 停留时间阈值（毫秒）
  metadata?: any;
}

/**
 * 围栏事件
 */
export interface FenceEvent {
  type: FenceEventType;
  fenceId: string;
  targetId: string;
  position: [number, number];
  timestamp: number;
  data?: any;
}

/**
 * 监控目标
 */
export interface MonitorTarget {
  id: string;
  position: [number, number];
  data?: any;
}

/**
 * 围栏统计
 */
export interface FenceStatistics {
  fenceId: string;
  enterCount: number;
  leaveCount: number;
  currentCount: number;
  dwellCount: number;
  averageDwellTime: number;
  lastEvent?: FenceEvent;
}

/**
 * GeoFence - 地理围栏管理器
 * 支持多种围栏类型、事件监听、目标跟踪等
 */
export class GeoFence {
  private fences: Map<string, GeoFenceOptions> = new Map();
  private targets: Map<string, MonitorTarget> = new Map();
  private targetStates: Map<string, Map<string, boolean>> = new Map();
  private targetEnterTimes: Map<string, Map<string, number>> = new Map();
  private statistics: Map<string, FenceStatistics> = new Map();
  private eventListeners: Map<FenceEventType, Set<(event: FenceEvent) => void>> = new Map();
  private checkTimer: number | null = null;
  private layers: DeckGLLayer[] = [];

  constructor() {
    // 初始化事件监听器
    ['enter', 'leave', 'dwell', 'cross'].forEach(type => {
      this.eventListeners.set(type as FenceEventType, new Set());
    });
  }

  /**
   * 添加围栏
   */
  addFence(fence: GeoFenceOptions): void {
    // 设置默认值
    const fenceWithDefaults = {
      status: 'active' as FenceStatus,
      color: [0, 100, 200, 180],
      fillColor: [0, 100, 200, 60],
      strokeColor: [0, 100, 200, 255],
      strokeWidth: 2,
      opacity: 0.8,
      visible: true,
      enabled: true,
      checkInterval: 1000,
      dwellTime: 60000,
      ...fence
    };

    this.fences.set(fence.id, fenceWithDefaults);

    // 初始化统计
    this.statistics.set(fence.id, {
      fenceId: fence.id,
      enterCount: 0,
      leaveCount: 0,
      currentCount: 0,
      dwellCount: 0,
      averageDwellTime: 0
    });

    this.updateLayers();
    this.startMonitoring();
  }

  /**
   * 批量添加围栏
   */
  addFences(fences: GeoFenceOptions[]): void {
    fences.forEach(fence => this.addFence(fence));
  }

  /**
   * 更新围栏
   */
  updateFence(fenceId: string, updates: Partial<GeoFenceOptions>): void {
    const fence = this.fences.get(fenceId);
    if (fence) {
      this.fences.set(fenceId, { ...fence, ...updates });
      this.updateLayers();
    }
  }

  /**
   * 删除围栏
   */
  removeFence(fenceId: string): void {
    this.fences.delete(fenceId);
    this.statistics.delete(fenceId);
    this.updateLayers();

    if (this.fences.size === 0) {
      this.stopMonitoring();
    }
  }

  /**
   * 清空所有围栏
   */
  clearFences(): void {
    this.fences.clear();
    this.statistics.clear();
    this.layers = [];
    this.stopMonitoring();
  }

  /**
   * 添加监控目标
   */
  addTarget(target: MonitorTarget): void {
    this.targets.set(target.id, target);

    // 初始化目标状态
    if (!this.targetStates.has(target.id)) {
      this.targetStates.set(target.id, new Map());
      this.targetEnterTimes.set(target.id, new Map());
    }

    // 立即检查目标位置
    this.checkTarget(target);
  }

  /**
   * 批量添加监控目标
   */
  addTargets(targets: MonitorTarget[]): void {
    targets.forEach(target => this.addTarget(target));
  }

  /**
   * 更新目标位置
   */
  updateTarget(targetId: string, position: [number, number], data?: any): void {
    const target = this.targets.get(targetId);
    if (target) {
      target.position = position;
      if (data) target.data = data;
      this.checkTarget(target);
    }
  }

  /**
   * 删除监控目标
   */
  removeTarget(targetId: string): void {
    this.targets.delete(targetId);
    this.targetStates.delete(targetId);
    this.targetEnterTimes.delete(targetId);
  }

  /**
   * 清空所有目标
   */
  clearTargets(): void {
    this.targets.clear();
    this.targetStates.clear();
    this.targetEnterTimes.clear();
  }

  /**
   * 监听围栏事件
   */
  on(eventType: FenceEventType, callback: (event: FenceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.add(callback);
    }
  }

  /**
   * 移除事件监听
   */
  off(eventType: FenceEventType, callback: (event: FenceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 获取围栏统计信息
   */
  getStatistics(fenceId?: string): FenceStatistics | FenceStatistics[] {
    if (fenceId) {
      return this.statistics.get(fenceId) || {
        fenceId,
        enterCount: 0,
        leaveCount: 0,
        currentCount: 0,
        dwellCount: 0,
        averageDwellTime: 0
      };
    }
    return Array.from(this.statistics.values());
  }

  /**
   * 获取围栏内的目标
   */
  getTargetsInFence(fenceId: string): MonitorTarget[] {
    const targets: MonitorTarget[] = [];

    this.targetStates.forEach((fenceStates, targetId) => {
      if (fenceStates.get(fenceId)) {
        const target = this.targets.get(targetId);
        if (target) targets.push(target);
      }
    });

    return targets;
  }

  /**
   * 检查点是否在围栏内
   */
  isPointInFence(point: [number, number], fenceId: string): boolean {
    const fence = this.fences.get(fenceId);
    if (!fence || !fence.enabled) return false;

    switch (fence.type) {
      case 'polygon':
        return this.isPointInPolygon(point, fence.coordinates);

      case 'circle':
        return this.isPointInCircle(point, fence.coordinates[0] as [number, number], fence.radius!);

      case 'rectangle':
        return this.isPointInRectangle(point, fence.coordinates);

      case 'corridor':
        return this.isPointInCorridor(point, fence.coordinates, fence.width!);

      default:
        return false;
    }
  }

  /**
   * 获取图层
   */
  getLayers(): DeckGLLayer[] {
    return this.layers;
  }

  /**
   * 启动监控
   */
  private startMonitoring(): void {
    if (this.checkTimer) return;

    // 获取最小检查间隔
    let minInterval = 1000;
    this.fences.forEach(fence => {
      if (fence.checkInterval) {
        minInterval = Math.min(minInterval, fence.checkInterval);
      }
    });

    this.checkTimer = window.setInterval(() => {
      this.checkAllTargets();
    }, minInterval);
  }

  /**
   * 停止监控
   */
  private stopMonitoring(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * 检查所有目标
   */
  private checkAllTargets(): void {
    this.targets.forEach(target => {
      this.checkTarget(target);
    });
  }

  /**
   * 检查单个目标
   */
  private checkTarget(target: MonitorTarget): void {
    const targetStates = this.targetStates.get(target.id) || new Map();
    const targetEnterTimes = this.targetEnterTimes.get(target.id) || new Map();

    this.fences.forEach(fence => {
      if (!fence.enabled) return;

      const wasInside = targetStates.get(fence.id) || false;
      const isInside = this.isPointInFence(target.position, fence.id);

      if (isInside && !wasInside) {
        // 进入围栏
        targetStates.set(fence.id, true);
        targetEnterTimes.set(fence.id, Date.now());

        this.emitEvent({
          type: 'enter',
          fenceId: fence.id,
          targetId: target.id,
          position: target.position,
          timestamp: Date.now(),
          data: target.data
        });

        // 更新统计
        const stats = this.statistics.get(fence.id)!;
        stats.enterCount++;
        stats.currentCount++;

      } else if (!isInside && wasInside) {
        // 离开围栏
        targetStates.set(fence.id, false);

        // 计算停留时间
        const enterTime = targetEnterTimes.get(fence.id);
        if (enterTime) {
          const dwellTime = Date.now() - enterTime;
          targetEnterTimes.delete(fence.id);

          // 检查是否达到停留阈值
          if (fence.dwellTime && dwellTime >= fence.dwellTime) {
            this.emitEvent({
              type: 'dwell',
              fenceId: fence.id,
              targetId: target.id,
              position: target.position,
              timestamp: Date.now(),
              data: { ...target.data, dwellTime }
            });

            // 更新统计
            const stats = this.statistics.get(fence.id)!;
            stats.dwellCount++;
            stats.averageDwellTime =
              (stats.averageDwellTime * (stats.dwellCount - 1) + dwellTime) / stats.dwellCount;
          }
        }

        this.emitEvent({
          type: 'leave',
          fenceId: fence.id,
          targetId: target.id,
          position: target.position,
          timestamp: Date.now(),
          data: target.data
        });

        // 更新统计
        const stats = this.statistics.get(fence.id)!;
        stats.leaveCount++;
        stats.currentCount = Math.max(0, stats.currentCount - 1);
      }
    });

    this.targetStates.set(target.id, targetStates);
    this.targetEnterTimes.set(target.id, targetEnterTimes);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: FenceEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }

    // 更新统计中的最后事件
    const stats = this.statistics.get(event.fenceId);
    if (stats) {
      stats.lastEvent = event;
    }
  }

  /**
   * 更新图层
   */
  private updateLayers(): void {
    const layers: DeckGLLayer[] = [];

    this.fences.forEach(fence => {
      if (!fence.visible) return;

      const statusColors = {
        active: fence.fillColor || [0, 100, 200, 60],
        inactive: [128, 128, 128, 60],
        warning: [255, 165, 0, 60],
        alarming: [255, 0, 0, 60]
      };

      const fillColor = statusColors[fence.status || 'active'];
      const lineColor = fence.strokeColor || [0, 100, 200, 255];

      if (fence.type === 'polygon' || fence.type === 'rectangle') {
        const polygonLayer = new PolygonLayer({
          id: `fence-${fence.id}`,
          data: [{
            polygon: fence.type === 'rectangle' ?
              this.rectangleToPolygon(fence.coordinates) : fence.coordinates
          }],
          getPolygon: (d: any) => d.polygon,
          getFillColor: fillColor,
          getLineColor: lineColor,
          getLineWidth: fence.strokeWidth || 2,
          lineWidthMinPixels: 2,
          filled: true,
          stroked: true,
          pickable: true
        });
        layers.push(polygonLayer);

      } else if (fence.type === 'circle') {
        const center = fence.coordinates[0] as [number, number];
        const circlePolygon = this.createCirclePolygon(center, fence.radius!);

        const circleLayer = new PolygonLayer({
          id: `fence-${fence.id}`,
          data: [{
            polygon: circlePolygon
          }],
          getPolygon: (d: any) => d.polygon,
          getFillColor: fillColor,
          getLineColor: lineColor,
          getLineWidth: fence.strokeWidth || 2,
          lineWidthMinPixels: 2,
          filled: true,
          stroked: true,
          pickable: true
        });
        layers.push(circleLayer);

      } else if (fence.type === 'corridor') {
        const corridorPolygon = this.createCorridorPolygon(fence.coordinates, fence.width!);

        const corridorLayer = new PolygonLayer({
          id: `fence-${fence.id}`,
          data: [{
            polygon: corridorPolygon
          }],
          getPolygon: (d: any) => d.polygon,
          getFillColor: fillColor,
          getLineColor: lineColor,
          getLineWidth: fence.strokeWidth || 2,
          lineWidthMinPixels: 2,
          filled: true,
          stroked: true,
          pickable: true
        });
        layers.push(corridorLayer);
      }
    });

    this.layers = layers;
  }

  /**
   * 判断点是否在多边形内（射线法）
   */
  private isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
    let inside = false;
    const x = point[0];
    const y = point[1];

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * 判断点是否在圆内
   */
  private isPointInCircle(point: [number, number], center: [number, number], radius: number): boolean {
    const distance = this.calculateDistance(point, center);
    return distance <= radius;
  }

  /**
   * 判断点是否在矩形内
   */
  private isPointInRectangle(point: [number, number], corners: number[][]): boolean {
    if (corners.length < 2) return false;

    const minX = Math.min(corners[0][0], corners[1][0]);
    const maxX = Math.max(corners[0][0], corners[1][0]);
    const minY = Math.min(corners[0][1], corners[1][1]);
    const maxY = Math.max(corners[0][1], corners[1][1]);

    return point[0] >= minX && point[0] <= maxX &&
      point[1] >= minY && point[1] <= maxY;
  }

  /**
   * 判断点是否在走廊内
   */
  private isPointInCorridor(point: [number, number], path: number[][], width: number): boolean {
    const halfWidth = width / 2;

    for (let i = 0; i < path.length - 1; i++) {
      const distance = this.pointToSegmentDistance(point,
        path[i] as [number, number],
        path[i + 1] as [number, number]
      );

      if (distance <= halfWidth) {
        return true;
      }
    }

    return false;
  }

  /**
   * 矩形转多边形
   */
  private rectangleToPolygon(corners: number[][]): number[][] {
    if (corners.length < 2) return [];

    const [corner1, corner2] = corners;
    return [
      [corner1[0], corner1[1]],
      [corner2[0], corner1[1]],
      [corner2[0], corner2[1]],
      [corner1[0], corner2[1]],
      [corner1[0], corner1[1]]
    ];
  }

  /**
   * 创建圆形多边形
   */
  private createCirclePolygon(center: [number, number], radius: number, segments: number = 32): number[][] {
    const polygon: number[][] = [];
    const radiusInDegrees = radius / 111320; // 粗略转换米到度

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = center[0] + radiusInDegrees * Math.cos(angle) / Math.cos(center[1] * Math.PI / 180);
      const y = center[1] + radiusInDegrees * Math.sin(angle);
      polygon.push([x, y]);
    }

    return polygon;
  }

  /**
   * 创建走廊多边形
   */
  private createCorridorPolygon(path: number[][], width: number): number[][] {
    if (path.length < 2) return [];

    const halfWidth = width / 111320 / 2; // 粗略转换米到度
    const leftSide: number[][] = [];
    const rightSide: number[][] = [];

    for (let i = 0; i < path.length; i++) {
      const curr = path[i];
      const prev = i > 0 ? path[i - 1] : null;
      const next = i < path.length - 1 ? path[i + 1] : null;

      let angle: number;

      if (prev && next) {
        const angle1 = Math.atan2(curr[1] - prev[1], curr[0] - prev[0]);
        const angle2 = Math.atan2(next[1] - curr[1], next[0] - curr[0]);
        angle = (angle1 + angle2) / 2;
      } else if (prev) {
        angle = Math.atan2(curr[1] - prev[1], curr[0] - prev[0]);
      } else if (next) {
        angle = Math.atan2(next[1] - curr[1], next[0] - curr[0]);
      } else {
        continue;
      }

      const perpAngle = angle + Math.PI / 2;
      const dx = halfWidth * Math.cos(perpAngle) / Math.cos(curr[1] * Math.PI / 180);
      const dy = halfWidth * Math.sin(perpAngle);

      leftSide.push([curr[0] + dx, curr[1] + dy]);
      rightSide.unshift([curr[0] - dx, curr[1] - dy]);
    }

    return [...leftSide, ...rightSide, leftSide[0]];
  }

  /**
   * 计算两点距离
   */
  private calculateDistance(p1: [number, number], p2: [number, number]): number {
    const R = 6371000; // 地球半径（米）
    const lat1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    const deltaLat = ((p2[1] - p1[1]) * Math.PI) / 180;
    const deltaLng = ((p2[0] - p1[0]) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 点到线段的距离
   */
  private pointToSegmentDistance(point: [number, number], start: [number, number], end: [number, number]): number {
    const A = point[0] - start[0];
    const B = point[1] - start[1];
    const C = end[0] - start[0];
    const D = end[1] - start[1];

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;

    if (param < 0) {
      xx = start[0];
      yy = start[1];
    } else if (param > 1) {
      xx = end[0];
      yy = end[1];
    } else {
      xx = start[0] + param * C;
      yy = start[1] + param * D;
    }

    return this.calculateDistance(point, [xx, yy]);
  }
}

/**
 * 创建地理围栏管理器
 */
export function createGeoFence(): GeoFence {
  return new GeoFence();
}

/**
 * 从 GeoJSON 创建围栏
 */
export function createFenceFromGeoJSON(geojson: any, options?: Partial<GeoFenceOptions>): GeoFenceOptions[] {
  const fences: GeoFenceOptions[] = [];

  if (geojson.type === 'Feature') {
    const fence = createFenceFromFeature(geojson, options);
    if (fence) fences.push(fence);
  } else if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach((feature: any) => {
      const fence = createFenceFromFeature(feature, options);
      if (fence) fences.push(fence);
    });
  }

  return fences;
}

function createFenceFromFeature(feature: any, options?: Partial<GeoFenceOptions>): GeoFenceOptions | null {
  const geometry = feature.geometry;
  const properties = feature.properties || {};

  if (geometry.type === 'Polygon') {
    return {
      id: properties.id || `fence-${Date.now()}`,
      name: properties.name,
      type: 'polygon',
      coordinates: geometry.coordinates[0],
      ...options
    };
  } else if (geometry.type === 'LineString') {
    return {
      id: properties.id || `fence-${Date.now()}`,
      name: properties.name,
      type: 'corridor',
      coordinates: geometry.coordinates,
      width: properties.width || 100,
      ...options
    };
  }

  return null;
}
/**
 * 地理围栏管理器
 * 负责地理围栏的创建、管理和事件检测
 */

import { Map as OLMap } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point, Polygon, Circle as CircleGeom, LineString } from 'ol/geom';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import * as turf from '@turf/turf';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { buffer } from '@turf/buffer';
import { center } from '@turf/center';

import type {
  GeofenceOptions,
  GeofenceInfo,
  GeofenceEventData,
  GeofenceEventType,
  GeofenceGeometryType,
  LocationTrackingState,
  GeofenceStatistics,
  IGeofenceManager
} from '../types/geofence';

/**
 * 地理围栏管理器实现
 */
export class GeofenceManager implements IGeofenceManager {
  private map: OLMap;
  private geofenceLayer: VectorLayer<VectorSource>;
  private geofenceSource: VectorSource;
  private geofences: Map<string, GeofenceInfo> = new Map();
  private locationState: LocationTrackingState;
  private statistics: Map<string, GeofenceStatistics> = new Map();
  private eventListeners: Map<GeofenceEventType, ((data: GeofenceEventData) => void)[]> = new Map();
  private watchId: number | null = null;

  constructor(map: OLMap) {
    this.map = map;

    // 初始化地理围栏图层
    this.geofenceSource = new VectorSource();
    this.geofenceLayer = new VectorLayer({
      source: this.geofenceSource,
      style: this.getDefaultGeofenceStyle(),
      zIndex: 500
    });

    this.map.addLayer(this.geofenceLayer);

    // 初始化位置跟踪状态
    this.locationState = {
      isTracking: false
    };
  }

  /**
   * 添加地理围栏
   */
  addGeofence(options: GeofenceOptions): string {
    try {
      const geofenceId = options.id || this.generateGeofenceId();

      // 创建地理围栏几何体
      const geometry = this.createGeofenceGeometry(options.geometry);

      // 创建地理围栏信息
      const geofenceInfo: GeofenceInfo = {
        id: geofenceId,
        name: options.name,
        description: options.description,
        geometry,
        style: options.style || this.getDefaultGeofenceStyleConfig(),
        enabled: options.enabled !== false,
        bufferDistance: options.bufferDistance || 0,
        triggers: options.triggers || [],
        bounds: this.calculateGeofenceBounds(geometry),
        area: this.calculateGeofenceArea(geometry),
        perimeter: this.calculateGeofencePerimeter(geometry),
        createdAt: new Date(),
        updatedAt: new Date(),
        properties: options.properties || {}
      };

      // 存储地理围栏信息
      this.geofences.set(geofenceId, geofenceInfo);

      // 创建地图要素
      const feature = new Feature({
        geometry,
        geofenceId,
        geofenceName: options.name
      });

      // 应用样式
      feature.setStyle(this.createGeofenceStyle(geofenceInfo.style));

      this.geofenceSource.addFeature(feature);

      // 初始化统计信息
      this.statistics.set(geofenceId, {
        geofenceId,
        enterCount: 0,
        exitCount: 0,
        totalDwellTime: 0,
        averageDwellTime: 0,
        maxDwellTime: 0,
        minDwellTime: 0
      });

      console.log(`[GeofenceManager] 地理围栏已添加: ${geofenceId}`);
      return geofenceId;
    } catch (error) {
      console.error('[GeofenceManager] 添加地理围栏失败:', error);
      throw error;
    }
  }

  /**
   * 删除地理围栏
   */
  removeGeofence(geofenceId: string): void {
    try {
      const geofence = this.geofences.get(geofenceId);
      if (!geofence) {
        console.warn(`[GeofenceManager] 地理围栏不存在: ${geofenceId}`);
        return;
      }

      // 从地图中移除要素
      const features = this.geofenceSource.getFeatures();
      const geofenceFeatures = features.filter(f => f.get('geofenceId') === geofenceId);
      geofenceFeatures.forEach(feature => {
        this.geofenceSource.removeFeature(feature);
      });

      // 从存储中删除
      this.geofences.delete(geofenceId);
      this.statistics.delete(geofenceId);

      console.log(`[GeofenceManager] 地理围栏已删除: ${geofenceId}`);
    } catch (error) {
      console.error('[GeofenceManager] 删除地理围栏失败:', error);
      throw error;
    }
  }

  /**
   * 获取地理围栏信息
   */
  getGeofence(geofenceId: string): GeofenceInfo | null {
    return this.geofences.get(geofenceId) || null;
  }

  /**
   * 获取所有地理围栏
   */
  getAllGeofences(): GeofenceInfo[] {
    return Array.from(this.geofences.values());
  }

  /**
   * 更新地理围栏
   */
  updateGeofence(geofenceId: string, options: Partial<GeofenceOptions>): void {
    try {
      const geofence = this.geofences.get(geofenceId);
      if (!geofence) {
        throw new Error(`地理围栏不存在: ${geofenceId}`);
      }

      // 更新地理围栏信息
      if (options.name) geofence.name = options.name;
      if (options.description !== undefined) geofence.description = options.description;
      if (options.style) geofence.style = { ...geofence.style, ...options.style };
      if (options.enabled !== undefined) geofence.enabled = options.enabled;
      if (options.bufferDistance !== undefined) geofence.bufferDistance = options.bufferDistance;
      if (options.triggers) geofence.triggers = options.triggers;
      if (options.properties) geofence.properties = { ...geofence.properties, ...options.properties };

      geofence.updatedAt = new Date();

      // 更新地图要素样式
      const features = this.geofenceSource.getFeatures();
      const geofenceFeature = features.find(f => f.get('geofenceId') === geofenceId);
      if (geofenceFeature) {
        geofenceFeature.setStyle(this.createGeofenceStyle(geofence.style));
      }

      console.log(`[GeofenceManager] 地理围栏已更新: ${geofenceId}`);
    } catch (error) {
      console.error('[GeofenceManager] 更新地理围栏失败:', error);
      throw error;
    }
  }

  /**
   * 启用/禁用地理围栏
   */
  setGeofenceEnabled(geofenceId: string, enabled: boolean): void {
    this.updateGeofence(geofenceId, { enabled });
  }

  /**
   * 清除所有地理围栏
   */
  clearGeofences(): void {
    try {
      // 停止位置跟踪
      this.stopLocationTracking();

      // 清除地图要素
      this.geofenceSource.clear();

      // 清除存储
      this.geofences.clear();
      this.statistics.clear();

      console.log('[GeofenceManager] 所有地理围栏已清除');
    } catch (error) {
      console.error('[GeofenceManager] 清除地理围栏失败:', error);
      throw error;
    }
  }

  /**
   * 检查位置是否在围栏内
   */
  isPointInGeofence(position: [number, number], geofenceId: string): boolean {
    try {
      const geofence = this.geofences.get(geofenceId);
      if (!geofence || !geofence.enabled) {
        return false;
      }

      const point = turf.point(position);

      // 直接处理不同的几何类型
      if (geofence.geometry instanceof Point) {
        // 点围栏：检查距离
        const center = toLonLat(geofence.geometry.getCoordinates());
        const centerPoint = turf.point(center);
        const distance = turf.distance(point, centerPoint, { units: 'meters' });
        return distance <= (geofence.bufferDistance || 100);
      } else if (geofence.geometry instanceof Polygon) {
        // 多边形围栏：检查点是否在多边形内
        const coords = geofence.geometry.getCoordinates().map((ring: any[]) =>
          ring.map((coord: any) => toLonLat(coord))
        );
        const polygon = turf.polygon(coords);
        return booleanPointInPolygon(point, polygon);
      } else if (geofence.geometry instanceof CircleGeom) {
        // 圆形围栏：检查距离
        const center = toLonLat(geofence.geometry.getCenter());
        const centerPoint = turf.point(center);
        const distance = turf.distance(point, centerPoint, { units: 'meters' });
        return distance <= geofence.geometry.getRadius();
      } else if (geofence.geometry instanceof LineString) {
        // 线段围栏：检查到线段的距离
        const coords = geofence.geometry.getCoordinates().map((coord: any) => toLonLat(coord));
        const line = turf.lineString(coords);
        const nearestPoint = turf.nearestPointOnLine(line, point);
        const distance = turf.distance(point, nearestPoint, { units: 'meters' });
        return distance <= (geofence.bufferDistance || 50);
      }

      return false;
    } catch (error) {
      console.error('[GeofenceManager] 检查点位置失败:', error);
      return false;
    }
  }

  /**
   * 检查地理围栏事件
   */
  checkGeofenceEvents(currentPosition: [number, number], previousPosition?: [number, number]): GeofenceEventData[] {
    const events: GeofenceEventData[] = [];

    try {
      for (const geofence of this.geofences.values()) {
        if (!geofence.enabled) continue;

        const currentInside = this.isPointInGeofence(currentPosition, geofence.id);
        const previousInside = previousPosition ? this.isPointInGeofence(previousPosition, geofence.id) : false;

        // 检测进入事件
        if (currentInside && !previousInside) {
          const eventData: GeofenceEventData = {
            type: 'enter',
            geofence,
            position: currentPosition,
            previousPosition,
            timestamp: new Date(),
            speed: this.calculateSpeed(currentPosition, previousPosition),
            bearing: this.calculateBearing(currentPosition, previousPosition)
          };

          events.push(eventData);
          this.updateStatistics(geofence.id, 'enter');
          this.emitEvent('enter', eventData);
        }

        // 检测离开事件
        if (!currentInside && previousInside) {
          const eventData: GeofenceEventData = {
            type: 'exit',
            geofence,
            position: currentPosition,
            previousPosition,
            timestamp: new Date(),
            speed: this.calculateSpeed(currentPosition, previousPosition),
            bearing: this.calculateBearing(currentPosition, previousPosition)
          };

          events.push(eventData);
          this.updateStatistics(geofence.id, 'exit');
          this.emitEvent('exit', eventData);
        }
      }
    } catch (error) {
      console.error('[GeofenceManager] 检查地理围栏事件失败:', error);
    }

    return events;
  }

  /**
   * 开始位置跟踪
   */
  startLocationTracking(): void {
    if (this.locationState.isTracking) {
      console.warn('[GeofenceManager] 位置跟踪已在运行');
      return;
    }

    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          this.updateLocation(coords, position.coords.accuracy);
        },
        (error) => {
          console.error('[GeofenceManager] 位置跟踪错误:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );

      this.locationState.isTracking = true;
      console.log('[GeofenceManager] 位置跟踪已开始');
    } else {
      console.error('[GeofenceManager] 浏览器不支持地理位置API');
    }
  }

  /**
   * 停止位置跟踪
   */
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.locationState.isTracking = false;
    console.log('[GeofenceManager] 位置跟踪已停止');
  }

  /**
   * 更新位置
   */
  updateLocation(position: [number, number], accuracy?: number): void {
    const previousPosition = this.locationState.currentPosition;

    this.locationState.previousPosition = previousPosition;
    this.locationState.currentPosition = position;
    this.locationState.lastUpdateTime = new Date();
    this.locationState.accuracy = accuracy;

    if (previousPosition) {
      this.locationState.speed = this.calculateSpeed(position, previousPosition);
      this.locationState.bearing = this.calculateBearing(position, previousPosition);
    }

    // 检查地理围栏事件
    this.checkGeofenceEvents(position, previousPosition);
  }

  /**
   * 获取围栏统计信息
   */
  getGeofenceStatistics(geofenceId: string): GeofenceStatistics | null {
    return this.statistics.get(geofenceId) || null;
  }

  /**
   * 重置围栏统计信息
   */
  resetGeofenceStatistics(geofenceId: string): void {
    const stats = this.statistics.get(geofenceId);
    if (stats) {
      stats.enterCount = 0;
      stats.exitCount = 0;
      stats.totalDwellTime = 0;
      stats.averageDwellTime = 0;
      stats.maxDwellTime = 0;
      stats.minDwellTime = 0;
      stats.firstEnterTime = undefined;
      stats.lastEnterTime = undefined;
      stats.lastExitTime = undefined;
    }
  }

  /**
   * 监听地理围栏事件
   */
  on(eventType: GeofenceEventType, callback: (data: GeofenceEventData) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * 移除事件监听
   */
  off(eventType: GeofenceEventType, callback: (data: GeofenceEventData) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 生成地理围栏ID
   */
  private generateGeofenceId(): string {
    return `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建地理围栏几何体
   */
  private createGeofenceGeometry(geometryOptions: any): any {
    const { type, coordinates, radius } = geometryOptions;

    switch (type) {
      case 'Point':
        return new Point(fromLonLat(coordinates));

      case 'Circle':
        const center = fromLonLat(coordinates);
        return new CircleGeom(center, radius || 100);

      case 'Polygon':
        const rings = coordinates.map((ring: number[][]) =>
          ring.map((coord: number[]) => fromLonLat(coord))
        );
        return new Polygon(rings);

      case 'LineString':
        const lineCoords = coordinates.map((coord: number[]) => fromLonLat(coord));
        return new LineString(lineCoords);

      default:
        throw new Error(`不支持的几何类型: ${type}`);
    }
  }

  /**
   * 获取默认地理围栏样式
   */
  private getDefaultGeofenceStyle(): Style {
    return new Style({
      stroke: new Stroke({
        color: '#722ED1',
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(114, 46, 209, 0.1)'
      })
    });
  }

  /**
   * 获取默认地理围栏样式配置
   */
  private getDefaultGeofenceStyleConfig(): any {
    return {
      fillColor: 'rgba(114, 46, 209, 0.1)',
      fillOpacity: 0.1,
      strokeColor: '#722ED1',
      strokeWidth: 2,
      strokeOpacity: 1
    };
  }

  /**
   * 创建地理围栏样式
   */
  private createGeofenceStyle(styleOptions: any): Style {
    return new Style({
      stroke: new Stroke({
        color: styleOptions.strokeColor || '#722ED1',
        width: styleOptions.strokeWidth || 2,
        lineDash: styleOptions.strokeDashArray
      }),
      fill: new Fill({
        color: styleOptions.fillColor || 'rgba(114, 46, 209, 0.1)'
      })
    });
  }

  /**
   * 计算地理围栏边界框
   */
  private calculateGeofenceBounds(geometry: any): [number, number, number, number] {
    try {
      const geoJSON = this.geometryToGeoJSON(geometry);
      const bounds = turf.bbox(geoJSON);
      return bounds as [number, number, number, number];
    } catch (error) {
      console.error('[GeofenceManager] 计算边界框失败:', error);
      return [0, 0, 0, 0];
    }
  }

  /**
   * 计算地理围栏面积
   */
  private calculateGeofenceArea(geometry: any): number {
    try {
      const geoJSON = this.geometryToGeoJSON(geometry);
      if (geoJSON.type === 'Polygon') {
        return turf.area(geoJSON);
      }
      return 0;
    } catch (error) {
      console.error('[GeofenceManager] 计算面积失败:', error);
      return 0;
    }
  }

  /**
   * 计算地理围栏周长
   */
  private calculateGeofencePerimeter(geometry: any): number {
    try {
      const geoJSON = this.geometryToGeoJSON(geometry);
      if (geoJSON.type === 'Polygon' || geoJSON.type === 'LineString') {
        return turf.length(geoJSON, { units: 'meters' });
      }
      return 0;
    } catch (error) {
      console.error('[GeofenceManager] 计算周长失败:', error);
      return 0;
    }
  }

  /**
   * 将OpenLayers几何体转换为GeoJSON
   */
  private geometryToGeoJSON(geometry: any): any {
    if (geometry instanceof Point) {
      const coords = toLonLat(geometry.getCoordinates());
      return turf.point(coords);
    } else if (geometry instanceof Polygon) {
      const coords = geometry.getCoordinates().map((ring: any[]) =>
        ring.map((coord: any) => toLonLat(coord))
      );
      return turf.polygon(coords);
    } else if (geometry instanceof LineString) {
      const coords = geometry.getCoordinates().map((coord: any) => toLonLat(coord));
      return turf.lineString(coords);
    } else if (geometry instanceof CircleGeom) {
      const center = toLonLat(geometry.getCenter());
      const radius = geometry.getRadius();
      const point = turf.point(center);
      return buffer(point, radius / 1000, { units: 'kilometers' });
    }

    throw new Error('不支持的几何类型');
  }

  /**
   * 计算移动速度
   */
  private calculateSpeed(currentPos: [number, number], previousPos?: [number, number]): number {
    if (!previousPos || !this.locationState.lastUpdateTime) {
      return 0;
    }

    const distance = turf.distance(
      turf.point(previousPos),
      turf.point(currentPos),
      { units: 'meters' }
    );

    const timeDiff = (Date.now() - this.locationState.lastUpdateTime.getTime()) / 1000; // 秒
    return timeDiff > 0 ? distance / timeDiff : 0; // 米/秒
  }

  /**
   * 计算移动方向
   */
  private calculateBearing(currentPos: [number, number], previousPos?: [number, number]): number {
    if (!previousPos) {
      return 0;
    }

    return turf.bearing(turf.point(previousPos), turf.point(currentPos));
  }

  /**
   * 更新统计信息
   */
  private updateStatistics(geofenceId: string, eventType: 'enter' | 'exit'): void {
    const stats = this.statistics.get(geofenceId);
    if (!stats) return;

    const now = new Date();

    if (eventType === 'enter') {
      stats.enterCount++;
      if (!stats.firstEnterTime) {
        stats.firstEnterTime = now;
      }
      stats.lastEnterTime = now;
    } else if (eventType === 'exit') {
      stats.exitCount++;
      stats.lastExitTime = now;

      // 计算停留时间
      if (stats.lastEnterTime) {
        const dwellTime = now.getTime() - stats.lastEnterTime.getTime();
        stats.totalDwellTime += dwellTime;

        if (stats.maxDwellTime === 0 || dwellTime > stats.maxDwellTime) {
          stats.maxDwellTime = dwellTime;
        }

        if (stats.minDwellTime === 0 || dwellTime < stats.minDwellTime) {
          stats.minDwellTime = dwellTime;
        }

        stats.averageDwellTime = stats.totalDwellTime / stats.exitCount;
      }
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(type: GeofenceEventType, data: GeofenceEventData): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[GeofenceManager] 事件回调执行失败 (${type}):`, error);
        }
      });
    }
  }
}

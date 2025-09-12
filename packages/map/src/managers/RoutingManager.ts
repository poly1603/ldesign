/**
 * 路径规划管理器
 * 负责路径计算、导航功能和路径动画
 */

import { Map as OLMap } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import { Style, Stroke, Circle, Fill, Icon } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { getLength } from 'ol/sphere';
import * as turf from '@turf/turf';
import { along } from '@turf/along';
import { length } from '@turf/length';
import { bbox } from '@turf/bbox';

import type {
  RoutingOptions,
  RouteInfo,
  RouteInstruction,
  NavigationState,
  RouteAnimationOptions,
  RouteEventData,
  RouteEventType,
  RoutingProfile,
  InstructionType,
  IRoutingManager
} from '../types/routing';

/**
 * 路径规划管理器实现
 */
export class RoutingManager implements IRoutingManager {
  private map: OLMap;
  private routeLayer: VectorLayer<VectorSource>;
  private routeSource: VectorSource;
  private routes: Map<string, RouteInfo> = new Map();
  private navigationState: NavigationState;
  private eventListeners: Map<RouteEventType, ((data: RouteEventData) => void)[]> = new Map();
  private animationFrameId: number | null = null;

  constructor(map: OLMap) {
    this.map = map;

    // 初始化路径图层
    this.routeSource = new VectorSource();
    this.routeLayer = new VectorLayer({
      source: this.routeSource,
      style: this.getDefaultRouteStyle(),
      zIndex: 1000
    });

    this.map.addLayer(this.routeLayer);

    // 初始化导航状态
    this.navigationState = {
      isNavigating: false,
      currentInstructionIndex: 0,
      remainingDistance: 0,
      remainingTime: 0,
      offRouteThreshold: 50 // 50米偏离阈值
    };
  }

  /**
   * 添加路径
   */
  async addRoute(options: RoutingOptions): Promise<RouteInfo> {
    try {
      const routeId = this.generateRouteId();

      // 计算路径
      const routeData = await this.calculateRoute(options);

      // 创建路径信息
      const routeInfo: RouteInfo = {
        id: routeId,
        name: `Route ${routeId}`,
        geometry: routeData.geometry,
        distance: routeData.distance,
        duration: routeData.duration,
        instructions: routeData.instructions,
        bounds: routeData.bounds,
        createdAt: new Date(),
        options
      };

      // 存储路径信息
      this.routes.set(routeId, routeInfo);

      // 创建地图要素
      const feature = new Feature({
        geometry: routeInfo.geometry,
        routeId: routeId,
        routeType: 'main'
      });

      // 应用样式
      if (options.style) {
        feature.setStyle(this.createRouteStyle(options.style));
      }

      this.routeSource.addFeature(feature);

      // 添加起点和终点标记
      this.addRouteMarkers(routeInfo);

      // 触发事件
      this.emitEvent('route-created', { route: routeInfo });

      return routeInfo;
    } catch (error) {
      console.error('[RoutingManager] 添加路径失败:', error);
      throw error;
    }
  }

  /**
   * 删除路径
   */
  removeRoute(routeId: string): void {
    try {
      const route = this.routes.get(routeId);
      if (!route) {
        console.warn(`[RoutingManager] 路径不存在: ${routeId}`);
        return;
      }

      // 从地图中移除要素
      const features = this.routeSource.getFeatures();
      const routeFeatures = features.filter(f => f.get('routeId') === routeId);
      routeFeatures.forEach(feature => {
        this.routeSource.removeFeature(feature);
      });

      // 从存储中删除
      this.routes.delete(routeId);

      // 如果正在导航此路径，停止导航
      if (this.navigationState.currentRouteId === routeId) {
        this.stopNavigation();
      }

      // 触发事件
      this.emitEvent('route-deleted', { route });

      console.log(`[RoutingManager] 路径已删除: ${routeId}`);
    } catch (error) {
      console.error('[RoutingManager] 删除路径失败:', error);
      throw error;
    }
  }

  /**
   * 获取路径信息
   */
  getRoute(routeId: string): RouteInfo | null {
    return this.routes.get(routeId) || null;
  }

  /**
   * 获取所有路径
   */
  getAllRoutes(): RouteInfo[] {
    return Array.from(this.routes.values());
  }

  /**
   * 清除所有路径
   */
  clearRoutes(): void {
    try {
      // 停止导航
      this.stopNavigation();

      // 清除地图要素
      this.routeSource.clear();

      // 清除存储
      this.routes.clear();

      console.log('[RoutingManager] 所有路径已清除');
    } catch (error) {
      console.error('[RoutingManager] 清除路径失败:', error);
      throw error;
    }
  }

  /**
   * 开始导航
   */
  startNavigation(routeId: string, startPosition?: [number, number]): void {
    try {
      const route = this.routes.get(routeId);
      if (!route) {
        throw new Error(`路径不存在: ${routeId}`);
      }

      // 更新导航状态
      this.navigationState = {
        isNavigating: true,
        currentRouteId: routeId,
        currentPosition: startPosition,
        currentInstructionIndex: 0,
        remainingDistance: route.distance,
        remainingTime: route.duration,
        startTime: new Date(),
        offRouteThreshold: 50
      };

      // 触发事件
      this.emitEvent('navigation-started', {
        route,
        navigationState: this.navigationState
      });

      console.log(`[RoutingManager] 导航已开始: ${routeId}`);
    } catch (error) {
      console.error('[RoutingManager] 开始导航失败:', error);
      throw error;
    }
  }

  /**
   * 停止导航
   */
  stopNavigation(): void {
    if (!this.navigationState.isNavigating) {
      return;
    }

    const currentRoute = this.navigationState.currentRouteId
      ? this.routes.get(this.navigationState.currentRouteId)
      : undefined;

    this.navigationState.isNavigating = false;
    this.navigationState.currentRouteId = undefined;

    // 触发事件
    this.emitEvent('navigation-ended', {
      route: currentRoute,
      navigationState: this.navigationState
    });

    console.log('[RoutingManager] 导航已停止');
  }

  /**
   * 暂停导航
   */
  pauseNavigation(): void {
    if (!this.navigationState.isNavigating) {
      return;
    }

    // 触发事件
    this.emitEvent('navigation-paused', {
      navigationState: this.navigationState
    });

    console.log('[RoutingManager] 导航已暂停');
  }

  /**
   * 恢复导航
   */
  resumeNavigation(): void {
    if (!this.navigationState.isNavigating) {
      return;
    }

    // 触发事件
    this.emitEvent('navigation-resumed', {
      navigationState: this.navigationState
    });

    console.log('[RoutingManager] 导航已恢复');
  }

  /**
   * 更新当前位置
   */
  updatePosition(position: [number, number]): void {
    if (!this.navigationState.isNavigating || !this.navigationState.currentRouteId) {
      return;
    }

    const previousPosition = this.navigationState.currentPosition;
    this.navigationState.currentPosition = position;

    // 检查是否偏离路径
    this.checkOffRoute(position);

    // 更新剩余距离和时间
    this.updateRemainingDistanceAndTime(position);

    // 检查是否到达途经点或目的地
    this.checkWaypointReached(position);
  }

  /**
   * 播放路径动画
   */
  playRouteAnimation(routeId: string, options: RouteAnimationOptions = {}): void {
    const route = this.routes.get(routeId);
    if (!route) {
      console.warn(`[RoutingManager] 路径不存在: ${routeId}`);
      return;
    }

    const {
      duration = 3000,
      showTrail = true,
      trailColor = '#722ED1',
      marker = { icon: '🚗', size: 20, color: '#722ED1' }
    } = options;

    // 停止现有动画
    this.stopRouteAnimation(routeId);

    // 创建动画标记
    const animationMarker = this.createAnimationMarker(marker);
    this.routeSource.addFeature(animationMarker);

    // 开始动画
    this.startRouteAnimation(route, animationMarker, duration, showTrail, trailColor);
  }

  /**
   * 停止路径动画
   */
  stopRouteAnimation(routeId: string): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 移除动画相关要素
    const features = this.routeSource.getFeatures();
    const animationFeatures = features.filter(f =>
      f.get('routeId') === routeId &&
      (f.get('routeType') === 'animation' || f.get('routeType') === 'trail')
    );

    animationFeatures.forEach(feature => {
      this.routeSource.removeFeature(feature);
    });
  }

  /**
   * 监听路径事件
   */
  on(eventType: RouteEventType, callback: (data: RouteEventData) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * 移除事件监听
   */
  off(eventType: RouteEventType, callback: (data: RouteEventData) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 生成路径ID
   */
  private generateRouteId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 计算路径
   */
  private async calculateRoute(options: RoutingOptions): Promise<{
    geometry: LineString;
    distance: number;
    duration: number;
    instructions: RouteInstruction[];
    bounds: [number, number, number, number];
  }> {
    const { waypoints, profile = 'driving' } = options;

    if (waypoints.length < 2) {
      throw new Error('至少需要两个路径点');
    }

    // 转换坐标到地图投影
    const projectedWaypoints = waypoints.map(coord => fromLonLat(coord));

    // 创建简单的直线路径（实际应用中应该调用路径规划API）
    const lineString = new LineString(projectedWaypoints);

    // 计算距离
    const distance = getLength(lineString);

    // 估算时间（基于不同的出行方式）
    const duration = this.estimateDuration(distance, profile);

    // 生成路径指引
    const instructions = this.generateInstructions(waypoints);

    // 计算边界框
    const bounds = this.calculateBounds(waypoints);

    return {
      geometry: lineString,
      distance,
      duration,
      instructions,
      bounds
    };
  }

  /**
   * 估算行程时间
   */
  private estimateDuration(distance: number, profile: RoutingProfile): number {
    const speedMap = {
      'driving': 50, // 50 km/h
      'walking': 5,  // 5 km/h
      'cycling': 15, // 15 km/h
      'transit': 30, // 30 km/h
      'truck': 40    // 40 km/h
    };

    const speed = speedMap[profile] || 50;
    return (distance / 1000) / speed * 3600; // 转换为秒
  }

  /**
   * 生成路径指引
   */
  private generateInstructions(waypoints: [number, number][]): RouteInstruction[] {
    const instructions: RouteInstruction[] = [];

    // 起点指引
    instructions.push({
      text: '开始导航',
      type: 'depart' as InstructionType,
      distance: 0,
      time: 0,
      coordinate: waypoints[0]
    });

    // 中间点指引
    for (let i = 1; i < waypoints.length - 1; i++) {
      const distance = turf.distance(
        turf.point(waypoints[i - 1]),
        turf.point(waypoints[i]),
        { units: 'meters' }
      );

      instructions.push({
        text: `继续前行 ${Math.round(distance)}米`,
        type: 'straight' as InstructionType,
        distance,
        time: distance / 50 * 3.6, // 假设50km/h
        coordinate: waypoints[i]
      });
    }

    // 终点指引
    const lastDistance = turf.distance(
      turf.point(waypoints[waypoints.length - 2]),
      turf.point(waypoints[waypoints.length - 1]),
      { units: 'meters' }
    );

    instructions.push({
      text: '到达目的地',
      type: 'arrive' as InstructionType,
      distance: lastDistance,
      time: lastDistance / 50 * 3.6,
      coordinate: waypoints[waypoints.length - 1]
    });

    return instructions;
  }

  /**
   * 计算边界框
   */
  private calculateBounds(waypoints: [number, number][]): [number, number, number, number] {
    const line = turf.lineString(waypoints);
    return bbox(line) as [number, number, number, number];
  }

  /**
   * 获取默认路径样式
   */
  private getDefaultRouteStyle(): Style {
    return new Style({
      stroke: new Stroke({
        color: '#722ED1',
        width: 4
      })
    });
  }

  /**
   * 创建路径样式
   */
  private createRouteStyle(styleOptions: any): Style {
    return new Style({
      stroke: new Stroke({
        color: styleOptions.color || '#722ED1',
        width: styleOptions.width || 4,
        lineDash: styleOptions.dashArray
      })
    });
  }

  /**
   * 添加路径标记
   */
  private addRouteMarkers(route: RouteInfo): void {
    const waypoints = route.options.waypoints;

    // 起点标记
    const startMarker = new Feature({
      geometry: new Point(fromLonLat(waypoints[0])),
      routeId: route.id,
      routeType: 'start'
    });

    startMarker.setStyle(new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: '#00ff00' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    }));

    // 终点标记
    const endMarker = new Feature({
      geometry: new Point(fromLonLat(waypoints[waypoints.length - 1])),
      routeId: route.id,
      routeType: 'end'
    });

    endMarker.setStyle(new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: '#ff0000' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    }));

    this.routeSource.addFeatures([startMarker, endMarker]);
  }

  /**
   * 检查是否偏离路径
   */
  private checkOffRoute(position: [number, number]): void {
    if (!this.navigationState.currentRouteId) return;

    const route = this.routes.get(this.navigationState.currentRouteId);
    if (!route) return;

    // 简化的偏离检测：计算到路径的最短距离
    const routeCoords = route.geometry.getCoordinates().map(coord => toLonLat(coord));
    const line = turf.lineString(routeCoords);
    const point = turf.point(position);

    const nearestPoint = turf.nearestPointOnLine(line, point);
    const distance = turf.distance(point, nearestPoint, { units: 'meters' });

    if (distance > this.navigationState.offRouteThreshold) {
      this.emitEvent('off-route', {
        route,
        position,
        navigationState: this.navigationState
      });
    }
  }

  /**
   * 更新剩余距离和时间
   */
  private updateRemainingDistanceAndTime(position: [number, number]): void {
    if (!this.navigationState.currentRouteId) return;

    const route = this.routes.get(this.navigationState.currentRouteId);
    if (!route) return;

    // 计算到终点的剩余距离
    const endPoint = route.options.waypoints[route.options.waypoints.length - 1];
    const remainingDistance = turf.distance(
      turf.point(position),
      turf.point(endPoint),
      { units: 'meters' }
    );

    // 估算剩余时间
    const profile = route.options.profile || 'driving';
    const remainingTime = this.estimateDuration(remainingDistance, profile);

    this.navigationState.remainingDistance = remainingDistance;
    this.navigationState.remainingTime = remainingTime;
  }

  /**
   * 检查是否到达途经点
   */
  private checkWaypointReached(position: [number, number]): void {
    if (!this.navigationState.currentRouteId) return;

    const route = this.routes.get(this.navigationState.currentRouteId);
    if (!route) return;

    const waypoints = route.options.waypoints;
    const currentIndex = this.navigationState.currentInstructionIndex;

    if (currentIndex < waypoints.length) {
      const targetWaypoint = waypoints[currentIndex];
      const distance = turf.distance(
        turf.point(position),
        turf.point(targetWaypoint),
        { units: 'meters' }
      );

      // 如果距离小于20米，认为到达途经点
      if (distance < 20) {
        if (currentIndex === waypoints.length - 1) {
          // 到达目的地
          this.emitEvent('destination-reached', {
            route,
            position,
            navigationState: this.navigationState
          });
          this.stopNavigation();
        } else {
          // 到达途经点
          this.navigationState.currentInstructionIndex++;
          this.emitEvent('waypoint-reached', {
            route,
            position,
            navigationState: this.navigationState
          });
        }
      }
    }
  }

  /**
   * 创建动画标记
   */
  private createAnimationMarker(markerOptions: any): Feature {
    const marker = new Feature({
      geometry: new Point([0, 0]), // 初始位置
      routeType: 'animation'
    });

    marker.setStyle(new Style({
      image: new Circle({
        radius: markerOptions.size || 10,
        fill: new Fill({ color: markerOptions.color || '#722ED1' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    }));

    return marker;
  }

  /**
   * 开始路径动画
   */
  private startRouteAnimation(
    route: RouteInfo,
    marker: Feature,
    duration: number,
    showTrail: boolean,
    trailColor: string
  ): void {
    const routeCoords = route.geometry.getCoordinates();
    const startTime = Date.now();
    const totalDistance = route.distance;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 计算当前位置
      const currentDistance = progress * totalDistance;
      const routeLine = turf.lineString(routeCoords.map(coord => toLonLat(coord)));
      const currentPoint = along(routeLine, currentDistance / 1000, { units: 'kilometers' });

      // 更新标记位置
      const markerGeometry = marker.getGeometry() as Point;
      markerGeometry.setCoordinates(fromLonLat(currentPoint.geometry.coordinates));

      // 添加轨迹点（如果启用）
      if (showTrail && progress > 0) {
        const trailPoint = new Feature({
          geometry: new Point(fromLonLat(currentPoint.geometry.coordinates)),
          routeId: route.id,
          routeType: 'trail'
        });

        trailPoint.setStyle(new Style({
          image: new Circle({
            radius: 2,
            fill: new Fill({ color: trailColor })
          })
        }));

        this.routeSource.addFeature(trailPoint);
      }

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * 触发事件
   */
  private emitEvent(type: RouteEventType, data: Partial<RouteEventData>): void {
    const eventData: RouteEventData = {
      type,
      timestamp: new Date(),
      ...data
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error(`[RoutingManager] 事件回调执行失败 (${type}):`, error);
        }
      });
    }
  }
}

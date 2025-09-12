/**
 * LDesignMap 核心地图类
 * 基于 OpenLayers 的通用地图插件主类
 * 提供框架无关的地图功能和简洁的 API 接口
 */

import { Map as OLMap, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';
import { fromLonLat, transformExtent } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';
import type { Extent } from 'ol/extent';

import type {
  MapConfig,
  MapViewState,
  MapSize,
  MapOperationOptions,
  ZoomOptions,
  PanOptions,
  FitOptions,
  IMapInstance
} from '../types';
import { MapConfigManager } from './MapConfig';
import { EventManager } from '../managers/EventManager';
import { LayerManager } from '../managers/LayerManager';
import { MarkerManager } from '../managers/MarkerManager';
import { ControlManager } from '../managers/ControlManager';
import { StyleManager } from '../managers/StyleManager';
import { RoutingManager } from '../managers/RoutingManager';
import { GeofenceManager } from '../managers/GeofenceManager';
import { HeatmapManager } from '../managers/HeatmapManager';
import { ThemeManager } from '../themes/ThemeManager';

/**
 * LDesignMap 主类
 * 封装 OpenLayers 地图功能，提供简洁易用的 API
 */
export class LDesignMap implements IMapInstance {
  private olMap: OLMap | null = null;
  private configManager: MapConfigManager;
  private container: HTMLElement | null = null;
  private initialized = false;
  private destroyed = false;

  // 管理器实例
  private eventManager: EventManager | null = null;
  private layerManager: LayerManager | null = null;
  private markerManager: MarkerManager | null = null;
  private controlManager: ControlManager | null = null;
  private styleManager: StyleManager | null = null;
  private themeManager: ThemeManager | null = null;

  // 新增功能管理器
  private routingManager: RoutingManager | null = null;
  private geofenceManager: GeofenceManager | null = null;
  private heatmapManager: HeatmapManager | null = null;

  /**
   * 构造函数
   * @param config 地图配置
   */
  constructor(config: MapConfig) {
    this.configManager = new MapConfigManager(config);

    // 立即初始化
    this.init();
  }

  /**
   * 初始化地图
   * @private
   */
  private async init(): Promise<void> {
    try {
      // 验证容器
      this.container = this.configManager.getContainerElement();
      if (!this.container || !this.configManager.isContainerValid()) {
        const error = '[LDesignMap] 地图容器不存在或无效';
        console.error(error);
        throw new Error(error);
      }

      // 获取配置
      const config = this.configManager.getConfig();

      // 创建地图视图
      const view = new View({
        center: fromLonLat(config.center),
        zoom: config.zoom,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
        rotation: config.rotation,
        projection: config.projection,
        extent: config.extent ? transformExtent(config.extent, 'EPSG:4326', config.projection) : undefined
      });

      // 创建地图实例
      this.olMap = new OLMap({
        target: this.container,
        view: view,
        controls: this.createControls(),
        interactions: this.createInteractions()
      });

      // 应用地图样式
      this.applyMapStyle();

      // 绑定事件监听器
      this.bindEventListeners();

      // 初始化管理器
      this.initializeManagers();

      this.initialized = true;

      // 触发初始化完成事件
      this.dispatchEvent('load', {
        type: 'load',
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('[LDesignMap] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 创建地图控件
   * @private
   */
  private createControls() {
    const config = this.configManager.getControlConfig();
    const controls = defaultControls({
      zoom: config.zoom,
      attribution: config.attribution,
      rotate: config.rotate
    });

    // 根据配置添加其他控件
    // TODO: 实现其他控件的添加逻辑

    return controls;
  }

  /**
   * 创建地图交互
   * @private
   */
  private createInteractions() {
    const config = this.configManager.getInteractionConfig();
    const interactions = defaultInteractions({
      dragPan: config.dragPan,
      mouseWheelZoom: config.mouseWheelZoom,
      doubleClickZoom: config.doubleClickZoom,
      keyboard: config.keyboard,
      dragRotate: config.dragRotate,
      dragZoom: config.dragZoom
    });

    return interactions;
  }

  /**
   * 初始化管理器
   * @private
   */
  private initializeManagers(): void {
    if (!this.olMap) return;

    // 创建管理器实例
    this.eventManager = new EventManager(this.olMap);
    this.layerManager = new LayerManager(this.olMap);
    this.markerManager = new MarkerManager(this.olMap);
    this.controlManager = new ControlManager(this.olMap);
    this.styleManager = new StyleManager(this.olMap);
    this.themeManager = new ThemeManager();

    // 创建新增功能管理器
    this.routingManager = new RoutingManager(this.olMap);
    this.geofenceManager = new GeofenceManager(this.olMap);
    this.heatmapManager = new HeatmapManager(this.olMap);

    // 应用初始主题
    const currentConfig = this.configManager.getConfig();
    if (currentConfig.theme && currentConfig.theme !== 'default') {
      this.themeManager.setTheme(currentConfig.theme);
    }
  }

  /**
   * 应用地图样式
   * @private
   */
  private applyMapStyle(): void {
    if (!this.container) return;

    const style = this.configManager.getMapStyle();

    // 应用基础样式
    this.container.style.backgroundColor = style.backgroundColor || '';
    this.container.style.borderRadius = `${style.borderRadius || 0}px`;
    this.container.style.boxShadow = style.boxShadow || '';

    // 应用边框样式
    if (style.border) {
      this.container.style.border = `${style.border.width || 0}px ${style.border.style || 'solid'} ${style.border.color || 'transparent'}`;
    }

    // 应用 CSS 类名
    if (style.className) {
      this.container.classList.add(style.className);
    }
  }

  /**
   * 绑定事件监听器
   * @private
   */
  private bindEventListeners(): void {
    if (!this.olMap) return;

    // 地图点击事件
    this.olMap.on('click', (event) => {
      this.dispatchEvent('click', {
        type: 'click',
        timestamp: Date.now(),
        coordinate: event.coordinate,
        pixel: event.pixel,
        originalEvent: event.originalEvent
      });
    });

    // 地图移动事件
    this.olMap.getView().on('change:center', () => {
      this.dispatchEvent('move', {
        type: 'move',
        timestamp: Date.now(),
        center: this.getCenter(),
        zoom: this.getZoom(),
        rotation: this.getRotation()
      });
    });

    // 地图缩放事件
    this.olMap.getView().on('change:resolution', () => {
      this.dispatchEvent('zoom', {
        type: 'zoom',
        timestamp: Date.now(),
        center: this.getCenter(),
        zoom: this.getZoom(),
        rotation: this.getRotation()
      });
    });

    // 地图旋转事件
    this.olMap.getView().on('change:rotation', () => {
      this.dispatchEvent('rotate', {
        type: 'rotate',
        timestamp: Date.now(),
        center: this.getCenter(),
        zoom: this.getZoom(),
        rotation: this.getRotation()
      });
    });
  }

  /**
   * 分发事件
   * @private
   */
  private dispatchEvent(type: string, data: any): void {
    // TODO: 实现事件分发逻辑
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LDesignMap] Event: ${type}`, data);
    }
  }

  /**
   * 获取地图配置
   */
  getConfig(): MapConfig {
    return this.configManager.getOriginalConfig();
  }

  /**
   * 获取地图视图状态
   */
  getViewState(): MapViewState {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const view = this.olMap.getView();
    return {
      center: this.getCenter(),
      zoom: this.getZoom(),
      rotation: this.getRotation(),
      extent: view.calculateExtent(),
      projection: view.getProjection().getCode()
    };
  }

  /**
   * 获取地图尺寸
   */
  getSize(): MapSize {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const size = this.olMap.getSize();
    return {
      width: size ? size[0] : 0,
      height: size ? size[1] : 0
    };
  }

  /**
   * 获取地图中心点
   */
  getCenter(): Coordinate {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const center = this.olMap.getView().getCenter();
    return center ? center : [0, 0];
  }

  /**
   * 获取地图缩放级别
   */
  getZoom(): number {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    return this.olMap.getView().getZoom() || 0;
  }

  /**
   * 获取地图旋转角度
   */
  getRotation(): number {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    return this.olMap.getView().getRotation();
  }

  /**
   * 设置地图中心点
   */
  setCenter(center: Coordinate, options?: MapOperationOptions): void {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const view = this.olMap.getView();
    const transformedCenter = fromLonLat(center);

    if (options?.duration) {
      view.animate({
        center: transformedCenter,
        duration: options.duration,
        easing: options.easing
      });
    } else {
      view.setCenter(transformedCenter);
    }
  }

  /**
   * 设置地图缩放级别
   */
  setZoom(zoom: number, options?: ZoomOptions): void {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const view = this.olMap.getView();

    if (options?.duration) {
      const animateOptions: any = {
        zoom: zoom,
        duration: options.duration,
        easing: options.easing
      };

      if (options.center) {
        animateOptions.center = fromLonLat(options.center);
      }

      view.animate(animateOptions);
    } else {
      view.setZoom(zoom);
    }
  }

  /**
   * 缩放到指定范围
   */
  fitExtent(extent: Extent, options?: FitOptions): void {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const view = this.olMap.getView();
    const transformedExtent = transformExtent(extent, 'EPSG:4326', view.getProjection());

    view.fit(transformedExtent, {
      duration: options?.duration,
      padding: options?.padding,
      maxZoom: options?.maxZoom,
      minZoom: options?.minZoom
    });
  }

  /**
   * 平移地图
   */
  pan(delta: [number, number], options?: PanOptions): void {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const view = this.olMap.getView();
    const currentCenter = view.getCenter();
    if (!currentCenter) return;

    const newCenter: Coordinate = [
      currentCenter[0] + delta[0],
      currentCenter[1] + delta[1]
    ];

    if (options?.duration) {
      view.animate({
        center: newCenter,
        duration: options.duration,
        easing: options.easing
      });
    } else {
      view.setCenter(newCenter);
    }
  }

  /**
   * 旋转地图
   */
  rotate(rotation: number, options?: MapOperationOptions): void {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const view = this.olMap.getView();

    if (options?.duration) {
      view.animate({
        rotation: rotation,
        duration: options.duration,
        easing: options.easing
      });
    } else {
      view.setRotation(rotation);
    }
  }

  /**
   * 刷新地图
   */
  refresh(): void {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    this.olMap.updateSize();
    this.olMap.renderSync();
  }

  /**
   * 销毁地图实例
   */
  destroy(): void {
    if (this.destroyed) return;

    // 清理新增功能管理器
    if (this.routingManager) {
      this.routingManager.clearRoutes();
      this.routingManager = null;
    }

    if (this.geofenceManager) {
      this.geofenceManager.stopLocationTracking();
      this.geofenceManager.clearGeofences();
      this.geofenceManager = null;
    }

    if (this.heatmapManager) {
      this.heatmapManager.destroy();
      this.heatmapManager = null;
    }

    // 清理原有管理器
    this.eventManager = null;
    this.layerManager = null;
    this.markerManager = null;
    this.controlManager = null;
    this.styleManager = null;
    this.themeManager = null;

    if (this.olMap) {
      this.olMap.setTarget(undefined);
      this.olMap = null;
    }

    this.container = null;
    this.initialized = false;
    this.destroyed = true;

    this.dispatchEvent('destroy', {
      type: 'destroy',
      timestamp: Date.now()
    });
  }

  /**
   * 检查地图是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized && !this.destroyed;
  }

  /**
   * 检查地图是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * 获取 OpenLayers 地图实例（用于高级操作）
   */
  getOLMap(): OLMap | null {
    return this.olMap;
  }

  /**
   * 获取事件管理器
   */
  getEventManager(): EventManager {
    if (!this.eventManager) {
      throw new Error('地图未初始化，无法获取事件管理器');
    }
    return this.eventManager;
  }

  /**
   * 获取图层管理器
   */
  getLayerManager(): LayerManager {
    if (!this.layerManager) {
      throw new Error('地图未初始化，无法获取图层管理器');
    }
    return this.layerManager;
  }

  /**
   * 获取标记管理器
   */
  getMarkerManager(): MarkerManager {
    if (!this.markerManager) {
      throw new Error('地图未初始化，无法获取标记管理器');
    }
    return this.markerManager;
  }

  /**
   * 获取控件管理器
   */
  getControlManager(): ControlManager {
    if (!this.controlManager) {
      throw new Error('地图未初始化，无法获取控件管理器');
    }
    return this.controlManager;
  }

  /**
   * 获取样式管理器
   */
  getStyleManager(): StyleManager {
    if (!this.styleManager) {
      throw new Error('地图未初始化，无法获取样式管理器');
    }
    return this.styleManager;
  }

  /**
   * 获取主题管理器
   */
  getThemeManager(): ThemeManager {
    if (!this.themeManager) {
      throw new Error('地图未初始化，无法获取主题管理器');
    }
    return this.themeManager;
  }

  /**
   * 获取路径规划管理器
   */
  getRoutingManager(): RoutingManager {
    if (!this.routingManager) {
      throw new Error('地图未初始化，无法获取路径规划管理器');
    }
    return this.routingManager;
  }

  /**
   * 获取地理围栏管理器
   */
  getGeofenceManager(): GeofenceManager {
    if (!this.geofenceManager) {
      throw new Error('地图未初始化，无法获取地理围栏管理器');
    }
    return this.geofenceManager;
  }

  /**
   * 获取热力图管理器
   */
  getHeatmapManager(): HeatmapManager {
    if (!this.heatmapManager) {
      throw new Error('地图未初始化，无法获取热力图管理器');
    }
    return this.heatmapManager;
  }

  /**
   * 设置主题
   * @param themeName 主题名称
   */
  setTheme(themeName: string): boolean {
    if (!this.themeManager) {
      throw new Error('地图未初始化，无法设置主题');
    }
    return this.themeManager.setTheme(themeName);
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string {
    if (!this.themeManager) {
      return 'default';
    }
    return this.themeManager.getCurrentTheme();
  }



  // 高级功能便捷方法

  /**
   * 加载 GeoJSON 数据
   * @param config GeoJSON 配置
   */
  loadGeoJSON(config: {
    id: string
    name: string
    data: any
    style?: any
  }): void {
    if (!this.layerManager) {
      throw new Error('LayerManager 未初始化');
    }
    this.layerManager.addGeoJSONLayer(config);
  }

  /**
   * 添加路径
   * @param config 路径配置
   */
  addRoute(config: {
    id: string
    name: string
    coordinates: number[][]
    style?: any
  }): void {
    if (!this.layerManager) {
      throw new Error('LayerManager 未初始化');
    }
    this.layerManager.addRouteLayer(config);
  }

  /**
   * 显示边界范围
   * @param config 边界配置
   */
  showBounds(config: {
    id: string
    name: string
    bounds: number[]
    style?: any
  }): void {
    if (!this.layerManager) {
      throw new Error('LayerManager 未初始化');
    }
    this.layerManager.addBoundsLayer(config);
  }

  /**
   * 适应到指定范围
   * @param bounds 边界范围 [minX, minY, maxX, maxY]
   * @param options 选项
   */
  fitToBounds(bounds: number[], options?: {
    padding?: number[]
    duration?: number
  }): void {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    try {
      const view = this.olMap.getView();
      const extent = bounds;

      view.fit(extent, {
        padding: options?.padding || [20, 20, 20, 20],
        duration: options?.duration || 1000,
        maxZoom: 18
      });

      console.log(`[LDesignMap] 已适应到范围: ${bounds.join(', ')}`);
    } catch (error) {
      console.error('[LDesignMap] 适应范围失败:', error);
      throw error;
    }
  }

  /**
   * 添加随机标记
   * @param options 选项
   */
  addRandomMarker(options?: {
    center?: number[]
    radius?: number
    title?: string
  }): string {
    if (!this.markerManager) {
      throw new Error('MarkerManager 未初始化');
    }

    const center = options?.center || [116.404, 39.915];
    const radius = options?.radius || 0.1;

    // 生成随机坐标
    const randomLng = center[0] + (Math.random() - 0.5) * radius;
    const randomLat = center[1] + (Math.random() - 0.5) * radius;

    const markerId = `random-marker-${Date.now()}`;
    const marker = {
      id: markerId,
      coordinate: [randomLng, randomLat],
      title: options?.title || `随机标记`,
      description: `坐标: ${randomLng.toFixed(4)}, ${randomLat.toFixed(4)}`,
      popup: {
        content: `<h3>${options?.title || '随机标记'}</h3><p>坐标: ${randomLng.toFixed(4)}, ${randomLat.toFixed(4)}</p>`
      }
    };

    this.markerManager.addMarker(marker);
    return markerId;
  }

  /**
   * 获取当前地图边界
   * @returns 边界范围 [minX, minY, maxX, maxY]
   */
  getBounds(): number[] {
    if (!this.olMap) {
      throw new Error('地图未初始化');
    }

    const view = this.olMap.getView();
    const extent = view.calculateExtent(this.olMap.getSize());
    return extent;
  }


}

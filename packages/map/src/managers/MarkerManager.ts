/**
 * 标记管理器
 * 负责管理地图的所有标记点和弹窗
 */

import { Map as OLMap, Overlay } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, Cluster } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon, Text, Fill, Stroke, Circle } from 'ol/style';
import { fromLonLat } from 'ol/proj';

import type {
  MarkerConfig,
  MarkerState,
  MarkerOperationOptions,
  IMarkerManager,
  PopupConfig,
  MarkerClusterConfig,
  MarkerEventData
} from '../types';
import type { Coordinate } from 'ol/coordinate';

/**
 * 标记管理器实现类
 * 提供完整的标记管理功能
 */
export class MarkerManager implements IMarkerManager {
  private olMap: OLMap;
  private markers: Map<string, { config: MarkerConfig; feature: Feature; state: MarkerState }> = new Map();
  private popups: Map<string, Overlay> = new Map();
  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer<VectorSource>;
  private clusterSource?: Cluster;
  private clusterLayer?: VectorLayer<Cluster>;
  private clusterConfig?: MarkerClusterConfig;

  /**
   * 构造函数
   * @param olMap OpenLayers 地图实例
   */
  constructor(olMap: OLMap) {
    this.olMap = olMap;
    this.initializeVectorLayer();
  }

  /**
   * 初始化矢量图层
   * @private
   */
  private initializeVectorLayer(): void {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      zIndex: 1000 // 确保标记在其他图层之上
    });

    this.olMap.addLayer(this.vectorLayer);
  }

  /**
   * 添加标记
   * @param config 标记配置
   * @returns 标记 ID
   */
  addMarker(config: MarkerConfig): string {
    try {
      // 检查标记是否已存在，如果存在则先移除
      if (this.markers.has(config.id)) {
        console.warn(`[MarkerManager] 标记 ${config.id} 已存在，将先移除旧标记`);
        this.removeMarker(config.id);
      }

      // 创建要素
      const feature = this.createFeature(config);

      // 添加到数据源
      this.vectorSource.addFeature(feature);

      // 创建标记状态
      const state: MarkerState = {
        id: config.id,
        visible: true,
        selected: false,
        hovered: false,
        dragging: false,
        coordinate: config.coordinate,
        popupOpen: false
      };

      // 保存标记信息
      this.markers.set(config.id, {
        config,
        feature,
        state
      });

      // 如果有弹窗配置，创建弹窗
      if (config.popup) {
        this.createPopup(config.id, config.popup);
      }

      return config.id;
    } catch (error) {
      console.error(`[MarkerManager] 添加标记失败:`, error);
      throw error;
    }
  }

  /**
   * 批量添加标记
   * @param configs 标记配置数组
   * @returns 标记 ID 数组
   */
  addMarkers(configs: MarkerConfig[]): string[] {
    const ids: string[] = [];

    for (const config of configs) {
      try {
        const id = this.addMarker(config);
        ids.push(id);
      } catch (error) {
        console.error(`[MarkerManager] 批量添加标记失败:`, error);
      }
    }

    return ids;
  }

  /**
   * 移除标记
   * @param id 标记 ID
   * @returns 是否移除成功
   */
  removeMarker(id: string): boolean {
    const markerInfo = this.markers.get(id);
    if (!markerInfo) {
      return false;
    }

    try {
      // 从数据源中移除要素
      this.vectorSource.removeFeature(markerInfo.feature);

      // 移除弹窗
      this.closePopup(id);
      const popup = this.popups.get(id);
      if (popup) {
        this.olMap.removeOverlay(popup);
        this.popups.delete(id);
      }

      // 从管理器中移除
      this.markers.delete(id);

      return true;
    } catch (error) {
      console.error(`[MarkerManager] 移除标记失败:`, error);
      return false;
    }
  }

  /**
   * 批量移除标记
   * @param ids 标记 ID 数组
   * @returns 是否全部移除成功
   */
  removeMarkers(ids: string[]): boolean {
    let allSuccess = true;

    for (const id of ids) {
      if (!this.removeMarker(id)) {
        allSuccess = false;
      }
    }

    return allSuccess;
  }

  /**
   * 获取标记配置
   * @param id 标记 ID
   * @returns 标记配置或 null
   */
  getMarker(id: string): MarkerConfig | null {
    const markerInfo = this.markers.get(id);
    return markerInfo ? { ...markerInfo.config } : null;
  }

  /**
   * 获取所有标记配置
   * @returns 标记配置数组
   */
  getAllMarkers(): MarkerConfig[] {
    return Array.from(this.markers.values()).map(info => ({ ...info.config }));
  }

  /**
   * 根据条件查找标记
   * @param predicate 查找条件函数
   * @returns 匹配的标记配置数组
   */
  findMarkers(predicate: (marker: MarkerConfig) => boolean): MarkerConfig[] {
    const results: MarkerConfig[] = [];

    for (const markerInfo of this.markers.values()) {
      if (predicate(markerInfo.config)) {
        results.push({ ...markerInfo.config });
      }
    }

    return results;
  }

  /**
   * 显示标记
   * @param id 标记 ID
   * @param options 操作选项
   */
  showMarker(id: string, options?: MarkerOperationOptions): void {
    const markerInfo = this.markers.get(id);
    if (!markerInfo) {
      return;
    }

    markerInfo.feature.setStyle(this.createMarkerStyle(markerInfo.config));
    markerInfo.state.visible = true;
  }

  /**
   * 隐藏标记
   * @param id 标记 ID
   * @param options 操作选项
   */
  hideMarker(id: string, options?: MarkerOperationOptions): void {
    const markerInfo = this.markers.get(id);
    if (!markerInfo) {
      return;
    }

    markerInfo.feature.setStyle(null);
    markerInfo.state.visible = false;
  }

  /**
   * 更新标记
   * @param id 标记 ID
   * @param config 部分标记配置
   * @returns 是否更新成功
   */
  updateMarker(id: string, config: Partial<MarkerConfig>): boolean {
    const markerInfo = this.markers.get(id);
    if (!markerInfo) {
      return false;
    }

    try {
      // 更新配置
      Object.assign(markerInfo.config, config);

      // 更新坐标
      if (config.coordinate) {
        const geometry = markerInfo.feature.getGeometry() as Point;
        geometry.setCoordinates(fromLonLat(config.coordinate));
        markerInfo.state.coordinate = config.coordinate;
      }

      // 更新样式
      markerInfo.feature.setStyle(this.createMarkerStyle(markerInfo.config));

      return true;
    } catch (error) {
      console.error(`[MarkerManager] 更新标记失败:`, error);
      return false;
    }
  }

  /**
   * 移动标记
   * @param id 标记 ID
   * @param coordinate 新坐标
   * @param options 操作选项
   */
  moveMarker(id: string, coordinate: Coordinate, options?: MarkerOperationOptions): void {
    this.updateMarker(id, { coordinate });
  }

  /**
   * 获取标记状态
   * @param id 标记 ID
   * @returns 标记状态或 null
   */
  getMarkerState(id: string): MarkerState | null {
    const markerInfo = this.markers.get(id);
    return markerInfo ? { ...markerInfo.state } : null;
  }

  /**
   * 选择标记
   * @param id 标记 ID
   */
  selectMarker(id: string): void {
    const markerInfo = this.markers.get(id);
    if (!markerInfo) {
      return;
    }

    markerInfo.state.selected = true;
    // 更新样式以显示选中状态
    markerInfo.feature.setStyle(this.createMarkerStyle(markerInfo.config, true));
  }

  /**
   * 取消选择标记
   * @param id 标记 ID
   */
  deselectMarker(id: string): void {
    const markerInfo = this.markers.get(id);
    if (!markerInfo) {
      return;
    }

    markerInfo.state.selected = false;
    // 恢复正常样式
    markerInfo.feature.setStyle(this.createMarkerStyle(markerInfo.config, false));
  }

  /**
   * 取消选择所有标记
   */
  deselectAll(): void {
    for (const [id] of this.markers) {
      this.deselectMarker(id);
    }
  }

  /**
   * 清空所有标记
   */
  clearMarkers(): void {
    for (const [id] of this.markers) {
      this.removeMarker(id);
    }
  }

  /**
   * 设置聚类配置
   * @param config 聚类配置
   */
  setClusterConfig(config: MarkerClusterConfig): void {
    this.clusterConfig = config;

    if (config.enabled) {
      this.enableClustering();
    } else {
      this.disableClustering();
    }
  }

  /**
   * 获取聚类配置
   * @returns 聚类配置
   */
  getClusterConfig(): MarkerClusterConfig {
    return this.clusterConfig || { enabled: false };
  }

  /**
   * 打开弹窗
   * @param markerId 标记 ID
   * @param config 弹窗配置（可选）
   */
  openPopup(markerId: string, config?: PopupConfig): void {
    const markerInfo = this.markers.get(markerId);
    if (!markerInfo) {
      return;
    }

    const popupConfig = config || markerInfo.config.popup;
    if (!popupConfig) {
      return;
    }

    let popup = this.popups.get(markerId);
    if (!popup) {
      popup = this.createPopup(markerId, popupConfig);
    }

    popup.setPosition(fromLonLat(markerInfo.state.coordinate));
    markerInfo.state.popupOpen = true;
  }

  /**
   * 关闭弹窗
   * @param markerId 标记 ID
   */
  closePopup(markerId: string): void {
    const popup = this.popups.get(markerId);
    if (popup) {
      popup.setPosition(undefined);
    }

    const markerInfo = this.markers.get(markerId);
    if (markerInfo) {
      markerInfo.state.popupOpen = false;
    }
  }

  /**
   * 关闭所有弹窗
   */
  closeAllPopups(): void {
    for (const [markerId] of this.popups) {
      this.closePopup(markerId);
    }
  }

  /**
   * 创建要素
   * @param config 标记配置
   * @returns OpenLayers 要素
   * @private
   */
  private createFeature(config: MarkerConfig): Feature {
    // 处理坐标参数，支持 coordinate 和 position 两种格式
    let coordinate = config.coordinate;
    if (!coordinate && (config as any).position) {
      coordinate = (config as any).position;
    }

    // 验证坐标格式
    if (!coordinate || !Array.isArray(coordinate) || coordinate.length < 2) {
      throw new Error(`无效的坐标格式: ${JSON.stringify(coordinate)}`);
    }

    const geometry = new Point(fromLonLat(coordinate));
    const feature = new Feature({
      geometry,
      id: config.id,
      name: config.title,
      description: config.description,
      ...config.properties
    });

    feature.setStyle(this.createMarkerStyle(config));
    return feature;
  }

  /**
   * 创建标记样式
   * @param config 标记配置
   * @param selected 是否选中
   * @returns OpenLayers 样式
   * @private
   */
  private createMarkerStyle(config: MarkerConfig, selected = false): Style {
    if (config.style) {
      return config.style as Style;
    }

    const styleConfig: any = {
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: '#ff0000' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    };

    // 如果有图标配置
    if (config.icon) {
      styleConfig.image = new Icon({
        src: config.icon.src,
        size: config.icon.size,
        anchor: config.icon.anchor || [0.5, 1],
        offset: config.icon.offset,
        color: config.icon.color,
        scale: config.scale || 1,
        rotation: config.rotation || 0,
        opacity: config.opacity || 1
      });
    }

    // 如果有文本
    if (config.title) {
      styleConfig.text = new Text({
        text: config.title,
        offsetY: -20,
        fill: new Fill({ color: '#000000' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      });
    }

    // 选中状态的样式调整
    if (selected) {
      if (styleConfig.image instanceof Circle) {
        styleConfig.image.getStroke().setColor('#0000ff');
        styleConfig.image.getStroke().setWidth(3);
      }
    }

    return new Style(styleConfig);
  }

  /**
   * 创建弹窗
   * @param markerId 标记 ID
   * @param config 弹窗配置
   * @returns OpenLayers 覆盖物
   * @private
   */
  private createPopup(markerId: string, config: PopupConfig): Overlay {
    // 创建弹窗元素
    const element = document.createElement('div');
    element.className = `ldesign-popup ${config.className || ''}`;

    if (typeof config.content === 'string') {
      element.innerHTML = config.content;
    } else {
      element.appendChild(config.content);
    }

    // 应用样式
    if (config.style) {
      Object.assign(element.style, config.style);
    }

    // 创建覆盖物
    const overlay = new Overlay({
      element: element,
      positioning: config.positioning || 'bottom-center',
      offset: config.offset || [0, -10],
      stopEvent: false,
      autoPan: true
    });

    this.olMap.addOverlay(overlay);
    this.popups.set(markerId, overlay);

    return overlay;
  }

  /**
   * 启用聚类
   * @private
   */
  private enableClustering(): void {
    if (!this.clusterConfig || this.clusterSource) {
      return;
    }

    this.clusterSource = new Cluster({
      distance: this.clusterConfig.distance || 50,
      minDistance: this.clusterConfig.minDistance || 20,
      source: this.vectorSource
    });

    this.clusterLayer = new VectorLayer({
      source: this.clusterSource,
      style: this.createClusterStyle.bind(this)
    });

    this.olMap.removeLayer(this.vectorLayer);
    this.olMap.addLayer(this.clusterLayer);
  }

  /**
   * 禁用聚类
   * @private
   */
  private disableClustering(): void {
    if (this.clusterLayer) {
      this.olMap.removeLayer(this.clusterLayer);
      this.olMap.addLayer(this.vectorLayer);
      this.clusterSource = undefined;
      this.clusterLayer = undefined;
    }
  }

  /**
   * 创建聚类样式
   * @param feature 聚类要素
   * @returns OpenLayers 样式
   * @private
   */
  private createClusterStyle(feature: Feature): Style {
    const features = feature.get('features');
    const size = features.length;

    if (size === 1) {
      // 单个标记，使用原始样式
      return this.createMarkerStyle(this.markers.get(features[0].get('id'))?.config || {} as MarkerConfig);
    }

    // 聚类样式
    const style = this.clusterConfig?.style;
    const radius = Math.min((size * 2) + 10, 30);

    return new Style({
      image: new Circle({
        radius: radius,
        fill: new Fill({ color: style?.fillColor || '#3399CC' }),
        stroke: new Stroke({
          color: style?.strokeColor || '#ffffff',
          width: style?.strokeWidth || 2
        })
      }),
      text: new Text({
        text: this.clusterConfig?.textFormatter ?
          this.clusterConfig.textFormatter(size) :
          size.toString(),
        fill: new Fill({ color: style?.textColor || '#ffffff' }),
        font: `${style?.textSize || 12}px sans-serif`
      })
    });
  }

  /**
   * 获取标记数量
   * @returns 标记数量
   */
  getMarkerCount(): number {
    return this.markers.size;
  }

  /**
   * 获取所有标记ID
   * @returns 标记ID数组
   */
  getAllMarkerIds(): string[] {
    return Array.from(this.markers.keys());
  }

  /**
   * 检查标记是否存在
   * @param id 标记ID
   * @returns 是否存在
   */
  hasMarker(id: string): boolean {
    return this.markers.has(id);
  }

  /**
   * 获取可见标记数量
   * @returns 可见标记数量
   */
  getVisibleMarkerCount(): number {
    let count = 0;
    this.markerStates.forEach(state => {
      if (state.visible) {
        count++;
      }
    });
    return count;
  }

  /**
   * 批量设置标记可见性
   * @param markerIds 标记ID数组
   * @param visible 是否可见
   */
  setMarkersVisibility(markerIds: string[], visible: boolean): void {
    markerIds.forEach(id => {
      if (this.markers.has(id)) {
        this.setMarkerVisibility(id, visible);
      }
    });
  }

  /**
   * 获取标记边界
   * @param markerIds 标记ID数组，如果为空则获取所有标记的边界
   * @returns 边界范围 [minX, minY, maxX, maxY]
   */
  getMarkersBounds(markerIds?: string[]): number[] | null {
    const markerInfos = markerIds ?
      markerIds.map(id => this.markers.get(id)).filter(Boolean) :
      Array.from(this.markers.values());

    if (markerInfos.length === 0) {
      return null;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    markerInfos.forEach(markerInfo => {
      const coord = markerInfo!.config.coordinate;
      if (coord && coord.length >= 2) {
        minX = Math.min(minX, coord[0]);
        minY = Math.min(minY, coord[1]);
        maxX = Math.max(maxX, coord[0]);
        maxY = Math.max(maxY, coord[1]);
      }
    });

    return [minX, minY, maxX, maxY];
  }
}

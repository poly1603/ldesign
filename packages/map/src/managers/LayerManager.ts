/**
 * 图层管理器
 * 负责管理地图的所有图层操作
 */

import { Map as OLMap } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer, Heatmap as HeatmapLayer } from 'ol/layer';
import { OSM, XYZ, TileWMS, WMTS, Vector as VectorSource, ImageWMS } from 'ol/source';
import { GeoJSON, KML, GPX, WKT } from 'ol/format';
import { Style, Fill, Stroke, Circle } from 'ol/style';

import { LayerType } from '../types';
import type {
  LayerConfig,
  LayerState,
  LayerOperationOptions,
  ILayerManager,
  TileLayerConfig,
  WMSLayerConfig,
  WMTSLayerConfig,
  VectorLayerConfig,
  HeatmapLayerConfig,
  ImageLayerConfig
} from '../types';

/**
 * 图层管理器实现类
 * 提供完整的图层管理功能
 */
export class LayerManager implements ILayerManager {
  private olMap: OLMap;
  private layers: Map<string, { config: LayerConfig; olLayer: any; state: LayerState }> = new Map();

  /**
   * 构造函数
   * @param olMap OpenLayers 地图实例
   */
  constructor(olMap: OLMap) {
    this.olMap = olMap;
  }

  /**
   * 添加图层
   * @param config 图层配置
   * @returns 图层 ID
   */
  async addLayer(config: LayerConfig): Promise<string> {
    try {
      // 检查图层是否已存在，如果存在则先移除
      if (this.layers.has(config.id)) {
        console.warn(`[LayerManager] 图层 ${config.id} 已存在，将先移除旧图层`);
        this.removeLayer(config.id);
      }

      // 创建 OpenLayers 图层
      const olLayer = await this.createOLLayer(config);

      // 设置图层属性
      this.configureLayer(olLayer, config);

      // 添加到地图
      this.olMap.addLayer(olLayer);

      // 创建图层状态
      const state: LayerState = {
        id: config.id,
        visible: config.visible !== false,
        opacity: config.opacity || 1,
        zIndex: config.zIndex || 0,
        loading: false,
        progress: 1,
        error: undefined
      };

      // 保存图层信息
      this.layers.set(config.id, {
        config,
        olLayer,
        state
      });

      return config.id;
    } catch (error) {
      console.error(`[LayerManager] 添加图层失败:`, error);
      throw error;
    }
  }

  /**
   * 移除图层
   * @param id 图层 ID
   * @returns 是否移除成功
   */
  removeLayer(id: string): boolean {
    const layerInfo = this.layers.get(id);
    if (!layerInfo) {
      return false;
    }

    try {
      // 从地图中移除
      this.olMap.removeLayer(layerInfo.olLayer);

      // 从管理器中移除
      this.layers.delete(id);

      return true;
    } catch (error) {
      console.error(`[LayerManager] 移除图层失败:`, error);
      return false;
    }
  }

  /**
   * 获取图层配置
   * @param id 图层 ID
   * @returns 图层配置或 null
   */
  getLayer(id: string): LayerConfig | null {
    const layerInfo = this.layers.get(id);
    return layerInfo ? { ...layerInfo.config } : null;
  }

  /**
   * 获取所有图层配置
   * @returns 图层配置数组
   */
  getAllLayers(): LayerConfig[] {
    return Array.from(this.layers.values()).map(info => ({ ...info.config }));
  }

  /**
   * 显示图层
   * @param id 图层 ID
   * @param options 操作选项
   */
  showLayer(id: string, options?: LayerOperationOptions): void {
    const layerInfo = this.layers.get(id);
    if (!layerInfo) {
      return;
    }

    layerInfo.olLayer.setVisible(true);
    layerInfo.state.visible = true;
    layerInfo.config.visible = true;
  }

  /**
   * 隐藏图层
   * @param id 图层 ID
   * @param options 操作选项
   */
  hideLayer(id: string, options?: LayerOperationOptions): void {
    const layerInfo = this.layers.get(id);
    if (!layerInfo) {
      return;
    }

    layerInfo.olLayer.setVisible(false);
    layerInfo.state.visible = false;
    layerInfo.config.visible = false;
  }

  /**
   * 设置图层透明度
   * @param id 图层 ID
   * @param opacity 透明度 (0-1)
   * @param options 操作选项
   */
  setLayerOpacity(id: string, opacity: number, options?: LayerOperationOptions): void {
    const layerInfo = this.layers.get(id);
    if (!layerInfo) {
      return;
    }

    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    layerInfo.olLayer.setOpacity(clampedOpacity);
    layerInfo.state.opacity = clampedOpacity;
    layerInfo.config.opacity = clampedOpacity;
  }

  /**
   * 设置图层层级
   * @param id 图层 ID
   * @param zIndex 层级
   */
  setLayerZIndex(id: string, zIndex: number): void {
    const layerInfo = this.layers.get(id);
    if (!layerInfo) {
      return;
    }

    layerInfo.olLayer.setZIndex(zIndex);
    layerInfo.state.zIndex = zIndex;
    layerInfo.config.zIndex = zIndex;
  }

  /**
   * 移动图层到顶部
   * @param id 图层 ID
   */
  moveLayerToTop(id: string): void {
    const maxZIndex = Math.max(...Array.from(this.layers.values()).map(info => info.state.zIndex));
    this.setLayerZIndex(id, maxZIndex + 1);
  }

  /**
   * 移动图层到底部
   * @param id 图层 ID
   */
  moveLayerToBottom(id: string): void {
    const minZIndex = Math.min(...Array.from(this.layers.values()).map(info => info.state.zIndex));
    this.setLayerZIndex(id, minZIndex - 1);
  }

  /**
   * 获取图层状态
   * @param id 图层 ID
   * @returns 图层状态或 null
   */
  getLayerState(id: string): LayerState | null {
    const layerInfo = this.layers.get(id);
    return layerInfo ? { ...layerInfo.state } : null;
  }

  /**
   * 清空所有图层
   */
  clearLayers(): void {
    for (const [id] of this.layers) {
      this.removeLayer(id);
    }
  }

  /**
   * 私有方法：转换样式配置为 OpenLayers 样式
   * @param styleConfig 样式配置
   * @returns OpenLayers 样式实例
   */
  private convertToOLStyle(styleConfig: any): Style | undefined {
    if (!styleConfig) return undefined;

    try {
      const styleOptions: any = {};

      // 处理填充样式
      if (styleConfig.fill) {
        styleOptions.fill = new Fill({
          color: styleConfig.fill.color || 'rgba(255, 255, 255, 0.2)'
        });
      }

      // 处理描边样式
      if (styleConfig.stroke) {
        styleOptions.stroke = new Stroke({
          color: styleConfig.stroke.color || '#3399CC',
          width: styleConfig.stroke.width || 1,
          lineDash: styleConfig.stroke.lineDash
        });
      }

      // 处理圆点样式
      if (styleConfig.circle) {
        const circleOptions: any = {
          radius: styleConfig.circle.radius || 5
        };

        if (styleConfig.circle.fill) {
          circleOptions.fill = new Fill({
            color: styleConfig.circle.fill.color || '#3399CC'
          });
        }

        if (styleConfig.circle.stroke) {
          circleOptions.stroke = new Stroke({
            color: styleConfig.circle.stroke.color || '#ffffff',
            width: styleConfig.circle.stroke.width || 1
          });
        }

        styleOptions.image = new Circle(circleOptions);
      }

      return new Style(styleOptions);
    } catch (error) {
      console.warn('[LayerManager] 样式转换失败，使用默认样式:', error);
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#3399CC',
          width: 1
        })
      });
    }
  }

  /**
   * 创建 OpenLayers 图层
   * @param config 图层配置
   * @returns OpenLayers 图层实例
   * @private
   */
  private async createOLLayer(config: LayerConfig): Promise<any> {
    switch (config.type) {
      case LayerType.OSM:
        return new TileLayer({
          source: new OSM()
        });

      case LayerType.XYZ:
      case LayerType.TILE:
        const tileConfig = config as TileLayerConfig;
        return new TileLayer({
          source: new XYZ({
            url: tileConfig.url,
            urls: tileConfig.urls,
            crossOrigin: tileConfig.crossOrigin
          })
        });

      case LayerType.WMS:
        const wmsConfig = config as WMSLayerConfig;
        return new TileLayer({
          source: new TileWMS({
            url: wmsConfig.url,
            params: {
              'LAYERS': wmsConfig.layers,
              'VERSION': wmsConfig.version || '1.1.1',
              'FORMAT': wmsConfig.format || 'image/png',
              'TRANSPARENT': wmsConfig.transparent !== false,
              'BGCOLOR': wmsConfig.bgcolor || '0xFFFFFF',
              ...wmsConfig.params
            },
            serverType: 'geoserver'
          })
        });

      case LayerType.WMTS:
        const wmtsConfig = config as WMTSLayerConfig;
        return new TileLayer({
          source: new WMTS({
            url: wmtsConfig.url,
            layer: wmtsConfig.layer,
            matrixSet: wmtsConfig.matrixSet,
            format: wmtsConfig.format || 'image/png',
            style: wmtsConfig.style || 'default',
            tileGrid: wmtsConfig.tileGrid
          })
        });

      case LayerType.VECTOR:
        const vectorConfig = config as VectorLayerConfig;
        let vectorSource: VectorSource;

        if (vectorConfig.source) {
          const { type, data, url, format } = vectorConfig.source;
          let formatInstance;

          switch (type) {
            case 'geojson':
              formatInstance = new GeoJSON();
              break;
            case 'kml':
              formatInstance = new KML();
              break;
            case 'gpx':
              formatInstance = new GPX();
              break;
            case 'wkt':
              formatInstance = new WKT();
              break;
            default:
              formatInstance = new GeoJSON();
          }

          if (url) {
            vectorSource = new VectorSource({
              url: url,
              format: formatInstance
            });
          } else if (data) {
            const features = formatInstance.readFeatures(data);
            vectorSource = new VectorSource({
              features: features
            });
          } else {
            vectorSource = new VectorSource();
          }
        } else {
          vectorSource = new VectorSource();
        }

        return new VectorLayer({
          source: vectorSource,
          style: this.convertToOLStyle(vectorConfig.style)
        });

      case LayerType.HEATMAP:
        // TODO: 实现热力图图层
        throw new Error('热力图图层暂未实现');

      case LayerType.IMAGE:
        const imageConfig = config as ImageLayerConfig;
        return new ImageLayer({
          source: new ImageWMS({
            url: imageConfig.url,
            params: {},
            serverType: 'geoserver',
            crossOrigin: imageConfig.crossOrigin
          })
        });

      default:
        throw new Error(`不支持的图层类型: ${config.type}`);
    }
  }

  /**
   * 配置图层属性
   * @param olLayer OpenLayers 图层
   * @param config 图层配置
   * @private
   */
  private configureLayer(olLayer: any, config: LayerConfig): void {
    // 设置基础属性
    if (config.visible !== undefined) {
      olLayer.setVisible(config.visible);
    }

    if (config.opacity !== undefined) {
      olLayer.setOpacity(config.opacity);
    }

    if (config.zIndex !== undefined) {
      olLayer.setZIndex(config.zIndex);
    }

    if (config.extent) {
      olLayer.setExtent(config.extent);
    }

    if (config.minZoom !== undefined) {
      olLayer.setMinZoom(config.minZoom);
    }

    if (config.maxZoom !== undefined) {
      olLayer.setMaxZoom(config.maxZoom);
    }

    // 设置自定义属性
    olLayer.set('id', config.id);
    olLayer.set('name', config.name);
    olLayer.set('description', config.description);

    if (config.properties) {
      Object.keys(config.properties).forEach(key => {
        olLayer.set(key, config.properties![key]);
      });
    }
  }

  /**
   * 添加 GeoJSON 数据图层
   * @param config GeoJSON 图层配置
   */
  addGeoJSONLayer(config: {
    id: string
    name: string
    data: any
    style?: any
  }): void {
    try {
      // 创建 GeoJSON 图层配置
      const layerConfig: LayerConfig = {
        id: config.id,
        name: config.name,
        type: LayerType.VECTOR,
        visible: true,
        style: config.style || {
          stroke: { color: '#52c41a', width: 2 },
          fill: { color: 'rgba(82, 196, 26, 0.2)' }
        }
      }

      this.addLayer(layerConfig)
      console.log(`[LayerManager] GeoJSON 图层已添加: ${config.id}`)
    } catch (error) {
      console.error('[LayerManager] 添加 GeoJSON 图层失败:', error)
      throw error
    }
  }

  /**
   * 添加路径图层
   * @param config 路径配置
   */
  addRouteLayer(config: {
    id: string
    name: string
    coordinates: number[][]
    style?: any
  }): void {
    try {
      // 创建路径图层配置
      const layerConfig: LayerConfig = {
        id: config.id,
        name: config.name,
        type: LayerType.VECTOR,
        visible: true,
        style: config.style || {
          stroke: { color: '#722ED1', width: 4 }
        }
      }

      this.addLayer(layerConfig)
      console.log(`[LayerManager] 路径图层已添加: ${config.id}`)
    } catch (error) {
      console.error('[LayerManager] 添加路径图层失败:', error)
      throw error
    }
  }

  /**
   * 添加边界图层
   * @param config 边界配置
   */
  addBoundsLayer(config: {
    id: string
    name: string
    bounds: number[]
    style?: any
  }): void {
    try {
      // 创建边界图层配置
      const layerConfig: LayerConfig = {
        id: config.id,
        name: config.name,
        type: LayerType.VECTOR,
        visible: true,
        style: config.style || {
          stroke: { color: '#ff4d4f', width: 2, lineDash: [5, 5] },
          fill: { color: 'rgba(255, 77, 79, 0.1)' }
        }
      }

      this.addLayer(layerConfig)
      console.log(`[LayerManager] 边界图层已添加: ${config.id}`)
    } catch (error) {
      console.error('[LayerManager] 添加边界图层失败:', error)
      throw error
    }
  }

  /**
   * 获取图层数量
   * @returns 图层数量
   */
  getLayerCount(): number {
    return this.layers.size;
  }

  /**
   * 获取所有图层ID
   * @returns 图层ID数组
   */
  getAllLayerIds(): string[] {
    return Array.from(this.layers.keys());
  }

  /**
   * 检查图层是否存在
   * @param id 图层ID
   * @returns 是否存在
   */
  hasLayer(id: string): boolean {
    return this.layers.has(id);
  }

  /**
   * 获取可见图层数量
   * @returns 可见图层数量
   */
  getVisibleLayerCount(): number {
    let count = 0;
    this.layers.forEach(info => {
      if (info.state.visible) {
        count++;
      }
    });
    return count;
  }

  /**
   * 批量设置图层可见性
   * @param layerIds 图层ID数组
   * @param visible 是否可见
   */
  setLayersVisibility(layerIds: string[], visible: boolean): void {
    layerIds.forEach(id => {
      if (this.layers.has(id)) {
        this.setLayerVisibility(id, visible);
      }
    });
  }

  /**
   * 根据类型获取图层
   * @param type 图层类型
   * @returns 图层信息数组
   */
  getLayersByType(type: LayerType): Array<{ id: string; config: LayerConfig; state: LayerState }> {
    const result: Array<{ id: string; config: LayerConfig; state: LayerState }> = [];
    this.layers.forEach((info, id) => {
      if (info.config.type === type) {
        result.push({
          id,
          config: info.config,
          state: info.state
        });
      }
    });
    return result;
  }
}

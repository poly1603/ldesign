/**
 * 绘制工具类
 * 提供点、线、面、圆等几何图形的绘制功能
 */

import { Map as OLMap } from 'ol';
import { Draw, Modify, Snap, Select } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { Feature } from 'ol';
import { Point, LineString, Polygon, Circle } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

import type { 
  DrawType, 
  DrawMode, 
  DrawingConfig, 
  DrawingState, 
  IDrawingTools,
  DrawingEventData,
  DrawingOptions
} from '../types';

/**
 * 绘制工具实现类
 * 提供完整的地图绘制功能
 */
export class DrawingTools implements IDrawingTools {
  private olMap: OLMap;
  private drawLayer: VectorLayer<VectorSource>;
  private drawSource: VectorSource;
  private drawInteraction: Draw | null = null;
  private modifyInteraction: Modify | null = null;
  private snapInteraction: Snap | null = null;
  private selectInteraction: Select | null = null;
  
  private currentDrawType: DrawType = DrawType.POINT;
  private currentMode: DrawMode = DrawMode.DRAW;
  private isActive = false;
  
  private features: Map<string, Feature> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * 构造函数
   * @param olMap OpenLayers 地图实例
   */
  constructor(olMap: OLMap) {
    this.olMap = olMap;
    this.initializeDrawLayer();
  }

  /**
   * 初始化绘制图层
   * @private
   */
  private initializeDrawLayer(): void {
    // 创建矢量数据源
    this.drawSource = new VectorSource();

    // 创建矢量图层
    this.drawLayer = new VectorLayer({
      source: this.drawSource,
      style: this.getDefaultStyle(),
      zIndex: 1000 // 确保绘制图层在最上层
    });

    // 添加到地图
    this.olMap.addLayer(this.drawLayer);
  }

  /**
   * 获取默认样式
   * @private
   */
  private getDefaultStyle(): Style {
    return new Style({
      fill: new Fill({
        color: 'rgba(114, 46, 209, 0.2)' // 使用 LDESIGN 主色调
      }),
      stroke: new Stroke({
        color: '#722ED1',
        width: 2
      }),
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: '#722ED1'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      }),
      text: new Text({
        font: '12px sans-serif',
        fill: new Fill({
          color: '#722ED1'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    });
  }

  /**
   * 开始绘制
   * @param type 绘制类型
   * @param options 绘制选项
   */
  startDrawing(type: DrawType, options?: DrawingOptions): void {
    this.stopDrawing();
    
    this.currentDrawType = type;
    this.currentMode = DrawMode.DRAW;
    this.isActive = true;

    // 创建绘制交互
    this.drawInteraction = new Draw({
      source: this.drawSource,
      type: this.getOLGeometryType(type),
      style: options?.style || this.getDefaultStyle()
    });

    // 绑定事件
    this.drawInteraction.on('drawstart', (event) => {
      this.dispatchEvent('drawstart', {
        type: 'drawstart',
        feature: event.feature,
        drawType: type,
        timestamp: Date.now()
      });
    });

    this.drawInteraction.on('drawend', (event) => {
      const feature = event.feature;
      const id = this.generateFeatureId();
      feature.setId(id);
      
      // 存储要素
      this.features.set(id, feature);

      this.dispatchEvent('drawend', {
        type: 'drawend',
        feature: feature,
        featureId: id,
        drawType: type,
        timestamp: Date.now()
      });
    });

    // 添加到地图
    this.olMap.addInteraction(this.drawInteraction);

    // 添加捕捉功能
    if (options?.enableSnap !== false) {
      this.enableSnap();
    }

    this.dispatchEvent('drawingstart', {
      type: 'drawingstart',
      drawType: type,
      mode: this.currentMode,
      timestamp: Date.now()
    });
  }

  /**
   * 停止绘制
   */
  stopDrawing(): void {
    if (this.drawInteraction) {
      this.olMap.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }

    if (this.modifyInteraction) {
      this.olMap.removeInteraction(this.modifyInteraction);
      this.modifyInteraction = null;
    }

    if (this.snapInteraction) {
      this.olMap.removeInteraction(this.snapInteraction);
      this.snapInteraction = null;
    }

    if (this.selectInteraction) {
      this.olMap.removeInteraction(this.selectInteraction);
      this.selectInteraction = null;
    }

    this.isActive = false;

    this.dispatchEvent('drawingstop', {
      type: 'drawingstop',
      timestamp: Date.now()
    });
  }

  /**
   * 启用编辑模式
   */
  enableEdit(): void {
    this.stopDrawing();
    
    this.currentMode = DrawMode.EDIT;
    this.isActive = true;

    // 创建选择交互
    this.selectInteraction = new Select({
      layers: [this.drawLayer]
    });

    // 创建修改交互
    this.modifyInteraction = new Modify({
      features: this.selectInteraction.getFeatures()
    });

    // 绑定事件
    this.modifyInteraction.on('modifystart', (event) => {
      this.dispatchEvent('editstart', {
        type: 'editstart',
        features: event.features.getArray(),
        timestamp: Date.now()
      });
    });

    this.modifyInteraction.on('modifyend', (event) => {
      this.dispatchEvent('editend', {
        type: 'editend',
        features: event.features.getArray(),
        timestamp: Date.now()
      });
    });

    // 添加到地图
    this.olMap.addInteraction(this.selectInteraction);
    this.olMap.addInteraction(this.modifyInteraction);

    // 启用捕捉
    this.enableSnap();
  }

  /**
   * 启用捕捉功能
   * @private
   */
  private enableSnap(): void {
    if (!this.snapInteraction) {
      this.snapInteraction = new Snap({
        source: this.drawSource
      });
      this.olMap.addInteraction(this.snapInteraction);
    }
  }

  /**
   * 清空所有绘制内容
   */
  clear(): void {
    this.drawSource.clear();
    this.features.clear();
    
    this.dispatchEvent('clear', {
      type: 'clear',
      timestamp: Date.now()
    });
  }

  /**
   * 删除指定要素
   * @param featureId 要素ID
   */
  removeFeature(featureId: string): boolean {
    const feature = this.features.get(featureId);
    if (feature) {
      this.drawSource.removeFeature(feature);
      this.features.delete(featureId);
      
      this.dispatchEvent('featureremove', {
        type: 'featureremove',
        featureId: featureId,
        feature: feature,
        timestamp: Date.now()
      });
      
      return true;
    }
    return false;
  }

  /**
   * 获取所有要素
   */
  getFeatures(): Feature[] {
    return Array.from(this.features.values());
  }

  /**
   * 获取指定要素
   * @param featureId 要素ID
   */
  getFeature(featureId: string): Feature | null {
    return this.features.get(featureId) || null;
  }

  /**
   * 获取当前状态
   */
  getState(): DrawingState {
    return {
      isActive: this.isActive,
      currentDrawType: this.currentDrawType,
      currentMode: this.currentMode,
      featureCount: this.features.size,
      features: Array.from(this.features.keys())
    };
  }

  /**
   * 转换绘制类型为 OpenLayers 几何类型
   * @private
   */
  private getOLGeometryType(type: DrawType): string {
    switch (type) {
      case DrawType.POINT:
        return 'Point';
      case DrawType.LINE:
        return 'LineString';
      case DrawType.POLYGON:
        return 'Polygon';
      case DrawType.CIRCLE:
        return 'Circle';
      case DrawType.RECTANGLE:
        return 'Circle'; // 使用 Box 几何类型
      default:
        return 'Point';
    }
  }

  /**
   * 生成要素ID
   * @private
   */
  private generateFeatureId(): string {
    return `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加事件监听器
   */
  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 分发事件
   * @private
   */
  private dispatchEvent(event: string, data: DrawingEventData): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[DrawingTools] 事件处理器错误:`, error);
        }
      });
    }
  }

  /**
   * 销毁绘制工具
   */
  destroy(): void {
    this.stopDrawing();
    
    if (this.drawLayer) {
      this.olMap.removeLayer(this.drawLayer);
    }
    
    this.features.clear();
    this.eventListeners.clear();
  }
}

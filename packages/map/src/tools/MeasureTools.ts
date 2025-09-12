/**
 * 测量工具类
 * 提供距离测量、面积测量、角度测量等功能
 */

import { Map as OLMap } from 'ol';
import { Draw } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { getLength, getArea } from 'ol/sphere';
import { unByKey } from 'ol/Observable';

import type { 
  MeasureType, 
  MeasureResult, 
  MeasureConfig, 
  IMeasureTools,
  MeasureEventData,
  MeasureOptions
} from '../types';

/**
 * 测量工具实现类
 * 提供完整的地图测量功能
 */
export class MeasureTools implements IMeasureTools {
  private olMap: OLMap;
  private measureLayer: VectorLayer<VectorSource>;
  private measureSource: VectorSource;
  private drawInteraction: Draw | null = null;
  
  private currentMeasureType: MeasureType | null = null;
  private isActive = false;
  private currentFeature: Feature | null = null;
  
  private measurements: Map<string, MeasureResult> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * 构造函数
   * @param olMap OpenLayers 地图实例
   */
  constructor(olMap: OLMap) {
    this.olMap = olMap;
    this.initializeMeasureLayer();
  }

  /**
   * 初始化测量图层
   * @private
   */
  private initializeMeasureLayer(): void {
    // 创建矢量数据源
    this.measureSource = new VectorSource();

    // 创建矢量图层
    this.measureLayer = new VectorLayer({
      source: this.measureSource,
      style: this.getMeasureStyle(),
      zIndex: 999 // 确保测量图层在绘制图层下方
    });

    // 添加到地图
    this.olMap.addLayer(this.measureLayer);
  }

  /**
   * 获取测量样式
   * @private
   */
  private getMeasureStyle(): Style {
    return new Style({
      fill: new Fill({
        color: 'rgba(255, 193, 7, 0.2)' // 使用警告色调
      }),
      stroke: new Stroke({
        color: '#FFC107',
        width: 2,
        lineDash: [5, 5] // 虚线样式
      }),
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: '#FFC107'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    });
  }

  /**
   * 开始距离测量
   * @param options 测量选项
   */
  startDistanceMeasure(options?: MeasureOptions): void {
    this.startMeasure(MeasureType.DISTANCE, options);
  }

  /**
   * 开始面积测量
   * @param options 测量选项
   */
  startAreaMeasure(options?: MeasureOptions): void {
    this.startMeasure(MeasureType.AREA, options);
  }

  /**
   * 开始测量
   * @param type 测量类型
   * @param options 测量选项
   * @private
   */
  private startMeasure(type: MeasureType, options?: MeasureOptions): void {
    this.stopMeasure();
    
    this.currentMeasureType = type;
    this.isActive = true;

    // 创建绘制交互
    const geometryType = type === MeasureType.DISTANCE ? 'LineString' : 'Polygon';
    this.drawInteraction = new Draw({
      source: this.measureSource,
      type: geometryType,
      style: options?.style || this.getMeasureStyle()
    });

    // 绑定事件
    this.drawInteraction.on('drawstart', (event) => {
      this.currentFeature = event.feature;
      
      // 添加实时测量显示
      this.addMeasureTooltip(event.feature, type);
      
      this.dispatchEvent('measurestart', {
        type: 'measurestart',
        measureType: type,
        feature: event.feature,
        timestamp: Date.now()
      });
    });

    this.drawInteraction.on('drawend', (event) => {
      const feature = event.feature;
      const result = this.calculateMeasurement(feature, type);
      const id = this.generateMeasureId();
      
      // 存储测量结果
      this.measurements.set(id, result);
      
      // 添加标签
      this.addMeasureLabel(feature, result);
      
      this.dispatchEvent('measureend', {
        type: 'measureend',
        measureType: type,
        feature: feature,
        result: result,
        measureId: id,
        timestamp: Date.now()
      });
      
      this.currentFeature = null;
    });

    // 添加到地图
    this.olMap.addInteraction(this.drawInteraction);

    this.dispatchEvent('measureactivate', {
      type: 'measureactivate',
      measureType: type,
      timestamp: Date.now()
    });
  }

  /**
   * 停止测量
   */
  stopMeasure(): void {
    if (this.drawInteraction) {
      this.olMap.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }

    this.currentMeasureType = null;
    this.currentFeature = null;
    this.isActive = false;

    this.dispatchEvent('measuredeactivate', {
      type: 'measuredeactivate',
      timestamp: Date.now()
    });
  }

  /**
   * 计算测量结果
   * @param feature 要素
   * @param type 测量类型
   * @private
   */
  private calculateMeasurement(feature: Feature, type: MeasureType): MeasureResult {
    const geometry = feature.getGeometry();
    
    if (type === MeasureType.DISTANCE && geometry instanceof LineString) {
      const length = getLength(geometry);
      return {
        type: MeasureType.DISTANCE,
        value: length,
        formattedValue: this.formatLength(length),
        unit: length > 1000 ? 'km' : 'm',
        geometry: geometry,
        timestamp: Date.now()
      };
    } else if (type === MeasureType.AREA && geometry instanceof Polygon) {
      const area = getArea(geometry);
      return {
        type: MeasureType.AREA,
        value: area,
        formattedValue: this.formatArea(area),
        unit: area > 10000 ? 'km²' : 'm²',
        geometry: geometry,
        timestamp: Date.now()
      };
    }

    throw new Error(`不支持的测量类型: ${type}`);
  }

  /**
   * 格式化长度
   * @param length 长度（米）
   * @private
   */
  private formatLength(length: number): string {
    if (length > 1000) {
      return `${(length / 1000).toFixed(2)} km`;
    } else {
      return `${length.toFixed(2)} m`;
    }
  }

  /**
   * 格式化面积
   * @param area 面积（平方米）
   * @private
   */
  private formatArea(area: number): string {
    if (area > 10000) {
      return `${(area / 1000000).toFixed(2)} km²`;
    } else {
      return `${area.toFixed(2)} m²`;
    }
  }

  /**
   * 添加测量提示
   * @param feature 要素
   * @param type 测量类型
   * @private
   */
  private addMeasureTooltip(feature: Feature, type: MeasureType): void {
    // 监听几何变化，实时更新测量值
    const geometry = feature.getGeometry();
    if (geometry) {
      geometry.on('change', () => {
        if (this.currentFeature === feature) {
          try {
            const result = this.calculateMeasurement(feature, type);
            this.dispatchEvent('measurechange', {
              type: 'measurechange',
              measureType: type,
              feature: feature,
              result: result,
              timestamp: Date.now()
            });
          } catch (error) {
            // 测量过程中可能出现临时的无效几何，忽略错误
          }
        }
      });
    }
  }

  /**
   * 添加测量标签
   * @param feature 要素
   * @param result 测量结果
   * @private
   */
  private addMeasureLabel(feature: Feature, result: MeasureResult): void {
    // 创建文本样式
    const textStyle = new Style({
      text: new Text({
        text: result.formattedValue,
        font: '14px sans-serif',
        fill: new Fill({
          color: '#FFC107'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 3
        }),
        backgroundFill: new Fill({
          color: 'rgba(255, 255, 255, 0.8)'
        }),
        backgroundStroke: new Stroke({
          color: '#FFC107',
          width: 1
        }),
        padding: [4, 8, 4, 8]
      })
    });

    // 设置要素样式
    feature.setStyle([this.getMeasureStyle(), textStyle]);
  }

  /**
   * 清空所有测量结果
   */
  clear(): void {
    this.measureSource.clear();
    this.measurements.clear();
    
    this.dispatchEvent('measureclear', {
      type: 'measureclear',
      timestamp: Date.now()
    });
  }

  /**
   * 删除指定测量结果
   * @param measureId 测量ID
   */
  removeMeasurement(measureId: string): boolean {
    const result = this.measurements.get(measureId);
    if (result) {
      // 查找并删除对应的要素
      const features = this.measureSource.getFeatures();
      const feature = features.find(f => {
        const geometry = f.getGeometry();
        return geometry === result.geometry;
      });
      
      if (feature) {
        this.measureSource.removeFeature(feature);
      }
      
      this.measurements.delete(measureId);
      
      this.dispatchEvent('measureremove', {
        type: 'measureremove',
        measureId: measureId,
        result: result,
        timestamp: Date.now()
      });
      
      return true;
    }
    return false;
  }

  /**
   * 获取所有测量结果
   */
  getMeasurements(): MeasureResult[] {
    return Array.from(this.measurements.values());
  }

  /**
   * 获取指定测量结果
   * @param measureId 测量ID
   */
  getMeasurement(measureId: string): MeasureResult | null {
    return this.measurements.get(measureId) || null;
  }

  /**
   * 获取当前状态
   */
  getState(): { isActive: boolean; currentType: MeasureType | null; measurementCount: number } {
    return {
      isActive: this.isActive,
      currentType: this.currentMeasureType,
      measurementCount: this.measurements.size
    };
  }

  /**
   * 生成测量ID
   * @private
   */
  private generateMeasureId(): string {
    return `measure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
  private dispatchEvent(event: string, data: MeasureEventData): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[MeasureTools] 事件处理器错误:`, error);
        }
      });
    }
  }

  /**
   * 销毁测量工具
   */
  destroy(): void {
    this.stopMeasure();
    
    if (this.measureLayer) {
      this.olMap.removeLayer(this.measureLayer);
    }
    
    this.measurements.clear();
    this.eventListeners.clear();
  }
}

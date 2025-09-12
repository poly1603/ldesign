/**
 * 热力图管理器
 * 负责管理地图上的热力图显示和数据处理
 */

import { Map as OLMap } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Circle, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import type {
  IHeatmapManager,
  HeatmapOptions,
  HeatmapDataPoint,
  HeatmapInfo,
  HeatmapAnimationOptions,
  HeatmapStatistics
} from '../types/heatmap';
import { EventEmitter } from '../utils/EventEmitter';

/**
 * 热力图管理器实现
 */
export class HeatmapManager extends EventEmitter implements IHeatmapManager {
  private map: OLMap;
  private heatmaps: Map<string, HeatmapInfo> = new Map();
  private heatmapLayer: VectorLayer<VectorSource>;
  private animationFrameId: number | null = null;

  constructor(map: OLMap) {
    super();
    this.map = map;

    // 创建热力图图层
    this.heatmapLayer = new VectorLayer({
      source: new VectorSource(),
      style: this.createHeatmapStyle.bind(this),
      zIndex: 400
    });

    this.map.addLayer(this.heatmapLayer);
    console.log('[HeatmapManager] 热力图管理器已初始化');
  }

  /**
   * 添加热力图
   */
  addHeatmap(options: HeatmapOptions): string {
    try {
      const heatmapId = options.id || this.generateHeatmapId();

      // 验证数据点
      if (!options.data || options.data.length === 0) {
        throw new Error('热力图数据不能为空');
      }

      // 创建热力图信息
      const heatmapInfo: HeatmapInfo = {
        id: heatmapId,
        name: options.name || `热力图_${heatmapId}`,
        data: options.data,
        options: {
          radius: options.radius || 20,
          blur: options.blur || 15,
          gradient: options.gradient || this.getDefaultGradient(),
          opacity: options.opacity || 0.6,
          maxZoom: options.maxZoom || 18,
          minZoom: options.minZoom || 0,
          ...options
        },
        visible: options.visible !== false,
        bounds: this.calculateHeatmapBounds(options.data),
        statistics: this.calculateHeatmapStatistics(options.data),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 存储热力图
      this.heatmaps.set(heatmapId, heatmapInfo);

      // 渲染热力图
      this.renderHeatmap(heatmapInfo);

      // 触发事件
      this.emit('heatmap-added', { heatmap: heatmapInfo });

      console.log(`[HeatmapManager] 热力图已添加: ${heatmapId}`);
      return heatmapId;

    } catch (error) {
      console.error('[HeatmapManager] 添加热力图失败:', error);
      throw error;
    }
  }

  /**
   * 获取热力图信息
   */
  getHeatmap(heatmapId: string): HeatmapInfo | null {
    return this.heatmaps.get(heatmapId) || null;
  }

  /**
   * 获取所有热力图
   */
  getAllHeatmaps(): HeatmapInfo[] {
    return Array.from(this.heatmaps.values());
  }

  /**
   * 更新热力图
   */
  updateHeatmap(heatmapId: string, updates: Partial<HeatmapOptions>): void {
    try {
      const heatmap = this.heatmaps.get(heatmapId);
      if (!heatmap) {
        throw new Error(`热力图不存在: ${heatmapId}`);
      }

      // 更新热力图信息
      Object.assign(heatmap.options, updates);
      if (updates.data) {
        heatmap.data = updates.data;
        heatmap.bounds = this.calculateHeatmapBounds(updates.data);
        heatmap.statistics = this.calculateHeatmapStatistics(updates.data);
      }
      heatmap.updatedAt = new Date();

      // 重新渲染
      this.renderHeatmap(heatmap);

      // 触发事件
      this.emit('heatmap-updated', { heatmap });

      console.log(`[HeatmapManager] 热力图已更新: ${heatmapId}`);

    } catch (error) {
      console.error('[HeatmapManager] 更新热力图失败:', error);
      throw error;
    }
  }

  /**
   * 删除热力图
   */
  removeHeatmap(heatmapId: string): void {
    try {
      const heatmap = this.heatmaps.get(heatmapId);
      if (!heatmap) {
        return;
      }

      // 从图层中移除要素
      const source = this.heatmapLayer.getSource();
      if (source) {
        const features = source.getFeatures().filter(
          feature => feature.get('heatmapId') === heatmapId
        );
        features.forEach(feature => source.removeFeature(feature));
      }

      // 删除热力图
      this.heatmaps.delete(heatmapId);

      // 触发事件
      this.emit('heatmap-removed', { heatmapId });

      console.log(`[HeatmapManager] 热力图已删除: ${heatmapId}`);

    } catch (error) {
      console.error('[HeatmapManager] 删除热力图失败:', error);
      throw error;
    }
  }

  /**
   * 设置热力图可见性
   */
  setHeatmapVisible(heatmapId: string, visible: boolean): void {
    try {
      const heatmap = this.heatmaps.get(heatmapId);
      if (!heatmap) {
        throw new Error(`热力图不存在: ${heatmapId}`);
      }

      heatmap.visible = visible;
      heatmap.updatedAt = new Date();

      // 更新图层中的要素可见性
      const source = this.heatmapLayer.getSource();
      if (source) {
        const features = source.getFeatures().filter(
          feature => feature.get('heatmapId') === heatmapId
        );
        features.forEach(feature => {
          const style = feature.getStyle() as Style;
          if (style) {
            style.getImage()?.setOpacity(visible ? heatmap.options.opacity || 0.6 : 0);
          }
        });
      }

      // 触发事件
      this.emit('heatmap-visibility-changed', { heatmapId, visible });

      console.log(`[HeatmapManager] 热力图可见性已更新: ${heatmapId} -> ${visible}`);

    } catch (error) {
      console.error('[HeatmapManager] 设置热力图可见性失败:', error);
      throw error;
    }
  }

  /**
   * 播放热力图动画
   */
  playHeatmapAnimation(heatmapId: string, options?: HeatmapAnimationOptions): void {
    try {
      const heatmap = this.heatmaps.get(heatmapId);
      if (!heatmap) {
        throw new Error(`热力图不存在: ${heatmapId}`);
      }

      // 停止当前动画
      this.stopHeatmapAnimation();

      const animationOptions = {
        duration: options?.duration || 3000,
        easing: options?.easing || 'linear',
        loop: options?.loop || false,
        ...options
      };

      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationOptions.duration, 1);

        // 更新热力图透明度或其他属性
        const opacity = heatmap.options.opacity || 0.6;
        const animatedOpacity = opacity * (0.5 + 0.5 * Math.sin(progress * Math.PI * 2));

        this.updateHeatmapOpacity(heatmapId, animatedOpacity);

        if (progress < 1 || animationOptions.loop) {
          if (progress >= 1 && animationOptions.loop) {
            startTime = currentTime;
          }
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          this.emit('heatmap-animation-complete', { heatmapId });
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
      this.emit('heatmap-animation-started', { heatmapId, options: animationOptions });

      console.log(`[HeatmapManager] 热力图动画已开始: ${heatmapId}`);

    } catch (error) {
      console.error('[HeatmapManager] 播放热力图动画失败:', error);
      throw error;
    }
  }

  /**
   * 停止热力图动画
   */
  stopHeatmapAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.emit('heatmap-animation-stopped', {});
      console.log('[HeatmapManager] 热力图动画已停止');
    }
  }

  /**
   * 清除所有热力图
   */
  clearHeatmaps(): void {
    try {
      // 停止动画
      this.stopHeatmapAnimation();

      // 清除图层
      const source = this.heatmapLayer.getSource();
      if (source) {
        source.clear();
      }

      // 清除热力图数据
      this.heatmaps.clear();

      // 触发事件
      this.emit('heatmaps-cleared', {});

      console.log('[HeatmapManager] 所有热力图已清除');

    } catch (error) {
      console.error('[HeatmapManager] 清除热力图失败:', error);
      throw error;
    }
  }

  /**
   * 获取热力图统计信息
   */
  getHeatmapStatistics(heatmapId: string): HeatmapStatistics | null {
    const heatmap = this.heatmaps.get(heatmapId);
    return heatmap ? heatmap.statistics : null;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    try {
      this.stopHeatmapAnimation();
      this.clearHeatmaps();

      if (this.heatmapLayer) {
        this.map.removeLayer(this.heatmapLayer);
      }

      this.removeAllListeners();
      console.log('[HeatmapManager] 热力图管理器已销毁');

    } catch (error) {
      console.error('[HeatmapManager] 销毁热力图管理器失败:', error);
    }
  }

  /**
   * 生成热力图ID
   */
  private generateHeatmapId(): string {
    return `heatmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 渲染热力图
   */
  private renderHeatmap(heatmap: HeatmapInfo): void {
    try {
      const source = this.heatmapLayer.getSource();
      if (!source) return;

      // 移除旧的要素
      const oldFeatures = source.getFeatures().filter(
        feature => feature.get('heatmapId') === heatmap.id
      );
      oldFeatures.forEach(feature => source.removeFeature(feature));

      // 创建新的要素
      const features = heatmap.data.map(point => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([point.longitude, point.latitude])),
          heatmapId: heatmap.id,
          weight: point.weight || 1,
          value: point.value
        });

        return feature;
      });

      // 添加要素到图层
      source.addFeatures(features);

    } catch (error) {
      console.error('[HeatmapManager] 渲染热力图失败:', error);
      throw error;
    }
  }

  /**
   * 创建热力图样式
   */
  private createHeatmapStyle(feature: Feature): Style {
    const weight = feature.get('weight') || 1;
    const heatmapId = feature.get('heatmapId');
    const heatmap = this.heatmaps.get(heatmapId);

    if (!heatmap) {
      return new Style();
    }

    const radius = (heatmap.options.radius || 20) * Math.sqrt(weight);
    const opacity = heatmap.visible ? (heatmap.options.opacity || 0.6) : 0;

    return new Style({
      image: new Circle({
        radius: radius,
        fill: new Fill({
          color: `rgba(255, 0, 0, ${opacity * weight})`
        })
      })
    });
  }

  /**
   * 获取默认渐变色
   */
  private getDefaultGradient(): { [key: number]: string } {
    return {
      0.0: 'rgba(0, 0, 255, 0)',
      0.1: 'rgba(0, 0, 255, 0.5)',
      0.3: 'rgba(0, 255, 255, 0.7)',
      0.5: 'rgba(0, 255, 0, 0.8)',
      0.7: 'rgba(255, 255, 0, 0.9)',
      1.0: 'rgba(255, 0, 0, 1.0)'
    };
  }

  /**
   * 计算热力图边界
   */
  private calculateHeatmapBounds(data: HeatmapDataPoint[]): [number, number, number, number] {
    if (data.length === 0) {
      return [0, 0, 0, 0];
    }

    let minLng = data[0].longitude;
    let maxLng = data[0].longitude;
    let minLat = data[0].latitude;
    let maxLat = data[0].latitude;

    data.forEach(point => {
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
    });

    return [minLng, minLat, maxLng, maxLat];
  }

  /**
   * 计算热力图统计信息
   */
  private calculateHeatmapStatistics(data: HeatmapDataPoint[]): HeatmapStatistics {
    if (data.length === 0) {
      return {
        totalPoints: 0,
        averageWeight: 0,
        maxWeight: 0,
        minWeight: 0,
        totalWeight: 0
      };
    }

    const weights = data.map(point => point.weight || 1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const averageWeight = totalWeight / weights.length;

    return {
      totalPoints: data.length,
      averageWeight,
      maxWeight,
      minWeight,
      totalWeight
    };
  }

  /**
   * 更新热力图透明度
   */
  private updateHeatmapOpacity(heatmapId: string, opacity: number): void {
    const source = this.heatmapLayer.getSource();
    if (!source) return;

    const features = source.getFeatures().filter(
      feature => feature.get('heatmapId') === heatmapId
    );

    features.forEach(feature => {
      const style = feature.getStyle() as Style;
      if (style && style.getImage()) {
        style.getImage()?.setOpacity(opacity);
      }
    });
  }
}
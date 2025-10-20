// @ts-ignore - aggregation-layers may not be installed in all environments
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import type { DeckGLLayer } from './types';

/**
 * 热力图数据点接口
 */
export interface HeatmapDataPoint {
  position: [number, number];
  weight?: number;
  [key: string]: any;
}

/**
 * 热力图配置选项
 */
export interface HeatmapOptions {
  id?: string;
  data: HeatmapDataPoint[];
  intensity?: number;
  threshold?: number;
  radiusPixels?: number;
  colorRange?: number[][];
  aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
  weightsTextureSize?: number;
  debounceTimeout?: number;
  pickable?: boolean;
  visible?: boolean;
  opacity?: number;
  getPosition?: (d: any) => [number, number];
  getWeight?: (d: any) => number;
}

/**
 * HeatmapRenderer - 热力图渲染器
 * 用于数据密度可视化
 */
export class HeatmapRenderer {
  private heatmaps: Map<string, HeatmapOptions> = new Map();
  private heatmapIdCounter = 0;

  /**
   * 添加热力图
   */
  addHeatmap(options: HeatmapOptions): string {
    const heatmapId = options.id || `heatmap-${++this.heatmapIdCounter}`;
    const heatmapWithId = { ...options, id: heatmapId };
    this.heatmaps.set(heatmapId, heatmapWithId);
    return heatmapId;
  }

  /**
   * 更新热力图
   */
  updateHeatmap(heatmapId: string, updates: Partial<HeatmapOptions>): void {
    const heatmap = this.heatmaps.get(heatmapId);
    if (heatmap) {
      this.heatmaps.set(heatmapId, { ...heatmap, ...updates });
    }
  }

  /**
   * 删除热力图
   */
  removeHeatmap(heatmapId: string): void {
    this.heatmaps.delete(heatmapId);
  }

  /**
   * 清空所有热力图
   */
  clearHeatmaps(): void {
    this.heatmaps.clear();
  }

  /**
   * 获取热力图图层
   */
  getLayers(): DeckGLLayer[] {
    const layers: DeckGLLayer[] = [];

    this.heatmaps.forEach((heatmap) => {
      if (heatmap.visible === false) {
        return;
      }

      const defaultColorRange = [
        [255, 255, 204],  // 浅黄
        [255, 237, 160],
        [254, 217, 118],
        [254, 178, 76],
        [253, 141, 60],
        [252, 78, 42],
        [227, 26, 28],
        [189, 0, 38],
        [128, 0, 38]     // 深红
      ];

      const layer = new HeatmapLayer({
        id: heatmap.id,
        data: heatmap.data,
        pickable: heatmap.pickable !== false,
        getPosition: heatmap.getPosition || ((d: HeatmapDataPoint) => d.position),
        getWeight: heatmap.getWeight || ((d: HeatmapDataPoint) => d.weight || 1),
        intensity: heatmap.intensity || 1,
        threshold: heatmap.threshold || 0.05,
        radiusPixels: heatmap.radiusPixels || 30,
        colorRange: heatmap.colorRange || defaultColorRange,
        aggregation: heatmap.aggregation || 'SUM',
        weightsTextureSize: heatmap.weightsTextureSize || 2048,
        debounceTimeout: heatmap.debounceTimeout || 500,
        opacity: heatmap.opacity || 1
      } as any);

      layers.push(layer);
    });

    return layers;
  }

  /**
   * 获取热力图
   */
  getHeatmap(heatmapId: string): HeatmapOptions | undefined {
    return this.heatmaps.get(heatmapId);
  }

  /**
   * 获取所有热力图
   */
  getAllHeatmaps(): HeatmapOptions[] {
    return Array.from(this.heatmaps.values());
  }

  /**
   * 设置热力图可见性
   */
  setHeatmapVisibility(heatmapId: string, visible: boolean): void {
    this.updateHeatmap(heatmapId, { visible });
  }
}



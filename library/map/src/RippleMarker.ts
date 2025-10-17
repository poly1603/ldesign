import { ScatterplotLayer } from '@deck.gl/layers';
import type { Layer } from '@deck.gl/core';

export interface RippleMarkerOptions {
  id: string;
  position: [number, number];
  color?: [number, number, number];
  baseRadius?: number;
  rippleCount?: number;
  animationSpeed?: number;
}

export class RippleMarker {
  private id: string;
  private position: [number, number];
  private color: [number, number, number];
  private baseRadius: number;
  private rippleCount: number;
  private animationSpeed: number;
  private startTime: number;
  private currentTime: number;

  constructor(options: RippleMarkerOptions) {
    this.id = options.id;
    this.position = options.position;
    this.color = options.color || [255, 0, 0];
    this.baseRadius = options.baseRadius || 40; // 更大的基础半径
    this.rippleCount = options.rippleCount || 3; // 3个波纹圈
    this.animationSpeed = options.animationSpeed || 3000; // 3秒一个周期
    this.startTime = Date.now();
    this.currentTime = Date.now();
  }

  /**
   * 创建水波纹图层
   */
  createLayers(): Layer[] {
    const layers: Layer[] = [];
    
    // 更新当前时间
    this.currentTime = Date.now();
    const elapsed = this.currentTime - this.startTime;
    
    // 创建中心点
    layers.push(
      new ScatterplotLayer({
        id: `${this.id}-center`,
        data: [{ position: this.position }],
        getPosition: d => d.position,
        getFillColor: [...this.color, 255],
        getLineColor: [255, 255, 255, 200],
        getRadius: 8, // 固定大小的中心点
        getLineWidth: 2,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 6,
        radiusMaxPixels: 12,
        pickable: true
      })
    );

    // 创建水波纹圈
    for (let i = 0; i < this.rippleCount; i++) {
      const phaseOffset = i / this.rippleCount;
      const progress = ((elapsed % this.animationSpeed) / this.animationSpeed + phaseOffset) % 1;
      
      // 计算透明度
      const opacity = Math.max(0, (1 - progress) * 200);
      
      // 计算半径
      const radius = this.baseRadius * (1 + progress * 3);
      
      // 计算线宽
      const lineWidth = Math.max(1, 4 * (1 - progress));
      
      layers.push(
        new ScatterplotLayer({
          id: `${this.id}-ripple-${i}`,
          data: [{ position: this.position }],
          getPosition: d => d.position,
          getFillColor: [0, 0, 0, 0],
          getLineColor: [...this.color, opacity],
          getRadius: radius,
          getLineWidth: lineWidth,
          lineWidthMinPixels: 1,
          lineWidthMaxPixels: 5,
          stroked: true,
          filled: false,
          radiusScale: 1,
          radiusMinPixels: this.baseRadius,
          radiusMaxPixels: this.baseRadius * 4,
          pickable: false,
          updateTriggers: {
            getLineColor: elapsed,
            getRadius: elapsed,
            getLineWidth: elapsed
          }
        })
      );
    }

    return layers;
  }

  /**
   * 更新动画（触发重绘）
   */
  update(): Layer[] {
    return this.createLayers();
  }

  /**
   * 获取位置
   */
  getPosition(): [number, number] {
    return this.position;
  }

  /**
   * 获取ID
   */
  getId(): string {
    return this.id;
  }
}

/**
 * 创建水波纹标记的便捷方法
 */
export function createRippleMarker(
  id: string,
  longitude: number,
  latitude: number,
  color?: [number, number, number],
  options?: Partial<RippleMarkerOptions>
): RippleMarker {
  return new RippleMarker({
    id,
    position: [longitude, latitude],
    color,
    ...options
  });
}
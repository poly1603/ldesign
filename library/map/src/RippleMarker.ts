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
  private pulseIntensity: number; // 脉冲强度
  private waveSpacing: number; // 波纹间距

  constructor(options: RippleMarkerOptions) {
    this.id = options.id;
    this.position = options.position;
    this.color = options.color || [255, 0, 0];
    this.baseRadius = options.baseRadius || 40; // 更大的基础半径
    this.rippleCount = options.rippleCount || 3; // 3个波纹圈
    this.animationSpeed = options.animationSpeed || 3000; // 3秒一个周期
    this.startTime = Date.now();
    this.currentTime = Date.now();
    this.pulseIntensity = 0.3; // 脉冲强度因子
    this.waveSpacing = 0.33; // 波纹之间的相位差
  }

  /**
   * 创建水波纹图层
   */
  createLayers(): Layer[] {
    const layers: Layer[] = [];
    
    // 更新当前时间
    this.currentTime = Date.now();
    const elapsed = this.currentTime - this.startTime;
    
    // 创建带脉冲效果的中心点
    const centerPulse = Math.sin((elapsed / 1000) * Math.PI * 2) * this.pulseIntensity;
    const centerRadius = 8 + centerPulse * 2; // 中心点有轻微的脉冲效果
    
    layers.push(
      new ScatterplotLayer({
        id: `${this.id}-center`,
        data: [{ position: this.position }],
        getPosition: d => d.position,
        getFillColor: [...this.color, 255],
        getLineColor: [255, 255, 255, 220],
        getRadius: centerRadius,
        getLineWidth: 2.5,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 6,
        radiusMaxPixels: 14,
        pickable: true,
        updateTriggers: {
          getRadius: elapsed
        }
      })
    );

    // 创建多层水波纹圈，实现更真实的扩散效果
    for (let i = 0; i < this.rippleCount; i++) {
      // 使用更自然的相位差分布
      const phaseOffset = i * this.waveSpacing;
      const progress = ((elapsed % this.animationSpeed) / this.animationSpeed + phaseOffset) % 1;
      
      // 使用非线性函数计算透明度，实现更自然的淡出效果
      // 开始时快速出现，中期缓慢变淡，末期快速消失
      const fadeIn = Math.min(progress * 4, 1); // 前25%快速淡入
      const fadeOut = Math.pow(1 - progress, 1.5); // 非线性淡出
      const opacity = Math.max(0, fadeIn * fadeOut * 220);
      
      // 使用缓动函数计算半径，实现更自然的扩散效果
      // 开始时缓慢，中间加速，末尾减速
      const easeProgress = this.easeOutQuart(progress);
      const radius = this.baseRadius * (1 + easeProgress * 3.5);
      
      // 动态计算线宽，外圈更细
      const lineWidth = Math.max(0.5, (4 - i * 0.5) * (1 - progress * 0.8));
      
      // 添加轻微的颜色变化，增加视觉层次
      const colorVariation = 1 - (i * 0.1); // 外圈颜色稍淡
      const rippleColor = [
        this.color[0] * colorVariation,
        this.color[1] * colorVariation,
        this.color[2] * colorVariation,
        opacity
      ];
      
      layers.push(
        new ScatterplotLayer({
          id: `${this.id}-ripple-${i}`,
          data: [{ position: this.position, radius, lineColor: rippleColor, lineWidth }],
          getPosition: d => d.position,
          getFillColor: [0, 0, 0, 0],
          getLineColor: d => d.lineColor,
          getRadius: d => d.radius,
          getLineWidth: d => d.lineWidth,
          lineWidthMinPixels: 0.5,
          lineWidthMaxPixels: 6,
          stroked: true,
          filled: false,
          radiusScale: 1,
          radiusMinPixels: this.baseRadius * 0.8,
          radiusMaxPixels: this.baseRadius * 5,
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
   * 缓动函数 - easeOutQuart
   * 用于创建更自然的动画效果
   */
  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
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
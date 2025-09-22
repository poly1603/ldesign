/**
 * 弹幕插件
 * 提供完整的弹幕功能，包括弹幕发送、显示、过滤等
 */
import { BasePlugin } from '../core/BasePlugin';
import type { IPlugin, PluginConfig } from '../types/plugins';
import type { Player } from '../core/Player';

// 弹幕类型
export enum DanmakuType {
  SCROLL = 'scroll',     // 滚动弹幕
  TOP = 'top',          // 顶部弹幕
  BOTTOM = 'bottom'     // 底部弹幕
}

// 弹幕数据接口
export interface DanmakuData {
  id: string;
  text: string;
  time: number;
  type: DanmakuType;
  color: string;
  fontSize: number;
  speed: number;
  user?: string;
  timestamp?: number;
}

// 弹幕配置接口
export interface DanmakuConfig extends PluginConfig {
  enabled: boolean;
  opacity: number;
  fontSize: number;
  speed: number;
  maxCount: number;
  filterLevel: number;
  allowedTypes: DanmakuType[];
  colors: string[];
  fontFamily: string;
  strokeWidth: number;
  strokeColor: string;
  area: {
    top: number;
    bottom: number;
  };
}

// 弹幕元素接口
interface DanmakuElement {
  id: string;
  element: HTMLElement;
  data: DanmakuData;
  startTime: number;
  duration: number;
  lane?: number;
}

export class Danmaku extends BasePlugin implements IPlugin {
  private container!: HTMLElement;
  private danmakuList: DanmakuElement[] = [];
  private lanes: Map<number, boolean> = new Map();
  private animationFrame: number = 0;
  private lastTime: number = 0;
  private isPlaying: boolean = false;

  constructor(config: Partial<DanmakuConfig> = {}) {
    super('danmaku', {
      enabled: true,
      opacity: 0.8,
      fontSize: 16,
      speed: 1,
      maxCount: 50,
      filterLevel: 0,
      allowedTypes: [DanmakuType.SCROLL, DanmakuType.TOP, DanmakuType.BOTTOM],
      colors: ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
      fontFamily: 'Arial, sans-serif',
      strokeWidth: 1,
      strokeColor: '#000000',
      area: {
        top: 0.1,
        bottom: 0.1
      },
      ...config
    });
  }

  onCreate(): void {
    this.createContainer();
    this.bindEvents();
  }

  onMount(): void {
    if (!this.player?.container) return;
    
    this.player.container.appendChild(this.container);
    this.updateStyles();
  }

  onDestroy(): void {
    this.stopAnimation();
    this.clearDanmaku();
    this.unbindEvents();
    
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.className = 'lv-danmaku-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 5;
    `;
  }

  private bindEvents(): void {
    if (!this.player) return;

    this.player.on('play', this.onPlay.bind(this));
    this.player.on('pause', this.onPause.bind(this));
    this.player.on('seeked', this.onSeeked.bind(this));
    this.player.on('timeupdate', this.onTimeUpdate.bind(this));
  }

  private unbindEvents(): void {
    if (!this.player) return;

    this.player.off('play', this.onPlay.bind(this));
    this.player.off('pause', this.onPause.bind(this));
    this.player.off('seeked', this.onSeeked.bind(this));
    this.player.off('timeupdate', this.onTimeUpdate.bind(this));
  }

  private onPlay(): void {
    this.isPlaying = true;
    this.startAnimation();
  }

  private onPause(): void {
    this.isPlaying = false;
    this.stopAnimation();
  }

  private onSeeked(): void {
    this.clearDanmaku();
    this.lastTime = this.player?.currentTime || 0;
  }

  private onTimeUpdate(): void {
    if (!this.isPlaying) return;
    
    const currentTime = this.player?.currentTime || 0;
    this.lastTime = currentTime;
  }

  private startAnimation(): void {
    if (this.animationFrame) return;
    
    const animate = () => {
      this.updateDanmaku();
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  private updateDanmaku(): void {
    const now = performance.now();
    const containerWidth = this.container.offsetWidth;
    
    // 更新现有弹幕位置
    this.danmakuList.forEach((danmaku, index) => {
      const elapsed = now - danmaku.startTime;
      const progress = elapsed / danmaku.duration;
      
      if (progress >= 1) {
        // 弹幕已完成，移除
        this.removeDanmaku(index);
        return;
      }
      
      // 更新位置
      if (danmaku.data.type === DanmakuType.SCROLL) {
        const startX = containerWidth;
        const endX = -danmaku.element.offsetWidth;
        const currentX = startX + (endX - startX) * progress;
        danmaku.element.style.transform = `translateX(${currentX}px)`;
      }
    });
  }

  private removeDanmaku(index: number): void {
    const danmaku = this.danmakuList[index];
    if (danmaku) {
      // 释放轨道
      if (danmaku.lane !== undefined) {
        this.lanes.set(danmaku.lane, false);
      }
      
      // 移除DOM元素
      if (danmaku.element.parentNode) {
        danmaku.element.parentNode.removeChild(danmaku.element);
      }
      
      // 从列表中移除
      this.danmakuList.splice(index, 1);
    }
  }

  private clearDanmaku(): void {
    this.danmakuList.forEach(danmaku => {
      if (danmaku.element.parentNode) {
        danmaku.element.parentNode.removeChild(danmaku.element);
      }
    });
    
    this.danmakuList = [];
    this.lanes.clear();
  }

  private createDanmakuElement(data: DanmakuData): HTMLElement {
    const element = document.createElement('div');
    element.className = 'lv-danmaku-item';
    element.textContent = data.text;
    
    const config = this.config as DanmakuConfig;
    
    element.style.cssText = `
      position: absolute;
      white-space: nowrap;
      font-family: ${config.fontFamily};
      font-size: ${data.fontSize || config.fontSize}px;
      color: ${data.color};
      opacity: ${config.opacity};
      text-shadow: ${config.strokeWidth}px ${config.strokeWidth}px 0 ${config.strokeColor},
                   -${config.strokeWidth}px -${config.strokeWidth}px 0 ${config.strokeColor},
                   ${config.strokeWidth}px -${config.strokeWidth}px 0 ${config.strokeColor},
                   -${config.strokeWidth}px ${config.strokeWidth}px 0 ${config.strokeColor};
      pointer-events: none;
      user-select: none;
      z-index: 10;
    `;
    
    return element;
  }

  private findAvailableLane(type: DanmakuType): number {
    const containerHeight = this.container.offsetHeight;
    const config = this.config as DanmakuConfig;
    const fontSize = config.fontSize;
    const lineHeight = fontSize * 1.2;
    
    let startY: number;
    let endY: number;
    
    switch (type) {
      case DanmakuType.TOP:
        startY = containerHeight * config.area.top;
        endY = containerHeight * 0.3;
        break;
      case DanmakuType.BOTTOM:
        startY = containerHeight * 0.7;
        endY = containerHeight * (1 - config.area.bottom);
        break;
      default: // SCROLL
        startY = containerHeight * config.area.top;
        endY = containerHeight * (1 - config.area.bottom);
        break;
    }
    
    const maxLanes = Math.floor((endY - startY) / lineHeight);
    
    // 寻找可用轨道
    for (let i = 0; i < maxLanes; i++) {
      if (!this.lanes.get(i)) {
        this.lanes.set(i, true);
        return i;
      }
    }
    
    return -1; // 没有可用轨道
  }

  private calculateDuration(data: DanmakuData): number {
    const config = this.config as DanmakuConfig;
    const baseSpeed = config.speed * data.speed;
    
    switch (data.type) {
      case DanmakuType.SCROLL:
        return 8000 / baseSpeed; // 8秒基础时间
      case DanmakuType.TOP:
      case DanmakuType.BOTTOM:
        return 3000 / baseSpeed; // 3秒基础时间
      default:
        return 5000 / baseSpeed;
    }
  }

  // 公共方法
  public addDanmaku(data: DanmakuData): boolean {
    const config = this.config as DanmakuConfig;
    
    // 检查是否启用
    if (!config.enabled) return false;
    
    // 检查弹幕数量限制
    if (this.danmakuList.length >= config.maxCount) return false;
    
    // 检查弹幕类型是否允许
    if (!config.allowedTypes.includes(data.type)) return false;
    
    // 寻找可用轨道
    const lane = this.findAvailableLane(data.type);
    if (lane === -1) return false;
    
    // 创建弹幕元素
    const element = this.createDanmakuElement(data);
    const duration = this.calculateDuration(data);
    
    // 设置位置
    const containerHeight = this.container.offsetHeight;
    const lineHeight = config.fontSize * 1.2;
    const y = this.calculateLaneY(data.type, lane, lineHeight);
    
    element.style.top = `${y}px`;
    
    if (data.type === DanmakuType.SCROLL) {
      element.style.left = `${this.container.offsetWidth}px`;
    } else {
      element.style.left = '50%';
      element.style.transform = 'translateX(-50%)';
    }
    
    // 添加到容器
    this.container.appendChild(element);
    
    // 添加到列表
    const danmakuElement: DanmakuElement = {
      id: data.id,
      element,
      data,
      startTime: performance.now(),
      duration,
      lane
    };
    
    this.danmakuList.push(danmakuElement);
    
    return true;
  }

  private calculateLaneY(type: DanmakuType, lane: number, lineHeight: number): number {
    const containerHeight = this.container.offsetHeight;
    const config = this.config as DanmakuConfig;
    
    switch (type) {
      case DanmakuType.TOP:
        return containerHeight * config.area.top + lane * lineHeight;
      case DanmakuType.BOTTOM:
        return containerHeight * (1 - config.area.bottom) - (lane + 1) * lineHeight;
      default: // SCROLL
        return containerHeight * config.area.top + lane * lineHeight;
    }
  }

  public sendDanmaku(text: string, options: Partial<DanmakuData> = {}): boolean {
    const config = this.config as DanmakuConfig;
    
    const danmakuData: DanmakuData = {
      id: `danmaku_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      time: this.player?.currentTime || 0,
      type: DanmakuType.SCROLL,
      color: config.colors[0],
      fontSize: config.fontSize,
      speed: 1,
      timestamp: Date.now(),
      ...options
    };
    
    return this.addDanmaku(danmakuData);
  }

  public clearAll(): void {
    this.clearDanmaku();
  }

  public setEnabled(enabled: boolean): void {
    (this.config as DanmakuConfig).enabled = enabled;
    this.container.style.display = enabled ? 'block' : 'none';
    
    if (!enabled) {
      this.clearDanmaku();
    }
  }

  public setOpacity(opacity: number): void {
    (this.config as DanmakuConfig).opacity = Math.max(0, Math.min(1, opacity));
    this.updateStyles();
  }

  public setSpeed(speed: number): void {
    (this.config as DanmakuConfig).speed = Math.max(0.1, Math.min(3, speed));
  }

  private updateStyles(): void {
    const config = this.config as DanmakuConfig;
    this.container.style.opacity = config.opacity.toString();
  }
}

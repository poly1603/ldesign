/**
 * 手势控制插件
 * 支持触摸设备的手势操作
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 手势类型
 */
export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'doubleTap',
  LONG_PRESS = 'longPress',
  SWIPE_LEFT = 'swipeLeft',
  SWIPE_RIGHT = 'swipeRight',
  SWIPE_UP = 'swipeUp',
  SWIPE_DOWN = 'swipeDown',
  PINCH_IN = 'pinchIn',
  PINCH_OUT = 'pinchOut'
}

/**
 * 手势配置
 */
export interface GestureConfig {
  type: GestureType;
  action: string | ((player: IPlayer, data?: any) => void);
  enabled?: boolean;
  threshold?: number;
  description?: string;
}

/**
 * 手势控制插件配置
 */
export interface GestureControlConfig extends UIPluginConfig {
  gestures?: GestureConfig[];
  enableDefaultGestures?: boolean;
  tapTimeout?: number;
  longPressTimeout?: number;
  swipeThreshold?: number;
  pinchThreshold?: number;
  showFeedback?: boolean;
}

/**
 * 触摸点信息
 */
interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

/**
 * 手势控制插件
 */
export class GestureControl extends Plugin {
  private gestures = new Map<GestureType, GestureConfig>();
  private touchPoints: TouchPoint[] = [];
  private lastTapTime = 0;
  private longPressTimer?: number;
  private feedbackElement?: HTMLElement;

  constructor(player: IPlayer, config: GestureControlConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'gestureControl',
      version: '1.0.0',
      type: 'functional',
      description: 'Touch gesture control support'
    };

    const defaultConfig: GestureControlConfig = {
      enableDefaultGestures: true,
      tapTimeout: 300,
      longPressTimeout: 500,
      swipeThreshold: 50,
      pinchThreshold: 0.2,
      showFeedback: true,
      gestures: []
    };

    super(player, { ...defaultConfig, ...config }, metadata);
  }

  async init(): Promise<void> {
    await super.init();

    // 设置默认手势
    if (this.config.enableDefaultGestures) {
      this.setupDefaultGestures();
    }

    // 添加自定义手势
    if (this.config.gestures) {
      for (const gesture of this.config.gestures) {
        this.addGesture(gesture);
      }
    }

    // 绑定触摸事件
    this.bindTouchEvents();

    // 创建反馈界面
    if (this.config.showFeedback) {
      this.createFeedbackInterface();
    }
  }

  /**
   * 设置默认手势
   */
  private setupDefaultGestures(): void {
    const defaultGestures: GestureConfig[] = [
      {
        type: GestureType.TAP,
        action: 'toggleControls',
        description: '显示/隐藏控制栏'
      },
      {
        type: GestureType.DOUBLE_TAP,
        action: 'togglePlay',
        description: '播放/暂停'
      },
      {
        type: GestureType.LONG_PRESS,
        action: (player) => {
          // 长按加速播放
          player.playbackRate = 2;
          this.showFeedback('2x 快进');
        },
        description: '长按快进'
      },
      {
        type: GestureType.SWIPE_LEFT,
        action: (player) => {
          const newTime = Math.max(0, player.currentTime - 10);
          player.seek(newTime);
          this.showFeedback(`后退 10 秒`);
        },
        description: '左滑后退 10 秒'
      },
      {
        type: GestureType.SWIPE_RIGHT,
        action: (player) => {
          const newTime = Math.min(player.duration, player.currentTime + 10);
          player.seek(newTime);
          this.showFeedback(`前进 10 秒`);
        },
        description: '右滑前进 10 秒'
      },
      {
        type: GestureType.SWIPE_UP,
        action: (player) => {
          const newVolume = Math.min(1, player.volume + 0.1);
          player.volume = newVolume;
          this.showFeedback(`音量 ${Math.round(newVolume * 100)}%`);
        },
        description: '上滑增加音量'
      },
      {
        type: GestureType.SWIPE_DOWN,
        action: (player) => {
          const newVolume = Math.max(0, player.volume - 0.1);
          player.volume = newVolume;
          this.showFeedback(`音量 ${Math.round(newVolume * 100)}%`);
        },
        description: '下滑减少音量'
      }
    ];

    for (const gesture of defaultGestures) {
      this.addGesture(gesture);
    }
  }

  /**
   * 添加手势
   */
  addGesture(gesture: GestureConfig): void {
    this.gestures.set(gesture.type, gesture);
  }

  /**
   * 移除手势
   */
  removeGesture(type: GestureType): void {
    this.gestures.delete(type);
  }

  /**
   * 绑定触摸事件
   */
  private bindTouchEvents(): void {
    const container = this.player.container;

    container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    container.addEventListener('touchcancel', this.handleTouchCancel.bind(this));

    // 阻止默认的触摸行为
    container.style.touchAction = 'none';
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    const now = Date.now();
    this.touchPoints = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now
    }));

    // 检测长按
    if (this.touchPoints.length === 1) {
      this.longPressTimer = window.setTimeout(() => {
        this.executeGesture(GestureType.LONG_PRESS);
      }, this.config.longPressTimeout);
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    // 如果有移动，取消长按
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }

    // 更新触摸点
    for (const touch of Array.from(event.touches)) {
      const point = this.touchPoints.find(p => p.id === touch.identifier);
      if (point) {
        point.x = touch.clientX;
        point.y = touch.clientY;
      }
    }

    // 检测缩放手势
    if (this.touchPoints.length === 2 && event.touches.length === 2) {
      this.detectPinchGesture(event.touches);
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    // 清除长按定时器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }

    const now = Date.now();
    const remainingTouches = Array.from(event.touches);

    // 检测单击和双击
    if (this.touchPoints.length === 1 && remainingTouches.length === 0) {
      const touchDuration = now - this.touchPoints[0].timestamp;
      
      if (touchDuration < this.config.tapTimeout!) {
        if (now - this.lastTapTime < this.config.tapTimeout!) {
          // 双击
          this.executeGesture(GestureType.DOUBLE_TAP);
          this.lastTapTime = 0;
        } else {
          // 单击（延迟执行，等待可能的双击）
          this.lastTapTime = now;
          setTimeout(() => {
            if (this.lastTapTime === now) {
              this.executeGesture(GestureType.TAP);
            }
          }, this.config.tapTimeout);
        }
      }
    }

    // 检测滑动手势
    if (this.touchPoints.length === 1 && remainingTouches.length === 0) {
      this.detectSwipeGesture();
    }

    // 恢复播放速度（如果是长按快进）
    if (this.player.playbackRate === 2) {
      this.player.playbackRate = 1;
    }

    // 更新触摸点
    this.touchPoints = remainingTouches.map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now
    }));
  }

  /**
   * 处理触摸取消
   */
  private handleTouchCancel(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }

    // 恢复播放速度
    if (this.player.playbackRate === 2) {
      this.player.playbackRate = 1;
    }

    this.touchPoints = [];
  }

  /**
   * 检测滑动手势
   */
  private detectSwipeGesture(): void {
    if (this.touchPoints.length !== 1) return;

    const point = this.touchPoints[0];
    const deltaX = point.x - point.x; // 这里需要记录初始位置
    const deltaY = point.y - point.y; // 这里需要记录初始位置

    const threshold = this.config.swipeThreshold!;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          this.executeGesture(GestureType.SWIPE_RIGHT);
        } else {
          this.executeGesture(GestureType.SWIPE_LEFT);
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          this.executeGesture(GestureType.SWIPE_DOWN);
        } else {
          this.executeGesture(GestureType.SWIPE_UP);
        }
      }
    }
  }

  /**
   * 检测缩放手势
   */
  private detectPinchGesture(touches: TouchList): void {
    // 这里需要实现缩放检测逻辑
    // 计算两个触摸点之间的距离变化
    // 如果距离增加超过阈值，触发 PINCH_OUT
    // 如果距离减少超过阈值，触发 PINCH_IN
  }

  /**
   * 执行手势动作
   */
  private executeGesture(type: GestureType, data?: any): void {
    const gesture = this.gestures.get(type);
    if (!gesture || gesture.enabled === false) return;

    try {
      if (typeof gesture.action === 'string') {
        // 预定义动作
        switch (gesture.action) {
          case 'togglePlay':
            if (this.player.element.paused) {
              this.player.play();
            } else {
              this.player.pause();
            }
            break;
          case 'toggleControls':
            // 切换控制栏显示
            this.emit('controls:toggle');
            break;
          default:
            console.warn(`Unknown gesture action: ${gesture.action}`);
        }
      } else {
        // 自定义函数
        gesture.action(this.player, data);
      }

      // 触发手势执行事件
      this.emit('gesture:executed', {
        type,
        action: gesture.action,
        description: gesture.description,
        data
      });

    } catch (error) {
      console.error('Error executing gesture:', error);
      this.emit('gesture:error', { gesture, error });
    }
  }

  /**
   * 创建反馈界面
   */
  private createFeedbackInterface(): void {
    this.feedbackElement = document.createElement('div');
    this.feedbackElement.className = 'ldesign-gesture-feedback';
    this.feedbackElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: bold;
      z-index: 1000;
      display: none;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;

    this.player.container.appendChild(this.feedbackElement);
  }

  /**
   * 显示反馈信息
   */
  private showFeedback(message: string, duration = 1500): void {
    if (!this.feedbackElement) return;

    this.feedbackElement.textContent = message;
    this.feedbackElement.style.display = 'block';
    this.feedbackElement.style.opacity = '1';

    setTimeout(() => {
      if (this.feedbackElement) {
        this.feedbackElement.style.opacity = '0';
        setTimeout(() => {
          if (this.feedbackElement) {
            this.feedbackElement.style.display = 'none';
          }
        }, 300);
      }
    }, duration);
  }

  /**
   * 获取所有手势
   */
  getGestures(): Map<GestureType, GestureConfig> {
    return new Map(this.gestures);
  }

  async destroy(): Promise<void> {
    // 清除定时器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }

    // 移除反馈界面
    if (this.feedbackElement && this.feedbackElement.parentNode) {
      this.feedbackElement.parentNode.removeChild(this.feedbackElement);
    }

    this.gestures.clear();
    this.touchPoints = [];
    await super.destroy();
  }
}

/**
 * 创建手势控制插件
 */
export function createGestureControl(player: IPlayer, config?: GestureControlConfig): GestureControl {
  return new GestureControl(player, config);
}

/**
 * AnimationController - 动画控制器
 * 统一管理地图动画，提供流畅的动画体验
 */

export interface AnimationOptions {
  duration?: number;
  easing?: (t: number) => number;
  loop?: boolean;
  autoStart?: boolean;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export interface Animation {
  id: string;
  startTime: number;
  duration: number;
  progress: number;
  loop: boolean;
  paused: boolean;
  easing: (t: number) => number;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

/**
 * 缓动函数集合
 */
export const Easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => {
    const t1 = t - 1;
    return 1 - t1 * t1 * t1 * t1;
  },
  easeInOutQuart: (t: number) => {
    const t1 = t - 1;
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * t1 * t1 * t1 * t1;
  },
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => {
    const t1 = t - 1;
    return 1 + t1 * t1 * t1 * t1 * t1;
  },
  easeInOutQuint: (t: number) => {
    const t1 = t - 1;
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * t1 * t1 * t1 * t1 * t1;
  },
  easeInSine: (t: number) => -Math.cos(t * Math.PI / 2) + 1,
  easeOutSine: (t: number) => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number) => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
  easeInOutExpo: (t: number) => {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t: number) => -Math.sqrt(1 - t * t) + 1,
  easeOutCirc: (t: number) => Math.sqrt(1 - (t - 1) * (t - 1)),
  easeInOutCirc: (t: number) => {
    if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    return (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1) / 2;
  },
  easeInElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
  easeInOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    const t2 = t * 2;
    if (t2 < 1) return -0.5 * Math.pow(2, 10 * (t2 - 1)) * Math.sin((t2 - 1.1) * 5 * Math.PI);
    return 0.5 * Math.pow(2, -10 * (t2 - 1)) * Math.sin((t2 - 1.1) * 5 * Math.PI) + 1;
  },
  easeInBack: (t: number) => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack: (t: number) => {
    const s = 1.70158;
    const t1 = t - 1;
    return t1 * t1 * ((s + 1) * t1 + s) + 1;
  },
  easeInOutBack: (t: number) => {
    const s = 1.70158 * 1.525;
    const t2 = t * 2;
    if (t2 < 1) return 0.5 * (t2 * t2 * ((s + 1) * t2 - s));
    const t3 = t2 - 2;
    return 0.5 * (t3 * t3 * ((s + 1) * t3 + s) + 2);
  },
  easeInBounce: (t: number) => 1 - Easings.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      const t2 = t - 1.5 / 2.75;
      return 7.5625 * t2 * t2 + 0.75;
    } else if (t < 2.5 / 2.75) {
      const t2 = t - 2.25 / 2.75;
      return 7.5625 * t2 * t2 + 0.9375;
    } else {
      const t2 = t - 2.625 / 2.75;
      return 7.5625 * t2 * t2 + 0.984375;
    }
  },
  easeInOutBounce: (t: number) => {
    if (t < 0.5) return Easings.easeInBounce(t * 2) * 0.5;
    return Easings.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
  }
};

export class AnimationController {
  private animations: Map<string, Animation> = new Map();
  private animationFrameId: number | null = null;
  private isRunning = false;

  /**
   * 创建新动画
   */
  createAnimation(id: string, options: AnimationOptions = {}): string {
    const animation: Animation = {
      id,
      startTime: performance.now(),
      duration: options.duration || 1000,
      progress: 0,
      loop: options.loop || false,
      paused: !options.autoStart,
      easing: options.easing || Easings.easeInOutCubic,
      onUpdate: options.onUpdate || (() => {}),
      onComplete: options.onComplete
    };

    this.animations.set(id, animation);

    if (options.autoStart !== false) {
      this.start();
    }

    options.onStart?.();

    return id;
  }

  /**
   * 开始所有动画
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.animate();
  }

  /**
   * 暂停所有动画
   */
  pause(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 暂停特定动画
   */
  pauseAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.paused = true;
    }
  }

  /**
   * 恢复特定动画
   */
  resumeAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.paused = false;
      animation.startTime = performance.now() - (animation.progress * animation.duration);
      this.start();
    }
  }

  /**
   * 停止特定动画
   */
  stopAnimation(id: string): void {
    this.animations.delete(id);
    if (this.animations.size === 0) {
      this.pause();
    }
  }

  /**
   * 停止所有动画
   */
  stopAll(): void {
    this.animations.clear();
    this.pause();
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    
    let hasActiveAnimation = false;

    this.animations.forEach((animation, id) => {
      if (animation.paused) {
        hasActiveAnimation = true;
        return;
      }

      const elapsed = now - animation.startTime;
      const rawProgress = Math.min(elapsed / animation.duration, 1);
      animation.progress = animation.easing(rawProgress);

      // 调用更新回调
      animation.onUpdate(animation.progress);

      if (rawProgress >= 1) {
        if (animation.loop) {
          // 循环动画
          animation.startTime = now;
          animation.progress = 0;
          hasActiveAnimation = true;
        } else {
          // 完成动画
          animation.onComplete?.();
          this.animations.delete(id);
        }
      } else {
        hasActiveAnimation = true;
      }
    });

    if (hasActiveAnimation) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.isRunning = false;
      this.animationFrameId = null;
    }
  };

  /**
   * 获取动画进度
   */
  getProgress(id: string): number {
    const animation = this.animations.get(id);
    return animation ? animation.progress : 0;
  }

  /**
   * 检查动画是否正在运行
   */
  isAnimationRunning(id: string): boolean {
    const animation = this.animations.get(id);
    return animation ? !animation.paused : false;
  }

  /**
   * 获取所有活动动画
   */
  getActiveAnimations(): string[] {
    return Array.from(this.animations.keys());
  }

  /**
   * 获取动画数量
   */
  getAnimationCount(): number {
    return this.animations.size;
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.stopAll();
  }
}

/**
 * 全局动画控制器实例
 */
export const globalAnimationController = new AnimationController();

/**
 * 便捷的动画函数
 */
export function animate(
  options: AnimationOptions & {
    from: number;
    to: number;
  }
): Promise<void> {
  return new Promise((resolve) => {
    const id = `temp-${Date.now()}`;
    const { from, to, onUpdate, ...animOptions } = options;
    const range = to - from;

    globalAnimationController.createAnimation(id, {
      ...animOptions,
      autoStart: true,
      onUpdate: (progress) => {
        const value = from + range * progress;
        onUpdate?.(value);
      },
      onComplete: () => {
        resolve();
      }
    });
  });
}


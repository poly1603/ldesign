import type { LottieInstance } from './LottieInstance';

/**
 * 过渡效果类型
 */
export type TransitionType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'blur'
  | 'zoom'
  | 'flip'
  | 'morph'
  | 'custom';

/**
 * 过渡方向
 */
export type TransitionDirection = 'in' | 'out' | 'both';

/**
 * 缓动函数类型
 */
export type EasingFunction =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce';

/**
 * 过渡配置
 */
export interface TransitionConfig {
  /** 过渡类型 */
  type: TransitionType;
  /** 过渡方向 */
  direction?: TransitionDirection;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 缓动函数 */
  easing?: EasingFunction | ((t: number) => number);
  /** 自定义变换函数 */
  transform?: (progress: number, element: HTMLElement) => void;
  /** 完成回调 */
  onComplete?: () => void;
}

/**
 * 过渡效果管理器
 * 为 Lottie 动画提供各种过渡效果
 */
export class TransitionManager {
  private animation: LottieInstance;
  private container: HTMLElement;
  private transitionId: number | null = null;
  private startTime: number = 0;

  // 内置缓动函数
  private easingFunctions: Record<string, (t: number) => number> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInBack: (t) => {
      const c1 = 1.70158;
      return (c1 + 1) * t * t * t - c1 * t * t;
    },
    easeOutBack: (t) => {
      const c1 = 1.70158;
      return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t) => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    easeInElastic: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeInBounce: (t) => 1 - this.easingFunctions.easeOutBounce(1 - t),
    easeOutBounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
  };

  constructor(animation: LottieInstance) {
    this.animation = animation;
    this.container = animation.getContainer();
  }

  /**
   * 应用过渡效果
   */
  public async applyTransition(config: TransitionConfig): Promise<void> {
    const {
      type,
      direction = 'in',
      duration = 300,
      delay = 0,
      easing = 'easeInOut',
      transform,
      onComplete,
    } = config;

    // 延迟执行
    if (delay > 0) {
      await this.sleep(delay);
    }

    return new Promise((resolve) => {
      // 设置初始状态
      this.setInitialState(type, direction);

      this.startTime = performance.now();
      const easingFn = typeof easing === 'function' ? easing : this.easingFunctions[easing];

      const animate = (currentTime: number) => {
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFn(progress);

        // 应用过渡效果
        if (transform) {
          transform(easedProgress, this.container);
        } else {
          this.applyBuiltInTransition(type, direction, easedProgress);
        }

        if (progress < 1) {
          this.transitionId = requestAnimationFrame(animate);
        } else {
          this.setFinalState(type, direction);
          onComplete?.();
          resolve();
        }
      };

      this.transitionId = requestAnimationFrame(animate);
    });
  }

  /**
   * 淡入效果
   */
  public async fadeIn(duration: number = 300, easing: EasingFunction = 'easeInOut'): Promise<void> {
    return this.applyTransition({
      type: 'fade',
      direction: 'in',
      duration,
      easing,
    });
  }

  /**
   * 淡出效果
   */
  public async fadeOut(duration: number = 300, easing: EasingFunction = 'easeInOut'): Promise<void> {
    return this.applyTransition({
      type: 'fade',
      direction: 'out',
      duration,
      easing,
    });
  }

  /**
   * 滑入效果
   */
  public async slideIn(
    from: 'left' | 'right' | 'top' | 'bottom' = 'left',
    duration: number = 400
  ): Promise<void> {
    const transforms: Record<string, string> = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
    };

    this.container.style.transform = transforms[from];

    return this.applyTransition({
      type: 'slide',
      direction: 'in',
      duration,
      easing: 'easeOutBack',
      transform: (progress) => {
        const value = (1 - progress) * 100;
        const axis = from === 'left' || from === 'right' ? 'X' : 'Y';
        const sign = from === 'left' || from === 'top' ? '-' : '';
        this.container.style.transform = `translate${axis}(${sign}${value}%)`;
      },
    });
  }

  /**
   * 缩放效果
   */
  public async scale(
    from: number = 0,
    to: number = 1,
    duration: number = 300,
    easing: EasingFunction = 'easeOutBack'
  ): Promise<void> {
    return this.applyTransition({
      type: 'scale',
      direction: 'in',
      duration,
      easing,
      transform: (progress) => {
        const scale = from + (to - from) * progress;
        this.container.style.transform = `scale(${scale})`;
      },
    });
  }

  /**
   * 旋转效果
   */
  public async rotate(
    from: number = 0,
    to: number = 360,
    duration: number = 600,
    easing: EasingFunction = 'easeInOut'
  ): Promise<void> {
    return this.applyTransition({
      type: 'rotate',
      direction: 'in',
      duration,
      easing,
      transform: (progress) => {
        const rotation = from + (to - from) * progress;
        this.container.style.transform = `rotate(${rotation}deg)`;
      },
    });
  }

  /**
   * 模糊效果
   */
  public async blur(
    from: number = 10,
    to: number = 0,
    duration: number = 400,
    easing: EasingFunction = 'easeOut'
  ): Promise<void> {
    return this.applyTransition({
      type: 'blur',
      direction: 'in',
      duration,
      easing,
      transform: (progress) => {
        const blurAmount = from + (to - from) * progress;
        this.container.style.filter = `blur(${blurAmount}px)`;
      },
    });
  }

  /**
   * 翻转效果
   */
  public async flip(
    axis: 'X' | 'Y' = 'Y',
    duration: number = 500,
    easing: EasingFunction = 'easeInOut'
  ): Promise<void> {
    return this.applyTransition({
      type: 'flip',
      direction: 'in',
      duration,
      easing,
      transform: (progress) => {
        const rotation = progress * 180;
        this.container.style.transform = `rotate${axis}(${rotation}deg)`;
      },
    });
  }

  /**
   * 组合过渡（同时执行多个过渡）
   */
  public async composite(transitions: TransitionConfig[]): Promise<void> {
    const promises = transitions.map((config) => this.applyTransition(config));
    await Promise.all(promises);
  }

  /**
   * 序列过渡（按顺序执行多个过渡）
   */
  public async sequence(transitions: TransitionConfig[]): Promise<void> {
    for (const config of transitions) {
      await this.applyTransition(config);
    }
  }

  /**
   * 设置初始状态
   */
  private setInitialState(type: TransitionType, direction: TransitionDirection): void {
    switch (type) {
      case 'fade':
        this.container.style.opacity = direction === 'in' ? '0' : '1';
        break;
      case 'scale':
        this.container.style.transform = direction === 'in' ? 'scale(0)' : 'scale(1)';
        break;
    }
  }

  /**
   * 设置最终状态
   */
  private setFinalState(type: TransitionType, direction: TransitionDirection): void {
    switch (type) {
      case 'fade':
        this.container.style.opacity = direction === 'in' ? '1' : '0';
        break;
      case 'scale':
        this.container.style.transform = direction === 'in' ? 'scale(1)' : 'scale(0)';
        break;
      case 'slide':
        this.container.style.transform = 'translate(0, 0)';
        break;
      case 'blur':
        this.container.style.filter = 'none';
        break;
    }
  }

  /**
   * 应用内置过渡效果
   */
  private applyBuiltInTransition(
    type: TransitionType,
    direction: TransitionDirection,
    progress: number
  ): void {
    switch (type) {
      case 'fade':
        this.container.style.opacity = direction === 'in' ? String(progress) : String(1 - progress);
        break;
      case 'scale':
        const scale = direction === 'in' ? progress : 1 - progress;
        this.container.style.transform = `scale(${scale})`;
        break;
    }
  }

  /**
   * 停止当前过渡
   */
  public stop(): void {
    if (this.transitionId !== null) {
      cancelAnimationFrame(this.transitionId);
      this.transitionId = null;
    }
  }

  /**
   * 重置容器样式
   */
  public reset(): void {
    this.stop();
    this.container.style.opacity = '';
    this.container.style.transform = '';
    this.container.style.filter = '';
  }

  /**
   * 辅助方法：延迟执行
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

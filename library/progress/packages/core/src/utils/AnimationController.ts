import { EasingFunction, EasingFunctions } from '../types';

/**
 * 动画控制器
 */
export class AnimationController {
  private startTime: number = 0;
  private startValue: number = 0;
  private endValue: number = 0;
  private duration: number = 0;
  private easing: EasingFunction = EasingFunctions.easeOutQuad;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private pausedTime: number = 0;
  private onUpdate?: (value: number) => void;
  private onComplete?: () => void;

  /**
   * 启动动画
   */
  start(options: {
    from: number;
    to: number;
    duration: number;
    easing?: EasingFunction | keyof typeof EasingFunctions;
    onUpdate?: (value: number) => void;
    onComplete?: () => void;
  }): void {
    this.stop();

    this.startValue = options.from;
    this.endValue = options.to;
    this.duration = options.duration;
    this.onUpdate = options.onUpdate;
    this.onComplete = options.onComplete;

    if (typeof options.easing === 'string') {
      this.easing = EasingFunctions[options.easing] || EasingFunctions.linear;
    } else if (typeof options.easing === 'function') {
      this.easing = options.easing;
    }

    this.startTime = performance.now();
    this.isRunning = true;
    this.isPaused = false;
    this.animate();
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    if (!this.isRunning || this.isPaused) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    const easedProgress = this.easing(progress);
    const currentValue =
      this.startValue + (this.endValue - this.startValue) * easedProgress;

    if (this.onUpdate) {
      this.onUpdate(currentValue);
    }

    if (progress < 1) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.isRunning = false;
      if (this.onComplete) {
        this.onComplete();
      }
    }
  };

  /**
   * 暂停动画
   */
  pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.pausedTime = performance.now();
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      const pauseDuration = performance.now() - this.pausedTime;
      this.startTime += pauseDuration;
      this.animate();
    }
  }

  /**
   * 停止动画
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 重置动画
   */
  reset(): void {
    this.stop();
    this.startTime = 0;
    this.pausedTime = 0;
  }

  /**
   * 检查是否正在运行
   */
  isAnimating(): boolean {
    return this.isRunning && !this.isPaused;
  }
}



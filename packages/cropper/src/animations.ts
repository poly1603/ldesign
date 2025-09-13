/**
 * Animation and Transition System for Image Cropper
 * Provides smooth animations and micro-interactions
 */

// Animation configuration types
export enum EasingFunction {
  LINEAR = 'linear',
  EASE = 'ease',
  EASE_IN = 'ease-in',
  EASE_OUT = 'ease-out',
  EASE_IN_OUT = 'ease-in-out',
  CUBIC_BEZIER = 'cubic-bezier',
  SPRING = 'spring',
  BOUNCE = 'bounce'
}

export enum AnimationType {
  FADE = 'fade',
  SLIDE = 'slide',
  SCALE = 'scale',
  ROTATE = 'rotate',
  FLIP = 'flip',
  ZOOM = 'zoom',
  ELASTIC = 'elastic',
  PULSE = 'pulse',
  SHAKE = 'shake',
  WOBBLE = 'wobble'
}

export interface AnimationConfig {
  type: AnimationType;
  duration: number; // milliseconds
  easing: EasingFunction | string;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface TransitionConfig {
  property: string | string[];
  duration: number;
  easing: EasingFunction | string;
  delay?: number;
}

export interface SpringConfig {
  tension: number; // 弹性张力
  friction: number; // 摩擦力
  mass: number; // 质量
  velocity: number; // 初始速度
}

// Custom easing functions
export const EasingFunctions = {
  // Cubic bezier presets
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  
  // Spring animations
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  springGentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  springWobbly: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Bounce animations
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounceOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  // Custom ease functions
  anticipate: 'cubic-bezier(0.5, -0.5, 0.5, 1.5)',
  overshoot: 'cubic-bezier(0.5, 0, 0.5, 1.5)'
};

// Animation presets
export const AnimationPresets = {
  // Fade animations
  fadeIn: {
    type: AnimationType.FADE,
    duration: 300,
    easing: EasingFunction.EASE_OUT,
    fillMode: 'both'
  } as AnimationConfig,
  
  fadeOut: {
    type: AnimationType.FADE,
    duration: 300,
    easing: EasingFunction.EASE_IN,
    fillMode: 'both'
  } as AnimationConfig,
  
  // Slide animations
  slideInFromLeft: {
    type: AnimationType.SLIDE,
    duration: 400,
    easing: EasingFunctions.easeOutQuart,
    fillMode: 'both'
  } as AnimationConfig,
  
  slideInFromRight: {
    type: AnimationType.SLIDE,
    duration: 400,
    easing: EasingFunctions.easeOutQuart,
    fillMode: 'both'
  } as AnimationConfig,
  
  slideInFromTop: {
    type: AnimationType.SLIDE,
    duration: 400,
    easing: EasingFunctions.easeOutQuart,
    fillMode: 'both'
  } as AnimationConfig,
  
  slideInFromBottom: {
    type: AnimationType.SLIDE,
    duration: 400,
    easing: EasingFunctions.easeOutQuart,
    fillMode: 'both'
  } as AnimationConfig,
  
  // Scale animations
  scaleIn: {
    type: AnimationType.SCALE,
    duration: 300,
    easing: EasingFunctions.spring,
    fillMode: 'both'
  } as AnimationConfig,
  
  scaleOut: {
    type: AnimationType.SCALE,
    duration: 200,
    easing: EasingFunction.EASE_IN,
    fillMode: 'both'
  } as AnimationConfig,
  
  // Zoom animations
  zoomIn: {
    type: AnimationType.ZOOM,
    duration: 350,
    easing: EasingFunctions.easeOutCubic,
    fillMode: 'both'
  } as AnimationConfig,
  
  zoomOut: {
    type: AnimationType.ZOOM,
    duration: 250,
    easing: EasingFunction.EASE_IN,
    fillMode: 'both'
  } as AnimationConfig,
  
  // Elastic animations
  elasticIn: {
    type: AnimationType.ELASTIC,
    duration: 600,
    easing: EasingFunctions.springWobbly,
    fillMode: 'both'
  } as AnimationConfig,
  
  // Micro-interactions
  pulse: {
    type: AnimationType.PULSE,
    duration: 1000,
    easing: EasingFunction.EASE_IN_OUT,
    iterations: 'infinite',
    direction: 'alternate'
  } as AnimationConfig,
  
  shake: {
    type: AnimationType.SHAKE,
    duration: 500,
    easing: EasingFunction.EASE_IN_OUT,
    iterations: 3
  } as AnimationConfig,
  
  wobble: {
    type: AnimationType.WOBBLE,
    duration: 1000,
    easing: EasingFunction.EASE_IN_OUT,
    iterations: 1
  } as AnimationConfig
};

// Transition presets
export const TransitionPresets = {
  fast: {
    property: 'all',
    duration: 150,
    easing: EasingFunction.EASE_OUT
  } as TransitionConfig,
  
  medium: {
    property: 'all',
    duration: 300,
    easing: EasingFunction.EASE_OUT
  } as TransitionConfig,
  
  slow: {
    property: 'all',
    duration: 500,
    easing: EasingFunction.EASE_OUT
  } as TransitionConfig,
  
  spring: {
    property: 'all',
    duration: 400,
    easing: EasingFunctions.spring
  } as TransitionConfig,
  
  bounce: {
    property: 'all',
    duration: 600,
    easing: EasingFunctions.bounce
  } as TransitionConfig
};

// Animation Manager
export class AnimationManager {
  private activeAnimations: Map<string, Animation> = new Map();
  private animationCounter = 0;
  
  /**
   * 创建并播放动画
   */
  animate(
    element: HTMLElement,
    config: AnimationConfig,
    onComplete?: () => void
  ): string {
    const animationId = `animation-${++this.animationCounter}`;
    
    // 创建 CSS 动画
    const keyframes = this.generateKeyframes(config);
    const animation = element.animate(keyframes, {
      duration: config.duration,
      easing: config.easing,
      delay: config.delay || 0,
      iterations: config.iterations || 1,
      direction: config.direction || 'normal',
      fill: config.fillMode || 'none'
    });
    
    this.activeAnimations.set(animationId, animation);
    
    // 处理动画完成
    animation.addEventListener('finish', () => {
      this.activeAnimations.delete(animationId);
      onComplete?.();
    });
    
    // 处理动画取消
    animation.addEventListener('cancel', () => {
      this.activeAnimations.delete(animationId);
    });
    
    return animationId;
  }
  
  /**
   * 应用过渡效果
   */
  transition(
    element: HTMLElement,
    config: TransitionConfig,
    styles: Partial<CSSStyleDeclaration>
  ): void {
    const properties = Array.isArray(config.property) 
      ? config.property 
      : [config.property];
    
    // 设置过渡属性
    element.style.transitionProperty = properties.join(', ');
    element.style.transitionDuration = `${config.duration}ms`;
    element.style.transitionTimingFunction = config.easing;
    element.style.transitionDelay = `${config.delay || 0}ms`;
    
    // 应用样式变化
    Object.assign(element.style, styles);
  }
  
  /**
   * 创建弹簧动画
   */
  spring(
    element: HTMLElement,
    fromValue: number,
    toValue: number,
    config: SpringConfig,
    property: keyof CSSStyleDeclaration,
    unit: string = 'px',
    onUpdate?: (value: number) => void,
    onComplete?: () => void
  ): string {
    const animationId = `spring-${++this.animationCounter}`;
    let startTime: number;
    let currentValue = fromValue;
    let currentVelocity = config.velocity;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000; // Convert to seconds
      
      // Spring physics calculation
      const displacement = toValue - currentValue;
      const springForce = -config.tension * displacement;
      const dampingForce = -config.friction * currentVelocity;
      const acceleration = (springForce + dampingForce) / config.mass;
      
      currentVelocity += acceleration * (1/60); // Assume 60fps
      currentValue += currentVelocity * (1/60);
      
      // Update element
      (element.style as any)[property] = `${currentValue}${unit}`;
      onUpdate?.(currentValue);
      
      // Check if animation should continue
      const isNearTarget = Math.abs(displacement) < 0.01;
      const isSlowEnough = Math.abs(currentVelocity) < 0.01;
      
      if (isNearTarget && isSlowEnough) {
        // Animation complete
        (element.style as any)[property] = `${toValue}${unit}`;
        onComplete?.();
        this.activeAnimations.delete(animationId);
      } else {
        // Continue animation
        const rafId = requestAnimationFrame(animate);
        this.activeAnimations.set(animationId, { cancel: () => cancelAnimationFrame(rafId) } as Animation);
      }
    };
    
    requestAnimationFrame(animate);
    return animationId;
  }
  
  /**
   * 生成动画关键帧
   */
  private generateKeyframes(config: AnimationConfig): Keyframe[] {
    switch (config.type) {
      case AnimationType.FADE:
        return [
          { opacity: '0' },
          { opacity: '1' }
        ];
        
      case AnimationType.SLIDE:
        return [
          { transform: 'translateX(-100%)' },
          { transform: 'translateX(0)' }
        ];
        
      case AnimationType.SCALE:
        return [
          { transform: 'scale(0)' },
          { transform: 'scale(1)' }
        ];
        
      case AnimationType.ROTATE:
        return [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' }
        ];
        
      case AnimationType.FLIP:
        return [
          { transform: 'rotateY(0deg)' },
          { transform: 'rotateY(180deg)' }
        ];
        
      case AnimationType.ZOOM:
        return [
          { transform: 'scale(0.3)', opacity: '0' },
          { transform: 'scale(1.05)', opacity: '1', offset: 0.6 },
          { transform: 'scale(1)', opacity: '1' }
        ];
        
      case AnimationType.ELASTIC:
        return [
          { transform: 'scale(0)' },
          { transform: 'scale(1.25)', offset: 0.6 },
          { transform: 'scale(0.95)', offset: 0.8 },
          { transform: 'scale(1)' }
        ];
        
      case AnimationType.PULSE:
        return [
          { transform: 'scale(1)', opacity: '1' },
          { transform: 'scale(1.1)', opacity: '0.8' }
        ];
        
      case AnimationType.SHAKE:
        return [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-10px)', offset: 0.1 },
          { transform: 'translateX(10px)', offset: 0.2 },
          { transform: 'translateX(-10px)', offset: 0.3 },
          { transform: 'translateX(10px)', offset: 0.4 },
          { transform: 'translateX(-10px)', offset: 0.5 },
          { transform: 'translateX(10px)', offset: 0.6 },
          { transform: 'translateX(-10px)', offset: 0.7 },
          { transform: 'translateX(10px)', offset: 0.8 },
          { transform: 'translateX(-10px)', offset: 0.9 },
          { transform: 'translateX(0)' }
        ];
        
      case AnimationType.WOBBLE:
        return [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-5deg)', offset: 0.15 },
          { transform: 'rotate(3deg)', offset: 0.3 },
          { transform: 'rotate(-2deg)', offset: 0.45 },
          { transform: 'rotate(1deg)', offset: 0.6 },
          { transform: 'rotate(-1deg)', offset: 0.75 },
          { transform: 'rotate(0deg)' }
        ];
        
      default:
        return [
          { opacity: '0' },
          { opacity: '1' }
        ];
    }
  }
  
  /**
   * 取消动画
   */
  cancelAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation) {
      animation.cancel();
      this.activeAnimations.delete(animationId);
    }
  }
  
  /**
   * 取消所有动画
   */
  cancelAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.cancel());
    this.activeAnimations.clear();
  }
  
  /**
   * 获取活动动画数量
   */
  getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }
}

// Utility functions for common animation patterns
export class AnimationUtilities {
  
  /**
   * 创建交错动画（多个元素依次播放动画）
   */
  static staggerAnimation(
    elements: HTMLElement[],
    config: AnimationConfig,
    staggerDelay: number = 100,
    animationManager: AnimationManager
  ): string[] {
    const animationIds: string[] = [];
    
    elements.forEach((element, index) => {
      const staggeredConfig = {
        ...config,
        delay: (config.delay || 0) + (index * staggerDelay)
      };
      
      const animationId = animationManager.animate(element, staggeredConfig);
      animationIds.push(animationId);
    });
    
    return animationIds;
  }
  
  /**
   * 创建序列动画（动画依次播放）
   */
  static sequenceAnimation(
    animations: Array<{
      element: HTMLElement;
      config: AnimationConfig;
    }>,
    animationManager: AnimationManager,
    onComplete?: () => void
  ): void {
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex >= animations.length) {
        onComplete?.();
        return;
      }
      
      const { element, config } = animations[currentIndex];
      currentIndex++;
      
      animationManager.animate(element, config, playNext);
    };
    
    playNext();
  }
  
  /**
   * 创建并行动画（多个动画同时播放）
   */
  static parallelAnimation(
    animations: Array<{
      element: HTMLElement;
      config: AnimationConfig;
    }>,
    animationManager: AnimationManager,
    onComplete?: () => void
  ): string[] {
    const animationIds: string[] = [];
    let completedCount = 0;
    const totalAnimations = animations.length;
    
    animations.forEach(({ element, config }) => {
      const animationId = animationManager.animate(element, config, () => {
        completedCount++;
        if (completedCount === totalAnimations) {
          onComplete?.();
        }
      });
      animationIds.push(animationId);
    });
    
    return animationIds;
  }
  
  /**
   * 创建循环动画
   */
  static loopAnimation(
    element: HTMLElement,
    config: AnimationConfig,
    loopCount: number,
    animationManager: AnimationManager,
    onComplete?: () => void
  ): void {
    let currentLoop = 0;
    
    const playLoop = () => {
      if (currentLoop >= loopCount) {
        onComplete?.();
        return;
      }
      
      currentLoop++;
      animationManager.animate(element, config, playLoop);
    };
    
    playLoop();
  }
  
  /**
   * 创建缓动数值动画
   */
  static animateValue(
    from: number,
    to: number,
    duration: number,
    easing: string = EasingFunction.EASE_OUT,
    onUpdate: (value: number) => void,
    onComplete?: () => void
  ): void {
    const startTime = performance.now();
    const change = to - from;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing function
      const easedProgress = this.applyEasing(progress, easing);
      const currentValue = from + (change * easedProgress);
      
      onUpdate(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * 应用缓动函数
   */
  private static applyEasing(t: number, easing: string): number {
    switch (easing) {
      case EasingFunction.LINEAR:
        return t;
      case EasingFunction.EASE_IN:
        return t * t;
      case EasingFunction.EASE_OUT:
        return t * (2 - t);
      case EasingFunction.EASE_IN_OUT:
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t; // Fallback to linear
    }
  }
  
  /**
   * 创建页面过渡动画
   */
  static pageTransition(
    currentPage: HTMLElement,
    nextPage: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down' = 'right',
    duration: number = 400,
    animationManager: AnimationManager,
    onComplete?: () => void
  ): void {
    const exitConfig: AnimationConfig = {
      type: AnimationType.SLIDE,
      duration,
      easing: EasingFunctions.easeInOutCubic,
      fillMode: 'forwards'
    };
    
    const enterConfig: AnimationConfig = {
      type: AnimationType.SLIDE,
      duration,
      easing: EasingFunctions.easeInOutCubic,
      fillMode: 'forwards'
    };
    
    // 设置初始状态
    nextPage.style.position = 'absolute';
    nextPage.style.top = '0';
    nextPage.style.left = '0';
    nextPage.style.width = '100%';
    nextPage.style.height = '100%';
    
    // 根据方向设置变换
    const transforms = {
      left: { exit: 'translateX(-100%)', enter: 'translateX(100%)' },
      right: { exit: 'translateX(100%)', enter: 'translateX(-100%)' },
      up: { exit: 'translateY(-100%)', enter: 'translateY(100%)' },
      down: { exit: 'translateY(100%)', enter: 'translateY(-100%)' }
    };
    
    const transform = transforms[direction];
    
    // 设置下一页的初始位置
    nextPage.style.transform = transform.enter;
    nextPage.style.visibility = 'visible';
    
    let completedAnimations = 0;
    const onAnimationComplete = () => {
      completedAnimations++;
      if (completedAnimations === 2) {
        currentPage.style.display = 'none';
        nextPage.style.position = 'relative';
        nextPage.style.transform = 'none';
        onComplete?.();
      }
    };
    
    // 播放退出动画
    currentPage.animate([
      { transform: 'translateX(0)' },
      { transform: transform.exit }
    ], {
      duration,
      easing: EasingFunctions.easeInOutCubic,
      fill: 'forwards'
    }).addEventListener('finish', onAnimationComplete);
    
    // 播放进入动画
    nextPage.animate([
      { transform: transform.enter },
      { transform: 'translateX(0)' }
    ], {
      duration,
      easing: EasingFunctions.easeInOutCubic,
      fill: 'forwards'
    }).addEventListener('finish', onAnimationComplete);
  }
}

// Global animation manager instance
export const globalAnimationManager = new AnimationManager();

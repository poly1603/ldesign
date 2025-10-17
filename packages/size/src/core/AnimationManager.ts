/**
 * @ldesign/size - Animation Manager
 * 
 * Handles smooth transitions when changing size configurations
 */


export interface AnimationOptions {
  duration?: number;
  easing?: string;
  enabled?: boolean;
  properties?: string[];
}

const DEFAULT_OPTIONS: AnimationOptions = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enabled: true,
  properties: [
    'font-size',
    'padding',
    'margin',
    'width',
    'height',
    'border-radius',
    'gap',
    'line-height',
    'letter-spacing'
  ]
};

export class AnimationManager {
  private options: AnimationOptions;
  private styleElement: HTMLStyleElement | null = null;
  private isTransitioning = false;

  constructor(options: AnimationOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Enable smooth transitions for size changes
   */
  enableTransitions(): void {
    if (!this.options.enabled || typeof document === 'undefined') return;

    const css = this.generateTransitionCSS();
    
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'ldesign-size-transitions';
      document.head.appendChild(this.styleElement);
    }

    this.styleElement.textContent = css;
    this.isTransitioning = true;
  }

  /**
   * Disable transitions temporarily
   */
  disableTransitions(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
    this.isTransitioning = false;
  }

  /**
   * Perform a size change with animation
   */
  async animateSizeChange(
    beforeChange: () => void,
    afterChange?: () => void
  ): Promise<void> {
    if (!this.options.enabled) {
      beforeChange();
      afterChange?.();
      return;
    }

    // Disable transitions to capture initial state
    this.disableTransitions();
    
    // Force reflow
    if (typeof document !== 'undefined') {
      void document.body.offsetHeight;
    }

    // Enable transitions
    this.enableTransitions();

    // Apply the change
    beforeChange();

    // Wait for transition to complete
    await this.waitForTransition();

    // Cleanup
    if (afterChange) {
      afterChange();
    }
  }

  /**
   * Wait for transitions to complete
   */
  private async waitForTransition(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, this.options.duration || 300);
    });
  }

  /**
   * Generate CSS for transitions
   */
  private generateTransitionCSS(): string {
    const properties = this.options.properties?.join(', ') || 'all';
    const duration = this.options.duration || 300;
    const easing = this.options.easing || 'ease';

    return `
      * {
        transition-property: ${properties};
        transition-duration: ${duration}ms;
        transition-timing-function: ${easing};
      }
      
      /* Specific optimized transitions */
      :root {
        transition: none !important;
      }
      
      body,
      body * {
        transition-property: ${properties};
        transition-duration: ${duration}ms;
        transition-timing-function: ${easing};
      }
      
      /* Disable transitions for certain elements */
      img,
      video,
      iframe,
      canvas,
      svg {
        transition: none !important;
      }
      
      /* Performance optimization */
      .no-transition,
      .no-transition * {
        transition: none !important;
      }
    `;
  }

  /**
   * Update animation options
   */
  setOptions(options: AnimationOptions): void {
    this.options = { ...this.options, ...options };
    
    if (this.isTransitioning) {
      this.enableTransitions();
    }
  }

  /**
   * Get current options
   */
  getOptions(): AnimationOptions {
    return { ...this.options };
  }

  /**
   * Check if transitions are active
   */
  isActive(): boolean {
    return this.isTransitioning;
  }

  /**
   * Destroy the animation manager
   */
  destroy(): void {
    this.disableTransitions();
    this.options = DEFAULT_OPTIONS;
  }
}

// Singleton instance
let animationManager: AnimationManager | null = null;

/**
 * Get animation manager instance
 */
export function getAnimationManager(): AnimationManager {
  if (!animationManager) {
    animationManager = new AnimationManager();
  }
  return animationManager;
}

/**
 * Quick animation helper
 */
export const animate = {
  /**
   * Enable animations
   */
  enable: () => getAnimationManager().enableTransitions(),
  
  /**
   * Disable animations
   */
  disable: () => getAnimationManager().disableTransitions(),
  
  /**
   * Animate a change
   */
  change: (fn: () => void, after?: () => void) => 
    getAnimationManager().animateSizeChange(fn, after),
  
  /**
   * Set animation options
   */
  config: (options: AnimationOptions) => 
    getAnimationManager().setOptions(options)
};
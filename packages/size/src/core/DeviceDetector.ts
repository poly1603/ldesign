/**
 * @ldesign/size - Device Detection & Viewport Management
 * 
 * Advanced device detection and responsive breakpoint management
 */

import type { 
  DeviceType, 
  DeviceOrientation, 
  Viewport, 
  Breakpoint,
  ResponsiveBreakpoints 
} from '../types';

/**
 * Default responsive breakpoints
 */
export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  xs: { name: 'xs', min: 0, max: 575, unit: 'px', device: 'mobile' },
  sm: { name: 'sm', min: 576, max: 767, unit: 'px', device: 'mobile' },
  md: { name: 'md', min: 768, max: 991, unit: 'px', device: 'tablet' },
  lg: { name: 'lg', min: 992, max: 1199, unit: 'px', device: 'laptop' },
  xl: { name: 'xl', min: 1200, max: 1919, unit: 'px', device: 'desktop' },
  xxl: { name: 'xxl', min: 1920, max: 2559, unit: 'px', device: 'desktop' },
  xxxl: { name: 'xxxl', min: 2560, unit: 'px', device: 'widescreen' }
};

/**
 * Device detection class
 */
export class DeviceDetector {
  private viewport: Viewport;
  private breakpoints: ResponsiveBreakpoints;
  private listeners: Set<(viewport: Viewport) => void> = new Set();
  private resizeObserver: ResizeObserver | null = null;
  private mediaQueries: Map<string, MediaQueryList> = new Map();

  constructor(breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS) {
    this.breakpoints = breakpoints;
    this.viewport = this.detectViewport();
    
    if (typeof window !== 'undefined') {
      this.setupListeners();
      this.setupMediaQueries();
    }
  }

  /**
   * Detect current viewport information
   */
  private detectViewport(): Viewport {
    if (typeof window === 'undefined') {
      return this.getDefaultViewport();
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      device: this.getDeviceType(width),
      orientation: this.getOrientation(width, height),
      pixelRatio: window.devicePixelRatio || 1,
      touch: this.isTouchDevice()
    };
  }

  /**
   * Get device type based on width
   */
  private getDeviceType(width: number): DeviceType {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'laptop';
    if (width < 1920) return 'desktop';
    if (width < 2560) return 'widescreen';
    return 'tv';
  }

  /**
   * Get device orientation
   */
  private getOrientation(width: number, height: number): DeviceOrientation {
    return width > height ? 'landscape' : 'portrait';
  }

  /**
   * Check if device supports touch
   */
  private isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  /**
   * Get default viewport for SSR
   */
  private getDefaultViewport(): Viewport {
    return {
      width: 1366,
      height: 768,
      device: 'laptop',
      orientation: 'landscape',
      pixelRatio: 1,
      touch: false
    };
  }

  /**
   * Setup viewport change listeners
   */
  private setupListeners(): void {
    // Window resize listener
    const handleResize = this.debounce(() => {
      this.updateViewport();
    }, 150);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // ResizeObserver for more accurate detection
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateViewport();
      });
      this.resizeObserver.observe(document.documentElement);
    }
  }

  /**
   * Setup media query listeners
   */
  private setupMediaQueries(): void {
    Object.entries(this.breakpoints).forEach(([key, breakpoint]) => {
      if (!breakpoint) return;
      
      let query = '';
      if (breakpoint.min !== undefined && breakpoint.max !== undefined) {
        query = `(min-width: ${breakpoint.min}${breakpoint.unit || 'px'}) and (max-width: ${breakpoint.max}${breakpoint.unit || 'px'})`;
      } else if (breakpoint.min !== undefined) {
        query = `(min-width: ${breakpoint.min}${breakpoint.unit || 'px'})`;
      } else if (breakpoint.max !== undefined) {
        query = `(max-width: ${breakpoint.max}${breakpoint.unit || 'px'})`;
      }

      if (query) {
        const mql = window.matchMedia(query);
        this.mediaQueries.set(key, mql);
        
        mql.addEventListener('change', () => {
          this.updateViewport();
        });
      }
    });
  }

  /**
   * Update viewport information
   */
  private updateViewport(): void {
    const newViewport = this.detectViewport();
    
    // Check if viewport has actually changed
    if (
      this.viewport.width !== newViewport.width ||
      this.viewport.height !== newViewport.height ||
      this.viewport.device !== newViewport.device ||
      this.viewport.orientation !== newViewport.orientation
    ) {
      this.viewport = newViewport;
      this.notifyListeners();
    }
  }

  /**
   * Notify listeners of viewport changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.viewport));
  }

  /**
   * Debounce utility
   */
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T {
    let timeout: ReturnType<typeof setTimeout> | null;
    
    return function (this: any, ...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        func.apply(this, args);
      };
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    } as T;
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Get current viewport
   */
  getViewport(): Viewport {
    return { ...this.viewport };
  }

  /**
   * Get current device type
   */
  getDevice(): DeviceType {
    return this.viewport.device;
  }

  /**
   * Get current orientation
   */
  getOrientation(): DeviceOrientation {
    return this.viewport.orientation;
  }

  /**
   * Check if viewport matches breakpoint
   */
  matchesBreakpoint(breakpoint: keyof ResponsiveBreakpoints): boolean {
    const mql = this.mediaQueries.get(breakpoint);
    return mql ? mql.matches : false;
  }

  /**
   * Get active breakpoint
   */
  getActiveBreakpoint(): string | null {
    for (const [key, mql] of this.mediaQueries.entries()) {
      if (mql.matches) return key;
    }
    return null;
  }

  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    return this.viewport.device === 'mobile';
  }

  /**
   * Check if device is tablet
   */
  isTablet(): boolean {
    return this.viewport.device === 'tablet';
  }

  /**
   * Check if device is desktop
   */
  isDesktop(): boolean {
    return ['laptop', 'desktop', 'widescreen', 'tv'].includes(this.viewport.device);
  }

  /**
   * Check if device supports touch
   */
  isTouch(): boolean {
    return this.viewport.touch;
  }

  /**
   * Check if device supports hover
   */
  supportsHover(): boolean {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(hover: hover)').matches;
  }

  /**
   * Get pixel density
   */
  getPixelRatio(): number {
    return this.viewport.pixelRatio;
  }

  /**
   * Check if high DPI screen
   */
  isRetina(): boolean {
    return this.viewport.pixelRatio >= 2;
  }

  /**
   * Subscribe to viewport changes
   */
  onChange(listener: (viewport: Viewport) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get viewport size category
   */
  getSizeCategory(): 'small' | 'medium' | 'large' | 'extra-large' {
    const width = this.viewport.width;
    if (width < 768) return 'small';
    if (width < 1200) return 'medium';
    if (width < 1920) return 'large';
    return 'extra-large';
  }

  /**
   * Get recommended base font size
   */
  getBaseFontSize(): number {
    const device = this.viewport.device;
    const isHighDPI = this.isRetina();
    
    switch (device) {
      case 'mobile':
        return isHighDPI ? 16 : 14;
      case 'tablet':
        return 16;
      case 'laptop':
      case 'desktop':
        return 16;
      case 'widescreen':
      case 'tv':
        return isHighDPI ? 18 : 16;
      default:
        return 16;
    }
  }

  /**
   * Get recommended touch target size
   */
  getTouchTargetSize(): number {
    if (!this.isTouch()) return 32;
    
    const device = this.viewport.device;
    switch (device) {
      case 'mobile':
        return 44; // iOS Human Interface Guidelines
      case 'tablet':
        return 48; // Material Design
      default:
        return 44;
    }
  }

  /**
   * Destroy detector
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    this.mediaQueries.clear();
    this.listeners.clear();
  }
}

// Create singleton instance
let detector: DeviceDetector | null = null;

/**
 * Get device detector instance
 */
export function getDeviceDetector(): DeviceDetector {
  if (!detector) {
    detector = new DeviceDetector();
  }
  return detector;
}

/**
 * Quick access helpers
 */
export const device = {
  get viewport() { return getDeviceDetector().getViewport(); },
  get type() { return getDeviceDetector().getDevice(); },
  get orientation() { return getDeviceDetector().getOrientation(); },
  get isMobile() { return getDeviceDetector().isMobile(); },
  get isTablet() { return getDeviceDetector().isTablet(); },
  get isDesktop() { return getDeviceDetector().isDesktop(); },
  get isTouch() { return getDeviceDetector().isTouch(); },
  get isRetina() { return getDeviceDetector().isRetina(); },
  get baseFontSize() { return getDeviceDetector().getBaseFontSize(); }
};
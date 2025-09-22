/**
 * 工具函数模块导出
 */

export * from './eventUtils';
export * from './performance';
export * from './accessibility';
export * from './benchmark';
export * from './memoryMonitor';
export * from './videoLoader';
export * from './virtualScroll';

// 重新导出常用工具函数
export {
  debounce,
  throttle,
  formatTime,
  formatBytes,
  isFullscreenSupported,
  isPictureInPictureSupported,
  isMobile,
  isTouch,
  getVideoMimeType,
  loadScript,
  loadCSS
} from './eventUtils';

export {
  PerformanceMonitor,
  MemoryMonitor,
  LazyLoader,
  VirtualScroller,
  ImageOptimizer
} from './performance';

export {
  KeyboardNavigationManager,
  ScreenReaderSupport,
  HighContrastDetector,
  ReducedMotionDetector,
  FocusManager,
  screenReaderSupport,
  highContrastDetector,
  reducedMotionDetector,
  focusManager
} from './accessibility';

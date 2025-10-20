/**
 * Hotspot marker in the panorama
 */
export interface Hotspot {
  /** Unique identifier */
  id: string;
  /** Position in spherical coordinates (theta: horizontal angle, phi: vertical angle) */
  position: { theta: number; phi: number };
  /** Text label */
  label?: string;
  /** Custom data */
  data?: any;
  /** Custom icon/element */
  element?: HTMLElement;
}

/**
 * View limits for restricting camera movement
 */
export interface ViewLimits {
  /** Minimum horizontal angle in radians */
  minTheta?: number;
  /** Maximum horizontal angle in radians */
  maxTheta?: number;
  /** Minimum vertical angle in radians */
  minPhi?: number;
  /** Maximum vertical angle in radians */
  maxPhi?: number;
}

/**
 * Image format types
 */
export type ImageFormat = 'equirectangular' | 'cubemap';

/**
 * Cubemap image sources
 */
export interface CubemapImages {
  px: string; // positive x
  nx: string; // negative x
  py: string; // positive y
  ny: string; // negative y
  pz: string; // positive z
  nz: string; // negative z
}

/**
 * Loading progress callback
 */
export type LoadingProgressCallback = (progress: number) => void;

/**
 * Options for initializing the PanoramaViewer
 */
export interface ViewerOptions {
  /** The container element to render the viewer in */
  container: HTMLElement;
  /** URL or path to the panorama image */
  image: string | CubemapImages;
  /** Image format type (default: 'equirectangular') */
  format?: ImageFormat;
  /** Field of view in degrees (default: 75) */
  fov?: number;
  /** Minimum field of view for zoom (default: 30) */
  minFov?: number;
  /** Maximum field of view for zoom (default: 100) */
  maxFov?: number;
  /** Enable auto rotation (default: false) */
  autoRotate?: boolean;
  /** Auto rotation speed (default: 0.5) */
  autoRotateSpeed?: number;
  /** Enable gyroscope controls on mobile (default: true) */
  gyroscope?: boolean;
  /** Enable damping/inertia for smooth movement (default: true) */
  enableDamping?: boolean;
  /** Damping factor (default: 0.05) */
  dampingFactor?: number;
  /** View limits for restricting camera movement */
  viewLimits?: ViewLimits;
  /** Enable keyboard controls (default: true) */
  keyboardControls?: boolean;
  /** Loading progress callback */
  onProgress?: LoadingProgressCallback;
  /** Enable render on demand for better performance (default: true) */
  renderOnDemand?: boolean;
  /** Maximum texture size (default: 4096) */
  maxTextureSize?: number;
  /** Enable performance monitoring (default: false) */
  enablePerformanceMonitor?: boolean;
  /** Show performance stats overlay (default: false) */
  showPerformanceStats?: boolean;
  /** Enable adaptive quality (default: false) */
  enableAdaptiveQuality?: boolean;
  /** Initial quality preset (default: 'high') */
  qualityPreset?: 'ultra' | 'high' | 'medium' | 'low';
  /** Enable WebWorker texture loading (default: true) */
  useWebWorker?: boolean;
  /** Enable advanced gesture recognition (default: false) */
  advancedGestures?: boolean;
  /** Enable GPU instanced hotspots (default: true) */
  useGPUInstancing?: boolean;
  /** Images to preload in background */
  preloadImages?: string[];
}

/**
 * Event types emitted by the viewer
 */
export interface ViewerEvents {
  ready: void;
  error: Error;
  change: void;
}

/**
 * Public API interface for the viewer
 */
export interface IPanoramaViewer {
  // Image and scene control
  /** Load a new panorama image */
  loadImage(url: string | CubemapImages, transition?: boolean): Promise<void>;
  /** Preload images for faster switching */
  preloadImages(urls: string[]): Promise<void>;
  
  // Camera control
  /** Reset camera to initial position */
  reset(): void;
  /** Get the current camera rotation */
  getRotation(): { x: number; y: number; z: number };
  /** Set the camera rotation */
  setRotation(x: number, y: number, z: number): void;
  /** Animate camera along path */
  animateCameraPath(path: any[]): void;
  
  // Auto rotation
  /** Enable auto rotation */
  enableAutoRotate(): void;
  /** Disable auto rotation */
  disableAutoRotate(): void;
  
  // Gyroscope
  /** Enable gyroscope controls (mobile only) */
  enableGyroscope(): Promise<boolean>;
  /** Disable gyroscope controls */
  disableGyroscope(): void;
  
  // Hotspots
  /** Add a hotspot marker */
  addHotspot(hotspot: Hotspot): void;
  /** Remove a hotspot by ID */
  removeHotspot(id: string): void;
  /** Get all hotspots */
  getHotspots(): Hotspot[];
  
  // Fullscreen
  /** Enter fullscreen mode */
  enterFullscreen(): Promise<void>;
  /** Exit fullscreen mode */
  exitFullscreen(): void;
  /** Check if in fullscreen */
  isFullscreen(): boolean;
  
  // Screenshot
  /** Take a screenshot */
  screenshot(width?: number, height?: number): string;
  
  // View limits
  /** Set view limits */
  setViewLimits(limits: ViewLimits | null): void;
  
  // Mini map
  /** Show mini map */
  showMiniMap(): void;
  /** Hide mini map */
  hideMiniMap(): void;
  /** Toggle mini map visibility */
  toggleMiniMap(): void;
  
  // Color adjustment
  /** Set brightness (-1 to 1) */
  setBrightness(value: number): void;
  /** Set contrast (-1 to 1) */
  setContrast(value: number): void;
  /** Set saturation (-1 to 1) */
  setSaturation(value: number): void;
  /** Set exposure (-2 to 2) */
  setExposure(value: number): void;
  /** Reset color adjustments */
  resetColorAdjustments(): void;
  
  // Watermark
  /** Show watermark */
  showWatermark(options?: any): void;
  /** Hide watermark */
  hideWatermark(): void;
  
  // Performance
  /** Get performance stats */
  getPerformanceStats(): any;
  /** Show/hide performance overlay */
  togglePerformanceOverlay(): void;
  /** Set quality preset */
  setQualityPreset(preset: 'ultra' | 'high' | 'medium' | 'low'): void;
  
  // Rendering
  /** Force render (useful when renderOnDemand is enabled) */
  render(): void;
  
  // Cleanup
  /** Destroy the viewer and clean up resources */
  dispose(): void;
}


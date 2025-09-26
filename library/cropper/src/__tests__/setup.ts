/**
 * @ldesign/cropper 测试设置文件
 * 
 * 配置测试环境和全局模拟
 */

import { vi } from 'vitest';

// ============================================================================
// DOM 环境设置
// ============================================================================

// 模拟 Canvas API
class MockCanvasRenderingContext2D {
  canvas = {
    width: 300,
    height: 150,
    style: {},
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    toBlob: vi.fn((callback) => {
      const blob = new Blob(['mock'], { type: 'image/png' });
      callback(blob);
    }),
    getContext: vi.fn(() => this),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };

  // 绘制方法
  fillRect = vi.fn();
  clearRect = vi.fn();
  strokeRect = vi.fn();
  fillText = vi.fn();
  strokeText = vi.fn();
  drawImage = vi.fn();

  // 路径方法
  beginPath = vi.fn();
  closePath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  arc = vi.fn();
  arcTo = vi.fn();
  bezierCurveTo = vi.fn();
  quadraticCurveTo = vi.fn();
  rect = vi.fn();
  ellipse = vi.fn();

  // 填充和描边
  fill = vi.fn();
  stroke = vi.fn();
  clip = vi.fn();

  // 变换方法
  save = vi.fn();
  restore = vi.fn();
  scale = vi.fn();
  rotate = vi.fn();
  translate = vi.fn();
  transform = vi.fn();
  setTransform = vi.fn();
  resetTransform = vi.fn();

  // 样式属性
  fillStyle = '#000000';
  strokeStyle = '#000000';
  lineWidth = 1;
  lineCap = 'butt';
  lineJoin = 'miter';
  miterLimit = 10;
  lineDashOffset = 0;
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  shadowBlur = 0;
  shadowColor = 'rgba(0, 0, 0, 0)';
  globalAlpha = 1;
  globalCompositeOperation = 'source-over';
  font = '10px sans-serif';
  textAlign = 'start';
  textBaseline = 'alphabetic';
  direction = 'inherit';
  imageSmoothingEnabled = true;
  imageSmoothingQuality = 'low';

  // 方法
  setLineDash = vi.fn();
  getLineDash = vi.fn(() => []);
  createLinearGradient = vi.fn();
  createRadialGradient = vi.fn();
  createPattern = vi.fn();
  measureText = vi.fn(() => ({ width: 100 }));
  isPointInPath = vi.fn(() => false);
  isPointInStroke = vi.fn(() => false);
  getImageData = vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  }));
  putImageData = vi.fn();
  createImageData = vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  }));
}

// 模拟 HTMLElement
global.HTMLElement = class MockHTMLElement {
  tagName = 'DIV';
  style = {};
  classList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    toggle: vi.fn()
  };

  appendChild = vi.fn();
  removeChild = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();

  getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    bottom: 100,
    left: 0,
    toJSON: () => { }
  }));
} as any;

// 模拟 HTMLCanvasElement
global.HTMLCanvasElement = class MockHTMLCanvasElement extends (global.HTMLElement as any) {
  width = 300;
  height = 150;

  getContext = vi.fn((type: string) => {
    if (type === '2d') {
      return new MockCanvasRenderingContext2D();
    }
    return null;
  });

  toDataURL = vi.fn(() => 'data:image/png;base64,mock');
  toBlob = vi.fn((callback: (blob: Blob) => void) => {
    const blob = new Blob(['mock'], { type: 'image/png' });
    callback(blob);
  });
} as any;

// 模拟 HTMLImageElement
global.HTMLImageElement = class MockHTMLImageElement extends (global.HTMLElement as any) {
  src = '';
  width = 0;
  height = 0;
  naturalWidth = 0;
  naturalHeight = 0;
  complete = false;
  crossOrigin = null;

  constructor() {
    super();
    // 模拟图片加载
    setTimeout(() => {
      this.complete = true;
      this.width = 100;
      this.height = 100;
      this.naturalWidth = 100;
      this.naturalHeight = 100;
      this.dispatchEvent(new Event('load'));
    }, 0);
  }
} as any;

// 模拟 Image 构造函数
global.Image = global.HTMLImageElement;

// 模拟 File API
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(bits: BlobPart[], filename: string, options: FilePropertyBag = {}) {
    this.name = filename;
    this.size = bits.reduce((size, bit) => size + (typeof bit === 'string' ? bit.length : bit.byteLength || 0), 0);
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
  }

  arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(0)));
  text = vi.fn(() => Promise.resolve(''));
  stream = vi.fn();
  slice = vi.fn();
} as any;

// 模拟 ImageData
global.ImageData = class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(width: number, height: number);
  constructor(data: Uint8ClampedArray, width: number, height?: number);
  constructor(dataOrWidth: Uint8ClampedArray | number, width: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = width;
      this.data = new Uint8ClampedArray(dataOrWidth * width * 4);
    } else {
      this.data = dataOrWidth;
      this.width = width;
      this.height = height || dataOrWidth.length / (width * 4);
    }
  }
} as any;

// 模拟 FileReader
global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState = 0;

  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onabort: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onloadstart: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onprogress: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL = vi.fn((file: File) => {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mock`;
      this.readyState = 2;
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  });

  readAsText = vi.fn();
  readAsArrayBuffer = vi.fn();
  readAsBinaryString = vi.fn();
  abort = vi.fn();

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
} as any;

// ============================================================================
// 浏览器 API 模拟
// ============================================================================

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => callback(performance.now()), 16);
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// 模拟 requestIdleCallback
global.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50
    } as IdleDeadline);
  }, 0);
});

global.cancelIdleCallback = vi.fn((id: number) => {
  clearTimeout(id);
});

// 模拟 ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    // 可以在这里添加模拟逻辑
  }
} as any;

// 模拟 IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    // 可以在这里添加模拟逻辑
  }
} as any;

// 模拟 MutationObserver
global.MutationObserver = class MockMutationObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(callback: MutationCallback) {
    // 可以在这里添加模拟逻辑
  }
} as any;

// ============================================================================
// 设备和浏览器信息模拟
// ============================================================================

// 模拟 navigator
Object.defineProperty(global.navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  writable: true
});

Object.defineProperty(global.navigator, 'platform', {
  value: 'Win32',
  writable: true
});

Object.defineProperty(global.navigator, 'maxTouchPoints', {
  value: 0,
  writable: true
});

Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true
});

// 模拟 screen
Object.defineProperty(global.screen, 'width', {
  value: 1920,
  writable: true
});

Object.defineProperty(global.screen, 'height', {
  value: 1080,
  writable: true
});

Object.defineProperty(global.screen, 'availWidth', {
  value: 1920,
  writable: true
});

Object.defineProperty(global.screen, 'availHeight', {
  value: 1040,
  writable: true
});

Object.defineProperty(global.screen, 'colorDepth', {
  value: 24,
  writable: true
});

// 模拟 devicePixelRatio
Object.defineProperty(global.window, 'devicePixelRatio', {
  value: 1,
  writable: true
});

// 模拟 performance
Object.defineProperty(global.performance, 'memory', {
  value: {
    usedJSHeapSize: 10000000,
    totalJSHeapSize: 20000000,
    jsHeapSizeLimit: 100000000
  },
  writable: true
});

// ============================================================================
// 事件模拟
// ============================================================================

// 模拟触摸事件
global.TouchEvent = class MockTouchEvent extends Event {
  touches: TouchList;
  targetTouches: TouchList;
  changedTouches: TouchList;

  constructor(type: string, eventInitDict?: TouchEventInit) {
    super(type, eventInitDict);
    this.touches = (eventInitDict?.touches || []) as any;
    this.targetTouches = (eventInitDict?.targetTouches || []) as any;
    this.changedTouches = (eventInitDict?.changedTouches || []) as any;
  }
} as any;

// 模拟指针事件
global.PointerEvent = class MockPointerEvent extends MouseEvent {
  pointerId: number;
  width: number;
  height: number;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pointerType: string;
  isPrimary: boolean;

  constructor(type: string, eventInitDict?: PointerEventInit) {
    super(type, eventInitDict);
    this.pointerId = eventInitDict?.pointerId || 0;
    this.width = eventInitDict?.width || 1;
    this.height = eventInitDict?.height || 1;
    this.pressure = eventInitDict?.pressure || 0;
    this.tangentialPressure = eventInitDict?.tangentialPressure || 0;
    this.tiltX = eventInitDict?.tiltX || 0;
    this.tiltY = eventInitDict?.tiltY || 0;
    this.twist = eventInitDict?.twist || 0;
    this.pointerType = eventInitDict?.pointerType || 'mouse';
    this.isPrimary = eventInitDict?.isPrimary || false;
  }
} as any;

// ============================================================================
// 测试工具函数
// ============================================================================

/**
 * 创建模拟的 DOM 元素
 */
export function createMockElement(tagName: string = 'div'): HTMLElement {
  const element = document.createElement(tagName);

  // 添加一些常用的模拟方法
  element.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    bottom: 100,
    left: 0,
    toJSON: () => { }
  }));

  return element;
}

/**
 * 创建模拟的图片元素
 */
export function createMockImage(src: string = 'test.jpg'): HTMLImageElement {
  const img = new Image();
  img.src = src;
  img.width = 100;
  img.height = 100;
  img.naturalWidth = 100;
  img.naturalHeight = 100;
  img.complete = true;
  return img;
}

/**
 * 创建模拟的文件对象
 */
export function createMockFile(
  name: string = 'test.jpg',
  type: string = 'image/jpeg',
  size: number = 1024
): File {
  return new File(['x'.repeat(size)], name, { type });
}

/**
 * 等待下一个事件循环
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * 模拟异步延迟
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// 全局测试配置
// ============================================================================

// 设置测试超时
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000
});

// 在每个测试后清理模拟
afterEach(() => {
  vi.clearAllMocks();
});

// 在所有测试后清理
afterAll(() => {
  vi.restoreAllMocks();
});

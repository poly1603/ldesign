/**
 * 测试环境设置
 * 为 Vitest 提供必要的 DOM API 模拟
 */

import { vi } from 'vitest';

// 模拟 HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
});

// 模拟视频属性
Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
  writable: true,
  value: 0,
});

Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
  writable: true,
  value: 100,
});

Object.defineProperty(HTMLVideoElement.prototype, 'volume', {
  writable: true,
  value: 1,
});

Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
  writable: true,
  value: false,
});

Object.defineProperty(HTMLVideoElement.prototype, 'paused', {
  writable: true,
  value: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'ended', {
  writable: true,
  value: false,
});

Object.defineProperty(HTMLVideoElement.prototype, 'readyState', {
  writable: true,
  value: 4, // HAVE_ENOUGH_DATA
});

// 模拟全屏 API
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

// 模拟画中画 API
Object.defineProperty(HTMLVideoElement.prototype, 'requestPictureInPicture', {
  writable: true,
  value: vi.fn().mockResolvedValue({}),
});

Object.defineProperty(document, 'exitPictureInPicture', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

// 模拟 MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
}));

// 模拟 URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// 模拟 Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  drawImage: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
  putImageData: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
});

HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback) => {
  callback(new Blob(['mock'], { type: 'image/png' }));
});

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// 模拟 sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn().mockImplementation(id => clearTimeout(id));

// 模拟 performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn().mockReturnValue(Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn().mockReturnValue([]),
    getEntriesByType: vi.fn().mockReturnValue([]),
  },
});

// 模拟 console 方法（避免测试输出干扰）
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

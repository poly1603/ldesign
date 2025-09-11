/**
 * Vitest测试环境设置文件
 * 配置全局测试环境和模拟对象
 */

import { vi } from 'vitest';

// 模拟Canvas API
class MockCanvasRenderingContext2D {
  canvas = {
    width: 800,
    height: 600,
    style: {},
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
  };

  // 绘制方法
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
  
  // 变换
  save = vi.fn();
  restore = vi.fn();
  scale = vi.fn();
  rotate = vi.fn();
  translate = vi.fn();
  transform = vi.fn();
  setTransform = vi.fn();
  resetTransform = vi.fn();
  
  // 样式
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
  
  // 文本
  fillText = vi.fn();
  strokeText = vi.fn();
  measureText = vi.fn(() => ({ width: 100 }));
  
  // 图像
  drawImage = vi.fn();
  
  // 像素操作
  createImageData = vi.fn();
  getImageData = vi.fn();
  putImageData = vi.fn();
  
  // 路径
  isPointInPath = vi.fn(() => false);
  isPointInStroke = vi.fn(() => false);
  
  // 线条样式
  setLineDash = vi.fn();
  getLineDash = vi.fn(() => []);
  
  // 清除
  clearRect = vi.fn();
  fillRect = vi.fn();
  strokeRect = vi.fn();
}

// 设置全局模拟
global.CanvasRenderingContext2D = MockCanvasRenderingContext2D as any;

// 模拟requestAnimationFrame和cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 16);
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// 模拟ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// 模拟IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// 模拟window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1
});

// 模拿document.createElement
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'canvas') {
    const canvas = originalCreateElement.call(document, 'canvas');
    // 添加mock方法
    canvas.getContext = vi.fn((contextType: string) => {
      if (contextType === '2d') {
        return new MockCanvasRenderingContext2D();
      }
      return null;
    });
    canvas.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
    canvas.toBlob = vi.fn();
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
    return canvas;
  }
  return originalCreateElement.call(document, tagName);
});

// 设置测试超时时间
vi.setConfig({
  testTimeout: 10000
});

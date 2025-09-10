import { vi } from 'vitest';

// Mock DOM APIs
const mockCtx = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  clip: vi.fn(),
  setLineDash: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  lineDashOffset: 0,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  font: '',
  textAlign: 'center',
  textBaseline: 'middle',
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 }))
};

// Basic mock element
function createMockElement(tag: string) {
  return {
    tagName: tag.toUpperCase(),
    style: {} as Record<string, any>,
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    remove: vi.fn(),
    addEventListener: vi.fn(),
    querySelector: vi.fn(() => null),
    getBoundingClientRect: vi.fn(() => ({ width: 100, height: 100 }))
  } as any;
}

// Mock SVG element creation
function createMockSVGElement(tag: string) {
  const element = createMockElement(tag);

  // Add SVG-specific properties and methods
  switch (tag.toLowerCase()) {
    case 'svg':
      return new (global as any).SVGElement();
    case 'path':
      return new (global as any).SVGPathElement();
    case 'circle':
      return new (global as any).SVGCircleElement();
    case 'text':
      return new (global as any).SVGTextElement();
    case 'rect':
      return new (global as any).SVGRectElement();
    case 'defs':
      return new (global as any).SVGDefsElement();
    case 'linearGradient':
      return new (global as any).SVGLinearGradientElement();
    case 'radialGradient':
      return new (global as any).SVGRadialGradientElement();
    case 'stop':
      return new (global as any).SVGStopElement();
    default:
      return new (global as any).SVGElement();
  }
}

// Mock document
global.document = {
  createElement: (tag: string) => {
    if (tag.toLowerCase() === 'canvas') {
      return new (global as any).HTMLCanvasElement();
    }
    return createMockElement(tag);
  },
  createElementNS: (ns: string, tag: string) => {
    if (ns === 'http://www.w3.org/2000/svg') {
      return createMockSVGElement(tag);
    }
    return createMockElement(tag);
  },
  querySelector: vi.fn(() => null),
  body: createMockElement('body')
} as any;

// Mock HTMLCanvasElement
global.HTMLCanvasElement = class HTMLCanvasElement {
  width = 300;
  height = 150;
  style: Record<string, any> = {};
  getContext() {
    return { ...mockCtx } as any;
  }
  setAttribute = vi.fn();
  appendChild = vi.fn();
  toDataURL() {
    return 'data:image/png;base64,test';
  }
  remove() { }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
} as any;

// RAF
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance.now
global.performance = {
  now: vi.fn(() => Date.now())
} as any;

// Mock Image
global.Image = class Image {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 0;
  height = 0;
} as any;

// Mock Path2D
global.Path2D = class Path2D {
  constructor(path?: string) {
    // Mock implementation
  }
  addPath() { }
  closePath() { }
  moveTo() { }
  lineTo() { }
  bezierCurveTo() { }
  quadraticCurveTo() { }
  arc() { }
  arcTo() { }
  ellipse() { }
  rect() { }
} as any;

// Mock SVG Elements
global.SVGElement = class SVGElement {
  style: Record<string, any> = {};
  setAttribute = vi.fn();
  getAttribute = vi.fn(() => '');
  appendChild = vi.fn();
  remove = vi.fn();
  addEventListener = vi.fn();
  querySelector = vi.fn(() => null);
  getBoundingClientRect = vi.fn(() => ({ width: 100, height: 100 }));
} as any;

global.SVGPathElement = class SVGPathElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

global.SVGCircleElement = class SVGCircleElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

global.SVGTextElement = class SVGTextElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

global.SVGRectElement = class SVGRectElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

global.SVGDefsElement = class SVGDefsElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

global.SVGLinearGradientElement = class SVGLinearGradientElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

global.SVGRadialGradientElement = class SVGRadialGradientElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

global.SVGStopElement = class SVGStopElement extends (global as any).SVGElement {
  constructor() {
    super();
  }
} as any;

/**
 * Vitest 测试环境设置
 */

import { vi } from 'vitest'

// 设置全局变量
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock Canvas API with comprehensive context support
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      getExtension: vi.fn(),
      getParameter: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      createProgram: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      drawArrays: vi.fn(),
      clear: vi.fn(),
      clearColor: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      blendFunc: vi.fn(),
      viewport: vi.fn()
    }
  }

  // 2D context
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn()
  }
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({}),
  text: vi.fn().mockResolvedValue(''),
  blob: vi.fn().mockResolvedValue(new Blob())
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock window.matchMedia
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
    dispatchEvent: vi.fn()
  }))
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16)
  return 1
})

global.cancelAnimationFrame = vi.fn()

// Mock performance
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => [])
  }
})

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.VITEST = 'true'

// 测试工具函数
export function createMockMapContainer(): HTMLElement {
  const container = new MockHTMLElement();
  container.id = 'test-map-container';
  container.tagName = 'DIV';
  container.nodeType = 1;
  container.style = { width: '800px', height: '600px' };
  container.offsetWidth = 800;
  container.offsetHeight = 600;

  // 确保 document.body 存在
  if (!document.body) {
    document.body = new MockHTMLElement();
    document.body.tagName = 'BODY';
  }

  // Mock querySelector 返回我们创建的容器
  const originalQuerySelector = document.querySelector;
  document.querySelector = vi.fn().mockImplementation((selector: string) => {
    if (selector === '#test-map-container' || selector === container.id) {
      return container;
    }
    return originalQuerySelector?.call(document, selector) || null;
  });

  return container as HTMLElement;
}

export function createMockMapConfig(overrides: any = {}): any {
  return {
    container: overrides.container || createMockMapContainer(),
    center: overrides.center || [116.404, 39.915],
    zoom: overrides.zoom || 10,
    minZoom: overrides.minZoom || 1,
    maxZoom: overrides.maxZoom || 20,
    projection: overrides.projection || 'EPSG:3857',
    theme: overrides.theme || 'default',
    ...overrides
  };
}

export function cleanupTestEnvironment(): void {
  // 清理 DOM 元素
  if (document.body) {
    const containers = document.body.querySelectorAll('[id*="test-map"]');
    containers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
  }

  // 清理全局变量
  vi.clearAllMocks();

  // 清理定时器
  vi.clearAllTimers();
}

// Mock Node 常量
global.Node = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};

// Mock HTMLElement 构造函数
class MockHTMLElement {
  nodeType = 1;
  tagName = 'DIV';
  style: any = {};
  offsetWidth = 800;
  offsetHeight = 600;
  id = '';
  className = '';

  appendChild(child: any) {
    return child;
  }

  removeChild(child: any) {
    return child;
  }

  querySelector(selector: string) {
    return null;
  }

  querySelectorAll(selector: string) {
    return [];
  }

  addEventListener(event: string, handler: any) {
    // Mock implementation
  }

  removeEventListener(event: string, handler: any) {
    // Mock implementation
  }
}

global.HTMLElement = MockHTMLElement;

// 确保 document.body 存在
if (!document.body) {
  document.body = new MockHTMLElement();
  document.body.tagName = 'BODY';
}

console.log('Test environment setup completed')

import { vi } from 'vitest'
import type { TemplateMetadata, TemplateConfig, DeviceType } from '../types'

// 模拟模板数据
export const mockTemplates: TemplateMetadata[] = [
  {
    id: 'default-login',
    name: 'default',
    displayName: '默认登录模板',
    category: 'login',
    device: 'desktop' as DeviceType,
    version: 'v1.0.0',
    author: 'ldesign',
    description: '简洁的默认登录模板',
    tags: ['简洁', '默认'],
    preview: '/previews/default-login.png',
    componentPath: '/templates/login/desktop/default/index.vue',
    configPath: '/templates/login/desktop/default/config.ts',
    componentLoader: () => Promise.resolve({ default: {} }),
    lastModified: Date.now(),
    isBuiltIn: true,
  },
  {
    id: 'creative-login',
    name: 'creative',
    displayName: '创意设计登录模板',
    category: 'login',
    device: 'desktop' as DeviceType,
    version: 'v1.0.0',
    author: 'ldesign',
    description: '富有创意的登录模板设计',
    tags: ['创意', '设计'],
    preview: '/previews/creative-login.png',
    componentPath: '/templates/login/desktop/creative/index.vue',
    configPath: '/templates/login/desktop/creative/config.ts',
    componentLoader: () => Promise.resolve({ default: {} }),
    lastModified: Date.now(),
    isBuiltIn: true,
  },
  {
    id: 'minimal-login',
    name: 'minimal',
    displayName: '极简登录模板',
    category: 'login',
    device: 'mobile' as DeviceType,
    version: 'v1.0.0',
    author: 'ldesign',
    description: '极简风格的移动端登录模板',
    tags: ['极简', '移动端'],
    preview: '/previews/minimal-login.png',
    componentPath: '/templates/login/mobile/minimal/index.vue',
    configPath: '/templates/login/mobile/minimal/config.ts',
    componentLoader: () => Promise.resolve({ default: {} }),
    lastModified: Date.now(),
    isBuiltIn: true,
  },
]

// 模拟模板配置
export const mockTemplateConfig: TemplateConfig = {
  templatesDir: '../src/templates',
  autoScan: true,
  enableHMR: true,
  enableCache: true,
  enablePerformanceMonitor: true,
  enableDevtools: true,
  defaultDevice: 'desktop',
  defaultCategory: 'login',
  animation: {
    enable: true,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cache: {
    enable: true,
    maxSize: 50,
    ttl: 300000,
  },
  performance: {
    enable: true,
    threshold: 100,
    enableMemoryMonitor: true,
  },
}

// 模拟选择器配置
export const mockSelectorConfig: import('../types').TemplateSelectorConfig = {
  theme: 'default',
  position: 'center',
  triggerStyle: 'dropdown',
  modalStyle: 'overlay',
  animation: 'slide',
  showSearch: true,
  showTags: true,
  showSort: true,
}

// 模拟 Vue 组件
export const mockVueComponent = {
  name: 'MockTemplate',
  template: '<div class="mock-template">Mock Template Content</div>',
  setup() {
    return {}
  },
}

// 模拟异步组件加载
export const mockAsyncComponent = vi.fn(() =>
  Promise.resolve({ default: mockVueComponent })
)

// 模拟模板扫描器
export const mockTemplateScanner = {
  scan: vi.fn(() => Promise.resolve(mockTemplates)),
  watch: vi.fn(),
  unwatch: vi.fn(),
  getTemplates: vi.fn(() => mockTemplates),
  getTemplatesByCategory: vi.fn((category: string) =>
    mockTemplates.filter(t => t.category === category)
  ),
  getTemplatesByDevice: vi.fn((device: string) =>
    mockTemplates.filter(t => t.device === device)
  ),
}

// 模拟配置管理器
export const mockConfigManager = {
  getConfig: vi.fn(() => mockTemplateConfig),
  updateConfig: vi.fn(),
  watchConfig: vi.fn(),
  unwatchConfig: vi.fn(),
}

// 模拟缓存管理器
export const mockCacheManager = {
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(() => false),
  delete: vi.fn(),
  clear: vi.fn(),
  size: vi.fn(() => 0),
}

// 模拟性能监控器
export const mockPerformanceMonitor = {
  start: vi.fn(),
  end: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getMetrics: vi.fn(() => ({})),
  clear: vi.fn(),
}

// 模拟动画管理器
export const mockAnimationManager = {
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  reset: vi.fn(),
  setDuration: vi.fn(),
  setEasing: vi.fn(),
}

// 模拟设备检测器
export const mockDeviceDetector = {
  getDevice: vi.fn(() => 'desktop'),
  isMobile: vi.fn(() => false),
  isTablet: vi.fn(() => false),
  isDesktop: vi.fn(() => true),
  getScreenSize: vi.fn(() => ({ width: 1920, height: 1080 })),
}

// 模拟事件总线
export const mockEventBus = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  once: vi.fn(),
  clear: vi.fn(),
}

// 创建模拟的 useTemplate 返回值
export const createMockUseTemplate = (overrides = {}) => ({
  currentTemplate: mockTemplates[0],
  currentComponent: mockVueComponent,
  loading: false,
  error: null,
  showSelector: false,
  selectorConfig: mockSelectorConfig,
  availableTemplates: mockTemplates,
  switchTemplate: vi.fn(),
  refreshTemplates: vi.fn(),
  openSelector: vi.fn(),
  closeSelector: vi.fn(),
  TemplateTransition: mockVueComponent,
  ...overrides,
})

// 创建模拟的 DOM 元素
export const createMockElement = (tagName = 'div', attributes = {}) => {
  const element = document.createElement(tagName)
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value))
  })
  return element
}

// 模拟 CSS 动画
export const mockCSSAnimation = {
  play: vi.fn(),
  pause: vi.fn(),
  cancel: vi.fn(),
  finish: vi.fn(),
  reverse: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  playState: 'running',
  currentTime: 0,
  duration: 300,
}

// 模拟 Intersection Observer 条目
export const mockIntersectionEntry = {
  target: createMockElement(),
  isIntersecting: true,
  intersectionRatio: 1,
  boundingClientRect: { top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 },
  intersectionRect: { top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 },
  rootBounds: { top: 0, left: 0, right: 1920, bottom: 1080, width: 1920, height: 1080 },
  time: Date.now(),
}

export default {
  mockTemplates,
  mockTemplateConfig,
  mockSelectorConfig,
  mockVueComponent,
  mockAsyncComponent,
  mockTemplateScanner,
  mockConfigManager,
  mockCacheManager,
  mockPerformanceMonitor,
  mockAnimationManager,
  mockDeviceDetector,
  mockEventBus,
  createMockUseTemplate,
  createMockElement,
  mockCSSAnimation,
  mockIntersectionEntry,
}

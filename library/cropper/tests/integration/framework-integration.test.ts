/**
 * @ldesign/cropper 多框架集成测试
 * 
 * 测试Vue 3、React、Angular适配器的集成功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// 模拟Vue 3环境
const mockVue = {
  ref: vi.fn((value) => ({ value })),
  reactive: vi.fn((obj) => obj),
  onMounted: vi.fn((fn) => fn()),
  onUnmounted: vi.fn((fn) => fn()),
  watch: vi.fn(),
  computed: vi.fn((fn) => ({ value: fn() })),
  defineComponent: vi.fn((options) => options),
  createApp: vi.fn(() => ({
    mount: vi.fn(),
    unmount: vi.fn(),
    use: vi.fn(),
    provide: vi.fn(),
    component: vi.fn()
  })),
  h: vi.fn()
};

// 模拟React环境
const mockReact = {
  useState: vi.fn((initial) => [initial, vi.fn()]),
  useEffect: vi.fn((fn, deps) => fn()),
  useRef: vi.fn(() => ({ current: null })),
  useCallback: vi.fn((fn) => fn),
  useMemo: vi.fn((fn) => fn()),
  forwardRef: vi.fn((component) => component),
  createElement: vi.fn(),
  Component: class Component {},
  createContext: vi.fn(() => ({
    Provider: vi.fn(),
    Consumer: vi.fn()
  }))
};

// 模拟Angular环境
const mockAngular = {
  Component: vi.fn((config) => (target: any) => target),
  Directive: vi.fn((config) => (target: any) => target),
  Injectable: vi.fn(() => (target: any) => target),
  Input: vi.fn(() => (target: any, key: string) => {}),
  Output: vi.fn(() => (target: any, key: string) => {}),
  EventEmitter: vi.fn(() => ({
    emit: vi.fn(),
    subscribe: vi.fn()
  })),
  NgModule: vi.fn((config) => (target: any) => target),
  Pipe: vi.fn((config) => (target: any) => target)
};

describe('Framework Integration Tests', () => {
  let dom: JSDOM;
  let container: HTMLDivElement;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    global.window = dom.window as any;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
    global.Image = dom.window.Image;

    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // 模拟全局框架对象
    (global as any).Vue = mockVue;
    (global as any).React = mockReact;
    (global as any).ng = { core: mockAngular };
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // 清理全局对象
    delete (global as any).Vue;
    delete (global as any).React;
    delete (global as any).ng;
  });

  describe('Vue 3 Integration', () => {
    it('should create Vue adapter successfully', async () => {
      const { createVueAdapter } = await import('../../src/adapters/vue');
      
      const adapter = createVueAdapter({
        container,
        config: {
          theme: 'light',
          enableGestures: true
        }
      });

      expect(adapter).toBeDefined();
      expect(adapter.component).toBeDefined();
      expect(adapter.composable).toBeDefined();
      expect(adapter.directive).toBeDefined();
    });

    it('should provide useCropper composable', async () => {
      const { createVueAdapter } = await import('../../src/adapters/vue');
      
      const adapter = createVueAdapter({ container });
      const { useCropper } = adapter.composable;

      // 模拟组合式API调用
      const cropperRef = useCropper({
        theme: 'dark',
        onReady: vi.fn(),
        onCropChange: vi.fn()
      });

      expect(cropperRef).toBeDefined();
      expect(mockVue.ref).toHaveBeenCalled();
      expect(mockVue.onMounted).toHaveBeenCalled();
    });

    it('should create Vue component with proper props', async () => {
      const { createVueAdapter } = await import('../../src/adapters/vue');
      
      const adapter = createVueAdapter({ container });
      const component = adapter.component;

      expect(component.props).toBeDefined();
      expect(component.props).toHaveProperty('config');
      expect(component.props).toHaveProperty('src');
      expect(component.props).toHaveProperty('theme');
      expect(component.emits).toContain('ready');
      expect(component.emits).toContain('cropChange');
    });

    it('should register Vue directive', async () => {
      const { createVueAdapter } = await import('../../src/adapters/vue');
      
      const adapter = createVueAdapter({ container });
      const directive = adapter.directive;

      expect(directive).toBeDefined();
      expect(directive.mounted).toBeInstanceOf(Function);
      expect(directive.updated).toBeInstanceOf(Function);
      expect(directive.unmounted).toBeInstanceOf(Function);
    });

    it('should install Vue plugin correctly', async () => {
      const { createVueAdapter } = await import('../../src/adapters/vue');
      
      const adapter = createVueAdapter({ container });
      const app = mockVue.createApp();
      
      adapter.install(app, {
        theme: 'dark',
        globalConfig: { enableGestures: true }
      });

      expect(app.component).toHaveBeenCalledWith('LCropper', adapter.component);
      expect(app.provide).toHaveBeenCalled();
    });
  });

  describe('React Integration', () => {
    it('should create React adapter successfully', async () => {
      const { createReactAdapter } = await import('../../src/adapters/react');
      
      const adapter = createReactAdapter({
        container,
        config: {
          theme: 'light',
          enableGestures: true
        }
      });

      expect(adapter).toBeDefined();
      expect(adapter.component).toBeDefined();
      expect(adapter.hook).toBeDefined();
      expect(adapter.hoc).toBeDefined();
    });

    it('should provide useCropper hook', async () => {
      const { createReactAdapter } = await import('../../src/adapters/react');
      
      const adapter = createReactAdapter({ container });
      const { useCropper } = adapter.hook;

      // 模拟Hook调用
      const cropperRef = useCropper({
        config: { theme: 'dark' },
        onReady: vi.fn(),
        onCropChange: vi.fn()
      });

      expect(cropperRef).toBeDefined();
      expect(mockReact.useRef).toHaveBeenCalled();
      expect(mockReact.useEffect).toHaveBeenCalled();
    });

    it('should create React component with proper props', async () => {
      const { createReactAdapter } = await import('../../src/adapters/react');
      
      const adapter = createReactAdapter({ container });
      const Component = adapter.component;

      // 模拟组件渲染
      const props = {
        config: { theme: 'light' },
        src: 'test-image.jpg',
        onReady: vi.fn(),
        onCropChange: vi.fn()
      };

      expect(Component).toBeInstanceOf(Function);
      expect(mockReact.forwardRef).toHaveBeenCalled();
    });

    it('should provide HOC wrapper', async () => {
      const { createReactAdapter } = await import('../../src/adapters/react');
      
      const adapter = createReactAdapter({ container });
      const { withCropper } = adapter.hoc;

      const TestComponent = () => null;
      const WrappedComponent = withCropper(TestComponent);

      expect(WrappedComponent).toBeInstanceOf(Function);
      expect(WrappedComponent.displayName).toContain('withCropper');
    });

    it('should create React context provider', async () => {
      const { createReactAdapter } = await import('../../src/adapters/react');
      
      const adapter = createReactAdapter({ container });
      const { CropperProvider } = adapter.context;

      expect(CropperProvider).toBeDefined();
      expect(mockReact.createContext).toHaveBeenCalled();
    });
  });

  describe('Angular Integration', () => {
    it('should create Angular adapter successfully', async () => {
      const { createAngularAdapter } = await import('../../src/adapters/angular');
      
      const adapter = createAngularAdapter({
        container,
        config: {
          theme: 'light',
          enableGestures: true
        }
      });

      expect(adapter).toBeDefined();
      expect(adapter.component).toBeDefined();
      expect(adapter.directive).toBeDefined();
      expect(adapter.service).toBeDefined();
    });

    it('should create Angular component with proper decorators', async () => {
      const { createAngularAdapter } = await import('../../src/adapters/angular');
      
      const adapter = createAngularAdapter({ container });
      const component = adapter.component;

      expect(component).toBeDefined();
      expect(mockAngular.Component).toHaveBeenCalled();
      expect(mockAngular.Input).toHaveBeenCalled();
      expect(mockAngular.Output).toHaveBeenCalled();
    });

    it('should create Angular directive', async () => {
      const { createAngularAdapter } = await import('../../src/adapters/angular');
      
      const adapter = createAngularAdapter({ container });
      const directive = adapter.directive;

      expect(directive).toBeDefined();
      expect(mockAngular.Directive).toHaveBeenCalled();
    });

    it('should create Angular service', async () => {
      const { createAngularAdapter } = await import('../../src/adapters/angular');
      
      const adapter = createAngularAdapter({ container });
      const service = adapter.service;

      expect(service).toBeDefined();
      expect(mockAngular.Injectable).toHaveBeenCalled();
    });

    it('should create Angular module', async () => {
      const { createAngularAdapter } = await import('../../src/adapters/angular');
      
      const adapter = createAngularAdapter({ container });
      const module = adapter.module;

      expect(module).toBeDefined();
      expect(mockAngular.NgModule).toHaveBeenCalled();
    });

    it('should create Angular pipe', async () => {
      const { createAngularAdapter } = await import('../../src/adapters/angular');
      
      const adapter = createAngularAdapter({ container });
      const pipe = adapter.pipe;

      expect(pipe).toBeDefined();
      expect(mockAngular.Pipe).toHaveBeenCalled();
    });
  });

  describe('Cross-Framework Compatibility', () => {
    it('should detect framework correctly', async () => {
      const { detectFramework } = await import('../../src/adapters');

      // 测试Vue检测
      (global as any).Vue = { version: '3.0.0' };
      expect(detectFramework()).toBe('vue');

      // 测试React检测
      delete (global as any).Vue;
      (global as any).React = { version: '18.0.0' };
      expect(detectFramework()).toBe('react');

      // 测试Angular检测
      delete (global as any).React;
      (global as any).ng = { core: { VERSION: { major: 17 } } };
      expect(detectFramework()).toBe('angular');

      // 测试默认情况
      delete (global as any).ng;
      expect(detectFramework()).toBe('vanilla');
    });

    it('should create auto adapter based on framework', async () => {
      const { createAutoAdapter } = await import('../../src/adapters');

      // 测试Vue自动适配
      (global as any).Vue = mockVue;
      const vueAdapter = createAutoAdapter({ container });
      expect(vueAdapter).toBeDefined();

      // 测试React自动适配
      delete (global as any).Vue;
      (global as any).React = mockReact;
      const reactAdapter = createAutoAdapter({ container });
      expect(reactAdapter).toBeDefined();

      // 测试Angular自动适配
      delete (global as any).React;
      (global as any).ng = { core: mockAngular };
      const angularAdapter = createAutoAdapter({ container });
      expect(angularAdapter).toBeDefined();
    });

    it('should handle framework version compatibility', async () => {
      const { isFrameworkSupported } = await import('../../src/adapters');

      // 测试支持的版本
      expect(isFrameworkSupported('vue', '3.0.0')).toBe(true);
      expect(isFrameworkSupported('react', '18.0.0')).toBe(true);
      expect(isFrameworkSupported('angular', '17.0.0')).toBe(true);

      // 测试不支持的版本
      expect(isFrameworkSupported('vue', '2.6.0')).toBe(false);
      expect(isFrameworkSupported('react', '16.0.0')).toBe(false);
      expect(isFrameworkSupported('angular', '12.0.0')).toBe(false);
    });
  });

  describe('Adapter Lifecycle', () => {
    it('should handle adapter creation and destruction', async () => {
      const { CropperAdapterFactory } = await import('../../src/adapters');

      const factory = new CropperAdapterFactory();
      
      // 创建适配器
      const adapter = factory.createAdapter('vue', { container });
      expect(adapter).toBeDefined();

      // 测试生命周期方法
      if (adapter.mount) {
        adapter.mount();
      }
      
      if (adapter.unmount) {
        adapter.unmount();
      }

      if (adapter.destroy) {
        adapter.destroy();
      }
    });

    it('should handle adapter configuration updates', async () => {
      const { createVueAdapter } = await import('../../src/adapters/vue');
      
      const adapter = createVueAdapter({ container });
      
      // 测试配置更新
      if (adapter.updateConfig) {
        adapter.updateConfig({
          theme: 'dark',
          enableGestures: false
        });
      }

      expect(adapter).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported framework gracefully', async () => {
      const { createAutoAdapter } = await import('../../src/adapters');

      // 清除所有框架
      delete (global as any).Vue;
      delete (global as any).React;
      delete (global as any).ng;

      expect(() => {
        createAutoAdapter({ container });
      }).not.toThrow();
    });

    it('should handle missing dependencies', async () => {
      // 测试缺少框架依赖的情况
      const originalVue = (global as any).Vue;
      delete (global as any).Vue;

      try {
        const { createVueAdapter } = await import('../../src/adapters/vue');
        expect(() => {
          createVueAdapter({ container });
        }).not.toThrow();
      } finally {
        (global as any).Vue = originalVue;
      }
    });
  });
});

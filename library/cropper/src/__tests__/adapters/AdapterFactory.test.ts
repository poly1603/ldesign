/**
 * @ldesign/cropper 适配器工厂测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CropperAdapterFactory,
  AdapterRegistry,
  detectFramework,
  createAutoAdapter,
  isFrameworkSupported,
  getSupportedFrameworks
} from '../../adapters';
import type { FrameworkType, AdapterConfig } from '../../types/adapters';

// ============================================================================
// 测试套件
// ============================================================================

describe('CropperAdapterFactory', () => {
  let factory: CropperAdapterFactory;

  beforeEach(() => {
    factory = new CropperAdapterFactory();
  });

  afterEach(() => {
    // 清理
  });

  // ============================================================================
  // 适配器创建测试
  // ============================================================================

  describe('适配器创建', () => {
    it('应该创建Vue适配器', () => {
      const adapter = factory.createVueAdapter();

      expect(adapter).toBeDefined();
      expect(adapter.framework).toBe('vue');
      expect(adapter.version).toBeDefined();
      expect(typeof adapter.initialize).toBe('function');
      expect(typeof adapter.destroy).toBe('function');
    });

    it('应该创建React适配器', () => {
      const adapter = factory.createReactAdapter();

      expect(adapter).toBeDefined();
      expect(adapter.framework).toBe('react');
      expect(adapter.version).toBeDefined();
      expect(typeof adapter.initialize).toBe('function');
      expect(typeof adapter.destroy).toBe('function');
    });

    it('应该创建Angular适配器', () => {
      const adapter = factory.createAngularAdapter();

      expect(adapter).toBeDefined();
      expect(adapter.framework).toBe('angular');
      expect(adapter.version).toBeDefined();
      expect(typeof adapter.initialize).toBe('function');
      expect(typeof adapter.destroy).toBe('function');
    });

    it('应该接受自定义配置', () => {
      const config: AdapterConfig = {
        framework: 'vue',
        debug: true,
        componentName: 'CustomCropper'
      };

      const adapter = factory.createVueAdapter(config);

      expect(adapter).toBeDefined();
      // 配置应该被传递给适配器
    });
  });

  // ============================================================================
  // 通用适配器创建测试
  // ============================================================================

  describe('通用适配器创建', () => {
    it('应该根据框架类型创建适配器', () => {
      const vueAdapter = factory.createAdapter('vue');
      expect(vueAdapter.framework).toBe('vue');

      const reactAdapter = factory.createAdapter('react');
      expect(reactAdapter.framework).toBe('react');

      const angularAdapter = factory.createAdapter('angular');
      expect(angularAdapter.framework).toBe('angular');
    });

    it('应该为vanilla框架返回简单对象', () => {
      const adapter = factory.createAdapter('vanilla');
      expect(adapter).toEqual({
        framework: 'vanilla',
        version: '1.0.0',
        supported: true
      });
    });

    it('应该为不支持的框架抛出错误', () => {
      expect(() => {
        factory.createAdapter('unknown' as FrameworkType);
      }).toThrow('Unsupported framework: unknown');
    });
  });
});

// ============================================================================
// 适配器注册表测试
// ============================================================================

describe('AdapterRegistry', () => {
  let registry: AdapterRegistry;
  let mockAdapter: any;

  beforeEach(() => {
    registry = new AdapterRegistry();
    mockAdapter = {
      framework: 'vue',
      version: '1.0.0',
      initialize: vi.fn(),
      destroy: vi.fn()
    };
  });

  afterEach(() => {
    registry.clear();
  });

  describe('注册和获取', () => {
    it('应该注册适配器', () => {
      registry.register('test-adapter', mockAdapter);

      const retrieved = registry.get('test-adapter');
      expect(retrieved).toBe(mockAdapter);
    });

    it('应该返回注册信息', () => {
      registry.register('test-adapter', mockAdapter);

      const registrations = registry.getRegistrations();
      expect(registrations).toHaveLength(1);
      expect(registrations[0]).toMatchObject({
        name: 'test-adapter',
        framework: 'vue',
        version: '1.0.0',
        adapter: mockAdapter
      });
      expect(registrations[0].registeredAt).toBeInstanceOf(Date);
    });

    it('应该注销适配器', () => {
      registry.register('test-adapter', mockAdapter);

      const unregistered = registry.unregister('test-adapter');
      expect(unregistered).toBe(true);
      expect(mockAdapter.destroy).toHaveBeenCalledTimes(1);

      const retrieved = registry.get('test-adapter');
      expect(retrieved).toBeUndefined();
    });

    it('应该根据框架类型获取适配器', () => {
      const vueAdapter = { framework: 'vue', version: '1.0.0' };
      const reactAdapter = { framework: 'react', version: '1.0.0' };

      registry.register('vue-adapter', vueAdapter);
      registry.register('react-adapter', reactAdapter);

      const vueAdapters = registry.getByFramework('vue');
      expect(vueAdapters).toHaveLength(1);
      expect(vueAdapters[0]).toBe(vueAdapter);

      const reactAdapters = registry.getByFramework('react');
      expect(reactAdapters).toHaveLength(1);
      expect(reactAdapters[0]).toBe(reactAdapter);
    });

    it('应该清空所有适配器', () => {
      registry.register('adapter1', mockAdapter);
      registry.register('adapter2', { ...mockAdapter, destroy: vi.fn() });

      registry.clear();

      expect(registry.get('adapter1')).toBeUndefined();
      expect(registry.get('adapter2')).toBeUndefined();
      expect(registry.getRegistrations()).toHaveLength(0);
    });
  });
});

// ============================================================================
// 框架检测测试
// ============================================================================

describe('框架检测', () => {
  let originalWindow: any;
  let originalModule: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalModule = global.module;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.module = originalModule;
  });

  describe('detectFramework', () => {
    it('应该检测Vue 3', () => {
      global.window = {
        Vue: {
          version: '3.2.0'
        }
      };

      const detection = detectFramework();

      expect(detection.framework).toBe('vue');
      expect(detection.version).toBe('3.2.0');
      expect(detection.supported).toBe(true);
      expect(detection.confidence).toBeGreaterThan(0.8);
    });

    it('应该检测Vue 2为不支持', () => {
      global.window = {
        Vue: {
          version: '2.6.0'
        }
      };

      const detection = detectFramework();

      expect(detection.framework).toBe('vue');
      expect(detection.version).toBe('2.6.0');
      expect(detection.supported).toBe(false);
      expect(detection.confidence).toBeGreaterThan(0.8);
    });

    it('应该检测React', () => {
      global.window = {
        React: {
          version: '18.0.0'
        }
      };

      const detection = detectFramework();

      expect(detection.framework).toBe('react');
      expect(detection.version).toBe('18.0.0');
      expect(detection.supported).toBe(true);
      expect(detection.confidence).toBeGreaterThan(0.8);
    });

    it('应该检测Angular', () => {
      global.window = {
        ng: {},
        getAllAngularRootElements: vi.fn()
      };

      const detection = detectFramework();

      expect(detection.framework).toBe('angular');
      expect(detection.supported).toBe(true);
      expect(detection.confidence).toBeGreaterThan(0.7);
    });

    it('应该默认为vanilla', () => {
      global.window = {};

      const detection = detectFramework();

      expect(detection.framework).toBe('vanilla');
      expect(detection.version).toBeNull();
      expect(detection.supported).toBe(true);
      expect(detection.confidence).toBeLessThan(0.6);
    });
  });

  describe('createAutoAdapter', () => {
    it('应该根据检测结果创建适配器', () => {
      global.window = {
        Vue: {
          version: '3.2.0'
        }
      };

      const adapter = createAutoAdapter();

      expect(adapter).toBeDefined();
      expect(adapter.framework).toBe('vue');
    });

    it('应该为不支持的框架抛出错误', () => {
      global.window = {
        Vue: {
          version: '2.6.0' // Vue 2不支持
        }
      };

      expect(() => {
        createAutoAdapter();
      }).toThrow('Unsupported or undetected framework');
    });
  });
});

// ============================================================================
// 框架支持检测测试
// ============================================================================

describe('框架支持检测', () => {
  describe('isFrameworkSupported', () => {
    it('应该返回支持的框架为true', () => {
      expect(isFrameworkSupported('vue')).toBe(true);
      expect(isFrameworkSupported('react')).toBe(true);
      expect(isFrameworkSupported('angular')).toBe(true);
      expect(isFrameworkSupported('vanilla')).toBe(true);
    });

    it('应该返回不支持的框架为false', () => {
      expect(isFrameworkSupported('unknown' as FrameworkType)).toBe(false);
    });
  });

  describe('getSupportedFrameworks', () => {
    it('应该返回所有支持的框架', () => {
      const supported = getSupportedFrameworks();

      expect(supported).toContain('vue');
      expect(supported).toContain('react');
      expect(supported).toContain('angular');
      expect(supported).toContain('vanilla');
    });

    it('应该不包含不支持的框架', () => {
      const supported = getSupportedFrameworks();

      expect(supported).not.toContain('unknown');
    });
  });
});

// ============================================================================
// 集成测试
// ============================================================================

describe('适配器集成', () => {
  it('应该能够创建和使用Vue适配器', () => {
    const factory = new CropperAdapterFactory();
    const adapter = factory.createVueAdapter({
      framework: 'vue',
      debug: true
    });

    expect(adapter.initialized).toBe(false);

    adapter.initialize();
    expect(adapter.initialized).toBe(true);

    adapter.destroy();
    expect(adapter.initialized).toBe(false);
  });

  it('应该能够创建和使用React适配器', () => {
    const factory = new CropperAdapterFactory();
    const adapter = factory.createReactAdapter({
      framework: 'react',
      debug: true
    });

    expect(adapter.initialized).toBe(false);

    adapter.initialize();
    expect(adapter.initialized).toBe(true);

    adapter.destroy();
    expect(adapter.initialized).toBe(false);
  });

  it('应该能够创建和使用Angular适配器', () => {
    const factory = new CropperAdapterFactory();
    const adapter = factory.createAngularAdapter({
      framework: 'angular',
      debug: true
    });

    expect(adapter.initialized).toBe(false);

    adapter.initialize();
    expect(adapter.initialized).toBe(true);

    adapter.destroy();
    expect(adapter.initialized).toBe(false);
  });
});

/**
 * 核心功能单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LDesignMap, MapConfigManager, DEFAULT_MAP_CONFIG } from '../../src/core';
import type { MapConfig } from '../../src/types';

// Mock DOM 环境
const mockElement = {
  style: {},
  classList: {
    add: vi.fn()
  },
  nodeType: 1
};

Object.defineProperty(global, 'document', {
  value: {
    querySelector: vi.fn(),
    createElement: vi.fn(() => mockElement)
  }
});

// 定义 Node 常量
const NodeConstants = {
  ELEMENT_NODE: 1
};

Object.defineProperty(global, 'Node', {
  value: NodeConstants,
  writable: true,
  configurable: true
});

describe('MapConfigManager', () => {
  let configManager: MapConfigManager;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = mockElement as HTMLElement;
    vi.mocked(document.querySelector).mockReturnValue(mockContainer);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('应该使用默认配置创建配置管理器', () => {
    const config: MapConfig = {
      container: '#map'
    };

    configManager = new MapConfigManager(config);
    const fullConfig = configManager.getConfig();

    expect(fullConfig.container).toBe('#map');
    expect(fullConfig.center).toEqual(DEFAULT_MAP_CONFIG.center);
    expect(fullConfig.zoom).toBe(DEFAULT_MAP_CONFIG.zoom);
  });

  it('应该正确合并用户配置和默认配置', () => {
    const config: MapConfig = {
      container: '#map',
      center: [120.0, 30.0],
      zoom: 15,
      interactions: {
        dragPan: false,
        mouseWheelZoom: true
      }
    };

    configManager = new MapConfigManager(config);
    const fullConfig = configManager.getConfig();

    expect(fullConfig.center).toEqual([120.0, 30.0]);
    expect(fullConfig.zoom).toBe(15);
    expect(fullConfig.interactions.dragPan).toBe(false);
    expect(fullConfig.interactions.mouseWheelZoom).toBe(true);
    expect(fullConfig.interactions.doubleClickZoom).toBe(DEFAULT_MAP_CONFIG.interactions.doubleClickZoom);
  });

  it('应该验证配置的有效性', () => {
    const invalidConfig: MapConfig = {
      container: '',
      center: [200, 100], // 无效坐标
      zoom: -1 // 无效缩放级别
    };

    // 应该在控制台输出错误信息，但不会抛出异常
    expect(() => {
      configManager = new MapConfigManager(invalidConfig);
    }).not.toThrow();
  });

  it('应该能够更新配置', () => {
    const config: MapConfig = {
      container: '#map'
    };

    configManager = new MapConfigManager(config);

    const success = configManager.updateConfig({
      zoom: 12,
      center: [121.0, 31.0]
    });

    expect(success).toBe(true);
    expect(configManager.get('zoom')).toBe(12);
    expect(configManager.get('center')).toEqual([121.0, 31.0]);
  });

  it('应该能够获取和设置特定配置项', () => {
    const config: MapConfig = {
      container: '#map'
    };

    configManager = new MapConfigManager(config);

    expect(configManager.get('zoom')).toBe(DEFAULT_MAP_CONFIG.zoom);

    const success = configManager.set('zoom', 8);
    expect(success).toBe(true);
    expect(configManager.get('zoom')).toBe(8);
  });

  it('应该能够重置配置', () => {
    const config: MapConfig = {
      container: '#map',
      zoom: 15
    };

    configManager = new MapConfigManager(config);
    configManager.reset();

    expect(configManager.get('zoom')).toBe(DEFAULT_MAP_CONFIG.zoom);
    expect(configManager.get('container')).toBe(DEFAULT_MAP_CONFIG.container);
  });

  it.skip('应该能够导出和导入 JSON 配置', () => {
    const config: MapConfig = {
      container: '#map',
      zoom: 12,
      center: [116.404, 39.915]
    };

    configManager = new MapConfigManager(config);
    const json = configManager.toJSON();

    expect(json).toContain('12');
    expect(json).toContain('#map');

    const newConfigManager = new MapConfigManager({ container: '#test' });
    const success = newConfigManager.fromJSON(json);

    expect(success).toBe(true);
    expect(newConfigManager.get('zoom')).toBe(12);
    expect(newConfigManager.get('container')).toBe('#map');
  });

  it('应该能够克隆配置管理器', () => {
    const config: MapConfig = {
      container: '#map',
      zoom: 15
    };

    configManager = new MapConfigManager(config);
    const cloned = configManager.clone();

    expect(cloned.get('zoom')).toBe(15);
    expect(cloned.get('container')).toBe('#map');

    // 修改原配置不应影响克隆的配置
    configManager.set('zoom', 10);
    expect(cloned.get('zoom')).toBe(15);
  });

  it.skip('应该能够验证容器有效性', () => {
    const config: MapConfig = {
      container: mockContainer
    };

    configManager = new MapConfigManager(config);
    expect(configManager.isContainerValid()).toBe(true);

    const invalidConfig: MapConfig = {
      container: '#nonexistent'
    };

    vi.mocked(document.querySelector).mockReturnValue(null);
    const invalidConfigManager = new MapConfigManager(invalidConfig);
    expect(invalidConfigManager.isContainerValid()).toBe(false);
  });
});

describe('LDesignMap', () => {
  let map: LDesignMap;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = mockElement as HTMLElement;
    vi.mocked(document.querySelector).mockReturnValue(mockContainer);
  });

  afterEach(() => {
    if (map && !map.isDestroyed()) {
      map.destroy();
    }
    vi.clearAllMocks();
  });

  it('应该能够创建地图实例', () => {
    const config: MapConfig = {
      container: mockContainer
    };

    expect(() => {
      map = new LDesignMap(config);
    }).not.toThrow();
  });

  it('应该能够获取地图配置', () => {
    const config: MapConfig = {
      container: mockContainer,
      zoom: 12,
      center: [116.404, 39.915]
    };

    map = new LDesignMap(config);
    const retrievedConfig = map.getConfig();

    expect(retrievedConfig.zoom).toBe(12);
    expect(retrievedConfig.center).toEqual([116.404, 39.915]);
  });

  it('应该能够检查初始化状态', () => {
    const config: MapConfig = {
      container: mockContainer
    };

    map = new LDesignMap(config);

    // 由于是异步初始化，可能需要等待
    expect(typeof map.isInitialized()).toBe('boolean');
    expect(map.isDestroyed()).toBe(false);
  });

  it('应该能够销毁地图实例', () => {
    const config: MapConfig = {
      container: mockContainer
    };

    map = new LDesignMap(config);
    map.destroy();

    expect(map.isDestroyed()).toBe(true);
    expect(map.isInitialized()).toBe(false);
  });

  it('在容器无效时应该抛出错误', async () => {
    vi.mocked(document.querySelector).mockReturnValue(null);

    const config: MapConfig = {
      container: '#nonexistent'
    };

    map = new LDesignMap(config);

    // 等待异步初始化完成
    await new Promise(resolve => setTimeout(resolve, 10));

    // 检查是否未初始化
    expect(map.isInitialized()).toBe(false);
  });
});

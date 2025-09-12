/**
 * LDesignMap 核心类单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LDesignMap } from '@/core/LDesignMap';
import { createMockMapContainer, createMockMapConfig, cleanupTestEnvironment } from '@tests/setup';

describe('LDesignMap', () => {
  let container: HTMLElement;
  let mapConfig: any;

  beforeEach(() => {
    container = createMockMapContainer();
    mapConfig = createMockMapConfig({ container });
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('构造函数和初始化', () => {
    it('应该能够创建 LDesignMap 实例', () => {
      const map = new LDesignMap(mapConfig);
      expect(map).toBeInstanceOf(LDesignMap);
    });

    it('应该正确初始化地图配置', () => {
      const map = new LDesignMap(mapConfig);
      expect(map.isInitialized()).toBe(true);
    });

    it('应该在容器不存在时抛出错误', () => {
      const invalidConfig = { ...mapConfig, container: null };
      expect(() => new LDesignMap(invalidConfig)).toThrow('地图容器不存在或无效');
    });

    it('应该在容器无效时抛出错误', () => {
      const invalidConfig = { ...mapConfig, container: 'invalid-selector' };
      expect(() => new LDesignMap(invalidConfig)).toThrow('地图容器不存在或无效');
    });
  });

  describe('地图操作', () => {
    let map: LDesignMap;

    beforeEach(() => {
      map = new LDesignMap(mapConfig);
    });

    it('应该能够设置地图中心点', () => {
      const newCenter = [120.0, 30.0];
      map.setCenter(newCenter);
      
      const center = map.getCenter();
      expect(center).toEqual(newCenter);
    });

    it('应该能够设置地图缩放级别', () => {
      const newZoom = 15;
      map.setZoom(newZoom);
      
      const zoom = map.getZoom();
      expect(zoom).toBe(newZoom);
    });

    it('应该能够获取地图视图状态', () => {
      const viewState = map.getViewState();
      
      expect(viewState).toHaveProperty('center');
      expect(viewState).toHaveProperty('zoom');
      expect(viewState).toHaveProperty('rotation');
    });

    it('应该能够适应指定范围', () => {
      const extent = [116.0, 39.0, 117.0, 40.0];
      
      expect(() => map.fitExtent(extent)).not.toThrow();
    });
  });

  describe('管理器访问', () => {
    let map: LDesignMap;

    beforeEach(() => {
      map = new LDesignMap(mapConfig);
    });

    it('应该能够获取事件管理器', () => {
      const eventManager = map.getEventManager();
      expect(eventManager).toBeDefined();
    });

    it('应该能够获取图层管理器', () => {
      const layerManager = map.getLayerManager();
      expect(layerManager).toBeDefined();
    });

    it('应该能够获取标记管理器', () => {
      const markerManager = map.getMarkerManager();
      expect(markerManager).toBeDefined();
    });

    it('应该能够获取控件管理器', () => {
      const controlManager = map.getControlManager();
      expect(controlManager).toBeDefined();
    });

    it('应该能够获取样式管理器', () => {
      const styleManager = map.getStyleManager();
      expect(styleManager).toBeDefined();
    });

    it('应该能够获取主题管理器', () => {
      const themeManager = map.getThemeManager();
      expect(themeManager).toBeDefined();
    });
  });

  describe('主题管理', () => {
    let map: LDesignMap;

    beforeEach(() => {
      map = new LDesignMap(mapConfig);
    });

    it('应该能够设置主题', () => {
      const result = map.setTheme('dark');
      expect(result).toBe(true);
    });

    it('应该能够获取当前主题', () => {
      map.setTheme('dark');
      const currentTheme = map.getCurrentTheme();
      expect(currentTheme).toBe('dark');
    });

    it('应该在设置不存在的主题时返回 false', () => {
      const result = map.setTheme('non-existent-theme');
      expect(result).toBe(false);
    });
  });

  describe('事件系统', () => {
    let map: LDesignMap;

    beforeEach(() => {
      map = new LDesignMap(mapConfig);
    });

    it('应该能够添加事件监听器', () => {
      const listener = vi.fn();
      
      expect(() => map.addEventListener('click', listener)).not.toThrow();
    });

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn();
      
      map.addEventListener('click', listener);
      expect(() => map.removeEventListener('click', listener)).not.toThrow();
    });

    it('应该能够触发事件', () => {
      const listener = vi.fn();
      
      map.addEventListener('test-event', listener);
      map.dispatchEvent('test-event', { data: 'test' });
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ data: 'test' })
      );
    });
  });

  describe('配置管理', () => {
    let map: LDesignMap;

    beforeEach(() => {
      map = new LDesignMap(mapConfig);
    });

    it('应该能够获取地图配置', () => {
      const config = map.getConfig();
      
      expect(config).toHaveProperty('center');
      expect(config).toHaveProperty('zoom');
      expect(config).toHaveProperty('theme');
    });

    it('应该能够更新地图配置', () => {
      const newConfig = {
        center: [121.0, 31.0],
        zoom: 12,
        theme: 'light'
      };
      
      expect(() => map.updateConfig(newConfig)).not.toThrow();
      
      const updatedConfig = map.getConfig();
      expect(updatedConfig.center).toEqual(newConfig.center);
      expect(updatedConfig.zoom).toBe(newConfig.zoom);
      expect(updatedConfig.theme).toBe(newConfig.theme);
    });
  });

  describe('销毁和清理', () => {
    let map: LDesignMap;

    beforeEach(() => {
      map = new LDesignMap(mapConfig);
    });

    it('应该能够销毁地图实例', () => {
      expect(() => map.destroy()).not.toThrow();
      expect(map.isInitialized()).toBe(false);
    });

    it('销毁后应该无法访问管理器', () => {
      map.destroy();
      
      expect(() => map.getEventManager()).toThrow('地图未初始化');
      expect(() => map.getLayerManager()).toThrow('地图未初始化');
      expect(() => map.getMarkerManager()).toThrow('地图未初始化');
      expect(() => map.getControlManager()).toThrow('地图未初始化');
      expect(() => map.getStyleManager()).toThrow('地图未初始化');
      expect(() => map.getThemeManager()).toThrow('地图未初始化');
    });
  });

  describe('错误处理', () => {
    it('应该在无效配置时抛出错误', () => {
      expect(() => new LDesignMap(null as any)).toThrow();
      expect(() => new LDesignMap(undefined as any)).toThrow();
      expect(() => new LDesignMap({} as any)).toThrow();
    });

    it('应该在容器不是 DOM 元素时抛出错误', () => {
      const invalidConfig = { ...mapConfig, container: 'not-a-dom-element' };
      expect(() => new LDesignMap(invalidConfig)).toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该能够快速创建地图实例', () => {
      const startTime = performance.now();
      
      const map = new LDesignMap(mapConfig);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在 1 秒内完成
      expect(map.isInitialized()).toBe(true);
    });

    it('应该能够处理多个地图实例', () => {
      const maps: LDesignMap[] = [];
      
      for (let i = 0; i < 5; i++) {
        const container = createMockMapContainer();
        const config = createMockMapConfig({ container });
        const map = new LDesignMap(config);
        maps.push(map);
      }
      
      expect(maps).toHaveLength(5);
      maps.forEach(map => {
        expect(map.isInitialized()).toBe(true);
      });
      
      // 清理
      maps.forEach(map => map.destroy());
    });
  });
});

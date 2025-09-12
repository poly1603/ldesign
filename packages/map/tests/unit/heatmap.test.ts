/**
 * 热力图管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Map as OLMap } from 'ol';
import { HeatmapManager } from '../../src/managers/HeatmapManager';
import type { HeatmapOptions, HeatmapDataPoint } from '../../src/types/heatmap';

describe('HeatmapManager', () => {
  let map: OLMap;
  let heatmapManager: HeatmapManager;

  beforeEach(() => {
    // 创建模拟地图实例
    map = new OLMap({
      target: undefined,
      layers: [],
      view: undefined
    });

    heatmapManager = new HeatmapManager(map);
  });

  afterEach(() => {
    if (heatmapManager) {
      heatmapManager.destroy();
    }
  });

  describe('热力图创建', () => {
    it('应该能够创建基本热力图', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 },
        { latitude: 39.916, longitude: 116.405, weight: 2 },
        { latitude: 39.917, longitude: 116.406, weight: 3 }
      ];

      const options: HeatmapOptions = {
        name: '测试热力图',
        data: data,
        radius: 25,
        blur: 20,
        opacity: 0.7
      };

      const heatmapId = heatmapManager.addHeatmap(options);

      expect(heatmapId).toBeDefined();
      expect(typeof heatmapId).toBe('string');

      const heatmap = heatmapManager.getHeatmap(heatmapId);
      expect(heatmap).toBeDefined();
      expect(heatmap?.name).toBe('测试热力图');
      expect(heatmap?.data).toHaveLength(3);
    });

    it('应该拒绝空数据的热力图', () => {
      const options: HeatmapOptions = {
        name: '空数据热力图',
        data: []
      };

      expect(() => {
        heatmapManager.addHeatmap(options);
      }).toThrow('热力图数据不能为空');
    });

    it('应该能够使用默认配置', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      const options: HeatmapOptions = {
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      const heatmap = heatmapManager.getHeatmap(heatmapId);

      expect(heatmap?.options.radius).toBe(20);
      expect(heatmap?.options.blur).toBe(15);
      expect(heatmap?.options.opacity).toBe(0.6);
      expect(heatmap?.visible).toBe(true);
    });
  });

  describe('热力图管理', () => {
    it('应该能够获取热力图信息', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      const options: HeatmapOptions = {
        name: '获取测试',
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      const heatmap = heatmapManager.getHeatmap(heatmapId);

      expect(heatmap).toBeDefined();
      expect(heatmap?.id).toBe(heatmapId);
      expect(heatmap?.name).toBe('获取测试');
    });

    it('应该能够删除热力图', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      const options: HeatmapOptions = {
        name: '删除测试',
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      heatmapManager.removeHeatmap(heatmapId);

      const heatmap = heatmapManager.getHeatmap(heatmapId);
      expect(heatmap).toBeNull();
    });

    it('应该能够获取所有热力图', () => {
      const data1: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];
      const data2: HeatmapDataPoint[] = [
        { latitude: 39.916, longitude: 116.405, weight: 2 }
      ];

      const options1: HeatmapOptions = { name: '热力图1', data: data1 };
      const options2: HeatmapOptions = { name: '热力图2', data: data2 };

      heatmapManager.addHeatmap(options1);
      heatmapManager.addHeatmap(options2);

      const allHeatmaps = heatmapManager.getAllHeatmaps();
      expect(allHeatmaps).toHaveLength(2);
    });

    it('应该能够更新热力图', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      const options: HeatmapOptions = {
        name: '原始名称',
        data: data,
        radius: 20
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      
      heatmapManager.updateHeatmap(heatmapId, {
        radius: 30,
        opacity: 0.8
      });

      const heatmap = heatmapManager.getHeatmap(heatmapId);
      expect(heatmap?.options.radius).toBe(30);
      expect(heatmap?.options.opacity).toBe(0.8);
    });

    it('应该能够设置热力图可见性', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      const options: HeatmapOptions = {
        name: '可见性测试',
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      
      heatmapManager.setHeatmapVisible(heatmapId, false);
      let heatmap = heatmapManager.getHeatmap(heatmapId);
      expect(heatmap?.visible).toBe(false);

      heatmapManager.setHeatmapVisible(heatmapId, true);
      heatmap = heatmapManager.getHeatmap(heatmapId);
      expect(heatmap?.visible).toBe(true);
    });
  });

  describe('热力图统计', () => {
    it('应该能够计算统计信息', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 },
        { latitude: 39.916, longitude: 116.405, weight: 2 },
        { latitude: 39.917, longitude: 116.406, weight: 3 },
        { latitude: 39.918, longitude: 116.407, weight: 4 }
      ];

      const options: HeatmapOptions = {
        name: '统计测试',
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      const stats = heatmapManager.getHeatmapStatistics(heatmapId);

      expect(stats).toBeDefined();
      expect(stats?.totalPoints).toBe(4);
      expect(stats?.totalWeight).toBe(10);
      expect(stats?.averageWeight).toBe(2.5);
      expect(stats?.maxWeight).toBe(4);
      expect(stats?.minWeight).toBe(1);
    });

    it('应该能够计算边界框', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 },
        { latitude: 39.920, longitude: 116.410, weight: 2 }
      ];

      const options: HeatmapOptions = {
        name: '边界测试',
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      const heatmap = heatmapManager.getHeatmap(heatmapId);

      expect(heatmap?.bounds).toBeDefined();
      expect(heatmap?.bounds[0]).toBe(116.404); // minLng
      expect(heatmap?.bounds[1]).toBe(39.915);  // minLat
      expect(heatmap?.bounds[2]).toBe(116.410); // maxLng
      expect(heatmap?.bounds[3]).toBe(39.920);  // maxLat
    });
  });

  describe('热力图动画', () => {
    it('应该能够播放动画', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      const options: HeatmapOptions = {
        name: '动画测试',
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);

      expect(() => {
        heatmapManager.playHeatmapAnimation(heatmapId, {
          duration: 1000,
          loop: false
        });
      }).not.toThrow();
    });

    it('应该能够停止动画', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      const options: HeatmapOptions = {
        name: '停止动画测试',
        data: data
      };

      const heatmapId = heatmapManager.addHeatmap(options);
      heatmapManager.playHeatmapAnimation(heatmapId);

      expect(() => {
        heatmapManager.stopHeatmapAnimation();
      }).not.toThrow();
    });
  });

  describe('清理功能', () => {
    it('应该能够清除所有热力图', () => {
      const data1: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];
      const data2: HeatmapDataPoint[] = [
        { latitude: 39.916, longitude: 116.405, weight: 2 }
      ];

      heatmapManager.addHeatmap({ name: '热力图1', data: data1 });
      heatmapManager.addHeatmap({ name: '热力图2', data: data2 });

      heatmapManager.clearHeatmaps();

      const allHeatmaps = heatmapManager.getAllHeatmaps();
      expect(allHeatmaps).toHaveLength(0);
    });

    it('应该能够正确销毁管理器', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      heatmapManager.addHeatmap({ name: '销毁测试', data: data });

      expect(() => {
        heatmapManager.destroy();
      }).not.toThrow();

      const allHeatmaps = heatmapManager.getAllHeatmaps();
      expect(allHeatmaps).toHaveLength(0);
    });
  });

  describe('事件系统', () => {
    it('应该能够监听热力图添加事件', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      let eventTriggered = false;
      let eventData: any = null;

      heatmapManager.on('heatmap-added', (data) => {
        eventTriggered = true;
        eventData = data;
      });

      const heatmapId = heatmapManager.addHeatmap({ name: '事件测试', data: data });

      expect(eventTriggered).toBe(true);
      expect(eventData).toBeDefined();
      expect(eventData.heatmap).toBeDefined();
      expect(eventData.heatmap.id).toBe(heatmapId);
    });

    it('应该能够移除事件监听', () => {
      const data: HeatmapDataPoint[] = [
        { latitude: 39.915, longitude: 116.404, weight: 1 }
      ];

      let eventTriggered = false;
      const callback = () => {
        eventTriggered = true;
      };

      heatmapManager.on('heatmap-added', callback);
      heatmapManager.off('heatmap-added', callback);

      heatmapManager.addHeatmap({ name: '移除监听测试', data: data });

      expect(eventTriggered).toBe(false);
    });
  });
});

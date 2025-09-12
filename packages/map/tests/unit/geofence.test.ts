/**
 * 地理围栏管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Map as OLMap } from 'ol';
import { GeofenceManager } from '../../src/managers/GeofenceManager';
import type { GeofenceOptions } from '../../src/types/geofence';

describe('GeofenceManager', () => {
  let map: OLMap;
  let geofenceManager: GeofenceManager;

  beforeEach(() => {
    // 创建模拟地图实例
    map = new OLMap({
      target: undefined,
      layers: [],
      view: undefined
    });

    geofenceManager = new GeofenceManager(map);
  });

  afterEach(() => {
    if (geofenceManager) {
      geofenceManager.clearGeofences();
    }
  });

  describe('地理围栏创建', () => {
    it('应该能够创建多边形围栏', () => {
      const options: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);

      expect(geofenceId).toBeDefined();
      expect(typeof geofenceId).toBe('string');

      const geofence = geofenceManager.getGeofence(geofenceId);
      expect(geofence).toBeDefined();
      expect(geofence?.name).toBe('测试围栏');
    });

    it('应该能够创建圆形围栏', () => {
      const options: GeofenceOptions = {
        name: '圆形围栏',
        geometry: {
          type: 'Circle',
          coordinates: [116.404, 39.915],
          radius: 100
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      const geofence = geofenceManager.getGeofence(geofenceId);

      expect(geofence).toBeDefined();
      expect(geofence?.name).toBe('圆形围栏');
    });

    it('应该能够创建点围栏', () => {
      const options: GeofenceOptions = {
        name: '点围栏',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        },
        bufferDistance: 50
      };

      const geofenceId = geofenceManager.addGeofence(options);
      const geofence = geofenceManager.getGeofence(geofenceId);

      expect(geofence).toBeDefined();
      expect(geofence?.name).toBe('点围栏');
      expect(geofence?.bufferDistance).toBe(50);
    });
  });

  describe('地理围栏管理', () => {
    it('应该能够获取围栏信息', () => {
      const options: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      const geofence = geofenceManager.getGeofence(geofenceId);

      expect(geofence).toBeDefined();
      expect(geofence?.id).toBe(geofenceId);
      expect(geofence?.name).toBe('测试围栏');
      expect(geofence?.enabled).toBe(true);
    });

    it('应该能够删除围栏', () => {
      const options: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      geofenceManager.removeGeofence(geofenceId);

      const geofence = geofenceManager.getGeofence(geofenceId);
      expect(geofence).toBeNull();
    });

    it('应该能够获取所有围栏', () => {
      const options1: GeofenceOptions = {
        name: '围栏1',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        }
      };

      const options2: GeofenceOptions = {
        name: '围栏2',
        geometry: {
          type: 'Point',
          coordinates: [116.407, 39.918]
        }
      };

      geofenceManager.addGeofence(options1);
      geofenceManager.addGeofence(options2);

      const allGeofences = geofenceManager.getAllGeofences();
      expect(allGeofences).toHaveLength(2);
    });

    it('应该能够更新围栏', () => {
      const options: GeofenceOptions = {
        name: '原始名称',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      
      geofenceManager.updateGeofence(geofenceId, {
        name: '更新后的名称',
        description: '新的描述'
      });

      const geofence = geofenceManager.getGeofence(geofenceId);
      expect(geofence?.name).toBe('更新后的名称');
      expect(geofence?.description).toBe('新的描述');
    });

    it('应该能够启用/禁用围栏', () => {
      const options: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      
      geofenceManager.setGeofenceEnabled(geofenceId, false);
      let geofence = geofenceManager.getGeofence(geofenceId);
      expect(geofence?.enabled).toBe(false);

      geofenceManager.setGeofenceEnabled(geofenceId, true);
      geofence = geofenceManager.getGeofence(geofenceId);
      expect(geofence?.enabled).toBe(true);
    });
  });

  describe('位置检测', () => {
    it('应该能够检测点是否在多边形围栏内', () => {
      const options: GeofenceOptions = {
        name: '多边形围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);

      // 测试围栏内的点
      const insidePoint: [number, number] = [116.405, 39.916];
      expect(geofenceManager.isPointInGeofence(insidePoint, geofenceId)).toBe(true);

      // 测试围栏外的点
      const outsidePoint: [number, number] = [116.410, 39.920];
      expect(geofenceManager.isPointInGeofence(outsidePoint, geofenceId)).toBe(false);
    });

    it('应该能够检测进入和离开事件', () => {
      const options: GeofenceOptions = {
        name: '事件测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);

      // 从围栏外移动到围栏内
      const outsidePoint: [number, number] = [116.410, 39.920];
      const insidePoint: [number, number] = [116.405, 39.916];

      const events = geofenceManager.checkGeofenceEvents(insidePoint, outsidePoint);
      
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('enter');
      expect(events[0].geofence.id).toBe(geofenceId);
    });
  });

  describe('位置跟踪', () => {
    it('应该能够更新位置', () => {
      const position: [number, number] = [116.404, 39.915];
      
      expect(() => {
        geofenceManager.updateLocation(position, 10);
      }).not.toThrow();
    });

    it('应该能够开始和停止位置跟踪', () => {
      // 模拟地理位置API
      const mockGeolocation = {
        watchPosition: vi.fn().mockReturnValue(1),
        clearWatch: vi.fn(),
        getCurrentPosition: vi.fn()
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      });

      expect(() => {
        geofenceManager.startLocationTracking();
      }).not.toThrow();

      expect(() => {
        geofenceManager.stopLocationTracking();
      }).not.toThrow();

      expect(mockGeolocation.watchPosition).toHaveBeenCalled();
      expect(mockGeolocation.clearWatch).toHaveBeenCalled();
    });
  });

  describe('统计信息', () => {
    it('应该能够获取围栏统计信息', () => {
      const options: GeofenceOptions = {
        name: '统计测试围栏',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      const stats = geofenceManager.getGeofenceStatistics(geofenceId);

      expect(stats).toBeDefined();
      expect(stats?.geofenceId).toBe(geofenceId);
      expect(stats?.enterCount).toBe(0);
      expect(stats?.exitCount).toBe(0);
    });

    it('应该能够重置统计信息', () => {
      const options: GeofenceOptions = {
        name: '重置测试围栏',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      
      expect(() => {
        geofenceManager.resetGeofenceStatistics(geofenceId);
      }).not.toThrow();

      const stats = geofenceManager.getGeofenceStatistics(geofenceId);
      expect(stats?.enterCount).toBe(0);
      expect(stats?.exitCount).toBe(0);
    });
  });

  describe('事件系统', () => {
    it('应该能够监听进入事件', () => {
      const options: GeofenceOptions = {
        name: '事件监听围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);

      let enterEventTriggered = false;
      geofenceManager.on('enter', (data) => {
        enterEventTriggered = true;
        expect(data.type).toBe('enter');
        expect(data.geofence.id).toBe(geofenceId);
      });

      // 触发进入事件
      const outsidePoint: [number, number] = [116.410, 39.920];
      const insidePoint: [number, number] = [116.405, 39.916];
      geofenceManager.checkGeofenceEvents(insidePoint, outsidePoint);

      expect(enterEventTriggered).toBe(true);
    });

    it('应该能够移除事件监听', () => {
      let eventTriggered = false;
      const callback = () => {
        eventTriggered = true;
      };

      geofenceManager.on('enter', callback);
      geofenceManager.off('enter', callback);

      // 即使触发事件，回调也不应该执行
      const options: GeofenceOptions = {
        name: '移除监听测试',
        geometry: {
          type: 'Point',
          coordinates: [116.404, 39.915]
        }
      };

      const geofenceId = geofenceManager.addGeofence(options);
      const outsidePoint: [number, number] = [116.410, 39.920];
      const insidePoint: [number, number] = [116.404, 39.915];
      geofenceManager.checkGeofenceEvents(insidePoint, outsidePoint);

      expect(eventTriggered).toBe(false);
    });
  });
});

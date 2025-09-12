/**
 * 路径规划管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Map as OLMap } from 'ol';
import { RoutingManager } from '../../src/managers/RoutingManager';
import type { RoutingOptions } from '../../src/types/routing';

describe('RoutingManager', () => {
  let map: OLMap;
  let routingManager: RoutingManager;

  beforeEach(() => {
    // 创建模拟地图实例
    map = new OLMap({
      target: undefined,
      layers: [],
      view: undefined
    });

    routingManager = new RoutingManager(map);
  });

  afterEach(() => {
    if (routingManager) {
      routingManager.clearRoutes();
    }
  });

  describe('路径创建', () => {
    it('应该能够创建基本路径', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915], // 北京天安门
          [116.407, 39.918]  // 附近点
        ],
        profile: 'driving'
      };

      const route = await routingManager.addRoute(options);

      expect(route).toBeDefined();
      expect(route.id).toBeDefined();
      expect(route.distance).toBeGreaterThan(0);
      expect(route.duration).toBeGreaterThan(0);
      expect(route.instructions).toBeDefined();
      expect(route.instructions.length).toBeGreaterThan(0);
    });

    it('应该能够创建多点路径', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915], // 起点
          [116.405, 39.916], // 途经点1
          [116.406, 39.917], // 途经点2
          [116.407, 39.918]  // 终点
        ],
        profile: 'walking'
      };

      const route = await routingManager.addRoute(options);

      expect(route).toBeDefined();
      expect(route.options.waypoints).toHaveLength(4);
      expect(route.instructions.length).toBeGreaterThanOrEqual(4); // 至少包含起点、途经点和终点指引
    });

    it('应该拒绝少于两个点的路径', async () => {
      const options: RoutingOptions = {
        waypoints: [[116.404, 39.915]], // 只有一个点
        profile: 'driving'
      };

      await expect(routingManager.addRoute(options)).rejects.toThrow('至少需要两个路径点');
    });
  });

  describe('路径管理', () => {
    it('应该能够获取路径信息', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      const route = await routingManager.addRoute(options);
      const retrievedRoute = routingManager.getRoute(route.id);

      expect(retrievedRoute).toBeDefined();
      expect(retrievedRoute?.id).toBe(route.id);
    });

    it('应该能够删除路径', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      const route = await routingManager.addRoute(options);
      routingManager.removeRoute(route.id);

      const retrievedRoute = routingManager.getRoute(route.id);
      expect(retrievedRoute).toBeNull();
    });

    it('应该能够获取所有路径', async () => {
      const options1: RoutingOptions = {
        waypoints: [[116.404, 39.915], [116.407, 39.918]]
      };
      const options2: RoutingOptions = {
        waypoints: [[116.408, 39.919], [116.411, 39.922]]
      };

      await routingManager.addRoute(options1);
      await routingManager.addRoute(options2);

      const allRoutes = routingManager.getAllRoutes();
      expect(allRoutes).toHaveLength(2);
    });

    it('应该能够清除所有路径', async () => {
      const options1: RoutingOptions = {
        waypoints: [[116.404, 39.915], [116.407, 39.918]]
      };
      const options2: RoutingOptions = {
        waypoints: [[116.408, 39.919], [116.411, 39.922]]
      };

      await routingManager.addRoute(options1);
      await routingManager.addRoute(options2);

      routingManager.clearRoutes();

      const allRoutes = routingManager.getAllRoutes();
      expect(allRoutes).toHaveLength(0);
    });
  });

  describe('导航功能', () => {
    it('应该能够开始导航', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      const route = await routingManager.addRoute(options);
      
      // 监听导航开始事件
      let navigationStarted = false;
      routingManager.on('navigation-started', () => {
        navigationStarted = true;
      });

      routingManager.startNavigation(route.id);

      expect(navigationStarted).toBe(true);
    });

    it('应该能够停止导航', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      const route = await routingManager.addRoute(options);
      
      // 监听导航结束事件
      let navigationEnded = false;
      routingManager.on('navigation-ended', () => {
        navigationEnded = true;
      });

      routingManager.startNavigation(route.id);
      routingManager.stopNavigation();

      expect(navigationEnded).toBe(true);
    });

    it('应该能够更新位置', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      const route = await routingManager.addRoute(options);
      routingManager.startNavigation(route.id);

      // 更新位置不应该抛出错误
      expect(() => {
        routingManager.updatePosition([116.405, 39.916]);
      }).not.toThrow();
    });
  });

  describe('路径动画', () => {
    it('应该能够播放路径动画', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      const route = await routingManager.addRoute(options);

      // 播放动画不应该抛出错误
      expect(() => {
        routingManager.playRouteAnimation(route.id, {
          duration: 1000,
          showTrail: true
        });
      }).not.toThrow();
    });

    it('应该能够停止路径动画', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      const route = await routingManager.addRoute(options);
      routingManager.playRouteAnimation(route.id);

      // 停止动画不应该抛出错误
      expect(() => {
        routingManager.stopRouteAnimation(route.id);
      }).not.toThrow();
    });
  });

  describe('事件系统', () => {
    it('应该能够监听和触发事件', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      let eventTriggered = false;
      let eventData: any = null;

      routingManager.on('route-created', (data) => {
        eventTriggered = true;
        eventData = data;
      });

      const route = await routingManager.addRoute(options);

      expect(eventTriggered).toBe(true);
      expect(eventData).toBeDefined();
      expect(eventData.route).toBeDefined();
      expect(eventData.route.id).toBe(route.id);
    });

    it('应该能够移除事件监听', async () => {
      const options: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ]
      };

      let eventTriggered = false;
      const callback = () => {
        eventTriggered = true;
      };

      routingManager.on('route-created', callback);
      routingManager.off('route-created', callback);

      await routingManager.addRoute(options);

      expect(eventTriggered).toBe(false);
    });
  });
});

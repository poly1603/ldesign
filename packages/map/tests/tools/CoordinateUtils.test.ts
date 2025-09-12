/**
 * CoordinateUtils 坐标转换工具单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoordinateUtils } from '@/tools/CoordinateUtils';
import { cleanupTestEnvironment } from '@tests/setup';

describe('CoordinateUtils', () => {
  let coordinateUtils: CoordinateUtils;

  beforeEach(() => {
    coordinateUtils = CoordinateUtils.getInstance();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = CoordinateUtils.getInstance();
      const instance2 = CoordinateUtils.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('基础坐标转换', () => {
    it('应该能够进行 WGS84 到 Web Mercator 转换', () => {
      const wgs84Coord = [116.404, 39.915]; // 北京坐标
      const webMercatorCoord = coordinateUtils.wgs84ToWebMercator(wgs84Coord);
      
      expect(webMercatorCoord).toHaveLength(2);
      expect(webMercatorCoord[0]).toBeCloseTo(12958752.5, 0);
      expect(webMercatorCoord[1]).toBeCloseTo(4825923.6, 0);
    });

    it('应该能够进行 Web Mercator 到 WGS84 转换', () => {
      const webMercatorCoord = [12958752.5, 4825923.6];
      const wgs84Coord = coordinateUtils.webMercatorToWgs84(webMercatorCoord);
      
      expect(wgs84Coord).toHaveLength(2);
      expect(wgs84Coord[0]).toBeCloseTo(116.404, 2);
      expect(wgs84Coord[1]).toBeCloseTo(39.915, 2);
    });

    it('应该能够进行标准投影转换', () => {
      const coord = [116.404, 39.915];
      const result = coordinateUtils.transformCoordinate(coord, 'EPSG:4326', 'EPSG:3857');
      
      expect(result.success).toBe(true);
      expect(result.coordinate).toHaveLength(2);
      expect(result.fromProjection).toBe('EPSG:4326');
      expect(result.toProjection).toBe('EPSG:3857');
      expect(result.accuracy).toBeGreaterThan(0);
    });
  });

  describe('中国坐标系转换', () => {
    const beijingWGS84 = [116.404, 39.915];

    it('应该能够进行 WGS84 到 GCJ02 转换', () => {
      const result = coordinateUtils.transformCoordinate(beijingWGS84, 'EPSG:4326', 'GCJ02');
      
      expect(result.success).toBe(true);
      expect(result.coordinate).toHaveLength(2);
      expect(result.coordinate[0]).not.toBe(beijingWGS84[0]); // 应该有偏移
      expect(result.coordinate[1]).not.toBe(beijingWGS84[1]);
    });

    it('应该能够进行 GCJ02 到 WGS84 转换', () => {
      // 先转换到 GCJ02
      const gcj02Result = coordinateUtils.transformCoordinate(beijingWGS84, 'EPSG:4326', 'GCJ02');
      
      // 再转换回 WGS84
      const wgs84Result = coordinateUtils.transformCoordinate(gcj02Result.coordinate, 'GCJ02', 'EPSG:4326');
      
      expect(wgs84Result.success).toBe(true);
      expect(wgs84Result.coordinate[0]).toBeCloseTo(beijingWGS84[0], 4);
      expect(wgs84Result.coordinate[1]).toBeCloseTo(beijingWGS84[1], 4);
    });

    it('应该能够进行 GCJ02 到 BD09 转换', () => {
      const gcj02Coord = [116.41024, 39.91601]; // 假设的 GCJ02 坐标
      const result = coordinateUtils.transformCoordinate(gcj02Coord, 'GCJ02', 'BD09');
      
      expect(result.success).toBe(true);
      expect(result.coordinate).toHaveLength(2);
      expect(result.coordinate[0]).not.toBe(gcj02Coord[0]);
      expect(result.coordinate[1]).not.toBe(gcj02Coord[1]);
    });

    it('应该能够进行 BD09 到 GCJ02 转换', () => {
      const bd09Coord = [116.41662, 39.92204]; // 假设的 BD09 坐标
      const result = coordinateUtils.transformCoordinate(bd09Coord, 'BD09', 'GCJ02');
      
      expect(result.success).toBe(true);
      expect(result.coordinate).toHaveLength(2);
    });

    it('应该能够进行 WGS84 到 BD09 的链式转换', () => {
      const result = coordinateUtils.transformCoordinate(beijingWGS84, 'EPSG:4326', 'BD09');
      
      expect(result.success).toBe(true);
      expect(result.coordinate).toHaveLength(2);
    });

    it('应该在中国境外坐标时不进行偏移', () => {
      const overseasCoord = [-74.006, 40.7128]; // 纽约坐标
      const result = coordinateUtils.transformCoordinate(overseasCoord, 'EPSG:4326', 'GCJ02');
      
      expect(result.success).toBe(true);
      expect(result.coordinate).toEqual(overseasCoord); // 应该没有偏移
    });
  });

  describe('范围转换', () => {
    it('应该能够转换地理范围', () => {
      const extent = [116.0, 39.0, 117.0, 40.0]; // WGS84 范围
      const transformedExtent = coordinateUtils.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
      
      expect(transformedExtent).toHaveLength(4);
      expect(transformedExtent[0]).not.toBe(extent[0]);
      expect(transformedExtent[1]).not.toBe(extent[1]);
      expect(transformedExtent[2]).not.toBe(extent[2]);
      expect(transformedExtent[3]).not.toBe(extent[3]);
    });

    it('应该在转换失败时返回原始范围', () => {
      const extent = [116.0, 39.0, 117.0, 40.0];
      const transformedExtent = coordinateUtils.transformExtent(extent, 'invalid-proj', 'EPSG:3857');
      
      expect(transformedExtent).toEqual(extent);
    });
  });

  describe('投影注册', () => {
    it('应该能够注册自定义投影', () => {
      const projCode = 'EPSG:2154';
      const projDef = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
      
      expect(() => coordinateUtils.registerProjection(projCode, projDef)).not.toThrow();
    });

    it('应该能够检查投影是否已注册', () => {
      expect(coordinateUtils.isProjectionRegistered('EPSG:4326')).toBe(true);
      expect(coordinateUtils.isProjectionRegistered('EPSG:3857')).toBe(true);
      expect(coordinateUtils.isProjectionRegistered('GCJ02')).toBe(true);
      expect(coordinateUtils.isProjectionRegistered('BD09')).toBe(true);
      expect(coordinateUtils.isProjectionRegistered('EPSG:9999')).toBe(false);
    });

    it('应该能够获取已注册的投影列表', () => {
      const projections = coordinateUtils.getRegisteredProjections();
      
      expect(projections).toContain('EPSG:4326');
      expect(projections).toContain('EPSG:3857');
      expect(projections).toContain('GCJ02');
      expect(projections).toContain('BD09');
    });
  });

  describe('错误处理', () => {
    it('应该在无效投影转换时返回错误结果', () => {
      const coord = [116.404, 39.915];
      const result = coordinateUtils.transformCoordinate(coord, 'invalid-from', 'invalid-to');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.coordinate).toEqual(coord); // 返回原始坐标
    });

    it('应该在转换异常时捕获错误', () => {
      const coord = [NaN, NaN];
      const result = coordinateUtils.transformCoordinate(coord, 'EPSG:4326', 'EPSG:3857');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('精度评估', () => {
    it('应该为相同投影返回最高精度', () => {
      const coord = [116.404, 39.915];
      const result = coordinateUtils.transformCoordinate(coord, 'EPSG:4326', 'EPSG:4326');
      
      expect(result.accuracy).toBe(1.0);
    });

    it('应该为中国坐标系转换返回较低精度', () => {
      const coord = [116.404, 39.915];
      const result = coordinateUtils.transformCoordinate(coord, 'EPSG:4326', 'GCJ02');
      
      expect(result.accuracy).toBeLessThan(1.0);
      expect(result.accuracy).toBeGreaterThan(0);
    });

    it('应该为标准投影转换返回较高精度', () => {
      const coord = [116.404, 39.915];
      const result = coordinateUtils.transformCoordinate(coord, 'EPSG:4326', 'EPSG:3857');
      
      expect(result.accuracy).toBeGreaterThan(0.9);
    });
  });

  describe('性能测试', () => {
    it('应该能够快速进行坐标转换', () => {
      const coord = [116.404, 39.915];
      const iterations = 1000;
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        coordinateUtils.transformCoordinate(coord, 'EPSG:4326', 'EPSG:3857');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTime = duration / iterations;
      
      expect(avgTime).toBeLessThan(1); // 平均每次转换应该少于 1ms
    });

    it('应该能够处理大量坐标转换', () => {
      const coords = Array.from({ length: 100 }, (_, i) => [116 + i * 0.01, 39 + i * 0.01]);
      
      const startTime = performance.now();
      
      const results = coords.map(coord => 
        coordinateUtils.transformCoordinate(coord, 'EPSG:4326', 'EPSG:3857')
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // 100 个坐标转换应该在 100ms 内完成
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});

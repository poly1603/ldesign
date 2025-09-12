/**
 * 坐标转换工具类
 * 提供各种坐标系统之间的转换功能
 */

import { transform, transformExtent, fromLonLat, toLonLat } from 'ol/proj';

import type {
  CoordinateSystem,
  Coordinate,
  Extent,
  CoordinateTransformResult,
  ICoordinateUtils
} from '../types';

/**
 * 坐标转换工具实现类
 * 提供完整的坐标系统转换功能
 */
export class CoordinateUtils implements ICoordinateUtils {
  private static instance: CoordinateUtils;
  private registeredProjections: Set<string> = new Set();

  /**
   * 获取单例实例
   */
  static getInstance(): CoordinateUtils {
    if (!CoordinateUtils.instance) {
      CoordinateUtils.instance = new CoordinateUtils();
    }
    return CoordinateUtils.instance;
  }

  /**
   * 私有构造函数
   */
  private constructor() {
    this.initializeCommonProjections();
  }

  /**
   * 初始化常用投影坐标系
   * @private
   */
  private initializeCommonProjections(): void {
    // 记录 OpenLayers 内置支持的投影
    this.registeredProjections.add('EPSG:4326'); // WGS84
    this.registeredProjections.add('EPSG:3857'); // Web Mercator

    // 中国坐标系（通过算法转换，不需要 proj4）
    this.registeredProjections.add('GCJ02');     // 火星坐标系
    this.registeredProjections.add('BD09');      // 百度坐标系
  }

  /**
   * 转换坐标
   * @param coordinate 坐标点 [经度, 纬度] 或 [x, y]
   * @param fromProjection 源坐标系
   * @param toProjection 目标坐标系
   */
  transformCoordinate(
    coordinate: Coordinate,
    fromProjection: string,
    toProjection: string
  ): CoordinateTransformResult {
    try {
      // 特殊处理中国坐标系转换
      if (fromProjection === 'GCJ02' || toProjection === 'GCJ02' ||
        fromProjection === 'BD09' || toProjection === 'BD09') {
        return this.transformChineseCoordinate(coordinate, fromProjection, toProjection);
      }

      // 使用 OpenLayers 进行标准坐标转换
      const transformed = transform(coordinate, fromProjection, toProjection);

      return {
        coordinate: transformed,
        fromProjection,
        toProjection,
        success: true,
        accuracy: this.getTransformAccuracy(fromProjection, toProjection)
      };
    } catch (error) {
      return {
        coordinate: coordinate,
        fromProjection,
        toProjection,
        success: false,
        error: error instanceof Error ? error.message : '坐标转换失败',
        accuracy: 0
      };
    }
  }

  /**
   * 转换范围
   * @param extent 范围 [minX, minY, maxX, maxY]
   * @param fromProjection 源坐标系
   * @param toProjection 目标坐标系
   */
  transformExtent(
    extent: Extent,
    fromProjection: string,
    toProjection: string
  ): Extent {
    try {
      return transformExtent(extent, fromProjection, toProjection);
    } catch (error) {
      console.error('[CoordinateUtils] 范围转换失败:', error);
      return extent;
    }
  }

  /**
   * WGS84 转 Web Mercator
   * @param coordinate WGS84坐标 [经度, 纬度]
   */
  wgs84ToWebMercator(coordinate: Coordinate): Coordinate {
    return fromLonLat(coordinate);
  }

  /**
   * Web Mercator 转 WGS84
   * @param coordinate Web Mercator坐标 [x, y]
   */
  webMercatorToWgs84(coordinate: Coordinate): Coordinate {
    return toLonLat(coordinate);
  }

  /**
   * 转换中国坐标系
   * @param coordinate 坐标点
   * @param fromProjection 源坐标系
   * @param toProjection 目标坐标系
   * @private
   */
  private transformChineseCoordinate(
    coordinate: Coordinate,
    fromProjection: string,
    toProjection: string
  ): CoordinateTransformResult {
    try {
      let result = [...coordinate];

      // WGS84 -> GCJ02
      if (fromProjection === 'EPSG:4326' && toProjection === 'GCJ02') {
        result = this.wgs84ToGcj02(coordinate);
      }
      // GCJ02 -> WGS84
      else if (fromProjection === 'GCJ02' && toProjection === 'EPSG:4326') {
        result = this.gcj02ToWgs84(coordinate);
      }
      // GCJ02 -> BD09
      else if (fromProjection === 'GCJ02' && toProjection === 'BD09') {
        result = this.gcj02ToBd09(coordinate);
      }
      // BD09 -> GCJ02
      else if (fromProjection === 'BD09' && toProjection === 'GCJ02') {
        result = this.bd09ToGcj02(coordinate);
      }
      // WGS84 -> BD09
      else if (fromProjection === 'EPSG:4326' && toProjection === 'BD09') {
        const gcj02 = this.wgs84ToGcj02(coordinate);
        result = this.gcj02ToBd09(gcj02);
      }
      // BD09 -> WGS84
      else if (fromProjection === 'BD09' && toProjection === 'EPSG:4326') {
        const gcj02 = this.bd09ToGcj02(coordinate);
        result = this.gcj02ToWgs84(gcj02);
      }

      return {
        coordinate: result,
        fromProjection,
        toProjection,
        success: true,
        accuracy: this.getTransformAccuracy(fromProjection, toProjection)
      };
    } catch (error) {
      return {
        coordinate: coordinate,
        fromProjection,
        toProjection,
        success: false,
        error: error instanceof Error ? error.message : '中国坐标系转换失败',
        accuracy: 0
      };
    }
  }

  /**
   * WGS84 转 GCJ02 (火星坐标系)
   * @param coordinate WGS84坐标 [经度, 纬度]
   * @private
   */
  private wgs84ToGcj02(coordinate: Coordinate): Coordinate {
    const [lng, lat] = coordinate;

    if (this.isOutOfChina(lng, lat)) {
      return coordinate;
    }

    let dLat = this.transformLat(lng - 105.0, lat - 35.0);
    let dLng = this.transformLng(lng - 105.0, lat - 35.0);

    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - 0.00669342162296594323 * magic * magic;
    const sqrtMagic = Math.sqrt(magic);

    dLat = (dLat * 180.0) / ((6378245.0 * (1 - 0.00669342162296594323)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (6378245.0 / sqrtMagic * Math.cos(radLat) * Math.PI);

    return [lng + dLng, lat + dLat];
  }

  /**
   * GCJ02 转 WGS84
   * @param coordinate GCJ02坐标 [经度, 纬度]
   * @private
   */
  private gcj02ToWgs84(coordinate: Coordinate): Coordinate {
    const [lng, lat] = coordinate;

    if (this.isOutOfChina(lng, lat)) {
      return coordinate;
    }

    let dLat = this.transformLat(lng - 105.0, lat - 35.0);
    let dLng = this.transformLng(lng - 105.0, lat - 35.0);

    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - 0.00669342162296594323 * magic * magic;
    const sqrtMagic = Math.sqrt(magic);

    dLat = (dLat * 180.0) / ((6378245.0 * (1 - 0.00669342162296594323)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (6378245.0 / sqrtMagic * Math.cos(radLat) * Math.PI);

    return [lng - dLng, lat - dLat];
  }

  /**
   * GCJ02 转 BD09 (百度坐标系)
   * @param coordinate GCJ02坐标 [经度, 纬度]
   * @private
   */
  private gcj02ToBd09(coordinate: Coordinate): Coordinate {
    const [lng, lat] = coordinate;
    const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * Math.PI * 3000.0 / 180.0);
    const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * Math.PI * 3000.0 / 180.0);

    return [
      z * Math.cos(theta) + 0.0065,
      z * Math.sin(theta) + 0.006
    ];
  }

  /**
   * BD09 转 GCJ02
   * @param coordinate BD09坐标 [经度, 纬度]
   * @private
   */
  private bd09ToGcj02(coordinate: Coordinate): Coordinate {
    const [lng, lat] = coordinate;
    const x = lng - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI * 3000.0 / 180.0);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI * 3000.0 / 180.0);

    return [
      z * Math.cos(theta),
      z * Math.sin(theta)
    ];
  }

  /**
   * 判断是否在中国境外
   * @param lng 经度
   * @param lat 纬度
   * @private
   */
  private isOutOfChina(lng: number, lat: number): boolean {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  /**
   * 纬度转换
   * @param lng 经度偏移
   * @param lat 纬度偏移
   * @private
   */
  private transformLat(lng: number, lat: number): number {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  /**
   * 经度转换
   * @param lng 经度偏移
   * @param lat 纬度偏移
   * @private
   */
  private transformLng(lng: number, lat: number): number {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  }

  /**
   * 获取转换精度
   * @param fromProjection 源坐标系
   * @param toProjection 目标坐标系
   * @private
   */
  private getTransformAccuracy(fromProjection: string, toProjection: string): number {
    // 根据坐标系转换类型返回精度估计 (0-1)
    if (fromProjection === toProjection) return 1.0;

    // 中国坐标系转换精度较低
    if ((fromProjection === 'GCJ02' || toProjection === 'GCJ02' ||
      fromProjection === 'BD09' || toProjection === 'BD09')) {
      return 0.8;
    }

    // 标准坐标系转换精度较高
    return 0.95;
  }

  /**
   * 注册自定义投影
   * @param code 投影代码
   * @param definition 投影定义
   */
  registerProjection(code: string, definition: string): void {
    // 简化版本：只记录投影代码，不实际注册
    // 在实际项目中，可以通过安装 proj4 依赖来支持更多投影
    console.warn(`[CoordinateUtils] 自定义投影注册需要 proj4 依赖: ${code}`);
    this.registeredProjections.add(code);
  }

  /**
   * 获取已注册的投影列表
   */
  getRegisteredProjections(): string[] {
    return Array.from(this.registeredProjections);
  }

  /**
   * 检查投影是否已注册
   * @param code 投影代码
   */
  isProjectionRegistered(code: string): boolean {
    return this.registeredProjections.has(code);
  }
}

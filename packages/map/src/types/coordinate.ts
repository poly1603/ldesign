/**
 * 坐标转换相关类型定义
 */

/**
 * 坐标类型 [x, y] 或 [经度, 纬度]
 */
export type Coordinate = [number, number];

/**
 * 范围类型 [minX, minY, maxX, maxY]
 */
export type Extent = [number, number, number, number];

/**
 * 坐标系统枚举
 */
export enum CoordinateSystem {
  /** WGS84 地理坐标系 */
  WGS84 = 'EPSG:4326',
  /** Web Mercator 投影坐标系 */
  WEB_MERCATOR = 'EPSG:3857',
  /** 中国大地坐标系2000 */
  CGCS2000 = 'EPSG:4490',
  /** 北京54坐标系 */
  BEIJING54 = 'EPSG:4214',
  /** 西安80坐标系 */
  XIAN80 = 'EPSG:4610',
  /** 火星坐标系（GCJ-02） */
  GCJ02 = 'GCJ02',
  /** 百度坐标系（BD-09） */
  BD09 = 'BD09'
}

/**
 * 坐标转换结果接口
 */
export interface CoordinateTransformResult {
  /** 转换后的坐标 */
  coordinate: Coordinate;
  /** 源坐标系 */
  fromProjection: string;
  /** 目标坐标系 */
  toProjection: string;
  /** 转换是否成功 */
  success: boolean;
  /** 错误信息（如果转换失败） */
  error?: string;
  /** 转换精度（0-1） */
  accuracy: number;
}

/**
 * 坐标转换工具接口
 */
export interface ICoordinateUtils {
  /** 转换坐标 */
  transformCoordinate(
    coordinate: Coordinate, 
    fromProjection: string, 
    toProjection: string
  ): CoordinateTransformResult;
  
  /** 转换范围 */
  transformExtent(
    extent: Extent, 
    fromProjection: string, 
    toProjection: string
  ): Extent;
  
  /** WGS84 转 Web Mercator */
  wgs84ToWebMercator(coordinate: Coordinate): Coordinate;
  
  /** Web Mercator 转 WGS84 */
  webMercatorToWgs84(coordinate: Coordinate): Coordinate;
  
  /** 注册自定义投影 */
  registerProjection(code: string, definition: string): void;
  
  /** 获取已注册的投影列表 */
  getRegisteredProjections(): string[];
  
  /** 检查投影是否已注册 */
  isProjectionRegistered(code: string): boolean;
}

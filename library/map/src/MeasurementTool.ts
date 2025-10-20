/**
 * MeasurementTool - 测量工具
 * 提供距离测量和面积测量功能
 */

/**
 * 计算两点之间的大圆距离（Haversine公式）
 * @param point1 第一个点 [经度, 纬度]
 * @param point2 第二个点 [经度, 纬度]
 * @returns 距离（米）
 */
export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const R = 6371000; // 地球半径（米）
  const lat1 = (point1[1] * Math.PI) / 180;
  const lat2 = (point2[1] * Math.PI) / 180;
  const deltaLat = ((point2[1] - point1[1]) * Math.PI) / 180;
  const deltaLng = ((point2[0] - point1[0]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * 计算路径的总长度
 * @param path 路径点数组 [[经度, 纬度], ...]
 * @returns 总距离（米）
 */
export function calculatePathLength(path: [number, number][]): number {
  if (path.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1]);
  }

  return totalDistance;
}

/**
 * 计算多边形的面积（使用球面三角形公式）
 * @param polygon 多边形点数组 [[经度, 纬度], ...]
 * @returns 面积（平方米）
 */
export function calculatePolygonArea(polygon: [number, number][]): number {
  if (polygon.length < 3) {
    return 0;
  }

  const R = 6371000; // 地球半径（米）
  
  // 确保多边形闭合
  const coords = [...polygon];
  if (coords[0][0] !== coords[coords.length - 1][0] || 
      coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push(coords[0]);
  }

  let area = 0;
  
  for (let i = 0; i < coords.length - 1; i++) {
    const lng1 = (coords[i][0] * Math.PI) / 180;
    const lng2 = (coords[i + 1][0] * Math.PI) / 180;
    const lat1 = (coords[i][1] * Math.PI) / 180;
    const lat2 = (coords[i + 1][1] * Math.PI) / 180;
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area * R * R / 2);
  
  return area;
}

/**
 * 格式化距离为人类可读的字符串
 * @param meters 距离（米）
 * @returns 格式化的字符串
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(2)} m`;
  } else if (meters < 1000000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${(meters / 1000000).toFixed(2)} Mm`;
  }
}

/**
 * 格式化面积为人类可读的字符串
 * @param squareMeters 面积（平方米）
 * @returns 格式化的字符串
 */
export function formatArea(squareMeters: number): string {
  if (squareMeters < 10000) {
    return `${squareMeters.toFixed(2)} m²`;
  } else if (squareMeters < 1000000) {
    return `${(squareMeters / 10000).toFixed(2)} 公顷`;
  } else {
    return `${(squareMeters / 1000000).toFixed(2)} km²`;
  }
}

/**
 * 测量工具类型
 */
export type MeasurementType = 'distance' | 'area';

/**
 * 测量结果接口
 */
export interface MeasurementResult {
  type: MeasurementType;
  value: number;
  formatted: string;
  points: [number, number][];
}

/**
 * MeasurementTool 类
 */
export class MeasurementTool {
  private type: MeasurementType;
  private points: [number, number][] = [];
  private isActive: boolean = false;
  private onMeasure?: (result: MeasurementResult) => void;

  constructor(type: MeasurementType, onMeasure?: (result: MeasurementResult) => void) {
    this.type = type;
    this.onMeasure = onMeasure;
  }

  /**
   * 激活测量工具
   */
  activate(): void {
    this.isActive = true;
    this.points = [];
  }

  /**
   * 停用测量工具
   */
  deactivate(): void {
    this.isActive = false;
    this.points = [];
  }

  /**
   * 添加测量点
   */
  addPoint(point: [number, number]): void {
    if (!this.isActive) {
      return;
    }

    this.points.push(point);
    this.updateMeasurement();
  }

  /**
   * 移除最后一个点
   */
  removeLastPoint(): void {
    if (this.points.length > 0) {
      this.points.pop();
      this.updateMeasurement();
    }
  }

  /**
   * 清空所有点
   */
  clearPoints(): void {
    this.points = [];
  }

  /**
   * 完成测量
   */
  finish(): MeasurementResult | null {
    if (this.points.length < 2) {
      return null;
    }

    const result = this.getMeasurement();
    this.deactivate();
    return result;
  }

  /**
   * 获取当前测量结果
   */
  getMeasurement(): MeasurementResult | null {
    if (this.type === 'distance') {
      if (this.points.length < 2) {
        return null;
      }
      const value = calculatePathLength(this.points);
      return {
        type: 'distance',
        value,
        formatted: formatDistance(value),
        points: [...this.points]
      };
    } else if (this.type === 'area') {
      if (this.points.length < 3) {
        return null;
      }
      const value = calculatePolygonArea(this.points);
      return {
        type: 'area',
        value,
        formatted: formatArea(value),
        points: [...this.points]
      };
    }

    return null;
  }

  /**
   * 更新测量（内部使用）
   */
  private updateMeasurement(): void {
    if (this.onMeasure) {
      const result = this.getMeasurement();
      if (result) {
        this.onMeasure(result);
      }
    }
  }

  /**
   * 获取所有点
   */
  getPoints(): [number, number][] {
    return [...this.points];
  }

  /**
   * 获取点数
   */
  getPointCount(): number {
    return this.points.length;
  }

  /**
   * 检查是否激活
   */
  isActivated(): boolean {
    return this.isActive;
  }

  /**
   * 获取测量类型
   */
  getType(): MeasurementType {
    return this.type;
  }

  /**
   * 设置测量类型
   */
  setType(type: MeasurementType): void {
    this.type = type;
    this.clearPoints();
  }
}

/**
 * 创建距离测量工具
 */
export function createDistanceTool(onMeasure?: (result: MeasurementResult) => void): MeasurementTool {
  return new MeasurementTool('distance', onMeasure);
}

/**
 * 创建面积测量工具
 */
export function createAreaTool(onMeasure?: (result: MeasurementResult) => void): MeasurementTool {
  return new MeasurementTool('area', onMeasure);
}










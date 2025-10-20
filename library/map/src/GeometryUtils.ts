/**
 * GeometryUtils - 几何工具集
 * 提供常用的几何计算功能
 */

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class GeometryUtils {
  /**
   * 计算两点之间的距离（Haversine公式）
   */
  static haversineDistance(
    lng1: number,
    lat1: number,
    lng2: number,
    lat2: number
  ): number {
    const R = 6371000; // 地球半径（米）
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * 计算多边形面积（球面三角形公式）
   */
  static polygonArea(coordinates: number[][]): number {
    if (coordinates.length < 3) return 0;

    const R = 6371000; // 地球半径（米）
    const coords = [...coordinates];

    // 确保首尾相连
    if (
      coords[0][0] !== coords[coords.length - 1][0] ||
      coords[0][1] !== coords[coords.length - 1][1]
    ) {
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

    return Math.abs((area * R * R) / 2);
  }

  /**
   * 计算路径长度
   */
  static pathLength(coordinates: number[][]): number {
    let length = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      length += this.haversineDistance(
        coordinates[i][0],
        coordinates[i][1],
        coordinates[i + 1][0],
        coordinates[i + 1][1]
      );
    }
    return length;
  }

  /**
   * 计算多边形的质心
   */
  static polygonCentroid(coordinates: number[][]): [number, number] | null {
    if (coordinates.length === 0) return null;

    let sumX = 0,
      sumY = 0;
    let area = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const x0 = coordinates[i][0];
      const y0 = coordinates[i][1];
      const x1 = coordinates[i + 1][0];
      const y1 = coordinates[i + 1][1];
      const a = x0 * y1 - x1 * y0;
      area += a;
      sumX += (x0 + x1) * a;
      sumY += (y0 + y1) * a;
    }

    if (area === 0) {
      // 如果面积为0，返回简单平均值
      const avgX = coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length;
      const avgY = coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length;
      return [avgX, avgY];
    }

    area *= 0.5;
    const centerX = sumX / (6.0 * area);
    const centerY = sumY / (6.0 * area);

    return [centerX, centerY];
  }

  /**
   * 检查点是否在多边形内（射线法）
   */
  static pointInPolygon(point: [number, number], polygon: number[][]): boolean {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * 计算边界框
   */
  static calculateBounds(coordinates: number[][]): Bounds {
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    coordinates.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    return { minX, minY, maxX, maxY };
  }

  /**
   * 计算两个边界框的交集
   */
  static intersectBounds(b1: Bounds, b2: Bounds): Bounds | null {
    const minX = Math.max(b1.minX, b2.minX);
    const minY = Math.max(b1.minY, b2.minY);
    const maxX = Math.min(b1.maxX, b2.maxX);
    const maxY = Math.min(b1.maxY, b2.maxY);

    if (minX >= maxX || minY >= maxY) {
      return null; // 没有交集
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * 检查两个边界框是否相交
   */
  static boundsIntersect(b1: Bounds, b2: Bounds): boolean {
    return !(
      b1.maxX < b2.minX ||
      b1.minX > b2.maxX ||
      b1.maxY < b2.minY ||
      b1.minY > b2.maxY
    );
  }

  /**
   * 简化路径（Douglas-Peucker算法）
   */
  static simplifyPath(
    coordinates: number[][],
    tolerance: number = 0.0001
  ): number[][] {
    if (coordinates.length <= 2) return coordinates;

    let dmax = 0;
    let index = 0;

    const end = coordinates.length - 1;
    for (let i = 1; i < end; i++) {
      const d = this.perpendicularDistance(
        coordinates[i],
        coordinates[0],
        coordinates[end]
      );
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }

    if (dmax > tolerance) {
      const left = this.simplifyPath(coordinates.slice(0, index + 1), tolerance);
      const right = this.simplifyPath(coordinates.slice(index), tolerance);
      return left.slice(0, -1).concat(right);
    } else {
      return [coordinates[0], coordinates[end]];
    }
  }

  /**
   * 计算点到线段的垂直距离
   */
  private static perpendicularDistance(
    point: number[],
    lineStart: number[],
    lineEnd: number[]
  ): number {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
      return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
    }

    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);

    if (t < 0) {
      return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
    } else if (t > 1) {
      return Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
    }

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
  }

  /**
   * 插值计算两点之间的中间点
   */
  static interpolate(
    p1: [number, number],
    p2: [number, number],
    fraction: number
  ): [number, number] {
    return [p1[0] + (p2[0] - p1[0]) * fraction, p1[1] + (p2[1] - p1[1]) * fraction];
  }

  /**
   * 计算方位角（从北方顺时针）
   */
  static bearing(lng1: number, lat1: number, lng2: number, lat2: number): number {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);

    return ((θ * 180) / Math.PI + 360) % 360;
  }

  /**
   * 根据距离和方位角计算目标点
   */
  static destination(
    lng: number,
    lat: number,
    distance: number,
    bearing: number
  ): [number, number] {
    const R = 6371000; // 地球半径（米）
    const φ1 = (lat * Math.PI) / 180;
    const λ1 = (lng * Math.PI) / 180;
    const θ = (bearing * Math.PI) / 180;
    const δ = distance / R;

    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );

    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
      );

    return [((λ2 * 180) / Math.PI + 540) % 360 - 180, (φ2 * 180) / Math.PI];
  }

  /**
   * 格式化距离
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) return `${meters.toFixed(2)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  }

  /**
   * 格式化面积
   */
  static formatArea(squareMeters: number): string {
    if (squareMeters < 10000) return `${squareMeters.toFixed(2)} m²`;
    else if (squareMeters < 1000000)
      return `${(squareMeters / 10000).toFixed(2)} 公顷`;
    return `${(squareMeters / 1000000).toFixed(2)} km²`;
  }

  /**
   * 创建缓冲区（简化版）
   */
  static createBuffer(point: [number, number], radiusMeters: number, segments: number = 32): number[][] {
    const points: number[][] = [];
    const angleStep = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
      const angle = i * angleStep;
      const bearing = (angle * 180) / Math.PI;
      const destination = this.destination(point[0], point[1], radiusMeters, bearing);
      points.push(destination);
    }

    // 闭合多边形
    points.push(points[0]);

    return points;
  }

  /**
   * 计算线段与线段的交点
   */
  static lineIntersection(
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    p4: [number, number]
  ): [number, number] | null {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const [x3, y3] = p3;
    const [x4, y4] = p4;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null; // 平行线

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
    }

    return null; // 不相交
  }
}



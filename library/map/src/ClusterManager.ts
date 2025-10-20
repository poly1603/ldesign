import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';

/**
 * 聚类点数据接口
 */
export interface ClusterPoint {
  position: [number, number];
  weight?: number;
  [key: string]: any;
}

/**
 * 聚类结果接口
 */
export interface Cluster {
  id: string;
  position: [number, number];
  points: ClusterPoint[];
  count: number;
  weight: number;
}

/**
 * 聚类配置选项
 */
export interface ClusterOptions {
  id?: string;
  data: ClusterPoint[];
  radius?: number; // 聚类半径（像素）
  minPoints?: number; // 最小聚类点数
  maxZoom?: number; // 最大聚类缩放级别
  clusterColor?: number[];
  pointColor?: number[];
  showCount?: boolean;
  getPosition?: (d: any) => [number, number];
  getWeight?: (d: any) => number;
  radiusScale?: number;
  radiusMinPixels?: number;
  radiusMaxPixels?: number;
}

/**
 * ClusterManager - 聚类管理器
 * 实现基于网格的点聚类算法
 */
export class ClusterManager {
  private clusters: Map<string, ClusterOptions> = new Map();
  private clusterIdCounter = 0;

  /**
   * 添加聚类
   */
  addCluster(options: ClusterOptions): string {
    const clusterId = options.id || `cluster-${++this.clusterIdCounter}`;
    const clusterWithId = { ...options, id: clusterId };
    this.clusters.set(clusterId, clusterWithId);
    return clusterId;
  }

  /**
   * 更新聚类
   */
  updateCluster(clusterId: string, updates: Partial<ClusterOptions>): void {
    const cluster = this.clusters.get(clusterId);
    if (cluster) {
      this.clusters.set(clusterId, { ...cluster, ...updates });
    }
  }

  /**
   * 删除聚类
   */
  removeCluster(clusterId: string): void {
    this.clusters.delete(clusterId);
  }

  /**
   * 清空所有聚类
   */
  clear(): void {
    this.clusters.clear();
  }

  /**
   * 执行聚类算法（优化版）
   */
  private performClustering(
    points: ClusterPoint[],
    radius: number,
    minPoints: number,
    zoom: number,
    maxZoom: number
  ): Cluster[] {
    // 如果缩放级别超过最大聚类级别，不进行聚类
    if (zoom > maxZoom) {
      return points.map((point, index) => ({
        id: `point-${index}`,
        position: point.position,
        points: [point],
        count: 1,
        weight: point.weight || 1
      }));
    }

    // 优化：使用更精确的网格大小计算
    const cellSize = radius / Math.pow(2, Math.min(zoom, 20));
    const grid: Map<string, ClusterPoint[]> = new Map();

    // 优化：使用整数网格坐标提升性能
    const toGridKey = (lng: number, lat: number): string => {
      const x = Math.floor(lng / cellSize);
      const y = Math.floor(lat / cellSize);
      return `${x}:${y}`; // 使用冒号分隔符，避免坐标混淆
    };

    // 优化：批量分配点到网格
    const gridKeys: string[] = new Array(points.length);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const key = toGridKey(point.position[0], point.position[1]);
      gridKeys[i] = key;
      
      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(point);
    }

    // 生成聚类结果
    const clusters: Cluster[] = [];
    let clusterIndex = 0;

    grid.forEach((cellPoints) => {
      if (cellPoints.length >= minPoints) {
        // 优化：使用更高效的加权平均计算
        const result = cellPoints.reduce(
          (acc, point) => {
            const weight = point.weight || 1;
            acc.totalWeight += weight;
            acc.weightedLng += point.position[0] * weight;
            acc.weightedLat += point.position[1] * weight;
            return acc;
          },
          { totalWeight: 0, weightedLng: 0, weightedLat: 0 }
        );

        const centerPosition: [number, number] = [
          result.weightedLng / result.totalWeight,
          result.weightedLat / result.totalWeight
        ];

        clusters.push({
          id: `cluster-${clusterIndex++}`,
          position: centerPosition,
          points: cellPoints,
          count: cellPoints.length,
          weight: result.totalWeight
        });
      } else {
        // 单点不聚类
        cellPoints.forEach((point) => {
          clusters.push({
            id: `point-${clusterIndex++}`,
            position: point.position,
            points: [point],
            count: 1,
            weight: point.weight || 1
          });
        });
      }
    });

    return clusters;
  }

  /**
   * 获取聚类图层
   */
  getLayers(currentZoom: number = 10): DeckGLLayer[] {
    const layers: DeckGLLayer[] = [];

    this.clusters.forEach((clusterOptions) => {
      const {
        data,
        radius = 60,
        minPoints = 2,
        maxZoom = 15,
        clusterColor = [0, 140, 255, 200],
        pointColor = [255, 100, 0, 200],
        showCount = true,
        radiusScale = 1,
        radiusMinPixels = 5,
        radiusMaxPixels = 50
      } = clusterOptions;

      // 执行聚类
      const clusteredData = this.performClustering(
        data,
        radius,
        minPoints,
        currentZoom,
        maxZoom
      );

      // 创建散点图层
      const scatterLayer = new ScatterplotLayer({
        id: `${clusterOptions.id}-scatter`,
        data: clusteredData,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale,
        radiusMinPixels,
        radiusMaxPixels,
        lineWidthMinPixels: 1,
        getPosition: (d: Cluster) => d.position,
        getRadius: (d: Cluster) => {
          // 聚类点半径根据点数缩放
          return d.count > 1 ? Math.sqrt(d.count) * 5 : 5;
        },
        getFillColor: (d: Cluster) => {
          return d.count > 1 ? clusterColor : pointColor;
        },
        getLineColor: [255, 255, 255, 200],
        updateTriggers: {
          getRadius: currentZoom,
          getFillColor: currentZoom
        }
      } as any);

      layers.push(scatterLayer);

      // 如果启用显示数量，添加文本图层
      if (showCount) {
        const textData = clusteredData.filter((d) => d.count > 1);

        if (textData.length > 0) {
          const textLayer = new TextLayer({
            id: `${clusterOptions.id}-text`,
            data: textData,
            pickable: false,
            getPosition: (d: Cluster) => d.position,
            getText: (d: Cluster) => String(d.count),
            getSize: 14,
            getColor: [255, 255, 255, 255],
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            fontWeight: 'bold',
            updateTriggers: {
              getText: currentZoom
            }
          } as any);

          layers.push(textLayer);
        }
      }
    });

    return layers;
  }

  /**
   * 获取聚类
   */
  getCluster(clusterId: string): ClusterOptions | undefined {
    return this.clusters.get(clusterId);
  }

  /**
   * 获取所有聚类
   */
  getAllClusters(): ClusterOptions[] {
    return Array.from(this.clusters.values());
  }

  /**
   * 获取聚类统计信息
   */
  getStats(clusterId: string, zoom: number = 10): {
    totalPoints: number;
    clusterCount: number;
    avgClusterSize: number;
    maxClusterSize: number;
  } | null {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      return null;
    }

    const {
      data,
      radius = 60,
      minPoints = 2,
      maxZoom = 15
    } = cluster;

    const clusteredData = this.performClustering(
      data,
      radius,
      minPoints,
      zoom,
      maxZoom
    );

    const clusterSizes = clusteredData.map((c) => c.count);
    const totalClusters = clusteredData.filter((c) => c.count > 1).length;

    return {
      totalPoints: data.length,
      clusterCount: totalClusters,
      avgClusterSize: totalClusters > 0
        ? clusterSizes.reduce((sum, size) => sum + size, 0) / totalClusters
        : 0,
      maxClusterSize: Math.max(...clusterSizes, 0)
    };
  }
}


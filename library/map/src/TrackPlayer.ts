import { TripsLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer, IconLayer, PathLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';

/**
 * 轨迹点数据
 */
export interface TrackPoint {
  position: [number, number];
  timestamp: number;
  altitude?: number;
  speed?: number;
  direction?: number;
  data?: any;
}

/**
 * 轨迹数据
 */
export interface TrackData {
  id: string;
  points: TrackPoint[];
  color?: number[];
  width?: number;
  name?: string;
  description?: string;
}

/**
 * 播放选项
 */
export interface PlayOptions {
  speed?: number;           // 播放速度倍数
  loop?: boolean;           // 是否循环播放
  trailLength?: number;     // 轨迹尾巴长度（毫秒）
  showPath?: boolean;       // 是否显示完整路径
  showMarker?: boolean;     // 是否显示移动标记
  markerIcon?: string;      // 标记图标
  onFrame?: (progress: number, point: TrackPoint) => void;
  onComplete?: () => void;
}

/**
 * 轨迹播放状态
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'finished';

/**
 * TrackPlayer - 轨迹回放播放器
 * 支持轨迹动画播放、速度控制、进度控制等
 */
export class TrackPlayer {
  private tracks: Map<string, TrackData> = new Map();
  private layers: DeckGLLayer[] = [];
  private state: PlaybackState = 'idle';
  private currentTime: number = 0;
  private totalDuration: number = 0;
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  private playOptions: PlayOptions = {};
  private progress: number = 0;
  private currentPoints: Map<string, TrackPoint> = new Map();

  /**
   * 添加轨迹
   */
  addTrack(track: TrackData): void {
    this.tracks.set(track.id, track);
    this.calculateDuration();
    this.updateLayers();
  }

  /**
   * 批量添加轨迹
   */
  addTracks(tracks: TrackData[]): void {
    tracks.forEach(track => {
      this.tracks.set(track.id, track);
    });
    this.calculateDuration();
    this.updateLayers();
  }

  /**
   * 移除轨迹
   */
  removeTrack(trackId: string): void {
    this.tracks.delete(trackId);
    this.calculateDuration();
    this.updateLayers();
  }

  /**
   * 清空所有轨迹
   */
  clearTracks(): void {
    this.stop();
    this.tracks.clear();
    this.layers = [];
    this.currentTime = 0;
    this.totalDuration = 0;
    this.progress = 0;
  }

  /**
   * 开始播放
   */
  play(options: PlayOptions = {}): void {
    if (this.tracks.size === 0) return;

    this.playOptions = {
      speed: 1,
      loop: false,
      trailLength: 1000,
      showPath: true,
      showMarker: true,
      ...options
    };

    this.state = 'playing';
    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * 暂停播放
   */
  pause(): void {
    this.state = 'paused';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    this.state = 'idle';
    this.currentTime = 0;
    this.progress = 0;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.updateLayers();
  }

  /**
   * 跳转到指定进度
   */
  seek(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
    this.currentTime = this.totalDuration * this.progress;
    this.updateCurrentPoints();
    this.updateLayers();
  }

  /**
   * 设置播放速度
   */
  setSpeed(speed: number): void {
    this.playOptions.speed = Math.max(0.1, Math.min(10, speed));
  }

  /**
   * 获取当前状态
   */
  getState(): PlaybackState {
    return this.state;
  }

  /**
   * 获取当前进度
   */
  getProgress(): number {
    return this.progress;
  }

  /**
   * 获取图层
   */
  getLayers(): DeckGLLayer[] {
    return this.layers;
  }

  /**
   * 动画循环
   */
  private animate(): void {
    if (this.state !== 'playing') return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // 更新时间
    this.currentTime += deltaTime * (this.playOptions.speed || 1);

    // 检查是否完成
    if (this.currentTime >= this.totalDuration) {
      if (this.playOptions.loop) {
        this.currentTime = 0;
      } else {
        this.state = 'finished';
        this.currentTime = this.totalDuration;
        if (this.playOptions.onComplete) {
          this.playOptions.onComplete();
        }
      }
    }

    // 更新进度
    this.progress = this.totalDuration > 0 ? this.currentTime / this.totalDuration : 0;

    // 更新当前点位置
    this.updateCurrentPoints();

    // 更新图层
    this.updateLayers();

    // 回调
    if (this.playOptions.onFrame && this.currentPoints.size > 0) {
      const firstPoint = Array.from(this.currentPoints.values())[0];
      this.playOptions.onFrame(this.progress, firstPoint);
    }

    // 继续动画
    if (this.state === 'playing') {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }

  /**
   * 计算总时长
   */
  private calculateDuration(): void {
    let maxDuration = 0;

    this.tracks.forEach(track => {
      if (track.points.length > 0) {
        const lastPoint = track.points[track.points.length - 1];
        const firstPoint = track.points[0];
        const duration = lastPoint.timestamp - firstPoint.timestamp;
        maxDuration = Math.max(maxDuration, duration);
      }
    });

    this.totalDuration = maxDuration;
  }

  /**
   * 更新当前点
   */
  private updateCurrentPoints(): void {
    this.currentPoints.clear();

    this.tracks.forEach(track => {
      const point = this.interpolatePoint(track, this.currentTime);
      if (point) {
        this.currentPoints.set(track.id, point);
      }
    });
  }

  /**
   * 插值计算当前位置
   */
  private interpolatePoint(track: TrackData, time: number): TrackPoint | null {
    const points = track.points;
    if (points.length === 0) return null;

    const startTime = points[0].timestamp;
    const relativeTime = startTime + time;

    // 找到时间段
    for (let i = 0; i < points.length - 1; i++) {
      if (relativeTime >= points[i].timestamp && relativeTime <= points[i + 1].timestamp) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const t = (relativeTime - p1.timestamp) / (p2.timestamp - p1.timestamp);

        // 线性插值
        return {
          position: [
            p1.position[0] + (p2.position[0] - p1.position[0]) * t,
            p1.position[1] + (p2.position[1] - p1.position[1]) * t
          ],
          timestamp: relativeTime,
          altitude: p1.altitude && p2.altitude ?
            p1.altitude + (p2.altitude - p1.altitude) * t : undefined,
          speed: p1.speed && p2.speed ?
            p1.speed + (p2.speed - p1.speed) * t : undefined,
          direction: p1.direction && p2.direction ?
            p1.direction + (p2.direction - p1.direction) * t : undefined
        };
      }
    }

    // 返回最后一个点
    return points[points.length - 1];
  }

  /**
   * 更新图层
   */
  private updateLayers(): void {
    const layers: DeckGLLayer[] = [];

    // 添加轨迹路径
    if (this.playOptions.showPath) {
      this.tracks.forEach(track => {
        const pathLayer = new PathLayer({
          id: `track-path-${track.id}`,
          data: [{
            path: track.points.map(p => p.position)
          }],
          getPath: (d: any) => d.path,
          getColor: track.color || [255, 0, 0, 255],
          getWidth: track.width || 2,
          widthMinPixels: 2,
          pickable: false
        });
        layers.push(pathLayer);
      });
    }

    // 添加轨迹尾巴
    if (this.playOptions.trailLength && this.playOptions.trailLength > 0) {
      this.tracks.forEach(track => {
        const trailPoints = this.getTrailPoints(track, this.currentTime, this.playOptions.trailLength!);
        if (trailPoints.length > 1) {
          const trailLayer = new PathLayer({
            id: `track-trail-${track.id}`,
            data: [{
              path: trailPoints
            }],
            getPath: (d: any) => d.path,
            getColor: track.color || [255, 0, 0, 200],
            getWidth: (track.width || 2) * 1.5,
            widthMinPixels: 3,
            pickable: false
          });
          layers.push(trailLayer);
        }
      });
    }

    // 添加移动标记
    if (this.playOptions.showMarker && this.currentPoints.size > 0) {
      const markerData = Array.from(this.currentPoints.entries()).map(([trackId, point]) => ({
        id: trackId,
        position: point.position,
        color: this.tracks.get(trackId)?.color || [255, 0, 0],
        direction: point.direction || 0
      }));

      if (this.playOptions.markerIcon) {
        // 使用图标标记
        const iconLayer = new IconLayer({
          id: 'track-markers',
          data: markerData,
          getPosition: (d: any) => d.position,
          getIcon: () => ({
            url: this.playOptions.markerIcon!,
            width: 128,
            height: 128,
            anchorY: 128
          }),
          getAngle: (d: any) => 360 - d.direction,
          sizeScale: 0.5,
          pickable: true
        });
        layers.push(iconLayer);
      } else {
        // 使用圆点标记
        const markerLayer = new ScatterplotLayer({
          id: 'track-markers',
          data: markerData,
          getPosition: (d: any) => d.position,
          getFillColor: (d: any) => [...d.color, 255],
          getRadius: 8,
          radiusMinPixels: 5,
          radiusMaxPixels: 20,
          pickable: true
        });
        layers.push(markerLayer);
      }
    }

    this.layers = layers;
  }

  /**
   * 获取轨迹尾巴点
   */
  private getTrailPoints(track: TrackData, currentTime: number, trailLength: number): [number, number][] {
    const points = track.points;
    const startTime = points[0].timestamp;
    const relativeTime = startTime + currentTime;
    const trailStartTime = relativeTime - trailLength;

    const trailPoints: [number, number][] = [];

    for (const point of points) {
      if (point.timestamp >= trailStartTime && point.timestamp <= relativeTime) {
        trailPoints.push(point.position);
      }
    }

    // 添加当前插值点
    const currentPoint = this.currentPoints.get(track.id);
    if (currentPoint && trailPoints.length > 0) {
      trailPoints.push(currentPoint.position);
    }

    return trailPoints;
  }

  /**
   * 导出轨迹数据
   */
  exportTracks(): TrackData[] {
    return Array.from(this.tracks.values());
  }

  /**
   * 导入轨迹数据
   */
  importTracks(tracks: TrackData[]): void {
    this.clearTracks();
    this.addTracks(tracks);
  }

  /**
   * 生成轨迹统计信息
   */
  getStatistics(): any {
    const stats: any = {
      trackCount: this.tracks.size,
      totalPoints: 0,
      totalDistance: 0,
      totalDuration: this.totalDuration,
      tracks: []
    };

    this.tracks.forEach(track => {
      const points = track.points;
      let distance = 0;

      // 计算距离
      for (let i = 0; i < points.length - 1; i++) {
        distance += this.calculateDistance(points[i].position, points[i + 1].position);
      }

      stats.totalPoints += points.length;
      stats.totalDistance += distance;

      stats.tracks.push({
        id: track.id,
        name: track.name,
        pointCount: points.length,
        distance,
        duration: points.length > 0 ?
          points[points.length - 1].timestamp - points[0].timestamp : 0,
        averageSpeed: points.length > 1 ?
          distance / ((points[points.length - 1].timestamp - points[0].timestamp) / 1000) : 0
      });
    });

    return stats;
  }

  /**
   * 计算两点距离
   */
  private calculateDistance(p1: [number, number], p2: [number, number]): number {
    const R = 6371000; // 地球半径（米）
    const lat1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    const deltaLat = ((p2[1] - p1[1]) * Math.PI) / 180;
    const deltaLng = ((p2[0] - p1[0]) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

/**
 * 创建轨迹播放器
 */
export function createTrackPlayer(): TrackPlayer {
  return new TrackPlayer();
}

/**
 * 从 GPS 数据创建轨迹
 */
export function createTrackFromGPS(data: any[], options?: {
  positionKey?: string;
  timestampKey?: string;
  altitudeKey?: string;
  speedKey?: string;
}): TrackData {
  const opts = {
    positionKey: 'position',
    timestampKey: 'timestamp',
    altitudeKey: 'altitude',
    speedKey: 'speed',
    ...options
  };

  const points: TrackPoint[] = data.map(item => ({
    position: item[opts.positionKey],
    timestamp: item[opts.timestampKey],
    altitude: item[opts.altitudeKey],
    speed: item[opts.speedKey],
    data: item
  }));

  return {
    id: `track-${Date.now()}`,
    points
  };
}
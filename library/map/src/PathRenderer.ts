import { PathLayer, ArcLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';

/**
 * 路径数据接口
 */
export interface PathData {
  path: [number, number][];
  name?: string;
  color?: number[];
  width?: number;
  [key: string]: any;
}

/**
 * 弧线数据接口
 */
export interface ArcData {
  sourcePosition: [number, number];
  targetPosition: [number, number];
  name?: string;
  color?: number[];
  width?: number;
  [key: string]: any;
}

/**
 * 路径图层配置选项
 */
export interface PathLayerOptions {
  id?: string;
  data: PathData[];
  widthScale?: number;
  widthMinPixels?: number;
  widthMaxPixels?: number;
  rounded?: boolean;
  billboard?: boolean;
  miterLimit?: number;
  getPath?: (d: any) => [number, number][];
  getColor?: (d: any) => number[];
  getWidth?: (d: any) => number;
  pickable?: boolean;
  visible?: boolean;
  opacity?: number;
  capRounded?: boolean;
  jointRounded?: boolean;
  dashArray?: number[];
  dashJustified?: boolean;
  animated?: boolean;
  animationSpeed?: number;
}

/**
 * 弧线图层配置选项
 */
export interface ArcLayerOptions {
  id?: string;
  data: ArcData[];
  greatCircle?: boolean;
  numSegments?: number;
  widthUnits?: 'meters' | 'pixels';
  widthScale?: number;
  widthMinPixels?: number;
  widthMaxPixels?: number;
  getSourcePosition?: (d: any) => [number, number];
  getTargetPosition?: (d: any) => [number, number];
  getSourceColor?: (d: any) => number[];
  getTargetColor?: (d: any) => number[];
  getWidth?: (d: any) => number;
  getHeight?: (d: any) => number;
  getTilt?: (d: any) => number;
  pickable?: boolean;
  visible?: boolean;
  opacity?: number;
}

/**
 * PathRenderer - 路径渲染器
 * 用于绘制路线、轨迹和弧线
 */
export class PathRenderer {
  private paths: Map<string, PathLayerOptions> = new Map();
  private arcs: Map<string, ArcLayerOptions> = new Map();
  private pathIdCounter = 0;
  private arcIdCounter = 0;
  private animationTimer: number | null = null;
  private dashOffset = 0;

  /**
   * 添加路径
   */
  addPath(options: PathLayerOptions): string {
    const pathId = options.id || `path-${++this.pathIdCounter}`;
    const pathWithId = { ...options, id: pathId };
    this.paths.set(pathId, pathWithId);
    
    // 如果有动画效果，启动动画循环
    if (options.animated) {
      this.startAnimationLoop();
    }
    
    return pathId;
  }

  /**
   * 更新路径
   */
  updatePath(pathId: string, updates: Partial<PathLayerOptions>): void {
    const path = this.paths.get(pathId);
    if (path) {
      this.paths.set(pathId, { ...path, ...updates });
      
      if (updates.animated && !this.animationTimer) {
        this.startAnimationLoop();
      }
    }
  }

  /**
   * 删除路径
   */
  removePath(pathId: string): void {
    this.paths.delete(pathId);
    
    // 检查是否还有动画路径
    const hasAnimatedPaths = Array.from(this.paths.values()).some(p => p.animated);
    if (!hasAnimatedPaths && this.animationTimer) {
      this.stopAnimationLoop();
    }
  }

  /**
   * 添加弧线
   */
  addArc(options: ArcLayerOptions): string {
    const arcId = options.id || `arc-${++this.arcIdCounter}`;
    const arcWithId = { ...options, id: arcId };
    this.arcs.set(arcId, arcWithId);
    return arcId;
  }

  /**
   * 更新弧线
   */
  updateArc(arcId: string, updates: Partial<ArcLayerOptions>): void {
    const arc = this.arcs.get(arcId);
    if (arc) {
      this.arcs.set(arcId, { ...arc, ...updates });
    }
  }

  /**
   * 删除弧线
   */
  removeArc(arcId: string): void {
    this.arcs.delete(arcId);
  }

  /**
   * 清空所有路径和弧线
   */
  clear(): void {
    this.paths.clear();
    this.arcs.clear();
    this.stopAnimationLoop();
  }

  /**
   * 获取所有图层
   */
  getLayers(): DeckGLLayer[] {
    const layers: DeckGLLayer[] = [];

    // 添加路径图层
    this.paths.forEach((pathOptions) => {
      if (pathOptions.visible === false) {
        return;
      }

      const layer = new PathLayer({
        id: pathOptions.id,
        data: pathOptions.data,
        pickable: pathOptions.pickable !== false,
        widthScale: pathOptions.widthScale || 1,
        widthMinPixels: pathOptions.widthMinPixels || 1,
        widthMaxPixels: pathOptions.widthMaxPixels || 100,
        rounded: pathOptions.rounded !== false,
        billboard: pathOptions.billboard !== false,
        miterLimit: pathOptions.miterLimit || 4,
        capRounded: pathOptions.capRounded !== false,
        jointRounded: pathOptions.jointRounded !== false,
        getPath: pathOptions.getPath || ((d: PathData) => d.path),
        getColor: pathOptions.getColor || ((d: PathData) => d.color || [255, 0, 0, 255]),
        getWidth: pathOptions.getWidth || ((d: PathData) => d.width || 2),
        opacity: pathOptions.opacity || 1,
        updateTriggers: pathOptions.animated ? {
          // 动画更新触发器
          getDashArray: this.dashOffset
        } : undefined
      } as any);

      layers.push(layer);
    });

    // 添加弧线图层
    this.arcs.forEach((arcOptions) => {
      if (arcOptions.visible === false) {
        return;
      }

      const layer = new ArcLayer({
        id: arcOptions.id,
        data: arcOptions.data,
        pickable: arcOptions.pickable !== false,
        greatCircle: arcOptions.greatCircle !== false,
        numSegments: arcOptions.numSegments || 50,
        widthUnits: arcOptions.widthUnits || 'pixels',
        widthScale: arcOptions.widthScale || 1,
        widthMinPixels: arcOptions.widthMinPixels || 1,
        widthMaxPixels: arcOptions.widthMaxPixels || 100,
        getSourcePosition: arcOptions.getSourcePosition || ((d: ArcData) => d.sourcePosition),
        getTargetPosition: arcOptions.getTargetPosition || ((d: ArcData) => d.targetPosition),
        getSourceColor: arcOptions.getSourceColor || ((d: ArcData) => d.color || [0, 128, 255, 255]),
        getTargetColor: arcOptions.getTargetColor || ((d: ArcData) => d.color || [0, 128, 255, 255]),
        getWidth: arcOptions.getWidth || ((d: ArcData) => d.width || 2),
        getHeight: arcOptions.getHeight || (() => 0.1),
        getTilt: arcOptions.getTilt || (() => 0),
        opacity: arcOptions.opacity || 1
      } as any);

      layers.push(layer);
    });

    return layers;
  }

  /**
   * 启动动画循环
   */
  private startAnimationLoop(): void {
    if (this.animationTimer) return;

    const animate = () => {
      this.dashOffset += 0.01;
      if (this.dashOffset > 1) {
        this.dashOffset = 0;
      }

      const hasAnimatedPaths = Array.from(this.paths.values()).some(p => p.animated);
      if (hasAnimatedPaths) {
        this.animationTimer = requestAnimationFrame(animate);
      } else {
        this.stopAnimationLoop();
      }
    };

    this.animationTimer = requestAnimationFrame(animate);
  }

  /**
   * 停止动画循环
   */
  private stopAnimationLoop(): void {
    if (this.animationTimer) {
      cancelAnimationFrame(this.animationTimer);
      this.animationTimer = null;
    }
  }

  /**
   * 获取路径
   */
  getPath(pathId: string): PathLayerOptions | undefined {
    return this.paths.get(pathId);
  }

  /**
   * 获取所有路径
   */
  getAllPaths(): PathLayerOptions[] {
    return Array.from(this.paths.values());
  }

  /**
   * 获取弧线
   */
  getArc(arcId: string): ArcLayerOptions | undefined {
    return this.arcs.get(arcId);
  }

  /**
   * 获取所有弧线
   */
  getAllArcs(): ArcLayerOptions[] {
    return Array.from(this.arcs.values());
  }

  /**
   * 设置路径可见性
   */
  setPathVisibility(pathId: string, visible: boolean): void {
    this.updatePath(pathId, { visible });
  }

  /**
   * 设置弧线可见性
   */
  setArcVisibility(arcId: string, visible: boolean): void {
    this.updateArc(arcId, { visible });
  }
}










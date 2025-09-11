/**
 * Canvas渲染引擎
 * 负责管理Canvas渲染、视口变换、分层渲染等核心功能
 */

import type { Point, Rectangle, Size, Viewport, Style } from '@/types/index.js';
import {
  clearCanvas,
  setCanvasTransform,
  saveCanvasState,
  restoreCanvasState
} from '@/utils/index.js';

/**
 * 渲染层枚举
 */
export enum RenderLayer {
  /** 背景层 */
  BACKGROUND = 0,
  /** 网格层 */
  GRID = 1,
  /** 连接线层 */
  EDGES = 2,
  /** 节点层 */
  NODES = 3,
  /** 选择层 */
  SELECTION = 4,
  /** UI层 */
  UI = 5
}

/**
 * 渲染对象接口
 */
export interface RenderObject {
  /** 渲染层级 */
  layer: RenderLayer;
  /** 渲染优先级（同层级内的排序） */
  priority: number;
  /** 是否可见 */
  visible: boolean;
  /** 边界框 */
  bounds: Rectangle;
  /** 渲染函数 */
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void;
}

/**
 * 脏矩形区域
 */
export interface DirtyRect extends Rectangle {
  /** 是否需要重绘 */
  needsRedraw: boolean;
}

/**
 * Canvas渲染器类
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pixelRatio: number;
  private size: Size;
  private viewport: Viewport;
  private renderObjects: Map<string, RenderObject> = new Map();
  private dirtyRects: DirtyRect[] = [];
  private isRendering = false;
  private animationFrameId: number | null = null;
  private showGrid = true;
  private gridSize = 20;
  private gridStyle: Style = {
    strokeColor: '#e0e0e0',
    strokeWidth: 1,
    opacity: 0.5
  };

  constructor(canvas: HTMLCanvasElement, options?: { showGrid?: boolean; showRuler?: boolean }) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取Canvas 2D上下文');
    }
    this.ctx = ctx;
    this.pixelRatio = window.devicePixelRatio || 1;

    // 从Canvas获取尺寸
    this.size = {
      width: canvas.clientWidth,
      height: canvas.clientHeight
    };

    // 设置选项
    if (options) {
      this.showGrid = options.showGrid !== false;
    }

    // 初始化视口
    this.viewport = {
      scale: 1,
      offset: { x: 0, y: 0 },
      size: this.size
    };

    // 设置Canvas样式
    this.canvas.style.display = 'block';
    this.canvas.style.outline = 'none';
    this.canvas.tabIndex = 0;
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 获取Canvas上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 获取像素比例
   */
  getPixelRatio(): number {
    return this.pixelRatio;
  }

  /**
   * 获取渲染器尺寸
   */
  getSize(): Size {
    return { ...this.size };
  }

  /**
   * 设置渲染器尺寸
   */
  setSize(size: Size): void {
    this.size = size;
    this.viewport.size = size;

    // 更新Canvas尺寸
    this.canvas.width = size.width * this.pixelRatio;
    this.canvas.height = size.height * this.pixelRatio;
    this.canvas.style.width = `${size.width}px`;
    this.canvas.style.height = `${size.height}px`;

    // 重新设置缩放
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // 标记整个画布为脏区域
    this.markDirty({
      x: 0,
      y: 0,
      width: size.width,
      height: size.height
    });
  }

  /**
   * 获取视口信息
   */
  getViewport(): Viewport {
    return { ...this.viewport };
  }

  /**
   * 设置视口信息
   */
  setViewport(viewport: Partial<Viewport>): void {
    const oldViewport = { ...this.viewport };

    if (viewport.scale !== undefined) {
      this.viewport.scale = Math.max(0.1, Math.min(10, viewport.scale));
    }

    if (viewport.offset !== undefined) {
      this.viewport.offset = { ...viewport.offset };
    }

    if (viewport.size !== undefined) {
      this.viewport.size = { ...viewport.size };
    }

    // 如果视口发生变化，标记整个画布为脏区域
    if (oldViewport.scale !== this.viewport.scale ||
      oldViewport.offset.x !== this.viewport.offset.x ||
      oldViewport.offset.y !== this.viewport.offset.y) {
      this.markDirty({
        x: 0,
        y: 0,
        width: this.size.width,
        height: this.size.height
      });
    }
  }

  /**
   * 设置网格显示
   */
  setGridVisible(visible: boolean): void {
    if (this.showGrid !== visible) {
      this.showGrid = visible;
      this.markDirty({
        x: 0,
        y: 0,
        width: this.size.width,
        height: this.size.height
      });
    }
  }

  /**
   * 设置网格大小
   */
  setGridSize(size: number): void {
    if (this.gridSize !== size) {
      this.gridSize = size;
      if (this.showGrid) {
        this.markDirty({
          x: 0,
          y: 0,
          width: this.size.width,
          height: this.size.height
        });
      }
    }
  }

  /**
   * 添加渲染对象
   */
  addRenderObject(id: string, object: RenderObject): void {
    this.renderObjects.set(id, object);
    this.markDirty(object.bounds);
  }

  /**
   * 移除渲染对象
   */
  removeRenderObject(id: string): void {
    const object = this.renderObjects.get(id);
    if (object) {
      this.markDirty(object.bounds);
      this.renderObjects.delete(id);
    }
  }

  /**
   * 更新渲染对象
   */
  updateRenderObject(id: string, object: Partial<RenderObject>): void {
    const existingObject = this.renderObjects.get(id);
    if (existingObject) {
      // 标记旧边界为脏区域
      this.markDirty(existingObject.bounds);

      // 更新对象
      Object.assign(existingObject, object);

      // 标记新边界为脏区域
      this.markDirty(existingObject.bounds);
    }
  }

  /**
   * 标记脏区域
   */
  markDirty(rect: Rectangle): void {
    this.dirtyRects.push({
      ...rect,
      needsRedraw: true
    });

    // 请求重绘
    this.requestRender();
  }

  /**
   * 请求渲染
   */
  requestRender(): void {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.render();
        this.animationFrameId = null;
      });
    }
  }

  /**
   * 立即渲染
   */
  render(viewport?: Viewport, renderData?: { nodes: any[]; edges: any[]; selectionBox?: any; guides?: { vertical: number[]; horizontal: number[] } }): void {
    if (this.isRendering) {
      return;
    }

    this.isRendering = true;

    try {
      // 更新视口
      if (viewport) {
        this.viewport = viewport;
      }

      // 清除画布
      clearCanvas(this.ctx, this.size.width, this.size.height);

      // 设置视口变换
      saveCanvasState(this.ctx);
      setCanvasTransform(this.ctx, this.viewport);

      // 按层级渲染
      if (renderData) {
        this.renderFlowchartData(renderData);
      } else {
        this.renderByLayers();
      }

      // 恢复变换
      restoreCanvasState(this.ctx);

      // 清除脏区域
      this.dirtyRects = [];

    } finally {
      this.isRendering = false;
    }
  }

  /**
   * 渲染流程图数据
   */
  private renderFlowchartData(renderData: { nodes: any[]; edges: any[]; selectionBox?: any; guides?: { vertical: number[]; horizontal: number[] }; tempConnection?: { start: Point; end: Point } }): void {
    // 渲染背景和网格
    if (this.showGrid) {
      this.renderGrid();
    }

    // 渲染连接线
    for (const edge of renderData.edges) {
      if (edge.render) {
        saveCanvasState(this.ctx);
        edge.render(this.ctx, this.viewport);
        restoreCanvasState(this.ctx);
      }
    }

    // 渲染节点
    for (const node of renderData.nodes) {
      if (node.render) {
        saveCanvasState(this.ctx);
        node.render(this.ctx, this.viewport);
        restoreCanvasState(this.ctx);
      }
    }

    // 渲染选择框
    if (renderData.selectionBox) {
      this.renderSelectionBox(renderData.selectionBox);
    }

    // 渲染对齐辅助线
    if (renderData.guides && (renderData.guides.vertical?.length || renderData.guides.horizontal?.length)) {
      this.renderGuides(renderData.guides);
    }

    // 渲染连接预览
    if (renderData.tempConnection) {
      this.renderTempConnection(renderData.tempConnection);
    }
  }

  /**
   * 渲染对齐辅助线
   */
  private renderGuides(guides: { vertical: number[]; horizontal: number[] }): void {
    saveCanvasState(this.ctx);

    // 辅助线样式
    this.ctx.strokeStyle = 'var(--ldesign-brand-color)';
    this.ctx.lineWidth = 1 / this.viewport.scale;
    this.ctx.setLineDash([6, 6]);
    this.ctx.globalAlpha = 0.8;

    const worldWidth = this.size.width / this.viewport.scale;
    const worldHeight = this.size.height / this.viewport.scale;
    const startX = -this.viewport.offset.x;
    const startY = -this.viewport.offset.y;

    // 垂直线
    if (guides.vertical) {
      for (const x of guides.vertical) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, startY);
        this.ctx.lineTo(x, startY + worldHeight);
        this.ctx.stroke();
      }
    }

    // 水平线
    if (guides.horizontal) {
      for (const y of guides.horizontal) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(startX + worldWidth, y);
        this.ctx.stroke();
      }
    }

    restoreCanvasState(this.ctx);
  }

  /**
   * 渲染连接预览
   */
  private renderTempConnection(conn: { start: Point; end: Point }): void {
    saveCanvasState(this.ctx);
    this.ctx.strokeStyle = 'var(--ldesign-brand-color)';
    this.ctx.lineWidth = 2 / this.viewport.scale;
    this.ctx.setLineDash([8, 6]);
    this.ctx.globalAlpha = 0.9;

    this.ctx.beginPath();
    this.ctx.moveTo(conn.start.x, conn.start.y);
    this.ctx.lineTo(conn.end.x, conn.end.y);
    this.ctx.stroke();

    restoreCanvasState(this.ctx);
  }

  /**
   * 渲染选择框
   */
  private renderSelectionBox(selectionBox: any): void {
    if (!selectionBox || !selectionBox.visible) {
      return;
    }

    saveCanvasState(this.ctx);

    this.ctx.strokeStyle = '#007bff';
    this.ctx.lineWidth = 1 / this.viewport.scale;
    this.ctx.setLineDash([4, 4]);
    this.ctx.globalAlpha = 0.8;

    this.ctx.strokeRect(
      selectionBox.x,
      selectionBox.y,
      selectionBox.width,
      selectionBox.height
    );

    restoreCanvasState(this.ctx);
  }

  /**
   * 按层级渲染
   */
  private renderByLayers(): void {
    // 按层级和优先级排序渲染对象
    const sortedObjects = Array.from(this.renderObjects.values())
      .filter(obj => obj.visible)
      .sort((a, b) => {
        if (a.layer !== b.layer) {
          return a.layer - b.layer;
        }
        return a.priority - b.priority;
      });

    // 渲染背景和网格
    if (this.showGrid) {
      this.renderGrid();
    }

    // 渲染所有对象
    for (const object of sortedObjects) {
      try {
        saveCanvasState(this.ctx);
        object.render(this.ctx, this.viewport);
        restoreCanvasState(this.ctx);
      } catch (error) {
        console.error('渲染对象时发生错误:', error);
      }
    }
  }

  /**
   * 渲染网格
   */
  private renderGrid(): void {
    const { scale, offset } = this.viewport;
    const gridSize = this.gridSize * scale;

    if (gridSize < 5) {
      return; // 网格太小时不渲染
    }

    saveCanvasState(this.ctx);

    // 应用网格样式
    this.ctx.strokeStyle = this.gridStyle.strokeColor || '#e0e0e0';
    this.ctx.lineWidth = (this.gridStyle.strokeWidth || 1) / scale;
    this.ctx.globalAlpha = this.gridStyle.opacity || 0.5;

    // 计算网格起始位置
    const startX = Math.floor(-offset.x / this.gridSize) * this.gridSize;
    const startY = Math.floor(-offset.y / this.gridSize) * this.gridSize;
    const endX = startX + (this.size.width / scale) + this.gridSize;
    const endY = startY + (this.size.height / scale) + this.gridSize;

    // 绘制垂直线
    this.ctx.beginPath();
    for (let x = startX; x <= endX; x += this.gridSize) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }

    // 绘制水平线
    for (let y = startY; y <= endY; y += this.gridSize) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }

    this.ctx.stroke();
    restoreCanvasState(this.ctx);
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.renderObjects.clear();
    this.dirtyRects = [];

    // 移除Canvas
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

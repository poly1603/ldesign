/**
 * 渲染器 - 管理SVG画布和所有视图
 */

import { NodeModel } from '../model/Node';
import { EdgeModel } from '../model/Edge';
import { NodeView } from './NodeView';
import { EdgeView } from './EdgeView';
import { Viewport } from './Viewport';
import { ViewportConfig, BBox } from '../../types/view';

export class Renderer {
  private container: HTMLElement;
  private svg: SVGSVGElement;
  private defsGroup: SVGDefsElement;
  private edgesGroup: SVGGElement;
  private nodesGroup: SVGGElement;
  private contentGroup: SVGGElement;
  private viewport: Viewport;

  // 视图映射
  private nodeViews: Map<string, NodeView> = new Map();
  private edgeViews: Map<string, EdgeView> = new Map();

  // 节点模型映射（用于边视图查找节点）
  private nodeModels: Map<string, NodeModel> = new Map();

  constructor(container: HTMLElement, viewportConfig?: ViewportConfig) {
    this.container = container;

    // 创建SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.display = 'block';
    this.svg.style.background = '#f5f5f5';

    // 创建defs（定义可复用元素）
    this.defsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.svg.appendChild(this.defsGroup);

    // 创建内容组（应用视口变换）
    this.contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.contentGroup.setAttribute('class', 'fc-content');
    this.svg.appendChild(this.contentGroup);

    // 创建边组（先渲染）
    this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.edgesGroup.setAttribute('class', 'fc-edges');
    this.contentGroup.appendChild(this.edgesGroup);

    // 创建节点组（后渲染，在边之上）
    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup.setAttribute('class', 'fc-nodes');
    this.contentGroup.appendChild(this.nodesGroup);

    // 添加到容器
    this.container.appendChild(this.svg);

    // 初始化视口
    this.viewport = new Viewport(this.svg, this.contentGroup, viewportConfig);
  }

  /**
   * 渲染节点
   */
  renderNode(model: NodeModel): NodeView {
    // 如果已存在，先移除
    if (this.nodeViews.has(model.id)) {
      this.removeNode(model.id);
    }

    // 创建视图
    const view = new NodeView(model);
    this.nodeViews.set(model.id, view);
    this.nodeModels.set(model.id, model);

    // 添加到DOM
    this.nodesGroup.appendChild(view.getElement());

    return view;
  }

  /**
   * 渲染边
   */
  renderEdge(model: EdgeModel): EdgeView {
    // 如果已存在，先移除
    if (this.edgeViews.has(model.id)) {
      this.removeEdge(model.id);
    }

    // 创建视图
    const view = new EdgeView(model);
    this.edgeViews.set(model.id, view);

    // 设置节点引用
    const sourceNode = this.nodeModels.get(model.source);
    const targetNode = this.nodeModels.get(model.target);

    if (sourceNode && targetNode) {
      view.setNodes(sourceNode, targetNode);
    }

    // 添加到DOM
    this.edgesGroup.appendChild(view.getElement());

    return view;
  }

  /**
   * 移除节点
   */
  removeNode(id: string): void {
    const view = this.nodeViews.get(id);
    if (view) {
      view.destroy();
      this.nodeViews.delete(id);
      this.nodeModels.delete(id);
    }
  }

  /**
   * 移除边
   */
  removeEdge(id: string): void {
    const view = this.edgeViews.get(id);
    if (view) {
      view.destroy();
      this.edgeViews.delete(id);
    }
  }

  /**
   * 获取节点视图
   */
  getNodeView(id: string): NodeView | undefined {
    return this.nodeViews.get(id);
  }

  /**
   * 获取边视图
   */
  getEdgeView(id: string): EdgeView | undefined {
    return this.edgeViews.get(id);
  }

  /**
   * 获取所有节点视图
   */
  getAllNodeViews(): NodeView[] {
    return Array.from(this.nodeViews.values());
  }

  /**
   * 获取所有边视图
   */
  getAllEdgeViews(): EdgeView[] {
    return Array.from(this.edgeViews.values());
  }

  /**
   * 清空画布
   */
  clear(): void {
    // 销毁所有视图
    this.nodeViews.forEach(view => view.destroy());
    this.edgeViews.forEach(view => view.destroy());

    this.nodeViews.clear();
    this.edgeViews.clear();
    this.nodeModels.clear();
  }

  /**
   * 获取内容边界框
   */
  getContentBBox(): BBox | null {
    if (this.nodeViews.size === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.nodeViews.forEach(view => {
      const bbox = view.getModel().getBBox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    });

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      x: minX,
      y: minY,
      width,
      height,
      centerX: minX + width / 2,
      centerY: minY + height / 2,
    };
  }

  /**
   * 居中内容
   */
  centerContent(): void {
    const bbox = this.getContentBBox();
    if (bbox) {
      this.viewport.centerContent(bbox);
    }
  }

  /**
   * 适应内容
   */
  fitContent(padding?: number): void {
    const bbox = this.getContentBBox();
    if (bbox) {
      this.viewport.fitContent(bbox, padding);
    }
  }

  /**
   * 获取视口
   */
  getViewport(): Viewport {
    return this.viewport;
  }

  /**
   * 获取SVG元素
   */
  getSVG(): SVGSVGElement {
    return this.svg;
  }

  /**
   * 获取容器
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * 重新渲染所有内容
   */
  refresh(): void {
    // 重新渲染所有边（更新路径）
    this.edgeViews.forEach(view => {
      const model = view.getModel();
      const sourceNode = this.nodeModels.get(model.source);
      const targetNode = this.nodeModels.get(model.target);
      if (sourceNode && targetNode) {
        view.setNodes(sourceNode, targetNode);
      }
    });
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clear();
    this.viewport.destroy();
    this.svg.remove();
  }
}



/**
 * 节点视图类 - 负责节点的SVG渲染
 */

import { NodeModel } from '../model/Node';
import { NodeType } from '../../types/model';

export class NodeView {
  private model: NodeModel;
  private group: SVGGElement;
  private shape: SVGElement | null = null;
  private textElement: SVGTextElement | null = null;
  private selected = false;

  constructor(model: NodeModel) {
    this.model = model;
    this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.group.setAttribute('class', 'fc-node');
    this.group.setAttribute('data-id', model.id);

    this.render();
    this.bindModelEvents();
  }

  /**
   * 绑定模型事件
   */
  private bindModelEvents(): void {
    this.model.on('change:position', () => this.updatePosition());
    this.model.on('change:size', () => this.updateSize());
    this.model.on('change:style', () => this.updateStyle());
    this.model.on('change:data', () => this.render());
  }

  /**
   * 渲染节点
   */
  private render(): void {
    // 清空旧内容
    this.group.innerHTML = '';

    // 创建形状
    this.shape = this.createShape();
    if (this.shape) {
      this.group.appendChild(this.shape);
    }

    // 创建文本
    this.textElement = this.createText();
    if (this.textElement) {
      this.group.appendChild(this.textElement);
    }

    // 应用样式和位置
    this.updatePosition();
    this.updateStyle();
  }

  /**
   * 创建形状
   */
  private createShape(): SVGElement {
    const { width, height } = this.model.getSize();
    const type = this.model.type;

    switch (type) {
      case NodeType.START:
      case NodeType.END:
        return this.createEllipse(width, height);

      case NodeType.CONDITION:
        return this.createDiamond(width, height);

      case NodeType.PARALLEL:
      case NodeType.MERGE:
        return this.createRhombus(width, height);

      default:
        return this.createRectangle(width, height);
    }
  }

  /**
   * 创建矩形
   */
  private createRectangle(width: number, height: number): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', width.toString());
    rect.setAttribute('height', height.toString());
    rect.setAttribute('rx', '4');
    rect.setAttribute('ry', '4');
    return rect;
  }

  /**
   * 创建椭圆
   */
  private createEllipse(width: number, height: number): SVGEllipseElement {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', (width / 2).toString());
    ellipse.setAttribute('cy', (height / 2).toString());
    ellipse.setAttribute('rx', (width / 2).toString());
    ellipse.setAttribute('ry', (height / 2).toString());
    return ellipse;
  }

  /**
   * 创建菱形
   */
  private createDiamond(width: number, height: number): SVGPolygonElement {
    const points = [
      `${width / 2},0`,
      `${width},${height / 2}`,
      `${width / 2},${height}`,
      `0,${height / 2}`,
    ].join(' ');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    return polygon;
  }

  /**
   * 创建菱形（并行/合并节点）
   */
  private createRhombus(width: number, height: number): SVGPolygonElement {
    const points = [
      `${width / 2},0`,
      `${width},${height / 2}`,
      `${width / 2},${height}`,
      `0,${height / 2}`,
    ].join(' ');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    return polygon;
  }

  /**
   * 创建文本
   */
  private createText(): SVGTextElement {
    const { width, height } = this.model.getSize();
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    text.setAttribute('x', (width / 2).toString());
    text.setAttribute('y', (height / 2).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('pointer-events', 'none');
    text.textContent = this.model.label;

    return text;
  }

  /**
   * 更新位置
   */
  private updatePosition(): void {
    const { x, y } = this.model.getPosition();
    this.group.setAttribute('transform', `translate(${x}, ${y})`);
  }

  /**
   * 更新尺寸
   */
  private updateSize(): void {
    this.render(); // 重新渲染以应用新尺寸
  }

  /**
   * 更新样式
   */
  private updateStyle(): void {
    if (!this.shape) return;

    const style = this.model.getStyle();
    const defaultStyle = this.getDefaultStyle();

    // 应用填充色
    this.shape.setAttribute('fill', style.fill || defaultStyle.fill);

    // 应用描边
    this.shape.setAttribute('stroke', style.stroke || defaultStyle.stroke);
    this.shape.setAttribute('stroke-width', String(style.strokeWidth || defaultStyle.strokeWidth));

    // 应用透明度
    if (style.opacity !== undefined) {
      this.shape.setAttribute('opacity', style.opacity.toString());
    }

    // 更新文本样式
    if (this.textElement) {
      this.textElement.setAttribute('fill', style.fontColor || '#333');
      this.textElement.setAttribute('font-size', String(style.fontSize || 14));

      if (style.fontWeight) {
        this.textElement.setAttribute('font-weight', String(style.fontWeight));
      }
    }

    // 应用选中状态
    if (this.selected) {
      this.shape.setAttribute('stroke', '#1890ff');
      this.shape.setAttribute('stroke-width', '2');
    }
  }

  /**
   * 获取默认样式
   */
  private getDefaultStyle() {
    const typeStyles: Record<string, any> = {
      [NodeType.START]: {
        fill: '#67c23a',
        stroke: '#67c23a',
        strokeWidth: 1,
      },
      [NodeType.END]: {
        fill: '#f56c6c',
        stroke: '#f56c6c',
        strokeWidth: 1,
      },
      [NodeType.APPROVAL]: {
        fill: '#409eff',
        stroke: '#409eff',
        strokeWidth: 1,
      },
      [NodeType.CONDITION]: {
        fill: '#e6a23c',
        stroke: '#e6a23c',
        strokeWidth: 1,
      },
      [NodeType.PROCESS]: {
        fill: '#909399',
        stroke: '#909399',
        strokeWidth: 1,
      },
    };

    return typeStyles[this.model.type as string] || {
      fill: '#ffffff',
      stroke: '#d9d9d9',
      strokeWidth: 1,
    };
  }

  /**
   * 设置选中状态
   */
  setSelected(selected: boolean): void {
    this.selected = selected;
    this.updateStyle();
  }

  /**
   * 获取DOM元素
   */
  getElement(): SVGGElement {
    return this.group;
  }

  /**
   * 获取模型
   */
  getModel(): NodeModel {
    return this.model;
  }

  /**
   * 销毁视图
   */
  destroy(): void {
    this.group.remove();
  }
}



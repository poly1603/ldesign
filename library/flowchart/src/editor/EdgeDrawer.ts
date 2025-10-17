import { FlowChart } from '../core/FlowChart';
import { NodeData, EdgeData, EdgeType } from '../types';
import { generateId } from '../utils/helpers';

/**
 * 连线绘制器配置
 */
export interface EdgeDrawerConfig {
  canvas: HTMLElement;
  flowChart: FlowChart;
  enabled: boolean;
  onEdgeAdd?: (edge: EdgeData) => void;
}

/**
 * 连线绘制器
 * 处理节点之间的连线绘制
 */
export class EdgeDrawer {
  private canvas: HTMLElement;
  private flowChart: FlowChart;
  private enabled: boolean;
  private config: EdgeDrawerConfig;
  private sourceNode: NodeData | null = null;
  private drawingLine: SVGLineElement | null = null;
  private isDrawing: boolean = false;

  constructor(config: EdgeDrawerConfig) {
    this.config = config;
    this.canvas = config.canvas;
    this.flowChart = config.flowChart;
    this.enabled = config.enabled;

    this.setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
  }

  /**
   * 处理节点点击
   */
  public handleNodeClick(node: NodeData): void {
    if (!this.enabled) {
      return;
    }

    if (!this.sourceNode) {
      // 开始绘制连线
      this.startDrawing(node);
    } else if (this.sourceNode.id !== node.id) {
      // 完成连线
      this.finishDrawing(node);
    } else {
      // 取消绘制
      this.cancelDrawing();
    }
  }

  /**
   * 开始绘制
   */
  private startDrawing(node: NodeData): void {
    this.sourceNode = node;
    this.isDrawing = true;

    // 创建临时线条
    const svg = this.canvas.querySelector('svg');
    if (svg) {
      this.drawingLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      this.drawingLine.setAttribute('stroke', '#2196f3');
      this.drawingLine.setAttribute('stroke-width', '2');
      this.drawingLine.setAttribute('stroke-dasharray', '5 5');
      this.drawingLine.setAttribute('x1', String(node.position.x));
      this.drawingLine.setAttribute('y1', String(node.position.y));
      this.drawingLine.setAttribute('x2', String(node.position.x));
      this.drawingLine.setAttribute('y2', String(node.position.y));
      svg.appendChild(this.drawingLine);
    }

    // 视觉反馈
    this.canvas.style.cursor = 'crosshair';
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDrawing || !this.drawingLine) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.drawingLine.setAttribute('x2', String(x));
    this.drawingLine.setAttribute('y2', String(y));
  }

  /**
   * 处理鼠标松开
   */
  private handleMouseUp(): void {
    // 注意：实际的完成由 handleNodeClick 处理
    // 这里只是清理临时状态
  }

  /**
   * 完成绘制
   */
  private finishDrawing(targetNode: NodeData): void {
    if (!this.sourceNode) {
      return;
    }

    // 创建连线
    const edge: EdgeData = {
      id: generateId('edge'),
      source: this.sourceNode.id,
      target: targetNode.id,
      style: {
        type: EdgeType.POLYLINE,
        strokeColor: '#666',
        strokeWidth: 2,
        radius: 8
      }
    };

    try {
      this.flowChart.addEdge(edge);
      this.flowChart.render();
      this.config.onEdgeAdd?.(edge);
    } catch (error) {
      console.error('Failed to add edge:', error);
      alert('连线失败：' + (error as Error).message);
    }

    this.cancelDrawing();
  }

  /**
   * 取消绘制
   */
  private cancelDrawing(): void {
    if (this.drawingLine && this.drawingLine.parentNode) {
      this.drawingLine.parentNode.removeChild(this.drawingLine);
    }

    this.sourceNode = null;
    this.drawingLine = null;
    this.isDrawing = false;
    this.canvas.style.cursor = '';
  }

  /**
   * 设置启用状态
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.cancelDrawing();
    }
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.cancelDrawing();
  }
}




/**
 * 开始节点
 * 流程图的起始节点，通常为圆形
 */

import type { StartNodeData, Viewport } from '@/types/index.js';
import { NodeType, PortPosition } from '@/types/index.js';
import { BaseNode } from './BaseNode.js';

/**
 * 开始节点类
 */
export class StartNode extends BaseNode {
  constructor(data: StartNodeData) {
    super(data);

    // 设置默认样式
    this.style = {
      fillColor: 'var(--ldesign-success-color-1)',
      strokeColor: 'var(--ldesign-success-color)',
      strokeWidth: 2,
      fontSize: 14,
      fontColor: 'var(--ldesign-success-color-8)',
      fontFamily: 'Arial, sans-serif',
      opacity: 1,
      ...data.style
    };

    // 设置默认尺寸（圆形）
    if (!data.size.width || !data.size.height) {
      this.size = { width: 60, height: 60 };
    }
  }

  /**
   * 初始化端口
   * 开始节点只有输出端口
   */
  protected initializePorts(): void {
    this.ports = [
      {
        id: 'output',
        position: PortPosition.RIGHT,
        offset: 0.5,
        label: '开始',
        connectable: true,
        maxConnections: -1,
        currentConnections: 0,
        style: {
          fillColor: 'var(--ldesign-success-color)',
          strokeColor: '#ffffff'
        }
      }
    ];
  }

  /**
   * 渲染节点形状
   */
  protected override renderShape(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    const radius = Math.min(this.size.width, this.size.height) / 2;

    // 绘制圆形
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 点击测试（圆形）
   */
  override hitTest(point: { x: number; y: number }): boolean {
    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    const radius = Math.min(this.size.width, this.size.height) / 2;

    const dx = point.x - centerX;
    const dy = point.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= radius;
  }

  /**
   * 获取端口在画布上的绝对位置
   */
  getPortPosition(portId: string): { x: number; y: number } | undefined {
    const port = this.getPort(portId);
    if (!port) {
      return undefined;
    }

    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    const radius = Math.min(this.size.width, this.size.height) / 2;

    // 对于圆形节点，端口位置在圆周上
    switch (port.position) {
      case PortPosition.TOP:
        return {
          x: centerX,
          y: centerY - radius
        };
      case PortPosition.RIGHT:
        return {
          x: centerX + radius,
          y: centerY
        };
      case PortPosition.BOTTOM:
        return {
          x: centerX,
          y: centerY + radius
        };
      case PortPosition.LEFT:
        return {
          x: centerX - radius,
          y: centerY
        };
      default:
        return undefined;
    }
  }

  /**
   * 克隆节点
   */
  override clone(): StartNode {
    const data: StartNodeData = {
      ...this.getData(),
      type: NodeType.START,
      id: `${this.id}_copy_${Date.now()}`
    };

    return new StartNode(data);
  }
}

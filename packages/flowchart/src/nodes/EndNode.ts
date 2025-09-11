/**
 * 结束节点
 * 流程图的结束节点，通常为圆形，带有双边框
 */

import type { EndNodeData, Viewport } from '@/types/index.js';
import { NodeType, PortPosition } from '@/types/index.js';
import { BaseNode } from './BaseNode.js';

/**
 * 结束节点类
 */
export class EndNode extends BaseNode {
  constructor(data: EndNodeData) {
    super(data);

    // 设置默认样式
    this.style = {
      fillColor: 'var(--ldesign-error-color-1)',
      strokeColor: 'var(--ldesign-error-color)',
      strokeWidth: 2,
      fontSize: 14,
      fontColor: 'var(--ldesign-error-color-8)',
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
   * 结束节点只有输入端口
   */
  protected override initializePorts(): void {
    this.ports = [
      {
        id: 'input',
        position: PortPosition.LEFT,
        offset: 0.5,
        label: '结束',
        connectable: true,
        maxConnections: -1,
        currentConnections: 0,
        style: {
          fillColor: 'var(--ldesign-error-color)',
          strokeColor: '#ffffff'
        }
      }
    ];
  }

  /**
   * 渲染节点形状
   */
  protected renderShape(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    const radius = Math.min(this.size.width, this.size.height) / 2;

    // 绘制外圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 绘制内圆（双边框效果）
    ctx.save();
    ctx.strokeStyle = this.style.strokeColor || 'var(--ldesign-error-color)';
    ctx.lineWidth = (this.style.strokeWidth || 2) / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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
  override getPortPosition(portId: string): { x: number; y: number } | undefined {
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
  clone(): EndNode {
    const data: EndNodeData = {
      ...this.getData(),
      type: NodeType.END,
      id: `${this.id}_copy_${Date.now()}`
    };

    return new EndNode(data);
  }
}

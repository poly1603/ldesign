/**
 * 决策节点
 * 流程图的决策节点，通常为菱形
 */

import type { DecisionNodeData, Viewport } from '@/types/index.js';
import { NodeType, PortPosition } from '@/types/index.js';
import { BaseNode } from './BaseNode.js';

/**
 * 决策节点类
 */
export class DecisionNode extends BaseNode {
  constructor(data: DecisionNodeData) {
    super(data);
    
    // 设置默认样式
    this.style = {
      fillColor: 'var(--ldesign-warning-color-1)',
      strokeColor: 'var(--ldesign-warning-color)',
      strokeWidth: 2,
      fontSize: 14,
      fontColor: 'var(--ldesign-warning-color-8)',
      fontFamily: 'Arial, sans-serif',
      opacity: 1,
      ...data.style
    };
    
    // 设置默认尺寸（菱形）
    if (!data.size.width || !data.size.height) {
      this.size = { width: 100, height: 80 };
    }
  }

  /**
   * 初始化端口
   * 决策节点有一个输入端口和多个输出端口
   */
  protected initializePorts(): void {
    this.ports = [
      {
        id: 'input',
        position: PortPosition.TOP,
        offset: 0.5,
        label: '输入',
        connectable: true,
        maxConnections: -1,
        currentConnections: 0,
        style: {
          fillColor: 'var(--ldesign-warning-color)',
          strokeColor: '#ffffff'
        }
      },
      {
        id: 'yes',
        position: PortPosition.RIGHT,
        offset: 0.5,
        label: '是',
        connectable: true,
        maxConnections: -1,
        currentConnections: 0,
        style: {
          fillColor: 'var(--ldesign-success-color)',
          strokeColor: '#ffffff'
        }
      },
      {
        id: 'no',
        position: PortPosition.BOTTOM,
        offset: 0.5,
        label: '否',
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
    const halfWidth = this.size.width / 2;
    const halfHeight = this.size.height / 2;

    // 绘制菱形
    ctx.beginPath();
    ctx.moveTo(centerX, this.position.y); // 顶点
    ctx.lineTo(this.position.x + this.size.width, centerY); // 右点
    ctx.lineTo(centerX, this.position.y + this.size.height); // 底点
    ctx.lineTo(this.position.x, centerY); // 左点
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 点击测试（菱形）
   */
  hitTest(point: { x: number; y: number }): boolean {
    const centerX = this.position.x + this.size.width / 2;
    const centerY = this.position.y + this.size.height / 2;
    
    // 将点转换为相对于菱形中心的坐标
    const relativeX = Math.abs(point.x - centerX);
    const relativeY = Math.abs(point.y - centerY);
    
    // 菱形的边界检测：|x|/a + |y|/b <= 1
    const a = this.size.width / 2;
    const b = this.size.height / 2;
    
    return (relativeX / a + relativeY / b) <= 1;
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

    // 对于菱形节点，端口位置在菱形的顶点
    switch (port.position) {
      case PortPosition.TOP:
        return {
          x: centerX,
          y: this.position.y
        };
      case PortPosition.RIGHT:
        return {
          x: this.position.x + this.size.width,
          y: centerY
        };
      case PortPosition.BOTTOM:
        return {
          x: centerX,
          y: this.position.y + this.size.height
        };
      case PortPosition.LEFT:
        return {
          x: this.position.x,
          y: centerY
        };
      default:
        return undefined;
    }
  }

  /**
   * 渲染端口标签
   */
  protected renderPorts(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    // 先渲染端口圆点
    super.renderPorts(ctx, viewport);

    // 然后渲染端口标签
    for (const port of this.ports) {
      if (!port.connectable || !port.label) {
        continue;
      }

      const portPosition = this.getPortPosition(port.id);
      if (!portPosition) {
        continue;
      }

      ctx.save();
      
      // 标签样式
      ctx.fillStyle = port.style?.fontColor || this.style.fontColor || 'var(--ldesign-warning-color-8)';
      ctx.font = `12px ${this.style.fontFamily || 'Arial, sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 根据端口位置调整标签位置
      let labelX = portPosition.x;
      let labelY = portPosition.y;

      switch (port.position) {
        case PortPosition.TOP:
          labelY -= 15;
          break;
        case PortPosition.RIGHT:
          labelX += 15;
          break;
        case PortPosition.BOTTOM:
          labelY += 15;
          break;
        case PortPosition.LEFT:
          labelX -= 15;
          break;
      }

      ctx.fillText(port.label, labelX, labelY);
      ctx.restore();
    }
  }

  /**
   * 克隆节点
   */
  clone(): DecisionNode {
    const data: DecisionNodeData = {
      ...this.getData(),
      type: NodeType.DECISION,
      id: `${this.id}_copy_${Date.now()}`,
      conditions: []
    };
    
    return new DecisionNode(data);
  }
}

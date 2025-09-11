/**
 * 审批节点
 * OA系统中的审批节点，通常为带有特殊标识的矩形
 */

import type { ApprovalNodeData, Viewport } from '@/types/index.js';
import { NodeType, PortPosition } from '@/types/index.js';
import { BaseNode } from './BaseNode.js';
import { drawRoundedRect } from '@/utils/index.js';

/**
 * 审批节点类
 */
export class ApprovalNode extends BaseNode {
  constructor(data: ApprovalNodeData) {
    super(data);

    // 设置默认样式
    this.style = {
      fillColor: 'var(--ldesign-brand-color-1)',
      strokeColor: 'var(--ldesign-brand-color)',
      strokeWidth: 2,
      fontSize: 14,
      fontColor: 'var(--ldesign-brand-color-8)',
      fontFamily: 'Arial, sans-serif',
      opacity: 1,
      ...data.style
    };

    // 设置默认尺寸
    if (!data.size.width || !data.size.height) {
      this.size = { width: 140, height: 80 };
    }
  }

  /**
   * 初始化端口
   * 审批节点有输入、通过、拒绝端口
   */
  protected override initializePorts(): void {
    this.ports = [
      {
        id: 'input',
        position: PortPosition.LEFT,
        offset: 0.5,
        label: '输入',
        connectable: true,
        maxConnections: -1,
        currentConnections: 0,
        style: {
          fillColor: 'var(--ldesign-brand-color)',
          strokeColor: '#ffffff'
        }
      },
      {
        id: 'approved',
        position: PortPosition.RIGHT,
        offset: 0.3,
        label: '通过',
        connectable: true,
        maxConnections: -1,
        currentConnections: 0,
        style: {
          fillColor: 'var(--ldesign-success-color)',
          strokeColor: '#ffffff'
        }
      },
      {
        id: 'rejected',
        position: PortPosition.RIGHT,
        offset: 0.7,
        label: '拒绝',
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
    const borderRadius = 8;

    // 绘制主体矩形
    drawRoundedRect(
      ctx,
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
      borderRadius
    );

    ctx.fill();
    ctx.stroke();

    // 绘制审批标识（左上角的小三角形）
    this.renderApprovalIndicator(ctx);
  }

  /**
   * 渲染审批标识
   */
  private renderApprovalIndicator(ctx: CanvasRenderingContext2D): void {
    const indicatorSize = 16;
    const x = this.position.x;
    const y = this.position.y;

    ctx.save();

    // 绘制三角形背景
    ctx.fillStyle = 'var(--ldesign-brand-color)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + indicatorSize, y);
    ctx.lineTo(x, y + indicatorSize);
    ctx.closePath();
    ctx.fill();

    // 绘制审批图标（简化的勾号）
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const iconSize = 8;
    const iconX = x + 4;
    const iconY = y + 4;

    ctx.beginPath();
    ctx.moveTo(iconX + 2, iconY + 4);
    ctx.lineTo(iconX + 4, iconY + 6);
    ctx.lineTo(iconX + 8, iconY + 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 渲染标签
   */
  protected override renderLabel(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.label) {
      return;
    }

    // 主标签
    const center = {
      x: this.position.x + this.size.width / 2,
      y: this.position.y + this.size.height / 2 - 8
    };

    ctx.save();
    ctx.fillStyle = this.style.fontColor || 'var(--ldesign-brand-color-8)';
    ctx.font = `${this.style.fontSize || 14}px ${this.style.fontFamily || 'Arial, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, center.x, center.y);

    // 审批人信息
    const approvalConfig = (this.properties as ApprovalNodeData).approvalConfig;
    if (approvalConfig && approvalConfig.approvers.length > 0) {
      const approverText = approvalConfig.approvers.length === 1
        ? approvalConfig.approvers[0]!.name
        : `${approvalConfig.approvers.length}人审批`;

      ctx.font = `12px ${this.style.fontFamily || 'Arial, sans-serif'}`;
      ctx.fillStyle = 'var(--ldesign-font-gray-3)';
      ctx.fillText(approverText, center.x, center.y + 16);
    }

    ctx.restore();
  }

  /**
   * 渲染端口标签
   */
  protected override renderPorts(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    // 先渲染端口圆点
    super.renderPorts(ctx, viewport);

    // 然后渲染端口标签
    for (const port of this.ports) {
      if (!port.connectable || !port.label || port.id === 'input') {
        continue;
      }

      const portPosition = this.getPortPosition(port.id);
      if (!portPosition) {
        continue;
      }

      ctx.save();

      // 标签样式
      ctx.fillStyle = port.style?.fontColor || port.style?.fillColor || 'var(--ldesign-brand-color)';
      ctx.font = `10px ${this.style.fontFamily || 'Arial, sans-serif'}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      // 标签位置
      const labelX = portPosition.x + 8;
      const labelY = portPosition.y;

      ctx.fillText(port.label, labelX, labelY);
      ctx.restore();
    }
  }

  /**
   * 获取审批配置
   */
  getApprovalConfig(): any {
    return (this.properties as ApprovalNodeData).approvalConfig;
  }

  /**
   * 设置审批配置
   */
  setApprovalConfig(config: any): void {
    this.properties = {
      ...this.properties,
      approvalConfig: config
    };
  }

  /**
   * 克隆节点
   */
  clone(): ApprovalNode {
    const data: ApprovalNodeData = {
      ...this.getData(),
      type: NodeType.APPROVAL,
      id: `${this.id}_copy_${Date.now()}`,
      approvalConfig: {
        type: 'single',
        approvers: []
      }
    };

    return new ApprovalNode(data);
  }
}

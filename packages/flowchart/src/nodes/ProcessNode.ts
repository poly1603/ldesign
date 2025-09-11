/**
 * 处理节点
 * 流程图的处理节点，通常为矩形
 */

import type { ProcessNodeData, Viewport } from '@/types/index.js';
import { NodeType, PortPosition } from '@/types/index.js';
import { BaseNode } from './BaseNode.js';
import { drawRoundedRect } from '@/utils/index.js';

/**
 * 处理节点类
 */
export class ProcessNode extends BaseNode {
  constructor(data: ProcessNodeData) {
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
      this.size = { width: 120, height: 60 };
    }
  }

  /**
   * 初始化端口
   * 处理节点有输入和输出端口
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
        id: 'output',
        position: PortPosition.RIGHT,
        offset: 0.5,
        label: '输出',
        connectable: true,
        maxConnections: -1,
        currentConnections: 0,
        style: {
          fillColor: 'var(--ldesign-brand-color)',
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

    // 绘制圆角矩形
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
  }

  /**
   * 渲染标签
   */
  protected override renderLabel(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.label) {
      return;
    }

    const center = {
      x: this.position.x + this.size.width / 2,
      y: this.position.y + this.size.height / 2
    };

    // 设置文本样式
    ctx.save();
    ctx.fillStyle = this.style.fontColor || 'var(--ldesign-brand-color-8)';
    ctx.font = `${this.style.fontSize || 14}px ${this.style.fontFamily || 'Arial, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 处理多行文本
    const maxWidth = this.size.width - 16; // 留出边距
    const lines = this.wrapText(ctx, this.label, maxWidth);
    const lineHeight = (this.style.fontSize || 14) * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = center.y - totalHeight / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, center.x, startY + index * lineHeight);
    });

    ctx.restore();
  }

  /**
   * 文本换行处理
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i]!;
      const width = ctx.measureText(currentLine + ' ' + word).width;

      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
    return lines;
  }

  /**
   * 克隆节点
   */
  clone(): ProcessNode {
    const data: ProcessNodeData = {
      ...this.getData(),
      type: NodeType.PROCESS,
      id: `${this.id}_copy_${Date.now()}`
    };

    return new ProcessNode(data);
  }
}

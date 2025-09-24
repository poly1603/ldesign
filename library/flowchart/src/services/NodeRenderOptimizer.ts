/**
 * 节点渲染优化服务
 * 
 * 解决节点中图标和文字重叠的问题，提供智能布局调整功能
 */

import type { ApprovalNodeType } from '../types'
import type { LayoutDirection } from './LayoutDetectionService'

export interface NodeLayout {
  iconPosition: { x: number, y: number }
  textPosition: { x: number, y: number }
  iconSize: number
  fontSize: number
  spacing: number
  totalHeight: number
  totalWidth: number
}

export interface TextMeasurement {
  width: number
  height: number
  lines: string[]
}

export interface NodeRenderConfig {
  // 基础配置
  nodeRadius: number
  iconSize: number
  fontSize: number
  fontFamily: string
  
  // 布局配置
  iconTextSpacing: number
  minPadding: number
  maxTextWidth: number
  
  // 样式配置
  textAlign: 'center' | 'left' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  
  // 自适应配置
  autoResize: boolean
  preventOverlap: boolean
  smartLayout: boolean
}

export class NodeRenderOptimizer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    // 创建隐藏的canvas用于文本测量
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.canvas.style.display = 'none'
    document.body.appendChild(this.canvas)
  }

  /**
   * 获取默认的节点渲染配置
   */
  getDefaultConfig(nodeType: ApprovalNodeType): NodeRenderConfig {
    const baseConfig: NodeRenderConfig = {
      nodeRadius: 30,
      iconSize: 16,
      fontSize: 12,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      iconTextSpacing: 8,
      minPadding: 6,
      maxTextWidth: 80,
      textAlign: 'center',
      verticalAlign: 'middle',
      autoResize: true,
      preventOverlap: true,
      smartLayout: true
    }

    // 根据节点类型调整配置
    switch (nodeType) {
      case 'start':
      case 'end':
        return {
          ...baseConfig,
          nodeRadius: 30,
          iconSize: 14,
          fontSize: 11,
          maxTextWidth: 60
        }
        
      case 'approval':
      case 'process':
        return {
          ...baseConfig,
          nodeRadius: 40,
          iconSize: 18,
          fontSize: 12,
          maxTextWidth: 100
        }
        
      case 'condition':
        return {
          ...baseConfig,
          nodeRadius: 35,
          iconSize: 16,
          fontSize: 11,
          maxTextWidth: 80
        }
        
      default:
        return baseConfig
    }
  }

  /**
   * 计算优化后的节点布局
   */
  calculateOptimalLayout(
    text: string,
    nodeType: ApprovalNodeType,
    config?: Partial<NodeRenderConfig>,
    direction?: LayoutDirection
  ): NodeLayout {
    const fullConfig = { ...this.getDefaultConfig(nodeType), ...config }
    
    // 测量文本尺寸
    const textMeasurement = this.measureText(text, fullConfig)
    
    // 根据流程图方向调整布局策略
    const layoutStrategy = this.getLayoutStrategy(direction, nodeType)
    
    // 计算最佳布局
    return this.calculateLayout(textMeasurement, fullConfig, layoutStrategy)
  }

  /**
   * 测量文本尺寸
   */
  private measureText(text: string, config: NodeRenderConfig): TextMeasurement {
    this.ctx.font = `${config.fontSize}px ${config.fontFamily}`
    
    // 处理多行文本
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = this.ctx.measureText(testLine)
      
      if (metrics.width > config.maxTextWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    // 计算总尺寸
    const width = Math.max(...lines.map(line => this.ctx.measureText(line).width))
    const height = lines.length * config.fontSize + (lines.length - 1) * 2 // 行间距2px
    
    return { width, height, lines }
  }

  /**
   * 获取布局策略
   */
  private getLayoutStrategy(direction?: LayoutDirection, nodeType?: ApprovalNodeType): 'vertical' | 'horizontal' | 'overlay' {
    // 对于开始和结束节点，优先使用垂直布局
    if (nodeType === 'start' || nodeType === 'end') {
      return 'vertical'
    }
    
    // 根据流程图方向选择策略
    if (direction === 'horizontal') {
      return 'vertical' // 横向流程图中节点内容垂直排列
    } else if (direction === 'vertical') {
      return 'vertical' // 纵向流程图中节点内容也垂直排列
    }
    
    return 'vertical' // 默认垂直布局
  }

  /**
   * 计算具体布局
   */
  private calculateLayout(
    textMeasurement: TextMeasurement,
    config: NodeRenderConfig,
    strategy: 'vertical' | 'horizontal' | 'overlay'
  ): NodeLayout {
    const { width: textWidth, height: textHeight } = textMeasurement
    const { iconSize, iconTextSpacing, nodeRadius } = config
    
    let iconPosition: { x: number, y: number }
    let textPosition: { x: number, y: number }
    let totalHeight: number
    let totalWidth: number
    
    switch (strategy) {
      case 'vertical':
        // 垂直布局：图标在上，文字在下，确保居中对齐且有足够间距
        const verticalSpacing = Math.max(iconTextSpacing, 10) // 最小10px间距
        const totalVerticalHeight = iconSize + verticalSpacing + textHeight
        iconPosition = { x: 0, y: -totalVerticalHeight / 2 + iconSize / 2 }
        textPosition = { x: 0, y: totalVerticalHeight / 2 - textHeight / 2 + config.fontSize / 4 }
        totalHeight = totalVerticalHeight
        totalWidth = Math.max(iconSize, textWidth)
        break

      case 'horizontal':
        // 水平布局：图标在左，文字在右，确保垂直居中
        const horizontalSpacing = iconTextSpacing
        const totalHorizontalWidth = iconSize + horizontalSpacing + textWidth
        iconPosition = { x: -totalHorizontalWidth / 2 + iconSize / 2, y: 0 }
        textPosition = { x: totalHorizontalWidth / 2 - textWidth / 2, y: config.fontSize / 4 }
        totalHeight = Math.max(iconSize, textHeight)
        totalWidth = totalHorizontalWidth
        break

      case 'overlay':
        // 覆盖布局：图标和文字重叠，图标在上方，文字在下方
        iconPosition = { x: 0, y: -config.fontSize / 3 }
        textPosition = { x: 0, y: config.fontSize / 2 }
        totalHeight = Math.max(iconSize, textHeight)
        totalWidth = Math.max(iconSize, textWidth)
        break

      default:
        // 默认垂直布局，优化居中，确保足够间距
        const defaultSpacing = Math.max(iconTextSpacing, 10) // 最小10px间距
        const defaultTotalHeight = iconSize + defaultSpacing + textHeight
        iconPosition = { x: 0, y: -defaultTotalHeight / 2 + iconSize / 2 }
        textPosition = { x: 0, y: defaultTotalHeight / 2 - textHeight / 2 + config.fontSize / 4 }
        totalHeight = defaultTotalHeight
        totalWidth = Math.max(iconSize, textWidth)
    }
    
    // 检查是否需要调整节点大小
    const requiredRadius = Math.max(
      (totalWidth / 2) + config.minPadding,
      (totalHeight / 2) + config.minPadding,
      config.nodeRadius
    )
    
    // 如果内容超出节点范围，进行调整
    if (requiredRadius > config.nodeRadius && config.autoResize) {
      const scale = config.nodeRadius / requiredRadius
      iconPosition.x *= scale
      iconPosition.y *= scale
      textPosition.x *= scale
      textPosition.y *= scale
    }

    return {
      iconPosition,
      textPosition,
      iconSize: config.iconSize,
      fontSize: config.fontSize,
      spacing: iconTextSpacing,
      totalHeight,
      totalWidth
    }
  }

  /**
   * 检测并修复重叠问题
   */
  detectAndFixOverlap(
    iconBounds: { x: number, y: number, width: number, height: number },
    textBounds: { x: number, y: number, width: number, height: number },
    nodeRadius: number
  ): { iconPosition: { x: number, y: number }, textPosition: { x: number, y: number } } {
    // 检查是否重叠
    const isOverlapping = this.isRectangleOverlapping(iconBounds, textBounds)
    
    if (!isOverlapping) {
      return {
        iconPosition: { x: iconBounds.x + iconBounds.width / 2, y: iconBounds.y + iconBounds.height / 2 },
        textPosition: { x: textBounds.x + textBounds.width / 2, y: textBounds.y + textBounds.height / 2 }
      }
    }
    
    // 如果重叠，重新计算位置，确保垂直居中
    const spacing = 8 // 8px间距
    const totalHeight = iconBounds.height + spacing + textBounds.height
    const startY = -totalHeight / 2

    return {
      iconPosition: {
        x: 0,
        y: startY + iconBounds.height / 2
      },
      textPosition: {
        x: 0,
        y: startY + iconBounds.height + spacing + textBounds.height / 2
      }
    }
  }

  /**
   * 检查两个矩形是否重叠
   */
  private isRectangleOverlapping(
    rect1: { x: number, y: number, width: number, height: number },
    rect2: { x: number, y: number, width: number, height: number }
  ): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    )
  }

  /**
   * 获取文本的边界框
   */
  getTextBounds(text: string, x: number, y: number, config: NodeRenderConfig): {
    x: number, y: number, width: number, height: number
  } {
    const measurement = this.measureText(text, config)
    
    return {
      x: x - measurement.width / 2,
      y: y - measurement.height / 2,
      width: measurement.width,
      height: measurement.height
    }
  }

  /**
   * 获取图标的边界框
   */
  getIconBounds(x: number, y: number, size: number): {
    x: number, y: number, width: number, height: number
  } {
    return {
      x: x - size / 2,
      y: y - size / 2,
      width: size,
      height: size
    }
  }

  /**
   * 生成自适应样式
   */
  generateAdaptiveStyles(
    nodeType: ApprovalNodeType,
    layout: NodeLayout,
    direction?: LayoutDirection
  ): {
    nodeStyle: Record<string, any>
    textStyle: Record<string, any>
    iconStyle: Record<string, any>
  } {
    const nodeStyle = {
      r: Math.max(30, layout.totalWidth / 2 + 10, layout.totalHeight / 2 + 10)
    }
    
    const textStyle = {
      fontSize: layout.fontSize,
      textAnchor: 'middle',
      dominantBaseline: 'central',
      fill: this.getTextColor(nodeType),
      fontWeight: this.getFontWeight(nodeType)
    }
    
    const iconStyle = {
      width: layout.iconSize,
      height: layout.iconSize,
      fill: 'none',
      stroke: this.getIconColor(nodeType),
      strokeWidth: 2
    }
    
    return { nodeStyle, textStyle, iconStyle }
  }

  /**
   * 获取文本颜色
   */
  private getTextColor(nodeType: ApprovalNodeType): string {
    const colorMap: Record<ApprovalNodeType, string> = {
      'start': 'var(--ldesign-success-color, #52c41a)',
      'end': 'var(--ldesign-error-color, #e54848)',
      'approval': 'var(--ldesign-primary-color, #1890ff)',
      'condition': 'var(--ldesign-warning-color, #faad14)',
      'process': 'var(--ldesign-purple-color, #722ed1)',
      'user-task': 'var(--ldesign-cyan-color, #13c2c2)',
      'service-task': 'var(--ldesign-magenta-color, #eb2f96)',
      'script-task': 'var(--ldesign-success-color, #52c41a)',
      'manual-task': 'var(--ldesign-orange-color, #fa8c16)',
      'parallel-gateway': 'var(--ldesign-primary-color, #1890ff)',
      'exclusive-gateway': 'var(--ldesign-error-color, #f5222d)',
      'inclusive-gateway': 'var(--ldesign-success-color, #52c41a)',
      'event-gateway': 'var(--ldesign-purple-color, #722ed1)',
      'timer-event': 'var(--ldesign-warning-color, #faad14)',
      'message-event': 'var(--ldesign-cyan-color, #13c2c2)',
      'signal-event': 'var(--ldesign-magenta-color, #eb2f96)'
    }
    
    return colorMap[nodeType] || 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
  }

  /**
   * 获取图标颜色
   */
  private getIconColor(nodeType: ApprovalNodeType): string {
    return this.getTextColor(nodeType) // 与文本颜色保持一致
  }

  /**
   * 获取字体粗细
   */
  private getFontWeight(nodeType: ApprovalNodeType): string {
    if (nodeType === 'start' || nodeType === 'end') {
      return 'bold'
    }
    return 'normal'
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
  }
}

// 导出单例实例
export const nodeRenderOptimizer = new NodeRenderOptimizer()

/**
 * 节点布局辅助工具
 *
 * 解决节点中图标和文本重叠问题，确保元素正确对齐
 */

export interface SimpleNodeLayoutConfig {
  /** 节点类型 */
  nodeType: 'circle' | 'rect' | 'diamond'
  /** 节点尺寸 */
  size: {
    width: number
    height: number
    radius?: number // 圆形节点的半径
    rx?: number // 菱形节点的水平半径
    ry?: number // 菱形节点的垂直半径
  }
  /** 图标配置 */
  icon: {
    size: number
    enabled: boolean
  }
  /** 文本配置 */
  text: {
    fontSize: number
    maxWidth?: number
  }
  /** 布局策略 */
  layout: 'vertical' | 'horizontal' | 'icon-only' | 'text-only'
  /** 间距配置 */
  spacing: {
    iconText: number // 图标和文本之间的间距
    padding: number // 内边距
  }
}

export interface NodeLayoutResult {
  /** 图标位置 */
  iconPosition: { x: number; y: number }
  /** 文本位置 */
  textPosition: { x: number; y: number }
  /** 是否需要调整节点大小 */
  needsResize: boolean
  /** 建议的节点大小 */
  suggestedSize?: {
    width: number
    height: number
    radius?: number
    rx?: number
    ry?: number
  }
}

/**
 * 节点布局辅助类
 */
export class NodeLayoutHelper {
  /**
   * 计算节点内元素的最佳布局
   */
  static calculateLayout(
    nodeX: number,
    nodeY: number,
    config: NodeLayoutConfig
  ): NodeLayoutResult {
    const { nodeType, size, icon, text, layout, spacing } = config

    // 根据节点类型和布局策略计算位置
    switch (layout) {
      case 'vertical':
        return this.calculateVerticalLayout(nodeX, nodeY, config)
      case 'horizontal':
        return this.calculateHorizontalLayout(nodeX, nodeY, config)
      case 'icon-only':
        return this.calculateIconOnlyLayout(nodeX, nodeY, config)
      case 'text-only':
        return this.calculateTextOnlyLayout(nodeX, nodeY, config)
      default:
        return this.calculateVerticalLayout(nodeX, nodeY, config)
    }
  }

  /**
   * 垂直布局：图标在上，文本在下
   */
  private static calculateVerticalLayout(
    nodeX: number,
    nodeY: number,
    config: NodeLayoutConfig
  ): NodeLayoutResult {
    const { size, icon, text, spacing } = config
    const totalContentHeight = icon.size + spacing.iconText + text.fontSize

    // 计算起始Y位置（内容垂直居中）
    const startY = nodeY - totalContentHeight / 2

    // 图标位置（水平居中，垂直在上方）
    const iconPosition = {
      x: nodeX,
      y: startY + icon.size / 2
    }

    // 文本位置（水平居中，垂直在下方）
    const textPosition = {
      x: nodeX,
      y: startY + icon.size + spacing.iconText + text.fontSize / 2
    }

    // 检查是否需要调整节点大小
    const needsResize = this.checkIfResizeNeeded(config, totalContentHeight)

    return {
      iconPosition,
      textPosition,
      needsResize,
      suggestedSize: needsResize ? this.calculateSuggestedSize(config, totalContentHeight) : undefined
    }
  }

  /**
   * 水平布局：图标在左，文本在右
   */
  private static calculateHorizontalLayout(
    nodeX: number,
    nodeY: number,
    config: NodeLayoutConfig
  ): NodeLayoutResult {
    const { size, icon, text, spacing } = config
    const totalContentWidth = icon.size + spacing.iconText + this.estimateTextWidth(text)

    // 计算起始X位置（内容水平居中）
    const startX = nodeX - totalContentWidth / 2

    // 图标位置（垂直居中，水平在左侧）
    const iconPosition = {
      x: startX + icon.size / 2,
      y: nodeY
    }

    // 文本位置（垂直居中，水平在右侧）
    const textPosition = {
      x: startX + icon.size + spacing.iconText + this.estimateTextWidth(text) / 2,
      y: nodeY
    }

    // 检查是否需要调整节点大小
    const needsResize = this.checkIfResizeNeeded(config, 0, totalContentWidth)

    return {
      iconPosition,
      textPosition,
      needsResize,
      suggestedSize: needsResize ? this.calculateSuggestedSize(config, 0, totalContentWidth) : undefined
    }
  }

  /**
   * 仅图标布局
   */
  private static calculateIconOnlyLayout(
    nodeX: number,
    nodeY: number,
    config: NodeLayoutConfig
  ): NodeLayoutResult {
    return {
      iconPosition: { x: nodeX, y: nodeY },
      textPosition: { x: nodeX, y: nodeY + config.size.height / 2 + 20 }, // 文本在节点外部下方
      needsResize: false
    }
  }

  /**
   * 仅文本布局
   */
  private static calculateTextOnlyLayout(
    nodeX: number,
    nodeY: number,
    config: NodeLayoutConfig
  ): NodeLayoutResult {
    return {
      iconPosition: { x: nodeX, y: nodeY - config.size.height / 2 - 20 }, // 图标在节点外部上方
      textPosition: { x: nodeX, y: nodeY },
      needsResize: false
    }
  }

  /**
   * 检查是否需要调整节点大小
   */
  private static checkIfResizeNeeded(
    config: NodeLayoutConfig,
    contentHeight: number,
    contentWidth?: number
  ): boolean {
    const { size, spacing } = config
    const minHeight = contentHeight + spacing.padding * 2
    const minWidth = contentWidth ? contentWidth + spacing.padding * 2 : size.width

    if (config.nodeType === 'circle') {
      const minRadius = Math.max(minHeight, minWidth) / 2
      return (size.radius || 0) < minRadius
    } else {
      return size.height < minHeight || size.width < minWidth
    }
  }

  /**
   * 计算建议的节点大小
   */
  private static calculateSuggestedSize(
    config: NodeLayoutConfig,
    contentHeight: number,
    contentWidth?: number
  ): NodeLayoutResult['suggestedSize'] {
    const { size, spacing } = config
    const minHeight = contentHeight + spacing.padding * 2
    const minWidth = contentWidth ? contentWidth + spacing.padding * 2 : size.width

    if (config.nodeType === 'circle') {
      const minRadius = Math.max(minHeight, minWidth) / 2
      return {
        width: minRadius * 2,
        height: minRadius * 2,
        radius: Math.max(minRadius, size.radius || 0)
      }
    } else if (config.nodeType === 'diamond') {
      return {
        width: Math.max(minWidth, size.width),
        height: Math.max(minHeight, size.height),
        rx: Math.max(minWidth / 2, size.rx || 0),
        ry: Math.max(minHeight / 2, size.ry || 0)
      }
    } else {
      return {
        width: Math.max(minWidth, size.width),
        height: Math.max(minHeight, size.height)
      }
    }
  }

  /**
   * 估算文本宽度
   */
  private static estimateTextWidth(textConfig: NodeLayoutConfig['text']): number {
    // 简单估算：每个字符约占字体大小的0.6倍宽度
    const avgCharWidth = textConfig.fontSize * 0.6
    const maxChars = textConfig.maxWidth ? Math.floor(textConfig.maxWidth / avgCharWidth) : 10
    return Math.min(maxChars * avgCharWidth, textConfig.maxWidth || 100)
  }

  /**
   * 获取默认配置
   */
  static getDefaultConfig(nodeType: 'circle' | 'rect' | 'diamond'): Partial<NodeLayoutConfig> {
    const baseConfig = {
      icon: {
        size: 16,
        enabled: true
      },
      text: {
        fontSize: 12,
        maxWidth: 80
      },
      layout: 'vertical' as const,
      spacing: {
        iconText: 8,
        padding: 12
      }
    }

    switch (nodeType) {
      case 'circle':
        return {
          ...baseConfig,
          nodeType: 'circle',
          size: {
            width: 60,
            height: 60,
            radius: 30
          }
        }
      case 'rect':
        return {
          ...baseConfig,
          nodeType: 'rect',
          size: {
            width: 120,
            height: 60
          }
        }
      case 'diamond':
        return {
          ...baseConfig,
          nodeType: 'diamond',
          size: {
            width: 120,
            height: 60,
            rx: 60,
            ry: 30
          }
        }
      default:
        return baseConfig
    }
  }

  /**
   * 创建节点样式
   */
  static createNodeStyles(layout: NodeLayoutResult): Record<string, string> {
    return {
      '--icon-x': `${layout.iconPosition.x}px`,
      '--icon-y': `${layout.iconPosition.y}px`,
      '--text-x': `${layout.textPosition.x}px`,
      '--text-y': `${layout.textPosition.y}px`
    }
  }

  /**
   * 应用布局到LogicFlow文本对象
   */
  static applyLayoutToText(
    textObj: any,
    layout: NodeLayoutResult,
    nodeX: number,
    nodeY: number
  ): void {
    if (textObj) {
      textObj.x = layout.textPosition.x
      textObj.y = layout.textPosition.y
    }
  }
}

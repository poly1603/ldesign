/**
 * 简单节点布局工具
 * 
 * 解决节点中图标和文本重叠问题的简化版本
 */

export interface SimpleLayoutResult {
  /** 图标Y偏移 */
  iconOffsetY: number
  /** 文本Y偏移 */
  textOffsetY: number
}

/**
 * 简单节点布局计算器
 */
export class SimpleNodeLayout {
  /**
   * 计算圆形节点的布局
   */
  static calculateCircleLayout(radius: number): SimpleLayoutResult {
    // 图标在上方，文本在下方，确保不重叠 - 增加偏移量
    const iconOffsetY = -Math.max(15, radius * 0.5)  // 增加图标向上偏移
    const textOffsetY = Math.max(20, radius * 0.6)   // 增加文本向下偏移

    return {
      iconOffsetY,
      textOffsetY
    }
  }

  /**
   * 计算矩形节点的布局
   */
  static calculateRectLayout(width: number, height: number): SimpleLayoutResult {
    // 图标在上方，文本在下方，确保不重叠 - 增加偏移量
    const iconOffsetY = -Math.max(18, height * 0.4)  // 增加图标向上偏移
    const textOffsetY = Math.max(22, height * 0.45)  // 增加文本向下偏移

    return {
      iconOffsetY,
      textOffsetY
    }
  }

  /**
   * 计算菱形节点的布局
   */
  static calculateDiamondLayout(rx: number, ry: number): SimpleLayoutResult {
    // 图标在上方，文本在下方，确保不重叠 - 增加偏移量
    const iconOffsetY = -Math.max(12, ry * 0.6)  // 增加图标向上偏移
    const textOffsetY = Math.max(18, ry * 0.7)   // 增加文本向下偏移

    return {
      iconOffsetY,
      textOffsetY
    }
  }

  /**
   * 应用布局到LogicFlow文本对象
   */
  static applyTextLayout(
    textObj: any,
    nodeX: number,
    nodeY: number,
    textOffsetY: number
  ): void {
    if (textObj) {
      textObj.x = nodeX
      textObj.y = nodeY + textOffsetY
    }
  }

  /**
   * 获取图标位置
   */
  static getIconPosition(
    nodeX: number,
    nodeY: number,
    iconOffsetY: number
  ): { x: number; y: number } {
    return {
      x: nodeX,
      y: nodeY + iconOffsetY
    }
  }
}

/**
 * 快速布局计算函数
 */
export function calculateNodeLayout(
  nodeType: 'circle' | 'rect' | 'diamond',
  dimensions: { width?: number; height?: number; radius?: number; rx?: number; ry?: number }
): SimpleLayoutResult {
  switch (nodeType) {
    case 'circle':
      return SimpleNodeLayout.calculateCircleLayout(dimensions.radius || 30)
    case 'rect':
      return SimpleNodeLayout.calculateRectLayout(
        dimensions.width || 120,
        dimensions.height || 60
      )
    case 'diamond':
      return SimpleNodeLayout.calculateDiamondLayout(
        dimensions.rx || 60,
        dimensions.ry || 30
      )
    default:
      return { iconOffsetY: -8, textOffsetY: 12 }
  }
}

/**
 * 应用简单布局到节点
 */
export function applySimpleLayout(
  textObj: any,
  nodeX: number,
  nodeY: number,
  nodeType: 'circle' | 'rect' | 'diamond',
  dimensions: { width?: number; height?: number; radius?: number; rx?: number; ry?: number }
): { iconX: number; iconY: number } {
  const layout = calculateNodeLayout(nodeType, dimensions)
  
  // 应用文本布局
  SimpleNodeLayout.applyTextLayout(textObj, nodeX, nodeY, layout.textOffsetY)
  
  // 返回图标位置
  const iconPos = SimpleNodeLayout.getIconPosition(nodeX, nodeY, layout.iconOffsetY)
  return { iconX: iconPos.x, iconY: iconPos.y }
}

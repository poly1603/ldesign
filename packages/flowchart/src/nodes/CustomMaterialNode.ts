/**
 * 自定义物料节点
 * 
 * 支持动态样式和形状的自定义物料节点
 */

import { RectNode, RectNodeModel, h } from '@logicflow/core'
import type { CustomMaterial } from '../types'

/**
 * 自定义物料节点模型基类
 */
class CustomMaterialNodeModel extends RectNodeModel {
  static extendKey = 'CustomMaterialNodeModel'

  constructor(data: any, graphModel: any) {
    super(data, graphModel)

    // 从properties中获取自定义样式
    const material = this.properties?.material as CustomMaterial
    if (material) {
      this.width = material.width || 120
      this.height = material.height || 60
    }
  }

  /**
   * 初始化节点数据，设置文本位置
   */
  initNodeData(data: any) {
    super.initNodeData(data)

    // 如果有图标，调整文本位置到图标下方
    const material = this.properties?.material as CustomMaterial
    if (material?.icon && this.text) {
      this.text.y = this.y + 15 // 文本在图标下方，增加间隔
    }
  }

  /**
   * 获取节点样式
   */
  getNodeStyle() {
    const material = this.properties?.material as CustomMaterial
    if (!material?.style) {
      return super.getNodeStyle()
    }

    const style = material.style
    return {
      ...super.getNodeStyle(),
      fill: style.fill || '#ffffff',
      stroke: style.stroke || '#722ED1',
      strokeWidth: style.strokeWidth || 2,
      strokeDasharray: style.strokeDasharray || '',
      opacity: style.opacity || 1,
      rx: style.borderRadius || 0,
      ry: style.borderRadius || 0
    }
  }

  /**
   * 获取文本样式
   */
  getTextStyle() {
    const material = this.properties?.material as CustomMaterial
    if (!material?.style) {
      return super.getTextStyle()
    }

    const style = material.style
    return {
      ...super.getTextStyle(),
      fontSize: style.fontSize || 14,
      fill: style.fontColor || '#333333',
      fontWeight: style.fontWeight || 'normal',
      fontFamily: style.fontFamily || 'Arial'
    }
  }

  /**
   * 获取锚点样式
   */
  getAnchorStyle(anchorInfo: any) {
    return {
      stroke: '#722ED1',
      fill: '#ffffff',
      strokeWidth: 2,
      r: 4
    }
  }

  /**
   * 获取锚点位置
   */
  getDefaultAnchor() {
    const material = this.properties?.material as CustomMaterial
    if (material?.anchors) {
      return material.anchors.map(anchor => ({
        x: anchor.x,
        y: anchor.y,
        type: anchor.type,
        id: `${anchor.x}_${anchor.y}`
      }))
    }

    // 默认锚点 - 使用相对于节点中心的坐标
    const { x, y, width, height } = this
    return [
      { x: x, y: y - height / 2, type: 'input', id: 'top' },
      { x: x + width / 2, y: y, type: 'output', id: 'right' },
      { x: x, y: y + height / 2, type: 'output', id: 'bottom' },
      { x: x - width / 2, y: y, type: 'input', id: 'left' }
    ]
  }
}

/**
 * 自定义物料节点视图基类
 */
class CustomMaterialNodeView extends RectNode {
  static extendKey = 'CustomMaterialNodeView'

  /**
   * 获取形状元素
   */
  getShape() {
    const { model } = this.props
    const material = model.properties?.material as CustomMaterial

    if (!material) {
      return super.getShape()
    }

    const { x, y, width, height } = model
    const style = material.style || {}

    // 根据物料形状类型创建不同的形状
    switch (material.shape) {
      case 'circle':
        return this.createCircleShape(x, y, Math.min(width, height) / 2, style)
      case 'diamond':
        return this.createDiamondShape(x, y, width, height, style)
      case 'ellipse':
        return this.createEllipseShape(x, y, width, height, style)
      case 'polygon':
        return this.createPolygonShape(x, y, width, height, style)
      case 'rect':
      default:
        return this.createRectShape(x, y, width, height, style)
    }
  }

  /**
   * 创建矩形形状
   */
  private createRectShape(x: number, y: number, width: number, height: number, style: any) {
    const { stroke, strokeWidth, strokeDasharray, fill, opacity, rx, ry } = style
    return h('rect', {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      rx: rx || 0,
      ry: ry || 0,
      stroke,
      strokeWidth,
      strokeDasharray,
      fill,
      opacity
    })
  }

  /**
   * 创建圆形形状
   */
  private createCircleShape(x: number, y: number, radius: number, style: any) {
    const { stroke, strokeWidth, strokeDasharray, fill, opacity } = style
    return h('circle', {
      cx: x,
      cy: y,
      r: radius,
      stroke,
      strokeWidth,
      strokeDasharray,
      fill,
      opacity
    })
  }

  /**
   * 创建菱形形状
   */
  private createDiamondShape(x: number, y: number, width: number, height: number, style: any) {
    const { stroke, strokeWidth, strokeDasharray, fill, opacity } = style
    const points = [
      [x, y - height / 2],
      [x + width / 2, y],
      [x, y + height / 2],
      [x - width / 2, y]
    ].map(point => point.join(',')).join(' ')

    return h('polygon', {
      points,
      stroke,
      strokeWidth,
      strokeDasharray,
      fill,
      opacity
    })
  }

  /**
   * 创建椭圆形状
   */
  private createEllipseShape(x: number, y: number, width: number, height: number, style: any) {
    const { stroke, strokeWidth, strokeDasharray, fill, opacity } = style
    return h('ellipse', {
      cx: x,
      cy: y,
      rx: width / 2,
      ry: height / 2,
      stroke,
      strokeWidth,
      strokeDasharray,
      fill,
      opacity
    })
  }

  /**
   * 创建多边形形状
   */
  private createPolygonShape(x: number, y: number, width: number, height: number, style: any) {
    const { stroke, strokeWidth, strokeDasharray, fill, opacity } = style
    // 创建六边形
    const radius = Math.min(width, height) / 2
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const px = x + radius * Math.cos(angle)
      const py = y + radius * Math.sin(angle)
      points.push(`${px},${py}`)
    }

    return h('polygon', {
      points: points.join(' '),
      stroke,
      strokeWidth,
      strokeDasharray,
      fill,
      opacity
    })
  }

  /**
   * 获取图标元素
   */
  getIcon() {
    const { model } = this.props
    const material = model.properties?.material as CustomMaterial

    if (!material?.icon || !material.icon.content) {
      return null
    }

    const { x, y } = model
    const icon = material.icon
    const iconY = y - 15 // 图标在文本上方，增加间隔

    switch (icon.type) {
      case 'text':
      case 'emoji':
        return h('text', {
          x,
          y: iconY,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontSize: icon.size || 16,
          fill: icon.color || '#333333'
        }, icon.content)

      case 'svg':
        // 简单的SVG图标支持
        return h('g', {
          transform: `translate(${x - (icon.size || 16) / 2}, ${iconY - (icon.size || 16) / 2})`
        }, [
          h('foreignObject', {
            width: icon.size || 16,
            height: icon.size || 16
          }, [
            h('div', {
              innerHTML: icon.content,
              style: {
                width: '100%',
                height: '100%',
                color: icon.color || '#333333'
              }
            })
          ])
        ])

      default:
        return null
    }
  }

  /**
   * 获取完整的节点元素
   */
  getShapeElement() {
    const shape = this.getShape()
    const icon = this.getIcon()

    if (icon) {
      return h('g', {}, [shape, icon])
    }

    return shape
  }
}

/**
 * 注册自定义物料节点
 */
export function registerCustomMaterialNode(lf: any) {
  lf.register({
    type: 'custom-material',
    view: CustomMaterialNodeView,
    model: CustomMaterialNodeModel
  })
}

export { CustomMaterialNodeModel, CustomMaterialNodeView }

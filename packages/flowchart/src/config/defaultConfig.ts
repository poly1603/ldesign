/**
 * 默认配置
 * 
 * 定义审批流程图编辑器的默认配置选项
 */

import type { FlowchartEditorConfig } from '../types'

/**
 * 默认编辑器配置
 */
export const defaultConfig: Partial<FlowchartEditorConfig> = {
  // 画布尺寸
  width: 800,
  height: 600,

  // 只读模式
  readonly: false,

  // 网格配置
  grid: {
    size: 20,
    visible: true,
    type: 'dot'
  },

  // 工具栏配置
  toolbar: {
    visible: true,
    tools: [
      'select',
      'multi-select',
      'material-repository',
      'zoom-fit',
      'undo',
      'redo',
      'delete'
    ]
  },

  // 属性面板配置
  propertyPanel: {
    visible: true,
    position: 'right'
  },

  // 节点面板配置
  nodePanel: {
    visible: true,
    position: 'left'
  },

  // LogicFlow 配置
  logicflowConfig: {
    // 启用键盘快捷键
    keyboard: {
      enabled: true
    },

    // 启用历史记录（撤销重做）
    history: true,

    // 启用对齐线
    snapline: true,

    // 启用边的调整点
    adjustEdge: true,

    // 启用边的中点
    adjustEdgeMiddle: true,

    // 启用节点的锚点
    hoverOutline: true,

    // 启用节点选中时的外框
    nodeSelectedOutline: true,

    // 启用边选中时的外框
    edgeSelectedOutline: true,

    // 动画配置
    animation: {
      node: true,
      edge: true
    },

    // 默认边类型
    edgeType: 'polyline',

    // 边生成器
    edgeGenerator: (sourceNode: any, targetNode: any) => {
      // 根据源节点类型决定边类型
      if (sourceNode.type === 'condition') {
        return 'approval-edge'
      }
      return 'polyline'
    }
  }
}

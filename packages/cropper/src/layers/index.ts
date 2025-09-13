/**
 * @file 图层系统统一导出
 * @description 导出所有图层相关的类、接口和类型
 */

// 核心图层系统
export { 
  LayerSystem, 
  LayerType, 
  BlendMode 
} from './layer-system'

export type { 
  Layer,
  BaseLayer,
  TextLayer,
  ShapeLayer,
  StickerLayer,
  BorderLayer,
  ImageLayer,
  LayerTransform,
  TextStyle,
  ShapeProperties,
  BorderStyle,
  StickerProperties,
  LayerSystemConfig,
  LayerEventData
} from './layer-system'

// 图层面板UI
export { LayerPanel } from './layer-panel'
export type { LayerPanelConfig } from './layer-panel'

// 历史管理器
export { HistoryManager, ActionType } from './history-manager'
export type { HistoryItem, HistoryManagerConfig } from './history-manager'

// 图层管理器（主要接口）
export { LayerManager } from './layer-manager'
export type { LayerManagerConfig } from './layer-manager'

/**
 * 创建图层管理器的工厂函数
 */
export function createLayerManager(
  canvas: HTMLCanvasElement,
  panelContainer?: HTMLElement,
  config?: any
) {
  return new LayerManager(canvas, panelContainer, config)
}

/**
 * 使用示例：
 * 
 * ```typescript
 * import { createLayerManager, LayerType } from '@/layers'
 * 
 * const canvas = document.getElementById('canvas') as HTMLCanvasElement
 * const panel = document.getElementById('layer-panel') as HTMLElement
 * 
 * const layerManager = createLayerManager(canvas, panel, {
 *   layerSystem: {
 *     maxLayers: 100
 *   },
 *   layerPanel: {
 *     theme: 'dark',
 *     position: 'right'
 *   },
 *   enableHistory: true,
 *   keyboardShortcuts: true
 * })
 * 
 * // 创建图层
 * const textLayer = layerManager.createTextLayer('Hello World')
 * const shapeLayer = layerManager.createShapeLayer('circle')
 * 
 * // 操作图层
 * layerManager.selectLayer(textLayer.id)
 * layerManager.setLayerOpacity(textLayer.id, 0.5)
 * 
 * // 撤销/重做
 * layerManager.undo()
 * layerManager.redo()
 * 
 * // 导出/导入
 * const data = layerManager.exportLayers()
 * layerManager.importLayers(data)
 * ```
 */

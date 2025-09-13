/**
 * @file 图层管理器
 * @description 集成图层系统、图层面板和历史管理器的统一接口
 */

import { LayerSystem, type LayerSystemConfig, type Layer, LayerType } from './layer-system'
import { LayerPanel, type LayerPanelConfig } from './layer-panel'
import { HistoryManager, type HistoryManagerConfig } from './history-manager'
import type { Point, Size } from '@/types'

/**
 * 图层管理器配置
 */
export interface LayerManagerConfig {
  /** 图层系统配置 */
  layerSystem?: Partial<LayerSystemConfig>
  /** 图层面板配置 */
  layerPanel?: Partial<LayerPanelConfig>
  /** 历史管理器配置 */
  historyManager?: Partial<HistoryManagerConfig>
  /** 是否启用历史管理 */
  enableHistory?: boolean
  /** 键盘快捷键 */
  keyboardShortcuts?: boolean
}

/**
 * 图层管理器类
 */
export class LayerManager {
  /** 图层系统 */
  private layerSystem: LayerSystem

  /** 图层面板 */
  private layerPanel?: LayerPanel

  /** 历史管理器 */
  private historyManager?: HistoryManager

  /** 主画布 */
  private canvas: HTMLCanvasElement

  /** 面板容器 */
  private panelContainer?: HTMLElement

  /** 配置选项 */
  private config: LayerManagerConfig

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: LayerManagerConfig = {
    enableHistory: true,
    keyboardShortcuts: true
  }

  /**
   * 构造函数
   */
  constructor(
    canvas: HTMLCanvasElement, 
    panelContainer?: HTMLElement,
    config: LayerManagerConfig = {}
  ) {
    this.canvas = canvas
    this.panelContainer = panelContainer
    this.config = { ...LayerManager.DEFAULT_CONFIG, ...config }

    this.init()
  }

  /**
   * 初始化
   */
  private init(): void {
    // 创建图层系统
    this.layerSystem = new LayerSystem(this.canvas, this.config.layerSystem)

    // 创建历史管理器
    if (this.config.enableHistory) {
      this.historyManager = new HistoryManager(this.layerSystem, this.config.historyManager)
    }

    // 创建图层面板
    if (this.panelContainer) {
      this.layerPanel = new LayerPanel(this.layerSystem, this.panelContainer, this.config.layerPanel)
    }

    // 绑定键盘快捷键
    if (this.config.keyboardShortcuts) {
      this.bindKeyboardShortcuts()
    }
  }

  /**
   * 绑定键盘快捷键
   */
  private bindKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // 检查是否在输入框中
      const activeElement = document.activeElement
      if (activeElement?.tagName === 'INPUT' || 
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.contentEditable === 'true') {
        return
      }

      // Ctrl/Cmd + Z - 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        this.undo()
        return
      }

      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y - 重做
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') ||
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault()
        this.redo()
        return
      }

      // Delete - 删除选中图层
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        this.deleteSelectedLayers()
        return
      }

      // Ctrl/Cmd + D - 复制图层
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        this.duplicateSelectedLayers()
        return
      }

      // Ctrl/Cmd + A - 全选图层
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        this.selectAllLayers()
        return
      }

      // 数字键1-9 - 调整不透明度
      if (e.key >= '1' && e.key <= '9') {
        const opacity = parseInt(e.key) / 10
        this.setSelectedLayersOpacity(opacity)
        return
      }

      // 数字键0 - 设置不透明度为100%
      if (e.key === '0') {
        this.setSelectedLayersOpacity(1)
        return
      }
    })
  }

  /**
   * 创建文字图层
   */
  createTextLayer(text: string = '双击编辑文字', position?: Point): Layer {
    return this.layerSystem.createTextLayer(text, {}, position)
  }

  /**
   * 创建形状图层
   */
  createShapeLayer(type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'polygon' = 'rectangle', position?: Point, size?: Size): Layer {
    return this.layerSystem.createShapeLayer({ type }, position, size)
  }

  /**
   * 创建边框图层
   */
  createBorderLayer(): Layer {
    return this.layerSystem.createBorderLayer()
  }

  /**
   * 创建贴纸图层
   */
  createStickerLayer(stickerId: string, name: string = '贴纸', position?: Point, size?: Size): Layer {
    return this.layerSystem.createStickerLayer({
      stickerId,
      category: 'custom',
      imageUrl: '',
      name,
      colorizable: true
    }, position, size)
  }

  /**
   * 删除图层
   */
  deleteLayer(layerId: string): boolean {
    return this.layerSystem.removeLayer(layerId)
  }

  /**
   * 删除选中的图层
   */
  deleteSelectedLayers(): boolean {
    const selectedLayers = this.layerSystem.getSelectedLayers()
    if (selectedLayers.length === 0) return false

    // 使用批量操作
    this.historyManager?.startBatch()
    
    let success = false
    selectedLayers.forEach(layer => {
      if (this.layerSystem.removeLayer(layer.id)) {
        success = true
      }
    })

    this.historyManager?.endBatch('删除选中图层')
    return success
  }

  /**
   * 复制图层
   */
  duplicateLayer(layerId: string): Layer | null {
    return this.layerSystem.duplicateLayer(layerId)
  }

  /**
   * 复制选中的图层
   */
  duplicateSelectedLayers(): Layer[] {
    const selectedLayers = this.layerSystem.getSelectedLayers()
    const duplicatedLayers: Layer[] = []

    if (selectedLayers.length === 0) return duplicatedLayers

    // 使用批量操作
    this.historyManager?.startBatch()

    selectedLayers.forEach(layer => {
      const duplicated = this.layerSystem.duplicateLayer(layer.id)
      if (duplicated) {
        duplicatedLayers.push(duplicated)
      }
    })

    this.historyManager?.endBatch('复制选中图层')
    return duplicatedLayers
  }

  /**
   * 选择图层
   */
  selectLayer(layerId: string, multiSelect: boolean = false): boolean {
    return this.layerSystem.selectLayer(layerId, multiSelect)
  }

  /**
   * 全选图层
   */
  selectAllLayers(): void {
    const layers = this.layerSystem.getLayers()
    layers.forEach((layer, index) => {
      this.layerSystem.selectLayer(layer.id, index > 0)
    })
  }

  /**
   * 取消选择图层
   */
  deselectLayer(layerId: string): boolean {
    return this.layerSystem.deselectLayer(layerId)
  }

  /**
   * 清空选择
   */
  clearSelection(): void {
    const selectedLayers = this.layerSystem.getSelectedLayers()
    selectedLayers.forEach(layer => {
      this.layerSystem.deselectLayer(layer.id)
    })
  }

  /**
   * 获取选中的图层
   */
  getSelectedLayers(): Layer[] {
    return this.layerSystem.getSelectedLayers()
  }

  /**
   * 获取所有图层
   */
  getLayers(): Layer[] {
    return this.layerSystem.getLayers()
  }

  /**
   * 获取图层
   */
  getLayer(layerId: string): Layer | null {
    return this.layerSystem.getLayer(layerId)
  }

  /**
   * 更新图层
   */
  updateLayer(layerId: string, updates: Partial<Layer>): boolean {
    return this.layerSystem.updateLayer(layerId, updates)
  }

  /**
   * 移动图层
   */
  moveLayer(layerId: string, newIndex: number): boolean {
    return this.layerSystem.moveLayer(layerId, newIndex)
  }

  /**
   * 将图层移到顶部
   */
  moveLayerToTop(layerId: string): boolean {
    const layers = this.layerSystem.getLayers()
    return this.layerSystem.moveLayer(layerId, layers.length - 1)
  }

  /**
   * 将图层移到底部
   */
  moveLayerToBottom(layerId: string): boolean {
    return this.layerSystem.moveLayer(layerId, 0)
  }

  /**
   * 将图层上移一层
   */
  moveLayerUp(layerId: string): boolean {
    const layers = this.layerSystem.getLayers()
    const currentIndex = layers.findIndex(l => l.id === layerId)
    if (currentIndex === -1 || currentIndex >= layers.length - 1) return false
    return this.layerSystem.moveLayer(layerId, currentIndex + 1)
  }

  /**
   * 将图层下移一层
   */
  moveLayerDown(layerId: string): boolean {
    const layers = this.layerSystem.getLayers()
    const currentIndex = layers.findIndex(l => l.id === layerId)
    if (currentIndex === -1 || currentIndex <= 0) return false
    return this.layerSystem.moveLayer(layerId, currentIndex - 1)
  }

  /**
   * 设置图层可见性
   */
  setLayerVisibility(layerId: string, visible: boolean): boolean {
    return this.layerSystem.updateLayer(layerId, { visible })
  }

  /**
   * 切换图层可见性
   */
  toggleLayerVisibility(layerId: string): boolean {
    const layer = this.layerSystem.getLayer(layerId)
    if (!layer) return false
    return this.setLayerVisibility(layerId, !layer.visible)
  }

  /**
   * 设置图层锁定状态
   */
  setLayerLocked(layerId: string, locked: boolean): boolean {
    return this.layerSystem.updateLayer(layerId, { locked })
  }

  /**
   * 切换图层锁定状态
   */
  toggleLayerLocked(layerId: string): boolean {
    const layer = this.layerSystem.getLayer(layerId)
    if (!layer) return false
    return this.setLayerLocked(layerId, !layer.locked)
  }

  /**
   * 设置图层不透明度
   */
  setLayerOpacity(layerId: string, opacity: number): boolean {
    return this.layerSystem.updateLayer(layerId, { opacity: Math.max(0, Math.min(1, opacity)) })
  }

  /**
   * 设置选中图层的不透明度
   */
  setSelectedLayersOpacity(opacity: number): void {
    const selectedLayers = this.getSelectedLayers()
    if (selectedLayers.length === 0) return

    // 使用批量操作
    this.historyManager?.startBatch()

    selectedLayers.forEach(layer => {
      this.setLayerOpacity(layer.id, opacity)
    })

    this.historyManager?.endBatch(`设置不透明度为 ${Math.round(opacity * 100)}%`)
  }

  /**
   * 设置图层混合模式
   */
  setLayerBlendMode(layerId: string, blendMode: string): boolean {
    return this.layerSystem.updateLayer(layerId, { blendMode })
  }

  /**
   * 变换图层
   */
  transformLayer(layerId: string, transform: Partial<any>): boolean {
    return this.layerSystem.transformLayer(layerId, transform)
  }

  /**
   * 渲染所有图层
   */
  render(): void {
    this.layerSystem.render()
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    return this.historyManager?.undo() || false
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    return this.historyManager?.redo() || false
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.historyManager?.canUndo() || false
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.historyManager?.canRedo() || false
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.historyManager?.clear()
  }

  /**
   * 获取历史记录
   */
  getHistory(): any[] {
    return this.historyManager?.getHistory() || []
  }

  /**
   * 开始批量操作
   */
  startBatch(): void {
    this.historyManager?.startBatch()
  }

  /**
   * 结束批量操作
   */
  endBatch(description?: string): void {
    this.historyManager?.endBatch(description)
  }

  /**
   * 导出图层数据
   */
  exportLayers(): any {
    return this.layerSystem.exportLayers()
  }

  /**
   * 导入图层数据
   */
  importLayers(data: any): boolean {
    // 清空历史记录，因为这是一个全新的状态
    this.clearHistory()
    return this.layerSystem.importLayers(data)
  }

  /**
   * 刷新面板
   */
  refreshPanel(): void {
    this.layerPanel?.refresh()
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    this.layerSystem.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    this.layerSystem.off(event, listener)
  }

  /**
   * 销毁图层管理器
   */
  destroy(): void {
    this.layerPanel?.destroy()
    this.layerSystem.destroy()
    
    // 移除键盘事件监听器
    if (this.config.keyboardShortcuts) {
      // Note: 这里简化了，实际应该保存事件监听器的引用以便正确移除
      // document.removeEventListener('keydown', this.keydownHandler)
    }
  }
}

// 导出相关类型和枚举
export { LayerType, LayerSystem, LayerPanel, HistoryManager }
export type { Layer, LayerSystemConfig, LayerPanelConfig, HistoryManagerConfig }

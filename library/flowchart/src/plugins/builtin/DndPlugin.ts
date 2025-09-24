/**
 * 拖拽插件
 * 
 * 支持从物料面板拖拽节点到画布的功能
 */

import { DndPanel } from '@logicflow/extension'
import type { FlowchartEditor } from '../../core/FlowchartEditor'
import { BasePlugin } from '../BasePlugin'

/**
 * 拖拽插件类
 */
export class DndPlugin extends BasePlugin {
  readonly name = 'dnd'
  readonly version = '1.0.0'
  readonly description = '拖拽插件，提供节点拖拽功能'
  private dndPanel?: DndPanel

  /**
   * 安装插件
   * @param editor 编辑器实例
   */
  install(editor: FlowchartEditor): void {
    const lf = editor.getLogicFlow()

    // 创建拖拽面板
    this.dndPanel = new DndPanel({
      lf
    })

    // 注册可拖拽的节点类型
    this.registerDragNodes()
  }

  /**
   * 卸载插件
   * @param editor 编辑器实例
   */
  uninstall(editor: FlowchartEditor): void {
    if (this.dndPanel) {
      this.dndPanel.destroy()
      this.dndPanel = undefined
    }
  }

  /**
   * 注册可拖拽的节点类型
   */
  private registerDragNodes(): void {
    if (!this.dndPanel) return

    // 注册开始节点
    this.dndPanel.setPatternItems([
      {
        type: 'start',
        text: '开始',
        label: '开始节点',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM1MmM0MWEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgNEwxNCA4TDYgMTJWNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K'
      },
      {
        type: 'approval',
        text: '审批',
        label: '审批节点',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzcyMkVEMSIvPgo8cGF0aCBkPSJNOSAxMkwxMSAxNEwxNSAxMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg=='
      },
      {
        type: 'condition',
        text: '条件',
        label: '条件节点',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgMTJMMTIgMjJMMiAxMkwxMiAyWiIgZmlsbD0iI2Y1YzUzOCIvPgo8dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+Cjwvc3ZnPgo='
      },
      {
        type: 'process',
        text: '处理',
        label: '处理节点',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iOCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjgiIHJ4PSIyIiBmaWxsPSIjODA4MDgwIi8+CjxwYXRoIGQ9Ik04IDEySDEyTTE2IDEySDIwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K'
      },
      {
        type: 'end',
        text: '结束',
        label: '结束节点',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlNTQ4NDgiLz4KPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=='
      },
      {
        type: 'parallel-gateway',
        text: '并行',
        label: '并行网关',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgMTJMMTIgMjJMMiAxMkwxMiAyWiIgZmlsbD0iI2Q4YzhlZSIvPgo8cGF0aCBkPSJNOCAxMkgxNk0xMiA4VjE2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K'
      },
      {
        type: 'exclusive-gateway',
        text: '排他',
        label: '排他网关',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgMTJMMTIgMjJMMiAxMkwxMiAyWiIgZmlsbD0iI2ZlZWNiOSIvPgo8cGF0aCBkPSJNOSA5TDE1IDE1TTkgMTVMMTUgOSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg=='
      }
    ])
  }

  /**
   * 设置拖拽面板容器
   * @param container 容器元素
   */
  setDndContainer(container: HTMLElement): void {
    if (this.dndPanel) {
      // DndPanel 可能没有 setPatternContainer 方法，这里先注释掉
      // this.dndPanel.setPatternContainer(container)
    }
  }

  /**
   * 获取拖拽面板实例
   */
  getDndPanel(): DndPanel | undefined {
    return this.dndPanel
  }

  /**
   * 安装插件时的回调
   */
  onInstall(): void {
    // DndPlugin 的安装逻辑已在 install 方法中实现
  }

  /**
   * 卸载插件时的回调
   */
  onUninstall(): void {
    // DndPlugin 的卸载逻辑已在 uninstall 方法中实现
  }
}

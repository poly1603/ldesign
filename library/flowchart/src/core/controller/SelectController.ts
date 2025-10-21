/**
 * 选择控制器 - 管理节点和边的选择状态
 */

import { NodeView } from '../view/NodeView';
import { EdgeView } from '../view/EdgeView';
import { EventBus } from '../../utils/EventBus';
import { GraphEvent } from '../../types/graph';

export class SelectController {
  private selectedNodes: Set<string> = new Set();
  private selectedEdges: Set<string> = new Set();
  private eventBus: EventBus;

  // 视图映射
  private nodeViews: Map<string, NodeView>;
  private edgeViews: Map<string, EdgeView>;

  constructor(
    nodeViews: Map<string, NodeView>,
    edgeViews: Map<string, EdgeView>,
    eventBus: EventBus
  ) {
    this.nodeViews = nodeViews;
    this.edgeViews = edgeViews;
    this.eventBus = eventBus;
  }

  /**
   * 选择节点
   */
  selectNode(id: string, append = false): void {
    if (!append) {
      this.clearSelection();
    }

    const view = this.nodeViews.get(id);
    if (view) {
      this.selectedNodes.add(id);
      view.setSelected(true);
      this.eventBus.emit(GraphEvent.NODE_SELECTED, { id });
    }
  }

  /**
   * 取消选择节点
   */
  unselectNode(id: string): void {
    const view = this.nodeViews.get(id);
    if (view) {
      this.selectedNodes.delete(id);
      view.setSelected(false);
      this.eventBus.emit(GraphEvent.NODE_UNSELECTED, { id });
    }
  }

  /**
   * 选择边
   */
  selectEdge(id: string, append = false): void {
    if (!append) {
      this.clearSelection();
    }

    const view = this.edgeViews.get(id);
    if (view) {
      this.selectedEdges.add(id);
      view.setSelected(true);
      this.eventBus.emit(GraphEvent.EDGE_SELECTED, { id });
    }
  }

  /**
   * 取消选择边
   */
  unselectEdge(id: string): void {
    const view = this.edgeViews.get(id);
    if (view) {
      this.selectedEdges.delete(id);
      view.setSelected(false);
      this.eventBus.emit(GraphEvent.EDGE_UNSELECTED, { id });
    }
  }

  /**
   * 切换节点选择状态
   */
  toggleNodeSelection(id: string, append = false): void {
    if (this.selectedNodes.has(id)) {
      this.unselectNode(id);
    } else {
      this.selectNode(id, append);
    }
  }

  /**
   * 切换边选择状态
   */
  toggleEdgeSelection(id: string, append = false): void {
    if (this.selectedEdges.has(id)) {
      this.unselectEdge(id);
    } else {
      this.selectEdge(id, append);
    }
  }

  /**
   * 清空选择
   */
  clearSelection(): void {
    // 清空节点选择
    this.selectedNodes.forEach(id => {
      const view = this.nodeViews.get(id);
      if (view) {
        view.setSelected(false);
        this.eventBus.emit(GraphEvent.NODE_UNSELECTED, { id });
      }
    });
    this.selectedNodes.clear();

    // 清空边选择
    this.selectedEdges.forEach(id => {
      const view = this.edgeViews.get(id);
      if (view) {
        view.setSelected(false);
        this.eventBus.emit(GraphEvent.EDGE_UNSELECTED, { id });
      }
    });
    this.selectedEdges.clear();
  }

  /**
   * 选择所有节点
   */
  selectAllNodes(): void {
    this.nodeViews.forEach((view, id) => {
      this.selectedNodes.add(id);
      view.setSelected(true);
      this.eventBus.emit(GraphEvent.NODE_SELECTED, { id });
    });
  }

  /**
   * 获取选中的节点ID列表
   */
  getSelectedNodes(): string[] {
    return Array.from(this.selectedNodes);
  }

  /**
   * 获取选中的边ID列表
   */
  getSelectedEdges(): string[] {
    return Array.from(this.selectedEdges);
  }

  /**
   * 是否有选中项
   */
  hasSelection(): boolean {
    return this.selectedNodes.size > 0 || this.selectedEdges.size > 0;
  }

  /**
   * 节点是否被选中
   */
  isNodeSelected(id: string): boolean {
    return this.selectedNodes.has(id);
  }

  /**
   * 边是否被选中
   */
  isEdgeSelected(id: string): boolean {
    return this.selectedEdges.has(id);
  }
}



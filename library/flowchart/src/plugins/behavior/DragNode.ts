/**
 * 节点拖拽插件
 */

import { Graph } from '../../core/Graph';
import { Plugin, BehaviorConfig } from '../../types/plugin';
import { Position } from '../../types/model';
import { GraphEvent } from '../../types/graph';

export class DragNodePlugin implements Plugin {
  name = 'DragNodePlugin';
  config: BehaviorConfig;

  private graph: Graph | null = null;
  private dragging = false;
  private draggedNodeId: string | null = null;
  private dragStart: Position = { x: 0, y: 0 };
  private nodeStart: Position = { x: 0, y: 0 };

  constructor(config: BehaviorConfig = {}) {
    this.config = {
      enabled: config.enabled !== false,
      ...config,
    };
  }

  install(graph: Graph): void {
    this.graph = graph;

    if (this.config.enabled) {
      this.enable();
    }
  }

  uninstall(): void {
    this.disable();
    this.graph = null;
  }

  enable(): void {
    if (!this.graph) return;

    const svg = this.graph.getRenderer().getSVG();
    svg.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  disable(): void {
    if (!this.graph) return;

    const svg = this.graph.getRenderer().getSVG();
    svg.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (e: MouseEvent): void => {
    const target = e.target as Element;
    const nodeElement = target.closest('.fc-node');

    if (!nodeElement) return;

    const nodeId = nodeElement.getAttribute('data-id');
    if (!nodeId || !this.graph) return;

    const node = this.graph.getNode(nodeId);
    if (!node) return;

    this.dragging = true;
    this.draggedNodeId = nodeId;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.nodeStart = node.getPosition();

    e.stopPropagation();
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.dragging || !this.draggedNodeId || !this.graph) return;

    const node = this.graph.getNode(this.draggedNodeId);
    if (!node) return;

    // 获取视口的缩放比例
    const zoom = this.graph.getZoom();

    const dx = (e.clientX - this.dragStart.x) / zoom;
    const dy = (e.clientY - this.dragStart.y) / zoom;

    node.setPosition({
      x: this.nodeStart.x + dx,
      y: this.nodeStart.y + dy,
    });

    // 刷新连线
    this.graph.getRenderer().refresh();
  };

  private handleMouseUp = (): void => {
    if (this.dragging && this.graph) {
      this.graph.emit(GraphEvent.NODE_UPDATED, { id: this.draggedNodeId });
    }

    this.dragging = false;
    this.draggedNodeId = null;
  };
}



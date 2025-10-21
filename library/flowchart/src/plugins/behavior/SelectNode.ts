/**
 * 节点选择插件 - 支持单选和多选
 */

import { Graph } from '../../core/Graph';
import { Plugin, BehaviorConfig } from '../../types/plugin';
import { GraphEvent } from '../../types/graph';

export class SelectNodePlugin implements Plugin {
  name = 'SelectNodePlugin';
  config: BehaviorConfig;

  private graph: Graph | null = null;

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

    this.graph.on(GraphEvent.NODE_CLICK, this.handleNodeClick);
    this.graph.on(GraphEvent.CANVAS_CLICK, this.handleCanvasClick);
  }

  disable(): void {
    if (!this.graph) return;

    this.graph.off(GraphEvent.NODE_CLICK, this.handleNodeClick);
    this.graph.off(GraphEvent.CANVAS_CLICK, this.handleCanvasClick);
  }

  private handleNodeClick = (data: { id: string; event: MouseEvent }): void => {
    if (!this.graph) return;

    const selectController = this.graph.getSelectController();
    const isMultiSelect = data.event.ctrlKey || data.event.metaKey;

    selectController.selectNode(data.id, isMultiSelect);
  };

  private handleCanvasClick = (): void => {
    if (!this.graph) return;

    const selectController = this.graph.getSelectController();
    selectController.clearSelection();
  };
}



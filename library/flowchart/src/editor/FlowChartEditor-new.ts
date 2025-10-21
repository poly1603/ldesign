/**
 * FlowChart 编辑器 - 基于新架构的完整编辑器
 * 
 * 提供开箱即用的流程图编辑功能，包括：
 * - 工具栏（缩放、删除、清空等）
 * - 节点拖拽
 * - 节点选择
 * - 历史记录（撤销/重做）
 */

import { Graph } from '../core/Graph';
import { DragNodePlugin, SelectNodePlugin } from '../plugins/behavior';
import { HistoryPlugin } from '../plugins/history';
import { GraphConfig, GraphEvent } from '../types/graph';
import { NodeConfig, EdgeConfig } from '../types/model';

export interface FlowChartEditorConfig extends GraphConfig {
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 工具栏位置 */
  toolbarPosition?: 'top' | 'bottom';
  /** 是否启用拖拽 */
  enableDrag?: boolean;
  /** 是否启用选择 */
  enableSelect?: boolean;
  /** 是否启用历史记录 */
  enableHistory?: boolean;
  /** 历史记录栈大小 */
  historyMaxStack?: number;
}

export class FlowChartEditor {
  private graph: Graph;
  private config: FlowChartEditorConfig;
  private container: HTMLElement;
  private editorContainer: HTMLElement;
  private toolbarElement?: HTMLElement;

  // 插件实例
  private dragNodePlugin?: DragNodePlugin;
  private selectNodePlugin?: SelectNodePlugin;
  private historyPlugin?: HistoryPlugin;

  constructor(config: FlowChartEditorConfig) {
    this.config = {
      showToolbar: true,
      toolbarPosition: 'top',
      enableDrag: true,
      enableSelect: true,
      enableHistory: true,
      historyMaxStack: 50,
      autoLayout: true,
      ...config,
    };

    this.container = this.getContainer(config.container);
    this.editorContainer = this.createEditorLayout();

    // 创建图实例
    const graphContainer = this.editorContainer.querySelector('.flowchart-canvas') as HTMLElement;
    this.graph = new Graph({
      ...config,
      container: graphContainer,
    });

    // 注册插件
    this.registerPlugins();

    // 创建工具栏
    if (this.config.showToolbar) {
      this.createToolbar();
    }

    // 绑定快捷键
    this.bindShortcuts();
  }

  /**
   * 获取容器元素
   */
  private getContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  /**
   * 创建编辑器布局
   */
  private createEditorLayout(): HTMLElement {
    this.container.innerHTML = '';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.position = 'relative';

    const editorDiv = document.createElement('div');
    editorDiv.className = 'flowchart-editor';
    editorDiv.style.width = '100%';
    editorDiv.style.height = '100%';
    editorDiv.style.display = 'flex';
    editorDiv.style.flexDirection = 'column';

    // 工具栏占位
    if (this.config.showToolbar && this.config.toolbarPosition === 'top') {
      const toolbarPlaceholder = document.createElement('div');
      toolbarPlaceholder.className = 'flowchart-toolbar-placeholder';
      editorDiv.appendChild(toolbarPlaceholder);
    }

    // 画布容器
    const canvasDiv = document.createElement('div');
    canvasDiv.className = 'flowchart-canvas';
    canvasDiv.style.flex = '1';
    canvasDiv.style.position = 'relative';
    canvasDiv.style.overflow = 'hidden';
    editorDiv.appendChild(canvasDiv);

    // 工具栏占位（底部）
    if (this.config.showToolbar && this.config.toolbarPosition === 'bottom') {
      const toolbarPlaceholder = document.createElement('div');
      toolbarPlaceholder.className = 'flowchart-toolbar-placeholder';
      editorDiv.appendChild(toolbarPlaceholder);
    }

    this.container.appendChild(editorDiv);
    return editorDiv;
  }

  /**
   * 注册插件
   */
  private registerPlugins(): void {
    // 节点拖拽插件
    if (this.config.enableDrag) {
      this.dragNodePlugin = new DragNodePlugin();
      this.graph.use(this.dragNodePlugin);
    }

    // 节点选择插件
    if (this.config.enableSelect) {
      this.selectNodePlugin = new SelectNodePlugin();
      this.graph.use(this.selectNodePlugin);
    }

    // 历史记录插件
    if (this.config.enableHistory) {
      this.historyPlugin = new HistoryPlugin({
        maxStack: this.config.historyMaxStack,
      });
      this.graph.use(this.historyPlugin);
    }
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    const toolbar = document.createElement('div');
    toolbar.className = 'flowchart-toolbar';
    toolbar.style.padding = '10px 15px';
    toolbar.style.background = '#ffffff';
    toolbar.style.borderBottom = '1px solid #e0e0e0';
    toolbar.style.display = 'flex';
    toolbar.style.gap = '10px';
    toolbar.style.alignItems = 'center';

    // 创建按钮
    const buttons = [
      { label: '➕ 添加节点', action: () => this.addNode() },
      { label: '🗑️ 删除', action: () => this.deleteSelected() },
      { label: '↶ 撤销', action: () => this.undo() },
      { label: '↷ 重做', action: () => this.redo() },
      { type: 'separator' },
      { label: '🔍+ 放大', action: () => this.zoomIn() },
      { label: '🔍- 缩小', action: () => this.zoomOut() },
      { label: '📐 适应', action: () => this.fitContent() },
      { label: '🎯 居中', action: () => this.centerContent() },
      { type: 'separator' },
      { label: '🧹 清空', action: () => this.clear() },
      { label: '💾 导出', action: () => this.exportJSON() },
    ];

    buttons.forEach(btn => {
      if (btn.type === 'separator') {
        const separator = document.createElement('div');
        separator.style.width = '1px';
        separator.style.height = '24px';
        separator.style.background = '#e0e0e0';
        separator.style.margin = '0 5px';
        toolbar.appendChild(separator);
      } else if (btn.action) {
        const button = document.createElement('button');
        button.textContent = btn.label;
        button.style.padding = '6px 12px';
        button.style.border = '1px solid #d9d9d9';
        button.style.borderRadius = '4px';
        button.style.background = 'white';
        button.style.cursor = 'pointer';
        button.style.fontSize = '13px';
        button.style.transition = 'all 0.2s';
        button.onclick = btn.action;

        button.onmouseenter = () => {
          button.style.borderColor = '#667eea';
          button.style.color = '#667eea';
        };
        button.onmouseleave = () => {
          button.style.borderColor = '#d9d9d9';
          button.style.color = '';
        };

        toolbar.appendChild(button);
      }
    });

    // 插入工具栏
    const placeholder = this.editorContainer.querySelector('.flowchart-toolbar-placeholder');
    if (placeholder) {
      placeholder.replaceWith(toolbar);
      this.toolbarElement = toolbar;
    }
  }

  /**
   * 绑定快捷键
   */
  private bindShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }

      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y: 重做
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        this.redo();
      }

      // Delete/Backspace: 删除选中
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement;
        // 只有在不是输入框时才触发删除
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.deleteSelected();
        }
      }

      // Ctrl/Cmd + A: 全选
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        this.selectAll();
      }
    });
  }

  /**
   * 添加节点（示例）
   */
  private addNode(): void {
    const nodeCount = this.graph.getNodes().length;
    this.graph.addNode({
      type: 'process',
      x: 100 + nodeCount * 50,
      y: 100 + nodeCount * 50,
      label: `节点 ${nodeCount + 1}`,
    });
  }

  /**
   * 删除选中的节点和边
   */
  deleteSelected(): void {
    const selectController = this.graph.getSelectController();
    const selectedNodes = selectController.getSelectedNodes();
    const selectedEdges = selectController.getSelectedEdges();

    // 删除选中的边
    selectedEdges.forEach(id => {
      this.graph.removeEdge(id);
    });

    // 删除选中的节点
    selectedNodes.forEach(id => {
      this.graph.removeNode(id);
    });
  }

  /**
   * 撤销
   */
  undo(): void {
    if (this.historyPlugin) {
      this.historyPlugin.undo();
    }
  }

  /**
   * 重做
   */
  redo(): void {
    if (this.historyPlugin) {
      this.historyPlugin.redo();
    }
  }

  /**
   * 放大
   */
  zoomIn(): void {
    this.graph.zoomIn();
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    this.graph.zoomOut();
  }

  /**
   * 适应内容
   */
  fitContent(): void {
    this.graph.fitContent();
  }

  /**
   * 居中内容
   */
  centerContent(): void {
    this.graph.centerContent();
  }

  /**
   * 清空画布
   */
  clear(): void {
    if (confirm('确定要清空画布吗？')) {
      this.graph.clear();
    }
  }

  /**
   * 全选
   */
  selectAll(): void {
    const selectController = this.graph.getSelectController();
    selectController.selectAllNodes();
  }

  /**
   * 导出JSON
   */
  exportJSON(): void {
    const data = this.graph.toJSON();
    console.log('导出数据：', data);

    // 下载JSON文件
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 加载数据
   */
  load(data: { nodes: NodeConfig[]; edges: EdgeConfig[] }): void {
    this.graph.load(data);
  }

  /**
   * 添加节点
   */
  addNodeModel(config: NodeConfig): void {
    this.graph.addNode(config);
  }

  /**
   * 添加边
   */
  addEdgeModel(config: EdgeConfig): void {
    this.graph.addEdge(config);
  }

  /**
   * 监听事件
   */
  on(event: GraphEvent | string, handler: (...args: any[]) => void): void {
    this.graph.on(event, handler);
  }

  /**
   * 获取图实例
   */
  getGraph(): Graph {
    return this.graph;
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.graph.destroy();
    this.container.innerHTML = '';
  }
}



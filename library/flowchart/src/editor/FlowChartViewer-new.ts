/**
 * FlowChart 查看器 - 只读模式的流程图查看器
 * 
 * 提供简单的流程图查看功能，不包含编辑能力：
 * - 只能查看，不能编辑
 * - 支持缩放和平移
 * - 轻量级，性能更好
 */

import { Graph } from '../core/Graph';
import { GraphConfig } from '../types/graph';
import { NodeConfig, EdgeConfig } from '../types/model';

export interface FlowChartViewerConfig extends GraphConfig {
  /** 是否显示缩放控制 */
  showZoomControls?: boolean;
}

export class FlowChartViewer {
  private graph: Graph;
  private config: FlowChartViewerConfig;
  private container: HTMLElement;
  private viewerContainer: HTMLElement;
  private zoomControlsElement?: HTMLElement;

  constructor(config: FlowChartViewerConfig) {
    this.config = {
      showZoomControls: true,
      autoLayout: true,
      ...config,
    };

    this.container = this.getContainer(config.container);
    this.viewerContainer = this.createViewerLayout();

    // 创建图实例
    const graphContainer = this.viewerContainer.querySelector('.flowchart-canvas') as HTMLElement;
    this.graph = new Graph({
      ...config,
      container: graphContainer,
    });

    // 创建缩放控制
    if (this.config.showZoomControls) {
      this.createZoomControls();
    }
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
   * 创建查看器布局
   */
  private createViewerLayout(): HTMLElement {
    this.container.innerHTML = '';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.position = 'relative';

    const viewerDiv = document.createElement('div');
    viewerDiv.className = 'flowchart-viewer';
    viewerDiv.style.width = '100%';
    viewerDiv.style.height = '100%';
    viewerDiv.style.position = 'relative';

    // 画布容器
    const canvasDiv = document.createElement('div');
    canvasDiv.className = 'flowchart-canvas';
    canvasDiv.style.width = '100%';
    canvasDiv.style.height = '100%';
    canvasDiv.style.position = 'relative';
    canvasDiv.style.overflow = 'hidden';
    viewerDiv.appendChild(canvasDiv);

    this.container.appendChild(viewerDiv);
    return viewerDiv;
  }

  /**
   * 创建缩放控制
   */
  private createZoomControls(): void {
    const controls = document.createElement('div');
    controls.className = 'flowchart-zoom-controls';
    controls.style.position = 'absolute';
    controls.style.bottom = '20px';
    controls.style.right = '20px';
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '8px';
    controls.style.background = 'white';
    controls.style.padding = '8px';
    controls.style.borderRadius = '8px';
    controls.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    controls.style.zIndex = '1000';

    const buttons = [
      { label: '+', action: () => this.zoomIn(), title: '放大' },
      { label: '−', action: () => this.zoomOut(), title: '缩小' },
      { label: '⊡', action: () => this.fitContent(), title: '适应' },
      { label: '⊙', action: () => this.centerContent(), title: '居中' },
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.label;
      button.title = btn.title;
      button.style.width = '32px';
      button.style.height = '32px';
      button.style.border = '1px solid #d9d9d9';
      button.style.borderRadius = '4px';
      button.style.background = 'white';
      button.style.cursor = 'pointer';
      button.style.fontSize = '16px';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.transition = 'all 0.2s';
      button.onclick = btn.action;

      button.onmouseenter = () => {
        button.style.background = '#f5f5f5';
        button.style.borderColor = '#667eea';
      };
      button.onmouseleave = () => {
        button.style.background = 'white';
        button.style.borderColor = '#d9d9d9';
      };

      controls.appendChild(button);
    });

    this.viewerContainer.appendChild(controls);
    this.zoomControlsElement = controls;
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
   * 加载数据
   */
  load(data: { nodes: NodeConfig[]; edges: EdgeConfig[] }): void {
    this.graph.load(data);
  }

  /**
   * 获取图实例
   */
  getGraph(): Graph {
    return this.graph;
  }

  /**
   * 销毁查看器
   */
  destroy(): void {
    this.graph.destroy();
    this.container.innerHTML = '';
  }
}



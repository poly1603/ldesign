import { FlowChart } from '../core/FlowChart';
import { Toolbar } from './Toolbar';
import { MaterialPanel } from './MaterialPanel';
import { DragManager } from './DragManager';
import { EdgeDrawer } from './EdgeDrawer';
import { ComponentRegistry } from '../components/ComponentRegistry';
import { ThemeManager } from '../theme/Theme';
import {
  FlowChartConfig,
  NodeData,
  EdgeData,
  EditorMode,
  MaterialItem,
} from '../types';

/**
 * 流程图编辑器配置
 */
export interface EditorConfig extends FlowChartConfig {
  showToolbar?: boolean;       // 是否显示工具栏
  showMaterialPanel?: boolean; // 是否显示物料面板
  materials?: MaterialItem[];  // 自定义物料列表
  toolbarPosition?: 'top' | 'bottom'; // 工具栏位置
  materialPanelPosition?: 'left' | 'right'; // 物料面板位置
  theme?: 'default' | 'dark' | 'minimal'; // 主题
}

/**
 * 流程图编辑器
 * 提供完整的编辑功能，包括工具栏、物料面板、拖拽等
 */
export class FlowChartEditor {
  private flowChart: FlowChart;
  private toolbar?: Toolbar;
  private materialPanel?: MaterialPanel;
  private dragManager: DragManager;
  private edgeDrawer: EdgeDrawer;
  private componentRegistry: ComponentRegistry;
  private themeManager: ThemeManager;
  
  private container: HTMLElement;
  private editorContainer!: HTMLElement;
  private canvasContainer: HTMLElement;
  private config: EditorConfig;
  private mode: EditorMode;

  constructor(config: EditorConfig) {
    this.config = {
      showToolbar: true,
      showMaterialPanel: true,
      toolbarPosition: 'top',
      materialPanelPosition: 'left',
      mode: EditorMode.EDIT,
      theme: 'default',
      ...config
    };

    this.mode = this.config.mode!;

    // 初始化组件注册表
    this.componentRegistry = new ComponentRegistry();

    // 初始化主题管理器
    this.themeManager = new ThemeManager(this.config.theme);

    // 创建编辑器容器结构
    this.container = this.getContainer(config.container);
    this.setupEditorLayout();

    // 创建画布容器
    this.canvasContainer = this.editorContainer.querySelector('.flowchart-canvas') as HTMLElement;

    // 初始化流程图
    this.flowChart = new FlowChart({
      ...config,
      container: this.canvasContainer,
      enableNodeDrag: this.mode === EditorMode.EDIT,
      onNodeClick: (node) => this.handleNodeClick(node),
      onEdgeClick: (edge) => this.handleEdgeClick(edge)
    });

    // 初始化工具栏
    if (this.config.showToolbar) {
      this.toolbar = new Toolbar({
        container: this.editorContainer.querySelector('.flowchart-toolbar') as HTMLElement,
        mode: this.mode,
        onModeChange: (mode) => this.setMode(mode),
        onThemeChange: (theme) => this.setTheme(theme),
        onDelete: () => this.deleteSelected(),
        onClear: () => this.clear(),
        onUndo: () => this.undo(),
        onRedo: () => this.redo(),
        onZoomIn: () => this.zoomIn(),
        onZoomOut: () => this.zoomOut(),
        onFit: () => this.fit(),
        onExport: () => this.export()
      });
    }

    // 初始化物料面板
    if (this.config.showMaterialPanel) {
      this.materialPanel = new MaterialPanel({
        container: this.editorContainer.querySelector('.flowchart-material-panel') as HTMLElement,
        materials: this.config.materials || this.getDefaultMaterials(),
        onMaterialSelect: (material) => this.handleMaterialSelect(material)
      });
    }

    // 初始化拖拽管理器
    this.dragManager = new DragManager({
      canvas: this.canvasContainer,
      flowChart: this.flowChart,
      renderer: this.flowChart.getRenderer(),  // 传递 renderer
      enabled: this.mode === EditorMode.EDIT,
      onNodeAdd: (node) => this.handleNodeAdd(node)
    });

    // 初始化连线绘制器
    this.edgeDrawer = new EdgeDrawer({
      canvas: this.canvasContainer,
      flowChart: this.flowChart,
      enabled: this.mode === EditorMode.EDIT,
      onEdgeAdd: (edge) => this.handleEdgeAdd(edge)
    });
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
   * 设置编辑器布局
   */
  private setupEditorLayout(): void {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';

    // 创建编辑器主容器
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'flowchart-editor';
    this.editorContainer.style.width = '100%';
    this.editorContainer.style.height = '100%';
    this.editorContainer.style.display = 'flex';
    this.editorContainer.style.flexDirection = 'column';

    // 工具栏
    if (this.config.showToolbar && this.config.toolbarPosition === 'top') {
      const toolbarDiv = document.createElement('div');
      toolbarDiv.className = 'flowchart-toolbar';
      this.editorContainer.appendChild(toolbarDiv);
    }

    // 主内容区域
    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.display = 'flex';
    contentArea.style.overflow = 'hidden';

    // 物料面板
    if (this.config.showMaterialPanel && this.config.materialPanelPosition === 'left') {
      const materialDiv = document.createElement('div');
      materialDiv.className = 'flowchart-material-panel';
      contentArea.appendChild(materialDiv);
    }

    // 画布
    const canvasDiv = document.createElement('div');
    canvasDiv.className = 'flowchart-canvas';
    canvasDiv.style.flex = '1';
    canvasDiv.style.position = 'relative';
    canvasDiv.style.overflow = 'hidden';
    contentArea.appendChild(canvasDiv);

    // 物料面板（右侧）
    if (this.config.showMaterialPanel && this.config.materialPanelPosition === 'right') {
      const materialDiv = document.createElement('div');
      materialDiv.className = 'flowchart-material-panel';
      contentArea.appendChild(materialDiv);
    }

    this.editorContainer.appendChild(contentArea);

    // 工具栏（底部）
    if (this.config.showToolbar && this.config.toolbarPosition === 'bottom') {
      const toolbarDiv = document.createElement('div');
      toolbarDiv.className = 'flowchart-toolbar';
      this.editorContainer.appendChild(toolbarDiv);
    }

    this.container.appendChild(this.editorContainer);
  }

  /**
   * 获取默认物料（从组件注册表）
   */
  private getDefaultMaterials(): MaterialItem[] {
    return this.componentRegistry.toMaterialList();
  }

  /**
   * 设置模式
   */
  public setMode(mode: EditorMode): void {
    this.mode = mode;
    
    // 更新流程图交互能力
    this.dragManager.setEnabled(mode === EditorMode.EDIT);
    this.edgeDrawer.setEnabled(mode === EditorMode.EDIT);

    // 更新工具栏
    if (this.toolbar) {
      this.toolbar.setMode(mode);
    }

    // 触发回调
    this.config.onModeChange?.(mode);
  }

  /**
   * 获取当前模式
   */
  public getMode(): EditorMode {
    return this.mode;
  }

  /**
   * 处理物料选择
   */
  private handleMaterialSelect(material: MaterialItem): void {
    this.dragManager.startDrag(material);
  }

  /**
   * 处理节点点击
   */
  private handleNodeClick(node: NodeData): void {
    if (this.mode === EditorMode.EDIT) {
      this.edgeDrawer.handleNodeClick(node);
    }
    this.config.onNodeClick?.(node);
  }

  /**
   * 处理边点击
   */
  private handleEdgeClick(edge: EdgeData): void {
    this.config.onEdgeClick?.(edge);
  }

  /**
   * 处理节点添加
   */
  private handleNodeAdd(node: NodeData): void {
    this.config.onNodeAdd?.(node);
  }

  /**
   * 处理边添加
   */
  private handleEdgeAdd(edge: EdgeData): void {
    this.config.onEdgeAdd?.(edge);
  }

  /**
   * 删除选中项
   */
  public deleteSelected(): void {
    if (this.mode !== EditorMode.EDIT) {
      return;
    }
    // TODO: 实现选中项删除
    console.log('Delete selected');
  }

  /**
   * 清空画布
   */
  public clear(): void {
    if (this.mode !== EditorMode.EDIT) {
      return;
    }
    if (confirm('确定要清空画布吗？')) {
      this.flowChart.clear();
    }
  }

  /**
   * 撤销
   */
  public undo(): void {
    if (this.mode !== EditorMode.EDIT) {
      return;
    }
    // TODO: 实现撤销功能
    console.log('Undo');
  }

  /**
   * 重做
   */
  public redo(): void {
    if (this.mode !== EditorMode.EDIT) {
      return;
    }
    // TODO: 实现重做功能
    console.log('Redo');
  }

  /**
   * 放大
   */
  public zoomIn(): void {
    // TODO: 实现放大
    console.log('Zoom in');
  }

  /**
   * 缩小
   */
  public zoomOut(): void {
    // TODO: 实现缩小
    console.log('Zoom out');
  }

  /**
   * 适应画布
   */
  public fit(): void {
    this.flowChart.render();
  }

  /**
   * 导出
   */
  public export(): any {
    return this.flowChart.toJSON();
  }

  /**
   * 加载数据
   */
  public load(nodes: NodeData[], edges: EdgeData[]): void {
    this.flowChart.load(nodes, edges);
  }

  /**
   * 切换主题
   */
  public setTheme(theme: 'default' | 'dark' | 'minimal'): void {
    this.themeManager.setTheme(theme);
    this.componentRegistry.setTheme(theme);
    
    // 重新渲染
    this.flowChart.render();
    
    // 重新渲染物料面板
    if (this.materialPanel) {
      this.materialPanel.destroy();
      this.materialPanel = new MaterialPanel({
        container: this.editorContainer.querySelector('.flowchart-material-panel') as HTMLElement,
        materials: this.config.materials || this.getDefaultMaterials(),
        onMaterialSelect: (material) => this.handleMaterialSelect(material)
      });
    }
  }

  /**
   * 获取组件注册表
   */
  public getComponentRegistry(): ComponentRegistry {
    return this.componentRegistry;
  }

  /**
   * 获取主题管理器
   */
  public getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  /**
   * 获取流程图实例
   */
  public getFlowChart(): FlowChart {
    return this.flowChart;
  }

  /**
   * 销毁编辑器
   */
  public destroy(): void {
    this.dragManager.destroy();
    this.edgeDrawer.destroy();
    this.toolbar?.destroy();
    this.materialPanel?.destroy();
    this.flowChart.destroy();
    this.container.innerHTML = '';
  }
}


import { FlowChart } from '../core/FlowChart';
import { MaterialItem, NodeData } from '../types';
import { generateId } from '../utils/helpers';
import { Renderer } from '../renderer/Renderer';

/**
 * 拖拽管理器配置
 */
export interface DragManagerConfig {
  canvas: HTMLElement;
  flowChart: FlowChart;
  renderer: Renderer;  // 新增：需要 renderer 来转换坐标
  enabled: boolean;
  onNodeAdd?: (node: NodeData) => void;
}

/**
 * 拖拽管理器
 * 处理从物料面板拖拽节点到画布
 */
export class DragManager {
  private canvas: HTMLElement;
  private flowChart: FlowChart;
  private renderer: Renderer;
  private enabled: boolean;
  private config: DragManagerConfig;
  private currentMaterial: MaterialItem | null = null;
  private dragPreview: HTMLElement | null = null;

  constructor(config: DragManagerConfig) {
    this.config = config;
    this.canvas = config.canvas;
    this.flowChart = config.flowChart;
    this.renderer = config.renderer;
    this.enabled = config.enabled;

    this.setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
    this.canvas.addEventListener('dragleave', (e) => this.handleDragLeave(e));
  }

  /**
   * 处理拖拽进入
   */
  private handleDragOver(e: DragEvent): void {
    if (!this.enabled) {
      return;
    }

    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';

    // 不显示拖拽预览（用户不需要）
    // this.showDragPreview(e.clientX, e.clientY);
  }

  /**
   * 显示拖拽预览
   */
  private showDragPreview(x: number, y: number): void {
    if (!this.dragPreview && this.currentMaterial) {
      this.dragPreview = document.createElement('div');
      this.dragPreview.style.cssText = `
        position: fixed;
        padding: 12px 24px;
        background: rgba(33, 150, 243, 0.15);
        border: 2px dashed #2196f3;
        border-radius: 8px;
        color: #2196f3;
        font-size: 14px;
        font-weight: 500;
        pointer-events: none;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
      `;
      
      // 显示图标和文本
      if (this.currentMaterial.icon) {
        this.dragPreview.innerHTML = `
          <span style="margin-right: 6px; font-size: 18px;">${this.currentMaterial.icon}</span>
          <span>${this.currentMaterial.label}</span>
        `;
      } else {
        this.dragPreview.textContent = this.currentMaterial.label;
      }
      
      document.body.appendChild(this.dragPreview);
    }

    if (this.dragPreview) {
      this.dragPreview.style.left = `${x + 15}px`;
      this.dragPreview.style.top = `${y + 15}px`;
    }
  }

  /**
   * 处理放置
   */
  private handleDrop(e: DragEvent): void {
    if (!this.enabled) {
      return;
    }

    e.preventDefault();

    try {
      const data = e.dataTransfer!.getData('application/json');
      if (!data) {
        return;
      }

      const material: MaterialItem = JSON.parse(data);
      
      // 使用 Renderer 的坐标转换方法
      const position = this.renderer.screenToFlowChart(e.clientX, e.clientY);

      // 创建节点（标记为手动位置）
      const node: NodeData = {
        id: generateId('node'),
        type: material.type,
        label: material.label,
        position,
        manualPosition: true  // 标记为手动位置，跳过自动布局
      };

      // 添加到流程图
      this.flowChart.addNode(node);
      this.flowChart.render();

      // 回调
      this.config.onNodeAdd?.(node);
      
      console.log('✅ 节点已添加:', material.label, `位置: (${Math.round(position.x)}, ${Math.round(position.y)})`);
    } catch (error) {
      console.error('❌ 拖放失败:', error);
      alert('添加节点失败，请重试');
    } finally {
      this.clearDragPreview();
      this.currentMaterial = null;
    }
  }

  /**
   * 处理拖拽离开
   */
  private handleDragLeave(e: DragEvent): void {
    if (e.relatedTarget && this.canvas.contains(e.relatedTarget as Node)) {
      return;
    }
    this.clearDragPreview();
  }

  /**
   * 清除拖拽预览
   */
  private clearDragPreview(): void {
    if (this.dragPreview && this.dragPreview.parentNode) {
      this.dragPreview.parentNode.removeChild(this.dragPreview);
      this.dragPreview = null;
    }
  }

  /**
   * 开始拖拽
   */
  public startDrag(material: MaterialItem): void {
    this.currentMaterial = material;
  }

  /**
   * 设置启用状态
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearDragPreview();
      this.currentMaterial = null;
    }
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.clearDragPreview();
  }
}


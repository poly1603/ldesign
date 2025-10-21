/**
 * 画布管理器
 */

import type { ComponentNode, EditorState, SelectionInfo, LayoutPosition } from '../../types';
import { SchemaManager } from '../../core/schema/schema-manager';
import { LayoutManager } from '../../core/layout/layout-manager';
import { generateId } from '../../utils';

/**
 * 画布管理器类
 */
export class CanvasManager {
  private schemaManager: SchemaManager;
  private layoutManager: LayoutManager;
  private state: EditorState;
  private canvasElement: HTMLElement | null = null;

  constructor(schemaManager: SchemaManager, layoutManager: LayoutManager) {
    this.schemaManager = schemaManager;
    this.layoutManager = layoutManager;

    this.state = {
      schema: schemaManager.getSchema(),
      selectedIds: [],
      hoveredId: null,
      mode: 'design',
      scale: 1,
      showGrid: true,
      showGuides: true,
      showBounds: true,
      canvasSize: { width: 1200, height: 800 },
      device: 'desktop'
    };
  }

  /**
   * 设置画布元素
   */
  setCanvasElement(element: HTMLElement): void {
    this.canvasElement = element;
  }

  /**
   * 处理组件从物料面板拖入
   */
  handleMaterialDrop(event: DragEvent, materialType: string): void {
    if (!this.canvasElement) return;

    const layout = this.layoutManager.calculateDropPosition(
      'grid',
      event,
      this.canvasElement
    );

    const component: ComponentNode = {
      id: generateId('comp'),
      type: materialType,
      props: {},
      events: {},
      children: [],
      layout: {
        type: 'grid',
        gridColumn: 'span 6',
        ...layout
      }
    };

    this.schemaManager.addComponent(component);
  }

  /**
   * 处理组件在画布内拖动
   */
  handleComponentDrag(componentId: string, event: DragEvent): void {
    if (!this.canvasElement) return;

    const layout = this.layoutManager.calculateDropPosition(
      'grid',
      event,
      this.canvasElement
    );

    this.schemaManager.updateComponent(componentId, { layout });
  }

  /**
   * 选择组件
   */
  selectComponent(id: string, multi = false): void {
    if (multi) {
      if (this.state.selectedIds.includes(id)) {
        this.state.selectedIds = this.state.selectedIds.filter(sid => sid !== id);
      } else {
        this.state.selectedIds.push(id);
      }
    } else {
      this.state.selectedIds = [id];
    }
  }

  /**
   * 清空选择
   */
  clearSelection(): void {
    this.state.selectedIds = [];
  }

  /**
   * 获取选中的组件
   */
  getSelectedComponents(): ComponentNode[] {
    return this.state.selectedIds
      .map(id => this.schemaManager.findComponent(id))
      .filter(comp => comp !== null) as ComponentNode[];
  }

  /**
   * 悬停组件
   */
  hoverComponent(id: string | null): void {
    this.state.hoveredId = id;
  }

  /**
   * 删除选中的组件
   */
  deleteSelected(): void {
    this.state.selectedIds.forEach(id => {
      this.schemaManager.deleteComponent(id);
    });
    this.clearSelection();
  }

  /**
   * 复制选中的组件
   */
  copySelected(): ComponentNode[] {
    return this.getSelectedComponents().map(comp => {
      const copied = this.schemaManager.copyComponent(comp.id);
      return copied!;
    });
  }

  /**
   * 设置缩放
   */
  setScale(scale: number): void {
    this.state.scale = Math.max(0.1, Math.min(scale, 5));
  }

  /**
   * 设置编辑模式
   */
  setMode(mode: 'design' | 'preview' | 'code'): void {
    this.state.mode = mode;
  }

  /**
   * 设置设备类型
   */
  setDevice(device: 'desktop' | 'tablet' | 'mobile'): void {
    this.state.device = device;

    // 更新画布尺寸
    const sizes = {
      desktop: { width: 1200, height: 800 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };

    this.state.canvasSize = sizes[device];
  }

  /**
   * 切换网格显示
   */
  toggleGrid(): void {
    this.state.showGrid = !this.state.showGrid;
  }

  /**
   * 切换参考线显示
   */
  toggleGuides(): void {
    this.state.showGuides = !this.state.showGuides;
  }

  /**
   * 获取状态
   */
  getState(): EditorState {
    return { ...this.state };
  }

  /**
   * 获取选择信息
   */
  getSelectionInfo(): SelectionInfo {
    const components = this.getSelectedComponents();
    return {
      components,
      multiple: components.length > 1,
      bounds: this.calculateSelectionBounds(components)
    };
  }

  /**
   * 计算选择边界
   */
  private calculateSelectionBounds(components: ComponentNode[]): LayoutPosition | undefined {
    if (components.length === 0 || !this.canvasElement) return undefined;

    // 简化实现：返回第一个组件的位置
    // 实际应该计算所有组件的包围盒
    return { x: 0, y: 0, width: 100, height: 100 };
  }
}




/**
 * 拖放处理器
 */

import type { Material, DragDropData, DropIndicator } from '../../types';
import { CanvasManager } from './canvas-manager';

/**
 * 拖放处理器类
 */
export class DragDropHandler {
  private dragData: DragDropData | null = null;
  private dropIndicator: DropIndicator = { visible: false };
  private canvasManager: CanvasManager;

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
  }

  /**
   * 开始拖拽物料
   */
  onMaterialDragStart(material: Material, event: DragEvent): void {
    this.dragData = {
      type: 'material',
      materialType: material.name,
      startPosition: {
        x: event.clientX,
        y: event.clientY
      }
    };

    // 设置拖拽数据
    event.dataTransfer!.effectAllowed = 'copy';
    event.dataTransfer!.setData('material-type', material.name);
    event.dataTransfer!.setData('drag-type', 'material');
  }

  /**
   * 开始拖拽组件
   */
  onComponentDragStart(componentId: string, event: DragEvent): void {
    this.dragData = {
      type: 'component',
      componentId,
      startPosition: {
        x: event.clientX,
        y: event.clientY
      }
    };

    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('component-id', componentId);
    event.dataTransfer!.setData('drag-type', 'component');
  }

  /**
   * 画布拖拽悬停
   */
  onCanvasDragOver(event: DragEvent): void {
    event.preventDefault();

    const dragType = event.dataTransfer?.types.includes('application/x-material') ? 'material' : 'component';
    event.dataTransfer!.dropEffect = dragType === 'material' ? 'copy' : 'move';

    // 计算并显示放置指示器
    this.updateDropIndicator(event);
  }

  /**
   * 拖拽离开画布
   */
  onCanvasDragLeave(event: DragEvent): void {
    // 只有当真正离开画布时才隐藏指示器
    const target = event.relatedTarget as HTMLElement;
    if (!target || !event.currentTarget || !(event.currentTarget as HTMLElement).contains(target)) {
      this.hideDropIndicator();
    }
  }

  /**
   * 放置到画布
   */
  onCanvasDrop(event: DragEvent): void {
    event.preventDefault();

    const materialType = event.dataTransfer?.getData('material-type');
    const componentId = event.dataTransfer?.getData('component-id');

    if (materialType) {
      // 从物料面板拖入
      this.canvasManager.handleMaterialDrop(event, materialType);
    } else if (componentId) {
      // 在画布内移动组件
      this.canvasManager.handleComponentDrag(componentId, event);
    }

    this.hideDropIndicator();
    this.dragData = null;
  }

  /**
   * 拖拽结束
   */
  onDragEnd(): void {
    this.hideDropIndicator();
    this.dragData = null;
  }

  /**
   * 更新放置指示器
   */
  private updateDropIndicator(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.dropIndicator = {
      visible: true,
      position: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        width: 200,
        height: 100
      }
    };
  }

  /**
   * 隐藏放置指示器
   */
  private hideDropIndicator(): void {
    this.dropIndicator.visible = false;
  }

  /**
   * 获取放置指示器
   */
  getDropIndicator(): DropIndicator {
    return { ...this.dropIndicator };
  }

  /**
   * 获取当前拖拽数据
   */
  getDragData(): DragDropData | null {
    return this.dragData ? { ...this.dragData } : null;
  }
}




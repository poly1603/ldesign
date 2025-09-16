/**
 * @ldesign/cropper - 交互控制器
 * 
 * 处理用户交互逻辑，协调各种操作
 */

import type { Point, Rect } from '../types';
import { EventHandler, InteractionEventData } from './EventHandler';
import { CropAreaManager } from '../core/CropAreaManager';
import { EventEmitter } from '../core/EventEmitter';
import { distance } from '../utils';

/**
 * 交互状态
 */
export type InteractionState = 
  | 'idle'
  | 'dragging'
  | 'resizing'
  | 'rotating'
  | 'scaling';

/**
 * 操作类型
 */
export type OperationType = 
  | 'move'
  | 'resize-nw'
  | 'resize-n'
  | 'resize-ne'
  | 'resize-e'
  | 'resize-se'
  | 'resize-s'
  | 'resize-sw'
  | 'resize-w'
  | 'rotate'
  | 'scale';

/**
 * 交互控制器类
 * 
 * 管理用户交互状态和操作逻辑
 */
export class InteractionController extends EventEmitter {
  private eventHandler: EventHandler;
  private cropAreaManager: CropAreaManager;
  private state: InteractionState = 'idle';
  private currentOperation: OperationType | null = null;
  private startPoint: Point = { x: 0, y: 0 };
  private startCropArea: Rect = { x: 0, y: 0, width: 0, height: 0 };
  private startRotation: number = 0;
  private startScale: number = 1;
  private isEnabled: boolean = true;

  constructor(element: HTMLElement, cropAreaManager: CropAreaManager) {
    super();
    
    this.cropAreaManager = cropAreaManager;
    this.eventHandler = new EventHandler(element);
    
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.eventHandler.on('pointerdown', this.handlePointerDown.bind(this));
    this.eventHandler.on('pointermove', this.handlePointerMove.bind(this));
    this.eventHandler.on('pointerup', this.handlePointerUp.bind(this));
    this.eventHandler.on('wheel', this.handleWheel.bind(this));
    this.eventHandler.on('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * 处理指针按下事件
   */
  private handlePointerDown(data: InteractionEventData): void {
    if (!this.isEnabled) return;

    this.startPoint = data.point;
    this.startCropArea = this.cropAreaManager.getCropArea();
    this.startRotation = this.cropAreaManager.getCropData().rotation;
    this.startScale = this.cropAreaManager.getCropData().scale;

    // 检测操作类型
    const operation = this.detectOperation(data.point);
    
    if (operation) {
      this.currentOperation = operation;
      this.setState(this.getStateFromOperation(operation));
      
      // 触发操作开始事件
      this.emit('cropStart', {
        type: 'cropStart',
        cropData: this.cropAreaManager.getCropData(),
        originalEvent: data.originalEvent
      });
    }
  }

  /**
   * 处理指针移动事件
   */
  private handlePointerMove(data: InteractionEventData): void {
    if (!this.isEnabled || this.state === 'idle' || !this.currentOperation) return;

    const deltaX = data.point.x - this.startPoint.x;
    const deltaY = data.point.y - this.startPoint.y;

    switch (this.currentOperation) {
      case 'move':
        this.handleMove(deltaX, deltaY);
        break;
      case 'resize-nw':
      case 'resize-n':
      case 'resize-ne':
      case 'resize-e':
      case 'resize-se':
      case 'resize-s':
      case 'resize-sw':
      case 'resize-w':
        this.handleResize(deltaX, deltaY, this.currentOperation);
        break;
      case 'rotate':
        this.handleRotate(data.point);
        break;
    }

    // 触发移动事件
    this.emit('cropMove', {
      type: 'cropMove',
      cropData: this.cropAreaManager.getCropData(),
      originalEvent: data.originalEvent
    });
  }

  /**
   * 处理指针抬起事件
   */
  private handlePointerUp(data: InteractionEventData): void {
    if (!this.isEnabled || this.state === 'idle') return;

    // 触发操作结束事件
    this.emit('cropEnd', {
      type: 'cropEnd',
      cropData: this.cropAreaManager.getCropData(),
      originalEvent: data.originalEvent
    });

    // 重置状态
    this.setState('idle');
    this.currentOperation = null;
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel(data: InteractionEventData): void {
    if (!this.isEnabled || !data.scale) return;

    // 缩放操作
    this.cropAreaManager.setScale(this.cropAreaManager.getCropData().scale * data.scale);

    // 触发缩放事件
    this.emit('cropChange', {
      type: 'cropChange',
      cropData: this.cropAreaManager.getCropData(),
      originalEvent: data.originalEvent
    });
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(data: InteractionEventData): void {
    if (!this.isEnabled || !data.key) return;

    const moveStep = data.shiftKey ? 10 : 1;
    const rotateStep = data.shiftKey ? 15 : 1;
    const scaleStep = data.shiftKey ? 0.1 : 0.01;

    switch (data.key) {
      case 'arrowup':
        data.originalEvent.preventDefault();
        this.cropAreaManager.moveCropArea(0, -moveStep);
        break;
      case 'arrowdown':
        data.originalEvent.preventDefault();
        this.cropAreaManager.moveCropArea(0, moveStep);
        break;
      case 'arrowleft':
        data.originalEvent.preventDefault();
        if (data.ctrlKey || data.metaKey) {
          // 旋转
          this.cropAreaManager.setRotation(
            this.cropAreaManager.getCropData().rotation - rotateStep
          );
        } else {
          // 移动
          this.cropAreaManager.moveCropArea(-moveStep, 0);
        }
        break;
      case 'arrowright':
        data.originalEvent.preventDefault();
        if (data.ctrlKey || data.metaKey) {
          // 旋转
          this.cropAreaManager.setRotation(
            this.cropAreaManager.getCropData().rotation + rotateStep
          );
        } else {
          // 移动
          this.cropAreaManager.moveCropArea(moveStep, 0);
        }
        break;
      case '=':
      case '+':
        if (data.ctrlKey || data.metaKey) {
          data.originalEvent.preventDefault();
          // 放大
          this.cropAreaManager.setScale(
            this.cropAreaManager.getCropData().scale + scaleStep
          );
        }
        break;
      case '-':
        if (data.ctrlKey || data.metaKey) {
          data.originalEvent.preventDefault();
          // 缩小
          this.cropAreaManager.setScale(
            this.cropAreaManager.getCropData().scale - scaleStep
          );
        }
        break;
      case 'r':
        if (data.ctrlKey || data.metaKey) {
          data.originalEvent.preventDefault();
          // 重置
          this.cropAreaManager.reset();
        }
        break;
      case 'h':
        if (data.ctrlKey || data.metaKey) {
          data.originalEvent.preventDefault();
          // 水平翻转
          this.cropAreaManager.setFlip(
            !this.cropAreaManager.getCropData().flip.horizontal,
            this.cropAreaManager.getCropData().flip.vertical
          );
        }
        break;
      case 'v':
        if (data.ctrlKey || data.metaKey) {
          data.originalEvent.preventDefault();
          // 垂直翻转
          this.cropAreaManager.setFlip(
            this.cropAreaManager.getCropData().flip.horizontal,
            !this.cropAreaManager.getCropData().flip.vertical
          );
        }
        break;
    }

    // 触发变化事件
    this.emit('cropChange', {
      type: 'cropChange',
      cropData: this.cropAreaManager.getCropData(),
      originalEvent: data.originalEvent
    });
  }

  /**
   * 检测操作类型
   */
  private detectOperation(point: Point): OperationType | null {
    // 检查控制点
    const controlPoint = this.cropAreaManager.hitTestControlPoint(point);
    
    if (controlPoint) {
      if (controlPoint === 'rotate') {
        return 'rotate';
      } else {
        return `resize-${controlPoint}` as OperationType;
      }
    }

    // 检查是否在裁剪区域内
    if (this.cropAreaManager.isPointInCropArea(point)) {
      return 'move';
    }

    return null;
  }

  /**
   * 根据操作类型获取状态
   */
  private getStateFromOperation(operation: OperationType): InteractionState {
    if (operation === 'move') {
      return 'dragging';
    } else if (operation.startsWith('resize-')) {
      return 'resizing';
    } else if (operation === 'rotate') {
      return 'rotating';
    } else if (operation === 'scale') {
      return 'scaling';
    }
    return 'idle';
  }

  /**
   * 处理移动操作
   */
  private handleMove(deltaX: number, deltaY: number): void {
    const newArea = {
      x: this.startCropArea.x + deltaX,
      y: this.startCropArea.y + deltaY,
      width: this.startCropArea.width,
      height: this.startCropArea.height
    };
    
    this.cropAreaManager.setCropArea(newArea);
  }

  /**
   * 处理调整大小操作
   */
  private handleResize(deltaX: number, deltaY: number, operation: OperationType): void {
    const anchor = operation.replace('resize-', '') as any;
    this.cropAreaManager.resizeCropArea(deltaX, deltaY, anchor);
  }

  /**
   * 处理旋转操作
   */
  private handleRotate(currentPoint: Point): void {
    const cropArea = this.cropAreaManager.getCropArea();
    const center = {
      x: cropArea.x + cropArea.width / 2,
      y: cropArea.y + cropArea.height / 2
    };

    // 计算角度
    const startAngle = Math.atan2(
      this.startPoint.y - center.y,
      this.startPoint.x - center.x
    );
    
    const currentAngle = Math.atan2(
      currentPoint.y - center.y,
      currentPoint.x - center.x
    );

    const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
    const newRotation = this.startRotation + deltaAngle;

    this.cropAreaManager.setRotation(newRotation);
  }

  /**
   * 设置状态
   */
  private setState(state: InteractionState): void {
    this.state = state;
    
    // 更新光标样式
    this.updateCursor();
  }

  /**
   * 更新光标样式
   */
  private updateCursor(): void {
    const element = this.eventHandler['element'];
    
    switch (this.state) {
      case 'dragging':
        element.style.cursor = 'move';
        break;
      case 'resizing':
        element.style.cursor = this.getResizeCursor();
        break;
      case 'rotating':
        element.style.cursor = 'grab';
        break;
      case 'scaling':
        element.style.cursor = 'zoom-in';
        break;
      default:
        element.style.cursor = 'default';
        break;
    }
  }

  /**
   * 获取调整大小的光标样式
   */
  private getResizeCursor(): string {
    if (!this.currentOperation) return 'default';
    
    const cursorMap: Record<string, string> = {
      'resize-nw': 'nw-resize',
      'resize-n': 'n-resize',
      'resize-ne': 'ne-resize',
      'resize-e': 'e-resize',
      'resize-se': 'se-resize',
      'resize-s': 's-resize',
      'resize-sw': 'sw-resize',
      'resize-w': 'w-resize'
    };
    
    return cursorMap[this.currentOperation] || 'default';
  }

  /**
   * 启用交互
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * 禁用交互
   */
  disable(): void {
    this.isEnabled = false;
    this.setState('idle');
    this.currentOperation = null;
  }

  /**
   * 检查是否启用
   */
  isInteractionEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 获取当前状态
   */
  getState(): InteractionState {
    return this.state;
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.eventHandler.destroy();
    this.removeAllListeners();
  }
}

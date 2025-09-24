/**
 * 裁剪器选择组件
 * 负责选择区域的管理，处理裁剪区域的移动、调整大小等操作
 */

import CropperElement from './cropper-element';
import type CropperCanvas from './cropper-canvas';
import type CropperImage from './cropper-image';
import {
  ACTION_MOVE,
  ACTION_RESIZE_EAST,
  ACTION_RESIZE_NORTH,
  ACTION_RESIZE_NORTHEAST,
  ACTION_RESIZE_NORTHWEST,
  ACTION_RESIZE_SOUTH,
  ACTION_RESIZE_SOUTHEAST,
  ACTION_RESIZE_SOUTHWEST,
  ACTION_RESIZE_WEST,
  ACTION_SCALE,
  ACTION_SELECT,
  CROPPER_CANVAS,
  CROPPER_SELECTION,
  EVENT_ACTION,
  EVENT_ACTION_END,
  EVENT_ACTION_START,
  EVENT_CHANGE,
  EVENT_KEYDOWN,
  getAdjustedSizes,
  getOffset,
  isFunction,
  isNumber,
  isPositiveNumber,
  off,
  on,
} from '../utils';
import selectionStyle from './selection-style';

// 缓存画布引用
const canvasCache = new WeakMap();

// 选择区域接口
export interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 裁剪器选择组件
 * 处理选择区域的管理和操作
 */
export default class CropperSelection extends CropperElement {
  /** 元素名称 */
  static $name = CROPPER_SELECTION;

  /** 版本号 */
  static $version = '1.0.0';

  /** 事件监听器 */
  protected $onCanvasAction: EventListener | null = null;
  protected $onCanvasActionStart: EventListener | null = null;
  protected $onCanvasActionEnd: EventListener | null = null;
  protected $onDocumentKeyDown: EventListener | null = null;

  /** 当前动作 */
  protected $action = '';

  /** 动作开始目标 */
  protected $actionStartTarget: EventTarget | null = null;

  /** 是否正在改变 */
  protected $changing = false;

  /** 元素样式 */
  protected $style = selectionStyle;

  /** 初始选择区域 */
  private $initialSelection = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  // 位置和尺寸属性
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  // 配置属性
  aspectRatio = NaN;
  initialAspectRatio = NaN;
  initialCoverage = NaN;
  active = false;
  dynamic = false;
  movable = false;
  resizable = false;
  zoomable = false;
  multiple = false;
  keyboard = false;
  outlined = false;
  precise = false;

  /** 设置画布引用 */
  protected set $canvas(element: CropperCanvas) {
    canvasCache.set(this, element);
  }

  /** 获取画布引用 */
  protected get $canvas(): CropperCanvas {
    return canvasCache.get(this);
  }

  /** 观察的属性列表 */
  protected static get observedAttributes(): string[] {
    return super.observedAttributes.concat([
      'active',
      'aspect-ratio',
      'dynamic',
      'height',
      'initial-aspect-ratio',
      'initial-coverage',
      'keyboard',
      'movable',
      'multiple',
      'outlined',
      'precise',
      'resizable',
      'width',
      'x',
      'y',
      'zoomable',
    ]);
  }

  /** 属性变化回调 */
  protected $propertyChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
    if (Object.is(newValue, oldValue)) {
      return;
    }

    super.$propertyChangedCallback(name, oldValue, newValue);

    switch (name) {
      case 'x':
      case 'y':
      case 'width':
      case 'height':
        if (!this.$changing) {
          this.$nextTick(() => {
            this.$change(this.x, this.y, this.width, this.height, this.aspectRatio, true);
          });
        }
        break;

      case 'aspectRatio':
      case 'initialAspectRatio':
        this.$nextTick(() => {
          this.$initSelection();
        });
        break;

      case 'initialCoverage':
        this.$nextTick(() => {
          if (isPositiveNumber(newValue) && newValue <= 1) {
            this.$initSelection(true, true);
          }
        });
        break;

      case 'keyboard':
        this.$nextTick(() => {
          if (this.$canvas) {
            if (newValue) {
              if (!this.$onDocumentKeyDown) {
                this.$onDocumentKeyDown = this.$handleKeyDown.bind(this);
                on(this.ownerDocument, EVENT_KEYDOWN, this.$onDocumentKeyDown);
              }
            } else if (this.$onDocumentKeyDown) {
              off(this.ownerDocument, EVENT_KEYDOWN, this.$onDocumentKeyDown);
              this.$onDocumentKeyDown = null;
            }
          }
        });
        break;

      case 'precise':
        this.$nextTick(() => {
          this.$change(this.x, this.y);
        });
        break;

      default:
    }
  }

  /** 连接到 DOM 时的回调 */
  protected connectedCallback(): void {
    super.connectedCallback();

    const $canvas: CropperCanvas | null = this.closest(this.$getTagNameOf(CROPPER_CANVAS));

    if ($canvas) {
      this.$canvas = $canvas;
      this.$setStyles({
        position: 'absolute',
        transform: `translate(${this.x}px, ${this.y}px)`,
      });

      if (!this.hidden) {
        this.$render();
      }

      this.$initSelection(true);
      // 初始化遮罩
      this.$updateShade();
      this.$onCanvasActionStart = this.$handleActionStart.bind(this);
      this.$onCanvasActionEnd = this.$handleActionEnd.bind(this);
      this.$onCanvasAction = this.$handleAction.bind(this);
      on($canvas, EVENT_ACTION_START, this.$onCanvasActionStart);
      on($canvas, EVENT_ACTION_END, this.$onCanvasActionEnd);
      on($canvas, EVENT_ACTION, this.$onCanvasAction);
    } else {
      this.$render();
    }
  }

  /** 从 DOM 断开时的回调 */
  protected disconnectedCallback(): void {
    const { $canvas } = this;

    if ($canvas) {
      if (this.$onCanvasActionStart) {
        off($canvas, EVENT_ACTION_START, this.$onCanvasActionStart);
        this.$onCanvasActionStart = null;
      }

      if (this.$onCanvasActionEnd) {
        off($canvas, EVENT_ACTION_END, this.$onCanvasActionEnd);
        this.$onCanvasActionEnd = null;
      }

      if (this.$onCanvasAction) {
        off($canvas, EVENT_ACTION, this.$onCanvasAction);
        this.$onCanvasAction = null;
      }
    }

    super.disconnectedCallback();
  }

  /** 初始化选择区域 */
  protected $initSelection(center = false, resize = false) {
    const { initialCoverage, parentElement } = this;

    if (isPositiveNumber(initialCoverage) && parentElement) {
      const aspectRatio = this.aspectRatio || this.initialAspectRatio;
      let width = (resize ? 0 : this.width) || parentElement.offsetWidth * initialCoverage;
      let height = (resize ? 0 : this.height) || parentElement.offsetHeight * initialCoverage;

      if (isPositiveNumber(aspectRatio)) {
        ({ width, height } = getAdjustedSizes({ aspectRatio, width, height }));
      }

      this.$change(this.x, this.y, width, height);

      if (center) {
        this.$center();
      }

      // 覆盖初始位置和尺寸
      this.$initialSelection = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      };
    }
  }

  /** 处理动作开始事件 */
  protected $handleActionStart(event: Event): void {
    const relatedTarget = (event as CustomEvent).detail?.relatedEvent?.target;

    this.$action = '';
    this.$actionStartTarget = relatedTarget;

    if (
      !this.hidden
      && this.multiple
      && !this.active
      && relatedTarget === this
      && this.parentElement
    ) {
      this.active = true;
      this.$emit(EVENT_CHANGE, {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      });
    }
  }

  /** 处理动作事件 */
  protected $handleAction(event: Event): void {
    const { currentTarget, detail } = event as CustomEvent;

    if (!currentTarget || !detail) {
      return;
    }

    const { relatedEvent } = detail;
    let { action } = detail;

    // 切换到另一个选择区域
    if (!action && this.multiple) {
      action = this.$action || relatedEvent?.target.action;
      this.$action = action;
    }

    if (!action
      || (this.hidden && action !== ACTION_SELECT)
      || (this.multiple && !this.active && action !== ACTION_SCALE)) {
      return;
    }

    const { width, height } = this;
    let moveX = detail.endX - detail.startX;
    let moveY = detail.endY - detail.startY;
    let { aspectRatio } = this;

    // 通过按住 shift 键锁定宽高比
    if (!isPositiveNumber(aspectRatio) && relatedEvent.shiftKey) {
      aspectRatio = isPositiveNumber(width) && isPositiveNumber(height) ? width / height : 1;
    }

    switch (action) {
      case ACTION_SELECT:
        if (moveX !== 0 || moveY !== 0) {
          // 强制创建正方形选择以获得更好的用户体验
          if (moveX === 0) {
            moveX = moveY;
          } else if (moveY === 0) {
            moveY = moveX;
          }

          const offset = getOffset(currentTarget as Element);

          this.$change(
            detail.startX - offset.left,
            detail.startY - offset.top,
            Math.abs(moveX),
            Math.abs(moveY),
            aspectRatio,
          );
        }
        break;

      case ACTION_MOVE:
        if (this.movable && (
          this.dynamic
          || (this.$actionStartTarget && this.contains(this.$actionStartTarget as Node))
        )) {
          this.$move(moveX, moveY);
        }
        break;

      case ACTION_SCALE:
        if (relatedEvent && this.zoomable && (
          this.dynamic
          || this.contains(relatedEvent.target as Node)
        )) {
          const offset = getOffset(currentTarget as Element);

          this.$zoom(
            detail.scale,
            relatedEvent.pageX - offset.left,
            relatedEvent.pageY - offset.top,
          );
        }
        break;

      default:
        this.$resize(action, moveX, moveY, aspectRatio);
    }
  }

  /** 处理动作结束事件 */
  protected $handleActionEnd(): void {
    this.$action = '';
    this.$actionStartTarget = null;
  }

  /** 处理键盘事件 */
  protected $handleKeyDown(event: Event): void {
    if (
      this.hidden
      || !this.keyboard
      || (this.multiple && !this.active)
      || event.defaultPrevented
    ) {
      return;
    }

    const { activeElement } = document;

    // 在输入内容时禁用键盘控制
    if (activeElement && (
      ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)
      || ['true', 'plaintext-only'].includes((activeElement as HTMLElement).contentEditable)
    )) {
      return;
    }

    switch ((event as KeyboardEvent).key) {
      case 'Delete':
        event.preventDefault();
        this.$clear();
        break;

      // 向左移动
      case 'ArrowLeft':
        event.preventDefault();
        this.$move(-1, 0);
        break;

      // 向右移动
      case 'ArrowRight':
        event.preventDefault();
        this.$move(1, 0);
        break;

      // 向上移动
      case 'ArrowUp':
        event.preventDefault();
        this.$move(0, -1);
        break;

      // 向下移动
      case 'ArrowDown':
        event.preventDefault();
        this.$move(0, 1);
        break;

      case '+':
        event.preventDefault();
        this.$zoom(0.1);
        break;

      case '-':
        event.preventDefault();
        this.$zoom(-0.1);
        break;

      default:
    }
  }

  /**
   * 将选择区域对齐到其父元素的中心
   * @returns 返回 this 以便链式调用
   */
  $center(): this {
    const { parentElement } = this;

    if (!parentElement) {
      return this;
    }

    const x = (parentElement.offsetWidth - this.width) / 2;
    const y = (parentElement.offsetHeight - this.height) / 2;

    return this.$change(x, y);
  }

  /**
   * 移动选择区域
   * @param x 水平方向的移动距离
   * @param y 垂直方向的移动距离
   * @returns 返回 this 以便链式调用
   */
  $move(x: number, y: number = x): this {
    return this.$moveTo(this.x + x, this.y + y);
  }

  /**
   * 将选择区域移动到特定位置
   * @param x 水平方向的新位置
   * @param y 垂直方向的新位置
   * @returns 返回 this 以便链式调用
   */
  $moveTo(x: number, y: number = x): this {
    if (!this.movable) {
      return this;
    }

    return this.$change(x, y);
  }

  /**
   * 调整选择区域在特定边或角的尺寸
   * @param action 指示要调整尺寸的边或角
   * @param offsetX 特定边或角的水平偏移
   * @param offsetY 特定边或角的垂直偏移
   * @param aspectRatio 计算新尺寸时的宽高比（如果需要）
   * @returns 返回 this 以便链式调用
   */
  $resize(
    action: string,
    offsetX = 0,
    offsetY = 0,
    aspectRatio: number = this.aspectRatio,
  ): this {
    if (!this.resizable) {
      return this;
    }

    const hasValidAspectRatio = isPositiveNumber(aspectRatio);
    let {
      x,
      y,
      width,
      height,
    } = this;

    // 简化的调整尺寸逻辑（仅处理基本情况）
    switch (action) {
      case ACTION_RESIZE_EAST:
        width += offsetX;
        if (hasValidAspectRatio) {
          height = width / aspectRatio;
        }
        break;

      case ACTION_RESIZE_WEST:
        x += offsetX;
        width -= offsetX;
        if (hasValidAspectRatio) {
          height = width / aspectRatio;
        }
        break;

      case ACTION_RESIZE_SOUTH:
        height += offsetY;
        if (hasValidAspectRatio) {
          width = height * aspectRatio;
        }
        break;

      case ACTION_RESIZE_NORTH:
        y += offsetY;
        height -= offsetY;
        if (hasValidAspectRatio) {
          width = height * aspectRatio;
        }
        break;

      case ACTION_RESIZE_SOUTHEAST:
        width += offsetX;
        height += offsetY;
        if (hasValidAspectRatio) {
          if (Math.abs(offsetX) > Math.abs(offsetY)) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }
        }
        break;

      case ACTION_RESIZE_SOUTHWEST:
        x += offsetX;
        width -= offsetX;
        height += offsetY;
        if (hasValidAspectRatio) {
          if (Math.abs(offsetX) > Math.abs(offsetY)) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }
        }
        break;

      case ACTION_RESIZE_NORTHEAST:
        y += offsetY;
        height -= offsetY;
        width += offsetX;
        if (hasValidAspectRatio) {
          if (Math.abs(offsetX) > Math.abs(offsetY)) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }
        }
        break;

      case ACTION_RESIZE_NORTHWEST:
        x += offsetX;
        y += offsetY;
        width -= offsetX;
        height -= offsetY;
        if (hasValidAspectRatio) {
          if (Math.abs(offsetX) > Math.abs(offsetY)) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }
        }
        break;

      default:
        // 其他调整尺寸的情况可以在这里添加
        break;
    }

    return this.$change(x, y, Math.max(0, width), Math.max(0, height));
  }

  /**
   * 缩放选择区域
   * @param scale 缩放因子。正数为放大，负数为缩小
   * @param x 水平方向的缩放原点，默认为选择区域中心
   * @param y 垂直方向的缩放原点，默认为选择区域中心
   * @returns 返回 this 以便链式调用
   */
  $zoom(scale: number, x?: number, y?: number): this {
    if (!this.zoomable || scale === 0) {
      return this;
    }

    if (scale < 0) {
      scale = 1 / (1 - scale);
    } else {
      scale += 1;
    }

    const { width, height } = this;
    const newWidth = width * scale;
    const newHeight = height * scale;
    let newX = this.x;
    let newY = this.y;

    if (isNumber(x) && isNumber(y)) {
      newX -= (newWidth - width) * ((x - this.x) / width);
      newY -= (newHeight - height) * ((y - this.y) / height);
    } else {
      // 从选择区域中心缩放
      newX -= (newWidth - width) / 2;
      newY -= (newHeight - height) / 2;
    }

    return this.$change(newX, newY, newWidth, newHeight);
  }

  /**
   * 更改选择区域的位置和/或尺寸
   * @param x 水平方向的新位置
   * @param y 垂直方向的新位置
   * @param width 新宽度
   * @param height 新高度
   * @param aspectRatio 仅用于此更改的新宽高比
   * @param _force 强制更改
   * @returns 返回 this 以便链式调用
   */
  $change(
    x: number,
    y: number,
    width: number = this.width,
    height: number = this.height,
    aspectRatio: number = this.aspectRatio,
    _force = false,
  ): this {
    if (
      this.$changing
      || !isNumber(x)
      || !isNumber(y)
      || !isNumber(width)
      || !isNumber(height)
      || width < 0
      || height < 0
    ) {
      return this;
    }

    if (isPositiveNumber(aspectRatio)) {
      ({ width, height } = getAdjustedSizes({ aspectRatio, width, height }, 'cover'));
    }

    // 边界约束：确保选区不超出图像范围
    if (this.$canvas) {
      const image = this.$canvas.querySelector('cropper-image');
      if (image) {
        const imageRect = image.getBoundingClientRect();
        const canvasRect = this.$canvas.getBoundingClientRect();
        
        // 图像相对于canvas的位置
        const imgLeft = imageRect.left - canvasRect.left;
        const imgTop = imageRect.top - canvasRect.top;
        const imgRight = imgLeft + imageRect.width;
        const imgBottom = imgTop + imageRect.height;

        // 约束选区在图像范围内
        x = Math.max(imgLeft, Math.min(x, imgRight - width));
        y = Math.max(imgTop, Math.min(y, imgBottom - height));
        width = Math.min(width, imgRight - x);
        height = Math.min(height, imgBottom - y);
      }
    }

    if (!this.precise) {
      x = Math.round(x);
      y = Math.round(y);
      width = Math.round(width);
      height = Math.round(height);
    }

    if (
      x === this.x
      && y === this.y
      && width === this.width
      && height === this.height
      && Object.is(aspectRatio, this.aspectRatio)
      && !_force
    ) {
      return this;
    }

    if (this.hidden) {
      this.hidden = false;
    }

    if (this.$emit(EVENT_CHANGE, {
      x,
      y,
      width,
      height,
    }) === false) {
      return this;
    }

    this.$changing = true;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.$changing = false;

    return this.$render();
  }

  /**
   * 将选择区域重置为其初始位置和尺寸
   * @returns 返回 this 以便链式调用
   */
  $reset(): this {
    const {
      x,
      y,
      width,
      height,
    } = this.$initialSelection;

    return this.$change(x, y, width, height);
  }

  /**
   * 清除选择区域
   * @returns 返回 this 以便链式调用
   */
  $clear(): this {
    this.$change(0, 0, 0, 0, NaN, true);
    this.hidden = true;
    // 清除遮罩
    if (this.$canvas) {
      const shade = this.$canvas.querySelector('cropper-shade');
      if (shade) {
        (shade as any).style.clipPath = 'none';
      }
    }
    return this;
  }

  /**
   * 刷新选择区域的位置或尺寸
   * @returns 返回 this 以便链式调用
   */
  $render(): this {
    this.$setStyles({
      transform: `translate(${this.x}px, ${this.y}px)`,
      width: this.width,
      height: this.height,
    });

    // 更新遮罩层
    this.$updateShade();

    return this;
  }

  /**
   * 更新遮罩层以覆盖选区外部
   */
  protected $updateShade(): void {
    if (!this.$canvas) return;

    const shade = this.$canvas.querySelector('cropper-shade');
    if (!shade) return;

    // 获取canvas的尺寸
    const canvasRect = this.$canvas.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    // 使用 clip-path 创建一个挖空选区的遮罩
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    // 创建一个外矩形减去内矩形的路径
    const clipPath = `polygon(
      0 0,
      ${canvasWidth}px 0,
      ${canvasWidth}px ${canvasHeight}px,
      0 ${canvasHeight}px,
      0 0,
      ${x}px ${y}px,
      ${x}px ${y + h}px,
      ${x + w}px ${y + h}px,
      ${x + w}px ${y}px,
      ${x}px ${y}px
    )`;

    (shade as any).style.clipPath = clipPath;
    (shade as any).style.position = 'absolute';
    (shade as any).style.top = '0';
    (shade as any).style.left = '0';
    (shade as any).style.width = '100%';
    (shade as any).style.height = '100%';
    (shade as any).style.pointerEvents = 'none';
  }

  /**
   * 将选择区域转换为画布
   * @param options 选项
   * @returns 返回 Promise<HTMLCanvasElement>
   */
  $toCanvas(options?: {
    width?: number;
    height?: number;
    beforeDraw?: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
  }): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      try {
        const { $canvas } = this;
        if (!$canvas) {
          reject(new Error('未找到画布元素'));
          return;
        }

        // 查找图片元素
        const cropperImage = $canvas.querySelector('cropper-image') as CropperImage;
        if (!cropperImage) {
          reject(new Error('未找到图片组件'));
          return;
        }

        const imageElement = cropperImage.$image;
        if (!imageElement || !imageElement.complete) {
          reject(new Error('图片未加载完成'));
          return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('无法创建画布上下文'));
          return;
        }

        // 设置画布尺寸
        const width = options?.width || this.width;
        const height = options?.height || this.height;
        canvas.width = width;
        canvas.height = height;

        // 调用前置绘制回调
        if (options?.beforeDraw) {
          options.beforeDraw(context, canvas);
        }

        // 计算源图片的裁剪区域
        const imageRect = imageElement.getBoundingClientRect();
        const canvasRect = $canvas.getBoundingClientRect();

        // 计算相对于图片的裁剪区域
        const scaleX = imageElement.naturalWidth / imageRect.width;
        const scaleY = imageElement.naturalHeight / imageRect.height;

        const sourceX = (this.x - (imageRect.left - canvasRect.left)) * scaleX;
        const sourceY = (this.y - (imageRect.top - canvasRect.top)) * scaleY;
        const sourceWidth = this.width * scaleX;
        const sourceHeight = this.height * scaleY;

        // 绘制裁剪后的图片
        context.drawImage(
          imageElement,
          Math.max(0, sourceX),
          Math.max(0, sourceY),
          Math.min(sourceWidth, imageElement.naturalWidth - sourceX),
          Math.min(sourceHeight, imageElement.naturalHeight - sourceY),
          0,
          0,
          width,
          height
        );

        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    });
  }
}

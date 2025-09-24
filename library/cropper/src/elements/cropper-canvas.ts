/**
 * 裁剪器画布组件
 * 负责画布的渲染和管理，处理用户交互（鼠标、触摸、滚轮）
 */

import CropperElement from './cropper-element';
import {
  ACTION_NONE,
  ACTION_ROTATE,
  ACTION_SCALE,
  ACTION_TRANSFORM,
  ATTRIBUTE_ACTION,
  CROPPER_CANVAS,
  CROPPER_IMAGE,
  EVENT_ACTION,
  EVENT_ACTION_END,
  EVENT_ACTION_MOVE,
  EVENT_ACTION_START,
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP,
  EVENT_WHEEL,
  getAdjustedSizes,
  isElement,
  isFunction,
  isNumber,
  isPlainObject,
  isPositiveNumber,
  isString,
  off,
  on,
} from '../utils';
import canvasStyle from './canvas-style';

// 动作事件数据接口
interface ActionEventData {
  action: string;
  relatedEvent: Event;
  scale?: number;
  rotate?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  centerX?: number;
  centerY?: number;
}

/**
 * 裁剪器画布组件
 * 处理用户交互和画布渲染
 */
export default class CropperCanvas extends CropperElement {
  /** 元素名称 */
  static $name = CROPPER_CANVAS;

  /** 版本号 */
  static $version = '1.0.0';

  /** 事件监听器 */
  protected $onPointerDown: EventListener | null = null;
  protected $onPointerMove: EventListener | null = null;
  protected $onPointerUp: EventListener | null = null;
  protected $onWheel: EventListener | null = null;

  /** 滚轮状态 */
  protected $wheeling = false;

  /** 指针映射 */
  protected readonly $pointers: Map<number, any> = new Map();

  /** 元素样式 */
  protected $style = canvasStyle;

  /** 当前动作 */
  protected $action = ACTION_NONE;

  /** 是否显示背景网格 */
  background = false;

  /** 是否禁用 */
  disabled = false;

  /** 缩放步长 */
  scaleStep = 0.1;

  /** 主题色 */
  themeColor = '#722ED1';

  /** 观察的属性列表 */
  protected static get observedAttributes(): string[] {
    return super.observedAttributes.concat([
      'background',
      'disabled',
      'scale-step',
    ]);
  }

  /** 连接到 DOM 时的回调 */
  protected connectedCallback(): void {
    super.connectedCallback();

    if (!this.disabled) {
      this.$bind();
    }
  }

  /** 从 DOM 断开时的回调 */
  protected disconnectedCallback(): void {
    if (!this.disabled) {
      this.$unbind();
    }

    super.disconnectedCallback();
  }

  /** 属性变化回调 */
  protected $propertyChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
    if (Object.is(newValue, oldValue)) {
      return;
    }

    super.$propertyChangedCallback(name, oldValue, newValue);

    switch (name) {
      case 'disabled':
        if (newValue) {
          this.$unbind();
        } else {
          this.$bind();
        }
        break;

      default:
    }
  }

  /** 绑定事件监听器 */
  protected $bind(): void {
    if (!this.$onPointerDown) {
      this.$onPointerDown = this.$handlePointerDown.bind(this);
      on(this, EVENT_POINTER_DOWN, this.$onPointerDown);
    }

    if (!this.$onPointerMove) {
      this.$onPointerMove = this.$handlePointerMove.bind(this);
      on(this.ownerDocument, EVENT_POINTER_MOVE, this.$onPointerMove);
    }

    if (!this.$onPointerUp) {
      this.$onPointerUp = this.$handlePointerUp.bind(this);
      on(this.ownerDocument, EVENT_POINTER_UP, this.$onPointerUp);
    }

    if (!this.$onWheel) {
      this.$onWheel = this.$handleWheel.bind(this);
      on(this, EVENT_WHEEL, this.$onWheel, {
        passive: false,
        capture: true,
      });
    }
  }

  /** 解绑事件监听器 */
  protected $unbind(): void {
    if (this.$onPointerDown) {
      off(this, EVENT_POINTER_DOWN, this.$onPointerDown);
      this.$onPointerDown = null;
    }

    if (this.$onPointerMove) {
      off(this.ownerDocument, EVENT_POINTER_MOVE, this.$onPointerMove);
      this.$onPointerMove = null;
    }

    if (this.$onPointerUp) {
      off(this.ownerDocument, EVENT_POINTER_UP, this.$onPointerUp);
      this.$onPointerUp = null;
    }

    if (this.$onWheel) {
      off(this, EVENT_WHEEL, this.$onWheel, {
        capture: true,
      });
      this.$onWheel = null;
    }
  }

  /** 处理指针按下事件 */
  protected $handlePointerDown(event: Event): void {
    const { buttons, button, type } = event as PointerEvent;

    // 检查是否应该忽略此事件
    if (this.disabled || (
      // 处理指针或鼠标事件，忽略触摸事件
      ((type === 'pointerdown' && (event as PointerEvent).pointerType === 'mouse') || type === 'mousedown') && (
        // 非主按钮（通常是左键）
        (isNumber(buttons) && buttons !== 1) || (isNumber(button) && button !== 0)

        // 打开上下文菜单
        || (event as PointerEvent).ctrlKey
      ))
    ) {
      return;
    }

    const { $pointers } = this;
    let action = '';

    // 处理触摸事件
    if ((event as TouchEvent).changedTouches) {
      Array.from((event as TouchEvent).changedTouches).forEach(({
        identifier,
        pageX,
        pageY,
      }) => {
        $pointers.set(identifier, {
          startX: pageX,
          startY: pageY,
          endX: pageX,
          endY: pageY,
        });
      });
    } else {
      // 处理指针/鼠标事件
      const { pointerId = 0, pageX, pageY } = (event as PointerEvent);

      $pointers.set(pointerId, {
        startX: pageX,
        startY: pageY,
        endX: pageX,
        endY: pageY,
      });
    }

    // 确定动作类型
    if ($pointers.size > 1) {
      action = ACTION_TRANSFORM;
    } else if (isElement(event.target)) {
      action = (event.target as any).action || event.target.getAttribute(ATTRIBUTE_ACTION) || '';
    }

    // 派发动作开始事件
    if (this.$emit(EVENT_ACTION_START, {
      action,
      relatedEvent: event,
    }) === false) {
      return;
    }

    // 阻止页面缩放（iOS 浏览器）
    event.preventDefault();
    this.$action = action;
    this.style.willChange = 'transform';
  }

  /** 处理指针移动事件 */
  protected $handlePointerMove(event: Event): void {
    const { $action, $pointers } = this;

    if (this.disabled || $action === ACTION_NONE || $pointers.size === 0) {
      return;
    }

    if (this.$emit(EVENT_ACTION_MOVE, {
      action: $action,
      relatedEvent: event,
    }) === false) {
      return;
    }

    // 阻止页面滚动
    event.preventDefault();

    // 更新指针位置
    if ((event as TouchEvent).changedTouches) {
      Array.from((event as TouchEvent).changedTouches).forEach(({
        identifier,
        pageX,
        pageY,
      }) => {
        const pointer = $pointers.get(identifier);

        if (pointer) {
          Object.assign(pointer, {
            endX: pageX,
            endY: pageY,
          });
        }
      });
    } else {
      const { pointerId = 0, pageX, pageY } = (event as PointerEvent);
      const pointer = $pointers.get(pointerId);

      if (pointer) {
        Object.assign(pointer, {
          endX: pageX,
          endY: pageY,
        });
      }
    }

    const detail: ActionEventData = {
      action: $action,
      relatedEvent: event,
    };

    // 处理变换动作（多点触控）
    if ($action === ACTION_TRANSFORM) {
      const pointers2 = new Map($pointers);
      let maxRotateRate = 0;
      let maxScaleRate = 0;
      let rotate = 0;
      let scale = 0;
      let centerX = (event as PointerEvent).pageX;
      let centerY = (event as PointerEvent).pageY;

      // 计算旋转和缩放
      $pointers.forEach((pointer, pointerId) => {
        pointers2.delete(pointerId);
        pointers2.forEach((pointer2) => {
          let x1 = pointer2.startX - pointer.startX;
          let y1 = pointer2.startY - pointer.startY;
          let x2 = pointer2.endX - pointer.endX;
          let y2 = pointer2.endY - pointer.endY;
          let z1 = 0;
          let z2 = 0;
          let a1 = 0;
          let a2 = 0;

          // 计算角度
          if (x1 === 0) {
            if (y1 < 0) {
              a1 = Math.PI * 2;
            } else if (y1 > 0) {
              a1 = Math.PI;
            }
          } else if (x1 > 0) {
            a1 = (Math.PI / 2) + Math.atan(y1 / x1);
          } else if (x1 < 0) {
            a1 = (Math.PI * 1.5) + Math.atan(y1 / x1);
          }

          if (x2 === 0) {
            if (y2 < 0) {
              a2 = Math.PI * 2;
            } else if (y2 > 0) {
              a2 = Math.PI;
            }
          } else if (x2 > 0) {
            a2 = (Math.PI / 2) + Math.atan(y2 / x2);
          } else if (x2 < 0) {
            a2 = (Math.PI * 1.5) + Math.atan(y2 / x2);
          }

          // 计算旋转率
          if (a2 > 0 || a1 > 0) {
            const rotateRate = a2 - a1;
            const absRotateRate = Math.abs(rotateRate);

            if (absRotateRate > maxRotateRate) {
              maxRotateRate = absRotateRate;
              rotate = rotateRate;
              centerX = (pointer.startX + pointer2.startX) / 2;
              centerY = (pointer.startY + pointer2.startY) / 2;
            }
          }

          // 计算距离
          x1 = Math.abs(x1);
          y1 = Math.abs(y1);
          x2 = Math.abs(x2);
          y2 = Math.abs(y2);

          if (x1 > 0 && y1 > 0) {
            z1 = Math.sqrt((x1 * x1) + (y1 * y1));
          } else if (x1 > 0) {
            z1 = x1;
          } else if (y1 > 0) {
            z1 = y1;
          }

          if (x2 > 0 && y2 > 0) {
            z2 = Math.sqrt((x2 * x2) + (y2 * y2));
          } else if (x2 > 0) {
            z2 = x2;
          } else if (y2 > 0) {
            z2 = y2;
          }

          // 计算缩放率
          if (z1 > 0 && z2 > 0) {
            const scaleRate = (z2 - z1) / z1;
            const absScaleRate = Math.abs(scaleRate);

            if (absScaleRate > maxScaleRate) {
              maxScaleRate = absScaleRate;
              scale = scaleRate;
              centerX = (pointer.startX + pointer2.startX) / 2;
              centerY = (pointer.startY + pointer2.startY) / 2;
            }
          }
        });
      });

      const rotatable = maxRotateRate > 0;
      const scalable = maxScaleRate > 0;

      // 设置详细信息
      if (rotatable && scalable) {
        detail.rotate = rotate;
        detail.scale = scale;
        detail.centerX = centerX;
        detail.centerY = centerY;
      } else if (rotatable) {
        detail.action = ACTION_ROTATE;
        detail.rotate = rotate;
        detail.centerX = centerX;
        detail.centerY = centerY;
      } else if (scalable) {
        detail.action = ACTION_SCALE;
        detail.scale = scale;
        detail.centerX = centerX;
        detail.centerY = centerY;
      } else {
        detail.action = ACTION_NONE;
      }
    } else {
      // 单点触控
      const [pointer] = Array.from($pointers.values());

      Object.assign(detail, pointer);
    }

    // 重置起始坐标
    $pointers.forEach((pointer) => {
      pointer.startX = pointer.endX;
      pointer.startY = pointer.endY;
    });

    if (detail.action !== ACTION_NONE) {
      this.$emit(EVENT_ACTION, detail, {
        cancelable: false,
      });
    }
  }

  /** 处理指针抬起事件 */
  protected $handlePointerUp(event: Event): void {
    const { $action, $pointers } = this;

    if (this.disabled || $action === ACTION_NONE) {
      return;
    }

    if (this.$emit(EVENT_ACTION_END, {
      action: $action,
      relatedEvent: event,
    }) === false) {
      return;
    }

    event.preventDefault();

    // 移除指针
    if ((event as TouchEvent).changedTouches) {
      Array.from((event as TouchEvent).changedTouches).forEach(({
        identifier,
      }) => {
        $pointers.delete(identifier);
      });
    } else {
      const { pointerId = 0 } = (event as PointerEvent);

      $pointers.delete(pointerId);
    }

    // 如果没有指针了，重置状态
    if ($pointers.size === 0) {
      this.style.willChange = '';
      this.$action = ACTION_NONE;
    }
  }

  /** 处理滚轮事件 */
  protected $handleWheel(event: Event): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();

    // 限制滚轮速度以防止缩放过快
    if (this.$wheeling) {
      return;
    }

    this.$wheeling = true;

    // 50ms 防抖
    setTimeout(() => {
      this.$wheeling = false;
    }, 50);

    const delta = (event as WheelEvent).deltaY > 0 ? -1 : 1;
    const scale = delta * this.scaleStep;

    this.$emit(EVENT_ACTION, {
      action: ACTION_SCALE,
      scale,
      relatedEvent: event,
    }, {
      cancelable: false,
    });
  }

  /**
   * 更改当前动作为新动作
   * @param action 新动作
   * @returns 返回 this 以便链式调用
   */
  $setAction(action: string): this {
    if (isString(action)) {
      this.$action = action;
    }

    return this;
  }

  /**
   * 生成真实的 canvas 元素，如果有图片则将其绘制到画布上
   * @param options 可用选项
   * @returns 返回解析为生成的 canvas 元素的 Promise
   */
  $toCanvas(options?: {
    width?: number;
    height?: number;
    beforeDraw?: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
  }): Promise<HTMLCanvasElement> {
    return new Promise<HTMLCanvasElement>((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('当前元素未连接到 DOM。'));
        return;
      }

      const canvas = document.createElement('canvas');
      let width = this.offsetWidth;
      let height = this.offsetHeight;
      let scale = 1;

      if (isPlainObject(options)
        && (isPositiveNumber(options.width) || isPositiveNumber(options.height))) {
        ({ width, height } = getAdjustedSizes({
          aspectRatio: width / height,
          width: options.width as number,
          height: options.height as number,
        }));
        scale = width / this.offsetWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const cropperImage: any = this.querySelector(this.$getTagNameOf(CROPPER_IMAGE));

      if (!cropperImage) {
        resolve(canvas);
        return;
      }

      cropperImage.$ready().then((image: HTMLImageElement) => {
        const context = canvas.getContext('2d');

        if (context) {
          const [a, b, c, d, e, f] = cropperImage.$getTransform();
          let newE = e;
          let newF = f;
          let destWidth = image.naturalWidth;
          let destHeight = image.naturalHeight;

          if (scale !== 1) {
            newE *= scale;
            newF *= scale;
            destWidth *= scale;
            destHeight *= scale;
          }

          const centerX = destWidth / 2;
          const centerY = destHeight / 2;

          context.fillStyle = 'transparent';
          context.fillRect(0, 0, width, height);

          if (isPlainObject(options) && isFunction(options.beforeDraw)) {
            options.beforeDraw.call(this, context, canvas);
          }

          context.save();

          // 将变换原点移动到图片中心
          context.translate(centerX, centerY);
          context.transform(a, b, c, d, newE, newF);

          // 将变换原点重置到图片左上角
          context.translate(-centerX, -centerY);
          context.drawImage(image, 0, 0, destWidth, destHeight);
          context.restore();
        }

        resolve(canvas);
      }).catch(reject);
    });
  }
}

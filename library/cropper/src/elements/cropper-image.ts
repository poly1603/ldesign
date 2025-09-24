/**
 * 裁剪器图片组件
 * 负责图片的显示和变换（移动、旋转、缩放、倾斜）
 */

import CropperElement from './cropper-element';
import type CropperCanvas from './cropper-canvas';
import type CropperSelection from './cropper-selection';
import {
  ACTION_MOVE,
  ACTION_NONE,
  ACTION_ROTATE,
  ACTION_SCALE,
  ACTION_TRANSFORM,
  CROPPER_CANVAS,
  CROPPER_IMAGE,
  CROPPER_SELECTION,
  EVENT_ACTION,
  EVENT_ACTION_END,
  EVENT_ACTION_START,
  EVENT_ERROR,
  EVENT_LOAD,
  EVENT_TRANSFORM,
  isFunction,
  isNumber,
  multiplyMatrices,
  off,
  on,
  once,
  toAngleInRadian,
} from '../utils';
import imageStyle from './image-style';

// 缓存画布引用
const canvasCache = new WeakMap();

// 原生属性列表
const NATIVE_ATTRIBUTES = [
  'alt',
  'crossorigin',
  'decoding',
  'elementtiming',
  'fetchpriority',
  'loading',
  'referrerpolicy',
  'sizes',
  'src',
  'srcset',
];

/**
 * 裁剪器图片组件
 * 处理图片的显示和各种变换操作
 */
export default class CropperImage extends CropperElement {
  /** 元素名称 */
  static $name = CROPPER_IMAGE;

  /** 版本号 */
  static $version = '1.0.0';

  /** 变换矩阵 */
  protected $matrix = [1, 0, 0, 1, 0, 0];

  /** 事件监听器 */
  protected $onLoad: EventListener | null = null;
  protected $onCanvasAction: EventListener | null = null;
  protected $onCanvasActionEnd: EventListener | null = null;
  protected $onCanvasActionStart: EventListener | null = null;

  /** 动作开始目标 */
  protected $actionStartTarget: EventTarget | null = null;

  /** 元素样式 */
  protected $style = imageStyle;

  /** 图片元素 */
  readonly $image = new Image();

  /** 初始居中尺寸 */
  initialCenterSize = 'contain';

  /** 是否可旋转 */
  rotatable = false;

  /** 是否可缩放 */
  scalable = false;

  /** 是否可倾斜 */
  skewable = false;

  /** 是否可插槽 */
  slottable = false;

  /** 是否可平移 */
  translatable = false;

  // 原生属性
  alt = '';
  crossorigin = '';
  decoding = '';
  elementtiming = '';
  fetchpriority = '';
  loading = '';
  referrerpolicy = '';
  sizes = '';
  src = '';
  srcset = '';

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
    return super.observedAttributes.concat(NATIVE_ATTRIBUTES, [
      'initial-center-size',
      'rotatable',
      'scalable',
      'skewable',
      'translatable',
    ]);
  }

  /** 属性变化回调 */
  protected attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (Object.is(newValue, oldValue)) {
      return;
    }

    super.attributeChangedCallback(name, oldValue, newValue);

    // 继承原生属性
    if (NATIVE_ATTRIBUTES.includes(name)) {
      this.$image.setAttribute(name, newValue);
    }
  }

  /** 属性变化回调 */
  protected $propertyChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
    if (Object.is(newValue, oldValue)) {
      return;
    }

    super.$propertyChangedCallback(name, oldValue, newValue);

    switch (name) {
      case 'initialCenterSize':
        this.$nextTick(() => {
          this.$center(newValue as string);
        });
        break;

      default:
    }
  }

  /** 连接到 DOM 时的回调 */
  protected connectedCallback(): void {
    super.connectedCallback();

    const { $image } = this;
    const $canvas: CropperCanvas | null = this.closest(this.$getTagNameOf(CROPPER_CANVAS));

    if ($canvas) {
      this.$canvas = $canvas;
      this.$setStyles({
        // 使其成为块元素以避免副作用
        display: 'block',
        position: 'absolute',
      });

      // 绑定画布事件
      this.$onCanvasActionStart = (event: Event | CustomEvent) => {
        this.$actionStartTarget = (event as CustomEvent).detail?.relatedEvent?.target;
      };
      this.$onCanvasActionEnd = () => {
        this.$actionStartTarget = null;
      };
      this.$onCanvasAction = this.$handleAction.bind(this);
      on($canvas, EVENT_ACTION_START, this.$onCanvasActionStart);
      on($canvas, EVENT_ACTION_END, this.$onCanvasActionEnd);
      on($canvas, EVENT_ACTION, this.$onCanvasAction);
    }

    // 绑定图片加载事件
    this.$onLoad = this.$handleLoad.bind(this);
    on($image, EVENT_LOAD, this.$onLoad);
    this.$getShadowRoot().appendChild($image);
  }

  /** 从 DOM 断开时的回调 */
  protected disconnectedCallback(): void {
    const { $image, $canvas } = this;

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

    if ($image && this.$onLoad) {
      off($image, EVENT_LOAD, this.$onLoad);
      this.$onLoad = null;
    }

    this.$getShadowRoot().removeChild($image);
    super.disconnectedCallback();
  }

  /** 处理图片加载事件 */
  protected $handleLoad(): void {
    const { $image } = this;

    this.$setStyles({
      width: $image.naturalWidth,
      height: $image.naturalHeight,
    });

    if (this.$canvas) {
      this.$center(this.initialCenterSize);
    }
  }

  /** 处理动作事件 */
  protected $handleAction(event: Event | CustomEvent): void {
    if (this.hidden || !(this.rotatable || this.scalable || this.translatable)) {
      return;
    }

    const { $canvas } = this;
    const { detail } = event as CustomEvent;

    if (detail) {
      const { relatedEvent } = detail;
      let { action } = detail;

      // 处理变换动作
      if (action === ACTION_TRANSFORM && (!this.rotatable || !this.scalable)) {
        if (this.rotatable) {
          action = ACTION_ROTATE;
        } else if (this.scalable) {
          action = ACTION_SCALE;
        } else {
          action = ACTION_NONE;
        }
      }

      switch (action) {
        case ACTION_MOVE:
          if (this.translatable) {
            let $selection: CropperSelection | null = null;

            if (relatedEvent) {
              $selection = relatedEvent.target.closest(this.$getTagNameOf(CROPPER_SELECTION));
            }

            if (!$selection) {
              $selection = $canvas.querySelector(this.$getTagNameOf(CROPPER_SELECTION));
            }

            if ($selection && $selection.multiple && !$selection.active) {
              $selection = $canvas.querySelector(`${this.$getTagNameOf(CROPPER_SELECTION)}[active]`);
            }

            if (!$selection || $selection.hidden || !$selection.movable || $selection.dynamic
              || !(this.$actionStartTarget && $selection.contains(this.$actionStartTarget as Node))
            ) {
              this.$move(detail.endX - detail.startX, detail.endY - detail.startY);
            }
          }
          break;

        case ACTION_ROTATE:
          if (this.rotatable) {
            if (relatedEvent) {
              const { x, y } = this.getBoundingClientRect();

              this.$rotate(
                detail.rotate,
                relatedEvent.clientX - x,
                relatedEvent.clientY - y,
              );
            } else {
              this.$rotate(detail.rotate);
            }
          }
          break;

        case ACTION_SCALE:
          if (this.scalable) {
            if (relatedEvent) {
              const $selection: CropperSelection | null = relatedEvent.target.closest(
                this.$getTagNameOf(CROPPER_SELECTION),
              );

              if (
                !$selection
                || !$selection.zoomable
                || ($selection.zoomable && $selection.dynamic)
              ) {
                const { x, y } = this.getBoundingClientRect();

                this.$zoom(
                  detail.scale,
                  relatedEvent.clientX - x,
                  relatedEvent.clientY - y,
                );
              }
            } else {
              this.$zoom(detail.scale);
            }
          }
          break;

        case ACTION_TRANSFORM:
          if (this.rotatable && this.scalable) {
            const { rotate } = detail;
            let { scale } = detail;

            if (scale < 0) {
              scale = 1 / (1 - scale);
            } else {
              scale += 1;
            }

            const cos = Math.cos(rotate);
            const sin = Math.sin(rotate);
            const [scaleX, skewY, skewX, scaleY] = [
              cos * scale,
              sin * scale,
              -sin * scale,
              cos * scale,
            ];

            if (relatedEvent) {
              const clientRect = this.getBoundingClientRect();
              const x = relatedEvent.clientX - clientRect.x;
              const y = relatedEvent.clientY - clientRect.y;
              const [a, b, c, d] = this.$matrix;
              const originX = clientRect.width / 2;
              const originY = clientRect.height / 2;
              const moveX = x - originX;
              const moveY = y - originY;
              const translateX = ((moveX * d) - (c * moveY)) / ((a * d) - (c * b));
              const translateY = ((moveY * a) - (b * moveX)) / ((a * d) - (c * b));

              this.$transform(
                scaleX,
                skewY,
                skewX,
                scaleY,
                translateX * (1 - scaleX) + translateY * skewX,
                translateY * (1 - scaleY) + translateX * skewY,
              );
            } else {
              this.$transform(scaleX, skewY, skewX, scaleY, 0, 0);
            }
          }
          break;

        default:
      }
    }
  }

  /**
   * 延迟回调到成功加载图片后执行
   * @param callback 成功加载图片后要执行的回调函数
   * @returns 返回解析为图片元素的 Promise
   */
  $ready(callback?: (image: HTMLImageElement) => unknown): Promise<HTMLImageElement> {
    const { $image } = this;
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const error = new Error('加载图片源失败');

      if ($image.complete) {
        if ($image.naturalWidth > 0 && $image.naturalHeight > 0) {
          resolve($image);
        } else {
          reject(error);
        }
      } else {
        const onLoad = () => {
          off($image, EVENT_ERROR, onError);
          resolve($image);
        };
        const onError = () => {
          off($image, EVENT_LOAD, onLoad);
          reject(error);
        };

        once($image, EVENT_LOAD, onLoad);
        once($image, EVENT_ERROR, onError);
      }
    });

    if (isFunction(callback)) {
      promise.then((image) => {
        callback(image);
        return image;
      });
    }

    return promise;
  }

  /**
   * 将图片对齐到其父元素的中心
   * @param size 图片的尺寸
   * @returns 返回 this 以便链式调用
   */
  $center(size?: string): this {
    const { parentElement } = this;

    if (!parentElement) {
      return this;
    }

    const container = parentElement.getBoundingClientRect();
    const containerWidth = container.width;
    const containerHeight = container.height;
    const {
      x,
      y,
      width,
      height,
    } = this.getBoundingClientRect();
    const startX = x + (width / 2);
    const startY = y + (height / 2);
    const endX = container.x + (containerWidth / 2);
    const endY = container.y + (containerHeight / 2);

    this.$move(endX - startX, endY - startY);

    if (size && (width !== containerWidth || height !== containerHeight)) {
      const scaleX = containerWidth / width;
      const scaleY = containerHeight / height;

      switch (size) {
        case 'cover':
          this.$scale(Math.max(scaleX, scaleY));
          break;

        case 'contain':
          this.$scale(Math.min(scaleX, scaleY));
          break;

        default:
      }
    }

    return this;
  }

  /**
   * 移动图片
   * @param x 水平方向的移动距离
   * @param y 垂直方向的移动距离
   * @returns 返回 this 以便链式调用
   */
  $move(x: number, y: number = x): this {
    if (this.translatable && isNumber(x) && isNumber(y)) {
      const [a, b, c, d] = this.$matrix;
      const e = ((x * d) - (c * y)) / ((a * d) - (c * b));
      const f = ((y * a) - (b * x)) / ((a * d) - (c * b));

      this.$translate(e, f);
    }

    return this;
  }

  /**
   * 将图片移动到特定位置
   * @param x 水平方向的新位置
   * @param y 垂直方向的新位置
   * @returns 返回 this 以便链式调用
   */
  $moveTo(x: number, y: number = x): this {
    if (this.translatable && isNumber(x) && isNumber(y)) {
      const [a, b, c, d] = this.$matrix;
      const e = ((x * d) - (c * y)) / ((a * d) - (c * b));
      const f = ((y * a) - (b * x)) / ((a * d) - (c * b));

      this.$setTransform(a, b, c, d, e, f);
    }

    return this;
  }

  /**
   * 旋转图片
   * @param angle 旋转角度（弧度）
   * @param x 水平方向的旋转原点，默认为图片中心
   * @param y 垂直方向的旋转原点，默认为图片中心
   * @returns 返回 this 以便链式调用
   */
  $rotate(angle: number | string, x?: number, y?: number): this {
    if (this.rotatable) {
      const radian = toAngleInRadian(angle);
      const cos = Math.cos(radian);
      const sin = Math.sin(radian);
      const [scaleX, skewY, skewX, scaleY] = [cos, sin, -sin, cos];

      if (isNumber(x) && isNumber(y)) {
        const [a, b, c, d] = this.$matrix;
        const { width, height } = this.getBoundingClientRect();
        const originX = width / 2;
        const originY = height / 2;
        const moveX = x - originX;
        const moveY = y - originY;
        const translateX = ((moveX * d) - (c * moveY)) / ((a * d) - (c * b));
        const translateY = ((moveY * a) - (b * moveX)) / ((a * d) - (c * b));

        this.$transform(
          scaleX,
          skewY,
          skewX,
          scaleY,
          translateX * (1 - scaleX) - translateY * skewX,
          translateY * (1 - scaleY) - translateX * skewY,
        );
      } else {
        this.$transform(scaleX, skewY, skewX, scaleY, 0, 0);
      }
    }

    return this;
  }

  /**
   * 缩放图片
   * @param scale 缩放因子。正数为放大，负数为缩小
   * @param x 水平方向的缩放原点，默认为图片中心
   * @param y 垂直方向的缩放原点，默认为图片中心
   * @returns 返回 this 以便链式调用
   */
  $zoom(scale: number, x?: number, y?: number): this {
    if (!this.scalable || scale === 0) {
      return this;
    }

    if (scale < 0) {
      scale = 1 / (1 - scale);
    } else {
      scale += 1;
    }

    if (isNumber(x) && isNumber(y)) {
      const [a, b, c, d] = this.$matrix;
      const { width, height } = this.getBoundingClientRect();
      const originX = width / 2;
      const originY = height / 2;
      const moveX = x - originX;
      const moveY = y - originY;
      const translateX = ((moveX * d) - (c * moveY)) / ((a * d) - (c * b));
      const translateY = ((moveY * a) - (b * moveX)) / ((a * d) - (c * b));

      this.$transform(scale, 0, 0, scale, translateX * (1 - scale), translateY * (1 - scale));
    } else {
      this.$scale(scale);
    }

    return this;
  }

  /**
   * 缩放图片
   * @param x 水平方向的缩放因子
   * @param y 垂直方向的缩放因子
   * @returns 返回 this 以便链式调用
   */
  $scale(x: number, y: number = x): this {
    if (this.scalable) {
      this.$transform(x, 0, 0, y, 0, 0);
    }

    return this;
  }

  /**
   * 倾斜图片
   * @param x 水平方向的倾斜角度
   * @param y 垂直方向的倾斜角度
   * @returns 返回 this 以便链式调用
   */
  $skew(x: number | string, y: number | string = 0): this {
    if (this.skewable) {
      const radianX = toAngleInRadian(x);
      const radianY = toAngleInRadian(y);

      this.$transform(1, Math.tan(radianY), Math.tan(radianX), 1, 0, 0);
    }

    return this;
  }

  /**
   * 平移图片
   * @param x 水平方向的平移距离
   * @param y 垂直方向的平移距离
   * @returns 返回 this 以便链式调用
   */
  $translate(x: number, y: number = x): this {
    if (this.translatable && isNumber(x) && isNumber(y)) {
      this.$transform(1, 0, 0, 1, x, y);
    }

    return this;
  }

  /**
   * 变换图片
   * @param a 水平方向的缩放因子
   * @param b 垂直方向的倾斜角度
   * @param c 水平方向的倾斜角度
   * @param d 垂直方向的缩放因子
   * @param e 水平方向的平移距离
   * @param f 垂直方向的平移距离
   * @returns 返回 this 以便链式调用
   */
  $transform(a: number, b: number, c: number, d: number, e: number, f: number): this {
    if (
      isNumber(a)
      && isNumber(b)
      && isNumber(c)
      && isNumber(d)
      && isNumber(e)
      && isNumber(f)
    ) {
      return this.$setTransform(multiplyMatrices(this.$matrix, [a, b, c, d, e, f]));
    }

    return this;
  }

  /**
   * 重置（覆盖）当前变换为特定的单位矩阵
   * @param a 水平方向的缩放因子或矩阵数组
   * @param b 垂直方向的倾斜角度
   * @param c 水平方向的倾斜角度
   * @param d 垂直方向的缩放因子
   * @param e 水平方向的平移距离
   * @param f 垂直方向的平移距离
   * @returns 返回 this 以便链式调用
   */
  $setTransform(
    a: number | number[],
    b?: number,
    c?: number,
    d?: number,
    e?: number,
    f?: number,
  ): this {
    if (this.rotatable || this.scalable || this.skewable || this.translatable) {
      if (Array.isArray(a)) {
        [a, b, c, d, e, f] = a;
      }

      if (
        isNumber(a)
        && isNumber(b)
        && isNumber(c)
        && isNumber(d)
        && isNumber(e)
        && isNumber(f)
      ) {
        const oldMatrix = [...this.$matrix];
        const newMatrix = [a, b, c, d, e, f];

        if (this.$emit(EVENT_TRANSFORM, {
          matrix: newMatrix,
          oldMatrix,
        }) === false) {
          return this;
        }

        this.$matrix = newMatrix;
        this.style.transform = `matrix(${newMatrix.join(', ')})`;
      }
    }

    return this;
  }

  /**
   * 获取当前应用于元素的变换矩阵
   * @returns 返回只读的变换矩阵
   */
  $getTransform(): number[] {
    return this.$matrix.slice();
  }

  /**
   * 将当前变换重置为初始单位矩阵
   * @returns 返回 this 以便链式调用
   */
  $resetTransform(): this {
    return this.$setTransform([1, 0, 0, 1, 0, 0]);
  }
}

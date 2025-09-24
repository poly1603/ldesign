/**
 * 裁剪器基础元素类
 * 所有 Web Components 的基类，提供 Shadow DOM、样式管理、属性同步等功能
 */

import {
  IS_BROWSER,
  WINDOW,
  emit,
  isNaN,
  isNumber,
  isObject,
  isUndefined,
  nextTick,
  toCamelCase,
  toKebabCase,
} from '../utils';
import baseStyle from './base-style';

// 正则表达式匹配需要添加 px 单位的属性
const REGEXP_SUFFIX = /left|top|width|height/i;
const DEFAULT_SHADOW_ROOT_MODE = 'open';

// WeakMap 用于存储私有数据
const shadowRoots = new WeakMap();
const styleSheets = new WeakMap();
const tagNames: Map<string, string> = new Map();

// 检查是否支持 adoptedStyleSheets
const supportsAdoptedStyleSheets = WINDOW.document
  && Array.isArray(WINDOW.document.adoptedStyleSheets)
  && 'replaceSync' in WINDOW.CSSStyleSheet.prototype;

/**
 * 裁剪器基础元素类
 * 提供 Web Components 的基础功能
 */
export default class CropperElement extends HTMLElement {
  /** 元素名称 */
  static $name: string;

  /** 版本号 */
  static $version = '1.0.0';

  /** 元素样式 */
  protected $style?: string;

  /** 元素模板 */
  protected $template?: string;

  /** 获取共享样式 */
  protected get $sharedStyle(): string {
    return `${this.themeColor ? `:host{--theme-color: ${this.themeColor};}` : ''}${baseStyle}`;
  }

  /** Shadow Root 模式 */
  shadowRootMode: ShadowRootMode = DEFAULT_SHADOW_ROOT_MODE;

  /** 是否可插槽 */
  slottable = true;

  /** 主题色 */
  themeColor?: string;

  constructor() {
    super();

    const name = Object.getPrototypeOf(this)?.constructor?.$name;

    if (name) {
      tagNames.set(name, this.tagName.toLowerCase());
    }
  }

  /** 观察的属性列表 */
  protected static get observedAttributes(): string[] {
    return [
      'shadow-root-mode',
      'slottable',
      'theme-color',
    ];
  }

  /** 属性变化回调 - 将属性转换为属性 */
  protected attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (Object.is(newValue, oldValue)) {
      return;
    }

    const propertyName = toCamelCase(name);
    const oldPropertyValue = (this as any)[propertyName];
    let newPropertyValue: any = newValue;

    // 根据原属性类型转换新值
    switch (typeof oldPropertyValue) {
      case 'boolean':
        newPropertyValue = newValue !== null && newValue !== 'false';
        break;

      case 'number':
        newPropertyValue = Number(newValue);
        break;

      default:
    }

    (this as any)[propertyName] = newPropertyValue;

    // 处理特殊属性
    switch (name) {
      case 'theme-color': {
        const styleSheet = styleSheets.get(this);
        const styles = this.$sharedStyle;

        if (styleSheet && styles) {
          if (supportsAdoptedStyleSheets) {
            styleSheet.replaceSync(styles);
          } else {
            styleSheet.textContent = styles;
          }
        }

        break;
      }

      default:
    }
  }

  /** 属性变化回调 - 将属性转换为特性 */
  protected $propertyChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
    if (Object.is(newValue, oldValue)) {
      return;
    }

    name = toKebabCase(name);

    switch (typeof newValue) {
      case 'boolean':
        if (newValue === true) {
          if (!this.hasAttribute(name)) {
            this.setAttribute(name, '');
          }
        } else {
          this.removeAttribute(name);
        }
        break;

      case 'number':
        if (isNaN(newValue)) {
          newValue = '';
        } else {
          newValue = String(newValue);
        }
      // Fall through

      // case 'string':
      // eslint-disable-next-line no-fallthrough
      default:
        if (newValue) {
          if (this.getAttribute(name) !== newValue) {
            this.setAttribute(name, newValue as string);
          }
        } else {
          this.removeAttribute(name);
        }
    }
  }

  /** 连接到 DOM 时的回调 */
  protected connectedCallback(): void {
    // 在观察属性后观察属性
    Object.getPrototypeOf(this).constructor.observedAttributes.forEach((attribute: string) => {
      const property = toCamelCase(attribute);
      let value = (this as any)[property];

      if (!isUndefined(value)) {
        this.$propertyChangedCallback(property, undefined, value);
      }

      // 定义属性的 getter 和 setter
      Object.defineProperty(this, property, {
        enumerable: true,
        configurable: true,
        get() {
          return value;
        },
        set(newValue) {
          const oldValue = value;

          value = newValue;
          this.$propertyChangedCallback(property, oldValue, newValue);
        },
      });
    });

    // 创建或获取 Shadow Root
    const shadow = this.shadowRoot || this.attachShadow({
      mode: this.shadowRootMode || DEFAULT_SHADOW_ROOT_MODE,
    });

    shadowRoots.set(this, shadow);
    styleSheets.set(this, this.$addStyles(this.$sharedStyle));

    // 添加元素样式
    if (this.$style) {
      this.$addStyles(this.$style);
    }

    // 添加模板内容
    if (this.$template) {
      const template = document.createElement('template');

      template.innerHTML = this.$template;
      shadow.appendChild(template.content);
    }

    // 添加插槽
    if (this.slottable) {
      const slot = document.createElement('slot');

      shadow.appendChild(slot);
    }
  }

  /** 从 DOM 断开时的回调 */
  protected disconnectedCallback(): void {
    if (styleSheets.has(this)) {
      styleSheets.delete(this);
    }

    if (shadowRoots.has(this)) {
      shadowRoots.delete(this);
    }
  }

  /** 获取标签名 */
  protected $getTagNameOf(name: string): string {
    return tagNames.get(name) ?? name;
  }

  /** 设置样式 */
  protected $setStyles(properties: Record<string, any>): this {
    Object.keys(properties).forEach((property: any) => {
      let value = properties[property];

      if (isNumber(value)) {
        if (value !== 0 && REGEXP_SUFFIX.test(property)) {
          value = `${value}px`;
        } else {
          value = String(value);
        }
      }

      this.style[property] = value;
    });

    return this;
  }

  /**
   * 获取元素的 Shadow Root
   * @returns 返回 Shadow Root
   */
  $getShadowRoot(): ShadowRoot {
    return this.shadowRoot || shadowRoots.get(this);
  }

  /**
   * 向 Shadow Root 添加样式
   * @param styles 要添加的样式
   * @returns 返回生成的样式表
   */
  $addStyles(styles: string): CSSStyleSheet | HTMLStyleElement {
    let styleSheet;

    const shadow = this.$getShadowRoot();

    if (supportsAdoptedStyleSheets) {
      styleSheet = new CSSStyleSheet();
      (styleSheet as any).replaceSync(styles);
      (shadow as any).adoptedStyleSheets = (shadow as any).adoptedStyleSheets.concat(styleSheet);
    } else {
      styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      shadow.appendChild(styleSheet);
    }

    return styleSheet;
  }

  /**
   * 在元素上派发事件
   * @param type 事件名称
   * @param detail 事件数据
   * @param options 其他事件选项
   * @returns 返回结果值
   */
  $emit(type: string, detail?: unknown, options?: CustomEventInit): boolean {
    return emit(this, type, detail, options);
  }

  /**
   * 延迟回调到下一个 DOM 更新周期后执行
   * @param callback 要执行的回调函数
   * @returns 返回 Promise
   */
  $nextTick(callback?: () => void): Promise<void> {
    return nextTick(this, callback);
  }

  /**
   * 将构造函数定义为新的自定义元素
   * @param name 元素名称
   * @param options 元素定义选项
   */
  static $define(
    name?: string | ElementDefinitionOptions,
    options?: ElementDefinitionOptions,
  ): void {
    if (isObject(name)) {
      options = name;
      name = '';
    }

    if (!name) {
      name = this.$name || this.name;
    }

    name = toKebabCase(name as string);

    if (IS_BROWSER && WINDOW.customElements && !WINDOW.customElements.get(name)) {
      customElements.define(name, this, options);
    }
  }
}

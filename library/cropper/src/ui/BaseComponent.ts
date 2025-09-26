/**
 * @ldesign/cropper 基础UI组件
 * 
 * 提供所有UI组件的基础功能和通用方法
 */

import type { UIComponent, UIEvent, UIEventHandler, UIEventType } from '../types/ui';
import type { Point, Size } from '../types';
import { generateId } from '../utils/common';
import { isHTMLElement } from '../utils/validation';

// ============================================================================
// 基础组件类
// ============================================================================

/**
 * 基础UI组件抽象类
 * 提供所有UI组件的通用功能
 */
export abstract class BaseComponent implements UIComponent {
  /** 组件ID */
  public readonly id: string;

  /** 组件类型 */
  public abstract readonly type: string;

  /** 组件DOM元素 */
  protected element: HTMLElement | null = null;

  /** 父容器 */
  protected container: HTMLElement | null = null;

  /** 事件监听器映射 */
  protected eventListeners: Map<UIEventType, Set<UIEventHandler>> = new Map();

  /** 组件配置 */
  protected config: Partial<UIComponent>;

  /** 是否已挂载 */
  protected mounted: boolean = false;

  /** 是否已销毁 */
  protected destroyed: boolean = false;

  /** 绑定的事件处理器 */
  protected boundHandlers: Record<string, EventListener> = {};

  constructor(config: Partial<UIComponent> = {}) {
    this.id = config.id || generateId('ui-component');
    this.config = {
      visible: true,
      enabled: true,
      ...config
    };
  }

  // ============================================================================
  // 公共属性访问器
  // ============================================================================

  /**
   * 获取组件是否可见
   */
  get visible(): boolean {
    return this.config.visible ?? true;
  }

  /**
   * 设置组件是否可见
   */
  set visible(value: boolean) {
    this.config.visible = value;
    this.updateVisibility();
  }

  /**
   * 获取组件是否启用
   */
  get enabled(): boolean {
    return this.config.enabled ?? true;
  }

  /**
   * 设置组件是否启用
   */
  set enabled(value: boolean) {
    this.config.enabled = value;
    this.updateEnabled();
  }

  /**
   * 获取组件位置
   */
  get position(): Point | undefined {
    return this.config.position;
  }

  /**
   * 设置组件位置
   */
  set position(value: Point | undefined) {
    this.config.position = value;
    this.updatePosition();
  }

  /**
   * 获取组件尺寸
   */
  get size(): Size | undefined {
    return this.config.size;
  }

  /**
   * 设置组件尺寸
   */
  set size(value: Size | undefined) {
    this.config.size = value;
    this.updateSize();
  }

  /**
   * 获取CSS类名
   */
  get className(): string | undefined {
    return this.config.className;
  }

  /**
   * 设置CSS类名
   */
  set className(value: string | undefined) {
    this.config.className = value;
    this.updateClassName();
  }

  /**
   * 获取内联样式
   */
  get style(): Record<string, string> | undefined {
    return this.config.style;
  }

  /**
   * 设置内联样式
   */
  set style(value: Record<string, string> | undefined) {
    this.config.style = value;
    this.updateStyle();
  }

  // ============================================================================
  // 生命周期方法
  // ============================================================================

  /**
   * 挂载组件到容器
   * @param container 容器元素
   */
  mount(container: HTMLElement | string): void {
    if (this.mounted) {
      console.warn(`Component ${this.id} is already mounted`);
      return;
    }

    // 解析容器
    this.container = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

    if (!isHTMLElement(this.container)) {
      throw new Error(`Invalid container for component ${this.id}`);
    }

    // 创建组件元素
    this.element = this.createElement();

    // 应用初始配置
    this.applyConfig();

    // 绑定事件
    this.bindEvents();

    // 添加到容器
    this.container.appendChild(this.element);

    // 标记为已挂载
    this.mounted = true;

    // 触发挂载事件
    this.emit('show', {});
  }

  /**
   * 卸载组件
   */
  unmount(): void {
    if (!this.mounted) {
      return;
    }

    // 触发卸载事件
    this.emit('hide', {});

    // 解绑事件
    this.unbindEvents();

    // 从容器移除
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    // 清理引用
    this.element = null;
    this.container = null;
    this.mounted = false;
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    // 卸载组件
    this.unmount();

    // 清理事件监听器
    this.eventListeners.clear();

    // 标记为已销毁
    this.destroyed = true;
  }

  // ============================================================================
  // 抽象方法（子类必须实现）
  // ============================================================================

  /**
   * 创建组件DOM元素
   * @returns 组件DOM元素
   */
  protected abstract createElement(): HTMLElement;

  /**
   * 渲染组件内容
   */
  protected abstract render(): void;

  // ============================================================================
  // 事件系统
  // ============================================================================

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param handler 事件处理器
   */
  on(type: UIEventType, handler: UIEventHandler): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(handler);
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param handler 事件处理器
   */
  off(type: UIEventType, handler: UIEventHandler): void {
    const handlers = this.eventListeners.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   * @param originalEvent 原始DOM事件
   */
  protected emit(type: UIEventType, data: any, originalEvent?: Event): void {
    const handlers = this.eventListeners.get(type);
    if (handlers) {
      const event: UIEvent = {
        type,
        target: this,
        data,
        originalEvent,
        timestamp: Date.now()
      };

      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in UI event handler for ${type}:`, error);
        }
      });
    }
  }

  // ============================================================================
  // 配置更新方法
  // ============================================================================

  /**
   * 更新组件配置
   * @param config 新配置
   */
  updateConfig(config: Partial<UIComponent>): void {
    this.config = { ...this.config, ...config };
    this.applyConfig();
  }

  /**
   * 应用配置到DOM元素
   */
  protected applyConfig(): void {
    if (!this.element) return;

    this.updateVisibility();
    this.updateEnabled();
    this.updatePosition();
    this.updateSize();
    this.updateClassName();
    this.updateStyle();
    this.updateAttributes();
    this.render();
  }

  /**
   * 更新可见性
   */
  protected updateVisibility(): void {
    if (!this.element) return;

    this.element.style.display = this.visible ? '' : 'none';
  }

  /**
   * 更新启用状态
   */
  protected updateEnabled(): void {
    if (!this.element) return;

    if (this.enabled) {
      this.element.removeAttribute('disabled');
      this.element.classList.remove('disabled');
    } else {
      this.element.setAttribute('disabled', 'true');
      this.element.classList.add('disabled');
    }
  }

  /**
   * 更新位置
   */
  protected updatePosition(): void {
    if (!this.element || !this.position) return;

    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
  }

  /**
   * 更新尺寸
   */
  protected updateSize(): void {
    if (!this.element || !this.size) return;

    this.element.style.width = `${this.size.width}px`;
    this.element.style.height = `${this.size.height}px`;
  }

  /**
   * 更新CSS类名
   */
  protected updateClassName(): void {
    if (!this.element) return;

    // 清除旧的自定义类名（保留组件基础类名）
    const baseClasses = this.getBaseClasses();
    this.element.className = baseClasses.join(' ');

    // 添加新的类名
    if (this.className) {
      this.element.classList.add(...this.className.split(' '));
    }
  }

  /**
   * 更新内联样式
   */
  protected updateStyle(): void {
    if (!this.element) return;

    if (this.style) {
      Object.entries(this.style).forEach(([property, value]) => {
        // 处理驼峰命名转换为CSS属性名
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        this.element!.style.setProperty(cssProperty, value);
      });
    }
  }

  /**
   * 更新属性
   */
  protected updateAttributes(): void {
    if (!this.element || !this.config.attributes) return;

    Object.entries(this.config.attributes).forEach(([name, value]) => {
      this.element!.setAttribute(name, value);
    });
  }

  /**
   * 获取组件基础CSS类名
   * @returns 基础类名数组
   */
  protected getBaseClasses(): string[] {
    return [
      'ldesign-cropper-ui',
      `ldesign-cropper-${this.type}`,
      `ldesign-cropper-${this.type}-${this.id}`
    ];
  }

  /**
   * 绑定DOM事件
   */
  protected bindEvents(): void {
    if (!this.element) return;

    // 保存绑定的事件处理器引用，用于后续解绑
    this.boundHandlers = {
      click: this.handleClick.bind(this),
      mouseenter: this.handleMouseEnter.bind(this),
      mouseleave: this.handleMouseLeave.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this)
    };

    // 基础事件绑定
    this.element.addEventListener('click', this.boundHandlers.click);
    this.element.addEventListener('mouseenter', this.boundHandlers.mouseenter);
    this.element.addEventListener('mouseleave', this.boundHandlers.mouseleave);
    this.element.addEventListener('focus', this.boundHandlers.focus);
    this.element.addEventListener('blur', this.boundHandlers.blur);
  }

  /**
   * 解绑DOM事件
   */
  protected unbindEvents(): void {
    if (!this.element || !this.boundHandlers) return;

    // 移除所有事件监听器
    this.element.removeEventListener('click', this.boundHandlers.click);
    this.element.removeEventListener('mouseenter', this.boundHandlers.mouseenter);
    this.element.removeEventListener('mouseleave', this.boundHandlers.mouseleave);
    this.element.removeEventListener('focus', this.boundHandlers.focus);
    this.element.removeEventListener('blur', this.boundHandlers.blur);

    // 清空绑定的处理器
    this.boundHandlers = {};
  }

  // ============================================================================
  // DOM事件处理器
  // ============================================================================

  /**
   * 处理点击事件
   */
  protected handleClick(event: MouseEvent): void {
    if (!this.enabled) return;
    this.emit('click', { x: event.clientX, y: event.clientY }, event);
  }

  /**
   * 处理鼠标进入事件
   */
  protected handleMouseEnter(event: MouseEvent): void {
    if (!this.enabled) return;
    this.emit('hover', { enter: true }, event);
  }

  /**
   * 处理鼠标离开事件
   */
  protected handleMouseLeave(event: MouseEvent): void {
    if (!this.enabled) return;
    this.emit('hover', { enter: false }, event);
  }

  /**
   * 处理焦点事件
   */
  protected handleFocus(event: FocusEvent): void {
    if (!this.enabled) return;
    this.emit('focus', {}, event);
  }

  /**
   * 处理失焦事件
   */
  protected handleBlur(event: FocusEvent): void {
    if (!this.enabled) return;
    this.emit('blur', {}, event);
  }

  // ============================================================================
  // 工具方法
  // ============================================================================

  /**
   * 获取组件DOM元素
   * @returns DOM元素
   */
  getElement(): HTMLElement | null {
    return this.element;
  }

  /**
   * 获取组件配置
   * @returns 组件配置
   */
  getConfig(): Partial<UIComponent> {
    return { ...this.config };
  }

  /**
   * 检查组件是否已挂载
   * @returns 是否已挂载
   */
  isMounted(): boolean {
    return this.mounted;
  }

  /**
   * 检查组件是否已销毁
   * @returns 是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }
}

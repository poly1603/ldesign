/**
 * UI插件基类
 * 为需要DOM操作的插件提供基础功能
 */
import { BasePlugin } from './BasePlugin';
import type { IPlugin, PluginConfig } from '../types/plugins';

export interface UIPluginConfig extends PluginConfig {
  className?: string;
  position?: 'left' | 'center' | 'right';
  order?: number;
  visible?: boolean;
}

export abstract class UIPlugin extends BasePlugin implements IPlugin {
  protected element?: HTMLElement;
  protected container?: HTMLElement;

  constructor(name: string, config: UIPluginConfig = {}) {
    super(name, {
      className: '',
      position: 'left',
      order: 0,
      visible: true,
      ...config
    });
  }

  /**
   * 创建插件DOM元素
   */
  protected abstract createElement(): HTMLElement;

  /**
   * 获取插件元素
   */
  public getElement(): HTMLElement | undefined {
    return this.element;
  }

  /**
   * 显示插件
   */
  public show(): void {
    if (this.element) {
      this.element.style.display = '';
      (this.config as UIPluginConfig).visible = true;
    }
  }

  /**
   * 隐藏插件
   */
  public hide(): void {
    if (this.element) {
      this.element.style.display = 'none';
      (this.config as UIPluginConfig).visible = false;
    }
  }

  /**
   * 设置插件可见性
   */
  public setVisible(visible: boolean): void {
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * 检查插件是否可见
   */
  public isVisible(): boolean {
    return (this.config as UIPluginConfig).visible || false;
  }

  /**
   * 设置插件位置
   */
  public setPosition(position: 'left' | 'center' | 'right'): void {
    (this.config as UIPluginConfig).position = position;
    this.updatePosition();
  }

  /**
   * 设置插件顺序
   */
  public setOrder(order: number): void {
    (this.config as UIPluginConfig).order = order;
    this.updateOrder();
  }

  /**
   * 更新插件位置
   */
  protected updatePosition(): void {
    if (!this.element || !this.container) return;

    const config = this.config as UIPluginConfig;
    const position = config.position || 'left';

    // 移除之前的位置类
    this.element.classList.remove('lv-plugin-left', 'lv-plugin-center', 'lv-plugin-right');
    
    // 添加新的位置类
    this.element.classList.add(`lv-plugin-${position}`);
  }

  /**
   * 更新插件顺序
   */
  protected updateOrder(): void {
    if (!this.element) return;

    const config = this.config as UIPluginConfig;
    this.element.style.order = (config.order || 0).toString();
  }

  /**
   * 添加CSS类
   */
  public addClass(className: string): void {
    if (this.element) {
      this.element.classList.add(className);
    }
  }

  /**
   * 移除CSS类
   */
  public removeClass(className: string): void {
    if (this.element) {
      this.element.classList.remove(className);
    }
  }

  /**
   * 切换CSS类
   */
  public toggleClass(className: string, force?: boolean): void {
    if (this.element) {
      this.element.classList.toggle(className, force);
    }
  }

  /**
   * 检查是否包含CSS类
   */
  public hasClass(className: string): boolean {
    return this.element?.classList.contains(className) || false;
  }

  /**
   * 设置CSS样式
   */
  public setStyle(property: string, value: string): void {
    if (this.element) {
      (this.element.style as any)[property] = value;
    }
  }

  /**
   * 获取CSS样式
   */
  public getStyle(property: string): string {
    if (this.element) {
      return getComputedStyle(this.element).getPropertyValue(property);
    }
    return '';
  }

  /**
   * 设置属性
   */
  public setAttribute(name: string, value: string): void {
    if (this.element) {
      this.element.setAttribute(name, value);
    }
  }

  /**
   * 获取属性
   */
  public getAttribute(name: string): string | null {
    return this.element?.getAttribute(name) || null;
  }

  /**
   * 移除属性
   */
  public removeAttribute(name: string): void {
    if (this.element) {
      this.element.removeAttribute(name);
    }
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void {
    if (this.element) {
      this.element.addEventListener(type, listener, options);
    }
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void {
    if (this.element) {
      this.element.removeEventListener(type, listener, options);
    }
  }

  /**
   * 触发事件
   */
  public dispatchEvent(event: Event): boolean {
    return this.element?.dispatchEvent(event) || false;
  }

  /**
   * 查找子元素
   */
  public querySelector(selector: string): Element | null {
    return this.element?.querySelector(selector) || null;
  }

  /**
   * 查找所有子元素
   */
  public querySelectorAll(selector: string): NodeListOf<Element> {
    return this.element?.querySelectorAll(selector) || document.querySelectorAll('');
  }

  /**
   * 获取元素尺寸
   */
  public getBoundingClientRect(): DOMRect | null {
    return this.element?.getBoundingClientRect() || null;
  }

  /**
   * 滚动到元素
   */
  public scrollIntoView(options?: boolean | ScrollIntoViewOptions): void {
    if (this.element) {
      this.element.scrollIntoView(options);
    }
  }

  /**
   * 聚焦元素
   */
  public focus(options?: FocusOptions): void {
    if (this.element && 'focus' in this.element) {
      (this.element as HTMLElement).focus(options);
    }
  }

  /**
   * 失焦元素
   */
  public blur(): void {
    if (this.element && 'blur' in this.element) {
      (this.element as HTMLElement).blur();
    }
  }

  /**
   * 插件挂载时的处理
   */
  onMount(): void {
    if (!this.element) {
      this.element = this.createElement();
    }

    if (this.element && this.player?.container) {
      this.container = this.player.container;
      
      // 设置基础类名
      this.element.classList.add('lv-plugin', `lv-plugin-${this.name}`);
      
      // 设置自定义类名
      const config = this.config as UIPluginConfig;
      if (config.className) {
        this.element.classList.add(config.className);
      }

      // 设置位置和顺序
      this.updatePosition();
      this.updateOrder();

      // 设置可见性
      if (!config.visible) {
        this.hide();
      }
    }
  }

  /**
   * 插件卸载时的处理
   */
  onDestroy(): void {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = undefined;
    this.container = undefined;
  }
}

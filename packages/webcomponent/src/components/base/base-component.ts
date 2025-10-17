import { Component, Element, Prop, State, Watch } from '@stencil/core';
import { bem, classNames, generateId } from '../../utils';
import { Size, Theme } from '../../types';

/**
 * 组件基类
 * 提供通用的属性和方法
 */
@Component({
  tag: 'base-component',
  shadow: false
})
export class BaseComponent {
  @Element() el!: HTMLElement;

  /**
   * 组件类名
   */
  @Prop() class?: string;

  /**
   * 组件ID
   */
  @Prop() componentId?: string;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 组件尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 主题
   */
  @Prop() theme: Theme = 'light';

  /**
   * 内部状态：组件是否已初始化
   */
  @State() initialized: boolean = false;

  /**
   * 内部状态：组件唯一ID
   */
  @State() internalId: string;

  /**
   * 监听disabled属性变化
   */
  @Watch('disabled')
  watchDisabled(newValue: boolean) {
    this.updateAriaDisabled(newValue);
  }

  /**
   * 组件加载完成后的生命周期
   */
  componentDidLoad() {
    this.initialized = true;
    this.internalId = this.componentId || generateId();
    this.updateAriaDisabled(this.disabled);
  }

  /**
   * 更新aria-disabled属性
   */
  private updateAriaDisabled(disabled: boolean) {
    if (this.el) {
      if (disabled) {
        this.el.setAttribute('aria-disabled', 'true');
      } else {
        this.el.removeAttribute('aria-disabled');
      }
    }
  }

  /**
   * 生成BEM类名
   */
  protected bem(block: string, element?: string, modifier?: string | string[]): string {
    return bem(block, element, modifier);
  }

  /**
   * 合并类名
   */
  protected classNames(...classes: (string | undefined | null | false)[]): string {
    return classNames(...classes);
  }

  /**
   * 获取组件根类名
   */
  protected getRootClass(componentName: string, modifiers?: string[]): string {
    const baseClass = this.bem(componentName);
    const sizeClass = this.bem(componentName, undefined, this.size);
    const themeClass = this.bem(componentName, undefined, this.theme);
    const disabledClass = this.disabled ? this.bem(componentName, undefined, 'disabled') : '';
    
    const modifierClasses = modifiers ? modifiers.map(mod => 
      this.bem(componentName, undefined, mod)
    ).join(' ') : '';

    return this.classNames(
      baseClass,
      sizeClass,
      themeClass,
      disabledClass,
      modifierClasses,
      this.class
    );
  }

  /**
   * 触发自定义事件
   */
  protected emitEvent<T = any>(eventName: string, detail?: T): CustomEvent<T> {
    const event = new CustomEvent(`ldesign${eventName}`, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.el.dispatchEvent(event);
    return event;
  }

  /**
   * 获取组件内部ID
   */
  protected getInternalId(): string {
    return this.internalId || generateId();
  }

  /**
   * 检查组件是否可交互
   */
  protected isInteractive(): boolean {
    return !this.disabled;
  }

  /**
   * 处理键盘事件的通用方法
   */
  protected handleKeyDown(event: KeyboardEvent, callback?: (event: KeyboardEvent) => void) {
    if (!this.isInteractive()) {
      event.preventDefault();
      return;
    }

    if (callback) {
      callback(event);
    }
  }

  /**
   * 处理点击事件的通用方法
   */
  protected handleClick(event: MouseEvent, callback?: (event: MouseEvent) => void) {
    if (!this.isInteractive()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (callback) {
      callback(event);
    }
  }
}

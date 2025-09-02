/**
 * Button 组件实现
 * 
 * 基于 Stencil 的现代化按钮组件，支持多种类型、尺寸、状态
 * 具备完整的可访问性支持和主题定制功能
 */

import { Component, Prop, Event, EventEmitter, Element, State, Watch, h, Host } from '@stencil/core';
import { ButtonProps, ButtonType, ButtonShape, ButtonHtmlType, ButtonClickEventDetail, ButtonFocusEventDetail } from '../../types/button';
import { Size, Status } from '../../types';
import { classNames, generateId } from '../../utils';

@Component({
  tag: 'ld-button',
  styleUrl: 'button.less',
  shadow: true,
})
export class Button implements ButtonProps {
  @Element() el!: HTMLElement;

  // ==================== 属性定义 ====================

  /**
   * 按钮类型
   */
  @Prop() type: ButtonType = 'default';

  /**
   * 按钮尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 按钮状态
   */
  @Prop() status?: Status;

  /**
   * 按钮形状
   */
  @Prop() shape: ButtonShape = 'default';

  /**
   * HTML button 类型
   */
  @Prop() htmlType: ButtonHtmlType = 'button';

  /**
   * 是否为块级按钮
   */
  @Prop() block: boolean = false;

  /**
   * 是否显示加载状态
   */
  @Prop() loading: boolean = false;

  /**
   * 是否为危险按钮
   */
  @Prop() danger: boolean = false;

  /**
   * 是否为幽灵按钮
   */
  @Prop() ghost: boolean = false;

  /**
   * 按钮图标（左侧）
   */
  @Prop() icon?: string;

  /**
   * 按钮图标（右侧）
   */
  @Prop() iconRight?: string;

  /**
   * 自定义加载图标
   */
  @Prop() loadingIcon?: string;

  /**
   * 按钮链接地址
   */
  @Prop() href?: string;

  /**
   * 链接打开方式
   */
  @Prop() target: '_blank' | '_self' | '_parent' | '_top' = '_self';

  /**
   * 是否禁用按钮
   */
  @Prop() disabled: boolean = false;

  /**
   * Tab 索引
   */
  @Prop() tabIndex?: number;

  /**
   * 自动聚焦
   */
  @Prop() autofocus: boolean = false;

  /**
   * 按钮文本内容
   */
  @Prop() text?: string;

  /**
   * 自定义 CSS 类名
   */
  @Prop() customClass?: string;

  /**
   * 自定义内联样式
   */
  @Prop() customStyle?: { [key: string]: string };

  // ==================== 状态定义 ====================

  /**
   * 组件唯一 ID
   */
  @State() componentId: string = generateId('ld-button');

  /**
   * 是否聚焦状态
   */
  @State() focused: boolean = false;

  /**
   * 是否按下状态
   */
  @State() pressed: boolean = false;

  // ==================== 事件定义 ====================

  /**
   * 点击事件
   */
  @Event() ldClick!: EventEmitter<ButtonClickEventDetail>;

  /**
   * 聚焦事件
   */
  @Event() ldFocus!: EventEmitter<ButtonFocusEventDetail>;

  /**
   * 失焦事件
   */
  @Event() ldBlur!: EventEmitter<ButtonFocusEventDetail>;

  /**
   * 鼠标进入事件
   */
  @Event() ldMouseEnter!: EventEmitter<MouseEvent>;

  /**
   * 鼠标离开事件
   */
  @Event() ldMouseLeave!: EventEmitter<MouseEvent>;

  // ==================== 生命周期方法 ====================

  componentDidLoad() {
    // 自动聚焦
    if (this.autofocus && !this.disabled) {
      this.focusButton();
    }
  }

  // ==================== 监听器 ====================

  @Watch('loading')
  onLoadingChange(_newValue: boolean) {
    // 当加载状态改变时，更新 ARIA 属性
    this.updateAriaAttributes();
  }

  @Watch('disabled')
  onDisabledChange(_newValue: boolean) {
    // 当禁用状态改变时，更新 ARIA 属性
    this.updateAriaAttributes();
  }

  // ==================== 事件处理方法 ====================

  /**
   * 处理点击事件
   */
  private handleClick = (event: MouseEvent) => {
    // 如果按钮被禁用或正在加载，阻止点击
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 发射自定义点击事件
    this.ldClick.emit({
      originalEvent: event,
      target: this.el,
      type: this.type,
      disabled: this.disabled,
      loading: this.loading,
    });
  };

  /**
   * 处理聚焦事件
   */
  private handleFocus = (event: FocusEvent) => {
    this.focused = true;
    this.ldFocus.emit({
      originalEvent: event,
      target: this.el,
      direction: 'in',
    });
  };

  /**
   * 处理失焦事件
   */
  private handleBlur = (event: FocusEvent) => {
    this.focused = false;
    this.pressed = false;
    this.ldBlur.emit({
      originalEvent: event,
      target: this.el,
      direction: 'out',
    });
  };

  /**
   * 处理鼠标进入事件
   */
  private handleMouseEnter = (event: MouseEvent) => {
    this.ldMouseEnter.emit(event);
  };

  /**
   * 处理鼠标离开事件
   */
  private handleMouseLeave = (event: MouseEvent) => {
    this.pressed = false;
    this.ldMouseLeave.emit(event);
  };

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown = () => {
    if (!this.disabled && !this.loading) {
      this.pressed = true;
    }
  };

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp = () => {
    this.pressed = false;
  };

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    // 空格键和回车键触发点击
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.pressed = true;

      // 模拟点击事件
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      this.handleClick(clickEvent);
    }
  };

  /**
   * 处理键盘抬起事件
   */
  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      this.pressed = false;
    }
  };

  // ==================== 工具方法 ====================

  /**
   * 聚焦按钮
   */
  private focusButton() {
    const buttonElement = this.getButtonElement();
    if (buttonElement) {
      buttonElement.focus();
    }
  }

  /**
   * 获取按钮元素
   */
  private getButtonElement(): HTMLButtonElement | HTMLAnchorElement | null {
    return this.el.shadowRoot?.querySelector('button, a') || null;
  }

  /**
   * 更新 ARIA 属性
   */
  private updateAriaAttributes() {
    const buttonElement = this.getButtonElement();
    if (buttonElement) {
      buttonElement.setAttribute('aria-disabled', String(this.disabled));
      if (this.loading) {
        buttonElement.setAttribute('aria-busy', 'true');
      } else {
        buttonElement.removeAttribute('aria-busy');
      }
    }
  }

  /**
   * 生成按钮类名
   */
  private getButtonClasses(): string {
    return classNames(
      'ld-button',
      `ld-button--${this.type}`,
      `ld-button--${this.size}`,
      this.shape !== 'default' && `ld-button--${this.shape}`,
      this.status && `ld-button--${this.status}`,
      this.block && 'ld-button--block',
      this.loading && 'ld-button--loading',
      this.danger && 'ld-button--danger',
      this.ghost && 'ld-button--ghost',
      this.disabled && 'ld-button--disabled',
      this.focused && 'ld-button--focused',
      this.pressed && 'ld-button--pressed',
      this.customClass
    );
  }

  /**
   * 生成按钮样式
   */
  private getButtonStyles(): { [key: string]: string } {
    return {
      ...this.customStyle,
    };
  }

  // ==================== 渲染方法 ====================

  /**
   * 渲染加载图标
   */
  private renderLoadingIcon() {
    if (!this.loading) return null;

    const iconName = this.loadingIcon || 'loading';
    return (
      <span class="ld-button__loading-icon" aria-hidden="true">
        <ld-icon name={iconName} spin />
      </span>
    );
  }

  /**
   * 渲染左侧图标
   */
  private renderLeftIcon() {
    if (!this.icon || this.loading) return null;

    return (
      <span class="ld-button__icon ld-button__icon--left" aria-hidden="true">
        <ld-icon name={this.icon} />
      </span>
    );
  }

  /**
   * 渲染右侧图标
   */
  private renderRightIcon() {
    if (!this.iconRight) return null;

    return (
      <span class="ld-button__icon ld-button__icon--right" aria-hidden="true">
        <ld-icon name={this.iconRight} />
      </span>
    );
  }

  /**
   * 渲染按钮内容
   */
  private renderContent() {
    return (
      <span class="ld-button__content">
        {this.renderLoadingIcon()}
        {this.renderLeftIcon()}
        <span class="ld-button__text">
          {this.text || <slot />}
        </span>
        {this.renderRightIcon()}
      </span>
    );
  }

  render() {
    const isLink = this.type === 'link' && this.href;

    const commonProps = {
      id: this.componentId,
      class: this.getButtonClasses(),
      style: this.getButtonStyles(),
      disabled: this.disabled || this.loading,
      tabindex: this.tabIndex,
      onClick: this.handleClick,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onKeyDown: this.handleKeyDown,
      onKeyUp: this.handleKeyUp,
      'aria-disabled': String(this.disabled),
      'aria-busy': this.loading ? 'true' : undefined,
    };

    if (isLink) {
      return (
        <Host>
          <a
            {...commonProps}
            href={this.href}
            target={this.target}
            role="button"
          >
            {this.renderContent()}
          </a>
        </Host>
      );
    }

    return (
      <Host>
        <button
          {...commonProps}
          type={this.htmlType}
        >
          {this.renderContent()}
        </button>
      </Host>
    );
  }
}

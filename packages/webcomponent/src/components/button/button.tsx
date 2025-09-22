import { Component, Prop, Event, EventEmitter, h, Host } from '@stencil/core';
import { ButtonType, ButtonShape, Size } from '../../types';

/**
 * Button 按钮组件
 * 用于触发操作或导航
 */
@Component({
  tag: 'ldesign-button',
  styleUrl: 'button.less',
  shadow: false,
})
export class LdesignButton {
  /**
   * 按钮类型
   */
  @Prop() type: ButtonType = 'primary';

  /**
   * 按钮尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 按钮形状
   */
  @Prop() shape: ButtonShape = 'rectangle';

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否加载中
   */
  @Prop() loading: boolean = false;

  /**
   * 图标名称
   */
  @Prop() icon?: string;

  /**
   * 是否为块级按钮
   */
  @Prop() block: boolean = false;

  /**
   * 点击事件
   */
  @Event() ldesignClick: EventEmitter<MouseEvent>;

  /**
   * 处理点击事件
   */
  private handleClick = (event: MouseEvent) => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.ldesignClick.emit(event);
  };

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.disabled || this.loading) {
      return;
    }
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      this.handleClick(mouseEvent);
    }
  };

  /**
   * 获取按钮类名
   */
  private getButtonClass(): string {
    const classes = [
      'ldesign-button',
      `ldesign-button--${this.type}`,
      `ldesign-button--${this.size}`,
      `ldesign-button--${this.shape}`,
    ];

    if (this.disabled) {
      classes.push('ldesign-button--disabled');
    }

    if (this.loading) {
      classes.push('ldesign-button--loading');
    }

    if (this.block) {
      classes.push('ldesign-button--block');
    }

    return classes.join(' ');
  }

  /**
   * 渲染图标
   */
  private renderIcon() {
    if (this.loading) {
      return (
        <ldesign-icon 
          name="loader-2" 
          class="ldesign-button__icon ldesign-button__icon--loading"
        />
      );
    }

    if (this.icon) {
      return (
        <ldesign-icon 
          name={this.icon} 
          class="ldesign-button__icon"
        />
      );
    }

    return null;
  }

  /**
   * 渲染按钮内容
   */
  private renderContent() {
    const hasIcon = this.icon || this.loading;
    const hasSlot = true; // 假设总是有slot内容

    return (
      <span class="ldesign-button__content">
        {hasIcon && this.renderIcon()}
        {hasSlot && (
          <span class={hasIcon ? 'ldesign-button__text' : ''}>
            <slot />
          </span>
        )}
      </span>
    );
  }

  render() {
    return (
      <Host>
        <button
          class={this.getButtonClass()}
          disabled={this.disabled || this.loading}
          onClick={this.handleClick}
          onKeyDown={this.handleKeyDown}
          type="button"
          aria-disabled={this.disabled || this.loading ? 'true' : 'false'}
          aria-busy={this.loading ? 'true' : 'false'}
        >
          {this.renderContent()}
        </button>
      </Host>
    );
  }
}

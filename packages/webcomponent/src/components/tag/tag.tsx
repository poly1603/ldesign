import { Component, Prop, Event, EventEmitter, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';

/**
 * Tag 标签组件
 * 用于标记和分类
 */
@Component({
  tag: 'ldesign-tag',
  styleUrl: 'tag.less',
  shadow: false,
})
export class LdesignTag {
  @Element() el!: HTMLElement;

  /**
   * 外观风格
   * - light: 浅色背景（默认）
   * - solid: 实底
   * - outline: 描边
   */
  @Prop() variant: 'light' | 'solid' | 'outline' = 'light';

  /**
   * 语义颜色
   */
  @Prop() color: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';

  /**
   * 尺寸
   */
  @Prop() size: Size = 'middle';

  /**
   * 形状
   */
  @Prop() shape: 'rectangle' | 'round' = 'rectangle';

  /**
   * 是否可关闭
   */
  @Prop() closable: boolean = false;

  /**
   * 左侧图标
   */
  @Prop() icon?: string;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 关闭事件
   */
  @Event() ldesignClose: EventEmitter<MouseEvent>;

  private getClassList(): string {
    const classes = [
      'ldesign-tag',
      `ldesign-tag--${this.variant}`,
      `ldesign-tag--${this.size}`,
      `ldesign-tag--${this.shape}`,
      `ldesign-tag--color-${this.color}`,
    ];

    if (this.disabled) classes.push('ldesign-tag--disabled');
    if (this.closable) classes.push('ldesign-tag--closable');
    if (this.icon) classes.push('ldesign-tag--with-icon');

    return classes.join(' ');
  }

  private onCloseClick = (ev: MouseEvent) => {
    if (this.disabled) {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
    this.ldesignClose.emit(ev);
  };

  render() {
    return (
      <Host class={this.getClassList()} aria-disabled={this.disabled ? 'true' : null}>
        {this.icon && (
          <span class="ldesign-tag__icon" aria-hidden="true">
            <ldesign-icon name={this.icon} size="small"></ldesign-icon>
          </span>
        )}
        <span class="ldesign-tag__content">
          <slot />
        </span>
        {this.closable && (
          <button
            type="button"
            class="ldesign-tag__close"
            aria-label="关闭标签"
            onClick={this.onCloseClick}
          >
            <ldesign-icon name="x" size="small"></ldesign-icon>
          </button>
        )}
      </Host>
    );
  }
}

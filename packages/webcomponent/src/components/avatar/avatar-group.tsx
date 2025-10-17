import { Component, Prop, h, Host, Element, Watch, State } from '@stencil/core';

/**
 * Avatar.Group 头像组合
 * - 支持溢出显示 +N
 * - 支持统一 size/shape
 * - 支持重叠间距（gap）
 */
@Component({ tag: 'ldesign-avatar-group', styleUrl: 'avatar-group.less', shadow: false })
export class LdesignAvatarGroup {
  @Element() el!: HTMLElement;

  /** 展示的最大头像数；超出后折叠为 +N */
  @Prop() max?: number;

  /** 统一尺寸（未在子项显式指定时生效） */
  @Prop() size?: 'small' | 'middle' | 'medium' | 'large' | number;

  /** 统一形状（未在子项显式指定时生效） */
  @Prop() shape?: 'circle' | 'square';

  /** 重叠间距（正值，单位px），默认 8 */
  @Prop() gap: number = 8;

  /** 边框颜色（用于实现“描边”效果以区分重叠） */
  @Prop() borderColor: string = '#fff';

  @State() overflowCount: number = 0;

  componentDidLoad() {
    this.applyDefaults();
    this.updateOverflow();
  }

  componentDidRender() {
    this.applyDefaults();
    this.updateOverflow();
  }

  @Watch('size')
  @Watch('shape')
  onDefaultsChange() { this.applyDefaults(); }

  private applyDefaults() {
    try {
      const items = Array.from(this.el.querySelectorAll('ldesign-avatar')) as any[];
      items.forEach((it) => {
        if (this.size != null && !it.hasAttribute('size')) {
          it.setAttribute('size', String(this.size));
        }
        if (this.shape && !it.hasAttribute('shape')) {
          it.setAttribute('shape', this.shape);
        }
      });
    } catch {}
  }

  private updateOverflow() {
    // 仅统计用户提供的子项，排除由本组件渲染的“+N”占位头像
    const items = Array.from(this.el.querySelectorAll('ldesign-avatar:not(.ldesign-avatar-group__extra)')) as any[];
    const max = typeof this.max === 'number' && this.max > 0 ? this.max : items.length;
    const hidden = items.slice(max);
    this.overflowCount = Math.max(0, items.length - max);
    // 隐藏多余项
    hidden.forEach(it => it.style.display = 'none');
    items.slice(0, max).forEach(it => it.style.display = '');
  }

  private renderExtra() {
    if (!this.overflowCount) return null;
    return (
      <ldesign-avatar class="ldesign-avatar-group__extra" text={`+${this.overflowCount}`} shape={this.shape || 'circle'} size={this.size || 'medium'} background="#f0f0f0" color="#8c8c8c"></ldesign-avatar>
    );
  }

  render() {
    const gap = Math.max(0, this.gap);
    const style = {
      '--ld-avatar-group-gap': `${gap}px`,
      '--ld-avatar-group-border': this.borderColor,
    } as any;

    return (
      <Host class="ldesign-avatar-group" style={style}>
        <slot />
        {this.renderExtra()}
      </Host>
    );
  }
}
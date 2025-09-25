import { Component, Prop, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Space 间距组件
 * 用于在一组元素之间提供一致的间距与对齐控制
 */
@Component({
  tag: 'ldesign-space',
  styleUrl: 'space.less',
  shadow: false,
})
export class LdesignSpace {
  /**
   * 间距方向
   */
  @Prop() direction: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * 间距尺寸。可选预设：small | medium | large；也可传数字，单位为 px
   */
  @Prop() size: Size | number | string = 'medium';

  /**
   * 交叉轴对齐方式
   */
  @Prop() align: 'start' | 'center' | 'end' | 'baseline' = 'center';

  /**
   * 是否自动换行（仅在横向时有效）
   */
  @Prop() breakLine: boolean = false;

  /**
   * 是否占满容器宽度
   */
  @Prop() block: boolean = false;

  /**
   * 分隔符样式：none 不显示分隔符；line 使用 1px 分隔线
   */
  @Prop() split: 'none' | 'line' = 'none';

  private isPresetSize(val: any): val is Size {
    return val === 'small' || val === 'medium' || val === 'large';
  }

  private getClass(): string {
    const classes = [
      'ldesign-space',
      `ldesign-space--${this.direction}`,
      `ldesign-space--align-${this.align}`,
    ];

    if (this.isPresetSize(this.size)) {
      classes.push(`ldesign-space--${this.size}`);
    }

    if (this.breakLine) classes.push('ldesign-space--wrap');
    if (this.block) classes.push('ldesign-space--block');
    if (this.split && this.split !== 'none') classes.push(`ldesign-space--split-${this.split}`);

    return classes.join(' ');
  }

  private getStyle(): { [key: string]: string } {
    const style: { [key: string]: string } = {};

    // 数字/数字字符串自定义间距
    if (!this.isPresetSize(this.size)) {
      const n = Number(this.size as any);
      if (!Number.isNaN(n)) {
        style['--gap'] = `${n}px`;
      }
    }

    return style;
  }

  render() {
    return (
      <Host>
        <div class={this.getClass()} style={this.getStyle()}>
          <slot />
        </div>
      </Host>
    );
  }
}
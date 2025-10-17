import { Component, Prop, h, Host, Element, Watch } from '@stencil/core';

/**
 * ImageGroup 图集容器
 * - 使用 CSS Grid 布局
 * - 支持列数与间距
 * - 可给子项（ldesign-image）注入默认形状（若子项未手动指定）
 */
@Component({ tag: 'ldesign-image-group', styleUrl: 'image-group.less', shadow: false })
export class LdesignImageGroup {
  @Element() el!: HTMLElement;

  /** 列数 */
  @Prop() columns: number = 3;
  /** 间距（px） */
  @Prop() gap: number = 8;
  /** 统一子项形状（子项已设置 shape 时不覆盖） */
  @Prop() shape?: 'square' | 'rounded' | 'circle';

  @Watch('shape')
  onShapeChange() { this.applyShapeToChildren(); }

  componentDidLoad() {
    this.applyShapeToChildren();
  }

  componentDidRender() {
    this.applyShapeToChildren();
  }

  private applyShapeToChildren() {
    try {
      if (!this.shape) return;
      const items = Array.from(this.el.querySelectorAll('ldesign-image')) as any[];
      items.forEach(it => {
        if (!it.hasAttribute('shape')) {
          it.setAttribute('shape', this.shape!);
        }
      });
    } catch {}
  }

  private getStyle(): { [k: string]: string } {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.max(1, this.columns)}, 1fr)`,
      gap: `${Math.max(0, this.gap)}px`,
    } as any;
  }

  render() {
    return (
      <Host class="ldesign-image-group" style={this.getStyle()}>
        <slot />
      </Host>
    );
  }
}

import { Component, Prop, h, Host, Element, State } from '@stencil/core';

/**
 * Grid 子项
 * - 通过 span 指定跨越列数
 * - 根据父容器的 cols 自动限制最大跨度
 */
@Component({
  tag: 'ldesign-grid-item',
  styleUrl: 'grid-item.css',
  shadow: false,
})
export class LdesignGridItem {
  @Element() el!: HTMLElement;

  /**
   * 占用的列数
   */
  @Prop({ reflect: true }) span: number = 1;

  /** 父容器的列数（内部维护，用于限制 span） */
  @State() parentCols: number = 24;

  private parentObserver?: MutationObserver;

  connectedCallback() {
    this.updateParentCols();
  }

  disconnectedCallback() {
    if (this.parentObserver) {
      this.parentObserver.disconnect();
      this.parentObserver = undefined;
    }
  }

  private updateParentCols() {
    const grid = this.el.closest('ldesign-grid') as any as HTMLElement | null;
    if (grid) {
      const val = grid.getAttribute('cols');
      const n = val ? parseInt(val, 10) : NaN;
      this.parentCols = Number.isFinite(n) ? n : 24;

      if (!this.parentObserver) {
        this.parentObserver = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'cols') {
              const v = (m.target as HTMLElement).getAttribute('cols');
              const num = v ? parseInt(v, 10) : NaN;
              this.parentCols = Number.isFinite(num) ? num : this.parentCols;
            }
          }
        });
        this.parentObserver.observe(grid, { attributes: true, attributeFilter: ['cols'] });
      }
    } else {
      this.parentCols = 24;
    }
  }

  private getComputedSpan(): number {
    const raw = Math.max(1, Math.round(Number(this.span)) || 1);
    const max = Math.max(1, Number(this.parentCols) || 24);
    return Math.min(raw, max);
  }

  render() {
    return (
      <Host class="ldesign-grid-item" data-span={String(this.getComputedSpan())}>
        <slot />
      </Host>
    );
  }
}

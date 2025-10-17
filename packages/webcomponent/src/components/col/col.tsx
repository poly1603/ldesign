import { Component, Prop, h, Host, Element, State } from '@stencil/core';

/**
 * Col 列
 * - 作为 ldesign-row 的子项，通过 span 指定跨列数
 * - 会观察父 Row 或祖先 Grid 的 cols 变化以自适应
 */
@Component({
  tag: 'ldesign-col',
  styleUrl: 'col.css',
  shadow: false,
})
export class LdesignCol {
  @Element() el!: HTMLElement;

  /** 占用的列数 */
  @Prop() span: number = 1;

  @State() parentCols: number = 24;

  private rowObserver?: MutationObserver;
  private gridObserver?: MutationObserver;

  connectedCallback() {
    this.updateParentCols(true);
  }

  disconnectedCallback() {
    if (this.rowObserver) { this.rowObserver.disconnect(); this.rowObserver = undefined; }
    if (this.gridObserver) { this.gridObserver.disconnect(); this.gridObserver = undefined; }
  }

  private parseColsFrom(el: HTMLElement | null | undefined): number | undefined {
    if (!el) return undefined;
    const val = el.getAttribute('cols');
    const n = val ? parseInt(val, 10) : NaN;
    return Number.isFinite(n) ? n : undefined;
  }

  private updateParentCols(setupWatchers = false) {
    const row = this.el.closest('ldesign-row') as any as HTMLElement | null;
    const grid = this.el.closest('ldesign-grid') as any as HTMLElement | null;

    const fromRow = this.parseColsFrom(row);
    const fromGrid = this.parseColsFrom(grid);

    this.parentCols = fromRow ?? fromGrid ?? 24;

    if (setupWatchers) {
      if (row && !this.rowObserver) {
        this.rowObserver = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'cols') {
              const next = this.parseColsFrom(row);
              if (next !== undefined) {
                this.parentCols = next;
              } else if (grid) {
                const fallback = this.parseColsFrom(grid);
                this.parentCols = fallback ?? 24;
              } else {
                this.parentCols = 24;
              }
            }
          }
        });
        this.rowObserver.observe(row, { attributes: true, attributeFilter: ['cols'] });
      }

      if (grid && !this.gridObserver) {
        this.gridObserver = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'cols') {
              const nextFromRow = this.parseColsFrom(this.el.closest('ldesign-row') as any as HTMLElement | null);
              if (nextFromRow !== undefined) {
                this.parentCols = nextFromRow;
              } else {
                const nextFromGrid = this.parseColsFrom(grid);
                this.parentCols = nextFromGrid ?? 24;
              }
            }
          }
        });
        this.gridObserver.observe(grid, { attributes: true, attributeFilter: ['cols'] });
      }
    }
  }

  private getComputedSpan(): number {
    const raw = Math.max(1, Math.round(Number(this.span)) || 1);
    const max = Math.max(1, Number(this.parentCols) || 24);
    return Math.min(raw, max);
  }

  render() {
    return (
      <Host class="ldesign-col" style={{ 'grid-column': `span ${this.getComputedSpan()}` }}>
        <slot />
      </Host>
    );
  }
}

import { Component, Prop, h, Host, Element } from '@stencil/core';

/**
 * Row 行容器
 * - 作为一行的网格容器
 * - 可独立配置列数与间距，或继承上级 ldesign-grid 的默认值
 */
@Component({
  tag: 'ldesign-row',
  styleUrl: 'row.css',
  shadow: false,
})
export class LdesignRow {
  @Element() el!: HTMLElement;

  /** 每行的列数；未设置时将继承上级 ldesign-grid 的 cols（默认 24） */
  @Prop({ reflect: true }) cols?: number;

  /** 统一间距（横纵同时生效），number 视为 px；未设置则继承上级 ldesign-grid 的 gap */
  @Prop() gap?: number | string;

  /** 横向列间距；未设置时取 gap，再继承上级 grid 的 x-gap/gap */
  @Prop() xGap?: number | string;

  /** 纵向行间距；未设置时取 gap，再继承上级 grid 的 y-gap/gap */
  @Prop() yGap?: number | string;

  /** 是否密集填充（尽量填补空位）；未设置时继承上级 grid，默认 true */
  @Prop({ reflect: true }) dense?: boolean;

  private toCssSize(val?: number | string): string | undefined {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'number') return `${val}px`;
    const s = String(val).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
    return s;
  }

  private readFromGrid(): { cols?: number; x?: string; y?: string; dense?: boolean } {
    const grid = this.el.closest('ldesign-grid') as any as HTMLElement | null;
    if (!grid) return {};

    const colsAttr = grid.getAttribute('cols');
    const denseAttr = grid.getAttribute('dense');
    const gapAttr = grid.getAttribute('gap');
    const xGapAttr = grid.getAttribute('x-gap');
    const yGapAttr = grid.getAttribute('y-gap');

    const parseSize = (v?: string | null) => {
      if (!v) return undefined;
      if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
      return v;
    };

    return {
      cols: colsAttr ? parseInt(colsAttr, 10) : undefined,
      x: parseSize(xGapAttr) || parseSize(gapAttr),
      y: parseSize(yGapAttr) || parseSize(gapAttr),
      dense: denseAttr === null ? undefined : denseAttr !== 'false',
    };
  }

  private getEffective(): { cols: number; x: string; y: string; dense: boolean } {
    const inherited = this.readFromGrid();

    const effectiveCols = (this.cols ?? inherited.cols ?? 24);

    const ownX = this.toCssSize(this.xGap ?? this.gap);
    const ownY = this.toCssSize(this.yGap ?? this.gap);
    const effectiveX = ownX ?? inherited.x ?? '0px';
    const effectiveY = ownY ?? inherited.y ?? '0px';

    const effectiveDense = (this.dense ?? inherited.dense ?? true);

    return { cols: effectiveCols, x: effectiveX, y: effectiveY, dense: effectiveDense };
  }

  private getClass(): string {
    const eff = this.getEffective();
    const classes = ['ldesign-row'];
    if (eff.dense) classes.push('ldesign-row--dense');
    return classes.join(' ');
  }

  private getStyle(): { [key: string]: string } {
    const eff = this.getEffective();
    return {
      '--ld-row-cols': String(eff.cols),
      '--ld-row-x-gap': eff.x,
      '--ld-row-y-gap': eff.y,
    } as any;
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

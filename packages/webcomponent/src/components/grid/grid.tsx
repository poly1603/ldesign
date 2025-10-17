import { Component, Prop, h, Host, Element, Watch, State } from '@stencil/core';

/**
 * Grid 容器（grid -> grid-item 用法）
 * - 在内部通过计算为每个 grid-item 设置明确的行/列位置与跨度
 * - 支持设置每行列数与横纵间距
 */
@Component({
  tag: 'ldesign-grid',
  styleUrl: 'grid.css',
  shadow: false,
})
export class LdesignGrid {
  @Element() el!: HTMLElement;
  private mo?: MutationObserver;
  private ro?: ResizeObserver;
  private scheduleId?: number;
  private layingOut = false;
  private toggleEl?: HTMLElement;
  private toggleBtn?: HTMLButtonElement;

  @State() private computedCols: number = 1;

  /** 固定列数（可选）。若不设置，则根据 minColWidth 自动计算最佳列数 */
  @Prop({ reflect: true }) cols?: number;

  /** 每列的最小宽度，用于自适应计算列数；数字为 px；默认 240 */
  @Prop() minColWidth: number | string = 240;

  /** 同时设置横纵间距（数字按 px） */
  @Prop() gap?: number | string;

  /** 横向列间距 */
  @Prop() xGap?: number | string;

  /** 纵向行间距 */
  @Prop() yGap?: number | string;

  /** 折叠时默认显示的行数；0 或未设置表示显示全部 */
  @Prop() defaultRows?: number;

  /** 展开按钮所在列宽（span） */
  @Prop() toggleSpan: number = 8;

  /** 是否使用密集填充（尽量填补空位）；显式定位下仅作类名标识 */
  @Prop() dense: boolean = false;

  /** 是否已展开（内部状态） */
  // @State 不一定需要暴露到外部，使用私有字段即可
  private expanded: boolean = false;

  @Watch('cols') onColsChange() { this.scheduleLayout(); }
  @Watch('gap') onGapChange() { this.scheduleRecalc(); }
  @Watch('xGap') onXGapChange() { this.scheduleRecalc(); }
  @Watch('yGap') onYGapChange() { /* 纵向间距不影响列数 */ }
  @Watch('dense') onDenseChange() { /* 类名变化不影响布局位置 */ }
  @Watch('defaultRows') onDefaultRowsChange() { this.scheduleLayout(); }
  @Watch('toggleSpan') onToggleSpanChange() { this.scheduleLayout(); }
  @Watch('minColWidth') onMinColWidthChange() { this.scheduleRecalc(); }

  componentDidLoad() {
    this.observe();
    this.setupResize();
    this.recalcCols();
    this.layoutItems();
  }

  disconnectedCallback() {
    if (this.mo) { this.mo.disconnect(); this.mo = undefined; }
    if (this.ro) { this.ro.disconnect(); this.ro = undefined; }
    if (this.scheduleId) { clearTimeout(this.scheduleId); this.scheduleId = undefined; }
  }

  private toCssSize(val?: number | string): string | undefined {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'number') return `${val}px`;
    const s = String(val).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
    return s;
  }

  private toPxNumber(val?: number | string): number | undefined {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'number') return val;
    const s = String(val).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    if (/^\d+(\.\d+)?px$/.test(s)) return parseFloat(s);
    return undefined; // 复杂单位不换算
  }

  private getEffectiveCols(): number {
    const c = Number(this.cols);
    if (Number.isFinite(c) && c > 0) return c;
    return Math.max(1, Number(this.computedCols) || 1);
  }

  private scheduleRecalc() {
    // 先重算列数，再布局
    this.recalcCols();
    this.scheduleLayout();
  }

  private setupResize() {
    if (this.ro) return;
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.scheduleRecalc());
      this.ro.observe(this.el);
    } else {
      window.addEventListener('resize', this.scheduleRecalc.bind(this));
    }
  }

  private recalcCols() {
    const width = this.el?.clientWidth || this.el?.getBoundingClientRect()?.width || 0;
    const gapPx = this.toPxNumber(this.xGap ?? this.gap) ?? 0;
    const minPx = this.toPxNumber(this.minColWidth) ?? 240;
    const cols = Math.max(1, Math.floor((width + gapPx) / (minPx + gapPx)));
    this.computedCols = cols;
  }

  private getStyle(): { [key: string]: string } {
    const x = this.toCssSize(this.xGap ?? this.gap ?? 0) as string;
    const y = this.toCssSize(this.yGap ?? this.gap ?? 0) as string;
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(var(--ld-grid-cols, 24), minmax(0, 1fr))',
      columnGap: 'var(--ld-grid-x-gap, 0px)',
      rowGap: 'var(--ld-grid-y-gap, 0px)',
'--ld-grid-cols': String(this.getEffectiveCols()),
      '--ld-grid-x-gap': x || '0px',
      '--ld-grid-y-gap': y || '0px',
      width: '100%',
      boxSizing: 'border-box',
    } as any;
  }

  private getClass(): string {
    const classes = ['ldesign-grid'];
    if (this.dense) classes.push('ldesign-grid--dense');
    return classes.join(' ');
  }

  private observe() {
    if (this.mo || !this.el) return;
    this.mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') { this.scheduleLayout(); return; }
        if (m.type === 'attributes' && m.attributeName === 'span') { this.scheduleLayout(); return; }
      }
    });
    this.mo.observe(this.el, { childList: true, subtree: true, attributes: true, attributeFilter: ['span'] });
  }

  private scheduleLayout() {
    if (this.scheduleId) clearTimeout(this.scheduleId);
    this.scheduleId = window.setTimeout(() => this.layoutItems(), 0);
  }

  private getItems(): HTMLElement[] {
    const kids = Array.from(this.el.children) as HTMLElement[];
    return kids.filter(el => el.tagName === 'LDESIGN-GRID-ITEM' && !el.hasAttribute('data-toggle'));
  }

  private parseSpan(el: HTMLElement): number {
    const raw = el.getAttribute('span');
    const n = raw ? parseInt(raw, 10) : NaN;
    const span = Number.isFinite(n) ? n : 1;
    const max = Math.max(1, this.getEffectiveCols());
    return Math.min(Math.max(1, span), max);
  }

  private clearInlinePlacement(el: HTMLElement) {
    el.style.removeProperty('grid-row-start');
    el.style.removeProperty('grid-row-end');
    el.style.removeProperty('grid-column-start');
    el.style.removeProperty('grid-column-end');
  }

  private ensureToggle() {
    if (!this.toggleEl) {
      this.toggleEl = document.createElement('ldesign-grid-item') as any;
      this.toggleEl.setAttribute('data-toggle', 'true');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ldesign-grid__toggle-btn';
      btn.addEventListener('click', () => {
        this.expanded = !this.expanded;
        this.scheduleLayout();
      });
      this.toggleBtn = btn;
      this.toggleEl.appendChild(btn);
      this.el.appendChild(this.toggleEl);
    }
    // 根据当前状态更新按钮文案
    if (this.toggleBtn) {
      this.toggleBtn.textContent = this.expanded ? '收起' : '展开更多';
      this.toggleBtn.setAttribute('aria-expanded', this.expanded ? 'true' : 'false');
    }
    return this.toggleEl;
  }

  private removeToggle() {
    if (this.toggleEl && this.toggleEl.parentElement === this.el) {
      try { this.el.removeChild(this.toggleEl); } catch (_) {}
    }
    this.toggleEl = undefined;
  }

  private layoutItems() {
    if (this.layingOut) return;
    this.layingOut = true;
    try {
      const items = this.getItems();
      const maxCols = Math.max(1, this.getEffectiveCols());
      const toggleSpan = Math.min(Math.max(1, Number(this.toggleSpan) || 8), maxCols);

      // 预排布（全部），计算总行数
      let row = 1; let col = 1;
      const fullPositions: { el: HTMLElement; row: number; col: number; span: number }[] = [];
      for (const it of items) {
        const span = this.parseSpan(it);
        if (col + span - 1 > maxCols) { row += 1; col = 1; }
        fullPositions.push({ el: it, row, col, span });
        col += span;
      }
      const totalRows = fullPositions.length ? fullPositions[fullPositions.length - 1].row : 0;

      const canCollapse = !!(this.defaultRows && this.defaultRows > 0 && totalRows > this.defaultRows);

      if (!canCollapse) {
        // 应用完整排布，且不显示 toggle
        for (const { el, row, col, span } of fullPositions) {
          this.clearInlinePlacement(el);
          el.style.display = '';
          el.style.gridRowStart = String(row);
          el.style.gridColumnStart = String(col);
          el.style.gridColumnEnd = `span ${span}`;
          el.setAttribute('data-row', String(row));
          el.setAttribute('data-col-start', String(col));
          el.setAttribute('data-span', String(span));
        }
        this.removeToggle();
        return;
      }

      if (this.expanded) {
        // 展开状态：放置全部 item，然后把 toggle 放到最后
        let lastRow = 1; let lastCol = 1;
        for (const { el, row, col, span } of fullPositions) {
          this.clearInlinePlacement(el);
          el.style.display = '';
          el.style.gridRowStart = String(row);
          el.style.gridColumnStart = String(col);
          el.style.gridColumnEnd = `span ${span}`;
          el.setAttribute('data-row', String(row));
          el.setAttribute('data-col-start', String(col));
          el.setAttribute('data-span', String(span));
          lastRow = row;
          lastCol = col + span; // 下一列起点
        }
        const toggle = this.ensureToggle();
        let tRow = lastRow; let tCol = lastCol;
        if (tCol + toggleSpan - 1 > maxCols) { tRow += 1; tCol = 1; }
        toggle.setAttribute('span', String(toggleSpan));
        toggle.style.display = '';
        toggle.style.gridRowStart = String(tRow);
        toggle.style.gridColumnStart = String(tCol);
        toggle.style.gridColumnEnd = `span ${toggleSpan}`;
        toggle.setAttribute('data-row', String(tRow));
        toggle.setAttribute('data-col-start', String(tCol));
        toggle.setAttribute('data-span', String(toggleSpan));
        return;
      }

      // 折叠状态：仅放入 defaultRows 行，并在最后预留 toggle
      let visRow = 1; let visCol = 1;
      const visible: { el: HTMLElement; row: number; col: number; span: number }[] = [];
      for (const it of items) {
        const span = this.parseSpan(it);
        if (visCol + span - 1 > maxCols) { visRow += 1; visCol = 1; }
        if (visRow < (this.defaultRows as number)) {
          visible.push({ el: it, row: visRow, col: visCol, span });
          visCol += span;
          continue;
        }
        if (visRow === (this.defaultRows as number)) {
          const remaining = maxCols - visCol + 1;
          if (span <= Math.max(0, remaining - toggleSpan)) {
            visible.push({ el: it, row: visRow, col: visCol, span });
            visCol += span;
            continue;
          } else {
            break;
          }
        }
        break;
      }

      // 应用可见项
      const visibleSet = new Set(visible.map(v => v.el));
      for (const { el, row, col, span } of visible) {
        this.clearInlinePlacement(el);
        el.style.display = '';
        el.style.gridRowStart = String(row);
        el.style.gridColumnStart = String(col);
        el.style.gridColumnEnd = `span ${span}`;
        el.setAttribute('data-row', String(row));
        el.setAttribute('data-col-start', String(col));
        el.setAttribute('data-span', String(span));
      }
      for (const it of items) {
        if (!visibleSet.has(it)) {
          it.style.display = 'none';
        }
      }

      const toggle = this.ensureToggle();
      const toggleColStart = visCol; // 预留时已保证足够空间
      toggle.setAttribute('span', String(toggleSpan));
      toggle.style.display = '';
      toggle.style.gridRowStart = String(this.defaultRows);
      toggle.style.gridColumnStart = String(toggleColStart);
      toggle.style.gridColumnEnd = `span ${toggleSpan}`;
      toggle.setAttribute('data-row', String(this.defaultRows));
      toggle.setAttribute('data-col-start', String(toggleColStart));
      toggle.setAttribute('data-span', String(toggleSpan));
    } finally {
      this.layingOut = false;
    }
  }

  render() {
    return (
      <Host class={this.getClass()} style={this.getStyle()}>
        <slot />
      </Host>
    );
  }
}

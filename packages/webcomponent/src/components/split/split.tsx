import { Component, Prop, State, Event, EventEmitter, h, Host, Element } from '@stencil/core';

/**
 * Split 面板分割
 * 将容器分为左右（vertical）或上下（horizontal）两部分，通过拖拽中间分割条调整比例。
 *
 * - 组件名：<ldesign-split>
 * - 方向：vertical（左右）| horizontal（上下）
 * - 比例：value（0~1），表示起始面板所占比例。拖拽过程中会回写。
 * - 约束：firstMin / secondMin 用于限制两侧最小尺寸（px）。
 * - 事件：ldesignSplitStart / ldesignSplit / ldesignSplitEnd
 */
@Component({
  tag: 'ldesign-split',
  styleUrl: 'split.less',
  shadow: false,
})
export class LdesignSplit {
  @Element() host!: HTMLElement;

  /** 分割方向：vertical=左右，horizontal=上下 */
  @Prop({ reflect: true }) direction: 'vertical' | 'horizontal' = 'vertical';

  /** 起始面板比例（0~1）。拖拽过程中会以小数写回 */
  @Prop({ mutable: true, reflect: true }) value: number = 0.5;

  /** 起始/末尾面板的最小尺寸（px） */
  @Prop() firstMin: number = 80;
  @Prop() secondMin: number = 80;

  /** 分割条厚度（px） */
  @Prop() splitterSize: number = 6;

  /** 是否禁用拖拽 */
  @Prop() disabled: boolean = false;

  /** 拖拽事件 */
  @Event() ldesignSplitStart!: EventEmitter<{ value: number; direction: 'vertical' | 'horizontal' }>;
  @Event() ldesignSplit!: EventEmitter<{ value: number; direction: 'vertical' | 'horizontal' }>;
  @Event() ldesignSplitEnd!: EventEmitter<{ value: number; direction: 'vertical' | 'horizontal' }>;

  @State() private dragging = false;

  private onSplitterPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    this.dragging = true;
    this.ldesignSplitStart.emit({ value: this.value, direction: this.direction });
    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onWindowPointerUp, { passive: false });
  };

  private clampRatio(r: number, rect: DOMRect): number {
    const isVertical = this.direction === 'vertical';
    const total = isVertical ? rect.width : rect.height;
    const available = Math.max(0, total - this.splitterSize);
    if (available <= 0) return 0.5;

    const minR = Math.max(0, Math.min(1, this.firstMin / available));
    const maxR = Math.max(0, Math.min(1, 1 - this.secondMin / available));
    if (minR > maxR) return 0.5; // 无法满足约束时，给个中间值

    return Math.min(maxR, Math.max(minR, r));
  }

  private onWindowPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    e.preventDefault();

    const rect = this.host.getBoundingClientRect();
    const isVertical = this.direction === 'vertical';
    const total = isVertical ? rect.width : rect.height;
    const available = Math.max(0, total - this.splitterSize);
    if (available <= 0) return;

    let pos = isVertical ? e.clientX - rect.left : e.clientY - rect.top;
    // 让光标位于分割条中心时为准确位置
    pos = pos - this.splitterSize / 2;
    const ratio = this.clampRatio(pos / available, rect);

    this.value = Math.round(ratio * 1000) / 1000; // 控制小数位，避免抖动
    this.ldesignSplit.emit({ value: this.value, direction: this.direction });
  };

  private onWindowPointerUp = (_e: PointerEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    this.ldesignSplitEnd.emit({ value: this.value, direction: this.direction });
    window.removeEventListener('pointermove', this.onWindowPointerMove as any);
    window.removeEventListener('pointerup', this.onWindowPointerUp as any);
  };

  private getRootClass() {
    const cls = ['ldesign-split', `ldesign-split--${this.direction}`];
    if (this.dragging) cls.push('ldesign-split--dragging');
    if (this.disabled) cls.push('ldesign-split--disabled');
    return cls.join(' ');
  }

  private getVars() {
    return {
      ['--ld-splitter-size' as any]: `${this.splitterSize}px`,
      ['--ld-split-value' as any]: String(this.value),
    } as any;
  }

  render() {
    const isVertical = this.direction === 'vertical';

    const startStyle: any = isVertical
      ? { minWidth: `${this.firstMin}px` }
      : { minHeight: `${this.firstMin}px` };

    const endStyle: any = isVertical
      ? { minWidth: `${this.secondMin}px` }
      : { minHeight: `${this.secondMin}px` };

    return (
      <Host>
        <div class={this.getRootClass()} style={this.getVars()} aria-disabled={this.disabled ? 'true' : undefined}>
          <div class="ldesign-split__pane ldesign-split__pane--start" style={startStyle}>
            <slot name="start"></slot>
          </div>

          <div
            class="ldesign-split__splitter"
            role="separator"
            aria-orientation={this.direction === 'vertical' ? 'vertical' : 'horizontal'}
            onPointerDown={this.onSplitterPointerDown as any}
          ></div>

          <div class="ldesign-split__pane ldesign-split__pane--end" style={endStyle}>
            <slot name="end"></slot>
          </div>
        </div>
      </Host>
    );
  }
}

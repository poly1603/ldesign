import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Fragment } from '@stencil/core';

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

  /** 是否显示快捷折叠按钮 */
  @Prop() collapsible: boolean = false;

  /** 折叠状态：none | start | end */
  @Prop({ mutable: true, reflect: true }) collapsed: 'none' | 'start' | 'end' = 'none';

  /** 折叠后保留的尺寸（px） */
  @Prop() collapsedSize: number = 0;

  /** 折叠状态下是否允许通过拖拽恢复 */
  @Prop() allowDragExpandWhenCollapsed: boolean = true;

  /** 是否禁用拖拽 */
  @Prop() disabled: boolean = false;

  /** 拖拽事件 */
  @Event() ldesignSplitStart!: EventEmitter<{ value: number; direction: 'vertical' | 'horizontal' }>;
  @Event() ldesignSplit!: EventEmitter<{ value: number; direction: 'vertical' | 'horizontal' }>;
  @Event() ldesignSplitEnd!: EventEmitter<{ value: number; direction: 'vertical' | 'horizontal' }>;
  /** 折叠切换事件 */
  @Event() ldesignSplitCollapse!: EventEmitter<{ side: 'none' | 'start' | 'end' }>;

  @State() private dragging = false;
  @State() private lastValueBeforeCollapse: number | undefined;

  private onSplitterPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    // 折叠且不允许拖拽恢复时，直接拦截
    if (this.collapsed !== 'none' && !this.allowDragExpandWhenCollapsed) {
      e.preventDefault();
      return;
    }
    e.preventDefault();

    // 若允许拖拽恢复，开始拖拽前先退出折叠
    if (this.collapsed !== 'none') {
      this.collapsed = 'none';
      this.ldesignSplitCollapse.emit({ side: 'none' });
    }

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
    if (this.collapsed === 'start') cls.push('ldesign-split--collapsed-start');
    if (this.collapsed === 'end') cls.push('ldesign-split--collapsed-end');
    if (this.collapsible) cls.push('ldesign-split--collapsible');
    return cls.join(' ');
  }

  private getVars() {
    return {
      ['--ld-splitter-size' as any]: `${this.splitterSize}px`,
      ['--ld-split-value' as any]: String(this.value),
      ['--ld-collapsed-size' as any]: `${this.collapsedSize}px`,
    } as any;
  }

  private setCollapsed(side: 'none' | 'start' | 'end') {
    if (side === this.collapsed) {
      // 如果重复点击同侧，则展开恢复
      const prev = this.lastValueBeforeCollapse;
      this.collapsed = 'none';
      if (typeof prev === 'number') this.value = prev;
      this.ldesignSplitCollapse.emit({ side: 'none' });
      return;
    }
    if (side === 'start' || side === 'end') {
      this.lastValueBeforeCollapse = this.value;
      this.collapsed = side;
      this.ldesignSplitCollapse.emit({ side });
      return;
    }
    this.collapsed = 'none';
    this.ldesignSplitCollapse.emit({ side: 'none' });
  }

  private renderCollapseControls() {
    if (!this.collapsible) return null;
    const isVertical = this.direction === 'vertical';
    const startIcon = isVertical ? '‹' : '▲';
    const endIcon = isVertical ? '›' : '▼';
    const onBtnPointerDown = (e: PointerEvent) => {
      // 阻止触发分割条拖拽，但不阻止 click 事件
      e.stopPropagation();
    };
    return (
      <div class="ldesign-split__collapse">
        <button type="button" class="ldesign-split__collapse-btn" title="折叠起始面板"
          onPointerDown={onBtnPointerDown}
          onClick={() => this.setCollapsed(this.collapsed === 'start' ? 'none' : 'start')}
        >{startIcon}</button>
        <button type="button" class="ldesign-split__collapse-btn" title="折叠末尾面板"
          onPointerDown={onBtnPointerDown}
          onClick={() => this.setCollapsed(this.collapsed === 'end' ? 'none' : 'end')}
        >{endIcon}</button>
      </div>
    );
  }

  private renderEdgeControls() {
    const isVertical = this.direction === 'vertical';
    const showStart = this.collapsed === 'start';
    const showEnd = this.collapsed === 'end';
    if (!showStart && !showEnd) return null;

    const startIcon = isVertical ? '›' : '▼';
    const endIcon = isVertical ? '‹' : '▲';

    const onEdgePointerDown = (e: PointerEvent) => {
      e.stopPropagation();
    };

    return (
      <Fragment>
        {showStart && (
          <div class="ldesign-split__edge ldesign-split__edge--start">
            <button type="button" class="ldesign-split__edge-btn" title={isVertical ? '展开左侧' : '展开上侧'}
              onPointerDown={onEdgePointerDown}
              onClick={() => this.setCollapsed('none')}
            >{startIcon}</button>
          </div>
        )}
        {showEnd && (
          <div class="ldesign-split__edge ldesign-split__edge--end">
            <button type="button" class="ldesign-split__edge-btn" title={isVertical ? '展开右侧' : '展开下侧'}
              onPointerDown={onEdgePointerDown}
              onClick={() => this.setCollapsed('none')}
            >{endIcon}</button>
          </div>
        )}
      </Fragment>
    );
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
          >
            {this.renderCollapseControls()}
          </div>

          <div class="ldesign-split__pane ldesign-split__pane--end" style={endStyle}>
            <slot name="end"></slot>
          </div>
          {this.renderEdgeControls()}
        </div>
      </Host>
    );
  }
}

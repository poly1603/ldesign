import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * ResizeBox 伸缩框
 * 可通过拖拽指定边来改变容器宽高
 */
@Component({
  tag: 'ldesign-resize-box',
  styleUrl: 'resize-box.less',
  shadow: false,
})
export class LdesignResizeBox {
  @Element() host!: HTMLElement;

  /** 初始宽度。可传数字（px）或任何合法 CSS 宽度值（如 '100%'）。拖拽后以 px 写回。 */
  @Prop({ mutable: true, reflect: true }) width: number | string = 360;
  /** 初始高度。可传数字（px）或任何合法 CSS 高度值（如 'auto'）。拖拽后以 px 写回。 */
  @Prop({ mutable: true, reflect: true }) height: number | string = 200;

  /** 允许伸缩的边：top/right/bottom/left。默认允许 right 与 bottom，满足常见的“右/下/右下角”拖拽需求 */
  @Prop() directions: string | Array<'top' | 'right' | 'bottom' | 'left'> = 'right,bottom';

  /** 角落把手：top-left/top-right/bottom-right/bottom-left。字符串或数组。默认仅启用 bottom-right。*/
  @Prop() corners: string | Array<'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'> = 'bottom-right';

  /** 吸附步进（px）。>0 时，拖拽尺寸会对齐到该步进的整数倍。 */
  @Prop() snap: number = 0;

  /** 受控模式：为 true 时，不会修改 width/height，外部应在事件中设置新值传回 */
  @Prop() controlled: boolean = false;

  /** 最小/最大尺寸（px） */
  @Prop() minWidth: number = 80;
  @Prop() minHeight: number = 60;
  @Prop() maxWidth?: number;
  @Prop() maxHeight?: number;

  /** 是否禁用伸缩 */
  @Prop() disabled: boolean = false;

  /** 尺寸标识，仅影响样式（边框、把手大小等） */
  @Prop() size: Size = 'medium';

  /** 拖拽开始/进行中/结束事件 */
  @Event() ldesignResizeStart!: EventEmitter<{ width: number; height: number; edge: string }>;
  @Event() ldesignResize!: EventEmitter<{ width: number; height: number; edge: string }>;
  @Event() ldesignResizeEnd!: EventEmitter<{ width: number; height: number; edge: string }>;

  @State() private resizing = false;
  @State() private activeEdge: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left' | null = null;

  private currentW: number = 360;
  private currentH: number = 200;

  private containerEl?: HTMLElement;
  private activePointerId?: number;

  private startX = 0;
  private startY = 0;
  private startW = 0;
  private startH = 0;

  private parseNumber(v: number | string | undefined, fallback: number): number {
    if (v == null) return fallback;
    if (typeof v === 'number') return v;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  private parseList<T extends string>(val: string | T[] | undefined | null, all: T[]): Set<T> {
    if (!val) return new Set(all);
    if (Array.isArray(val)) return new Set(val as T[]);
    const parts = String(val)
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(Boolean) as T[];
    return new Set(parts.length ? parts : all);
  }

  private getAllowed() {
    const edgeAll: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
    const cornerAll: Array<'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'> = [
      'top-left','top-right','bottom-right','bottom-left'
    ];
    return {
      edges: this.parseList(this.directions as any, edgeAll),
      corners: this.parseList(this.corners as any, cornerAll)
    };
  }

  private clampW(w: number): number {
    const mw = Math.max(0, this.minWidth);
    const max = this.maxWidth != null ? this.maxWidth : Number.POSITIVE_INFINITY;
    return Math.min(max, Math.max(mw, Math.round(w)));
  }

  private clampH(h: number): number {
    const mh = Math.max(0, this.minHeight);
    const max = this.maxHeight != null ? this.maxHeight : Number.POSITIVE_INFINITY;
    return Math.min(max, Math.max(mh, Math.round(h)));
  }

  private onEdgePointerDown = (edge: 'top' | 'right' | 'bottom' | 'left') => (e: PointerEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    const rect = this.host.getBoundingClientRect();
    // 当前实际像素作为起点
    this.startW = this.parseNumber(this.width, rect.width);
    this.startH = this.parseNumber(this.height, rect.height);
    this.currentW = this.startW;
    this.currentH = this.startH;

    if (this.containerEl) {
      this.containerEl.style.width = `${this.currentW}px`;
      this.containerEl.style.height = `${this.currentH}px`;
    }

    this.startX = e.clientX;
    this.startY = e.clientY;
    this.activeEdge = edge;
    this.resizing = true;

    // 捕获指针，保证拖拽顺畅不中断
    try { (e.target as Element)?.setPointerCapture?.(e.pointerId); this.activePointerId = e.pointerId; } catch {}

    this.ldesignResizeStart.emit({ width: this.startW, height: this.startH, edge });

    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onWindowPointerUp, { passive: false, once: false });
  };

  private onCornerPointerDown = (corner: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left') => (e: PointerEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    const rect = this.host.getBoundingClientRect();
    this.startW = this.parseNumber(this.width, rect.width);
    this.startH = this.parseNumber(this.height, rect.height);
    this.currentW = this.startW;
    this.currentH = this.startH;

    if (this.containerEl) {
      this.containerEl.style.width = `${this.currentW}px`;
      this.containerEl.style.height = `${this.currentH}px`;
    }

    this.startX = e.clientX;
    this.startY = e.clientY;
    this.activeEdge = corner;
    this.resizing = true;

    try { (e.target as Element)?.setPointerCapture?.(e.pointerId); this.activePointerId = e.pointerId; } catch {}

    this.ldesignResizeStart.emit({ width: this.startW, height: this.startH, edge: corner });

    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onWindowPointerUp, { passive: false, once: false });
  };

  private onWindowPointerMove = (e: PointerEvent) => {
    if (!this.resizing || !this.activeEdge) return;
    e.preventDefault();

    let newW = this.startW;
    let newH = this.startH;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    switch (this.activeEdge) {
      case 'right':
        newW = this.startW + dx; break;
      case 'left':
        newW = this.startW - dx; break;
      case 'bottom':
        newH = this.startH + dy; break;
      case 'top':
        newH = this.startH - dy; break;
      case 'bottom-right':
        newW = this.startW + dx; newH = this.startH + dy; break;
      case 'bottom-left':
        newW = this.startW - dx; newH = this.startH + dy; break;
      case 'top-right':
        newW = this.startW + dx; newH = this.startH - dy; break;
      case 'top-left':
        newW = this.startW - dx; newH = this.startH - dy; break;
    }

    // 吸附步进
    if (this.snap > 0) {
      const s = this.snap;
      if (Number.isFinite(newW)) newW = Math.round(newW / s) * s;
      if (Number.isFinite(newH)) newH = Math.round(newH / s) * s;
    }

    newW = this.clampW(newW);
    newH = this.clampH(newH);

    // 更新内部显示尺寸与容器样式（避免频繁触发重渲染，保证顺畅）
    this.currentW = newW;
    this.currentH = newH;
    if (this.containerEl) {
      this.containerEl.style.width = `${this.currentW}px`;
      this.containerEl.style.height = `${this.currentH}px`;
    }

    // 拖拽中不写回 props，仅发事件，最终在 pointerup 提交
    this.ldesignResize.emit({ width: newW, height: newH, edge: this.activeEdge });
  };

  private onWindowPointerUp = (_e: PointerEvent) => {
    if (!this.resizing || !this.activeEdge) return;
    this.resizing = false;
    const edge = this.activeEdge;
    this.activeEdge = null;

    const w = this.currentW;
    const h = this.currentH;

    // 非受控：确保最终尺寸同步到 prop
    if (!this.controlled) {
      this.width = w;
      this.height = h;
    }

    this.ldesignResizeEnd.emit({ width: w, height: h, edge });

    try {
      if (this.activePointerId != null) {
        // 释放捕获
        (this.host as any)?.releasePointerCapture?.(this.activePointerId);
      }
    } catch {}

    window.removeEventListener('pointermove', this.onWindowPointerMove as any);
    window.removeEventListener('pointerup', this.onWindowPointerUp as any);
  };

  disconnectedCallback() {
    // 组件被移除时确保清理全局事件
    window.removeEventListener('pointermove', this.onWindowPointerMove as any);
    window.removeEventListener('pointerup', this.onWindowPointerUp as any);
  }

  private getRootClass(): string {
    const cls = ['ldesign-resize-box', `ldesign-resize-box--${this.size}`];
    if (this.disabled) cls.push('ldesign-resize-box--disabled');
    if (this.resizing) cls.push('ldesign-resize-box--resizing');
    return cls.join(' ');
  }

  @Watch('width')
  onWidthChange(next: number | string) {
    const rect = this.host.getBoundingClientRect();
    this.currentW = this.parseNumber(next as any, rect.width);
  }

  @Watch('height')
  onHeightChange(next: number | string) {
    const rect = this.host.getBoundingClientRect();
    this.currentH = this.parseNumber(next as any, rect.height);
  }

  componentWillLoad() {
    // 初始化 current 尺寸
    const rect = this.host.getBoundingClientRect?.();
    const rw = rect?.width ?? 360;
    const rh = rect?.height ?? 200;
    this.currentW = this.parseNumber(this.width, rw);
    this.currentH = this.parseNumber(this.height, rh);
  }

  private getInlineStyle() {
    const style: { [k: string]: string } = {};
    style.width = `${this.currentW}px`;
    style.height = `${this.currentH}px`;
    return style;
  }

  render() {
    const { edges, corners } = this.getAllowed();

    return (
      <Host>
        <div class={this.getRootClass()} style={this.getInlineStyle()} ref={(el) => (this.containerEl = el)}>
          <div class="ldesign-resize-box__content">
            <slot />
          </div>

          {!this.disabled && edges.has('top') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--top" onPointerDown={this.onEdgePointerDown('top') as any} />
          )}
          {!this.disabled && edges.has('right') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--right" onPointerDown={this.onEdgePointerDown('right') as any} />
          )}
          {!this.disabled && edges.has('bottom') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--bottom" onPointerDown={this.onEdgePointerDown('bottom') as any} />
          )}
          {!this.disabled && edges.has('left') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--left" onPointerDown={this.onEdgePointerDown('left') as any} />
          )}

          {!this.disabled && corners.has('top-left') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--corner ldesign-resize-box__handle--top-left" onPointerDown={this.onCornerPointerDown('top-left') as any} />
          )}
          {!this.disabled && corners.has('top-right') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--corner ldesign-resize-box__handle--top-right" onPointerDown={this.onCornerPointerDown('top-right') as any} />
          )}
          {!this.disabled && corners.has('bottom-right') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--corner ldesign-resize-box__handle--bottom-right" onPointerDown={this.onCornerPointerDown('bottom-right') as any} />
          )}
          {!this.disabled && corners.has('bottom-left') && (
            <div class="ldesign-resize-box__handle ldesign-resize-box__handle--corner ldesign-resize-box__handle--bottom-left" onPointerDown={this.onCornerPointerDown('bottom-left') as any} />
          )}
        </div>
      </Host>
    );
  }
}

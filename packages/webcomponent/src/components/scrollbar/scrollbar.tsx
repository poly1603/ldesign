import { Component, Prop, State, Element, Event, EventEmitter, h, Host, Method, Watch, Fragment } from '@stencil/core';

/**
 * ldesign-scrollbar 自定义滚动条
 * - 包裹任意内容，提供可完全自定义样式的滚动条（纵向/横向）
 * - 支持拖拽拇指、点击轨道跳转、自动/常显、轨道类型切换
 * - 通过 CSS 变量覆盖或直接覆盖内部类名实现“完全自主”的样式定制
 */
@Component({ tag: 'ldesign-scrollbar', styleUrl: 'scrollbar.less', shadow: false })
export class LdesignScrollbar {
  @Element() host!: HTMLElement;

  /** 滚动条类型：bar（仅拇指）| track（显示轨道） */
  @Prop({ reflect: true }) type: 'bar' | 'track' = 'bar';
  /** 方向：vertical | horizontal | both */
  @Prop({ reflect: true }) direction: 'vertical' | 'horizontal' | 'both' = 'both';
  /** 是否一直显示（默认悬浮显示） */
  @Prop({ reflect: true }) always: boolean = false;
  /** 最小拇指尺寸（px） */
  @Prop() thumbMinSize: number = 24;
  /** 是否禁用滚动交互 */
  @Prop() disabled: boolean = false;
  /** 使用原生滚动条，不渲染自定义轨道/拇指并且不隐藏系统滚动条 */
  @Prop({ reflect: true }) native: boolean = false;
  /** 自动隐藏延迟（ms）。<=0 表示不自动隐藏（与 always 类似，但 hover 仍会显示） */
  @Prop() autoHideDelay: number = 800;
  /** 滚轮事件是否允许向父容器传播（到达边缘时总是允许） */
  @Prop() wheelPropagation: boolean = false;
  /** 是否启用键盘控制（wrap 聚焦时） */
  @Prop() keyboard: boolean = true;
  /** 键盘步进（像素） */
  @Prop() keyStep: number = 40;
  /** PageUp/PageDown 的步进（像素），<=0 时按可视高度 */
  @Prop() pageStep: number = 0;
  /** 平滑滚动 */
  @Prop({ reflect: true }) smooth: boolean = false;
  /** 布局：overlay 叠加在内容之上；space 预留滚动条空间 */
  @Prop({ reflect: true }) layout: 'overlay' | 'space' = 'overlay';
  /** 显示滚动阴影，提示可滚动方向 */
  @Prop({ reflect: true }) shadows: boolean = false;
  /** 吸附：滚动结束后吸附到最近匹配元素 */
  @Prop() snapSelector?: string;
  @Prop() snapMode: 'start' | 'center' | 'end' = 'start';
  @Prop() snapDelay: number = 120;
  @Prop() snapEnabled: boolean = true;
  /** 同步滚动组与轴 */
  @Prop() syncGroup?: string;
  @Prop() syncAxis: 'vertical' | 'horizontal' | 'both' = 'both';
  @Prop() syncEnabled: boolean = true;
  @Prop() syncThrottle: number = 32;
  /** RTL 文字方向（用于水平滚动与 scrollLeft 归一化） */
  @Prop({ reflect: true }) rtl: boolean = false;
  /** 是否显示微调按钮（上下/左右） */
  @Prop() showButtons: boolean = false;
  /** 拖拽滚动（鼠标中键，或按住 Alt+左键） */
  @Prop() dragScroll: boolean = false;
  /** 拖拽触发方式：middle（中键）| left-alt（Alt+左键）| left（左键） */
  @Prop() dragScrollTrigger: 'middle' | 'left-alt' | 'left' = 'middle';
  /** sticky 偏移（用于阴影起始位置） */
  @Prop() stickyTop: number = 0;
  @Prop() stickyBottom: number = 0;
  /** 垂直条位置：right | left */
  @Prop({ reflect: true }) vPosition: 'right' | 'left' = 'right';
  /** 水平条位置：bottom | top */
  @Prop({ reflect: true }) hPosition: 'bottom' | 'top' = 'bottom';
  /** 初始滚动位置（可选） */
  @Prop() initialScrollTop?: number;
  @Prop() initialScrollLeft?: number;

  /** 滚动事件（代理自内容容器） */
  @Event() ldesignScroll!: EventEmitter<{ scrollTop: number; scrollLeft: number; clientWidth: number; clientHeight: number; scrollWidth: number; scrollHeight: number }>; 
  /** 触达边缘事件 */
  @Event() ldesignReach!: EventEmitter<{ edge: 'top' | 'bottom' | 'left' | 'right' }>;
  /** 滚动开始/结束 */
  @Event() ldesignScrollStart!: EventEmitter<void>;
  @Event() ldesignScrollEnd!: EventEmitter<void>;

  @State() private vVisible = false;
  @State() private hVisible = false;
  @State() private showBars = false; // 为未来的 autoHide 做铺垫
  @State() private sTop = false; @State() private sBottom = false; @State() private sLeft = false; @State() private sRight = false;

  private wrapEl?: HTMLElement;
  private vTrackEl?: HTMLElement; private vThumbEl?: HTMLElement;
  private hTrackEl?: HTMLElement; private hThumbEl?: HTMLElement;

  private ro?: ResizeObserver;
  private contentRO?: ResizeObserver;
  private destroyers: Array<() => void> = [];
  private showTimer?: number;
  private hideTimer?: number;
  private snapTimer?: number;
  private scrollEndTimer?: number;
  private scrolling = false;
  private syncing = false;
  private lastSyncTime = 0; private syncTimer?: number;
  private isPanning = false; private panStartX = 0; private panStartY = 0; private panStartLeft = 0; private panStartTop = 0;

  // 拖拽状态
  private draggingV = false; private startY = 0; private startScrollTop = 0; private vTrackSize = 0; private vThumbSize = 0;
  private draggingH = false; private startX = 0; private startScrollLeft = 0; private hTrackSize = 0; private hThumbSize = 0;

  // reach 边缘状态，避免重复派发
  private atTop = false; private atBottom = false; private atLeft = false; private atRight = false;

  // 公共方法：外部可调用强制刷新计算
  @Method() async update() { this.updateAll(); }

  @Watch('direction')
  onDirectionChange() { this.updateAll(); }

  static groups = new Map<string, Set<LdesignScrollbar>>();

  componentDidLoad() {
    this.wrapEl = this.host.querySelector('.ld-scrollbar__wrap') as HTMLElement;
    this.vTrackEl = this.host.querySelector('.ld-scrollbar__bar.is-vertical .ld-scrollbar__track') as HTMLElement;
    this.vThumbEl = this.host.querySelector('.ld-scrollbar__bar.is-vertical .ld-scrollbar__thumb') as HTMLElement;
    this.hTrackEl = this.host.querySelector('.ld-scrollbar__bar.is-horizontal .ld-scrollbar__track') as HTMLElement;
    this.hThumbEl = this.host.querySelector('.ld-scrollbar__bar.is-horizontal .ld-scrollbar__thumb') as HTMLElement;

    if (this.wrapEl) {
      const onScroll = () => { this.showNow(); this.handleScroll(); };
      this.wrapEl.addEventListener('scroll', onScroll, { passive: true });
      this.destroyers.push(() => this.wrapEl?.removeEventListener('scroll', onScroll as any));

      const onWheel = (e: WheelEvent) => this.handleWheel(e);
      this.wrapEl.addEventListener('wheel', onWheel, { passive: false });
      this.destroyers.push(() => this.wrapEl?.removeEventListener('wheel', onWheel as any));

      const onPointerDown = (e: PointerEvent) => { this.showNow(); this.tryStartPan(e); };
      const onPointerMove = () => this.showNow();
      const onPointerUp = (e: PointerEvent) => { this.stopPan(e); this.hideLater(); };
      this.wrapEl.addEventListener('pointerdown', onPointerDown); this.wrapEl.addEventListener('pointermove', onPointerMove); this.wrapEl.addEventListener('pointerup', onPointerUp);
      this.destroyers.push(() => { this.wrapEl?.removeEventListener('pointerdown', onPointerDown); this.wrapEl?.removeEventListener('pointermove', onPointerMove); this.wrapEl?.removeEventListener('pointerup', onPointerUp); });

      if (this.keyboard) {
        const onKey = (e: KeyboardEvent) => this.handleKey(e);
        this.wrapEl.addEventListener('keydown', onKey);
        this.destroyers.push(() => this.wrapEl?.removeEventListener('keydown', onKey as any));
      }

      // 初始滚动位置
      if (typeof this.initialScrollTop === 'number') this.wrapEl.scrollTop = this.initialScrollTop;
      if (typeof this.initialScrollLeft === 'number') this.wrapEl.scrollLeft = this.initialScrollLeft;
    }

    // Resize 监听：容器尺寸或内容变化后重新计算
    try {
      this.ro = new ResizeObserver(() => this.updateAll());
      if (this.wrapEl) this.ro.observe(this.wrapEl);
      this.contentRO = new ResizeObserver(() => this.updateAll());
      // 监听 wrap 内第一个元素（slot 内容的容器）
      const first = this.wrapEl?.firstElementChild as HTMLElement | undefined;
      if (first) this.contentRO.observe(first);
    } catch {}

    // 注册同步组
    if (this.syncGroup) {
      const set = LdesignScrollbar.groups.get(this.syncGroup) || new Set<LdesignScrollbar>();
      set.add(this); LdesignScrollbar.groups.set(this.syncGroup, set);
    }

    this.updateAll();
  }

  disconnectedCallback() {
    this.ro?.disconnect(); this.ro = undefined;
    this.contentRO?.disconnect(); this.contentRO = undefined;
    this.destroyers.forEach(fn => { try { fn(); } catch {} });
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerup', this.onWindowPointerUp);

    if (this.syncGroup) {
      const set = LdesignScrollbar.groups.get(this.syncGroup);
      set?.delete(this);
      if (set && set.size === 0) LdesignScrollbar.groups.delete(this.syncGroup);
    }
  }

  private getLeftNorm(): number { const w = this.wrapEl!; if (!this.rtl) return w.scrollLeft; const max = Math.max(0, w.scrollWidth - w.clientWidth); const raw = w.scrollLeft; return raw < 0 ? -raw : (max - raw); }
  private setLeftNorm(left: number) { const w = this.wrapEl!; if (!this.rtl) { w.scrollLeft = left; return; } const max = Math.max(0, w.scrollWidth - w.clientWidth); const raw = Math.max(0, Math.min(max, left)); const val = (w.scrollLeft < 0) ? -raw : (max - raw); w.scrollLeft = val; }

  private broadcastSync() {
    if (!this.syncGroup || this.syncing || !this.syncEnabled) return;
    const now = Date.now();
    const schedule = () => {
      window.clearTimeout(this.syncTimer);
      const delay = Math.max(0, this.syncThrottle);
      this.syncTimer = window.setTimeout(() => { this.lastSyncTime = Date.now(); this.doSyncNow(); }, delay);
    };
    if (now - this.lastSyncTime < this.syncThrottle) { schedule(); return; }
    this.lastSyncTime = now; this.doSyncNow();
  }
  private doSyncNow() {
    if (!this.syncGroup) return;
    const set = LdesignScrollbar.groups.get(this.syncGroup); if (!set || set.size <= 1) return;
    const w = this.wrapEl!;
    const vr = w.scrollHeight > w.clientHeight ? (w.scrollTop / Math.max(1, w.scrollHeight - w.clientHeight)) : 0;
    const hr = w.scrollWidth > w.clientWidth ? (this.getLeftNorm() / Math.max(1, w.scrollWidth - w.clientWidth)) : 0;
    set.forEach(inst => {
      if (inst === this) return;
      if (inst.wrapEl) {
        inst.syncing = true;
        if (this.syncAxis === 'vertical' || this.syncAxis === 'both') inst.wrapEl.scrollTop = vr * (inst.wrapEl.scrollHeight - inst.wrapEl.clientHeight);
        if (this.syncAxis === 'horizontal' || this.syncAxis === 'both') inst.setLeftNorm(hr * (inst.wrapEl.scrollWidth - inst.wrapEl.clientWidth));
        inst.syncing = false;
      }
    });
  }

  private handleScroll() {
    this.syncThumbPositions();
    const wrap = this.wrapEl!;
    if (!wrap) return;
    // scroll start/end 事件
    if (!this.scrolling) { this.scrolling = true; this.ldesignScrollStart?.emit?.(undefined as any); }
    window.clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = window.setTimeout(() => { this.scrolling = false; this.ldesignScrollEnd?.emit?.(undefined as any); if (this.snapEnabled) this.doSnapIfNeeded(); }, Math.max(60, this.snapDelay));

    this.ldesignScroll.emit({
      scrollTop: wrap.scrollTop,
      scrollLeft: wrap.scrollLeft,
      clientWidth: wrap.clientWidth,
      clientHeight: wrap.clientHeight,
      scrollWidth: wrap.scrollWidth,
      scrollHeight: wrap.scrollHeight,
    });

    // reach 事件（阈值=1px）
    const t = wrap.scrollTop <= 1;
    const b = wrap.scrollTop >= wrap.scrollHeight - wrap.clientHeight - 1;
    const l = wrap.scrollLeft <= 1;
    const r = wrap.scrollLeft >= wrap.scrollWidth - wrap.clientWidth - 1;
    if (t && !this.atTop) { this.ldesignReach.emit({ edge: 'top' }); this.atTop = true; } else if (!t) { this.atTop = false; }
    if (b && !this.atBottom) { this.ldesignReach.emit({ edge: 'bottom' }); this.atBottom = true; } else if (!b) { this.atBottom = false; }
    if (l && !this.atLeft) { this.ldesignReach.emit({ edge: 'left' }); this.atLeft = true; } else if (!l) { this.atLeft = false; }
    if (r && !this.atRight) { this.ldesignReach.emit({ edge: 'right' }); this.atRight = true; } else if (!r) { this.atRight = false; }

    // 同步滚动
    this.broadcastSync();

    if (this.shadows) {
      this.sTop = !t; this.sBottom = !b; this.sLeft = !l; this.sRight = !r;
    } else {
      this.sTop = this.sBottom = this.sLeft = this.sRight = false;
    }
  }

  private updateAll() {
    const wrap = this.wrapEl;
    if (!wrap) return;
    const canV = this.direction === 'vertical' || this.direction === 'both';
    const canH = this.direction === 'horizontal' || this.direction === 'both';

    const vVisible = canV && (wrap.scrollHeight > wrap.clientHeight + 1);
    const hVisible = canH && (wrap.scrollWidth > wrap.clientWidth + 1);
    if (vVisible !== this.vVisible) this.vVisible = vVisible;
    if (hVisible !== this.hVisible) this.hVisible = hVisible;

    // 垂直尺寸
    if (vVisible && this.vTrackEl && this.vThumbEl) {
      const trackSize = this.vTrackEl.clientHeight;
      const ratio = wrap.clientHeight / Math.max(1, wrap.scrollHeight);
      const thumbSize = Math.max(this.thumbMinSize, Math.round(trackSize * ratio));
      this.vTrackSize = trackSize; this.vThumbSize = thumbSize;
      this.vThumbEl.style.height = `${thumbSize}px`;
    }

    // 水平尺寸
    if (hVisible && this.hTrackEl && this.hThumbEl) {
      const trackSize = this.hTrackEl.clientWidth;
      const ratio = wrap.clientWidth / Math.max(1, wrap.scrollWidth);
      const thumbSize = Math.max(this.thumbMinSize, Math.round(trackSize * ratio));
      this.hTrackSize = trackSize; this.hThumbSize = thumbSize;
      this.hThumbEl.style.width = `${thumbSize}px`;
    }

    this.syncThumbPositions();
  }

  private syncThumbPositions() {
    const wrap = this.wrapEl; if (!wrap) return;

    if (this.vVisible && this.vTrackEl && this.vThumbEl) {
      const maxScroll = Math.max(1, wrap.scrollHeight - wrap.clientHeight);
      const trackAvail = Math.max(1, this.vTrackEl.clientHeight - this.vThumbSize);
      const top = (wrap.scrollTop / maxScroll) * trackAvail;
      this.vThumbEl.style.transform = `translateY(${Math.round(top)}px)`;
    }

    if (this.hVisible && this.hTrackEl && this.hThumbEl) {
      const maxScroll = Math.max(1, wrap.scrollWidth - wrap.clientWidth);
      const trackAvail = Math.max(1, this.hTrackEl.clientWidth - this.hThumbSize);
      const left = (wrap.scrollLeft / maxScroll) * trackAvail;
      this.hThumbEl.style.transform = `translateX(${Math.round(left)}px)`;
    }
  }

  // ── 轨道点击 ─────────────────────────────────────────────
  private onTrackPointerDownVertical = (e: PointerEvent) => {
    if (this.disabled) return;
    if (!this.wrapEl || !this.vTrackEl || !this.vThumbEl) return;
    if ((e.target as HTMLElement).closest('.ld-scrollbar__thumb')) return; // 点在拇指上则交给拖拽

    e.preventDefault();
    const rect = this.vTrackEl.getBoundingClientRect();
    const offset = e.clientY - rect.top - this.vThumbSize / 2;
    const trackAvail = Math.max(1, this.vTrackEl.clientHeight - this.vThumbSize);
    const ratio = Math.min(1, Math.max(0, offset / trackAvail));
    const maxScroll = Math.max(1, this.wrapEl.scrollHeight - this.wrapEl.clientHeight);
    this.wrapEl.scrollTop = Math.round(ratio * maxScroll);
  };
  private onTrackPointerDownHorizontal = (e: PointerEvent) => {
    if (this.disabled) return;
    if (!this.wrapEl || !this.hTrackEl || !this.hThumbEl) return;
    if ((e.target as HTMLElement).closest('.ld-scrollbar__thumb')) return;

    e.preventDefault();
    const rect = this.hTrackEl.getBoundingClientRect();
    const offset = e.clientX - rect.left - this.hThumbSize / 2;
    const trackAvail = Math.max(1, this.hTrackEl.clientWidth - this.hThumbSize);
    const ratio = Math.min(1, Math.max(0, offset / trackAvail));
    const maxScroll = Math.max(1, this.wrapEl.scrollWidth - this.wrapEl.clientWidth);
    this.wrapEl.scrollLeft = Math.round(ratio * maxScroll);
  };

  // ── 拇指拖拽 ─────────────────────────────────────────────
  private onThumbPointerDownVertical = (e: PointerEvent) => {
    if (this.disabled) return;
    if (!this.wrapEl) return;
    e.preventDefault();
    this.draggingV = true; this.startY = e.clientY; this.startScrollTop = this.wrapEl.scrollTop;
    try { (e.target as Element)?.setPointerCapture?.(e.pointerId); } catch {}
    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onWindowPointerUp, { passive: false });
  };
  private onThumbPointerDownHorizontal = (e: PointerEvent) => {
    if (this.disabled) return;
    if (!this.wrapEl) return;
    e.preventDefault();
    this.draggingH = true; this.startX = e.clientX; this.startScrollLeft = this.wrapEl.scrollLeft;
    try { (e.target as Element)?.setPointerCapture?.(e.pointerId); } catch {}
    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onWindowPointerUp, { passive: false });
  };

  private onWindowPointerMove = (e: PointerEvent) => {
    if (!this.wrapEl) return;
    if (this.draggingV && this.vTrackEl) {
      e.preventDefault();
      const trackAvail = Math.max(1, this.vTrackEl.clientHeight - this.vThumbSize);
      const delta = e.clientY - this.startY;
      const ratio = delta / trackAvail;
      const maxScroll = Math.max(1, this.wrapEl.scrollHeight - this.wrapEl.clientHeight);
      this.wrapEl.scrollTop = Math.round(this.startScrollTop + ratio * maxScroll);
      return;
    }
    if (this.draggingH && this.hTrackEl) {
      e.preventDefault();
      const trackAvail = Math.max(1, this.hTrackEl.clientWidth - this.hThumbSize);
      const delta = e.clientX - this.startX;
      const ratio = delta / trackAvail;
      const maxScroll = Math.max(1, this.wrapEl.scrollWidth - this.wrapEl.clientWidth);
      this.wrapEl.scrollLeft = Math.round(this.startScrollLeft + ratio * maxScroll);
      return;
    }
  };

  private onWindowPointerUp = (_e: PointerEvent) => {
    if (!this.draggingV && !this.draggingH) return;
    this.draggingV = false; this.draggingH = false;
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerup', this.onWindowPointerUp);
  };

  private getRootClass(): string {
    const cls = ['ld-scrollbar'];
    if (this.native) cls.push('ld-scrollbar--native');
    if (this.always) cls.push('ld-scrollbar--always');
    if (this.type === 'track') cls.push('ld-scrollbar--track');
    if (this.vVisible) cls.push('ld-scrollbar--v');
    if (this.hVisible) cls.push('ld-scrollbar--h');
    if (this.smooth) cls.push('ld-scrollbar--smooth');
    if (this.showBars) cls.push('is-active');
    if (this.layout === 'space') cls.push('ld-scrollbar--space');
    return cls.join(' ');
  }

  // ── Public methods ─────────────────────────────────────────────
  @Method() async scrollToPos(options: ScrollToOptions) { this.wrapEl?.scrollTo(options as any); }
  @Method() async scrollByDelta(options: ScrollToOptions) { this.wrapEl?.scrollBy(options as any); }
  /** 根据百分比滚动（0~1） */
  @Method() async scrollToPercent(opts: { x?: number; y?: number; behavior?: ScrollBehavior }) {
    const w = this.wrapEl; if (!w) return; const bx = Math.max(0, Math.min(1, Number(opts?.x ?? NaN))); const by = Math.max(0, Math.min(1, Number(opts?.y ?? NaN)));
    const behavior = (opts?.behavior || (this.smooth ? 'smooth' : 'auto')) as ScrollBehavior;
    const left = Number.isFinite(bx) ? (w.scrollWidth - w.clientWidth) * bx : w.scrollLeft;
    const top = Number.isFinite(by) ? (w.scrollHeight - w.clientHeight) * by : w.scrollTop;
    w.scrollTo({ left, top, behavior });
  }
  /** 滚动容器内的元素到可视区 */
  @Method() async scrollIntoViewWithin(target: Element | string, options?: { behavior?: ScrollBehavior; block?: 'start'|'center'|'end'; inline?: 'start'|'center'|'end' }) {
    const w = this.wrapEl; if (!w) return;
    const el = typeof target === 'string' ? (w.querySelector(target) as HTMLElement | null) : (target as HTMLElement | null);
    if (!el || !w.contains(el)) return;
    const wRect = w.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const dxStart = r.left - wRect.left; const dyStart = r.top - wRect.top;
    let left = w.scrollLeft; let top = w.scrollTop;
    const block = options?.block || 'start'; const inline = options?.inline || 'start';
    if (block === 'start') top += dyStart; else if (block === 'center') top += dyStart - (w.clientHeight - r.height) / 2; else top += dyStart - (w.clientHeight - r.height);
    if (inline === 'start') left += dxStart; else if (inline === 'center') left += dxStart - (w.clientWidth - r.width) / 2; else left += dxStart - (w.clientWidth - r.width);
    w.scrollTo({ left, top, behavior: options?.behavior || (this.smooth ? 'smooth' : 'auto') });
  }
  /** 手动显示/隐藏滚动条 */
  @Method() async showBarsNow() { this.showNow(); }
  @Method() async hideBars() { this.showBars = false; }
  @Method() async scrollToTop() { if (this.wrapEl) this.wrapEl.scrollTop = 0; }
  @Method() async scrollToBottom() { if (this.wrapEl) this.wrapEl.scrollTop = this.wrapEl.scrollHeight; }
  @Method() async scrollToLeft() { if (this.wrapEl) this.wrapEl.scrollLeft = 0; }
  @Method() async scrollToRight() { if (this.wrapEl) this.wrapEl.scrollLeft = this.wrapEl.scrollWidth; }
  @Method() async getMetrics() {
    const w = this.wrapEl; if (!w) return null as any;
    return { scrollTop: w.scrollTop, scrollLeft: w.scrollLeft, clientWidth: w.clientWidth, clientHeight: w.clientHeight, scrollWidth: w.scrollWidth, scrollHeight: w.scrollHeight };
  }
  /** 动态设置 CSS 变量（同时作用在 host 与内部根元素上）。变量名可带或不带 -- 前缀。数值会自动追加 px。 */
  @Method() async setCssVars(vars: Record<string, string | number>) {
    const apply = (el?: HTMLElement | null) => {
      if (!el) return;
      Object.entries(vars || {}).forEach(([k, v]) => {
        const name = k.startsWith('--') ? k : `--${k}`;
        const val = typeof v === 'number' ? `${v}px` : String(v);
        (el as HTMLElement).style.setProperty(name, val);
      });
    };
    apply(this.host);
    apply(this.host.querySelector('.ld-scrollbar') as HTMLElement);
  }

  private doSnapIfNeeded() {
    if (!this.snapSelector || !this.wrapEl) return;
    const w = this.wrapEl;
    const nodes = Array.from(w.querySelectorAll(this.snapSelector)) as HTMLElement[];
    if (!nodes.length) return;
    const useV = (this.direction === 'vertical' || this.direction === 'both') && w.scrollHeight > w.clientHeight;
    const useH = (this.direction === 'horizontal' || this.direction === 'both') && w.scrollWidth > w.clientWidth;
    let best: { node: HTMLElement; dist: number } | null = null;
    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const wrect = w.getBoundingClientRect();
      let dist = 0;
      if (useV) {
        const target = this.snapMode === 'center' ? (wrect.top + w.clientHeight / 2) : (this.snapMode === 'end' ? (wrect.bottom) : (wrect.top));
        const point = this.snapMode === 'center' ? (rect.top + rect.height / 2) : (this.snapMode === 'end' ? rect.bottom : rect.top);
        dist += Math.abs(point - target);
      }
      if (useH) {
        const target = this.snapMode === 'center' ? (wrect.left + w.clientWidth / 2) : (this.snapMode === 'end' ? (wrect.right) : (wrect.left));
        const point = this.snapMode === 'center' ? (rect.left + rect.width / 2) : (this.snapMode === 'end' ? rect.right : rect.left);
        dist += Math.abs(point - target);
      }
      if (best == null || dist < best.dist) best = { node: el, dist };
    });
    if (best) {
      const r = best.node.getBoundingClientRect();
      const wrect = w.getBoundingClientRect();
      let left = this.getLeftNorm(); let top = w.scrollTop;
      if (useV) {
        if (this.snapMode === 'start') top += (r.top - wrect.top); else if (this.snapMode === 'center') top += (r.top + r.height / 2 - (wrect.top + w.clientHeight / 2)); else top += (r.bottom - wrect.bottom);
      }
      if (useH) {
        if (this.snapMode === 'start') left += (r.left - wrect.left); else if (this.snapMode === 'center') left += (r.left + r.width / 2 - (wrect.left + w.clientWidth / 2)); else left += (r.right - wrect.right);
      }
      w.scrollTo({ top, left: undefined });
      this.setLeftNorm(left);
    }
  }

  private showNow() {
    if (this.always || this.native) return;
    this.showBars = true;
    this.hideLater();
  }
  private hideLater() {
    if (this.always || this.native) return;
    if (this.draggingH || this.draggingV) return;
    window.clearTimeout(this.hideTimer);
    const delay = this.autoHideDelay > 0 ? this.autoHideDelay : 0;
    this.hideTimer = window.setTimeout(() => (this.showBars = false), delay);
  }

  private tryStartPan(e: PointerEvent) {
    if (!this.dragScroll || !this.wrapEl) return;
    const middle = e.button === 1;
    const leftAlt = e.button === 0 && e.altKey === true;
    const left = e.button === 0;
    const ok = (this.dragScrollTrigger === 'middle' && middle) || (this.dragScrollTrigger === 'left-alt' && leftAlt) || (this.dragScrollTrigger === 'left' && left);
    if (!ok) return;
    e.preventDefault();
    this.isPanning = true; this.panStartX = e.clientX; this.panStartY = e.clientY; this.panStartLeft = this.getLeftNorm(); this.panStartTop = this.wrapEl.scrollTop;
    try { (e.target as Element)?.setPointerCapture?.(e.pointerId); } catch {}
    const move = (ev: PointerEvent) => {
      if (!this.isPanning || !this.wrapEl) return;
      const dx = ev.clientX - this.panStartX; const dy = ev.clientY - this.panStartY;
      this.wrapEl.scrollTop = this.panStartTop - dy;
      this.setLeftNorm(this.panStartLeft - dx);
    };
    const up = (_ev: PointerEvent) => { this.isPanning = false; window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', up, true); };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
  }

  private stopPan(_e: PointerEvent) { this.isPanning = false; }

  private handleWheel(e: WheelEvent) {
    if (!this.wrapEl) return;
    this.showNow();
    if (!this.wheelPropagation) {
      // 若当前可滚动对应方向，则阻止冒泡，避免父级滚动
      const w = this.wrapEl;
      const canV = (this.direction === 'vertical' || this.direction === 'both') && (w.scrollHeight > w.clientHeight);
      const canH = (this.direction === 'horizontal' || this.direction === 'both') && (w.scrollWidth > w.clientWidth);
      const dy = e.deltaY; const dx = e.deltaX;
      let consume = false;
      if (canV && dy !== 0) {
        const atTop = w.scrollTop <= 0 && dy < 0;
        const atBottom = w.scrollTop >= w.scrollHeight - w.clientHeight && dy > 0;
        consume = !(atTop || atBottom);
      }
      if (canH && dx !== 0) {
        const atLeft = w.scrollLeft <= 0 && dx < 0;
        const atRight = w.scrollLeft >= w.scrollWidth - w.clientWidth && dx > 0;
        consume = consume || !(atLeft || atRight);
      }
      if (consume) {
        e.stopPropagation();
      }
    }
  }

  private handleKey(e: KeyboardEvent) {
    if (!this.keyboard || !this.wrapEl) return;
    const w = this.wrapEl;
    const page = this.pageStep > 0 ? this.pageStep : Math.max(w.clientHeight - 20, 20);
    const step = this.keyStep;
    let handled = true;
    switch (e.key) {
      case 'ArrowUp': w.scrollTop -= step; break;
      case 'ArrowDown': w.scrollTop += step; break;
      case 'ArrowLeft': w.scrollLeft -= step; break;
      case 'ArrowRight': w.scrollLeft += step; break;
      case 'PageUp': w.scrollTop -= page; break;
      case 'PageDown': w.scrollTop += page; break;
      case 'Home': w.scrollTop = 0; break;
      case 'End': w.scrollTop = w.scrollHeight; break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); this.showNow(); }
  }

  render() {
    const showV = !this.native && this.vVisible && (this.direction === 'vertical' || this.direction === 'both');
    const showH = !this.native && this.hVisible && (this.direction === 'horizontal' || this.direction === 'both');

    return (
      <Host class="ld-scrollbar-host" onMouseEnter={() => this.showNow()} onMouseLeave={() => this.hideLater()}>
        <div class={this.getRootClass()}>
          <div class="ld-scrollbar__wrap" part="wrap" tabindex={this.keyboard ? 0 : undefined}>
            <slot />
          </div>

          {/* shadows */}
          {this.shadows && (
            <>
              <div class={{ 'ld-scrollbar__shadow': true, 'ld-scrollbar__shadow--top': true, 'is-visible': this.sTop }} />
              <div class={{ 'ld-scrollbar__shadow': true, 'ld-scrollbar__shadow--bottom': true, 'is-visible': this.sBottom }} />
              <div class={{ 'ld-scrollbar__shadow': true, 'ld-scrollbar__shadow--left': true, 'is-visible': this.sLeft }} />
              <div class={{ 'ld-scrollbar__shadow': true, 'ld-scrollbar__shadow--right': true, 'is-visible': this.sRight }} />
            </>
          )}

          {!this.native && (
            <>
              {/* Vertical */}
              <div class={{ 'ld-scrollbar__bar': true, 'is-vertical': true, 'is-hidden': !showV, 'is-left': this.vPosition === 'left', 'is-right': this.vPosition !== 'left' }} part="vbar">
                <div class="ld-scrollbar__track" onPointerDown={this.onTrackPointerDownVertical as any} part="vtrack">
                  <div class="ld-scrollbar__thumb" onPointerDown={this.onThumbPointerDownVertical as any} part="vthumb">
                    <slot name="v-thumb" />
                  </div>
                </div>
              </div>

              {/* Horizontal */}
              <div class={{ 'ld-scrollbar__bar': true, 'is-horizontal': true, 'is-hidden': !showH, 'is-top': this.hPosition === 'top', 'is-bottom': this.hPosition !== 'top' }} part="hbar">
                <div class="ld-scrollbar__track" onPointerDown={this.onTrackPointerDownHorizontal as any} part="htrack">
                  <div class="ld-scrollbar__thumb" onPointerDown={this.onThumbPointerDownHorizontal as any} part="hthumb">
                    <slot name="h-thumb" />
                  </div>
                </div>
              </div>

              {this.showButtons && (
                <>
                  {(this.direction === 'vertical' || this.direction === 'both') && (
                    <>
                      <div class="ld-scrollbar__btn ld-scrollbar__btn--up" onClick={() => { if (this.wrapEl) this.wrapEl.scrollTop -= this.keyStep; }}>▲</div>
                      <div class="ld-scrollbar__btn ld-scrollbar__btn--down" onClick={() => { if (this.wrapEl) this.wrapEl.scrollTop += this.keyStep; }}>▼</div>
                    </>
                  )}
                  {(this.direction === 'horizontal' || this.direction === 'both') && (
                    <>
                      <div class="ld-scrollbar__btn ld-scrollbar__btn--left" onClick={() => { this.setLeftNorm(this.getLeftNorm() - this.keyStep); }}>◀</div>
                      <div class="ld-scrollbar__btn ld-scrollbar__btn--right" onClick={() => { this.setLeftNorm(this.getLeftNorm() + this.keyStep); }}>▶</div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </Host>
    );
  }
}

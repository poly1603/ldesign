import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { computePosition, flip, shift, offset, arrow, autoUpdate, Placement, VirtualElement } from '@floating-ui/dom';

// Public types
export type PopupTrigger = 'hover' | 'click' | 'focus' | 'manual' | 'contextmenu';
export type PopupPlacement = Placement;
export type PopupSize = 'small' | 'medium' | 'large';
export type PopupAnimation = 'fade' | 'scale' | 'slide';

/**
 * ldesign-popup（重写版）
 * 目标：
 * - 结构清晰：属性/状态/引用/工具/事件/定位/渲染分层
 * - 在所有方向上保持一致的 offset 语义：
 *    arrow=true 时，offsetDistance = 触发元素到箭头尖端的可见距离
 *    arrow=false 时，offsetDistance = 触发元素到面板边缘的可见距离
 * - 支持 hover/click/focus/manual/contextmenu，支持 appendTo(self/body/closest-popup)
 * - 稳健的外部点击与 ESC 关闭，右键通过虚拟参考在鼠标处弹出
 */
@Component({ tag: 'ldesign-popup', styleUrl: 'popup.less', shadow: false })
export class LdesignPopup {
  // Element refs
  @Element() el!: HTMLElement;

  // ── Props ──────────────────────────────────────────────────────
  @Prop({ mutable: true }) visible: boolean = false;
  @Prop() placement: PopupPlacement = 'bottom';
  @Prop() strategy: 'auto' | 'fixed' | 'absolute' = 'auto';
  @Prop() appendTo: 'self' | 'body' | 'closest-popup' = 'self';
  @Prop() trigger: PopupTrigger = 'hover';
  @Prop() interactive: boolean = true;
  @Prop() closeOnOutside: boolean = true;
  @Prop() closeOnEsc: boolean = true;
  @Prop() content?: string;
  @Prop() popupRole: string = 'dialog';
  @Prop() popupTitle?: string;
  /**
   * 与触发元素的距离：参见组件注释中的语义说明
   */
  @Prop() offsetDistance: number | string = 8;
  @Prop() disabled: boolean = false;
  @Prop() arrow: boolean = true;
  @Prop({ reflect: true }) theme: 'light' | 'dark' = 'light';
  @Prop() width?: number | string;
  @Prop() maxWidth?: number | string;
  @Prop() lockOnScroll: boolean = false;
  @Prop() showDelay: number = 0;
  @Prop() hideDelay: number = 0;
  @Prop() debug: boolean = false;
  /** 是否开启动画（基于 data-placement 的定向靠近/离开） */
  @Prop({ reflect: true }) motionEnabled: boolean = true;
  /** 动画时长（ms） */
  @Prop() motionDuration: number = 200;
  /** 动画位移距离（px），用于"朝触发器靠近"的起始位移 */
  @Prop() motionDistance: number = 10;
  /** 自动关闭延迟（ms），0表示不自动关闭 */
  @Prop() autoCloseDelay: number = 0;
  /** 是否显示关闭按钮 */
  @Prop() closable: boolean = false;
  /** 加载状态 */
  @Prop() loading: boolean = false;
  /** 自定义弹层类名 */
  @Prop() popupClass?: string;
  /** 预设尺寸 */
  @Prop() size?: PopupSize;
  /** 动画类型 */
  @Prop() animation: PopupAnimation = 'scale';

  // ── State ──────────────────────────────────────────────────────
  @State() isVisible: boolean = false;
  @State() positioned: boolean = false; // 首帧定位前隐藏
  @State() motion: 'closed' | 'opening' | 'open' | 'closing' = 'closed';

  // ── Runtime ────────────────────────────────────────────────────
  private popupElement?: HTMLElement;
  private triggerElement?: HTMLElement;
  private arrowElement?: HTMLElement;
  private contextVirtualRef?: VirtualElement; // 右键虚拟参考
  private uid = `ldp_${Math.random().toString(36).slice(2)}`;
  private teleported = false;
  private teleportContainer?: HTMLElement;
  private cleanup?: () => void;
  private removeDocumentClick?: () => void;
  private removeDocumentKeydown?: () => void;
  private showTimer?: number;
  private hideTimer?: number;
  private contentHoverBound = false;
  private autoCloseTimer?: number;

  // ── Events ─────────────────────────────────────────────────────
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  // ── Watchers ───────────────────────────────────────────────────
  @Watch('visible')
  watchVisible(next: boolean) { if (next !== this.isVisible) this.setVisibleInternal(next); }
  @Watch('offsetDistance')
  onOffsetChanged() { if (this.isVisible) this.updatePositionOnly(); }

  // ── Lifecycle ──────────────────────────────────────────────────
  componentDidLoad() {
    // 触发器优先使用具名槽 [slot="trigger"]，否则退回内部 wrapper，再退回 host
    const slotTrigger = this.el.querySelector('[slot="trigger"]') as HTMLElement;
    const triggerWrapper = this.el.querySelector('.ldesign-popup__trigger') as HTMLElement;
    this.triggerElement = slotTrigger || triggerWrapper || this.el;

    this.popupElement = this.el.querySelector('.ldesign-popup__content') as HTMLElement;
    this.arrowElement = this.el.querySelector('.ldesign-popup__arrow') as HTMLElement;

    if (!this.disabled) {
      this.bindTriggerEvents();
      if (this.closeOnEsc) this.bindDocumentKeydown();
    }

    if (this.visible) this.setVisible(true);
  }

  disconnectedCallback() {
    this.cleanup?.();
    this.clearTimers();
    this.clearAutoCloseTimer();
    this.unbindTriggerEvents();
    this.unbindDocumentEvents();
    this.removeFromContainerIfNeeded();
  }

  componentDidRender() {
    if (this.isVisible) {
      // 首帧渲染后再定位一次，避免内容刚插入时尺寸不稳定
      this.moveToContainerIfNeeded();
      this.updatePositionOnly();
      this.bindContentHoverIfNeeded();
    }
  }

  // ── Trigger events ─────────────────────────────────────────────
  private bindTriggerEvents() {
    if (!this.triggerElement) return;
    switch (this.trigger) {
      case 'hover':
        this.triggerElement.addEventListener('mouseenter', this.onMouseEnter);
        this.triggerElement.addEventListener('mouseleave', this.onMouseLeave);
        break;
      case 'click':
        this.triggerElement.addEventListener('click', this.onClick);
        if (this.closeOnOutside) this.bindDocumentClick();
        break;
      case 'contextmenu':
        this.triggerElement.addEventListener('contextmenu', this.onContextMenu);
        if (this.closeOnOutside) this.bindDocumentClick();
        break;
      case 'focus':
        this.triggerElement.addEventListener('focusin', this.onFocus);
        this.triggerElement.addEventListener('focusout', this.onBlur);
        break;
    }
  }
  private unbindTriggerEvents() {
    if (!this.triggerElement) return;
    this.triggerElement.removeEventListener('mouseenter', this.onMouseEnter);
    this.triggerElement.removeEventListener('mouseleave', this.onMouseLeave);
    this.triggerElement.removeEventListener('click', this.onClick);
    this.triggerElement.removeEventListener('contextmenu', this.onContextMenu);
    this.triggerElement.removeEventListener('focusin', this.onFocus);
    this.triggerElement.removeEventListener('focusout', this.onBlur);
  }

  private bindDocumentClick() {
    const handler = this.onDocumentClick;
    document.addEventListener('click', handler, true);
    this.removeDocumentClick = () => document.removeEventListener('click', handler, true);
  }
  private bindDocumentKeydown() {
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape' && this.isVisible) this.hide(); };
    document.addEventListener('keydown', keyHandler);
    this.removeDocumentKeydown = () => document.removeEventListener('keydown', keyHandler);
  }
  private unbindDocumentEvents() { this.removeDocumentClick?.(); this.removeDocumentClick = undefined; this.removeDocumentKeydown?.(); this.removeDocumentKeydown = undefined; }

  // ── DOM utils ──────────────────────────────────────────────────
  private getPopupEl(): HTMLElement | null { return document.getElementById(this.uid); }
  private findClosestPopupContent(): HTMLElement | null { return this.el.closest('.ldesign-popup__content'); }
  private markPopupAncestry() {
    if (!this.popupElement) return;
    // owner: 自己的 uid；root: 顶层祖先 popup 的 uid（若无祖先，则为自己）
    const parentContent = this.findClosestPopupContent();
    const parentRoot = parentContent?.getAttribute('data-root');
    this.popupElement.setAttribute('data-owner', this.uid);
    this.popupElement.setAttribute('data-root', parentRoot || this.uid);
  }
  private moveToContainerIfNeeded() {
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;

    let target: HTMLElement | null = null;
    if (this.appendTo === 'body') target = document.body;
    else if (this.appendTo === 'closest-popup') target = this.findClosestPopupContent() || document.body;
    else return; // self：不移动

    if (this.popupElement.parentElement !== target) {
      target.appendChild(this.popupElement);
      this.teleported = true;
      this.teleportContainer = target;
    }
  }
  private removeFromContainerIfNeeded() {
    if (!this.teleported) return;
    const el = this.getPopupEl();
    if (el && this.teleportContainer && el.parentElement === this.teleportContainer) el.parentElement.removeChild(el);
    this.teleported = false; this.teleportContainer = undefined;
  }

  // ── Handlers ───────────────────────────────────────────────────
  private onMouseEnter = () => { this.clearTimers(); this.show(); };
  private onMouseLeave = (e?: MouseEvent) => {
    if (this.trigger === 'hover' && this.interactive) {
      // 如果鼠标进入到了另一个 popup 的内容区域（例如子菜单），不要关闭当前弹层
      const rt = (e && (e.relatedTarget as HTMLElement | null)) || null;
      if (rt) {
        const targetContent = rt.closest('.ldesign-popup__content');
        if (targetContent) {
          return; // 认为仍在同一交互体系内，保持开启
        }
      }
      this.clearTimers();
      const delay = this.hideDelay > 0 ? this.hideDelay : 200;
      this.hideTimer = window.setTimeout(() => this.setVisible(false), delay);
      return;
    }
    this.hide();
  };
  private onClick = (e: Event) => { e.stopPropagation(); this.toggle(); };
  private onContextMenu = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); this.contextVirtualRef = { getBoundingClientRect: () => new DOMRect(e.clientX, e.clientY, 0, 0) } as any; this.toggle(); };
  private onDocumentClick = (event: Event) => {
    const t = event.target as HTMLElement;
    if (this.el.contains(t)) return; // 点击在触发器内
    const p = this.getPopupEl();
    if (p && p.contains(t)) return; // 点击在自身内容内
    // 点击是否发生在本 popup 的“后代”popup 内容内（支持 appendTo=body 的层级关系）
    const targetContent = t.closest('.ldesign-popup__content') as HTMLElement | null;
    if (targetContent) {
      const targetRoot = targetContent.getAttribute('data-root');
      // 如果点击的内容与当前 popup 拥有相同的 root，视为内部点击，忽略
      if (targetRoot && (targetRoot === this.uid)) return;
    }
    this.hide();
  };
  private onFocus = () => this.show();
  private onBlur = () => this.hide();
  private onCloseClick = () => this.hide();

  // ── Helpers ────────────────────────────────────────────────────
  private nextFrame(): Promise<void> { return new Promise(r => requestAnimationFrame(() => r())); }
  private toNumber(v: any, d = 0): number { if (v == null) return d; if (typeof v === 'number' && Number.isFinite(v)) return v; const n = parseFloat(String(v)); return Number.isFinite(n) ? n : d; }
  private toPx(v?: number | string): string | undefined { if (v == null) return undefined; return typeof v === 'number' ? `${v}px` : v; }

  // ── Strategy ───────────────────────────────────────────────────
  private getStrategy(): 'fixed' | 'absolute' {
    if (this.strategy === 'fixed') return 'fixed';
    if (this.strategy === 'absolute') return 'absolute';
    // auto：appendTo=body 默认 fixed，其余 absolute（可预测且避免 transform 等影响）
    return this.appendTo === 'body' ? 'fixed' : 'absolute';
  }

  // ── Positioning（register autoUpdate） ─────────────────────────
  private getReferenceTarget(): HTMLElement | VirtualElement | null {
    if (this.trigger === 'contextmenu' && this.contextVirtualRef) return this.contextVirtualRef;
    const t = this.triggerElement;
    if (!t) return null;
    // 如果触发器是自定义元素（如 ldesign-button），优先使用其第一个元素子节点作为参考
    // 这样可避免宿主为 inline 元素导致的基线/行高影响，确保与原生 button 一致
    const isCustomEl = t.tagName.includes('-');
    if (isCustomEl && t.firstElementChild instanceof HTMLElement) return t.firstElementChild as HTMLElement;
    return t;
  }

  private async updatePosition() {
    if (!this.triggerElement) return;
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;
    if (this.arrow) this.arrowElement = this.popupElement.querySelector('.ldesign-popup__arrow');

    this.moveToContainerIfNeeded();
    this.markPopupAncestry();
    await this.nextFrame();

    const strategy = this.getStrategy();
    const boundary: any = strategy === 'fixed' ? 'viewport' : undefined;
    // 关键：主轴偏移 = offsetDistance + (arrow ? 4 : 0)，保证箭头尖端可见缝等于 offsetDistance
    const base = this.toNumber(this.offsetDistance, 8);
    const offsetValue = base + (this.arrow ? 4 : 0);

    const middleware = [ offset(offsetValue), flip({ boundary } as any), shift({ padding: 8, boundary, mainAxis: false, crossAxis: true } as any) ];
    if (this.arrow && this.arrowElement) middleware.push(arrow({ element: this.arrowElement }));

    const reference = this.getReferenceTarget();
    if (!reference) return;
    const { x, y, placement: resolvedPlacement, middlewareData } = await computePosition(reference as any, this.popupElement, { placement: this.placement, middleware, strategy });

    Object.assign(this.popupElement.style, { left: `${x}px`, top: `${y}px` });
    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    if (this.arrow && this.arrowElement && middlewareData.arrow) {
      const { x: ax, y: ay } = middlewareData.arrow;
      const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[resolvedPlacement.split('-')[0]] as any;
      Object.assign(this.arrowElement.style, { left: ax != null ? `${ax}px` : '', top: ay != null ? `${ay}px` : '', right: '', bottom: '', [staticSide]: '-4px' });
      this.arrowElement.setAttribute('data-placement', resolvedPlacement);
    }

    if (this.debug && this.triggerElement) this.logDebug(resolvedPlacement);

    this.positioned = true;
    this.cleanup?.();
    this.cleanup = autoUpdate(reference as any, this.popupElement, () => { if (this.isVisible) this.updatePositionOnly(); }, { ancestorScroll: !this.lockOnScroll, ancestorResize: true, elementResize: true });
  }

  // ── Positioning（update only） ────────────────────────────────
  private async updatePositionOnly() {
    if (!this.triggerElement) return;
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;
    if (this.arrow) this.arrowElement = this.popupElement.querySelector('.ldesign-popup__arrow');

    this.moveToContainerIfNeeded();
    this.markPopupAncestry();
    await this.nextFrame();

    const strategy = this.getStrategy();
    const boundary: any = strategy === 'fixed' ? 'viewport' : undefined;
    const base = this.toNumber(this.offsetDistance, 8);
    const offsetValue = base + (this.arrow ? 4 : 0);

    const middleware = [ offset(offsetValue), flip({ boundary } as any), shift({ padding: 8, boundary, mainAxis: false, crossAxis: true } as any) ];
    if (this.arrow && this.arrowElement) middleware.push(arrow({ element: this.arrowElement }));

    const reference = this.getReferenceTarget();
    if (!reference) return;
    const { x, y, placement: resolvedPlacement, middlewareData } = await computePosition(reference as any, this.popupElement, { placement: this.placement, middleware, strategy });

    Object.assign(this.popupElement.style, { left: `${x}px`, top: `${y}px` });
    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    if (this.arrow && this.arrowElement && middlewareData.arrow) {
      const { x: ax, y: ay } = middlewareData.arrow;
      const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[resolvedPlacement.split('-')[0]] as any;
      Object.assign(this.arrowElement.style, { left: ax != null ? `${ax}px` : '', top: ay != null ? `${ay}px` : '', right: '', bottom: '', [staticSide]: '-4px' });
      this.arrowElement.setAttribute('data-placement', resolvedPlacement);
    }

    if (this.debug && this.triggerElement) this.logDebug(resolvedPlacement);

    this.positioned = true;
    this.bindContentHoverIfNeeded();
  }

  // ── Debug ─────────────────────────────────────────────────────
  private logDebug(resolvedPlacement: string) {
    try {
      if (!this.popupElement || !this.triggerElement) return;
      const tr = this.triggerElement.getBoundingClientRect();
      const pp = this.popupElement.getBoundingClientRect();
      const base = resolvedPlacement.split('-')[0] as 'top'|'bottom'|'left'|'right';
      let mainGap = 0;
      if (base === 'top') mainGap = tr.top - pp.bottom;
      if (base === 'bottom') mainGap = pp.top - tr.bottom;
      if (base === 'left') mainGap = tr.left - pp.right;
      if (base === 'right') mainGap = pp.left - tr.right;
      let tipGap: number | null = null;
      if (this.arrow && this.arrowElement) {
        const ar = this.arrowElement.getBoundingClientRect();
        if (base === 'top') tipGap = tr.top - ar.bottom;
        if (base === 'bottom') tipGap = ar.top - tr.bottom;
        if (base === 'left') tipGap = tr.left - ar.right;
        if (base === 'right') tipGap = ar.left - tr.right;
      }
      // eslint-disable-next-line no-console
      console.log('Popup debug:', { placement: resolvedPlacement, mainAxisGap: Number(mainGap.toFixed(2)), arrowTipGap: tipGap != null ? Number(tipGap.toFixed(2)) : null, arrow: !!this.arrow });
    } catch {}
  }

  // ── Visibility ─────────────────────────────────────────────────
  private async playOpenMotion() {
    if (!this.motionEnabled) { this.motion = 'open'; return; }
    this.motion = 'opening';
    await this.nextFrame();
    // 强制一次样式计算以刷新初始状态，保证过渡触发
    try {
      this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
      // @ts-ignore
      void this.popupElement?.getBoundingClientRect();
    } catch {}
    await this.nextFrame();
    this.motion = 'open';
  }

  show() {
    if (this.disabled || this.isVisible) return; this.clearTimers();
    const delay = this.showDelay > 0 && !(this.trigger === 'hover' && this.interactive) ? this.showDelay : 0;
    const run = async () => {
      this.isVisible = true; this.visible = true;
      this.positioned = false;
      await this.updatePosition();
      await this.playOpenMotion();
      this.bindContentHoverIfNeeded();
      this.setupAutoClose();
      this.ldesignVisibleChange.emit(true);
    };
    if (delay) this.showTimer = window.setTimeout(run, delay); else run();
  }
  hide() {
    if (!this.isVisible) return; this.clearTimers();
    const finalize = () => {
      this.isVisible = false; this.visible = false;
      this.motion = 'closed';
      this.cleanup?.();
      this.unbindContentHover();
      this.clearAutoCloseTimer();
      this.contextVirtualRef = undefined;
      this.removeFromContainerIfNeeded();
      this.ldesignVisibleChange.emit(false);
    };
    const run = () => {
      if (this.motionEnabled && this.motionDuration > 0) {
        this.motion = 'closing';
        window.setTimeout(finalize, this.motionDuration);
      } else {
        finalize();
      }
    };
    const delay = this.hideDelay > 0 ? this.hideDelay : 0;
    if (delay) this.hideTimer = window.setTimeout(run, delay); else run();
  }
  toggle() { this.isVisible ? this.hide() : this.show(); }

  private async setVisibleInternal(visible: boolean) {
    // 统一处理外部受控 visible 变更
    if (visible) {
      if (this.isVisible) return;
      this.isVisible = true; this.visible = true;
      this.positioned = false; await this.updatePosition();
      await this.playOpenMotion();
      this.bindContentHoverIfNeeded();
      this.ldesignVisibleChange.emit(true);
    } else {
      if (!this.isVisible) return;
      if (this.motionEnabled && this.motionDuration > 0) {
        this.motion = 'closing';
        window.setTimeout(() => {
          this.isVisible = false; this.visible = false;
          this.motion = 'closed';
          this.cleanup?.();
          this.unbindContentHover();
          this.contextVirtualRef = undefined;
          this.removeFromContainerIfNeeded();
          this.ldesignVisibleChange.emit(false);
        }, this.motionDuration);
      } else {
        this.isVisible = false; this.visible = false; this.motion = 'closed';
        this.cleanup?.(); this.unbindContentHover(); this.contextVirtualRef = undefined; this.removeFromContainerIfNeeded();
        this.ldesignVisibleChange.emit(false);
      }
    }
  }

  private async setVisible(visible: boolean) {
    // 不再直接使用，保留以兼容旧调用路径
    if (visible) this.show(); else this.hide();
  }

  private clearTimers() { if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = undefined; } if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = undefined; } }
  
  private setupAutoClose() {
    if (this.autoCloseDelay > 0) {
      this.clearAutoCloseTimer();
      this.autoCloseTimer = window.setTimeout(() => this.hide(), this.autoCloseDelay);
    }
  }
  
  private clearAutoCloseTimer() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = undefined;
    }
  }

  // ── Content hover ──────────────────────────────────────────────
  private bindContentHoverIfNeeded() {
    if (this.trigger !== 'hover' || !this.interactive || this.contentHoverBound) return;
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;
    this.popupElement.addEventListener('mouseenter', this.onMouseEnter);
    this.popupElement.addEventListener('mouseleave', this.onMouseLeave);
    this.contentHoverBound = true;
  }
  private unbindContentHover() {
    if (!this.contentHoverBound || !this.popupElement) return;
    this.popupElement.removeEventListener('mouseenter', this.onMouseEnter);
    this.popupElement.removeEventListener('mouseleave', this.onMouseLeave);
    this.contentHoverBound = false;
  }

  // ── Render ─────────────────────────────────────────────────────
  private getPopupStyle() {
    const style: any = { position: this.getStrategy(), visibility: this.positioned ? 'visible' : 'hidden' };
    const w = this.toPx(this.width); if (w) style.width = w;
    const mw = this.toPx(this.maxWidth); if (mw) style.maxWidth = mw;
    
    // 预设尺寸
    if (this.size === 'small') {
      style.minWidth = '80px';
      style.maxWidth = '240px';
    } else if (this.size === 'large') {
      style.minWidth = '200px';
      style.maxWidth = '480px';
    }
    
    style['--ldp-motion'] = this.motionEnabled ? `${this.motionDuration}ms` : '0ms';
    style['--ldp-motion-distance'] = `${this.motionDistance}px`;
    return style;
  }
  
  private getPopupClasses() {
    const classes = ['ldesign-popup__content'];
    if (this.popupClass) classes.push(this.popupClass);
    if (this.animation && this.motionEnabled) classes.push(`ldesign-popup__content--${this.animation}`);
    if (this.size) classes.push(`ldesign-popup__content--${this.size}`);
    return classes.join(' ');
  }

  render() {
    return (
      <Host class={{ 'ldesign-popup': true, 'ldesign-popup--disabled': this.disabled, 'ldesign-popup--dark': this.theme === 'dark' }}>
        <div class="ldesign-popup__trigger"><slot name="trigger" /></div>
        {this.isVisible && (
          <div id={this.uid} class={this.getPopupClasses()} data-state={this.motionEnabled ? this.motion : 'open'} style={this.getPopupStyle()} role={this.popupRole} aria-hidden={!this.isVisible}>
            {this.arrow && (<div class="ldesign-popup__arrow"></div>)}
            <div class="ldesign-popup__inner">
              {this.popupTitle && (<div class="ldesign-popup__title">
                {this.popupTitle}
                {this.closable && (
                  <button class="ldesign-popup__close" onClick={this.onCloseClick} aria-label="关闭">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
                    </svg>
                  </button>
                )}
              </div>)}
              <div class="ldesign-popup__body">
                {this.loading ? (
                  <div class="ldesign-popup__loading">
                    <div class="ldesign-popup__spinner"></div>
                    <span>加载中...</span>
                  </div>
                ) : this.content ? (
                  <div innerHTML={this.content}></div>
                ) : (
                  <slot />
                )}
              </div>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
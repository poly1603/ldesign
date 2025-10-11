import { Component, Prop, State, Element, h, Host, Watch, Method, Event, EventEmitter } from '@stencil/core';

/**
 * ldesign-ellipsis 文本省略/展开组件
 * - 折叠时按指定行数展示，右下角显示"更多"按钮
 * - 展开后：若最后一行还有空间，则"收起"出现在最后一行最右侧；否则换到下一行右侧
 * - 兼容 PC 与移动端，按钮有较大点击热区
 */
@Component({ tag: 'ldesign-ellipsis', styleUrl: 'ellipsis.less', shadow: false })
export class LdesignEllipsis {
  @Element() host!: HTMLElement;

  /** 要展示的文本内容（纯文本） */
  @Prop() content?: string;

  /** 折叠时显示的行数 */
  @Prop() lines: number = 3;

  /** 展开按钮文案（折叠态） */
  @Prop() expandText: string = '更多';

  /** 收起按钮文案（展开态） */
  @Prop() collapseText: string = '收起';

  /** 是否默认展开 */
  @Prop({ reflect: true }) defaultExpanded: boolean = false;

  /** 当前是否展开（受控模式，可选） */
  @Prop() expanded?: boolean;

  /** 行为控制：auto（默认）| inline（强制同行右置）| newline（强制换行右对齐） */
  @Prop() actionPlacement: 'auto' | 'inline' | 'newline' = 'auto';
  /** 同行放置时，文本与"收起"的间距（像素） */
  @Prop() inlineGap: number = 8;
  /** 折叠态是否显示渐变遮罩 */
  @Prop() showFade: boolean = true;
  /** 渐变遮罩宽度（如 40% 或 120） */
  @Prop() fadeWidth: number | string = '40%';
  /** 折叠且溢出时，悬浮显示全文 */
  @Prop() tooltipOnCollapsed: boolean = false;
  /** Tooltip 位置 */
  @Prop() tooltipPlacement: string = 'top';
  /** Tooltip 最大宽度 */
  @Prop() tooltipMaxWidth: number = 320;
  /** 展开/收起高度变化动画时长（ms） */
  @Prop() transitionDuration: number = 200;
  /** 展开态允许 ESC 收起 */
  @Prop() collapseOnEscape: boolean = false;
  /** 响应式行数，根据屏宽选择不同行数 */
  @Prop() linesMap?: { sm?: number; md?: number; lg?: number; xl?: number };
  /** 按钮图标（可选） */
  @Prop() expandIcon?: string;
  @Prop() collapseIcon?: string;
  /** 自定义按钮 class 和 style */
  @Prop() actionClass?: string;
  @Prop() actionStyle?: any;
  /** 双击文本切换展开/收起 */
  @Prop() doubleClickToggle: boolean = false;
  /** 展开时滚动到组件顶部 */
  @Prop() scrollIntoViewOnExpand: boolean = false;
  /** 收起时滚动到组件顶部 */
  @Prop() scrollIntoViewOnCollapse: boolean = false;
  /** 渐变遮罩颜色（可自定义多个颜色点） */
  @Prop() fadeColors?: string;
  /** 按钮悬浮效果增强 */
  @Prop() enhancedHover: boolean = true;
  /** 自动折叠延迟（毫秒，0为不自动折叠） */
  @Prop() autoCollapseDelay: number = 0;

  /** 展开/折叠状态变化回调（自定义事件：ldesignToggle） */
  @Event() ldesignTruncateChange!: EventEmitter<{ overflowed: boolean }>;

  @State() private isExpanded: boolean = false;
  @State() private isOverflowed: boolean = false;
  @State() private inlineFits: boolean = false;
  @State() private actionWidth: number = 0;
  @State() private textToRender: string = '';
  @State() private effectiveLines: number = 3;
  @State() private targetMaxHeight: number = 0;
  @State() private fadeOpacity: number = 1;
  @State() private actualHeight: number = 0;
  @State() private transformScale: number = 1;
  private prevOverflowed?: boolean;
  private initialLightText?: string;
  @State() private isCollapsing: boolean = false;
  @State() private isAnimating: boolean = false;
  private animationFrame?: number;
  private animationTimeout?: number;
  private debounceTimer?: number;
  private lastRefreshTime: number = 0;
  private autoCollapseTimer?: number;

  private ro?: ResizeObserver;
  private containerEl?: HTMLDivElement;
  private contentEl?: HTMLDivElement;

  private measureWrap?: HTMLDivElement;
  private measureFull?: HTMLDivElement;
  private measureClamp?: HTMLDivElement;
  private measureInline?: HTMLDivElement;
  private measureAction?: HTMLSpanElement;

  @Watch('content')
  @Watch('lines')
  onInputChange() { this.textToRender = this.computeText(); this.refreshAll(); }

  @Watch('expanded')
  onExpandedPropChange(v?: boolean) {
    if (typeof v === 'boolean') {
      this.isExpanded = v;
      this.refreshAll();
    }
  }

  @Watch('lines') onLinesChange() { this.effectiveLines = this.getEffectiveLines(); this.refreshAll(); }
  @Watch('linesMap') onLinesMapChange() { this.effectiveLines = this.getEffectiveLines(); this.refreshAll(); }

  componentWillLoad() {
    this.isExpanded = typeof this.expanded === 'boolean' ? !!this.expanded : !!this.defaultExpanded;
    this.textToRender = this.computeText();
    this.stripInitialLightDom();
    this.effectiveLines = this.getEffectiveLines();
  }

  componentDidLoad() {
    try {
      this.ro = new ResizeObserver(() => this.debouncedRefresh());
      if (this.host) this.ro.observe(this.host);
    } catch {}
    window.addEventListener('resize', this.onWindowResize, { passive: true });
    window.addEventListener('keydown', this.onKeyDown as any);
    this.ensureMeasureNodes();
    this.refreshAll();
  }

  disconnectedCallback() {
    try { this.ro?.disconnect(); } catch {}
    this.ro = undefined;
    window.removeEventListener('resize', this.onWindowResize as any);
    window.removeEventListener('keydown', this.onKeyDown as any);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.autoCollapseTimer) clearTimeout(this.autoCollapseTimer);
  }

  private computeText(): string {
    const fromProp = (this.content ?? '').toString();
    if (fromProp && fromProp.trim().length > 0) return fromProp;
    const fromLight = (this.host?.textContent ?? '').toString();
    if (fromLight && fromLight.trim().length > 0) {
      this.initialLightText = fromLight.trim();
      return this.initialLightText;
    }
    return (this.initialLightText || '').toString();
  }

  @Method() async update() { this.debouncedRefresh(); }

  private onWindowResize = () => {
    const prev = this.effectiveLines;
    this.effectiveLines = this.getEffectiveLines();
    if (prev !== this.effectiveLines) this.debouncedRefresh(); else this.debouncedRefresh();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.collapseOnEscape && this.isExpanded && e.key === 'Escape') {
      this.onCollapse();
    }
  };

  private stripInitialLightDom() {
    try {
      while (this.host?.firstChild) {
        this.host.removeChild(this.host.firstChild);
      }
    } catch {}
  }

  private debouncedRefresh = () => {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.refreshAll();
    }, 16) as any;
  };

  private ensureMeasureNodes() {
    if (!this.measureWrap) {
      const wrap = document.createElement('div');
      wrap.className = 'ld-ellipsis__measure';
      wrap.setAttribute('aria-hidden', 'true');
      Object.assign(wrap.style, {
        position: 'fixed',
        left: '-100000px',
        top: '-100000px',
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: '-1',
      } as CSSStyleDeclaration);

      const full = document.createElement('div');
      full.className = 'ld-ellipsis__m-full';

      const clamp = document.createElement('div');
      clamp.className = 'ld-ellipsis__m-clamp';

      const inline = document.createElement('div');
      inline.className = 'ld-ellipsis__m-inline';
      const inlineAction = document.createElement('span');
      inlineAction.className = 'ld-ellipsis__m-action';
      inline.appendChild(inlineAction);

      wrap.appendChild(full);
      wrap.appendChild(clamp);
      wrap.appendChild(inline);

      document.body.appendChild(wrap);
      this.measureWrap = wrap;
      this.measureFull = full;
      this.measureClamp = clamp;
      this.measureInline = inline;
      this.measureAction = inlineAction;
    }
  }

  private refreshAll = () => {
    this.syncMeasureContentAndWidth();

    const fullH = this.measureFull?.scrollHeight || 0;
    const clampH = this.measureClamp?.getBoundingClientRect().height || 0;
    const overflowed = fullH > clampH + 0.5;

    if (this.prevOverflowed !== overflowed) {
      this.prevOverflowed = overflowed;
      try { this.ldesignTruncateChange?.emit?.({ overflowed }); } catch {}
    }
    this.isOverflowed = overflowed;

    if (this.isExpanded && overflowed) {
      if (this.measureAction) this.measureAction.textContent = this.collapseText;
      const hWithAction = this.measureInline?.scrollHeight || 0;
      const hTextOnly = fullH;
      let fits = hWithAction <= hTextOnly + 0.5;
      if (this.actionPlacement === 'inline') fits = true;
      if (this.actionPlacement === 'newline') fits = false;
      this.inlineFits = fits;

      const aw = this.measureAction?.getBoundingClientRect().width || 0;
      this.actionWidth = Math.ceil(aw);
    } else {
      this.inlineFits = this.actionPlacement === 'inline';
    }

    const target = (this.isExpanded && !this.isCollapsing) ? fullH : clampH;
    this.targetMaxHeight = Math.max(0, Math.ceil(target));
    this.actualHeight = target;
    
    if (!this.isAnimating) {
      this.fadeOpacity = (this.isExpanded && !this.isCollapsing) ? 0 : 1;
    }
  };

  private syncMeasureContentAndWidth() {
    this.ensureMeasureNodes();
    const full = this.measureFull!;
    const clamp = this.measureClamp!;
    const inline = this.measureInline!;
    const inlineAction = this.measureAction!;

    const width = this.host?.getBoundingClientRect().width || 0;
    const cssWidth = width > 0 ? `${width}px` : 'auto';

    [full, clamp, inline].forEach(el => {
      Object.assign(el.style, {
        width: cssWidth,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
      } as CSSStyleDeclaration);
    });

    clamp.style.display = '-webkit-box';
    (clamp.style as any)['-webkitBoxOrient'] = 'vertical';
    (clamp.style as any)['-webkitLineClamp'] = String(this.effectiveLines);
    clamp.style.overflow = 'hidden';

    inline.textContent = this.textToRender || '';
    inlineAction.textContent = this.collapseText;

    full.textContent = this.textToRender || '';
    clamp.textContent = this.textToRender || '';
  }

  private onExpand = () => {
    const next = true;
    if (typeof this.expanded === 'boolean') {
      this.dispatchToggle(next);
    } else {
      this.isAnimating = true;
      this.fadeOpacity = 0;
      
      this.animationFrame = requestAnimationFrame(() => {
        this.isExpanded = next;
        this.dispatchToggle(next);
        this.refreshAll();
        
        this.animationTimeout = setTimeout(() => {
          this.isAnimating = false;
          
          if (this.scrollIntoViewOnExpand) {
            this.scrollToView();
          }
          
          this.setAutoCollapseTimer();
        }, this.transitionDuration) as any;
      });
    }
  };

  private onCollapse = () => {
    const next = false;
    
    if (this.autoCollapseTimer) {
      clearTimeout(this.autoCollapseTimer);
      this.autoCollapseTimer = undefined;
    }
    
    if (typeof this.expanded === 'boolean') {
      this.dispatchToggle(next);
    } else {
      this.isAnimating = true;
      this.isCollapsing = true;
      this.fadeOpacity = 1;
      
      this.animationFrame = requestAnimationFrame(() => {
        this.dispatchToggle(next);
        this.refreshAll();
        
        if (this.scrollIntoViewOnCollapse) {
          setTimeout(() => this.scrollToView(), this.transitionDuration);
        }
      });
    }
  };

  private dispatchToggle(val: boolean) {
    try {
      const ev = new CustomEvent('ldesignToggle', { detail: { expanded: val }, bubbles: true, cancelable: true });
      this.host?.dispatchEvent(ev);
    } catch {}
  }

  private scrollToView() {
    try {
      this.host?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {}
  }

  private setAutoCollapseTimer() {
    if (this.autoCollapseTimer) {
      clearTimeout(this.autoCollapseTimer);
      this.autoCollapseTimer = undefined;
    }
    
    if (this.autoCollapseDelay > 0 && this.isExpanded) {
      this.autoCollapseTimer = setTimeout(() => {
        if (this.isExpanded) {
          this.onCollapse();
        }
      }, this.autoCollapseDelay) as any;
    }
  }

  private onDoubleClick = () => {
    if (!this.doubleClickToggle || !this.isOverflowed) return;
    
    if (this.isExpanded) {
      this.onCollapse();
    } else {
      this.onExpand();
    }
  };

  private renderCollapsed() {
    const showMore = this.isOverflowed;
    const wrapStyle: any = {
      maxHeight: this.targetMaxHeight ? `${this.targetMaxHeight}px` : undefined,
      transition: this.transitionDuration > 0 ? `max-height ${this.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${this.transitionDuration * 0.6}ms ease` : undefined,
      overflow: 'hidden',
      willChange: this.isAnimating ? 'max-height, opacity' : 'auto',
    };
    
    const defaultFadeColors = 'rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.5) 40%, rgba(255, 255, 255, 0.8) 60%, var(--ld-ellipsis-bg, var(--ldesign-bg-color, #fff)) 80%';
    const fadeBackground = this.fadeColors ? `linear-gradient(90deg, ${this.fadeColors})` : `linear-gradient(90deg, ${defaultFadeColors})`;
    
    const fadeStyle: any = { 
      width: typeof this.fadeWidth === 'number' ? `${this.fadeWidth}px` : this.fadeWidth,
      opacity: this.fadeOpacity,
      background: fadeBackground,
      transition: this.transitionDuration > 0 ? `opacity ${this.transitionDuration * 0.7}ms cubic-bezier(0.4, 0, 0.2, 1)` : undefined,
      willChange: this.isAnimating ? 'opacity' : 'auto',
    };

    const inner = (
      <div class="ldesign-ellipsis__wrap" style={wrapStyle} onTransitionEnd={this.onWrapTransitionEnd as any} ref={el => (this.containerEl = el as HTMLDivElement)}>
        <div
          class="ldesign-ellipsis__content ldesign-ellipsis__content--clamp"
          style={{ ['--ld-ellipsis-lines' as any]: String(this.effectiveLines) }}
          ref={el => (this.contentEl = el as HTMLDivElement)}
          onDblClick={this.onDoubleClick}
        >
          {this.textToRender}
        </div>
        {showMore ? (
          <div class="ldesign-ellipsis__ops">
            {this.showFade ? <div class="ldesign-ellipsis__fade" style={fadeStyle} /> : null}
            <button
              type="button"
              class={['ldesign-ellipsis__action', 'ldesign-ellipsis__action--more', this.actionClass].filter(Boolean).join(' ')}
              style={this.actionStyle}
              onClick={this.onExpand}
            >
              {this.expandIcon ? <ldesign-icon name={this.expandIcon} class="ldesign-ellipsis__action-icon" /> : null}
              {this.expandText}
            </button>
          </div>
        ) : null}
      </div>
    );

    if (showMore && this.tooltipOnCollapsed) {
      return (
        <ldesign-tooltip content={this.textToRender} placement={this.tooltipPlacement as any} maxWidth={this.tooltipMaxWidth} arrow={true}>
          {inner}
        </ldesign-tooltip>
      );
    }

    return inner;
  }

  private renderExpanded() {
    const showCollapse = this.isOverflowed;
    const fits = this.inlineFits;
    const gap = Math.max(0, Number(this.inlineGap) || 0);
    const spacerStyle = fits && this.actionWidth > 0 ? { width: `${this.actionWidth + gap}px` } : undefined;
    const wrapStyle: any = {
      maxHeight: this.targetMaxHeight ? `${this.targetMaxHeight}px` : undefined,
      transition: this.transitionDuration > 0 ? `max-height ${this.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${this.transitionDuration * 0.6}ms ease` : undefined,
      overflow: 'hidden',
      willChange: this.isAnimating ? 'max-height, opacity' : 'auto',
    };
    
    const actionExtraClass = this.enhancedHover ? 'ldesign-ellipsis__action--enhanced' : '';

    return (
      <div class="ldesign-ellipsis__wrap ldesign-ellipsis__wrap--expanded" style={wrapStyle} onTransitionEnd={this.onWrapTransitionEnd as any} ref={el => (this.containerEl = el as HTMLDivElement)}>
        <div class="ldesign-ellipsis__content" ref={el => (this.contentEl = el as HTMLDivElement)} onDblClick={this.onDoubleClick}>
          {this.textToRender}
          {fits && showCollapse ? <span class="ldesign-ellipsis__spacer" style={spacerStyle as any} aria-hidden="true" /> : null}
        </div>
        {showCollapse ? (
          fits ? (
            <button
              type="button"
              class={['ldesign-ellipsis__action', 'ldesign-ellipsis__action--less', 'ldesign-ellipsis__action--abs', actionExtraClass, this.actionClass].filter(Boolean).join(' ')}
              style={this.actionStyle}
              onClick={this.onCollapse}
            >
              {this.collapseIcon ? <ldesign-icon name={this.collapseIcon} class="ldesign-ellipsis__action-icon" /> : null}
              {this.collapseText}
            </button>
          ) : (
            <div class="ldesign-ellipsis__action-row">
              <button
                type="button"
                class={['ldesign-ellipsis__action', 'ldesign-ellipsis__action--less', actionExtraClass, this.actionClass].filter(Boolean).join(' ')}
                style={this.actionStyle}
                onClick={this.onCollapse}
              >
                {this.collapseIcon ? <ldesign-icon name={this.collapseIcon} class="ldesign-ellipsis__action-icon" /> : null}
                {this.collapseText}
              </button>
            </div>
          )
        ) : null}
      </div>
    );
  }

  private onWrapTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName !== 'max-height') return;
    if (this.isCollapsing) {
      if (typeof this.expanded !== 'boolean') {
        this.isExpanded = false;
      }
      this.isCollapsing = false;
      this.isAnimating = false;
      this.refreshAll();
    }
  };

  private getEffectiveLines(): number {
    const base = this.lines || 3;
    const map = this.linesMap;
    const w = typeof window !== 'undefined' ? window.innerWidth : 0;
    if (!map) return base;
    if (w >= 1200 && typeof map.xl === 'number') return map.xl!;
    if (w >= 992 && typeof map.lg === 'number') return map.lg!;
    if (w >= 768 && typeof map.md === 'number') return map.md!;
    if (typeof map.sm === 'number') return map.sm!;
    return base;
  }

  render() {
    return (
      <Host class={{ 'ldesign-ellipsis': true }}>
        {this.isExpanded ? this.renderExpanded() : this.renderCollapsed()}
      </Host>
    );
  }
}

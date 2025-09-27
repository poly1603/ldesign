import { Component, Prop, State, Element, h, Host, Watch, Method, Event, EventEmitter } from '@stencil/core';

/**
 * ldesign-ellipsis 文本省略/展开组件
 * - 折叠时按指定行数展示，右下角显示“更多”按钮
 * - 展开后：若最后一行还有空间，则“收起”出现在最后一行最右侧；否则换到下一行右侧
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
  /** 同行放置时，文本与“收起”的间距（像素） */
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

  /** 展开/折叠状态变化回调（自定义事件：ldesignToggle） */
  // 使用自定义事件名以保持与其他组件一致的命名风格
  @Event() ldesignTruncateChange!: EventEmitter<{ overflowed: boolean }>;

  @State() private isExpanded: boolean = false;
  @State() private isOverflowed: boolean = false; // 是否需要“更多”
  @State() private inlineFits: boolean = false;   // 展开态“收起”是否能放在最后一行
  @State() private actionWidth: number = 0;       // “收起”按钮宽度用于占位
  @State() private textToRender: string = '';
  @State() private effectiveLines: number = 3;    // 当前生效的行数（考虑响应式）
  @State() private targetMaxHeight: number = 0;   // 用于动画的 max-height 目标
  private prevOverflowed?: boolean;
  private initialLightText?: string;             // 记录最初的直写文本
  @State() private isCollapsing: boolean = false; // 正在执行收起动画

  private ro?: ResizeObserver;
  private containerEl?: HTMLDivElement;      // 可视区域容器
  private contentEl?: HTMLDivElement;        // 实际文本（可视）

  // 测量容器（离屏）
  private measureWrap?: HTMLDivElement;
  private measureFull?: HTMLDivElement;      // 全文高度
  private measureClamp?: HTMLDivElement;     // 行数裁剪高度
  private measureInline?: HTMLDivElement;    // 文本 + 收起（行内）高度
  private measureAction?: HTMLSpanElement;   // 收起按钮测量宽度

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
    // 清理直写文本，避免与渲染内容重复显示
    this.stripInitialLightDom();
    this.effectiveLines = this.getEffectiveLines();
  }

  componentDidLoad() {
    try {
      this.ro = new ResizeObserver(() => this.refreshAll());
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
  }

  private computeText(): string {
    const fromProp = (this.content ?? '').toString();
    if (fromProp && fromProp.trim().length > 0) return fromProp;
    // 首次加载前读取直写文本并缓存
    const fromLight = (this.host?.textContent ?? '').toString();
    if (fromLight && fromLight.trim().length > 0) {
      this.initialLightText = fromLight.trim();
      return this.initialLightText;
    }
    // 后续若已清空 Light DOM，则使用缓存
    return (this.initialLightText || '').toString();
  }

  @Method() async update() { this.refreshAll(); }

  private onWindowResize = () => {
    const prev = this.effectiveLines;
    this.effectiveLines = this.getEffectiveLines();
    if (prev !== this.effectiveLines) this.refreshAll(); else this.refreshAll();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.collapseOnEscape && this.isExpanded && e.key === 'Escape') {
      this.onCollapse();
    }
  };

  private stripInitialLightDom() {
    try {
      // 移除初始写在标签内的纯文本，避免页面上显示两份内容
      // 在 Stencil 渲染前清空子节点不影响后续 VDOM 挂载
      while (this.host?.firstChild) {
        this.host.removeChild(this.host.firstChild);
      }
    } catch {}
  }

  private ensureMeasureNodes() {
    if (!this.measureWrap) {
      const wrap = document.createElement('div');
      wrap.className = 'ld-ellipsis__measure';
      wrap.setAttribute('aria-hidden', 'true');
      // 离屏且不影响布局
      // 使用 fixed 并放到视口外，确保能获取到准确尺寸（width 由可视容器赋值）
      Object.assign(wrap.style, {
        position: 'fixed',
        left: '-100000px',
        top: '-100000px',
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: '-1',
      } as CSSStyleDeclaration);

      // full
      const full = document.createElement('div');
      full.className = 'ld-ellipsis__m-full';

      // clamp
      const clamp = document.createElement('div');
      clamp.className = 'ld-ellipsis__m-clamp';

      // inline (text + [收起])
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
    // 同步测量节点内容与宽度
    this.syncMeasureContentAndWidth();

    // 1) 判断是否溢出（是否需要“更多”）
    const fullH = this.measureFull?.scrollHeight || 0;
    const clampH = this.measureClamp?.getBoundingClientRect().height || 0;
    const overflowed = fullH > clampH + 0.5; // 容错

    // 变化时派发事件
    if (this.prevOverflowed !== overflowed) {
      this.prevOverflowed = overflowed;
      try { this.ldesignTruncateChange?.emit?.({ overflowed }); } catch {}
    }
    this.isOverflowed = overflowed;

    // 2) 展开态下，判断“收起”是否能放在最后一行的最右侧
    if (this.isExpanded && overflowed) {
      // 设置 inline 文案与测量
      if (this.measureAction) this.measureAction.textContent = this.collapseText;
      // 有按钮的高度
      const hWithAction = this.measureInline?.scrollHeight || 0;
      // 无按钮的高度（full）
      const hTextOnly = fullH;
      let fits = hWithAction <= hTextOnly + 0.5; // 没有产生换行
      // 行为覆盖
      if (this.actionPlacement === 'inline') fits = true;
      if (this.actionPlacement === 'newline') fits = false;
      this.inlineFits = fits;

      // 测出按钮宽度
      const aw = this.measureAction?.getBoundingClientRect().width || 0;
      this.actionWidth = Math.ceil(aw);
    } else {
      // 折叠态或未溢出：inlineFits 不生效
      this.inlineFits = this.actionPlacement === 'inline';
    }

    // 3) 计算动画目标高度
    const target = (this.isExpanded && !this.isCollapsing) ? fullH : clampH;
    this.targetMaxHeight = Math.max(0, Math.ceil(target));
  };

  private syncMeasureContentAndWidth() {
    this.ensureMeasureNodes();
    const wrap = this.measureWrap!;
    const full = this.measureFull!;
    const clamp = this.measureClamp!;
    const inline = this.measureInline!;
    const inlineAction = this.measureAction!;

    const width = this.host?.getBoundingClientRect().width || 0;
    const cssWidth = width > 0 ? `${width}px` : 'auto';

    // 保持相同的字体/行高/断行策略
    [full, clamp, inline].forEach(el => {
      Object.assign(el.style, {
        width: cssWidth,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
      } as CSSStyleDeclaration);
    });

    // clamp 行数（考虑响应式）
    clamp.style.display = '-webkit-box';
    (clamp.style as any)['-webkitBoxOrient'] = 'vertical';
    (clamp.style as any)['-webkitLineClamp'] = String(this.effectiveLines);
    clamp.style.overflow = 'hidden';

    // inline：文本 + 按钮
    inline.textContent = this.textToRender || '';
    const act = inlineAction; // 末尾附加按钮
    act.textContent = this.collapseText;

    // full：纯文本
    full.textContent = this.textToRender || '';
    // clamp：纯文本（行数限制）
    clamp.textContent = this.textToRender || '';
  }

  private onExpand = () => {
    const next = true;
    if (typeof this.expanded === 'boolean') {
      // 受控时，仅派发事件
      this.dispatchToggle(next);
    } else {
      this.isExpanded = next; this.dispatchToggle(next); this.refreshAll();
    }
  };

  private onCollapse = () => {
    const next = false;
    if (typeof this.expanded === 'boolean') {
      // 受控：仅派发事件，交给外部控制 expanded
      this.dispatchToggle(next);
    } else {
      // 非受控：先触发“收起动画”，完毕后再真正切换 isExpanded=false
      this.isCollapsing = true;
      this.dispatchToggle(next);
      this.refreshAll();
      // 在 transitionend 回调内收尾（见 onWrapTransitionEnd）
    }
  };

  private dispatchToggle(val: boolean) {
    try {
      const ev = new CustomEvent('ldesignToggle', { detail: { expanded: val }, bubbles: true, cancelable: true });
      this.host?.dispatchEvent(ev);
    } catch {}
  }

  private renderCollapsed() {
    const showMore = this.isOverflowed;
    const wrapStyle: any = {
      maxHeight: this.targetMaxHeight ? `${this.targetMaxHeight}px` : undefined,
      transition: this.transitionDuration > 0 ? `max-height ${this.transitionDuration}ms` : undefined,
      overflow: 'hidden',
    };
    const fadeStyle: any = { width: typeof this.fadeWidth === 'number' ? `${this.fadeWidth}px` : this.fadeWidth };

    const inner = (
      <div class="ldesign-ellipsis__wrap" style={wrapStyle} onTransitionEnd={this.onWrapTransitionEnd as any} ref={el => (this.containerEl = el as HTMLDivElement)}>
        <div
          class="ldesign-ellipsis__content ldesign-ellipsis__content--clamp"
          style={{ ['--ld-ellipsis-lines' as any]: String(this.effectiveLines) }}
          ref={el => (this.contentEl = el as HTMLDivElement)}
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
      transition: this.transitionDuration > 0 ? `max-height ${this.transitionDuration}ms` : undefined,
      overflow: 'hidden',
    };

    return (
      <div class="ldesign-ellipsis__wrap ldesign-ellipsis__wrap--expanded" style={wrapStyle} onTransitionEnd={this.onWrapTransitionEnd as any} ref={el => (this.containerEl = el as HTMLDivElement)}>
        <div class="ldesign-ellipsis__content" ref={el => (this.contentEl = el as HTMLDivElement)}>
          {this.textToRender}
          {/* 占位：为绝对定位的“收起”预留末尾空间，避免覆盖文本 */}
          {fits && showCollapse ? <span class="ldesign-ellipsis__spacer" style={spacerStyle as any} aria-hidden="true" /> : null}
        </div>
        {showCollapse ? (
          fits ? (
            <button
              type="button"
              class={['ldesign-ellipsis__action', 'ldesign-ellipsis__action--less', 'ldesign-ellipsis__action--abs', this.actionClass].filter(Boolean).join(' ')}
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
                class={['ldesign-ellipsis__action', 'ldesign-ellipsis__action--less', this.actionClass].filter(Boolean).join(' ')}
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
        // 非受控：动画结束后再切换到折叠态（渲染 clamp 版本）
        this.isExpanded = false;
      }
      this.isCollapsing = false;
      this.refreshAll();
    }
  };

  private getEffectiveLines(): number {
    const base = this.lines || 3;
    const map = this.linesMap;
    const w = typeof window !== 'undefined' ? window.innerWidth : 0;
    if (!map) return base;
    // 简单断点：sm<576, md<768, lg<992, xl>=1200
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

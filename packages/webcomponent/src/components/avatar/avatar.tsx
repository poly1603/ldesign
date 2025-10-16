import { Component, Prop, State, Event, EventEmitter, Watch, h, Host, Element } from '@stencil/core';

/**
 * Avatar 头像
 * - 三种展示形态：图片、图标、文字
 * - 三种尺寸：small / medium / large，或自定义像素
 * - 两种形状：circle / square
 * - 文本头像自动缩放，支持 gap 调节左右留白
 * - 支持徽标（红点或计数）
 * - 支持响应式尺寸（clamp）
 */
@Component({ tag: 'ldesign-avatar', styleUrl: 'avatar.less', shadow: false })
export class LdesignAvatar {
  @Element() el!: HTMLElement;

  // 展示优先级：src > icon > text/slot > 默认 user 图标
  /** 图片地址 */
  @Prop() src?: string;
  /** 响应式图片 srcset */
  @Prop() srcset?: string;
  /** 响应式图片 sizes */
  @Prop() sizes?: string;
  /** 替代文本 */
  @Prop() alt?: string;
  /** 图片填充模式 */
  @Prop() fit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' = 'cover';

  /** 图标名称（Lucide），无 src 时生效 */
  @Prop() icon?: string;

  /** 文字内容（不传则使用默认插槽的文本节点）*/
  @Prop() text?: string;

  /** 文字与容器左右间距（px），仅文字头像生效 */
  @Prop() gap: number = 4;

  /** 是否根据宽度自动缩放文字 */
  @Prop() autosize: boolean = true;

  /** 尺寸：预设 small/middle/medium/large 或自定义像素 */
  @Prop() size: 'small' | 'middle' | 'medium' | 'large' | number = 'medium';

  /** 形状：圆形或方形 */
  @Prop() shape: 'circle' | 'square' = 'circle';

  /** 文本/图标颜色 */
  @Prop() color?: string;
  /** 背景色（图标与文字时有效；图片时作为容器背景） */
  @Prop() background?: string;

  /** 响应式尺寸（使用 CSS clamp 设置宽高） */
  @Prop() responsive: boolean = false;
  /** clamp 最小像素（responsive 为 true 时生效） */
  @Prop() responsiveMin: number = 28;
  /** clamp 最大像素（responsive 为 true 时生效） */
  @Prop() responsiveMax: number = 64;
  /** clamp 中间项，接受任何 CSS 长度表达式，默认 10vw */
  @Prop() responsiveMid: string = '10vw';

  /** 是否显示徽标红点 */
  @Prop() badge: boolean = false;
  /** 徽标数字，设置后显示计数气泡，优先级高于 badge */
  @Prop() badgeValue?: number | string;
  /** 徽标颜色（红点/气泡背景色） */
  @Prop() badgeColor: string = '#ff4d4f';
  /** 徽标位置 */
  @Prop() badgePosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  /** 徽标偏移量 */
  @Prop() badgeOffset: [number, number] = [0, 0];

  /** 在线状态指示器 */
  @Prop() status?: 'online' | 'offline' | 'busy' | 'away';
  /** 状态指示器颜色（覆盖默认） */
  @Prop() statusColor?: string;

  /** 是否可点击（会添加悬浮效果） */
  @Prop() clickable: boolean = false;
  /** 是否显示边框 */
  @Prop() border: boolean = false;
  /** 边框颜色 */
  @Prop() borderColor: string = '#e8e8e8';
  /** 边框宽度 */
  @Prop() borderWidth: number = 2;

  /** 是否显示加载态 */
  @Prop() loading: boolean = false;

  /** 加载成功 */
  @Event() ldesignLoad!: EventEmitter<{ width: number; height: number; src: string }>;
  /** 加载失败 */
  @Event() ldesignError!: EventEmitter<{ src?: string; error: string }>;
  /** 点击 */
  @Event() ldesignClick!: EventEmitter<MouseEvent>;

  @State() private hasImgError: boolean = false;
  @State() private textScale: number = 1; // 文本缩放

  private textEl?: HTMLSpanElement; // 文本内部元素
  private resizeObs?: ResizeObserver;

  @Watch('text')
  @Watch('gap')
  @Watch('size')
  onTextRelatedChange() { this.queueMeasure(); }

  @Watch('src')
  onSrcChange() {
    this.hasImgError = false;
  }

  componentDidLoad() {
    this.bindResize();
    this.queueMeasure();
  }

  disconnectedCallback() {
    try { this.resizeObs?.disconnect(); } catch {}
  }

  private bindResize() {
    if (!this.autosize) return;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObs = new ResizeObserver(() => this.measureText());
      this.resizeObs.observe(this.el);
    } else {
      // 退化：窗口尺寸变化时尝试重算
      (globalThis as any)?.addEventListener?.('resize', this.measureText, { passive: true } as any);
    }
  }

  private queueMeasure() {
    if (!this.autosize) return;
    requestAnimationFrame(() => this.measureText());
  }

  private measureText = () => {
    if (!this.autosize) return;
    const root = this.el as HTMLElement;
    const stringEl = this.textEl;
    if (!root || !stringEl) {
      this.textScale = 1;
      return;
    }

    // 先重置 scale 以获取真实宽度
    stringEl.style.transform = 'scale(1)';
    const box = root.getBoundingClientRect();
    const maxW = Math.max(0, box.width - this.gap * 2);
    // 使用 scrollWidth 更稳妇
    const strW = stringEl.scrollWidth || stringEl.offsetWidth || 0;
    if (maxW <= 0 || strW <= 0) {
      this.textScale = 1;
      return;
    }
    const s = Math.max(0.5, Math.min(1, maxW / strW));
    this.textScale = s;
    stringEl.style.transform = `scale(${s})`;
  };

  private getRootClass(): string {
    const cls = ['ldesign-avatar'];
    const size = typeof this.size === 'string' ? (this.size === 'middle' ? 'medium' : this.size) : 'custom';
    cls.push(`ldesign-avatar--${size}`);
    cls.push(`ldesign-avatar--shape-${this.shape}`);
    if (this.src && !this.hasImgError) cls.push('ldesign-avatar--image');
    else if (this.icon) cls.push('ldesign-avatar--icon');
    else cls.push('ldesign-avatar--text');
    if (this.responsive) cls.push('ldesign-avatar--responsive');
    if (this.clickable) cls.push('ldesign-avatar--clickable');
    if (this.border) cls.push('ldesign-avatar--border');
    if (this.loading) cls.push('ldesign-avatar--loading');
    if (this.status) cls.push('ldesign-avatar--has-status');
    return cls.join(' ');
  }

  private getRootStyle(): { [k: string]: string } {
    const style: { [k: string]: string } = {};
    if (typeof this.size === 'number') {
      style.width = `${this.size}px`;
      style.height = `${this.size}px`;
      style.lineHeight = `${this.size}px`;
    } else if (this.responsive) {
      style.width = `clamp(${this.responsiveMin}px, ${this.responsiveMid}, ${this.responsiveMax}px)`;
      style.height = `clamp(${this.responsiveMin}px, ${this.responsiveMid}, ${this.responsiveMax}px)`;
      style.lineHeight = `clamp(${this.responsiveMin}px, ${this.responsiveMid}, ${this.responsiveMax}px)`;
    }
    if (this.background) style.background = this.background;
    if (this.color) style.color = this.color;
    if (this.border) {
      style['--avatar-border-color'] = this.borderColor;
      style['--avatar-border-width'] = `${this.borderWidth}px`;
    }
    return style;
  }

  private handleClick = (e: MouseEvent) => {
    this.ldesignClick.emit(e);
  };

  private handleImgLoad = (ev: Event) => {
    const img = ev.currentTarget as HTMLImageElement;
    this.hasImgError = false;
    this.ldesignLoad.emit({ width: img.naturalWidth, height: img.naturalHeight, src: img.currentSrc || img.src });
  };

  private handleImgError = () => {
    this.hasImgError = true;
    this.ldesignError.emit({ src: this.src, error: 'load error' });
  };

  private renderInner() {
    // 1) 图片
    if (this.src && !this.hasImgError) {
      return (
        <img class="ldesign-avatar__img" src={this.src} srcSet={this.srcset} sizes={this.sizes} alt={this.alt}
             style={{ objectFit: this.fit }} onLoad={this.handleImgLoad} onError={this.handleImgError} />
      );
    }

    // 2) 图标
    if (this.icon) {
      return (
        <ldesign-icon class="ldesign-avatar__icon" name={this.icon} />
      );
    }

    // 3) 文字（优先 text 属性，否则读取默认插槽纯文本）
    const text = (this.text != null) ? String(this.text) : (this.el.textContent || '').trim();
    return (
      <span class="ldesign-avatar__string" ref={el => this.textEl = el as HTMLSpanElement} style={{ transform: `scale(${this.textScale})`, padding: `0 ${this.gap}px` }}>
        {text || 'USER'}
      </span>
    );
  }

  private renderBadge() {
    const hasCount = this.badgeValue !== undefined && this.badgeValue !== null && this.badgeValue !== '';
    if (!hasCount && !this.badge) return null;
    const [offsetX, offsetY] = this.badgeOffset;
    const style = { 
      background: this.badgeColor,
      transform: `translate(${offsetX}px, ${offsetY}px)`
    } as any;
    const positionClass = `ldesign-avatar__badge--${this.badgePosition}`;
    return (
      <span class={{ 
        'ldesign-avatar__badge': true, 
        'ldesign-avatar__badge--dot': !hasCount, 
        'ldesign-avatar__badge--count': hasCount,
        [positionClass]: true
      }} style={style}>
        {hasCount ? String(this.badgeValue) : ''}
      </span>
    );
  }

  private renderStatus() {
    if (!this.status) return null;
    const statusColors = {
      online: '#52c41a',
      offline: '#8c8c8c',
      busy: '#ff4d4f',
      away: '#faad14'
    };
    const style = {
      background: this.statusColor || statusColors[this.status]
    } as any;
    return (
      <span class="ldesign-avatar__status" style={style}></span>
    );
  }

  private renderLoading() {
    if (!this.loading) return null;
    return (
      <div class="ldesign-avatar__loading">
        <div class="ldesign-avatar__loading-spinner"></div>
      </div>
    );
  }

  render() {
    return (
      <Host class={this.getRootClass()} style={this.getRootStyle()} onClick={this.handleClick}>
        {this.renderInner()}
        {this.renderBadge()}
        {this.renderStatus()}
        {this.renderLoading()}
      </Host>
    );
  }
}
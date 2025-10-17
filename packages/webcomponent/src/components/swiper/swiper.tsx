import { Component, Prop, State, Event, EventEmitter, Method, Watch, h, Host, Fragment, Element } from '@stencil/core';

/**
 * ldesign-swiper 轮播图组件
 * 功能：
 * - 受控/非受控当前索引（value/defaultValue）
 * - 自动播放（autoplay + autoplayDelay + pauseOnHover + disableOnInteraction）
 * - 循环（loop）
 * - 导航按钮（navigation）
 * - 分页圆点（pagination）
 * - 触摸/鼠标拖拽切换（allowTouchMove + mouseDrag + threshold）
 * - 键盘控制（keyboard）
 * - 水平/垂直方向（direction）
 * - 每屏多项显示（slidesPerView + spaceBetween）
 * - 公共方法（next/prev/slideTo/update）
 */
@Component({ tag: 'ldesign-swiper', styleUrl: 'swiper.less', shadow: false })
export class LdesignSwiper {
  @Element() host!: HTMLElement;

  // ── Props ─────────────────────────────────────────────
  /** 当前激活的索引（受控） */
  @Prop({ mutable: true }) value?: number;
  /** 默认激活索引（非受控） */
  @Prop() defaultValue?: number;

  /** 循环播放 */
  @Prop({ reflect: true }) loop: boolean = false;
  /** 自动播放 */
  @Prop({ reflect: true }) autoplay: boolean = false;
  /** 自动播放间隔（毫秒） */
  @Prop() autoplayDelay: number = 3000;
  /** 悬浮暂停自动播放 */
  @Prop() pauseOnHover: boolean = true;
  /** 交互后是否禁用自动播放 */
  @Prop() disableOnInteraction: boolean = true;

  /** 动画过渡时长（毫秒） */
  @Prop() speed: number = 300;
  /** 方向 */
  @Prop({ reflect: true }) direction: 'horizontal' | 'vertical' = 'horizontal';

  /** 每屏显示的滑块数量（>=1） */
  @Prop() slidesPerView: number = 1;
  /** 滑块间距（像素） */
  @Prop() spaceBetween: number = 0;

  /** 是否显示导航按钮 */
  @Prop({ reflect: true }) navigation: boolean = true;
  /** 是否显示分页圆点 */
  @Prop({ reflect: true }) pagination: boolean = true;
  /** 键盘控制 */
  @Prop() keyboard: boolean = false;
  /** 允许触摸/鼠标拖拽 */
  @Prop() allowTouchMove: boolean = true;
  /** 鼠标拖拽（PC） */
  @Prop() mouseDrag: boolean = true;
  /** 触发切换的拖拽阈值（像素） */
  @Prop() threshold: number = 50;
  /** 拖拽时显示抓手光标 */
  @Prop() grabCursor: boolean = true;

  // ── Events ────────────────────────────────────────────
  /** 切换事件：返回当前索引 */
  @Event() ldesignChange!: EventEmitter<number>;

  // ── State ─────────────────────────────────────────────
  @State() private currentIndex: number = 0;
  @State() private slideCount: number = 0;
  @State() private isDragging: boolean = false;

  private viewportEl?: HTMLElement;
  private trackEl?: HTMLElement;
  private slides: HTMLElement[] = [];

  private autoplayTimer?: number;
  private ro?: ResizeObserver;

  private viewportWidth = 0; private viewportHeight = 0;
  private slideSize = 0; // 单个滑块主轴尺寸（px）

  private dragStartX = 0; private dragStartY = 0; private startOffset = 0; private lastDelta = 0;

  // ── Watches ───────────────────────────────────────────
  @Watch('value')
  onValueChange(v?: number) {
    if (v === undefined) return;
    const target = this.normalizeIndex(v);
    this.goTo(target);
  }

  @Watch('slidesPerView')
  @Watch('spaceBetween')
  @Watch('direction')
  onLayoutChange() { this.update(); }

  // ── Lifecycle ─────────────────────────────────────────
  componentWillLoad() {
    const init = this.value != null ? this.value : (this.defaultValue != null ? this.defaultValue : 0);
    this.currentIndex = this.normalizeIndex(init);
  }

  componentDidLoad() {
    this.viewportEl = this.host.querySelector('.ld-swiper__viewport') as HTMLElement;
    this.trackEl = this.host.querySelector('.ld-swiper__track') as HTMLElement;
    this.collectSlides();
    this.update();
    this.applyActiveToSlides();
    this.bindHoverPause();
    this.bindKeyboardIfNeeded();
    this.startAutoplayIfNeeded();

    try {
      this.ro = new ResizeObserver(() => this.onResize());
      if (this.viewportEl) this.ro.observe(this.viewportEl);
    } catch {}
  }

  disconnectedCallback() {
    this.stopAutoplay();
    try { this.ro?.disconnect(); } catch {}
    this.unbindKeyboard();
  }

  private onResize() { this.update(); }

  // ── Public Methods ────────────────────────────────────
  @Method() async next() { this.slideTo(this.currentIndex + 1); }
  @Method() async prev() { this.slideTo(this.currentIndex - 1); }
  @Method() async slideTo(index: number, opts?: { immediate?: boolean }) {
    const target = this.normalizeIndex(index);
    this.goTo(target, opts?.immediate === true ? 0 : this.speed);
  }
  @Method() async update() {
    this.collectSlides();
    this.updateSizes();
    this.updateTransform(0); // 不要动画抖动
  }

  // ── Core ──────────────────────────────────────────────
  private collectSlides() {
    const nodes = Array.from(this.host.querySelectorAll('ldesign-swiper-slide')) as any[];
    this.slides = nodes;
    this.slideCount = nodes.length;
  }

  private normalizeIndex(i: number): number {
    if (this.slideCount <= 0) return 0;
    const n = Math.floor(Math.max(0, Math.min(Number.isFinite(i) ? i : 0, this.slideCount - 1)));
    return n;
  }

  private updateSizes() {
    const v = this.viewportEl;
    if (!v) return;
    this.viewportWidth = v.clientWidth;
    this.viewportHeight = v.clientHeight;

    const spv = Math.max(1, Math.floor(this.slidesPerView));
    const gap = Math.max(0, Math.floor(this.spaceBetween));

    if (this.direction === 'horizontal') {
      this.slideSize = spv > 0 ? (this.viewportWidth - (spv - 1) * gap) / spv : this.viewportWidth;
    } else {
      this.slideSize = spv > 0 ? (this.viewportHeight - (spv - 1) * gap) / spv : this.viewportHeight;
    }

    // 为 track 设置 gap
    if (this.trackEl) (this.trackEl.style as any).gap = `${gap}px`;

    // 为每个 slide 设置 flex-basis
    this.slides.forEach(slide => {
      if (this.direction === 'horizontal') {
        slide.style.flex = `0 0 ${Math.max(0, Math.round(this.slideSize))}px`;
      } else {
        // 垂直模式：用 height 固定主轴尺寸
        slide.style.flex = `0 0 ${Math.max(0, Math.round(this.slideSize))}px`;
      }
    });
  }

  private getOffsetByIndex(index: number): number {
    const gap = Math.max(0, Math.floor(this.spaceBetween));
    return index * (this.slideSize + gap);
  }

  private updateTransform(duration = this.speed, extraDelta = 0) {
    if (!this.trackEl) return;
    const base = this.getOffsetByIndex(this.currentIndex);
    const offset = base - extraDelta;

    // 设置过渡
    const ms = Math.max(0, Number.isFinite(duration) ? duration : 0);
    this.trackEl.style.transitionDuration = `${ms}ms`;

    if (this.direction === 'horizontal') {
      this.trackEl.style.transform = `translate3d(${-Math.round(offset)}px, 0, 0)`;
    } else {
      this.trackEl.style.transform = `translate3d(0, ${-Math.round(offset)}px, 0)`;
    }
  }

  private applyActiveToSlides() {
    this.slides.forEach((s, i) => {
      if ((s as any).active !== undefined) (s as any).active = i === this.currentIndex;
      if (i === this.currentIndex) {
        s.removeAttribute('aria-hidden');
      } else {
        s.setAttribute('aria-hidden', 'true');
      }
    });
  }

  private goTo(index: number, duration = this.speed) {
    if (this.slideCount <= 0) return;

    // 边界处理（无缝循环的 DOM 克隆较复杂，这里采用直接跳转）
    let target = index;
    if (index >= this.slideCount) target = this.loop ? 0 : this.slideCount - 1;
    if (index < 0) target = this.loop ? (this.slideCount - 1) : 0;

    const changed = target !== this.currentIndex;
    this.currentIndex = target;
    this.applyActiveToSlides();
    this.updateTransform(changed ? duration : 0);

    if (changed) {
      // 受控/非受控统一通知
      this.ldesignChange.emit(this.currentIndex);
      if (this.value === undefined) {
        // 非受控：同步 value 以便外界可读
        this.value = this.currentIndex;
      }
    }
  }

  // ── Autoplay ──────────────────────────────────────────
  private startAutoplayIfNeeded() {
    if (!this.autoplay || this.slideCount <= 1) return;
    this.stopAutoplay();
    const delay = Math.max(0, this.autoplayDelay);
    this.autoplayTimer = window.setInterval(() => {
      const next = this.currentIndex + 1;
      if (!this.loop && next >= this.slideCount) {
        this.stopAutoplay();
      } else {
        this.goTo(next);
      }
    }, delay) as any;
  }
  private stopAutoplay() {
    if (this.autoplayTimer) { window.clearInterval(this.autoplayTimer); this.autoplayTimer = undefined as any; }
  }

  private bindHoverPause() {
    if (!this.pauseOnHover) return;
    const onEnter = () => { if (this.autoplay) this.stopAutoplay(); };
    const onLeave = () => { if (this.autoplay && !this.disableOnInteraction) this.startAutoplayIfNeeded(); else if (this.autoplay && this.disableOnInteraction && !this.autoplayTimer) {/* remain stopped */} };
    this.host.addEventListener('mouseenter', onEnter);
    this.host.addEventListener('mouseleave', onLeave);
  }

  // ── Keyboard ──────────────────────────────────────────
  private keyHandler = (e: KeyboardEvent) => {
    if (!this.keyboard) return;
    const horiz = this.direction === 'horizontal';
    let handled = false;
    if (horiz) {
      if (e.key === 'ArrowRight') { this.slideTo(this.currentIndex + 1); handled = true; }
      else if (e.key === 'ArrowLeft') { this.slideTo(this.currentIndex - 1); handled = true; }
    } else {
      if (e.key === 'ArrowDown') { this.slideTo(this.currentIndex + 1); handled = true; }
      else if (e.key === 'ArrowUp') { this.slideTo(this.currentIndex - 1); handled = true; }
    }
    if (handled) e.preventDefault();
  };
  private bindKeyboardIfNeeded() { if (this.keyboard) this.host.addEventListener('keydown', this.keyHandler); }
  private unbindKeyboard() { this.host.removeEventListener('keydown', this.keyHandler); }

  // ── Pointer ───────────────────────────────────────────
  private onPointerDown = (e: PointerEvent) => {
    if (!this.allowTouchMove || (!this.mouseDrag && e.pointerType !== 'touch')) return;
    if (!this.trackEl) return;
    e.stopPropagation();
    if (e.pointerType === 'touch') e.preventDefault();

    // 交互：是否需要禁用自动播放
    if (this.autoplay) {
      this.stopAutoplay();
    }

    this.isDragging = true;
    this.trackEl.style.transitionDuration = '0ms';
    this.dragStartX = e.clientX; this.dragStartY = e.clientY;
    const base = this.getOffsetByIndex(this.currentIndex);
    this.startOffset = base;
    this.lastDelta = 0;

    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging || !this.trackEl) return;
    if (e.pointerType === 'touch') e.preventDefault();

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    const isHorizontal = this.direction === 'horizontal';
    const primaryDelta = isHorizontal ? dx : dy;

    this.lastDelta = primaryDelta;
    this.updateTransform(0, primaryDelta);
  };

  private onPointerUp = (_e: PointerEvent) => {
    if (!this.isDragging) return;
    this.isDragging = false;
    const delta = this.lastDelta;
    const th = Math.max(0, this.threshold);

    if (Math.abs(delta) >= th) {
      const dir = delta > 0 ? -1 : 1; // 向右/下拖动为负方向
      this.slideTo(this.currentIndex + dir);
    } else {
      // 回弹
      this.updateTransform(this.speed, 0);
    }

    if (this.autoplay && !this.disableOnInteraction) this.startAutoplayIfNeeded();
  };

  private getRootClass() {
    const cls = ['ld-swiper'];
    cls.push(this.direction === 'horizontal' ? 'ld-swiper--horizontal' : 'ld-swiper--vertical');
    if (this.grabCursor && this.allowTouchMove && (this.mouseDrag || true)) cls.push('ld-swiper--grab');
    return cls.join(' ');
  }

  // ── Render helpers ────────────────────────────────────
  private renderPagination() {
    if (!this.pagination || this.slideCount <= 1) return null;
    const dots = Array.from({ length: this.slideCount });
    return (
      <div class="ld-swiper__pagination" role="tablist" aria-label="分页指示器">
        {dots.map((_, i) => {
          const active = i === this.currentIndex;
          return (
            <button
              type="button"
              class={{ 'ld-swiper__bullet': true, 'is-active': active }}
              aria-selected={active ? 'true' : 'false'}
              aria-label={`切换到第 ${i + 1} 页`}
              onClick={() => this.slideTo(i)}
            />
          );
        })}
      </div>
    );
  }

  private renderNavigation() {
    if (!this.navigation || this.slideCount <= 1) return null;
    const atStart = this.currentIndex <= 0 && !this.loop;
    const atEnd = this.currentIndex >= this.slideCount - 1 && !this.loop;
    return (
      <>
        <button
          class="ld-swiper__nav ld-swiper__nav--prev"
          type="button"
          aria-label="上一张"
          disabled={atStart}
          onClick={() => this.prev()}
        >
          ‹
        </button>
        <button
          class="ld-swiper__nav ld-swiper__nav--next"
          type="button"
          aria-label="下一张"
          disabled={atEnd}
          onClick={() => this.next()}
        >
          ›
        </button>
      </>
    );
  }

  render() {
    return (
      <Host class={this.getRootClass()} role="region" aria-roledescription="carousel">
        <div
          class="ld-swiper__viewport"
          ref={(el) => (this.viewportEl = el)}
          onPointerDown={this.onPointerDown}
          onPointerMove={this.onPointerMove}
          onPointerUp={this.onPointerUp}
          onPointerCancel={this.onPointerUp}
        >
          <div class={{ 'ld-swiper__track': true, 'is-dragging': this.isDragging }} ref={(el) => (this.trackEl = el)}>
            <slot></slot>
          </div>
        </div>
        {this.renderNavigation()}
        {this.renderPagination()}
      </Host>
    );
  }
}

import { Component, Prop, State, Event, EventEmitter, Watch, h, Host, Element } from '@stencil/core';
import { lockPageScroll, unlockPageScroll } from '../../utils/scroll-lock';

export type ImageViewerItem = {
  src: string;
  alt?: string;
  thumbnail?: string; // 缩略图（不填则使用 src）
  name?: string; // 下载文件名
  title?: string; // 标题
  description?: string; // 描述
};

/**
 * ImageViewer 图片预览器
 * - 支持多图预览、左右切换、循环
 * - 支持缩放（滚轮/按钮/双击）、拖拽平移、旋转、重置
 * - 支持顶部缩略图快速切换
 * - 支持键盘操作（Esc 关闭、←/→ 切换、+/- 缩放、0 重置）
 */
@Component({ tag: 'ldesign-image-viewer', styleUrl: 'image-viewer.less', shadow: false })
export class LdesignImageViewer {
  @Element() el!: HTMLElement;

  // ── Props ───────────────────────────────────────────────────────
  /** 是否显示 */
  @Prop({ mutable: true }) visible: boolean = false;
  /** 图片列表（数组或 JSON 字符串）*/
  @Prop() images!: string | Array<ImageViewerItem | string>;
  /** 初始索引 */
  @Prop() startIndex: number = 0;
  /** 点击遮罩是否可关闭 */
  @Prop() maskClosable: boolean = true;
  /** 是否启用键盘快捷键 */
  @Prop() keyboard: boolean = true;
  /** 是否循环播放 */
  @Prop() loop: boolean = true;
  /** 是否展示顶部缩略图 */
  @Prop() showThumbnails: boolean = true;
  /** z-index */
  @Prop() zIndex: number = 1000;
  /** 是否启用滚轮缩放 */
  @Prop() wheelZoom: boolean = true;
  /** 缩放步进 */
  @Prop() zoomStep: number = 0.1;
  /** 最小/最大缩放 */
  @Prop() minScale: number = 0.25;
  @Prop() maxScale: number = 4;

  /** 主题：暗色/亮色遮罩 */
  @Prop() backdrop: 'dark' | 'light' = 'dark';

  /** 查看窗口模式：overlay 全屏；modal 小窗 */
  @Prop() viewerMode: 'overlay' | 'modal' | 'embedded' = 'overlay';
  /** 小窗宽高（viewerMode=modal 时生效） */
  @Prop() panelWidth?: number | string;
  @Prop() panelHeight?: number | string;

  /** 过渡类型 */
  @Prop() transition: 'fade' | 'fade-zoom' = 'fade-zoom';
  /** 过渡时长（ms） */
  @Prop() transitionDuration: number = 240;
  /** 过渡缓动函数 */
  @Prop() transitionEasing: string = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  /** 是否显示标题与描述 */
  @Prop() showCaption: boolean = true;
  /** 小窗标题 */
  @Prop() viewerTitle?: string;
  /** 小窗拖拽方式：title 标题栏拖拽；anywhere 全面板可拖拽 */
  @Prop() panelDraggable: 'title' | 'anywhere' = 'title';

  // ── Events ──────────────────────────────────────────────────────
  @Event() ldesignVisibleChange: EventEmitter<boolean>;
  @Event() ldesignOpen: EventEmitter<void>;
  @Event() ldesignClose: EventEmitter<void>;
  @Event() ldesignChange: EventEmitter<{ index: number }>;

  // ── State ───────────────────────────────────────────────────────
  @State() list: ImageViewerItem[] = [];
  @State() index: number = 0;
  @State() scale: number = 1;
  @State() rotate: number = 0;
  @State() offsetX: number = 0;
  @State() offsetY: number = 0;
  @State() dragging: boolean = false;
  @State() crossfading: boolean = false;
  @State() loading: boolean = false;
  /** 关闭动画期间保持渲染 */
  @State() isClosing: boolean = false;
  /** 打开/关闭动效状态 */
  @State() motion: 'opening' | 'open' | 'closing' = 'open';

  private dragStartX = 0;
  private dragStartY = 0;
  private startOffsetX = 0;
  private startOffsetY = 0;
  // 拖拽期间只在内存里更新，不触发重渲染
  private visualOffsetX: number = 0;
  private visualOffsetY: number = 0;
  private moveRaf?: number;
  private imageEl?: HTMLImageElement;
  private panelEl?: HTMLElement;
  private imgKey: number = 0;
  private prevSrc?: string;
  private prevTransform?: string; // 冻结旧图的 transform，避免切换抖动
  private fadeTimer?: number;
  private switchSeq: number = 0;
  private preloadCache = new Map<string, Promise<HTMLImageElement>>();
  private enterScale?: number; // 新图入场缩放（fade-zoom 用）
  private pendingApply = false; // 避免在切换中对旧图应用重置变换

  // 小窗拖拽
  private panelDragging = false;
  private panelStartX = 0; private panelStartY = 0;
  private panelOffsetX = 0; private panelOffsetY = 0;
  private panelStartOffsetX = 0; private panelStartOffsetY = 0;

  // ── Watchers ────────────────────────────────────────────────────
  @Watch('images')
  onImagesChange() { this.list = this.parseImages(this.images); this.clampIndex(); }

  @Watch('startIndex')
  onStartIndexChange(v: number) { this.index = this.normalizeIndex(v); this.resetTransform(); this.emitChange(); }

  @Watch('visible')
  onVisibleChange(v: boolean) { this.setVisibleInternal(v); }

  // ── Lifecycle ───────────────────────────────────────────────────
  componentWillLoad() {
    this.list = this.parseImages(this.images);
    this.index = this.normalizeIndex(this.startIndex);
  }

  componentDidLoad() {
    if (this.visible) this.setVisibleInternal(true);
  }

  componentDidRender() {
    // 渲染后确保变换同步
    if (this.pendingApply) {
      this.applyTransform();
      this.pendingApply = false;
    } else {
      this.applyTransform();
    }
  }

  private toPx(v?: number | string): string | undefined { if (v == null) return undefined; return typeof v === 'number' ? `${v}px` : String(v); }

  private preloadImage(src: string): Promise<HTMLImageElement> {
    if (!src) return Promise.reject(new Error('invalid src'));
    const cached = this.preloadCache.get(src);
    if (cached) return cached;
    const p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image load error'));
      try {
        img.src = src;
        // 优先 decode，提高首次呈现平滑度
        // @ts-ignore
        if (img.decode) (img as any).decode().then(() => resolve(img)).catch(() => resolve(img));
      } catch {
        // 兜底
        img.src = src;
      }
    });
    this.preloadCache.set(src, p);
    return p;
  }

  private prewarmNeighbors(centerIndex: number) {
    const n = this.list.length; if (n <= 1) return;
    const left = (centerIndex - 1 + n) % n;
    const right = (centerIndex + 1) % n;
    [left, right].forEach(i => {
      const it = this.list[i];
      if (it?.src) this.preloadImage(it.src).catch(() => {});
    });
  }

  disconnectedCallback() {
    this.unbindKeydown();
    if (this.visible) unlockPageScroll();
    if (this.fadeTimer) { clearTimeout(this.fadeTimer); this.fadeTimer = undefined as any; }
  }

  // ── Helpers ─────────────────────────────────────────────────────
  private parseImages(val: string | Array<ImageViewerItem | string>): ImageViewerItem[] {
    try {
      if (Array.isArray(val)) {
        return val.map(it => typeof it === 'string' ? { src: it } : it).filter(it => !!it && !!it.src);
      }
      const arr = JSON.parse(String(val || '[]'));
      if (Array.isArray(arr)) return arr.map((it: any) => typeof it === 'string' ? { src: it } : it).filter((it: any) => it && it.src);
    } catch { /* ignore */ }
    return [];
  }

  private normalizeIndex(i: number): number {
    const n = this.list.length;
    if (n === 0) return 0;
    const idx = Math.max(0, Math.min(n - 1, Number.isFinite(i as any) ? (i as any) : 0));
    return idx;
  }

  private clampIndex() { this.index = this.normalizeIndex(this.index); }

  private bindKeydown() { if (!this.keyboard) return; document.addEventListener('keydown', this.onKeydown); }
  private unbindKeydown() { document.removeEventListener('keydown', this.onKeydown); }

  private setVisibleInternal(v: boolean) {
    if (v) {
      // overlay 模式才锁定滚动
      if (this.viewerMode === 'overlay') lockPageScroll();
      this.bindKeydown();
      // 首次打开或重新打开：等待当前图加载后再显示
      this.prevSrc = undefined;
      this.prevTransform = undefined;
      this.crossfading = false;
      this.loading = true;
      this.resetTransform();
      this.motion = 'opening';
      requestAnimationFrame(() => (this.motion = 'open'));
      this.ldesignOpen.emit();
      // 预热相邻图片
      this.prewarmNeighbors(this.index);
    } else {
      // 关闭动画期间保持渲染
      this.motion = 'closing';
      this.isClosing = true;
      this.unbindKeydown();
      if (this.viewerMode === 'overlay') unlockPageScroll();
      this.ldesignClose.emit();
      window.setTimeout(() => { this.isClosing = false; }, this.transitionDuration);
    }
    this.ldesignVisibleChange.emit(!!v);
  }

  private emitChange() { this.ldesignChange.emit({ index: this.index }); }

  private getTransformString(tx?: number, ty?: number): string {
    const x = tx != null ? tx : (this.dragging ? this.visualOffsetX : this.offsetX);
    const y = ty != null ? ty : (this.dragging ? this.visualOffsetY : this.offsetY);
    const extra = this.enterScale != null ? this.enterScale : 1;
    const scale = this.scale * extra;
    return `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${this.rotate}deg)`;
  }

  private applyTransform() {
    if (!this.imageEl) return;
    this.imageEl.style.transform = this.getTransformString();
  }

  private resetTransform() {
    this.scale = 1; this.rotate = 0; this.offsetX = 0; this.offsetY = 0;
    this.visualOffsetX = 0; this.visualOffsetY = 0;
    // 推迟到渲染新 img 后再应用，避免误写旧图导致抖动
    this.pendingApply = true;
  }

  private onMaskClick = (e: Event) => { if (this.viewerMode !== 'overlay') return; if (e.target === this.el.querySelector('.ldesign-image-viewer')) { if (this.maskClosable) this.close(); } };

  private onKeydown = (e: KeyboardEvent) => {
    if (!this.visible || !this.keyboard) return;
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === '+') this.zoom(this.zoomStep);
    if (e.key === '-') this.zoom(-this.zoomStep);
    if (e.key === '0') this.resetTransform();
  };

  private current(): ImageViewerItem | undefined { return this.list[this.index]; }

  // ── Actions ─────────────────────────────────────────────────────
  private close() { this.visible = false; }
  private startSwitch(targetIndex: number) {
    const seq = ++this.switchSeq;
    const cur = this.current();
    const normalized = this.normalizeIndex(targetIndex);
    const target = this.list[normalized];
    if (!target) return;
    this.prevSrc = cur ? cur.src : undefined;
    this.prevTransform = this.getTransformString();
    this.crossfading = false; // 等待大图加载完成再开始淡入/淡出
    this.loading = true;      // 显示 loading

    // 在后台预加载，完成后再提交切换
    this.preloadImage(target.src).then(() => {
      if (seq !== this.switchSeq) return; // 已被下一次切换取代
      // 提交切换：此时目标图已在缓存（解码完成），直接淡入
      this.loading = false;
      this.index = normalized;
      this.imgKey++;
      this.resetTransform();
      this.emitChange();
      // 开始交叉淡入/淡出
      if (this.prevSrc) {
        this.crossfading = true;
        // 入场缩放启动（下帧恢复为 1，触发 transform 过渡）
        if (this.transition === 'fade-zoom') {
          this.enterScale = 0.98;
          this.applyTransform();
          requestAnimationFrame(() => { this.enterScale = 1; this.applyTransform(); });
        }
        if (this.fadeTimer) window.clearTimeout(this.fadeTimer);
        this.fadeTimer = window.setTimeout(() => { this.crossfading = false; this.prevSrc = undefined; this.prevTransform = undefined; }, this.transitionDuration);
      }
      // 预热相邻图片
      this.prewarmNeighbors(this.index);
    }).catch(() => {
      if (seq !== this.switchSeq) return;
      // 加载失败：结束 loading，保持当前图
      this.loading = false; this.crossfading = false; this.prevSrc = undefined;
    });
  }

  private next() {
    const n = this.list.length; if (n <= 1) return;
    const next = this.index + 1;
    if (next >= n) { if (this.loop) this.startSwitch(0); else return; } else { this.startSwitch(next); }
  }
  private prev() {
    const n = this.list.length; if (n <= 1) return;
    const prev = this.index - 1;
    if (prev < 0) { if (this.loop) this.startSwitch(n - 1); else return; } else { this.startSwitch(prev); }
  }

  // ── Panel drag (modal) ──────────────────────────────────────────
  private onPanelPointerDown = (e: PointerEvent) => {
    if (this.viewerMode !== 'modal') return;
    this.panelDragging = true;
    this.panelStartX = e.clientX; this.panelStartY = e.clientY;
    this.panelStartOffsetX = this.panelOffsetX; this.panelStartOffsetY = this.panelOffsetY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  private onPanelPointerMove = (e: PointerEvent) => {
    if (!this.panelDragging || this.viewerMode !== 'modal') return;
    const dx = e.clientX - this.panelStartX; const dy = e.clientY - this.panelStartY;
    this.panelOffsetX = this.panelStartOffsetX + dx; this.panelOffsetY = this.panelStartOffsetY + dy;
    try { this.panelEl?.style.setProperty('--panel-x', this.panelOffsetX + 'px'); this.panelEl?.style.setProperty('--panel-y', this.panelOffsetY + 'px'); } catch {}
  };
  private onPanelPointerUp = (e: PointerEvent) => {
    if (!this.panelDragging) return;
    this.panelDragging = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.wheelZoom) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    this.zoom(delta);
  };

  private zoom(delta: number) {
    const next = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
    this.scale = Number(next.toFixed(2));
    this.applyTransform();
  }

  private rotateLeft = () => { this.rotate = (this.rotate - 90) % 360; this.applyTransform(); };
  private rotateRight = () => { this.rotate = (this.rotate + 90) % 360; this.applyTransform(); };

  private onDblClick = (e: MouseEvent) => {
    e.preventDefault();
    this.scale = this.scale === 1 ? 2 : 1;
    this.offsetX = 0; this.offsetY = 0; this.visualOffsetX = 0; this.visualOffsetY = 0;
    this.applyTransform();
  };

  private onPointerDown = (e: PointerEvent) => {
    this.dragging = true;
    this.dragStartX = e.clientX; this.dragStartY = e.clientY;
    this.startOffsetX = this.offsetX; this.startOffsetY = this.offsetY;
    this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragStartX; const dy = e.clientY - this.dragStartY;
    const nextX = this.startOffsetX + dx;
    const nextY = this.startOffsetY + dy;
    // 仅在 rAF 中直接更新 transform
    this.visualOffsetX = nextX; this.visualOffsetY = nextY;
    if (this.moveRaf == null) {
      this.moveRaf = requestAnimationFrame(() => {
        this.applyTransform();
        this.moveRaf = undefined;
      });
    }
  };
  private onPointerUp = (e: PointerEvent) => {
    this.dragging = false;
    if (this.moveRaf) { cancelAnimationFrame(this.moveRaf); this.moveRaf = undefined; }
    // 将最终结果同步到状态（只触发一次重渲染）
    this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    this.applyTransform();
  };

  private onImageLoad = () => {
    // 后备路径：未采用预加载提交时，img onload 后触发
    if (!this.loading) return; // 已通过预加载流程提交
    this.loading = false;
    if (this.prevSrc) {
      this.crossfading = true;
      if (this.transition === 'fade-zoom') {
        this.enterScale = 0.98;
        this.applyTransform();
        requestAnimationFrame(() => { this.enterScale = 1; this.applyTransform(); });
      }
      if (this.fadeTimer) window.clearTimeout(this.fadeTimer);
      this.fadeTimer = window.setTimeout(() => { this.crossfading = false; this.prevSrc = undefined; this.prevTransform = undefined; }, this.transitionDuration);
    }
    this.prewarmNeighbors(this.index);
  };

  private onImageError = () => {
    this.loading = false;
    this.crossfading = false; // 失败时不做交叉淡入
    this.prevSrc = undefined;
  };

  private download = () => {
    const item = this.current(); if (!item) return;
    try {
      const a = document.createElement('a');
      a.href = item.src; a.download = item.name || `image_${this.index + 1}`; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch {}
  };

  private selectIndex(i: number) { if (i === this.index) return; this.startSwitch(this.normalizeIndex(i)); }

  // ── Render ──────────────────────────────────────────────────────
  private renderHeader() {
    if (!this.showThumbnails || this.list.length <= 1) return null;
    return (
      <div class="ldesign-image-viewer__thumbs" role="tablist">
        {this.list.map((it, i) => (
          <button
            class={{ 'ldesign-image-viewer__thumb': true, 'is-active': i === this.index }}
            role="tab"
            aria-selected={i === this.index ? 'true' : 'false'}
            onClick={() => this.selectIndex(i)}
          >
            <img src={it.thumbnail || it.src} alt={it.alt || ''} />
          </button>
        ))}
      </div>
    );
  }

  private renderToolbar() {
    const percent = Math.round(this.scale * 100);
    return (
      <div class="ldesign-image-viewer__toolbar" role="toolbar" aria-label="Image tools">
        <button class="ldesign-image-viewer__tool" onClick={() => this.zoom(-this.zoomStep)} title="缩小"><ldesign-icon name="minus" /></button>
        <span class="ldesign-image-viewer__scale" aria-live="polite">{percent}%</span>
        <button class="ldesign-image-viewer__tool" onClick={() => this.zoom(this.zoomStep)} title="放大"><ldesign-icon name="plus" /></button>
        <span class="ldesign-image-viewer__divider" />
        <button class="ldesign-image-viewer__tool" onClick={this.rotateLeft} title="左旋"><ldesign-icon name="rotate-ccw" /></button>
        <button class="ldesign-image-viewer__tool" onClick={this.rotateRight} title="右旋"><ldesign-icon name="rotate-cw" /></button>
        <button class="ldesign-image-viewer__tool" onClick={() => this.resetTransform()} title="重置"><ldesign-icon name="refresh-ccw" /></button>
        <span class="ldesign-image-viewer__divider" />
        <button class="ldesign-image-viewer__tool" onClick={this.download} title="下载"><ldesign-icon name="download" /></button>
        <button class="ldesign-image-viewer__tool" onClick={() => this.close()} title="关闭"><ldesign-icon name="x" /></button>
      </div>
    );
  }

  render() {
    if (!this.visible && !this.isClosing) return null as any;
    const item = this.current();
    const classes = ['ldesign-image-viewer', this.backdrop === 'dark' ? 'ldesign-image-viewer--dark' : 'ldesign-image-viewer--light', this.viewerMode === 'modal' ? 'ldesign-image-viewer--modal' : '', this.viewerMode === 'embedded' ? 'ldesign-image-viewer--embedded' : ''].join(' ');

    const panelStyle: any = this.viewerMode === 'modal' ? { width: this.toPx(this.panelWidth) || '80vw', height: this.toPx(this.panelHeight) || '70vh' } : this.viewerMode === 'embedded' ? { width: '100%', height: '100%' } : { width: '100%', height: '100%' };

    return (
      <Host>
        <div class={classes} data-motion={this.motion} style={{ zIndex: String(this.zIndex), ['--iv-duration' as any]: `${this.transitionDuration}ms`, ['--iv-ease' as any]: this.transitionEasing }} onClick={this.viewerMode==='overlay' ? this.onMaskClick : undefined}>
          <div
            ref={el => (this.panelEl = el as HTMLElement)}
            class="ldesign-image-viewer__panel"
            style={panelStyle}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={this.panelDraggable === 'anywhere' ? this.onPanelPointerDown : undefined}
            onPointerMove={this.panelDraggable === 'anywhere' ? this.onPanelPointerMove : undefined}
            onPointerUp={this.panelDraggable === 'anywhere' ? this.onPanelPointerUp : undefined}
          >
            {/* 顶部关闭 */}
            <button class="ldesign-image-viewer__close" aria-label="关闭" onClick={() => this.close()}>
              <ldesign-icon name="x" />
            </button>
            {/* 标题栏（modal 可拖拽） */}
            {this.viewerMode === 'modal' && (
              <div class="ldesign-image-viewer__titlebar" onPointerDown={this.onPanelPointerDown} onPointerMove={this.onPanelPointerMove} onPointerUp={this.onPanelPointerUp}>
                <div class="ldesign-image-viewer__title">{this.viewerTitle || (item && item.title) || '图片预览'}</div>
              </div>
            )}

            {/* 顶部：缩略图与计数（embedded 隐藏） */}
            {this.viewerMode !== 'embedded' && (
            <div class="ldesign-image-viewer__top">
              {this.renderHeader()}
              <div class="ldesign-image-viewer__counter">{this.index + 1}/{this.list.length}</div>
            </div>
            )}

            {/* 中部：舞台与导航 */}
            <div class="ldesign-image-viewer__stage">
            {this.list.length > 1 && (
              <button class="ldesign-image-viewer__nav ldesign-image-viewer__nav--prev" onClick={() => this.prev()} aria-label="上一张">
                <ldesign-icon name="chevron-left" />
              </button>
            )}
            <div class="ldesign-image-viewer__canvas" onWheel={this.onWheel} onDblClick={this.onDblClick}
              onPointerDown={this.onPointerDown} onPointerMove={this.onPointerMove} onPointerUp={this.onPointerUp}>
              {(this.loading || this.crossfading) && this.prevSrc ? (
                <img class={{ 'ldesign-image-viewer__img': true, 'fade-leave': this.crossfading }} src={this.prevSrc} alt="prev" draggable={false} style={{ transform: this.prevTransform || this.getTransformString() }} />
              ) : null}
              {item ? (
                <img
                  key={this.imgKey as any}
                  ref={el => (this.imageEl = el as HTMLImageElement)}
                  class={{
                    'ldesign-image-viewer__img': true,
                    'is-dragging': this.dragging,
                    'loading-hidden': this.loading,
                    'fade-enter': !this.loading && this.crossfading,
                    'fade-in': !this.loading && !this.crossfading,
                  } as any}
                  src={item.src}
                  alt={item.alt || ''}
                  draggable={false}
                  onLoad={this.onImageLoad}
                  onError={this.onImageError}
                  style={{ transform: this.getTransformString() }}
                />
              ) : null}
              {this.loading ? (
                <div class="ldesign-image-viewer__loading" aria-live="polite" aria-busy="true">
                  <div class="ldesign-image-viewer__spinner" />
                </div>
              ) : null}
            </div>
            {this.list.length > 1 && (
              <button class="ldesign-image-viewer__nav ldesign-image-viewer__nav--next" onClick={() => this.next()} aria-label="下一张">
                <ldesign-icon name="chevron-right" />
              </button>
            )}
          </div>

            {/* 底部：标题/描述 + 工具栏 */}
            {this.showCaption && (() => {
              const prev = this.prevSrc ? this.list.find(it => it.src === this.prevSrc) : undefined;
              const captionItem = (this.loading && prev) ? prev : item;
              return captionItem && (captionItem.title || captionItem.description) ? (
                <div class="ldesign-image-viewer__caption">
                  {captionItem.title ? <div class="ldesign-image-viewer__caption-title">{captionItem.title}</div> : null}
                  {captionItem.description ? <div class="ldesign-image-viewer__caption-desc">{captionItem.description}</div> : null}
                </div>
              ) : null;
            })()}
            <div class="ldesign-image-viewer__bottom">
              {this.renderToolbar()}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}

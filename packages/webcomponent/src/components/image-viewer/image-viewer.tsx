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

  /** 图片切换过渡类型 */
  @Prop() transition: 'fade' | 'fade-zoom' = 'fade-zoom';
  /** 过渡时长（ms） */
  @Prop() transitionDuration: number = 240;
  /** 过渡缓动函数 */
  @Prop() transitionEasing: string = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  
  /** 打开/关闭动画效果：fade 淡入淡出；zoom 缩放；slide-up 上滑；slide-down 下滑；none 无动画 */
  @Prop() openAnimation: 'fade' | 'zoom' | 'fade-zoom' | 'slide-up' | 'slide-down' | 'none' = 'fade-zoom';
  /** 打开动画时长（ms，不设置则使用 transitionDuration） */
  @Prop() openDuration?: number;
  /** 关闭动画效果（不设置则使用 openAnimation） */
  @Prop() closeAnimation?: 'fade' | 'zoom' | 'fade-zoom' | 'slide-up' | 'slide-down' | 'none';
  /** 关闭动画时长（ms，不设置则使用 openDuration 或 transitionDuration） */
  @Prop() closeDuration?: number;
  
  /** 是否显示标题与描述 */
  @Prop() showCaption: boolean = true;
  /** 标题与描述的显示位置：bottom 底部（工具栏上方）；top 顶部（缩略图下方） */
  @Prop() captionPosition: 'bottom' | 'top' = 'bottom';
  /** 标题与描述的对齐方式：left 左对齐；center 居中；right 右对齐 */
  @Prop() captionAlign: 'left' | 'center' | 'right' = 'center';
  /** 小窗标题（modal模式顶部标题栏） */
  @Prop() viewerTitle?: string;
  /** 小窗拖拽方式：title 标题栏拖拽；anywhere 全面板可拖拽 */
  @Prop() panelDraggable: 'title' | 'anywhere' = 'title';

  // ── Events ──────────────────────────────────────────────────────
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;
  @Event() ldesignOpen!: EventEmitter<void>;
  @Event() ldesignClose!: EventEmitter<void>;
  @Event() ldesignChange!: EventEmitter<{ index: number }>;

  // ── State ───────────────────────────────────────────────────────
  @State() list: ImageViewerItem[] = [];
  @State() index: number = 0;
  @State() scale: number = 1;
  @State() rotate: number = 0;
  @State() offsetX: number = 0;
  @State() offsetY: number = 0;
  @State() flipX: boolean = false;
  @State() flipY: boolean = false;
  @State() dragging: boolean = false;
  @State() gesturing: boolean = false;
  @State() crossfading: boolean = false;
  @State() loading: boolean = false;
  /** 关闭动画期间保持渲染 */
  @State() isClosing: boolean = false;
  /** 打开/关闭动效状态 */
  @State() motion: 'opening' | 'open' | 'closing' = 'open';
  @State() uiHidden: boolean = false; // 移动端自动隐藏 UI

  // —— 与 Draggable 对接相关 ——
  private draggableEl?: any; // <ldesign-draggable> 实例引用

  // 旧的拖拽/缩放内部变量保留占位，但实际由 Draggable 接管（避免大范围删改影响）
  private dragStartX = 0;
  private dragStartY = 0;
  private startOffsetX = 0;
  private startOffsetY = 0;
  private visualOffsetX: number = 0;
  private visualOffsetY: number = 0;
  private moveRaf?: number;
  private imageEl?: HTMLImageElement; // 仅用于旧图交叉淡出覆盖层
  private panelEl?: HTMLElement;
  private canvasEl?: HTMLElement;
  private imgKey: number = 0;
  // 多指触控/手势（主要用于保留旧逻辑状态，实际手势由 Draggable 处理）
  private activePointers = new Map<number, { x: number; y: number }>();
  private isPinching = false;
  private pinchStartDist = 0;
  private pinchStartScale = 1;
  private pinchStartAngle = 0;
  private rotateStart = 0;
  private lastTapTime = 0;
  private singleTapTimer?: number;
  private tapStartX = 0;
  private tapStartY = 0;
  private tapMoved = false;
  private prevSrc?: string;
  private prevTransform?: string; // 冻结旧图的 transform，避免切换抖动
  private fadeTimer?: number;
  private switchSeq: number = 0;
  private uiTimer?: number;
  private preloadCache = new Map<string, Promise<HTMLImageElement>>();
  private enterScale?: number; // 新图入场缩放（fade-zoom 用）
  private pendingApply = false; // 避免在切换中对旧图应用重置变换

  // 画布与图像基础尺寸（用于边界约束）
  private stageWidth = 0; private stageHeight = 0;
  private baseWidth = 0; private baseHeight = 0; // 图像在 scale=1 时（按 contain 适配舞台）的基准尺寸

  // 拖拽后的回弹动画（由 Draggable 接管，保留占位以最小改动）
  private bouncing = false;
  private bounceRaf?: number;
  private bounceStartTime = 0;
  private bounceFromX = 0; private bounceFromY = 0;
  private bounceToX = 0; private bounceToY = 0;
  private bounceDuration = 220; // ms

  // 简单速度估计（保留变量用于轻扫切图阈值判断）
  private lastMoveTime = 0;
  private lastMoveX = 0; private lastMoveY = 0;
  private velocityX = 0; private velocityY = 0;

  // 旋转阈值（用于 Draggable 手势，对齐原值）
  private rotateThresholdDeg = 5;

  // 动量滚动（由 Draggable 接管）
  private momentumRunning = false;
  private momentumRaf?: number;
  private momentumLastTime = 0;
  private momentumVX = 0; // px/ms
  private momentumVY = 0; // px/ms

  // 小窗拖拽
  private panelDragging = false;
  private panelStartX = 0; private panelStartY = 0;
  private panelOffsetX = 0; private panelOffsetY = 0;
  private panelStartOffsetX = 0; private panelStartOffsetY = 0;

  // 轻扫手势（在缩放≈1时用于切图/关闭），通过捕获阶段监听，不与 Draggable 冲突
  private swipeActive = false;
  private swipePointerId?: number;
  private swipeStartX = 0; private swipeStartY = 0;
  private swipeDx = 0; private swipeDy = 0;

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
    // 初始化舞台尺寸监听（影响拖拽边界）
    this.updateStageMetrics();
    window.addEventListener('resize', this.onWindowResize, { passive: true } as any);
    // 捕获阶段监听，用于缩放≈1 时的轻扫切图/下滑关闭，不干扰内部 draggable 的事件处理
    try {
      this.canvasEl?.addEventListener('pointerdown', this.onStagePointerDownCapture as any, { capture: true } as any);
      this.canvasEl?.addEventListener('pointermove', this.onStagePointerMoveCapture as any, { capture: true } as any);
      this.canvasEl?.addEventListener('pointerup', this.onStagePointerUpCapture as any, { capture: true } as any);
      this.canvasEl?.addEventListener('pointercancel', this.onStagePointerUpCapture as any, { capture: true } as any);
    } catch {}
  }

  componentDidRender() {
    // 渲染后确保变换同步
    if (this.pendingApply) {
      this.applyTransform();
      this.pendingApply = false;
    } else {
      this.applyTransform();
    }
    // 渲染后更新舞台与基准尺寸（用于边界约束），不会触发重渲染
    this.updateStageMetrics();
    this.measureBaseSize();
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
    window.removeEventListener('resize', this.onWindowResize as any);
    try {
      this.canvasEl?.removeEventListener('pointerdown', this.onStagePointerDownCapture as any, { capture: true } as any);
      this.canvasEl?.removeEventListener('pointermove', this.onStagePointerMoveCapture as any, { capture: true } as any);
      this.canvasEl?.removeEventListener('pointerup', this.onStagePointerUpCapture as any, { capture: true } as any);
      this.canvasEl?.removeEventListener('pointercancel', this.onStagePointerUpCapture as any, { capture: true } as any);
    } catch {}
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
      this.showUiTemporarily();
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
      // 当前图预加载，完成后结束 loading（draggable 不暴露 onload，这里用预热替代）
      const cur = this.current();
      if (cur?.src) {
        this.preloadImage(cur.src).then(() => { this.loading = false; }).catch(() => { this.loading = false; });
      } else {
        this.loading = false;
      }
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
    const useVisual = this.gesturing || this.dragging || this.bouncing || this.momentumRunning;
    const x = tx != null ? tx : (useVisual ? this.visualOffsetX : this.offsetX);
    const y = ty != null ? ty : (useVisual ? this.visualOffsetY : this.offsetY);
    const extra = this.enterScale != null ? this.enterScale : 1;
    const s = this.scale * extra;
    const sx = (this.flipX ? -1 : 1) * s;
    const sy = (this.flipY ? -1 : 1) * s;
    return `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${sx}, ${sy}) rotate(${this.rotate}deg)`;
  }

  private applyTransform() {
    // 由 Draggable 接管实际变换，这里仅用于旧图覆盖层与状态计算
    if (this.imageEl) {
      try { this.imageEl.style.transform = this.getTransformString(); } catch {}
    }
  }

  private resetTransform() {
    this.scale = 1; this.rotate = 0; this.offsetX = 0; this.offsetY = 0;
    this.flipX = false; this.flipY = false;
    this.visualOffsetX = 0; this.visualOffsetY = 0;
    this.bouncing = false;
    this.stopMomentum();
    // 交给 Draggable 重置实际变换
    try { (this.draggableEl as any)?.reset(); } catch {}
    // 不再依赖 pendingApply 触发 img transform
    this.pendingApply = false;
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

  // ── Panel drag (modal) ────────────────────────────────────────────
  private onPanelPointerDown = (e: PointerEvent) => {
    if (this.viewerMode !== 'modal') return;
    
    // 检查是否点击在交互元素上（按钮、链接等）
    const target = e.target as HTMLElement | null;
    if (target) {
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .ldesign-image-viewer__tool, .ldesign-image-viewer__thumb, .ldesign-image-viewer__nav');
      if (isInteractive) return; // 在交互元素上不启动拖拽
    }
    
    // 只允许在标题栏内启动拖动（当 panelDraggable='title' 时）
    if (this.panelDraggable === 'title') {
      const inTitle = target && target.closest && target.closest('.ldesign-image-viewer__titlebar');
      if (!inTitle) return; // 非标题区域忽略，避免与图片拖拽冲突
    }
    
    this.panelDragging = true;
    this.panelStartX = e.clientX; this.panelStartY = e.clientY;
    this.panelStartOffsetX = this.panelOffsetX; this.panelStartOffsetY = this.panelOffsetY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    // 拖动期间禁用过渡，提升跟手性
    this.panelEl?.classList.add('is-dragging');
    e.stopPropagation();
    e.preventDefault();
  };
  private onPanelPointerMove = (e: PointerEvent) => {
    if (!this.panelDragging || this.viewerMode !== 'modal') return;
    const dx = e.clientX - this.panelStartX; const dy = e.clientY - this.panelStartY;
    // 目标偏移（相对居中）
    let nextX = this.panelStartOffsetX + dx; let nextY = this.panelStartOffsetY + dy;
    // 计算可拖动边界，保证不拖出可视区域
    const rect = this.panelEl?.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect) {
      const maxX = Math.max(0, (vw - rect.width) / 2);
      const maxY = Math.max(0, (vh - rect.height) / 2);
      nextX = Math.min(maxX, Math.max(-maxX, nextX));
      nextY = Math.min(maxY, Math.max(-maxY, nextY));
    }
    this.panelOffsetX = nextX; this.panelOffsetY = nextY;
    try { this.panelEl?.style.setProperty('--panel-x', this.panelOffsetX + 'px'); this.panelEl?.style.setProperty('--panel-y', this.panelOffsetY + 'px'); } catch {}
  };
  private onPanelPointerUp = (e: PointerEvent) => {
    if (!this.panelDragging) return;
    this.panelDragging = false;
    this.panelEl?.classList.remove('is-dragging');
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  private onWheel = (e: WheelEvent) => {
    // 已由 Draggable 处理滚轮缩放，这里保留兼容（例如捕获阶段触发时转发）
    if (!this.wheelZoom) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    const target = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
    try { (this.draggableEl as any)?.zoomTo(target, e.clientX, e.clientY); } catch {}
    this.showUiTemporarily();
  };

  private zoom(delta: number) {
    const next = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
    this.zoomTo(next);
  }

  private zoomTo(nextScale: number, clientX?: number, clientY?: number) {
    // 改为调用 Draggable 的缩放方法，内部已处理围绕枢轴点缩放与边界夹紧
    let next = Math.min(this.maxScale, Math.max(this.minScale, nextScale));
    if (Math.abs(next - 1) < 0.02) next = 1;
    next = Number(next.toFixed(4));
    try { (this.draggableEl as any)?.zoomTo(next, clientX, clientY); } catch {}
    // 状态更新由 onDraggableTransformChange 同步
  }

  // 同时围绕枢轴点应用缩放与旋转，保证枢轴点锚定不漂移
  private pinchTo(nextScale: number, nextRotateDeg: number, clientX: number, clientY: number) {
    if (!this.canvasEl) return;
    const prevScale = this.scale;
    let s1 = Math.min(this.maxScale, Math.max(this.minScale, nextScale));
    if (Math.abs(s1 - 1) < 0.02) s1 = 1;
    s1 = Number(s1.toFixed(4));
    const r = s1 / (prevScale || 1);

    const rect = this.canvasEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
    // 以视觉偏移为当前位移（手势中实时更新）
    const T0x = this.visualOffsetX; const T0y = this.visualOffsetY;
    const px = clientX - centerX; const py = clientY - centerY; // 枢轴点（相对舞台中心）
    const vX = px - T0x; const vY = py - T0y; // 枢轴相对当前位移的向量

    const dtheta = (nextRotateDeg - this.rotate) * Math.PI / 180;
    const cos = Math.cos(dtheta), sin = Math.sin(dtheta);
    const rx = cos * vX - sin * vY;
    const ry = sin * vX + cos * vY;

    // T1 = T0 + (I - R(dθ) * r) * (p - T0)
    let newX = T0x + (vX - r * rx);
    let newY = T0y + (vY - r * ry);

    // 更新状态：先设定新 scale/rotate，再根据新边界对位移做橡皮筋约束
    const prevRotate = this.rotate;
    this.scale = s1; this.rotate = nextRotateDeg;
    const b = this.getPanBounds();
    newX = this.rubberband(newX, b.minX, b.maxX);
    newY = this.rubberband(newY, b.minY, b.maxY);

    this.visualOffsetX = newX; this.visualOffsetY = newY;
    this.applyTransform();
  }

  private rotateLeft = () => { const next = (this.rotate - 90) % 360; try { (this.draggableEl as any)?.setRotate(next); } catch {} this.rotate = next; };
  private rotateRight = () => { const next = (this.rotate + 90) % 360; try { (this.draggableEl as any)?.setRotate(next); } catch {} this.rotate = next; };
  private flipHorizontal = () => { this.flipX = !this.flipX; /* 翻转通过外层包裹容器实现 */ };
  private flipVertical = () => { this.flipY = !this.flipY; /* 翻转通过外层包裹容器实现 */ };

  private onDblClick = (e: MouseEvent) => {
    // 由 Draggable 自行处理双击缩放；这里保留兜底调用以保持一致体验
    e.preventDefault();
    const target = this.scale === 1 ? 2 : 1;
    try { (this.draggableEl as any)?.zoomTo(target, (e as any).clientX, (e as any).clientY); } catch {}
    this.showUiTemporarily();
  };

  private showUiTemporarily() {
    this.uiHidden = false;
    if (this.uiTimer) { window.clearTimeout(this.uiTimer); this.uiTimer = undefined as any; }
    // 仅在小屏设备或触摸操作时自动隐藏
    const isSmallScreen = window.innerWidth <= 900;
    if (isSmallScreen) {
      this.uiTimer = window.setTimeout(() => { this.uiHidden = true; }, 2200);
    }
  }

  private onPointerDown = (e: PointerEvent) => {
    // 图片平移/缩放由 <ldesign-draggable> 接管；此处仅保留 UI 显示/双击兜底能力
    e.stopPropagation();
    if (e.pointerType === 'touch') e.preventDefault();
    this.showUiTemporarily();
  };
  private onPointerMove = (e: PointerEvent) => {
    // 图片平移/缩放由 <ldesign-draggable> 接管；此处仅保留 UI 显示能力
    this.showUiTemporarily();
  };
  private onPointerUp = (_e: PointerEvent) => {
    // 图片平移/缩放由 <ldesign-draggable> 接管；此处不处理。
  };

  private onImageLoad = () => {
    // 该回调仅用于旧图覆盖层的 <img>，新主图由 Draggable 管理；
    if (!this.loading) return;
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
        <button class="ldesign-image-viewer__tool" onClick={this.flipHorizontal} title="水平翻转"><ldesign-icon name="flip-horizontal" /></button>
        <button class="ldesign-image-viewer__tool" onClick={this.flipVertical} title="垂直翻转"><ldesign-icon name="flip-vertical" /></button>
        <button class="ldesign-image-viewer__tool" onClick={() => this.resetTransform()} title="重置"><ldesign-icon name="refresh-ccw" /></button>
        <span class="ldesign-image-viewer__divider" />
        <button class="ldesign-image-viewer__tool" onClick={this.download} title="下载"><ldesign-icon name="download" /></button>
        <button class="ldesign-image-viewer__tool" onClick={() => this.close()} title="关闭"><ldesign-icon name="x" /></button>
      </div>
    );
  }

  private renderCaption() {
    if (!this.showCaption) return null;
    const prev = this.prevSrc ? this.list.find(it => it.src === this.prevSrc) : undefined;
    const captionItem = (this.loading && prev) ? prev : this.current();
    if (!captionItem || (!captionItem.title && !captionItem.description)) return null;
    
    return (
      <div class={`ldesign-image-viewer__caption ldesign-image-viewer__caption--${this.captionPosition} ldesign-image-viewer__caption--${this.captionAlign}`}>
        {captionItem.title ? <div class="ldesign-image-viewer__caption-title">{captionItem.title}</div> : null}
        {captionItem.description ? <div class="ldesign-image-viewer__caption-desc">{captionItem.description}</div> : null}
      </div>
    );
  }

  render() {
    if (!this.visible && !this.isClosing) return null as any;
    const item = this.current();
    
    // 动画相关
    const openAnim = this.openAnimation;
    const closeAnim = this.closeAnimation || this.openAnimation;
    const openDur = this.openDuration || this.transitionDuration;
    const closeDur = this.closeDuration || this.openDuration || this.transitionDuration;
    
    const classes = [
      'ldesign-image-viewer',
      this.backdrop === 'dark' ? 'ldesign-image-viewer--dark' : 'ldesign-image-viewer--light',
      this.viewerMode === 'modal' ? 'ldesign-image-viewer--modal' : '',
      this.viewerMode === 'embedded' ? 'ldesign-image-viewer--embedded' : '',
      this.uiHidden ? 'ldesign-image-viewer--ui-hidden' : '',
      `ldesign-image-viewer--open-${openAnim}`,
      `ldesign-image-viewer--close-${closeAnim}`
    ].filter(c => c).join(' ');
    
    // 调试日志
    
    
    

    const panelStyle: any = this.viewerMode === 'modal' ? { width: this.toPx(this.panelWidth) || '80vw', height: this.toPx(this.panelHeight) || '70vh' } : this.viewerMode === 'embedded' ? { width: '100%', height: '100%' } : { width: '100%', height: '100%' };

    // Draggable 外层包裹，用于翻转，不干扰内部缩放/旋转/平移
    const flipStyle: any = { transform: `scale(${this.flipX ? -1 : 1}, ${this.flipY ? -1 : 1})` };
    const draggableFadeStyle: any = (!this.loading ? { animation: `iv-fade-in var(--iv-duration, ${this.transitionDuration}ms) var(--iv-ease, ${this.transitionEasing})` } : {});

    return (
      <Host>
        <div class={classes} data-motion={this.motion} style={{ 
          zIndex: String(this.zIndex), 
          ['--iv-duration' as any]: `${this.transitionDuration}ms`, 
          ['--iv-ease' as any]: this.transitionEasing,
          ['--iv-open-duration' as any]: `${openDur}ms`,
          ['--iv-close-duration' as any]: `${closeDur}ms`
        }} onClick={this.viewerMode==='overlay' ? this.onMaskClick : undefined}>
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
              {/* top 位置的 caption */}
              {this.captionPosition === 'top' && this.renderCaption()}
            </div>
            )}

            {/* 中部：舞台与导航 */}
            <div class="ldesign-image-viewer__stage">
            {this.list.length > 1 && (
              <button class="ldesign-image-viewer__nav ldesign-image-viewer__nav--prev" onClick={() => this.prev()} aria-label="上一张">
                <ldesign-icon name="chevron-left" />
              </button>
            )}
            <div class="ldesign-image-viewer__canvas" ref={el => (this.canvasEl = el as HTMLElement)} onWheel={this.onWheel} onDblClick={this.onDblClick}>
              {(this.loading || this.crossfading) && this.prevSrc ? (
                <img class={{ 'ldesign-image-viewer__img': true, 'fade-leave': this.crossfading }} src={this.prevSrc} alt="prev" draggable={false} style={{ transform: this.prevTransform || this.getTransformString() }} />
              ) : null}
              {item ? (
                <div style={{ ...flipStyle, width: '100%', height: '100%' }}>
                  <ldesign-draggable
                    ref={el => (this.draggableEl = el as any)}
                    src={item.src}
                    alt={item.alt || ''}
                    wheelZoom={this.wheelZoom}
                    zoomStep={this.zoomStep}
                    minScale={this.minScale}
                    maxScale={this.maxScale}
                    enableRotate={true}
                    doubleTapZoom={2}
                    onLdesignTransformChange={(e: any) => this.onDraggableTransformChange(e)}
                    onLdesignGestureStart={() => { this.gesturing = true; this.showUiTemporarily(); }}
                    onLdesignGestureEnd={() => { this.gesturing = false; this.showUiTemporarily(); }}
                    style={{ width: '100%', height: '100%', ...draggableFadeStyle }}
                  />
                </div>
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
            <div class="ldesign-image-viewer__bottom">
              {this.captionPosition === 'bottom' && this.renderCaption()}
              {this.renderToolbar()}
            </div>
          </div>
        </div>
      </Host>
    );
  }
  // ── Metrics & bounds ─────────────────────────────────────────────
  private onWindowResize = () => {
    this.updateStageMetrics();
    this.measureBaseSize();
    // 实际边界回弹由 Draggable 内部处理，这里仅刷新 UI
    this.applyTransform();
  };

  private updateStageMetrics() {
    const rect = this.canvasEl?.getBoundingClientRect();
    if (rect) { this.stageWidth = rect.width; this.stageHeight = rect.height; }
  }

  private measureBaseSize() {
    const img = this.imageEl;
    const sw = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const sh = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    if (!img || !sw || !sh) return;
    const nw = img.naturalWidth || 0; const nh = img.naturalHeight || 0;
    if (!nw || !nh) return;
    // contain 到舞台尺寸，不放大超过原图
    const scale = Math.min(sw / nw, sh / nh, 1);
    this.baseWidth = Math.max(1, nw * scale);
    this.baseHeight = Math.max(1, nh * scale);
  }

  private rotatedSize(w: number, h: number, deg: number) {
    const rad = (deg % 360) * Math.PI / 180;
    const c = Math.abs(Math.cos(rad)); const s = Math.abs(Math.sin(rad));
    return { width: w * c + h * s, height: w * s + h * c };
  }

  private getPanBounds() {
    const sw = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const sh = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    // 如果舞台尺寸未知，放宽为无限制
    if (!sw || !sh || !this.baseWidth || !this.baseHeight) {
      return { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    }
    const s = this.scale * (this.enterScale != null ? this.enterScale : 1);
    const sized = this.rotatedSize(this.baseWidth * s, this.baseHeight * s, this.rotate);
    const excessW = Math.max(0, sized.width - sw);
    const excessH = Math.max(0, sized.height - sh);
    const maxX = excessW > 0 ? excessW / 2 : 0;
    const maxY = excessH > 0 ? excessH / 2 : 0;
    return { minX: -maxX, maxX, minY: -maxY, maxY };
  }

  private rubberband(v: number, min: number, max: number, constant = 0.35) {
    if (v < min) return min - (min - v) * constant;
    if (v > max) return max + (v - max) * constant;
    return v;
  }

  private bounceTo(_x: number, _y: number) {
    // 回弹动画交由 Draggable 处理（保留方法以避免调用处报错）
  }

  private startMomentum(_vx: number, _vy: number) {
    // 动量滚动交由 Draggable 处理（保留方法以避免调用处报错）
  }

  private stopMomentum() {
    this.momentumRunning = false;
    if (this.momentumRaf) { cancelAnimationFrame(this.momentumRaf); this.momentumRaf = undefined; }
    try { this.imageEl?.classList.remove('is-kinetic'); } catch {}
  }

  // ── 与 Draggable 交互：同步状态 ───────────────────────────────
  private onDraggableTransformChange(e: CustomEvent<{ scale: number; rotate: number; offsetX: number; offsetY: number }>) {
    const d = e.detail || ({} as any);
    this.scale = d.scale ?? this.scale;
    this.rotate = d.rotate ?? this.rotate;
    this.offsetX = d.offsetX ?? this.offsetX;
    this.offsetY = d.offsetY ?? this.offsetY;
    this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
    this.showUiTemporarily();
  }

  // ── 舞台捕获阶段监听：用于缩放≈1 时的轻扫切图/下滑关闭 ─────────────
  private onStagePointerDownCapture = (e: PointerEvent) => {
    if (!this.visible) return;
    // 仅在缩放≈1 且位移接近 0 时启用轻扫判定
    const near1 = Math.abs(this.scale - 1) < 0.01;
    const nearCenter = Math.abs(this.offsetX) < 10 && Math.abs(this.offsetY) < 10;
    if (!(near1 && nearCenter)) return;
    this.swipeActive = true; this.swipePointerId = e.pointerId;
    this.swipeStartX = e.clientX; this.swipeStartY = e.clientY; this.swipeDx = 0; this.swipeDy = 0;
  };
  private onStagePointerMoveCapture = (e: PointerEvent) => {
    if (!this.swipeActive || this.swipePointerId !== e.pointerId) return;
    this.swipeDx = e.clientX - this.swipeStartX; this.swipeDy = e.clientY - this.swipeStartY;
    this.showUiTemporarily();
  };
  private onStagePointerUpCapture = (e: PointerEvent) => {
    if (!this.swipeActive || this.swipePointerId !== e.pointerId) { return; }
    const dx = this.swipeDx; const dy = this.swipeDy;
    const isSwipeCandidate = Math.abs(this.scale - 1) < 0.02 && Math.abs(this.offsetX) < 10 && Math.abs(this.offsetY) < 10;
    this.swipeActive = false; this.swipePointerId = undefined; this.swipeDx = 0; this.swipeDy = 0;
    if (isSwipeCandidate && Math.abs(dy) < 60 && Math.abs(dx) > 80 && this.list.length > 1) {
      if (dx > 0) this.prev(); else this.next();
      return;
    }
    if (this.viewerMode === 'overlay' && isSwipeCandidate && dy > 120 && Math.abs(dx) < 80) {
      this.close();
      return;
    }
  };
}

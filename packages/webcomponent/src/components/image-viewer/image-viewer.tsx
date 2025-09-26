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
  private canvasEl?: HTMLElement;
  private imgKey: number = 0;
  // 多指触控/手势
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

  // 拖拽后的回弹动画
  private bouncing = false;
  private bounceRaf?: number;
  private bounceStartTime = 0;
  private bounceFromX = 0; private bounceFromY = 0;
  private bounceToX = 0; private bounceToY = 0;
  private bounceDuration = 220; // ms

  // 简单速度估计（可用于后续动量滚动）
  private lastMoveTime = 0;
  private lastMoveX = 0; private lastMoveY = 0;
  private velocityX = 0; private velocityY = 0;

  // 旋转阈值，避免双指缩放时角度微抖造成画面抖动
  private rotateThresholdDeg = 5;

  // 动量滚动（甩动）
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
    if (!this.imageEl) return;
    this.imageEl.style.transform = this.getTransformString();
  }

  private resetTransform() {
    this.scale = 1; this.rotate = 0; this.offsetX = 0; this.offsetY = 0;
    this.flipX = false; this.flipY = false;
    this.visualOffsetX = 0; this.visualOffsetY = 0;
    this.bouncing = false;
    this.stopMomentum();
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
    // 只允许在标题栏内启动拖动（当 panelDraggable='title' 时）
    if (this.panelDraggable === 'title') {
      const target = e.target as HTMLElement | null;
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
    if (!this.wheelZoom) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    const target = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
    this.zoomTo(target, e.clientX, e.clientY);
    this.showUiTemporarily();
  };

  private zoom(delta: number) {
    const next = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
    this.zoomTo(next);
  }

  private zoomTo(nextScale: number, clientX?: number, clientY?: number) {
    const prev = this.scale;
    // 轻微吸附到 1 倍，避免 0.99 之类的残留值
    let next = Math.min(this.maxScale, Math.max(this.minScale, nextScale));
    if (Math.abs(next - 1) < 0.02) next = 1;
    next = Number(next.toFixed(4));
    if (!this.canvasEl || next === prev) { this.scale = next; this.applyTransform(); return; }
    const rect = this.canvasEl.getBoundingClientRect();
    const cx = clientX != null ? clientX : rect.left + rect.width / 2;
    const cy = clientY != null ? clientY : rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const useVisual = this.dragging || this.bouncing || this.momentumRunning;
    const curX = useVisual ? this.visualOffsetX : this.offsetX;
    const curY = useVisual ? this.visualOffsetY : this.offsetY;
    const vX = (cx - centerX) - curX;
    const vY = (cy - centerY) - curY;
    const r = next / (prev || 1);
    const dX = -(r - 1) * vX;
    const dY = -(r - 1) * vY;
    this.scale = next;
    this.offsetX = curX + dX; this.offsetY = curY + dY;
    // 缩放后约束在边界内（避免放大瞬间跑出屏幕）
    const b = this.getPanBounds();
    this.offsetX = Math.min(b.maxX, Math.max(b.minX, this.offsetX));
    this.offsetY = Math.min(b.maxY, Math.max(b.minY, this.offsetY));
    this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
    this.applyTransform();
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

  private rotateLeft = () => { this.rotate = (this.rotate - 90) % 360; this.applyTransform(); };
  private rotateRight = () => { this.rotate = (this.rotate + 90) % 360; this.applyTransform(); };
  private flipHorizontal = () => { this.flipX = !this.flipX; this.applyTransform(); };
  private flipVertical = () => { this.flipY = !this.flipY; this.applyTransform(); };

  private onDblClick = (e: MouseEvent) => {
    e.preventDefault();
    const target = this.scale === 1 ? 2 : 1;
    this.zoomTo(target, e.clientX, e.clientY);
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
    // 避免冒泡到面板拖拽（确保拖动图片不会带动小窗位置）
    e.stopPropagation();
    if (e.pointerType === 'touch') e.preventDefault();

    // 若正在动量滚动，打断它
    if (this.momentumRunning) {
      this.stopMomentum();
      // 将当前视觉位置固化为状态，作为新拖拽起点
      this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY;
    }

    // 记录指针（用于多指缩放）
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 多指优先：两指立即进入捏合
    if (this.activePointers.size === 2) {
      if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); this.singleTapTimer = undefined; }
      const pts = Array.from(this.activePointers.values());
      const dx = pts[0].x - pts[1].x; const dy = pts[0].y - pts[1].y;
      this.pinchStartDist = Math.hypot(dx, dy) || 1;
      this.pinchStartScale = this.scale;
      this.pinchStartAngle = Math.atan2(dy, dx);
      this.rotateStart = this.rotate;
      // 使用视觉偏移作为手势的实时基准
      this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
      this.isPinching = true;
      this.gesturing = true;
      this.dragging = false;
    } else {
      // 单指：准备拖拽或轻扫
      this.dragging = true;
      this.dragStartX = e.clientX; this.dragStartY = e.clientY;
      this.startOffsetX = this.offsetX; this.startOffsetY = this.offsetY;
      this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
      this.lastMoveTime = performance.now();
      this.lastMoveX = e.clientX; this.lastMoveY = e.clientY;
      this.velocityX = 0; this.velocityY = 0;

      // 仅对主触点做单击/双击识别，避免第二指误判为双击
      if (e.pointerType === 'touch' && (e as any).isPrimary !== false) {
        const now = Date.now();
        if (now - this.lastTapTime < 300 && !this.isPinching) {
          if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); this.singleTapTimer = undefined; }
          this.onDblClick(e as any);
          this.lastTapTime = 0;
        } else {
          this.lastTapTime = now;
          this.tapStartX = e.clientX; this.tapStartY = e.clientY; this.tapMoved = false;
          if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); }
          this.singleTapTimer = window.setTimeout(() => {
            if (!this.tapMoved && !this.isPinching) {
              this.uiHidden = !this.uiHidden;
            }
            this.singleTapTimer = undefined as any;
          }, 260);
        }
      }
    }

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  private onPointerMove = (e: PointerEvent) => {
    this.showUiTemporarily();
    if (e.pointerType === 'touch') e.preventDefault();
    // 更新活动指针位置
    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // 两指缩放/旋转（围绕两指中点作为枢轴，同时锚定该点）
    if (this.isPinching && this.activePointers.size >= 2) {
      if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); this.singleTapTimer = undefined; }
      const pts = Array.from(this.activePointers.values());
      const dx = pts[0].x - pts[1].x; const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const ratio = dist / (this.pinchStartDist || 1);
      const rawScale = this.pinchStartScale * ratio;
      const nextScale = Number(Math.min(this.maxScale, Math.max(this.minScale, rawScale)).toFixed(3));
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      // 计算旋转角度（两指连线角度差），并加入角度阈值
      const angle = Math.atan2(dy, dx);
      let delta = angle - this.pinchStartAngle;
      if (delta > Math.PI) delta -= Math.PI * 2; else if (delta < -Math.PI) delta += Math.PI * 2;
      const deltaDeg = (delta * 180) / Math.PI;
      const nextRotate = (Math.abs(deltaDeg) >= this.rotateThresholdDeg) ? (this.rotateStart + deltaDeg) : this.rotateStart;
      this.pinchTo(nextScale, nextRotate, midX, midY);
      this.gesturing = true;
      return;
    }

    if (!this.dragging) return;
    // 若移动超过阈值，取消单击判定
    const moveDx = Math.abs(e.clientX - this.tapStartX);
    const moveDy = Math.abs(e.clientY - this.tapStartY);
    if (moveDx > 8 || moveDy > 8) { this.tapMoved = true; if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); this.singleTapTimer = undefined; } }
    const dx = e.clientX - this.dragStartX; const dy = e.clientY - this.dragStartY;
    let nextX = this.startOffsetX + dx;
    let nextY = this.startOffsetY + dy;

    // 速度估计（简单差分）
    const now = performance.now();
    const dt = Math.max(1, now - this.lastMoveTime);
    this.velocityX = (e.clientX - this.lastMoveX) / dt;
    this.velocityY = (e.clientY - this.lastMoveY) / dt;
    this.lastMoveTime = now; this.lastMoveX = e.clientX; this.lastMoveY = e.clientY;

    // 橡皮筋超界处理（拖到边界外逐步加阻尼）
    const b = this.getPanBounds();
    if (nextX < b.minX) nextX = this.rubberband(nextX, b.minX, b.maxX);
    if (nextX > b.maxX) nextX = this.rubberband(nextX, b.minX, b.maxX);
    if (nextY < b.minY) nextY = this.rubberband(nextY, b.minY, b.maxY);
    if (nextY > b.maxY) nextY = this.rubberband(nextY, b.minY, b.maxY);

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
    // 移除当前指针
    this.activePointers.delete(e.pointerId);
    if (this.singleTapTimer) {
      // 若在计时窗口内抬起，不做额外处理，让计时器决定是否切换UI
      // 但如果已经识别为滑动/缩放，上面已清除计时器
    }
    if (this.isPinching) {
      if (this.activePointers.size < 2) {
        this.isPinching = false; this.gesturing = false;
        // 提交视觉位移到状态并进行边界回弹
        const b = this.getPanBounds();
        const tx = Math.min(b.maxX, Math.max(b.minX, this.visualOffsetX));
        const ty = Math.min(b.maxY, Math.max(b.minY, this.visualOffsetY));
        const needsBounce = Math.abs(tx - this.visualOffsetX) > 0.5 || Math.abs(ty - this.visualOffsetY) > 0.5;
        if (needsBounce) {
          this.bounceTo(tx, ty);
        } else {
          this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY;
          this.applyTransform();
        }
      }
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      return;
    }

    const dx = e.clientX - this.dragStartX; const dy = e.clientY - this.dragStartY;
    const isSwipeCandidate = Math.abs(this.scale - 1) < 0.001 && Math.abs(this.startOffsetX) < 10 && Math.abs(this.startOffsetY) < 10;

    this.dragging = false;
    if (this.moveRaf) { cancelAnimationFrame(this.moveRaf); this.moveRaf = undefined; }

    if (isSwipeCandidate && Math.abs(dy) < 60 && Math.abs(dx) > 80 && this.list.length > 1) {
      // 快速轻扫切图：右滑上一张，左滑下一张
      if (dx > 0) this.prev(); else this.next();
      // 恢复位置，不提交偏移
      this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      return;
    }

    // overlay 模式：下滑关闭（缩放≈1 且未拖图）
    if (this.viewerMode === 'overlay' && isSwipeCandidate && dy > 120 && Math.abs(dx) < 80) {
      this.close();
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      return;
    }

    // 动量滚动判断（在非切图/关闭场景，且缩放>1时才进行）
    const speed = Math.hypot(this.velocityX, this.velocityY);
    const canMomentum = this.scale > 1.01;
    if (canMomentum && speed > 0.25) { // 约 >250px/s
      this.startMomentum(this.velocityX, this.velocityY);
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      return;
    }

    // 将最终结果回弹到边界内并提交
    const b = this.getPanBounds();
    const targetX = Math.min(b.maxX, Math.max(b.minX, this.visualOffsetX));
    const targetY = Math.min(b.maxY, Math.max(b.minY, this.visualOffsetY));
    const needsBounce = Math.abs(targetX - this.visualOffsetX) > 0.5 || Math.abs(targetY - this.visualOffsetY) > 0.5;

    if (needsBounce) {
      this.bounceTo(targetX, targetY);
    } else {
      this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY;
      this.applyTransform();
    }

    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  private onImageLoad = () => {
    // 后备路径：未采用预加载提交时，img onload 后触发
    if (!this.loading) return; // 已通过预加载流程提交
    this.loading = false;
    // 更新舞台与基准尺寸，用于边界约束
    this.updateStageMetrics();
    this.measureBaseSize();
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

  render() {
    if (!this.visible && !this.isClosing) return null as any;
    const item = this.current();
    const classes = ['ldesign-image-viewer', this.backdrop === 'dark' ? 'ldesign-image-viewer--dark' : 'ldesign-image-viewer--light', this.viewerMode === 'modal' ? 'ldesign-image-viewer--modal' : '', this.viewerMode === 'embedded' ? 'ldesign-image-viewer--embedded' : '', this.uiHidden ? 'ldesign-image-viewer--ui-hidden' : ''].join(' ');

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
            <div class="ldesign-image-viewer__canvas" ref={el => (this.canvasEl = el as HTMLElement)} onWheel={this.onWheel} onDblClick={this.onDblClick}
              onPointerDown={this.viewerMode === 'modal' && this.panelDraggable === 'anywhere' ? undefined : this.onPointerDown}
              onPointerMove={this.viewerMode === 'modal' && this.panelDraggable === 'anywhere' ? undefined : this.onPointerMove}
              onPointerUp={this.viewerMode === 'modal' && this.panelDraggable === 'anywhere' ? undefined : this.onPointerUp}
              onPointerCancel={this.viewerMode === 'modal' && this.panelDraggable === 'anywhere' ? undefined : this.onPointerUp}>
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
                    'is-gesturing': this.gesturing,
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
  // ── Metrics & bounds ─────────────────────────────────────────────
  private onWindowResize = () => {
    this.updateStageMetrics();
    this.measureBaseSize();
    const b = this.getPanBounds();
    const tx = Math.min(b.maxX, Math.max(b.minX, this.offsetX));
    const ty = Math.min(b.maxY, Math.max(b.minY, this.offsetY));
    if (Math.abs(tx - this.offsetX) > 0.5 || Math.abs(ty - this.offsetY) > 0.5) {
      // 视口变化导致越界，平滑回弹
      this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
      this.bounceTo(tx, ty);
    } else {
      this.applyTransform();
    }
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

  private bounceTo(x: number, y: number) {
    if (this.bounceRaf) { cancelAnimationFrame(this.bounceRaf); this.bounceRaf = undefined; }
    this.bouncing = true;
    // 禁用 CSS 过渡，使用 JS 动画
    try { this.imageEl?.classList.add('is-bouncing'); } catch {}
    this.bounceFromX = this.visualOffsetX; this.bounceFromY = this.visualOffsetY;
    this.bounceToX = x; this.bounceToY = y;
    this.bounceStartTime = performance.now();
    const animate = () => {
      const t = Math.min(1, (performance.now() - this.bounceStartTime) / this.bounceDuration);
      // easeOutCubic
      const k = 1 - Math.pow(1 - t, 3);
      const curX = this.bounceFromX + (this.bounceToX - this.bounceFromX) * k;
      const curY = this.bounceFromY + (this.bounceToY - this.bounceFromY) * k;
      this.visualOffsetX = curX; this.visualOffsetY = curY;
      this.applyTransform();
      if (t < 1) {
        this.bounceRaf = requestAnimationFrame(animate);
      } else {
        this.bouncing = false; this.bounceRaf = undefined;
        this.offsetX = this.bounceToX; this.offsetY = this.bounceToY;
        // 恢复 CSS 过渡
        try { this.imageEl?.classList.remove('is-bouncing'); } catch {}
        this.applyTransform();
      }
    };
    this.bounceRaf = requestAnimationFrame(animate);
  }

  private startMomentum(vx: number, vy: number) {
    // 终止其他动画
    if (this.bounceRaf) { cancelAnimationFrame(this.bounceRaf); this.bounceRaf = undefined; this.bouncing = false; try { this.imageEl?.classList.remove('is-bouncing'); } catch {} }
    if (this.momentumRaf) { cancelAnimationFrame(this.momentumRaf); this.momentumRaf = undefined; }
    this.momentumRunning = true;
    this.momentumVX = vx; this.momentumVY = vy;
    this.momentumLastTime = performance.now();
    try { this.imageEl?.classList.add('is-kinetic'); } catch {}
    // 从当前视觉位置开始
    this.visualOffsetX = this.visualOffsetX || this.offsetX;
    this.visualOffsetY = this.visualOffsetY || this.offsetY;

    const FRICTION = 0.004; // 越大越快停止（单位 1/ms）
    const MIN_SPEED = 0.02; // px/ms

    const step = () => {
      if (!this.momentumRunning) return;
      const now = performance.now();
      const dt = Math.max(1, now - this.momentumLastTime);
      this.momentumLastTime = now;

      // 指数衰减
      const decay = Math.exp(-FRICTION * dt);
      this.momentumVX *= decay;
      this.momentumVY *= decay;

      // 移动
      let nx = this.visualOffsetX + this.momentumVX * dt;
      let ny = this.visualOffsetY + this.momentumVY * dt;

      const b = this.getPanBounds();
      // 命中边界时，夹紧并清除该方向速度
      if (nx < b.minX) { nx = b.minX; this.momentumVX = 0; }
      if (nx > b.maxX) { nx = b.maxX; this.momentumVX = 0; }
      if (ny < b.minY) { ny = b.minY; this.momentumVY = 0; }
      if (ny > b.maxY) { ny = b.maxY; this.momentumVY = 0; }

      this.visualOffsetX = nx; this.visualOffsetY = ny;
      this.applyTransform();

      const speed = Math.hypot(this.momentumVX, this.momentumVY);
      if (speed <= MIN_SPEED) {
        // 结束动量，回弹确保完全在边界内
        const tx = Math.min(b.maxX, Math.max(b.minX, this.visualOffsetX));
        const ty = Math.min(b.maxY, Math.max(b.minY, this.visualOffsetY));
        this.stopMomentum();
        if (Math.abs(tx - this.visualOffsetX) > 0.5 || Math.abs(ty - this.visualOffsetY) > 0.5) {
          this.bounceTo(tx, ty);
        } else {
          this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY;
          this.applyTransform();
        }
        return;
      }
      this.momentumRaf = requestAnimationFrame(step);
    };
    this.momentumRaf = requestAnimationFrame(step);
  }

  private stopMomentum() {
    this.momentumRunning = false;
    if (this.momentumRaf) { cancelAnimationFrame(this.momentumRaf); this.momentumRaf = undefined; }
    try { this.imageEl?.classList.remove('is-kinetic'); } catch {}
  }
}

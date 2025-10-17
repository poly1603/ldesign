import { Component, Prop, State, h, Host, Element, Event, EventEmitter, Method } from '@stencil/core';

/**
 * ldesign-draggable
 * 通用可拖拽/缩放/旋转容器（图片优先），支持：
 * - PC：滚轮缩放、拖拽平移、双击 1x/2x 切换
 * - 移动端：双指缩放+旋转、单指平移、松手回弹、动量滚动
 *
 * 用法：
 * 1) 直接传入 src 渲染图片
 *    <ldesign-draggable src="/big.jpg" style="width:100%;height:100%" />
 * 2) 插槽自定义内容（若无 src）：
 *    <ldesign-draggable style="width:100%;height:100%">
 *      <img src="/big.jpg" />
 *    </ldesign-draggable>
 */
@Component({ tag: 'ldesign-draggable', styleUrl: 'draggable.less', shadow: false })
export class LdesignDraggable {
  @Element() el!: HTMLElement;

  // ── Props ─────────────────────────────────────────────
  /** 若提供则内部渲染 img；否则使用默认插槽 */
  @Prop() src?: string;
  @Prop() alt?: string;

  /** PC 滚轮缩放 */
  @Prop() wheelZoom: boolean = true;
  /** 是否需要按住 Ctrl/⌘ 才进行滚轮缩放；否则滚轮优先缩放 */
  @Prop() wheelZoomRequiresCtrl: boolean = false;
  /** 允许使用滚轮进行平移（当未触发缩放时） */
  @Prop() wheelPan: boolean = true;
  /** 缩放步进（滚轮/按钮）*/
  @Prop() zoomStep: number = 0.1;
  /** 最小/最大缩放 */
  @Prop() minScale: number = 0.25;
  @Prop() maxScale: number = 4;
  /** 是否允许旋转（移动端双指） */
  @Prop() enableRotate: boolean = true;
  /** 旋转吸附角度（度）。大于 0 时在捏合旋转接近该步进的倍数会吸附 */
  @Prop() rotateSnapDeg: number = 0;
  /** 旋转吸附阈值（度），仅当与最近倍数的差值不超过该阈值时生效 */
  @Prop() rotateSnapEpsilon: number = 3;
  /** 双击切换到的缩放倍数 */
  @Prop() doubleTapZoom: number = 2;
  /** 是否允许双击/双指双击缩放 */
  @Prop() allowDoubleTap: boolean = true;

  /** 初始状态 */
  @Prop() initialScale: number = 1;
  @Prop() initialRotate: number = 0;
  @Prop() initialOffsetX: number = 0;
  @Prop() initialOffsetY: number = 0;
  /** 是否启用动量滚动 */
  @Prop() enableMomentum: boolean = true;
  /** 是否启用键盘交互（方向键平移、+/- 缩放、R 旋转、0 重置） */
  @Prop() keyboard: boolean = true;
  /** 方向键平移基础步长（像素） */
  @Prop() keyPanStep: number = 40;
  /** 按住 Shift 时的平移步长倍率 */
  @Prop() keyPanFastMultiplier: number = 3;
  /** 是否禁用右键菜单（避免干扰拖拽） */
  @Prop() disableContextMenu: boolean = true;

  // 新增功能属性
  /** 是否启用网格吸附 */
  @Prop() enableGrid: boolean = false;
  /** 网格大小（像素） */
  @Prop() gridSize: number = 20;
  /** 是否显示缩放/旋转指示器 */
  @Prop() showIndicators: boolean = false;
  /** 是否启用撤销/重做 */
  @Prop() enableHistory: boolean = false;
  /** 历史记录最大数量 */
  @Prop() maxHistory: number = 20;
  /** 是否显示性能监控 */
  @Prop() showPerformance: boolean = false;
  /** 是否启用缩略图导航 */
  @Prop() showMinimap: boolean = false;
  /** 缩略图导航位置 */
  @Prop() minimapPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'bottom-right';
  /** 是否启用平滑边界 */
  @Prop() smoothBounds: boolean = true;
  /** 边界弹性系数 */
  @Prop() boundsElasticity: number = 0.15;
  /** 预设视角 */
  @Prop() presetViews?: Array<{ name: string; scale: number; rotate: number; offsetX: number; offsetY: number }>;

  // ── Events ────────────────────────────────────────────
  @Event() ldesignTransformChange!: EventEmitter<{ scale: number; rotate: number; offsetX: number; offsetY: number }>;
  @Event() ldesignGestureStart!: EventEmitter<void>;
  @Event() ldesignGestureEnd!: EventEmitter<void>;
  @Event() ldesignHistoryChange!: EventEmitter<{ canUndo: boolean; canRedo: boolean }>;

  // ── State ─────────────────────────────────────────────
  @State() scale: number = 1;
  @State() rotate: number = 0;
  @State() offsetX: number = 0;
  @State() offsetY: number = 0;
  @State() dragging: boolean = false;
  @State() gesturing: boolean = false;
  @State() fps: number = 60;
  @State() canUndo: boolean = false;
  @State() canRedo: boolean = false;

  // 控件栏相关
  @Prop() showControls: boolean = false;
  @Prop() controlsPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

  private canvasEl?: HTMLElement;
  private contentEl?: HTMLElement; // 被 transform 的节点（img 或 slot 容器）
  private imgEl?: HTMLImageElement;

  // 手势内部变量
  private activePointers = new Map<number, { x: number; y: number }>();
  private lastTapTime = 0;
  private singleTapTimer?: number;
  private tapStartX = 0; private tapStartY = 0; private tapMoved = false;

  private dragStartX = 0; private dragStartY = 0;
  private startOffsetX = 0; private startOffsetY = 0;
  private visualOffsetX = 0; private visualOffsetY = 0;
  private moveRaf?: number;
  // 速度估计（动量）
  private lastMoveTime = 0; private lastMoveX = 0; private lastMoveY = 0; private velocityX = 0; private velocityY = 0;

  private isPinching = false;
  private pinchStartDist = 0;
  private pinchStartScale = 1;
  private pinchStartAngle = 0;
  private rotateStart = 0;
  
  private resizeObserver?: ResizeObserver;

  // 舞台与基准尺寸（scale=1）
  private stageWidth = 0; private stageHeight = 0;
  private baseWidth = 0; private baseHeight = 0;

  // 回弹动画
  private bouncing = false; private bounceRaf?: number;
  private bounceStartTime = 0; private bounceFromX = 0; private bounceFromY = 0; private bounceToX = 0; private bounceToY = 0;
  private bounceDuration = 220;

  // 双击缩放动画
  private zooming = false; private zoomRaf?: number;
  private zoomStartTime = 0; private zoomFromScale = 1; private zoomToScale = 1;
  private zoomFromX = 0; private zoomFromY = 0; private zoomToX = 0; private zoomToY = 0;
  private zoomDuration = 300; // ms
  private zoomCenterX = 0; private zoomCenterY = 0;

  // 动量滚动
  private momentumRunning = false; private momentumRaf?: number; private momentumLastTime = 0; private momentumVX = 0; private momentumVY = 0;

  // 旋转抖动阈值
  private rotateThresholdDeg = 5;

  // 历史记录管理
  private history: Array<{ scale: number; rotate: number; offsetX: number; offsetY: number }> = [];
  private historyIndex: number = -1;
  private isApplyingHistory: boolean = false;

  // 性能监控
  private frameCount = 0;
  private lastFpsTime = 0;
  private fpsRaf?: number;

  // 触摸板手势优化
  private lastWheelTime = 0;
  private wheelVelocityX = 0;
  private wheelVelocityY = 0;
  private wheelMomentumRaf?: number;

  componentWillLoad() {
    this.resetInternal(this.initialScale, this.initialRotate, this.initialOffsetX, this.initialOffsetY);
    if (this.enableHistory) {
      this.saveHistory();
    }
  }

  componentDidLoad() {
    this.updateStageMetrics();
    window.addEventListener('resize', this.onWindowResize, { passive: true } as any);
    if (typeof ResizeObserver !== 'undefined' && this.canvasEl) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateStageMetrics();
        this.measureBaseSize();
        this.applyTransform();
      });
      try { this.resizeObserver.observe(this.canvasEl); } catch {}
    }
    if (this.showPerformance) {
      this.startPerformanceMonitoring();
    }
  }
  disconnectedCallback() {
    window.removeEventListener('resize', this.onWindowResize as any);
    try { this.resizeObserver?.disconnect(); } catch {}
    this.stopPerformanceMonitoring();
    this.cleanup();
  }

  // ── Public Methods ────────────────────────────────────
  @Method() async reset() { this.resetInternal(1, 0, 0, 0); this.applyTransform(); this.emitChange(); }
  @Method() async zoomTo(scale: number, clientX?: number, clientY?: number) { this.zoomToInternal(scale, clientX, clientY); }
  @Method() async zoomIn(step?: number) { const inc = step ?? this.zoomStep; const target = Math.min(this.maxScale, Math.max(this.minScale, this.scale + inc)); this.zoomToInternal(target); }
  @Method() async zoomOut(step?: number) { const dec = step ?? this.zoomStep; const target = Math.min(this.maxScale, Math.max(this.minScale, this.scale - dec)); this.zoomToInternal(target); }
  @Method() async setRotate(deg: number) { this.rotate = deg; this.applyTransform(); this.emitChange(); }
  @Method() async rotateBy(deltaDeg: number) { await this.setRotate(this.rotate + deltaDeg); }
  @Method() async setOffsets(x: number, y: number) { this.offsetX = x; this.offsetY = y; this.visualOffsetX = x; this.visualOffsetY = y; this.applyTransform(); this.emitChange(); }
  @Method() async getTransformString() { return this.getTransformStringInternal(); }
  @Method() async getState() { return { scale: this.scale, rotate: this.rotate, offsetX: this.offsetX, offsetY: this.offsetY }; }
  @Method() async panBy(dx: number, dy: number, clamp: boolean = true) { this.panInternal((this.offsetX || 0) + dx, (this.offsetY || 0) + dy, clamp); }
  @Method() async panTo(x: number, y: number, clamp: boolean = true) { this.panInternal(x, y, clamp); }
  @Method() async fitContain() { const s = this.computeContainScaleForCurrentRotate(); if (s) { this.scale = s; this.offsetX = 0; this.offsetY = 0; this.visualOffsetX = 0; this.visualOffsetY = 0; this.applyTransform(); this.emitChange(); } }
  @Method() async fitCover() { const s = this.computeCoverScaleForCurrentRotate(); if (s) { this.scale = s; this.offsetX = 0; this.offsetY = 0; this.visualOffsetX = 0; this.visualOffsetY = 0; this.applyTransform(); this.emitChange(); } }
  
  // 新增公共方法
  @Method() async undo() { if (this.canUndo) { this.applyHistoryState(this.historyIndex - 1); } }
  @Method() async redo() { if (this.canRedo) { this.applyHistoryState(this.historyIndex + 1); } }
  @Method() async goToPresetView(index: number) { 
    if (this.presetViews && this.presetViews[index]) {
      const view = this.presetViews[index];
      this.animateToState(view.scale, view.rotate, view.offsetX, view.offsetY);
    }
  }
  @Method() async toggleGrid() { this.enableGrid = !this.enableGrid; }
  @Method() async toggleIndicators() { this.showIndicators = !this.showIndicators; }
  @Method() async toggleMinimap() { this.showMinimap = !this.showMinimap; }

  // ── Core ──────────────────────────────────────────────
  private resetInternal(s: number, r: number, x: number, y: number) {
    this.scale = this.clampScale(s); this.rotate = r; this.offsetX = x; this.offsetY = y; this.visualOffsetX = x; this.visualOffsetY = y;
    this.bouncing = false; this.stopMomentum(); this.stopZoom();
  }

  private getTransformStringInternal(tx?: number, ty?: number) {
    const useVisual = this.gesturing || this.dragging || this.bouncing || this.momentumRunning || this.zooming;
    const x = tx != null ? tx : (useVisual ? this.visualOffsetX : this.offsetX);
    const y = ty != null ? ty : (useVisual ? this.visualOffsetY : this.offsetY);
    const s = this.zooming ? this.zoomFromScale : this.scale; // 双击缩放动画期间使用动画值
    return `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${s}) rotate(${this.rotate}deg)`;
  }

  private clampScale(s: number) {
    let next = Math.min(this.maxScale, Math.max(this.minScale, s));
    if (Math.abs(next - 1) < 0.02) next = 1;
    return Number(next.toFixed(4));
  }

  private applyTransform() {
    if (!this.contentEl) return;
    this.contentEl.style.transform = this.getTransformStringInternal();
  }

  private emitChange() { 
    this.ldesignTransformChange.emit({ scale: this.scale, rotate: this.rotate, offsetX: this.offsetX, offsetY: this.offsetY }); 
    if (this.enableHistory && !this.isApplyingHistory) {
      this.saveHistory();
    }
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const wantZoom = this.wheelZoom && (!this.wheelZoomRequiresCtrl || e.ctrlKey || (e as any).metaKey);
    if (wantZoom) {
      const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      const target = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
      this.zoomToInternal(target, e.clientX, e.clientY);
      return;
    }
    if (this.wheelPan) {
      // 触控板/鼠标滚轮平移（按住 Shift 水平加速）
      const factor = e.shiftKey ? 1.6 : 1;
      const dx = -e.deltaX * factor;
      const dy = -e.deltaY * factor;
      const useVisual = this.gesturing || this.dragging || this.bouncing || this.momentumRunning || this.zooming;
      const curX = useVisual ? this.visualOffsetX : this.offsetX;
      const curY = useVisual ? this.visualOffsetY : this.offsetY;
      const b = this.getPanBounds();
      const nx = Math.min(b.maxX, Math.max(b.minX, curX + dx));
      const ny = Math.min(b.maxY, Math.max(b.minY, curY + dy));
      this.offsetX = nx; this.offsetY = ny; this.visualOffsetX = nx; this.visualOffsetY = ny;
      this.applyTransform(); this.emitChange();
    }
  };

  private zoomToInternal(nextScale: number, clientX?: number, clientY?: number, animated = false) {
    const prev = this.scale;
    let next = Math.min(this.maxScale, Math.max(this.minScale, nextScale));
    if (Math.abs(next - 1) < 0.02) next = 1;
    next = Number(next.toFixed(4));
    if (!this.canvasEl || next === prev) { this.scale = next; this.applyTransform(); this.emitChange(); return; }
    const rect = this.canvasEl.getBoundingClientRect();
    const cx = clientX != null ? clientX : rect.left + rect.width / 2;
    const cy = clientY != null ? clientY : rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
    const useVisual = this.gesturing || this.dragging || this.bouncing || this.momentumRunning || this.zooming;
    const curX = useVisual ? this.visualOffsetX : this.offsetX;
    const curY = useVisual ? this.visualOffsetY : this.offsetY;
    const vX = (cx - centerX) - curX; const vY = (cy - centerY) - curY;
    const r = next / (prev || 1);
    const dX = -(r - 1) * vX; const dY = -(r - 1) * vY;
    const targetX = curX + dX; const targetY = curY + dY;
    const b = this.getPanBounds();
    const finalX = Math.min(b.maxX, Math.max(b.minX, targetX));
    const finalY = Math.min(b.maxY, Math.max(b.minY, targetY));

    if (animated) {
      this.animateZoomTo(next, finalX, finalY, cx, cy);
    } else {
      this.scale = next; this.offsetX = finalX; this.offsetY = finalY;
      this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
      this.applyTransform(); this.emitChange();
    }
  }

  private onDblClick = (e: MouseEvent | PointerEvent) => {
    if (!this.allowDoubleTap) return;
    e.preventDefault();
    const target = this.scale === 1 ? this.doubleTapZoom : 1;
    this.zoomToInternal(target, (e as any).clientX, (e as any).clientY, true); // 启用动画
  };

  // ── Pointer handlers ─────────────────────────────────
  private onDragStart = (e: DragEvent) => { e.preventDefault(); };
  private onPointerDown = (e: PointerEvent) => {
    e.stopPropagation(); if (e.pointerType === 'touch') e.preventDefault();

    if (this.momentumRunning) { this.stopMomentum(); this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY; }
    if (this.zooming) { this.stopZoom(); this.scale = this.zoomFromScale; this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY; } // 中断缩放动画

    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size === 2) {
      if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); this.singleTapTimer = undefined as any; }
      const pts = Array.from(this.activePointers.values());
      const dx = pts[0].x - pts[1].x; const dy = pts[0].y - pts[1].y;
      this.pinchStartDist = Math.hypot(dx, dy) || 1;
      this.pinchStartScale = this.scale;
      this.pinchStartAngle = Math.atan2(dy, dx);
      this.rotateStart = this.rotate;
      this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
      this.isPinching = true; this.gesturing = true; this.dragging = false;
      this.ldesignGestureStart.emit();
    } else {
      // 单指
      this.dragging = true;
      this.dragStartX = e.clientX; this.dragStartY = e.clientY;
      this.startOffsetX = this.offsetX; this.startOffsetY = this.offsetY;
      this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
      this.lastMoveTime = performance.now(); this.lastMoveX = e.clientX; this.lastMoveY = e.clientY; this.velocityX = 0; this.velocityY = 0;

      if (this.allowDoubleTap && e.pointerType === 'touch' && (e as any).isPrimary !== false) {
        const now = Date.now();
        if (now - this.lastTapTime < 300 && !this.isPinching) {
          if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); this.singleTapTimer = undefined as any; }
          this.onDblClick(e);
          this.lastTapTime = 0;
        } else {
          this.lastTapTime = now;
          this.tapStartX = e.clientX; this.tapStartY = e.clientY; this.tapMoved = false;
          if (this.singleTapTimer) { clearTimeout(this.singleTapTimer); }
          this.singleTapTimer = window.setTimeout(() => { this.singleTapTimer = undefined as any; }, 260);
        }
      }
    }

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') e.preventDefault();
    if (this.activePointers.has(e.pointerId)) this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 双指
    if (this.isPinching && this.activePointers.size >= 2) {
      const pts = Array.from(this.activePointers.values());
      const dx = pts[0].x - pts[1].x; const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const ratio = dist / (this.pinchStartDist || 1);
      const rawScale = this.pinchStartScale * ratio;
      const nextScale = Number(Math.min(this.maxScale, Math.max(this.minScale, rawScale)).toFixed(4));
      const midX = (pts[0].x + pts[1].x) / 2; const midY = (pts[0].y + pts[1].y) / 2;

      let nextRotate = this.rotateStart;
      if (this.enableRotate) {
        const angle = Math.atan2(dy, dx);
        let delta = angle - this.pinchStartAngle; if (delta > Math.PI) delta -= Math.PI * 2; else if (delta < -Math.PI) delta += Math.PI * 2;
        const deltaDeg = (delta * 180) / Math.PI;
        if (Math.abs(deltaDeg) >= this.rotateThresholdDeg) nextRotate = this.rotateStart + deltaDeg;
      }
      this.pinchTo(nextScale, nextRotate, midX, midY);
      return;
    }

    if (!this.dragging) return;
    // 单指拖拽
    const dx = e.clientX - this.dragStartX; const dy = e.clientY - this.dragStartY;
    let nextX = this.startOffsetX + dx; let nextY = this.startOffsetY + dy;

    // 速度估计
    const now = performance.now(); const dt = Math.max(1, now - this.lastMoveTime);
    this.velocityX = (e.clientX - this.lastMoveX) / dt; this.velocityY = (e.clientY - this.lastMoveY) / dt;
    this.lastMoveTime = now; this.lastMoveX = e.clientX; this.lastMoveY = e.clientY;

    const b = this.getPanBounds();
    nextX = this.rubberband(nextX, b.minX, b.maxX); nextY = this.rubberband(nextY, b.minY, b.maxY);
    this.visualOffsetX = nextX; this.visualOffsetY = nextY;
    if (this.moveRaf == null) { this.moveRaf = requestAnimationFrame(() => { this.applyTransform(); this.moveRaf = undefined; }); }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);
    if (this.isPinching) {
      if (this.activePointers.size < 2) {
        this.isPinching = false; this.gesturing = false; this.ldesignGestureEnd.emit();
        const b = this.getPanBounds();
        const tx = Math.min(b.maxX, Math.max(b.minX, this.visualOffsetX));
        const ty = Math.min(b.maxY, Math.max(b.minY, this.visualOffsetY));
        const needsBounce = Math.abs(tx - this.visualOffsetX) > 0.5 || Math.abs(ty - this.visualOffsetY) > 0.5;
        if (needsBounce) this.bounceTo(tx, ty); else { this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY; this.applyTransform(); this.emitChange(); }
      }
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      return;
    }

    this.dragging = false;
    // 动量滚动（放大后才生效）
    const speed = Math.hypot(this.velocityX, this.velocityY);
    const canMomentum = this.enableMomentum && this.scale > 1.01;
    if (canMomentum && speed > 0.25) { // 约 >250px/s
      this.startMomentum(this.velocityX, this.velocityY);
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      return;
    }

    const b = this.getPanBounds();
    const tx = Math.min(b.maxX, Math.max(b.minX, this.visualOffsetX));
    const ty = Math.min(b.maxY, Math.max(b.minY, this.visualOffsetY));
    const needsBounce = Math.abs(tx - this.visualOffsetX) > 0.5 || Math.abs(ty - this.visualOffsetY) > 0.5;
    if (needsBounce) this.bounceTo(tx, ty); else { this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY; this.applyTransform(); this.emitChange(); }
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  private onPointerCancel = (e: PointerEvent) => { this.onPointerUp(e); };

  // 组合缩放+旋转并围绕枢轴
  private pinchTo(nextScale: number, nextRotateDeg: number, clientX: number, clientY: number) {
    if (!this.canvasEl) return;
    const prevScale = this.scale;
    let s1 = Math.min(this.maxScale, Math.max(this.minScale, nextScale)); if (Math.abs(s1 - 1) < 0.02) s1 = 1; s1 = Number(s1.toFixed(4));
    const r = s1 / (prevScale || 1);

    const rect = this.canvasEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
    const T0x = this.visualOffsetX; const T0y = this.visualOffsetY;
    const px = clientX - centerX; const py = clientY - centerY;
    const vX = px - T0x; const vY = py - T0y;

    // 旋转吸附（可选）
    let rotateNext = nextRotateDeg;
    if (this.rotateSnapDeg > 0) {
      const snapped = this.snapAngle(rotateNext, this.rotateSnapDeg);
      if (Math.abs(snapped - rotateNext) <= this.rotateSnapEpsilon) rotateNext = snapped;
    }

    const dtheta = (rotateNext - this.rotate) * Math.PI / 180;
    const cos = Math.cos(dtheta), sin = Math.sin(dtheta);
    const rx = cos * vX - sin * vY; const ry = sin * vX + cos * vY;
    let newX = T0x + (vX - r * rx); let newY = T0y + (vY - r * ry);

    this.scale = s1; this.rotate = rotateNext;
    const b = this.getPanBounds();
    newX = this.rubberband(newX, b.minX, b.maxX); newY = this.rubberband(newY, b.minY, b.maxY);
    this.visualOffsetX = newX; this.visualOffsetY = newY;
    this.applyTransform(); this.emitChange();
  }

  // ── Bounds & metrics ─────────────────────────────────
  private onWindowResize = () => { this.updateStageMetrics(); this.measureBaseSize(); this.applyTransform(); };
  private onContextMenu = (e: MouseEvent) => { if (this.disableContextMenu) { e.preventDefault(); } };
  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.keyboard) return;
    // 仅在画布聚焦时响应
    const target = e.target as HTMLElement;
    if (!this.canvasEl || (target !== this.canvasEl)) return;
    const key = e.key;
    const isPlus = key === '+' || key === '=';
    const isMinus = key === '-' || key === '_';
    const isZero = key === '0';
    const stepBase = Math.max(1, Math.floor(this.keyPanStep));
    const fast = e.shiftKey ? this.keyPanFastMultiplier : 1;
    const ctrlSlow = (e.ctrlKey || (e as any).metaKey) ? 0.5 : 1;
    const panStep = Math.round(stepBase * fast * ctrlSlow);

    if (isPlus) { e.preventDefault(); this.zoomIn(); return; }
    if (isMinus) { e.preventDefault(); this.zoomOut(); return; }
    if (isZero) { e.preventDefault(); this.reset(); return; }
    if (key === 'r' || key === 'R') { e.preventDefault(); this.rotateBy(e.shiftKey ? -90 : 90); return; }
    if (key === 'ArrowUp') { e.preventDefault(); this.panBy(0, -panStep); return; }
    if (key === 'ArrowDown') { e.preventDefault(); this.panBy(0, panStep); return; }
    if (key === 'ArrowLeft') { e.preventDefault(); this.panBy(-panStep, 0); return; }
    if (key === 'ArrowRight') { e.preventDefault(); this.panBy(panStep, 0); return; }
  };

  private updateStageMetrics() { const rect = this.canvasEl?.getBoundingClientRect(); if (rect) { this.stageWidth = rect.width; this.stageHeight = rect.height; } }

  private measureBaseSize() {
    const sw = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const sh = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    if (!sw || !sh) return;
    if (this.imgEl && this.imgEl.naturalWidth && this.imgEl.naturalHeight) {
      const nw = this.imgEl.naturalWidth; const nh = this.imgEl.naturalHeight;
      const scale = Math.min(sw / nw, sh / nh, 1);
      this.baseWidth = Math.max(1, nw * scale); this.baseHeight = Math.max(1, nh * scale);
    } else if (this.contentEl) {
      const rect = this.contentEl.getBoundingClientRect(); this.baseWidth = rect.width; this.baseHeight = rect.height;
    }
  }

  private rotatedSize(w: number, h: number, deg: number) { const rad = (deg % 360) * Math.PI / 180; const c = Math.abs(Math.cos(rad)); const s = Math.abs(Math.sin(rad)); return { width: w * c + h * s, height: w * s + h * c }; }
  private snapAngle(angle: number, step: number) { return Math.round(angle / step) * step; }

  private getPanBounds() {
    const sw = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const sh = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    if (!sw || !sh || !this.baseWidth || !this.baseHeight) return { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    const sized = this.rotatedSize(this.baseWidth * this.scale, this.baseHeight * this.scale, this.rotate);
    const excessW = Math.max(0, sized.width - sw); const excessH = Math.max(0, sized.height - sh);
    const maxX = excessW > 0 ? excessW / 2 : 0; const maxY = excessH > 0 ? excessH / 2 : 0;
    return { minX: -maxX, maxX, minY: -maxY, maxY };
  }

  private computeContainScaleForCurrentRotate() {
    const sw = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const sh = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    if (!sw || !sh || !this.baseWidth || !this.baseHeight) return 0;
    const sized1 = this.rotatedSize(this.baseWidth, this.baseHeight, this.rotate);
    const s = Math.min(sw / Math.max(1, sized1.width), sh / Math.max(1, sized1.height));
    return Number(Math.max(this.minScale, Math.min(this.maxScale, s)).toFixed(4));
  }
  
  private computeCoverScaleForCurrentRotate() {
    const sw = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const sh = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    if (!sw || !sh || !this.baseWidth || !this.baseHeight) return 0;
    const sized1 = this.rotatedSize(this.baseWidth, this.baseHeight, this.rotate);
    const s = Math.max(sw / Math.max(1, sized1.width), sh / Math.max(1, sized1.height));
    return Number(Math.max(this.minScale, Math.min(this.maxScale, s)).toFixed(4));
  }

  private panInternal(x: number, y: number, clamp: boolean) {
    let nx = x; let ny = y;
    
    // 应用网格吸附
    if (this.enableGrid) {
      nx = this.snapToGrid(nx);
      ny = this.snapToGrid(ny);
    }
    
    if (clamp) { 
      const b = this.getPanBounds(); 
      if (this.smoothBounds) {
        nx = this.applySmoothBounds(nx, b.minX, b.maxX);
        ny = this.applySmoothBounds(ny, b.minY, b.maxY);
      } else {
        nx = Math.min(b.maxX, Math.max(b.minX, nx)); 
        ny = Math.min(b.maxY, Math.max(b.minY, ny));
      }
    }
    this.offsetX = nx; this.offsetY = ny; this.visualOffsetX = nx; this.visualOffsetY = ny; 
    this.applyTransform(); this.emitChange();
  }

  private normalizeOffsetsAfterMeasure() {
    const b = this.getPanBounds();
    if (!isFinite(b.minX) || !isFinite(b.maxX) || !isFinite(b.minY) || !isFinite(b.maxY)) return;
    const nx = Math.min(b.maxX, Math.max(b.minX, this.offsetX));
    const ny = Math.min(b.maxY, Math.max(b.minY, this.offsetY));
    this.offsetX = nx; this.offsetY = ny; this.visualOffsetX = nx; this.visualOffsetY = ny;
  }

  private rubberband(v: number, min: number, max: number, k = 0.35) { if (v < min) return min - (min - v) * k; if (v > max) return max + (v - max) * k; return v; }

  private bounceTo(x: number, y: number) {
    if (this.bounceRaf) { cancelAnimationFrame(this.bounceRaf); this.bounceRaf = undefined; }
    this.bouncing = true; try { this.contentEl?.classList.add('is-bouncing'); } catch {}
    this.bounceFromX = this.visualOffsetX; this.bounceFromY = this.visualOffsetY; this.bounceToX = x; this.bounceToY = y; this.bounceStartTime = performance.now();
    const animate = () => {
      const t = Math.min(1, (performance.now() - this.bounceStartTime) / this.bounceDuration); const k = 1 - Math.pow(1 - t, 3);
      const curX = this.bounceFromX + (this.bounceToX - this.bounceFromX) * k; const curY = this.bounceFromY + (this.bounceToY - this.bounceFromY) * k;
      this.visualOffsetX = curX; this.visualOffsetY = curY; this.applyTransform();
      if (t < 1) { this.bounceRaf = requestAnimationFrame(animate); } else { this.bouncing = false; this.bounceRaf = undefined; this.offsetX = this.bounceToX; this.offsetY = this.bounceToY; try { this.contentEl?.classList.remove('is-bouncing'); } catch {} this.applyTransform(); this.emitChange(); }
    };
    this.bounceRaf = requestAnimationFrame(animate);
  }

  private startMomentum(vx: number, vy: number) {
    if (this.bounceRaf) { cancelAnimationFrame(this.bounceRaf); this.bounceRaf = undefined; this.bouncing = false; try { this.contentEl?.classList.remove('is-bouncing'); } catch {} }
    if (this.momentumRaf) { cancelAnimationFrame(this.momentumRaf); this.momentumRaf = undefined; }
    this.momentumRunning = true; this.momentumVX = vx; this.momentumVY = vy; this.momentumLastTime = performance.now();
    try { this.contentEl?.classList.add('is-kinetic'); } catch {}

    const FRICTION = 0.004; const MIN_SPEED = 0.02;
    const step = () => {
      if (!this.momentumRunning) return;
      const now = performance.now(); const dt = Math.max(1, now - this.momentumLastTime); this.momentumLastTime = now;
      const decay = Math.exp(-FRICTION * dt); this.momentumVX *= decay; this.momentumVY *= decay;
      let nx = this.visualOffsetX + this.momentumVX * dt; let ny = this.visualOffsetY + this.momentumVY * dt;
      const b = this.getPanBounds();
      if (nx < b.minX) { nx = b.minX; this.momentumVX = 0; }
      if (nx > b.maxX) { nx = b.maxX; this.momentumVX = 0; }
      if (ny < b.minY) { ny = b.minY; this.momentumVY = 0; }
      if (ny > b.maxY) { ny = b.maxY; this.momentumVY = 0; }
      this.visualOffsetX = nx; this.visualOffsetY = ny; this.applyTransform();
      const speed = Math.hypot(this.momentumVX, this.momentumVY);
      if (speed <= MIN_SPEED) {
        const tx = Math.min(b.maxX, Math.max(b.minX, this.visualOffsetX));
        const ty = Math.min(b.maxY, Math.max(b.minY, this.visualOffsetY));
        this.stopMomentum();
        if (Math.abs(tx - this.visualOffsetX) > 0.5 || Math.abs(ty - this.visualOffsetY) > 0.5) this.bounceTo(tx, ty); else { this.offsetX = this.visualOffsetX; this.offsetY = this.visualOffsetY; this.applyTransform(); this.emitChange(); }
        return;
      }
      this.momentumRaf = requestAnimationFrame(step);
    };
    this.momentumRaf = requestAnimationFrame(step);
  }

  private animateZoomTo(targetScale: number, targetX: number, targetY: number, centerX?: number, centerY?: number) {
    if (this.zoomRaf) { cancelAnimationFrame(this.zoomRaf); this.zoomRaf = undefined; }
    this.stopMomentum(); // 中断动量滚动
    this.zooming = true;
    try { this.contentEl?.classList.add('is-zooming'); } catch {}

    this.zoomFromScale = this.scale; this.zoomToScale = targetScale;
    this.zoomFromX = this.visualOffsetX; this.zoomFromY = this.visualOffsetY;
    this.zoomToX = targetX; this.zoomToY = targetY;
    this.zoomCenterX = centerX || 0; this.zoomCenterY = centerY || 0;
    this.zoomStartTime = performance.now();

    const animate = () => {
      if (!this.zooming) return;
      const t = Math.min(1, (performance.now() - this.zoomStartTime) / this.zoomDuration);
      // easeOutQuart
      const k = 1 - Math.pow(1 - t, 4);
      
      // 插值缩放与位移
      const currentScale = this.zoomFromScale + (this.zoomToScale - this.zoomFromScale) * k;
      const currentX = this.zoomFromX + (this.zoomToX - this.zoomFromX) * k;
      const currentY = this.zoomFromY + (this.zoomToY - this.zoomFromY) * k;
      
      // 更新动画状态
      this.zoomFromScale = currentScale; // getTransformStringInternal 会读取这个值
      this.visualOffsetX = currentX; this.visualOffsetY = currentY;
      this.applyTransform();
      
      if (t < 1) {
        this.zoomRaf = requestAnimationFrame(animate);
      } else {
        // 动画完成，提交最终状态
        this.zooming = false; this.zoomRaf = undefined;
        this.scale = this.zoomToScale; this.offsetX = this.zoomToX; this.offsetY = this.zoomToY;
        this.visualOffsetX = this.offsetX; this.visualOffsetY = this.offsetY;
        try { this.contentEl?.classList.remove('is-zooming'); } catch {}
        this.applyTransform(); this.emitChange();
      }
    };
    this.zoomRaf = requestAnimationFrame(animate);
  }

  private stopZoom() { this.zooming = false; if (this.zoomRaf) { cancelAnimationFrame(this.zoomRaf); this.zoomRaf = undefined; } try { this.contentEl?.classList.remove('is-zooming'); } catch {} }

  private stopMomentum() { this.momentumRunning = false; if (this.momentumRaf) { cancelAnimationFrame(this.momentumRaf); this.momentumRaf = undefined; } try { this.contentEl?.classList.remove('is-kinetic'); } catch {} }

  // ── 新增功能方法 ────────────────────────────────────────
  // 历史记录管理
  private saveHistory() {
    if (!this.enableHistory) return;
    const state = { scale: this.scale, rotate: this.rotate, offsetX: this.offsetX, offsetY: this.offsetY };
    
    // 如果不是最新的历史记录，则删除后续记录
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // 添加新记录
    this.history.push(state);
    
    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
    
    this.historyIndex = this.history.length - 1;
    this.updateHistoryState();
  }

  private applyHistoryState(index: number) {
    if (index < 0 || index >= this.history.length) return;
    
    const state = this.history[index];
    this.isApplyingHistory = true;
    this.historyIndex = index;
    
    this.animateToState(state.scale, state.rotate, state.offsetX, state.offsetY);
    
    setTimeout(() => {
      this.isApplyingHistory = false;
    }, 350);
    
    this.updateHistoryState();
  }

  private updateHistoryState() {
    this.canUndo = this.historyIndex > 0;
    this.canRedo = this.historyIndex < this.history.length - 1;
    this.ldesignHistoryChange.emit({ canUndo: this.canUndo, canRedo: this.canRedo });
  }

  // 动画过渡到指定状态
  private animateToState(targetScale: number, targetRotate: number, targetX: number, targetY: number) {
    const duration = 300;
    const startTime = performance.now();
    const startScale = this.scale;
    const startRotate = this.rotate;
    const startX = this.offsetX;
    const startY = this.offsetY;
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      
      this.scale = startScale + (targetScale - startScale) * eased;
      this.rotate = startRotate + (targetRotate - startRotate) * eased;
      this.offsetX = startX + (targetX - startX) * eased;
      this.offsetY = startY + (targetY - startY) * eased;
      this.visualOffsetX = this.offsetX;
      this.visualOffsetY = this.offsetY;
      
      this.applyTransform();
      
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.emitChange();
      }
    };
    
    animate();
  }

  // 网格吸附
  private snapToGrid(value: number): number {
    if (!this.enableGrid || this.gridSize <= 0) return value;
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  // 性能监控
  private startPerformanceMonitoring() {
    if (!this.showPerformance) return;
    
    const measureFPS = () => {
      const now = performance.now();
      this.frameCount++;
      
      if (now - this.lastFpsTime >= 1000) {
        this.fps = Math.round(this.frameCount * 1000 / (now - this.lastFpsTime));
        this.frameCount = 0;
        this.lastFpsTime = now;
      }
      
      this.fpsRaf = requestAnimationFrame(measureFPS);
    };
    
    this.lastFpsTime = performance.now();
    this.frameCount = 0;
    measureFPS();
  }

  private stopPerformanceMonitoring() {
    if (this.fpsRaf) {
      cancelAnimationFrame(this.fpsRaf);
      this.fpsRaf = undefined;
    }
  }

  // 平滑边界处理
  private applySmoothBounds(value: number, min: number, max: number): number {
    if (!this.smoothBounds) return Math.min(max, Math.max(min, value));
    
    if (value < min) {
      const diff = min - value;
      return min - diff * this.boundsElasticity;
    }
    if (value > max) {
      const diff = value - max;
      return max + diff * this.boundsElasticity;
    }
    return value;
  }

  // 清理资源
  private cleanup() {
    // 清理所有动画帧
    if (this.moveRaf) cancelAnimationFrame(this.moveRaf);
    if (this.bounceRaf) cancelAnimationFrame(this.bounceRaf);
    if (this.zoomRaf) cancelAnimationFrame(this.zoomRaf);
    if (this.momentumRaf) cancelAnimationFrame(this.momentumRaf);
    if (this.fpsRaf) cancelAnimationFrame(this.fpsRaf);
    if (this.wheelMomentumRaf) cancelAnimationFrame(this.wheelMomentumRaf);
    
    // 清理定时器
    if (this.singleTapTimer) clearTimeout(this.singleTapTimer);
    
    // 清理指针
    this.activePointers.clear();
  }

  // ── Render ────────────────────────────────────────────
  private onImageLoad = () => { this.updateStageMetrics(); this.measureBaseSize(); this.normalizeOffsetsAfterMeasure(); this.applyTransform(); };

  render() {
    return (
      <Host>
        <div class="ldesign-draggable" ref={el => (this.canvasEl = el as HTMLElement)} onWheel={this.onWheel}
          onPointerDown={this.onPointerDown} onPointerMove={this.onPointerMove} onPointerUp={this.onPointerUp} onPointerCancel={this.onPointerCancel}
          onDblClick={this.onDblClick} onDragStart={this.onDragStart}
          onContextMenu={this.onContextMenu} onKeyDown={this.onKeyDown} tabindex={0} role="application" aria-label={this.alt || 'draggable canvas'}
        >
          {/* 网格背景 */}
          {this.enableGrid && (
            <svg class="ldesign-draggable__grid" width="100%" height="100%" aria-hidden="true">
              <defs>
                <pattern id="grid-pattern" width={this.gridSize} height={this.gridSize} patternUnits="userSpaceOnUse">
                  <circle cx={this.gridSize/2} cy={this.gridSize/2} r="1" fill="currentColor" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          )}

          {this.src ? (
            <img ref={el => (this.imgEl = el as HTMLImageElement)} class={{ 'ldesign-draggable__content': true, 'is-dragging': this.dragging, 'is-gesturing': this.gesturing } as any}
              src={this.src} alt={this.alt || ''} draggable={false} onLoad={this.onImageLoad}
              style={{ transform: this.getTransformStringInternal() }} />
          ) : (
            <div class={{ 'ldesign-draggable__content': true, 'is-dragging': this.dragging, 'is-gesturing': this.gesturing } as any}
              ref={el => (this.contentEl = el as HTMLElement)} style={{ transform: this.getTransformStringInternal() }}>
              <slot />
            </div>
          )}

          {/* 缩放/旋转指示器 */}
          {this.showIndicators && (
            <div class="ldesign-draggable__indicators">
              <div class="ldesign-draggable__indicator">
                <span class="ldesign-draggable__indicator-label">缩放</span>
                <span class="ldesign-draggable__indicator-value">{(this.scale * 100).toFixed(0)}%</span>
              </div>
              {this.enableRotate && this.rotate !== 0 && (
                <div class="ldesign-draggable__indicator">
                  <span class="ldesign-draggable__indicator-label">旋转</span>
                  <span class="ldesign-draggable__indicator-value">{this.rotate.toFixed(0)}°</span>
                </div>
              )}
            </div>
          )}

          {/* 性能监控 */}
          {this.showPerformance && (
            <div class="ldesign-draggable__performance">
              <span>FPS: {this.fps}</span>
            </div>
          )}

          {/* 缩略图导航 */}
          {this.showMinimap && (
            <div class={`ldesign-draggable__minimap ldesign-draggable__minimap--${this.minimapPosition}`}
              onClick={this.onMinimapClick}
            >
              <div class="ldesign-draggable__minimap-content">
                {this.src ? (
                  <img src={this.src} alt="minimap" />
                ) : (
                  <div class="ldesign-draggable__minimap-placeholder">预览</div>
                )}
              </div>
              <div class="ldesign-draggable__minimap-viewport" 
                style={this.getMinimapViewportStyle()}
              />
            </div>
          )}

          {/* 预设视角 */}
          {this.presetViews && this.presetViews.length > 0 && (
            <div class="ldesign-draggable__presets">
              {this.presetViews.map((view, index) => (
                <button 
                  class="ldesign-draggable__preset-btn" 
                  onClick={() => this.goToPresetView(index)}
                  title={view.name}
                >
                  {view.name}
                </button>
              ))}
            </div>
          )}

          <div class={this.getControlsClass()} onPointerDown={this.stopEvent} onMouseDown={this.stopEvent} onTouchStart={this.stopEvent}>
            <slot name="controls">
              {this.showControls ? (
                <div class="ldesign-draggable__controls-inner">
                  <button class="ldesign-draggable__btn" aria-label="Zoom In" onClick={() => this.zoomIn()}>+</button>
                  <button class="ldesign-draggable__btn" aria-label="Zoom Out" onClick={() => this.zoomOut()}>−</button>
                  <button class="ldesign-draggable__btn" aria-label="Fit Contain" onClick={() => this.fitContain()}>□</button>
                  <button class="ldesign-draggable__btn" aria-label="Fit Cover" onClick={() => this.fitCover()}>■</button>
                  <button class="ldesign-draggable__btn" aria-label="Rotate Left" onClick={() => this.rotateBy(-90)}>⟲</button>
                  <button class="ldesign-draggable__btn" aria-label="Rotate Right" onClick={() => this.rotateBy(90)}>⟳</button>
                  <button class="ldesign-draggable__btn" aria-label="Reset" onClick={() => this.reset()}>↺</button>
                  {this.enableHistory && [
                    <button 
                      class={`ldesign-draggable__btn ${!this.canUndo ? 'is-disabled' : ''}`}
                      aria-label="Undo" 
                      onClick={() => this.canUndo && this.undo()}
                      aria-disabled={!this.canUndo}
                    >↶</button>,
                    <button 
                      class={`ldesign-draggable__btn ${!this.canRedo ? 'is-disabled' : ''}`}
                      aria-label="Redo" 
                      onClick={() => this.canRedo && this.redo()}
                      aria-disabled={!this.canRedo}
                    >↷</button>
                  ]}
                  {this.enableGrid !== undefined && (
                    <button 
                      class={`ldesign-draggable__btn ${this.enableGrid ? 'is-active' : ''}`}
                      aria-label="Toggle Grid" 
                      onClick={() => this.toggleGrid()}
                    >⊞</button>
                  )}
                </div>
              ) : null}
            </slot>
          </div>
        </div>
      </Host>
    );
  }

  private getControlsClass() {
    const base = 'ldesign-draggable__controls';
    const pos = this.controlsPosition || 'top-right';
    return `${base} ${base}--${pos}`;
  }

  private stopEvent = (e: Event) => { e.stopPropagation(); };

  private onMinimapClick = (e: MouseEvent) => {
    if (!this.canvasEl || !this.showMinimap) return;
    e.stopPropagation();
    
    const minimap = e.currentTarget as HTMLElement;
    const rect = minimap.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;
    
    // 获取舞台和内容尺寸
    const stageW = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const stageH = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    const contentW = this.baseWidth * this.scale;
    const contentH = this.baseHeight * this.scale;
    
    // 计算目标偏移
    // 将点击位置从 0-1 映射到实际偏移范围
    let targetX = 0;
    let targetY = 0;
    
    if (contentW > stageW) {
      const maxOffsetX = (contentW - stageW) / 2;
      // 点击位置 0.5 对应偏移 0
      // 点击位置 0 对应最大负偏移（显示左边）
      // 点击位置 1 对应最大正偏移（显示右边）
      targetX = -(clickX - 0.5) * 2 * maxOffsetX;
    }
    
    if (contentH > stageH) {
      const maxOffsetY = (contentH - stageH) / 2;
      targetY = -(clickY - 0.5) * 2 * maxOffsetY;
    }
    
    // 应用边界限制
    const b = this.getPanBounds();
    const finalX = Math.min(b.maxX, Math.max(b.minX, targetX));
    const finalY = Math.min(b.maxY, Math.max(b.minY, targetY));
    
    // 动画过渡到目标位置
    this.animateToState(this.scale, this.rotate, finalX, finalY);
  };

  private getViewportWidth(): number {
    const sw = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    return Math.max(sw, this.baseWidth * this.scale);
  }

  private getViewportHeight(): number {
    const sh = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    return Math.max(sh, this.baseWidth * this.scale);
  }

  private getMinimapViewportStyle(): any {
    // 获取舞台和内容尺寸
    const stageW = this.stageWidth || (this.canvasEl?.getBoundingClientRect().width || 0);
    const stageH = this.stageHeight || (this.canvasEl?.getBoundingClientRect().height || 0);
    
    if (!stageW || !stageH || !this.baseWidth || !this.baseHeight) {
      return {
        display: 'none'
      };
    }

    // 计算缩放后的内容尺寸
    const contentW = this.baseWidth * this.scale;
    const contentH = this.baseHeight * this.scale;
    
    // 计算视口框的尺寸（相对于缩略图的百分比）
    const viewportW = Math.min(100, (stageW / contentW) * 100);
    const viewportH = Math.min(100, (stageH / contentH) * 100);
    
    // 计算视口框的位置
    // 当内容小于舞台时，居中显示
    // 当内容大于舞台时，根据偏移计算位置
    let left = 50;
    let top = 50;
    
    if (contentW > stageW) {
      // 计算可拖动范围
      const maxOffsetX = (contentW - stageW) / 2;
      // 将偏移映射到百分比（-50% 到 50%）
      const offsetPercentX = (this.offsetX / maxOffsetX) * ((100 - viewportW) / 2);
      left = 50 - offsetPercentX;
    }
    
    if (contentH > stageH) {
      const maxOffsetY = (contentH - stageH) / 2;
      const offsetPercentY = (this.offsetY / maxOffsetY) * ((100 - viewportH) / 2);
      top = 50 - offsetPercentY;
    }
    
    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${viewportW}%`,
      height: `${viewportH}%`,
      transform: `translate(-50%, -50%) rotate(${-this.rotate}deg)`
    };
  }

  componentDidRender() {
    // 首次渲染时，若使用 src，contentEl 指向 img；否则使用 div 容器
    if (this.src && this.imgEl) {
      this.contentEl = this.imgEl as any;
      // 避免 TSX 类型不兼容，运行时补充 referrerpolicy 属性
      try { this.imgEl.setAttribute('referrerpolicy', 'no-referrer'); } catch {}
    }
    if (!this.baseWidth || !this.baseHeight) this.measureBaseSize();
  }
}

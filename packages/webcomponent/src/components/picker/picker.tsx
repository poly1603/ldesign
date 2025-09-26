import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch, Method } from '@stencil/core';

export interface PickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * ldesign-picker
 * 通用滚轮选择器（单列）
 * - PC：鼠标滚轮按“行”步进，按速度取整步数
 * - 移动端：手势滑动（Pointer Events）+ 惯性 + 吸附到最近项
 * - 支持配置容器高度与每项高度；容器通常为 itemHeight 的奇数倍（3/5/7...）
 * - 正中间指示器高度与子项一致
 */
@Component({ tag: 'ldesign-picker', styleUrl: 'picker.less', shadow: false })
export class LdesignPicker {
  @Element() el!: HTMLElement;

  /** 选项列表（数组或 JSON 字符串） */
  @Prop() options: string | PickerOption[] = [];
  /** 当前值（受控） */
  @Prop({ mutable: true }) value?: string;
  /** 默认值（非受控） */
  @Prop() defaultValue?: string;

  /** 是否禁用 */
  @Prop() disabled: boolean = false;
  /** 尺寸，影响每行高度 */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';
  /** 可视高度（优先），未设置时使用 visibleItems * itemHeight */
  @Prop() panelHeight?: number;
  /** 可视条目数（未显式 panelHeight 时生效，建议奇数：3/5/7） */
  @Prop() visibleItems: number = 5;
  /** 行高（自动根据 size 推导，亦可显式覆盖） */
  @Prop() itemHeight?: number;
  /** 惯性摩擦 0-1（越小减速越快） */
  @Prop() friction: number = 0.92;
  /** 边界阻力系数 0-1（越小阻力越大） */
  @Prop() resistance: number = 0.35;
  /** 最大橡皮筋越界（像素）。优先级高于比例 */
  @Prop() maxOverscroll?: number;
  /** 最大橡皮筋越界比例（相对于容器高度 0-1）。当未提供像素值时生效；未设置则默认 0.5（即容器高度的一半） */
  @Prop() maxOverscrollRatio?: number;
  /** 是否启用惯性 */
  @Prop() momentum: boolean = true;
  /** 吸附/回弹动画时长（毫秒，适用于触摸/键盘/滚动吸附），未设置默认 260ms */
  @Prop() snapDuration?: number;
  /** 滚轮专用吸附动画时长（毫秒），未设置默认 150ms */
  @Prop() snapDurationWheel?: number;
  /** 手势拖拽跟随比例（0-1），1 表示 1:1 跟手，越小阻力越大，默认 1 */
  @Prop() dragFollow: number = 1;
  /** 手势拖拽平滑时间常数（毫秒），>0 时使用一阶平滑使位移逐步接近手指，营造“越来越慢”的阻力感，默认 0（关闭） */
  @Prop() dragSmoothing?: number;

  /** 选中项变化（最终吸附后触发） */
  @Event() ldesignChange!: EventEmitter<{ value: string | undefined; option?: PickerOption }>;
  /** 选择过程事件（滚动/拖拽中也会触发） */
  @Event() ldesignPick!: EventEmitter<{ value: string | undefined; option?: PickerOption; context: { trigger: 'click' | 'scroll' | 'touch' | 'wheel' | 'keyboard' } }>;

  @State() parsed: PickerOption[] = [];
  @State() current: string | undefined; // 最终值
  @State() visual: string | undefined;  // 交互过程显示值

  private listEl?: HTMLElement;     // 作为 transform 轨道的元素（ul）
  private containerEl?: HTMLElement; // 外层容器（用于精确测量高度）
  private itemH = 36;
  private actualItemHeight?: number; // 实际渲染后的项目高度
  private lastDragTime = 0; // 上一次 pointermove 的时间，用于平滑计算

  // 轨道 transform Y（px），正向为下
  private trackY = 0;

  // 动画/惯性
  private snapAnim: { raf: number; start: number; from: number; to: number; duration: number; idx: number; trigger?: 'click' | 'wheel' | 'keyboard' | 'touch' | 'scroll'; silent: boolean } | null = null;
  private inertia: { raf?: number; v: number; last: number } | null = null;

  // 指针拖动
  private isPointerDown = false;
  private isDragging = false;
  private tapCandidate = false;
  private startY = 0;
  private startTrackY = 0;
  private startTime = 0;
  private velocitySamples: { t: number; y: number }[] = [];
  private readonly dragThreshold = 4; // px 用于区分点击与拖动

  // 鼠标滚轮累积
  private lastWheelTime = 0; // ms
  private wheelAccumLines = 0;

  /* ---------------- lifecycle & props ---------------- */
  @Watch('options') watchOptions(val: string | PickerOption[]) {
    this.parsed = this.parseOptions(val);
    requestAnimationFrame(() => {
      this.measureActualItemHeight();
      this.centerCurrent(false);
    });
  }

  @Watch('value')
  onValueChange(v: string | undefined) {
    if (v === this.current) return;
    this.current = v;
    this.visual = v;
    requestAnimationFrame(() => {
      const idx = this.getIndexByValue(v);
      if (idx >= 0) {
        this.setIndex(idx, { animate: true, silent: true });
      }
    });
  }

  componentWillLoad() {
    this.parsed = this.parseOptions(this.options);
    this.current = this.value !== undefined ? this.value : this.defaultValue;
    if ((this.current == null || this.current === '') && this.parsed.length > 0) {
      this.current = this.parsed[0].value; // 默认第一个在中间
    }
    this.visual = this.current;
    // 计算初始位置，确保选中项居中
    const idx0 = this.getIndexByValue(this.current);
    const validIdx = this.clampIndex(idx0 >= 0 ? idx0 : 0);
    const enabledIdx = this.firstEnabledFrom(validIdx);
    this.trackY = this.yForIndex(enabledIdx);
  }

  componentDidLoad() {
    // 确保DOM完全渲染后进行初始化
    requestAnimationFrame(() => {
      // 测量实际的项目高度
      this.measureActualItemHeight();
      // 重新计算位置，确保使用实际测量的高度
      const idx = this.getIndexByValue(this.current);
      const validIdx = this.clampIndex(idx >= 0 ? idx : 0);
      const enabledIdx = this.firstEnabledFrom(validIdx);
      const y = this.yForIndex(enabledIdx);
      this.setTrackTransform(y, false);
      this.visual = this.parsed[enabledIdx]?.value;
      // 确保 current 也更新为有效值
      if (this.current !== this.visual) {
        this.current = this.visual;
      }
    });
    window.addEventListener('resize', this.onResize);
    
    // 阻止页面滚动
    if (this.containerEl) {
      this.containerEl.addEventListener('touchmove', this.preventPageScroll, { passive: false });
    }
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.onResize);
    if (this.containerEl) {
      this.containerEl.removeEventListener('touchmove', this.preventPageScroll);
    }
  }

  /* ---------------- computed ---------------- */
  private parseOptions(val: string | PickerOption[]): PickerOption[] {
    if (typeof val === 'string') {
      try { const arr = JSON.parse(val); return Array.isArray(arr) ? arr : []; } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  }

  private get itemHeightBySize(): number {
    // 优先使用实际测量的高度
    if (this.actualItemHeight && this.actualItemHeight > 0) {
      return this.actualItemHeight;
    }
    // 其次使用配置的高度
    if (this.itemHeight && this.itemHeight > 0) return this.itemHeight;
    // 最后使用默认值
    switch (this.size) {
      case 'small': return 32;
      case 'large': return 40;
      default: return 36;
    }
  }
  
  private measureActualItemHeight() {
    if (!this.listEl) return;
    
    // 临时重置transform以获取准确测量
    const savedTransform = this.listEl.style.transform;
    this.listEl.style.transform = 'none';
    
    const items = this.listEl.querySelectorAll('li');
    if (items.length >= 2) {
      // 测量两个相邻项目顶部之间的距离（即实际的行高）
      const first = items[0] as HTMLElement;
      const second = items[1] as HTMLElement;
      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      
      // 使用精确浮点值，不做取整，避免累计误差
      const actualSpacing = (secondRect.top - firstRect.top);
      
      if (actualSpacing > 0) {
        this.actualItemHeight = actualSpacing;
      } else {
        this.actualItemHeight = firstRect.height;
      }
    } else if (items.length === 1) {
      const first = items[0] as HTMLElement;
      const rect = first.getBoundingClientRect();
      this.actualItemHeight = rect.height;
    }
    
    // 恢复transform
    this.listEl.style.transform = savedTransform;
  }

  private get panelHeightPx() {
    return this.panelHeight || (this.itemHeightBySize * this.visibleItems);
  }

  private get maxOverscrollPx() {
    // 1) 明确像素优先
    const px = this.maxOverscroll;
    if (typeof px === 'number' && isFinite(px) && px >= 0) return px;
    // 2) 比例（相对于容器高度）
    const ratio = this.maxOverscrollRatio;
    const panel = this.panelHeightPx;
    if (typeof ratio === 'number' && isFinite(ratio) && ratio >= 0) return panel * ratio;
    // 3) 默认：容器高度的一半（满足你的期望）
    return panel / 2;
  }

  private get dragFollowGain() {
    const v = this.dragFollow;
    if (typeof v === 'number' && isFinite(v)) return Math.max(0, Math.min(1, v));
    return 1;
  }

  private get centerOffset() {
    // 使用实际容器高度
    const h = this.containerEl?.clientHeight ?? this.panelHeightPx;
    // 使用实际的项目高度
    const itemH = this.itemHeightBySize;
    // 计算容器中心的Y坐标，这是list需要偏移的基准点
    // 当第0项在中心时，列表顶部应该在 (h/2 - itemHeight/2) 的位置
    return (h - itemH) / 2; // 不取整，保持精度
  }
  
  private preventPageScroll = (e: TouchEvent) => {
    // 移动端触摸时阻止页面滚动
    if (this.isPointerDown) {
      e.preventDefault();
    }
  };

  private getIndexByValue(v?: string): number {
    if (v == null) return -1;
    return this.parsed.findIndex(o => o.value === v);
  }

  private clampIndex(i: number) {
    const n = this.parsed.length;
    if (n <= 0) return 0;
    return Math.max(0, Math.min(n - 1, Math.round(i)));
  }

  private firstEnabledFrom(i: number) {
    const n = this.parsed.length;
    if (n === 0) return 0;
    let best = i;
    for (let r = 0; r < n; r++) {
      const a = i - r; const b = i + r;
      if (a >= 0 && !this.parsed[a]?.disabled) { best = a; break; }
      if (b < n && !this.parsed[b]?.disabled) { best = b; break; }
    }
    return this.clampIndex(best);
  }

  private yForIndex(i: number) {
    // 计算让第 i 项居中时的 Y 坐标（使用浮点数，最后在设置 transform 时再取整）
    const itemH = this.itemHeightBySize;
    return this.centerOffset - i * itemH;
  }

  /* ---------------- emit helpers ---------------- */
  private getOptionByValue(v?: string): PickerOption | undefined {
    if (v == null) return undefined;
    return this.parsed.find(o => o.value === v);
  }

  private emitPick(trigger: 'click' | 'scroll' | 'touch' | 'wheel' | 'keyboard') {
    const val = this.visual ?? this.current;
    const opt = this.getOptionByValue(val);
    this.ldesignPick.emit({ value: val, option: opt, context: { trigger } });
  }

  private commitValue(v?: string) {
    if (this.value !== undefined) {
      // 受控组件：只发事件
      this.ldesignChange.emit({ value: v, option: this.getOptionByValue(v) });
    } else {
      this.current = v;
      this.value = v as any;
      this.ldesignChange.emit({ value: v, option: this.getOptionByValue(v) });
    }
  }

  /* ---------------- core movement ---------------- */
  private getBounds() {
    const itemH = this.itemHeightBySize;
    const maxY = this.centerOffset; // 第0项居中时的Y值（最上限）
    const minY = this.centerOffset - (this.parsed.length - 1) * itemH; // 最后一项居中时的Y值（最下限）
    return { itemH, minY, maxY };
  }

  private rubberBand(over: number, dim: number, c: number) {
    const sign = over < 0 ? -1 : 1;
    const x = Math.abs(over);
    // 经典 rubber-band 公式：趋于 dim 上限，c 越小阻力越大（更硬）
    const result = (dim * c * x) / (dim + c * x);
    return sign * result;
  }

  private setTrackTransform(y: number, animate = false, mode: 'normal' | 'drag' | 'inertia' = 'normal') {
    if (!this.listEl || this.parsed.length === 0) return;

    const { itemH, minY, maxY } = this.getBounds();

    // 允许在拖拽/惯性阶段出现受限的弹性越界；编程/步进阶段严格钳制
    const allowElastic = mode === 'drag' || mode === 'inertia';
    const maxOverscroll = this.maxOverscrollPx; // 可配置的最大越界距离（像素）

    let nextY = y;
    if (!allowElastic) {
      // 严格限制在可用范围内（不会出现越界视觉）
      nextY = Math.max(minY, Math.min(maxY, y));
    } else {
      if (y > maxY) {
        // 顶部越界：橡皮筋压缩
        const over = y - maxY;
        const dim = this.panelHeightPx; // 使用容器高度作为弹性参考长度
        const c = Math.min(0.95, Math.max(0.05, this.resistance));
        const rb = this.rubberBand(over, dim, c);
        nextY = maxY + Math.min(maxOverscroll, rb);
      } else if (y < minY) {
        // 底部越界：橡皮筋压缩
        const over = y - minY; // 负值
        const dim = this.panelHeightPx;
        const c = Math.min(0.95, Math.max(0.05, this.resistance));
        const rb = this.rubberBand(over, dim, c);
        nextY = minY + Math.max(-maxOverscroll, rb);
      }
    }

    // 取整，保持像素对齐；拖拽中也取整即可，跟手感主要来自 1:1 位移而非亚像素
    const appliedY = Math.round(nextY);

    if (Math.abs(this.trackY - appliedY) < 0.01) {
      return;
    }

    this.trackY = appliedY;
    const el = this.listEl as HTMLElement;
    el.style.willChange = 'transform';
    el.style.transition = animate ? 'transform 200ms cubic-bezier(0.22,0.61,0.36,1)' : 'none';
    el.style.transform = `translate3d(0, ${appliedY}px, 0)`;

    // 更新视觉状态（四舍五入到最近项）
    const currentFloat = (this.centerOffset - appliedY) / itemH;
    const currentIdx = Math.max(0, Math.min(this.parsed.length - 1, Math.round(currentFloat)));
    const newVisual = this.parsed[currentIdx]?.value;
    if (newVisual !== this.visual) {
      this.visual = newVisual;
    }
  }

  private cancelSnapAnim() { if (this.snapAnim?.raf) cancelAnimationFrame(this.snapAnim.raf); this.snapAnim = null; }
  private cancelInertia() { if (this.inertia?.raf) cancelAnimationFrame(this.inertia.raf as number); this.inertia = null; }
  private easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

  private startSnapAnim(idx: number, opts?: { trigger?: 'click' | 'wheel' | 'keyboard' | 'touch' | 'scroll'; silent?: boolean }) {
    if (!this.listEl) return;
    this.cancelInertia();
    this.cancelSnapAnim();

    // 确保索引在有效范围内
    const safeIdx = this.clampIndex(idx);
    
    const from = this.trackY;
    const to = this.yForIndex(safeIdx);
    
    // 检查目标位置是否在合法范围内
    const maxY = this.centerOffset;
    const minY = this.centerOffset - (this.parsed.length - 1) * this.itemHeightBySize;
    
    console.log('🎬 startSnapAnim:', {
      idx,
      safeIdx,
      from,
      to,
      trigger: opts?.trigger,
      bounds: { maxY, minY },
      isToInBounds: to <= maxY && to >= minY
    });
    
    // 如果目标位置超出边界，直接返回
    if (to > maxY || to < minY) {
      console.error('❌ snapAnim target out of bounds!', { to, maxY, minY });
      return;
    }
    
    // 根据触发源调整动画时长；提供可配置项，默认触摸/键盘/滚动 260ms，滚轮 150ms（更灵敏）
    const dWheel = (typeof this.snapDurationWheel === 'number' && isFinite(this.snapDurationWheel) && this.snapDurationWheel! > 0) ? this.snapDurationWheel! : 150;
    const dDefault = (typeof this.snapDuration === 'number' && isFinite(this.snapDuration) && this.snapDuration! > 0) ? this.snapDuration! : 260;
    const duration = opts?.trigger === 'wheel' ? dWheel : dDefault;
    const start = performance.now();
    const state = { raf: 0, start, from, to, duration, idx: safeIdx, trigger: opts?.trigger, silent: !!opts?.silent };
    this.snapAnim = state as any;

    const step = (now: number) => {
      if (!this.snapAnim) return;
      const t = Math.max(0, Math.min(1, (now - state.start) / state.duration));
      const y = state.from + (state.to - state.from) * this.easeOutCubic(t);
      this.setTrackTransform(y, false);

      // 实时视觉项
      const idxLive = this.clampIndex((this.centerOffset - y) / this.itemHeightBySize);
      const vLive = this.parsed[idxLive]?.value;
      if (vLive !== this.visual) this.visual = vLive;

      if (t >= 1) {
        // 结束时精确吸附到目标位置（state.to 已经是整数）
        this.setTrackTransform(state.to, false, 'normal');
        
        const nextVal = this.parsed[state.idx]?.value;
        this.visual = nextVal;
        if (nextVal !== this.current) {
          this.current = nextVal;
          if (!state.silent) { this.emitPick(state.trigger || 'scroll'); this.commitValue(nextVal); }
        } else {
          if (!state.silent && state.trigger) this.emitPick(state.trigger);
        }
        this.snapAnim = null;
        return;
      }
      this.snapAnim.raf = requestAnimationFrame(step);
    };
    state.raf = requestAnimationFrame(step);
  }

  // 此函数不再需要，因为我们已经使用精确的数学计算
  private correctToExactCenter(idx: number) {
    // deprecated
  }

  private setIndex(i: number, opts?: { animate?: boolean; silent?: boolean; trigger?: 'click' | 'wheel' | 'keyboard' | 'touch' | 'scroll' }) {
    if (!this.listEl || this.parsed.length === 0) return;
    
    console.log('🎰 setIndex called:', {
      inputIndex: i,
      opts,
      currentTrackY: this.trackY
    });
    
    // 严格限制索引范围 [0, length-1]
    const idx = this.clampIndex(i);
    const enabledIdx = this.firstEnabledFrom(idx);
    
    console.log('🎰 Index processing:', {
      clampedIdx: idx,
      enabledIdx,
      parsedLength: this.parsed.length
    });
    
    // 精确检查是否已经在目标位置（基于实际Y坐标）
    const targetY = this.yForIndex(enabledIdx);
    const tolerance = 0.5; // 允许0.5像素的误差
    
    // 只有在不是动画模式且已经在目标位置时才跳过
    if (opts?.animate === false && Math.abs(this.trackY - targetY) < tolerance) {
      console.log('🔒 Already at target, skipping');
      // 更新视觉状态确保一致
      this.visual = this.parsed[enabledIdx]?.value;
      return;
    }
    
    // 如果需要动画，用 snapAnim；否则直接设置
    if (opts?.animate !== false) {
      console.log('🎬 Starting snap animation to index:', enabledIdx);
      this.startSnapAnim(enabledIdx, { trigger: opts?.trigger, silent: !!opts?.silent });
    } else {
      const y = this.yForIndex(enabledIdx);
      console.log('🚀 Direct set to Y:', y);
      this.setTrackTransform(y, false, 'normal');
      const nextVal = this.parsed[enabledIdx]?.value;
      this.visual = nextVal;
      if (nextVal !== this.current) {
        this.current = nextVal;
        if (!opts?.silent) { this.emitPick(opts?.trigger || 'scroll'); this.commitValue(nextVal); }
      }
    }
  }

  /* ---------------- wheel ---------------- */
  private onWheel = (e: WheelEvent) => {
    if (this.disabled || !this.listEl || this.parsed.length === 0) return;
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡，防止页面滚动

    // 如果正在动画中，先取消当前动画
    this.cancelSnapAnim();
    this.cancelInertia();

    // 边界与当前位置
    const itemH = this.itemHeightBySize;
    const maxY = this.centerOffset; // 顶部边界（第0项）
    const minY = this.centerOffset - (this.parsed.length - 1) * itemH; // 底部边界（最后一项）

    // 先做基于位置的“方向越界短路”，更鲁棒，不依赖索引取整
    const towardTop = e.deltaY < 0;   // 想向上滚
    const towardBottom = e.deltaY > 0; // 想向下滚
    const atTop = this.trackY >= maxY - 0.5;
    const atBottom = this.trackY <= minY + 0.5;
    if ((towardTop && atTop) || (towardBottom && atBottom)) {
      const boundaryY = towardTop ? maxY : minY;
      console.log('🧱 Wheel blocked by positional boundary', { towardTop, towardBottom, atTop, atBottom, boundaryY });
      this.setTrackTransform(boundaryY, false, 'normal'); // 硬对齐边界
      return;
    }

    // 根据当前的 trackY 精确判断索引
    const currentFloat = (this.centerOffset - this.trackY) / itemH;
    const currentIdx = Math.round(currentFloat);
    
    // 调试：打印关键信息
    console.log('🎯 onWheel Debug:', {
      deltaY: e.deltaY,
      currentFloat,
      currentIdx,
      trackY: this.trackY,
      centerOffset: this.centerOffset,
      itemHeight: itemH,
      parsedLength: this.parsed.length,
      firstY: this.yForIndex(0),
      lastY: this.yForIndex(this.parsed.length - 1)
    });
    
    // 计算步数
    let steps = 0;
    if (e.deltaMode === 1) {
      steps = Math.round(e.deltaY);
    } else {
      const delta = Math.abs(e.deltaY);
      const sign = e.deltaY > 0 ? 1 : -1;
      if (delta < 20) {
        this.wheelAccumLines += e.deltaY / itemH;
        if (Math.abs(this.wheelAccumLines) >= 1) {
          steps = Math.floor(Math.abs(this.wheelAccumLines)) * (this.wheelAccumLines > 0 ? 1 : -1);
          this.wheelAccumLines = this.wheelAccumLines % 1;
        }
      } else {
        steps = sign;
        this.wheelAccumLines = 0;
      }
    }
    
    if (steps === 0) {
      console.log('⏸️ No steps to take');
      return;
    }
    
    // 计算目标索引
    const targetIdx = currentIdx + steps;
    const clampedTargetIdx = this.clampIndex(targetIdx);
    
    console.log('📍 Position Check:', {
      currentIdx,
      steps,
      targetIdx,
      clampedTargetIdx,
      isAtBoundary: clampedTargetIdx === currentIdx
    });
    
    if (clampedTargetIdx === currentIdx) {
      console.log('🛑 BLOCKED: Already at boundary, no movement');
      const exactY = this.yForIndex(currentIdx);
      if (Math.abs(this.trackY - Math.round(exactY)) > 0.5) {
        this.setTrackTransform(exactY, false);
      }
      return;
    }
    
    // 正常滚动到目标索引
    console.log('➡️ Normal scroll from', currentIdx, 'to', clampedTargetIdx);
    this.setIndex(clampedTargetIdx, { animate: true, trigger: 'wheel' });
  };

  /* ---------------- pointer/gesture ---------------- */
  private onPointerDown = (e: PointerEvent) => {
    if (this.disabled || !this.listEl) return;
    e.preventDefault(); // 防止触发默认的滚动行为、阻止 click 默认
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    this.isPointerDown = true;
    this.isDragging = false;
    this.tapCandidate = true;
    this.startTime = performance.now();

    this.cancelInertia();
    this.cancelSnapAnim(); // 取消进行中的动画

    this.startY = e.clientY;
    this.startTrackY = this.trackY;
    this.lastDragTime = performance.now();
    this.velocitySamples = [{ t: performance.now(), y: e.clientY }];
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown || !this.listEl) return;
    e.preventDefault();
    const dy = e.clientY - this.startY;

    // 拖动阈值：小于阈值判定为点击候选，不移动轨道
    if (!this.isDragging && Math.abs(dy) < this.dragThreshold) {
      // 更新速度样本以便松手时仍有 tap 逻辑
      const now0 = performance.now();
      this.velocitySamples.push({ t: now0, y: e.clientY });
      while (this.velocitySamples.length > 2 && (now0 - this.velocitySamples[0].t) > 120) this.velocitySamples.shift();
      return;
    }
    this.isDragging = true;
    this.tapCandidate = false;

    // 跟随手指位移基础目标（可配置跟随比例）
    const target = this.startTrackY + dy * this.dragFollowGain;

    // 时间平滑：一阶滤波逐步接近手指位置，营造“越来越慢”的阻力感
    const nowTs = performance.now();
    const dt = Math.max(0, nowTs - this.lastDragTime);
    this.lastDragTime = nowTs;
    const tau = (typeof this.dragSmoothing === 'number' && isFinite(this.dragSmoothing) && this.dragSmoothing! > 0) ? this.dragSmoothing! : 0;
    const alpha = tau > 0 ? (1 - Math.exp(-dt / tau)) : 1; // 0-1
    const next = this.trackY + (target - this.trackY) * alpha;

    // 使用 setTrackTransform 的弹性模式统一处理越界（rubber-band）
    this.setTrackTransform(next, false, 'drag');

    // 实时视觉选中
    const rawIdx = (this.centerOffset - this.trackY) / this.itemHeightBySize;
    const idx = Math.max(0, Math.min(this.parsed.length - 1, Math.round(rawIdx)));
    const v = this.parsed[idx]?.value;
    if (v !== this.visual) { this.visual = v; this.emitPick('touch'); }

    // 速度样本
    const now = performance.now();
    this.velocitySamples.push({ t: now, y: e.clientY });
    while (this.velocitySamples.length > 2 && (now - this.velocitySamples[0].t) > 150) this.velocitySamples.shift();
  };

  private estimateVelocity(): number {
    if (this.velocitySamples.length < 2) return 0;
    // 使用最小二乘拟合求斜率，更稳健（px/ms）
    const n = this.velocitySamples.length;
    const meanT = this.velocitySamples.reduce((s, p) => s + p.t, 0) / n;
    const meanY = this.velocitySamples.reduce((s, p) => s + p.y, 0) / n;
    let num = 0, den = 0;
    for (const p of this.velocitySamples) {
      const dt = p.t - meanT;
      num += dt * (p.y - meanY);
      den += dt * dt;
    }
    if (den === 0) return 0;
    const slope = num / den; // px/ms
    return slope;
  }

  private startInertiaTransform(v0: number) {
    if (!this.momentum) { 
      const floatIdx = (this.centerOffset - this.trackY) / this.itemHeightBySize;
      const idx = this.clampIndex(Math.round(floatIdx));
      this.setIndex(idx, { animate: true }); 
      return; 
    }
    this.cancelInertia();
    // 速度单位统一为 px/ms，去掉过小的速度上限以保留更自然的甩动感，但设定合理的上限避免异常值
    const maxV = 5; // px/ms（约 300px/s）
    const state = { v: Math.max(-maxV, Math.min(maxV, v0)), last: performance.now(), raf: 0 } as { v: number; last: number; raf: number };
    this.inertia = state as any;

    const step = (now: number) => {
      if (!this.inertia) return;
      const dt = Math.max(1, now - state.last); // ms
      state.last = now;

      // 使用 px/ms 的速度积分位移：x += v * dt
      let next = this.trackY + state.v * dt;

      const { minY, maxY } = this.getBounds();
      const maxOverscroll = this.maxOverscrollPx;

      // 边界的“弹簧”回拉效果 + 橡皮筋跟随，避免瞬间硬夹
      if (next > maxY) {
        const over = next - maxY;
        const dim = this.panelHeightPx;
        const c = Math.min(0.95, Math.max(0.05, this.resistance));
        const rb = this.rubberBand(over, dim, c);
        next = maxY + Math.min(maxOverscroll, rb);
        // 弹簧回拉加速度（越深越强），单位近似 px/ms^2
        const springK = 0.002 + (1 - c) * 0.003; // resistance 越小，回拉越强
        state.v += (-springK * over) * dt;
        // 越界强阻尼，避免无限漂移
        state.v *= 0.75;
      } else if (next < minY) {
        const over = next - minY; // 负值（向上越界）
        const dim = this.panelHeightPx;
        const c = Math.min(0.95, Math.max(0.05, this.resistance));
        const rb = this.rubberBand(over, dim, c);
        next = minY + Math.max(-maxOverscroll, rb);
        const springK = 0.002 + (1 - c) * 0.003;
        state.v += (-springK * over) * dt;
        state.v *= 0.75;
      }

      this.setTrackTransform(next, false, 'inertia');

      // 实时高亮
      const floatIdx = (this.centerOffset - this.trackY) / this.itemHeightBySize;
      const idxLive = this.clampIndex(Math.round(floatIdx));
      const vLive = this.parsed[idxLive]?.value;
      if (vLive !== this.visual) this.visual = vLive;

      // 摩擦衰减（指数），值越接近1惯性越长；建议 friction 取 0.97~0.995 更接近原生手感
      state.v *= Math.pow(this.friction, dt / 16.67);

      // 终止条件：速度足够小，或者已经非常接近某一项中心
      const nearlyStopped = Math.abs(state.v) < 0.02;
      const finalFloat = (this.centerOffset - this.trackY) / this.itemHeightBySize;
      const idxFinal = this.clampIndex(Math.round(finalFloat));
      const targetY = this.yForIndex(idxFinal);
      const nearSnap = Math.abs(this.trackY - targetY) <= 0.5;

      if (nearlyStopped || nearSnap) {
        this.setIndex(idxFinal, { animate: true, trigger: 'scroll' });
        this.inertia = null;
        return;
      }
      state.raf = requestAnimationFrame(step);
    };
    state.raf = requestAnimationFrame(step);
  }

  private onPointerUp = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    const wasDragging = this.isDragging;
    this.isDragging = false;

    if (!this.listEl) return;

    // 点击（轻触）选择：当未发生明显拖动时，选中触点所在的项
    if (this.tapCandidate) {
      this.tapCandidate = false;
      const el = (e.target as HTMLElement)?.closest('li');
      if (el && this.listEl.contains(el)) {
        const idxAttr = (el as HTMLElement).getAttribute('data-index');
        const idxNum = idxAttr ? parseInt(idxAttr, 10) : NaN;
        if (!Number.isNaN(idxNum)) {
          this.setIndex(idxNum, { animate: true, trigger: 'touch' });
          return;
        }
      }
    }

    // 拖动释放：根据速度决定是否惯性，否则就近吸附
    const currentFloat = (this.centerOffset - this.trackY) / this.itemHeightBySize;
    const idx = this.clampIndex(Math.round(currentFloat));
    
    const v0 = this.estimateVelocity();
    if (wasDragging && this.momentum && Math.abs(v0) > 0.1) {
      this.startInertiaTransform(v0);
      this.emitPick('touch');
      return;
    }
    
    this.setIndex(idx, { animate: true, trigger: 'touch' });
  };

  /* ---------------- keyboard ---------------- */
  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.listEl || this.disabled) return;
    const idxFloat = (this.centerOffset - this.trackY) / this.itemHeightBySize;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.setIndex(this.clampIndex(idxFloat) + 1, { animate: true, trigger: 'keyboard' }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.setIndex(this.clampIndex(idxFloat) - 1, { animate: true, trigger: 'keyboard' }); }
    else if (e.key === 'Enter') { e.preventDefault(); this.commitValue(this.visual ?? this.current); }
  };

  /* ---------------- util ---------------- */
  private onResize = () => {
    // 尺寸变化后重新测量并重算位置
    requestAnimationFrame(() => {
      this.measureActualItemHeight();
      this.centerCurrent(false);
    });
  };

  private centerCurrent(smooth = true) {
    if (!this.listEl) return;
    const idx = this.getIndexByValue(this.current);
    const finalIdx = this.clampIndex(idx >= 0 ? idx : 0);
    const enabledIdx = this.firstEnabledFrom(finalIdx);
    
    if (smooth) {
      this.startSnapAnim(enabledIdx, { silent: true });
    } else {
      const y = this.yForIndex(enabledIdx);
      this.setTrackTransform(y, false, 'normal');
      this.visual = this.parsed[enabledIdx]?.value;
    }
  }

  // 点击选择逻辑已在 PointerUp 内处理（tapCandidate），保留此函数供潜在外部复用
  private clickItem = (opt: PickerOption, ev: MouseEvent) => {
    if (this.disabled || opt.disabled) { ev.preventDefault(); return; }
    const idx = this.getIndexByValue(opt.value);
    this.setIndex(idx, { animate: true, trigger: 'click' });
  };

  /* ---------------- public methods ---------------- */
  @Method()
  async scrollToValue(value: string, opts?: { trigger?: 'program' | 'click' | 'scroll' | 'wheel' | 'keyboard' | 'touch'; animate?: boolean; silent?: boolean }) {
    const idx = this.getIndexByValue(value);
    if (idx >= 0) {
      this.setIndex(idx, { animate: opts?.animate !== false, silent: !!opts?.silent, trigger: (opts?.trigger as any) || 'scroll' });
    }
  }

  @Method()
  async scrollToIndex(index: number, opts?: { trigger?: 'program' | 'click' | 'scroll' | 'wheel' | 'keyboard' | 'touch'; animate?: boolean; silent?: boolean }) {
    this.setIndex(index, { animate: opts?.animate !== false, silent: !!opts?.silent, trigger: (opts?.trigger as any) || 'scroll' });
  }

  @Method()
  async centerToCurrent(smooth: boolean = true) {
    this.centerCurrent(!!smooth);
  }

  /* ---------------- render ---------------- */
  render() {
    this.itemH = this.itemHeightBySize;
    const heightPx = this.panelHeightPx;

    return (
      <Host class={{ 'ldesign-picker': true, 'ldesign-picker--disabled': this.disabled }}>
        <div 
          class="ldesign-picker__picker" 
          ref={(el) => { this.containerEl = el as HTMLElement; }} 
          style={{ height: `${heightPx}px`, ['--ld-pk-item-height' as any]: `${this.itemH}px` }}
          onWheel={this.onWheel as any}
          onPointerDown={this.onPointerDown as any}
          onPointerMove={this.onPointerMove as any}
          onPointerUp={this.onPointerUp as any}
          onPointerCancel={this.onPointerUp as any}
          onKeyDown={this.onKeyDown as any}
          tabindex={this.disabled ? -1 : 0}
        >
          <ul
            class="ldesign-picker__column"
            ref={(el) => { this.listEl = el as HTMLElement; }}
            style={{ 
              transform: `translate3d(0, ${this.trackY}px, 0)`,
              // 确保列表的起始位置
              paddingTop: '0',
              paddingBottom: '0'
            }}
          >
            {this.parsed.map((opt, i) => (
              <li
                data-value={opt.value}
                data-index={String(i)}
                class={{ 'ldesign-picker__item': true, 'ldesign-picker__item--active': opt.value === (this.visual ?? this.current), 'ldesign-picker__item--disabled': !!opt.disabled }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
          <div class="ldesign-picker__indicator" style={{ height: `${this.itemH}px` }}></div>
          <div class="ldesign-picker__mask ldesign-picker__mask--top"></div>
          <div class="ldesign-picker__mask ldesign-picker__mask--bottom"></div>
        </div>
      </Host>
    );
  }
}

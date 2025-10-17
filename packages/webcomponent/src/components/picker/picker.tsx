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
  @Prop() resistance: number = 0.3;
  /** 最大橡皮筋越界（像素）。优先级高于比例 */
  @Prop() maxOverscroll?: number;
  /** 最大橡皮筋越界比例（相对于容器高度 0-1）。当未提供像素值时生效；未设置则默认 0.5（即容器高度的一半） */
  @Prop() maxOverscrollRatio?: number;
  /** 是否启用惯性 */
  @Prop() momentum: boolean = true;
  /** 吸附/回弹动画时长（毫秒，适用于触摸/键盘/滚动吸附），未设置默认 300ms */
  @Prop() snapDuration?: number;
  /** 滚轮专用吸附动画时长（毫秒），未设置默认 150ms */
  @Prop() snapDurationWheel?: number;
  /** 手势拖拽跟随比例（0-1），1 表示 1:1 跟手，越小阻力越大，默认 1 */
  @Prop() dragFollow: number = 1;
  /** 手势拖拽平滑时间常数（毫秒），>0 时使用一阶平滑使位移逐步接近手指，营造"越来越慢"的阻力感，默认 0（关闭） */
  @Prop() dragSmoothing?: number;
  /** 边界回弹模式：'bounce' 弹簧回弹（默认） | 'ease' 缓慢恢复 */
  @Prop() springBackMode: 'bounce' | 'ease' = 'bounce';
  /** 回弹动画基础时长（毫秒），未设置默认 bounce: 500ms, ease: 600ms */
  @Prop() springBackDuration?: number;

  /* ---------------- 搜索和筛选相关 ---------------- */
  /** 是否显示搜索框 */
  @Prop() searchable: boolean = false;
  /** 搜索框占位符 */
  @Prop() searchPlaceholder: string = '搜索选项...';
  /** 是否在搜索时大小写不敏感 */
  @Prop() searchIgnoreCase: boolean = true;
  /** 搜索防抖延迟（毫秒） */
  @Prop() searchDebounce: number = 300;
  /** 键盘快捷定位是否启用（输入字母快速定位） */
  @Prop() keyboardQuickJump: boolean = true;
  /** 搜索时是否高亮匹配文本 */
  @Prop() highlightMatch: boolean = true;

  /* ---------------- 体验优化相关 ---------------- */
  /** 是否启用触觉反馈（需要浏览器支持 Vibration API） */
  @Prop() hapticFeedback: boolean = true; // 默认开启触觉反馈
  /** 触觉反馈强度（毫秒） */
  @Prop() hapticIntensity: number = 5; // 减小默认振动强度，更接近iOS
  /** 是否启用音效 */
  @Prop() soundEffects: boolean = false;
  /** 音效音量 (0-1) */
  @Prop() soundVolume: number = 0.3;
  /** 自定义音效 URL */
  @Prop() soundUrl?: string;
  /** 是否启用 3D 效果 */
  @Prop() enable3d: boolean = false; // 默认关闭3D效果，需要时手动开启
  /** 是否显示渐变遮罩 */
  @Prop() showMask: boolean = true; // 默认显示渐变遮罩
  /** 3D可视角度范围（度） */
  @Prop() visibleRange?: number; // 不设置时根据visible-items自动计算
  /** 3D旋转步长（度） */
  @Prop() rotateStep?: number; // 不设置时根据visible-items自动计算
  /** 3D圆柱半径（像素） */
  @Prop() cylinderRadius?: number; // 不设置时根据容器高度自动计算
  /** 主题模式 */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'light';

  /** 选中项变化（最终吸附后触发） */
  @Event() ldesignChange!: EventEmitter<{ value: string | undefined; option?: PickerOption }>;
  /** 选择过程事件（滚动/拖拽中也会触发） */
  @Event() ldesignPick!: EventEmitter<{ value: string | undefined; option?: PickerOption; context: { trigger: 'click' | 'scroll' | 'touch' | 'wheel' | 'keyboard' } }>;

  @State() parsed: PickerOption[] = [];
  @State() current: string | undefined; // 最终值
  @State() visual: string | undefined;  // 交互过程显示值
  @State() searchValue: string = '';
  @State() filteredOptions: PickerOption[] = [];
  @State() isSearching: boolean = false;
  @State() quickJumpBuffer: string = '';
  @State() quickJumpTimer?: number;

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
  
  // 性能优化
  private rafId?: number;
  private lastUpdateTime = 0;
  private updateThrottle = 16; // 限制更新频率到约60fps
  private visualUpdateDebounce?: number;

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
    // 仅更新 current，不要立即更新 visual，避免高亮瞬间跳变；让动画过程中由 setTrackTransform 逐步更新 visual
    this.current = v;
    requestAnimationFrame(() => {
      const idx = this.getIndexByValue(v);
      if (idx >= 0) {
        // 以“滚动”的触发源开启动画，并静默（不触发对外事件）
        this.setIndex(idx, { animate: true, silent: true, trigger: 'scroll' });
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
    // 初始化音频上下文
    this.initAudioContext();
    
    // 确保DOM完全渲染后进行初始化
    requestAnimationFrame(() => {
      // 测量实际的项目高度
      this.measureActualItemHeight();
      // 读取 3D 旋转最大角（但默认值会在update3DEffects中根据实际情况计算）
      this._maxRotateDeg = this.readCssVarDeg('--ldesign-picker-3d-rotate', null);
      this._radiusPx = this.readCssVarPx('--ldesign-picker-3d-radius', null);
      this._scaleMin = this.readCssVarNum('--ldesign-picker-3d-scale-min', 0.85);
      this._scaleMax = this.readCssVarNum('--ldesign-picker-3d-scale-max', 1.0);
      this._stepDeg = this.readCssVarDeg('--ldesign-picker-3d-step-deg', null);
      // 重新计算位置，确保使用实际测量的高度
      const idx = this.getIndexByValue(this.current);
      const validIdx = this.clampIndex(idx >= 0 ? idx : 0);
      const enabledIdx = this.firstEnabledFrom(validIdx);
      const y = this.yForIndex(enabledIdx);
      this.setTrackTransform(y, false);
      this.visual = this.parsed[enabledIdx]?.value;
      // 初始应用一次 3D 效果
      if (this.enable3d) this.update3DEffects();
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
    
    // 真实弹簧物理模拟
    // 使用双曲正切函数创建平滑的S型曲线
    // 这模拟了真实弹簧的特性：开始容易拉，越拉越难
    const normalizedX = x / dim;
    
    // 使用 tanh 函数创建非常平滑的曲线
    // tanh 的特点：
    // - 在 0 附近接近线性（容易拉动）
    // - 随着 x 增大逐渐饱和（越来越难拉）
    // - 完全连续可导，没有任何突变点
    const steepness = 2.0; // 增加陡峭程度，让阻力增长更快
    const tanhX = Math.tanh(normalizedX * steepness);
    
    // 应用阻力系数
    // c 控制总体阻力大小
    const result = dim * c * tanhX;
    return sign * result;
  }

  private setTrackTransform(y: number, animate = false, mode: 'normal' | 'drag' | 'inertia' = 'normal') {
    if (!this.listEl || this.parsed.length === 0) return;
    
    // 拖拽模式已经在 onPointerMove 中完全处理，这里不再特殊处理
    if (mode === 'drag') {
      // 拖拽模式由 onPointerMove 直接控制，不经过这里
      return;
    }

    const { itemH, minY, maxY } = this.getBounds();

    // 允许在惯性阶段出现受限的弹性越界；编程/步进阶段严格钳制
    const allowElastic = mode === 'inertia';
    const maxOverscroll = this.maxOverscrollPx; // 可配置的最大越界距离（像素）

    let nextY = y;
    if (!allowElastic) {
      // 严格限制在可用范围内（不会出现越界视觉）
      nextY = Math.max(minY, Math.min(maxY, y));
    } else {
      // 惯性模式：需要处理越界
      if (y > maxY) {
        // 顶部越界：橡皮筋压缩
        const over = y - maxY;
        const dim = this.panelHeightPx;
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

    // 3D 透视：为每个可见子项应用基于中心偏移的旋转
    if (this.enable3d) {
      this.update3DEffects();
    }

    // 更新视觉状态（四舍五入到最近项）
    const currentFloat = (this.centerOffset - appliedY) / itemH;
    const currentIdx = Math.max(0, Math.min(this.parsed.length - 1, Math.round(currentFloat)));
    const newVisual = this.parsed[currentIdx]?.value;
    if (newVisual !== this.visual) {
      this.visual = newVisual;
      // 触发反馈（在惯性模式下）
      if (mode === 'inertia') {
        this.onItemChange();
      }
    }
  }

  private cancelSnapAnim() { if (this.snapAnim?.raf) cancelAnimationFrame(this.snapAnim.raf); this.snapAnim = null; }
  private cancelInertia() { if (this.inertia?.raf) cancelAnimationFrame(this.inertia.raf as number); this.inertia = null; }
  private easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
  // 新增：更平滑的缓动函数，专门用于边界附近的动画
  private easeOutQuint(t: number) { return 1 - Math.pow(1 - t, 5); }
  private easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  // 缓慢恢复缓动函数：从快到慢，平滑减速
  private easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }
  // spring缓动函数，用于弹簧回弹
  private easeOutSpring(t: number) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
  // 平滑插值函数，避免突变
  private smoothInterpolate(current: number, last: number, alpha: number) {
    return last + (current - last) * alpha;
  }

  /* ---------------- 3D helpers ---------------- */
  private _maxRotateDeg: number | null = null;
  private _radiusPx: number | null = null;
  private _scaleMin: number | undefined;
  private _scaleMax: number | undefined;
  private _stepDeg: number | null = null;

  private readCssVarDeg(name: string, fallback: number | null): number | null {
    try {
      const cs = getComputedStyle(this.el);
      const raw = cs.getPropertyValue(name)?.trim();
      if (!raw) return fallback;
      // 支持 "25deg" 或纯数字
      const m = raw.match(/(-?\d+(?:\.\d+)?)\s*deg/i) || raw.match(/(-?\d+(?:\.\d+)?)/i);
      if (!m) return fallback;
      const v = parseFloat(m[1]);
      return isFinite(v) ? v : fallback;
    } catch {
      return fallback;
    }
  }

  private readCssVarPx(name: string, fallback: number | null): number | null {
    try {
      const cs = getComputedStyle(this.el);
      const raw = cs.getPropertyValue(name)?.trim();
      if (!raw) return fallback;
      const m = raw.match(/(-?\d+(?:\.\d+)?)\s*px/i) || raw.match(/(-?\d+(?:\.\d+)?)/i);
      if (!m) return fallback;
      const v = parseFloat(m[1]);
      return isFinite(v) ? v : fallback;
    } catch { return fallback; }
  }
  private readCssVarNum(name: string, fallback: number): number {
    try {
      const cs = getComputedStyle(this.el);
      const raw = cs.getPropertyValue(name)?.trim();
      if (!raw) return fallback;
      const v = parseFloat(raw);
      return isFinite(v) ? v : fallback;
    } catch { return fallback; }
  }

  private update3DEffects() {
    if (!this.enable3d || !this.listEl) return;
    const items = Array.from(this.listEl.children) as HTMLElement[];
    if (items.length === 0) return;

    const centerFloat = (this.centerOffset - this.trackY) / this.itemHeightBySize;
    const half = Math.max(1, Math.floor(this.visibleItems / 2));
    
    // 根据visible-items自动调整旋转步长（让可见项目均匀分布）
    // 对于visibleItems=3时，步长更大，避免项目过于聚集
    const defaultStep = this.visibleItems <= 3 ? 30 : Math.min(25, Math.max(10, 80 / this.visibleItems));
    const step = this.rotateStep || (this._stepDeg !== null ? this._stepDeg : defaultStep);
    
    // 最大旋转角：根据可见项数调整
    const defaultMaxA = step * Math.min(half, 2); // 限制最大角度，避免过度旋转
    const maxA = this._maxRotateDeg !== null ? this._maxRotateDeg : defaultMaxA;

    // 半径：根据容器高度和可见项数自动调整
    // 对于少量项目，使用更大的半径以获得更好的3D效果
    const radiusFactor = this.visibleItems <= 3 ? 1.2 : 0.8;
    const defaultRadius = this.panelHeightPx * radiusFactor;
    const radius = this.cylinderRadius || (this._radiusPx !== null ? this._radiusPx : defaultRadius);
    this._radiusPx = radius;
    
    const sMin = this._scaleMin ?? this.readCssVarNum('--ldesign-picker-3d-scale-min', 0.85); this._scaleMin = sMin;
    const sMax = this._scaleMax ?? this.readCssVarNum('--ldesign-picker-3d-scale-max', 1.0); this._scaleMax = sMax;
    const opacityMin = this.readCssVarNum('--ldesign-picker-3d-opacity-min', 0.6);
    const opacityMax = this.readCssVarNum('--ldesign-picker-3d-opacity-max', 1);
    
    // 可视角度范围：根据可见项数自动调整（确保只显示正确数量的项目）
    // 对于少量项目，增加可视范围以避免隐藏
    const visibilityFactor = this.visibleItems <= 3 ? 1.5 : 1;
    const defaultVisibleRange = step * this.visibleItems * visibilityFactor;
    const visibleAngleRange = this.visibleRange || this.readCssVarDeg('--ldesign-picker-3d-visible-range', defaultVisibleRange);

    for (let i = 0; i < items.length; i++) {
      const li = items[i];
      const idxAttr = li.getAttribute('data-index');
      const idx = idxAttr ? parseInt(idxAttr, 10) : i;
      const delta = idx - centerFloat; // 相对中心的偏移（可为小数）
      
      // 计算角度：使用线性步长
      let ang = delta * step;
      
      // 判断是否在可见范围内（基于角度）
      const isVisible = Math.abs(ang) <= visibleAngleRange / 2;
      
      // 如果角度超出可见范围，隐藏该项
      if (!isVisible) {
        li.style.visibility = 'hidden';
        li.style.opacity = '0';
        li.style.pointerEvents = 'none';
        continue;
      } else {
        li.style.visibility = 'visible';
        li.style.pointerEvents = 'auto';
      }
      
      // 限制角度在最大值范围内（用于实际显示的项）
      if (ang > maxA) ang = maxA;
      else if (ang < -maxA) ang = -maxA;

      // 缩放和透明度计算
      const distFromCenter = Math.abs(delta);
      
      // 对于可视范围内的项，使用平滑的缓动
      if (distFromCenter <= half) {
        const t = distFromCenter / half;
        const easedT = 1 - Math.cos(t * Math.PI / 2); // easeOutSine
        const scale = sMax - (sMax - sMin) * easedT;
        const opacity = opacityMax - (opacityMax - opacityMin) * easedT;
        
        // 根据size调整基础字体大小
        let baseFontSize = 14;
        if (this.size === 'small') baseFontSize = 13;
        else if (this.size === 'large') baseFontSize = 15;
        
        // 更微妙的字体大小变化（最多增加2px）
        const fontSize = baseFontSize + (1 - easedT) * 2;
        
        li.style.setProperty('--ld-pk-3d-scale', `${scale.toFixed(3)}`);
        li.style.setProperty('--ld-pk-3d-opacity', `${opacity.toFixed(3)}`);
        li.style.fontSize = `${fontSize.toFixed(1)}px`;
        li.style.opacity = `${opacity.toFixed(3)}`;
      } else {
        // 对于超出可视范围的项，使用最小值
        li.style.setProperty('--ld-pk-3d-scale', `${sMin.toFixed(3)}`);
        li.style.setProperty('--ld-pk-3d-opacity', `${opacityMin.toFixed(3)}`);
        li.style.opacity = `${opacityMin.toFixed(3)}`;
        
        // 根据size设置基础字体
        let baseFontSize = 14;
        if (this.size === 'small') baseFontSize = 13;
        else if (this.size === 'large') baseFontSize = 15;
        li.style.fontSize = `${baseFontSize}px`;
      }

      // 写入 CSS 变量
      li.style.setProperty('--ld-pk-3d-angle', `${ang.toFixed(2)}deg`);
      li.style.setProperty('--ld-pk-3d-radius', `${radius.toFixed(2)}px`);
      li.style.backfaceVisibility = 'hidden';
      (li.style as any).webkitBackfaceVisibility = 'hidden';
      li.style.willChange = 'transform, opacity, font-size, visibility';
    }
  }

  // 专门的边界回弹动画，支持两种模式
  private startBoundarySpringBack(idx: number) {
    if (!this.listEl) return;
    this.cancelInertia();
    this.cancelSnapAnim();
    
    const from = this.trackY;
    const to = this.yForIndex(idx);
    const distance = Math.abs(to - from);
    
    // 根据回弹模式和距离动态调整动画时间
    let baseDuration: number;
    let maxDuration: number;
    
    if (this.springBackMode === 'ease') {
      // 缓慢恢复模式：时间稍长，更平滑
      baseDuration = this.springBackDuration || 600;
      maxDuration = baseDuration * 1.5;
    } else {
      // 弹簧回弹模式：时间稍短，有弹性
      baseDuration = this.springBackDuration || 500;
      maxDuration = baseDuration * 1.6;
    }
    
    // 根据距离调整时间
    const duration = Math.min(maxDuration, baseDuration + distance * 0.3);
    
    const start = performance.now();
    const state = { raf: 0, start, from, to, duration, idx, trigger: 'touch' as const, silent: false };
    this.snapAnim = state as any;
    
    const step = (now: number) => {
      if (!this.snapAnim) return;
      const t = Math.max(0, Math.min(1, (now - state.start) / state.duration));
      
      // 根据模式选择不同的缓动函数
      let easedT: number;
      if (this.springBackMode === 'ease') {
        // 缓慢恢复：使用 easeOutQuart，从快到慢平滑回到原位
        easedT = this.easeOutQuart(t);
      } else {
        // 弹簧回弹：使用 spring 缓动，有弹性效果
        easedT = this.easeOutSpring(t);
      }
      
      const y = state.from + (state.to - state.from) * easedT;
      this.setTrackTransform(y, false, 'normal');
      
      // 实时更新视觉状态
      const idxLive = this.clampIndex((this.centerOffset - y) / this.itemHeightBySize);
      const vLive = this.parsed[idxLive]?.value;
      if (vLive !== this.visual) this.visual = vLive;
      
      if (t >= 1) {
        this.setTrackTransform(state.to, false, 'normal');
        const nextVal = this.parsed[state.idx]?.value;
        this.visual = nextVal;
        if (nextVal !== this.current) {
          this.current = nextVal;
          this.emitPick('touch');
          this.commitValue(nextVal);
        }
        this.snapAnim = null;
        return;
      }
      this.snapAnim.raf = requestAnimationFrame(step);
    };
    state.raf = requestAnimationFrame(step);
  }
  
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
    
    // 如果目标位置超出边界，直接返回
    if (to > maxY || to < minY) {
      return;
    }
    
    // 根据触发源调整动画时长；提供可配置项，默认触摸/键盘/滚动 300ms，滚轮 150ms（更灵敏）
    const dWheel = (typeof this.snapDurationWheel === 'number' && isFinite(this.snapDurationWheel) && this.snapDurationWheel! > 0) ? this.snapDurationWheel! : 150;
    const dDefault = (typeof this.snapDuration === 'number' && isFinite(this.snapDuration) && this.snapDuration! > 0) ? this.snapDuration! : 300;
    // 边界项目使用稍长的动画时长以确保平滑
    const isFirstOrLast = safeIdx === 0 || safeIdx === this.parsed.length - 1;
    const duration = opts?.trigger === 'wheel' ? dWheel : (isFirstOrLast ? dDefault * 1.2 : dDefault);
    const start = performance.now();
    const state = { raf: 0, start, from, to, duration, idx: safeIdx, trigger: opts?.trigger, silent: !!opts?.silent };
    this.snapAnim = state as any;

    const step = (now: number) => {
      if (!this.snapAnim) return;
      const t = Math.max(0, Math.min(1, (now - state.start) / state.duration));
      // 根据是否在边界选择不同的缓动函数
      const isFirstItem = state.idx === 0;
      const isLastItem = state.idx === this.parsed.length - 1;
      const easingFunc = (isFirstItem || isLastItem) ? this.easeOutQuint : this.easeOutCubic;
      const y = state.from + (state.to - state.from) * easingFunc.call(this, t);
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
    
    // 严格限制索引范围 [0, length-1]
    const idx = this.clampIndex(i);
    const enabledIdx = this.firstEnabledFrom(idx);
    
    // 精确检查是否已经在目标位置（基于实际Y坐标）
    const targetY = this.yForIndex(enabledIdx);
    const tolerance = 0.5; // 允许0.5像素的误差
    
    // 只有在不是动画模式且已经在目标位置时才跳过
    if (opts?.animate === false && Math.abs(this.trackY - targetY) < tolerance) {
      // 更新视觉状态确保一致
      this.visual = this.parsed[enabledIdx]?.value;
      return;
    }
    
    // 如果需要动画，用 snapAnim；否则直接设置
    if (opts?.animate !== false) {
      this.startSnapAnim(enabledIdx, { trigger: opts?.trigger, silent: !!opts?.silent });
    } else {
      const y = this.yForIndex(enabledIdx);
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
      this.setTrackTransform(boundaryY, false, 'normal'); // 硬对齐边界
      return;
    }

    // 根据当前的 trackY 精确判断索引
    const currentFloat = (this.centerOffset - this.trackY) / itemH;
    const currentIdx = Math.round(currentFloat);
    
    
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
      return;
    }
    
    // 计算目标索引
    const targetIdx = currentIdx + steps;
    const clampedTargetIdx = this.clampIndex(targetIdx);
    
    if (clampedTargetIdx === currentIdx) {
      const exactY = this.yForIndex(currentIdx);
      if (Math.abs(this.trackY - Math.round(exactY)) > 0.5) {
        this.setTrackTransform(exactY, false);
      }
      return;
    }
    
    // 正常滚动到目标索引
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

    // 基础位移
    const baseTarget = this.startTrackY + dy;
    let target = baseTarget;
    
    // 获取边界
    const { minY, maxY } = this.getBounds();
    
    // 在边界处应用橡皮筋效果
    // 使用配置的阻力系数，但确保范围合理
    const c = Math.min(0.95, Math.max(0.1, this.resistance));
    const dim = this.panelHeightPx;
    
    if (baseTarget > maxY) {
      // 顶部越界
      const over = baseTarget - maxY;
      const rb = this.rubberBand(over, dim, c);
      // 确保不超过最大越界距离
      target = maxY + Math.min(this.maxOverscrollPx, rb);
    } else if (baseTarget < minY) {
      // 底部越界
      const over = baseTarget - minY;
      const rb = this.rubberBand(over, dim, c);
      // 确保不超过最大越界距离
      target = minY + Math.max(-this.maxOverscrollPx, rb);
    }

    // 直接设置位置，不使用时间平滑（平滑会导致延迟和抖动）
    // 拖动应该是1:1跟手的，橡皮筋效果已经提供了阻力感
    this.trackY = target;
    
    // 更新transform
    const el = this.listEl as HTMLElement;
    el.style.transition = 'none';
    el.style.transform = `translate3d(0, ${Math.round(target)}px, 0)`;
    
    // 更新3D效果
    if (this.enable3d) {
      this.update3DEffects();
    }

    // 实时视觉选中
    const currentFloat = (this.centerOffset - target) / this.itemHeightBySize;
    const currentIdx = Math.max(0, Math.min(this.parsed.length - 1, Math.round(currentFloat)));
    const newVisual = this.parsed[currentIdx]?.value;
    if (newVisual !== this.visual) {
      this.visual = newVisual;
      this.onItemChange();
      this.emitPick('touch');
    }

    // 更新速度样本
    const now = performance.now();
    this.velocitySamples.push({ t: now, y: e.clientY });
    while (this.velocitySamples.length > 2 && (now - this.velocitySamples[0].t) > 150) {
      this.velocitySamples.shift();
    }
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
    // 边界附近时限制初始速度，避免过度弹跳
    const currentIdx = Math.round((this.centerOffset - this.trackY) / this.itemHeightBySize);
    const isNearBoundary = currentIdx <= 1 || currentIdx >= this.parsed.length - 2;
    const maxV = isNearBoundary ? 3 : 5; // px/ms（边界附近降低最大速度）
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

      // 改进的边界弹簧效果，使用更平滑的处理
      if (next > maxY) {
        const over = next - maxY;
        const dim = this.panelHeightPx;
        const c = Math.min(0.95, Math.max(0.05, this.resistance));
        const rb = this.rubberBand(over, dim, c);
        next = maxY + Math.min(maxOverscroll, rb);
        
        // 如果速度很小且越界较深，直接启动回弹动画
        if (Math.abs(state.v) < 0.5 && over > maxOverscroll * 0.3) {
          this.inertia = null;
          this.startBoundarySpringBack(0);
          return;
        }
        
        // 渐进式减速，速度越大减速越快
        const velocityFactor = Math.min(1, Math.abs(state.v) / 2);
        const baseSpringK = 0.0008 * (1 + velocityFactor);
        const springForce = -baseSpringK * over * dt;
        
        // 平滑地减少速度
        state.v += springForce;
        state.v *= 0.92; // 更温和的阻尼
      } else if (next < minY) {
        const over = next - minY; // 负值（向上越界）
        const dim = this.panelHeightPx;
        const c = Math.min(0.95, Math.max(0.05, this.resistance));
        const rb = this.rubberBand(over, dim, c);
        next = minY + Math.max(-maxOverscroll, rb);
        
        // 如果速度很小且越界较深，直接启动回弹动画
        if (Math.abs(state.v) < 0.5 && Math.abs(over) > maxOverscroll * 0.3) {
          this.inertia = null;
          this.startBoundarySpringBack(this.parsed.length - 1);
          return;
        }
        
        // 渐进式减速
        const velocityFactor = Math.min(1, Math.abs(state.v) / 2);
        const baseSpringK = 0.0008 * (1 + velocityFactor);
        const springForce = -baseSpringK * over * dt;
        
        state.v += springForce;
        state.v *= 0.92;
      }

      this.setTrackTransform(next, false, 'inertia');

      // 实时高亮
      const floatIdx = (this.centerOffset - this.trackY) / this.itemHeightBySize;
      const idxLive = this.clampIndex(Math.round(floatIdx));
      const vLive = this.parsed[idxLive]?.value;
      if (vLive !== this.visual) this.visual = vLive;

      // 摩擦衰减（指数），值越接近1惯性越长；建议 friction 取 0.97~0.995 更接近原生手感
      state.v *= Math.pow(this.friction, dt / 16.67);

      // 改进的终止条件，增加边界附近的特殊处理
      const nearlyStopped = Math.abs(state.v) < 0.02;
      const finalFloat = (this.centerOffset - this.trackY) / this.itemHeightBySize;
      const idxFinal = this.clampIndex(Math.round(finalFloat));
      const targetY = this.yForIndex(idxFinal);
      const nearSnap = Math.abs(this.trackY - targetY) <= 0.5;
      
      // 检查是否越界
      const isOverTop = this.trackY > this.centerOffset;
      const isOverBottom = this.trackY < this.centerOffset - (this.parsed.length - 1) * this.itemHeightBySize;
      
      // 如果越界且速度很小，使用特殊的回弹动画
      if ((isOverTop || isOverBottom) && Math.abs(state.v) < 0.1) {
        const targetIdx = isOverTop ? 0 : this.parsed.length - 1;
        this.startBoundarySpringBack(targetIdx);
        this.inertia = null;
        return;
      }
      
      // 检查是否在边界附近（第一个或最后一个项目）
      const nearTopBoundary = idxFinal === 0 && this.trackY > targetY - this.itemHeightBySize * 0.5;
      const nearBottomBoundary = idxFinal === this.parsed.length - 1 && this.trackY < targetY + this.itemHeightBySize * 0.5;
      
      // 在边界附近时，使用更宽松的停止条件，避免过度振荡
      const boundaryStopVelocity = 0.05; // 边界附近更早停止
      const shouldStop = (nearTopBoundary || nearBottomBoundary) 
        ? Math.abs(state.v) < boundaryStopVelocity
        : (nearlyStopped || nearSnap);

      if (shouldStop) {
        // 使用更平滑的动画曲线完成最终吸附
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
      // 获取点击位置
      const clickY = e.clientY;
      const containerRect = this.containerEl?.getBoundingClientRect();
      if (containerRect) {
        // 计算点击位置相对于容器中心的偏移
        const centerY = containerRect.top + containerRect.height / 2;
        const offsetFromCenter = clickY - centerY;
        // 计算点击的是哪个项目
        const clickedIdx = Math.round(offsetFromCenter / this.itemHeightBySize);
        const currentIdx = Math.round((this.centerOffset - this.trackY) / this.itemHeightBySize);
        const targetIdx = this.clampIndex(currentIdx + clickedIdx);
        
        // 如果点击的不是当前项，则滚动到该项
        if (targetIdx !== currentIdx && !this.parsed[targetIdx]?.disabled) {
          this.setIndex(targetIdx, { animate: true, trigger: 'touch' });
          return;
        }
      }
    }

    // 检查是否在边界越界状态
    const { minY, maxY } = this.getBounds();
    const isOverBoundary = this.trackY > maxY || this.trackY < minY;
    
    // 如果在边界越界状态，使用特殊的回弹动画
    if (isOverBoundary) {
      // 计算最近的有效位置
      const targetIdx = this.trackY > maxY ? 0 : this.parsed.length - 1;
      // 使用更长的动画时间和更平滑的缓动
      this.startBoundarySpringBack(targetIdx);
      return;
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
    const currentIdx = this.clampIndex(idxFloat);
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.setIndex(currentIdx + 1, { animate: true, trigger: 'keyboard' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.setIndex(currentIdx - 1, { animate: true, trigger: 'keyboard' });
        break;
      case 'Home':
        e.preventDefault();
        this.setIndex(0, { animate: true, trigger: 'keyboard' });
        break;
      case 'End':
        e.preventDefault();
        this.setIndex(this.parsed.length - 1, { animate: true, trigger: 'keyboard' });
        break;
      case 'PageUp':
        e.preventDefault();
        // 跳过一个可视区域的项数
        this.setIndex(Math.max(0, currentIdx - this.visibleItems), { animate: true, trigger: 'keyboard' });
        break;
      case 'PageDown':
        e.preventDefault();
        // 跳过一个可视区域的项数
        this.setIndex(Math.min(this.parsed.length - 1, currentIdx + this.visibleItems), { animate: true, trigger: 'keyboard' });
        break;
      case 'Enter':
      case ' ': // 空格键也可以确认选择
        e.preventDefault();
        this.commitValue(this.visual ?? this.current);
        break;
      case 'Escape':
        // 如果正在搜索，退出搜索
        if (this.isSearching) {
          e.preventDefault();
          this.searchValue = '';
          this.isSearching = false;
          this.filteredOptions = this.parsed;
        }
        break;
      default:
        // 处理字母键快速跳转
        if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
          e.preventDefault();
          this.onQuickJumpKey(e.key);
        }
        break;
    }
  };

  /* ---------------- 体验优化方法 ---------------- */
  private audioContext?: AudioContext;
  private clickSound?: AudioBuffer;
  
  private initAudioContext() {
    if (!this.soundEffects || this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.soundUrl) {
        // 加载自定义音效
        fetch(this.soundUrl)
          .then(response => response.arrayBuffer())
          .then(data => this.audioContext!.decodeAudioData(data))
          .then(buffer => {
            this.clickSound = buffer;
          })
          .catch(err => console.warn('加载音效失败:', err));
      } else {
        // 使用合成音效
        this.createSyntheticSound();
      }
    } catch (err) {
      console.warn('初始化音频上下文失败:', err);
    }
  }
  
  private createSyntheticSound() {
    if (!this.audioContext) return;
    
    // 创建一个简单的点击音
    const duration = 0.05;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
        // 生成一个更清脆的点击音（iOS风格）
        const frequency = 1200; // 提高频率以获得更清脆的音效
        channel[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * Math.exp(-i / (channel.length * 0.05));
    }
    
    this.clickSound = buffer;
  }
  
  private playSound() {
    if (!this.soundEffects || !this.audioContext || !this.clickSound) return;
    
    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.clickSound;
      gainNode.gain.value = this.soundVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (err) {
      console.warn('播放音效失败:', err);
    }
  }
  
  private triggerHaptic(intensity?: number) {
    if (!this.hapticFeedback) return;
    
    // 优先使用现代的触觉反馈API（iOS 13+）
    if ('ontouchstart' in window && (window as any).webkit?.messageHandlers?.haptic) {
      try {
        // iOS特定的触觉反馈
        (window as any).webkit.messageHandlers.haptic.postMessage('impact');
        return;
      } catch (err) {
        // 静默失败，尝试其他方法
      }
    }
    
    // 检查是否支持 Vibration API（Android）
    if ('vibrate' in navigator) {
      try {
        // 使用更短的振动时长，更接近iOS的触觉反馈
        const duration = intensity || this.hapticIntensity || 10; // 默认10ms
        navigator.vibrate(duration);
      } catch (err) {
        console.warn('触觉反馈失败:', err);
      }
    }
  }
  
  private onItemChange() {
    // 触发触觉反馈
    this.triggerHaptic();
    // 播放音效
    this.playSound();
  }

  /* ---------------- 搜索和筛选方法 ---------------- */
  private searchDebounceTimer?: number;
  
  private onSearchInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.value;
    this.searchValue = value;
    
    // 清除之前的防抖计时器
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    // 防抖处理
    this.searchDebounceTimer = setTimeout(() => {
      this.performSearch(value);
    }, this.searchDebounce) as any;
  };
  
  private performSearch(query: string) {
    if (!query) {
      this.filteredOptions = this.parsed;
      this.isSearching = false;
      return;
    }
    
    this.isSearching = true;
    const searchStr = this.searchIgnoreCase ? query.toLowerCase() : query;
    
    this.filteredOptions = this.parsed.filter(opt => {
      const label = this.searchIgnoreCase ? opt.label.toLowerCase() : opt.label;
      return label.includes(searchStr);
    });
    
    // 如果搜索结果不为空，自动选中第一个匹配项
    if (this.filteredOptions.length > 0) {
      const firstMatch = this.filteredOptions[0];
      const idx = this.getIndexByValue(firstMatch.value);
      if (idx >= 0) {
        this.setIndex(idx, { animate: true, trigger: 'scroll' });
      }
    }
  }
  
  private onQuickJumpKey = (key: string) => {
    if (!this.keyboardQuickJump) return;
    
    // 清除之前的计时器
    if (this.quickJumpTimer) {
      clearTimeout(this.quickJumpTimer);
    }
    
    // 累积输入的字母
    this.quickJumpBuffer += key.toLowerCase();
    
    // 找到第一个匹配的选项
    const matchIdx = this.parsed.findIndex(opt => 
      opt.label.toLowerCase().startsWith(this.quickJumpBuffer)
    );
    
    if (matchIdx >= 0) {
      this.setIndex(matchIdx, { animate: true, trigger: 'keyboard' });
    }
    
    // 1秒后清空缓冲区
    this.quickJumpTimer = setTimeout(() => {
      this.quickJumpBuffer = '';
      this.quickJumpTimer = undefined;
    }, 1000) as any;
  };

  /* ---------------- util ---------------- */
  private onResize = () => {
    // 尺寸变化后重新测量并重算位置
    requestAnimationFrame(() => {
      this.measureActualItemHeight();
      this.centerCurrent(false);
      if (this.enable3d) this.update3DEffects();
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
    const displayOptions = this.isSearching ? this.filteredOptions : this.parsed;

    return (
      <Host 
        class={{ 
          'ldesign-picker': true, 
          'ldesign-picker--disabled': this.disabled,
          'ldesign-picker--3d': this.enable3d
        }}
        theme={this.theme}
      >
        {/* 搜索框 */}
        {this.searchable && (
          <div class="ldesign-picker__search">
            <input
              type="text"
              class="ldesign-picker__search-input"
              placeholder={this.searchPlaceholder}
              value={this.searchValue}
              onInput={this.onSearchInput as any}
              disabled={this.disabled}
              aria-label="搜索选项"
            />
            {this.searchValue && (
              <button
                class="ldesign-picker__search-clear"
                onClick={() => {
                  this.searchValue = '';
                  this.isSearching = false;
                  this.filteredOptions = this.parsed;
                }}
                aria-label="清除搜索"
              >
                ×
              </button>
            )}
          </div>
        )}
        
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
          role="listbox"
          aria-label="选项列表"
          aria-activedescendant={this.visual ? `picker-item-${this.visual}` : undefined}
          aria-disabled={this.disabled}
        >
          <div class="ldesign-picker__indicator" style={{ height: `${this.itemH}px` }}></div>
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
            {displayOptions.map((opt, i) => {
              const isActive = opt.value === (this.visual ?? this.current);
              const shouldHighlight = this.highlightMatch && this.searchValue && this.isSearching;
              
              // 高亮匹配文本
              let labelContent = opt.label;
              if (shouldHighlight) {
                const searchStr = this.searchIgnoreCase ? this.searchValue.toLowerCase() : this.searchValue;
                const label = this.searchIgnoreCase ? opt.label.toLowerCase() : opt.label;
                const index = label.indexOf(searchStr);
                
                if (index >= 0) {
                  const before = opt.label.substring(0, index);
                  const match = opt.label.substring(index, index + this.searchValue.length);
                  const after = opt.label.substring(index + this.searchValue.length);
                  
                  labelContent = (
                    <span>
                      {before}
                      <mark class="ldesign-picker__highlight">{match}</mark>
                      {after}
                    </span>
                  ) as any;
                }
              }
              
              return (
                <li
                  id={`picker-item-${opt.value}`}
                  data-value={opt.value}
                  data-index={String(i)}
                  class={{ 
                    'ldesign-picker__item': true, 
                    'ldesign-picker__item--active': isActive, 
                    'ldesign-picker__item--disabled': !!opt.disabled 
                  }}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={opt.disabled}
                >
                  {labelContent}
                </li>
              );
            })}
          </ul>
          {this.showMask && (
            <div class="ldesign-picker__mask"></div>
          )}
        </div>
      </Host>
    );
  }
}

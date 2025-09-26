import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';

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
  /** 是否启用惯性 */
  @Prop() momentum: boolean = true;

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

  // 轨道 transform Y（px），正向为下
  private trackY = 0;

  // 动画/惯性
  private snapAnim: { raf: number; start: number; from: number; to: number; duration: number; idx: number; trigger?: 'click' | 'wheel' | 'keyboard' | 'touch' | 'scroll'; silent: boolean } | null = null;
  private inertia: { raf?: number; v: number; last: number } | null = null;

  // 指针拖动
  private isPointerDown = false;
  private startY = 0;
  private startTrackY = 0;
  private velocitySamples: { t: number; y: number }[] = [];

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
      
      // 项目间的实际间距
      const actualSpacing = Math.round(secondRect.top - firstRect.top);
      
      if (actualSpacing > 0) {
        this.actualItemHeight = actualSpacing;
      } else {
        this.actualItemHeight = Math.round(firstRect.height);
      }
    } else if (items.length === 1) {
      const first = items[0] as HTMLElement;
      const rect = first.getBoundingClientRect();
      this.actualItemHeight = Math.round(rect.height);
    }
    
    // 恢复transform
    this.listEl.style.transform = savedTransform;
  }

  private get panelHeightPx() {
    return this.panelHeight || (this.itemHeightBySize * this.visibleItems);
  }

  private get centerOffset() {
    // 使用实际容器高度
    const h = this.containerEl?.clientHeight ?? this.panelHeightPx;
    // 使用实际的项目高度
    const itemH = this.itemHeightBySize;
    // 计算容器中心的Y坐标，这是list需要偏移的基准点
    // 当第0项在中心时，列表顶部应该在 (h/2 - itemHeight/2) 的位置
    return Math.round((h - itemH) / 2);
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
    // 计算让第 i 项居中时的 Y 坐标
    // 使用实际测量的项目间距
    const itemH = this.itemHeightBySize;
    // 第 i 项的顶部在 i * itemH 的位置
    // 要让它居中，需要向上偏移 i * itemH，再加上 centerOffset
    return Math.round(this.centerOffset - i * itemH);
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
  private setTrackTransform(y: number, animate = false) {
    if (!this.listEl || this.parsed.length === 0) return;
    
    // 严格限制Y值在合法范围内
    const itemH = this.itemHeightBySize;
    const maxY = this.centerOffset; // 第0项居中时的Y值
    const minY = this.centerOffset - (this.parsed.length - 1) * itemH; // 最后一项居中时的Y值
    
    // 加强边界钳制
    let clampedY = y;
    if (y > maxY) {
      clampedY = maxY;
    } else if (y < minY) {
      clampedY = minY;
    }
    clampedY = Math.round(clampedY); // 确保整数像素值
    
    this.trackY = clampedY;
    const el = this.listEl as HTMLElement;
    el.style.willChange = 'transform';
    el.style.transition = animate ? 'transform 200ms cubic-bezier(0.22,0.61,0.36,1)' : 'none';
    el.style.transform = `translate3d(0, ${clampedY}px, 0)`;
    
    // 确保边界时的视觉状态正确
    const currentIdx = Math.round((this.centerOffset - clampedY) / itemH);
    const clampedIdx = Math.max(0, Math.min(this.parsed.length - 1, currentIdx));
    if (currentIdx !== clampedIdx) {
      // 如果计算的索引超出边界，立即修正
      this.visual = this.parsed[clampedIdx]?.value;
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
    // 根据触发源调整动画时长，滚轮用较短时间以提高响应
    const duration = opts?.trigger === 'wheel' ? 150 : 200;
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
        this.setTrackTransform(state.to, false);
        
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
    const idx = Math.max(0, Math.min(this.parsed.length - 1, i));
    
    // 精确检查是否已经在目标位置（基于实际Y坐标）
    const targetY = this.yForIndex(idx);
    const tolerance = 0.5; // 允许0.5像素的误差
    if (Math.abs(this.trackY - targetY) < tolerance && opts?.trigger === 'wheel') {
      // 如果已经精确在目标位置且是滚轮触发的，不做任何动作
      return;
    }
    
    const enabledIdx = this.firstEnabledFrom(idx);
    
    // 如果需要动画，用 snapAnim；否则直接设置
    if (opts?.animate !== false) {
      this.startSnapAnim(enabledIdx, { trigger: opts?.trigger, silent: !!opts?.silent });
    } else {
      const y = Math.round(this.yForIndex(enabledIdx));
      this.setTrackTransform(y, false);
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

    // 根据当前的 trackY 精确判断索引
    const itemH = this.itemHeightBySize;
    const currentFloat = (this.centerOffset - this.trackY) / itemH;
    const currentIdx = Math.round(currentFloat);
    
    // 基于索引的边界判断（更直接）
    if ((currentIdx <= 0 && e.deltaY < 0) || // 在第一项且向上滚
        (currentIdx >= this.parsed.length - 1 && e.deltaY > 0)) { // 在最后一项且向下滚
      // 确保位置精确对齐
      const boundaryIdx = e.deltaY < 0 ? 0 : this.parsed.length - 1;
      const targetY = this.yForIndex(boundaryIdx);
      if (Math.abs(this.trackY - targetY) > 1) {
        // 如果有偏差，立即修正到边界位置
        this.setTrackTransform(targetY, false);
        this.visual = this.parsed[boundaryIdx]?.value;
      }
      return;
    }

    // 如果正在动画中，取消当前动画立即响应新输入
    if (this.snapAnim) {
      this.cancelSnapAnim();
    }

    // Windows 鼠标滚轮通常 deltaY = 100/120 像素
    let steps = 0;
    if (e.deltaMode === 1) {
      // 行模式（罕见）：直接使用 deltaY 作为步数
      steps = Math.round(e.deltaY);
    } else {
      // 像素模式：根据 delta 大小判断
      const delta = Math.abs(e.deltaY);
      const sign = e.deltaY > 0 ? 1 : -1;
      
      if (delta < 20) {
        // 触控板等微小滑动：累计
        this.wheelAccumLines += e.deltaY / this.itemHeightBySize;
        if (Math.abs(this.wheelAccumLines) >= 1) {
          steps = Math.floor(Math.abs(this.wheelAccumLines)) * (this.wheelAccumLines > 0 ? 1 : -1);
          this.wheelAccumLines = this.wheelAccumLines % 1;
        }
      } else {
        // 传统鼠标滚轮：每次只走 1 步
        steps = sign;
        this.wheelAccumLines = 0;
      }
    }

    if (steps !== 0) {
      const targetIdx = Math.max(0, Math.min(this.parsed.length - 1, currentIdx + steps));
      // 如果目标索引和当前索引相同，说明已经到边界了
      if (targetIdx !== currentIdx) {
        this.setIndex(targetIdx, { animate: true, trigger: 'wheel' });
      } else {
        // 已经在边界，确保位置精确
        const boundaryY = this.yForIndex(targetIdx);
        if (Math.abs(this.trackY - boundaryY) > 0.5) {
          this.setTrackTransform(boundaryY, true);
          this.visual = this.parsed[targetIdx]?.value;
        }
      }
    }
  };

  /* ---------------- pointer/gesture ---------------- */
  private onPointerDown = (e: PointerEvent) => {
    if (this.disabled || !this.listEl) return;
    
    // 如果点击的是列表项，不处理拖动
    const target = e.target as HTMLElement;
    if (target.classList?.contains('ldesign-picker__item')) {
      return;
    }
    
    e.preventDefault(); // 防止触发默认的滚动行为
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    this.isPointerDown = true;
    this.cancelInertia();
    this.cancelSnapAnim(); // 取消进行中的动画
    this.startY = e.clientY;
    this.startTrackY = this.trackY;
    this.velocitySamples = [{ t: performance.now(), y: e.clientY }];
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown || !this.listEl) return;
    e.preventDefault();
    const dy = e.clientY - this.startY;
    
    // 严格的边界限制
    const maxY = this.centerOffset;  // 第0项居中时的Y值
    const minY = this.centerOffset - (this.parsed.length - 1) * this.itemHeightBySize;  // 最后一项居中时的Y值
    let next = this.startTrackY + dy;
    
    // 超出边界时增加阻力，但限制最大超出量
    const maxOverscroll = this.itemHeightBySize * 0.3;
    if (next > maxY) {
      const over = next - maxY;
      next = maxY + Math.min(maxOverscroll, over * this.resistance);
    } else if (next < minY) {
      const over = next - minY;
      next = minY + Math.max(-maxOverscroll, over * this.resistance);
    }
    
    this.setTrackTransform(next, false);

    // 实时视觉选中
    const rawIdx = (this.centerOffset - this.trackY) / this.itemHeightBySize;
    const idx = Math.max(0, Math.min(this.parsed.length - 1, Math.round(rawIdx)));
    const v = this.parsed[idx]?.value;
    if (v !== this.visual) { this.visual = v; this.emitPick('touch'); }

    // 速度样本
    const now = performance.now();
    this.velocitySamples.push({ t: now, y: e.clientY });
    while (this.velocitySamples.length > 2 && (now - this.velocitySamples[0].t) > 120) this.velocitySamples.shift();
  };

  private estimateVelocity(): number {
    if (this.velocitySamples.length < 2) return 0;
    const a = this.velocitySamples[0];
    const b = this.velocitySamples[this.velocitySamples.length - 1];
    const dy = b.y - a.y;
    const dt = Math.max(1, b.t - a.t);
    return dy / dt; // px/ms
  }

  private startInertiaTransform(v0: number) {
    if (!this.momentum) { 
      const floatIdx = (this.centerOffset - this.trackY) / this.itemHeightBySize;
      const idx = this.clampIndex(Math.round(floatIdx));
      this.setIndex(idx, { animate: true }); 
      return; 
    }
    this.cancelInertia();
    const state = { v: Math.max(-3.5, Math.min(3.5, v0 * 16.67)), last: performance.now(), raf: 0 } as { v: number; last: number; raf: number };
    this.inertia = state as any;

    const step = (now: number) => {
      if (!this.inertia) return;
      const dt = Math.max(1, now - state.last);
      state.last = now;
      const dy = state.v * (dt / 16.67);
      let next = this.trackY + dy;

      // 严格的边界限制
      const maxY = this.centerOffset;
      const minY = this.centerOffset - (this.parsed.length - 1) * this.itemHeightBySize;
      if (next > maxY) {
        this.setIndex(0, { animate: true, trigger: 'scroll' });
        this.inertia = null;
        return;
      } else if (next < minY) {
        this.setIndex(this.parsed.length - 1, { animate: true, trigger: 'scroll' });
        this.inertia = null;
        return;
      }

      this.setTrackTransform(next, false);

      // 实时高亮
      const floatIdx = (this.centerOffset - this.trackY) / this.itemHeightBySize;
      const idxLive = this.clampIndex(Math.round(floatIdx));
      const vLive = this.parsed[idxLive]?.value;
      if (vLive !== this.visual) this.visual = vLive;

      // 摩擦
      state.v *= Math.pow(this.friction, dt / 16.67);
      if (Math.abs(state.v) < 0.2) {
        const finalFloat = (this.centerOffset - this.trackY) / this.itemHeightBySize;
        const idxFinal = this.clampIndex(Math.round(finalFloat));
        this.setIndex(idxFinal, { animate: true, trigger: 'scroll' });
        this.inertia = null; 
        return;
      }
      state.raf = requestAnimationFrame(step);
    };
    state.raf = requestAnimationFrame(step);
  }

  private onPointerUp = (_e: PointerEvent) => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    if (!this.listEl) return;

    // 如果超出边界，直接吸附回最近的有效位置
    const currentFloat = (this.centerOffset - this.trackY) / this.itemHeightBySize;
    const idx = this.clampIndex(Math.round(currentFloat));
    
    const v0 = this.estimateVelocity();
    if (this.momentum && Math.abs(v0) > 0.1) {
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
      this.setTrackTransform(y, false);
      this.visual = this.parsed[enabledIdx]?.value;
    }
  }

  private clickItem = (opt: PickerOption, ev: MouseEvent) => {
    if (this.disabled || opt.disabled) { ev.preventDefault(); return; }
    const idx = this.getIndexByValue(opt.value);
    this.setIndex(idx, { animate: true, trigger: 'click' });
  };

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
                onClick={(ev) => this.clickItem(opt, ev)}
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

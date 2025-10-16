/**
 * 跨框架的通用Picker类
 * 提供高性能的滚轮选择器核心功能
 */

export interface PickerOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  children?: PickerOption[];
}

export interface PickerConfig {
  // 基础配置
  options: PickerOption[];
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  
  // 外观配置
  visibleItems?: number;
  itemHeight?: number;
  panelHeight?: number;
  theme?: 'light' | 'dark' | 'auto';
  enable3d?: boolean;
  showMask?: boolean;
  
  // 交互配置
  momentum?: boolean;
  friction?: number;
  snapDuration?: number;
  resistance?: number;
  maxOverscroll?: number;
  
  // 搜索配置
  searchable?: boolean;
  searchPlaceholder?: string;
  searchDebounce?: number;
  highlightMatch?: boolean;
  
  // 体验优化
  hapticFeedback?: boolean;
  hapticIntensity?: number;
  soundEffects?: boolean;
  soundVolume?: number;
  
  // 事件回调
  onChange?: (value: string | number | undefined, option?: PickerOption) => void;
  onPick?: (value: string | number | undefined, option?: PickerOption, trigger: string) => void;
}

export class Picker {
  private container: HTMLElement;
  private config: Required<PickerConfig>;
  private listEl: HTMLElement | null = null;
  private indicatorEl: HTMLElement | null = null;
  private searchInputEl: HTMLInputElement | null = null;
  
  // 状态管理
  private currentValue: string | number | undefined;
  private visualValue: string | number | undefined;
  private trackY: number = 0;
  private isDestroyed: boolean = false;
  
  // 交互状态
  private isPointerDown: boolean = false;
  private isDragging: boolean = false;
  private startY: number = 0;
  private startTrackY: number = 0;
  private velocitySamples: Array<{ t: number; y: number }> = [];
  
  // 动画状态
  private snapAnimation: AnimationFrameHandle | null = null;
  private inertiaAnimation: AnimationFrameHandle | null = null;
  
  // 搜索状态
  private searchDebounceTimer: number | null = null;
  private filteredOptions: PickerOption[] = [];
  
  // 音频相关
  private audioContext: AudioContext | null = null;
  private clickSound: AudioBuffer | null = null;

  constructor(container: HTMLElement, config: PickerConfig) {
    this.container = container;
    this.config = this.mergeConfig(config);
    this.currentValue = this.config.value ?? this.config.defaultValue;
    this.visualValue = this.currentValue;
    this.filteredOptions = [...this.config.options];
    
    this.init();
  }

  private mergeConfig(config: PickerConfig): Required<PickerConfig> {
    return {
      options: config.options || [],
      value: config.value,
      defaultValue: config.defaultValue,
      disabled: config.disabled ?? false,
      visibleItems: config.visibleItems ?? 5,
      itemHeight: config.itemHeight ?? 36,
      panelHeight: config.panelHeight,
      theme: config.theme ?? 'light',
      enable3d: config.enable3d ?? false,
      showMask: config.showMask ?? true,
      momentum: config.momentum ?? true,
      friction: config.friction ?? 0.92,
      snapDuration: config.snapDuration ?? 300,
      resistance: config.resistance ?? 0.3,
      maxOverscroll: config.maxOverscroll,
      searchable: config.searchable ?? false,
      searchPlaceholder: config.searchPlaceholder ?? 'Search...',
      searchDebounce: config.searchDebounce ?? 300,
      highlightMatch: config.highlightMatch ?? true,
      hapticFeedback: config.hapticFeedback ?? false,
      hapticIntensity: config.hapticIntensity ?? 5,
      soundEffects: config.soundEffects ?? false,
      soundVolume: config.soundVolume ?? 0.3,
      onChange: config.onChange ?? (() => {}),
      onPick: config.onPick ?? (() => {})
    };
  }

  private init(): void {
    this.render();
    this.attachEvents();
    this.centerToValue(this.currentValue, false);
    
    if (this.config.soundEffects) {
      this.initAudioContext();
    }
    
    if (this.config.enable3d) {
      requestAnimationFrame(() => this.update3DEffects());
    }
  }

  private render(): void {
    // 清空容器
    this.container.innerHTML = '';
    
    // 应用主题
    this.container.className = `picker picker--${this.config.theme}`;
    if (this.config.disabled) {
      this.container.classList.add('picker--disabled');
    }
    if (this.config.enable3d) {
      this.container.classList.add('picker--3d');
    }
    
    // 搜索框
    if (this.config.searchable) {
      const searchDiv = document.createElement('div');
      searchDiv.className = 'picker__search';
      
      this.searchInputEl = document.createElement('input');
      this.searchInputEl.type = 'text';
      this.searchInputEl.className = 'picker__search-input';
      this.searchInputEl.placeholder = this.config.searchPlaceholder;
      this.searchInputEl.disabled = this.config.disabled;
      
      searchDiv.appendChild(this.searchInputEl);
      this.container.appendChild(searchDiv);
    }
    
    // 主容器
    const pickerDiv = document.createElement('div');
    pickerDiv.className = 'picker__panel';
    const height = this.config.panelHeight || (this.config.itemHeight * this.config.visibleItems);
    pickerDiv.style.height = `${height}px`;
    
    // 指示器
    this.indicatorEl = document.createElement('div');
    this.indicatorEl.className = 'picker__indicator';
    this.indicatorEl.style.height = `${this.config.itemHeight}px`;
    pickerDiv.appendChild(this.indicatorEl);
    
    // 列表
    this.listEl = document.createElement('ul');
    this.listEl.className = 'picker__list';
    this.renderOptions();
    pickerDiv.appendChild(this.listEl);
    
    // 遮罩
    if (this.config.showMask) {
      const maskTop = document.createElement('div');
      maskTop.className = 'picker__mask picker__mask--top';
      pickerDiv.appendChild(maskTop);
      
      const maskBottom = document.createElement('div');
      maskBottom.className = 'picker__mask picker__mask--bottom';
      pickerDiv.appendChild(maskBottom);
    }
    
    this.container.appendChild(pickerDiv);
    
    // 添加必要的样式
    this.injectStyles();
  }

  private renderOptions(): void {
    if (!this.listEl) return;
    
    this.listEl.innerHTML = '';
    const options = this.config.searchable ? this.filteredOptions : this.config.options;
    
    options.forEach((option, index) => {
      const li = document.createElement('li');
      li.className = 'picker__item';
      li.dataset.value = String(option.value);
      li.dataset.index = String(index);
      
      if (option.disabled) {
        li.classList.add('picker__item--disabled');
      }
      
      if (option.value === this.visualValue) {
        li.classList.add('picker__item--active');
      }
      
      li.textContent = option.label;
      this.listEl!.appendChild(li);
    });
  }

  private attachEvents(): void {
    const panel = this.container.querySelector('.picker__panel') as HTMLElement;
    if (!panel) return;
    
    // Pointer events
    panel.addEventListener('pointerdown', this.onPointerDown);
    panel.addEventListener('pointermove', this.onPointerMove);
    panel.addEventListener('pointerup', this.onPointerUp);
    panel.addEventListener('pointercancel', this.onPointerUp);
    
    // Wheel event
    panel.addEventListener('wheel', this.onWheel, { passive: false });
    
    // Keyboard events
    panel.tabIndex = this.config.disabled ? -1 : 0;
    panel.addEventListener('keydown', this.onKeyDown);
    
    // Search events
    if (this.searchInputEl) {
      this.searchInputEl.addEventListener('input', this.onSearchInput);
    }
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (this.config.disabled || !this.listEl) return;
    e.preventDefault();
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture?.(e.pointerId);
    
    this.isPointerDown = true;
    this.isDragging = false;
    this.startY = e.clientY;
    this.startTrackY = this.trackY;
    this.velocitySamples = [{ t: performance.now(), y: e.clientY }];
    
    this.cancelAnimations();
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isPointerDown || !this.listEl) return;
    e.preventDefault();
    
    const dy = e.clientY - this.startY;
    
    if (!this.isDragging && Math.abs(dy) < 4) {
      this.velocitySamples.push({ t: performance.now(), y: e.clientY });
      return;
    }
    
    this.isDragging = true;
    
    const newY = this.startTrackY + dy;
    this.setTrackTransform(newY, false);
    
    // 更新速度样本
    const now = performance.now();
    this.velocitySamples.push({ t: now, y: e.clientY });
    while (this.velocitySamples.length > 2 && (now - this.velocitySamples[0].t) > 150) {
      this.velocitySamples.shift();
    }
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    
    if (!this.isDragging) {
      // 处理点击选择
      this.handleTap(e);
      return;
    }
    
    this.isDragging = false;
    
    // 计算速度并启动惯性
    const velocity = this.estimateVelocity();
    if (this.config.momentum && Math.abs(velocity) > 0.1) {
      this.startInertia(velocity);
    } else {
      this.snapToNearest();
    }
  };

  private onWheel = (e: WheelEvent): void => {
    if (this.config.disabled) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 1 : -1;
    const currentIndex = this.getCurrentIndex();
    const newIndex = this.clampIndex(currentIndex + delta);
    
    if (newIndex !== currentIndex) {
      this.scrollToIndex(newIndex, true);
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.config.disabled) return;
    
    const currentIndex = this.getCurrentIndex();
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex - 1;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex + 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = this.config.options.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.commitValue(this.visualValue);
        return;
    }
    
    if (newIndex !== currentIndex) {
      this.scrollToIndex(this.clampIndex(newIndex), true);
    }
  };

  private onSearchInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    const query = input.value;
    
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    this.searchDebounceTimer = window.setTimeout(() => {
      this.performSearch(query);
    }, this.config.searchDebounce);
  };

  private performSearch(query: string): void {
    if (!query) {
      this.filteredOptions = [...this.config.options];
    } else {
      const searchStr = query.toLowerCase();
      this.filteredOptions = this.config.options.filter(opt => 
        opt.label.toLowerCase().includes(searchStr)
      );
    }
    
    this.renderOptions();
    
    if (this.filteredOptions.length > 0) {
      const firstMatch = this.filteredOptions[0];
      this.scrollToValue(firstMatch.value, true);
    }
  }

  private handleTap(e: PointerEvent): void {
    const panel = this.container.querySelector('.picker__panel') as HTMLElement;
    if (!panel) return;
    
    const rect = panel.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const offsetFromCenter = e.clientY - centerY;
    const clickedIndex = Math.round(offsetFromCenter / this.config.itemHeight);
    const currentIndex = this.getCurrentIndex();
    const targetIndex = this.clampIndex(currentIndex + clickedIndex);
    
    if (targetIndex !== currentIndex) {
      this.scrollToIndex(targetIndex, true);
    }
  }

  private setTrackTransform(y: number, animate: boolean = false): void {
    if (!this.listEl) return;
    
    const { minY, maxY } = this.getBounds();
    
    // 应用橡皮筋效果
    if (y > maxY) {
      const over = y - maxY;
      const rb = this.rubberBand(over);
      y = maxY + rb;
    } else if (y < minY) {
      const over = y - minY;
      const rb = this.rubberBand(over);
      y = minY + rb;
    }
    
    this.trackY = y;
    
    this.listEl.style.transition = animate ? `transform ${this.config.snapDuration}ms cubic-bezier(0.22,0.61,0.36,1)` : 'none';
    this.listEl.style.transform = `translate3d(0, ${Math.round(y)}px, 0)`;
    
    // 更新视觉状态
    this.updateVisualState();
    
    // 3D效果
    if (this.config.enable3d) {
      this.update3DEffects();
    }
  }

  private updateVisualState(): void {
    const currentIndex = this.getCurrentIndex();
    const option = this.config.options[currentIndex];
    
    if (option && option.value !== this.visualValue) {
      this.visualValue = option.value;
      
      // 更新活动项
      this.listEl?.querySelectorAll('.picker__item').forEach((item, idx) => {
        if (idx === currentIndex) {
          item.classList.add('picker__item--active');
        } else {
          item.classList.remove('picker__item--active');
        }
      });
      
      // 触发pick事件
      this.config.onPick(this.visualValue, option, 'scroll');
      
      // 触发反馈
      this.triggerFeedback();
    }
  }

  private triggerFeedback(): void {
    // 触觉反馈
    if (this.config.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(this.config.hapticIntensity);
    }
    
    // 音效
    if (this.config.soundEffects && this.audioContext && this.clickSound) {
      this.playSound();
    }
  }

  private getBounds(): { minY: number; maxY: number; itemHeight: number } {
    const itemHeight = this.config.itemHeight;
    const centerOffset = this.getCenterOffset();
    const maxY = centerOffset;
    const minY = centerOffset - (this.config.options.length - 1) * itemHeight;
    return { minY, maxY, itemHeight };
  }

  private getCenterOffset(): number {
    const panelHeight = this.config.panelHeight || (this.config.itemHeight * this.config.visibleItems);
    return (panelHeight - this.config.itemHeight) / 2;
  }

  private getCurrentIndex(): number {
    const centerOffset = this.getCenterOffset();
    const currentFloat = (centerOffset - this.trackY) / this.config.itemHeight;
    return this.clampIndex(Math.round(currentFloat));
  }

  private clampIndex(index: number): number {
    return Math.max(0, Math.min(this.config.options.length - 1, index));
  }

  private getIndexForValue(value: string | number | undefined): number {
    if (value === undefined) return -1;
    return this.config.options.findIndex(opt => opt.value === value);
  }

  private yForIndex(index: number): number {
    return this.getCenterOffset() - index * this.config.itemHeight;
  }

  private rubberBand(over: number): number {
    const dim = this.config.panelHeight || (this.config.itemHeight * this.config.visibleItems);
    const maxOverscroll = this.config.maxOverscroll || dim / 2;
    const sign = over < 0 ? -1 : 1;
    const x = Math.abs(over);
    const normalizedX = x / dim;
    const tanh = Math.tanh(normalizedX * 2);
    const result = dim * this.config.resistance * tanh;
    return sign * Math.min(maxOverscroll, result);
  }

  private estimateVelocity(): number {
    if (this.velocitySamples.length < 2) return 0;
    
    const n = this.velocitySamples.length;
    const first = this.velocitySamples[0];
    const last = this.velocitySamples[n - 1];
    const dt = last.t - first.t;
    
    if (dt === 0) return 0;
    return (last.y - first.y) / dt;
  }

  private startInertia(velocity: number): void {
    this.cancelAnimations();
    
    let v = velocity;
    let lastTime = performance.now();
    
    const step = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      
      const newY = this.trackY + v * dt;
      const { minY, maxY } = this.getBounds();
      
      // 检查边界
      if (newY > maxY || newY < minY) {
        this.snapToNearest();
        return;
      }
      
      this.setTrackTransform(newY, false);
      
      // 应用摩擦力
      v *= Math.pow(this.config.friction, dt / 16.67);
      
      // 检查是否停止
      if (Math.abs(v) < 0.02) {
        this.snapToNearest();
        return;
      }
      
      this.inertiaAnimation = requestAnimationFrame(step);
    };
    
    this.inertiaAnimation = requestAnimationFrame(step);
  }

  private snapToNearest(): void {
    const currentIndex = this.getCurrentIndex();
    this.scrollToIndex(currentIndex, true);
  }

  private cancelAnimations(): void {
    if (this.snapAnimation) {
      cancelAnimationFrame(this.snapAnimation);
      this.snapAnimation = null;
    }
    if (this.inertiaAnimation) {
      cancelAnimationFrame(this.inertiaAnimation);
      this.inertiaAnimation = null;
    }
  }

  private update3DEffects(): void {
    if (!this.listEl || !this.config.enable3d) return;
    
    const items = Array.from(this.listEl.children) as HTMLElement[];
    const centerFloat = (this.getCenterOffset() - this.trackY) / this.config.itemHeight;
    const visibleHalf = Math.floor(this.config.visibleItems / 2);
    
    items.forEach((item, index) => {
      const delta = index - centerFloat;
      const absDistance = Math.abs(delta);
      
      if (absDistance > visibleHalf + 1) {
        item.style.visibility = 'hidden';
        return;
      }
      
      item.style.visibility = 'visible';
      
      // 计算3D变换
      const angle = delta * 15; // 每项15度
      const scale = 1 - absDistance * 0.05;
      const opacity = 1 - absDistance * 0.15;
      
      item.style.transform = `rotateX(${-angle}deg) translateZ(${100}px) scale(${scale})`;
      item.style.opacity = String(Math.max(0.3, opacity));
    });
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createClickSound();
    } catch (err) {
      console.warn('Failed to initialize audio context:', err);
    }
  }

  private createClickSound(): void {
    if (!this.audioContext) return;
    
    const duration = 0.05;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const frequency = 1200;
      channel[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 
                   Math.exp(-i / (channel.length * 0.05));
    }
    
    this.clickSound = buffer;
  }

  private playSound(): void {
    if (!this.audioContext || !this.clickSound) return;
    
    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.clickSound;
      gainNode.gain.value = this.config.soundVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (err) {
      console.warn('Failed to play sound:', err);
    }
  }

  private commitValue(value: string | number | undefined): void {
    if (value === this.currentValue) return;
    
    this.currentValue = value;
    const option = this.config.options.find(opt => opt.value === value);
    this.config.onChange(value, option);
  }

  private injectStyles(): void {
    if (document.getElementById('picker-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'picker-styles';
    style.textContent = `
      .picker {
        display: inline-block;
        position: relative;
        --picker-bg: #fff;
        --picker-border: #e5e7eb;
        --picker-text: #111827;
        --picker-active-color: #1d4ed8;
        --picker-active-bg: rgba(29, 78, 216, 0.06);
      }
      
      .picker--dark {
        --picker-bg: #1f2937;
        --picker-border: #374151;
        --picker-text: #f3f4f6;
        --picker-active-color: #60a5fa;
        --picker-active-bg: rgba(96, 165, 250, 0.1);
      }
      
      .picker--disabled {
        opacity: 0.6;
        pointer-events: none;
      }
      
      .picker__search {
        margin-bottom: 8px;
      }
      
      .picker__search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--picker-border);
        border-radius: 6px;
        background: var(--picker-bg);
        color: var(--picker-text);
        font-size: 14px;
        outline: none;
      }
      
      .picker__search-input:focus {
        border-color: var(--picker-active-color);
        box-shadow: 0 0 0 3px var(--picker-active-bg);
      }
      
      .picker__panel {
        position: relative;
        overflow: hidden;
        background: var(--picker-bg);
        border: 1px solid var(--picker-border);
        border-radius: 8px;
        touch-action: none;
        user-select: none;
      }
      
      .picker__indicator {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        background: var(--picker-active-bg);
        border-top: 1px solid var(--picker-active-color);
        border-bottom: 1px solid var(--picker-active-color);
        opacity: 0.3;
        z-index: 1;
      }
      
      .picker__list {
        margin: 0;
        padding: 0;
        list-style: none;
        position: relative;
        z-index: 2;
        will-change: transform;
      }
      
      .picker__item {
        text-align: center;
        height: 36px;
        line-height: 36px;
        font-size: 14px;
        color: var(--picker-text);
        cursor: pointer;
        transition: color 0.2s, font-weight 0.2s;
      }
      
      .picker__item--active {
        color: var(--picker-active-color);
        font-weight: 600;
      }
      
      .picker__item--disabled {
        color: #9ca3af;
        cursor: not-allowed;
      }
      
      .picker__mask {
        position: absolute;
        left: 0;
        right: 0;
        height: 40%;
        pointer-events: none;
        z-index: 3;
      }
      
      .picker__mask--top {
        top: 0;
        background: linear-gradient(to bottom, var(--picker-bg) 0%, transparent 100%);
      }
      
      .picker__mask--bottom {
        bottom: 0;
        background: linear-gradient(to top, var(--picker-bg) 0%, transparent 100%);
      }
      
      .picker--3d .picker__panel {
        perspective: 1000px;
      }
      
      .picker--3d .picker__list {
        transform-style: preserve-3d;
      }
      
      .picker--3d .picker__item {
        backface-visibility: hidden;
        transform-origin: center center -100px;
        will-change: transform, opacity;
        transition: transform 0.2s, opacity 0.2s;
      }
    `;
    document.head.appendChild(style);
  }

  // 公开方法
  public scrollToIndex(index: number, animate: boolean = true): void {
    this.cancelAnimations();
    
    const clampedIndex = this.clampIndex(index);
    const targetY = this.yForIndex(clampedIndex);
    
    if (!animate) {
      this.setTrackTransform(targetY, false);
      const option = this.config.options[clampedIndex];
      if (option) {
        this.visualValue = option.value;
        this.commitValue(option.value);
      }
      return;
    }
    
    const startY = this.trackY;
    const startTime = performance.now();
    
    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / this.config.snapDuration);
      const eased = this.easeOutCubic(t);
      
      const currentY = startY + (targetY - startY) * eased;
      this.setTrackTransform(currentY, false);
      
      if (t >= 1) {
        const option = this.config.options[clampedIndex];
        if (option) {
          this.visualValue = option.value;
          this.commitValue(option.value);
        }
        this.snapAnimation = null;
        return;
      }
      
      this.snapAnimation = requestAnimationFrame(step);
    };
    
    this.snapAnimation = requestAnimationFrame(step);
  }

  public scrollToValue(value: string | number, animate: boolean = true): void {
    const index = this.getIndexForValue(value);
    if (index >= 0) {
      this.scrollToIndex(index, animate);
    }
  }

  public centerToValue(value: string | number | undefined, animate: boolean = true): void {
    if (value === undefined) return;
    this.scrollToValue(value, animate);
  }

  public getValue(): string | number | undefined {
    return this.currentValue;
  }

  public setValue(value: string | number | undefined, animate: boolean = true): void {
    this.currentValue = value;
    this.centerToValue(value, animate);
  }

  public setOptions(options: PickerOption[]): void {
    this.config.options = options;
    this.filteredOptions = [...options];
    this.renderOptions();
    this.centerToValue(this.currentValue, false);
  }

  public setDisabled(disabled: boolean): void {
    this.config.disabled = disabled;
    this.container.classList.toggle('picker--disabled', disabled);
    
    const panel = this.container.querySelector('.picker__panel') as HTMLElement;
    if (panel) {
      panel.tabIndex = disabled ? -1 : 0;
    }
    
    if (this.searchInputEl) {
      this.searchInputEl.disabled = disabled;
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.cancelAnimations();
    
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.container.innerHTML = '';
    this.isDestroyed = true;
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
}

// 动画帧类型
type AnimationFrameHandle = number;
import { Component, Prop, Element, h, Host, Watch } from '@stencil/core';

/**
 * Ripple 水波纹效果
 * 用法：把 <ldesign-ripple /> 放入任意元素内部（建议放最后），即可在该元素上获得点击水波纹效果。
 * 例如：
 * <button class="btn">按钮<ldesign-ripple /></button>
 */
@Component({
  tag: 'ldesign-ripple',
  styleUrl: 'ripple.less',
  shadow: false,
})
export class LdesignRipple {
  @Element() el!: HTMLElement;

  /** 波纹颜色，默认 currentColor */
  @Prop() color?: string;
  /** 波纹不透明度 */
  @Prop() opacity: number = 0.24;
  /** 膨胀动画时长(ms) */
  @Prop() duration: number = 600;
  /** 淡出时长(ms) */
  @Prop() fadeOutDuration: number = 300;
  /** 半径：auto 或固定像素 */
  @Prop() radius: 'auto' | number = 'auto';
  /** 是否居中触发 */
  @Prop() centered: boolean = false;
  /** 禁用 */
  @Prop() disabled: boolean = false;
  /** 触发方式 */
  @Prop() trigger: 'pointerdown' | 'mousedown' | 'click' = 'pointerdown';
  /** 是否允许触摸设备 */
  @Prop() touchEnabled: boolean = true;
  /** 缓动函数 */
  @Prop() easing: string = 'cubic-bezier(0.4, 0, 0.2, 1)';
  /** 同时存在的最大波纹数量 */
  @Prop() maxRipples: number = 8;
  /** 是否不裁剪边界 */
  @Prop() unbounded: boolean = false;
  /** 波纹效果类型 */
  @Prop() variant: 'default' | 'light' | 'strong' | 'pulse' | 'gradient' = 'default';
  /** 波纹大小模式 */
  @Prop() size: 'small' | 'medium' | 'large' | 'extra-large' = 'medium';
  /** 是否启用多层波纹 */
  @Prop() multiLayer: boolean = false;
  /** 多层波纹延迟 (ms) */
  @Prop() layerDelay: number = 120;
  /** 是否启用发光效果 */
  @Prop() glow: boolean = false;
  /** 发光强度 */
  @Prop() glowIntensity: number = 0.5;
  /** 是否启用振动反馈 (需要浏览器支持) */
  @Prop() haptic: boolean = false;
  /** 振动强度 (1-10) */
  @Prop() hapticIntensity: number = 5;
  /** 最小触发间隔 (ms) */
  @Prop() throttle: number = 0;
  /** 是否启用键盘触发 (Enter/Space) */
  @Prop() keyboardEnabled: boolean = true;
  /** 自定义类名 */
  @Prop() customClass?: string;
  /** 波纹方向 */
  @Prop() direction: 'outward' | 'inward' | 'both' = 'outward';
  /** 是否启用声音反馈 */
  @Prop() sound: boolean = false;
  /** 声音音量 (0-1) */
  @Prop() soundVolume: number = 0.1;

  private targetEl?: HTMLElement | null;
  private pointerDownHandler = (e: Event) => this.onPointerDown(e);
  private pointerUpHandler = () => this.onPointerUp();
  private pointerLeaveHandler = () => this.onPointerUp();
  private keyboardHandler = (e: KeyboardEvent) => this.onKeyboardEvent(e);
  private lastTriggerTime = 0;
  private activeWaves = new Set<HTMLElement>();
  private audioContext?: AudioContext;
  private sizeMultiplier: { [key: string]: number } = {
    small: 0.75,
    medium: 1,
    large: 1.25,
    'extra-large': 1.5
  };

  @Watch('disabled')
  onDisabledChange() {
    this.updateListeners(true);
  }

  @Watch('trigger')
  onTriggerChange() {
    this.updateListeners(true);
  }

  connectedCallback() {
    // 绑定目标：默认父节点
    this.targetEl = this.el.parentElement as HTMLElement | null;
  }

  componentDidLoad() {
    const target = this.targetEl;
    if (!target) return;

    // 将自身移动到父元素末尾，确保层级在最上
    if (this.el.parentElement === target) {
      target.appendChild(this.el);
    }

    // 标记目标样式
    target.classList.add('ldesign-ripple__target');
    if (this.unbounded) {
      target.classList.add('ldesign-ripple__target--unbounded');
    }

    // 添加 ARIA 属性以提升无障碍访问性
    if (!target.hasAttribute('role')) {
      target.setAttribute('role', 'button');
    }
    if (!target.hasAttribute('tabindex') && target.tagName !== 'BUTTON' && target.tagName !== 'A') {
      target.setAttribute('tabindex', '0');
    }

    // 初始化音频上下文（如果需要）
    if (this.sound && typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }

    // 事件监听
    this.updateListeners(false);
  }

  disconnectedCallback() {
    this.updateListeners(true);
    const target = this.targetEl;
    if (target) {
      target.classList.remove('ldesign-ripple__target');
      target.classList.remove('ldesign-ripple__target--unbounded');
    }
    // 清理音频上下文
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = undefined;
    }
    // 清理所有活跃的波纹
    this.activeWaves.clear();
  }

  private updateListeners(remove: boolean) {
    const target = this.targetEl;
    if (!target) return;

    const add = (type: string, handler: any, opts?: any) => !remove && target.addEventListener(type, handler, opts);
    const rm = (type: string, handler: any) => remove && target.removeEventListener(type, handler as any);

    // 先全部移除
    ['pointerdown', 'mousedown', 'click', 'pointerup', 'mouseup', 'pointerleave', 'mouseleave', 'keydown'].forEach(t => rm(t, (this as any)[t + 'Handler'] || this.pointerDownHandler));

    if (this.disabled) return;

    const down = this.trigger;
    if (down === 'pointerdown') {
      add('pointerdown', this.pointerDownHandler, { passive: true });
      add('pointerup', this.pointerUpHandler, { passive: true });
      add('pointerleave', this.pointerLeaveHandler, { passive: true });
    } else if (down === 'mousedown') {
      add('mousedown', this.pointerDownHandler);
      add('mouseup', this.pointerUpHandler);
      add('mouseleave', this.pointerLeaveHandler);
    } else {
      add('click', this.pointerDownHandler);
    }

    // 键盘事件支持
    if (this.keyboardEnabled && !remove) {
      add('keydown', this.keyboardHandler);
    }
  }

  private onPointerDown(event: Event) {
    if (this.disabled) return;

    if (!this.touchEnabled && (event as any).pointerType === 'touch') return;

    // 节流处理
    if (this.throttle > 0) {
      const now = Date.now();
      if (now - this.lastTriggerTime < this.throttle) return;
      this.lastTriggerTime = now;
    }

    const target = this.targetEl;
    if (!target) return;

    // 触发振动反馈
    if (this.haptic && 'vibrate' in navigator) {
      navigator.vibrate(this.hapticIntensity);
    }

    // 播放声音反馈
    if (this.sound && this.audioContext) {
      this.playClickSound();
    }

    const rect = target.getBoundingClientRect();
    let x = rect.width / 2;
    let y = rect.height / 2;

    if (!this.centered) {
      const e = event as PointerEvent | MouseEvent | TouchEvent;
      let clientX: number | undefined;
      let clientY: number | undefined;
      if ('touches' in e && e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX; clientY = (e as MouseEvent).clientY;
      }
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        x = clientX - rect.left; y = clientY - rect.top;
      }
    }

    const radius = this.computeRadius(rect, x, y);
    const createWave = (opacity = this.opacity, delay = 0, isSecondary = false) => {
      const wave = document.createElement('span');
      const classes = ['ldesign-ripple__wave'];
      
      // 添加变体类
      if (this.variant !== 'default') {
        classes.push(`ldesign-ripple__wave--${this.variant}`);
      }
      if (isSecondary) {
        classes.push('ldesign-ripple__wave--secondary');
      }
      if (this.direction === 'inward') {
        classes.push('ldesign-ripple__wave--inward');
      } else if (this.direction === 'both') {
        classes.push('ldesign-ripple__wave--both');
      }
      if (this.glow) {
        classes.push('ldesign-ripple__wave--glow');
      }
      
      wave.className = classes.join(' ');
      const sizeMultiplier = this.sizeMultiplier[this.size] || 1;
      const size = radius * 2 * sizeMultiplier;

      const left = x - (radius * sizeMultiplier);
      const top = y - (radius * sizeMultiplier);
      const color = this.color || 'currentColor';
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.left = `${left}px`;
      wave.style.top = `${top}px`;
      wave.style.setProperty('--ld-ripple-color', color);
      wave.style.setProperty('--ld-ripple-opacity', String(opacity));
      wave.style.setProperty('--ld-ripple-glow-intensity', String(this.glowIntensity));
      
      // 根据方向设置不同的动画
      const transformDuration = this.direction === 'both' ? this.duration * 0.7 : this.duration;
      wave.style.transition = `transform ${transformDuration}ms ${this.easing}, opacity ${this.fadeOutDuration}ms ease-out`;

      this.el.appendChild(wave);
      this.activeWaves.add(wave);

      // 限制数量
      this.limitWaves();

      requestAnimationFrame(() => {
        (wave as any).dataset.activatedAt = String(performance.now() + delay);
        if (delay > 0) wave.style.transitionDelay = `${delay}ms`;
        wave.classList.add('ldesign-ripple__wave--active');
      });

      return wave;
    };

    // 创建主波纹
    const mainWave = createWave(this.opacity, 0, false);
    
    // 多层波纹效果
    if (this.multiLayer) {
      setTimeout(() => {
        createWave(this.opacity * 0.6, 0, true);
      }, this.layerDelay);
      
      if (this.variant === 'pulse') {
        setTimeout(() => {
          createWave(this.opacity * 0.3, 0, true);
        }, this.layerDelay * 2);
      }
    }
    
    // 双向波纹
    if (this.direction === 'both') {
      setTimeout(() => {
        const inwardWave = createWave(this.opacity * 0.5, 0, true);
        inwardWave.classList.add('ldesign-ripple__wave--inward-secondary');
      }, 50);
    }

    if (this.trigger === 'click') {
      setTimeout(() => this.onPointerUp(), 0);
    }
  }

  private onPointerUp() {
    const waves = Array.from(this.el.querySelectorAll('.ldesign-ripple__wave')) as HTMLElement[];
    if (!waves.length) return;
    const now = performance.now();

    waves.forEach((wave) => {
      if ((wave as any).__fading) return;
      const activatedAt = Number((wave as any).dataset.activatedAt || now);
      // 等待膨胀动画结束后再淡出，保证观感自然
      const delay = Math.max(0, this.duration - (now - activatedAt));
      (wave as any).__fading = true;
      setTimeout(() => {
        wave.classList.add('ldesign-ripple__wave--fadeout');
        setTimeout(() => {
          this.activeWaves.delete(wave);
          wave.remove();
        }, this.fadeOutDuration + 50);
      }, delay);
    });
  }

  private limitWaves() {
    const waves = Array.from(this.el.querySelectorAll('.ldesign-ripple__wave')) as HTMLElement[];
    const extra = waves.length - this.maxRipples;
    if (extra > 0) {
      waves.slice(0, extra).forEach(w => w.remove());
    }
  }

  private computeRadius(rect: DOMRect, x: number, y: number): number {
    if (typeof this.radius === 'number' && this.radius > 0) return this.radius;
    const dx = Math.max(x, rect.width - x);
    const dy = Math.max(y, rect.height - y);
    return Math.sqrt(dx * dx + dy * dy);
  }

  private onKeyboardEvent(event: KeyboardEvent) {
    if (this.disabled || !this.keyboardEnabled) return;
    
    // 仅响应 Enter 和 Space 键
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // 模拟居中点击
      const fakeEvent = new Event('click');
      this.centered = true;
      this.onPointerDown(fakeEvent);
      setTimeout(() => {
        this.onPointerUp();
        this.centered = false;
      }, 100);
    }
  }

  private playClickSound() {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 创建轻柔的点击音效
      oscillator.frequency.value = 800 + Math.random() * 200; // 800-1000Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(this.soundVolume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      // 静默处理音频错误
      
    }
  }

  render() {
    // Host 将作为覆盖层（绝对定位，占满父容器）
    const hostClasses = {
      'ldesign-ripple': true,
      'ldesign-ripple--unbounded': this.unbounded,
      [`ldesign-ripple--${this.variant}`]: this.variant !== 'default',
      [`ldesign-ripple--${this.size}`]: this.size !== 'medium',
      'ldesign-ripple--disabled': this.disabled,
      [this.customClass || '']: !!this.customClass
    };
    
    return (
      <Host 
        class={hostClasses} 
        aria-hidden="true"
        data-variant={this.variant}
        data-size={this.size}
      />
    );
  }
}

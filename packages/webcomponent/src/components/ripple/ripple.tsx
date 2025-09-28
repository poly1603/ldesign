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

  // 仅保留真实、优雅的实心扩散效果；其余花哨样式全部移除以保证观感一致性

  private targetEl?: HTMLElement | null;
  private pointerDownHandler = (e: Event) => this.onPointerDown(e);
  private pointerUpHandler = () => this.onPointerUp();
  private pointerLeaveHandler = () => this.onPointerUp();

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
  }

  private updateListeners(remove: boolean) {
    const target = this.targetEl;
    if (!target) return;

    const add = (type: string, handler: any, opts?: any) => !remove && target.addEventListener(type, handler, opts);
    const rm = (type: string, handler: any) => remove && target.removeEventListener(type, handler as any);

    // 先全部移除
    ['pointerdown', 'mousedown', 'click', 'pointerup', 'mouseup', 'pointerleave', 'mouseleave'].forEach(t => rm(t, (this as any)[t + 'Handler'] || this.pointerDownHandler));

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
  }

  private onPointerDown(event: Event) {
    if (this.disabled) return;

    if (!this.touchEnabled && (event as any).pointerType === 'touch') return;

    const target = this.targetEl;
    if (!target) return;

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
const createWave = (opacity = this.opacity, delay = 0) => {
      const wave = document.createElement('span');
      wave.className = 'ldesign-ripple__wave';
      const size = radius * 2;

      const left = x - radius;
      const top = y - radius;
      const color = this.color || 'currentColor';
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.left = `${left}px`;
      wave.style.top = `${top}px`;
      wave.style.setProperty('--ld-ripple-color', color);
      wave.style.setProperty('--ld-ripple-opacity', String(opacity));
      wave.style.transition = `transform ${this.duration}ms ${this.easing}, opacity ${this.fadeOutDuration}ms ease-out`;

      this.el.appendChild(wave);

      // 限制数量
      this.limitWaves();

      requestAnimationFrame(() => {
        (wave as any).dataset.activatedAt = String(performance.now() + delay);
        if (delay > 0) wave.style.transitionDelay = `${delay}ms`;
        wave.classList.add('ldesign-ripple__wave--active');
      });

      return wave;
    };

    // 仅保留实心扩散
    createWave(this.opacity, 0);

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
        setTimeout(() => wave.remove(), this.fadeOutDuration + 50);
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

  render() {
    // Host 将作为覆盖层（绝对定位，占满父容器）
    return <Host class={{ 'ldesign-ripple': true, 'ldesign-ripple--unbounded': this.unbounded }} aria-hidden="true" />;
  }
}

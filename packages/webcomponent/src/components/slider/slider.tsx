import { Component, Prop, State, Event, EventEmitter, Watch, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';

/**
 * Slider 滑块组件
 * 通过拖动滑块在一定数值区间内进行选择
 */
@Component({
  tag: 'ldesign-slider',
  styleUrl: 'slider.less',
  shadow: false,
})
export class LdesignSlider {
  @Element() host!: HTMLElement;

  private trackEl?: HTMLElement;

  /** 当前值 */
  @Prop({ mutable: true, reflect: true }) value: number = 0;
  /** 最小值 */
  @Prop() min: number = 0;
  /** 最大值 */
  @Prop() max: number = 100;
  /** 步长（> 0） */
  @Prop() step: number = 1;
  /** 是否禁用 */
  @Prop() disabled: boolean = false;
  /** 尺寸 */
  @Prop() size: Size = 'medium';
  /** 是否垂直方向 */
  @Prop() vertical: boolean = false;
  /** 是否显示当前值提示 */
  @Prop() showTooltip: boolean = false;

  /** 拖动时实时触发 */
  @Event() ldesignInput!: EventEmitter<number>;
  /** 值改变后触发（释放拖动或点击轨道） */
  @Event() ldesignChange!: EventEmitter<number>;

  @State() private isDragging: boolean = false;
  @State() private isFocused: boolean = false;

  private onWindowPointerMove = (e: PointerEvent) => {
    if (!this.isDragging || this.disabled) return;
    e.preventDefault();
    this.updateValueFromPointer(e);
    this.ldesignInput.emit(this.value);
  };

  private onWindowPointerUp = (e: PointerEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    this.isDragging = false;
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerup', this.onWindowPointerUp);
    this.ldesignChange.emit(this.value);
  };


  @Watch('value')
  watchValue(next: number) {
    const normalized = this.normalize(next);
    if (normalized !== next) {
      // 修正越界或非步长对齐的值
      this.value = normalized;
    }
  }

  private normalize(v: number): number {
    const min = Math.min(this.min, this.max);
    const max = Math.max(this.min, this.max);
    const step = this.step > 0 ? this.step : 1;
    const clamped = Math.min(max, Math.max(min, isFinite(v) ? v : min));
    // 对齐步长
    const steps = Math.round((clamped - min) / step);
    const snapped = min + steps * step;
    // 避免精度问题
    const fixed = parseFloat(snapped.toFixed(6));
    // 再次约束，防止浮点四舍五入越界
    return Math.min(max, Math.max(min, fixed));
  }

  private getPercent(): number {
    const min = Math.min(this.min, this.max);
    const max = Math.max(this.min, this.max);
    if (max === min) return 0;
    return ((this.value - min) / (max - min)) * 100;
  }

  private updateValueFromPointer(e: PointerEvent) {
    if (!this.trackEl) return;
    const rect = this.trackEl.getBoundingClientRect();
    const min = Math.min(this.min, this.max);
    const max = Math.max(this.min, this.max);

    let ratio = 0;
    if (this.vertical) {
      const offset = rect.bottom - e.clientY; // 自下而上
      ratio = offset / rect.height;
    } else {
      const offset = e.clientX - rect.left; // 自左向右
      ratio = offset / rect.width;
    }
    ratio = Math.min(1, Math.max(0, ratio));

    const raw = min + ratio * (max - min);
    this.value = this.normalize(raw);
  }

  private handleTrackPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    // 立即根据点击位置更新到近似值
    this.updateValueFromPointer(e);
    this.ldesignInput.emit(this.value);

    // 开始拖动
    this.isDragging = true;
    window.addEventListener('pointermove', this.onWindowPointerMove);
    window.addEventListener('pointerup', this.onWindowPointerUp);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    const step = this.step > 0 ? this.step : 1;

    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.value = this.normalize(this.value - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.value = this.normalize(this.value + step);
        break;
      case 'PageDown':
        this.value = this.normalize(this.value - step * 10);
        break;
      case 'PageUp':
        this.value = this.normalize(this.value + step * 10);
        break;
      case 'Home':
        this.value = this.normalize(Math.min(this.min, this.max));
        break;
      case 'End':
        this.value = this.normalize(Math.max(this.min, this.max));
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      this.ldesignInput.emit(this.value);
      this.ldesignChange.emit(this.value);
    }
  };

  private handleFocus = () => {
    this.isFocused = true;
  };

  private handleBlur = () => {
    this.isFocused = false;
  };

  private getRootClass(): string {
    const cls = ['ldesign-slider'];
    cls.push(`ldesign-slider--${this.size}`);
    if (this.vertical) cls.push('ldesign-slider--vertical');
    if (this.disabled) cls.push('ldesign-slider--disabled');
    if (this.isDragging) cls.push('ldesign-slider--dragging');
    if (this.isFocused) cls.push('ldesign-slider--focused');
    return cls.join(' ');
  }

  render() {
    const percent = this.getPercent();
    const isVertical = this.vertical;
    
    // 根据尺寸设置具体的thumb大小
    const thumbSizes = {
      'small': { width: '12px', height: '12px' },
      'medium': { width: '16px', height: '16px' },
      'large': { width: '20px', height: '20px' }
    };
    const currentThumbSize = thumbSizes[this.size] || thumbSizes['medium'];

    if (isVertical) {
      // 垂直模式：完全独立的渲染逻辑
      return (
        <Host class="ldesign-slider-host ldesign-slider-host--vertical" style={{ display: 'inline-flex' }}>
          <div 
            class={this.getRootClass()}
            onPointerDown={this.handleTrackPointerDown as any}
          >
            <div 
              class="ldesign-slider__track ldesign-slider__track--vertical"
              ref={(el) => (this.trackEl = el)}
              style={{ position: 'relative', width: '4px', height: '100%', margin: '0' }}
            >
              <div 
              class="ldesign-slider__rail ldesign-slider__rail--vertical"
              style={{ position: 'absolute', width: '100%', height: '100%', left: '0', top: '0', background: 'var(--ld-slider-rail-bg, #e5e7eb)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', borderRadius: '9999px' }}
              />
              <div 
                class="ldesign-slider__fill ldesign-slider__fill--vertical"
                style={{ position: 'absolute', width: '100%', bottom: '0', background: 'var(--ld-slider-fill-bg, var(--ldesign-color-primary, #1677ff))', borderRadius: '9999px', height: `${percent}%` }}
              />
              <div
                class="ldesign-slider__thumb ldesign-slider__thumb--vertical"
                style={{ 
                  bottom: `${percent}%`, 
                  transform: 'translate(-50%, 50%)',
                  width: currentThumbSize.width,
                  height: currentThumbSize.height,
                  left: '50%',
                  position: 'absolute',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  border: '2px solid var(--ldesign-color-primary, #1677ff)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  zIndex: '10',
                  boxSizing: 'border-box'
                }}
                role="slider"
                tabindex={this.disabled ? -1 : 0}
                aria-disabled={this.disabled ? 'true' : 'false'}
                aria-orientation="vertical"
                aria-valuemin={String(Math.min(this.min, this.max))}
                aria-valuemax={String(Math.max(this.min, this.max))}
                aria-valuenow={String(this.value)}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
              >
                {this.showTooltip ? (
                  <div class="ldesign-slider__tooltip ldesign-slider__tooltip--vertical">{this.value}</div>
                ) : null}
              </div>
            </div>
          </div>
        </Host>
      );
    }

    // 水平模式：保持原有逻辑
    return (
      <Host class="ldesign-slider-host ldesign-slider-host--horizontal">
        <div 
          class={this.getRootClass()}
          onPointerDown={this.handleTrackPointerDown as any}
        >
          <div 
            class="ldesign-slider__track"
            ref={(el) => (this.trackEl = el)}
          >
            <div class="ldesign-slider__rail" style={{ background: 'var(--ld-slider-rail-bg, #e5e7eb)' }} />
            <div 
              class="ldesign-slider__fill"
              style={{ width: `${percent}%`, background: 'var(--ld-slider-fill-bg, var(--ldesign-color-primary, #1677ff))' }}
            />
            <div
              class="ldesign-slider__thumb"
              style={{ left: `${percent}%`, transform: 'translate(-50%, -50%)' }}
              role="slider"
              tabindex={this.disabled ? -1 : 0}
              aria-disabled={this.disabled ? 'true' : 'false'}
              aria-orientation="horizontal"
              aria-valuemin={String(Math.min(this.min, this.max))}
              aria-valuemax={String(Math.max(this.min, this.max))}
              aria-valuenow={String(this.value)}
              onKeyDown={this.handleKeyDown}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
            >
              {this.showTooltip ? (
                <div class="ldesign-slider__tooltip">{this.value}</div>
              ) : null}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}

import { Component, Prop, State, Event, EventEmitter, Watch, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';

/**
 * InputNumber 数字输入框
 * - 支持步进按钮、键盘操作（可关闭）、最小/最大值限制、精度控制
 * - 提供 formatter / parser 以实现显示格式化与解析
 */
@Component({
  tag: 'ldesign-input-number',
  styleUrl: 'input-number.less',
  shadow: false,
})
export class LdesignInputNumber {
  @Element() host!: HTMLElement;

  private inputEl?: HTMLInputElement;

  /** 当前值（受控，支持双向） */
  @Prop({ mutable: true }) value: number | null = 0;
  /** 最小值（可不设） */
  @Prop() min?: number;
  /** 最大值（可不设） */
  @Prop() max?: number;
  /** 步长（增减用，不强制对齐输入） */
  @Prop() step: number = 1;
  /** 精度（小数位数）。不设则按 step 与输入自动推断 */
  @Prop() precision?: number;
  /** 是否禁用 */
  @Prop() disabled: boolean = false;
  /** 是否只读（可选，禁用输入但可复制） */
  @Prop() readonly: boolean = false;
  /** 占位符 */
  @Prop() placeholder?: string;
  /** 尺寸 */
  @Prop() size: Size = 'medium';
  /** 状态样式 */
  @Prop() status?: 'error' | 'warning' | 'success';
  /** 是否启用键盘增减（方向键/页键） */
  @Prop() keyboard: boolean = true;
  /** 是否允许鼠标滚轮调整 */
  @Prop() mouseWheel: boolean = false;
  /** 自定义显示格式化 */
  @Prop() formatter?: (value: number | null) => string;
  /** 自定义解析（将输入字符串转成数值） */
  @Prop() parser?: (input: string) => number | null;

  /** 输入时触发（值变化实时） */
  @Event() ldesignInput!: EventEmitter<number | null>;
  /** 提交时触发（失焦、回车、点击步进） */
  @Event() ldesignChange!: EventEmitter<number | null>;
  /** 聚焦/失焦事件 */
  @Event() ldesignFocus!: EventEmitter<FocusEvent>;
  @Event() ldesignBlur!: EventEmitter<FocusEvent>;

  @State() private isFocused: boolean = false;
  /** 文本框展示值（可能包含部分输入，如结尾的.或-） */
  @State() private inputText: string = '';

  /** 外部 value 变化时，同步到 input 文本（格式化显示） */
  @Watch('value')
  watchValue() {
    this.syncTextFromValue();
  }

  componentWillLoad() {
    this.syncTextFromValue();
  }

  private syncTextFromValue() {
    const v = this.value;
    if (this.formatter) {
      this.inputText = this.formatter(v);
    } else {
      this.inputText = v === null || v === undefined || Number.isNaN(v as number) ? '' : String(v);
    }
  }

  private clamp(v: number): number {
    let n = v;
    if (this.min !== undefined) n = Math.max(this.min, n);
    if (this.max !== undefined) n = Math.min(this.max, n);
    return n;
  }

  private getEffectivePrecision(candidate?: number | null): number {
    if (typeof this.precision === 'number') return Math.max(0, this.precision);
    const stepPrecision = this.getDecimalLen(this.step);
    const candidatePrecision = this.getDecimalLen(candidate ?? this.value ?? 0);
    return Math.max(stepPrecision, candidatePrecision);
  }

  private getDecimalLen(num: number): number {
    if (!isFinite(num)) return 0;
    const s = String(num);
    const i = s.indexOf('.')
    return i === -1 ? 0 : (s.length - i - 1);
  }

  private toFixed(n: number, p?: number): number {
    const precision = this.getEffectivePrecision(n);
    const fix = typeof p === 'number' ? p : precision;
    return parseFloat(n.toFixed(fix));
  }

  private parse(text: string): number | null {
    if (this.parser) return this.parser(text);
    const trimmed = text.trim();
    if (trimmed === '') return null;
    // 允许中间态："-"、"+"、"1." 等在输入阶段保留；在提交时处理
    const middle = /^[-+]?\d*(\.)?\d*$/.test(trimmed);
    if (!middle) {
      // 非法输入返回 NaN，外层不会立即覆盖 value
      const n = Number(trimmed.replace(/[,\s]/g, ''));
      return Number.isNaN(n) ? null : n;
    }
    // 可解析但可能是中间态
    const n = Number(trimmed);
    return Number.isNaN(n) ? null : n;
  }

  private commitFromText() {
    if (this.readonly || this.disabled) return;
    const parsed = this.parse(this.inputText);
    let next: number | null = parsed;

    if (next !== null) {
      next = this.clamp(next);
      const p = this.getEffectivePrecision(next);
      next = this.toFixed(next, p);
    }

    const changed = next !== this.value;
    this.value = next;
    this.syncTextFromValue();
    if (changed) {
      this.ldesignInput.emit(this.value);
      this.ldesignChange.emit(this.value);
    }
  }

  private handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.inputText = target.value;

    const parsed = this.parse(this.inputText);
    if (parsed !== null && !this.isMiddleText(this.inputText)) {
      // 实时更新 value（不强制对齐步长），便于受控联动
      const clamped = this.clamp(parsed);
      const p = this.getEffectivePrecision(parsed);
      const fixed = this.toFixed(clamped, p);
      if (fixed !== this.value) {
        this.value = fixed;
        this.ldesignInput.emit(this.value);
      }
    }
  };

  private isMiddleText(text: string): boolean {
    // 处于输入中的中间态："-", "+", "1.", "-0.", "" 等
    return /^(?:[-+]?|[-+]?\d+\.|)$/.test(text.trim());
  }

  private handleFocus = (e: FocusEvent) => {
    this.isFocused = true;
    this.ldesignFocus.emit(e);
  };

  private handleBlur = (e: FocusEvent) => {
    this.isFocused = false;
    this.commitFromText();
    this.ldesignBlur.emit(e);
  };

  private stepBy(delta: number) {
    if (this.disabled || this.readonly) return;
    const base = typeof this.value === 'number' ? this.value : 0;
    const p = this.getEffectivePrecision(base + this.step);
    let next = base + delta * (this.step > 0 ? this.step : 1);
    next = this.toFixed(next, p);
    next = this.clamp(next);
    const changed = next !== this.value;
    this.value = next;
    this.syncTextFromValue();
    if (changed) {
      this.ldesignInput.emit(this.value);
      this.ldesignChange.emit(this.value);
    }
    // 维持聚焦
    this.inputEl?.focus();
  }

  private handleIncrease = (e: MouseEvent) => {
    e.preventDefault();
    this.stepBy(1);
  };

  private handleDecrease = (e: MouseEvent) => {
    e.preventDefault();
    this.stepBy(-1);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.keyboard || this.disabled || this.readonly) return;
    let handled = true;
    switch (e.key) {
      case 'ArrowUp':
        this.stepBy(1);
        break;
      case 'ArrowDown':
        this.stepBy(-1);
        break;
      case 'PageUp':
        this.stepBy(10);
        break;
      case 'PageDown':
        this.stepBy(-10);
        break;
      case 'Home':
        if (this.min !== undefined) {
          this.value = this.toFixed(this.min);
          this.syncTextFromValue();
          this.ldesignInput.emit(this.value);
          this.ldesignChange.emit(this.value);
        }
        break;
      case 'End':
        if (this.max !== undefined) {
          this.value = this.toFixed(this.max);
          this.syncTextFromValue();
          this.ldesignInput.emit(this.value);
          this.ldesignChange.emit(this.value);
        }
        break;
      case 'Enter':
        this.commitFromText();
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  };

  private handleWheel = (e: WheelEvent) => {
    if (!this.mouseWheel || this.disabled || this.readonly) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    this.stepBy(delta);
  };

  private getRootClass(): string {
    const cls = ['ldesign-input-number'];
    cls.push(`ldesign-input-number--${this.size}`);
    if (this.disabled) cls.push('ldesign-input-number--disabled');
    if (this.isFocused) cls.push('ldesign-input-number--focused');
    if (this.status) cls.push(`ldesign-input-number--${this.status}`);
    return cls.join(' ');
  }

  render() {
    return (
      <Host style={{ display: 'inline-block', width: '100%' }}>
        <div class={this.getRootClass()}>
          <input
            ref={(el) => (this.inputEl = el)}
            class="ldesign-input-number__input"
            type="text"
            inputMode="decimal"
            value={this.inputText}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={this.handleInput}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
            onWheel={this.handleWheel as any}
          />
          <div class="ldesign-input-number__handlers">
            <button
              class="ldesign-input-number__btn ldesign-input-number__btn--up"
              type="button"
              aria-label="Increase"
              onMouseDown={(e) => e.preventDefault()}
              onClick={this.handleIncrease}
              disabled={this.disabled || (this.max !== undefined && (this.value ?? 0) >= this.max)}
            >
              <ldesign-icon name="chevron-up" size="small" />
            </button>
            <button
              class="ldesign-input-number__btn ldesign-input-number__btn--down"
              type="button"
              aria-label="Decrease"
              onMouseDown={(e) => e.preventDefault()}
              onClick={this.handleDecrease}
              disabled={this.disabled || (this.min !== undefined && (this.value ?? 0) <= this.min)}
            >
              <ldesign-icon name="chevron-down" size="small" />
            </button>
          </div>
        </div>
      </Host>
    );
  }
}
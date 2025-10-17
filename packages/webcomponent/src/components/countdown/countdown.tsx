import { Component, Prop, State, Event, EventEmitter, Method, Watch, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';

/**
 * Countdown 倒计时组件
 * 支持按结束时间或时长倒计时，提供格式化显示、事件与方法控制
 */
@Component({
  tag: 'ldesign-countdown',
  styleUrl: 'countdown.less',
  shadow: false,
})
export class LdesignCountdown {
  @Element() el!: HTMLElement;

  /** 绝对结束时间（优先级高于 value），支持时间戳、日期字符串或 Date 对象 */
  @Prop() endTime?: number | string | Date;

  /** 倒计时时长（毫秒）。当未提供 endTime 时，以当前时间为起点倒计时 value 毫秒 */
  @Prop() value?: number;

  /** 显示格式，支持 DD、HH、mm、ss、SSS 令牌组合 */
  @Prop() format: string = 'HH:mm:ss';

  /** 是否在初始化时自动开始 */
  @Prop() autoStart: boolean = true;

  /** 是否暂停（受控） */
  @Prop() paused: boolean = false;

  /** 是否以更高频率更新毫秒（约 50ms 一次）。为 false 时每秒更新一次 */
  @Prop() millisecond: boolean = false;

  /** 尺寸（对齐其他组件的 size 体系） */
  @Prop() size: Size = 'middle';

  /** 可选标题文本（展示在数值前）。属性名仍使用 title，避免与 HTMLElement.prototype.title 冲突 */
  @Prop({ attribute: 'title' }) label?: string;

  /** 展现形式：文本、分段、翻牌、进度条、环形进度 */
  @Prop() variant: 'text' | 'segment' | 'flip' | 'progress-line' | 'progress-circle' = 'text';

  /** 是否在分段/翻牌样式中显示单位（天/时/分/秒/毫秒） */
  @Prop() showUnit: boolean = false;

  /** 进度展示采用已消耗还是剩余（用于 progress-* 样式） */
  @Prop() progressAs: 'elapsed' | 'remaining' = 'elapsed';

  /** 环形进度的像素尺寸（正方形） */
  @Prop() circleSize?: number;

  /** 环形进度的描边宽度 */
  @Prop() circleStroke: number = 4;

  /** 剩余时间（毫秒）内部状态 */
  @State() remaining: number = 0;

  /** 是否已结束 */
  @State() finished: boolean = false;

  /** 初始总时长（毫秒），用于进度展示 */
  @State() total: number = 0;

  /** 变化事件：倒计时数值变化时触发 */
  @Event() ldesignChange!: EventEmitter<{ remaining: number; formatted: string }>;

  /** 完成事件：倒计时结束时触发 */
  @Event() ldesignFinish!: EventEmitter<void>;

  private timer: any;
  private targetEnd: number | null = null; // 目标结束时间戳（ms）

  // 监听属性变化，重新计算目标
  @Watch('endTime')
  @Watch('value')
  protected onInputChange() {
    this.resetInternal(false);
  }

  @Watch('paused')
  protected onPausedChange(newVal: boolean) {
    if (newVal) {
      this.pause();
    } else if (!this.finished) {
      this.start();
    }
  }

  connectedCallback() {
    this.resetInternal(true);
  }

  disconnectedCallback() {
    this.clearTimer();
  }

  /** 开始/继续倒计时 */
  @Method()
  async start() {
    if (this.finished) return;
    if (!this.targetEnd) this.computeTargetEnd();
    if (this.paused) return; // 受控暂停优先
    this.clearTimer();
    const interval = this.millisecond ? 50 : 1000;
    this.timer = setInterval(() => this.tick(), interval);
    // 立刻触发一次以避免 1s 延迟
    this.tick();
  }

  /** 暂停倒计时（不会重置剩余时间） */
  @Method()
  async pause() {
    this.clearTimer();
  }

  /** 重置并（在 autoStart=true 且未暂停时）重新开始 */
  @Method()
  async reset() {
    this.resetInternal(true);
  }

  private resetInternal(considerAutoStart: boolean) {
    this.clearTimer();
    this.finished = false;
    this.computeTargetEnd();
    this.updateRemaining();
    if (considerAutoStart && this.autoStart && !this.paused) {
      this.start();
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private computeTargetEnd() {
    const now = Date.now();
    if (this.endTime != null) {
      const t = this.parseToTimestamp(this.endTime);
      this.targetEnd = t > 0 ? t : now;
      this.total = Math.max((this.targetEnd || now) - now, 0);
    } else {
      // 容忍字符串数字（运行时属性可能来自 HTML 属性）
      const raw: any = (this as any).value;
      const v = typeof raw === 'number' ? raw : (raw != null ? Number(raw) : NaN);
      if (!isNaN(v) && v > 0) {
        this.targetEnd = now + v;
        this.total = v;
      } else {
        // 无效输入则视为立即结束
        this.targetEnd = now;
        this.total = 0;
      }
    }
  }

  private parseToTimestamp(v: number | string | Date): number {
    if (typeof v === 'number') return v > 1e12 ? v : v; // 认为已是毫秒
    if (v instanceof Date) return v.getTime();
    // string
    const t = Date.parse(v);
    return isNaN(t) ? 0 : t;
  }

  private tick() {
    this.updateRemaining();
    if (this.remaining <= 0) {
      this.finished = true;
      this.clearTimer();
      this.ldesignFinish.emit();
    }
  }

  private updateRemaining() {
    const now = Date.now();
    const remain = Math.max((this.targetEnd || now) - now, 0);
    this.remaining = remain;
    this.ldesignChange.emit({ remaining: remain, formatted: this.formatRemaining(remain) });
  }

  private pad(num: number, len = 2) {
    return String(num).padStart(len, '0');
  }

  private formatRemaining(ms: number): string {
    const totalMs = Math.max(ms, 0);
    const totalSeconds = Math.floor(totalMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milli = totalMs % 1000;

    let out = this.format;
    // 先替换更长的令牌，避免被短令牌覆盖
    out = out.replace(/DD/g, this.pad(days));
    out = out.replace(/HH/g, this.pad(hours));
    out = out.replace(/mm/g, this.pad(minutes));
    out = out.replace(/ss/g, this.pad(seconds));
    out = out.replace(/SSS/g, this.pad(milli, 3));
    return out;
  }

  private getHostClass() {
    return [
      'ldesign-countdown',
      `ldesign-countdown--${this.size}`,
      `ldesign-countdown--variant-${this.variant}`,
      this.finished ? 'ldesign-countdown--finished' : '',
    ].filter(Boolean).join(' ');
  }

  private getProgressPercent(): number {
    if (!this.total || this.total <= 0) return 0;
    const elapsed = Math.max(this.total - this.remaining, 0);
    const remaining = Math.max(this.remaining, 0);
    const value = this.progressAs === 'remaining' ? (remaining / this.total) : (elapsed / this.total);
    return Math.max(0, Math.min(100, value * 100));
  }

  private tokenizeFormat(): Array<{ type: 'token'; token: 'DD' | 'HH' | 'mm' | 'ss' | 'SSS' } | { type: 'sep'; text: string }> {
    const re = /(DD|HH|mm|ss|SSS)/g;
    const parts: Array<any> = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(this.format)) != null) {
      const pre = this.format.slice(last, m.index);
      if (pre) parts.push({ type: 'sep', text: pre });
      parts.push({ type: 'token', token: m[0] as any });
      last = m.index + m[0].length;
    }
    const tail = this.format.slice(last);
    if (tail) parts.push({ type: 'sep', text: tail });
    return parts as any;
  }

  private getUnitLabel(token: 'DD' | 'HH' | 'mm' | 'ss' | 'SSS'): string {
    const map = { DD: '天', HH: '时', mm: '分', ss: '秒', SSS: '毫秒' } as const;
    return map[token];
  }

  private getTokenValue(token: 'DD' | 'HH' | 'mm' | 'ss' | 'SSS'): string {
    const totalMs = Math.max(this.remaining, 0);
    const totalSeconds = Math.floor(totalMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milli = totalMs % 1000;
    switch (token) {
      case 'DD': return this.pad(days);
      case 'HH': return this.pad(hours);
      case 'mm': return this.pad(minutes);
      case 'ss': return this.pad(seconds);
      case 'SSS': return this.pad(milli, 3);
    }
  }

  private renderSegmentLike(flip = false) {
    const parts = this.tokenizeFormat();
    return (
      <span class="ldesign-countdown__segments" aria-hidden="false">
        {parts.map((p) => {
          if (p.type === 'sep') {
            return <span class="ldesign-countdown__separator">{p.text}</span>;
          }
          const val = this.getTokenValue(p.token);
          return (
            <span class="ldesign-countdown__segment">
              <span class={flip ? 'ldesign-countdown__segment-value ldesign-countdown__flip-digit' : 'ldesign-countdown__segment-value'}>
                {val.split('').map((ch) => (
                  <span class="ldesign-countdown__digit">{ch}</span>
                ))}
              </span>
              {this.showUnit && <span class="ldesign-countdown__segment-unit">{this.getUnitLabel(p.token)}</span>}
            </span>
          );
        })}
      </span>
    );
  }

  private renderProgressLine(text: string) {
    const percent = this.getProgressPercent();
    return (
      <span class="ldesign-countdown__progress ldesign-countdown__progress--line" aria-hidden="false">
        <span class="ldesign-countdown__progress-track"></span>
        <span class="ldesign-countdown__progress-fill" style={{ width: `${percent}%` }}></span>
        <span class="ldesign-countdown__progress-text">{text}</span>
      </span>
    );
  }

  private renderProgressCircle(text: string) {
    const percent = this.getProgressPercent();
    const size = this.circleSize || (this.size === 'small' ? 40 : this.size === 'large' ? 64 : 48);
    const r = Math.max((size / 2) - this.circleStroke - 2, 1);
    const c = 2 * Math.PI * r;
    const offset = c * (1 - percent / 100);
    return (
      <span class="ldesign-countdown__progress ldesign-countdown__progress--circle" style={{ width: `${size}px`, height: `${size}px` }} aria-hidden="false">
        <svg class="ldesign-countdown__progress-circle" width={size} height={size} viewBox={`0 0 ${size} ${size}`}
             style={{ transform: 'rotate(-90deg)' }}>
          <circle class="ldesign-countdown__progress-circle-bg" cx={size/2} cy={size/2} r={r}
                  stroke-width={this.circleStroke} fill="none" />
          <circle class="ldesign-countdown__progress-circle-fg" cx={size/2} cy={size/2} r={r}
                  stroke-width={this.circleStroke} fill="none"
                  stroke-dasharray={`${c}`}
                  stroke-dashoffset={`${offset}`} />
        </svg>
        <span class="ldesign-countdown__progress-text">{text}</span>
      </span>
    );
  }

  render() {
    const text = this.formatRemaining(this.remaining);
    return (
      <Host
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        class={this.getHostClass()}
      >
        {this.label && <span class="ldesign-countdown__title">{this.label}</span>}
        {this.variant === 'text' && (
          <span class="ldesign-countdown__value" aria-label={text}>{text}</span>
        )}
        {this.variant === 'segment' && this.renderSegmentLike(false)}
        {this.variant === 'flip' && this.renderSegmentLike(true)}
        {this.variant === 'progress-line' && this.renderProgressLine(text)}
        {this.variant === 'progress-circle' && this.renderProgressCircle(text)}
      </Host>
    );
  }
}
import { Component, Prop, h, Host, State, Event, EventEmitter, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * Progress 进度条
 * 支持：线形、环形、仪表盘、步骤条，多尺寸/状态/文本/自定义颜色等
 */
@Component({
  tag: 'ldesign-progress',
  styleUrl: 'progress.less',
  shadow: false,
})
export class LdesignProgress {
  /** 类型：line（默认）| circle | dashboard | steps | semicircle */
  @Prop() type: 'line' | 'circle' | 'dashboard' | 'steps' | 'semicircle' = 'line';

  /** 百分比 0-100 */
  @Prop({ mutable: true, reflect: true }) percent: number = 0;

  /** 成功进度（用于分段显示成功部分）0-100 */
  @Prop() successPercent?: number;

  /** 状态：normal | active | success | exception */
  @Prop() status: 'normal' | 'active' | 'success' | 'exception' = 'normal';

  /** 是否显示信息文本（line：默认右侧；circle/dashboard：内部） */
  @Prop() showInfo: boolean = true;

  /** 线形文本位置 */
  @Prop() infoPosition: 'right' | 'left' | 'inside' | 'bottom' = 'right';

  /** 文本格式化，使用 {percent} 占位符，例如："{percent} / 100" */
  @Prop() format: string = '{percent}%';

  /** 组件尺寸 */
  @Prop() size: Size = 'medium';

  /** 线宽（line 为高度，circle 为描边宽度） */
  @Prop() strokeWidth?: number;

  /** 外径宽度（仅 circle/dashboard），单位 px */
  @Prop() width?: number = 120;

  /** 进度颜色（可为任意 css 颜色） */
  @Prop() strokeColor?: string;

  /** 未完成轨道颜色 */
  @Prop() trailColor?: string;

  /** 成功颜色 */
  @Prop() successColor?: string = 'var(--ldesign-success-color, #42bd42)';

  /** 端点样式：round | square | butt（仅 circle 有效，line 以圆角呈现 round） */
  @Prop() strokeLinecap: 'round' | 'square' | 'butt' = 'round';

  /** 环形渐变（可选，仅 circle/dashboard）：起止色 */
  @Prop() gradientFrom?: string;
  @Prop() gradientTo?: string;
  /** 渐变方向：horizontal | vertical | diagonal */
  @Prop() gradientDirection: 'horizontal' | 'vertical' | 'diagonal' = 'horizontal';

  /** 仪表盘缺口角度（0-360，仅 circle/dashboard） */
  @Prop() gapDegree?: number;

  /** 缺口位置（top/right/bottom/left，仅 circle/dashboard） */
  @Prop() gapPosition: 'top' | 'right' | 'bottom' | 'left' = 'top';

  /** 半圆位置（type=semicircle），top 表示显示上半圆，bottom 表示下半圆 */
  @Prop() semiPosition: 'top' | 'bottom' = 'top';

  /** 步骤数（type=steps 或设置 steps>0 都渲染步骤条） */
  @Prop() steps?: number;

  /** 圆形分段步数（用于环形步进样式） */
  @Prop() circleSteps?: number;
  /** 圆形分段之间的间隔角度（度数） */
  @Prop() circleStepGapDegree: number = 2;

  /** 步骤间隙 px（仅 steps） */
  @Prop() stepsGap: number = 2;

  /** 步骤条的块圆角 */
  @Prop() stepsRadius: number = 100; // 大圆角

  /** 条纹动画（active 状态下默认开启） */
  @Prop() striped: boolean = true;

  /** 不确定状态（显示循环动画，忽略 percent） */
  @Prop() indeterminate: boolean = false;

  /** 启用百分比过渡动画 */
  @Prop() animate: boolean = false;

  /** 进度条阴影 */
  @Prop() shadow: boolean = false;

  /** 发光效果 */
  @Prop() glow: boolean = false;

  /** 脉冲动画 */
  @Prop() pulse: boolean = false;

  /** 百分比变化时触发 */
  @Event() percentChange!: EventEmitter<number>;

  /** 进度完成时触发 */
  @Event() complete!: EventEmitter<void>;

  @State() private hideInnerText: boolean = false;
  @State() private animatedPercent: number = 0;

  private gradientId: string = '';
  private animationFrame: number = 0;
  private prevPercent: number = 0;

  @Watch('percent')
  percentChanged(newVal: number, oldVal: number) {
    if (newVal !== oldVal) {
      this.percentChange.emit(newVal);
      if (newVal >= 100 && oldVal < 100) {
        this.complete.emit();
      }
      if (this.animate) {
        this.animatePercent(oldVal, newVal);
      } else {
        this.animatedPercent = newVal;
      }
    }
  }

  private animatePercent(from: number, to: number) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const duration = 500; // 500ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数
      const eased = this.easeOutCubic(progress);
      this.animatedPercent = from + (to - from) * eased;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animatedPercent = to;
      }
    };

    animate();
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private clamp(v: number, min = 0, max = 100) {
    if (!isFinite(v as any)) return min;
    return Math.min(max, Math.max(min, v));
  }

  private get mergedPercent() {
    if (this.indeterminate) return 30; // 不确定状态显示30%
    return this.clamp(this.animate ? this.animatedPercent : this.percent);
  }

  private get mergedSuccess() {
    return this.successPercent != null ? this.clamp(this.successPercent) : undefined;
  }

  private getLineHeight(): number {
    if (this.strokeWidth != null) return this.strokeWidth;
    switch (this.size) {
      case 'small':
        return 6;
      case 'large':
        return 12;
      default:
        return 8;
    }
  }

  private getCircleStroke(): number {
    if (this.strokeWidth != null) return this.strokeWidth;
    switch (this.size) {
      case 'small':
        return 6;
      case 'large':
        return 8;
      default:
        return 6;
    }
  }

  private getStatus(): 'success' | 'exception' | 'active' | 'normal' {
    // 百分百自动视为成功（除非显式指定异常）
    if (this.status !== 'exception' && this.mergedPercent >= 100) return 'success';
    return this.status;
  }

  private getInfoContent() {
    const status = this.getStatus();
    const isDefaultFormat = this.format === '{percent}%';
    const displayPercent = Math.round(this.animate ? this.animatedPercent : this.mergedPercent);
    let content: any = this.format.replace('{percent}', String(displayPercent));
    if (isDefaultFormat) {
      if (status === 'success') {
        content = <ldesign-icon name="check" size="small" />;
      } else if (status === 'exception') {
        content = <ldesign-icon name="x" size="small" />;
      }
    }
    return content;
  }

  private renderInfo() {
    if (!this.showInfo || this.indeterminate) return null;
    return <span class="ldesign-progress__text">{this.getInfoContent()}</span>;
  }

  // 渲染线形
  private renderLine() {
    const height = this.getLineHeight();
    const percent = this.mergedPercent;
    const success = this.mergedSuccess;
    const status = this.getStatus();

    const rootCls = [
      'ldesign-progress',
      'ldesign-progress--line',
      `ldesign-progress--${this.size}`,
      status !== 'normal' ? `ldesign-progress--${status}` : '',
      this.striped && status === 'active' ? 'ldesign-progress--striped' : '',
      this.infoPosition ? `ldesign-progress--info-${this.infoPosition}` : '',
      this.indeterminate ? 'ldesign-progress--indeterminate' : '',
      this.shadow ? 'ldesign-progress--shadow' : '',
      this.glow ? 'ldesign-progress--glow' : '',
      this.pulse ? 'ldesign-progress--pulse' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const barStyle: any = {
      width: this.indeterminate ? '30%' : `${percent}%`,
      height: `${height}px`,
      background: this.strokeColor || 'var(--ldesign-brand-color, #5e2aa7)',
      borderRadius: `${height / 2}px`,
    };

    const railStyle: any = {
      height: `${height}px`,
      background: this.trailColor || 'var(--ldesign-gray-color-2, #dbdbdb)',
      borderRadius: `${height / 2}px`,
    };

    const successStyle: any = success != null
      ? {
          width: `${this.clamp(success)}%`,
          height: `${height}px`,
          background: this.successColor,
          borderRadius: `${height / 2}px`,
        }
      : undefined;

    const info = this.renderInfo();

    // inside 模式：文本放到条内层
    if (this.infoPosition === 'inside') {
      return (
        <Host class={rootCls}>
          <div class="ldesign-progress__outer" style={railStyle}>
            {success != null && <div class="ldesign-progress__success" style={successStyle} />}
            <div class="ldesign-progress__inner" style={barStyle} />
            {this.showInfo && !this.indeterminate ? <span class="ldesign-progress__text ldesign-progress__text--inside">{this.getInfoContent()}</span> : null}
          </div>
        </Host>
      );
    }

    if (this.infoPosition === 'left') {
      return (
        <Host class={rootCls}>
          {info}
          <div class="ldesign-progress__outer" style={railStyle}>
            {success != null && <div class="ldesign-progress__success" style={successStyle} />}
            <div class="ldesign-progress__inner" style={barStyle} />
          </div>
        </Host>
      );
    }

    if (this.infoPosition === 'bottom') {
      return (
        <Host class={rootCls}>
          <div class="ldesign-progress__outer" style={railStyle}>
            {success != null && <div class="ldesign-progress__success" style={successStyle} />}
            <div class="ldesign-progress__inner" style={barStyle} />
          </div>
          {info}
        </Host>
      );
    }

    // 默认右侧
    return (
      <Host class={rootCls}>
        <div class="ldesign-progress__outer" style={railStyle}>
          {success != null && <div class="ldesign-progress__success" style={successStyle} />}
          <div class="ldesign-progress__inner" style={barStyle} />
        </div>
        {info}
      </Host>
    );
  }

  // 计算环形/仪表盘绘制（采用 100x100 视口的圆）
  private getCircleGeometry() {
    const strokeWidth = this.getCircleStroke();
    const r = 50 - strokeWidth / 2; // 半径
    const circumference = 2 * Math.PI * r;

    const gapDegree = this.gapDegree != null ? this.gapDegree : this.type === 'dashboard' ? 75 : this.type === 'semicircle' ? 180 : 0;
    const gapLen = (gapDegree / 360) * circumference;
    const visibleLen = circumference - gapLen;

    // 偏移量保证缺口居中
    const dashOffset = gapLen / 2;

    return { r, strokeWidth, circumference, gapDegree, visibleLen, dashOffset };
  }

  private getGapPosition(): 'top' | 'right' | 'bottom' | 'left' {
    if (this.type === 'semicircle') {
      return this.semiPosition === 'top' ? 'bottom' : 'top';
    }
    return this.gapPosition;
  }

  private getRotateForGap() {
    const mapping: any = { top: -90, bottom: 90, left: 180, right: 0 };
    const pos = this.getGapPosition();
    const deg = mapping[pos] ?? -90;
    return `rotate(${deg} 50 50)`;
  }

  private getGradientVector() {
    // 默认水平方向：右 -> 左（与线性条一致）
    switch (this.gradientDirection) {
      case 'vertical':
        return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' } as any;
      case 'diagonal':
        return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' } as any;
      default:
        return { x1: '100%', y1: '0%', x2: '0%', y2: '0%' } as any;
    }
  }

  private renderCircleLike() {
    const percent = this.mergedPercent;
    const success = this.mergedSuccess;
    const status = this.getStatus();

    const { r, strokeWidth, circumference, visibleLen, dashOffset } = this.getCircleGeometry();

    const rootCls = [
      'ldesign-progress',
      this.type === 'dashboard' ? 'ldesign-progress--dashboard' : (this.type === 'semicircle' ? 'ldesign-progress--semicircle' : 'ldesign-progress--circle'),
      `ldesign-progress--${this.size}`,
      status !== 'normal' ? `ldesign-progress--${status}` : '',
      this.indeterminate ? 'ldesign-progress--indeterminate' : '',
      this.shadow ? 'ldesign-progress--shadow' : '',
      this.glow ? 'ldesign-progress--glow' : '',
      this.pulse ? 'ldesign-progress--pulse' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // 支持分段环形
    const steps = Math.max(0, Math.floor(this.circleSteps || 0));

    let trackDash = `${visibleLen}px ${circumference}px`;
    let mainDash = `${(visibleLen * percent) / 100}px ${circumference}px`;
    let succDash = `${success != null ? (visibleLen * this.clamp(success)) / 100 : 0}px ${circumference}px`;

    if (steps > 0) {
      const segGapLen = (this.circleStepGapDegree / 360) * circumference;
      const segOn = Math.max(0, (visibleLen - segGapLen * steps) / steps);
      const pattern: number[] = [];
      for (let i = 0; i < steps; i++) {
        pattern.push(segOn, segGapLen);
      }
      // 加上全局缺口
      const consumed = steps * (segOn + segGapLen);
      pattern.push(Math.max(0, circumference - consumed));
      trackDash = pattern.map(n => `${n}`).join(' ');

      // 计算主进度填充 pattern
      const filledLen = (visibleLen * percent) / 100;
      const segTotal = segOn + segGapLen;
      let remain = filledLen;
      const fillPattern: number[] = [];
      while (remain > 0) {
        const take = Math.min(segOn, remain);
        fillPattern.push(take);
        remain -= take;
        if (remain <= 0) break;
        // 仍需越过一个 gap（不可见）
        fillPattern.push(segGapLen);
        remain -= segGapLen;
      }
      const used = fillPattern.reduce((a, b) => a + b, 0);
      fillPattern.push(Math.max(0, circumference - used));
      mainDash = fillPattern.map(n => `${n}`).join(' ');

      if (success != null) {
        const succLen2 = (visibleLen * this.clamp(success)) / 100;
        let remain2 = succLen2;
        const succPattern: number[] = [];
        while (remain2 > 0) {
          const take = Math.min(segOn, remain2);
          succPattern.push(take);
          remain2 -= take;
          if (remain2 <= 0) break;
          succPattern.push(segGapLen);
          remain2 -= segGapLen;
        }
        const used2 = succPattern.reduce((a, b) => a + b, 0);
        succPattern.push(Math.max(0, circumference - used2));
        succDash = succPattern.map(n => `${n}`).join(' ');
      }
    }

    const sizePx = this.width || 120;
    const hostStyle: any = this.type === 'semicircle' ? { width: `${sizePx}px`, height: `${Math.round(sizePx / 2)}px` } : { width: `${sizePx}px`, height: `${sizePx}px` };

    const showInnerText = this.showInfo && !this.hideInnerText && sizePx > 20 && !this.indeterminate;
    const displayPercent = Math.round(this.animate ? this.animatedPercent : percent);
    const text = this.format.replace('{percent}', String(displayPercent));
    const isDefaultFormat = this.format === '{percent}%';

    return (
      <Host class={rootCls} style={hostStyle as any}>
        <svg class="ldesign-progress__circle" viewBox="0 0 100 100" role="img" aria-label={`${percent}%`} style={this.type === 'semicircle' ? ({ width: '100%', height: 'auto' } as any) : undefined}>
          {(this.gradientFrom && this.gradientTo) ? (
            <defs>
              <linearGradient id={this.gradientId} {...this.getGradientVector()}>
                <stop offset="0%" stop-color={this.gradientFrom} />
                <stop offset="100%" stop-color={this.gradientTo} />
              </linearGradient>
            </defs>
          ) : null}
          <g transform={this.getRotateForGap()}>
            <circle
              class="ldesign-progress__circle-trail"
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={this.trailColor || 'var(--ldesign-gray-color-2, #dbdbdb)'}
              stroke-width={strokeWidth}
              stroke-linecap={this.strokeLinecap}
              stroke-dasharray={trackDash}
              stroke-dashoffset={dashOffset}
            />
            {success != null && (
              <circle
                class="ldesign-progress__circle-success"
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={this.successColor}
                stroke-width={strokeWidth}
                stroke-linecap={this.strokeLinecap}
                stroke-dasharray={succDash}
                stroke-dashoffset={dashOffset}
              />
            )}
            <circle
              class="ldesign-progress__circle-path"
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={(this.gradientFrom && this.gradientTo) ? `url(#${this.gradientId})` : (this.strokeColor || 'var(--ldesign-brand-color, #5e2aa7)')}
              stroke-width={strokeWidth}
              stroke-linecap={this.strokeLinecap}
              stroke-dasharray={mainDash}
              stroke-dashoffset={dashOffset}
            />
          </g>
        </svg>
        {showInnerText ? (
          <span class="ldesign-progress__text-inset">
            {isDefaultFormat ? (
              status === 'success' ? (
                <ldesign-icon name="check" size="small" />
              ) : status === 'exception' ? (
                <ldesign-icon name="x" size="small" />
              ) : (
                text
              )
            ) : (
              text
            )}
          </span>
        ) : null}
        <slot name="circle-content"></slot>
      </Host>
    );
  }

  private renderSteps() {
    const steps = Math.max(1, Math.floor(this.steps || 0));
    const percent = this.mergedPercent;
    const success = this.mergedSuccess;
    const status = this.getStatus();
    const height = this.getLineHeight();

    const filled = Math.round((steps * percent) / 100);
    const succFilled = success != null ? Math.round((steps * this.clamp(success)) / 100) : 0;

    const rootCls = [
      'ldesign-progress',
      'ldesign-progress--steps',
      `ldesign-progress--${this.size}`,
      status !== 'normal' ? `ldesign-progress--${status}` : '',
      this.shadow ? 'ldesign-progress--shadow' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Host class={rootCls}>
        <div class="ldesign-progress__steps" style={{ gap: `${this.stepsGap}px`, height: `${height}px` } as any}>
          {Array.from({ length: steps }, (_, i) => {
            const index = i + 1;
            const state = index <= succFilled ? 'success' : index <= filled ? 'active' : 'trail';
            const style: any = {
              background:
                state === 'success'
                  ? this.successColor
                  : state === 'active'
                  ? this.strokeColor || 'var(--ldesign-brand-color, #5e2aa7)'
                  : this.trailColor || 'var(--ldesign-gray-color-2, #dbdbdb)',
              borderRadius: `${this.stepsRadius}px`,
            };
            return <span class="ldesign-progress__step" style={style} />;
          })}
        </div>
        {this.renderInfo()}
      </Host>
    );
  }

  componentWillLoad() {
    // 生成固定的 gradientId（避免每次 render 都变化）
    this.gradientId = `ldp-grad-${Math.random().toString(36).slice(2, 9)}`;
    // 决定是否在环形内隐藏文本（width 太小时）
    this.hideInnerText = (this.width || 0) <= 20;
    // 规范化初始值
    this.percent = this.clamp(this.percent);
    this.animatedPercent = this.percent;
    this.prevPercent = this.percent;
  }

  disconnectedCallback() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  render() {
    // steps 优先（若显式传入 steps>0）
    if (this.type === 'steps' || (this.steps && this.steps > 0)) {
      return this.renderSteps();
    }

    if (this.type === 'circle' || this.type === 'dashboard' || this.type === 'semicircle') {
      return this.renderCircleLike();
    }

    return this.renderLine();
  }
}

import { Component, Prop, State, Event, EventEmitter, h, Host, Listen, Element, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * Rate 评分组件
 * - 支持半星、清空、只读、禁用、键盘可访问
 * - 支持自定义图标（基于 ldesign-icon），或通过 slot=character 自定义字符
 */
@Component({
  tag: 'ldesign-rate',
  styleUrl: 'rate.less',
  shadow: false,
})
export class LdesignRate {
  @Element() host!: HTMLElement;

  /** 当前分值（支持受控） */
  @Prop({ mutable: true, reflect: true }) value: number = 0;

  /** 总星数 */
  @Prop() count: number = 5;

  /** 允许半星 */
  @Prop() allowHalf: boolean = false;

  /** 再次点击清空（值相同则清零） */
  @Prop() allowClear: boolean = true;

  /** 禁用交互 */
  @Prop() disabled: boolean = false;

  /** 只读（展示，不可交互） */
  @Prop() readonly: boolean = false;

  /** 尺寸（影响图标大小与间距） */
  @Prop() size: Size = 'medium';

  /** 图标名称（默认 star） */
  @Prop() icon: string = 'star';

  /** 选中颜色（支持 CSS 变量覆盖） */
  @Prop() color?: string;

  /** 未选中颜色（支持 CSS 变量覆盖） */
  @Prop() voidColor?: string;

  /** 提示文案（数组），hover 时显示。可传属性为 JSON 字符串或以属性方式传递数组 */
  @Prop() tooltips?: string[] | string;

  /** 受控模式：为 true 时组件不主动修改 value，仅触发事件 */
  @Prop() controlled: boolean = false;

  /** 悬浮中的临时值（仅视觉） */
  @State() hoverValue: number | null = null;

  /** 是否存在自定义字符插槽 */
  @State() hasCharacterSlot: boolean = false;

  /** hover 变化事件（返回悬浮值） */
  @Event() ldesignHoverChange!: EventEmitter<number>;

  /** 值变化事件（返回新值） */
  @Event() ldesignChange!: EventEmitter<number>;

  componentDidLoad() {
    // 解析 tooltips 属性为数组
    if (typeof this.tooltips === 'string') {
      try {
        const parsed = JSON.parse(this.tooltips);
        if (Array.isArray(parsed)) this.tooltips = parsed as string[];
      } catch {
        // 降级为以 | 分隔
        const parts = String(this.tooltips).split('|').map(s => s.trim()).filter(Boolean);
        this.tooltips = parts.length ? parts : undefined;
      }
    }

    // 检测自定义字符插槽
    this.hasCharacterSlot = !!this.host.querySelector('[slot="character"]');
  }

  @Watch('value')
  onValueChange() {
    // 防止越界
    this.value = this.normalize(this.value);
  }

  private normalize(v: number): number {
    const max = Math.max(1, Math.floor(this.count));
    let step = this.allowHalf ? 0.5 : 1;
    const clamped = Math.max(0, Math.min(v, max));
    // 对齐步进
    return Math.round(clamped / step) * step;
  }

  private get displayValue(): number {
    return this.hoverValue != null ? this.hoverValue : this.value;
  }

  private getStep(): number {
    return this.allowHalf ? 0.5 : 1;
  }

  private onMouseLeave = () => {
    this.hoverValue = null;
    this.ldesignHoverChange.emit(0);
  };

  private onItemMouseMove = (index: number, ev: MouseEvent) => {
    if (this.disabled || this.readonly) return;
    const v = this.computeHoverValue(index, ev);
    if (v !== this.hoverValue) {
      this.hoverValue = v;
      this.ldesignHoverChange.emit(v);
    }
  };

  private onItemClick = (index: number, ev: MouseEvent) => {
    if (this.disabled || this.readonly) return;
    const newVal = this.computeHoverValue(index, ev);
    let finalVal = newVal;
    if (this.allowClear && newVal === this.value) {
      finalVal = 0;
    }
    if (!this.controlled) {
      this.value = finalVal;
    }
    this.ldesignChange.emit(finalVal);
  };

  private computeHoverValue(index: number, ev: MouseEvent): number {
    const el = ev.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = ev.clientX - rect.left; // 相对于 item 左侧
    let v = index; // 默认整星

    if (this.allowHalf) {
      const half = rect.width / 2;
      v = x <= half ? index - 0.5 : index;
    }
    return this.normalize(v);
  }

  @Listen('keydown')
  onKeyDown(ev: KeyboardEvent) {
    if (this.disabled || this.readonly) return;
    const step = this.getStep();
    let next = this.value;

    switch (ev.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = this.normalize(this.value + step);
        ev.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = this.normalize(this.value - step);
        ev.preventDefault();
        break;
      case 'Home':
        next = 0;
        ev.preventDefault();
        break;
      case 'End':
        next = this.normalize(this.count);
        ev.preventDefault();
        break;
      case ' ': // Space 提交 hover 值（若存在）
      case 'Enter':
        if (this.hoverValue != null) {
          const val = this.hoverValue;
          if (!this.controlled) this.value = val;
          this.ldesignChange.emit(val);
        }
        ev.preventDefault();
        return;
    }

    if (next !== this.value) {
      if (!this.controlled) this.value = next;
      this.ldesignChange.emit(next);
    }
  }

  private getFillPercent(index: number): number {
    const v = this.displayValue;
    if (v >= index) return 100;
    if (v <= index - 1) return 0;
    // 半星或部分填充
    const diff = v - (index - 1);
    return Math.max(0, Math.min(100, diff * 100));
  }

  private getRootClass(): string {
    const cls = ['ldesign-rate', `ldesign-rate--${this.size}`];
    if (this.disabled) cls.push('ldesign-rate--disabled');
    if (this.readonly) cls.push('ldesign-rate--readonly');
    return cls.join(' ');
  }

  private renderCharacter() {
    if (this.hasCharacterSlot) {
      return <slot name="character" />;
    }
    return <ldesign-icon name={this.icon} size={this.size} />;
  }

  private renderOne(index: number) {
    const percent = this.getFillPercent(index);
    const isHalf = percent === 50;
    
    // 为半星添加特殊处理
    const starFgStyle = isHalf ? 
      { clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)', width: '100%' } : 
      { width: `${percent}%` };
    
    const item = (
      <span
        class="ldesign-rate__item"
        onMouseMove={(e) => this.onItemMouseMove(index, e)}
        onClick={(e) => this.onItemClick(index, e)}
      >
        <span class="ldesign-rate__star">
          <span class="ldesign-rate__star-bg">
            {this.renderCharacter()}
          </span>
          <span class="ldesign-rate__star-fg" style={starFgStyle}>
            {this.renderCharacter()}
          </span>
        </span>
      </span>
    );

    const tips = Array.isArray(this.tooltips) ? this.tooltips : undefined;
    const tip = tips && tips[index - 1];

    if (tip) {
      return (
        <ldesign-tooltip content={tip} placement="top">
          <span class="ldesign-rate__tooltip-wrap">{item}</span>
        </ldesign-tooltip>
      );
    }
    return item;
  }

  render() {
    const ariaNow = this.value;
    const ariaMax = Math.max(1, Math.floor(this.count));

    const styleVars: any = {};
    if (this.color) styleVars['--ld-rate-color'] = this.color;
    if (this.voidColor) styleVars['--ld-rate-void-color'] = this.voidColor;

    return (
      <Host
        class={this.getRootClass()}
        style={styleVars}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={ariaMax}
        aria-valuenow={ariaNow}
        aria-readonly={this.readonly ? 'true' : 'false'}
        aria-disabled={this.disabled ? 'true' : 'false'}
        tabindex={this.disabled ? -1 : 0}
        onMouseLeave={this.onMouseLeave}
      >
        {Array.from({ length: ariaMax }, (_, i) => this.renderOne(i + 1))}
      </Host>
    );
  }
}
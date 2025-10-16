import { Component, Prop, Event, EventEmitter, h, Host, Element, Listen, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * Tag 标签组件
 * 用于标记和分类
 */
@Component({
  tag: 'ldesign-tag',
  styleUrl: 'tag.less',
  shadow: false,
})
export class LdesignTag {
  @Element() el!: HTMLElement;

  /**
   * 外观风格
   * - light: 浅色背景（默认）
   * - solid: 实底
   * - outline: 描边
   * - ghost: 透明背景，悬停有轻微填充
   * - dashed: 虚线描边
   * - elevated: 浅色+阴影
   */
  @Prop() variant: 'light' | 'solid' | 'outline' | 'ghost' | 'dashed' | 'elevated' = 'light';

  /**
   * 是否显示边框动画（仅在 checkable 或 clickable 时有效）
   */
  @Prop() borderAnimation: boolean = false;

  /**
   * 语义颜色
   */
  @Prop() color: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';

  /** 自定义主色（hex/rgb/hsl）。设置后将覆盖 color 的预设色 */
  @Prop() customColor?: string;

  /**
   * 效果风格：none（默认）、gradient（渐变）、glass（毛玻璃）、neon（霓虹）
   */
  @Prop() effect: 'none' | 'gradient' | 'glass' | 'neon' = 'none';

  /**
   * 尺寸（small/middle/large，兼容 medium）
   */
  @Prop() size: Size = 'middle';

  /**
   * 形状（rectangle：直角；round：全圆角；pill：胶囊）
   */
  @Prop() shape: 'rectangle' | 'round' | 'pill' = 'rectangle';

  /**
   * 是否可关闭
   */
  @Prop() closable: boolean = false;

  /**
   * 是否可点击（非选中态），用于标签作为动作的场景
   */
  @Prop() clickable: boolean = false;

  /**
   * 是否可选（切换选中态）
   */
  @Prop() checkable: boolean = false;

  /**
   * 选中状态（与 checkable 配合使用）
   */
  @Prop({ mutable: true, reflect: true }) selected: boolean = false;

  /**
   * 加载状态
   */
  @Prop() loading: boolean = false;

  /**
   * 左侧图标
   */
  @Prop() icon?: string;

  /** 右上角数字/文本角标 */
  @Prop() badge?: string | number;

  /** 右上角小圆点 */
  @Prop() dot: boolean = false;

  /** 右上角角标脉动效果 */
  @Prop() badgePulse: boolean = false;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 关闭按钮的无障碍文案
   */
  @Prop() closeAriaLabel: string = '关闭标签';

  /**
   * 关闭事件
   */
  @Event() ldesignClose!: EventEmitter<MouseEvent>;

  /**
   * 选中状态变化事件（仅当 checkable 为 true 时触发）
   */
  @Event() ldesignChange!: EventEmitter<boolean>;

  @Watch('customColor')
  @Watch('variant')
  @Watch('effect')
  handleStyleChange() {
    this.applyCustomColors();
  }

  componentDidLoad() {
    this.applyCustomColors();
  }

  private applyCustomColors() {
    const host = this.el as HTMLElement;
    if (!this.customColor) {
      host.style.removeProperty('--tag-custom');
      host.style.removeProperty('--tag-custom-weak');
      host.style.removeProperty('--tag-custom-strong');
      return;
    }
    const { base, weak, strong } = computePalette(this.customColor);
    host.style.setProperty('--tag-custom', base);
    host.style.setProperty('--tag-custom-weak', weak);
    host.style.setProperty('--tag-custom-strong', strong);
  }
  private get effectiveVariant(): LdesignTag['variant'] {
    // 勾选时视觉使用实底风格以获得更强对比
    if (this.checkable && this.selected) return 'solid';
    return this.variant;
  }

  private getClassList(): string {
    const classes = [
      'ldesign-tag',
      `ldesign-tag--${this.effectiveVariant}`,
      `ldesign-tag--${this.size}`,
      `ldesign-tag--${this.shape}`,
      `ldesign-tag--color-${this.color}`,
    ];

    if (this.disabled) classes.push('ldesign-tag--disabled');
    if (this.closable) classes.push('ldesign-tag--closable');
    if (this.icon) classes.push('ldesign-tag--with-icon');
    if (this.clickable) classes.push('ldesign-tag--clickable');
    if (this.checkable) classes.push('ldesign-tag--checkable');
    if (this.selected) classes.push('ldesign-tag--selected');
    if (this.loading) classes.push('ldesign-tag--loading');
    if (this.badge != null || this.dot) classes.push('ldesign-tag--with-badge');
    if (this.badgePulse) classes.push('ldesign-tag--badge-pulse');
    if (this.customColor) classes.push('ldesign-tag--custom');
    if (this.effect !== 'none') classes.push(`ldesign-tag--effect-${this.effect}`);
    if (this.borderAnimation) classes.push('ldesign-tag--border-animation');

    return classes.join(' ');
  }

  // 为标签内的图标提供更贴合的尺寸映射
  private getIconSizeValue(): number {
    switch (this.size) {
      case 'small':
        return 12;
      case 'large':
        return 14;
      case 'middle':
      case 'medium':
      default:
        return 13;
    }
  }

  // 关闭按钮图标尺寸（更小更精致）
  private getCloseIconSize(): number {
    switch (this.size) {
      case 'small':
        return 9;
      case 'large':
        return 11;
      case 'middle':
      case 'medium':
      default:
        return 10;
    }
  }

  private onCloseClick = (ev: MouseEvent) => {
    ev.stopPropagation();
    if (this.disabled) {
      ev.preventDefault();
      return;
    }
    this.ldesignClose.emit(ev);
  };

  private onHostClick = (ev: MouseEvent) => {
    if (this.disabled) {
      ev.preventDefault();
      return;
    }
    if (this.checkable) {
      this.selected = !this.selected;
      this.ldesignChange.emit(this.selected);
    }
  };

  @Listen('keydown')
  onKeydown(ev: KeyboardEvent) {
    if (this.disabled) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      // 与点击行为一致
      if (this.checkable) {
        this.selected = !this.selected;
        this.ldesignChange.emit(this.selected);
      } else if (this.clickable) {
        // 触发原生 click，便于外部监听
        this.el.click();
      }
    }
  }

  render() {
    const interactive = (this.clickable || this.checkable) && !this.disabled;
    const role = this.checkable ? 'checkbox' : this.clickable ? 'button' : null;

    return (
      <Host
        class={this.getClassList()}
        aria-disabled={this.disabled ? 'true' : null}
        aria-busy={this.loading ? 'true' : null}
        role={role}
        aria-checked={this.checkable ? String(this.selected) : null}
        tabindex={interactive ? 0 : null}
        onClick={this.onHostClick}
      >
        {/* 前缀插槽与图标 */}
        <slot name="prefix"></slot>
        {this.loading && (
          <span class="ldesign-tag__spinner" aria-hidden="true"></span>
        )}
        {this.icon && (
          <span class="ldesign-tag__icon" aria-hidden="true">
            <ldesign-icon name={this.icon} size={this.getIconSizeValue()}></ldesign-icon>
          </span>
        )}

        <span class="ldesign-tag__content" title={undefined}>
          <slot />
        </span>

        {/* 末尾插槽 */}
        <slot name="suffix"></slot>

        {this.closable && (
          <button
            type="button"
            class="ldesign-tag__close"
            aria-label={this.closeAriaLabel}
            onClick={this.onCloseClick}
          >
            <ldesign-icon name="x" size={this.getCloseIconSize()}></ldesign-icon>
          </button>
        )}

        {(this.badge != null || this.dot) && (
          <span class="ldesign-tag__badge" aria-hidden="true">
            {this.dot ? '' : String(this.badge)}
          </span>
        )}
      </Host>
    );
  }
}

// 简单调色板计算工具：基于传入颜色生成 base/weak/strong 三档
function parseColor(input: string): { r: number; g: number; b: number } | null {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#000';
  ctx.fillStyle = input;
  const computed = ctx.fillStyle as string;
  // 期望格式：rgb(a)?(r,g,b[,+a])
  const m = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3] };
}
function clamp(n: number) { return Math.max(0, Math.min(255, n)); }
function mix(a: number, b: number, t: number) { return clamp(Math.round(a + (b - a) * t)); }
function rgbToHex(r: number, g: number, b: number) { return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join(''); }
function computePalette(input: string) {
  const rgb = parseColor(input) || { r: 0, g: 122, b: 255 };
  // weak: 向白色混合 80%; strong: 向黑色混合 25%
  const weak = rgbToHex(mix(rgb.r, 255, 0.85), mix(rgb.g, 255, 0.85), mix(rgb.b, 255, 0.85));
  const strong = rgbToHex(mix(rgb.r, 0, 0.25), mix(rgb.g, 0, 0.25), mix(rgb.b, 0, 0.25));
  const base = rgbToHex(rgb.r, rgb.g, rgb.b);
  return { base, weak, strong };
}

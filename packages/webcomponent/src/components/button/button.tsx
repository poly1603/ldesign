import { Component, Prop, Event, EventEmitter, h, Host, Element } from '@stencil/core';
import { ButtonType, ButtonShape, Size, ButtonIconPosition, NativeButtonType, ButtonColor } from '../../types';

/**
 * Button 按钮组件
 * 用于触发操作或导航
 */
@Component({
  tag: 'ldesign-button',
  styleUrl: 'button.less',
  shadow: false,
})
export class LdesignButton {
  private static warned: Record<string, boolean> = {};

  @Element() el!: HTMLElement;
  /**
   * 按钮类型
   */
  // 对齐 AntD：默认 default
  @Prop() type: ButtonType = 'default';

  /**
   * 按钮尺寸
   */
  // 对齐 AntD：使用 middle；兼容传入 medium
  @Prop() size: Size = 'middle';

  /**
   * 语义颜色（用于 outline/dashed/text/link/ghost）
   */
  @Prop() color: ButtonColor = 'primary';

  /**
   * 危险态（AntD 风格）
   */
  @Prop() danger: boolean = false;

  /**
   * 按钮形状
   */
  @Prop() shape: ButtonShape = 'rectangle';

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否加载中
   */
  @Prop() loading: boolean = false;

  /**
   * 图标名称
   */
  @Prop() icon?: string;

  /**
   * 图标位置：left | right
   */
  @Prop() iconPosition: ButtonIconPosition = 'left';

  /**
   * 是否为块级按钮
   */
  @Prop() block: boolean = false;

  /**
   * 幽灵按钮（一般用于深色背景）
   */
  @Prop() ghost: boolean = false;

  /**
   * 原生按钮类型：button | submit | reset
   */
  /**
   * 对齐 AntD：htmlType 优先；nativeType 兼容
   */
  @Prop() htmlType?: NativeButtonType;
  @Prop() nativeType: NativeButtonType = 'button';

  /**
   * 点击事件
   */
  @Event() ldesignClick: EventEmitter<MouseEvent>;

  /**
   * 处理点击事件
   */
  private handleClick = (event: MouseEvent) => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.ldesignClick.emit(event);
  };

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.disabled || this.loading) {
      return;
    }
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      this.handleClick(mouseEvent);
    }
  };

  /**
   * 获取按钮类名
   */
  private getButtonClass(): string {
    // 兼容处理：将 legacy 类型映射到新体系
    let resolvedType: ButtonType = this.type;
    let resolvedSize: Size = this.size;

    // legacy: danger 作为 type -> 视为 primary + dangerous
    let legacyDanger = false;
    if (resolvedType === 'danger') {
      resolvedType = 'primary';
      legacyDanger = true;
    }
    // legacy: secondary -> default
    if (resolvedType === 'secondary') {
      resolvedType = 'default';
    }
    // 兼容尺寸：medium -> middle
    if (resolvedSize === 'medium') {
      resolvedSize = 'middle';
    }

    const classes = [
      'ldesign-button',
      `ldesign-button--${resolvedType}`,
      `ldesign-button--${resolvedSize}`,
      `ldesign-button--${this.shape}`,
    ];

    // 危险态（包括 legacy danger 映射）
    if (this.danger || legacyDanger) {
      classes.push('ldesign-button--dangerous');
    }

    // 颜色修饰逻辑（按类型选择默认颜色），与 AntD 行为对齐
    const hasColorAttr = this.el?.hasAttribute('color');
    let effectiveColor: ButtonColor = this.color;
    if (!hasColorAttr) {
      if (['outline', 'dashed', 'text'].includes(resolvedType as any)) {
        effectiveColor = 'default';
      } else if (resolvedType === 'link' || resolvedType === 'gradient') {
        effectiveColor = 'primary';
      }
    }

    // 需要颜色修饰的类型：outline / dashed / text / link / gradient
    const needColor = ['outline', 'text', 'dashed', 'link', 'gradient'].includes(resolvedType as any);
    if (needColor) {
      classes.push(`ldesign-button--color-${effectiveColor}`);
    }

    // ghost 默认不跟随 color，使用白色；但如果显式传入 color，则尊重用户
    if (this.ghost && hasColorAttr) {
      classes.push(`ldesign-button--color-${effectiveColor}`);
    }

    if (this.ghost) {
      classes.push('ldesign-button--ghost');
    }

    if (this.disabled) {
      classes.push('ldesign-button--disabled');
    }

    if (this.loading) {
      classes.push('ldesign-button--loading');
    }

    if (this.block) {
      classes.push('ldesign-button--block');
    }

    return classes.join(' ');
  }

  /**
   * 渲染图标
   */
  private renderIcon() {
    if (this.loading) {
      return (
        <ldesign-icon 
          name="loader-2" 
          class="ldesign-button__icon ldesign-button__icon--loading"
        />
      );
    }

    if (this.icon) {
      return (
        <ldesign-icon 
          name={this.icon} 
          class="ldesign-button__icon"
        />
      );
    }

    return null;
  };

  componentWillLoad() {
    const warnOnce = (key: string, msg: string) => {
      if (!LdesignButton.warned[key]) {
        // 控制台兼容提示
        try { console.warn(`[ldesign-button] ${msg}`); } catch (_) {}
        LdesignButton.warned[key] = true;
      }
    };

    // 兼容告警
    if (this.type === 'secondary') warnOnce('type-secondary', `type="secondary" 将在后续版本弃用，请使用 type="default"`);
    if (this.type === 'outline') warnOnce('type-outline', `type="outline" 已不再推荐使用（保留兼容），请考虑使用 type="text" 或设计规范中的 default`);
    if (this.type === 'danger') warnOnce('type-danger', `type="danger" 已废弃，请改用 danger 属性：<ldesign-button type="primary" danger>`);
    if (this.type === 'success' || this.type === 'warning') warnOnce('type-success-warning', `type="success|warning" 实底将逐步移除，请用主题/色板或 text/link 替代`);
    if (this.size === 'medium') warnOnce('size-medium', `size="medium" 将被替换为 "middle"`);
    if (this.nativeType && !this.htmlType) warnOnce('nativeType', `建议使用 htmlType 属性替代 nativeType`);
  }

  /**
   * 渲染按钮内容
   */
  private renderContent() {
    const hasIcon = this.icon || this.loading;
    const hasSlot = true; // 假设总是有slot内容

    return (
      <span class="ldesign-button__content">
        {hasIcon && this.iconPosition === 'left' && this.renderIcon()}
        {hasSlot && (
          <span class={hasIcon ? 'ldesign-button__text' : ''}>
            <slot />
          </span>
        )}
        {hasIcon && this.iconPosition === 'right' && this.renderIcon()}
      </span>
    );
  }

  render() {
    // 选择 htmlType 优先
    const computedNativeType: NativeButtonType = this.htmlType || this.nativeType || 'button';
    return (
      <Host>
        <button
          class={this.getButtonClass()}
          disabled={this.disabled || this.loading}
          onClick={this.handleClick}
          onKeyDown={this.handleKeyDown}
          type={computedNativeType}
          aria-disabled={this.disabled || this.loading ? 'true' : 'false'}
          aria-busy={this.loading ? 'true' : 'false'}
        >
          {this.renderContent()}
        </button>
      </Host>
    );
  }
}

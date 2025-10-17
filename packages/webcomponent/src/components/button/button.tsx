import { Component, Prop, Event, EventEmitter, h, Host, Element, State, Watch } from '@stencil/core';
import { ButtonType, ButtonShape, ButtonIconPosition } from '../../types';
import { ButtonSize, ButtonHTMLType, ButtonVariant, ButtonColor, PresetColors, LoadingConfig } from './interface';
import { getLoadingConfig, isTwoCNChar, spaceChildren, isUnBorderedButtonType, getSizeSuffix, combineClasses } from './utils';

/**
 * Button 按钮组件
 * 基于 Ant Design 按钮组件架构重构
 * 提供多种类型、尺寸、状态的按钮
 */
@Component({
  tag: 'ldesign-button',
  styleUrls: ['button.less', 'button.css'],
  shadow: false,
})
export class LdesignButton {
  @Element() el!: HTMLElement;

  // ==================== Props ====================
  /**
   * 按钮类型 (语法糖，推荐使用 variant 和 color)
   * @default 'default'
   */
  @Prop() type: ButtonType = 'default';

  /**
   * 按钮变体 (v5.21.0+)
   * 设置按钮的样式变体
   */
  @Prop() variant?: ButtonVariant;

  /**
   * 按钮颜色 (v5.21.0+)
   * 设置按钮的颜色
   */
  @Prop() color?: ButtonColor;

  /**
   * 按钮形状
   * @default 'default'
   */
  @Prop() shape: ButtonShape = 'default';

  /**
   * 按钮尺寸
   * @default 'middle'
   */
  @Prop() size: ButtonSize = 'middle';

  /**
   * 图标名称
   */
  @Prop() icon?: string;

  /**
   * 图标位置
   * @default 'start'
   */
  @Prop({ attribute: 'icon-position' }) iconPosition: ButtonIconPosition = 'start';

  /**
   * 是否加载中
   * @default false
   */
  @Prop() loading: boolean = false;
  
  /**
   * 加载延迟时间（毫秒）
   */
  @Prop() loadingDelay?: number;
  
  /**
   * 自定义加载图标
   */
  @Prop() loadingIcon?: string;

  /**
   * 是否禁用
   * @default false
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否为危险按钮 (语法糖，当设置 color 时会以后者为准)
   * @default false
   */
  @Prop() danger: boolean = false;

  /**
   * 是否为幽灵按钮
   * @default false
   */
  @Prop() ghost: boolean = false;

  /**
   * 是否为块级按钮
   * @default false
   */
  @Prop() block: boolean = false;

  /**
   * 原生按钮类型
   * @default 'button'
   */
  @Prop() htmlType: ButtonHTMLType = 'button';

  /**
   * 点击跳转的地址（将按钮作为 a 标签）
   */
  @Prop() href?: string;

  /**
   * 相当于 a 链接的 target 属性
   */
  @Prop() target?: string;

  /**
   * 是否自动插入空格（仅在子节点为两个中文字符时生效）
   * @default true
   * @since v5.17.0
   */
  @Prop() autoInsertSpace: boolean = true;

  // ==================== Ripple ====================
  /** 是否启用水波纹 */
  @Prop() ripple: boolean = true;
  /** 波纹颜色（默认跟随 currentColor/主题） */
  @Prop() rippleColor?: string;
  /** 波纹不透明度 */
  @Prop() rippleOpacity: number = 0.2;
  /** 扩散动画时长 */
  @Prop() rippleDuration: number = 550;
  /** 淡出时长 */
  @Prop() rippleFadeOutDuration: number = 260;
  /** 是否居中触发 */
  @Prop() rippleCentered: boolean = false;
  /** 是否不裁剪边界 */
  @Prop() rippleUnbounded: boolean = false;
  /** 缓动 */
  @Prop() rippleEasing: string = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  /** 最大并发波纹数 */
  @Prop() rippleMaxRipples: number = 6;
  /** 触发方式 */
  @Prop() rippleTrigger: 'pointerdown' | 'mousedown' | 'click' = 'pointerdown';

  // ==================== State ====================
  /**
   * 内部加载状态
   */
  @State() innerLoading: boolean = false;

  /**
   * 是否包含两个中文字符
   */
  @State() hasTwoCNChar: boolean = false;

  // ==================== Events ====================
  /**
   * 点击事件
   */
  @Event() ldesignClick!: EventEmitter<MouseEvent>;

  // ==================== Private Properties ====================
  private loadingDelayTimer?: ReturnType<typeof setTimeout>;
  private buttonRef?: HTMLButtonElement | HTMLAnchorElement;

  // ==================== Lifecycle ====================
  componentWillLoad() {
    // 初始化加载状态
    this.innerLoading = this.loading;
    this.handleLoadingChange();
  }

  componentDidLoad() {
    // 检查是否包含两个中文字符
    this.checkTwoCNChar();
  }

  componentDidUpdate() {
    // 更新时重新检查
    this.checkTwoCNChar();
  }

  disconnectedCallback() {
    // 清理定时器
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
    }
  }

  // ==================== Watchers ====================
  @Watch('loading')
  @Watch('loadingDelay')
  handleLoadingChange() {
    // 清理旧的定时器
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
      this.loadingDelayTimer = undefined;
    }
    
    if (this.loading && this.loadingDelay && this.loadingDelay > 0) {
      this.loadingDelayTimer = setTimeout(() => {
        this.innerLoading = true;
      }, this.loadingDelay);
    } else {
      this.innerLoading = this.loading;
    }
  }

  // ==================== Methods ====================
  /**
   * 检查按钮文本是否为两个中文字符
   */
  private checkTwoCNChar() {
    const buttonText = this.el?.textContent?.trim() || '';
    const needInsertSpace = this.autoInsertSpace && !this.icon && buttonText;
    
    if (needInsertSpace && isTwoCNChar(buttonText)) {
      if (!this.hasTwoCNChar) {
        this.hasTwoCNChar = true;
      }
    } else if (this.hasTwoCNChar) {
      this.hasTwoCNChar = false;
    }
  }

  /**
   * 处理点击事件
   */
  private handleClick = (event: MouseEvent) => {
    if (this.disabled || this.innerLoading) {
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
    if (this.disabled || this.innerLoading) {
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
    const prefixCls = 'ldesign-button';
    const sizeSuffix = getSizeSuffix(this.size);
    
    // 智能映射：type -> variant + color
    let effectiveVariant = this.variant;
    let effectiveColor = this.color;
    
    // 如果没有指定 variant，根据 type 推断
    if (!effectiveVariant) {
      switch (this.type) {
        case 'primary':
          effectiveVariant = 'solid';
          effectiveColor = effectiveColor || 'primary';
          break;
        case 'dashed':
          effectiveVariant = 'dashed';
          effectiveColor = effectiveColor || 'default';
          break;
        case 'text':
          effectiveVariant = 'text';
          effectiveColor = effectiveColor || 'default';
          break;
        case 'link':
          effectiveVariant = 'link';
          effectiveColor = effectiveColor || 'primary';
          break;
        case 'default':
        default:
          effectiveVariant = 'outlined';
          effectiveColor = effectiveColor || 'default';
          break;
      }
    }
    
    // 处理 danger 属性
    if (this.danger && !effectiveColor) {
      effectiveColor = 'danger';
    }
    
    // 默认颜色
    if (!effectiveColor) {
      effectiveColor = 'default';
    }
    
    return combineClasses(
      prefixCls,
      // 保留 type 类名以保持向后兼容
      this.type !== 'default' && `${prefixCls}--${this.type}`,
      // 变体和颜色（统一系统）
      `${prefixCls}--variant-${effectiveVariant}`,
      `${prefixCls}--color-${effectiveColor}`,
      // danger 修饰
      this.danger && `${prefixCls}--danger`,
      // 形状
      this.shape !== 'default' && `${prefixCls}--${this.shape}`,
      // 尺寸
      sizeSuffix && `${prefixCls}--${sizeSuffix}`,
      // 状态
      this.ghost && `${prefixCls}--ghost`,
      this.disabled && `${prefixCls}--disabled`,
      this.innerLoading && `${prefixCls}--loading`,
      this.block && `${prefixCls}--block`,
      // 特殊状态
      this.hasTwoCNChar && this.autoInsertSpace && `${prefixCls}--two-chinese-chars`,
      // 仅图标
      !this.el?.textContent?.trim() && (this.icon || this.innerLoading) && `${prefixCls}--icon-only`,
      // 图标位置
      this.iconPosition === 'end' && `${prefixCls}--icon-end`
    );
  }

  /**
   * 渲染图标
   */
  private renderIcon() {
    if (this.innerLoading) {
      // 支持自定义加载图标
      const loadingIconName = this.loadingIcon || 'loader-2';
      
      return (
        <ldesign-icon 
          name={loadingIconName} 
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
  }

  /**
   * 渲染按钮内容
   */
  private renderContent() {
    const hasIcon = !!(this.icon || this.innerLoading);
    const children = <slot />;
    
    // 如果需要插入空格且是两个中文字符
    const processedChildren = this.hasTwoCNChar && this.autoInsertSpace
      ? spaceChildren(children, true)
      : children;
    
    // 圆形按钮只显示图标
    if (this.shape === 'circle' && hasIcon) {
      return (
        <span class="ldesign-button__content">
          {this.renderIcon()}
        </span>
      );
    }

    return (
      <span class="ldesign-button__content">
        {hasIcon && this.iconPosition === 'start' && this.renderIcon()}
        {processedChildren && (
          <span class="ldesign-button__text">
            {processedChildren}
          </span>
        )}
        {hasIcon && this.iconPosition === 'end' && this.renderIcon()}
      </span>
    );
  }

  /**
   * 渲染为链接
   */
  private renderAsLink() {
    const rippleEl = this.ripple ? (
      <ldesign-ripple
        color={this.rippleColor}
        opacity={this.rippleOpacity}
        duration={this.rippleDuration}
        fadeOutDuration={this.rippleFadeOutDuration}
        centered={this.rippleCentered}
        unbounded={this.rippleUnbounded}
        easing={this.rippleEasing}
        maxRipples={this.rippleMaxRipples}
        trigger={this.rippleTrigger}
      />
    ) : null;

    return (
      <a
        ref={(el) => this.buttonRef = el as HTMLAnchorElement}
        class={this.getButtonClass()}
        href={this.disabled || this.innerLoading ? undefined : this.href}
        target={this.target}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        tabIndex={this.disabled || this.innerLoading ? -1 : 0}
        aria-disabled={this.disabled || this.innerLoading ? 'true' : 'false'}
      >
        {this.renderContent()}
        {rippleEl}
      </a>
    );
  }

  /**
   * 渲染为按钮
   */
  private renderAsButton() {
    const rippleEl = this.ripple ? (
      <ldesign-ripple
        color={this.rippleColor}
        opacity={this.rippleOpacity}
        duration={this.rippleDuration}
        fadeOutDuration={this.rippleFadeOutDuration}
        centered={this.rippleCentered}
        unbounded={this.rippleUnbounded}
        easing={this.rippleEasing}
        maxRipples={this.rippleMaxRipples}
        trigger={this.rippleTrigger}
      />
    ) : null;

    return (
      <button
        ref={(el) => this.buttonRef = el as HTMLButtonElement}
        class={this.getButtonClass()}
        disabled={this.disabled || this.innerLoading}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        type={this.htmlType}
        aria-disabled={this.disabled || this.innerLoading ? 'true' : 'false'}
        aria-busy={this.innerLoading ? 'true' : 'false'}
      >
        {this.renderContent()}
        {rippleEl}
      </button>
    );
  }

  render() {
    return (
      <Host>
        {this.href ? this.renderAsLink() : this.renderAsButton()}
      </Host>
    );
  }
}

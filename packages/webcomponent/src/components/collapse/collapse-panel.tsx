import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';

let idSeed = 0;

/**
 * CollapsePanel 折叠面板项
 */
@Component({
  tag: 'ldesign-collapse-panel',
  styleUrl: 'collapse-panel.less',
  shadow: false,
})
export class LdesignCollapsePanel {
  @Element() el!: HTMLElement;

  /** 面板唯一标识（由父级匹配） */
  @Prop({ mutable: true }) name?: string;
  /** 头部文本（可用 slot="header" 覆盖） */
  @Prop() header?: string;
  /** 右侧附加区（可用 slot="extra" 覆盖） */
  @Prop() extra?: string;
  /** 禁用 */
  @Prop() disabled: boolean = false;
  /** 展开图标名称（默认 chevron-right） */
  @Prop() expandIcon: string = 'chevron-right';
  /** 图标位置（由父级传入，也可单独覆盖） */
  @Prop({ mutable: true, reflect: true }) expandIconPlacement: 'left' | 'right' = 'left';

  /** 首次激活才渲染内容（懒渲染） */
  @Prop() lazy: boolean = false;
  /** 收起后是否销毁内容（优先级高于 lazy） */
  @Prop() destroyOnClose: boolean = false;

  /** 激活状态（由父级控制） */
  @Prop({ mutable: true, reflect: true }) active: boolean = false;
  
  /** 以下属性由父级传递 */
  /** 是否显示展开图标 */
  @Prop({ mutable: true }) showExpandIcon: boolean = true;
  /** 动画持续时间（毫秒） */
  @Prop({ mutable: true }) animationDuration: number = 200;
  /** 动画缓动函数 */
  @Prop({ mutable: true }) animationEasing: string = 'ease';
  /** 尺寸变体 */
  @Prop({ mutable: true }) size: 'small' | 'medium' | 'large' = 'medium';
  /** 主题颜色 */
  @Prop({ mutable: true }) theme: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'default';
  /** 嵌套层级 */
  @Prop({ mutable: true }) nestingLevel: number = 0;
  /** 头部背景色 */
  @Prop() headerBackground?: string;
  /** 是否加载中 */
  @Prop() loading: boolean = false;
  /** 空状态文本 */
  @Prop() emptyText?: string;
  /** 内容内边距 */
  @Prop() contentPadding?: string;
  /** 自定义折叠图标 */
  @Prop() collapsedIcon?: string;
  /** 自定义展开图标 */
  @Prop() expandedIcon?: string;
  /** 是否显示分隔线 */
  @Prop() showDivider: boolean = true;
  /** 图标旋转角度 */
  @Prop() iconRotation: number = 90;
  /** 内容动画类型 */
  @Prop() contentAnimation: 'none' | 'fade' | 'slide' | 'scale' | 'slide-fade' = 'fade';
  /** 动画曲线预设 */
  @Prop() animationPreset: 'default' | 'spring' | 'bounce' | 'smooth' | 'sharp' = 'default';
  /** 是否反向旋转图标 */
  @Prop() reverseIconRotation: boolean = false;
  /** 动画延迟 */
  @Prop() animationDelay: number = 0;
  /** 内容淡入延迟 */
  @Prop() contentFadeDelay: number = 100;
  /** 是否可排序（由父级传入） */
  @Prop({ mutable: true }) sortable: boolean = false;

  /** 冒泡给父级，用于切换 */
  @Event() ldesignCollapseItemToggle!: EventEmitter<{ name: string }>;
  /** 拖拽事件 */
  @Event() ldesignPanelDragStart!: EventEmitter<{ name: string; event: DragEvent }>;
  @Event() ldesignPanelDragEnd!: EventEmitter<{ event: DragEvent }>;
  @Event() ldesignPanelDragOver!: EventEmitter<{ name: string; event: DragEvent }>;
  @Event() ldesignPanelDragLeave!: EventEmitter<{ name: string; event: DragEvent }>;
  @Event() ldesignPanelDrop!: EventEmitter<{ name: string; event: DragEvent }>;

  @State() hasRendered: boolean = false;
  @State() contentHeight: string = '0px';
  @State() isAnimating: boolean = false;
  @State() contentVisible: boolean = false;
  @State() iconRotationDeg: number = 0;
  @State() touchStartY: number = 0;
  @State() swipeDirection: 'up' | 'down' | null = null;

  private headerId = `ld-col-h-${++idSeed}`;
  private contentId = `ld-col-c-${idSeed}`;
  private contentRef?: HTMLDivElement;

  componentWillLoad() {
    if (!this.name) this.name = `panel-${idSeed}`;
    if (!this.lazy) this.hasRendered = true;
    if (this.active) {
      this.hasRendered = true;
      this.contentVisible = true;
      this.iconRotationDeg = this.iconRotation;
    }
  }

  componentDidLoad() {
    // 初始化内容高度，无闪烁
    const el = this.contentRef;
    if (!el) return;
    
    const easing = this.getAnimationEasing();
    el.style.display = 'block';
    el.style.transition = `height ${this.animationDuration}ms ${easing}`;
    
    if (this.active) {
      el.style.overflow = '';
      el.style.height = 'auto';
      this.contentHeight = 'auto';
      this.contentVisible = true;
      this.iconRotationDeg = this.iconRotation;
    } else {
      el.style.overflow = 'hidden';
      el.style.height = '0px';
      this.contentHeight = '0px';
      this.contentVisible = false;
      this.iconRotationDeg = 0;
    }
  }

  @Watch('active')
  onActiveChange(isActive: boolean) {
    if (isActive) {
      this.hasRendered = true;
      this.animateOpen();
    } else {
      this.animateClose();
    }
  }

  private prefersReduceMotion(): boolean {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch { return false; }
  }
  
  private getAnimationEasing(): string {
    switch (this.animationPreset) {
      case 'spring':
        return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      case 'bounce':
        return 'cubic-bezier(0.68, -0.55, 0.265, 1.35)';
      case 'smooth':
        return 'cubic-bezier(0.4, 0, 0.2, 1)';
      case 'sharp':
        return 'cubic-bezier(0.4, 0, 0.6, 1)';
      default:
        return this.animationEasing;
    }
  }
  
  private animateIcon(open: boolean) {
    const rotation = open ? this.iconRotation : 0;
    this.iconRotationDeg = this.reverseIconRotation ? -rotation : rotation;
  }

  private animateOpen() {
    const el = this.contentRef;
    if (!el) return;

    this.isAnimating = true;
    this.animateIcon(true);
    
    // 若用户偏好减少动画，直接展开
    if (this.prefersReduceMotion()) {
      el.style.display = 'block';
      el.style.overflow = '';
      el.style.height = 'auto';
      this.contentHeight = 'auto';
      this.contentVisible = true;
      this.isAnimating = false;
      return;
    }

    const easing = this.getAnimationEasing();
    
    // 设置动画延迟
    if (this.animationDelay > 0) {
      setTimeout(() => this.performOpenAnimation(el, easing), this.animationDelay);
    } else {
      this.performOpenAnimation(el, easing);
    }
  }
  
  private performOpenAnimation(el: HTMLDivElement, easing: string) {
    el.style.display = 'block';
    el.style.overflow = 'hidden';
    el.style.height = '0px';
    el.style.transition = `height ${this.animationDuration}ms ${easing}`;
    
    requestAnimationFrame(() => {
      const sh = el.scrollHeight;
      el.style.height = `${sh}px`;
      this.contentHeight = `${sh}px`;
      
      // 内容渐显动画
      if (this.contentAnimation !== 'none') {
        setTimeout(() => {
          this.contentVisible = true;
        }, this.contentFadeDelay);
      } else {
        this.contentVisible = true;
      }
    });
    
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      el.style.height = 'auto';
      el.style.overflow = '';
      this.contentHeight = 'auto';
      this.isAnimating = false;
    };
    el.addEventListener('transitionend', onEnd);
  }

  private animateClose() {
    const el = this.contentRef;
    if (!el) return;

    this.isAnimating = true;
    this.animateIcon(false);
    this.contentVisible = false;
    
    if (this.prefersReduceMotion()) {
      // 直接收起
      el.style.overflow = 'hidden';
      el.style.height = '0px';
      this.contentHeight = '0px';
      this.isAnimating = false;
      return;
    }

    const easing = this.getAnimationEasing();
    const h = el.scrollHeight;
    el.style.overflow = 'hidden';
    el.style.height = `${h}px`;
    el.style.transition = `height ${this.animationDuration}ms ${easing}`;
    
    // 先隐藏内容，再收起高度
    if (this.contentAnimation !== 'none') {
      this.contentVisible = false;
    }
    
    requestAnimationFrame(() => {
      el.style.height = '0px';
      this.contentHeight = '0px';
    });
    
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      this.isAnimating = false;
    };
    el.addEventListener('transitionend', onEnd);
  }

  private shouldRender() {
    if (this.destroyOnClose) return this.active;
    if (this.lazy) return this.active || this.hasRendered;
    return true;
  }

  private onHeaderClick = (e: MouseEvent) => {
    e.preventDefault();
    if (this.disabled) return;
    this.ldesignCollapseItemToggle.emit({ name: this.name! });
  };

  private onHeaderKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.ldesignCollapseItemToggle.emit({ name: this.name! });
    }
  };
  
  private onTouchStart = (e: TouchEvent) => {
    if (this.disabled) return;
    this.touchStartY = e.touches[0].clientY;
  };
  
  private onTouchMove = (e: TouchEvent) => {
    if (this.disabled) return;
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - this.touchStartY;
    
    if (Math.abs(deltaY) > 30) {
      this.swipeDirection = deltaY > 0 ? 'down' : 'up';
    }
  };
  
  private onTouchEnd = (e: TouchEvent) => {
    if (this.disabled || !this.swipeDirection) return;
    
    // 向下滑动展开，向上滑动收起
    if ((this.swipeDirection === 'down' && !this.active) || 
        (this.swipeDirection === 'up' && this.active)) {
      e.preventDefault();
      this.ldesignCollapseItemToggle.emit({ name: this.name! });
    }
    
    this.swipeDirection = null;
  };
  
  // 拖拽事件处理
  private handleDragStart = (e: DragEvent) => {
    if (!this.sortable || this.disabled) return;
    e.stopPropagation();
    this.ldesignPanelDragStart.emit({ name: this.name!, event: e });
  };
  
  private handleDragEnd = (e: DragEvent) => {
    if (!this.sortable) return;
    e.stopPropagation();
    this.ldesignPanelDragEnd.emit({ event: e });
  };
  
  private handleDragOver = (e: DragEvent) => {
    if (!this.sortable) return;
    e.stopPropagation();
    this.ldesignPanelDragOver.emit({ name: this.name!, event: e });
  };
  
  private handleDragLeave = (e: DragEvent) => {
    if (!this.sortable) return;
    e.stopPropagation();
    this.ldesignPanelDragLeave.emit({ name: this.name!, event: e });
  };
  
  private handleDrop = (e: DragEvent) => {
    if (!this.sortable) return;
    e.stopPropagation();
    this.ldesignPanelDrop.emit({ name: this.name!, event: e });
  };

  private getIcon() {
    if (!this.showExpandIcon) return null;
    
    let iconName = this.expandIcon;
    if (this.active && this.expandedIcon) {
      iconName = this.expandedIcon;
    } else if (!this.active && this.collapsedIcon) {
      iconName = this.collapsedIcon;
    }
    
    // 使用CSS类来处理动画，不使用内联样式
    return (
      <span 
        class={{
          'ldesign-collapse-panel__arrow': true,
          'ldesign-collapse-panel__arrow--animating': this.isAnimating,
        }} 
        aria-hidden="true"
      >
        <ldesign-icon name={iconName} size="small" />
      </span>
    );
  }
  
  private renderContent() {
    if (!this.shouldRender()) return null;
    
    if (this.loading) {
      return (
        <div class="ldesign-collapse-panel__loading">
          <ldesign-icon name="loading" spin size="medium" />
          <span>加载中...</span>
        </div>
      );
    }
    
    const content = <slot></slot>;
    const isEmpty = !this.el.querySelector('[slot]:not([slot="header"]):not([slot="extra"])');
    
    if (isEmpty && this.emptyText) {
      return (
        <div class="ldesign-collapse-panel__empty">
          <ldesign-icon name="inbox" size="large" />
          <span>{this.emptyText}</span>
        </div>
      );
    }
    
    // 内容动画包装器
    const contentClass = {
      'ldesign-collapse-panel__content-wrapper': true,
      [`ldesign-collapse-panel__content-wrapper--${this.contentAnimation}`]: this.contentAnimation !== 'none',
      'ldesign-collapse-panel__content-wrapper--visible': this.contentVisible,
    };
    
    return (
      <div class={contentClass}>
        {content}
      </div>
    );
  }
  
  render() {
    const cls = {
      'ldesign-collapse-panel': true,
      'ldesign-collapse-panel--active': this.active,
      'ldesign-collapse-panel--disabled': this.disabled,
      [`ldesign-collapse-panel--icon-${this.expandIconPlacement}`]: true,
      [`ldesign-collapse-panel--${this.size}`]: true,
      [`ldesign-collapse-panel--${this.theme}`]: this.theme !== 'default',
      'ldesign-collapse-panel--no-divider': !this.showDivider,
      'ldesign-collapse-panel--loading': this.loading,
      [`ldesign-collapse-panel--level-${this.nestingLevel}`]: this.nestingLevel > 0,
      'ldesign-collapse-panel--sortable': this.sortable,
    } as any;

    const icon = this.getIcon();

    return (
      <Host 
        class={cls}
        onDragOver={(e) => this.handleDragOver(e)}
        onDragLeave={(e) => this.handleDragLeave(e)}
        onDrop={(e) => this.handleDrop(e)}
      >
        <div
          class="ldesign-collapse-panel__header"
          role="button"
          tabindex={this.disabled ? -1 : 0}
          id={this.headerId}
          aria-controls={this.contentId}
          aria-expanded={this.active ? 'true' : 'false'}
          aria-disabled={this.disabled ? 'true' : 'false'}
          draggable={this.sortable}
          onDragStart={(e) => this.handleDragStart(e)}
          onDragEnd={(e) => this.handleDragEnd(e)}
          onClick={this.onHeaderClick}
          onKeyDown={this.onHeaderKeyDown}
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
          style={{
            backgroundColor: this.headerBackground,
            paddingLeft: this.nestingLevel > 0 ? `${16 + this.nestingLevel * 20}px` : undefined,
          }}
        >
          {this.expandIconPlacement === 'left' && icon}
          <div class="ldesign-collapse-panel__header-main">
            <slot name="header">{this.header}</slot>
          </div>
          <div class="ldesign-collapse-panel__extra">
            <slot name="extra">{this.extra}</slot>
          </div>
          {this.expandIconPlacement === 'right' && icon}
        </div>

        <div
          class="ldesign-collapse-panel__content"
          id={this.contentId}
          role="region"
          aria-labelledby={this.headerId}
          aria-live={this.loading ? 'polite' : undefined}
          ref={el => (this.contentRef = el as HTMLDivElement)}
        >
          <div 
            class="ldesign-collapse-panel__content-inner"
            style={{ padding: this.contentPadding }}
          >
            {this.renderContent()}
          </div>
        </div>
      </Host>
    );
  }
}
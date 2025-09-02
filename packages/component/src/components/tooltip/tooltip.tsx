import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import { generateId } from '../../utils';

/**
 * Tooltip 提示框组件
 * 
 * 简单的文字提示气泡框，在鼠标悬停时显示
 * 
 * @example
 * ```tsx
 * <ld-tooltip content="这是一个提示">
 *   <button>悬停显示提示</button>
 * </ld-tooltip>
 * ```
 */
@Component({
  tag: 'ld-tooltip',
  styleUrl: 'tooltip.less',
  shadow: true,
})
export class Tooltip {
  @Element() el!: HTMLElement;

  /**
   * 提示内容
   */
  @Prop() content?: string;

  /**
   * 显示位置
   */
  @Prop() placement: TooltipPlacement = 'top';

  /**
   * 触发方式
   */
  @Prop() trigger: 'hover' | 'click' | 'focus' | 'manual' = 'hover';

  /**
   * 是否可见
   */
  @Prop({ mutable: true, reflect: true }) visible: boolean = false;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 显示延迟（毫秒）
   */
  @Prop() showDelay: number = 100;

  /**
   * 隐藏延迟（毫秒）
   */
  @Prop() hideDelay: number = 100;

  /**
   * 箭头是否指向目标元素中心
   */
  @Prop() arrowPointAtCenter: boolean = false;

  /**
   * 自定义样式类名
   */
  @Prop() customClass?: string;

  /**
   * z-index 层级
   */
  @Prop() zIndex: number = 1060;

  /**
   * 内部状态：提示框 ID
   */
  @State() tooltipId: string = generateId('tooltip');

  /**
   * 内部状态：是否正在显示动画
   */
  @State() isAnimating: boolean = false;

  /**
   * 内部状态：提示框位置
   */
  @State() position: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * 内部状态：实际显示位置
   */
  @State() actualPlacement: TooltipPlacement = 'top';

  /**
   * 显示事件
   */
  @Event() ldShow!: EventEmitter<void>;

  /**
   * 隐藏事件
   */
  @Event() ldHide!: EventEmitter<void>;

  /**
   * 私有属性：显示定时器
   */
  private showTimer?: number;

  /**
   * 私有属性：隐藏定时器
   */
  private hideTimer?: number;

  /**
   * 私有属性：触发元素
   */
  private triggerElement?: HTMLElement;

  /**
   * 私有属性：提示框元素
   */
  private tooltipElement?: HTMLElement;

  /**
   * 监听可见性变化
   */
  @Watch('visible')
  onVisibleChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      if (newValue) {
        this.handleShow();
      } else {
        this.handleHide();
      }
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.setupTriggerElement();
    this.setupEventListeners();
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    this.clearTimers();
    this.removeEventListeners();
  }

  /**
   * 显示提示框
   */
  @Method()
  async show(): Promise<void> {
    if (this.disabled) return;
    this.visible = true;
  }

  /**
   * 隐藏提示框
   */
  @Method()
  async hide(): Promise<void> {
    this.visible = false;
  }

  /**
   * 切换显示状态
   */
  @Method()
  async toggle(): Promise<void> {
    if (this.visible) {
      await this.hide();
    } else {
      await this.show();
    }
  }

  /**
   * 更新位置
   */
  @Method()
  async updatePosition(): Promise<void> {
    if (this.visible && this.triggerElement) {
      this.calculatePosition();
    }
  }

  /**
   * 设置触发元素
   */
  private setupTriggerElement() {
    const slot = this.el.shadowRoot?.querySelector('slot');
    if (slot) {
      const assignedElements = slot.assignedElements();
      if (assignedElements.length > 0) {
        this.triggerElement = assignedElements[0] as HTMLElement;
      }
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    if (!this.triggerElement) return;

    switch (this.trigger) {
      case 'hover':
        this.triggerElement.addEventListener('mouseenter', this.handleMouseEnter);
        this.triggerElement.addEventListener('mouseleave', this.handleMouseLeave);
        break;
      case 'click':
        this.triggerElement.addEventListener('click', this.handleClick);
        document.addEventListener('click', this.handleDocumentClick);
        break;
      case 'focus':
        this.triggerElement.addEventListener('focus', this.handleFocus);
        this.triggerElement.addEventListener('blur', this.handleBlur);
        break;
    }

    // 监听窗口大小变化和滚动
    window.addEventListener('resize', this.handleWindowChange);
    window.addEventListener('scroll', this.handleWindowChange, true);
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners() {
    if (!this.triggerElement) return;

    this.triggerElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.triggerElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.triggerElement.removeEventListener('click', this.handleClick);
    this.triggerElement.removeEventListener('focus', this.handleFocus);
    this.triggerElement.removeEventListener('blur', this.handleBlur);

    document.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('resize', this.handleWindowChange);
    window.removeEventListener('scroll', this.handleWindowChange, true);
  }

  /**
   * 处理鼠标进入
   */
  private handleMouseEnter = () => {
    this.clearHideTimer();
    this.showTimer = window.setTimeout(() => {
      this.show();
    }, this.showDelay);
  };

  /**
   * 处理鼠标离开
   */
  private handleMouseLeave = () => {
    this.clearShowTimer();
    this.hideTimer = window.setTimeout(() => {
      this.hide();
    }, this.hideDelay);
  };

  /**
   * 处理点击
   */
  private handleClick = (event: Event) => {
    event.stopPropagation();
    this.toggle();
  };

  /**
   * 处理文档点击
   */
  private handleDocumentClick = (event: Event) => {
    if (this.visible && !this.el.contains(event.target as Node)) {
      this.hide();
    }
  };

  /**
   * 处理获得焦点
   */
  private handleFocus = () => {
    this.show();
  };

  /**
   * 处理失去焦点
   */
  private handleBlur = () => {
    this.hide();
  };

  /**
   * 处理窗口变化
   */
  private handleWindowChange = () => {
    if (this.visible) {
      this.updatePosition();
    }
  };

  /**
   * 处理显示
   */
  private handleShow() {
    if (this.disabled) return;

    this.isAnimating = true;
    this.calculatePosition();
    this.ldShow.emit();

    // 动画结束后设置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, 200);
  }

  /**
   * 处理隐藏
   */
  private handleHide() {
    this.isAnimating = true;
    this.ldHide.emit();

    // 动画结束后设置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, 200);
  }

  /**
   * 计算位置
   */
  private calculatePosition() {
    if (!this.triggerElement || !this.tooltipElement) return;

    const triggerRect = this.triggerElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let placement = this.placement;
    let x = 0;
    let y = 0;

    // 根据位置计算坐标
    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'top-start':
        x = triggerRect.left;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'top-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'bottom-start':
        x = triggerRect.left;
        y = triggerRect.bottom + 8;
        break;
      case 'bottom-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'left-start':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top;
        break;
      case 'left-end':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.bottom - tooltipRect.height;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right-start':
        x = triggerRect.right + 8;
        y = triggerRect.top;
        break;
      case 'right-end':
        x = triggerRect.right + 8;
        y = triggerRect.bottom - tooltipRect.height;
        break;
    }

    // 边界检测和自动调整
    if (x < 8) {
      x = 8;
    } else if (x + tooltipRect.width > viewportWidth - 8) {
      x = viewportWidth - tooltipRect.width - 8;
    }

    if (y < 8) {
      // 如果顶部空间不足，尝试显示在底部
      if (placement.startsWith('top')) {
        placement = placement.replace('top', 'bottom') as TooltipPlacement;
        y = triggerRect.bottom + 8;
      } else {
        y = 8;
      }
    } else if (y + tooltipRect.height > viewportHeight - 8) {
      // 如果底部空间不足，尝试显示在顶部
      if (placement.startsWith('bottom')) {
        placement = placement.replace('bottom', 'top') as TooltipPlacement;
        y = triggerRect.top - tooltipRect.height - 8;
      } else {
        y = viewportHeight - tooltipRect.height - 8;
      }
    }

    this.position = { x, y };
    this.actualPlacement = placement;
  }

  /**
   * 清除显示定时器
   */
  private clearShowTimer() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
  }

  /**
   * 清除隐藏定时器
   */
  private clearHideTimer() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

  /**
   * 清除所有定时器
   */
  private clearTimers() {
    this.clearShowTimer();
    this.clearHideTimer();
  }

  /**
   * 获取提示框样式
   */
  private getTooltipStyle() {
    return {
      left: `${this.position.x}px`,
      top: `${this.position.y}px`,
      zIndex: this.zIndex.toString(),
    };
  }

  /**
   * 渲染提示框
   */
  private renderTooltip() {
    if (!this.visible && !this.isAnimating) {
      return null;
    }

    const tooltipClass = {
      'ld-tooltip__popup': true,
      'ld-tooltip__popup--visible': this.visible,
      [`ld-tooltip__popup--${this.actualPlacement}`]: true,
      [this.customClass]: !!this.customClass,
    };

    return (
      <div
        class={tooltipClass}
        style={this.getTooltipStyle()}
        ref={el => this.tooltipElement = el}
        role="tooltip"
        id={this.tooltipId}
      >
        <div class="ld-tooltip__content">
          {this.content}
        </div>
        <div class="ld-tooltip__arrow"></div>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div
          class="ld-tooltip__trigger"
          aria-describedby={this.visible ? this.tooltipId : undefined}
        >
          <slot />
        </div>
        {this.renderTooltip()}
      </Host>
    );
  }
}

// 类型定义
export type TooltipPlacement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from '@stencil/core';

/**
 * @slot trigger - 触发器内容
 * @slot default - 面板内容
 */
@Component({
  tag: 'l-dropdown-panel',
  styleUrl: 'dropdown-panel.less',
  shadow: false,
})
export class DropdownPanel {
  @Element() el!: HTMLElement;

  /**
   * 面板是否可见
   */
  @Prop({ mutable: true, reflect: true }) visible: boolean = false;

  /**
   * 面板弹出位置，'top' 或 'bottom'
   */
  @Prop() placement: 'top' | 'bottom' = 'bottom';

  /**
   * 遮罩层背景色
   */
  @Prop() maskBackground: string = 'rgba(0, 0, 0, 0.3)';

  /**
   * 面板最大高度
   */
  @Prop() maxHeight: string = '60vh';

  /**
   * 动画持续时间（毫秒）
   */
  @Prop() duration: number = 300;

  /**
   * 点击遮罩层是否关闭
   */
  @Prop() maskClosable: boolean = true;

  /**
   * 面板显示/隐藏时触发
   */
  @Event() visibleChange!: EventEmitter<boolean>;

  @State() triggerRect: DOMRect | null = null;
  @State() panelHeight: number = 0;

  private triggerRef?: HTMLDivElement;
  private panelRef?: HTMLDivElement;
  private resizeObserver?: ResizeObserver;

  componentDidLoad() {
    // 监听窗口大小变化
    this.resizeObserver = new ResizeObserver(() => {
      if (this.visible) {
        this.updateTriggerRect();
      }
    });
    this.resizeObserver.observe(document.body);

    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll, true);
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    window.removeEventListener('scroll', this.handleScroll, true);
  }

  @Watch('visible')
  onVisibleChange(newValue: boolean) {
    if (newValue) {
      this.updateTriggerRect();
      this.lockBodyScroll();
      // 计算面板高度
      setTimeout(() => {
        if (this.panelRef) {
          this.panelHeight = this.panelRef.scrollHeight;
        }
      }, 0);
    } else {
      this.unlockBodyScroll();
    }
    this.visibleChange.emit(newValue);
  }

  /**
   * 显示面板
   */
  @Method()
  async show() {
    this.visible = true;
  }

  /**
   * 隐藏面板
   */
  @Method()
  async hide() {
    this.visible = false;
  }

  /**
   * 切换面板显示状态
   */
  @Method()
  async toggle() {
    this.visible = !this.visible;
  }

  private handleScroll = () => {
    if (this.visible) {
      this.updateTriggerRect();
    }
  };

  private updateTriggerRect = () => {
    if (this.triggerRef) {
      this.triggerRect = this.triggerRef.getBoundingClientRect();
    }
  };

  private handleTriggerClick = () => {
    this.toggle();
  };

  private handleMaskClick = (e: MouseEvent) => {
    if (this.maskClosable && e.target === e.currentTarget) {
      this.hide();
    }
  };

  private lockBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  private unlockBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }

  private getPanelStyle() {
    if (!this.triggerRect) return {};

    const style: any = {
      maxHeight: this.maxHeight,
      transition: `transform ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    if (this.placement === 'bottom') {
      // 从触发器下方滑出
      style.top = `${this.triggerRect.bottom}px`;
      style.left = '0';
      style.right = '0';
    } else {
      // 从触发器上方滑出
      style.bottom = `${window.innerHeight - this.triggerRect.top}px`;
      style.left = '0';
      style.right = '0';
    }

    return style;
  }

  private getMaskStyle() {
    if (!this.triggerRect) return {};

    const style: any = {
      background: this.maskBackground,
      transition: `opacity ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    if (this.placement === 'bottom') {
      // 遮罩显示在触发器下方到底部
      style.top = `${this.triggerRect.bottom}px`;
      style.bottom = '0';
    } else {
      // 遮罩显示在触发器上方到顶部
      style.top = '0';
      style.bottom = `${window.innerHeight - this.triggerRect.top}px`;
    }

    return style;
  }

  render() {
    const panelClasses = {
      'l-dropdown-panel__panel': true,
      'l-dropdown-panel__panel--visible': this.visible,
      [`l-dropdown-panel__panel--${this.placement}`]: true,
    };

    const maskClasses = {
      'l-dropdown-panel__mask': true,
      'l-dropdown-panel__mask--visible': this.visible,
    };

    return (
      <Host class="l-dropdown-panel">
        {/* 触发器 */}
        <div
          class="l-dropdown-panel__trigger"
          ref={el => (this.triggerRef = el)}
          onClick={this.handleTriggerClick}
        >
          <slot name="trigger" />
        </div>

        {/* 遮罩层和面板容器 */}
        {(this.visible || this.triggerRect) && (
          <div class="l-dropdown-panel__overlay">
            {/* 遮罩层 */}
            <div
              class={maskClasses}
              style={this.getMaskStyle()}
              onClick={this.handleMaskClick}
            />

            {/* 面板 */}
            <div
              class={panelClasses}
              style={this.getPanelStyle()}
              ref={el => (this.panelRef = el)}
            >
              <div class="l-dropdown-panel__content">
                <slot />
              </div>
            </div>
          </div>
        )}
      </Host>
    );
  }
}

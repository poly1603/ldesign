import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { computePosition, flip, shift, offset, arrow, autoUpdate, Placement } from '@floating-ui/dom';

export type PopupTrigger = 'hover' | 'click' | 'focus' | 'manual';
export type PopupPlacement = Placement;

/**
 * Popup 弹出层组件
 * 基于 @floating-ui/dom 实现
 */
@Component({
  tag: 'ldesign-popup',
  styleUrl: 'popup.less',
  shadow: false,
})
export class LdesignPopup {
  @Element() el!: HTMLElement;

  /**
   * 是否显示弹出层
   */
  @Prop({ mutable: true }) visible: boolean = false;

  /**
   * 弹出层位置
   */
  @Prop() placement: PopupPlacement = 'bottom';

  /**
   * 触发方式
   */
  @Prop() trigger: PopupTrigger = 'hover';

  /**
   * 弹出层内容
   */
  @Prop() content?: string;

  /**
   * 弹出层标题
   */
  @Prop() popupTitle?: string;

  /**
   * 偏移量
   */
  @Prop() offsetDistance: number = 8;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否显示箭头
   */
  @Prop() arrow: boolean = true;

  /**
   * 弹出层宽度
   */
  @Prop() width?: number | string;

  /**
   * 最大宽度
   */
  @Prop() maxWidth?: number | string;

  /**
   * 延迟显示时间（毫秒）
   */
  @Prop() showDelay: number = 0;

  /**
   * 延迟隐藏时间（毫秒）
   */
  @Prop() hideDelay: number = 0;

  /**
   * 弹出层状态
   */
  @State() isVisible: boolean = false;

  /**
   * 弹出层元素引用
   */
  private popupElement?: HTMLElement;

  /**
   * 触发器元素引用
   */
  private triggerElement?: HTMLElement;

  /**
   * 箭头元素引用
   */
  private arrowElement?: HTMLElement;

  /**
   * 清理函数
   */
  private cleanup?: () => void;

  /**
   * 定时器
   */
  private showTimer?: number;
  private hideTimer?: number;

  /**
   * 显示状态变化事件
   */
  @Event() ldesignVisibleChange: EventEmitter<boolean>;

  /**
   * 监听visible属性变化
   */
  @Watch('visible')
  watchVisible(newValue: boolean) {
    if (newValue !== this.isVisible) {
      this.setVisibleInternal(newValue);
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.triggerElement = this.el.querySelector('.ldesign-popup__trigger') as HTMLElement;
    this.popupElement = this.el.querySelector('.ldesign-popup__content') as HTMLElement;
    this.arrowElement = this.el.querySelector('.ldesign-popup__arrow') as HTMLElement;

    if (this.triggerElement && !this.disabled) {
      this.bindEvents();
    }

    if (this.visible) {
      this.setVisible(true);
    }
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    this.cleanup?.();
    this.clearTimers();
  }

  /**
   * 绑定事件
   */
  private bindEvents() {
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
  }



  /**
   * 事件处理器
   */
  private handleMouseEnter = () => {
    this.show();
  };

  private handleMouseLeave = () => {
    this.hide();
  };

  private handleClick = (event: Event) => {
    event.stopPropagation();
    this.toggle();
  };

  private handleDocumentClick = (event: Event) => {
    if (!this.el.contains(event.target as Node)) {
      this.hide();
    }
  };

  private handleFocus = () => {
    this.show();
  };

  private handleBlur = () => {
    this.hide();
  };

  /**
   * 显示弹出层
   */
  show() {
    if (this.disabled || this.isVisible) return;

    this.clearTimers();
    if (this.showDelay > 0) {
      this.showTimer = window.setTimeout(() => {
        this.setVisible(true);
      }, this.showDelay);
    } else {
      this.setVisible(true);
    }
  }

  /**
   * 隐藏弹出层
   */
  hide() {
    if (!this.isVisible) return;

    this.clearTimers();
    if (this.hideDelay > 0) {
      this.hideTimer = window.setTimeout(() => {
        this.setVisible(false);
      }, this.hideDelay);
    } else {
      this.setVisible(false);
    }
  }

  /**
   * 切换显示状态
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 设置显示状态（内部使用，不触发Watch）
   */
  private async setVisibleInternal(visible: boolean) {
    if (this.isVisible === visible) return;

    this.isVisible = visible;

    if (visible) {
      await this.updatePosition();
    } else {
      this.cleanup?.();
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 设置显示状态（外部调用，同步visible属性）
   */
  private async setVisible(visible: boolean) {
    if (this.isVisible === visible) return;

    this.isVisible = visible;
    this.visible = visible;

    if (visible) {
      await this.updatePosition();
    } else {
      this.cleanup?.();
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 更新位置
   */
  private async updatePosition() {
    if (!this.triggerElement || !this.popupElement) return;

    const middleware = [
      offset(this.offsetDistance),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    const { x, y, placement, middlewareData } = await computePosition(
      this.triggerElement,
      this.popupElement,
      {
        placement: this.placement,
        middleware,
      }
    );

    // 设置弹出层位置
    Object.assign(this.popupElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    // 设置箭头位置
    if (this.arrow && this.arrowElement && middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      Object.assign(this.arrowElement.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-4px',
      });
    }

    // 设置自动更新
    this.cleanup = autoUpdate(
      this.triggerElement,
      this.popupElement,
      () => this.updatePosition()
    );
  }

  /**
   * 清理定时器
   */
  private clearTimers() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

  /**
   * 获取弹出层样式
   */
  private getPopupStyle() {
    const style: any = {};

    if (this.width) {
      style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }

    if (this.maxWidth) {
      style.maxWidth = typeof this.maxWidth === 'number' ? `${this.maxWidth}px` : this.maxWidth;
    }

    return style;
  }

  render() {
    return (
      <Host class="ldesign-popup">
        <div class="ldesign-popup__trigger">
          <slot name="trigger" />
        </div>
        
        {this.isVisible && (
          <div 
            class="ldesign-popup__content"
            style={this.getPopupStyle()}
          >
            {this.arrow && (
              <div class="ldesign-popup__arrow"></div>
            )}
            
            <div class="ldesign-popup__inner">
              {this.popupTitle && (
                <div class="ldesign-popup__title">{this.popupTitle}</div>
              )}

              <div class="ldesign-popup__body">
                {this.content ? (
                  <div innerHTML={this.content}></div>
                ) : (
                  <slot />
                )}
              </div>
            </div>
          </div>
        )}
      </Host>
    );
  }
}

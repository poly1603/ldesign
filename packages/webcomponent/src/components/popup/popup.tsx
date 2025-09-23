import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { computePosition, flip, shift, offset, arrow, autoUpdate, Placement } from '@floating-ui/dom';

export type PopupTrigger = 'hover' | 'click' | 'focus' | 'manual' | 'contextmenu';
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
   * 是否允许在弹出层上进行交互（仅 hover 触发时有意义）
   */
  @Prop() interactive: boolean = true;

  /**
   * 点击浮层外是否关闭（仅在 trigger = 'click' 时常用）
   */
  @Prop() closeOnOutside: boolean = true;

  /**
   * 是否允许 Esc 键关闭
   */
  @Prop() closeOnEsc: boolean = true;

  /**
   * 弹出层内容
   */
  @Prop() content?: string;

  /**
   * 内容区域的语义角色
   * @default 'dialog'
   */
  @Prop() popupRole: string = 'dialog';

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
   * 主题风格
   * @default 'light'
   */
  @Prop({ reflect: true }) theme: 'light' | 'dark' = 'light';

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
  private contentHoverBound = false;

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
  private removeDocumentClick?: () => void;
  private removeDocumentKeydown?: () => void;

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
    this.unbindEvents();
    this.unbindDocumentEvents();
  }

  /**
   * 渲染完成后再尝试定位，避免首次渲染时元素尚未挂载
   */
  componentDidRender() {
    if (this.isVisible) {
      // 渲染完成后再更新一次位置（仅计算，不重复注册 autoUpdate）
      this.updatePositionOnly();
    }
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
        if (this.closeOnOutside) this.bindDocumentClick();
        break;
      case 'contextmenu':
        this.triggerElement.addEventListener('contextmenu', this.handleContextMenu);
        if (this.closeOnOutside) this.bindDocumentClick();
        break;
      case 'focus':
        // 使用 focusin/out 捕获冒泡，兼容嵌套元素
        this.triggerElement.addEventListener('focusin', this.handleFocus);
        this.triggerElement.addEventListener('focusout', this.handleBlur);
        break;
    }
    if (this.closeOnEsc) this.bindDocumentKeydown();
  }

  private unbindEvents() {
    if (!this.triggerElement) return;
    this.triggerElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.triggerElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.triggerElement.removeEventListener('click', this.handleClick);
    this.triggerElement.removeEventListener('contextmenu', this.handleContextMenu);
    this.triggerElement.removeEventListener('focus', this.handleFocus as any);
    this.triggerElement.removeEventListener('blur', this.handleBlur as any);
    this.triggerElement.removeEventListener('focusin', this.handleFocus as any);
    this.triggerElement.removeEventListener('focusout', this.handleBlur as any);
  }

  private bindDocumentClick() {
    const handler = this.handleDocumentClick;
    document.addEventListener('click', handler);
    this.removeDocumentClick = () => document.removeEventListener('click', handler);
  }

  private bindDocumentKeydown() {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    };
    document.addEventListener('keydown', keyHandler);
    this.removeDocumentKeydown = () => document.removeEventListener('keydown', keyHandler);
  }

  private unbindDocumentEvents() {
    this.removeDocumentClick?.();
    this.removeDocumentClick = undefined;
    this.removeDocumentKeydown?.();
    this.removeDocumentKeydown = undefined;
  }



  /**
   * 事件处理器
   */
  private handleMouseEnter = () => {
    // 在交互模式下，进入触发器或内容都应清除隐藏定时器；显示不加额外延时
    this.clearTimers();
    this.show();
  };

  private handleMouseLeave = () => {
    // 仅在 hover + interactive 模式下添加“移出延时”，否则按常规立即隐藏/或走 hideDelay 属性
    if (this.trigger === 'hover' && this.interactive) {
      this.clearTimers();
      const delay = this.hideDelay && this.hideDelay > 0 ? this.hideDelay : 200; // 兜底 200ms
      this.hideTimer = window.setTimeout(() => {
        this.setVisible(false);
      }, delay);
      return;
    }
    this.hide();
  };

  private handleClick = (event: Event) => {
    event.stopPropagation();
    this.toggle();
  };

  private handleContextMenu = (event: MouseEvent) => {
    // 右键触发：阻止默认菜单并切换显示
    event.preventDefault();
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

    // 仅当非 hover+interactive 场景时才应用 showDelay，避免移入时“卡顿”
    const useDelay = this.showDelay > 0 && !(this.trigger === 'hover' && this.interactive);
    if (useDelay) {
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
      this.bindContentHoverIfNeeded();
    } else {
      this.cleanup?.();
      this.unbindContentHover();
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
      this.bindContentHoverIfNeeded();
    } else {
      this.cleanup?.();
      this.unbindContentHover();
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 获取当前应使用的 placement（兼容属性未正确映射的场景）
   */
  private getCurrentPlacement(): PopupPlacement {
    const attr = this.el.getAttribute('placement') as PopupPlacement | null;
    return (attr as PopupPlacement) || this.placement || 'bottom';
  }

  /**
   * 更新位置
   */
  private async updatePosition() {
    // popupElement 可能在首次显示时才渲染
    if (!this.triggerElement) return;
    this.popupElement = this.el.querySelector('.ldesign-popup__content') as HTMLElement;
    this.arrowElement = this.el.querySelector('.ldesign-popup__arrow') as HTMLElement;
    if (!this.popupElement) return;

    const middleware = [
      offset(this.offsetDistance),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    const currentPlacement = this.getCurrentPlacement();
    const { x, y, placement: resolvedPlacement, middlewareData } = await computePosition(
      this.triggerElement,
      this.popupElement,
      {
        placement: currentPlacement,
        middleware,
        strategy: 'fixed',
      }
    );

    // 设置弹出层位置
    Object.assign(this.popupElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    // 标记当前方向，便于样式控制
    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    // 设置箭头位置
    if (this.arrow && this.arrowElement) {
      // 先重置四个方向，避免遗留样式影响
      Object.assign(this.arrowElement.style, {
        left: '',
        top: '',
        right: '',
        bottom: '',
      });

      if (middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[resolvedPlacement.split('-')[0]] as 'top' | 'right' | 'bottom' | 'left';

        Object.assign(this.arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          [staticSide]: '-4px',
        });

        this.arrowElement.setAttribute('data-placement', resolvedPlacement);
      }
    }

    // 设置自动更新 - 避免递归重复注册
    this.cleanup?.();
    this.cleanup = autoUpdate(
      this.triggerElement,
      this.popupElement,
      () => {
        if (this.isVisible) {
          this.updatePositionOnly();
        }
      }
    );
  }

  /**
   * 仅更新位置，不重复注册 autoUpdate
   */
  private async updatePositionOnly() {
    if (!this.triggerElement) return;
    this.popupElement = this.el.querySelector('.ldesign-popup__content') as HTMLElement;
    this.arrowElement = this.el.querySelector('.ldesign-popup__arrow') as HTMLElement;
    if (!this.popupElement) return;

    const middleware = [
      offset(this.offsetDistance),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    const currentPlacement = this.getCurrentPlacement();
    const { x, y, placement: resolvedPlacement, middlewareData } = await computePosition(
      this.triggerElement,
      this.popupElement,
      {
        placement: currentPlacement,
        middleware,
        strategy: 'fixed',
      }
    );

    Object.assign(this.popupElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    if (this.arrow && this.arrowElement) {
      Object.assign(this.arrowElement.style, { left: '', top: '', right: '', bottom: '' });
      if (middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[resolvedPlacement.split('-')[0]] as 'top' | 'right' | 'bottom' | 'left';

        Object.assign(this.arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          [staticSide]: '-4px',
        });

        this.arrowElement.setAttribute('data-placement', resolvedPlacement);
      }
    }

    // 再次确保在渲染后绑定浮层交互事件（首次渲染时 updatePosition 可能拿不到元素）
    this.bindContentHoverIfNeeded();
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
    // 与 strategy: 'fixed' 对齐，避免被祖先定位/滚动容器影响
    const style: any = { position: 'fixed' };

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
      <Host class={{
        'ldesign-popup': true,
        'ldesign-popup--disabled': this.disabled,
        'ldesign-popup--dark': this.theme === 'dark',
      }}>
        <div class="ldesign-popup__trigger">
          <slot name="trigger" />
        </div>
        
        {this.isVisible && (
          <div 
            class="ldesign-popup__content"
            style={this.getPopupStyle()}
            role={this.popupRole}
            aria-hidden={!this.isVisible}
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
        )
        }
      </Host>
    );
  }

  private bindContentHoverIfNeeded() {
    if (this.trigger !== 'hover' || !this.interactive) return;
    // 交互内容：允许在浮层内悬停交互
    this.popupElement = this.el.querySelector('.ldesign-popup__content') as HTMLElement;
    if (!this.popupElement || this.contentHoverBound) return;
    this.popupElement.addEventListener('mouseenter', this.handleMouseEnter);
    this.popupElement.addEventListener('mouseleave', this.handleMouseLeave);
    this.contentHoverBound = true;
  }

  private unbindContentHover() {
    if (!this.contentHoverBound || !this.popupElement) return;
    this.popupElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.popupElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.contentHoverBound = false;
  }
}

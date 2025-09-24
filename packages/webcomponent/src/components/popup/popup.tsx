import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { computePosition, flip, shift, offset, arrow, autoUpdate, Placement, VirtualElement } from '@floating-ui/dom';

export type PopupTrigger = 'hover' | 'click' | 'focus' | 'manual' | 'contextmenu';
export type PopupPlacement = Placement;

/**
 * Popup 弹出层组件
 * 完全重写版本，确保 offset-distance 在所有方向保持一致
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
   * 定位策略
   */
  @Prop() strategy: 'auto' | 'fixed' | 'absolute' = 'auto';

  /**
   * 弹层渲染容器
   */
  @Prop() appendTo: 'self' | 'body' | 'closest-popup' = 'self';

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
   */
  @Prop() popupRole: string = 'dialog';

  /**
   * 弹出层标题
   */
  @Prop() popupTitle?: string;

  /**
   * 与触发元素的距离（单位 px）
   * 当 arrow=true 时，表示触发元素到箭头尖端的距离
   * 当 arrow=false 时，表示触发元素到弹层边缘的距离
   */
  @Prop() offsetDistance: number | string = 8;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否显示箭头
   */
  @Prop() arrow: boolean = true;

  /**
   * 调试开关：开启后输出定位与间距的详细日志
   */
  @Prop() debug: boolean = false;

  /**
   * 弹出层宽度
   */
  @Prop() width?: number | string;

  /**
   * 主题风格
   */
  @Prop({ reflect: true }) theme: 'light' | 'dark' = 'light';

  /**
   * 最大宽度
   */
  @Prop() maxWidth?: number | string;

  /**
   * 滚动时是否锁定位置（不随滚动而重新定位）
   */
  @Prop() lockOnScroll: boolean = false;

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
  @State() positioned: boolean = false;

  // 私有属性
  private popupElement?: HTMLElement;
  private triggerElement?: HTMLElement;
  private arrowElement?: HTMLElement;
  private contextVirtualRef?: VirtualElement;
  
  private uid: string = `ldp_${Math.random().toString(36).slice(2)}`;
  private teleported = false;
  private teleportContainer?: HTMLElement;
  
  private cleanup?: () => void;
  private removeDocumentClick?: () => void;
  private removeDocumentKeydown?: () => void;
  
  private showTimer?: number;
  private hideTimer?: number;
  
  private contentHoverBound = false;

  /**
   * 显示状态变化事件
   */
  @Event() ldesignVisibleChange: EventEmitter<boolean>;

  /**
   * 将输入值解析为数字
   */
  private parseNumber(value: any, defaultValue: number = 0): number {
    if (value == null) return defaultValue;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  /**
   * 监听 visible 属性变化
   */
  @Watch('visible')
  watchVisible(newValue: boolean) {
    if (newValue !== this.isVisible) {
      this.setVisibleInternal(newValue);
    }
  }

  /**
   * 监听 offsetDistance 变化，热更新间距
   */
  @Watch('offsetDistance')
  watchOffsetDistance() {
    if (this.isVisible) {
      this.updatePositionOnly();
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    // 获取触发元素
    const triggerSlot = this.el.querySelector('[slot="trigger"]') as HTMLElement;
    const triggerWrapper = this.el.querySelector('.ldesign-popup__trigger') as HTMLElement;
    this.triggerElement = triggerSlot || triggerWrapper || this.el;

    // 获取弹出层元素
    this.popupElement = this.el.querySelector('.ldesign-popup__content') as HTMLElement;
    this.arrowElement = this.el.querySelector('.ldesign-popup__arrow') as HTMLElement;

    if (!this.disabled) {
      this.bindEvents();
      if (this.closeOnEsc) this.bindDocumentKeydown();
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
    this.removeFromContainerIfNeeded();
  }

  /**
   * 渲染完成后更新位置
   */
  componentDidRender() {
    if (this.isVisible) {
      this.moveToContainerIfNeeded();
      this.updatePositionOnly();
      this.bindContentHoverIfNeeded();
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
        this.triggerElement.addEventListener('focusin', this.handleFocus);
        this.triggerElement.addEventListener('focusout', this.handleBlur);
        break;
    }
  }

  /**
   * 解绑事件
   */
  private unbindEvents() {
    if (!this.triggerElement) return;

    this.triggerElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.triggerElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.triggerElement.removeEventListener('click', this.handleClick);
    this.triggerElement.removeEventListener('contextmenu', this.handleContextMenu);
    this.triggerElement.removeEventListener('focusin', this.handleFocus);
    this.triggerElement.removeEventListener('focusout', this.handleBlur);
  }

  /**
   * 绑定文档点击事件
   */
  private bindDocumentClick() {
    const handler = this.handleDocumentClick;
    document.addEventListener('click', handler, true);
    this.removeDocumentClick = () => document.removeEventListener('click', handler, true);
  }

  /**
   * 绑定文档键盘事件
   */
  private bindDocumentKeydown() {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    };
    document.addEventListener('keydown', keyHandler);
    this.removeDocumentKeydown = () => document.removeEventListener('keydown', keyHandler);
  }

  /**
   * 解绑文档事件
   */
  private unbindDocumentEvents() {
    this.removeDocumentClick?.();
    this.removeDocumentClick = undefined;
    this.removeDocumentKeydown?.();
    this.removeDocumentKeydown = undefined;
  }

  /**
   * 获取弹出层元素
   */
  private getPopupEl(): HTMLElement | null {
    return document.getElementById(this.uid);
  }

  /**
   * 找到最近的弹出层内容
   */
  private findClosestPopupContent(): HTMLElement | null {
    return this.el.closest('.ldesign-popup__content');
  }

  /**
   * 移动到指定容器
   */
  private moveToContainerIfNeeded() {
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;

    let target: HTMLElement | null = null;
    if (this.appendTo === 'body') {
      target = document.body;
    } else if (this.appendTo === 'closest-popup') {
      target = this.findClosestPopupContent() || document.body;
    } else {
      return; // self：无需移动
    }

    if (this.popupElement.parentElement !== target) {
      target.appendChild(this.popupElement);
      this.teleported = true;
      this.teleportContainer = target;
    }
  }

  /**
   * 从容器中移除
   */
  private removeFromContainerIfNeeded() {
    if (!this.teleported) return;
    const el = this.getPopupEl();
    if (el && this.teleportContainer && el.parentElement === this.teleportContainer) {
      el.parentElement.removeChild(el);
    }
    this.teleported = false;
    this.teleportContainer = undefined;
  }

  /**
   * 事件处理器
   */
  private handleMouseEnter = () => {
    this.clearTimers();
    this.show();
  };

  private handleMouseLeave = () => {
    if (this.trigger === 'hover' && this.interactive) {
      this.clearTimers();
      const delay = this.hideDelay > 0 ? this.hideDelay : 200;
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
    event.preventDefault();
    event.stopPropagation();

    // 创建虚拟参考点，用于在鼠标位置显示弹层
    this.contextVirtualRef = {
      getBoundingClientRect: () => new DOMRect(event.clientX, event.clientY, 0, 0),
    } as VirtualElement;

    this.toggle();
  };

  private handleDocumentClick = (event: Event) => {
    const target = event.target as Node;
    
    // 检查点击是否在组件内
    if (this.el.contains(target)) return;
    
    // 检查点击是否在传送的弹出层内
    const popupEl = this.getPopupEl();
    if (popupEl && popupEl.contains(target)) return;
    
    this.hide();
  };

  private handleFocus = () => {
    this.show();
  };

  private handleBlur = () => {
    this.hide();
  };

  /**
   * 调试日志
   */
  private logDebug(resolvedPlacement: string) {
    if (!this.debug || !this.triggerElement || !this.popupElement) return;
    
    try {
      const triggerRect = this.triggerElement.getBoundingClientRect();
      const popupRect = this.popupElement.getBoundingClientRect();
      const basePlacement = resolvedPlacement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
      
      let mainGap = 0;
      switch (basePlacement) {
        case 'top':
          mainGap = triggerRect.top - popupRect.bottom;
          break;
        case 'bottom':
          mainGap = popupRect.top - triggerRect.bottom;
          break;
        case 'left':
          mainGap = triggerRect.left - popupRect.right;
          break;
        case 'right':
          mainGap = popupRect.left - triggerRect.right;
          break;
      }

      // 计算箭头尖端与触发器的间距
      let tipGap: number | null = null;
      if (this.arrow && this.arrowElement) {
        const arrowRect = this.arrowElement.getBoundingClientRect();
        switch (basePlacement) {
          case 'top':
            tipGap = triggerRect.top - arrowRect.bottom;
            break;
          case 'bottom':
            tipGap = arrowRect.top - triggerRect.bottom;
            break;
          case 'left':
            tipGap = triggerRect.left - arrowRect.right;
            break;
          case 'right':
            tipGap = arrowRect.left - triggerRect.right;
            break;
        }
      }

      const expectedDistance = this.parseNumber(this.offsetDistance, 8);
      
      console.log('[ldesign-popup][debug]', {
        uid: this.uid,
        placement: resolvedPlacement,
        expectedDistance,
        actualMainGap: Math.round(mainGap * 100) / 100,
        actualTipGap: tipGap != null ? Math.round(tipGap * 100) / 100 : null,
        hasArrow: !!this.arrow,
      });
    } catch (error) {
      console.warn('[ldesign-popup][debug] error:', error);
    }
  }

  /**
   * 显示弹出层
   */
  show() {
    if (this.disabled || this.isVisible) return;

    this.clearTimers();

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
   * 设置显示状态（内部使用）
   */
  private async setVisibleInternal(visible: boolean) {
    if (this.isVisible === visible) return;

    this.isVisible = visible;

    if (visible) {
      this.positioned = false;
      await this.updatePosition();
      this.bindContentHoverIfNeeded();
    } else {
      this.cleanup?.();
      this.unbindContentHover();
      this.contextVirtualRef = undefined;
      this.removeFromContainerIfNeeded();
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 设置显示状态（外部调用）
   */
  private async setVisible(visible: boolean) {
    if (this.isVisible === visible) return;

    this.isVisible = visible;
    this.visible = visible;

    if (visible) {
      this.positioned = false;
      await this.updatePosition();
      this.bindContentHoverIfNeeded();
    } else {
      this.cleanup?.();
      this.unbindContentHover();
      this.contextVirtualRef = undefined;
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 获取定位策略
   */
  private getStrategy(): 'fixed' | 'absolute' {
    if (this.appendTo === 'body') {
      if (this.strategy === 'fixed') return 'fixed';
      if (this.strategy === 'absolute') return 'absolute';
      return this.isNestedInPopup() ? 'absolute' : 'fixed';
    }
    
    if (this.appendTo === 'closest-popup') return 'absolute';
    
    if (this.strategy === 'fixed') return 'fixed';
    if (this.strategy === 'absolute') return 'absolute';
    return this.isNestedInPopup() ? 'absolute' : 'fixed';
  }

  /**
   * 判断是否嵌套在另一个 Popup 内容内部
   */
  private isNestedInPopup(): boolean {
    return !!this.el.closest('.ldesign-popup__content');
  }

  /**
   * 等待下一帧
   */
  private nextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  /**
   * 更新位置（完整版本，注册 autoUpdate）
   */
  private async updatePosition() {
    if (!this.triggerElement) return;
    
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;

    if (this.arrow) {
      this.arrowElement = this.popupElement.querySelector('.ldesign-popup__arrow');
    }

    this.moveToContainerIfNeeded();
    await this.nextFrame();

    const strategy = this.getStrategy();
    const boundary = strategy === 'fixed' ? 'viewport' : undefined;

    // 核心改进：统一的 offset 计算
    const baseOffset = this.parseNumber(this.offsetDistance, 8);
    // 对所有方向使用相同的计算方式：当有箭头时，额外增加箭头尺寸的一半（4px）
    const offsetValue = this.arrow ? baseOffset + 4 : baseOffset;

    const middleware = [
      offset(offsetValue),
      flip({ boundary } as any),
      shift({ 
        padding: 8, 
        boundary, 
        mainAxis: false, // 禁用主轴挤压，保持间距一致性
        crossAxis: true 
      } as any),
    ];

    if (this.arrow && this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    // 选择参考元素：右键使用虚拟参考点，其余使用触发元素
    const referenceEl = (this.trigger === 'contextmenu' && this.contextVirtualRef)
      ? this.contextVirtualRef
      : this.triggerElement;

    const { x, y, placement: resolvedPlacement, middlewareData } = await computePosition(
      referenceEl as any,
      this.popupElement,
      {
        placement: this.placement,
        middleware,
        strategy,
      }
    );

    // 应用位置
    Object.assign(this.popupElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    // 设置方向属性
    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    // 设置箭头位置
    if (this.arrow && this.arrowElement && middlewareData.arrow) {
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
        right: '',
        bottom: '',
        [staticSide]: '-4px', // 箭头突出 4px
      });

      this.arrowElement.setAttribute('data-placement', resolvedPlacement);
    }

    // 调试日志
    this.logDebug(resolvedPlacement);

    // 设置自动更新
    this.positioned = true;
    this.cleanup?.();
    this.cleanup = autoUpdate(
      referenceEl as any,
      this.popupElement,
      () => {
        if (this.isVisible) {
          this.updatePositionOnly();
        }
      },
      {
        ancestorScroll: !this.lockOnScroll,
        ancestorResize: true,
        elementResize: true,
      }
    );
  }

  /**
   * 仅更新位置，不重复注册 autoUpdate
   */
  private async updatePositionOnly() {
    if (!this.triggerElement) return;
    
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;

    if (this.arrow) {
      this.arrowElement = this.popupElement.querySelector('.ldesign-popup__arrow');
    }

    this.moveToContainerIfNeeded();
    await this.nextFrame();

    const strategy = this.getStrategy();
    const boundary = strategy === 'fixed' ? 'viewport' : undefined;

    const baseOffset = this.parseNumber(this.offsetDistance, 8);
    const offsetValue = this.arrow ? baseOffset + 4 : baseOffset;

    const middleware = [
      offset(offsetValue),
      flip({ boundary } as any),
      shift({ 
        padding: 8, 
        boundary, 
        mainAxis: false,
        crossAxis: true 
      } as any),
    ];

    if (this.arrow && this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    const referenceEl = (this.trigger === 'contextmenu' && this.contextVirtualRef)
      ? this.contextVirtualRef
      : this.triggerElement;

    const { x, y, placement: resolvedPlacement, middlewareData } = await computePosition(
      referenceEl as any,
      this.popupElement,
      {
        placement: this.placement,
        middleware,
        strategy,
      }
    );

    Object.assign(this.popupElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    if (this.arrow && this.arrowElement && middlewareData.arrow) {
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
        right: '',
        bottom: '',
        [staticSide]: '-4px',
      });

      this.arrowElement.setAttribute('data-placement', resolvedPlacement);
    }

    this.logDebug(resolvedPlacement);
    this.positioned = true;
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
    const style: any = { 
      position: this.getStrategy(),
    };

    if (this.width) {
      style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }

    if (this.maxWidth) {
      style.maxWidth = typeof this.maxWidth === 'number' ? `${this.maxWidth}px` : this.maxWidth;
    }

    return style;
  }

  /**
   * 绑定内容悬停事件
   */
  private bindContentHoverIfNeeded() {
    if (this.trigger !== 'hover' || !this.interactive || this.contentHoverBound) return;
    
    this.popupElement = this.getPopupEl() || this.el.querySelector('.ldesign-popup__content');
    if (!this.popupElement) return;

    this.popupElement.addEventListener('mouseenter', this.handleMouseEnter);
    this.popupElement.addEventListener('mouseleave', this.handleMouseLeave);
    this.contentHoverBound = true;
  }

  /**
   * 解绑内容悬停事件
   */
  private unbindContentHover() {
    if (!this.contentHoverBound || !this.popupElement) return;
    
    this.popupElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.popupElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.contentHoverBound = false;
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
            id={this.uid}
            class="ldesign-popup__content"
            style={{ 
              ...this.getPopupStyle(), 
              visibility: this.positioned ? 'visible' : 'hidden' 
            }}
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
        )}
      </Host>
    );
  }
}
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

  /** 将各种输入解析为数字（支持 '12', 12, '12px' 等），失败时返回默认值 */
  private toNumber(val: any, defaultValue = 0): number {
    if (val === null || val === undefined) return defaultValue;
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    const n = parseFloat(String(val));
    return Number.isFinite(n) ? n : defaultValue;
  }

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
   * - auto: 自动检测（默认：嵌套在其他弹层内部时使用 absolute，否则使用 fixed）
   * - fixed: 始终使用 fixed（相对视口）
   * - absolute: 始终使用 absolute（相对最近定位的包含块）
   */
  @Prop() strategy: 'auto' | 'fixed' | 'absolute' = 'auto';

  /**
   * 弹层渲染容器
   * - self: 渲染在组件内部（默认）
   * - body: 渲染在 document.body 下，常用于复杂布局/滚动容器
   * - closest-popup: 渲染到最近的上层 .ldesign-popup__content 内（用于嵌套弹层）
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
   * @default 'dialog'
   */
  @Prop() popupRole: string = 'dialog';

  /**
   * 弹出层标题
   */
  @Prop() popupTitle?: string;

  /**
   * 与触发元素的距离（单位 px）。
   * Deprecated: 请使用 `offset` 属性透传给 floating-ui 的 offset 中间件。
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
   * 滚动时是否锁定位置（不随滚动而重新定位）。
   * - 适用于 click 等场景：打开后滚动页面，弹层保持在打开时的视口位置。
   * - 仅影响滚动行为，仍会在窗口尺寸变化/元素尺寸变化时更新位置。
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
  /** 首次显示到完成定位之间用于隐藏，避免出现在左上角 */
  @State() positioned: boolean = false;

  /**
   * 弹出层元素引用
   */
  private popupElement?: HTMLElement;
  private contentHoverBound = false;

  /**
   * 触发器元素引用
   */
  private triggerElement?: HTMLElement;
  private triggerWrapper?: HTMLElement;
  private triggerSlotEl?: HTMLElement;
  private eventTargets: HTMLElement[] = []; // 绑定事件的目标集合

  /**
   * 箭头元素引用
   */
  private arrowElement?: HTMLElement;
  private uid: string = `ldp_${Math.random().toString(36).slice(2)}`;
  private teleported = false;
  private teleportContainer?: HTMLElement;

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
   * 监听 offsetDistance 变化（包括 string -> number 的变化），可热更新间距
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
    // 优先使用具名槽位的真实节点作为触发器（shadow=false 场景 slot 不会投影到 wrapper 内）
    this.triggerSlotEl = this.el.querySelector('[slot="trigger"]') as HTMLElement | null;
    this.triggerWrapper = this.el.querySelector('.ldesign-popup__trigger') as HTMLElement | null;
    this.triggerElement = this.triggerSlotEl || this.triggerWrapper || (this.el as unknown as HTMLElement);

    this.popupElement = this.el.querySelector('.ldesign-popup__content') as HTMLElement;
    this.arrowElement = this.el.querySelector('.ldesign-popup__arrow') as HTMLElement;

    if (!this.disabled) {
      this.eventTargets = [];
      if (this.triggerSlotEl) this.eventTargets.push(this.triggerSlotEl);
      if (this.triggerWrapper && this.triggerWrapper !== this.triggerSlotEl) this.eventTargets.push(this.triggerWrapper);
      // 双通道绑定，确保任一层级都能触发
      this.eventTargets.forEach(t => this.bindEventsOn(t));
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
   * 渲染完成后再尝试定位，避免首次渲染时元素尚未挂载
   */
  componentDidRender() {
    if (this.isVisible) {
      // 渲染完成后再更新一次位置，并确保浮层绑定了交互事件
      this.moveToContainerIfNeeded();
      this.updatePositionOnly();
      this.bindContentHoverIfNeeded();
    }
  }

  /**
   * 绑定事件（对指定元素绑定）
   */
  private bindEventsOn(target: HTMLElement) {
    switch (this.trigger) {
      case 'hover':
        // 同时绑定 mouse 与 pointer 两套事件，确保各种环境都能触发
        target.addEventListener('mouseenter', this.handleMouseEnter);
        target.addEventListener('mouseleave', this.handleMouseLeave);
        target.addEventListener('pointerenter', this.handleMouseEnter);
        target.addEventListener('pointerleave', this.handleMouseLeave);
        break;
      case 'click':
        target.addEventListener('click', this.handleClick);
        if (this.closeOnOutside) this.bindDocumentClick();
        break;
      case 'contextmenu':
        target.addEventListener('contextmenu', this.handleContextMenu);
        if (this.closeOnOutside) this.bindDocumentClick();
        break;
      case 'focus':
        target.addEventListener('focusin', this.handleFocus);
        target.addEventListener('focusout', this.handleBlur);
        break;
    }
  }

  private unbindEvents() {
    const targets = this.eventTargets && this.eventTargets.length > 0 ? this.eventTargets : (this.triggerElement ? [this.triggerElement] : []);
    targets.forEach(target => {
      target.removeEventListener('mouseenter', this.handleMouseEnter);
      target.removeEventListener('mouseleave', this.handleMouseLeave);
      target.removeEventListener('pointerenter', this.handleMouseEnter);
      target.removeEventListener('pointerleave', this.handleMouseLeave);
      target.removeEventListener('click', this.handleClick);
      target.removeEventListener('contextmenu', this.handleContextMenu);
      target.removeEventListener('focus', this.handleFocus as any);
      target.removeEventListener('blur', this.handleBlur as any);
      target.removeEventListener('focusin', this.handleFocus as any);
      target.removeEventListener('focusout', this.handleBlur as any);
    });
    this.eventTargets = [];
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

  private getPopupEl(): HTMLElement | null {
    return document.getElementById(this.uid) as HTMLElement | null;
  }

  private findClosestPopupContent(): HTMLElement | null {
    return this.el.closest('.ldesign-popup__content');
  }

  private moveToContainerIfNeeded() {
    this.popupElement = this.getPopupEl() as HTMLElement;
    if (!this.popupElement) return;

    let target: HTMLElement | null = null;
    if (this.appendTo === 'body') {
      target = document.body;
    } else if (this.appendTo === 'closest-popup') {
      // 找到最近的上层弹层内容作为容器；若无则退回 body
      target = this.findClosestPopupContent() || document.body;
    } else {
      // self：无需移动
      return;
    }

    if (this.popupElement.parentElement !== target) {
      target.appendChild(this.popupElement);
      this.teleported = true;
      this.teleportContainer = target;
    }
  }

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
      this.positioned = false;
      await this.updatePosition();
      this.bindContentHoverIfNeeded();
    } else {
      this.cleanup?.();
      this.unbindContentHover();
      // 若已移动到外部容器，隐藏时主动移除，避免遗留节点
      this.removeFromContainerIfNeeded();
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
      this.positioned = false;
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
   * 判断是否嵌套在另一个 Popup 内容内部
   */
  private isNestedInPopup(): boolean {
    // 若当前 popup 组件位于上一级 .ldesign-popup__content 内，则认为是嵌套弹层
    const container = this.el.closest('.ldesign-popup__content');
    return !!container;
  }

  /**
   * 获取定位策略：
   * - 顶层使用 fixed，避免被滚动/定位容器影响
   * - 嵌套在其他弹层内部时使用 absolute，使坐标与包含块一致，防止错位
   */
  private getStrategy(): 'fixed' | 'absolute' {
    // 当 appendTo 为 body 时，允许根据 strategy 或嵌套关系决定定位方式
    if (this.appendTo === 'body') {
      if (this.strategy === 'fixed') return 'fixed';
      if (this.strategy === 'absolute') return 'absolute';
      // auto: 顶层 fixed，嵌套 absolute（避免复杂容器下的相对视口错位）
      return this.isNestedInPopup() ? 'absolute' : 'fixed';
    }
    // 当渲染到最近的上层弹层内容内时，始终使用 absolute
    if (this.appendTo === 'closest-popup') return 'absolute';

    if (this.strategy === 'fixed') return 'fixed';
    if (this.strategy === 'absolute') return 'absolute';
    // auto
    return this.isNestedInPopup() ? 'absolute' : 'fixed';
  }



  /**
   * 更新位置
   */
  private async nextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }


  private async updatePosition() {
    // popupElement 可能在首次显示时才渲染
    if (!this.triggerElement) return;
    this.popupElement = (this.getPopupEl() || this.el.querySelector('.ldesign-popup__content')) as HTMLElement;
    if (!this.popupElement) return;
    
    // 确保箭头元素被正确获取
    if (this.arrow) {
      this.arrowElement = this.popupElement.querySelector('.ldesign-popup__arrow') as HTMLElement;
    }

    // 若需要 portal 到 body，则移动过去
    this.moveToContainerIfNeeded();
    // 等待一帧，确保插入/移动后的布局稳定，再计算位置
    await this.nextFrame();

    const strategy = this.getStrategy();
    const boundary: any = strategy === 'fixed' ? 'viewport' : undefined;

    // 使用 floating-ui 的 offset 中间件。为保证“箭头尖端到触发器”的可见缝等于 offset-distance，
    // 这里在主轴距离中补上“菱形箭头沿主轴的真实外凸量”。
    // 使用 floating-ui 的 offset 中间件；保持主轴间距等于 offset-distance（由库统一计算）
    const offsetValue = this.toNumber(this.offsetDistance, 8);

    const middleware = [
      offset(offsetValue),
      flip({ boundary } as any),
      // 禁用主轴挤压，避免改变几何上的主轴间距
      shift({ padding: 8, boundary, mainAxis: false, crossAxis: true } as any),
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
        strategy,
      }
    );

    // 直接使用 floating-ui 计算的位置
    Object.assign(this.popupElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    // 设置箭头位置
    // 标记当前方向，便于样式控制
    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    // 设置箭头位置 - 使用 floating-ui 提供的箭头位置
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




    // 设置自动更新 - 避免递归重复注册
    this.positioned = true;
    this.cleanup?.();
    this.cleanup = autoUpdate(
      this.triggerElement,
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
    this.popupElement = (this.getPopupEl() || this.el.querySelector('.ldesign-popup__content')) as HTMLElement;
    if (!this.popupElement) return;
    
    // 确保箭头元素被正确获取
    if (this.arrow) {
      this.arrowElement = this.popupElement.querySelector('.ldesign-popup__arrow') as HTMLElement;
    }

    this.moveToContainerIfNeeded();
    await this.nextFrame();

    const strategy = this.getStrategy();
    const boundary: any = strategy === 'fixed' ? 'viewport' : undefined;

    const offsetValue = this.toNumber(this.offsetDistance, 8);

    const middleware = [
      offset(offsetValue),
      flip({ boundary } as any),
      shift({ padding: 8, boundary, mainAxis: false, crossAxis: true } as any),
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
        strategy,
      }
    );

    // 直接使用 floating-ui 计算的位置
    Object.assign(this.popupElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    this.popupElement.setAttribute('data-placement', resolvedPlacement);

    // 设置箭头位置 - 使用 floating-ui 提供的箭头位置
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


    // 再次确保在渲染后绑定浮层交互事件（首次渲染时 updatePosition 可能拿不到元素）
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
    // 根据实际策略设置定位方式
    const style: any = { position: this.getStrategy() };

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
            id={this.uid}
            class="ldesign-popup__content"
            style={{ ...this.getPopupStyle(), visibility: this.positioned ? 'visible' : 'hidden' }}
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
    this.popupElement = (this.getPopupEl() || this.el.querySelector('.ldesign-popup__content')) as HTMLElement;
    if (!this.popupElement || this.contentHoverBound) return;
    this.popupElement.addEventListener('mouseenter', this.handleMouseEnter);
    this.popupElement.addEventListener('mouseleave', this.handleMouseLeave);
    this.popupElement.addEventListener('pointerenter', this.handleMouseEnter);
    this.popupElement.addEventListener('pointerleave', this.handleMouseLeave);
    this.contentHoverBound = true;
  }

  private unbindContentHover() {
    if (!this.contentHoverBound || !this.popupElement) return;
    this.popupElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.popupElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.popupElement.removeEventListener('pointerenter', this.handleMouseEnter);
    this.popupElement.removeEventListener('pointerleave', this.handleMouseLeave);
    this.contentHoverBound = false;
  }

}

import { Component, Prop, State, Element, Watch, h, Host } from '@stencil/core';
import { computePosition, flip, shift, offset, arrow, autoUpdate, Placement } from '@floating-ui/dom';

export type TooltipPlacement = Placement;

/**
 * Tooltip 工具提示组件
 * 基于 @floating-ui/dom 实现的简化版弹出层
 */
@Component({
  tag: 'ldesign-tooltip',
  styleUrl: 'tooltip.less',
  shadow: false,
})
export class LdesignTooltip {
  @Element() el!: HTMLElement;

  /**
   * 提示内容
   */
  @Prop() content!: string;

  /**
   * 提示位置
   */
  @Prop() placement: TooltipPlacement = 'top';

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 是否显示箭头
   */
  @Prop() arrow: boolean = true;

  /**
   * 延迟显示时间（毫秒）
   */
  @Prop() showDelay: number = 100;

  /**
   * 延迟隐藏时间（毫秒）
   */
  @Prop() hideDelay: number = 100;

  /**
   * 最大宽度
   */
  @Prop() maxWidth: number = 250;

  /**
   * 主题
   */
  @Prop() theme: 'dark' | 'light' = 'dark';

  /**
   * 提示层状态
   */
  @State() isVisible: boolean = false;

  /**
   * 提示层元素引用
   */
  private tooltipElement?: HTMLElement;

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
   * 监听content属性变化
   */
  @Watch('content')
  watchContent(newValue: string) {
    if (!newValue && this.isVisible) {
      this.hide();
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.triggerElement = this.el.querySelector('.ldesign-tooltip__trigger') as HTMLElement;
    this.tooltipElement = this.el.querySelector('.ldesign-tooltip__content') as HTMLElement;
    this.arrowElement = this.el.querySelector('.ldesign-tooltip__arrow') as HTMLElement;

    if (this.triggerElement && !this.disabled && this.content) {
      this.bindEvents();
    }
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    this.cleanup?.();
    this.clearTimers();
    this.unbindEvents();
  }

  /**
   * 绑定事件
   */
  private bindEvents() {
    if (!this.triggerElement) return;

    this.triggerElement.addEventListener('mouseenter', this.handleMouseEnter);
    this.triggerElement.addEventListener('mouseleave', this.handleMouseLeave);
    this.triggerElement.addEventListener('focus', this.handleFocus);
    this.triggerElement.addEventListener('blur', this.handleBlur);
  }

  /**
   * 解绑事件
   */
  private unbindEvents() {
    if (!this.triggerElement) return;

    this.triggerElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.triggerElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.triggerElement.removeEventListener('focus', this.handleFocus);
    this.triggerElement.removeEventListener('blur', this.handleBlur);
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

  private handleFocus = () => {
    this.show();
  };

  private handleBlur = () => {
    this.hide();
  };

  /**
   * 显示提示层
   */
  private show() {
    if (this.disabled || !this.content || this.isVisible) return;

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
   * 隐藏提示层
   */
  private hide() {
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
   * 设置显示状态
   */
  private async setVisible(visible: boolean) {
    if (this.isVisible === visible) return;

    this.isVisible = visible;

    if (visible) {
      await this.updatePosition();
    } else {
      this.cleanup?.();
    }
  }

  /**
   * 更新位置
   */
  private async updatePosition() {
    if (!this.triggerElement || !this.tooltipElement) return;

    const middleware = [
      offset(8),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    const { x, y, placement, middlewareData } = await computePosition(
      this.triggerElement,
      this.tooltipElement,
      {
        placement: this.placement,
        middleware,
      }
    );

    // 设置提示层位置
    Object.assign(this.tooltipElement.style, {
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

    // 设置自动更新 - 修复无限递归问题
    this.cleanup = autoUpdate(
      this.triggerElement,
      this.tooltipElement,
      () => {
        // 只在可见状态下更新位置，避免无限递归
        if (this.isVisible) {
          this.updatePositionOnly();
        }
      }
    );
  }

  /**
   * 仅更新位置，不设置autoUpdate（避免无限递归）
   */
  private async updatePositionOnly() {
    if (!this.triggerElement || !this.tooltipElement) return;

    const middleware = [
      offset(8),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    const { x, y, placement, middlewareData } = await computePosition(
      this.triggerElement,
      this.tooltipElement,
      {
        placement: this.placement,
        middleware,
      }
    );

    // 设置提示层位置
    Object.assign(this.tooltipElement.style, {
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
   * 获取提示层类名
   */
  private getTooltipClass() {
    const classes = ['ldesign-tooltip__content'];
    
    if (this.theme) {
      classes.push(`ldesign-tooltip__content--${this.theme}`);
    }
    
    if (this.isVisible) {
      classes.push('ldesign-tooltip__content--visible');
    }

    return classes.join(' ');
  }

  render() {
    return (
      <Host class="ldesign-tooltip">
        <div class="ldesign-tooltip__trigger">
          <slot />
        </div>
        
        {this.content && (
          <div 
            class={this.getTooltipClass()}
            style={{ maxWidth: `${this.maxWidth}px` }}
          >
            {this.arrow && (
              <div class="ldesign-tooltip__arrow"></div>
            )}
            
            <div class="ldesign-tooltip__inner">
              {this.content}
            </div>
          </div>
        )}
      </Host>
    );
  }
}

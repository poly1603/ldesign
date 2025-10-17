import { Component, Prop, Event, EventEmitter, h, Host, Element, State, Watch } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type PopconfirmPlacement = Placement;
export type PopconfirmTrigger = 'click' | 'hover' | 'manual' | 'focus' | 'contextmenu';
export type PopconfirmIcon = 'info' | 'success' | 'warning' | 'error' | 'question' | string;

/**
 * Popconfirm 气泡确认框
 * 基于最新 Popup 进行封装，提供确认/取消操作
 * 支持动画、主题、尺寸等特性
 */
@Component({
  tag: 'ldesign-popconfirm',
  styleUrl: 'popconfirm.less',
  shadow: false,
})
export class LdesignPopconfirm {
  @Element() el!: HTMLElement;
  
  /** 确认标题（支持 slot=title 覆盖） */
  @Prop() popconfirmTitle: string = '确定要执行该操作吗？';

  /** 辅助说明（可选，支持默认 slot 覆盖） */
  @Prop() description?: string;

  /** 出现位置（透传给 Popup） */
  @Prop() placement: PopconfirmPlacement = 'top';

  /** 触发方式（默认点击） */
  @Prop() trigger: PopconfirmTrigger = 'click';

  /** 主题（浅色/深色），透传给 Popup */
  @Prop() theme: 'light' | 'dark' = 'light';

  /** 箭头（默认显示），透传给 Popup */
  @Prop() arrow: boolean = true;

  /** 外部受控可见性（仅在 trigger='manual' 时生效） */
  @Prop({ mutable: true }) visible: boolean = false;

  /** 点击外部是否关闭（仅点击触发较常用） */
  @Prop() closeOnOutside: boolean = true;

  /** 延迟显示/隐藏（毫秒），透传给 Popup */
  @Prop() showDelay: number = 0;
  @Prop() hideDelay: number = 0;

  /** 确认/取消按钮文本 */
  @Prop() okText: string = '确定';
  @Prop() cancelText: string = '取消';

  /** 确认按钮类型（影响颜色） */
  @Prop() okType: 'primary' | 'secondary' | 'outline' | 'text' | 'danger' = 'primary';
  /** 取消按钮类型（默认使用次要/描边样式） */
  @Prop() cancelType: 'primary' | 'secondary' | 'outline' | 'text' | 'danger' = 'outline';

  /** 图标类型/名称 */
  @Prop() icon: PopconfirmIcon = 'question';
  
  /** 是否显示图标 */
  @Prop() showIcon: boolean = true;
  
  /** 动画类型（继承自 popup） */
  @Prop() animation: 'fade' | 'scale' | 'slide' = 'scale';
  
  /** 尺寸（影响内容区域大小） */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';
  
  /** 是否显示加载状态 */
  @Prop() loading: boolean = false;
  
  /** 确认按钮加载状态 */
  @Prop() confirmLoading: boolean = false;
  
  /** 自动关闭延迟（毫秒），0 表示不自动关闭 */
  @Prop() autoCloseDelay: number = 0;
  
  /** 与触发元素的距离 */
  @Prop() offsetDistance: number = 8;

  /** 事件：确认 */
  @Event() ldesignConfirm!: EventEmitter<void>;

  /** 事件：取消 */
  @Event() ldesignCancel!: EventEmitter<void>;

  /** 事件：对外转发可见性变化 */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;
  
  /** 内部状态：确认按钮处理中 */
  @State() isConfirming: boolean = false;

  private hideInnerPopup() {
    const popup = this.getInnerPopup();
    if (popup) popup.visible = false;
  }

  private getInnerPopup(): HTMLLdesignPopupElement | null {
    // 查询当前组件内部的 popup 实例
    return this.el?.querySelector('ldesign-popup') as any;
  }

  private onConfirm = async () => {
    if (this.confirmLoading || this.isConfirming) return;
    
    // 触发确认事件
    this.ldesignConfirm.emit();
    
    // 如果需要显示确认加载状态
    if (this.confirmLoading) {
      this.isConfirming = true;
      // 等待外部处理完成（需要外部手动关闭）
    } else if (this.trigger !== 'manual') {
      // 非受控模式下自动关闭
      setTimeout(() => this.hideInnerPopup(), 100);
    }
  };

  private onCancel = () => {
    this.ldesignCancel.emit();
    this.isConfirming = false;
    if (this.trigger !== 'manual') {
      this.hideInnerPopup();
    }
  };

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    // 同步向外转发事件
    this.ldesignVisibleChange.emit(e.detail);
    // 当外部采用受控（manual）时，保持属性同步
    if (this.trigger === 'manual') {
      this.visible = e.detail;
    }
    // 关闭时重置状态
    if (!e.detail) {
      this.isConfirming = false;
    }
  };
  
  @Watch('visible')
  watchVisible(newVal: boolean) {
    if (!newVal) {
      this.isConfirming = false;
    }
  }
  
  // 获取图标配置
  private getIconConfig() {
    const iconMap = {
      'info': { name: 'info-circle', color: 'var(--ldesign-info-color, #3b82f6)' },
      'success': { name: 'check-circle', color: 'var(--ldesign-success-color, #10b981)' },
      'warning': { name: 'alert-triangle', color: 'var(--ldesign-warning-color, #f59e0b)' },
      'error': { name: 'x-circle', color: 'var(--ldesign-error-color, #ef4444)' },
      'question': { name: 'help-circle', color: 'var(--ldesign-warning-color, #f59e0b)' }
    };
    
    if (iconMap[this.icon]) {
      return iconMap[this.icon];
    }
    
    // 自定义图标名称
    return { name: this.icon, color: 'var(--ldesign-warning-color, #f59e0b)' };
  }

  // 通过 @Element 获取 host 元素，无需额外处理

  render() {
    // manual 模式下才把 visible 传给内部 popup，否则让 popup 自主控制
    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};
    const iconConfig = this.getIconConfig();
    
    // 根据尺寸设置弹层类名
    const popupClass = `ldesign-popconfirm--${this.size}`;

    return (
      <Host class={{ 
        'ldesign-popconfirm': true,
        [`ldesign-popconfirm--${this.size}`]: true 
      }}>
        <ldesign-popup
          placement={this.placement}
          trigger={this.trigger as any}
          theme={this.theme}
          arrow={this.arrow}
          showDelay={this.showDelay}
          hideDelay={this.hideDelay}
          closeOnOutside={this.closeOnOutside}
          onLdesignVisibleChange={this.handlePopupVisibleChange}
          animation={this.animation}
          autoCloseDelay={this.autoCloseDelay}
          offsetDistance={this.offsetDistance}
          popupClass={popupClass}
          loading={this.loading}
          {...visibleProp}
        >
          <span slot="trigger"><slot name="trigger" /></span>

          <div class={{
            'ldesign-popconfirm__content': true,
            'ldesign-popconfirm__content--no-icon': !this.showIcon
          }}>
            {this.showIcon && (
              <div class="ldesign-popconfirm__icon" style={{ color: iconConfig.color }}>
                <slot name="icon">
                  <ldesign-icon name={iconConfig.name}></ldesign-icon>
                </slot>
              </div>
            )}
            <div class="ldesign-popconfirm__main">
              <div class="ldesign-popconfirm__title">
                <slot name="title">{this.popconfirmTitle}</slot>
              </div>
              {(this.description || this.el.querySelector(':not([slot])')) && (
                <div class="ldesign-popconfirm__desc">
                  <slot>{this.description}</slot>
                </div>
              )}
              <div class="ldesign-popconfirm__actions">
                <ldesign-button 
                  size="small" 
                  type={this.cancelType} 
                  onClick={this.onCancel}
                  disabled={this.isConfirming}
                >
                  {this.cancelText}
                </ldesign-button>
                <ldesign-button 
                  size="small" 
                  type={this.okType} 
                  onClick={this.onConfirm}
                  loading={this.isConfirming}
                >
                  {this.okText}
                </ldesign-button>
              </div>
            </div>
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}

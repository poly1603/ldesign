import { Component, Prop, Event, EventEmitter, h, Host, Element } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type PopconfirmPlacement = Placement;
export type PopconfirmTrigger = 'click' | 'hover' | 'manual' | 'focus' | 'contextmenu';

/**
 * Popconfirm 气泡确认框
 * 基于 Popup 进行封装，提供确认/取消操作
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

  /** 图标名称（可用 slot=icon 覆盖） */
  @Prop() icon: string = 'help-circle';

  /** 事件：确认 */
  @Event() ldesignConfirm: EventEmitter<void>;

  /** 事件：取消 */
  @Event() ldesignCancel: EventEmitter<void>;

  /** 事件：对外转发可见性变化 */
  @Event() ldesignVisibleChange: EventEmitter<boolean>;

  private hideInnerPopup() {
    const popup = this.getInnerPopup();
    if (popup) popup.visible = false;
  }

  private getInnerPopup(): HTMLLdesignPopupElement | null {
    // 查询当前组件内部的 popup 实例
    return this.el?.querySelector('ldesign-popup') as any;
  }

  private onConfirm = () => {
    this.ldesignConfirm.emit();
    if (this.trigger !== 'manual') {
      this.hideInnerPopup();
    }
  };

  private onCancel = () => {
    this.ldesignCancel.emit();
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
  };

  // 通过 @Element 获取 host 元素，无需额外处理

  render() {
    // manual 模式下才把 visible 传给内部 popup，否则让 popup 自主控制
    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};

    return (
      <Host class={{ 'ldesign-popconfirm': true }}>
        <ldesign-popup
          placement={this.placement}
          trigger={this.trigger as any}
          theme={this.theme}
          arrow={this.arrow}
          showDelay={this.showDelay}
          hideDelay={this.hideDelay}
          closeOnOutside={this.closeOnOutside}
          onLdesignVisibleChange={this.handlePopupVisibleChange}
          {...visibleProp}
        >
          <span slot="trigger"><slot name="trigger" /></span>

          <div class="ldesign-popconfirm__content">
            <div class="ldesign-popconfirm__icon">
              <slot name="icon">
                <ldesign-icon name={this.icon}></ldesign-icon>
              </slot>
            </div>
            <div class="ldesign-popconfirm__main">
              <div class="ldesign-popconfirm__title">
                <slot name="title">{this.popconfirmTitle}</slot>
              </div>
              <div class="ldesign-popconfirm__desc">
                <slot>{this.description}</slot>
              </div>
              <div class="ldesign-popconfirm__actions">
                <ldesign-button size="small" type={this.cancelType} onClick={this.onCancel}>{this.cancelText}</ldesign-button>
                <ldesign-button size="small" type={this.okType} onClick={this.onConfirm}>{this.okText}</ldesign-button>
              </div>
            </div>
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}

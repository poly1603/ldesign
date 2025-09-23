import { Component, Prop, h, Host } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type TooltipPlacement = Placement;

/**
 * Tooltip 工具提示组件
 * 基于 Popup 的轻量封装
 */
@Component({
  tag: 'ldesign-tooltip',
  styleUrl: 'tooltip.less',
  shadow: false,
})
export class LdesignTooltip {
  /** 提示内容 */
  @Prop() content!: string;

  /** 提示位置 */
  @Prop() placement: TooltipPlacement = 'top';

  /** 是否禁用 */
  @Prop() disabled: boolean = false;

  /** 是否显示箭头 */
  @Prop() arrow: boolean = true;

  /** 延迟显示时间（毫秒） */
  @Prop() showDelay: number = 100;

  /** 延迟隐藏时间（毫秒） */
  @Prop() hideDelay: number = 100;

  /** 最大宽度 */
  @Prop() maxWidth: number = 250;

  /** 主题：深色/浅色（默认深色） */
  @Prop() theme: 'dark' | 'light' = 'dark';

  render() {
    return (
      <Host class={{ 'ldesign-tooltip': true }}>
        <ldesign-popup
          placement={this.placement}
          trigger="hover"
          interactive={false}
          showDelay={this.showDelay}
          hideDelay={this.hideDelay}
          disabled={this.disabled}
          arrow={this.arrow}
          maxWidth={this.maxWidth}
          popupRole="tooltip"
          theme={this.theme}
          content={this.content}
        >
          <span slot="trigger"><slot /></span>
        </ldesign-popup>
      </Host>
    );
  }
}

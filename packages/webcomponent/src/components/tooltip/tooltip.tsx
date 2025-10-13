import { Component, Prop, h, Host, Element, State, Watch } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type TooltipPlacement = Placement;
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';
export type TooltipSize = 'small' | 'medium' | 'large';
export type TooltipAnimation = 'fade' | 'scale' | 'slide';

/**
 * Tooltip 工具提示组件
 * 基于最新 Popup 的轻量封装，继承所有新特性
 */
@Component({
  tag: 'ldesign-tooltip',
  styleUrl: 'tooltip.less',
  shadow: false,
})
export class LdesignTooltip {
  @Element() el!: HTMLElement;
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
  @Prop() maxWidth: number | string = 250;

  /** 与触发元素的间距 */
  @Prop() offsetDistance: number | string = 8;

  /** 主题：深色/浅色（默认深色） */
  @Prop() theme: 'dark' | 'light' = 'dark';
  
  /** 触发方式 */
  @Prop() trigger: TooltipTrigger = 'hover';
  
  /** 尺寸 */
  @Prop() size: TooltipSize = 'medium';
  
  /** 动画类型 */
  @Prop() animation: TooltipAnimation = 'scale';
  
  /** 是否可交互（hover时鼠标可以移入tooltip） */
  @Prop() interactive: boolean = false;
  
  /** 自动关闭延迟 */
  @Prop() autoCloseDelay: number = 0;
  
  /** 是否显示关闭按钮（仅click触发时有效） */
  @Prop() closable: boolean = false;
  
  /** 自定义类名 */
  @Prop() tooltipClass?: string;
  
  /** 宽度（覆盖maxWidth） */
  @Prop() width?: number | string;
  
  /** 是否受控显示 */
  @Prop({ mutable: true }) visible: boolean = false;
  
  /** 动画时长 */
  @Prop() motionDuration: number = 200;
  
  /** 动画位移距离 */
  @Prop() motionDistance: number = 10;
  
  /** 是否在滚动时锁定位置 */
  @Prop() lockOnScroll: boolean = false;
  
  /** 标题（可选） */
  @Prop() tooltipTitle?: string;
  
  /** 内部状态 */
  @State() isManualControl: boolean = false;
  
  componentWillLoad() {
    this.isManualControl = this.trigger === 'manual';
  }
  
  @Watch('trigger')
  watchTrigger(newVal: string) {
    this.isManualControl = newVal === 'manual';
  }
  
  private getTooltipClass() {
    const classes = ['ldesign-tooltip__popup'];
    if (this.size) classes.push(`ldesign-tooltip__popup--${this.size}`);
    if (this.tooltipClass) classes.push(this.tooltipClass);
    return classes.join(' ');
  }

  render() {
    const popupProps: any = {
      placement: this.placement,
      trigger: this.trigger as any,
      interactive: this.interactive,
      showDelay: this.showDelay,
      hideDelay: this.hideDelay,
      disabled: this.disabled,
      arrow: this.arrow,
      offsetDistance: this.offsetDistance,
      popupRole: 'tooltip',
      theme: this.theme,
      content: this.content,
      animation: this.animation,
      autoCloseDelay: this.autoCloseDelay,
      closable: this.closable && this.trigger === 'click',
      popupClass: this.getTooltipClass(),
      motionEnabled: true,
      motionDuration: this.motionDuration,
      motionDistance: this.motionDistance,
      lockOnScroll: this.lockOnScroll,
      popupTitle: this.tooltipTitle
    };
    
    // 处理宽度设置
    if (this.width) {
      popupProps.width = this.width;
    } else {
      popupProps.maxWidth = this.maxWidth;
    }
    
    // 手动控制模式
    if (this.isManualControl) {
      popupProps.visible = this.visible;
    }
    
    return (
      <Host class={{ 
        'ldesign-tooltip': true,
        [`ldesign-tooltip--${this.size}`]: true,
        [`ldesign-tooltip--${this.theme}`]: true,
        'ldesign-tooltip--interactive': this.interactive
      }}>
        <ldesign-popup {...popupProps}>
          <span slot="trigger"><slot /></span>
        </ldesign-popup>
      </Host>
    );
  }
}

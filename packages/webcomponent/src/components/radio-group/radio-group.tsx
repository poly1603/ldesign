import { Component, Prop, Event, EventEmitter, Watch, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';

/**
 * RadioGroup 单选框组组件
 * 管理一组单选框的状态
 */
@Component({
  tag: 'ldesign-radio-group',
  styleUrl: 'radio-group.less',
  shadow: false,
})
export class LdesignRadioGroup {
  @Element() el!: HTMLElement;

  /**
   * 绑定值
   */
  @Prop({ mutable: true }) value?: string | number;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 排列方向
   */
  @Prop() direction: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * 单选框组尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 组名称，用于原生表单
   */
  @Prop() name?: string;

  /**
   * 当绑定值变化时触发的事件
   */
  @Event() ldesignChange!: EventEmitter<string | number>;

  /**
   * 监听value属性变化
   */
  @Watch('value')
  watchValue(_newValue: string | number) {
    this.updateRadioStates();
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.setupRadioGroup();
    this.updateRadioStates();
  }

  /**
   * 设置单选框组
   */
  private setupRadioGroup() {
    const radios = this.el.querySelectorAll('ldesign-radio');
    
    radios.forEach((radio: any, index) => {
      // 设置name属性用于分组
      if (this.name) {
        radio.name = this.name;
      } else {
        radio.name = `radio-group-${Date.now()}-${index}`;
      }
      
      // 设置尺寸
      if (this.size) {
        radio.size = this.size;
      }
      
      // 设置禁用状态
      if (this.disabled) {
        radio.disabled = true;
      }
      
      // 监听单选框变化事件
      radio.addEventListener('ldesignChange', this.handleRadioChange);
    });
  }

  /**
   * 更新单选框状态
   */
  private updateRadioStates() {
    const radios = this.el.querySelectorAll('ldesign-radio');
    
    radios.forEach((radio: any) => {
      radio.checked = radio.value === this.value;
    });
  }

  /**
   * 处理单选框变化事件
   */
  private handleRadioChange = (event: CustomEvent) => {
    const newValue = event.detail;
    
    if (newValue !== this.value) {
      this.value = newValue;
      this.ldesignChange.emit(newValue);
    }
  };

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    const radios = this.el.querySelectorAll('ldesign-radio');
    radios.forEach((radio: any) => {
      radio.removeEventListener('ldesignChange', this.handleRadioChange);
    });
  }

  render() {
    const classes = {
      'ldesign-radio-group': true,
      [`ldesign-radio-group--${this.direction}`]: true,
      [`ldesign-radio-group--${this.size}`]: true,
      'ldesign-radio-group--disabled': this.disabled,
    };

    return (
      <Host
        class={classes}
        role="radiogroup"
        aria-disabled={this.disabled ? 'true' : 'false'}
      >
        <slot></slot>
      </Host>
    );
  }
}

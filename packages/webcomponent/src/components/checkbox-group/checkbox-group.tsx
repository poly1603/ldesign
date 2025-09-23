import { Component, Prop, Event, EventEmitter, Watch, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';

/**
 * CheckboxGroup 复选框组组件
 * 管理一组复选框的状态
 */
@Component({
  tag: 'ldesign-checkbox-group',
  styleUrl: 'checkbox-group.less',
  shadow: false,
})
export class LdesignCheckboxGroup {
  @Element() el!: HTMLElement;

  /**
   * 绑定值
   */
  @Prop({ mutable: true }) value: Array<string | number> = [];

  /** 是否禁用 */
  @Prop() disabled: boolean = false;

  /** 组方向 */
  @Prop() direction: 'horizontal' | 'vertical' = 'horizontal';

  /** 复选框组尺寸 */
  @Prop() size: Size = 'medium';

  /** 最小可选数量 */
  @Prop() min?: number;

  /** 最大可选数量 */
  @Prop() max?: number;

  /** 统一外观主题（可被子项覆盖） */
  @Prop() status: 'brand' | 'success' | 'warning' | 'danger' | 'info' = 'brand';

  /** 统一变体（可被子项覆盖） */
  @Prop() variant: 'default' | 'outline' | 'filled' | 'button' = 'default';

  /** 统一形状（可被子项覆盖） */
  @Prop() shape: 'square' | 'round' = 'square';

  /** 统一标签位置（可被子项覆盖） */
  @Prop() labelPlacement: 'left' | 'right' = 'right';

  /**
   * 当绑定值变化时触发的事件
   */
  @Event() ldesignChange!: EventEmitter<Array<string | number>>;

  @Watch('value')
  watchValue() {
    this.updateCheckboxStates();
  }

  componentDidLoad() {
    this.setupCheckboxGroup();
    this.updateCheckboxStates();
  }

  private setupCheckboxGroup() {
    const checkboxes = this.el.querySelectorAll('ldesign-checkbox');

    checkboxes.forEach((box: any) => {
      // 尺寸/禁用
      box.size = this.size;
      if (this.disabled) box.disabled = true;

      // 级联外观（若子项未显式设置）
      if (!('status' in box) || box.status === undefined) box.status = this.status;
      if (!('variant' in box) || box.variant === undefined) box.variant = this.variant;
      if (!('shape' in box) || box.shape === undefined) box.shape = this.shape;
      if (!('labelPlacement' in box) || box.labelPlacement === undefined) box.labelPlacement = this.labelPlacement;

      // 监听变化
      box.addEventListener('ldesignChange', this.handleCheckboxChange);
    });
  }

  private updateCheckboxStates() {
    const checkboxes = this.el.querySelectorAll('ldesign-checkbox');

    checkboxes.forEach((box: any) => {
      const val = box.value;
      box.checked = this.value ? this.value.includes(val) : false;
    });
  }

  private handleCheckboxChange = (event: CustomEvent<boolean>) => {
    const target = event.target as any;
    const checked = event.detail;
    const val = target.value;

    const set = new Set(this.value || []);

    if (checked) {
      if (this.max !== undefined && set.size >= this.max && !set.has(val)) {
        // 违反最大数量限制，回退
        target.checked = false;
        return;
      }
      set.add(val);
    } else {
      if (this.min !== undefined && set.size <= this.min && set.has(val)) {
        // 违反最小数量限制，回退
        target.checked = true;
        return;
      }
      set.delete(val);
    }

    this.value = Array.from(set);
    this.ldesignChange.emit(this.value);
  };

  disconnectedCallback() {
    const checkboxes = this.el.querySelectorAll('ldesign-checkbox');
    checkboxes.forEach((box: any) => {
      box.removeEventListener('ldesignChange', this.handleCheckboxChange);
    });
  }

  render() {
    const classes = {
      'ldesign-checkbox-group': true,
      'ldesign-checkbox-group--horizontal': this.direction === 'horizontal',
      'ldesign-checkbox-group--disabled': this.disabled,
      'ldesign-checkbox-group--button': this.variant === 'button',
    };

    return (
      <Host class={classes} role="group" aria-disabled={this.disabled ? 'true' : 'false'}>
        <slot></slot>
      </Host>
    );
  }
}
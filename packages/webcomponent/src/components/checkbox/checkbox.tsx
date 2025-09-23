import { Component, Prop, State, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Checkbox 复选框组件
 * 在一组备选项中进行多选
 */
@Component({
  tag: 'ldesign-checkbox',
  styleUrl: 'checkbox.less',
  shadow: false,
})
export class LdesignCheckbox {
  private checkboxElement?: HTMLInputElement;

  /**
   * 是否选中
   */
  @Prop({ mutable: true }) checked: boolean = false;

  /**
   * 选中状态的值
   */
  @Prop() value?: string | number;

  /**
   * 原生表单 name，用于表单提交/分组
   */
  @Prop() name?: string;

  /**
   * 是否禁用
   */
  @Prop() disabled: boolean = false;

  /**
   * 设置半选状态，只负责样式控制
   */
  @Prop() indeterminate: boolean = false;

  /**
   * 是否显示边框（兼容旧 API）
   */
  @Prop() border: boolean = false;

  /**
   * 是否为按钮样式（兼容旧 API）
   */
  @Prop() button: boolean = false;

  /**
   * 多选框的尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 外观主题颜色
   * @default 'brand'
   */
  @Prop() status: 'brand' | 'success' | 'warning' | 'danger' | 'info' = 'brand';

  /**
   * 外观变体
   * @default 'default'
   */
  @Prop() variant: 'default' | 'outline' | 'filled' | 'button' = 'default';

  /**
   * 形状
   * @default 'square'
   */
  @Prop() shape: 'square' | 'round' = 'square';

  /**
   * 标签位置
   * @default 'right'
   */
  @Prop() labelPlacement: 'left' | 'right' = 'right';

  /**
   * 内部状态：是否聚焦
   */
  @State() isFocused: boolean = false;

  /**
   * 当绑定值变化时触发的事件
   */
  @Event() ldesignChange!: EventEmitter<boolean>;

  /**
   * 监听checked属性变化
   */
  @Watch('checked')
  watchChecked(newValue: boolean) {
    if (this.checkboxElement) {
      this.checkboxElement.checked = newValue;
    }
  }

  /**
   * 监听indeterminate属性变化
   */
  @Watch('indeterminate')
  watchIndeterminate(newValue: boolean) {
    if (this.checkboxElement) {
      this.checkboxElement.indeterminate = newValue;
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    if (this.checkboxElement) {
      this.checkboxElement.checked = this.checked;
      this.checkboxElement.indeterminate = this.indeterminate;
    }
  }

  /**
   * 处理变更事件（使用原生 change 语义，提升可访问性与一致性）
   */
  private handleChange = (event: Event) => {
    if (this.disabled) return;

    const input = event.target as HTMLInputElement;
    this.checked = input.checked;

    // 常规交互中，半选在变更后应被清除
    if (this.indeterminate) {
      this.indeterminate = false;
      if (this.checkboxElement) {
        this.checkboxElement.indeterminate = false;
      }
    }

    this.ldesignChange.emit(this.checked);
  };

  /**
   * 处理聚焦事件
   */
  private handleFocus = () => {
    this.isFocused = true;
  };

  /**
   * 处理失焦事件
   */
  private handleBlur = () => {
    this.isFocused = false;
  };

  /**
   * 获取复选框类名
   */
  private getCheckboxClass(): string {
    const classes = ['ldesign-checkbox'];

    classes.push(`ldesign-checkbox--${this.size}`);

    if (this.checked) {
      classes.push('ldesign-checkbox--checked');
    }

    if (this.indeterminate) {
      classes.push('ldesign-checkbox--indeterminate');
    }

    if (this.disabled) {
      classes.push('ldesign-checkbox--disabled');
    }

    if (this.isFocused) {
      classes.push('ldesign-checkbox--focused');
    }

    if (this.border) {
      classes.push('ldesign-checkbox--border');
    }

    if (this.button || this.variant === 'button') {
      classes.push('ldesign-checkbox--button');
    }

    if (this.variant && this.variant !== 'default' && this.variant !== 'button') {
      classes.push(`ldesign-checkbox--variant-${this.variant}`);
    }

    if (this.status && this.status !== 'brand') {
      classes.push(`ldesign-checkbox--status-${this.status}`);
    }

    if (this.shape === 'round') {
      classes.push('ldesign-checkbox--shape-round');
    }

    if (this.labelPlacement === 'left') {
      classes.push('ldesign-checkbox--label-left');
    }

    return classes.join(' ');
  }

  /**
   * 渲染复选框图标
   */
  private renderCheckboxIcon() {
    if (this.indeterminate) {
      return <ldesign-icon name="minus" size="small" />;
    }

    if (this.checked) {
      return <ldesign-icon name="check" size="small" />;
    }

    return null;
  }

  render() {
    return (
      <Host style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle'
      }}>
        <label class={this.getCheckboxClass()}>
          <input
            ref={(el) => (this.checkboxElement = el)}
            type="checkbox"
            class="ldesign-checkbox__input"
            name={this.name}
            checked={this.checked}
            disabled={this.disabled}
            value={this.value}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            tabindex={this.disabled ? -1 : 0}
            aria-checked={this.indeterminate ? 'mixed' : this.checked.toString()}
            aria-disabled={this.disabled.toString()}
          />
          <span class="ldesign-checkbox__inner">
            {this.renderCheckboxIcon()}
          </span>
          <span class="ldesign-checkbox__label">
            <slot />
          </span>
        </label>
      </Host>
    );
  }
}

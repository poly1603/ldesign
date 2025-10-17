import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type SelectPlacement = Placement;
export type SelectTrigger = 'click' | 'focus' | 'manual';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

/**
 * Select 选择器
 * 基于 <ldesign-popup> 实现，支持单选/多选。
 */
@Component({
  tag: 'ldesign-select',
  styleUrl: 'select.less',
  shadow: false,
})
export class LdesignSelect {
  @Element() el!: HTMLElement;

  /** 选项列表（可传数组或 JSON 字符串） */
  @Prop() options: string | SelectOption[] = [];

  /** 值（受控）。单选时为 string，多选时为 string[] */
  @Prop({ mutable: true }) value?: string | string[];

  /** 默认值（非受控） */
  @Prop() defaultValue?: string | string[];

  /** 是否多选 */
  @Prop() multiple: boolean = false;

  /** 触发方式（Select 多数使用 click 或 manual） */
  @Prop() trigger: SelectTrigger = 'click';

  /** 出现位置（默认 bottom-start） */
  @Prop() placement: SelectPlacement = 'bottom-start';

  /** 是否禁用 */
  @Prop() disabled: boolean = false;

  /** 占位文案（无选中项时） */
  @Prop() placeholder: string = '请选择';

  /** 可清空 */
  @Prop() clearable: boolean = false;

  /** 多选时最多展示的标签数量，超过后折叠为 +N */
  @Prop() maxTagCount?: number;

  /** 列表最大高度（px） */
  @Prop() maxHeight: number = 240;

  /** 列表宽度（可选） */
  @Prop() width?: number | string;

  /** 主题（浅色/深色），透传给 Popup */
  @Prop() theme: 'light' | 'dark' = 'light';

  /** 是否显示箭头（默认不显示） */
  @Prop() arrow: boolean = false;

  /** 选中项后是否自动关闭（默认：单选 true，多选 false） */
  @Prop() closeOnSelect?: boolean;

  /** 外部受控可见性（仅 trigger = 'manual' 生效） */
  @Prop({ mutable: true }) visible: boolean = false;

  /** 选中变化事件 */
  @Event() ldesignChange!: EventEmitter<{ value: string | string[] | undefined; options: SelectOption[] }>; 

  /** 对外转发可见性变化 */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  @State() parsedOptions: SelectOption[] = [];
  @State() currentValues: string[] = [];
  @State() highlightIndex: number = -1;

  private listEl?: HTMLElement;

  @Watch('options')
  watchOptions(val: string | SelectOption[]) {
    this.parsedOptions = this.parseOptions(val);
  }

  @Watch('value')
  watchValue(newVal?: string | string[]) {
    this.currentValues = this.normalizeToArray(newVal);
  }

  @Watch('multiple')
  watchMultiple() {
    // 多选切换时，标准化当前值
    this.currentValues = this.normalizeToArray(this.value ?? this.defaultValue);
  }

  componentWillLoad() {
    this.parsedOptions = this.parseOptions(this.options);
    const initial = this.value !== undefined ? this.value : this.defaultValue;
    this.currentValues = this.normalizeToArray(initial);
  }

  private parseOptions(val: string | SelectOption[]): SelectOption[] {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  }

  private normalizeToArray(val?: string | string[]): string[] {
    if (val === undefined || val === null) return [];
    if (Array.isArray(val)) return val;
    // 尝试解析 JSON 数组字符串
    if (typeof val === 'string' && this.multiple && val.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(val);
        return Array.isArray(arr) ? arr : [String(val)];
      } catch { /* ignore */ }
    }
    return [String(val)];
  }

  private getItemIndexByValue(v?: string): number {
    if (!v) return -1;
    return this.parsedOptions.findIndex(i => i.value === v);
  }

  private getEnabledIndices(): number[] {
    return this.parsedOptions.map((it, i) => ({ it, i })).filter(x => !x.it.disabled).map(x => x.i);
  }

  private moveHighlight(delta: number) {
    const enabled = this.getEnabledIndices();
    if (!enabled.length) return;
    let cur = this.highlightIndex;
    if (cur < 0) {
      this.highlightIndex = enabled[0];
      this.scrollHighlightedIntoView();
      return;
    }
    const pos = enabled.indexOf(cur);
    const nextPos = (pos + delta + enabled.length) % enabled.length;
    this.highlightIndex = enabled[nextPos];
    this.scrollHighlightedIntoView();
  }

  private scrollHighlightedIntoView() {
    if (!this.listEl) return;
    const items = Array.from(this.listEl.querySelectorAll('.ldesign-select__item')) as HTMLElement[];
    const target = items[this.highlightIndex];
    if (target) target.scrollIntoView({ block: 'nearest' });
  }

  private isSelected(value: string) {
    return this.currentValues.includes(value);
  }

  private selectByIndex(index: number) {
    const item = this.parsedOptions[index];
    if (!item || item.disabled) return;
    this.onItemClick(item);
  }

  private emitChange() {
    const selected = this.parsedOptions.filter(o => this.currentValues.includes(o.value));
    const outVal = this.multiple ? this.currentValues.slice() : (this.currentValues[0] ?? undefined);
    this.ldesignChange.emit({ value: outVal, options: selected });
  }

  private updateValue(newValues: string[]) {
    if (this.value !== undefined) {
      // 受控：仅发事件
      const selected = this.parsedOptions.filter(o => newValues.includes(o.value));
      const outVal = this.multiple ? newValues.slice() : (newValues[0] ?? undefined);
      this.ldesignChange.emit({ value: outVal, options: selected });
    } else {
      // 非受控：同步内部与对外属性
      this.currentValues = newValues.slice();
      this.value = this.multiple ? newValues.slice() : (newValues[0] ?? undefined as any);
      this.emitChange();
    }
  }

  private onItemClick = (item: SelectOption, ev?: MouseEvent) => {
    if (item.disabled) { ev?.preventDefault(); return; }
    const next = new Set(this.currentValues);
    if (this.multiple) {
      if (next.has(item.value)) next.delete(item.value); else next.add(item.value);
      this.updateValue(Array.from(next));
      // 多选默认不关闭
      const shouldClose = this.closeOnSelect === undefined ? false : !!this.closeOnSelect;
      if (shouldClose && this.trigger !== 'manual') this.hideInnerPopup();
    } else {
      next.clear();
      next.add(item.value);
      this.updateValue(Array.from(next));
      const shouldClose = this.closeOnSelect === undefined ? true : !!this.closeOnSelect;
      if (shouldClose && this.trigger !== 'manual') this.hideInnerPopup();
    }
  };

  private clearAll = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;
    this.updateValue([]);
  };

  private removeTag = (val: string, e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;
    const next = this.currentValues.filter(v => v !== val);
    this.updateValue(next);
  };

  private onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const popup = this.getInnerPopup();
      if (popup) (popup as any).visible = true;
    } else if (e.key === 'Backspace' && this.multiple && !this.currentValues.length) {
      // no-op when empty
    } else if (e.key === 'Backspace' && this.multiple && this.currentValues.length) {
      // 删除最后一个标签
      this.updateValue(this.currentValues.slice(0, -1));
    }
  };

  private onListKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); this.moveHighlight(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.moveHighlight(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (this.highlightIndex >= 0) this.selectByIndex(this.highlightIndex); }
    else if (e.key === 'Escape') {
      const popup = this.getInnerPopup();
      if (popup) (popup as any).visible = false;
    }
  };

  private getInnerPopup(): HTMLLdesignPopupElement | null {
    return this.el?.querySelector('ldesign-popup') as any;
  }

  private hideInnerPopup() {
    const popup = this.getInnerPopup();
    if (popup) (popup as any).visible = false;
  }

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') {
      this.visible = e.detail;
    }
    if (e.detail) {
      // 打开时高亮当前第一选中项，否则第一个可用
      const idx = this.multiple
        ? this.getItemIndexByValue(this.currentValues[0])
        : this.getItemIndexByValue(this.currentValues[0]);
      const enabled = this.getEnabledIndices();
      this.highlightIndex = idx >= 0 ? idx : (enabled[0] ?? -1);
      requestAnimationFrame(() => this.listEl?.focus());
    }
  };

  private renderDefaultTrigger() {
    const hasValue = this.currentValues.length > 0;
    const classes = {
      'ldesign-select__trigger': true,
      'ldesign-select__trigger--placeholder': !hasValue,
      'ldesign-select__trigger--disabled': this.disabled,
      'ldesign-select__trigger--multiple': this.multiple,
    } as any;

    const clearBtn = this.clearable && hasValue && !this.disabled ? (
      <span class="ldesign-select__clear" onClick={this.clearAll} title="清空">
        <ldesign-icon name="x" size="small" />
      </span>
    ) : null;

    const arrow = (
      <span class="ldesign-select__arrow">
        <ldesign-icon name="chevron-down" size="small" />
      </span>
    );

    const content = this.multiple ? this.renderTags() : (
      <span class="ldesign-select__text">{hasValue ? this.getLabelByValue(this.currentValues[0]) : this.placeholder}</span>
    );

    return (
      <div class={classes} tabindex={this.disabled ? -1 : 0} onKeyDown={this.onTriggerKeyDown as any}>
        {content}
        {clearBtn}
        {arrow}
      </div>
    );
  }

  private getLabelByValue(v?: string) {
    const item = this.parsedOptions.find(o => o.value === v);
    return item ? item.label : v;
  }

  private renderTags() {
    const max = this.maxTagCount ?? Infinity;
    const shown = this.currentValues.slice(0, max);
    const rest = this.currentValues.length - shown.length;
    return (
      <div class="ldesign-select__tags">
        {shown.map(v => (
          <span class="ldesign-select__tag" key={v} title={this.getLabelByValue(v)}>
            <span class="ldesign-select__tag-text">{this.getLabelByValue(v)}</span>
            {!this.disabled && (
              <span class="ldesign-select__tag-close" onClick={(e) => this.removeTag(v, e)}>
                <ldesign-icon name="x" size="small" />
              </span>
            )}
          </span>
        ))}
        {rest > 0 && <span class="ldesign-select__tag ldesign-select__tag--rest">+{rest}</span>}
        {!this.currentValues.length && <span class="ldesign-select__placeholder">{this.placeholder}</span>}
      </div>
    );
  }

  private renderList() {
    const role = 'listbox';
    const ariaMulti = this.multiple ? { 'aria-multiselectable': 'true' } : {} as any;

    return (
      <ul 
        class="ldesign-select__list" 
        role={role}
        tabindex={0}
        onKeyDown={this.onListKeyDown as any}
        ref={(el) => this.listEl = el as HTMLElement}
        style={{ maxHeight: `${this.maxHeight}px`, overflowY: 'auto' }}
        {...ariaMulti}
      >
        {this.parsedOptions.map((it, i) => {
          const active = i === this.highlightIndex;
          const selected = this.isSelected(it.value);
          const classes = {
            'ldesign-select__item': true,
            'ldesign-select__item--active': active,
            'ldesign-select__item--selected': selected,
            'ldesign-select__item--disabled': !!it.disabled,
          } as any;
          return (
            <li 
              class={classes}
              role="option"
              aria-selected={selected ? 'true' : 'false'}
              onClick={(e) => this.onItemClick(it, e)}
            >
              {this.multiple && <span class="ldesign-select__check">{selected ? <ldesign-icon name="check" size="small" /> : <span class="ldesign-select__check-placeholder" />}</span>}
              <span class="ldesign-select__label">{it.label}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const contentStyle: any = {};
    if (this.width) contentStyle.width = typeof this.width === 'number' ? `${this.width}px` : this.width;

    // manual 模式才把 visible 传入
    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};

    return (
      <Host class={{ 'ldesign-select': true, 'ldesign-select--disabled': this.disabled, 'ldesign-select--multiple': this.multiple }}>
        <ldesign-popup
          placement={this.placement}
          trigger={this.trigger as any}
          interactive={true}
          arrow={this.arrow}
          theme={this.theme}
          closeOnOutside={true}
          onLdesignVisibleChange={this.handlePopupVisibleChange}
          {...visibleProp}
        >
          <span slot="trigger">
            <slot name="trigger">{this.renderDefaultTrigger()}</slot>
          </span>

          <div class="ldesign-select__content" style={contentStyle}>
            {this.renderList()}
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}
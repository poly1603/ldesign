import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type DropdownPlacement = Placement;
export type DropdownTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
}

/**
 * Dropdown 下拉菜单
 * 基于 <ldesign-popup> 实现
 */
@Component({
  tag: 'ldesign-dropdown',
  styleUrl: 'dropdown.less',
  shadow: false,
})
export class LdesignDropdown {
  @Element() el!: HTMLElement;

  /** 下拉项列表（可传数组或 JSON 字符串） */
  @Prop() items: string | DropdownItem[] = [];

  /** 选中值（受控） */
  @Prop({ mutable: true }) value?: string;

  /** 默认值（非受控） */
  @Prop() defaultValue?: string;

  /** 触发方式（默认 click） */
  @Prop() trigger: DropdownTrigger = 'click';

  /** 出现位置（默认 bottom-start） */
  @Prop() placement: DropdownPlacement = 'bottom-start';

  /** 是否禁用 */
  @Prop() disabled: boolean = false;

  /** 列表最大高度（px） */
  @Prop() maxHeight: number = 240;

  /** 列表宽度（可选） */
  @Prop() width?: number | string;

  /** 主题（浅色/深色），透传给 Popup */
  @Prop() theme: 'light' | 'dark' = 'light';

  /** 是否显示箭头（默认不显示） */
  @Prop() arrow: boolean = false;

  /** 点击选项后是否自动关闭 */
  @Prop() closeOnSelect: boolean = true;

  /** 外部受控可见性（仅 trigger = 'manual' 生效） */
  @Prop({ mutable: true }) visible: boolean = false;

  /** 占位文案（当未选中任何项且使用默认 trigger 时显示） */
  @Prop() placeholder: string = '请选择';

  /** 选中变化事件 */
  @Event() ldesignChange!: EventEmitter<{ key: string; item: DropdownItem }>; 

  /** 对外转发可见性变化 */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  @State() parsedItems: DropdownItem[] = [];
  @State() currentKey?: string;
  @State() highlightIndex: number = -1;

  private listEl?: HTMLElement;

  @Watch('items')
  watchItems(val: string | DropdownItem[]) {
    this.parsedItems = this.parseItems(val);
  }

  @Watch('value')
  watchValue(newVal?: string) {
    this.currentKey = newVal;
  }

  componentWillLoad() {
    this.parsedItems = this.parseItems(this.items);
    this.currentKey = this.value ?? this.defaultValue;
  }

  private parseItems(val: string | DropdownItem[]): DropdownItem[] {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  }

  private getItemIndexByKey(key?: string): number {
    if (!key) return -1;
    return this.parsedItems.findIndex(i => i.key === key);
  }

  private getEnabledIndices(): number[] {
    return this.parsedItems.map((it, i) => ({ it, i })).filter(x => !x.it.disabled && !x.it.divider).map(x => x.i);
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
    const items = Array.from(this.listEl.querySelectorAll('.ldesign-dropdown__item')) as HTMLElement[];
    const target = items[this.highlightIndex];
    if (target) target.scrollIntoView({ block: 'nearest' });
  }

  private selectByIndex(index: number) {
    const item = this.parsedItems[index];
    if (!item || item.disabled || item.divider) return;
    this.onItemClick(item);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); this.moveHighlight(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.moveHighlight(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (this.highlightIndex >= 0) this.selectByIndex(this.highlightIndex); }
    else if (e.key === 'Escape') {
      const popup = this.getInnerPopup();
      if (popup) (popup as any).visible = false;
    }
  };

  private onItemClick = (item: DropdownItem, ev?: MouseEvent) => {
    if (item.disabled || item.divider) { ev?.preventDefault(); return; }
    if (this.value !== undefined) {
      this.ldesignChange.emit({ key: item.key, item });
    } else {
      this.currentKey = item.key;
      this.value = item.key;
      this.ldesignChange.emit({ key: item.key, item });
    }
    if (this.closeOnSelect && this.trigger !== 'manual') {
      this.hideInnerPopup();
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
      if (e.detail) {
        // 打开时重置高亮为当前选中项，并将焦点移动到列表以支持键盘操作
        const idx = this.getItemIndexByKey(this.currentKey);
        this.highlightIndex = idx >= 0 ? idx : -1;
        requestAnimationFrame(() => this.listEl?.focus());
      }
    } else {
      if (e.detail) {
        const idx = this.getItemIndexByKey(this.currentKey);
        this.highlightIndex = idx >= 0 ? idx : -1;
        requestAnimationFrame(() => this.listEl?.focus());
      }
    }
  };

  private renderIcon(icon?: string) {
    if (!icon) return null;
    return <span class="ldesign-dropdown__icon"><ldesign-icon name={icon} size="small" /></span>;
  }

  private renderDefaultTrigger() {
    const selected = this.parsedItems.find(it => it.key === this.currentKey);
    const label = selected ? selected.label : this.placeholder;
    return (
      <div class={{
        'ldesign-dropdown__trigger': true,
        'ldesign-dropdown__trigger--placeholder': !selected,
        'ldesign-dropdown__trigger--disabled': this.disabled,
      }}>
        <span class="ldesign-dropdown__trigger-text">{label}</span>
        <span class="ldesign-dropdown__trigger-arrow"><ldesign-icon name="chevron-down" size="small" /></span>
      </div>
    );
  }

  private renderList() {
    const selectedIdx = this.getItemIndexByKey(this.currentKey);
    const role = 'listbox';

    return (
      <ul 
        class="ldesign-dropdown__list" 
        role={role}
        tabindex={0}
        onKeyDown={this.onKeyDown as any}
        ref={(el) => this.listEl = el as HTMLElement}
        style={{ maxHeight: `${this.maxHeight}px`, overflowY: 'auto' }}
      >
        {this.parsedItems.map((it, i) => {
          if (it.divider) return <li class="ldesign-dropdown__divider" role="separator"></li>;
          const active = i === this.highlightIndex;
          const selected = i === selectedIdx;
          return (
            <li 
              class={{
                'ldesign-dropdown__item': true,
                'ldesign-dropdown__item--active': active,
                'ldesign-dropdown__item--selected': selected,
                'ldesign-dropdown__item--disabled': !!it.disabled,
              }}
              role="option"
              aria-selected={selected ? 'true' : 'false'}
              onClick={(e) => this.onItemClick(it, e)}
            >
              {this.renderIcon(it.icon)}
              <span class="ldesign-dropdown__label">{it.label}</span>
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
      <Host class={{ 'ldesign-dropdown': true, 'ldesign-dropdown--disabled': this.disabled }}>
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

          <div class="ldesign-dropdown__content" style={contentStyle}>
            {this.renderList()}
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}
import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch, Fragment } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type DropdownPlacement = Placement;
export type DropdownTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  /** 子菜单 */
  children?: DropdownItem[];
  /** 链接项（如果提供则以链接形式渲染） */
  href?: string;
  target?: string;
  /** 描述文本（显示在主标签下方） */
  description?: string;
  /** 右侧快捷键提示 */
  shortcut?: string;
  /** 危险项（强调红色） */
  danger?: boolean;
  /** 覆盖全局 closeOnSelect */
  closeOnSelect?: boolean;
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

  /** 触发器文本（默认触发器显示的固定文案，不随选择变化） */
  @Prop() placeholder: string = '请选择';

  /** 是否将选中项同步到默认触发器文本（默认不同步） */
  @Prop() reflectSelectionOnTrigger: boolean = false;

  /** 是否在菜单项上展示选中样式（默认不展示） */
  @Prop() showSelected: boolean = false;

  /** 菜单宽度是否跟随触发器宽度（默认否） */
  @Prop() fitTriggerWidth: boolean = false;

  /** 子菜单的触发方式（hover/click），默认 hover */
  @Prop() submenuTrigger: 'hover' | 'click' = 'hover';

  /** 浮层挂载位置：默认 body，避免在文档容器中被裁剪 */
  @Prop() appendTo: 'self' | 'body' | 'closest-popup' = 'body';

  /** 选中变化事件 */
  @Event() ldesignChange!: EventEmitter<{ key: string; item: DropdownItem }>; 

  /** 对外转发可见性变化 */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  @State() parsedItems: DropdownItem[] = [];
  @State() currentKey?: string;
  @State() highlightIndex: number = -1;
  @State() computedContentWidth?: number;

  private listEl?: HTMLElement;
  private triggerWrapper?: HTMLElement;
  private submenuRefs: Map<string, any> = new Map();

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

  componentDidLoad() {
    window.addEventListener('resize', this.handleResize);
    this.updateFitWidth();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
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
    const shouldClose = (item.closeOnSelect ?? this.closeOnSelect) && this.trigger !== 'manual';
    if (shouldClose) {
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
        // 打开时根据 showSelected 决定是否预高亮当前选中项，并将焦点移动到列表以支持键盘操作
        const idx = this.getItemIndexByKey(this.currentKey);
        this.highlightIndex = this.showSelected && idx >= 0 ? idx : -1;
        this.updateFitWidth();
        requestAnimationFrame(() => this.listEl?.focus());
      }
    } else {
      if (e.detail) {
        const idx = this.getItemIndexByKey(this.currentKey);
        this.highlightIndex = this.showSelected && idx >= 0 ? idx : -1;
        this.updateFitWidth();
        requestAnimationFrame(() => this.listEl?.focus());
      }
    }
  };

  private renderIcon(icon?: string) {
    if (!icon) return null;
    return <span class="ldesign-dropdown__icon"><ldesign-icon name={icon} size="small" /></span>;
  }

  private renderText(label: string, description?: string) {
    return (
      <span class="ldesign-dropdown__text">
        <span class="ldesign-dropdown__label">{label}</span>
        {description ? <span class="ldesign-dropdown__desc">{description}</span> : null}
      </span>
    );
  }

  private renderShortcut(shortcut?: string) {
    if (!shortcut) return null;
    return <span class="ldesign-dropdown__shortcut">{shortcut}</span>;
  }

  private renderDefaultTrigger() {
    const selected = this.parsedItems.find(it => it.key === this.currentKey);
    const label = this.reflectSelectionOnTrigger && selected ? selected.label : this.placeholder;
    return (
      <div class={{
        'ldesign-dropdown__trigger': true,
        'ldesign-dropdown__trigger--placeholder': !this.reflectSelectionOnTrigger || !selected,
        'ldesign-dropdown__trigger--disabled': this.disabled,
      }}>
        <span class="ldesign-dropdown__trigger-text">{label}</span>
        <span class="ldesign-dropdown__trigger-arrow"><ldesign-icon name="chevron-down" size="small" /></span>
      </div>
    );
  }

  private renderSubmenuArrow() {
    return <span class="ldesign-dropdown__submenu-arrow"><ldesign-icon name="chevron-right" size="small" /></span>;
  }

  private renderMenu(items: DropdownItem[], level: number = 0) {
    const role = level === 0 ? 'listbox' : 'menu';

    return (
      <ul 
        class="ldesign-dropdown__list" 
        role={role}
        tabindex={level === 0 ? 0 : undefined as any}
        onKeyDown={level === 0 ? (this.onKeyDown as any) : undefined}
        ref={level === 0 ? ((el) => this.listEl = el as HTMLElement) : undefined}
        style={{ maxHeight: `${this.maxHeight}px`, overflowY: 'auto' }}
      >
        {items.map((it, i) => {
          if (it.divider) return <li class="ldesign-dropdown__divider" role="separator"></li>;
          const active = level === 0 && i === this.highlightIndex;
          const selected = this.showSelected && it.key === this.currentKey;
          const hasChildren = Array.isArray(it.children) && it.children.length > 0;

          if (hasChildren) {
            return (
              <li
                class={{
                  'ldesign-dropdown__item': true,
                  'ldesign-dropdown__item--submenu': true,
                  'ldesign-dropdown__item--active': active,
                  'ldesign-dropdown__item--selected': selected,
                  'ldesign-dropdown__item--disabled': !!it.disabled,
                  'ldesign-dropdown__item--danger': !!it.danger,
                }}
                role="menuitem"
                aria-haspopup="true"
                aria-disabled={it.disabled ? 'true' : 'false'}
                onMouseEnter={() => {
                  if (this.submenuTrigger === 'hover') {
                    const p = this.submenuRefs.get(it.key);
                    if (p) (p as any).visible = true; // 强制展开子菜单，兜底
                  }
                }}
                onMouseLeave={() => {
                  if (this.submenuTrigger === 'hover') {
                    const p = this.submenuRefs.get(it.key);
                    if (p) (p as any).visible = false; // 鼠标离开父项时关闭（父层 popup 的 relatedTarget 保护会阻止误关）
                  }
                }}
              >
                <ldesign-popup
                  placement="right-start"
                  trigger={this.submenuTrigger === 'click' ? ('manual' as any) : ('hover' as any)}
                  interactive={true}
                  theme={this.theme}
                  appendTo="body"
                  closeOnOutside={true}
                  ref={(el) => { if (el) this.submenuRefs.set(it.key, el as any); else this.submenuRefs.delete(it.key); }}
                >
                  <div 
                    slot="trigger" 
                    class="ldesign-dropdown__item-inner"
                    onClick={(e) => {
                      if (this.submenuTrigger === 'click') {
                        e.preventDefault(); e.stopPropagation();
                        const p = this.submenuRefs.get(it.key);
                        if (p) (p as any).visible = !(p as any).visible;
                      }
                    }}
                  >
                    {this.renderIcon(it.icon)}
                    {this.renderText(it.label, it.description)}
                    {this.renderSubmenuArrow()}
                  </div>
                  <div class="ldesign-dropdown__content">
                    {this.renderMenu(it.children!, level + 1)}
                  </div>
                </ldesign-popup>
              </li>
            );
          }

          const content = (
            <Fragment>
              {this.renderIcon(it.icon)}
              {this.renderText(it.label, it.description)}
              {this.renderShortcut(it.shortcut)}
            </Fragment>
          );

          return (
            <li 
              class={{
                'ldesign-dropdown__item': true,
                'ldesign-dropdown__item--active': active,
                'ldesign-dropdown__item--selected': selected,
                'ldesign-dropdown__item--disabled': !!it.disabled,
                'ldesign-dropdown__item--danger': !!it.danger,
              }}
              role={level === 0 ? 'option' : 'menuitem'}
              aria-selected={level === 0 ? (selected ? 'true' : 'false') : undefined}
              onClick={(e) => this.onItemClick(it, e)}
            >
              {it.href ? (
                <a class="ldesign-dropdown__link" href={it.href} target={it.target || '_self'}>{content}</a>
              ) : content}
            </li>
          );
        })}
      </ul>
    );
  }

  private renderList() {
    return this.renderMenu(this.parsedItems, 0);
  }

  private handleResize = () => {
    this.updateFitWidth();
  };

  // nested popup does not need local timers/state now

  private updateFitWidth() {
    if (!this.fitTriggerWidth) return;
    const wrapper = this.triggerWrapper;
    if (!wrapper) return;
    const first = (wrapper.firstElementChild || wrapper) as HTMLElement;
    const rect = first.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    if (width && width !== this.computedContentWidth) {
      this.computedContentWidth = width;
    }
  }

  render() {
    const contentStyle: any = {};
    if (this.width) contentStyle.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    else if (this.fitTriggerWidth && this.computedContentWidth) contentStyle.width = `${this.computedContentWidth}px`;

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
          appendTo={this.appendTo as any}
          closeOnOutside={true}
          onLdesignVisibleChange={this.handlePopupVisibleChange}
          {...visibleProp}
        >
          <span slot="trigger" ref={(el) => this.triggerWrapper = el as HTMLElement}>
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
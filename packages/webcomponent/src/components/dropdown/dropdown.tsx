import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch, Fragment } from '@stencil/core';
import { Placement } from '@floating-ui/dom';

export type DropdownPlacement = Placement;
export type DropdownTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual';
export type DropdownVariant = 'auto' | 'pc' | 'mobile';

// New cross-platform dropdown nodes
export type DropdownNode = DropdownItem | DropdownGroup | DropdownDivider;
export interface DropdownItem {
  type?: 'item';
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  /** 子菜单（PC 端级联） */
  children?: DropdownNode[];
  /** 链接项（如果提供则以链接形式渲染） */
  href?: string;
  target?: string;
  /** 描述文本（显示在主标签下方，仅 PC） */
  description?: string;
  /** 右侧快捷键提示，仅 PC */
  shortcut?: string;
  /** 危险项（强调红色） */
  danger?: boolean;
  /** 覆盖全局 closeOnSelect */
  closeOnSelect?: boolean;
}
export interface DropdownGroup {
  type: 'group';
  title: string;
  children: DropdownNode[];
}
export interface DropdownDivider { type: 'divider'; }

/**
 * Dropdown 下拉菜单（PC 级联 + 移动端单列）
 * 兼容鼠标和触屏，默认根据指针类型自适应（variant=auto）。
 */
@Component({
  tag: 'ldesign-dropdown',
  styleUrl: 'dropdown.less',
  shadow: false,
})
export class LdesignDropdown {
  @Element() el!: HTMLElement;

  /** 下拉节点（数组或 JSON 字符串） */
  @Prop() items: string | DropdownNode[] = [];

  /** 选中值（受控） */
  @Prop({ mutable: true }) value?: string;

  /** 默认值（非受控） */
  @Prop() defaultValue?: string;

  /** 触发方式（PC） */
  @Prop() trigger: DropdownTrigger = 'click';

  /** 出现位置 */
  @Prop() placement: DropdownPlacement = 'bottom-start';

  /** 自适应：'auto' | 'pc' | 'mobile' */
  @Prop() variant: DropdownVariant = 'auto';

  /** 移动端选中态颜色（文本与对勾） */
  @Prop() activeColor: string = '#F53F3F';

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

  /** 是否在菜单项上展示选中样式（PC，默认不展示） */
  @Prop() showSelected: boolean = false;

  /** 菜单宽度是否跟随触发器宽度（默认否） */
  @Prop() fitTriggerWidth: boolean = false;

  /** 子菜单的触发方式（hover/click），默认 hover，仅 PC 生效 */
  @Prop() submenuTrigger: 'hover' | 'click' = 'hover';

  /** 浮层挂载位置：默认 body，避免在文档容器中被裁剪 */
  @Prop() appendTo: 'self' | 'body' | 'closest-popup' = 'body';

  /** 选中变化事件 */
  @Event() ldesignChange!: EventEmitter<{ key: string; item: DropdownItem }>; 

  /** 对外转发可见性变化 */
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  @State() parsedNodes: DropdownNode[] = [];
  @State() currentKey?: string;
  @State() highlightIndex: number = -1; // PC 键盘高亮
  @State() computedContentWidth?: number;

  private listEl?: HTMLElement;
  private triggerWrapper?: HTMLElement;
  private submenuRefs: Map<string, any> = new Map();

  // ---------- lifecycle ----------
  @Watch('items')
  watchItems(val: string | DropdownNode[]) {
    this.parsedNodes = this.parseNodes(val);
  }

  @Watch('value')
  watchValue(newVal?: string) { this.currentKey = newVal; }

  componentWillLoad() {
    this.parsedNodes = this.parseNodes(this.items);
    this.currentKey = this.value ?? this.defaultValue;
  }

  componentDidLoad() {
    window.addEventListener('resize', this.handleResize);
    this.updateFitWidth();
  }

  disconnectedCallback() { window.removeEventListener('resize', this.handleResize); }

  // ---------- utils ----------
  private isMobile(): boolean {
    if (this.variant === 'mobile') return true;
    if (this.variant === 'pc') return false;
    if (typeof window === 'undefined') return false;
    const coarse = (window as any).matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
    return coarse || window.innerWidth <= 768;
  }

  private parseNodes(val: string | DropdownNode[]): DropdownNode[] {
    let arr: any = [];
    if (typeof val === 'string') {
      try { arr = JSON.parse(val); } catch { arr = []; }
    } else if (Array.isArray(val)) {
      arr = val;
    }
    // 标准化：缺省 type 视为 item
    const normalize = (list: any[]): DropdownNode[] => (list || []).map((n) => {
      if (!n) return n;
      if (n.type === 'group') {
        return { type: 'group', title: n.title ?? n.label ?? '', children: normalize(n.children || []) } as DropdownGroup;
      }
      if (n.type === 'divider' || n.divider) return { type: 'divider' } as DropdownDivider;
      return { ...n, type: 'item' } as DropdownItem;
    });
    return normalize(arr);
  }

  private getItemIndexByKey(key?: string): number {
    if (!key) return -1;
    const flat = this.flattenTopLevelItems(this.parsedNodes);
    return flat.findIndex(i => i.key === key);
  }

  private flattenTopLevelItems(nodes: DropdownNode[]): DropdownItem[] {
    // 仅拍平第一层（group 展开为子项，忽略 divider）
    const res: DropdownItem[] = [];
    nodes.forEach(n => {
      if ((n as DropdownDivider).type === 'divider') return;
      if ((n as DropdownGroup).type === 'group') {
        const g = n as DropdownGroup;
        (g.children || []).forEach(c => { if ((c as any).type !== 'divider') res.push(c as DropdownItem); });
      } else {
        res.push(n as DropdownItem);
      }
    });
    return res;
  }

  private getEnabledIndices(): number[] {
    const firstLevel = this.flattenTopLevelItems(this.parsedNodes);
    return firstLevel.map((it, i) => ({ it, i })).filter(x => !x.it.disabled).map(x => x.i);
  }

  private moveHighlight(delta: number) {
    const enabled = this.getEnabledIndices();
    if (!enabled.length) return;
    let cur = this.highlightIndex;
    if (cur < 0) { this.highlightIndex = enabled[0]; this.scrollHighlightedIntoView(); return; }
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
    const firstLevel = this.flattenTopLevelItems(this.parsedNodes);
    const item = firstLevel[index];
    if (!item || item.disabled) return;
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
    if (item.disabled) { ev?.preventDefault(); return; }
    if (this.value !== undefined) {
      this.ldesignChange.emit({ key: item.key, item });
    } else {
      this.currentKey = item.key;
      this.value = item.key;
      this.ldesignChange.emit({ key: item.key, item });
    }
    const shouldClose = (item.closeOnSelect ?? this.closeOnSelect) && this.trigger !== 'manual';
    if (shouldClose) this.hideInnerPopup();
  };

  private getInnerPopup(): HTMLLdesignPopupElement | null {
    return this.el?.querySelector('ldesign-popup') as any;
  }
  private hideInnerPopup() { const p = this.getInnerPopup(); if (p) (p as any).visible = false; }

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    const isMobile = this.isMobile();
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) {
      if (!isMobile) {
        const idx = this.getItemIndexByKey(this.currentKey);
        this.highlightIndex = this.showSelected && idx >= 0 ? idx : -1;
        this.updateFitWidth();
        requestAnimationFrame(() => this.listEl?.focus());
      }
    }
  };

  private renderIcon(icon?: string) { if (!icon) return null; return <span class="ldesign-dropdown__icon"><ldesign-icon name={icon} size="small" /></span>; }
  private renderText(label: string, description?: string) {
    return (
      <span class="ldesign-dropdown__text">
        <span class="ldesign-dropdown__label">{label}</span>
        {description ? <span class="ldesign-dropdown__desc">{description}</span> : null}
      </span>
    );
  }
  private renderShortcut(shortcut?: string) { if (!shortcut) return null; return <span class="ldesign-dropdown__shortcut">{shortcut}</span>; }

  private renderDefaultTrigger() {
    const flat = this.flattenTopLevelItems(this.parsedNodes);
    const selected = flat.find(it => it.key === this.currentKey);
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

  private renderSubmenuArrow() { return <span class="ldesign-dropdown__submenu-arrow"><ldesign-icon name="chevron-right" size="small" /></span>; }

  // ---------- PC rendering ----------
  private renderPCNodes(nodes: DropdownNode[], level = 0) {
    const role = level === 0 ? 'listbox' : 'menu';
    return (
      <ul
        class={{ 'ldesign-dropdown__list': true, 'ldesign-dropdown__list--pc': true }}
        role={role}
        tabindex={level === 0 ? (0 as any) : undefined as any}
        onKeyDown={level === 0 ? (this.onKeyDown as any) : undefined}
        ref={level === 0 ? ((el) => this.listEl = el as HTMLElement) : undefined}
        style={{ maxHeight: `${this.maxHeight}px`, overflowY: 'auto' }}
      >
        {nodes.map((node, i) => {
          if ((node as DropdownDivider).type === 'divider') {
            return <li class="ldesign-dropdown__divider" role="separator"></li>;
          }
          if ((node as DropdownGroup).type === 'group') {
            const g = node as DropdownGroup;
            return (
              <Fragment>
                <li class="ldesign-dropdown__group-title">{g.title}</li>
                {this.renderPCNodes(g.children, level)}
              </Fragment>
            );
          }

          const it = node as DropdownItem;
          const active = level === 0 && i === this.highlightIndex; // 仅对首层计算键盘高亮位置，组展开后索引不完全一致，但不影响体验
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
                  <div slot="trigger" class="ldesign-dropdown__item-inner"
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
                    {this.renderPCNodes(it.children!, level + 1)}
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

  // ---------- Mobile rendering ----------
  private renderMobileList() {
    const list = this.flattenTopLevelItems(this.parsedNodes);
    return (
      <ul class={{ 'ldesign-dropdown__list': true, 'ldesign-dropdown__list--mobile': true }}>
        {list.map((it) => (
          <li
            class={{
              'ldesign-dropdown__item': true,
              'ldesign-dropdown__item--mobile': true,
              'ldesign-dropdown__item--selected': it.key === this.currentKey,
              'ldesign-dropdown__item--disabled': !!it.disabled || !!(it.children && it.children.length),
            }}
            onClick={() => {
              if (it.disabled || (it.children && it.children.length)) return; // 移动端不支持子菜单
              this.onItemClick(it);
            }}
          >
            <span class="ldesign-dropdown__label">{it.label}</span>
            {it.key === this.currentKey ? (
              <span class="ldesign-dropdown__check"><ldesign-icon name="check" size="small" /></span>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  private handleResize = () => { this.updateFitWidth(); };

  private updateFitWidth() {
    if (!this.fitTriggerWidth) return;
    const wrapper = this.triggerWrapper; if (!wrapper) return;
    const first = (wrapper.firstElementChild || wrapper) as HTMLElement;
    const rect = first.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    if (width && width !== this.computedContentWidth) this.computedContentWidth = width;
  }

  render() {
    const contentStyle: any = { '--ld-dropdown-active-color': this.activeColor } as any;
    if (this.width) contentStyle.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    else if (this.fitTriggerWidth && this.computedContentWidth) contentStyle.width = `${this.computedContentWidth}px`;

    const isMobile = this.isMobile();
    const actualTrigger = isMobile ? 'click' : this.trigger;
    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};

    return (
      <Host class={{ 'ldesign-dropdown': true, 'ldesign-dropdown--disabled': this.disabled, 'ldesign-dropdown--mobile': isMobile }} style={{ '--ld-dropdown-active-color': this.activeColor } as any}>
        <ldesign-popup
          placement={this.placement}
          trigger={actualTrigger as any}
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
            {isMobile ? this.renderMobileList() : this.renderPCNodes(this.parsedNodes, 0)}
          </div>
        </ldesign-popup>
      </Host>
    );
  }
}

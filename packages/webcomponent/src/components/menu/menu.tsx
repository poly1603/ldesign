import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';

export type MenuMode = 'horizontal' | 'vertical';
export type VerticalExpand = 'inline' | 'flyout' | 'mixed';
export type SubmenuTrigger = 'hover' | 'click';

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  href?: string;
  target?: string;
  children?: MenuItem[];
  divider?: boolean;
}

@Component({
  tag: 'ldesign-menu',
  styleUrl: 'menu.less',
  shadow: false,
})
export class LdesignMenu {
  @Element() el!: HTMLElement;

  /** 菜单数据（可传入 JSON 字符串或对象数组） */
  @Prop() items: string | MenuItem[] = [];

  /** 菜单模式：水平/垂直 */
  @Prop() mode: MenuMode = 'vertical';

  /** 垂直模式下的展开方式：inline（内嵌展开）、flyout（右侧弹出）、mixed（一层内嵌，更多层右侧弹出） */
  @Prop() verticalExpand: VerticalExpand = 'inline';

  /** 子菜单触发方式（仅 flyout 或水平模式下生效） */
  @Prop() submenuTrigger: SubmenuTrigger = 'hover';

  /** 当前选中项（受控） */
  @Prop({ mutable: true }) value?: string;

  /** 默认选中项（非受控） */
  @Prop() defaultValue?: string;

  /** 当前打开的子菜单 key 列表（受控，仅 inline/mixed 生效） */
  @Prop({ mutable: true }) openKeys?: string[];

  /** 默认打开的子菜单 key 列表（非受控，仅 inline/mixed 生效） */
  @Prop() defaultOpenKeys: string[] = [];

  /** 手风琴模式（仅 inline/mixed 生效）：同层级只允许展开一个 */
  @Prop() accordion: boolean = false;

  /** 子级缩进（px） */
  @Prop() indent: number = 16;

  /** 水平模式溢出项的展示文案 */
  @Prop() moreLabel: string = '更多';

  /** 水平模式“更多”按钮图标（保证一级项都有图标） */
  @Prop() moreIcon: string = 'more-horizontal';

  /** 选中事件 */
  @Event() ldesignSelect!: EventEmitter<{ key: string; item: MenuItem; pathKeys: string[] }>; 

  /** 展开/收起事件（inline/mixed） */
  @Event() ldesignOpenChange!: EventEmitter<{ key: string; open: boolean; openKeys: string[] }>; 

  /** 水平模式下，溢出项数量变化事件 */
  @Event() ldesignOverflowChange!: EventEmitter<{ overflowCount: number }>; 

  @State() parsedItems: MenuItem[] = [];
  @State() currentKey?: string;
  @State() internalOpenKeys: string[] = [];
  @State() overflowKeys: string[] = [];
  @State() flyoutOpenMap: { [key: string]: boolean } = {};

  private containerEl?: HTMLElement;
  private topItemEls: Map<string, HTMLElement> = new Map();
  private elToKey: Map<HTMLElement, string> = new Map();
  private widthCache: Map<string, number> = new Map();
  private popupRefs: Map<string, HTMLElement> = new Map();
  private moreEl?: HTMLElement;
  private ro?: ResizeObserver; // 观察容器宽度
  private itemRO?: ResizeObserver; // 观察每个顶层条目的尺寸变化
  private observed: Set<HTMLElement> = new Set();

  // 解析 items
  @Watch('items')
  watchItems(val: string | MenuItem[]) {
    this.parsedItems = this.parseItems(val);
    // 需要等待渲染后再测量
    requestAnimationFrame(() => this.computeOverflow());
  }

  @Watch('mode')
  watchMode() {
    requestAnimationFrame(() => this.computeOverflow());
  }

  @Watch('openKeys')
  watchOpenKeys(newVal?: string[]) {
    if (Array.isArray(newVal)) this.internalOpenKeys = [...newVal];
  }

  @Watch('value')
  watchValue(newVal?: string) {
    this.currentKey = newVal;
  }

  componentWillLoad() {
    this.parsedItems = this.parseItems(this.items);
    this.currentKey = this.value ?? this.defaultValue;
    this.internalOpenKeys = this.openKeys ? [...this.openKeys] : [...(this.defaultOpenKeys || [])];
  }

  componentDidLoad() {
    this.containerEl = this.el.querySelector('.ldesign-menu__list') as HTMLElement;
    if (this.mode === 'horizontal' && this.containerEl) {
      this.ro = new ResizeObserver(() => this.computeOverflow());
      this.ro.observe(this.containerEl);
      // 观察条目尺寸变化（图标异步渲染、字体加载等导致的宽度变化）
      this.ensureItemObserver();
      setTimeout(() => this.computeOverflow(), 0);
    }
  }

  disconnectedCallback() {
    this.ro?.disconnect();
    this.ro = undefined;
    this.itemRO?.disconnect();
    this.itemRO = undefined;
    this.observed.clear();
  }

  private parseItems(val: string | MenuItem[]): MenuItem[] {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  }

  private getPathKeys(key: string): string[] {
    const path: string[] = [];
    const walk = (items: MenuItem[], stack: string[]): boolean => {
      for (const it of items) {
        if (it.key === key) {
          path.push(...stack, it.key);
          return true;
        }
        if (it.children && walk(it.children, [...stack, it.key])) return true;
      }
      return false;
    };
    walk(this.parsedItems, []);
    return path;
  }

  private findItemByKey(key?: string): MenuItem | undefined {
    if (!key) return undefined;
    let res: MenuItem | undefined;
    const walk = (items: MenuItem[]) => {
      for (const it of items) {
        if (it.key === key) { res = it; return; }
        if (it.children) walk(it.children);
      }
    };
    walk(this.parsedItems);
    return res;
  }

  private isInlineLevel(level: number): boolean {
    if (this.mode !== 'vertical') return false;
    if (this.verticalExpand === 'inline') return true;
    if (this.verticalExpand === 'flyout') return false;
    // mixed：第一层 inline，更深层 flyout
    return level === 1;
  }

  private useFlyout(level: number): boolean {
    if (this.mode === 'horizontal') return true;
    if (this.verticalExpand === 'flyout') return true;
    if (this.verticalExpand === 'inline') return false;
    return level >= 2; // mixed：第二层及以上 flyout
  }

  private setSelectedKey(key: string) {
    const item = this.findItemByKey(key);
    const path = this.getPathKeys(key);
    if (this.value !== undefined) {
      // 受控，仅通知
      this.ldesignSelect.emit({ key, item: item!, pathKeys: path });
    } else {
      this.currentKey = key;
      this.value = key;
      this.ldesignSelect.emit({ key, item: item!, pathKeys: path });
    }
  }

  private setOpenKeys(newKeys: string[], changedKey: string, open: boolean) {
    this.internalOpenKeys = newKeys;
    this.openKeys = [...newKeys];
    this.ldesignOpenChange.emit({ key: changedKey, open, openKeys: [...newKeys] });
  }

  private getSiblingOpenKeys(targetKey: string): string[] {
    // 找到 targetKey 所在层级，收集其兄弟有 children 的 key
    const siblings: string[] = [];
    const dfs = (items: MenuItem[]): boolean => {
      for (const it of items) {
        if (it.key === targetKey) {
          items.forEach(sib => { if (sib.key !== targetKey && sib.children?.length) siblings.push(sib.key); });
          return true;
        }
        if (it.children && dfs(it.children)) return true;
      }
      return false;
    };
    dfs(this.parsedItems);
    return siblings;
  }

  private handleItemClick = (item: MenuItem, level: number, ev?: MouseEvent) => {
    if (item.disabled || item.divider) { ev?.preventDefault(); return; }

    const hasChildren = !!item.children?.length;
    if (hasChildren && this.isInlineLevel(level)) {
      const open = this.internalOpenKeys.includes(item.key);
      let next = [...this.internalOpenKeys];
      if (open) {
        next = next.filter(k => k !== item.key);
      } else {
        if (this.accordion) {
          const sibs = this.getSiblingOpenKeys(item.key);
          next = next.filter(k => !sibs.includes(k));
        }
        next.push(item.key);
      }
      this.setOpenKeys(next, item.key, !open);
      return;
    }

    if (!hasChildren) {
      this.setSelectedKey(item.key);
      if (item.href) {
        window.open(item.href, item.target || '_self');
      }
    }
  };

  // 溢出计算（水平模式）
  private computeOverflow() {
    if (this.mode !== 'horizontal' || !this.containerEl) { this.overflowKeys = []; return; }

    // 若当前有任意 flyout 打开，冻结溢出计算以避免抖动导致的 DOM 变更
    const anyOpen = Object.values(this.flyoutOpenMap || {}).some(Boolean);
    if (anyOpen) return;

    const keys = this.parsedItems.map(i => i.key);
    const containerWidth = Math.ceil(this.containerEl.getBoundingClientRect().width);
    if (!containerWidth) { this.overflowKeys = []; return; }

    // 优先使用缓存宽度；若当前元素仍在，则更新缓存
    const widths = keys.map(k => {
      const el = this.topItemEls.get(k);
      if (el) {
        const w = Math.ceil(el.getBoundingClientRect().width);
        if (w > 0) this.widthCache.set(k, w);
        return w;
      }
      return this.widthCache.get(k) || 0;
    });

    // gap（flex 项之间的间距）
    const cs = window.getComputedStyle(this.containerEl);
    const gapStr = (cs.columnGap && cs.columnGap !== 'normal') ? cs.columnGap : (cs.gap || '0');
    const gap = Number.parseFloat(gapStr) || 0;

    // "更多"宽度（始终渲染隐藏的 more 节点，以便准确测量）
    const moreWidth = this.moreEl ? Math.ceil(this.moreEl.getBoundingClientRect().width) : 0;

    // 情况1：全部可见时不显示“更多”（加入 2px 容错，避免临界来回跳动）
    const tolerance = 2;
    const usedAll = widths.reduce((sum, w, i) => sum + w + (i > 0 ? gap : 0), 0);
    if (usedAll <= containerWidth - tolerance) {
      if (this.overflowKeys.length) {
        this.overflowKeys = [];
        this.ldesignOverflowChange.emit({ overflowCount: 0 });
      }
      return;
    }

    // 情况2：需要考虑预留“更多”所占的空间
    let used = 0;
    let count = 0; // 可见数量

    for (let i = 0; i < widths.length; i++) {
      const w = widths[i] || 0;
      const next = w + (count > 0 ? gap : 0);
      const reserveMore = (count > 0 ? gap : 0) + moreWidth; // "更多"出现在最后一个可见项之后
      if (used + next + reserveMore <= containerWidth - tolerance) {
        used += next;
        count++;
      } else {
        break;
      }
    }

    const overflow = keys.slice(count);
    // 仅在变化时更新，避免无意义的反复渲染引发抖动
    const changed = overflow.length !== this.overflowKeys.length || overflow.some((k, i) => k !== this.overflowKeys[i]);
    if (changed) {
      this.overflowKeys = overflow;
      this.ldesignOverflowChange.emit({ overflowCount: overflow.length });
    }
  }

  private registerTopItemRef = (key: string) => (el: HTMLElement | null) => {
    if (el) {
      this.topItemEls.set(key, el);
      this.elToKey.set(el, key);
      // 初始化缓存宽度
      const w = Math.ceil(el.getBoundingClientRect().width);
      if (w > 0) this.widthCache.set(key, w);
      // 监听尺寸变化，防止首次测量不准或后续图标加载导致宽度变化
      this.ensureItemObserver();
      this.observeIfNeeded(el);
      // 尽快重算一次
      requestAnimationFrame(() => this.computeOverflow());
    } else {
      // 元素卸载：不删除缓存（用于溢出时仍可计算），但清理映射
      const [target] = Array.from(this.elToKey.entries()).find(([, val]) => val === key) || [] as any;
      if (target) this.elToKey.delete(target);
      // 从 map 中去掉已卸载元素引用，避免测到 0 宽度
      for (const [k, v] of this.topItemEls.entries()) {
        if (k === key) { this.topItemEls.delete(k); break; }
      }
    }
  };

  private registerMoreRef = (el: HTMLElement | null) => { 
    if (el) {
      this.moreEl = el as HTMLElement;
      this.ensureItemObserver();
      this.observeIfNeeded(el as HTMLElement);
    }
  };

  private renderIcon(icon?: string) {
    if (!icon) return null;
    return <span class="ldesign-menu__icon"><ldesign-icon name={icon} size="small" /></span>;
  }

  private ensureItemObserver() {
    if (!this.itemRO) {
      this.itemRO = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const key = this.elToKey.get(el);
          if (key) {
            const w = Math.ceil(entry.contentRect.width);
            if (w > 0) this.widthCache.set(key, w);
          }
        }
        this.computeOverflow();
      });
    }
  }

  private observeIfNeeded(el: HTMLElement) {
    if (!this.itemRO || this.observed.has(el)) return;
    this.itemRO.observe(el);
    this.observed.add(el);
  }

  private renderArrow(direction: 'down' | 'right', open?: boolean) {
    return (
      <span class={{
        'ldesign-menu__arrow': true,
        'ldesign-menu__arrow--open': !!open,
      }} data-dir={direction}>
        <ldesign-icon name={direction === 'down' ? 'chevron-down' : 'chevron-right'} size="small" />
      </span>
    );
  }

  private renderPopupList(items: MenuItem[], level: number) {
    return (
      <ul class="ldesign-menu__popup-list" role="menu">
        {items.map(child => this.renderMenuNode(child, level + 1))}
      </ul>
    );
  }

  private setFlyoutOpen(key: string, open: boolean) {
    this.flyoutOpenMap = { ...this.flyoutOpenMap, [key]: open };
  }

  private renderFlyout(item: MenuItem, level: number, isTopLevel: boolean) {
    const placement = isTopLevel && this.mode === 'horizontal' ? 'bottom-start' : 'right-start';
    const trigger = this.submenuTrigger;

    const open = !!this.flyoutOpenMap[item.key];

    const setPopupRef = (el: HTMLElement | null) => { if (el) this.popupRefs.set(item.key, el); };
    const forceOpen = () => {
      const p = this.popupRefs.get(item.key) as any;
      if (p && !p.visible) p.visible = true;
    };

    // 横向模式：顶层使用 fixed（相对视口），二级及以上用 auto（由 popup 自动判断：嵌套时 absolute）
    const strategy = this.mode === 'horizontal' ? (isTopLevel ? 'fixed' : 'auto') : 'auto';

    return (
      <ldesign-popup
        ref={setPopupRef as any}
        placement={placement as any}
        trigger={trigger as any}
        strategy={strategy as any}
        interactive={true}
        arrow={false}
        onLdesignVisibleChange={(e: CustomEvent<boolean>) => this.setFlyoutOpen(item.key, e.detail)}
      >
        <div slot="trigger" class={{
            'ldesign-menu__item': true,
            'ldesign-menu__item--submenu': true,
            'ldesign-menu__item--disabled': !!item.disabled,
            'ldesign-menu__item--active': this.currentKey === item.key,
          }} ref={isTopLevel ? this.registerTopItemRef(item.key) : undefined}
          onMouseEnter={forceOpen}
          onPointerEnter={forceOpen}
        >
          {this.renderIcon(item.icon)}
          <span class="ldesign-menu__title">{item.label}</span>
          {this.renderArrow(isTopLevel && this.mode === 'horizontal' ? 'down' : 'right', open)}
        </div>
        {this.renderPopupList(item.children || [], level)}
      </ldesign-popup>
    );
  }

  private renderInline(item: MenuItem, level: number) {
    const open = this.internalOpenKeys.includes(item.key);
    const style = { paddingLeft: `${this.indent * (level - 1)}px` };

    return (
      <li class={{
        'ldesign-menu__node': true,
        'ldesign-menu__node--open': open,
      }} role="none">
        <div
          class={{
            'ldesign-menu__item': true,
            'ldesign-menu__item--submenu': true,
            'ldesign-menu__item--open': open,
            'ldesign-menu__item--disabled': !!item.disabled,
          }}
          style={style}
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : 'false'}
          onClick={(e) => this.handleItemClick(item, level, e)}
        >
          {this.renderIcon(item.icon)}
          <span class="ldesign-menu__title">{item.label}</span>
          {this.renderArrow('right')}
        </div>
        <ul class="ldesign-menu__inline-children" role="menu" style={{ display: open ? 'block' : 'none' }}>
          {(item.children || []).map(child => this.renderMenuNode(child, level + 1))}
        </ul>
      </li>
    );
  }

  private renderLeaf(item: MenuItem, level: number, isTopLevel: boolean) {
    const isActive = this.currentKey === item.key || this.getPathKeys(this.currentKey || '').includes(item.key);
    const classes = {
      'ldesign-menu__item': true,
      'ldesign-menu__item--leaf': true,
      'ldesign-menu__item--active': isActive,
      'ldesign-menu__item--disabled': !!item.disabled,
    };
    const style = this.mode === 'vertical' ? { paddingLeft: `${this.indent * (level - 1)}px` } : undefined;

    const content = (
      <div class={classes} style={style} role="menuitem" onClick={(e) => this.handleItemClick(item, level, e)} ref={isTopLevel ? this.registerTopItemRef(item.key) : undefined}>
        {this.renderIcon(item.icon)}
        <span class="ldesign-menu__title">{item.label}</span>
      </div>
    );

    if (this.mode === 'horizontal' && item.href) {
      return (
        <a class="ldesign-menu__link" href={item.href} target={item.target || '_self'} onClick={(e) => this.handleItemClick(item, level, e)} ref={isTopLevel ? this.registerTopItemRef(item.key) : undefined}>
          {this.renderIcon(item.icon)}
          <span class="ldesign-menu__title">{item.label}</span>
        </a>
      );
    }

    return content;
  }

  private renderMenuNode(item: MenuItem, level: number, isTopLevel: boolean = false) {
    if (item.divider) {
      return (
        <li class="ldesign-menu__divider" role="separator"></li>
      );
    }

    const hasChildren = !!item.children?.length;
    if (hasChildren) {
      if (this.useFlyout(level)) {
        return (
          <li class="ldesign-menu__node" role="none">
            {this.renderFlyout(item, level, isTopLevel)}
          </li>
        );
      }
      return this.renderInline(item, level);
    }

    // 叶子
    return (
      <li class="ldesign-menu__node" role="none">
        {this.renderLeaf(item, level, isTopLevel)}
      </li>
    );
  }

  private renderTopLevel(items: MenuItem[]) {
    if (this.mode === 'horizontal') {
      const visible = items.filter(i => !this.overflowKeys.includes(i.key));
      const overflow = items.filter(i => this.overflowKeys.includes(i.key));
      const nodes: any[] = [];
      nodes.push(...visible.map(it => this.renderMenuNode(it, 1, true)));

      // 始终渲染一个“更多”占位，用于准确测量宽度；当无溢出时保持隐藏但占位
      const hasOverflow = overflow.length > 0;
      const moreKey = '__more__';
      const moreOpen = !!this.flyoutOpenMap[moreKey];
      nodes.push(
        <li class="ldesign-menu__node ldesign-menu__node--more" role="none" ref={this.registerMoreRef}
            style={{ visibility: hasOverflow ? 'visible' : 'hidden', pointerEvents: hasOverflow ? 'auto' : 'none' }}
            aria-hidden={hasOverflow ? 'false' : 'true'}>
          <ldesign-popup 
            placement="bottom-end" 
            trigger={this.submenuTrigger as any} 
            strategy={'fixed' as any}
            interactive={true} 
            arrow={false}
            onLdesignVisibleChange={(e: CustomEvent<boolean>) => this.setFlyoutOpen(moreKey, e.detail)}
          >
            <div slot="trigger" class="ldesign-menu__item ldesign-menu__item--submenu">
              {this.renderIcon(this.moreIcon)}
              <span class="ldesign-menu__title">{this.moreLabel}</span>
              {this.renderArrow('down', hasOverflow ? moreOpen : false)}
            </div>
            {hasOverflow ? this.renderPopupList(overflow, 1) : null}
          </ldesign-popup>
        </li>
      );

      return nodes;
    }

    // 垂直模式
    return items.map(it => this.renderMenuNode(it, 1, true));
  }

  render() {
    const classes = {
      'ldesign-menu': true,
      'ldesign-menu--horizontal': this.mode === 'horizontal',
      'ldesign-menu--vertical': this.mode === 'vertical',
      'ldesign-menu--inline': this.mode === 'vertical' && (this.verticalExpand === 'inline' || this.verticalExpand === 'mixed'),
      'ldesign-menu--flyout': (this.mode === 'horizontal') || (this.mode === 'vertical' && this.verticalExpand !== 'inline'),
    };

    return (
      <Host class={classes}>
        <ul class="ldesign-menu__list" role="menubar">
          {this.renderTopLevel(this.parsedItems)}
        </ul>
      </Host>
    );
  }
}

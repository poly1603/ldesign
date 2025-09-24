import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';

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

  /** 当前选中项（受控） */
  @Prop({ mutable: true }) value?: string;
  /** 默认选中项（非受控） */
  @Prop() defaultValue?: string;

  /** 当前打开的子菜单 key 列表（受控） */
  @Prop({ mutable: true }) openKeys?: string[];
  /** 默认打开的子菜单 key 列表（非受控） */
  @Prop() defaultOpenKeys: string[] = [];

  /** 手风琴模式：同层级只允许展开一个 */
  @Prop() accordion: boolean = false;
  /** 子级缩进（px） */
  @Prop() indent: number = 16;
  /** 顶层（一级）是否强制显示图标占位（保证对齐）。若条目没有 icon，将渲染一个占位。 */
  @Prop() requireTopIcon: boolean = true;

  /** 选中事件 */
  @Event() ldesignSelect!: EventEmitter<{ key: string; item: MenuItem; pathKeys: string[] }>;
  /** 展开/收起事件 */
  @Event() ldesignOpenChange!: EventEmitter<{ key: string; open: boolean; openKeys: string[] }>;

  @State() parsedItems: MenuItem[] = [];
  @State() currentKey?: string;
  @State() internalOpenKeys: string[] = [];

  private submenuRefs: Map<string, HTMLUListElement> = new Map();
  private didInitHeights = false;

  // 解析 items
  @Watch('items')
  watchItems(val: string | MenuItem[]) {
    this.parsedItems = this.parseItems(val);
  }

  @Watch('openKeys')
  watchOpenKeys(newVal?: string[]) {
    if (Array.isArray(newVal)) {
      const next = [...newVal];
      this.runOpenCloseAnimations(this.internalOpenKeys, next);
      this.internalOpenKeys = next;
    }
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

  componentDidRender() {
    if (!this.didInitHeights) {
      // 初次渲染：让默认打开的子菜单直接处于展开高度
      this.internalOpenKeys.forEach(k => {
        const el = this.submenuRefs.get(k);
        if (el) {
          el.style.display = 'block';
          el.style.overflow = '';
          el.style.height = 'auto';
        }
      });
      this.didInitHeights = true;
    }
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

  private setSelectedKey(key: string) {
    const item = this.findItemByKey(key);
    const path = this.getPathKeys(key);
    if (this.value !== undefined) {
      // 受控：仅通知，外部应同步更新 value；内部也先行更新 currentKey 以获得即时视觉效果
      this.currentKey = key;
      this.ldesignSelect.emit({ key, item: item!, pathKeys: path });
    } else {
      // 非受控：仅更新内部状态（不要写入 value，避免后续点击变成受控导致不更新）
      this.currentKey = key;
      this.ldesignSelect.emit({ key, item: item!, pathKeys: path });
    }
  }

  private setOpenKeys(newKeys: string[], changedKey: string, open: boolean) {
    const prev = [...this.internalOpenKeys];
    this.runOpenCloseAnimations(prev, newKeys);
    this.internalOpenKeys = newKeys;
    this.openKeys = [...newKeys];
    this.ldesignOpenChange.emit({ key: changedKey, open, openKeys: [...newKeys] });
  }

  private getSiblingOpenKeys(targetKey: string): string[] {
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

  private handleItemClick = (item: MenuItem, _level: number, ev?: MouseEvent) => {
    if (item.disabled || item.divider) { ev?.preventDefault(); return; }

    const hasChildren = !!item.children?.length;
    if (hasChildren) {
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

    // 叶子节点
    this.setSelectedKey(item.key);
    if (item.href) {
      window.open(item.href, item.target || '_self');
    }
  };

  private registerSubmenuRef = (key: string) => (el: HTMLUListElement | null) => {
    if (el) this.submenuRefs.set(key, el);
    else this.submenuRefs.delete(key);
  };

  private runOpenCloseAnimations(prev: string[], next: string[]) {
    const toOpen = next.filter(k => !prev.includes(k));
    const toClose = prev.filter(k => !next.includes(k));
    toOpen.forEach(k => this.animateOpen(k));
    toClose.forEach(k => this.animateClose(k));
  }

  private animateOpen(key: string) {
    const el = this.submenuRefs.get(key);
    if (!el) return;
    el.style.display = 'block';
    el.style.overflow = 'hidden';
    el.style.height = '0px';
    requestAnimationFrame(() => {
      const sh = el.scrollHeight;
      el.style.height = `${sh}px`;
    });
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      el.style.height = 'auto';
      el.style.overflow = '';
    };
    el.addEventListener('transitionend', onEnd);
  }

  private animateClose(key: string) {
    const el = this.submenuRefs.get(key);
    if (!el) return;
    const current = el.scrollHeight;
    el.style.overflow = 'hidden';
    el.style.height = `${current}px`;
    requestAnimationFrame(() => {
      el.style.height = '0px';
    });
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      // 保持高度为 0，收起状态
    };
    el.addEventListener('transitionend', onEnd);
  }

  private renderArrow(open?: boolean) {
    return (
      <span class={{
        'ldesign-menu__arrow': true,
        'ldesign-menu__arrow--open': !!open,
      }}>
        <ldesign-icon name="chevron-right" size="small" />
      </span>
    );
  }

  private renderIcon(icon?: string, placeholder: boolean = false) {
    if (icon) {
      return <span class="ldesign-menu__icon"><ldesign-icon name={icon} size="small" /></span>;
    }
    return placeholder ? <span class="ldesign-menu__icon ldesign-menu__icon--placeholder"></span> : null;
  }

  private renderInline(item: MenuItem, level: number) {
    const open = this.internalOpenKeys.includes(item.key);
    const style = { paddingLeft: `${this.indent * (level - 1)}px` };

    return (
      <li class={{ 'ldesign-menu__node': true, 'ldesign-menu__node--open': open }} role="none">
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
          {this.renderIcon(item.icon, this.requireTopIcon && level === 1 && !item.icon)}
          <span class="ldesign-menu__title">{item.label}</span>
          {this.renderArrow(open)}
        </div>
        <ul class="ldesign-menu__inline-children" role="menu" ref={this.registerSubmenuRef(item.key)}>
          {(item.children || []).map(child => this.renderMenuNode(child, level + 1))}
        </ul>
      </li>
    );
  }

  private renderLeaf(item: MenuItem, level: number) {
    const isActive = this.currentKey === item.key || this.getPathKeys(this.currentKey || '').includes(item.key);
    const classes = {
      'ldesign-menu__item': true,
      'ldesign-menu__item--leaf': true,
      'ldesign-menu__item--active': isActive,
      'ldesign-menu__item--disabled': !!item.disabled,
    };
    const style = { paddingLeft: `${this.indent * (level - 1)}px` };

    return (
      <li class="ldesign-menu__node" role="none">
        <div class={classes} style={style} role="menuitem" onClick={(e) => this.handleItemClick(item, level, e)}>
          {this.renderIcon(item.icon, this.requireTopIcon && level === 1 && !item.icon)}
          <span class="ldesign-menu__title">{item.label}</span>
        </div>
      </li>
    );
  }

  private renderMenuNode(item: MenuItem, level: number): any {
    if (item.divider) {
      return <li class="ldesign-menu__divider" role="separator"></li>;
    }

    const hasChildren = !!item.children?.length;
    if (hasChildren) return this.renderInline(item, level);
    return this.renderLeaf(item, level);
  }

  render() {
    const classes = {
      'ldesign-menu': true,
      'ldesign-menu--vertical': true,
      'ldesign-menu--inline': true,
    };

    return (
      <Host class={classes}>
        <ul class="ldesign-menu__list" role="menu">
          {this.parsedItems.map(it => this.renderMenuNode(it, 1))}
        </ul>
      </Host>
    );
  }
}

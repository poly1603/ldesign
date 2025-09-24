import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';

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

  /** 展示模式：vertical（纵向）| horizontal（横向） */
  @Prop() mode: 'vertical' | 'horizontal' = 'vertical';

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

  /** 垂直模式展开方式：inline（内嵌）、flyout（右侧弹出）、mixed（一级内嵌，其余弹出） */
  @Prop() verticalExpand: VerticalExpand = 'inline';
  /** 弹出子菜单的触发方式（仅在 flyout/mixed 生效；横向模式同样适用） */
  @Prop() submenuTrigger: SubmenuTrigger = 'hover';

  /** 折叠模式：仅显示一级图标，悬停右侧弹出；无子级时显示 tooltip（仅纵向） */
  @Prop() collapse: boolean = false;

  @State() parsedItems: MenuItem[] = [];
  @State() currentKey?: string;
  @State() internalOpenKeys: string[] = [];

  private submenuRefs: Map<string, HTMLUListElement> = new Map();
  private didInitHeights = false;
  @State() flyoutOpenMap: { [key: string]: boolean } = {};
  private flyoutTimers: Map<string, number> = new Map();
  private flyChildrenRefs: Map<string, HTMLUListElement> = new Map();
  private downChildrenRefs: Map<string, HTMLUListElement> = new Map();

  // 解析 items
  @Watch('items')
  watchItems(val: string | MenuItem[]) {
    this.parsedItems = this.parseItems(val);
    // 数据变化后，依据当前选中项恢复展开路径
    if (this.currentKey) this.ensureOpenForKey(this.currentKey);
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
    if (newVal) this.ensureOpenForKey(newVal);
  }

  componentWillLoad() {
    this.parsedItems = this.parseItems(this.items);
    this.currentKey = this.value ?? this.defaultValue;
    this.internalOpenKeys = this.openKeys ? [...this.openKeys] : [...(this.defaultOpenKeys || [])];
    if (this.currentKey) this.ensureOpenForKey(this.currentKey);
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

  componentDidLoad() {
    // 在 click 触发模式下，支持点击空白处或按 ESC 关闭所有面板
    document.addEventListener('click', this.onDocumentClick, true);
    document.addEventListener('keydown', this.onKeydown, true);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick, true);
    document.removeEventListener('keydown', this.onKeydown, true);
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
    // 自动展开父级（inline/mixed 下会生效）
    this.ensureOpenForKey(key);
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
      // 在 flyout/mixed 场景，父级不进行内嵌展开，交由弹层控制
      if (this.useFlyout(_level)) {
        return;
      }
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

    // 在 click 触发模式下，选中后关闭所有下拉/弹出面板（含横向与纵向 flyout）
    if (this.submenuTrigger === 'click') {
      if (this.mode === 'horizontal' || this.useFlyout(_level)) {
        this.closeAllPanels();
      }
    }

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

  // 根据选中项，计算并展开其所有祖先（仅对 inline/mixed 的内嵌容器产生视觉效果）
  private ensureOpenForKey(key?: string) {
    if (!key) return;
    const path = this.getPathKeys(key);
    if (path.length <= 1) {
      // 顶级或未找到
      // 若是 accordion，关闭其它
      if (this.accordion && this.internalOpenKeys.length) {
        this.runOpenCloseAnimations(this.internalOpenKeys, []);
        this.internalOpenKeys = [];
        this.openKeys = [];
      }
      return;
    }
    const parents = path.slice(0, -1);
    // 直接替换为父级路径，保证手风琴语义和一致性
    const prev = this.internalOpenKeys;
    const next = parents;
    this.runOpenCloseAnimations(prev, next);
    this.internalOpenKeys = next;
    this.openKeys = [...next];
  }

  private renderArrow(open?: boolean, direction: 'right' | 'down' = 'right') {
    const icon = direction === 'down' ? 'chevron-down' : 'chevron-right';
    return (
      <span class={{
        'ldesign-menu__arrow': true,
        'ldesign-menu__arrow--open': !!open,
      }}>
        <ldesign-icon name={icon} size="small" />
      </span>
    );
  }

  private renderIcon(icon?: string, placeholder: boolean = false) {
    if (icon) {
      return <span class="ldesign-menu__icon"><ldesign-icon name={icon} size="small" /></span>;
    }
    return placeholder ? <span class="ldesign-menu__icon ldesign-menu__icon--placeholder"></span> : null;
  }

  private useFlyout(level: number): boolean {
    if (this.collapse) return true; // 折叠模式下统一使用 flyout 弹出
    if (this.verticalExpand === 'flyout') return true;
    if (this.verticalExpand === 'inline') return false;
    return level >= 2; // mixed
  }

  private setFlyoutOpen = (key: string, open: boolean) => {
    this.flyoutOpenMap = { ...this.flyoutOpenMap, [key]: open };
  };

  private openFly(key: string) {
    clearTimeout(this.flyoutTimers.get(key));
    this.setFlyoutOpen(key, true);
    // 下一帧调整位置，确保元素已渲染
    requestAnimationFrame(() => this.adjustFlyPosition(key));
  }
  private scheduleCloseFly(key: string) {
    clearTimeout(this.flyoutTimers.get(key));
    const t = window.setTimeout(() => this.setFlyoutOpen(key, false), 150);
    this.flyoutTimers.set(key, t);
  }

  private openDown(key: string) {
    clearTimeout(this.flyoutTimers.get(key));
    this.setFlyoutOpen(key, true);
    requestAnimationFrame(() => this.adjustDownPosition(key));
  }
  private scheduleCloseDown(key: string) {
    clearTimeout(this.flyoutTimers.get(key));
    const t = window.setTimeout(() => this.setFlyoutOpen(key, false), 150);
    this.flyoutTimers.set(key, t);
  }

  // 关闭所有下拉/弹出子菜单（用于 click 触发选中后统一收起，带 CSS 过渡动画）
  private closeAllPanels() {
    // 取消所有延时关闭，避免竞争
    this.flyoutTimers.forEach((t) => clearTimeout(t));
    this.flyoutTimers.clear();
    // 将所有打开项标记为关闭，过渡动画由 CSS 控制
    const next: { [key: string]: boolean } = {};
    // 保留已有 key，显式设置为 false 以确保状态切换触发动画
    Object.keys(this.flyoutOpenMap || {}).forEach(k => { next[k] = false; });
    this.flyoutOpenMap = next;
  }

  private hasAnyPanelOpen(): boolean {
    return Object.values(this.flyoutOpenMap || {}).some(Boolean);
  }

  private onDocumentClick = (e: MouseEvent) => {
    if (this.submenuTrigger !== 'click') return;
    if (!this.hasAnyPanelOpen()) return;
    const target = e.target as Node | null;
    if (target && this.el.contains(target)) return; // 点击在组件内部不处理
    this.closeAllPanels();
  };

  private onKeydown = (e: KeyboardEvent) => {
    if (this.submenuTrigger !== 'click') return;
    if (e.key === 'Escape' && this.hasAnyPanelOpen()) {
      this.closeAllPanels();
    }
  };

  private registerFlyChildrenRef = (key: string) => (el: HTMLUListElement | null) => {
    if (el) this.flyChildrenRefs.set(key, el); else this.flyChildrenRefs.delete(key);
  };

  private registerDownChildrenRef = (key: string) => (el: HTMLUListElement | null) => {
    if (el) this.downChildrenRefs.set(key, el); else this.downChildrenRefs.delete(key);
  };

  private adjustFlyPosition(key: string) {
    const menuEl = this.flyChildrenRefs.get(key);
    if (!menuEl) return;
    const li = menuEl.parentElement as HTMLElement | null;
    if (!li) return;

    // 元素保持常驻（通过透明度+位移控制显隐），无需切换 display 即可测量
    const prevDisplay = menuEl.style.display;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const gap = 4;
    const liRect = li.getBoundingClientRect();
    const rect = menuEl.getBoundingClientRect();

    // 垂直：尽量与父项顶对齐，不足则向上“shift”，也避免跑到顶部之上
    const maxTop = vh - rect.height - 8; // 8px 安全边距
    let targetTopViewport = Math.min(Math.max(0, liRect.top), Math.max(0, maxTop));
    const deltaTop = Math.round(targetTopViewport - liRect.top);
    menuEl.style.top = `${deltaTop}px`;

    // 水平：若右侧不够，改为从左侧弹出
    const preferRightX = liRect.right + gap + rect.width;
    if (preferRightX > vw) {
      menuEl.style.left = 'auto';
      (menuEl.style as any).right = `calc(100% + ${gap}px)`;
    } else {
      (menuEl.style as any).right = '';
      menuEl.style.left = `calc(100% + ${gap}px)`;
    }

    // 复原 display（一般为空字符串，此处保持兼容）
    menuEl.style.display = prevDisplay;
  }

  private adjustDownPosition(key: string) {
    const menuEl = this.downChildrenRefs.get(key);
    if (!menuEl) return;
    const li = menuEl.parentElement as HTMLElement | null;
    if (!li) return;

    const prevDisplay = menuEl.style.display;

    const vw = window.innerWidth;
    const gap = 4;
    const liRect = li.getBoundingClientRect();
    const rect = menuEl.getBoundingClientRect();

    // 默认从左侧对齐
    menuEl.style.left = '0px';
    (menuEl.style as any).right = '';
    menuEl.style.top = `calc(100% + ${gap}px)`;

    // 若右侧溢出，则改为右对齐
    const preferRight = liRect.left + rect.width;
    if (preferRight > vw - 8) {
      menuEl.style.left = 'auto';
      (menuEl.style as any).right = '0px';
    }

    menuEl.style.display = prevDisplay;
  }

  // 顺着 keys 链路逐层展开，并在每一帧进行定位，确保上一级已完成布局后再定位下一级
  private openAlongPath(keys: string[], startLevel: number) {
    if (!keys || keys.length === 0) return;
    const nextMap = { ...this.flyoutOpenMap } as { [k: string]: boolean };
    keys.forEach(k => { nextMap[k] = true; });
    this.flyoutOpenMap = nextMap;

    const step = (i: number) => {
      if (i >= keys.length) return;
      requestAnimationFrame(() => {
        const k = keys[i];
        if (this.mode === 'horizontal' && startLevel === 1 && i === 0) {
          this.adjustDownPosition(k);
        } else {
          this.adjustFlyPosition(k);
        }
        step(i + 1);
      });
    };

    step(0);
  }

  /**
   * 预览选中路径：当光标或点击进入某个“祖先”菜单项时，若当前存在选中项且该祖先位于选中路径上，
   * 自动沿选中路径展开到其父级为止。
   * - 纵向 flyout/mixed：右侧级联展开
   * - 横向：一级为下拉（向下），二级及以后为右侧级联
   */
  private previewSelectedFromAncestor(startKey: string, level: number) {
    if (!this.currentKey) return;

    const path = this.getPathKeys(this.currentKey);
    const idx = path.indexOf(startKey);
    if (idx < 0 || idx >= path.length - 1) return; // 不在路径上或本身就是叶子

    const toOpen = path.slice(idx, -1);

    // 顺序逐帧展开并定位，保证更深层级也能正确打开
    this.openAlongPath(toOpen, level);
  }

  private renderFlyout(item: MenuItem, level: number) {
    const open = !!this.flyoutOpenMap[item.key];
    const trigger = this.submenuTrigger;
    const isActive = this.getPathKeys(this.currentKey || '').includes(item.key);

    const onEnter = () => {
      if (trigger === 'hover') {
        this.openFly(item.key);
        // 若当前存在选中项，且该条目位于选中路径上，则自动展开其后续祖先链路
        this.previewSelectedFromAncestor(item.key, level);
      }
    };
    const onLeave = () => { if (trigger === 'hover') this.scheduleCloseFly(item.key); };
    const onClick = (e: MouseEvent) => {
      if (trigger === 'click') {
        e.preventDefault();
        this.setFlyoutOpen(item.key, !open);
        // 点击展开时同样尝试联动展开后续祖先链路（更贴合“显示当前选中路径”的预期）
        if (!open) this.previewSelectedFromAncestor(item.key, level);
      }
    };

    return (
      <li class={{ 'ldesign-menu__node': true, 'ldesign-menu__node--fly': true, 'ldesign-menu__node--fly-open': open }} role="none" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div class={{
            'ldesign-menu__item': true,
            'ldesign-menu__item--submenu': true,
            'ldesign-menu__item--disabled': !!item.disabled,
            'ldesign-menu__item--active': isActive,
          }} role="menuitem" onClick={onClick}>
          {this.renderIcon(item.icon, this.requireTopIcon && level === 1 && !item.icon)}
          <span class="ldesign-menu__title">{item.label}</span>
          {this.renderArrow(open)}
        </div>
        <ul class="ldesign-menu__fly-children" role="menu" ref={this.registerFlyChildrenRef(item.key)}>
          {(item.children || []).map(child => this.renderMenuNode(child, level + 1))}
        </ul>
      </li>
    );
  }

  private renderDropdown(item: MenuItem, level: number) {
    const open = !!this.flyoutOpenMap[item.key];
    const trigger = this.submenuTrigger;
    const isActive = this.getPathKeys(this.currentKey || '').includes(item.key);

    const onEnter = () => {
      if (trigger === 'hover') {
        this.openDown(item.key);
        // 若当前存在选中项，沿选中路径展开其后续祖先链路（右侧级联）
        this.previewSelectedFromAncestor(item.key, level);
      }
    };
    const onLeave = () => { if (trigger === 'hover') this.scheduleCloseDown(item.key); };
    const onClick = (e: MouseEvent) => {
      if (trigger === 'click') {
        e.preventDefault();
        this.setFlyoutOpen(item.key, !open);
        if (!open) {
          requestAnimationFrame(() => this.adjustDownPosition(item.key));
          // 点击展开时，同步沿路径展开后续级联
          this.previewSelectedFromAncestor(item.key, level);
        }
      }
    };

    return (
      <li class={{ 'ldesign-menu__node': true, 'ldesign-menu__node--dropdown': true, 'ldesign-menu__node--dropdown-open': open }} role="none" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div class={{
            'ldesign-menu__item': true,
            'ldesign-menu__item--submenu': true,
            'ldesign-menu__item--disabled': !!item.disabled,
            'ldesign-menu__item--active': isActive,
          }} role="menuitem" onClick={onClick}>
          {this.renderIcon(item.icon, this.requireTopIcon && level === 1 && !item.icon)}
          <span class="ldesign-menu__title">{item.label}</span>
          {this.renderArrow(open, 'down')}
        </div>
        <ul class="ldesign-menu__down-children" role="menu" ref={this.registerDownChildrenRef(item.key)}>
          {(item.children || []).map(child => this.renderMenuNode(child, level + 1))}
        </ul>
      </li>
    );
  }

  private renderInline(item: MenuItem, level: number) {
    const open = this.internalOpenKeys.includes(item.key);
    const indentPx = this.indent * (level - 1);
    const style: any = { ['--level-indent' as any]: `${indentPx}px` };
    if (indentPx > 0) style.paddingLeft = `${indentPx}px`;

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
    // 横向模式或 flyout 模式：叶子项不需要层级缩进；否则会导致弹出子菜单内部左侧间距过大
    const style = (this.mode === 'horizontal' || this.useFlyout(level))
      ? ({} as any)
      : (() => {
          const indentPx = this.indent * (level - 1);
          const s: any = { ['--level-indent' as any]: `${indentPx}px` };
          if (indentPx > 0) s.paddingLeft = `${indentPx}px`;
          return s;
        })();

    const inner = (
      <div class={classes} style={style as any} role="menuitem" onClick={(e) => this.handleItemClick(item, level, e)}>
        {this.renderIcon(item.icon, this.requireTopIcon && level === 1 && !item.icon)}
        {!(this.collapse && level === 1) && <span class="ldesign-menu__title">{item.label}</span>}
      </div>
    );

    // 折叠模式下：一级叶子显示 tooltip（右侧）
    const content = this.collapse && level === 1
      ? (<ldesign-tooltip content={item.label} placement="right">{inner}</ldesign-tooltip>)
      : inner;

    return (
      <li class="ldesign-menu__node" role="none">
        {content}
      </li>
    );
  }

  private renderMenuNode(item: MenuItem, level: number): any {
    if (item.divider) {
      return <li class="ldesign-menu__divider" role="separator"></li>;
    }

    const hasChildren = !!item.children?.length;

    if (this.mode === 'horizontal') {
      if (hasChildren) {
        // 横向：一级下拉，其余级联右侧弹出
        return level === 1 ? this.renderDropdown(item, level) : this.renderFlyout(item, level);
      }
      return this.renderLeaf(item, level);
    }

    // 纵向：根据设置选择内嵌或右侧弹出
    if (hasChildren) {
      return this.useFlyout(level) ? this.renderFlyout(item, level) : this.renderInline(item, level);
    }
    return this.renderLeaf(item, level);
  }

  render() {
    const classes = {
      'ldesign-menu': true,
      'ldesign-menu--vertical': this.mode === 'vertical',
      'ldesign-menu--horizontal': this.mode === 'horizontal',
      'ldesign-menu--inline': this.mode === 'vertical' && this.verticalExpand !== 'flyout',
      'ldesign-menu--flyout': this.mode === 'vertical' && (this.verticalExpand !== 'inline' || this.collapse),
      'ldesign-menu--collapsed': this.mode === 'vertical' && this.collapse,
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

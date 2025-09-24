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
  /** 横向模式下 “更多” 文案 */
  @Prop() moreLabel: string = '更多';

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
  /** 横向溢出变化事件 */
  @Event() ldesignOverflowChange!: EventEmitter<{ overflowCount: number }>;

  /** 垂直模式展开方式：inline（内嵌）、flyout（右侧弹出）、mixed（一级内嵌，其余弹出） */
  @Prop() verticalExpand: VerticalExpand = 'inline';
  /** 弹出子菜单的触发方式（仅在 flyout/mixed 生效；横向模式同样适用） */
  @Prop() submenuTrigger: SubmenuTrigger = 'hover';

  /** 折叠模式：仅显示一级图标，悬停右侧弹出；无子级时显示 tooltip（仅纵向） */
  @Prop() collapse: boolean = false;
  /** 纵向模式：顶层互斥展开（无论 inline 或 flyout），默认开启 */
  @Prop() topLevelExclusive: boolean = true;

  @State() parsedItems: MenuItem[] = [];
  @State() currentKey?: string;
  @State() internalOpenKeys: string[] = [];

  // 横向溢出
  @State() overflowKeys: string[] = [];
  private listRef?: HTMLUListElement;
  private topItemRefs: Map<string, HTMLLIElement> = new Map();
  private moreMeasureRef?: HTMLLIElement; // 用于测量“更多”宽度
  private moreRenderRef?: HTMLLIElement; // 实际渲染的“更多”节点（可选）
  private measureListRef?: HTMLUListElement; // 隐藏测量层的列表，用于基于 Flex 的边界测量
  private resizeObserver?: ResizeObserver;
  private lastOverflowCount: number = 0;

  private submenuRefs: Map<string, HTMLUListElement> = new Map();
  private didInitHeights = false;
  @State() flyoutOpenMap: { [key: string]: boolean } = {};
  private flyoutTimers: Map<string, number> = new Map();
  private flyChildrenRefs: Map<string, HTMLUListElement> = new Map();
  private downChildrenRefs: Map<string, HTMLUListElement> = new Map();

  // 测量用：为所有顶层项渲染隐藏的克隆，避免“被收纳导致无法测量宽度”的问题
  private measureItemRefs: Map<string, HTMLLIElement> = new Map();
  private registerMeasureTopRef = (key: string) => (el: HTMLLIElement | null) => {
    if (el) this.measureItemRefs.set(key, el); else this.measureItemRefs.delete(key);
  };

  // 解析 items
  @Watch('items')
  watchItems(val: string | MenuItem[]) {
    this.parsedItems = this.parseItems(val);
    // 数据变化后，依据当前选中项恢复展开路径
    if (this.currentKey) this.ensureOpenForKey(this.currentKey);
    // 重新计算横向溢出
    this.scheduleCalcOverflow();
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

    // 监听尺寸变化以进行横向溢出计算
    this.resizeObserver = new ResizeObserver(() => this.scheduleCalcOverflow());
    if (this.el) this.resizeObserver.observe(this.el);
    window.addEventListener('resize', this.handleWindowResize, { passive: true });

    // 初次渲染后计算一次
    this.scheduleCalcOverflow();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick, true);
    document.removeEventListener('keydown', this.onKeydown, true);
    window.removeEventListener('resize', this.handleWindowResize as any);
    if (this.resizeObserver) {
      try { this.resizeObserver.disconnect(); } catch {}
      this.resizeObserver = undefined;
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
        const shouldAccordion = this.accordion || (this.mode === 'vertical' && _level === 1 && this.topLevelExclusive);
        if (shouldAccordion) {
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

  // 顶层专用：若没有提供图标，则显示一个中性“默认图标”（不是透明占位），满足“所有一级都有图标”的视觉要求
  private renderTopIcon(icon?: string) {
    if (icon) return <span class="ldesign-menu__icon"><ldesign-icon name={icon} size="small" /></span>;
    return <span class="ldesign-menu__icon ldesign-menu__icon--default" aria-hidden="true"></span>;
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

  // 仅保留某个顶层面板处于展开状态（互斥）。顶层包括：一级菜单与“更多”
  private openTopExclusive(key: string) {
    const next: { [k: string]: boolean } = {};
    next[key] = true;
    this.flyoutOpenMap = next;
  }

  private handleWindowResize = () => {
    this.scheduleCalcOverflow();
  };

  private registerListRef = (el: HTMLUListElement | null) => {
    this.listRef = el || undefined;
  };
  private registerTopRef = (key: string) => (el: HTMLLIElement | null) => {
    if (el) this.topItemRefs.set(key, el); else this.topItemRefs.delete(key);
  };
  private registerMoreMeasureRef = (el: HTMLLIElement | null) => {
    this.moreMeasureRef = el || undefined;
  };
  private registerMeasureListRef = (el: HTMLUListElement | null) => {
    this.measureListRef = el || undefined;
  };
  private registerMoreRenderRef = (el: HTMLLIElement | null) => {
    this.moreRenderRef = el || undefined;
  };

  private scheduleCalcOverflow() {
    if (this.mode !== 'horizontal') return;
    requestAnimationFrame(() => this.calcOverflow());
  }

  // 计算顶层节点的内容宽度（优先测量内部 .ldesign-menu__item，避免 li 的布局影响）
  private getTopNodeWidth(key: string): number {
    const li = this.measureItemRefs.get(key) || this.topItemRefs.get(key);
    if (!li) return 0;
    const inner = li.querySelector('.ldesign-menu__item') as HTMLElement | null;
    const target = inner || (li as any as HTMLElement);
    const rect = target.getBoundingClientRect();
    const w = rect?.width || target.offsetWidth || 0;
    return w;
  }

  private getMoreWidth(): number {
    // 优先读取内部 .ldesign-menu__item 的内容宽度，避免 li（有时为 block 或带 auto margin）影响测量
    const measureFrom = (li: HTMLLIElement | undefined) => {
      if (!li) return 0;
      const inner = li.querySelector('.ldesign-menu__item') as HTMLElement | null;
      const node = inner || (li as any as HTMLElement);
      const rect = node.getBoundingClientRect();
      const w = rect?.width || node.offsetWidth || 0;
      return w;
    };

    const liveW = measureFrom(this.moreRenderRef!);
    if (liveW > 0) return liveW;

    // 回退到隐藏测量节点
    const w = measureFrom(this.moreMeasureRef!);
    return w > 0 ? w : 72;
  }


  private calcOverflow() {
    // 标记：读一次测量层引用，避免构建时 noUnusedLocals 对私有字段的告警
    void this.measureListRef;
    if (this.mode !== 'horizontal') {
      if (this.overflowKeys.length) this.overflowKeys = [];
      return;
    }
    const list = this.listRef;
    if (!list) return;

    // 容器宽度（几何宽度），更稳定
    const rect = list.getBoundingClientRect();
    const containerW = rect?.width || list.clientWidth || (this.el as HTMLElement).clientWidth;
    if (containerW <= 0) return;

    // 顶层 key + 各自的内容宽度（来源：测量层 .ldesign-menu__item）
    const keys = (this.parsedItems || []).map(it => it.key);
    if (!keys.length) { this.overflowKeys = []; return; }

    const widths: number[] = keys.map(k => this.getTopNodeWidth(k));
    if (widths.some(w => w <= 0)) { requestAnimationFrame(() => this.calcOverflow()); return; }

    const style = getComputedStyle(list);
    const gapStr = (style as any).gap || (style as any).columnGap || (style as any).rowGap || '0';
    const gap = parseFloat(String(gapStr)) || 0;

    const prefix: number[] = new Array(widths.length + 1).fill(0);
    for (let i = 0; i < widths.length; i++) prefix[i + 1] = prefix[i] + widths[i];
    const sumW = (n: number) => prefix[n];

    const moreW = this.getMoreWidth();
    const N = widths.length;

    // fits(n): 可见前 n 项（含它们之间 gap）+ 右侧“更多”（若需要）是否能放下
    const fits = (n: number) => {
      const visible = sumW(n) + (n > 0 ? (n - 1) * gap : 0);
      const needMore = n < N;
      const total = visible + (needMore ? ((n > 0 ? gap : 0) + moreW) : 0);
      return total <= containerW + 0.5; // 容差 0.5px，避免亚像素误差
    };

    // 二分最大 n
    let lo = 0, hi = N;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi + 1) / 2);
      if (fits(mid)) lo = mid; else hi = mid - 1;
    }
    const best = lo;

    const nextOverflow = keys.slice(best);
    if (this.overflowKeys.join(',') !== nextOverflow.join(',')) {
      this.overflowKeys = nextOverflow;
      const cnt = nextOverflow.length;
      if (cnt !== this.lastOverflowCount) {
        this.lastOverflowCount = cnt;
        this.ldesignOverflowChange.emit({ overflowCount: cnt });
      }
      if (cnt > 0) requestAnimationFrame(() => this.calcOverflow());
    }
  }

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

  // 当“更多”打开时，若当前选中项属于溢出顶层，则沿其路径展开（从顶层开始，位于 level=2）
  private previewFromMore() {
    if (!this.currentKey) return;
    const path = this.getPathKeys(this.currentKey);
    if (path.length < 2) return; // 顶级叶子无需展开
    const root = path[0];
    if (!this.overflowKeys.includes(root)) return; // 当前顶层未被收纳到更多
    this.openAlongPath(path.slice(0, -1), 2);
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

    const isVerticalTop = this.mode === 'vertical' && level === 1 && this.topLevelExclusive;

    const onEnter = () => {
      if (trigger === 'hover') {
        if (isVerticalTop) this.openTopExclusive(item.key);
        this.openFly(item.key);
        // 若当前存在选中项，且该条目位于选中路径上，则自动展开其后续祖先链路
        this.previewSelectedFromAncestor(item.key, level);
      }
    };
    const onLeave = () => { if (trigger === 'hover') this.scheduleCloseFly(item.key); };
    const onClick = (e: MouseEvent) => {
      if (trigger === 'click') {
        e.preventDefault();
        if (isVerticalTop) {
          if (!open) {
            this.openTopExclusive(item.key);
            this.openFly(item.key);
            this.previewSelectedFromAncestor(item.key, level);
          } else {
            this.closeAllPanels();
          }
          return;
        }
        this.setFlyoutOpen(item.key, !open);
        // 点击展开时同样尝试联动展开后续祖先链路（更贴合“显示当前选中路径”的预期）
        if (!open) this.previewSelectedFromAncestor(item.key, level);
      }
    };

    return (
      <li class={{ 'ldesign-menu__node': true, 'ldesign-menu__node--fly': true, 'ldesign-menu__node--fly-open': open }} role="none" data-key={item.key} ref={level === 1 ? this.registerTopRef(item.key) : (undefined as any)} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div class={{
            'ldesign-menu__item': true,
            'ldesign-menu__item--submenu': true,
            'ldesign-menu__item--disabled': !!item.disabled,
            'ldesign-menu__item--active': isActive,
          }} role="menuitem" onClick={onClick}>
          {level === 1 ? this.renderTopIcon(item.icon) : this.renderIcon(item.icon)}
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
        // 顶层互斥：仅展开当前顶层
        this.openTopExclusive(item.key);
        this.openDown(item.key);
        // 若当前存在选中项，沿选中路径展开其后续祖先链路（右侧级联）
        this.previewSelectedFromAncestor(item.key, level);
      }
    };
    const onLeave = () => { if (trigger === 'hover') this.scheduleCloseDown(item.key); };
    const onClick = (e: MouseEvent) => {
      if (trigger === 'click') {
        e.preventDefault();
        if (!open) {
          // 打开：先互斥，再展开
          this.openTopExclusive(item.key);
          this.openDown(item.key);
          // 点击展开时，同步沿路径展开后续级联
          this.previewSelectedFromAncestor(item.key, level);
        } else {
          // 关闭：统一关闭所有面板
          this.closeAllPanels();
        }
      }
    };

    return (
      <li class={{ 'ldesign-menu__node': true, 'ldesign-menu__node--dropdown': true, 'ldesign-menu__node--dropdown-open': open }} role="none" data-key={item.key} ref={level === 1 ? this.registerTopRef(item.key) : (undefined as any)} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div class={{
            'ldesign-menu__item': true,
            'ldesign-menu__item--submenu': true,
            'ldesign-menu__item--disabled': !!item.disabled,
            'ldesign-menu__item--active': isActive,
          }} role="menuitem" onClick={onClick}>
          {level === 1 ? this.renderTopIcon(item.icon) : this.renderIcon(item.icon)}
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
      <li class={{ 'ldesign-menu__node': true, 'ldesign-menu__node--open': open }} role="none" data-key={item.key} ref={level === 1 ? this.registerTopRef(item.key) : (undefined as any)}>
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
        {level === 1 ? this.renderTopIcon(item.icon) : this.renderIcon(item.icon)}
        {!(this.collapse && level === 1) && <span class="ldesign-menu__title">{item.label}</span>}
      </div>
    );

    // 折叠模式下：一级叶子显示 tooltip（右侧）
    const content = this.collapse && level === 1
      ? (<ldesign-tooltip content={item.label} placement="right">{inner}</ldesign-tooltip>)
      : inner;

    return (
      <li class="ldesign-menu__node" role="none" data-key={item.key} ref={level === 1 ? this.registerTopRef(item.key) : (undefined as any)}>
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
        <ul class="ldesign-menu__list" role="menu" ref={this.registerListRef}>
          {this.mode === 'horizontal'
            ? (() => {
                const overflow = new Set(this.overflowKeys || []);
                const visible = (this.parsedItems || []).filter(it => !overflow.has(it.key));
                const hidden = (this.parsedItems || []).filter(it => overflow.has(it.key));
                return [
                  ...visible.map(it => this.renderMenuNode(it, 1)),
                  hidden.length > 0 && (() => {
                    const path = this.getPathKeys(this.currentKey || '');
                    const inMoreBySelection = path.length > 0 && this.overflowKeys.includes(path[0]);
                    const isOpen = !!this.flyoutOpenMap['__more__'];
                    const isMoreActive = inMoreBySelection || (this.submenuTrigger === 'click' && isOpen);
                    return (
                      <li class={{ 'ldesign-menu__node': true, 'ldesign-menu__node--more': true, 'ldesign-menu__node--dropdown': true, 'ldesign-menu__node--dropdown-open': isOpen }} role="none" ref={this.registerMoreRenderRef}
                          onMouseEnter={() => { if (this.submenuTrigger === 'hover') { this.openTopExclusive('__more__'); this.openDown('__more__'); this.previewFromMore(); } }}
                          onMouseLeave={() => { if (this.submenuTrigger === 'hover') this.scheduleCloseDown('__more__'); }}>
                        <div class={{ 'ldesign-menu__item': true, 'ldesign-menu__item--submenu': true, 'ldesign-menu__item--active': isMoreActive }} role="menuitem"
                          onClick={(e: MouseEvent) => {
                            if (this.submenuTrigger === 'click') {
                              e.preventDefault();
                              const open = !!this.flyoutOpenMap['__more__'];
                              if (!open) {
                                this.openTopExclusive('__more__');
                                this.openDown('__more__');
                                // 点击展开时，同步沿当前选中路径展开“更多”中的顶层链路
                                this.previewFromMore();
                              } else {
                                this.closeAllPanels();
                              }
                            }
                          }}>
                          <span class="ldesign-menu__icon ldesign-menu__icon--default" aria-hidden="true"></span>
                          <span class="ldesign-menu__title">{this.moreLabel}</span>
                          {this.renderArrow(!!this.flyoutOpenMap['__more__'], 'down')}
                        </div>
                        <ul class="ldesign-menu__down-children" role="menu" ref={this.registerDownChildrenRef('__more__')}>
                          {hidden.map(it => this.renderMenuNode(it, 2))}
                        </ul>
                      </li>
                    );
                  })()
                ];
              })()
            : this.parsedItems.map(it => this.renderMenuNode(it, 1))}
        </ul>
        {/* 隐藏测量层：渲染所有顶层条目的克隆，用于稳定测量宽度 */}
        {this.mode === 'horizontal' && (
          <ul class="ldesign-menu__list ldesign-menu__measure" ref={this.registerMeasureListRef} style={{ position: 'absolute', left: '-99999px', top: '-99999px', visibility: 'hidden', padding: '0', margin: '0' }}>
            {(this.parsedItems || []).map(it => (
              <li class="ldesign-menu__node" role="none" ref={this.registerMeasureTopRef(it.key)}>
                <div class={{ 'ldesign-menu__item': true, 'ldesign-menu__item--submenu': !!it.children?.length }}>
                  {this.renderTopIcon(it.icon)}
                  <span class="ldesign-menu__title">{it.label}</span>
                  {!!it.children?.length && this.renderArrow(false, 'down')}
                </div>
              </li>
            ))}
            {/* 测量“更多” */}
            <li class="ldesign-menu__node" role="none" ref={this.registerMoreMeasureRef}>
              <div class={{ 'ldesign-menu__item': true, 'ldesign-menu__item--submenu': true }}>
                <span class="ldesign-menu__icon ldesign-menu__icon--default" aria-hidden="true"></span>
                <span class="ldesign-menu__title">{this.moreLabel}</span>
                {this.renderArrow(false, 'down')}
              </div>
            </li>
          </ul>
        )}
      </Host>
    );
  }
}

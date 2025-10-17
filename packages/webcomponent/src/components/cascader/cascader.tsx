import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import type { Placement } from '@floating-ui/dom';

export interface CascaderOption {
  value: string;
  label: string;
  disabled?: boolean;
  isLeaf?: boolean;
  children?: CascaderOption[];
}

export type CascaderTrigger = 'click' | 'manual';
export type CascaderOverlay = 'auto' | 'popup' | 'drawer';
export type Breakpoints = { xs: number; sm: number; md: number; lg: number };

/**
 * ldesign-cascader
 * - PC: 多层级 popup (每层独立弹出)
 * - Mobile: drawer (auto by viewport width; can be forced by overlay prop)
 */
@Component({ tag: 'ldesign-cascader', styleUrl: 'cascader.less', shadow: false })
export class LdesignCascader {
  @Element() el!: HTMLElement;

  // data
  @Prop() options: string | CascaderOption[] = [];
  @Prop({ mutable: true }) value?: string[]; // path values
  @Prop() defaultValue?: string[];

  // ui
  @Prop() placeholder: string = '请选择';
  @Prop() disabled: boolean = false;
  @Prop() clearable: boolean = false;
  @Prop() separator: string = ' / ';

  // behavior
  /** 点击非叶子是否直接触发变更（默认仅叶子触发） */
  @Prop() changeOnSelect: boolean = false;
  /** 选择后是否自动关闭（手动触发模式除外） */
  @Prop() closeOnSelect: boolean = true;

  // overlay
  @Prop() trigger: CascaderTrigger = 'click';
  @Prop() placement: Placement = 'bottom-start' as Placement;
  @Prop({ mutable: true }) visible: boolean = false; // only for trigger=manual
  @Prop() overlay: CascaderOverlay = 'auto';
  @Prop() breakpoints?: Breakpoints;
  @Prop() drawerPlacement: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
  @Prop() drawerSize?: number | string;
  @Prop() drawerTitle?: string = '请选择';
  /** 列表最大高度（列会滚动） */
  @Prop() listMaxHeight: number = 280;
  /** 面板宽度（popup 模式下可用） */
  @Prop() panelWidth?: number | string;

  // events
  @Event() ldesignChange!: EventEmitter<{ value: string[] | undefined; options: CascaderOption[] }>; 
  @Event() ldesignVisibleChange!: EventEmitter<boolean>;

  // state
  @State() parsed: CascaderOption[] = [];
  @State() activePath: string[] = []; // 当前面板内的选中链
  @State() drawerVisible: boolean = false; // overlay for drawer when trigger!=='manual'
  @State() hoveredPath: string[] = []; // hover 状态下展开的路径
  
  private hoverTimer: any = null; // hover 延迟计时器
  private leaveTimer: any = null; // 离开延迟计时器

  /* ---------------- lifecycle ---------------- */
  @Watch('options') watchOptions(v: string | CascaderOption[]) {
    this.parsed = this.parseOptions(v);
  }
  @Watch('value') watchValue(v?: string[]) {
    this.activePath = this.normalizeArray(v ?? this.defaultValue);
  }

  componentWillLoad() {
    this.parsed = this.parseOptions(this.options);
    const init = this.value !== undefined ? this.value : this.defaultValue;
    this.activePath = this.normalizeArray(init);
  }

  /* ---------------- utils ---------------- */
  private parseOptions(val: string | CascaderOption[]): CascaderOption[] {
    if (typeof val === 'string') { try { const arr = JSON.parse(val); return Array.isArray(arr) ? arr : []; } catch { return []; } }
    return Array.isArray(val) ? val : [];
  }
  private normalizeArray(val?: string[] | string): string[] {
    if (val == null) return [];
    if (Array.isArray(val)) return val;
    try { const arr = JSON.parse(String(val)); return Array.isArray(arr) ? arr : []; } catch { return []; }
  }

  private getBreakpoints(): Breakpoints { return this.breakpoints || { xs: 480, sm: 768, md: 1024, lg: 1280 }; }
  private computeOverlayKind(): 'popup' | 'drawer' {
    if (this.overlay === 'popup') return 'popup';
    if (this.overlay === 'drawer') return 'drawer';
    const w = window.innerWidth || document.documentElement.clientWidth || 1024;
    const md = this.getBreakpoints().md || 1024;
    return w >= md ? 'popup' : 'drawer';
  }

  private isLeaf(opt?: CascaderOption | null): boolean { return !!opt && (!!opt.isLeaf || !Array.isArray(opt.children) || opt.children.length === 0); }

  private getChildrenAt(level: number, path: string[], root: CascaderOption[]): CascaderOption[] {
    if (level === 0) return root || [];
    let cursor: CascaderOption[] | undefined = root;
    for (let i = 0; i < level; i++) {
      const val = path[i];
      if (!cursor) return [];
      const hit = cursor.find(n => n.value === val);
      cursor = hit?.children;
    }
    return cursor || [];
  }

  private getOptionByPath(path: string[]): CascaderOption[] {
    const res: CascaderOption[] = [];
    let cursor: CascaderOption[] | undefined = this.parsed;
    for (const v of path) {
      const hit = (cursor || []).find(n => n.value === v);
      if (!hit) break;
      res.push(hit);
      cursor = hit.children;
    }
    return res;
  }

  private getColumns(): CascaderOption[][] {
    const cols: CascaderOption[][] = [];
    const levels = Math.max(1, this.activePath.length + 1); // 至少 1 列；若已选到第 n 级，还会展示第 n+1 级
    for (let i = 0; i < levels; i++) {
      cols.push(this.getChildrenAt(i, this.activePath, this.parsed));
    }
    return cols;
  }

  private commit(path: string[]) {
    const opts = this.getOptionByPath(path);
    if (this.value !== undefined) {
      this.ldesignChange.emit({ value: path.length ? path.slice() : undefined, options: opts });
    } else {
      this.activePath = path.slice();
      this.value = path.length ? path.slice() as any : undefined as any;
      this.ldesignChange.emit({ value: this.value, options: opts });
    }
  }

  /* ---------------- overlay control ---------------- */
  private getOverlayVisible(): boolean { return this.trigger === 'manual' ? this.visible : this.drawerVisible; }
  private openOverlay() {
    if (this.computeOverlayKind() === 'popup') { const p = this.el?.querySelector('ldesign-popup') as any; if (p) p.visible = true; return; }
    if (this.trigger === 'manual') this.visible = true; else this.drawerVisible = true;
    this.ldesignVisibleChange.emit(true);
  }
  private hideOverlay() {
    if (this.computeOverlayKind() === 'popup') { const p = this.el?.querySelector('ldesign-popup') as any; if (p) p.visible = false; return; }
    if (this.trigger === 'manual') this.visible = false; else this.drawerVisible = false;
    this.ldesignVisibleChange.emit(false);
  }

  private handlePopupVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) {
      // 打开时用当前值对齐活动链
      this.activePath = this.normalizeArray(this.value ?? this.defaultValue);
      // 清空 hover 状态
      this.hoveredPath = [];
    } else {
      // 关闭时清空 hover 状态和计时器
      this.hoveredPath = [];
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
      }
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = null;
      }
    }
  };
  private handleDrawerVisibleChange = (e: CustomEvent<boolean>) => {
    this.ldesignVisibleChange.emit(e.detail);
    if (this.trigger === 'manual') this.visible = e.detail;
    if (e.detail) {
      this.activePath = this.normalizeArray(this.value ?? this.defaultValue);
    }
  };

  /* ---------------- interactions ---------------- */
  private onDropdownEnter = () => {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
  };

  private onDropdownLeave = () => {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    // 鼠标离开整个下拉区域后，延迟收起所有子菜单，避免轻微抖动
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
    this.leaveTimer = setTimeout(() => {
      this.hoveredPath = [];
    }, 200);
  };

  private getDropdownInlineStyle(): any {
    // 固定下拉容器高度，避免不同列高度导致的整体高度抖动
    const h = this.listMaxHeight;
    return { height: `${h}px` };
  }

  /* ---------------- interactions ---------------- */
  private onItemClick(level: number, item: CascaderOption, ev?: MouseEvent) {
    if (item.disabled) { ev?.preventDefault(); return; }
    const next = this.activePath.slice(0, level); // 保留之前的层级
    next[level] = item.value;
    
    // 如果点击的是已选中项且有子级，只展开下一级不提交
    const alreadySelected = this.activePath[level] === item.value;
    if (alreadySelected && !this.isLeaf(item)) {
      // 保持选中状态，不触发变更
      return;
    }
    
    this.activePath = next;
    const isLeaf = this.isLeaf(item);
    const shouldCommit = isLeaf || this.changeOnSelect;
    if (shouldCommit) {
      this.commit(next);
      if (this.closeOnSelect && this.trigger !== 'manual') this.hideOverlay();
    }
  }

  private onItemHover(level: number, item: CascaderOption) {
    if (item.disabled) return;
    
    // 清除离开计时器，防止菜单被关闭
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    
    // 如果没有子级，不需要处理
    if (!item.children || item.children.length === 0) {
      // 但是需要清除更深层级的展开
      if (this.hoveredPath.length > level) {
        this.hoveredPath = this.hoveredPath.slice(0, level);
      }
      return;
    }
    
    // 如果已经是当前 hover 的项，不需要重复设置
    if (this.hoveredPath[level] === item.value) {
      return;
    }
    
    // 清除之前的 hover 计时器
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }
    
    // 延迟展开，避免过于频繁的切换
    this.hoverTimer = setTimeout(() => {
      // 构建 hover 路径
      const next = this.hoveredPath.slice(0, level);
      next[level] = item.value;
      this.hoveredPath = next;
    }, 100); // 减少延迟到 100ms
  }

  private onItemLeave(level: number, item: CascaderOption) {
    // 清除 hover 计时器
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    
    // 不立即清除，给一些时间让鼠标移动到子菜单
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
    }
    
    this.leaveTimer = setTimeout(() => {
      // 检查当前 hover 路径是否还是这个项
      if (this.hoveredPath[level] === item.value) {
        // 清除这个层级及之后的所有 hover 状态
        this.hoveredPath = this.hoveredPath.slice(0, level);
      }
    }, 300); // 给更多时间让鼠标移动到子菜单
  }

  private clearAll = (e: MouseEvent) => { e.stopPropagation(); if (this.disabled) return; this.commit([]); };

  /* ---------------- rendering ---------------- */
  private renderTrigger() {
    const has = (this.value && this.value.length) ? true : false;
    const labels = this.getOptionByPath(this.value || []).map(o => o.label).join(this.separator);
    const text = has ? labels : this.placeholder;
    const classes = {
      'ldesign-cascader__trigger': true,
      'ldesign-cascader__trigger--placeholder': !has,
      'ldesign-cascader__trigger--disabled': this.disabled,
    } as any;
    const clearBtn = this.clearable && has && !this.disabled ? (
      <span class="ldesign-cascader__clear" onClick={this.clearAll} title="清空"><ldesign-icon name="x" size="small" /></span>
    ) : null;
    return (
      <div class={classes} tabindex={this.disabled ? -1 : 0} onKeyDown={(e: any) => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); this.openOverlay(); } }}>
        <span class="ldesign-cascader__text">{text}</span>
        {clearBtn}
        <span class="ldesign-cascader__arrow"><ldesign-icon name="chevron-down" size="small" /></span>
      </div>
    );
  }

  // PC 模式: 渲染列表和子菜单
  private renderPopupList(items: CascaderOption[], level: number = 0): any {
    const style: any = { maxHeight: `${this.listMaxHeight}px`, minWidth: '160px' };
    
    return (
      <ul class="ldesign-cascader__list" role="menu" style={style}>
        {items.map((item) => {
          const selected = this.activePath[level] === item.value;
          const disabled = !!item.disabled;
          const hasChildren = !!(item.children && item.children.length);
          // hover 时展开子菜单
          const isHovered = this.hoveredPath[level] === item.value;
          
          const classes = {
            'ldesign-cascader__item': true,
            'ldesign-cascader__item--selected': selected,
            'ldesign-cascader__item--disabled': disabled,
            'ldesign-cascader__item--has-children': hasChildren,
            'ldesign-cascader__item--hovered': isHovered,
          } as any;
          
          return (
            <li 
              key={item.value}
              class={classes} 
              onClick={(e) => this.onItemClick(level, item, e)}
              onMouseEnter={() => this.onItemHover(level, item)}
            >
              <span class="ldesign-cascader__label">{item.label}</span>
              {hasChildren && <span class="ldesign-cascader__suffix"><ldesign-icon name="chevron-right" size="small" /></span>}
              {!hasChildren && selected && <span class="ldesign-cascader__check"><ldesign-icon name="check" size="small" /></span>}
            </li>
          );
        })}
      </ul>
    );
  }
  
  // 渲染所有层级的菜单（平铺方式）
  private renderAllMenus(): any[] {
    const menus: any[] = [];
    let currentItems = this.parsed;
    
    // 渲染第一层
    menus.push(
      <div 
        class="ldesign-cascader__menu-container" 
        key="menu-0"
      >
        {this.renderPopupList(currentItems, 0)}
      </div>
    );
    
    // 根据 hoveredPath 渲染后续层级
    for (let i = 0; i < this.hoveredPath.length; i++) {
      const parentValue = this.hoveredPath[i];
      const parent = currentItems.find(item => item.value === parentValue);
      
      if (parent && parent.children && parent.children.length > 0) {
        currentItems = parent.children;
        const level = i + 1;
        menus.push(
          <div 
            class="ldesign-cascader__menu-container" 
            key={`menu-${level}`}
          >
            {this.renderPopupList(currentItems, level)}
          </div>
        );
      } else {
        break;
      }
    }
    
    return menus;
  }
  
  // 移动端模式: 多列平铺
  private renderColumns() {
    const cols = this.getColumns();
    const style: any = { maxHeight: `${this.listMaxHeight}px` };
    const contentStyle: any = {};
    if (this.panelWidth) contentStyle.width = typeof this.panelWidth === 'number' ? `${this.panelWidth}px` : this.panelWidth;
    return (
      <div class="ldesign-cascader__panel" style={contentStyle}>
        <div class="ldesign-cascader__columns">
          {cols.map((items, level) => (
            <ul class="ldesign-cascader__column" role="menu" style={style}>
              {items.map((it) => {
                const selected = this.activePath[level] === it.value;
                const disabled = !!it.disabled;
                const hasChildren = !!(it.children && it.children.length);
                const classes = {
                  'ldesign-cascader__item': true,
                  'ldesign-cascader__item--selected': selected,
                  'ldesign-cascader__item--disabled': disabled,
                } as any;
                return (
                  <li class={classes} onClick={(e) => this.onItemClick(level, it, e)}>
                    <span class="ldesign-cascader__label">{it.label}</span>
                    {hasChildren && <span class="ldesign-cascader__suffix"><ldesign-icon name="chevron-right" size="small" /></span>}
                    {!hasChildren && selected && <span class="ldesign-cascader__check"><ldesign-icon name="check" size="small" /></span>}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const visibleProp = this.trigger === 'manual' ? { visible: this.visible } : {};
    const overlayKind = this.computeOverlayKind();

    if (overlayKind === 'popup') {
      // PC 模式: 使用嵌套 Popup
      return (
        <Host class={{ 'ldesign-cascader': true, 'ldesign-cascader--disabled': this.disabled }}>
          <ldesign-popup
            placement={this.placement}
            trigger={this.trigger as any}
            interactive={true}
            arrow={false}
            theme={'light' as any}
            closeOnOutside={true}
            onLdesignVisibleChange={this.handlePopupVisibleChange}
            {...visibleProp}
          >
            <span slot="trigger">
              <slot name="trigger">{this.renderTrigger()}</slot>
            </span>
            <div 
              class="ldesign-cascader__dropdown"
              onMouseEnter={this.onDropdownEnter}
              onMouseLeave={this.onDropdownLeave}
              style={this.getDropdownInlineStyle()}
            >
              {this.renderAllMenus()}
            </div>
          </ldesign-popup>
        </Host>
      );
    }

    // drawer 模式: 移动端使用多列平铺
    const drawerVisible = this.trigger === 'manual' ? this.visible : this.drawerVisible;
    return (
      <Host class={{ 'ldesign-cascader': true, 'ldesign-cascader--disabled': this.disabled }}>
        <div class="ldesign-cascader__trigger-wrapper" onClick={() => { if (!this.disabled && this.trigger !== 'manual') this.openOverlay(); }}>
          <slot name="trigger">{this.renderTrigger()}</slot>
        </div>
        <ldesign-drawer
          placement={this.drawerPlacement}
          size={this.drawerSize as any}
          drawerTitle={this.drawerTitle}
          visible={drawerVisible}
          onDrawerClose={() => this.hideOverlay()}
        >
          <div class="ldesign-cascader__mobile">
            {this.renderColumns()}
          </div>
        </ldesign-drawer>
      </Host>
    );
  }
}
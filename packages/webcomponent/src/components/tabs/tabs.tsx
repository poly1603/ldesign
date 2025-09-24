import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Size } from '../../types';

export type TabsPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TabsType = 'line' | 'card';

interface TabMeta {
  name: string;
  label: string;
  disabled: boolean;
  closable: boolean;
  panel: HTMLElement & { name?: string; label?: string; disabled?: boolean; active?: boolean; closable?: boolean };
  tabId: string; // id for the tab button
  panelId: string; // id for the tab panel
}

let tabsIdSeed = 0;

/**
 * Tabs 选项卡组件
 * - 通过水平或垂直的标签页切换展示内容
 */
@Component({
  tag: 'ldesign-tabs',
  styleUrl: 'tabs.less',
  shadow: false,
})
export class LdesignTabs {
  @Element() el!: HTMLElement;

  /** 当前激活的标签（受控） */
  @Prop({ mutable: true }) value?: string;

  /** 默认激活的标签（非受控） */
  @Prop() defaultValue?: string;

  /** 尺寸 */
  @Prop() size: Size = 'medium';

  /** 选项卡外观类型 */
  @Prop() type: TabsType = 'line';

  /** 选项卡位置 */
  @Prop() placement: TabsPlacement = 'top';

  /** 是否显示新增按钮 */
  @Prop() addable: boolean = false;

  /** 切换事件（返回激活的 name） */
  @Event() ldesignChange!: EventEmitter<string>;
  /** 点击新增按钮 */
  @Event() ldesignAdd!: EventEmitter<void>;
  /** 点击关闭某个面板 */
  @Event() ldesignRemove!: EventEmitter<{ name: string }>; 

  @State() currentName?: string;
  @State() items: TabMeta[] = [];
  @State() inkStyle: { [k: string]: string } = {};
  @State() canScrollPrev: boolean = false;
  @State() canScrollNext: boolean = false;

  private uid = `ld-tabs-${++tabsIdSeed}`;
  private slotEl?: HTMLSlotElement;
  private mutationObserver?: MutationObserver;
  private resizeObserver?: ResizeObserver;

  @Watch('value')
  watchValue(newVal?: string) {
    // 受控：同步内部 currentName 并刷新激活态
    if (newVal !== undefined) {
      this.currentName = newVal;
      this.updateActivePanels();
    }
  }

  componentWillLoad() {
    const initial = this.value !== undefined ? this.value : this.defaultValue;
    this.currentName = initial;
    this.collectPanels();
    // 如果未设置默认值，使用第一个可用面板
    if (!this.currentName && this.items.length) {
      const firstEnabled = this.items.find(it => !it.disabled);
      this.currentName = firstEnabled?.name ?? this.items[0].name;
    }
  }

  componentDidLoad() {
    // 监听插槽变化，动态收集
    this.slotEl = this.el.querySelector('slot') as HTMLSlotElement | undefined;
    this.slotEl?.addEventListener('slotchange', this.onSlotChange);

    // 监听 DOM 变化（添加/删除面板）
    this.mutationObserver = new MutationObserver(() => this.collectPanels());
    this.mutationObserver.observe(this.el, { childList: true, subtree: true, attributes: true, attributeFilter: ['label', 'name', 'disabled', 'closable'] });

    // 监听尺寸变化，更新墨水条
    try {
      const RO = (window as any).ResizeObserver;
      if (RO) {
        this.resizeObserver = new RO(() => this.updateInkBar());
        const nav = this.el.querySelector('.ldesign-tabs__nav') as HTMLElement | null;
        if (this.resizeObserver && nav) this.resizeObserver.observe(nav);
      }
      window.addEventListener('resize', this.updateInkBar as any);
    } catch {}

    // 初次刷新激活态
    this.updateActivePanels();

    // 绑定滚动
    const nav = this.getNavScrollEl();
    nav?.addEventListener('scroll', this.onNavScroll, { passive: true } as any);
    // 初次更新滚动按钮
    this.updateScrollButtons();
  }

  disconnectedCallback() {
    this.slotEl?.removeEventListener('slotchange', this.onSlotChange);
    this.mutationObserver?.disconnect();
    try {
      this.resizeObserver?.disconnect();
      const nav = this.getNavScrollEl();
      nav?.removeEventListener('scroll', this.onNavScroll as any);
      window.removeEventListener('resize', this.updateInkBar as any);
    } catch {}
  }

  private onSlotChange = () => {
    this.collectPanels();
  };

private getPanels(): (HTMLElement & { name?: string; label?: string; disabled?: boolean; active?: boolean })[] {
    const nodes = Array.from(this.el.querySelectorAll('ldesign-tab-panel')) as HTMLLdesignTabPanelElement[];
    return nodes;
  }

  private ensureIdFor(panel: HTMLElement & { name?: string; label?: string; disabled?: boolean; active?: boolean; closable?: boolean }): TabMeta {
    let name = panel.name || '';
    let label = panel.label || '';
    const disabled = !!panel.disabled;
    const closable = !!panel.closable;

    // 自动补齐 name
    if (!name) {
      // 基于顺序生成 name
      const index = this.items.length;
      name = `panel-${index}`;
      panel.name = name;
    }
    // 自动补齐 label
    if (!label) {
      label = name;
      panel.label = label;
    }

    // 构造 id
    const panelId = panel.id && panel.id.trim().length ? panel.id : `${this.uid}-panel-${name}`;
    if (!panel.id) panel.id = panelId;
    const tabId = `${this.uid}-tab-${name}`;

    return { name, label, disabled, closable, panel, tabId, panelId };
  }

  private collectPanels() {
    const panels = this.getPanels();
    const metas = panels.map(p => this.ensureIdFor(p));
    this.items = metas;
    // 刷新激活态
    this.updateActivePanels();
  }

  private getEnabledIndices(): number[] {
    return this.items.map((x, i) => ({ x, i })).filter(y => !y.x.disabled).map(y => y.i);
  }

  private focusTabByIndex(index: number) {
    const tabs = Array.from(this.el.querySelectorAll('.ldesign-tabs__tab')) as HTMLElement[];
    tabs[index]?.focus();
  }

  private moveActive(delta: number) {
    const enabled = this.getEnabledIndices();
    if (!enabled.length) return;
    const curIdx = this.items.findIndex(it => it.name === this.currentName);
    const pos = Math.max(0, enabled.indexOf(curIdx));
    const nextPos = (pos + delta + enabled.length) % enabled.length;
    const nextIndex = enabled[nextPos];
    const next = this.items[nextIndex];
    if (!next) return;
    this.setActive(next.name, true);
    this.focusTabByIndex(nextIndex);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const horizontal = this.placement === 'top' || this.placement === 'bottom';
    if (horizontal) {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.moveActive(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.moveActive(-1); }
    } else {
      if (e.key === 'ArrowDown') { e.preventDefault(); this.moveActive(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.moveActive(-1); }
    }
    if (e.key === 'Home') { e.preventDefault(); const enabled = this.getEnabledIndices(); if (enabled.length) this.setActive(this.items[enabled[0]].name, true); }
    if (e.key === 'End') { e.preventDefault(); const enabled = this.getEnabledIndices(); if (enabled.length) this.setActive(this.items[enabled[enabled.length - 1]].name, true); }
  };

  private setActive(name: string, fromKeyboardOrNav = false) {
    if (!name) return;
    if (this.value !== undefined) {
      // 受控：更新内部 currentName 以获得即时视觉效果，但不写入 value；发事件
      this.currentName = name;
      this.updateActivePanels();
      this.ldesignChange.emit(name);
    } else {
      // 非受控：同步对外 value 与内部 currentName
      this.currentName = name;
      this.value = name;
      this.updateActivePanels();
      this.ldesignChange.emit(name);
    }

    // 如果来自导航交互，将焦点移至对应的 tabpanel 以符合无障碍建议
    if (fromKeyboardOrNav) {
      const meta = this.items.find(it => it.name === name);
      if (meta) {
        const panelEl = document.getElementById(meta.panelId) as HTMLElement | null;
        // 仅当 panel 可见时再聚焦，避免滚动抖动
        setTimeout(() => panelEl?.focus?.(), 0);
      }
    }
  }

  private updateActivePanels() {
    const name = this.currentName;
    this.items.forEach(it => {
      try {
        (it.panel as any).active = it.name === name;
        // 同步 ARIA 属性
        it.panel.setAttribute('aria-labelledby', it.tabId);
        if (it.name === name) {
          it.panel.removeAttribute('aria-hidden');
        } else {
          it.panel.setAttribute('aria-hidden', 'true');
        }
      } catch {}
    });
    this.updateInkBar();
  }

  private onTabClick = (item: TabMeta, e: MouseEvent) => {
    e.preventDefault();
    if (item.disabled) return;
    this.setActive(item.name, true);
  };

  private onCloseClick = (item: TabMeta, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (item.disabled) return;

    // 非受控：若关闭的是当前激活项，先选择相邻可用项
    if (this.value === undefined && this.currentName === item.name) {
      const enabled = this.getEnabledIndices();
      const closedIndex = this.items.findIndex(it => it.name === item.name);
      const enabledIndex = enabled.indexOf(closedIndex);
      // 选择右侧一个，否则左侧一个
      let fallbackIndex = -1;
      if (enabledIndex >= 0) {
        const right = enabled[enabledIndex + 1];
        const left = enabled[enabledIndex - 1];
        fallbackIndex = right ?? left ?? -1;
      } else {
        // 如果当前项不在 enabled（理论上不会发生），尽量选择第一个
        fallbackIndex = enabled[0] ?? -1;
      }
      if (fallbackIndex >= 0 && this.items[fallbackIndex]) {
        this.setActive(this.items[fallbackIndex].name, true);
      }
    }

    this.ldesignRemove.emit({ name: item.name });
  };

  private onAddClick = (e: MouseEvent) => {
    e.preventDefault();
    this.ldesignAdd.emit();
  };

  private getTablistOrientation(): 'horizontal' | 'vertical' {
    return this.placement === 'left' || this.placement === 'right' ? 'vertical' : 'horizontal';
  }

  private getNavScrollEl(): HTMLElement | null {
    return this.el.querySelector('.ldesign-tabs__nav-scroll') as HTMLElement | null;
  }

  private updateInkBar() {
    try {
      const nav = this.getNavScrollEl();
      const activeBtn = this.el.querySelector('.ldesign-tabs__tab.ldesign-tabs__tab--active') as HTMLElement | null;
      if (!nav || !activeBtn) { this.inkStyle = {}; return; }
      const navRect = nav.getBoundingClientRect();
      const tabRect = activeBtn.getBoundingClientRect();
      const horizontal = this.getTablistOrientation() === 'horizontal';
      if (horizontal) {
        const width = tabRect.width;
        const x = tabRect.left - navRect.left + nav.scrollLeft;
        this.inkStyle = { width: `${width}px`, transform: `translateX(${Math.max(0, x - nav.scrollLeft)}px)` };
      } else {
        const height = tabRect.height;
        const y = tabRect.top - navRect.top + nav.scrollTop;
        this.inkStyle = { height: `${height}px`, transform: `translateY(${Math.max(0, y - nav.scrollTop)}px)` };
      }
    } catch {
      this.inkStyle = {};
    }
  }

  private updateScrollButtons() {
    const nav = this.getNavScrollEl();
    if (!nav) { this.canScrollPrev = false; this.canScrollNext = false; return; }
    const horizontal = this.getTablistOrientation() === 'horizontal';
    if (horizontal) {
      const canPrev = nav.scrollLeft > 0;
      const canNext = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1;
      this.canScrollPrev = canPrev;
      this.canScrollNext = canNext;
    } else {
      const canPrev = nav.scrollTop > 0;
      const canNext = nav.scrollTop + nav.clientHeight < nav.scrollHeight - 1;
      this.canScrollPrev = canPrev;
      this.canScrollNext = canNext;
    }
  }

  private onNavScroll = () => {
    this.updateScrollButtons();
    this.updateInkBar();
  };

  private scrollBy(delta: number) {
    const nav = this.getNavScrollEl();
    if (!nav) return;
    const horizontal = this.getTablistOrientation() === 'horizontal';
    if (horizontal) {
      nav.scrollTo({ left: nav.scrollLeft + delta, behavior: 'smooth' });
    } else {
      nav.scrollTo({ top: nav.scrollTop + delta, behavior: 'smooth' });
    }
  }

  private onScrollPrev = (e: MouseEvent) => {
    e.preventDefault();
    const nav = this.getNavScrollEl();
    if (!nav) return;
    const step = (this.getTablistOrientation() === 'horizontal' ? nav.clientWidth : nav.clientHeight) * 0.6;
    this.scrollBy(-step);
  };

  private onScrollNext = (e: MouseEvent) => {
    e.preventDefault();
    const nav = this.getNavScrollEl();
    if (!nav) return;
    const step = (this.getTablistOrientation() === 'horizontal' ? nav.clientWidth : nav.clientHeight) * 0.6;
    this.scrollBy(step);
  };

  render() {
    const cls = {
      'ldesign-tabs': true,
      [`ldesign-tabs--${this.type}`]: true,
      [`ldesign-tabs--${this.size}`]: true,
      [`ldesign-tabs--${this.placement}`]: true,
    };

    return (
      <Host class={cls}>
        {/* Nav */}
        <div
          class="ldesign-tabs__nav"
          role="tablist"
          aria-orientation={this.getTablistOrientation()}
          onKeyDown={this.onKeyDown}
        >
          {(this.canScrollPrev || this.canScrollNext) && (
            <button
              class="ldesign-tabs__scroll ldesign-tabs__scroll--prev"
              onClick={this.onScrollPrev}
              aria-label={this.getTablistOrientation() === 'horizontal' ? '向左滚动' : '向上滚动'}
              disabled={!this.canScrollPrev}
              type="button"
            >{this.getTablistOrientation() === 'horizontal' ? '‹' : '˄'}</button>
          )}

          <div class="ldesign-tabs__nav-scroll">
            {this.items.map((it) => {
              const selected = it.name === this.currentName;
              return (
                <button
                  key={it.name}
                  id={it.tabId}
                  class={{
                    'ldesign-tabs__tab': true,
                    'ldesign-tabs__tab--active': selected,
                    'ldesign-tabs__tab--disabled': it.disabled,
                  }}
                  role="tab"
                  aria-selected={selected ? 'true' : 'false'}
                  aria-controls={it.panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={(e) => this.onTabClick(it, e)}
                  type="button"
                >
                  <span class="ldesign-tabs__tab-text">{it.label}</span>
                  {it.closable && (
                    <button
                      class="ldesign-tabs__close"
                      aria-label={`关闭 ${it.label}`}
                      onClick={(e) => this.onCloseClick(it, e)}
                      type="button"
                      tabindex={-1}
                    >
                      ×
                    </button>
                  )}
                </button>
              );
            })}
            <div class="ldesign-tabs__ink" style={this.inkStyle} aria-hidden="true"></div>
          </div>

          {this.addable && (
            <button class="ldesign-tabs__add" aria-label="新增标签" onClick={this.onAddClick} type="button">+</button>
          )}

          {(this.canScrollPrev || this.canScrollNext) && (
            <button
              class="ldesign-tabs__scroll ldesign-tabs__scroll--next"
              onClick={this.onScrollNext}
              aria-label={this.getTablistOrientation() === 'horizontal' ? '向右滚动' : '向下滚动'}
              disabled={!this.canScrollNext}
              type="button"
            >{this.getTablistOrientation() === 'horizontal' ? '›' : '˅'}</button>
          )}
        </div>

        {/* Content */}
        <div class="ldesign-tabs__content">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
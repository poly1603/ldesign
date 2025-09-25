import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch, Listen } from '@stencil/core';

/**
 * Collapse 折叠面板
 * - 支持受控/非受控、手风琴模式、动画、禁用
 */
@Component({
  tag: 'ldesign-collapse',
  styleUrl: 'collapse.less',
  shadow: false,
})
export class LdesignCollapse {
  @Element() el!: HTMLElement;

  /** 展开的面板标识列表（受控） */
  @Prop({ mutable: true }) value?: string[];
  /** 默认展开的面板标识列表（非受控） */
  @Prop() defaultValue: string[] = [];
  /** 手风琴模式：同层级仅允许展开一个 */
  @Prop() accordion: boolean = false;
  /** 展开图标位置 */
  @Prop() expandIconPlacement: 'left' | 'right' = 'left';
  /** 边框样式 */
  @Prop() bordered: boolean = true;
  /** 幽灵（无背景，仅分隔线） */
  @Prop() ghost: boolean = false;
  /** 整体禁用（子面板不可交互） */
  @Prop() disabled: boolean = false;

  /** 展开项变化 */
  @Event() ldesignChange!: EventEmitter<string[]>;
  /** 单项切换事件 */
  @Event() ldesignToggle!: EventEmitter<{ name: string; open: boolean; openKeys: string[] }>;

  @State() openKeysInternal: string[] = [];

  @Watch('value')
  watchValue(newVal?: string[]) {
    if (Array.isArray(newVal)) {
      this.openKeysInternal = [...newVal];
      this.syncPanelsActive();
    }
  }

  componentWillLoad() {
    const initial = Array.isArray(this.value) ? this.value : this.defaultValue;
    this.openKeysInternal = [...(initial || [])];
  }

  componentDidLoad() {
    // 首次同步
    this.syncPanelsActive();
    // 监听插槽变化，动态收集
    const slot = this.el.querySelector('slot') as HTMLSlotElement | null;
    slot?.addEventListener('slotchange', this.syncPanelsActive as any);
  }

  disconnectedCallback() {
    const slot = this.el.querySelector('slot') as HTMLSlotElement | null;
    slot?.removeEventListener('slotchange', this.syncPanelsActive as any);
  }

  private getPanels(): (HTMLElement & { name?: string; active?: boolean; disabled?: boolean; expandIconPlacement?: 'left' | 'right' })[] {
    const nodes = Array.from(this.el.querySelectorAll('ldesign-collapse-panel')) as any[];
    // 自动补齐 name
    nodes.forEach((p, idx) => {
      if (!p.name) p.name = `panel-${idx}`;
      // 将图标位置传递给子面板，保持一致
      try { (p as any).expandIconPlacement = this.expandIconPlacement; } catch {}
    });
    return nodes;
  }

  private syncPanelsActive = () => {
    const panels = this.getPanels();
    panels.forEach(p => {
      try { (p as any).active = this.openKeysInternal.includes(p.name); } catch {}
    });
  };

  private setOpenKeys(next: string[], changed?: string) {
    this.openKeysInternal = next;
    // 受控/非受控均更新内部同步视觉效果
    this.syncPanelsActive();
    // 受控：仅发事件，不强行改写传入的 value；非受控：保持 value 未设置
    if (this.value !== undefined) {
      this.ldesignChange.emit([...next]);
    } else {
      // 非受控不写入 value，避免变成受控
      this.ldesignChange.emit([...next]);
    }
    if (changed) {
      this.ldesignToggle.emit({ name: changed, open: next.includes(changed), openKeys: [...next] });
    }
  }

  private toggle(name: string) {
    if (!name) return;
    if (this.disabled) return;
    const panels = this.getPanels();
    const target = panels.find(p => p.name === name);
    if (target?.disabled) return;

    const isOpen = this.openKeysInternal.includes(name);
    let next: string[] = [];
    if (this.accordion) {
      next = isOpen ? [] : [name];
    } else {
      if (isOpen) next = this.openKeysInternal.filter(k => k !== name);
      else next = [...this.openKeysInternal, name];
    }
    this.setOpenKeys(next, name);
  }

  @Listen('ldesignCollapseItemToggle')
  onItemToggle(ev: CustomEvent<{ name: string }>) {
    ev.stopPropagation();
    const name = ev.detail?.name;
    if (name) this.toggle(name);
  }

  private getHostClass() {
    return {
      'ldesign-collapse': true,
      'ldesign-collapse--bordered': this.bordered,
      'ldesign-collapse--ghost': this.ghost,
      'ldesign-collapse--disabled': this.disabled,
      [`ldesign-collapse--icon-${this.expandIconPlacement}`]: true,
    } as any;
  }

  render() {
    return (
      <Host class={this.getHostClass()}>
        <slot></slot>
      </Host>
    );
  }
}
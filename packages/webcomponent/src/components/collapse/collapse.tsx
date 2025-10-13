import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch, Listen, Method } from '@stencil/core';

/**
 * Collapse 折叠面板
 * - 支持受控/非受控、手风琴模式、动画、禁用
 * - 支持尺寸变体、主题、展开/收起全部、嵌套等高级功能
 */
@Component({
  tag: 'ldesign-collapse',
  styleUrl: 'collapse.less',
  shadow: false,
})
export class LdesignCollapse {
  @Element() el!: HTMLElement;

  /** 展开的面板标识列表（受控） - 可以是数组或JSON字符串 */
  @Prop({ mutable: true }) value?: string[] | string;
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
  
  /** 尺寸变体 */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';
  /** 主题颜色 */
  @Prop() theme: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'default';
  /** 是否显示展开图标 */
  @Prop() showExpandIcon: boolean = true;
  /** 动画持续时间（毫秒） */
  @Prop() animationDuration: number = 200;
  /** 动画缓动函数 */
  @Prop() animationEasing: string = 'ease';
  /** 是否显示阴影 */
  @Prop() shadow: boolean = false;
  /** 圆角样式 */
  @Prop() rounded: 'none' | 'small' | 'medium' | 'large' = 'medium';
  /** 嵌套缩进（像素） */
  @Prop() nestingIndent: number = 20;
  /** 是否可通过键盘导航 */
  @Prop() keyboardNavigation: boolean = true;
  /** 搜索过滤关键词 */
  @Prop() searchKeyword: string = '';
  /** 是否高亮搜索结果 */
  @Prop() highlightSearch: boolean = true;
  /** 卡片模式 */
  @Prop() cardStyle: boolean = false;
  /** 是否可拖拽排序 */
  @Prop() sortable: boolean = false;
  /** 折叠模式：普通、紧凑、分离、卡片 */
  @Prop() mode: 'default' | 'compact' | 'separated' | 'card' = 'default';
  /** 内容加载方式 */
  @Prop() contentLoading: 'sync' | 'async' | 'lazy' = 'sync';
  /** 异步加载函数 */
  @Prop() loadContent?: (name: string) => Promise<string>;

  /** 展开项变化 */
  @Event() ldesignChange!: EventEmitter<string[]>;
  /** 单项切换事件 */
  @Event() ldesignToggle!: EventEmitter<{ name: string; open: boolean; openKeys: string[] }>;
  /** 展开全部事件 */
  @Event() ldesignExpandAll!: EventEmitter<string[]>;
  /** 收起全部事件 */
  @Event() ldesignCollapseAll!: EventEmitter<void>;
  /** 面板展开前事件 */
  @Event() ldesignBeforeExpand!: EventEmitter<{ name: string; cancel: () => void }>;
  /** 面板收起前事件 */
  @Event() ldesignBeforeCollapse!: EventEmitter<{ name: string; cancel: () => void }>;
  /** 排序变化事件 */
  @Event() ldesignSortChange!: EventEmitter<{ from: number; to: number; panelName: string }>;

  @State() openKeysInternal: string[] = [];
  @State() focusedIndex: number = -1;
  @State() filteredPanels: string[] = [];
  @State() draggedPanel: string | null = null;

  @Watch('value')
  watchValue(newVal?: string[] | string) {
    let parsedValue: string[] = [];
    
    if (typeof newVal === 'string') {
      // Parse JSON string
      try {
        parsedValue = JSON.parse(newVal);
        if (!Array.isArray(parsedValue)) {
          parsedValue = [];
        }
      } catch {
        parsedValue = [];
      }
    } else if (Array.isArray(newVal)) {
      parsedValue = [...newVal];
    }
    
    this.openKeysInternal = parsedValue;
    this.syncPanelsActive();
  }
  
  @Watch('searchKeyword')
  watchSearchKeyword(keyword: string) {
    this.filterPanels(keyword);
  }
  
  @Watch('sortable')
  watchSortable() {
    // Update all panels when sortable changes
    this.getPanels();
    this.syncPanelsActive();
  }

  componentWillLoad() {
    let initial: string[] = [];
    
    if (this.value !== undefined) {
      // Handle controlled mode
      if (typeof this.value === 'string') {
        try {
          const parsed = JSON.parse(this.value);
          initial = Array.isArray(parsed) ? parsed : [];
        } catch {
          initial = [];
        }
      } else if (Array.isArray(this.value)) {
        initial = [...this.value];
      }
    } else {
      // Use default value for uncontrolled mode
      initial = this.defaultValue || [];
    }
    
    this.openKeysInternal = [...initial];
    
    if (this.searchKeyword) {
      this.filterPanels(this.searchKeyword);
    }
  }

  componentDidLoad() {
    // 首次同步 - 确保所有属性传递给子面板
    this.getPanels();
    this.syncPanelsActive();
    // 监听插槽变化，动态收集
    const slot = this.el.querySelector('slot') as HTMLSlotElement | null;
    slot?.addEventListener('slotchange', this.syncPanelsActive as any);
    
    // 设置键盘导航
    if (this.keyboardNavigation) {
      this.setupKeyboardNavigation();
    }
  }

  disconnectedCallback() {
    const slot = this.el.querySelector('slot') as HTMLSlotElement | null;
    slot?.removeEventListener('slotchange', this.syncPanelsActive as any);
    
    if (this.keyboardNavigation) {
      this.el.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  private getPanels(): (HTMLElement & { 
    name?: string; 
    active?: boolean; 
    disabled?: boolean; 
    expandIconPlacement?: 'left' | 'right';
    showExpandIcon?: boolean;
    animationDuration?: number;
    animationEasing?: string;
    size?: string;
    theme?: string;
    nestingLevel?: number;
    header?: string;
    hidden?: boolean;
  })[] {
    // 只获取直接子面板，不包括嵌套在其他面板内的
    const nodes = Array.from(this.el.querySelectorAll(':scope > ldesign-collapse-panel')) as any[];
    // 自动补齐 name 和传递属性
    nodes.forEach((p, idx) => {
      if (!p.name) p.name = `panel-${idx}`;
      // 将父级属性传递给子面板
      try { 
        (p as any).expandIconPlacement = this.expandIconPlacement;
        (p as any).showExpandIcon = this.showExpandIcon;
        (p as any).animationDuration = this.animationDuration;
        (p as any).animationEasing = this.animationEasing;
        (p as any).size = this.size;
        (p as any).theme = this.theme;
        (p as any).highlightKeyword = this.highlightSearch ? this.searchKeyword : '';
        (p as any).cardStyle = this.cardStyle;
        (p as any).mode = this.mode;
        (p as any).sortable = this.sortable;
        // 计算嵌套层级
        const parentCollapse = p.closest('ldesign-collapse-panel')?.closest('ldesign-collapse');
        (p as any).nestingLevel = parentCollapse ? ((parentCollapse as any).nestingLevel || 0) + 1 : 0;
        
        // 搜索过滤
        if (this.searchKeyword && this.filteredPanels.length > 0) {
          (p as any).hidden = !this.filteredPanels.includes(p.name);
        } else {
          (p as any).hidden = false;
        }
      } catch {}
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
    
    // 触发 before 事件，允许取消
    let cancelled = false;
    const cancelCallback = () => { cancelled = true; };
    
    if (isOpen) {
      this.ldesignBeforeCollapse.emit({ name, cancel: cancelCallback });
    } else {
      this.ldesignBeforeExpand.emit({ name, cancel: cancelCallback });
    }
    
    if (cancelled) return;
    
    let next: string[] = [];
    if (this.accordion) {
      next = isOpen ? [] : [name];
    } else {
      if (isOpen) next = this.openKeysInternal.filter(k => k !== name);
      else next = [...this.openKeysInternal, name];
    }
    this.setOpenKeys(next, name);
    
    // 如果展开，滚动到视图
    if (!isOpen && target) {
      setTimeout(() => this.scrollIntoViewIfNeeded(target), this.animationDuration + 50);
    }
  }
  
  /** 展开全部面板 */
  @Method()
  async expandAll() {
    const panels = this.getPanels();
    const allNames = panels.filter(p => !p.disabled).map(p => p.name).filter(Boolean) as string[];
    this.setOpenKeys(allNames);
    this.ldesignExpandAll.emit(allNames);
  }
  
  /** 收起全部面板 */
  @Method()
  async collapseAll() {
    this.setOpenKeys([]);
    this.ldesignCollapseAll.emit();
  }
  
  /** 切换指定面板 */
  @Method()
  async togglePanel(name: string) {
    this.toggle(name);
  }
  
  /** 获取当前展开的面板 */
  @Method()
  async getOpenPanels(): Promise<string[]> {
    return [...this.openKeysInternal];
  }
  
  /** 滚动面板到可视区域 */
  private scrollIntoViewIfNeeded(panel: HTMLElement) {
    const rect = panel.getBoundingClientRect();
    const viewHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (rect.top < 0 || rect.bottom > viewHeight) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  /** 设置键盘导航 */
  private setupKeyboardNavigation() {
    this.el.addEventListener('keydown', this.handleKeyDown);
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    const panels = this.getPanels();
    const enabledPanels = panels.filter(p => !p.disabled);
    
    if (!enabledPanels.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusNextPanel(enabledPanels);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusPreviousPanel(enabledPanels);
        break;
      case 'Home':
        e.preventDefault();
        this.focusFirstPanel(enabledPanels);
        break;
      case 'End':
        e.preventDefault();
        this.focusLastPanel(enabledPanels);
        break;
    }
  }
  
  private focusNextPanel(panels: HTMLElement[]) {
    const current = this.focusedIndex;
    const next = current < panels.length - 1 ? current + 1 : 0;
    this.focusPanel(panels[next], next);
  }
  
  private focusPreviousPanel(panels: HTMLElement[]) {
    const current = this.focusedIndex;
    const prev = current > 0 ? current - 1 : panels.length - 1;
    this.focusPanel(panels[prev], prev);
  }
  
  private focusFirstPanel(panels: HTMLElement[]) {
    this.focusPanel(panels[0], 0);
  }
  
  private focusLastPanel(panels: HTMLElement[]) {
    const lastIndex = panels.length - 1;
    this.focusPanel(panels[lastIndex], lastIndex);
  }
  
  private focusPanel(panel: HTMLElement, index: number) {
    const header = panel.querySelector('.ldesign-collapse-panel__header') as HTMLElement;
    if (header) {
      header.focus();
      this.focusedIndex = index;
    }
  }
  
  /** 搜索过滤面板 */
  private filterPanels(keyword: string) {
    if (!keyword) {
      this.filteredPanels = [];
      this.syncPanelsActive();
      return;
    }
    
    const panels = this.getPanels();
    const filtered = panels.filter(p => {
      const header = p.header || p.querySelector('.ldesign-collapse-panel__header-main')?.textContent || '';
      const content = p.textContent || '';
      return header.toLowerCase().includes(keyword.toLowerCase()) || 
             content.toLowerCase().includes(keyword.toLowerCase());
    }).map(p => p.name).filter(Boolean) as string[];
    
    this.filteredPanels = filtered;
    this.syncPanelsActive();
  }
  
  /** 异步加载内容 */
  async loadPanelContent(name: string): Promise<string> {
    if (this.loadContent) {
      try {
        return await this.loadContent(name);
      } catch (error) {
        console.error(`Failed to load content for panel ${name}:`, error);
        return '加载失败';
      }
    }
    return '';
  }
  
  /** 拖拽开始 */
  private onDragStart = (panelName: string, originalEvent: DragEvent) => {
    if (!this.sortable) return;
    this.draggedPanel = panelName;
    // 找到对应的面板元素
    const panel = this.el.querySelector(`ldesign-collapse-panel[name="${panelName}"]`) as HTMLElement;
    if (panel) {
      panel.style.opacity = '0.5';
    }
    originalEvent.dataTransfer!.effectAllowed = 'move';
    originalEvent.dataTransfer!.setData('text/plain', panelName);
  }
  
  /** 拖拽结束 */
  private onDragEnd = () => {
    // 恢复所有面板的透明度
    if (this.draggedPanel) {
      const panel = this.el.querySelector(`ldesign-collapse-panel[name="${this.draggedPanel}"]`) as HTMLElement;
      if (panel) {
        panel.style.opacity = '';
      }
    }
    this.draggedPanel = null;
    // 移除所有拖拽相关的样式
    this.el.querySelectorAll('.ldesign-collapse-panel--drag-over').forEach(el => {
      el.classList.remove('ldesign-collapse-panel--drag-over');
    });
  }
  
  /** 拖拽经过 */
  private onDragOver = (panelName: string, originalEvent: DragEvent) => {
    if (!this.sortable || !this.draggedPanel) return;
    originalEvent.preventDefault();
    originalEvent.dataTransfer!.dropEffect = 'move';
    
    // 添加视觉反馈到目标面板
    const panel = this.el.querySelector(`ldesign-collapse-panel[name="${panelName}"]`) as HTMLElement;
    if (panel && !panel.classList.contains('ldesign-collapse-panel--drag-over')) {
      panel.classList.add('ldesign-collapse-panel--drag-over');
    }
  }
  
  /** 拖拽离开 */
  private onDragLeave = (panelName: string) => {
    const panel = this.el.querySelector(`ldesign-collapse-panel[name="${panelName}"]`) as HTMLElement;
    if (panel) {
      panel.classList.remove('ldesign-collapse-panel--drag-over');
    }
  }
  
  /** 放置 */
  private onDrop = (targetName: string, originalEvent: DragEvent) => {
    if (!this.sortable || !this.draggedPanel) return;
    originalEvent.preventDefault();
    originalEvent.stopPropagation();
    
    // 移除拖拽样式
    const targetPanel = this.el.querySelector(`ldesign-collapse-panel[name="${targetName}"]`) as HTMLElement;
    if (targetPanel) {
      targetPanel.classList.remove('ldesign-collapse-panel--drag-over');
    }
    
    if (this.draggedPanel === targetName) return;
    
    // 获取所有面板元素
    const panelElements = Array.from(this.el.querySelectorAll(':scope > ldesign-collapse-panel'));
    const draggedElement = panelElements.find(p => (p as any).name === this.draggedPanel);
    const targetElement = panelElements.find(p => (p as any).name === targetName);
    
    if (draggedElement && targetElement) {
      // 计算插入位置
      const draggedIndex = panelElements.indexOf(draggedElement);
      const targetIndex = panelElements.indexOf(targetElement);
      
      if (draggedIndex < targetIndex) {
        // 向下拖拽：插入到目标元素后面
        targetElement.parentNode?.insertBefore(draggedElement, targetElement.nextSibling);
      } else {
        // 向上拖拽：插入到目标元素前面  
        targetElement.parentNode?.insertBefore(draggedElement, targetElement);
      }
      
      // 触发排序变化事件
      this.ldesignSortChange?.emit({
        from: draggedIndex,
        to: targetIndex,
        panelName: this.draggedPanel
      });
    }
    
    this.draggedPanel = null;
  }

  @Listen('ldesignCollapseItemToggle')
  onItemToggle(ev: CustomEvent<{ name: string }>) {
    ev.stopPropagation();
    const name = ev.detail?.name;
    if (name) this.toggle(name);
  }
  
  @Listen('ldesignPanelDragStart')
  onPanelDragStart(ev: CustomEvent<{ name: string; event: DragEvent }>) {
    ev.stopPropagation();
    this.onDragStart(ev.detail.name, ev.detail.event);
  }
  
  @Listen('ldesignPanelDragEnd')
  onPanelDragEnd(ev: CustomEvent<{ event: DragEvent }>) {
    ev.stopPropagation();
    this.onDragEnd();
  }
  
  @Listen('ldesignPanelDragOver')
  onPanelDragOver(ev: CustomEvent<{ name: string; event: DragEvent }>) {
    ev.stopPropagation();
    this.onDragOver(ev.detail.name, ev.detail.event);
  }
  
  @Listen('ldesignPanelDragLeave')
  onPanelDragLeave(ev: CustomEvent<{ name: string; event: DragEvent }>) {
    ev.stopPropagation();
    this.onDragLeave(ev.detail.name);
  }
  
  @Listen('ldesignPanelDrop')
  onPanelDrop(ev: CustomEvent<{ name: string; event: DragEvent }>) {
    ev.stopPropagation();
    this.onDrop(ev.detail.name, ev.detail.event);
  }

  private getHostClass() {
    return {
      'ldesign-collapse': true,
      'ldesign-collapse--bordered': this.bordered,
      'ldesign-collapse--ghost': this.ghost,
      'ldesign-collapse--disabled': this.disabled,
      [`ldesign-collapse--icon-${this.expandIconPlacement}`]: true,
      [`ldesign-collapse--${this.size}`]: true,
      [`ldesign-collapse--${this.theme}`]: this.theme !== 'default',
      'ldesign-collapse--no-icon': !this.showExpandIcon,
      'ldesign-collapse--shadow': this.shadow,
      [`ldesign-collapse--rounded-${this.rounded}`]: this.rounded !== 'medium',
      'ldesign-collapse--card': this.cardStyle || this.mode === 'card',
      [`ldesign-collapse--${this.mode}`]: this.mode !== 'default',
      'ldesign-collapse--sortable': this.sortable,
      'ldesign-collapse--searching': !!this.searchKeyword,
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
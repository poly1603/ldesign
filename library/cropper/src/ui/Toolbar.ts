/**
 * @ldesign/cropper 工具栏组件
 * 
 * 提供可配置的工具栏UI组件
 */

import { BaseComponent } from './BaseComponent';
import { Button } from './Button';
import type { ToolbarComponent, ToolbarItem, ButtonComponent } from '../types/ui';

// ============================================================================
// 工具栏组件类
// ============================================================================

/**
 * 工具栏组件类
 * 提供可配置的工具栏功能
 */
export class Toolbar extends BaseComponent implements ToolbarComponent {
  public readonly type = 'toolbar' as const;
  
  /** 工具栏配置 */
  protected declare config: ToolbarComponent;
  
  /** 工具栏项目组件映射 */
  private itemComponents: Map<string, Button | HTMLElement> = new Map();
  
  /** 工具栏容器元素 */
  private itemsContainer: HTMLElement | null = null;

  constructor(config: Partial<ToolbarComponent> = {}) {
    super({
      orientation: 'horizontal',
      items: [],
      showSeparators: true,
      ...config
    });
  }

  // ============================================================================
  // 属性访问器
  // ============================================================================

  /**
   * 获取工具栏方向
   */
  get orientation(): ToolbarComponent['orientation'] {
    return this.config.orientation || 'horizontal';
  }

  /**
   * 设置工具栏方向
   */
  set orientation(value: ToolbarComponent['orientation']) {
    this.config.orientation = value;
    this.updateOrientation();
  }

  /**
   * 获取工具栏项目
   */
  get items(): ToolbarItem[] {
    return this.config.items || [];
  }

  /**
   * 设置工具栏项目
   */
  set items(value: ToolbarItem[]) {
    this.config.items = value;
    this.updateItems();
  }

  /**
   * 获取是否显示分隔符
   */
  get showSeparators(): boolean {
    return this.config.showSeparators ?? true;
  }

  /**
   * 设置是否显示分隔符
   */
  set showSeparators(value: boolean) {
    this.config.showSeparators = value;
    this.updateSeparators();
  }

  // ============================================================================
  // 组件生命周期
  // ============================================================================

  /**
   * 创建工具栏DOM元素
   */
  protected createElement(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.setAttribute('role', 'toolbar');
    
    // 创建项目容器
    this.itemsContainer = document.createElement('div');
    this.itemsContainer.className = 'ldesign-cropper-toolbar-items';
    
    toolbar.appendChild(this.itemsContainer);
    
    return toolbar;
  }

  /**
   * 渲染工具栏内容
   */
  protected render(): void {
    this.updateOrientation();
    this.updateItems();
    this.updateSeparators();
  }

  /**
   * 获取基础CSS类名
   */
  protected getBaseClasses(): string[] {
    return [
      ...super.getBaseClasses(),
      'ldesign-cropper-toolbar',
      `ldesign-cropper-toolbar-${this.orientation}`
    ];
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    // 销毁所有项目组件
    this.itemComponents.forEach(component => {
      if (component instanceof Button) {
        component.destroy();
      }
    });
    this.itemComponents.clear();
    
    super.destroy();
  }

  // ============================================================================
  // 更新方法
  // ============================================================================

  /**
   * 更新工具栏方向
   */
  private updateOrientation(): void {
    if (!this.element) return;
    
    // 移除旧的方向类名
    this.element.classList.remove('ldesign-cropper-toolbar-horizontal', 'ldesign-cropper-toolbar-vertical');
    
    // 添加新的方向类名
    this.element.classList.add(`ldesign-cropper-toolbar-${this.orientation}`);
  }

  /**
   * 更新工具栏项目
   */
  private updateItems(): void {
    if (!this.itemsContainer) return;
    
    // 清空容器
    this.itemsContainer.innerHTML = '';
    
    // 销毁旧的组件
    this.itemComponents.forEach(component => {
      if (component instanceof Button) {
        component.destroy();
      }
    });
    this.itemComponents.clear();
    
    // 创建新的项目
    this.items.forEach((item, index) => {
      const itemElement = this.createToolbarItem(item);
      if (itemElement) {
        this.itemsContainer!.appendChild(itemElement);
        
        // 添加分隔符（除了最后一个项目）
        if (this.showSeparators && index < this.items.length - 1 && item.type !== 'separator') {
          const separator = this.createSeparator();
          this.itemsContainer!.appendChild(separator);
        }
      }
    });
  }

  /**
   * 更新分隔符显示
   */
  private updateSeparators(): void {
    if (!this.itemsContainer) return;
    
    const separators = this.itemsContainer.querySelectorAll('.ldesign-cropper-toolbar-separator');
    separators.forEach(separator => {
      (separator as HTMLElement).style.display = this.showSeparators ? '' : 'none';
    });
  }

  /**
   * 创建工具栏项目
   * @param item 项目配置
   * @returns 项目DOM元素
   */
  private createToolbarItem(item: ToolbarItem): HTMLElement | null {
    // 检查项目可见性
    if (item.visible === false) {
      return null;
    }

    switch (item.type) {
      case 'button':
        return this.createButtonItem(item);
      
      case 'separator':
        return this.createSeparator();
      
      case 'group':
        return this.createGroupItem(item);
      
      case 'custom':
        return this.createCustomItem(item);
      
      default:
        console.warn(`Unknown toolbar item type: ${item.type}`);
        return null;
    }
  }

  /**
   * 创建按钮项目
   * @param item 项目配置
   * @returns 按钮元素
   */
  private createButtonItem(item: ToolbarItem): HTMLElement | null {
    if (!item.button) {
      console.warn(`Button item ${item.id} missing button configuration`);
      return null;
    }

    const buttonConfig: Partial<ButtonComponent> = {
      id: item.id,
      enabled: item.enabled !== false,
      ...item.button
    };

    const button = new Button(buttonConfig);
    const buttonElement = document.createElement('div');
    buttonElement.className = 'ldesign-cropper-toolbar-item ldesign-cropper-toolbar-button';
    
    // 挂载按钮到容器
    button.mount(buttonElement);
    
    // 保存组件引用
    this.itemComponents.set(item.id, button);
    
    return buttonElement;
  }

  /**
   * 创建分隔符
   * @returns 分隔符元素
   */
  private createSeparator(): HTMLElement {
    const separator = document.createElement('div');
    separator.className = 'ldesign-cropper-toolbar-separator';
    separator.setAttribute('role', 'separator');
    return separator;
  }

  /**
   * 创建分组项目
   * @param item 项目配置
   * @returns 分组元素
   */
  private createGroupItem(item: ToolbarItem): HTMLElement | null {
    if (!item.items || item.items.length === 0) {
      return null;
    }

    const group = document.createElement('div');
    group.className = 'ldesign-cropper-toolbar-group';
    group.setAttribute('role', 'group');

    // 创建分组项目
    item.items.forEach((groupItem, index) => {
      const groupItemElement = this.createToolbarItem(groupItem);
      if (groupItemElement) {
        group.appendChild(groupItemElement);
        
        // 分组内的分隔符
        if (index < item.items!.length - 1 && groupItem.type !== 'separator') {
          const separator = this.createSeparator();
          separator.classList.add('ldesign-cropper-toolbar-group-separator');
          group.appendChild(separator);
        }
      }
    });

    return group;
  }

  /**
   * 创建自定义项目
   * @param item 项目配置
   * @returns 自定义元素
   */
  private createCustomItem(item: ToolbarItem): HTMLElement | null {
    if (!item.content) {
      return null;
    }

    const container = document.createElement('div');
    container.className = 'ldesign-cropper-toolbar-item ldesign-cropper-toolbar-custom';

    if (typeof item.content === 'string') {
      container.innerHTML = item.content;
    } else if (item.content instanceof HTMLElement) {
      container.appendChild(item.content);
      this.itemComponents.set(item.id, item.content);
    }

    return container;
  }

  // ============================================================================
  // 公共方法
  // ============================================================================

  /**
   * 添加工具栏项目
   * @param item 项目配置
   * @param index 插入位置（可选）
   */
  addItem(item: ToolbarItem, index?: number): void {
    const items = [...this.items];
    
    if (typeof index === 'number' && index >= 0 && index <= items.length) {
      items.splice(index, 0, item);
    } else {
      items.push(item);
    }
    
    this.items = items;
  }

  /**
   * 移除工具栏项目
   * @param itemId 项目ID
   */
  removeItem(itemId: string): void {
    const items = this.items.filter(item => item.id !== itemId);
    this.items = items;
    
    // 销毁组件
    const component = this.itemComponents.get(itemId);
    if (component instanceof Button) {
      component.destroy();
    }
    this.itemComponents.delete(itemId);
  }

  /**
   * 获取工具栏项目组件
   * @param itemId 项目ID
   * @returns 项目组件
   */
  getItem(itemId: string): Button | HTMLElement | undefined {
    return this.itemComponents.get(itemId);
  }

  /**
   * 更新工具栏项目
   * @param itemId 项目ID
   * @param updates 更新配置
   */
  updateItem(itemId: string, updates: Partial<ToolbarItem>): void {
    const items = this.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    this.items = items;
  }

  /**
   * 设置项目可见性
   * @param itemId 项目ID
   * @param visible 是否可见
   */
  setItemVisible(itemId: string, visible: boolean): void {
    this.updateItem(itemId, { visible });
  }

  /**
   * 设置项目启用状态
   * @param itemId 项目ID
   * @param enabled 是否启用
   */
  setItemEnabled(itemId: string, enabled: boolean): void {
    this.updateItem(itemId, { enabled });
    
    // 更新组件状态
    const component = this.itemComponents.get(itemId);
    if (component instanceof Button) {
      component.enabled = enabled;
    }
  }

  /**
   * 清空工具栏
   */
  clear(): void {
    this.items = [];
  }

  /**
   * 获取所有项目ID
   * @returns 项目ID数组
   */
  getItemIds(): string[] {
    return this.items.map(item => item.id);
  }
}

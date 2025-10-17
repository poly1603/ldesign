import { EditorMode } from '../types';

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  container: HTMLElement;
  mode: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  onThemeChange?: (theme: 'default' | 'dark' | 'minimal') => void;
  onDelete?: () => void;
  onClear?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onExport?: () => void;
}

/**
 * 工具栏组件
 */
export class Toolbar {
  private container: HTMLElement;
  private config: ToolbarConfig;
  private mode: EditorMode;

  constructor(config: ToolbarConfig) {
    this.config = config;
    this.container = config.container;
    this.mode = config.mode;
    
    this.render();
  }

  /**
   * 渲染工具栏
   */
  private render(): void {
    this.container.innerHTML = '';
    this.container.style.cssText = `
      display: flex;
      align-items: center;
      padding: 10px 15px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      gap: 10px;
      flex-wrap: wrap;
    `;

    // 模式切换
    this.container.appendChild(this.createModeToggle());
    this.container.appendChild(this.createDivider());

    // 主题切换
    this.container.appendChild(this.createThemeSelector());
    this.container.appendChild(this.createDivider());

    // 编辑操作
    this.container.appendChild(this.createButton('删除', '🗑️', () => this.config.onDelete?.()));
    this.container.appendChild(this.createButton('清空', '🧹', () => this.config.onClear?.()));
    this.container.appendChild(this.createDivider());

    // 历史操作
    this.container.appendChild(this.createButton('撤销', '↶', () => this.config.onUndo?.()));
    this.container.appendChild(this.createButton('重做', '↷', () => this.config.onRedo?.()));
    this.container.appendChild(this.createDivider());

    // 视图操作
    this.container.appendChild(this.createButton('放大', '🔍+', () => this.config.onZoomIn?.()));
    this.container.appendChild(this.createButton('缩小', '🔍-', () => this.config.onZoomOut?.()));
    this.container.appendChild(this.createButton('适应', '⊡', () => this.config.onFit?.()));
    this.container.appendChild(this.createDivider());

    // 导出
    this.container.appendChild(this.createButton('导出', '💾', () => this.config.onExport?.()));
  }

  /**
   * 创建模式切换
   */
  private createModeToggle(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      background: #f5f5f5;
      border-radius: 6px;
      padding: 2px;
    `;

    const readonlyBtn = this.createModeButton('只读', EditorMode.READONLY);
    const editBtn = this.createModeButton('编辑', EditorMode.EDIT);

    container.appendChild(readonlyBtn);
    container.appendChild(editBtn);

    return container;
  }

  /**
   * 创建模式按钮
   */
  private createModeButton(label: string, mode: EditorMode): HTMLElement {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = `
      padding: 6px 16px;
      border: none;
      background: ${this.mode === mode ? '#2196f3' : 'transparent'};
      color: ${this.mode === mode ? '#fff' : '#666'};
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    `;

    button.addEventListener('click', () => {
      this.setMode(mode);
      this.config.onModeChange?.(mode);
    });

    button.addEventListener('mouseenter', () => {
      if (this.mode !== mode) {
        button.style.background = '#e3f2fd';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (this.mode !== mode) {
        button.style.background = 'transparent';
      }
    });

    return button;
  }

  /**
   * 创建按钮
   */
  private createButton(label: string, icon: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button');
    button.innerHTML = `<span style="margin-right: 4px;">${icon}</span>${label}`;
    button.style.cssText = `
      padding: 6px 12px;
      border: 1px solid #e0e0e0;
      background: #fff;
      color: #333;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
    `;

    button.addEventListener('click', onClick);

    button.addEventListener('mouseenter', () => {
      button.style.background = '#f5f5f5';
      button.style.borderColor = '#2196f3';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#fff';
      button.style.borderColor = '#e0e0e0';
    });

    return button;
  }

  /**
   * 创建分隔符
   */
  private createDivider(): HTMLElement {
    const divider = document.createElement('div');
    divider.style.cssText = `
      width: 1px;
      height: 24px;
      background: #e0e0e0;
    `;
    return divider;
  }

  /**
   * 设置模式
   */
  public setMode(mode: EditorMode): void {
    this.mode = mode;
    this.render();
  }

  /**
   * 创建主题选择器
   */
  private createThemeSelector(): HTMLElement {
    const select = document.createElement('select');
    select.style.cssText = `
      padding: 6px 12px;
      border: 1px solid #e0e0e0;
      background: #fff;
      color: #333;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    `;

    const options = [
      { value: 'default', label: '🎨 默认主题' },
      { value: 'dark', label: '🌙 暗色主题' },
      { value: 'minimal', label: '⚪ 简约主题' }
    ];

    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      const theme = (e.target as HTMLSelectElement).value as 'default' | 'dark' | 'minimal';
      this.config.onThemeChange?.(theme);
    });

    select.addEventListener('mouseenter', () => {
      select.style.borderColor = '#2196f3';
    });

    select.addEventListener('mouseleave', () => {
      select.style.borderColor = '#e0e0e0';
    });

    return select;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.container.innerHTML = '';
  }
}




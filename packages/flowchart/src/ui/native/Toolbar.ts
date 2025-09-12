/**
 * 原生DOM实现的工具栏
 */

import type { FlowchartTheme } from '../../types'

export interface ToolbarConfig {
  tools?: string[]
  readonly?: boolean
  theme?: FlowchartTheme
  onToolAction?: (action: string) => void
  onThemeChange?: (theme: FlowchartTheme) => void
}

import { getToolbarIcon } from '../../utils/icons'

/**
 * 工具定义
 */
const TOOLS = {
  'select': { label: '选择', icon: () => getToolbarIcon('select'), title: '选择工具' },
  'multi-select': { label: '多选', icon: () => getToolbarIcon('multi-select'), title: '多选模式' },
  'material-repository': { label: '物料库', icon: () => getToolbarIcon('material-repository'), title: '物料仓库' },
  'history': { label: '历史', icon: () => getToolbarIcon('history'), title: '历史记录' },
  'zoom-fit': { label: '适应', icon: () => getToolbarIcon('zoom-fit'), title: '适应画布' },
  'zoom-in': { label: '放大', icon: () => getToolbarIcon('zoom-in'), title: '放大画布' },
  'zoom-out': { label: '缩小', icon: () => getToolbarIcon('zoom-out'), title: '缩小画布' },
  'undo': { label: '撤销', icon: () => getToolbarIcon('undo'), title: '撤销操作' },
  'redo': { label: '重做', icon: () => getToolbarIcon('redo'), title: '重做操作' },
  'delete': { label: '删除', icon: () => getToolbarIcon('delete'), title: '删除选中元素' },
  'clear': { label: '清空', icon: () => getToolbarIcon('clear'), title: '清空画布' },
  'export': { label: '导出', icon: () => getToolbarIcon('export'), title: '导出数据' }
}

const THEMES = [
  { value: 'default', label: '默认主题' },
  { value: 'dark', label: '暗色主题' },
  { value: 'blue', label: '蓝色主题' }
]

export class Toolbar {
  private container: HTMLElement
  private config: ToolbarConfig
  private toolbarElement: HTMLElement | null = null

  constructor(container: HTMLElement, config: ToolbarConfig = {}) {
    this.container = container
    this.config = {
      tools: ['select', 'multi-select', 'history', 'zoom-fit', 'undo', 'redo', 'delete'],
      readonly: false,
      theme: 'default',
      ...config
    }
    this.init()
  }

  /**
   * 初始化工具栏
   */
  private init(): void {
    this.createToolbar()
    this.bindEvents()
    this.applyStyles()
  }

  /**
   * 创建工具栏DOM结构
   */
  private createToolbar(): void {
    this.toolbarElement = document.createElement('div')
    this.toolbarElement.className = 'ldesign-toolbar'
    this.toolbarElement.innerHTML = `
      <div class="toolbar-left">
        <div class="toolbar-group">
          ${this.createToolsHTML()}
        </div>
      </div>
      <div class="toolbar-right">
        <div class="toolbar-group">
          ${this.createThemeSelectorHTML()}
        </div>
      </div>
    `

    this.container.appendChild(this.toolbarElement)
  }

  /**
   * 创建工具按钮HTML
   */
  private createToolsHTML(): string {
    if (!this.config.tools) return ''

    return this.config.tools.map(toolKey => {
      const tool = TOOLS[toolKey as keyof typeof TOOLS]
      if (!tool) return ''

      const disabled = this.config.readonly && ['delete', 'clear'].includes(toolKey) ? 'disabled' : ''

      return `
        <button class="toolbar-btn ${disabled}"
                data-tool="${toolKey}"
                title="${tool.title}"
                ${disabled}>
          <span class="btn-icon">${typeof tool.icon === 'function' ? tool.icon() : tool.icon}</span>
          <span class="btn-text">${tool.label}</span>
        </button>
      `
    }).join('')
  }

  /**
   * 创建主题选择器HTML
   */
  private createThemeSelectorHTML(): string {
    return `
      <div class="theme-selector">
        <label for="theme-select">主题:</label>
        <select id="theme-select" class="theme-select">
          ${THEMES.map(theme => `
            <option value="${theme.value}" ${theme.value === this.config.theme ? 'selected' : ''}>
              ${theme.label}
            </option>
          `).join('')}
        </select>
      </div>
    `
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.toolbarElement) return

    // 工具按钮点击事件
    this.toolbarElement.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const button = target.closest('.toolbar-btn') as HTMLButtonElement

      if (button && !button.disabled) {
        const tool = button.dataset.tool
        if (tool) {
          // 添加点击效果
          button.classList.add('active')
          setTimeout(() => button.classList.remove('active'), 150)

          this.config.onToolAction?.(tool)
        }
      }
    })

    // 主题选择器变化事件
    const themeSelect = this.toolbarElement.querySelector('#theme-select') as HTMLSelectElement
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const theme = (e.target as HTMLSelectElement).value as FlowchartTheme
        this.config.onThemeChange?.(theme)
      })
    }
  }

  /**
   * 应用样式
   */
  private applyStyles(): void {
    const styles = `
      .ldesign-toolbar {
        width: 100%;
        height: 100%;
        background: var(--ldesign-bg-color-container, #fff);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-sizing: border-box;
      }

      .toolbar-left, .toolbar-right {
        display: flex;
        align-items: center;
      }

      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        background: var(--ldesign-bg-color-component, #f8f9fa);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 4px;
        color: var(--ldesign-text-color-primary, #333);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }

      .toolbar-btn:hover:not(:disabled) {
        background: var(--ldesign-bg-color-component-hover, #e9ecef);
        border-color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .toolbar-btn:active:not(:disabled),
      .toolbar-btn.active {
        background: var(--ldesign-brand-color, #722ED1);
        color: white;
        transform: translateY(0);
      }

      .toolbar-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--ldesign-bg-color-component-disabled, #f5f5f5);
        color: var(--ldesign-text-color-disabled, #999);
      }

      .btn-icon {
        font-size: 14px;
        line-height: 1;
      }

      .btn-text {
        font-weight: 500;
      }

      .theme-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--ldesign-text-color-secondary, #666);
      }

      .theme-select {
        padding: 4px 8px;
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 4px;
        background: var(--ldesign-bg-color-container, #fff);
        color: var(--ldesign-text-color-primary, #333);
        font-size: 12px;
        cursor: pointer;
        min-width: 100px;
      }

      .theme-select:focus {
        outline: none;
        border-color: var(--ldesign-brand-color, #722ED1);
        box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus, rgba(114, 46, 209, 0.1));
      }

      /* 分隔线 */
      .toolbar-group + .toolbar-group::before {
        content: '';
        width: 1px;
        height: 20px;
        background: var(--ldesign-border-color, #e5e5e5);
        margin: 0 8px;
      }

      /* 只读模式样式 */
      .ldesign-toolbar.readonly .toolbar-btn[data-tool="delete"],
      .ldesign-toolbar.readonly .toolbar-btn[data-tool="clear"] {
        display: none;
      }

      /* 主题样式 */
      .theme-dark .ldesign-toolbar {
        background: #1f1f1f;
        border-color: #333;
      }

      .theme-dark .toolbar-btn {
        background: #2a2a2a;
        border-color: #333;
        color: #fff;
      }

      .theme-dark .toolbar-btn:hover:not(:disabled) {
        background: #333;
      }

      .theme-dark .toolbar-btn:disabled {
        background: #1a1a1a;
        color: #666;
      }

      .theme-dark .theme-select {
        background: #2a2a2a;
        border-color: #333;
        color: #fff;
      }

      .theme-blue .ldesign-toolbar {
        background: #f0f8ff;
        border-color: #b3d9ff;
      }

      .theme-blue .toolbar-btn {
        background: #e6f3ff;
        border-color: #b3d9ff;
      }

      .theme-blue .toolbar-btn:hover:not(:disabled) {
        background: #cce7ff;
        border-color: #1890ff;
      }

      .theme-blue .toolbar-btn:active:not(:disabled),
      .theme-blue .toolbar-btn.active {
        background: #1890ff;
        color: white;
      }
    `

    // 注入样式
    if (!document.getElementById('toolbar-styles')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'toolbar-styles'
      styleElement.textContent = styles
      document.head.appendChild(styleElement)
    }
  }

  /**
   * 设置只读模式
   */
  public setReadonly(readonly: boolean): void {
    this.config.readonly = readonly

    if (this.toolbarElement) {
      if (readonly) {
        this.toolbarElement.classList.add('readonly')
      } else {
        this.toolbarElement.classList.remove('readonly')
      }
    }
  }

  /**
   * 设置主题
   */
  public setTheme(theme: FlowchartTheme): void {
    this.config.theme = theme

    const themeSelect = this.toolbarElement?.querySelector('#theme-select') as HTMLSelectElement
    if (themeSelect) {
      themeSelect.value = theme
    }
  }

  /**
   * 更新工具状态
   */
  public updateToolState(tool: string, state: 'active' | 'disabled' | 'normal'): void {
    const button = this.toolbarElement?.querySelector(`[data-tool="${tool}"]`) as HTMLButtonElement
    if (!button) return

    button.classList.remove('active')
    button.disabled = false

    switch (state) {
      case 'active':
        button.classList.add('active')
        break
      case 'disabled':
        button.disabled = true
        break
      case 'normal':
      default:
        // 默认状态，无需额外操作
        break
    }
  }

  /**
   * 销毁工具栏
   */
  public destroy(): void {
    if (this.toolbarElement) {
      this.toolbarElement.remove()
      this.toolbarElement = null
    }
  }
}

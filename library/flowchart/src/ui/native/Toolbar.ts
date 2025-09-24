/**
 * 原生DOM实现的工具栏
 */

import type { FlowchartTheme } from '../../types'

export interface ToolbarConfig {
  tools?: string[]
  readonly?: boolean
  theme?: FlowchartTheme
  onToolAction?: (action: string) => void
  onViewAction?: (action: string) => void
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
  'copy': { label: '复制', icon: () => getToolbarIcon('copy'), title: '复制选中元素 (Ctrl+C)' },
  'paste': { label: '粘贴', icon: () => getToolbarIcon('paste'), title: '粘贴元素 (Ctrl+V)' },
  'validate': { label: '验证', icon: () => getToolbarIcon('validate'), title: '验证流程图' },
  'export': { label: '导出', icon: () => getToolbarIcon('export'), title: '导出数据' },
  'download': { label: '下载', icon: () => getToolbarIcon('download'), title: '下载文件' },
  'template-new': { label: '新建模板', icon: () => getToolbarIcon('template-new'), title: '从当前流程图创建模板' },
  'template-save': { label: '保存模板', icon: () => getToolbarIcon('template-save'), title: '保存当前流程图为模板' },
  'template-load': { label: '加载模板', icon: () => getToolbarIcon('template-load'), title: '从模板加载流程图' },
  'template-library': { label: '模板库', icon: () => getToolbarIcon('template-library'), title: '打开模板库' },
  
  // 新增扩展功能工具
  'align-left': { label: '左对齐', icon: () => getToolbarIcon('align-left'), title: '将选中节点左对齐' },
  'align-center': { label: '居中对齐', icon: () => getToolbarIcon('align-center'), title: '将选中节点居中对齐' },
  'align-right': { label: '右对齐', icon: () => getToolbarIcon('align-right'), title: '将选中节点右对齐' },
  'align-top': { label: '顶部对齐', icon: () => getToolbarIcon('align-top'), title: '将选中节点顶部对齐' },
  'align-middle': { label: '垂直居中', icon: () => getToolbarIcon('align-middle'), title: '将选中节点垂直居中对齐' },
  'align-bottom': { label: '底部对齐', icon: () => getToolbarIcon('align-bottom'), title: '将选中节点底部对齐' },
  'distribute-h': { label: '水平分布', icon: () => getToolbarIcon('distribute-h'), title: '水平均匀分布选中节点' },
  'distribute-v': { label: '垂直分布', icon: () => getToolbarIcon('distribute-v'), title: '垂直均匀分布选中节点' },
  'ai-optimize': { label: 'AI优化', icon: () => getToolbarIcon('ai-optimize'), title: 'AI智能布局优化' },
  'drag-guide': { label: '拖拽指示', icon: () => getToolbarIcon('drag-guide'), title: '切换拖拽指示线' },
  'layout-analysis': { label: '布局分析', icon: () => getToolbarIcon('layout-analysis'), title: '获取AI布局分析报告' }
}

const THEMES = [
  { value: 'default-light', label: '默认浅色' },
  { value: 'default-dark', label: '默认深色' },
  { value: 'high-contrast', label: '高对比度' },
  { value: 'enterprise', label: '企业主题' },
  { value: 'colorful', label: '缤纷彩色' },
  { value: 'christmas', label: '圣诞主题' }
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
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          ${this.createViewToolsHTML()}
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
   * 创建视图工具HTML
   */
  private createViewToolsHTML(): string {
    const viewTools = [
      { key: 'zoomIn', icon: () => getToolbarIcon('zoom-in'), text: '放大', action: 'zoom-in' },
      { key: 'zoomOut', icon: () => getToolbarIcon('zoom-out'), text: '缩小', action: 'zoom-out' },
      { key: 'zoomFit', icon: () => getToolbarIcon('zoom-fit'), text: '适应', action: 'zoom-fit' },
      { key: 'zoomReset', icon: () => getToolbarIcon('zoom-reset'), text: '重置', action: 'zoom-reset' }
    ]

    return viewTools.map(tool => `
      <button class="toolbar-btn" data-action="${tool.action}" title="${tool.text}">
        <span class="btn-icon">${typeof tool.icon === 'function' ? tool.icon() : tool.icon}</span>
        <span class="btn-text">${tool.text}</span>
      </button>
    `).join('')
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
        const action = button.dataset.action

        if (tool) {
          // 添加点击效果
          button.classList.add('active')
          setTimeout(() => button.classList.remove('active'), 150)

          this.config.onToolAction?.(tool)
        } else if (action) {
          // 处理视图操作
          this.handleViewAction(action)

          // 添加点击效果
          button.classList.add('active')
          setTimeout(() => button.classList.remove('active'), 150)
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
   * 处理视图操作
   */
  private handleViewAction(action: string): void {
    if (!this.config.onViewAction) return

    switch (action) {
      case 'zoom-in':
        this.config.onViewAction('zoomIn')
        break
      case 'zoom-out':
        this.config.onViewAction('zoomOut')
        break
      case 'zoom-fit':
        this.config.onViewAction('zoomFit')
        break
      case 'zoom-reset':
        this.config.onViewAction('zoomReset')
        break
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
        padding: 0 20px;
        box-sizing: border-box;
        backdrop-filter: blur(8px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .toolbar-left, .toolbar-right {
        display: flex;
        align-items: center;
      }

      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--ldesign-bg-color-component, #f8f9fa);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 8px;
        color: var(--ldesign-text-color-primary, #333);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        position: relative;
        overflow: hidden;
      }

      .toolbar-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--ldesign-brand-color, #722ED1);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 7px;
      }

      .toolbar-btn:hover:not(:disabled) {
        background: var(--ldesign-bg-color-component-hover, #e9ecef);
        border-color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
      }

      .toolbar-btn:hover:not(:disabled)::before {
        opacity: 0.05;
      }

      .toolbar-btn:active:not(:disabled),
      .toolbar-btn.active {
        background: var(--ldesign-brand-color, #722ED1);
        color: white;
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(114, 46, 209, 0.3);
      }

      .toolbar-btn:active:not(:disabled)::before,
      .toolbar-btn.active::before {
        opacity: 0;
      }

      .toolbar-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--ldesign-bg-color-component-disabled, #f5f5f5);
        color: var(--ldesign-text-color-disabled, #999);
      }

      .btn-icon {
        font-size: 16px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-text {
        font-weight: 500;
        white-space: nowrap;
      }

      .theme-selector {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--ldesign-text-color-secondary, #666);
        font-weight: 500;
      }

      .theme-select {
        padding: 6px 12px;
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 6px;
        background: var(--ldesign-bg-color-container, #fff);
        color: var(--ldesign-text-color-primary, #333);
        font-size: 13px;
        cursor: pointer;
        min-width: 120px;
        transition: all 0.2s ease;
      }

      .theme-select:hover {
        border-color: var(--ldesign-brand-color, #722ED1);
        box-shadow: 0 2px 8px rgba(114, 46, 209, 0.1);
      }

      .theme-select:focus {
        outline: none;
        border-color: var(--ldesign-brand-color, #722ED1);
        box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.2);
      }

      /* 工具栏分隔线 */
      .toolbar-divider {
        width: 1px;
        height: 24px;
        background: var(--ldesign-border-color, #e5e5e5);
        margin: 0 8px;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .ldesign-toolbar {
          padding: 0 12px;
        }

        .toolbar-group {
          gap: 8px;
        }

        .toolbar-btn {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-text {
          display: none;
        }
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

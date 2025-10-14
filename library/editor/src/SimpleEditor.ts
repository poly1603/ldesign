/**
 * 简化版编辑器
 * 自动配置完整工具栏，无需复杂配置
 */

import { Editor } from './core/Editor'
import { Toolbar } from './ui/Toolbar'
import './styles/editor.css'

// 导入所有常用插件
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikePlugin,
  CodePlugin,
  ClearFormatPlugin,
  HeadingPlugin,
  BulletListPlugin,
  OrderedListPlugin,
  TaskListPlugin,
  BlockquotePlugin,
  CodeBlockPlugin,
  LinkPlugin,
  ImagePlugin,
  TablePlugin,
  HistoryPlugin,
  AlignPlugin,
  TextColorPlugin,
  BackgroundColorPlugin,
  FontSizePlugin,
  FontFamilyPlugin,
  SuperscriptPlugin,
  SubscriptPlugin,
  HorizontalRulePlugin,
  IndentPlugin,
  FullscreenPlugin,
  LineHeightPlugin,
  TextTransformPlugin,
  FindReplacePlugin,
  WordCountPlugin,
  ExportMarkdownPlugin,
  ContextMenuPlugin
} from './plugins'

export interface SimpleEditorOptions {
  // DOM 元素或选择器
  element: string | HTMLElement
  // 工具栏容器（可选）
  toolbarElement?: string | HTMLElement
  // 初始内容
  content?: string
  // 占位符
  placeholder?: string
  // 自动聚焦
  autofocus?: boolean
  // 高度
  height?: string
  // 更新回调
  onChange?: (html: string) => void
}

export class SimpleEditor {
  private editor: Editor
  private toolbar: Toolbar | null = null
  private container: HTMLElement

  constructor(options: SimpleEditorOptions) {
    // 获取容器元素
    if (typeof options.element === 'string') {
      const el = document.querySelector(options.element)
      if (!el) {
        throw new Error(`Element "${options.element}" not found`)
      }
      this.container = el as HTMLElement
    } else {
      this.container = options.element
    }

    // 创建编辑器容器结构
    this.container.innerHTML = ''
    this.container.classList.add('ldesign-simple-editor')

    // 创建工具栏容器
    const toolbarContainer = document.createElement('div')
    toolbarContainer.id = 'ldesign-toolbar'
    toolbarContainer.className = 'ldesign-toolbar-container'
    this.container.appendChild(toolbarContainer)

    // 创建编辑器内容容器
    const editorContainer = document.createElement('div')
    editorContainer.id = 'ldesign-editor'
    editorContainer.className = 'ldesign-editor-container'
    if (options.height) {
      editorContainer.style.height = options.height
    } else {
      editorContainer.style.minHeight = '300px'
    }
    this.container.appendChild(editorContainer)

    // 初始化编辑器（加载所有常用插件）
    this.editor = new Editor({
      element: editorContainer,
      content: options.content || '<p>开始输入内容...</p>',
      placeholder: options.placeholder || '在这里输入内容...',
      autofocus: options.autofocus !== false,
      onChange: options.onChange,
      // 加载所有常用插件
      plugins: [
        // 基础格式化
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        StrikePlugin,
        CodePlugin,
        ClearFormatPlugin,
        
        // 标题和块级元素
        HeadingPlugin,
        BlockquotePlugin,
        CodeBlockPlugin,
        
        // 列表
        BulletListPlugin,
        OrderedListPlugin,
        TaskListPlugin,
        
        // 节点插件
        LinkPlugin,
        ImagePlugin,
        TablePlugin,
        HorizontalRulePlugin,
        
        // 文本样式
        AlignPlugin,
        TextColorPlugin,
        BackgroundColorPlugin,
        FontSizePlugin,
        FontFamilyPlugin,
        SuperscriptPlugin,
        SubscriptPlugin,
        IndentPlugin,
        LineHeightPlugin,
        TextTransformPlugin,
        
        // 功能插件
        HistoryPlugin,
        FullscreenPlugin,
        FindReplacePlugin,
        WordCountPlugin,
        ExportMarkdownPlugin,
        ContextMenuPlugin
      ]
    })

    // 初始化工具栏（会自动从插件收集工具栏配置）
    this.toolbar = new Toolbar(this.editor, {
      container: toolbarContainer
      // 不指定 items，Toolbar 会自动从插件收集工具栏项
    })

    // 添加样式
    this.addStyles()
  }

  /**
   * 添加默认样式
   */
  private addStyles(): void {
    if (!document.getElementById('simple-editor-styles')) {
      const style = document.createElement('style')
      style.id = 'simple-editor-styles'
      style.textContent = `
        .ldesign-simple-editor {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .ldesign-toolbar-container {
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 8px;
        }

        .ldesign-editor-container {
          padding: 16px;
          overflow-y: auto;
        }

        .ldesign-editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
        }

        .ldesign-editor-toolbar-button {
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #475569;
        }

        .ldesign-editor-toolbar-button:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .ldesign-editor-toolbar-button.active {
          background: #3b82f6;
          color: white;
        }

        .ldesign-editor-toolbar-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ldesign-editor-toolbar-separator {
          width: 1px;
          height: 24px;
          background: #cbd5e1;
          margin: 0 4px;
        }

        .ldesign-editor-content {
          min-height: 200px;
          outline: none;
        }

        .ldesign-editor-content:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        /* 表格样式 */
        .ldesign-editor-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }

        .ldesign-editor-content table td,
        .ldesign-editor-content table th {
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
        }

        .ldesign-editor-content table th {
          background: #f8fafc;
          font-weight: 600;
        }

        /* 代码块样式 */
        .ldesign-editor-content pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 16px 0;
        }

        .ldesign-editor-content code {
          background: #f1f5f9;
          color: #e11d48;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', monospace;
        }

        .ldesign-editor-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        /* 引用样式 */
        .ldesign-editor-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin: 16px 0;
          color: #64748b;
          font-style: italic;
        }

        /* 链接样式 */
        .ldesign-editor-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .ldesign-editor-content a:hover {
          color: #2563eb;
        }

        /* 图片样式 */
        .ldesign-editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 16px 0;
        }

        /* 标题样式 */
        .ldesign-editor-content h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 24px 0 16px;
        }

        .ldesign-editor-content h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 20px 0 12px;
        }

        .ldesign-editor-content h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 16px 0 8px;
        }

        /* 列表样式 */
        .ldesign-editor-content ul,
        .ldesign-editor-content ol {
          padding-left: 24px;
          margin: 12px 0;
        }

        .ldesign-editor-content li {
          margin: 4px 0;
        }

        /* 水平线 */
        .ldesign-editor-content hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 24px 0;
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * 获取编辑器内容
   */
  getHTML(): string {
    return this.editor.getHTML()
  }

  /**
   * 设置编辑器内容
   */
  setHTML(html: string): void {
    this.editor.setHTML(html)
  }

  /**
   * 获取纯文本内容
   */
  getText(): string {
    const content = this.editor.getContent()
    const temp = document.createElement('div')
    temp.innerHTML = content
    return temp.textContent || ''
  }

  /**
   * 清空内容
   */
  clear(): void {
    this.editor.setHTML('')
  }

  /**
   * 聚焦编辑器
   */
  focus(): void {
    this.editor.focus()
  }

  /**
   * 失焦
   */
  blur(): void {
    this.editor.blur()
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.editor.destroy()
    if (this.toolbar) {
      this.toolbar.destroy()
    }
    this.container.innerHTML = ''
  }

  /**
   * 获取原始编辑器实例
   */
  getEditor(): Editor {
    return this.editor
  }

  /**
   * 获取工具栏实例
   */
  getToolbar(): Toolbar | null {
    return this.toolbar
  }
}

// 导出便捷创建函数
export function createSimpleEditor(options: SimpleEditorOptions): SimpleEditor {
  return new SimpleEditor(options)
}
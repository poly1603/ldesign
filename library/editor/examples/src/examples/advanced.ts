/**
 * 高级功能示例
 * 展示表格、自定义插件、协作等高级功能
 */

import { Editor, Toolbar, createPlugin } from '@/index'
import type { Plugin, Command } from '@/types'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  HeadingPlugin,
  BulletListPlugin,
  OrderedListPlugin,
  LinkPlugin,
  ImagePlugin,
  TablePlugin,
  AlignPlugin,
  HistoryPlugin,
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
  FindReplacePlugin
} from '@/plugins'
import '@/styles/editor.css'

export function renderAdvancedExample(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'example-container'

  // 头部
  const header = document.createElement('div')
  header.className = 'example-header'
  header.innerHTML = `
    <h1 class="example-title">高级功能示例</h1>
    <p class="example-description">
      展示富文本编辑器的高级功能，包括表格、查找替换、行高、文本转换等。
    </p>
    <span class="example-badge">高级功能</span>
  `
  container.appendChild(header)

  // 表格功能部分
  const tableSection = createTableSection()
  container.appendChild(tableSection)

  // 查找替换部分
  const findReplaceSection = createFindReplaceSection()
  container.appendChild(findReplaceSection)

  // 文本转换和行高部分
  const textFeaturesSection = createTextFeaturesSection()
  container.appendChild(textFeaturesSection)

  // 自定义插件部分
  const customPluginSection = createCustomPluginSection()
  container.appendChild(customPluginSection)

  // 快捷键部分
  const shortcutsSection = createShortcutsSection()
  container.appendChild(shortcutsSection)

  // 主题定制部分
  const themeSection = createThemeSection()
  container.appendChild(themeSection)

  return container
}

function createTableSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
    表格功能
  `
  section.appendChild(title)

  const description = document.createElement('p')
  description.className = 'section-description'
  description.textContent = '创建和编辑表格，支持添加行、添加列、删除表格等操作。'
  section.appendChild(description)

  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'editor-wrapper'

  const editorContainer = document.createElement('div')
  editorContainer.id = 'table-editor'
  editorWrapper.appendChild(editorContainer)

  section.appendChild(editorWrapper)

  setTimeout(() => {
    const editor = new Editor({
      element: editorContainer,
      content: `
        <h2>产品价格表</h2>
        <p>下面是我们的产品价格表：</p>
        <table>
          <thead>
            <tr>
              <th>产品名称</th>
              <th>价格</th>
              <th>库存</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>产品 A</td>
              <td>¥99</td>
              <td>100</td>
            </tr>
            <tr>
              <td>产品 B</td>
              <td>¥199</td>
              <td>50</td>
            </tr>
          </tbody>
        </table>
        <p>点击工具栏中的表格图标可以插入新表格。</p>
      `,
      plugins: [
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        HeadingPlugin,
        TablePlugin,
        TextColorPlugin,
        BackgroundColorPlugin,
        FontSizePlugin,
        FontFamilyPlugin,
        SuperscriptPlugin,
        SubscriptPlugin,
        HorizontalRulePlugin,
        IndentPlugin,
        FullscreenPlugin,
        AlignPlugin,
        HistoryPlugin
      ]
    })

    const toolbar = new Toolbar(editor, {})
    editorWrapper.insertBefore(toolbar.getElement(), editorContainer)

    ;(window as any).tableEditor = editor
  }, 200)

  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.innerHTML = `
    <button class="btn btn-primary" onclick="window.tableEditor?.commands.execute('insertTable')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
      插入表格
    </button>
    <button class="btn btn-secondary" onclick="window.tableEditor?.commands.execute('addTableRow')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      添加行
    </button>
    <button class="btn btn-secondary" onclick="window.tableEditor?.commands.execute('addTableColumn')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      添加列
    </button>
    <button class="btn btn-danger" onclick="window.tableEditor?.commands.execute('deleteTable')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
      </svg>
      删除表格
    </button>
  `
  section.appendChild(actions)

  return section
}

function createFindReplaceSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
    查找和替换
  `
  section.appendChild(title)

  const description = document.createElement('p')
  description.className = 'section-description'
  description.textContent = '强大的查找替换功能，支持正则表达式、区分大小写等选项。使用 Ctrl+F 快捷键快速打开。'
  section.appendChild(description)

  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'editor-wrapper'

  const editorContainer = document.createElement('div')
  editorContainer.id = 'find-replace-editor'
  editorWrapper.appendChild(editorContainer)

  section.appendChild(editorWrapper)

  setTimeout(() => {
    const editor = new Editor({
      element: editorContainer,
      content: `
        <h2>查找替换演示</h2>
        <p>这是一段示例文本。示例文本中包含多个<strong>示例</strong>关键词。</p>
        <p>您可以使用查找功能定位文本，使用替换功能批量修改内容。</p>
        <p>支持的功能：</p>
        <ul>
          <li>区分大小写匹配</li>
          <li>全字匹配</li>
          <li>正则表达式搜索</li>
          <li>单个替换和批量替换</li>
        </ul>
      `,
      plugins: [
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        HeadingPlugin,
        BulletListPlugin,
        FindReplacePlugin,
        HistoryPlugin
      ]
    })

    const toolbar = new Toolbar(editor, {})
    editorWrapper.insertBefore(toolbar.getElement(), editorContainer)

    ;(window as any).findReplaceEditor = editor
  }, 200)

  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.innerHTML = `
    <button class="btn btn-primary" onclick="window.findReplaceEditor?.commands.execute('openFindReplace')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      打开查找替换 (Ctrl+F)
    </button>
  `
  section.appendChild(actions)

  return section
}

function createTextFeaturesSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 7V4h16v3"/><path d="M9 20h6"/><line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
    文本格式化功能
  `
  section.appendChild(title)

  const description = document.createElement('p')
  description.className = 'section-description'
  description.textContent = '提供丰富的文本格式化选项，包括行高调整、大小写转换、全角半角转换等。'
  section.appendChild(description)

  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'editor-wrapper'

  const editorContainer = document.createElement('div')
  editorContainer.id = 'text-features-editor'
  editorWrapper.appendChild(editorContainer)

  section.appendChild(editorWrapper)

  setTimeout(() => {
    const editor = new Editor({
      element: editorContainer,
      content: `
        <h2>文本格式化示例</h2>
        <p style="line-height: 1.5">这是默认行高(1.5)的段落文本。您可以选中文本后使用行高工具调整段落的行间距。</p>
        <p style="line-height: 2.5">这是较大行高(2.5)的段落文本，行间距更宽松，适合阅读长文本。</p>
        <p>选中下面的文本，使用文本转换功能：</p>
        <ul>
          <li>hello world - 可以转换为大写、首字母大写等</li>
          <li>UPPERCASE TEXT - 可以转换为小写</li>
          <li>ＦｕｌｌＷｉｄｔｈ - 可以转换为半角</li>
          <li>half-width - 可以转换为全角</li>
        </ul>
      `,
      plugins: [
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        HeadingPlugin,
        BulletListPlugin,
        FontSizePlugin,
        FontFamilyPlugin,
        LineHeightPlugin,
        TextTransformPlugin,
        HistoryPlugin
      ]
    })

    const toolbar = new Toolbar(editor, {})
    editorWrapper.insertBefore(toolbar.getElement(), editorContainer)

    ;(window as any).textFeaturesEditor = editor
  }, 200)

  const features = document.createElement('div')
  features.className = 'features-grid'
  features.innerHTML = `
    <div class="feature-card">
      <h3>行高调整</h3>
      <p>支持 1.0 - 3.0 多种行高选项</p>
    </div>
    <div class="feature-card">
      <h3>大小写转换</h3>
      <p>大写、小写、首字母大写、句子大小写</p>
    </div>
    <div class="feature-card">
      <h3>全角半角</h3>
      <p>全角半角字符互相转换</p>
    </div>
    <div class="feature-card">
      <h3>字体样式</h3>
      <p>字体大小和字体家族选择</p>
    </div>
  `
  section.appendChild(features)

  return section
}

function createCustomPluginSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
    自定义插件
  `
  section.appendChild(title)

  const description = document.createElement('p')
  description.className = 'section-description'
  description.textContent = '演示如何创建自定义插件，添加表情符号和特殊字符。'
  section.appendChild(description)

  // 创建自定义插件
  const EmojiPlugin: Plugin = createPlugin({
    name: 'emoji',
    commands: {
      insertEmoji: (state, dispatch, emoji: string) => {
        if (!dispatch) return true
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return false

        const range = selection.getRangeAt(0)
        const textNode = document.createTextNode(emoji)
        range.insertNode(textNode)

        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection.removeAllRanges()
        selection.addRange(range)

        return true
      }
    }
  })

  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'editor-wrapper'

  const editorContainer = document.createElement('div')
  editorContainer.id = 'custom-editor'
  editorWrapper.appendChild(editorContainer)

  section.appendChild(editorWrapper)

  setTimeout(() => {
    const editor = new Editor({
      element: editorContainer,
      content: `
        <h2>表情和符号</h2>
        <p>点击下方按钮插入表情：😀 🎉 ❤️ 👍 🔥 ✨</p>
        <p>你也可以直接输入表情符号。</p>
      `,
      plugins: [
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        EmojiPlugin,
        HistoryPlugin
      ]
    })

    const toolbar = new Toolbar(editor, {})
    editorWrapper.insertBefore(toolbar.getElement(), editorContainer)

    ;(window as any).customEditor = editor
  }, 200)

  const emojis = [
    { emoji: '😀', name: '笑脸' },
    { emoji: '😍', name: '爱心眼' },
    { emoji: '🎉', name: '庆祝' },
    { emoji: '❤️', name: '爱心' },
    { emoji: '👍', name: '点赞' },
    { emoji: '🔥', name: '火焰' },
    { emoji: '✨', name: '闪光' },
    { emoji: '🚀', name: '火箭' },
    { emoji: '💡', name: '灯泡' },
    { emoji: '⭐', name: '星星' }
  ]

  const emojiGrid = document.createElement('div')
  emojiGrid.className = 'features-grid'
  emojiGrid.style.gridTemplateColumns = 'repeat(5, 1fr)'

  emojis.forEach(({ emoji, name }) => {
    const button = document.createElement('button')
    button.className = 'btn btn-secondary'
    button.style.fontSize = '24px'
    button.style.padding = '16px'
    button.title = name
    button.textContent = emoji
    button.onclick = () => {
      ;(window as any).customEditor?.commands.execute('insertEmoji', emoji)
    }
    emojiGrid.appendChild(button)
  })

  section.appendChild(emojiGrid)

  // 代码示例
  const codeBlock = document.createElement('div')
  codeBlock.className = 'code-block'
  codeBlock.style.marginTop = '20px'
  codeBlock.innerHTML = `
    <pre><code>import { createPlugin } from '@ldesign/editor'

// 创建自定义插件
const EmojiPlugin = createPlugin({
  name: 'emoji',
  commands: {
    insertEmoji: (state, dispatch, emoji) => {
      if (!dispatch) return true
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      const textNode = document.createTextNode(emoji)
      range.insertNode(textNode)

      return true
    }
  }
})

// 使用插件
const editor = new Editor({
  element: '#editor',
  plugins: [EmojiPlugin]
})

// 执行命令
editor.commands.execute('insertEmoji', '😀')</code></pre>
  `
  section.appendChild(codeBlock)

  return section
}

function createShortcutsSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
    </svg>
    快捷键参考
  `
  section.appendChild(title)

  const shortcuts = [
    { keys: 'Ctrl/Cmd + B', description: '加粗文本' },
    { keys: 'Ctrl/Cmd + I', description: '斜体文本' },
    { keys: 'Ctrl/Cmd + U', description: '下划线' },
    { keys: 'Ctrl/Cmd + Shift + X', description: '删除线' },
    { keys: 'Ctrl/Cmd + K', description: '插入链接' },
    { keys: 'Ctrl/Cmd + Z', description: '撤销' },
    { keys: 'Ctrl/Cmd + Shift + Z', description: '重做' },
    { keys: 'Ctrl/Cmd + \\', description: '清除格式' },
    { keys: 'Ctrl/Cmd + Alt + 1-6', description: '设置标题 1-6' },
    { keys: 'Ctrl/Cmd + Shift + 7', description: '有序列表' },
    { keys: 'Ctrl/Cmd + Shift + 8', description: '无序列表' },
    { keys: 'Ctrl/Cmd + Shift + B', description: '引用块' }
  ]

  const table = document.createElement('table')
  table.style.width = '100%'
  table.style.borderCollapse = 'collapse'

  const thead = document.createElement('thead')
  thead.innerHTML = `
    <tr>
      <th style="text-align: left; padding: 12px; border-bottom: 2px solid var(--border-color); font-weight: 600;">快捷键</th>
      <th style="text-align: left; padding: 12px; border-bottom: 2px solid var(--border-color); font-weight: 600;">功能说明</th>
    </tr>
  `
  table.appendChild(thead)

  const tbody = document.createElement('tbody')
  shortcuts.forEach(({ keys, description }) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td style="padding: 12px; border-bottom: 1px solid var(--border-color);">
        <code style="background: var(--bg-tertiary); padding: 4px 8px; border-radius: 4px; font-size: 13px;">${keys}</code>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">${description}</td>
    `
    tbody.appendChild(tr)
  })
  table.appendChild(tbody)

  section.appendChild(table)

  return section
}

function createThemeSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
    主题定制
  `
  section.appendChild(title)

  const description = document.createElement('p')
  description.className = 'section-description'
  description.textContent = '编辑器支持暗色主题和自定义样式。点击下方按钮切换主题。'
  section.appendChild(description)

  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'editor-wrapper'
  editorWrapper.id = 'theme-editor-wrapper'

  const editorContainer = document.createElement('div')
  editorContainer.id = 'theme-editor'
  editorWrapper.appendChild(editorContainer)

  section.appendChild(editorWrapper)

  setTimeout(() => {
    const editor = new Editor({
      element: editorContainer,
      content: `
        <h2>主题演示</h2>
        <p>这个编辑器支持<strong>亮色</strong>和<strong>暗色</strong>两种主题。</p>
        <p>你可以根据需要切换主题，提供更好的视觉体验。</p>
        <ul>
          <li>默认亮色主题</li>
          <li>暗色主题</li>
          <li>自定义主题</li>
        </ul>
      `,
      plugins: [
        BoldPlugin,
        ItalicPlugin,
        HeadingPlugin,
        BulletListPlugin,
        HistoryPlugin
      ]
    })

    const toolbar = new Toolbar(editor, {})
    editorWrapper.insertBefore(toolbar.getElement(), editorContainer)

    ;(window as any).themeEditor = editor
  }, 200)

  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.innerHTML = `
    <button class="btn btn-primary" onclick="toggleTheme('light')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      </svg>
      亮色主题
    </button>
    <button class="btn btn-primary" onclick="toggleTheme('dark')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      暗色主题
    </button>
  `
  section.appendChild(actions)

  // 主题切换函数
  ;(window as any).toggleTheme = (theme: 'light' | 'dark') => {
    const wrapper = document.getElementById('theme-editor-wrapper')
    const editorEl = wrapper?.querySelector('.ldesign-editor')
    if (editorEl) {
      if (theme === 'dark') {
        editorEl.classList.add('dark')
      } else {
        editorEl.classList.remove('dark')
      }
    }
  }

  return section
}

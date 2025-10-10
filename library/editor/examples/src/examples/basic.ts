/**
 * 基础示例 - 原生 JavaScript + TypeScript
 */

import { Editor, Toolbar } from '@/index'
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
  BlockquotePlugin,
  CodeBlockPlugin,
  LinkPlugin,
  ImagePlugin,
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
  FullscreenPlugin
} from '@/plugins'
import '@/styles/editor.css'

export function renderBasicExample(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'example-container'

  // 头部
  const header = document.createElement('div')
  header.className = 'example-header'
  header.innerHTML = `
    <h1 class="example-title">基础示例</h1>
    <p class="example-description">
      使用原生 JavaScript + TypeScript 创建富文本编辑器，支持所有常见的文本格式化功能。
    </p>
    <span class="example-badge">原生 JavaScript</span>
  `
  container.appendChild(header)

  // 编辑器部分
  const editorSection = createEditorSection()
  container.appendChild(editorSection)

  // 功能演示部分
  const featuresSection = createFeaturesSection()
  container.appendChild(featuresSection)

  // 代码示例部分
  const codeSection = createCodeSection()
  container.appendChild(codeSection)

  return container
}

function createEditorSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
    富文本编辑器
  `
  section.appendChild(title)

  const description = document.createElement('p')
  description.className = 'section-description'
  description.textContent = '体验完整的富文本编辑功能，包括文本格式化、列表、链接、图片等。试试使用快捷键，如 Ctrl/Cmd + B 加粗文本。'
  section.appendChild(description)

  // 编辑器容器
  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'editor-wrapper'

  const editorContainer = document.createElement('div')
  editorContainer.id = 'basic-editor'
  editorWrapper.appendChild(editorContainer)

  section.appendChild(editorWrapper)

  // 初始化编辑器
  setTimeout(() => {
    const editor = new Editor({
      element: editorContainer,
      content: `
        <h1>欢迎使用 @ldesign/editor</h1>
        <p>这是一个功能强大的富文本编辑器，支持多种文本格式和功能。</p>

        <h2>支持的功能</h2>
        <p>你可以使用以下格式：<strong>粗体</strong>、<em>斜体</em>、<u>下划线</u>、<s>删除线</s>、<code>代码</code>。</p>

        <h3>列表支持</h3>
        <ul>
          <li>无序列表项 1</li>
          <li>无序列表项 2</li>
          <li>无序列表项 3</li>
        </ul>

        <ol>
          <li>有序列表项 1</li>
          <li>有序列表项 2</li>
          <li>有序列表项 3</li>
        </ol>

        <h3>引用</h3>
        <blockquote>
          这是一段引用文字。富文本编辑器让内容创作变得简单高效。
        </blockquote>

        <h3>代码块</h3>
        <pre><code>function greet(name) {
  console.log(\`Hello, \${name}!\`)
}

greet('World')</code></pre>

        <h3>链接</h3>
        <p>访问 <a href="https://github.com">GitHub</a> 了解更多信息。</p>

        <h3>新增功能</h3>
        <p>我们新增了多项强大功能：</p>
        <ul>
          <li><span style="color: #e74c3c;">文字颜色</span>和<span style="background-color: #f1c40f;">背景高亮</span></li>
          <li><span style="font-size: 24px;">字体大小</span>和<span style="font-family: 'Times New Roman', serif;">字体家族</span></li>
          <li>上标（x<sup>2</sup>）和下标（H<sub>2</sub>O）</li>
          <li>水平线分隔符</li>
          <li>文本缩进功能</li>
          <li>全屏编辑模式（按 F11）</li>
        </ul>
        <hr>

        <p>试试选中文字并使用工具栏按钮或快捷键来格式化文本！</p>
      `,
      placeholder: '开始编写你的内容...',
      plugins: [
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        StrikePlugin,
        CodePlugin,
        ClearFormatPlugin,
        HeadingPlugin,
        BulletListPlugin,
        OrderedListPlugin,
        BlockquotePlugin,
        CodeBlockPlugin,
        LinkPlugin,
        ImagePlugin,
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
        FullscreenPlugin
      ],
      onChange: (content) => {
        updateOutput('html-output', content)
      },
      onUpdate: (state) => {
        updateOutput('json-output', JSON.stringify(state.doc, null, 2))
      }
    })

    // 创建工具栏
    const toolbar = new Toolbar(editor, {})
    editorWrapper.insertBefore(toolbar.getElement(), editorContainer)

    // 存储编辑器实例供按钮使用
    ;(window as any).basicEditor = editor
  }, 100)

  // 操作按钮
  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.innerHTML = `
    <button class="btn btn-primary" onclick="window.basicEditor?.focus()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      聚焦编辑器
    </button>
    <button class="btn btn-secondary" onclick="getBasicContent()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
      获取 HTML
    </button>
    <button class="btn btn-secondary" onclick="getBasicJSON()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      获取 JSON
    </button>
    <button class="btn btn-danger" onclick="window.basicEditor?.clear()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
      清空内容
    </button>
  `
  section.appendChild(actions)

  // 输出区域（标签页）
  const tabs = document.createElement('div')
  tabs.className = 'tabs'
  tabs.innerHTML = `
    <button class="tab active" data-tab="html">HTML 输出</button>
    <button class="tab" data-tab="json">JSON 输出</button>
  `
  section.appendChild(tabs)

  // HTML 输出
  const htmlOutput = document.createElement('div')
  htmlOutput.className = 'output tab-content active'
  htmlOutput.innerHTML = `
    <div class="output-title">HTML 代码</div>
    <pre id="html-output"></pre>
  `
  section.appendChild(htmlOutput)

  // JSON 输出
  const jsonOutput = document.createElement('div')
  jsonOutput.className = 'output tab-content'
  jsonOutput.innerHTML = `
    <div class="output-title">JSON 数据</div>
    <pre id="json-output"></pre>
  `
  section.appendChild(jsonOutput)

  // 标签页切换
  tabs.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = (tab as HTMLElement).dataset.tab
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      section.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
      section.querySelector(`.tab-content:nth-of-type(${tabName === 'html' ? '3' : '4'})`)?.classList.add('active')
    })
  })

  // 全局函数
  ;(window as any).getBasicContent = () => {
    const editor = (window as any).basicEditor
    if (editor) {
      updateOutput('html-output', editor.getHTML())
      // 切换到 HTML 标签页
      tabs.querySelector('[data-tab="html"]')?.dispatchEvent(new Event('click'))
    }
  }

  ;(window as any).getBasicJSON = () => {
    const editor = (window as any).basicEditor
    if (editor) {
      updateOutput('json-output', JSON.stringify(editor.getJSON(), null, 2))
      // 切换到 JSON 标签页
      tabs.querySelector('[data-tab="json"]')?.dispatchEvent(new Event('click'))
    }
  }

  return section
}

function createFeaturesSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v20M2 12h20"/>
    </svg>
    功能特性
  `
  section.appendChild(title)

  const features = document.createElement('div')
  features.className = 'features-grid'
  features.innerHTML = `
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
      </div>
      <div class="feature-title">文本格式化</div>
      <div class="feature-description">支持粗体、斜体、下划线、删除线等基础文本格式</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7h16M4 12h16M4 17h10"/>
        </svg>
      </div>
      <div class="feature-title">列表支持</div>
      <div class="feature-description">创建有序列表、无序列表和任务列表</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        </svg>
      </div>
      <div class="feature-title">链接和图片</div>
      <div class="feature-description">插入链接和图片，支持图片上传</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </div>
      <div class="feature-title">代码块</div>
      <div class="feature-description">支持插入和编辑代码块</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="feature-title">引用块</div>
      <div class="feature-description">创建引用块来强调重要内容</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
      </div>
      <div class="feature-title">历史记录</div>
      <div class="feature-description">支持撤销和重做操作</div>
    </div>
  `
  section.appendChild(features)

  return section
}

function createCodeSection(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'example-section'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
    代码示例
  `
  section.appendChild(title)

  const description = document.createElement('p')
  description.className = 'section-description'
  description.textContent = '以下是创建此编辑器的完整代码：'
  section.appendChild(description)

  const codeBlock = document.createElement('div')
  codeBlock.className = 'code-block'
  codeBlock.innerHTML = `
    <pre><code>import { Editor, Toolbar } from '@ldesign/editor'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  HeadingPlugin,
  LinkPlugin
} from '@ldesign/editor'
import '@ldesign/editor/style.css'

// 创建编辑器
const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>',
  placeholder: '开始编写...',
  plugins: [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    HeadingPlugin,
    LinkPlugin
  ],
  onChange: (content) => {
    console.log('内容变化:', content)
  }
})

// 创建工具栏
const toolbar = new Toolbar(editor, {
  container: document.getElementById('toolbar')
})</code></pre>
  `
  section.appendChild(codeBlock)

  return section
}

function updateOutput(id: string, content: string): void {
  const output = document.getElementById(id)
  if (output) {
    output.textContent = content
  }
}

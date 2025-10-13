/**
 * React 示例
 */

import React, { useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { RichEditor, useEditor } from '@/adapters/react'
import type { RichEditorRef } from '@/adapters/react'
import { BoldPlugin, ItalicPlugin, UnderlinePlugin, HeadingPlugin, LinkPlugin, ImagePlugin, BulletListPlugin, OrderedListPlugin, HistoryPlugin } from '@/plugins'
import '@/styles/editor.css'

const ReactExample: React.FC = () => {
  const [content, setContent] = useState(`
    <h1>React 编辑器示例</h1>
    <p>这是使用 <strong>React 18</strong> 和 <strong>Hooks</strong> 创建的富文本编辑器。</p>

    <h2>特性</h2>
    <ul>
      <li>组件化开发</li>
      <li>Hooks API</li>
      <li>TypeScript 支持</li>
      <li>高性能渲染</li>
    </ul>

    <p>试试编辑这段文字，体验 React 的高效更新机制！</p>
  `)

  const editorRef = useRef<RichEditorRef>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'html' | 'json'>('editor')

  const plugins = [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    HeadingPlugin,
    LinkPlugin,
    ImagePlugin,
    BulletListPlugin,
    OrderedListPlugin,
    HistoryPlugin
  ]

  const wordCount = content.replace(/<[^>]*>/g, '').trim().length

  const handleUpdate = (state: any) => {
    console.log('编辑器更新:', state)
  }

  const clearContent = () => {
    setContent('<p></p>')
  }

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const setTemplate = (template: string) => {
    const templates: Record<string, string> = {
      article: `
        <h1>文章标题</h1>
        <p>在这里开始编写你的文章...</p>
        <h2>小节标题</h2>
        <p>文章内容段落。</p>
      `,
      list: `
        <h2>待办事项</h2>
        <ul>
          <li>任务 1</li>
          <li>任务 2</li>
          <li>任务 3</li>
        </ul>
      `,
      code: `
        <h2>代码文档</h2>
        <p>这是一段代码示例：</p>
        <pre><code>function example() {
  console.log('Hello')
}</code></pre>
      `
    }
    setContent(templates[template] || templates.article)
  }

  return (
    <div className="example-container">
      <div className="example-header">
        <h1 className="example-title">React 示例</h1>
        <p className="example-description">
          使用 React 18 Hooks 和组件化开发，享受高效的渲染性能。
        </p>
        <span className="example-badge">React 18 + Hooks</span>
      </div>

      <div className="example-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          React 编辑器组件
        </h2>
        <p className="section-description">
          使用受控组件模式，实时更新内容。当前字数：<strong>{wordCount}</strong> 个字符
        </p>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            编辑器
          </button>
          <button
            className={`tab ${activeTab === 'html' ? 'active' : ''}`}
            onClick={() => setActiveTab('html')}
          >
            HTML 预览
          </button>
          <button
            className={`tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            JSON 数据
          </button>
        </div>

        {activeTab === 'editor' && (
          <div className="editor-wrapper">
            <RichEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              plugins={plugins}
              showToolbar={true}
              placeholder="开始编写..."
              onUpdate={handleUpdate}
            />
          </div>
        )}

        {activeTab === 'html' && (
          <div className="output">
            <div className="output-title">HTML 输出</div>
            <pre>{content}</pre>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="output">
            <div className="output-title">JSON 数据</div>
            <pre>{JSON.stringify({ content }, null, 2)}</pre>
          </div>
        )}

        <div className="actions">
          <button className="btn btn-primary" onClick={focusEditor}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            聚焦编辑器
          </button>
          <button className="btn btn-primary" onClick={() => setTemplate('article')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            文章模板
          </button>
          <button className="btn btn-secondary" onClick={() => setTemplate('list')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            </svg>
            列表模板
          </button>
          <button className="btn btn-danger" onClick={clearContent}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
            </svg>
            清空
          </button>
        </div>
      </div>

      <div className="example-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          代码示例
        </h2>
        <p className="section-description">在 React 中使用编辑器：</p>
        <div className="code-block">
          <pre><code>{`import { useState } from 'react'
import { RichEditor } from '@ldesign/editor/react'
import { BoldPlugin, ItalicPlugin } from '@ldesign/editor'
import '@ldesign/editor/style.css'

function App() {
  const [content, setContent] = useState('<p>Hello World!</p>')

  return (
    <RichEditor
      value={content}
      onChange={setContent}
      plugins={[BoldPlugin, ItalicPlugin]}
      showToolbar={true}
      placeholder="开始编写..."
      onUpdate={(state) => {
        console.log('更新:', state)
      }}
    />
  )
}`}</code></pre>
        </div>
      </div>

      <div className="example-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          使用 Ref
        </h2>
        <p className="section-description">通过 ref 访问编辑器方法：</p>
        <div className="code-block">
          <pre><code>{`import { useRef } from 'react'
import { RichEditor } from '@ldesign/editor/react'
import type { RichEditorRef } from '@ldesign/editor/react'

function App() {
  const editorRef = useRef<RichEditorRef>(null)

  const handleFocus = () => {
    editorRef.current?.focus()
  }

  const handleClear = () => {
    editorRef.current?.clear()
  }

  return (
    <>
      <RichEditor ref={editorRef} />
      <button onClick={handleFocus}>聚焦</button>
      <button onClick={handleClear}>清空</button>
    </>
  )
}`}</code></pre>
        </div>
      </div>
    </div>
  )
}

export function renderReactExample(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'react-example-root'
  container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; min-height: 400px; color: #999;">正在加载 React 编辑器...</div>'

  // 渲染 React 应用
  // 使用 requestAnimationFrame 保持一致的初始化时机
  requestAnimationFrame(() => {
    container.innerHTML = '' // 清除加载提示
    const root = createRoot(container)
    root.render(<ReactExample />);
  })

  return container
}

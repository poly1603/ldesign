/**
 * React 适配器
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Editor } from '../../core/Editor'
import { Toolbar } from '../../ui/Toolbar'
import type { EditorOptions, Plugin, EditorState } from '../../types'

export interface RichEditorProps {
  value?: string
  onChange?: (content: string) => void
  onUpdate?: (state: EditorState) => void
  onFocus?: () => void
  onBlur?: () => void
  plugins?: (Plugin | string)[]
  editable?: boolean
  autofocus?: boolean
  placeholder?: string
  showToolbar?: boolean
  className?: string
  style?: React.CSSProperties
}

export interface RichEditorRef {
  getEditor: () => Editor | null
  focus: () => void
  blur: () => void
  clear: () => void
  getHTML: () => string
  setHTML: (html: string) => void
  getJSON: () => any
  setJSON: (json: any) => void
}

/**
 * React 富文本编辑器组件
 */
export const RichEditor = forwardRef<RichEditorRef, RichEditorProps>((props, ref) => {
  const {
    value = '',
    onChange,
    onUpdate,
    onFocus,
    onBlur,
    plugins = [],
    editable = true,
    autofocus = false,
    placeholder = '请输入内容...',
    showToolbar = true,
    className = '',
    style
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarContainerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Editor>()
  const toolbarRef = useRef<Toolbar>()

  // 初始化编辑器
  useEffect(() => {
    if (!containerRef.current) return

    const options: EditorOptions = {
      element: containerRef.current,
      content: value,
      plugins,
      editable,
      autofocus,
      placeholder,
      onChange,
      onUpdate,
      onFocus,
      onBlur
    }

    editorRef.current = new Editor(options)

    // 创建工具栏
    if (showToolbar && toolbarContainerRef.current && editorRef.current) {
      toolbarRef.current = new Toolbar(editorRef.current, {
        container: toolbarContainerRef.current
      })
    }

    // 清理
    return () => {
      toolbarRef.current?.destroy()
      editorRef.current?.destroy()
    }
  }, [])

  // 监听内容变化
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getHTML()) {
      editorRef.current.setHTML(value || '')
    }
  }, [value])

  // 监听可编辑状态
  useEffect(() => {
    editorRef.current?.setEditable(editable)
  }, [editable])

  // 暴露方法
  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current || null,
    focus: () => editorRef.current?.focus(),
    blur: () => editorRef.current?.blur(),
    clear: () => editorRef.current?.clear(),
    getHTML: () => editorRef.current?.getHTML() || '',
    setHTML: (html: string) => editorRef.current?.setHTML(html),
    getJSON: () => editorRef.current?.getJSON(),
    setJSON: (json: any) => editorRef.current?.setJSON(json)
  }))

  return (
    <div className={`ldesign-editor-wrapper ${className}`} style={style}>
      {showToolbar && <div ref={toolbarContainerRef} />}
      <div ref={containerRef} />
    </div>
  )
})

RichEditor.displayName = 'RichEditor'

/**
 * React Hook
 */
export function useEditor(options: EditorOptions = {}) {
  const editorRef = useRef<Editor>()
  const [content, setContent] = React.useState(options.content as string || '')

  const init = (element: HTMLElement | string) => {
    editorRef.current = new Editor({
      ...options,
      element,
      onChange: (html) => {
        setContent(html)
        options.onChange?.(html)
      }
    })
  }

  const destroy = () => {
    editorRef.current?.destroy()
  }

  useEffect(() => {
    return () => {
      destroy()
    }
  }, [])

  return {
    editor: editorRef.current,
    content,
    init,
    destroy,
    focus: () => editorRef.current?.focus(),
    blur: () => editorRef.current?.blur(),
    clear: () => editorRef.current?.clear(),
    getHTML: () => editorRef.current?.getHTML(),
    setHTML: (html: string) => editorRef.current?.setHTML(html),
    getJSON: () => editorRef.current?.getJSON(),
    setJSON: (json: any) => editorRef.current?.setJSON(json)
  }
}

// 导出
export default RichEditor

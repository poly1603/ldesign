/**
 * 默认工具栏配置
 * 包含所有常用的编辑器功能按钮
 */

import type { ToolbarItem } from '../types'

/**
 * 创建执行命令的函数
 */
function execCommand(command: string, value?: string | boolean) {
  return () => {
    document.execCommand(command, false, value as any)
    return true
  }
}

/**
 * 检查命令状态
 */
function isCommandActive(command: string) {
  return () => document.queryCommandState(command)
}

/**
 * 默认工具栏配置
 */
export const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  // 历史操作
  {
    name: 'undo',
    title: '撤销 (Ctrl+Z)',
    icon: 'undo',
    command: execCommand('undo'),
  },
  {
    name: 'redo',
    title: '重做 (Ctrl+Y)',
    icon: 'redo',
    command: execCommand('redo'),
  },
  
  // 文本格式
  {
    name: 'bold',
    title: '粗体 (Ctrl+B)',
    icon: 'bold',
    command: execCommand('bold'),
    active: isCommandActive('bold'),
  },
  {
    name: 'italic',
    title: '斜体 (Ctrl+I)',
    icon: 'italic',
    command: execCommand('italic'),
    active: isCommandActive('italic'),
  },
  {
    name: 'underline',
    title: '下划线 (Ctrl+U)',
    icon: 'underline',
    command: execCommand('underline'),
    active: isCommandActive('underline'),
  },
  {
    name: 'strike',
    title: '删除线',
    icon: 'strikethrough',
    command: execCommand('strikeThrough'),
    active: isCommandActive('strikeThrough'),
  },
  {
    name: 'inlineCode',
    title: '行内代码 (Ctrl+`)',
    icon: 'code',
    command: () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      
      const range = selection.getRangeAt(0)
      const text = range.toString()
      
      if (text) {
        // 检查是否已经是代码
        const parent = range.commonAncestorContainer.parentElement
        if (parent && parent.tagName === 'CODE') {
          // 移除代码标记
          const textNode = document.createTextNode(text)
          parent.parentNode?.replaceChild(textNode, parent)
        } else {
          // 添加代码标记
          document.execCommand('insertHTML', false, `<code style="padding: 2px 4px; margin: 0 2px; background-color: rgba(135, 131, 120, 0.15); border-radius: 3px; font-size: 85%; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">${text}</code>`)
        }
      }
      return true
    },
    active: () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      const parent = selection.getRangeAt(0).commonAncestorContainer.parentElement
      return parent?.tagName === 'CODE'
    },
  },
  {
    name: 'superscript',
    title: '上标',
    icon: 'superscript',
    command: execCommand('superscript'),
    active: isCommandActive('superscript'),
  },
  {
    name: 'subscript',
    title: '下标',
    icon: 'subscript',
    command: execCommand('subscript'),
    active: isCommandActive('subscript'),
  },
  
  // 标题（下拉）
  {
    name: 'heading',
    title: '标题/正文',
    icon: 'heading-1',
    // 由 Toolbar.ts 以下拉方式处理
    command: () => true,
  },
  
  // 引用和代码块
  {
    name: 'blockquote',
    title: '引用',
    icon: 'quote',
    command: execCommand('formatBlock', '<blockquote>'),
  },
  {
    name: 'codeblock',
    title: '代码块',
    icon: 'code-2',
    command: 'insertCodeBlock', // 使用插件命令
  },
  
  // 列表
  {
    name: 'bulletList',
    title: '无序列表',
    icon: 'list',
    command: execCommand('insertUnorderedList'),
    active: isCommandActive('insertUnorderedList'),
  },
  {
    name: 'orderedList',
    title: '有序列表',
    icon: 'list-ordered',
    command: execCommand('insertOrderedList'),
    active: isCommandActive('insertOrderedList'),
  },
  {
    name: 'taskList',
    title: '任务列表',
    icon: 'list-checks',
    command: () => {
      const html = '<ul><li><input type="checkbox"> 任务项</li></ul>'
      document.execCommand('insertHTML', false, html)
      return true
    },
  },
  
  // 缩进
  {
    name: 'outdent',
    title: '减少缩进',
    icon: 'indent-decrease',
    command: execCommand('outdent'),
  },
  {
    name: 'indent',
    title: '增加缩进',
    icon: 'indent-increase',
    command: execCommand('indent'),
  },
  
  // 对齐（下拉）
  {
    name: 'align',
    title: '对齐方式',
    icon: 'align-left',
    // 由 Toolbar.ts 以下拉方式处理
    command: () => true,
  },
  
  // 插入
  {
    name: 'emoji',
    title: '插入表情',
    icon: 'emoji',
    command: 'insertEmoji', // 使用命令名称，由EmojiPlugin处理
  },
  {
    name: 'link',
    title: '插入链接',
    icon: 'link',
    command: () => {
      const url = prompt('请输入链接地址:')
      if (url) {
        document.execCommand('createLink', false, url)
      }
      return true
    },
  },
  {
    name: 'unlink',
    title: '移除链接',
    icon: 'unlink',
    command: execCommand('unlink'),
  },
  {
    name: 'image',
    title: '插入图片',
    icon: 'image',
    command: 'insertImage', // 使用命令名称，由MediaDialogPlugin处理
  },
  {
    name: 'video',
    title: '插入视频',
    icon: 'video',
    command: 'insertVideo', // 使用命令名称，由MediaDialogPlugin处理
  },
  {
    name: 'audio',
    title: '插入音频',
    icon: 'audio',
    command: 'insertAudio', // 使用命令名称，由MediaDialogPlugin处理
  },
  {
    name: 'file',
    title: '插入文件',
    icon: 'file',
    command: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const fileUrl = URL.createObjectURL(file)
          const fileSize = (file.size / 1024).toFixed(2) // KB
          const fileHtml = `
            <a href="${fileUrl}" download="${file.name}" style="display: inline-flex; align-items: center; padding: 8px 12px; background: #f3f4f6; border-radius: 6px; text-decoration: none; color: #374151;">
              <svg style="margin-right: 8px; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>${file.name}</span>
              <span style="margin-left: 8px; color: #6b7280; font-size: 0.875em;">(${fileSize} KB)</span>
            </a>
          `
          document.execCommand('insertHTML', false, fileHtml)
        }
      }
      input.click()
      return true
    },
  },
  {
    name: 'table',
    title: '插入表格',
    icon: 'table',
    command: 'insertTable', // 使用命令名称，由 TablePlugin 处理
  },
  {
    name: 'horizontalRule',
    title: '水平线',
    icon: 'minus',
    command: execCommand('insertHorizontalRule'),
  },
  
  // 字体
  {
    name: 'fontSize',
    title: '字体大小',
    icon: 'type',
    command: () => true, // 由 Toolbar.ts 特殊处理
  },
  {
    name: 'fontFamily',
    title: '字体',
    icon: 'a-large-small',
    command: () => true, // 由 Toolbar.ts 特殊处理
  },
  
  // 颜色
  {
    name: 'textColor',
    title: '文字颜色',
    icon: 'palette',
    command: () => {
      const color = prompt('请输入颜色值 (如: #ff0000 或 red):')
      if (color) {
        document.execCommand('foreColor', false, color)
      }
      return true
    },
  },
  {
    name: 'backgroundColor',
    title: '背景颜色',
    icon: 'paint-bucket',
    command: () => {
      const color = prompt('请输入颜色值 (如: #ffff00 或 yellow):')
      if (color) {
        document.execCommand('hiliteColor', false, color)
      }
      return true
    },
  },
  
  // 清除格式
  {
    name: 'removeFormat',
    title: '清除格式',
    icon: 'eraser',
    command: execCommand('removeFormat'),
  },
  
  // 全屏
  {
    name: 'fullscreen',
    title: '全屏',
    icon: 'maximize',
    command: () => {
      const editor = document.querySelector('.ldesign-editor')
      if (editor) {
        editor.classList.toggle('fullscreen')
        
        // 添加全屏样式
        if (!document.getElementById('fullscreen-style')) {
          const style = document.createElement('style')
          style.id = 'fullscreen-style'
          style.textContent = `
            .ldesign-editor.fullscreen {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              height: 100% !important;
              z-index: 9999 !important;
              background: white !important;
            }
            .ldesign-editor.fullscreen .ldesign-editor-content {
              height: calc(100vh - 60px) !important;
              overflow-y: auto !important;
            }
          `
          document.head.appendChild(style)
        }
      }
      return true
    },
  },
  
  // 查找替换
  {
    name: 'search',
    title: '查找',
    icon: 'search',
    command: () => {
      console.log('[Search] Button clicked, showing find dialog')
      // 使用全局函数打开查找对话框
      if ((window as any).openFindDialog) {
        (window as any).openFindDialog()
      } else {
        // 动态导入查找替换对话框
        import('../plugins/utils/find-replace').then(module => {
          if (module.showFindReplaceDialog) {
            console.log('[Search] Calling showFindReplaceDialog')
            // 传递 editor 对象到查找替换对话框
            module.showFindReplaceDialog((window as any).editor)
          }
        }).catch(err => {
          console.error('[Search] Failed to load find-replace module:', err)
          // 备用方案：使用简单的 prompt
          const text = prompt('查找内容:')
          if (text && (window as any).find) {
            (window as any).find(text)
          }
        })
      }
      return true
    },
  },
  
  // AI 功能下拉菜单
  {
    name: 'ai',
    title: 'AI 助手',
    icon: 'sparkles',
    command: () => true, // 由 Toolbar.ts 以下拉方式处理
  },
  
  // 字数统计
  {
    name: 'wordCount',
    title: '字数统计',
    icon: 'file-text',
    command: () => {
      // 获取编辑器内容
      const editorContent = document.querySelector('.ldesign-editor-content')
      if (!editorContent) return false
      
      const text = editorContent.textContent || ''
      
      // 统计字数
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const characters = text.length
      const charactersNoSpaces = text.replace(/\s/g, '').length
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length
      const lines = text.split('\n').length
      
      // 创建弹窗显示统计结果
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `
      
      const dialog = document.createElement('div')
      dialog.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 24px;
        min-width: 300px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      `
      
      dialog.innerHTML = `
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          字数统计
        </h3>
        <div style="line-height: 1.8;">
          <div><strong>字数：</strong> ${words}</div>
          <div><strong>字符（含空格）：</strong> ${characters}</div>
          <div><strong>字符（不含空格）：</strong> ${charactersNoSpaces}</div>
          <div><strong>段落数：</strong> ${paragraphs}</div>
          <div><strong>行数：</strong> ${lines}</div>
        </div>
        <button style="
          margin-top: 20px;
          padding: 8px 16px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
        " onclick="this.closest('div').parentElement.remove()">关闭</button>
      `
      
      overlay.appendChild(dialog)
      document.body.appendChild(overlay)
      
      // 点击遮罩层关闭
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove()
        }
      })
      
      return true
    },
  },
]

/**
 * 分组的工具栏配置
 */
export const TOOLBAR_GROUPS = {
  history: ['undo', 'redo'],
  format: ['bold', 'italic', 'underline', 'strike', 'inlineCode', 'superscript', 'subscript'],
  heading: ['heading'],
  block: ['blockquote', 'codeblock'],
  list: ['bulletList', 'orderedList', 'taskList'],
  indent: ['outdent', 'indent'],
  align: ['align'],
  insert: ['emoji', 'link', 'unlink', 'image', 'video', 'audio', 'file', 'table', 'horizontalRule'],
  font: ['fontSize', 'fontFamily'],
  color: ['textColor', 'backgroundColor'],
  ai: ['ai'], // AI功能下拉菜单
  tools: ['removeFormat', 'fullscreen', 'search', 'wordCount'],
}

/**
 * 获取带分隔符的工具栏项
 */
export function getToolbarItemsWithSeparators(): ToolbarItem[] {
  const result: ToolbarItem[] = []
  const groups = Object.values(TOOLBAR_GROUPS)
  
  groups.forEach((group, index) => {
    group.forEach(name => {
      const item = DEFAULT_TOOLBAR_ITEMS.find(i => i.name === name)
      if (item) {
        result.push(item)
      }
    })
    
    // 在组之间添加分隔符（最后一组除外）
    if (index < groups.length - 1) {
      result.push({
        name: `separator-${index}`,
        title: '',
        icon: '',
        command: () => true,
        isSeparator: true,
      } as any)
    }
  })
  
  return result
}
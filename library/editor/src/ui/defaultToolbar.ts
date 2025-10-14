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
    name: 'code',
    title: '行内代码',
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
          document.execCommand('insertHTML', false, `<code>${text}</code>`)
        }
      }
      return true
    },
  },
  
  // 标题
  {
    name: 'heading1',
    title: '标题 1',
    icon: 'heading-1',
    command: execCommand('formatBlock', '<h1>'),
  },
  {
    name: 'heading2',
    title: '标题 2',
    icon: 'heading-2',
    command: execCommand('formatBlock', '<h2>'),
  },
  {
    name: 'heading3',
    title: '标题 3',
    icon: 'heading-3',
    command: execCommand('formatBlock', '<h3>'),
  },
  {
    name: 'paragraph',
    title: '正文',
    icon: 'pilcrow',
    command: execCommand('formatBlock', '<p>'),
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
    command: () => {
      document.execCommand('insertHTML', false, '<pre><code>// 在这里输入代码</code></pre>')
      return true
    },
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
  
  // 对齐
  {
    name: 'alignLeft',
    title: '左对齐',
    icon: 'align-left',
    command: execCommand('justifyLeft'),
    active: isCommandActive('justifyLeft'),
  },
  {
    name: 'alignCenter',
    title: '居中',
    icon: 'align-center',
    command: execCommand('justifyCenter'),
    active: isCommandActive('justifyCenter'),
  },
  {
    name: 'alignRight',
    title: '右对齐',
    icon: 'align-right',
    command: execCommand('justifyRight'),
    active: isCommandActive('justifyRight'),
  },
  {
    name: 'alignJustify',
    title: '两端对齐',
    icon: 'align-justify',
    command: execCommand('justifyFull'),
    active: isCommandActive('justifyFull'),
  },
  
  // 插入
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
              <span style="margin-right: 8px;">📄</span>
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
    command: () => {
      const rows = prompt('行数:', '3')
      const cols = prompt('列数:', '3')
      
      if (rows && cols) {
        const rowCount = parseInt(rows)
        const colCount = parseInt(cols)
        
        let html = '<table border="1" style="border-collapse: collapse; width: 100%;">'
        html += '<tbody>'
        
        for (let i = 0; i < rowCount; i++) {
          html += '<tr>'
          for (let j = 0; j < colCount; j++) {
            html += `<td style="border: 1px solid #ddd; padding: 8px;">单元格</td>`
          }
          html += '</tr>'
        }
        
        html += '</tbody></table>'
        document.execCommand('insertHTML', false, html)
      }
      return true
    },
  },
  {
    name: 'horizontalRule',
    title: '水平线',
    icon: 'minus',
    command: execCommand('insertHorizontalRule'),
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
      const text = prompt('查找内容:')
      if (text && window.find) {
        window.find(text)
      }
      return true
    },
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
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📊 字数统计</h3>
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
  format: ['bold', 'italic', 'underline', 'strike', 'code'],
  heading: ['heading1', 'heading2', 'heading3', 'paragraph'],
  block: ['blockquote', 'codeblock'],
  list: ['bulletList', 'orderedList', 'taskList'],
  indent: ['outdent', 'indent'],
  align: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
  insert: ['link', 'unlink', 'image', 'video', 'audio', 'file', 'table', 'horizontalRule'],
  color: ['textColor', 'backgroundColor'],
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
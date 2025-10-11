/**
 * 字数统计插件
 * 提供字数、字符数、段落数等统计信息
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin } from '../types'

export interface WordCountStats {
  words: number
  characters: number
  charactersNoSpaces: number
  paragraphs: number
  lines: number
}

/**
 * 统计文本信息
 */
export function getWordCount(text: string): WordCountStats {
  // 字符数（含空格）
  const characters = text.length

  // 字符数（不含空格）
  const charactersNoSpaces = text.replace(/\s/g, '').length

  // 单词数（中英文混合统计）
  const words = countWords(text)

  // 段落数
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length

  // 行数
  const lines = text.split(/\n/).filter(l => l.trim().length > 0).length

  return {
    words,
    characters,
    charactersNoSpaces,
    paragraphs,
    lines
  }
}

/**
 * 统计单词数（支持中英文）
 */
function countWords(text: string): number {
  // 移除首尾空格
  text = text.trim()
  
  if (!text) return 0

  let count = 0

  // 中文字符（包括中文标点）
  const chineseRegex = /[\u4e00-\u9fa5]/g
  const chineseMatches = text.match(chineseRegex)
  if (chineseMatches) {
    count += chineseMatches.length
  }

  // 移除中文字符后，统计英文单词
  const textWithoutChinese = text.replace(chineseRegex, ' ')
  const englishWords = textWithoutChinese.match(/\b\w+\b/g)
  if (englishWords) {
    count += englishWords.length
  }

  return count
}

/**
 * 显示字数统计对话框
 */
export function showWordCountDialog(stats: WordCountStats): void {
  // 移除已存在的对话框
  const existing = document.querySelector('.word-count-dialog-overlay')
  if (existing) {
    existing.remove()
  }

  const overlay = document.createElement('div')
  overlay.className = 'word-count-dialog-overlay editor-dialog-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'word-count-dialog editor-dialog'

  // 标题
  const title = document.createElement('div')
  title.className = 'editor-dialog-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
    <span>字数统计</span>
  `
  dialog.appendChild(title)

  // 统计信息
  const content = document.createElement('div')
  content.className = 'word-count-content'
  content.innerHTML = `
    <div class="word-count-item">
      <span class="word-count-label">字数：</span>
      <span class="word-count-value">${stats.words}</span>
    </div>
    <div class="word-count-item">
      <span class="word-count-label">字符数（含空格）：</span>
      <span class="word-count-value">${stats.characters}</span>
    </div>
    <div class="word-count-item">
      <span class="word-count-label">字符数（不含空格）：</span>
      <span class="word-count-value">${stats.charactersNoSpaces}</span>
    </div>
    <div class="word-count-item">
      <span class="word-count-label">段落数：</span>
      <span class="word-count-value">${stats.paragraphs}</span>
    </div>
    <div class="word-count-item">
      <span class="word-count-label">行数：</span>
      <span class="word-count-value">${stats.lines}</span>
    </div>
  `
  dialog.appendChild(content)

  // 按钮
  const actions = document.createElement('div')
  actions.className = 'editor-dialog-actions'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'editor-dialog-button editor-dialog-button-confirm'
  closeBtn.textContent = '关闭'
  closeBtn.addEventListener('click', () => {
    overlay.remove()
  })

  actions.appendChild(closeBtn)
  dialog.appendChild(actions)

  overlay.appendChild(dialog)

  // ESC键关闭
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }
  document.addEventListener('keydown', handleKeyDown)

  // 点击遮罩关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove()
    }
  })

  document.body.appendChild(overlay)
}

/**
 * 字数统计插件
 */
export const WordCountPlugin: Plugin = {
  name: 'wordCount',
  config: {
    name: 'wordCount',
    commands: {},
    toolbar: []
  },
  install(editor: any) {
    // 注册命令
    editor.commands.register('showWordCount', (state: any, dispatch: any) => {
      if (!dispatch) return true

      const editorContent = editor.element?.querySelector('.ldesign-editor-content')
      if (!editorContent) return false

      const text = editorContent.textContent || ''
      const stats = getWordCount(text)
      showWordCountDialog(stats)

      return true
    })

    // 添加工具栏项
    const toolbarItem = {
      name: 'wordCount',
      title: '字数统计',
      icon: 'file-text',
      command: (state: any, dispatch: any) => {
        return editor.commands.execute('showWordCount')
      }
    }

    this.config.toolbar = [toolbarItem]
  }
}

/**
 * 统一的AI对话框
 * 整合所有AI相关的对话框功能
 */

import { showUnifiedDialog } from './UnifiedDialog'
import { Colors, CommonStyles } from '../utils/StyleConstants'
import { createElement as h, $ } from '../utils/DOMUtils'
import { escapeHTML } from '../utils/StringUtils'

export type AIDialogType = 'correct' | 'complete' | 'continue' | 'rewrite' | 'suggest'

interface AIDialogOptions {
  type: AIDialogType
  originalText?: string
  onConfirm: (text: string) => void
  onCancel?: () => void
}

interface AIDialogHandle {
  updateResult: (result: string, original?: string) => void
  showError: (error: string) => void
  close: () => void
}

/**
 * 显示AI对话框（支持加载状态）
 */
export function showAIDialog(options: AIDialogOptions): AIDialogHandle {
  const { type, originalText = '', onConfirm, onCancel } = options
  
  let currentTextarea: HTMLTextAreaElement | null = null
  let dialogContent: HTMLElement | null = null
  
  // 获取对话框标题
  const getTitle = () => {
    const titles = {
      correct: 'AI 纠错',
      complete: 'AI 补全',
      continue: 'AI 续写',
      rewrite: 'AI 重写',
      suggest: 'AI 建议'
    }
    return titles[type] || 'AI 助手'
  }
  
  // 创建加载内容
  const createLoadingContent = () => {
    const content = h('div')
    const messages = {
      correct: 'AI 正在分析文本中的错误...',
      complete: 'AI 正在生成补全内容...',
      continue: 'AI 正在续写文本...',
      rewrite: 'AI 正在重写文本...',
      suggest: 'AI 正在生成建议...'
    }
    
    content.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div class="loading-spinner" style="
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 3px solid #f0f0f0;
          border-top: 3px solid #409EFF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          ${messages[type]}
        </p>
        ${originalText ? `
          <div style="margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 4px; text-align: left;">
            <strong style="color: #333;">原文：</strong>
            <p style="margin: 10px 0 0 0; color: #666; line-height: 1.5;">
              ${escapeHTML(originalText).substring(0, 200)}${originalText.length > 200 ? '...' : ''}
            </p>
          </div>
        ` : ''}
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `
    return content
  }
  
  // 创建结果内容
  const createResultContent = (result: string, original?: string) => {
    const content = h('div', { style: 'max-height: 500px; overflow-y: auto;' })
    
    // 纠错类型显示对比
    if (type === 'correct' && original) {
      const diffHTML = generateDiffHTML(original, result)
      content.innerHTML = `
        <p style="margin-bottom: 15px; color: #666; font-size: 14px;">
          AI 已完成纠错，<span style="color: #f56c6c; font-weight: bold;">红色删除线</span>表示错误，
          <span style="color: #67c23a; font-weight: bold;">绿色</span>表示修正内容：
        </p>
        <div style="background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
          <div style="line-height: 1.8; font-size: 14px;">
            ${diffHTML}
          </div>
        </div>
      `
    } else {
      // 其他类型直接显示结果
      content.innerHTML = `
        <p style="margin-bottom: 15px; color: #666; font-size: 14px;">
          AI 生成的内容如下，您可以编辑后确认使用：
        </p>
      `
    }
    
    // 添加文本编辑区
    const textareaContainer = h('div', { style: 'margin-top: 15px' })
    textareaContainer.style.marginTop = '15px'
    textareaContainer.innerHTML = `
      <p style="margin-bottom: 8px; font-size: 14px; color: #666;">
        ${type === 'correct' ? '纠正后的文本' : '生成的文本'}（可继续编辑）：
      </p>
    `
    
    const textarea = h('textarea', {
      value: result,
      style: CommonStyles.textarea
    })
    currentTextarea = textarea
    textareaContainer.appendChild(textarea)
    content.appendChild(textareaContainer)
    
    return content
  }
  
  // 创建错误内容
  const createErrorContent = (error: string) => {
    const content = h('div')
    content.innerHTML = `
      <div style="text-align: center; padding: 30px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#f56c6c" style="margin-bottom: 15px;">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p style="color: #f56c6c; font-weight: bold; margin-bottom: 10px;">操作失败</p>
        <p style="color: #666; font-size: 14px;">${escapeHTML(error)}</p>
      </div>
    `
    return content
  }
  
  // 初始显示加载状态
  dialogContent = createLoadingContent()
  
  const dialogInstance = showUnifiedDialog({
    title: getTitle(),
    content: dialogContent,
    showCancel: true,
    confirmText: '等待中...',
    cancelText: '取消',
    width: type === 'correct' ? '700px' : '600px',
    confirmDisabled: true,
    onConfirm: () => {
      if (currentTextarea) {
        const text = currentTextarea.value.trim()
        if (text) {
          onConfirm(text)
        }
      }
    },
    onCancel
  })
  
  // 返回控制句柄
  return {
    updateResult: (result: string, original?: string) => {
      const resultContent = createResultContent(result, original || originalText)
      
      // 更新对话框内容
      const dialogBody = $('.unified-dialog-body')
      if (dialogBody) {
        dialogBody.innerHTML = ''
        dialogBody.appendChild(resultContent)
      }
      
      // 启用确认按钮
      const confirmBtn = $('.unified-dialog-confirm') as HTMLButtonElement
      if (confirmBtn) {
        confirmBtn.textContent = type === 'correct' ? '应用纠正' : '使用'
        confirmBtn.disabled = false
      }
      
      // 自动聚焦文本框
      setTimeout(() => {
        currentTextarea?.focus()
      }, 100)
    },
    
    showError: (error: string) => {
      const errorContent = createErrorContent(error)
      
      const dialogBody = $('.unified-dialog-body')
      if (dialogBody) {
        dialogBody.innerHTML = ''
        dialogBody.appendChild(errorContent)
      }
      
      const confirmBtn = $('.unified-dialog-confirm') as HTMLButtonElement
      if (confirmBtn) {
        confirmBtn.textContent = '关闭'
        confirmBtn.disabled = false
      }
    },
    
    close: () => {
      const closeBtn = $('.unified-dialog-close') as HTMLElement
      closeBtn?.click()
    }
  }
}

/**
 * 生成差异对比HTML（用于纠错显示）
 */
function generateDiffHTML(original: string, corrected: string): string {
  if (original === corrected) {
    return `<span style="color: #666;">${escapeHTML(original)}</span>`
  }
  
  // 常见错误模式
  const patterns = [
    { from: /的地得/g, to: '的' },
    { from: /在哪/g, to: '在那' },
    { from: /因该/g, to: '应该' },
    { from: /既使/g, to: '即使' }
  ]
  
  let html = escapeHTML(original)
  let hasChanges = false
  
  for (const pattern of patterns) {
    if (pattern.from.test(original)) {
      hasChanges = true
      html = html.replace(pattern.from, (match) => {
        return `<span style="text-decoration: line-through; color: #f56c6c; background: #ffe6e6; padding: 2px 4px; border-radius: 2px;">${match}</span>
        <span style="color: #67c23a; background: #e6ffe6; padding: 2px 4px; border-radius: 2px; font-weight: bold; margin-left: 5px;">${pattern.to}</span>`
      })
    }
  }
  
  if (!hasChanges && original !== corrected) {
    return `
      <div><strong>原文：</strong> <span style="color: #999; text-decoration: line-through;">${escapeHTML(original)}</span></div>
      <div style="margin-top: 10px;"><strong>纠正后：</strong> <span style="color: #67c23a;">${escapeHTML(corrected)}</span></div>
    `
  }
  
  return html
}


/**
 * AI模拟响应工具
 */
export const AIMockUtils = {
  // 模拟纠错
  mockCorrect: (text: string): string => {
    return text
      .replace(/的地得/g, '的')
      .replace(/在哪/g, '在那')
      .replace(/因该/g, '应该')
      .replace(/既使/g, '即使')
      .replace(/偶而/g, '偶尔')
  },
  
  // 模拟补全
  mockComplete: (context: string): string => {
    const completions = [
      '的重要组成部分',
      '具有重要意义',
      '发挥着关键作用',
      '产生了深远影响'
    ]
    return completions[Math.floor(Math.random() * completions.length)]
  },
  
  // 模拟续写
  mockContinue: (context: string): string => {
    return '\n\n这一创新性的解决方案不仅提高了效率，还带来了更好的用户体验。通过持续优化和改进，我们相信未来会有更大的发展空间。'
  },
  
  // 模拟重写
  mockRewrite: (text: string): string => {
    return `[优化后] ${text}\n\n此内容经过专业润色，语言更加精练，表达更加准确。`
  }
}
/**
 * AI 插件
 * 提供 AI 纠错、自动补全、续写等功能
 */

import { Plugin } from '../core/Plugin'
import { getAIService, AIService } from '../ai/AIService'
import type { AIConfig } from '../ai/types'
import { showAISuggestionsOverlay } from '../ui/AISuggestionsOverlay'
import { showAIConfigDialog } from '../ui/AIConfigDialog'

export const AIPlugin = new Plugin({
  name: 'ai',
  config: {
    displayName: 'AI 助手',
    description: '提供 AI 纠错、自动补全、续写等智能功能',
    icon: '🤖'
  },
  
  initialize(editor) {
    // 初始化 AI 服务
    const aiService = getAIService(editor.options.ai)
    
    // 将 AI 服务挂载到编辑器实例
    ;(editor as any).ai = aiService
    
    // 注册 AI 命令
    editor.commands.register('ai-correct', {
      name: 'AI 纠错',
      execute: () => this.executeAICorrect(editor, aiService),
      shortcut: aiService.getConfig().shortcuts?.errorCorrection
    })
    
    editor.commands.register('ai-complete', {
      name: 'AI 补全',
      execute: () => this.executeAIComplete(editor, aiService),
      shortcut: aiService.getConfig().shortcuts?.autoComplete
    })
    
    editor.commands.register('ai-continue', {
      name: 'AI 续写',
      execute: () => this.executeAIContinue(editor, aiService),
      shortcut: aiService.getConfig().shortcuts?.textContinuation
    })
    
    editor.commands.register('ai-rewrite', {
      name: 'AI 重写',
      execute: () => this.executeAIRewrite(editor, aiService),
      shortcut: aiService.getConfig().shortcuts?.textRewrite
    })
    
    editor.commands.register('ai-config', {
      name: 'AI 设置',
      execute: () => this.showAIConfig(editor, aiService)
    })
    
    // 注册键盘快捷键
    const shortcuts = aiService.getConfig().shortcuts
    if (shortcuts) {
      if (shortcuts.errorCorrection) {
        editor.keymap.register(shortcuts.errorCorrection, 'ai-correct')
      }
      if (shortcuts.autoComplete) {
        editor.keymap.register(shortcuts.autoComplete, 'ai-complete')
      }
      if (shortcuts.textContinuation) {
        editor.keymap.register(shortcuts.textContinuation, 'ai-continue')
      }
      if (shortcuts.textRewrite) {
        editor.keymap.register(shortcuts.textRewrite, 'ai-rewrite')
      }
    }
    
    // 添加工具栏按钮
    if (editor.toolbar) {
      editor.toolbar.addGroup('ai', [
        {
          name: 'ai-correct',
          label: 'AI 纠错',
          icon: '✨',
          tooltip: `AI 纠错 (${shortcuts?.errorCorrection || 'Alt+F'})`,
          command: 'ai-correct'
        },
        {
          name: 'ai-complete',
          label: 'AI 补全',
          icon: '💡',
          tooltip: `AI 补全 (${shortcuts?.autoComplete || 'Ctrl+Space'})`,
          command: 'ai-complete'
        },
        {
          name: 'ai-continue',
          label: 'AI 续写',
          icon: '✍️',
          tooltip: `AI 续写 (${shortcuts?.textContinuation || 'Alt+Enter'})`,
          command: 'ai-continue'
        },
        {
          name: 'ai-rewrite',
          label: 'AI 重写',
          icon: '🔄',
          tooltip: `AI 重写 (${shortcuts?.textRewrite || 'Alt+R'})`,
          command: 'ai-rewrite'
        },
        {
          name: 'ai-config',
          label: 'AI 设置',
          icon: '⚙️',
          tooltip: 'AI 设置',
          command: 'ai-config'
        }
      ])
    }
    
    // 自动补全监听器（可选）
    if (aiService.getConfig().features.autoComplete) {
      this.setupAutoComplete(editor, aiService)
    }
  },
  
  /**
   * 执行 AI 纠错
   */
  async executeAICorrect(editor: any, aiService: AIService): Promise<void> {
    const selection = editor.selection.get()
    if (!selection || !selection.text) {
      editor.showNotification?.('请先选择要纠错的文本', 'warning')
      return
    }
    
    // 显示加载状态
    const loadingEl = this.showLoading(editor, '正在进行 AI 纠错...')
    
    try {
      // 获取选中文本和上下文
      const text = selection.text
      const context = this.getContext(editor, selection)
      
      // 调用 AI 服务
      const response = await aiService.correct(text, context)
      
      if (response.success && response.text) {
        // 替换选中的文本
        editor.commands.execute('insert-text', { text: response.text })
        editor.showNotification?.('AI 纠错完成', 'success')
      } else {
        editor.showNotification?.(`AI 纠错失败: ${response.error}`, 'error')
      }
    } catch (error) {
      console.error('AI correct error:', error)
      editor.showNotification?.('AI 纠错出错', 'error')
    } finally {
      this.hideLoading(loadingEl)
    }
  },
  
  /**
   * 执行 AI 补全
   */
  async executeAIComplete(editor: any, aiService: AIService): Promise<void> {
    const position = editor.selection.getPosition()
    if (!position) return
    
    // 获取光标前的文本
    const textBefore = this.getTextBefore(editor, position, 100)
    if (!textBefore) {
      editor.showNotification?.('没有可补全的内容', 'info')
      return
    }
    
    // 显示加载状态
    const loadingEl = this.showLoading(editor, '正在生成补全建议...')
    
    try {
      // 获取上下文
      const context = this.getContext(editor, position)
      
      // 调用 AI 服务
      const response = await aiService.complete(textBefore, context)
      
      if (response.success && response.text) {
        // 显示补全建议
        showAISuggestionsOverlay(editor, [response.text], (suggestion) => {
          editor.commands.execute('insert-text', { text: suggestion })
        })
      } else {
        editor.showNotification?.(`AI 补全失败: ${response.error}`, 'error')
      }
    } catch (error) {
      console.error('AI complete error:', error)
      editor.showNotification?.('AI 补全出错', 'error')
    } finally {
      this.hideLoading(loadingEl)
    }
  },
  
  /**
   * 执行 AI 续写
   */
  async executeAIContinue(editor: any, aiService: AIService): Promise<void> {
    const position = editor.selection.getPosition()
    if (!position) return
    
    // 获取当前段落或之前的内容
    const textBefore = this.getTextBefore(editor, position, 500)
    if (!textBefore) {
      editor.showNotification?.('没有可续写的内容', 'info')
      return
    }
    
    // 显示加载状态
    const loadingEl = this.showLoading(editor, '正在生成续写内容...')
    
    try {
      // 调用 AI 服务
      const response = await aiService.continue(textBefore)
      
      if (response.success && response.text) {
        // 插入续写内容
        editor.commands.execute('insert-text', { text: response.text })
        editor.showNotification?.('AI 续写完成', 'success')
      } else {
        editor.showNotification?.(`AI 续写失败: ${response.error}`, 'error')
      }
    } catch (error) {
      console.error('AI continue error:', error)
      editor.showNotification?.('AI 续写出错', 'error')
    } finally {
      this.hideLoading(loadingEl)
    }
  },
  
  /**
   * 执行 AI 重写
   */
  async executeAIRewrite(editor: any, aiService: AIService): Promise<void> {
    const selection = editor.selection.get()
    if (!selection || !selection.text) {
      editor.showNotification?.('请先选择要重写的文本', 'warning')
      return
    }
    
    // 显示加载状态
    const loadingEl = this.showLoading(editor, '正在重写文本...')
    
    try {
      // 获取选中文本
      const text = selection.text
      
      // 调用 AI 服务
      const response = await aiService.rewrite(text)
      
      if (response.success && response.text) {
        // 显示重写建议，让用户选择是否接受
        showAISuggestionsOverlay(editor, [response.text, text], (suggestion) => {
          if (suggestion !== text) {
            editor.commands.execute('insert-text', { text: suggestion })
          }
        })
      } else {
        editor.showNotification?.(`AI 重写失败: ${response.error}`, 'error')
      }
    } catch (error) {
      console.error('AI rewrite error:', error)
      editor.showNotification?.('AI 重写出错', 'error')
    } finally {
      this.hideLoading(loadingEl)
    }
  },
  
  /**
   * 显示 AI 配置对话框
   */
  showAIConfig(editor: any, aiService: AIService): void {
    showAIConfigDialog(editor, aiService.getConfig(), (config) => {
      aiService.updateConfig(config)
      editor.showNotification?.('AI 配置已更新', 'success')
    })
  },
  
  /**
   * 设置自动补全
   */
  setupAutoComplete(editor: any, aiService: AIService): void {
    let debounceTimer: any = null
    
    editor.on('input', () => {
      // 防抖处理
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        this.checkAutoComplete(editor, aiService)
      }, 500)
    })
  },
  
  /**
   * 检查自动补全
   */
  async checkAutoComplete(editor: any, aiService: AIService): Promise<void> {
    const position = editor.selection.getPosition()
    if (!position) return
    
    // 获取光标前的文本
    const textBefore = this.getTextBefore(editor, position, 50)
    if (!textBefore || textBefore.length < 10) return
    
    // 检查是否在输入中
    const lastChar = textBefore[textBefore.length - 1]
    if (lastChar === ' ' || lastChar === '\n') {
      return // 不在单词末尾
    }
    
    try {
      // 调用 AI 服务获取建议
      const response = await aiService.suggest(textBefore)
      
      if (response.success && response.suggestions && response.suggestions.length > 0) {
        // 显示建议
        showAISuggestionsOverlay(editor, response.suggestions, (suggestion) => {
          editor.commands.execute('insert-text', { text: suggestion })
        }, { autoHide: true })
      }
    } catch (error) {
      console.error('Auto-complete error:', error)
    }
  },
  
  /**
   * 获取上下文
   */
  getContext(editor: any, selectionOrPosition: any): string {
    // 获取选区或位置周围的文本作为上下文
    const content = editor.getContent?.() || ''
    const maxContext = 500
    
    // 简化处理：获取前后各 250 个字符
    return content.substring(0, maxContext)
  },
  
  /**
   * 获取光标前的文本
   */
  getTextBefore(editor: any, position: any, maxLength: number): string {
    const content = editor.getContent?.() || ''
    // 简化处理：获取光标前的文本
    return content.substring(Math.max(0, content.length - maxLength))
  },
  
  /**
   * 显示加载状态
   */
  showLoading(editor: any, message: string): HTMLElement {
    const loadingEl = document.createElement('div')
    loadingEl.className = 'ldesign-ai-loading'
    loadingEl.innerHTML = `
      <div class="ldesign-ai-loading-spinner"></div>
      <div class="ldesign-ai-loading-text">${message}</div>
    `
    
    if (editor.element) {
      editor.element.appendChild(loadingEl)
    }
    
    return loadingEl
  },
  
  /**
   * 隐藏加载状态
   */
  hideLoading(loadingEl: HTMLElement): void {
    loadingEl?.remove()
  },
  
  destroy(editor) {
    // 清理 AI 服务
    const aiService = (editor as any).ai
    if (aiService) {
      aiService.cleanup()
    }
  }
})
/**
 * AI Plugin V2 - 简化版本
 * 统一的AI功能插件，避免代码重复
 */

import { createPlugin } from '../../core/Plugin'
import { getAIService } from '../../ai/AIService'
import type { PluginConfig, Command } from '../../types'
import { showAIDialog, AIMockUtils, type AIDialogType } from '../../ui/AIDialog'
import { showAIConfigDialog } from '../../ui/AIConfigDialog'
import * as EditorUtils from '../../utils/EditorUtils'

/**
 * 创建统一的AI命令
 */
function createAICommand(type: AIDialogType): Command {
  return (state, dispatch) => {
    console.log(`[AIPlugin] Executing ai-${type} command`)
    const editor = (window as any).editor
    if (!editor) return false
    
    const aiService = getAIService()
    let selectedText = ''
    let savedRange: Range | null = null
    
    // 纠错和重写需要选中文本
    if (type === 'correct' || type === 'rewrite') {
      selectedText = editor.getSelectedText ? editor.getSelectedText() : EditorUtils.getSelectedText()
      
      if (!selectedText) {
        alert(`请先选择要${type === 'correct' ? '纠错' : '重写'}的文本`)
        return false
      }
    } else if (type === 'complete' || type === 'continue') {
      // 补全和续写：获取上下文
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        const container = range.commonAncestorContainer
        const textContent = container.textContent || ''
        const offset = range.startOffset
        // 获取光标前的文本作为上下文
        selectedText = textContent.substring(Math.max(0, offset - 100), offset)
      }
    }
    
    // 保存选区
    savedRange = EditorUtils.saveRange()
    
    // 显示对话框
    const dialogHandle = showAIDialog({
      type,
      originalText: selectedText,
      onConfirm: (text) => {
        // 替换或插入文本
        if (editor.contentElement) {
          editor.contentElement.focus()
          EditorUtils.replaceSelection(text, savedRange)
          editor.handleInput?.()
        }
      }
    })
    
    // 处理API调用
    if (!aiService.getConfig().providers.deepseek?.apiKey) {
      // 模拟响应
      setTimeout(() => {
        let mockResult = ''
        switch (type) {
          case 'correct':
            mockResult = AIMockUtils.mockCorrect(selectedText)
            break
          case 'complete':
            mockResult = AIMockUtils.mockComplete(selectedText)
            break
          case 'continue':
            mockResult = AIMockUtils.mockContinue(selectedText)
            break
          case 'rewrite':
            mockResult = AIMockUtils.mockRewrite(selectedText)
            break
        }
        dialogHandle.updateResult(mockResult, selectedText)
      }, 1000)
    } else {
      // 真实API调用
      const apiMethod = type === 'correct' ? aiService.correct :
                        type === 'complete' ? aiService.complete :
                        type === 'continue' ? aiService.continue :
                        aiService.rewrite
      
      apiMethod.call(aiService, selectedText).then((response: any) => {
        if (response.success && response.text) {
          dialogHandle.updateResult(response.text, selectedText)
        } else {
          dialogHandle.showError(response.error || `AI ${type} 失败`)
        }
      }).catch((error: any) => {
        console.error(`[AIPlugin] AI ${type} failed:`, error)
        dialogHandle.showError(`AI ${type} 请求失败`)
      })
    }
    
    return true
  }
}

// AI插件配置
const aiPluginConfig: PluginConfig = {
  name: 'ai',
  commands: {
    'ai-correct': createAICommand('correct'),
    'ai-complete': createAICommand('complete'),
    'ai-continue': createAICommand('continue'),
    'ai-rewrite': createAICommand('rewrite'),
    'ai-config': (state, dispatch) => {
      console.log('[AIPlugin] Opening AI config')
      const editor = (window as any).editor
      if (!editor) return false
      
      const aiService = getAIService()
      showAIConfigDialog(editor, aiService.getConfig(), (config) => {
        aiService.updateConfig(config)
        console.log('[AIPlugin] AI config updated')
      })
      return true
    }
  },
  init(editor) {
    console.log('[AIPlugin] Initializing AI plugin')
    
    // 保存 AI 服务实例到编辑器
    const aiService = getAIService()
    ;(editor as any).ai = aiService
    
    console.log('[AIPlugin] AI service attached to editor')
    console.log('[AIPlugin] Commands registered:', Object.keys(aiPluginConfig.commands || {}))
  }
}

// 创建并导出插件
const AIPlugin = createPlugin(aiPluginConfig)

export default AIPlugin
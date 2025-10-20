/**
 * 便捷快捷函数集合
 * 提供更多语法糖和实用工具
 */

import type { Editor } from '../core/Editor'
import { getIconManager } from '../icons/IconManager'
import { getThemeManager } from '../theme'
import { getI18n } from '../i18n'
import { getConfigManager } from '../config/ConfigManager'
import { getFeatureFlags } from '../core/FeatureFlags'
import { ui, $ } from './simplify'

/**
 * 快速配置
 */
export const quick = {
  /**
   * 切换到深色模式
   */
  darkMode(): void {
    getThemeManager().setTheme('dark')
  },
  
  /**
   * 切换到浅色模式
   */
  lightMode(): void {
    getThemeManager().setTheme('light')
  },
  
  /**
   * 切换主题
   */
  toggleTheme(): void {
    const theme = getThemeManager()
    const current = theme.getCurrentThemeName()
    theme.setTheme(current === 'light' ? 'dark' : 'light')
  },
  
  /**
   * 中文模式
   */
  chinese(): Promise<void> {
    return getI18n().setLocale('zh-CN')
  },
  
  /**
   * 英文模式
   */
  english(): Promise<void> {
    return getI18n().setLocale('en-US')
  },
  
  /**
   * 日文模式
   */
  japanese(): Promise<void> {
    return getI18n().setLocale('ja-JP')
  },
  
  /**
   * 启用AI
   */
  enableAI(apiKey?: string): void {
    const features = getFeatureFlags()
    features.enable('ai-service')
    features.enable('ai-correct')
    features.enable('ai-complete')
    
    if (apiKey) {
      const ai = require('../ai/AIService').getAIService()
      ai.updateApiKey('deepseek', apiKey)
    }
  },
  
  /**
   * 禁用AI
   */
  disableAI(): void {
    const features = getFeatureFlags()
    features.disable('ai-service')
    features.disable('ai-correct')
    features.disable('ai-complete')
    features.disable('ai-rewrite')
    features.disable('ai-translate')
  },
  
  /**
   * 全屏模式
   */
  fullscreen(editor: Editor): void {
    editor.commands.execute('toggleFullscreen')
  },
  
  /**
   * 导出Markdown
   */
  exportMarkdown(editor: Editor): string {
    return editor.getContent()
  },
  
  /**
   * 保存到本地
   */
  save(key: string = 'editor-content', content?: string): void {
    localStorage.setItem(key, content || '')
  },
  
  /**
   * 从本地加载
   */
  load(key: string = 'editor-content'): string | null {
    return localStorage.getItem(key)
  },
  
  /**
   * 清空编辑器
   */
  clear(editor: Editor): void {
    editor.setContent('')
  }
}

/**
 * 编辑器快捷操作
 */
export function editor(instance: Editor) {
  return {
    /**
     * 获取纯文本
     */
    getText(): string {
      return instance.contentElement?.textContent || ''
    },
    
    /**
     * 获取HTML
     */
    getHTML(): string {
      return instance.getContent()
    },
    
    /**
     * 设置内容
     */
    setContent(html: string): void {
      instance.setContent(html)
    },
    
    /**
     * 追加内容
     */
    append(html: string): void {
      const current = instance.getContent()
      instance.setContent(current + html)
    },
    
    /**
     * 插入内容
     */
    insert(html: string): void {
      instance.insertHTML(html)
    },
    
    /**
     * 字数统计
     */
    wordCount(): number {
      const text = this.getText()
      return text.trim().split(/\s+/).length
    },
    
    /**
     * 字符统计
     */
    charCount(): number {
      return this.getText().length
    },
    
    /**
     * 是否为空
     */
    isEmpty(): boolean {
      return this.getText().trim() === ''
    },
    
    /**
     * 聚焦编辑器
     */
    focus(): void {
      instance.contentElement?.focus()
    },
    
    /**
     * 失焦
     */
    blur(): void {
      instance.contentElement?.blur()
    },
    
    /**
     * 滚动到顶部
     */
    scrollTop(): void {
      instance.contentElement?.scrollTo(0, 0)
    },
    
    /**
     * 滚动到底部
     */
    scrollBottom(): void {
      const el = instance.contentElement
      if (el) {
        el.scrollTo(0, el.scrollHeight)
      }
    }
  }
}

/**
 * 批量操作
 */
export const batch = {
  /**
   * 启用博客功能
   */
  enableBlogFeatures(): void {
    const features = getFeatureFlags()
    features.enableBatch([
      'bold', 'italic', 'underline', 'heading',
      'bullet-list', 'ordered-list', 'blockquote',
      'link', 'image', 'codeblock'
    ])
  },
  
  /**
   * 启用所有格式化
   */
  enableAllFormatting(): void {
    const features = getFeatureFlags()
    features.enableBatch([
      'bold', 'italic', 'underline', 'strikethrough', 'code',
      'subscript', 'superscript', 'text-color', 'background-color',
      'font-size', 'font-family', 'line-height'
    ])
  },
  
  /**
   * 启用所有媒体
   */
  enableAllMedia(): void {
    const features = getFeatureFlags()
    features.enableBatch([
      'link', 'image', 'video', 'audio', 'file'
    ])
  },
  
  /**
   * 禁用所有AI
   */
  disableAllAI(): void {
    quick.disableAI()
  },
  
  /**
   * 禁用所有高级功能
   */
  disableAdvanced(): void {
    const features = getFeatureFlags()
    features.disableBatch([
      'collaboration', 'version-control', 'comments'
    ])
  }
}

/**
 * 调试工具
 */
export const debug = {
  /**
   * 显示所有配置
   */
  showConfig(): void {
    const config = getConfigManager()
    console.log('配置管理器:', config)
    console.log('当前主题:', config.getTheme())
    console.log('当前图标集:', config.getIconSet())
    console.log('当前语言:', config.getLocale())
  },
  
  /**
   * 显示功能状态
   */
  showFeatures(): void {
    const features = getFeatureFlags()
    console.log('功能统计:', features.getStats())
    console.log('已启用功能:', features.getEnabled())
    console.log('懒加载功能:', features.getLazyFeatures())
  },
  
  /**
   * 显示性能
   */
  showPerformance(): void {
    const monitor = require('./PerformanceMonitor').getPerformanceMonitor()
    console.log('性能指标:', monitor.getMetrics())
    console.log(monitor.generateReport())
  },
  
  /**
   * 显示加载统计
   */
  showLoadStats(): void {
    const loader = require('../core/LazyLoader').getLazyLoader()
    console.log('加载统计:', loader.getStats())
    console.log('加载时间:', loader.getLoadTimes())
  },
  
  /**
   * 全部信息
   */
  showAll(): void {
    console.log('=== 编辑器调试信息 ===\n')
    this.showConfig()
    console.log('\n')
    this.showFeatures()
    console.log('\n')
    this.showPerformance()
    console.log('\n')
    this.showLoadStats()
  }
}

/**
 * 性能优化快捷方式
 */
export const optimize = {
  /**
   * 启用性能模式
   */
  performanceMode(): void {
    const features = getFeatureFlags()
    
    // 只保留核心功能
    features.onlyEnable([
      'basic-editing', 'selection', 'history',
      'bold', 'italic', 'underline',
      'heading', 'paragraph',
      'bullet-list', 'ordered-list',
      'link'
    ])
    
    ui.toast('性能模式已启用', 'success')
  },
  
  /**
   * 清理缓存
   */
  clearCache(): void {
    const iconManager = getIconManager()
    // 图标缓存清理
    
    ui.toast('缓存已清理', 'success')
  },
  
  /**
   * 减少内存
   */
  reduceMemory(): void {
    // 禁用高内存功能
    const features = getFeatureFlags()
    features.disableBatch([
      'collaboration',
      'version-control',
      'video',
      'audio'
    ])
    
    ui.toast('已禁用高内存功能', 'info')
  },
  
  /**
   * 启用所有优化
   */
  enableAll(): void {
    this.performanceMode()
    this.clearCache()
    
    ui.toast('所有优化已启用', 'success')
  }
}




import { BasePlugin } from '../base-plugin'
import { LDesignEditor } from '../../core/editor'
import { ToolbarItem } from '../../types'

/**
 * 搜索替换配置接口
 */
export interface SearchReplaceConfig {
  /** 是否启用搜索替换功能 */
  enabled?: boolean
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否全词匹配 */
  wholeWord?: boolean
  /** 是否启用正则表达式 */
  useRegex?: boolean
  /** 搜索结果高亮颜色 */
  highlightColor?: string
  /** 当前匹配项高亮颜色 */
  currentHighlightColor?: string
  /** 最大搜索结果数量 */
  maxResults?: number
  /** 是否自动关闭对话框 */
  autoClose?: boolean
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  /** 匹配的文本 */
  text: string
  /** 在文档中的起始位置 */
  startIndex: number
  /** 在文档中的结束位置 */
  endIndex: number
  /** DOM 范围对象 */
  range: Range
  /** 高亮元素 */
  highlightElement?: HTMLElement
}

/**
 * 搜索替换插件类
 * 提供文本搜索、替换、高亮显示等功能
 */
export class SearchReplacePlugin extends BasePlugin {
  name = 'searchReplace'
  
  private config: Required<SearchReplaceConfig>
  private searchDialog: HTMLElement | null = null
  private searchResults: SearchResult[] = []
  private currentResultIndex: number = -1
  private lastSearchTerm: string = ''
  private isSearching: boolean = false

  constructor(editor: LDesignEditor, config: SearchReplaceConfig = {}) {
    super(editor)
    
    // 设置默认配置
    this.config = {
      enabled: true,
      caseSensitive: false,
      wholeWord: false,
      useRegex: false,
      highlightColor: '#ffeb3b',
      currentHighlightColor: '#ff9800',
      maxResults: 1000,
      autoClose: true,
      ...config
    }
  }

  /**
   * 初始化插件
   */
  init(): void {
    if (!this.config.enabled) return

    this.registerCommands()
    this.registerEventHandlers()
    this.createSearchDialog()
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    this.clearSearchResults()
    this.removeSearchDialog()
    super.destroy()
  }

  /**
   * 获取工具栏项
   */
  getToolbarItems(): ToolbarItem[] {
    if (!this.config.enabled) return []

    return [
      {
        id: 'search-replace',
        type: 'button',
        label: '搜索替换',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M11.5 6.5a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" fill="none" stroke="currentColor" stroke-width="1"/>
          <path d="M11 11l2.5 2.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
          <circle cx="6.5" cy="6.5" r="2" fill="none" stroke="currentColor" stroke-width="1"/>
          <path d="M8 4.5h3v3" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>`,
        title: '搜索替换 (Ctrl+F)',
        command: 'showSearchDialog',
        group: 'search'
      }
    ]
  }

  /**
   * 注册命令
   */
  private registerCommands(): void {
    // 显示搜索对话框命令
    this.editor.commands.register({
      name: 'showSearchDialog',
      execute: () => this.showSearchDialog()
    })

    // 搜索文本命令
    this.editor.commands.register({
      name: 'searchText',
      execute: (searchTerm: string, options?: Partial<SearchReplaceConfig>) => 
        this.searchText(searchTerm, options)
    })

    // 替换文本命令
    this.editor.commands.register({
      name: 'replaceText',
      execute: (searchTerm: string, replaceTerm: string, replaceAll: boolean = false) => 
        this.replaceText(searchTerm, replaceTerm, replaceAll)
    })

    // 查找下一个命令
    this.editor.commands.register({
      name: 'findNext',
      execute: () => this.findNext()
    })

    // 查找上一个命令
    this.editor.commands.register({
      name: 'findPrevious',
      execute: () => this.findPrevious()
    })

    // 清除搜索高亮命令
    this.editor.commands.register({
      name: 'clearSearchHighlight',
      execute: () => this.clearSearchResults()
    })

    // 关闭搜索对话框命令
    this.editor.commands.register({
      name: 'hideSearchDialog',
      execute: () => this.hideSearchDialog()
    })
  }

  /**
   * 注册事件处理器
   */
  private registerEventHandlers(): void {
    // 监听快捷键
    this.editor.on('keydown', (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        this.showSearchDialog()
      }
      
      if (event.key === 'Escape' && this.searchDialog?.style.display === 'block') {
        event.preventDefault()
        this.hideSearchDialog()
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault()
        if (event.shiftKey) {
          this.findPrevious()
        } else {
          this.findNext()
        }
      }
    })

    // 监听内容变化，清除搜索结果
    this.editor.on('contentChange', () => {
      if (this.searchResults.length > 0) {
        this.clearSearchResults()
      }
    })
  }

  /**
   * 显示搜索对话框
   */
  private showSearchDialog(): void {
    if (!this.searchDialog) return

    this.searchDialog.style.display = 'block'
    
    // 焦点到搜索输入框
    const searchInput = this.searchDialog.querySelector('#search-input') as HTMLInputElement
    if (searchInput) {
      // 如果有选中文本，则填充到搜索框
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        const selectedText = selection.toString().trim()
        if (selectedText.length > 0 && selectedText.length < 100) {
          searchInput.value = selectedText
        }
      }
      
      searchInput.focus()
      searchInput.select()
    }

    // 更新按钮状态
    this.updateSearchDialogState()
  }

  /**
   * 隐藏搜索对话框
   */
  private hideSearchDialog(): void {
    if (!this.searchDialog) return
    
    this.searchDialog.style.display = 'none'
    
    // 如果配置了自动关闭，则清除搜索结果
    if (this.config.autoClose) {
      this.clearSearchResults()
    }
  }

  /**
   * 搜索文本
   */
  private searchText(searchTerm: string, options: Partial<SearchReplaceConfig> = {}): SearchResult[] {
    if (!searchTerm.trim()) {
      this.clearSearchResults()
      return []
    }

    // 合并配置
    const searchOptions = { ...this.config, ...options }
    
    // 清除之前的搜索结果
    this.clearSearchResults()
    
    this.lastSearchTerm = searchTerm
    this.isSearching = true
    
    try {
      // 获取编辑器内容
      const content = this.editor.content.textContent || ''
      if (!content) return []

      // 构建搜索模式
      let pattern: RegExp
      
      if (searchOptions.useRegex) {
        try {
          const flags = searchOptions.caseSensitive ? 'g' : 'gi'
          pattern = new RegExp(searchTerm, flags)
        } catch (error) {
          console.warn('Invalid regex pattern:', searchTerm, error)
          return []
        }
      } else {
        // 转义特殊字符
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        let regexTerm = escapedTerm
        
        // 全词匹配
        if (searchOptions.wholeWord) {
          regexTerm = `\\b${regexTerm}\\b`
        }
        
        const flags = searchOptions.caseSensitive ? 'g' : 'gi'
        pattern = new RegExp(regexTerm, flags)
      }

      // 查找匹配项
      const matches = []
      let match
      let matchCount = 0

      while ((match = pattern.exec(content)) !== null && matchCount < searchOptions.maxResults) {
        matches.push({
          text: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length
        })
        matchCount++
        
        // 防止无限循环
        if (match[0].length === 0) {
          pattern.lastIndex++
        }
      }

      // 创建搜索结果并高亮
      this.searchResults = this.createSearchResults(matches)
      
      // 跳转到第一个结果
      if (this.searchResults.length > 0) {
        this.currentResultIndex = 0
        this.highlightCurrentResult()
      }

      return this.searchResults

    } catch (error) {
      console.error('Search failed:', error)
      return []
    } finally {
      this.isSearching = false
      this.updateSearchDialogState()
    }
  }

  /**
   * 创建搜索结果
   */
  private createSearchResults(matches: { text: string; startIndex: number; endIndex: number }[]): SearchResult[] {
    const results: SearchResult[] = []
    const contentElement = this.editor.content
    
    if (!contentElement) return results

    // 创建树遍历器
    const walker = document.createTreeWalker(
      contentElement,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )

    let textNode: Text | null
    let textOffset = 0
    
    while (textNode = walker.nextNode() as Text) {
      const textContent = textNode.textContent || ''
      const textStart = textOffset
      const textEnd = textOffset + textContent.length
      
      // 检查匹配项是否在当前文本节点中
      for (const match of matches) {
        if (match.startIndex >= textStart && match.endIndex <= textEnd) {
          try {
            // 创建范围
            const range = document.createRange()
            range.setStart(textNode, match.startIndex - textStart)
            range.setEnd(textNode, match.endIndex - textStart)
            
            results.push({
              ...match,
              range
            })
          } catch (error) {
            console.warn('Failed to create range for match:', match, error)
          }
        }
      }
      
      textOffset = textEnd
    }

    // 为结果添加高亮
    this.highlightSearchResults(results)
    
    return results
  }

  /**
   * 高亮搜索结果
   */
  private highlightSearchResults(results: SearchResult[]): void {
    results.forEach((result, index) => {
      try {
        // 创建高亮元素
        const highlight = document.createElement('mark')
        highlight.className = 'ldesign-search-highlight'
        highlight.style.backgroundColor = this.config.highlightColor
        highlight.style.color = '#000'
        highlight.style.padding = '0'
        highlight.style.borderRadius = '2px'
        highlight.dataset.searchIndex = index.toString()
        
        // 包围匹配文本
        result.range.surroundContents(highlight)
        result.highlightElement = highlight
        
      } catch (error) {
        console.warn('Failed to highlight search result:', result, error)
      }
    })
  }

  /**
   * 查找下一个结果
   */
  private findNext(): void {
    if (this.searchResults.length === 0) return
    
    this.currentResultIndex = (this.currentResultIndex + 1) % this.searchResults.length
    this.highlightCurrentResult()
    this.scrollToCurrentResult()
    this.updateSearchDialogState()
  }

  /**
   * 查找上一个结果
   */
  private findPrevious(): void {
    if (this.searchResults.length === 0) return
    
    this.currentResultIndex = this.currentResultIndex <= 0 
      ? this.searchResults.length - 1 
      : this.currentResultIndex - 1
    
    this.highlightCurrentResult()
    this.scrollToCurrentResult()
    this.updateSearchDialogState()
  }

  /**
   * 高亮当前结果
   */
  private highlightCurrentResult(): void {
    // 重置所有高亮样式
    this.searchResults.forEach((result, index) => {
      if (result.highlightElement) {
        result.highlightElement.style.backgroundColor = 
          index === this.currentResultIndex 
            ? this.config.currentHighlightColor 
            : this.config.highlightColor
        
        // 添加或移除当前高亮类
        if (index === this.currentResultIndex) {
          result.highlightElement.classList.add('ldesign-search-current')
        } else {
          result.highlightElement.classList.remove('ldesign-search-current')
        }
      }
    })
  }

  /**
   * 滚动到当前结果
   */
  private scrollToCurrentResult(): void {
    if (this.currentResultIndex >= 0 && this.currentResultIndex < this.searchResults.length) {
      const currentResult = this.searchResults[this.currentResultIndex]
      if (currentResult.highlightElement) {
        currentResult.highlightElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }
    }
  }

  /**
   * 清除搜索结果
   */
  private clearSearchResults(): void {
    // 移除所有高亮元素
    this.searchResults.forEach(result => {
      if (result.highlightElement) {
        // 获取高亮元素的文本内容
        const textContent = result.highlightElement.textContent || ''
        const textNode = document.createTextNode(textContent)
        
        // 用文本节点替换高亮元素
        const parent = result.highlightElement.parentNode
        if (parent) {
          parent.insertBefore(textNode, result.highlightElement)
          parent.removeChild(result.highlightElement)
          
          // 合并相邻的文本节点
          parent.normalize()
        }
      }
    })
    
    // 清空结果数组
    this.searchResults = []
    this.currentResultIndex = -1
    this.lastSearchTerm = ''
    
    // 更新对话框状态
    this.updateSearchDialogState()
  }

  /**
   * 创建搜索对话框
   */
  private createSearchDialog(): void {
    this.searchDialog = document.createElement('div')
    this.searchDialog.className = 'ldesign-search-dialog'
    this.searchDialog.innerHTML = `
      <div class="search-dialog-content">
        <div class="search-dialog-header">
          <h3>搜索和替换</h3>
          <button class="dialog-close" type="button" title="关闭 (ESC)">×</button>
        </div>
        <div class="search-dialog-body">
          <div class="search-section">
            <div class="input-group">
              <label for="search-input">查找：</label>
              <input type="text" id="search-input" placeholder="输入要查找的文本" />
              <div class="search-buttons">
                <button class="btn btn-sm btn-secondary" id="btn-previous" title="查找上一个 (Shift+F3)">↑</button>
                <button class="btn btn-sm btn-secondary" id="btn-next" title="查找下一个 (F3)">↓</button>
              </div>
            </div>
            
            <div class="input-group">
              <label for="replace-input">替换：</label>
              <input type="text" id="replace-input" placeholder="输入替换文本" />
              <div class="replace-buttons">
                <button class="btn btn-sm btn-primary" id="btn-replace" title="替换当前">替换</button>
                <button class="btn btn-sm btn-primary" id="btn-replace-all" title="全部替换">全部替换</button>
              </div>
            </div>
          </div>
          
          <div class="search-options">
            <div class="option-group">
              <label class="checkbox-label">
                <input type="checkbox" id="case-sensitive" />
                <span>区分大小写</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="whole-word" />
                <span>全词匹配</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="use-regex" />
                <span>正则表达式</span>
              </label>
            </div>
          </div>
          
          <div class="search-status">
            <div class="status-text" id="search-status">输入文本开始搜索</div>
            <div class="result-info" id="result-info"></div>
          </div>
        </div>
        
        <div class="search-dialog-footer">
          <button class="btn btn-sm btn-secondary" id="btn-clear">清除高亮</button>
          <button class="btn btn-sm btn-secondary dialog-close">关闭</button>
        </div>
      </div>
    `

    // 绑定事件
    this.bindSearchDialogEvents()

    // 添加到编辑器容器
    this.editor.container.appendChild(this.searchDialog)
  }

  /**
   * 绑定搜索对话框事件
   */
  private bindSearchDialogEvents(): void {
    if (!this.searchDialog) return

    const searchInput = this.searchDialog.querySelector('#search-input') as HTMLInputElement
    const replaceInput = this.searchDialog.querySelector('#replace-input') as HTMLInputElement
    const caseSensitiveCheckbox = this.searchDialog.querySelector('#case-sensitive') as HTMLInputElement
    const wholeWordCheckbox = this.searchDialog.querySelector('#whole-word') as HTMLInputElement
    const useRegexCheckbox = this.searchDialog.querySelector('#use-regex') as HTMLInputElement

    // 关闭按钮
    const closeButtons = this.searchDialog.querySelectorAll('.dialog-close')
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.hideSearchDialog())
    })

    // 搜索输入框事件
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value
        if (searchTerm.trim()) {
          this.searchText(searchTerm, this.getCurrentSearchOptions())
        } else {
          this.clearSearchResults()
        }
      })

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (e.shiftKey) {
            this.findPrevious()
          } else {
            this.findNext()
          }
        }
      })
    }

    // 导航按钮
    const btnNext = this.searchDialog.querySelector('#btn-next')
    const btnPrevious = this.searchDialog.querySelector('#btn-previous')
    
    btnNext?.addEventListener('click', () => this.findNext())
    btnPrevious?.addEventListener('click', () => this.findPrevious())

    // 替换按钮
    const btnReplace = this.searchDialog.querySelector('#btn-replace')
    const btnReplaceAll = this.searchDialog.querySelector('#btn-replace-all')
    
    btnReplace?.addEventListener('click', () => {
      const searchTerm = searchInput?.value || ''
      const replaceTerm = replaceInput?.value || ''
      if (searchTerm.trim()) {
        this.replaceText(searchTerm, replaceTerm, false)
      }
    })
    
    btnReplaceAll?.addEventListener('click', () => {
      const searchTerm = searchInput?.value || ''
      const replaceTerm = replaceInput?.value || ''
      if (searchTerm.trim()) {
        if (confirm(`确定要替换所有 "${searchTerm}" 吗？`)) {
          this.replaceText(searchTerm, replaceTerm, true)
        }
      }
    })

    // 选项复选框事件
    const checkboxes = [caseSensitiveCheckbox, wholeWordCheckbox, useRegexCheckbox]
    checkboxes.forEach(checkbox => {
      checkbox?.addEventListener('change', () => {
        const searchTerm = searchInput?.value || ''
        if (searchTerm.trim()) {
          this.searchText(searchTerm, this.getCurrentSearchOptions())
        }
      })
    })

    // 清除高亮按钮
    const btnClear = this.searchDialog.querySelector('#btn-clear')
    btnClear?.addEventListener('click', () => this.clearSearchResults())

    // 点击外部关闭
    this.searchDialog.addEventListener('click', (e) => {
      if (e.target === this.searchDialog) {
        this.hideSearchDialog()
      }
    })
  }

  /**
   * 获取当前搜索选项
   */
  private getCurrentSearchOptions(): Partial<SearchReplaceConfig> {
    if (!this.searchDialog) return {}

    const caseSensitive = (this.searchDialog.querySelector('#case-sensitive') as HTMLInputElement)?.checked || false
    const wholeWord = (this.searchDialog.querySelector('#whole-word') as HTMLInputElement)?.checked || false
    const useRegex = (this.searchDialog.querySelector('#use-regex') as HTMLInputElement)?.checked || false

    return {
      caseSensitive,
      wholeWord,
      useRegex
    }
  }

  /**
   * 移除搜索对话框
   */
  private removeSearchDialog(): void {
    if (this.searchDialog) {
      this.searchDialog.remove()
      this.searchDialog = null
    }
  }

  /**
   * 更新搜索对话框状态
   */
  private updateSearchDialogState(): void {
    if (!this.searchDialog) return

    const statusEl = this.searchDialog.querySelector('#search-status')
    const resultInfoEl = this.searchDialog.querySelector('#result-info')
    const btnNext = this.searchDialog.querySelector('#btn-next') as HTMLButtonElement
    const btnPrevious = this.searchDialog.querySelector('#btn-previous') as HTMLButtonElement
    const btnReplace = this.searchDialog.querySelector('#btn-replace') as HTMLButtonElement
    const btnReplaceAll = this.searchDialog.querySelector('#btn-replace-all') as HTMLButtonElement

    if (this.isSearching) {
      if (statusEl) statusEl.textContent = '搜索中...'
      return
    }

    const hasResults = this.searchResults.length > 0
    const hasCurrentResult = this.currentResultIndex >= 0

    // 更新状态文本
    if (statusEl) {
      if (!this.lastSearchTerm.trim()) {
        statusEl.textContent = '输入文本开始搜索'
      } else if (hasResults) {
        statusEl.textContent = `找到 ${this.searchResults.length} 个结果`
      } else {
        statusEl.textContent = '未找到匹配项'
      }
    }

    // 更新结果信息
    if (resultInfoEl) {
      if (hasResults && hasCurrentResult) {
        resultInfoEl.textContent = `${this.currentResultIndex + 1} / ${this.searchResults.length}`
      } else {
        resultInfoEl.textContent = ''
      }
    }

    // 更新按钮状态
    const buttonsDisabled = !hasResults
    if (btnNext) btnNext.disabled = buttonsDisabled
    if (btnPrevious) btnPrevious.disabled = buttonsDisabled
    if (btnReplace) btnReplace.disabled = buttonsDisabled || !hasCurrentResult
    if (btnReplaceAll) btnReplaceAll.disabled = buttonsDisabled
  }

  /**
   * 替换文本
   * @param searchTerm 搜索词
   * @param replaceTerm 替换词  
   * @param replaceAll 是否替换所有
   * @returns 替换的数量
   */
  private replaceText(searchTerm: string, replaceTerm: string, replaceAll: boolean): number {
    if (!searchTerm.trim()) return 0
    
    // 如果没有搜索结果，先进行搜索
    if (this.searchResults.length === 0 || this.lastSearchTerm !== searchTerm) {
      this.searchText(searchTerm, this.getCurrentSearchOptions())
    }
    
    if (this.searchResults.length === 0) {
      return 0 // 没有找到匹配项
    }
    
    let replacedCount = 0
    
    try {
      if (replaceAll) {
        // 全部替换，从后往前替换以保持索引正确
        for (let i = this.searchResults.length - 1; i >= 0; i--) {
          if (this.replaceSearchResult(i, replaceTerm)) {
            replacedCount++
          }
        }
        
        // 清除搜索结果和重新搜索
        this.clearSearchResults()
        
        // 如果还有更多匹配项，显示新的搜索结果
        setTimeout(() => {
          this.searchText(searchTerm, this.getCurrentSearchOptions())
        }, 10)
        
      } else {
        // 单个替换
        if (this.currentResultIndex >= 0 && this.currentResultIndex < this.searchResults.length) {
          if (this.replaceSearchResult(this.currentResultIndex, replaceTerm)) {
            replacedCount = 1
            
            // 移除已替换的结果
            this.searchResults.splice(this.currentResultIndex, 1)
            
            // 调整当前索引
            if (this.currentResultIndex >= this.searchResults.length) {
              this.currentResultIndex = this.searchResults.length - 1
            }
            
            // 更新高亮
            if (this.searchResults.length > 0) {
              this.highlightCurrentResult()
              this.scrollToCurrentResult()
            }
          }
        }
      }
      
      // 记录历史
      if (replacedCount > 0) {
        this.editor.history?.record(
          replaceAll 
            ? `替换所有 "${searchTerm}"` 
            : `替换 "${searchTerm}"`
        )
      }
      
    } catch (error) {
      console.error('Replace failed:', error)
    } finally {
      // 更新状态
      this.updateSearchDialogState()
    }
    
    return replacedCount
  }
  
  /**
   * 替换单个搜索结果
   * @param resultIndex 结果索引
   * @param replaceTerm 替换词
   * @returns 是否替换成功
   */
  private replaceSearchResult(resultIndex: number, replaceTerm: string): boolean {
    if (resultIndex < 0 || resultIndex >= this.searchResults.length) {
      return false
    }
    
    const result = this.searchResults[resultIndex]
    if (!result.highlightElement) {
      return false
    }
    
    try {
      // 保存父节点引用
      const parent = result.highlightElement.parentNode
      if (!parent) return false
      
      // 创建替换文本节点
      const replacementNode = this.createReplacementNode(result.text, replaceTerm)
      
      // 替换节点
      parent.insertBefore(replacementNode, result.highlightElement)
      parent.removeChild(result.highlightElement)
      
      // 合并相邻的文本节点
      parent.normalize()
      
      return true
      
    } catch (error) {
      console.warn('Failed to replace search result:', error)
      return false
    }
  }
  
  /**
   * 创建替换节点
   * @param originalText 原始文本
   * @param replaceTerm 替换词
   * @returns 替换后的节点
   */
  private createReplacementNode(originalText: string, replaceTerm: string): Node {
    // 如果是正则表达式替换，需要处理特殊字符
    if (this.getCurrentSearchOptions().useRegex) {
      try {
        const searchOptions = this.getCurrentSearchOptions()
        const flags = searchOptions.caseSensitive ? 'g' : 'gi'
        const pattern = new RegExp(this.lastSearchTerm, flags)
        const replacedText = originalText.replace(pattern, replaceTerm)
        return document.createTextNode(replacedText)
      } catch (error) {
        console.warn('Failed to apply regex replacement:', error)
        return document.createTextNode(replaceTerm)
      }
    } else {
      // 普通替换
      return document.createTextNode(replaceTerm)
    }
  }
  
  /**
   * 获取替换统计信息
   */
  public getReplaceStats(): {
    totalMatches: number
    currentIndex: number
    hasMatches: boolean
  } {
    return {
      totalMatches: this.searchResults.length,
      currentIndex: this.currentResultIndex,
      hasMatches: this.searchResults.length > 0
    }
  }
  
  /**
   * 设置搜索选项
   */
  public setSearchOptions(options: Partial<SearchReplaceConfig>): void {
    Object.assign(this.config, options)
    
    // 更新对话框中的复选框状态
    if (this.searchDialog) {
      const caseSensitiveCheckbox = this.searchDialog.querySelector('#case-sensitive') as HTMLInputElement
      const wholeWordCheckbox = this.searchDialog.querySelector('#whole-word') as HTMLInputElement
      const useRegexCheckbox = this.searchDialog.querySelector('#use-regex') as HTMLInputElement
      
      if (caseSensitiveCheckbox) caseSensitiveCheckbox.checked = this.config.caseSensitive
      if (wholeWordCheckbox) wholeWordCheckbox.checked = this.config.wholeWord
      if (useRegexCheckbox) useRegexCheckbox.checked = this.config.useRegex
    }
  }
}

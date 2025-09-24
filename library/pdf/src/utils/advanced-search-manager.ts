/**
 * 高级PDF搜索管理器
 * 提供更强大的搜索功能，包括正则表达式、高亮、搜索历史等
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { SearchResult } from '../core/types'

export interface AdvancedSearchOptions {
  query: string
  caseSensitive?: boolean
  wholeWords?: boolean
  useRegex?: boolean
  searchInBookmarks?: boolean
  searchInAnnotations?: boolean
  maxResults?: number
  contextLength?: number // 搜索结果上下文长度
}

export interface AdvancedSearchResult extends SearchResult {
  context: string // 搜索结果的上下文
  highlights: HighlightInfo[]
  annotations?: string[] // 相关注释
}

export interface HighlightInfo {
  x: number
  y: number
  width: number
  height: number
  text: string
  confidence: number // 匹配置信度
}

export interface SearchHistory {
  query: string
  timestamp: number
  resultsCount: number
  options: AdvancedSearchOptions
}

/**
 * 高级搜索管理器
 */
export class AdvancedSearchManager {
  private document: PDFDocumentProxy | null = null
  private searchHistory: SearchHistory[] = []
  private currentResults: AdvancedSearchResult[] = []
  private currentQuery: string = ''
  private maxHistorySize = 50

  constructor(document?: PDFDocumentProxy) {
    if (document) {
      this.setDocument(document)
    }
  }

  /**
   * 设置PDF文档
   */
  setDocument(document: PDFDocumentProxy): void {
    this.document = document
  }

  /**
   * 执行高级搜索
   */
  async search(options: AdvancedSearchOptions): Promise<AdvancedSearchResult[]> {
    if (!this.document || !options.query.trim()) {
      return []
    }

    this.currentQuery = options.query
    const results: AdvancedSearchResult[] = []
    
    try {
      // 搜索所有页面
      for (let pageNum = 1; pageNum <= this.document.numPages; pageNum++) {
        const page = await this.document.getPage(pageNum)
        const pageResults = await this.searchInPage(page, options)
        results.push(...pageResults)
        
        // 限制结果数量
        if (options.maxResults && results.length >= options.maxResults) {
          break
        }
      }

      // 如果启用了书签搜索
      if (options.searchInBookmarks) {
        const bookmarkResults = await this.searchInBookmarks(options)
        results.push(...bookmarkResults)
      }

      this.currentResults = results
      this.addToHistory(options, results.length)
      
      return results
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }

  /**
   * 在单页中搜索
   */
  private async searchInPage(page: PDFPageProxy, options: AdvancedSearchOptions): Promise<AdvancedSearchResult[]> {
    const results: AdvancedSearchResult[] = []
    
    try {
      // 获取页面文本内容
      const textContent = await page.getTextContent()
      const viewport = page.getViewport({ scale: 1.0 })
      
      // 构建完整的页面文本和位置信息
      let fullText = ''
      const textItems: any[] = []
      
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          const startIndex = fullText.length
          fullText += item.str + ' '
          textItems.push({
            ...item,
            startIndex,
            endIndex: fullText.length - 1
          })
        }
      })

      // 执行搜索
      const matches = this.findMatches(fullText, options)
      
      for (const match of matches) {
        // 找到匹配文本对应的位置信息
        const textItem = this.findTextItemForMatch(textItems, match.index, match.text.length)
        if (textItem) {
          // 计算位置信息
          const highlights = this.calculateHighlights([textItem], viewport, match.text)
          
          // 获取上下文
          const context = this.extractContext(fullText, match.index, options.contextLength || 100)
          
          const result: AdvancedSearchResult = {
            pageNumber: page.pageNumber,
            text: match.text,
            position: highlights[0] || { x: 0, y: 0, width: 0, height: 0 },
            matchIndex: results.length,
            totalMatches: 0, // 将在后面更新
            context,
            highlights
          }

          // 如果启用了注释搜索，查找相关注释
          if (options.searchInAnnotations) {
            result.annotations = await this.findRelatedAnnotations(page, result.position)
          }

          results.push(result)
        }
      }
      
    } catch (error) {
      console.warn(`Failed to search in page ${page.pageNumber}:`, error)
    }

    return results
  }

  /**
   * 查找文本匹配
   */
  private findMatches(text: string, options: AdvancedSearchOptions): Array<{ index: number; text: string }> {
    const matches: Array<{ index: number; text: string }> = []
    let searchText = text
    let query = options.query

    // 大小写处理
    if (!options.caseSensitive) {
      searchText = text.toLowerCase()
      query = query.toLowerCase()
    }

    if (options.useRegex) {
      // 正则表达式搜索
      try {
        const flags = options.caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(query, flags)
        let match

        while ((match = regex.exec(searchText)) !== null) {
          matches.push({
            index: match.index,
            text: text.substring(match.index, match.index + match[0].length)
          })
          
          // 防止无限循环
          if (!regex.global) break
        }
      } catch (error) {
        console.warn('Invalid regex pattern:', error)
        return []
      }
    } else {
      // 普通文本搜索
      let startIndex = 0
      while (true) {
        let index = searchText.indexOf(query, startIndex)
        if (index === -1) break

        // 全词匹配检查
        if (options.wholeWords) {
          const beforeChar = index > 0 ? text[index - 1] : ' '
          const afterChar = index + query.length < text.length ? text[index + query.length] : ' '
          
          if (!/\s/.test(beforeChar) || !/\s/.test(afterChar)) {
            startIndex = index + 1
            continue
          }
        }

        matches.push({
          index,
          text: text.substring(index, index + query.length)
        })
        
        startIndex = index + 1
      }
    }

    return matches
  }

  /**
   * 查找匹配文本对应的文本项
   */
  private findTextItemForMatch(textItems: any[], matchIndex: number, matchLength: number): any {
    for (const item of textItems) {
      if (matchIndex >= item.startIndex && matchIndex < item.endIndex) {
        return item
      }
    }
    return null
  }

  /**
   * 计算高亮位置
   */
  private calculateHighlights(textItems: any[], viewport: any, matchText: string): HighlightInfo[] {
    const highlights: HighlightInfo[] = []
    
    textItems.forEach(item => {
      const transform = item.transform
      const x = transform[4]
      const y = viewport.height - transform[5]
      const width = item.width || matchText.length * 8 // 估算宽度
      const height = Math.abs(transform[0]) || 12 // 字体大小

      highlights.push({
        x,
        y: y - height,
        width,
        height,
        text: matchText,
        confidence: 1.0
      })
    })

    return highlights
  }

  /**
   * 提取搜索结果的上下文
   */
  private extractContext(fullText: string, matchIndex: number, contextLength: number): string {
    const start = Math.max(0, matchIndex - contextLength / 2)
    const end = Math.min(fullText.length, matchIndex + contextLength / 2)
    
    let context = fullText.substring(start, end)
    
    // 添加省略号
    if (start > 0) context = '...' + context
    if (end < fullText.length) context = context + '...'
    
    return context.trim()
  }

  /**
   * 查找相关注释
   */
  private async findRelatedAnnotations(page: PDFPageProxy, position: { x: number; y: number; width: number; height: number }): Promise<string[]> {
    try {
      const annotations = await page.getAnnotations()
      const related: string[] = []
      
      annotations.forEach((annotation: any) => {
        if (annotation.rect) {
          const [ax1, ay1, ax2, ay2] = annotation.rect
          const [px1, py1, px2, py2] = [position.x, position.y, position.x + position.width, position.y + position.height]
          
          // 检查是否有重叠
          if (ax1 < px2 && ax2 > px1 && ay1 < py2 && ay2 > py1) {
            if (annotation.contents || annotation.title) {
              related.push(annotation.contents || annotation.title)
            }
          }
        }
      })
      
      return related
    } catch (error) {
      console.warn('Failed to get annotations:', error)
      return []
    }
  }

  /**
   * 在书签中搜索
   */
  private async searchInBookmarks(options: AdvancedSearchOptions): Promise<AdvancedSearchResult[]> {
    // 这里需要与书签管理器集成
    // 暂时返回空数组
    return []
  }

  /**
   * 获取当前搜索结果
   */
  getCurrentResults(): AdvancedSearchResult[] {
    return this.currentResults
  }

  /**
   * 清除搜索结果
   */
  clearResults(): void {
    this.currentResults = []
    this.currentQuery = ''
  }

  /**
   * 添加到搜索历史
   */
  private addToHistory(options: AdvancedSearchOptions, resultsCount: number): void {
    const historyItem: SearchHistory = {
      query: options.query,
      timestamp: Date.now(),
      resultsCount,
      options
    }

    // 移除重复的搜索
    this.searchHistory = this.searchHistory.filter(item => 
      item.query !== options.query || JSON.stringify(item.options) !== JSON.stringify(options)
    )

    this.searchHistory.unshift(historyItem)

    // 限制历史记录大小
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * 获取搜索历史
   */
  getSearchHistory(): SearchHistory[] {
    return this.searchHistory
  }

  /**
   * 清除搜索历史
   */
  clearHistory(): void {
    this.searchHistory = []
  }

  /**
   * 获取搜索建议
   */
  getSearchSuggestions(query: string, limit: number = 10): string[] {
    const suggestions: string[] = []
    const lowerQuery = query.toLowerCase()

    // 从历史记录中获取建议
    this.searchHistory.forEach(item => {
      if (item.query.toLowerCase().includes(lowerQuery) && !suggestions.includes(item.query)) {
        suggestions.push(item.query)
      }
    })

    return suggestions.slice(0, limit)
  }

  /**
   * 导出搜索结果
   */
  exportResults(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.currentResults, null, 2)
      
      case 'csv':
        const headers = ['Page', 'Text', 'Context', 'Position X', 'Position Y']
        const rows = this.currentResults.map(result => [
          result.pageNumber.toString(),
          `"${result.text.replace(/"/g, '""')}"`,
          `"${result.context.replace(/"/g, '""')}"`,
          result.position.x.toString(),
          result.position.y.toString()
        ])
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      
      case 'txt':
        return this.currentResults.map(result => 
          `Page ${result.pageNumber}: ${result.text}\nContext: ${result.context}\n`
        ).join('\n')
      
      default:
        return ''
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.document = null
    this.currentResults = []
    this.searchHistory = []
    this.currentQuery = ''
  }
}

/**
 * 创建高级搜索管理器
 */
export function createAdvancedSearchManager(document?: PDFDocumentProxy): AdvancedSearchManager {
  return new AdvancedSearchManager(document)
}

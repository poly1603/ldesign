/**
 * PDF搜索管理器
 * 提供文本搜索、高亮显示等功能
 */

import type { PDFPageProxy } from 'pdfjs-dist'
import type { SearchOptions, SearchResult } from '../core/types'
import { getPageTextContent, searchInText } from './pdf-utils'

/**
 * 搜索匹配项
 */
interface SearchMatch {
  pageNumber: number
  pageText: string
  matches: Array<{
    index: number
    length: number
    match: string
    context: string
  }>
}

/**
 * PDF搜索管理器
 */
export class PdfSearchManager {
  private searchCache = new Map<number, string>()
  private currentResults: SearchResult[] = []
  private currentQuery = ''
  private currentOptions: SearchOptions | null = null

  /**
   * 搜索PDF文档中的文本
   */
  async searchInDocument(
    getPage: (pageNumber: number) => Promise<PDFPageProxy>,
    totalPages: number,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    this.currentQuery = options.query
    this.currentOptions = options
    this.currentResults = []

    if (!options.query.trim()) {
      return this.currentResults
    }

    const searchPromises: Promise<SearchMatch | null>[] = []

    // 搜索所有页面
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      searchPromises.push(this.searchInPage(getPage, pageNumber, options))
    }

    const searchMatches = await Promise.all(searchPromises)

    // 处理搜索结果
    let globalMatchIndex = 0
    for (const match of searchMatches) {
      if (match && match.matches.length > 0) {
        for (const textMatch of match.matches) {
          this.currentResults.push({
            pageNumber: match.pageNumber,
            text: textMatch.match,
            position: {
              x: 0, // TODO: 计算实际位置
              y: 0,
              width: 0,
              height: 0,
            },
            matchIndex: globalMatchIndex++,
            totalMatches: 0, // 稍后更新
          })
        }
      }
    }

    // 更新总匹配数
    this.currentResults.forEach(result => {
      result.totalMatches = this.currentResults.length
    })

    return this.currentResults
  }

  /**
   * 在单个页面中搜索
   */
  private async searchInPage(
    getPage: (pageNumber: number) => Promise<PDFPageProxy>,
    pageNumber: number,
    options: SearchOptions
  ): Promise<SearchMatch | null> {
    try {
      // 获取页面文本（使用缓存）
      let pageText = this.searchCache.get(pageNumber)
      if (!pageText) {
        const page = await getPage(pageNumber)
        pageText = await getPageTextContent(page)
        this.searchCache.set(pageNumber, pageText)
      }

      // 搜索文本
      const matches = searchInText(
        pageText,
        options.query,
        options.caseSensitive,
        options.wholeWords
      )

      if (matches.length === 0) {
        return null
      }

      // 添加上下文信息
      const matchesWithContext = matches.map(match => ({
        ...match,
        context: this.extractContext(pageText, match.index, match.length),
      }))

      return {
        pageNumber,
        pageText,
        matches: matchesWithContext,
      }
    }
    catch (error) {
      console.warn(`Failed to search in page ${pageNumber}:`, error)
      return null
    }
  }

  /**
   * 提取匹配项的上下文
   */
  private extractContext(text: string, index: number, length: number, contextLength = 50): string {
    const start = Math.max(0, index - contextLength)
    const end = Math.min(text.length, index + length + contextLength)
    
    let context = text.substring(start, end)
    
    // 添加省略号
    if (start > 0) {
      context = '...' + context
    }
    if (end < text.length) {
      context = context + '...'
    }
    
    return context
  }

  /**
   * 获取当前搜索结果
   */
  getCurrentResults(): SearchResult[] {
    return [...this.currentResults]
  }

  /**
   * 获取当前查询
   */
  getCurrentQuery(): string {
    return this.currentQuery
  }

  /**
   * 获取当前搜索选项
   */
  getCurrentOptions(): SearchOptions | null {
    return this.currentOptions ? { ...this.currentOptions } : null
  }

  /**
   * 查找下一个匹配项
   */
  findNext(currentPageNumber: number, currentMatchIndex = -1): SearchResult | null {
    if (this.currentResults.length === 0) {
      return null
    }

    // 查找当前页面之后的匹配项
    for (let i = currentMatchIndex + 1; i < this.currentResults.length; i++) {
      const result = this.currentResults[i]
      if (result.pageNumber >= currentPageNumber) {
        return result
      }
    }

    // 如果没有找到，从第一个匹配项开始
    return this.currentResults[0]
  }

  /**
   * 查找上一个匹配项
   */
  findPrevious(currentPageNumber: number, currentMatchIndex = -1): SearchResult | null {
    if (this.currentResults.length === 0) {
      return null
    }

    // 查找当前页面之前的匹配项
    for (let i = currentMatchIndex - 1; i >= 0; i--) {
      const result = this.currentResults[i]
      if (result.pageNumber <= currentPageNumber) {
        return result
      }
    }

    // 如果没有找到，从最后一个匹配项开始
    return this.currentResults[this.currentResults.length - 1]
  }

  /**
   * 获取指定页面的匹配项
   */
  getPageMatches(pageNumber: number): SearchResult[] {
    return this.currentResults.filter(result => result.pageNumber === pageNumber)
  }

  /**
   * 高亮显示搜索结果
   */
  highlightMatches(
    container: HTMLElement,
    pageNumber: number,
    highlightClass = 'pdf-search-highlight',
    currentMatchClass = 'pdf-search-current'
  ): void {
    // 清除之前的高亮
    this.clearHighlights(container)

    const pageMatches = this.getPageMatches(pageNumber)
    if (pageMatches.length === 0) {
      return
    }

    // TODO: 实现实际的高亮显示逻辑
    // 这需要与文本层集成，在实际的文本元素上添加高亮样式
    console.log(`Highlighting ${pageMatches.length} matches on page ${pageNumber}`)
  }

  /**
   * 清除高亮显示
   */
  clearHighlights(container: HTMLElement): void {
    const highlights = container.querySelectorAll('.pdf-search-highlight, .pdf-search-current')
    highlights.forEach(highlight => {
      const parent = highlight.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight)
        parent.normalize()
      }
    })
  }

  /**
   * 清除搜索缓存
   */
  clearCache(): void {
    this.searchCache.clear()
  }

  /**
   * 清除搜索结果
   */
  clearResults(): void {
    this.currentResults = []
    this.currentQuery = ''
    this.currentOptions = null
  }

  /**
   * 获取搜索统计信息
   */
  getSearchStats(): {
    totalMatches: number
    pagesWithMatches: number
    query: string
    options: SearchOptions | null
  } {
    const pagesWithMatches = new Set(this.currentResults.map(r => r.pageNumber)).size

    return {
      totalMatches: this.currentResults.length,
      pagesWithMatches,
      query: this.currentQuery,
      options: this.currentOptions,
    }
  }

  /**
   * 销毁搜索管理器
   */
  destroy(): void {
    this.clearCache()
    this.clearResults()
  }
}

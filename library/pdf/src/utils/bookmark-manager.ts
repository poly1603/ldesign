/**
 * PDF书签和大纲管理器
 * 提供文档书签和大纲导航功能
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export interface BookmarkItem {
  title: string
  dest?: any // PDF destination
  url?: string
  items?: BookmarkItem[]
  level: number
  page?: number
  bold?: boolean
  italic?: boolean
  color?: [number, number, number] // RGB color
}

export interface OutlineItem extends BookmarkItem {
  id: string
  parentId?: string
  expanded: boolean
}

/**
 * PDF书签管理器
 */
export class PdfBookmarkManager {
  private document: PDFDocumentProxy | null = null
  private bookmarks: BookmarkItem[] = []
  private outline: OutlineItem[] = []

  constructor(document?: PDFDocumentProxy) {
    if (document) {
      this.setDocument(document)
    }
  }

  /**
   * 设置PDF文档
   */
  async setDocument(document: PDFDocumentProxy): Promise<void> {
    this.document = document
    await this.loadBookmarks()
  }

  /**
   * 加载文档书签
   */
  async loadBookmarks(): Promise<BookmarkItem[]> {
    if (!this.document) {
      return []
    }

    try {
      const outline = await this.document.getOutline()
      if (outline) {
        this.bookmarks = await this.processOutline(outline, 0)
        this.outline = this.flattenOutline(this.bookmarks)
      } else {
        // 如果没有书签，尝试生成基于页面的简单大纲
        this.bookmarks = await this.generatePageBasedOutline()
        this.outline = this.flattenOutline(this.bookmarks)
      }
    } catch (error) {
      console.warn('Failed to load bookmarks:', error)
      this.bookmarks = []
      this.outline = []
    }

    return this.bookmarks
  }

  /**
   * 处理PDF大纲数据
   */
  private async processOutline(outline: any[], level: number): Promise<BookmarkItem[]> {
    const items: BookmarkItem[] = []

    for (const item of outline) {
      const bookmark: BookmarkItem = {
        title: item.title || 'Untitled',
        dest: item.dest,
        url: item.url,
        level,
        bold: item.bold,
        italic: item.italic,
        color: item.color,
      }

      // 解析目标页面
      if (item.dest && this.document) {
        try {
          const pageIndex = await this.document.getPageIndex(item.dest[0])
          bookmark.page = pageIndex + 1 // Convert to 1-based
        } catch (error) {
          console.warn('Failed to get page index for bookmark:', error)
        }
      }

      // 处理子项
      if (item.items && item.items.length > 0) {
        bookmark.items = await this.processOutline(item.items, level + 1)
      }

      items.push(bookmark)
    }

    return items
  }

  /**
   * 扁平化大纲结构
   */
  private flattenOutline(bookmarks: BookmarkItem[], parentId?: string): OutlineItem[] {
    const items: OutlineItem[] = []

    bookmarks.forEach((bookmark, index) => {
      const id = parentId ? `${parentId}-${index}` : `${index}`
      const outlineItem: OutlineItem = {
        ...bookmark,
        id,
        parentId,
        expanded: bookmark.level === 0, // 默认展开第一级
      }

      items.push(outlineItem)

      if (bookmark.items && bookmark.items.length > 0) {
        items.push(...this.flattenOutline(bookmark.items, id))
      }
    })

    return items
  }

  /**
   * 生成基于页面的简单大纲
   */
  private async generatePageBasedOutline(): Promise<BookmarkItem[]> {
    if (!this.document) {
      return []
    }

    const numPages = this.document.numPages
    const outline: BookmarkItem[] = []

    // 每5页创建一个组
    const groupSize = 5
    for (let i = 0; i < numPages; i += groupSize) {
      const startPage = i + 1
      const endPage = Math.min(i + groupSize, numPages)
      const title = endPage > startPage 
        ? `Pages ${startPage}-${endPage}`
        : `Page ${startPage}`

      const groupItem: BookmarkItem = {
        title,
        level: 0,
        page: startPage,
        items: []
      }

      // 为组内每一页创建子项
      for (let page = startPage; page <= endPage; page++) {
        groupItem.items!.push({
          title: `Page ${page}`,
          level: 1,
          page
        })
      }

      outline.push(groupItem)
    }

    return outline
  }

  /**
   * 获取书签列表
   */
  getBookmarks(): BookmarkItem[] {
    return this.bookmarks
  }

  /**
   * 获取扁平化的大纲
   */
  getOutline(): OutlineItem[] {
    return this.outline
  }

  /**
   * 展开/折叠大纲项
   */
  toggleOutlineItem(id: string): void {
    const item = this.outline.find(item => item.id === id)
    if (item) {
      item.expanded = !item.expanded
    }
  }

  /**
   * 获取可见的大纲项（考虑展开/折叠状态）
   */
  getVisibleOutlineItems(): OutlineItem[] {
    const visible: OutlineItem[] = []
    const isVisible = new Map<string, boolean>()

    // 标记所有顶级项为可见
    this.outline.forEach(item => {
      if (!item.parentId) {
        isVisible.set(item.id, true)
      }
    })

    // 根据父项的展开状态确定子项的可见性
    this.outline.forEach(item => {
      if (item.parentId) {
        const parent = this.outline.find(p => p.id === item.parentId)
        const parentVisible = isVisible.get(item.parentId!) || false
        isVisible.set(item.id, parentVisible && parent?.expanded === true)
      }
    })

    // 返回可见项
    this.outline.forEach(item => {
      if (isVisible.get(item.id)) {
        visible.push(item)
      }
    })

    return visible
  }

  /**
   * 根据页面查找相关书签
   */
  findBookmarkByPage(pageNumber: number): BookmarkItem | null {
    const findInItems = (items: BookmarkItem[]): BookmarkItem | null => {
      for (const item of items) {
        if (item.page === pageNumber) {
          return item
        }
        if (item.items) {
          const found = findInItems(item.items)
          if (found) return found
        }
      }
      return null
    }

    return findInItems(this.bookmarks)
  }

  /**
   * 搜索书签
   */
  searchBookmarks(query: string): BookmarkItem[] {
    const results: BookmarkItem[] = []
    const lowerQuery = query.toLowerCase()

    const searchInItems = (items: BookmarkItem[]): void => {
      for (const item of items) {
        if (item.title.toLowerCase().includes(lowerQuery)) {
          results.push(item)
        }
        if (item.items) {
          searchInItems(item.items)
        }
      }
    }

    searchInItems(this.bookmarks)
    return results
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.document = null
    this.bookmarks = []
    this.outline = []
  }
}

/**
 * 创建书签管理器实例
 */
export function createBookmarkManager(document?: PDFDocumentProxy): PdfBookmarkManager {
  return new PdfBookmarkManager(document)
}

/**
 * Feather 图标集
 * 简洁优雅的图标库
 */

import type { IconSet, IconDefinition, IconCategory } from '../types'
import { IconCategory as Category } from '../types'

/**
 * Feather 图标集实现
 */
export class FeatherIconSet implements IconSet {
  name = 'feather' as const
  displayName = 'Feather Icons'
  version = '4.29.0'
  author = 'Cole Bemis'
  license = 'MIT'
  icons: Map<string, IconDefinition> = new Map()
  
  constructor() {
    this.loadIcons()
  }
  
  /**
   * 加载图标
   * Feather图标集与Lucide高度相似，这里复用Lucide的图标定义
   */
  private loadIcons(): void {
    const iconDefinitions: IconDefinition[] = [
      // 基础格式化
      {
        name: 'bold',
        svg: '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
        category: Category.FORMAT
      },
      {
        name: 'italic',
        svg: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
        category: Category.FORMAT
      },
      {
        name: 'underline',
        svg: '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
        category: Category.FORMAT
      },
      // 其他常用图标...
      {
        name: 'image',
        svg: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
        category: Category.MEDIA
      },
      {
        name: 'link',
        svg: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        category: Category.EDITOR
      }
    ]
    
    iconDefinitions.forEach(icon => {
      this.icons.set(icon.name, icon)
    })
  }
  
  getIcon(name: string): IconDefinition | null {
    return this.icons.get(name) || null
  }
  
  getAllIcons(): IconDefinition[] {
    return Array.from(this.icons.values())
  }
  
  getIconsByCategory(category: IconCategory): IconDefinition[] {
    return this.getAllIcons().filter(icon => icon.category === category)
  }
  
  searchIcons(query: string): IconDefinition[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllIcons().filter(icon => 
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
}







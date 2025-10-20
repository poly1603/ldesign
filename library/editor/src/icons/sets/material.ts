/**
 * Material Icons 图标集
 * Google Material Design 图标库
 */

import type { IconSet, IconDefinition, IconCategory } from '../types'
import { IconCategory as Category } from '../types'

/**
 * Material 图标集实现
 */
export class MaterialIconSet implements IconSet {
  name = 'material' as const
  displayName = 'Material Icons'
  version = '1.0.0'
  author = 'Google'
  license = 'Apache 2.0'
  icons: Map<string, IconDefinition> = new Map()
  
  constructor() {
    this.loadIcons()
  }
  
  /**
   * 加载图标
   * Material Design 图标通常使用filled样式
   */
  private loadIcons(): void {
    const iconDefinitions: IconDefinition[] = [
      {
        name: 'bold',
        svg: '<path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>',
        category: Category.FORMAT
      },
      {
        name: 'italic',
        svg: '<path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>',
        category: Category.FORMAT
      },
      {
        name: 'underline',
        svg: '<path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>',
        category: Category.FORMAT
      },
      {
        name: 'image',
        svg: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
        category: Category.MEDIA
      },
      {
        name: 'link',
        svg: '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
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







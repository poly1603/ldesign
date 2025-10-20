/**
 * 插件市场系统
 * 浏览、搜索和安装社区插件（概念实现）
 */

import { EventEmitter } from '../core/EventEmitter'
import { getPluginRegistry } from '../core/PluginRegistry'

/**
 * 插件信息
 */
export interface MarketplacePlugin {
  id: string
  name: string
  version: string
  author: string
  description: string
  category: string
  tags: string[]
  downloads: number
  rating: number
  size: number
  icon?: string
  homepage?: string
  repository?: string
  license: string
  dependencies?: string[]
  config?: Record<string, any>
}

/**
 * 插件市场类
 */
export class PluginMarket extends EventEmitter {
  private registry = getPluginRegistry()
  private plugins: Map<string, MarketplacePlugin> = new Map()
  private installed: Set<string> = new Set()
  
  constructor() {
    super()
    this.loadFeaturedPlugins()
  }
  
  /**
   * 加载精选插件
   */
  private loadFeaturedPlugins(): void {
    const featured: MarketplacePlugin[] = [
      {
        id: 'markdown-import',
        name: 'Markdown导入',
        version: '1.0.0',
        author: 'LDesign',
        description: '导入Markdown文件并自动转换为富文本',
        category: 'import-export',
        tags: ['markdown', 'import', 'converter'],
        downloads: 1250,
        rating: 4.8,
        size: 25,
        icon: '📄',
        license: 'MIT',
        config: {
          preserveFormatting: true,
          convertTables: true
        }
      },
      {
        id: 'word-export',
        name: 'Word导出',
        version: '1.2.0',
        author: 'Community',
        description: '将内容导出为Word文档(.docx)',
        category: 'import-export',
        tags: ['word', 'export', 'docx'],
        downloads: 2100,
        rating: 4.6,
        size: 180,
        icon: '📝',
        license: 'MIT'
      },
      {
        id: 'latex-math',
        name: 'LaTeX数学公式',
        version: '2.0.0',
        author: 'MathTeam',
        description: '支持LaTeX数学公式编辑和渲染',
        category: 'formatting',
        tags: ['latex', 'math', 'formula'],
        downloads: 890,
        rating: 4.9,
        size: 120,
        icon: '∑',
        license: 'MIT',
        dependencies: ['katex']
      },
      {
        id: 'syntax-highlight',
        name: '语法高亮增强',
        version: '1.5.0',
        author: 'CodeTeam',
        description: '支持50+编程语言的语法高亮',
        category: 'code',
        tags: ['code', 'highlight', 'syntax'],
        downloads: 3200,
        rating: 4.7,
        size: 250,
        icon: '💻',
        license: 'MIT',
        dependencies: ['prism']
      },
      {
        id: 'chart-diagram',
        name: '图表绘制',
        version: '1.0.0',
        author: 'DataViz',
        description: '插入和编辑各种图表（折线图、柱状图、饼图等）',
        category: 'media',
        tags: ['chart', 'diagram', 'visualization'],
        downloads: 750,
        rating: 4.5,
        size: 200,
        icon: '📊',
        license: 'Apache-2.0',
        dependencies: ['chart.js']
      },
      {
        id: 'git-sync',
        name: 'Git同步',
        version: '0.9.0',
        author: 'DevTools',
        description: '自动同步内容到Git仓库',
        category: 'advanced',
        tags: ['git', 'sync', 'version-control'],
        downloads: 520,
        rating: 4.3,
        size: 85,
        icon: '🔄',
        license: 'MIT'
      },
      {
        id: 'spell-check',
        name: '拼写检查',
        version: '2.1.0',
        author: 'LanguageTools',
        description: '实时拼写和语法检查',
        category: 'tool',
        tags: ['spell', 'grammar', 'check'],
        downloads: 1800,
        rating: 4.4,
        size: 60,
        icon: '✓',
        license: 'MIT'
      },
      {
        id: 'voice-input',
        name: '语音输入',
        version: '1.0.0',
        author: 'VoiceTech',
        description: '支持语音输入和语音转文字',
        category: 'input',
        tags: ['voice', 'speech', 'input'],
        downloads: 650,
        rating: 4.2,
        size: 110,
        icon: '🎤',
        license: 'MIT'
      }
    ]
    
    featured.forEach(plugin => {
      this.plugins.set(plugin.id, plugin)
    })
  }
  
  /**
   * 搜索插件
   */
  search(query: string): MarketplacePlugin[] {
    const lowerQuery = query.toLowerCase()
    
    return Array.from(this.plugins.values()).filter(plugin => 
      plugin.name.toLowerCase().includes(lowerQuery) ||
      plugin.description.toLowerCase().includes(lowerQuery) ||
      plugin.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
  
  /**
   * 按分类获取插件
   */
  getByCategory(category: string): MarketplacePlugin[] {
    return Array.from(this.plugins.values()).filter(p => p.category === category)
  }
  
  /**
   * 获取推荐插件
   */
  getRecommended(limit: number = 6): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .sort((a, b) => b.rating * b.downloads - a.rating * a.downloads)
      .slice(0, limit)
  }
  
  /**
   * 获取热门插件
   */
  getPopular(limit: number = 6): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit)
  }
  
  /**
   * 获取最新插件
   */
  getLatest(limit: number = 6): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .slice(-limit)
      .reverse()
  }
  
  /**
   * 安装插件（模拟）
   */
  async install(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }
    
    if (this.installed.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already installed`)
    }
    
    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        // 检查依赖是否已安装
        console.log(`Checking dependency: ${dep}`)
      }
    }
    
    // 模拟安装过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.installed.add(pluginId)
    this.emit('plugin:installed', plugin)
    
    return true
  }
  
  /**
   * 卸载插件
   */
  async uninstall(pluginId: string): Promise<boolean> {
    if (!this.installed.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is not installed`)
    }
    
    this.installed.delete(pluginId)
    this.emit('plugin:uninstalled', { id: pluginId })
    
    return true
  }
  
  /**
   * 检查是否已安装
   */
  isInstalled(pluginId: string): boolean {
    return this.installed.has(pluginId)
  }
  
  /**
   * 获取已安装插件
   */
  getInstalled(): MarketplacePlugin[] {
    return Array.from(this.installed)
      .map(id => this.plugins.get(id))
      .filter(Boolean) as MarketplacePlugin[]
  }
  
  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    installed: number
    available: number
    categories: string[]
  } {
    const categories = new Set(Array.from(this.plugins.values()).map(p => p.category))
    
    return {
      total: this.plugins.size,
      installed: this.installed.size,
      available: this.plugins.size - this.installed.size,
      categories: Array.from(categories)
    }
  }
}

// 全局实例
let marketInstance: PluginMarket | null = null

/**
 * 获取插件市场实例
 */
export function getPluginMarket(): PluginMarket {
  if (!marketInstance) {
    marketInstance = new PluginMarket()
  }
  return marketInstance
}




/**
 * 插件市场面板
 * 可视化浏览和安装插件
 */

import { getPluginMarket, type MarketplacePlugin } from '../marketplace/PluginMarket'
import { getComponentFactory } from './base/ComponentFactory'
import { Modal } from './base/Modal'
import { ui } from '../utils/simplify'

/**
 * 插件市场面板类
 */
export class PluginMarketPanel {
  private market = getPluginMarket()
  private componentFactory = getComponentFactory()
  private modal: Modal | null = null
  private currentView: 'featured' | 'popular' | 'installed' | 'search' = 'featured'
  private searchQuery: string = ''
  
  /**
   * 显示市场面板
   */
  show(): void {
    this.modal = new Modal({
      title: '🛒 插件市场',
      width: '900px',
      height: '600px'
    })
    
    const content = this.createContent()
    this.modal.setContent(content)
    this.modal.show()
  }
  
  /**
   * 创建内容
   */
  private createContent(): HTMLElement {
    const container = document.createElement('div')
    container.style.cssText = `
      display: grid;
      grid-template-columns: 200px 1fr;
      height: 100%;
    `
    
    // 侧边栏
    const sidebar = this.createSidebar()
    container.appendChild(sidebar)
    
    // 主内容区
    const main = this.createMain()
    container.appendChild(main)
    
    return container
  }
  
  /**
   * 创建侧边栏
   */
  private createSidebar(): HTMLElement {
    const sidebar = document.createElement('div')
    sidebar.className = 'market-sidebar'
    sidebar.style.cssText = `
      border-right: 1px solid var(--editor-color-border, #e5e7eb);
      padding: 16px;
    `
    
    const menuItems = [
      { id: 'featured', label: '🌟 精选', view: 'featured' as const },
      { id: 'popular', label: '🔥 热门', view: 'popular' as const },
      { id: 'installed', label: '📦 已安装', view: 'installed' as const }
    ]
    
    menuItems.forEach(item => {
      const menuItem = document.createElement('div')
      menuItem.className = 'menu-item'
      menuItem.textContent = item.label
      menuItem.style.cssText = `
        padding: 12px;
        cursor: pointer;
        border-radius: 6px;
        margin-bottom: 4px;
        transition: all 0.2s;
        ${this.currentView === item.view ? 'background: var(--editor-color-primary, #3b82f6); color: white;' : ''}
      `
      
      menuItem.addEventListener('click', () => {
        this.currentView = item.view
        this.refreshMain()
      })
      
      sidebar.appendChild(menuItem)
    })
    
    // 统计信息
    const stats = this.market.getStats()
    const statsEl = document.createElement('div')
    statsEl.style.cssText = `
      margin-top: 20px;
      padding: 12px;
      background: var(--editor-color-background-paper, #f9fafb);
      border-radius: 6px;
      font-size: 12px;
    `
    statsEl.innerHTML = `
      <div style="margin-bottom: 4px;">总插件: ${stats.total}</div>
      <div style="margin-bottom: 4px;">已安装: ${stats.installed}</div>
      <div>可用: ${stats.available}</div>
    `
    sidebar.appendChild(statsEl)
    
    return sidebar
  }
  
  /**
   * 创建主内容区
   */
  private createMain(): HTMLElement {
    const main = document.createElement('div')
    main.id = 'market-main'
    main.className = 'market-main'
    main.style.cssText = `
      padding: 20px;
      overflow-y: auto;
    `
    
    // 搜索框
    const searchBox = this.componentFactory.createInput({
      placeholder: '搜索插件...',
      onChange: (value) => {
        this.searchQuery = value
        if (value) {
          this.currentView = 'search'
        }
        this.refreshMain()
      }
    })
    main.appendChild(searchBox)
    
    // 插件列表容器
    const listContainer = document.createElement('div')
    listContainer.id = 'plugin-list'
    listContainer.style.cssText = 'margin-top: 20px;'
    main.appendChild(listContainer)
    
    this.renderPluginList(listContainer)
    
    return main
  }
  
  /**
   * 渲染插件列表
   */
  private renderPluginList(container: HTMLElement): void {
    container.innerHTML = ''
    
    let plugins: MarketplacePlugin[] = []
    
    switch (this.currentView) {
      case 'featured':
        plugins = this.market.getRecommended()
        break
      case 'popular':
        plugins = this.market.getPopular()
        break
      case 'installed':
        plugins = this.market.getInstalled()
        break
      case 'search':
        plugins = this.market.search(this.searchQuery)
        break
    }
    
    if (plugins.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">暂无插件</p>'
      return
    }
    
    plugins.forEach(plugin => {
      const card = this.createPluginCard(plugin)
      container.appendChild(card)
    })
  }
  
  /**
   * 创建插件卡片
   */
  private createPluginCard(plugin: MarketplacePlugin): HTMLElement {
    const card = document.createElement('div')
    card.className = 'plugin-card'
    card.style.cssText = `
      border: 1px solid var(--editor-color-border, #e5e7eb);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.2s;
    `
    
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
      card.style.borderColor = 'var(--editor-color-primary, #3b82f6)'
    })
    
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = 'none'
      card.style.borderColor = 'var(--editor-color-border, #e5e7eb)'
    })
    
    const isInstalled = this.market.isInstalled(plugin.id)
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 24px;">${plugin.icon || '🔌'}</span>
            <h3 style="font-size: 18px; font-weight: 600; margin: 0;">${plugin.name}</h3>
            <span style="font-size: 12px; color: #6b7280;">v${plugin.version}</span>
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${plugin.description}</div>
          <div style="display: flex; gap: 16px; font-size: 12px; color: #9ca3af;">
            <span>⭐ ${plugin.rating.toFixed(1)}</span>
            <span>📥 ${plugin.downloads}</span>
            <span>📦 ${plugin.size}KB</span>
            <span>👤 ${plugin.author}</span>
          </div>
        </div>
        <div id="btn-${plugin.id}"></div>
      </div>
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        ${plugin.tags.map(tag => `
          <span style="padding: 2px 8px; background: #f3f4f6; border-radius: 3px; font-size: 11px; color: #6b7280;">
            ${tag}
          </span>
        `).join('')}
      </div>
    `
    
    // 添加安装/卸载按钮
    const btnContainer = card.querySelector(`#btn-${plugin.id}`)
    if (btnContainer) {
      if (isInstalled) {
        const uninstallBtn = this.componentFactory.createButton({
          label: '卸载',
          type: 'secondary',
          size: 'small',
          onClick: () => this.uninstallPlugin(plugin.id)
        })
        btnContainer.appendChild(uninstallBtn)
      } else {
        const installBtn = this.componentFactory.createButton({
          label: '安装',
          type: 'primary',
          size: 'small',
          onClick: () => this.installPlugin(plugin.id)
        })
        btnContainer.appendChild(installBtn)
      }
    }
    
    return card
  }
  
  /**
   * 安装插件
   */
  private async installPlugin(pluginId: string): Promise<void> {
    try {
      ui.toast('正在安装...', 'info')
      await this.market.install(pluginId)
      ui.toast('安装成功！', 'success')
      this.refreshMain()
    } catch (error) {
      ui.toast('安装失败：' + (error as Error).message, 'error')
    }
  }
  
  /**
   * 卸载插件
   */
  private async uninstallPlugin(pluginId: string): Promise<void> {
    if (!confirm('确定要卸载这个插件吗？')) return
    
    try {
      await this.market.uninstall(pluginId)
      ui.toast('卸载成功！', 'success')
      this.refreshMain()
    } catch (error) {
      ui.toast('卸载失败：' + (error as Error).message, 'error')
    }
  }
  
  /**
   * 刷新主内容区
   */
  private refreshMain(): void {
    const listContainer = document.getElementById('plugin-list')
    if (listContainer) {
      this.renderPluginList(listContainer)
    }
  }
}

/**
 * 显示插件市场
 */
export function showPluginMarket(): PluginMarketPanel {
  const panel = new PluginMarketPanel()
  panel.show()
  return panel
}




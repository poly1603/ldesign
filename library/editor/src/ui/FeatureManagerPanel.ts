/**
 * 功能管理面板
 * 可视化管理编辑器的所有功能
 */

import { getFeatureFlags, FeatureCategory, type Feature } from '../core/FeatureFlags'
import { getPluginRegistry } from '../core/PluginRegistry'
import { getLazyLoader } from '../core/LazyLoader'
import { getComponentFactory } from './base/ComponentFactory'
import { Modal } from './base/Modal'

/**
 * 功能管理面板类
 */
export class FeatureManagerPanel {
  private featureFlags = getFeatureFlags()
  private pluginRegistry = getPluginRegistry()
  private lazyLoader = getLazyLoader()
  private componentFactory = getComponentFactory()
  private modal: Modal | null = null
  private container: HTMLElement | null = null
  
  /**
   * 显示面板
   */
  show(): void {
    this.modal = new Modal({
      title: '功能管理',
      width: '800px',
      height: 'auto'
    })
    
    const content = this.createContent()
    this.modal.setContent(content)
    this.modal.setFooter(this.createFooter())
    this.modal.show()
  }
  
  /**
   * 隐藏面板
   */
  hide(): void {
    if (this.modal) {
      this.modal.hide()
      this.modal = null
    }
  }
  
  /**
   * 创建内容
   */
  private createContent(): HTMLElement {
    this.container = document.createElement('div')
    this.container.className = 'feature-manager'
    this.container.style.cssText = `
      padding: 20px;
      max-height: 70vh;
      overflow-y: auto;
    `
    
    // 统计信息
    const stats = this.createStats()
    this.container.appendChild(stats)
    
    this.container.appendChild(this.componentFactory.createDivider())
    
    // 功能列表（按分类）
    const categories = Object.values(FeatureCategory)
    
    categories.forEach(category => {
      const features = this.featureFlags.getByCategory(category)
      if (features.length === 0) return
      
      const section = this.createCategorySection(category, features)
      this.container.appendChild(section)
    })
    
    return this.container
  }
  
  /**
   * 创建统计信息
   */
  private createStats(): HTMLElement {
    const stats = this.featureFlags.getStats()
    const pluginStats = this.pluginRegistry.getStats()
    const loaderStats = this.lazyLoader.getStats()
    
    const card = this.componentFactory.createCard({
      title: '功能统计',
      className: 'stats-card'
    })
    
    const statsGrid = document.createElement('div')
    statsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    `
    
    const statItems = [
      { label: '总功能数', value: stats.total, color: '#3b82f6' },
      { label: '已启用', value: stats.enabled, color: '#10b981' },
      { label: '已禁用', value: stats.disabled, color: '#6b7280' },
      { label: '已加载', value: stats.loaded, color: '#8b5cf6' },
      { label: '懒加载', value: stats.lazy, color: '#f59e0b' },
      { label: '插件总数', value: pluginStats.total, color: '#3b82f6' },
      { label: '活跃插件', value: pluginStats.loaded, color: '#10b981' },
      { label: '加载队列', value: loaderStats.queued, color: '#f59e0b' }
    ]
    
    statItems.forEach(({ label, value, color }) => {
      const item = document.createElement('div')
      item.style.cssText = `
        text-align: center;
        padding: 12px;
        background: var(--editor-color-background-paper, #f9fafb);
        border-radius: 6px;
      `
      item.innerHTML = `
        <div style="font-size: 24px; font-weight: 700; color: ${color}; margin-bottom: 4px;">${value}</div>
        <div style="font-size: 12px; color: #6b7280;">${label}</div>
      `
      statsGrid.appendChild(item)
    })
    
    const cardContent = card.querySelector('.card-content')
    if (cardContent) {
      cardContent.appendChild(statsGrid)
    }
    
    return card
  }
  
  /**
   * 创建分类区块
   */
  private createCategorySection(category: FeatureCategory, features: Feature[]): HTMLElement {
    const section = document.createElement('div')
    section.className = 'category-section'
    section.style.cssText = `
      margin-bottom: 24px;
    `
    
    // 分类标题
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--editor-color-border, #e5e7eb);
    `
    
    const categoryNames: Record<FeatureCategory, string> = {
      [FeatureCategory.CORE]: '🎯 核心功能',
      [FeatureCategory.FORMAT]: '🎨 格式化',
      [FeatureCategory.INSERT]: '➕ 插入',
      [FeatureCategory.MEDIA]: '🖼️ 媒体',
      [FeatureCategory.TABLE]: '📊 表格',
      [FeatureCategory.AI]: '🤖 AI',
      [FeatureCategory.TOOL]: '🔧 工具',
      [FeatureCategory.ADVANCED]: '⚙️ 高级'
    }
    
    header.innerHTML = `
      <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${categoryNames[category]}</h3>
      <div style="display: flex; gap: 8px;"></div>
    `
    
    // 批量操作按钮
    const actions = header.querySelector('div')
    
    const enableAllBtn = this.componentFactory.createButton({
      label: '全部启用',
      type: 'text',
      size: 'small',
      onClick: () => {
        this.features.enableCategory(category)
        this.refreshCategorySection(section, category)
      }
    })
    
    const disableAllBtn = this.componentFactory.createButton({
      label: '全部禁用',
      type: 'text',
      size: 'small',
      onClick: () => {
        this.features.disableCategory(category)
        this.refreshCategorySection(section, category)
      }
    })
    
    actions?.appendChild(enableAllBtn)
    actions?.appendChild(disableAllBtn)
    
    section.appendChild(header)
    
    // 功能列表
    const list = document.createElement('div')
    list.className = 'feature-list'
    list.style.cssText = `
      display: grid;
      gap: 8px;
    `
    
    features.forEach(feature => {
      const item = this.createFeatureItem(feature)
      list.appendChild(item)
    })
    
    section.appendChild(list)
    
    return section
  }
  
  /**
   * 创建功能项
   */
  private createFeatureItem(feature: Feature): HTMLElement {
    const item = document.createElement('div')
    item.className = 'feature-item'
    item.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--editor-color-background-paper, #f9fafb);
      border-radius: 6px;
      transition: all 0.2s;
    `
    
    item.addEventListener('mouseenter', () => {
      item.style.background = 'var(--editor-color-toolbar-button-hover, #e5e7eb)'
    })
    
    item.addEventListener('mouseleave', () => {
      item.style.background = 'var(--editor-color-background-paper, #f9fafb)'
    })
    
    const info = document.createElement('div')
    info.style.cssText = 'flex: 1;'
    
    const isLoaded = this.featureFlags.isLoaded(feature.id)
    
    info.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-weight: 600; font-size: 14px;">${feature.name}</span>
        ${feature.lazy ? '<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">懒加载</span>' : ''}
        ${isLoaded ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">已加载</span>' : ''}
      </div>
      ${feature.description ? `<div style="font-size: 12px; color: #6b7280;">${feature.description}</div>` : ''}
      ${feature.dependencies ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">依赖: ${feature.dependencies.join(', ')}</div>` : ''}
    `
    
    const toggle = this.createToggle(feature)
    
    item.appendChild(info)
    item.appendChild(toggle)
    
    return item
  }
  
  /**
   * 创建开关
   */
  private createToggle(feature: Feature): HTMLElement {
    const container = document.createElement('label')
    container.className = 'feature-toggle'
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    `
    
    const switchEl = document.createElement('div')
    switchEl.className = 'toggle-switch'
    switchEl.style.cssText = `
      width: 44px;
      height: 24px;
      background: ${feature.enabled ? '#10b981' : '#d1d5db'};
      border-radius: 12px;
      position: relative;
      transition: all 0.2s;
    `
    
    const knob = document.createElement('div')
    knob.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: ${feature.enabled ? '22px' : '2px'};
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `
    
    switchEl.appendChild(knob)
    
    container.addEventListener('click', () => {
      const newState = this.featureFlags.toggle(feature.id)
      switchEl.style.background = newState ? '#10b981' : '#d1d5db'
      knob.style.left = newState ? '22px' : '2px'
    })
    
    container.appendChild(switchEl)
    
    return container
  }
  
  /**
   * 刷新分类区块
   */
  private refreshCategorySection(section: HTMLElement, category: FeatureCategory): void {
    const list = section.querySelector('.feature-list')
    if (!list) return
    
    list.innerHTML = ''
    const features = this.featureFlags.getByCategory(category)
    
    features.forEach(feature => {
      const item = this.createFeatureItem(feature)
      list.appendChild(item)
    })
  }
  
  /**
   * 创建底部按钮
   */
  private createFooter(): HTMLElement {
    const footer = document.createElement('div')
    footer.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 16px 20px;
      border-top: 1px solid var(--editor-color-border, #e5e7eb);
    `
    
    const leftButtons = document.createElement('div')
    leftButtons.style.cssText = 'display: flex; gap: 8px;'
    
    const exportBtn = this.componentFactory.createButton({
      label: '导出配置',
      icon: 'download',
      type: 'secondary',
      onClick: () => this.exportConfig()
    })
    
    const importBtn = this.componentFactory.createButton({
      label: '导入配置',
      icon: 'upload',
      type: 'secondary',
      onClick: () => this.importConfig()
    })
    
    const resetBtn = this.componentFactory.createButton({
      label: '重置',
      icon: 'refresh-cw',
      type: 'secondary',
      onClick: () => this.resetConfig()
    })
    
    leftButtons.appendChild(exportBtn)
    leftButtons.appendChild(importBtn)
    leftButtons.appendChild(resetBtn)
    
    const rightButtons = document.createElement('div')
    rightButtons.style.cssText = 'display: flex; gap: 8px;'
    
    const applyBtn = this.componentFactory.createButton({
      label: '应用',
      type: 'primary',
      onClick: () => this.applyChanges()
    })
    
    const closeBtn = this.componentFactory.createButton({
      label: '关闭',
      type: 'secondary',
      onClick: () => this.hide()
    })
    
    rightButtons.appendChild(applyBtn)
    rightButtons.appendChild(closeBtn)
    
    footer.appendChild(leftButtons)
    footer.appendChild(rightButtons)
    
    return footer
  }
  
  /**
   * 导出配置
   */
  private exportConfig(): void {
    const config = {
      features: this.featureFlags.exportConfig(),
      plugins: this.pluginRegistry.exportConfig()
    }
    
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feature-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  /**
   * 导入配置
   */
  private importConfig(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const config = JSON.parse(text)
        
        if (config.features) {
          this.featureFlags.importConfig(config.features)
        }
        
        if (config.plugins) {
          this.pluginRegistry.importConfig(config.plugins)
        }
        
        alert('配置导入成功！')
        this.hide()
        this.show()
      } catch (error) {
        alert('配置导入失败：' + (error as Error).message)
      }
    })
    
    input.click()
  }
  
  /**
   * 重置配置
   */
  private resetConfig(): void {
    if (!confirm('确定要重置所有功能配置吗？')) return
    
    this.featureFlags.reset()
    this.pluginRegistry.reset()
    
    this.hide()
    this.show()
  }
  
  /**
   * 应用更改
   */
  private async applyChanges(): Promise<void> {
    // 保存配置
    const config = {
      features: this.featureFlags.exportConfig(),
      plugins: this.pluginRegistry.exportConfig()
    }
    
    localStorage.setItem('editor-feature-config', JSON.stringify(config))
    
    alert('配置已保存！刷新页面后生效。')
    this.hide()
  }
}

/**
 * 显示功能管理面板
 */
export function showFeatureManager(): FeatureManagerPanel {
  const panel = new FeatureManagerPanel()
  panel.show()
  return panel
}





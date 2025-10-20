/**
 * 设置面板
 * 提供可视化的编辑器配置界面
 */

import { getConfigManager, type ConfigManager } from '../config/ConfigManager'
import { getComponentFactory, type ComponentFactory } from './base/ComponentFactory'
import { Modal } from './base/Modal'
import type { Theme } from '../theme'

/**
 * 设置面板选项
 */
export interface SettingsPanelOptions {
  width?: string
  height?: string
  onClose?: () => void
  onSave?: (config: any) => void
}

/**
 * 设置面板类
 */
export class SettingsPanel {
  private configManager: ConfigManager
  private componentFactory: ComponentFactory
  private modal: Modal | null = null
  private options: SettingsPanelOptions
  private container: HTMLElement | null = null
  
  // 临时配置（用于预览）
  private tempConfig = {
    iconSet: '',
    theme: '',
    locale: ''
  }
  
  constructor(options: SettingsPanelOptions = {}) {
    this.options = options
    this.configManager = getConfigManager()
    this.componentFactory = getComponentFactory()
    
    // 初始化临时配置
    this.tempConfig = {
      iconSet: this.configManager.getIconSet(),
      theme: this.configManager.getThemeManager().getCurrentThemeName(),
      locale: this.configManager.getLocale()
    }
  }
  
  /**
   * 显示设置面板
   */
  show(): void {
    // 创建模态框
    this.modal = new Modal({
      title: this.configManager.t('editor.settings.title') || '编辑器设置',
      width: this.options.width || '600px',
      height: this.options.height || 'auto',
      onClose: () => {
        this.handleClose()
      }
    })
    
    // 创建内容
    const content = this.createContent()
    this.modal.setContent(content)
    
    // 添加底部按钮
    this.modal.setFooter(this.createFooter())
    
    this.modal.show()
  }
  
  /**
   * 隐藏设置面板
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
    this.container.className = 'settings-panel'
    this.container.style.cssText = `
      padding: 20px;
      max-height: 70vh;
      overflow-y: auto;
    `
    
    // 创建选项卡
    const tabs = this.createTabs()
    this.container.appendChild(tabs)
    
    return this.container
  }
  
  /**
   * 创建选项卡
   */
  private createTabs(): HTMLElement {
    const tabsContainer = document.createElement('div')
    tabsContainer.className = 'settings-tabs'
    
    const tabButtons = document.createElement('div')
    tabButtons.className = 'tab-buttons'
    tabButtons.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--editor-color-border, #e5e7eb);
    `
    
    const tabContents = document.createElement('div')
    tabContents.className = 'tab-contents'
    
    const tabs = [
      {
        id: 'appearance',
        label: this.configManager.t('editor.settings.appearance') || '外观',
        content: this.createAppearanceTab()
      },
      {
        id: 'icons',
        label: this.configManager.t('editor.settings.icons') || '图标',
        content: this.createIconsTab()
      },
      {
        id: 'language',
        label: this.configManager.t('editor.settings.language') || '语言',
        content: this.createLanguageTab()
      },
      {
        id: 'advanced',
        label: this.configManager.t('editor.settings.advanced') || '高级',
        content: this.createAdvancedTab()
      }
    ]
    
    // 创建选项卡按钮
    tabs.forEach((tab, index) => {
      const button = this.componentFactory.createButton({
        label: tab.label,
        type: 'text',
        className: index === 0 ? 'active' : ''
      })
      
      button.style.cssText += `
        border-bottom: 2px solid transparent;
        border-radius: 0;
        padding: 12px 16px;
      `
      
      button.addEventListener('click', () => {
        // 更新按钮状态
        tabButtons.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active')
          btn.style.borderBottomColor = 'transparent'
          btn.style.color = 'var(--editor-color-text-secondary, #6b7280)'
        })
        button.classList.add('active')
        button.style.borderBottomColor = 'var(--editor-color-primary, #3b82f6)'
        button.style.color = 'var(--editor-color-primary, #3b82f6)'
        
        // 更新内容
        tabContents.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('active')
          ;(pane as HTMLElement).style.display = 'none'
        })
        tab.content.classList.add('active')
        tab.content.style.display = 'block'
      })
      
      tabButtons.appendChild(button)
      
      // 设置初始显示状态
      tab.content.style.display = index === 0 ? 'block' : 'none'
      tabContents.appendChild(tab.content)
    })
    
    // 激活第一个选项卡
    const firstButton = tabButtons.querySelector('button')
    if (firstButton) {
      (firstButton as HTMLButtonElement).style.borderBottomColor = 'var(--editor-color-primary, #3b82f6)'
      ;(firstButton as HTMLButtonElement).style.color = 'var(--editor-color-primary, #3b82f6)'
    }
    
    tabsContainer.appendChild(tabButtons)
    tabsContainer.appendChild(tabContents)
    
    return tabsContainer
  }
  
  /**
   * 创建外观选项卡
   */
  private createAppearanceTab(): HTMLElement {
    const pane = document.createElement('div')
    pane.className = 'tab-pane'
    
    // 主题选择
    const themeGroup = this.componentFactory.createFormGroup(
      this.configManager.t('editor.settings.theme') || '主题',
      this.componentFactory.createSelect({
        options: this.configManager.getAvailableThemes().map(theme => ({
          label: theme,
          value: theme
        })),
        value: this.tempConfig.theme,
        onChange: (value) => {
          this.tempConfig.theme = String(value)
          this.previewTheme(String(value))
        }
      })
    )
    
    pane.appendChild(themeGroup)
    
    // 主题预览
    const previewCard = this.createThemePreview()
    pane.appendChild(previewCard)
    
    // 自动跟随系统主题
    const followSystemCheck = this.componentFactory.createCheckbox(
      this.configManager.t('editor.settings.followSystem') || '跟随系统主题',
      false,
      (checked) => {
        if (checked) {
          this.configManager.getThemeManager().followSystemTheme()
        }
      }
    )
    pane.appendChild(followSystemCheck)
    
    return pane
  }
  
  /**
   * 创建图标选项卡
   */
  private createIconsTab(): HTMLElement {
    const pane = document.createElement('div')
    pane.className = 'tab-pane'
    
    // 图标集选择
    const iconSetGroup = this.componentFactory.createFormGroup(
      this.configManager.t('editor.settings.iconSet') || '图标集',
      this.componentFactory.createSelect({
        options: this.configManager.getAvailableIconSets().map(set => ({
          label: set,
          value: set
        })),
        value: this.tempConfig.iconSet,
        onChange: (value) => {
          this.tempConfig.iconSet = String(value)
          this.previewIcons(String(value))
        }
      })
    )
    
    pane.appendChild(iconSetGroup)
    
    // 图标预览
    const previewCard = this.createIconPreview()
    pane.appendChild(previewCard)
    
    return pane
  }
  
  /**
   * 创建语言选项卡
   */
  private createLanguageTab(): HTMLElement {
    const pane = document.createElement('div')
    pane.className = 'tab-pane'
    
    const localeMap: Record<string, string> = {
      'zh-CN': '简体中文',
      'en-US': 'English',
      'ja-JP': '日本語'
    }
    
    // 语言选择
    const localeGroup = this.componentFactory.createFormGroup(
      this.configManager.t('editor.settings.locale') || '语言',
      this.componentFactory.createSelect({
        options: this.configManager.getAvailableLocales().map(locale => ({
          label: localeMap[locale] || locale,
          value: locale
        })),
        value: this.tempConfig.locale,
        onChange: (value) => {
          this.tempConfig.locale = String(value)
          // 语言切换需要重新加载界面
        }
      })
    )
    
    pane.appendChild(localeGroup)
    
    // 说明文本
    const note = document.createElement('p')
    note.style.cssText = `
      margin-top: 16px;
      padding: 12px;
      background: var(--editor-color-background-paper, #f9fafb);
      border-radius: 6px;
      font-size: 14px;
      color: var(--editor-color-text-secondary, #6b7280);
    `
    note.textContent = this.configManager.t('editor.settings.localeNote') || '更改语言后需要保存设置才能生效'
    pane.appendChild(note)
    
    return pane
  }
  
  /**
   * 创建高级选项卡
   */
  private createAdvancedTab(): HTMLElement {
    const pane = document.createElement('div')
    pane.className = 'tab-pane'
    
    // 导出配置
    const exportCard = this.componentFactory.createCard({
      title: this.configManager.t('editor.settings.exportConfig') || '导出配置',
      content: (() => {
        const container = document.createElement('div')
        
        const desc = document.createElement('p')
        desc.style.cssText = `
          margin-bottom: 12px;
          font-size: 14px;
          color: var(--editor-color-text-secondary, #6b7280);
        `
        desc.textContent = '将当前配置导出为JSON文件'
        container.appendChild(desc)
        
        const exportBtn = this.componentFactory.createButton({
          label: '导出配置',
          icon: 'download',
          type: 'secondary',
          onClick: () => this.exportConfig()
        })
        container.appendChild(exportBtn)
        
        return container
      })()
    })
    
    pane.appendChild(exportCard)
    pane.appendChild(this.componentFactory.createDivider())
    
    // 导入配置
    const importCard = this.componentFactory.createCard({
      title: this.configManager.t('editor.settings.importConfig') || '导入配置',
      content: (() => {
        const container = document.createElement('div')
        
        const desc = document.createElement('p')
        desc.style.cssText = `
          margin-bottom: 12px;
          font-size: 14px;
          color: var(--editor-color-text-secondary, #6b7280);
        `
        desc.textContent = '从JSON文件导入配置'
        container.appendChild(desc)
        
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = '.json'
        fileInput.style.display = 'none'
        fileInput.addEventListener('change', (e) => this.importConfig(e))
        
        const importBtn = this.componentFactory.createButton({
          label: '选择文件',
          icon: 'upload',
          type: 'secondary',
          onClick: () => fileInput.click()
        })
        
        container.appendChild(fileInput)
        container.appendChild(importBtn)
        
        return container
      })()
    })
    
    pane.appendChild(importCard)
    pane.appendChild(this.componentFactory.createDivider())
    
    // 重置配置
    const resetCard = this.componentFactory.createCard({
      title: this.configManager.t('editor.settings.resetConfig') || '重置配置',
      content: (() => {
        const container = document.createElement('div')
        
        const desc = document.createElement('p')
        desc.style.cssText = `
          margin-bottom: 12px;
          font-size: 14px;
          color: var(--editor-color-error, #ef4444);
        `
        desc.textContent = '将所有设置恢复为默认值'
        container.appendChild(desc)
        
        const resetBtn = this.componentFactory.createButton({
          label: '重置为默认',
          icon: 'refresh-cw',
          type: 'danger',
          onClick: () => this.resetConfig()
        })
        container.appendChild(resetBtn)
        
        return container
      })()
    })
    
    pane.appendChild(resetCard)
    
    return pane
  }
  
  /**
   * 创建主题预览
   */
  private createThemePreview(): HTMLElement {
    const card = this.componentFactory.createCard({
      title: '预览',
      className: 'theme-preview'
    })
    
    const preview = document.createElement('div')
    preview.style.cssText = `
      padding: 16px;
      border-radius: 6px;
      background: var(--editor-color-editor-background, #ffffff);
      color: var(--editor-color-editor-text, #1f2937);
    `
    
    preview.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: 600;">示例文本</div>
      <div style="margin-bottom: 8px; color: var(--editor-color-text-secondary, #6b7280);">次要文本</div>
      <div style="padding: 8px; background: var(--editor-color-code-background, #f3f4f6); border-radius: 4px;">
        <code>代码示例</code>
      </div>
    `
    
    card.querySelector('.card-content')?.appendChild(preview)
    
    return card
  }
  
  /**
   * 创建图标预览
   */
  private createIconPreview(): HTMLElement {
    const card = this.componentFactory.createCard({
      title: '图标预览',
      className: 'icon-preview'
    })
    
    const preview = document.createElement('div')
    preview.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 12px;
      padding: 16px;
    `
    
    const iconManager = this.configManager.getIconManager()
    const sampleIcons = ['bold', 'italic', 'underline', 'link', 'image', 'code', 'list', 'quote']
    
    sampleIcons.forEach(iconName => {
      const iconEl = iconManager.createIconElement(iconName, { size: 24 })
      iconEl.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        border-radius: 6px;
        background: var(--editor-color-background-paper, #f9fafb);
        cursor: pointer;
        transition: all 0.2s;
      `
      
      iconEl.addEventListener('mouseenter', () => {
        iconEl.style.background = 'var(--editor-color-toolbar-button-hover, #e5e7eb)'
      })
      
      iconEl.addEventListener('mouseleave', () => {
        iconEl.style.background = 'var(--editor-color-background-paper, #f9fafb)'
      })
      
      preview.appendChild(iconEl)
    })
    
    card.querySelector('.card-content')?.appendChild(preview)
    
    return card
  }
  
  /**
   * 创建底部按钮
   */
  private createFooter(): HTMLElement {
    const footer = document.createElement('div')
    footer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid var(--editor-color-border, #e5e7eb);
    `
    
    const cancelBtn = this.componentFactory.createButton({
      label: this.configManager.t('editor.dialog.cancel') || '取消',
      type: 'secondary',
      onClick: () => this.handleClose()
    })
    
    const saveBtn = this.componentFactory.createButton({
      label: this.configManager.t('editor.dialog.save') || '保存',
      type: 'primary',
      onClick: () => this.handleSave()
    })
    
    footer.appendChild(cancelBtn)
    footer.appendChild(saveBtn)
    
    return footer
  }
  
  /**
   * 预览主题
   */
  private previewTheme(themeName: string): void {
    this.configManager.setTheme(themeName)
  }
  
  /**
   * 预览图标
   */
  private previewIcons(iconSet: string): void {
    // 重新渲染图标预览
    const preview = this.container?.querySelector('.icon-preview .card-content > div')
    if (preview) {
      preview.innerHTML = ''
      
      const iconManager = this.configManager.getIconManager()
      const sampleIcons = ['bold', 'italic', 'underline', 'link', 'image', 'code', 'list', 'quote']
      
      sampleIcons.forEach(iconName => {
        const iconEl = iconManager.createIconElement(iconName, { size: 24 })
        iconEl.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 6px;
          background: var(--editor-color-background-paper, #f9fafb);
        `
        preview.appendChild(iconEl)
      })
    }
  }
  
  /**
   * 导出配置
   */
  private exportConfig(): void {
    const config = this.configManager.exportConfig()
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `editor-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  /**
   * 导入配置
   */
  private importConfig(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = event.target?.result as string
        this.configManager.importConfig(config)
        
        // 更新临时配置
        this.tempConfig = {
          iconSet: this.configManager.getIconSet(),
          theme: this.configManager.getThemeManager().getCurrentThemeName(),
          locale: this.configManager.getLocale()
        }
        
        // 重新渲染面板
        this.hide()
        this.show()
        
        alert('配置导入成功！')
      } catch (error) {
        alert('配置导入失败：' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }
  
  /**
   * 重置配置
   */
  private resetConfig(): void {
    if (!confirm('确定要重置所有配置吗？此操作不可撤销。')) {
      return
    }
    
    this.configManager.reset()
    
    // 更新临时配置
    this.tempConfig = {
      iconSet: this.configManager.getIconSet(),
      theme: this.configManager.getThemeManager().getCurrentThemeName(),
      locale: this.configManager.getLocale()
    }
    
    // 重新渲染面板
    this.hide()
    this.show()
  }
  
  /**
   * 处理关闭
   */
  private handleClose(): void {
    // 恢复原始配置（取消预览）
    this.configManager.setTheme(this.configManager.getThemeManager().getCurrentThemeName())
    
    this.hide()
    
    if (this.options.onClose) {
      this.options.onClose()
    }
  }
  
  /**
   * 处理保存
   */
  private async handleSave(): Promise<void> {
    // 应用配置
    this.configManager.setIconSet(this.tempConfig.iconSet as any)
    this.configManager.setTheme(this.tempConfig.theme)
    await this.configManager.setLocale(this.tempConfig.locale)
    
    this.hide()
    
    if (this.options.onSave) {
      this.options.onSave(this.tempConfig)
    }
  }
}

/**
 * 显示设置面板
 */
export function showSettingsPanel(options?: SettingsPanelOptions): SettingsPanel {
  const panel = new SettingsPanel(options)
  panel.show()
  return panel
}







/**
 * 实时配置预览
 * 在不保存的情况下预览配置效果
 */

import { getComponentFactory } from './base/ComponentFactory'
import { getConfigManager } from '../config/ConfigManager'
import { getFeatureFlags } from '../core/FeatureFlags'
import { Modal } from './base/Modal'
import type { PresetName } from '../config/presets'
import { getPreset, presetDescriptions } from '../config/presets'

/**
 * 配置预览类
 */
export class ConfigPreview {
  private componentFactory = getComponentFactory()
  private configManager = getConfigManager()
  private features = getFeatureFlags()
  private modal: Modal | null = null
  private originalConfig: any = {}
  
  /**
   * 显示预览
   */
  show(preset: PresetName): void {
    // 保存原始配置
    this.saveOriginalConfig()
    
    // 应用预览配置
    this.applyPresetPreview(preset)
    
    // 显示预览面板
    this.showPreviewPanel(preset)
  }
  
  /**
   * 保存原始配置
   */
  private saveOriginalConfig(): void {
    this.originalConfig = {
      theme: this.configManager.getThemeManager().getCurrentThemeName(),
      iconSet: this.configManager.getIconSet(),
      locale: this.configManager.getLocale(),
      features: this.features.exportConfig()
    }
  }
  
  /**
   * 应用预设预览
   */
  private applyPresetPreview(preset: PresetName): void {
    const config = getPreset(preset)
    
    // 应用配置（预览）
    if (config.theme?.defaultTheme) {
      this.configManager.setTheme(config.theme.defaultTheme)
    }
    
    if (config.icons?.defaultSet) {
      this.configManager.setIconSet(config.icons.defaultSet)
    }
    
    if (config.features) {
      this.features.importConfig(config.features as any)
    }
  }
  
  /**
   * 显示预览面板
   */
  private showPreviewPanel(preset: PresetName): void {
    const desc = presetDescriptions[preset]
    
    this.modal = new Modal({
      title: '配置预览',
      width: '700px',
      height: 'auto',
      onClose: () => this.restoreOriginalConfig()
    })
    
    const content = document.createElement('div')
    content.style.cssText = 'padding: 20px;'
    
    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 64px; margin-bottom: 12px;">${desc.icon}</div>
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">${desc.name}</h2>
        <p style="color: #6b7280;">${desc.description}</p>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #1e40af;">
          <strong>💡 提示：</strong> 当前正在预览此配置的效果。你可以：<br>
          • 查看编辑器的变化<br>
          • 测试不同的功能<br>
          • 点击"应用"保存配置，或"取消"恢复原配置
        </p>
      </div>
      
      <div id="preview-stats"></div>
    `
    
    this.modal.setContent(content)
    this.modal.setFooter(this.createFooter(preset))
    this.modal.show()
    
    // 渲染统计信息
    this.renderStats()
  }
  
  /**
   * 渲染统计信息
   */
  private renderStats(): void {
    const statsContainer = document.getElementById('preview-stats')
    if (!statsContainer) return
    
    const features = this.features.getStats()
    const theme = this.configManager.getThemeManager().getCurrentThemeName()
    const iconSet = this.configManager.getIconSet()
    const locale = this.configManager.getLocale()
    
    statsContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">当前主题</div>
          <div style="font-weight: 600;">${theme}</div>
        </div>
        <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">图标集</div>
          <div style="font-weight: 600;">${iconSet}</div>
        </div>
        <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">语言</div>
          <div style="font-weight: 600;">${locale}</div>
        </div>
        <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">已启用功能</div>
          <div style="font-weight: 600; color: #10b981;">${features.enabled}</div>
        </div>
      </div>
    `
  }
  
  /**
   * 创建底部按钮
   */
  private createFooter(preset: PresetName): HTMLElement {
    const footer = document.createElement('div')
    footer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid var(--editor-color-border, #e5e7eb);
    `
    
    const cancelBtn = this.componentFactory.createButton({
      label: '取消',
      type: 'secondary',
      onClick: () => {
        this.restoreOriginalConfig()
        this.modal?.hide()
      }
    })
    
    const applyBtn = this.componentFactory.createButton({
      label: '应用配置',
      type: 'primary',
      onClick: () => {
        // 保存配置
        const config = getPreset(preset)
        localStorage.setItem('editor-preset', preset)
        
        this.modal?.hide()
        ui.toast('配置已应用！', 'success')
      }
    })
    
    footer.appendChild(cancelBtn)
    footer.appendChild(applyBtn)
    
    return footer
  }
  
  /**
   * 恢复原始配置
   */
  private restoreOriginalConfig(): void {
    if (this.originalConfig.theme) {
      this.configManager.setTheme(this.originalConfig.theme)
    }
    
    if (this.originalConfig.iconSet) {
      this.configManager.setIconSet(this.originalConfig.iconSet)
    }
    
    if (this.originalConfig.features) {
      this.features.importConfig(this.originalConfig.features)
    }
  }
}

/**
 * 显示配置预览
 */
export function showConfigPreview(preset: PresetName): ConfigPreview {
  const preview = new ConfigPreview()
  preview.show(preset)
  return preview
}




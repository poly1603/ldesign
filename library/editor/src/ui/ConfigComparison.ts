/**
 * 配置对比工具
 * 对比不同配置的差异和性能影响
 */

import { getComponentFactory } from './base/ComponentFactory'
import { Modal } from './base/Modal'
import { getPreset, getPresetNames, presetDescriptions, type PresetName } from '../config/presets'

/**
 * 配置对比结果
 */
interface ComparisonResult {
  preset1: PresetName
  preset2: PresetName
  differences: {
    icons?: string
    theme?: string
    features: {
      onlyIn1: string[]
      onlyIn2: string[]
      common: string[]
    }
  }
  performance: {
    loadTime: { preset1: number; preset2: number; diff: number }
    memory: { preset1: number; preset2: number; diff: number }
    features: { preset1: number; preset2: number; diff: number }
  }
}

/**
 * 配置对比类
 */
export class ConfigComparison {
  private componentFactory = getComponentFactory()
  private modal: Modal | null = null
  
  /**
   * 显示对比面板
   */
  show(): void {
    this.modal = new Modal({
      title: '配置对比',
      width: '900px',
      height: 'auto'
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
    container.className = 'config-comparison'
    container.style.cssText = 'padding: 20px;'
    
    // 选择器
    const selectors = this.createSelectors()
    container.appendChild(selectors)
    
    // 对比结果区域
    const resultArea = document.createElement('div')
    resultArea.className = 'comparison-result'
    resultArea.id = 'comparison-result'
    resultArea.style.cssText = `
      margin-top: 20px;
      padding: 20px;
      background: var(--editor-color-background-paper, #f9fafb);
      border-radius: 8px;
      min-height: 300px;
    `
    resultArea.innerHTML = '<p style="text-align: center; color: #6b7280;">请选择两个配置进行对比</p>'
    
    container.appendChild(resultArea)
    
    return container
  }
  
  /**
   * 创建选择器
   */
  private createSelectors(): HTMLElement {
    const container = document.createElement('div')
    container.style.cssText = `
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      align-items: center;
    `
    
    const presetNames = getPresetNames()
    const options = presetNames.map(name => ({
      label: presetDescriptions[name].icon + ' ' + presetDescriptions[name].name,
      value: name
    }))
    
    const select1 = this.componentFactory.createSelect({
      options,
      placeholder: '选择配置1',
      onChange: (value) => this.handleSelection()
    })
    select1.id = 'preset1'
    
    const vsLabel = document.createElement('div')
    vsLabel.textContent = 'VS'
    vsLabel.style.cssText = `
      font-size: 20px;
      font-weight: 700;
      color: #3b82f6;
    `
    
    const select2 = this.componentFactory.createSelect({
      options,
      placeholder: '选择配置2',
      onChange: (value) => this.handleSelection()
    })
    select2.id = 'preset2'
    
    container.appendChild(select1)
    container.appendChild(vsLabel)
    container.appendChild(select2)
    
    return container
  }
  
  /**
   * 处理选择
   */
  private handleSelection(): void {
    const select1 = document.getElementById('preset1') as HTMLSelectElement
    const select2 = document.getElementById('preset2') as HTMLSelectElement
    
    if (!select1.value || !select2.value) return
    
    const preset1 = select1.value as PresetName
    const preset2 = select2.value as PresetName
    
    const comparison = this.compare(preset1, preset2)
    this.renderComparison(comparison)
  }
  
  /**
   * 对比配置
   */
  private compare(preset1: PresetName, preset2: PresetName): ComparisonResult {
    const config1 = getPreset(preset1)
    const config2 = getPreset(preset2)
    
    // 对比功能
    const features1 = new Set(config1.features?.enabled || [])
    const features2 = new Set(config2.features?.enabled || [])
    
    const onlyIn1 = Array.from(features1).filter(f => !features2.has(f))
    const onlyIn2 = Array.from(features2).filter(f => !features1.has(f))
    const common = Array.from(features1).filter(f => features2.has(f))
    
    // 模拟性能数据（实际应该测量）
    const loadTime1 = this.estimateLoadTime(features1.size)
    const loadTime2 = this.estimateLoadTime(features2.size)
    const memory1 = this.estimateMemory(features1.size)
    const memory2 = this.estimateMemory(features2.size)
    
    return {
      preset1,
      preset2,
      differences: {
        icons: config1.icons?.defaultSet !== config2.icons?.defaultSet 
          ? `${config1.icons?.defaultSet} vs ${config2.icons?.defaultSet}` 
          : undefined,
        theme: config1.theme?.defaultTheme !== config2.theme?.defaultTheme
          ? `${config1.theme?.defaultTheme} vs ${config2.theme?.defaultTheme}`
          : undefined,
        features: {
          onlyIn1,
          onlyIn2,
          common
        }
      },
      performance: {
        loadTime: { preset1: loadTime1, preset2: loadTime2, diff: loadTime2 - loadTime1 },
        memory: { preset1: memory1, preset2: memory2, diff: memory2 - memory1 },
        features: { preset1: features1.size, preset2: features2.size, diff: features2.size - features1.size }
      }
    }
  }
  
  /**
   * 估算加载时间
   */
  private estimateLoadTime(featureCount: number): number {
    return 300 + featureCount * 15 // 基础300ms + 每个功能15ms
  }
  
  /**
   * 估算内存使用
   */
  private estimateMemory(featureCount: number): number {
    return 40 + featureCount * 1.5 // 基础40MB + 每个功能1.5MB
  }
  
  /**
   * 渲染对比结果
   */
  private renderComparison(comparison: ComparisonResult): void {
    const resultArea = document.getElementById('comparison-result')
    if (!resultArea) return
    
    const desc1 = presetDescriptions[comparison.preset1]
    const desc2 = presetDescriptions[comparison.preset2]
    
    resultArea.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">${desc1.icon} ${desc1.name}</h3>
          <p style="font-size: 14px; color: #6b7280;">${desc1.description}</p>
        </div>
        <div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">${desc2.icon} ${desc2.name}</h3>
          <p style="font-size: 14px; color: #6b7280;">${desc2.description}</p>
        </div>
      </div>
      
      <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">性能对比</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          ${this.createPerfCard('加载时间', comparison.performance.loadTime, 'ms')}
          ${this.createPerfCard('内存使用', comparison.performance.memory, 'MB')}
          ${this.createPerfCard('功能数量', comparison.performance.features, '个')}
        </div>
      </div>
      
      <div style="background: white; padding: 16px; border-radius: 8px;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">功能差异</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-weight: 600; margin-bottom: 8px; color: #3b82f6;">仅在 ${desc1.name}</div>
            <div style="font-size: 14px; color: #6b7280;">
              ${comparison.differences.features.onlyIn1.length > 0 
                ? comparison.differences.features.onlyIn1.map(f => `• ${f}`).join('<br>')
                : '无独有功能'}
            </div>
          </div>
          <div>
            <div style="font-weight: 600; margin-bottom: 8px; color: #10b981;">仅在 ${desc2.name}</div>
            <div style="font-size: 14px; color: #6b7280;">
              ${comparison.differences.features.onlyIn2.length > 0
                ? comparison.differences.features.onlyIn2.map(f => `• ${f}`).join('<br>')
                : '无独有功能'}
            </div>
          </div>
        </div>
        <div style="margin-top: 16px;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #6b7280;">共同功能 (${comparison.differences.features.common.length}个)</div>
          <div style="font-size: 12px; color: #9ca3af;">
            ${comparison.differences.features.common.slice(0, 10).join(', ')}
            ${comparison.differences.features.common.length > 10 ? `... 等${comparison.differences.features.common.length}个` : ''}
          </div>
        </div>
      </div>
    `
  }
  
  /**
   * 创建性能卡片
   */
  private createPerfCard(label: string, data: { preset1: number; preset2: number; diff: number }, unit: string): string {
    const better = data.diff < 0 ? 1 : 2
    const diffPercent = Math.abs((data.diff / data.preset1) * 100).toFixed(1)
    
    return `
      <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 6px;">
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${label}</div>
        <div style="display: flex; justify-content: space-around; margin-bottom: 8px;">
          <div>
            <div style="font-size: 20px; font-weight: 700; color: ${better === 1 ? '#10b981' : '#6b7280'};">
              ${data.preset1.toFixed(0)}
            </div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 700; color: ${better === 2 ? '#10b981' : '#6b7280'};">
              ${data.preset2.toFixed(0)}
            </div>
          </div>
        </div>
        <div style="font-size: 11px; color: ${data.diff < 0 ? '#10b981' : data.diff > 0 ? '#ef4444' : '#6b7280'};">
          ${data.diff === 0 ? '相同' : (data.diff < 0 ? '↓' : '↑') + diffPercent + '%'}
        </div>
      </div>
    `
  }
}

/**
 * 显示配置对比
 */
export function showConfigComparison(): ConfigComparison {
  const comparison = new ConfigComparison()
  comparison.show()
  return comparison
}




/**
 * 配置向导
 * 帮助用户选择最适合的配置
 */

import { getComponentFactory } from './base/ComponentFactory'
import { getPreset, getPresetNames, presetDescriptions, type PresetName } from '../config/presets'
import { Modal } from './base/Modal'

/**
 * 使用场景问题
 */
interface WizardQuestion {
  id: string
  question: string
  options: Array<{
    label: string
    value: string
    description?: string
  }>
}

/**
 * 配置向导类
 */
export class ConfigWizard {
  private componentFactory = getComponentFactory()
  private modal: Modal | null = null
  private answers: Record<string, string> = {}
  private currentStep: number = 0
  
  private questions: WizardQuestion[] = [
    {
      id: 'usage',
      question: '你主要用编辑器做什么？',
      options: [
        { label: '📝 写博客文章', value: 'blog', description: '个人博客、文章写作' },
        { label: '🏢 管理内容', value: 'cms', description: '企业CMS、内容发布' },
        { label: '👥 团队协作', value: 'collaboration', description: '多人在线编辑' },
        { label: '📄 写技术文档', value: 'markdown', description: 'Markdown、API文档' },
        { label: '📒 记笔记', value: 'note', description: '个人笔记、知识管理' },
        { label: '💬 评论回复', value: 'comment', description: '评论框、表单' }
      ]
    },
    {
      id: 'features',
      question: '你需要哪些功能？',
      options: [
        { label: '🎨 丰富的格式化', value: 'rich-format' },
        { label: '🖼️ 图片视频', value: 'media' },
        { label: '📊 表格支持', value: 'table' },
        { label: '🤖 AI辅助', value: 'ai' },
        { label: '⚡ 只要基础功能（更快）', value: 'basic' }
      ]
    },
    {
      id: 'device',
      question: '主要在什么设备上使用？',
      options: [
        { label: '💻 桌面电脑', value: 'desktop' },
        { label: '📱 手机平板', value: 'mobile' },
        { label: '🌐 两者都有', value: 'both' }
      ]
    },
    {
      id: 'priority',
      question: '你更看重什么？',
      options: [
        { label: '⚡ 速度性能', value: 'performance' },
        { label: '🎨 功能丰富', value: 'features' },
        { label: '⚖️ 平衡两者', value: 'balanced' }
      ]
    }
  ]
  
  /**
   * 显示向导
   */
  show(onComplete: (preset: PresetName) => void): void {
    this.answers = {}
    this.currentStep = 0
    
    this.modal = new Modal({
      title: '配置向导',
      width: '600px',
      height: 'auto'
    })
    
    this.renderStep()
    this.modal.show()
    
    // 保存回调
    this.onComplete = onComplete
  }
  
  private onComplete?: (preset: PresetName) => void
  
  /**
   * 渲染当前步骤
   */
  private renderStep(): void {
    const question = this.questions[this.currentStep]
    const content = this.createStepContent(question)
    
    this.modal?.setContent(content)
    this.modal?.setFooter(this.createFooter())
  }
  
  /**
   * 创建步骤内容
   */
  private createStepContent(question: WizardQuestion): HTMLElement {
    const container = document.createElement('div')
    container.className = 'wizard-step'
    container.style.cssText = `
      padding: 30px;
      min-height: 300px;
    `
    
    // 进度指示器
    const progress = document.createElement('div')
    progress.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 30px;
    `
    
    for (let i = 0; i < this.questions.length; i++) {
      const dot = document.createElement('div')
      dot.style.cssText = `
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${i === this.currentStep ? '#3b82f6' : '#e5e7eb'};
        transition: all 0.3s;
      `
      progress.appendChild(dot)
    }
    
    container.appendChild(progress)
    
    // 问题标题
    const title = document.createElement('h3')
    title.textContent = `${this.currentStep + 1}. ${question.question}`
    title.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
      color: var(--editor-color-text-primary, #1f2937);
    `
    container.appendChild(title)
    
    // 选项列表
    const options = document.createElement('div')
    options.className = 'wizard-options'
    options.style.cssText = `
      display: grid;
      gap: 12px;
    `
    
    question.options.forEach(option => {
      const optionEl = document.createElement('div')
      optionEl.className = 'wizard-option'
      optionEl.style.cssText = `
        padding: 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      `
      
      optionEl.innerHTML = `
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${option.label}</div>
        ${option.description ? `<div style="font-size: 14px; color: #6b7280;">${option.description}</div>` : ''}
      `
      
      optionEl.addEventListener('mouseenter', () => {
        optionEl.style.borderColor = '#3b82f6'
        optionEl.style.background = '#f0f9ff'
      })
      
      optionEl.addEventListener('mouseleave', () => {
        optionEl.style.borderColor = '#e5e7eb'
        optionEl.style.background = 'white'
      })
      
      optionEl.addEventListener('click', () => {
        this.answers[question.id] = option.value
        this.nextStep()
      })
      
      options.appendChild(optionEl)
    })
    
    container.appendChild(options)
    
    return container
  }
  
  /**
   * 创建底部按钮
   */
  private createFooter(): HTMLElement {
    const footer = document.createElement('div')
    footer.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 16px 30px;
      border-top: 1px solid var(--editor-color-border, #e5e7eb);
    `
    
    // 返回按钮
    const backBtn = this.componentFactory.createButton({
      label: '上一步',
      type: 'secondary',
      disabled: this.currentStep === 0,
      onClick: () => this.prevStep()
    })
    
    // 跳过按钮
    const skipBtn = this.componentFactory.createButton({
      label: '跳过向导',
      type: 'text',
      onClick: () => this.skip()
    })
    
    footer.appendChild(backBtn)
    footer.appendChild(skipBtn)
    
    return footer
  }
  
  /**
   * 下一步
   */
  private nextStep(): void {
    if (this.currentStep < this.questions.length - 1) {
      this.currentStep++
      this.renderStep()
    } else {
      this.complete()
    }
  }
  
  /**
   * 上一步
   */
  private prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--
      this.renderStep()
    }
  }
  
  /**
   * 跳过向导
   */
  private skip(): void {
    this.modal?.hide()
    
    if (this.onComplete) {
      this.onComplete('blog') // 默认使用博客预设
    }
  }
  
  /**
   * 完成向导
   */
  private complete(): void {
    // 根据答案推荐配置
    const preset = this.recommendPreset()
    
    // 显示推荐结果
    this.showRecommendation(preset)
  }
  
  /**
   * 推荐配置
   */
  private recommendPreset(): PresetName {
    const { usage, features, device, priority } = this.answers
    
    // 根据使用场景
    if (usage === 'blog') return 'blog'
    if (usage === 'cms') return 'cms'
    if (usage === 'collaboration') return 'collaboration'
    if (usage === 'markdown') return 'markdown'
    if (usage === 'note') return 'note'
    if (usage === 'comment') return 'comment'
    
    // 根据功能需求
    if (features === 'ai') return 'aiEnhanced'
    if (features === 'basic' || priority === 'performance') return 'minimal'
    
    // 根据设备
    if (device === 'mobile') return 'mobile'
    
    // 默认
    return 'blog'
  }
  
  /**
   * 显示推荐结果
   */
  private showRecommendation(preset: PresetName): void {
    const desc = presetDescriptions[preset]
    
    const content = document.createElement('div')
    content.style.cssText = 'padding: 30px; text-align: center;'
    
    content.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 16px;">${desc.icon}</div>
      <h3 style="font-size: 24px; font-weight: 600; margin-bottom: 12px;">${desc.name}</h3>
      <p style="font-size: 16px; color: #6b7280; margin-bottom: 24px;">${desc.description}</p>
      <div style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #1e40af;">
          <strong>推荐理由：</strong><br>
          基于你的选择，这个配置最适合你的使用场景。
        </p>
      </div>
    `
    
    const buttonGroup = document.createElement('div')
    buttonGroup.style.cssText = 'display: flex; gap: 12px; justify-content: center;'
    
    const applyBtn = this.componentFactory.createButton({
      label: '应用配置',
      type: 'primary',
      onClick: () => {
        this.modal?.hide()
        if (this.onComplete) {
          this.onComplete(preset)
        }
      }
    })
    
    const changeBtn = this.componentFactory.createButton({
      label: '重新选择',
      type: 'secondary',
      onClick: () => {
        this.currentStep = 0
        this.answers = {}
        this.renderStep()
      }
    })
    
    buttonGroup.appendChild(applyBtn)
    buttonGroup.appendChild(changeBtn)
    content.appendChild(buttonGroup)
    
    this.modal?.setContent(content)
    this.modal?.setFooter(document.createElement('div'))
  }
}

/**
 * 显示配置向导
 */
export function showConfigWizard(onComplete: (preset: PresetName) => void): ConfigWizard {
  const wizard = new ConfigWizard()
  wizard.show(onComplete)
  return wizard
}




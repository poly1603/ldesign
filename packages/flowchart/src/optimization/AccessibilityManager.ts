/**
 * 无障碍管理器
 * 
 * 负责无障碍功能的实现，包括键盘导航、屏幕阅读器支持、视觉辅助等
 */

import { EventEmitter } from 'events'
import type {
  IAccessibilityManager,
  AccessibilityConfig,
  AccessibilityAudit
} from './types'

/**
 * 无障碍管理器实现
 */
export class AccessibilityManager extends EventEmitter implements IAccessibilityManager {
  private config: AccessibilityConfig
  private focusableElements: HTMLElement[] = []
  private currentFocusIndex: number = -1
  private announcer?: HTMLElement
  private skipLinks: HTMLElement[] = []
  private voiceRecognition?: any

  constructor(config: AccessibilityConfig) {
    super()
    this.config = {
      enabled: true,
      keyboard: {
        enabled: true,
        focusVisible: true,
        trapFocus: false,
        skipLinks: true
      },
      screenReader: {
        enabled: true,
        announcements: true,
        liveRegions: true,
        descriptions: true
      },
      visual: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        colorBlindness: false
      },
      voice: {
        enabled: false,
        commands: ['click', 'scroll', 'navigate'],
        sensitivity: 0.8
      },
      ...config
    }

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化无障碍管理器
   */
  private initialize(): void {
    // 启用键盘导航
    if (this.config.keyboard.enabled) {
      this.enableKeyboardNavigation()
    }

    // 启用屏幕阅读器支持
    if (this.config.screenReader.enabled) {
      this.enableScreenReader()
    }

    // 应用视觉辅助
    this.applyVisualAssistance()

    // 启用语音控制
    if (this.config.voice.enabled) {
      this.enableVoiceControl()
    }

    // 设置ARIA属性
    this.setupARIAAttributes()

    // 监听用户偏好变化
    this.setupPreferenceListeners()

    console.log('无障碍管理器已初始化')
    this.emit('initialized', { timestamp: Date.now() })
  }

  /**
   * 执行无障碍审计
   */
  async audit(): Promise<AccessibilityAudit> {
    console.log('开始无障碍审计...')
    const audit: AccessibilityAudit = {
      timestamp: Date.now(),
      score: 0,
      issues: [],
      recommendations: [],
      compliance: {
        wcag2AA: false,
        wcag2AAA: false,
        section508: false
      }
    }

    try {
      // 检查基本无障碍问题
      const issues = await this.checkAccessibilityIssues()
      audit.issues = issues

      // 生成建议
      audit.recommendations = this.generateRecommendations(issues)

      // 计算评分
      audit.score = this.calculateAccessibilityScore(issues)

      // 检查合规性
      audit.compliance = this.checkCompliance(issues)

      console.log('无障碍审计完成:', audit)
      this.emit('auditCompleted', audit)
    } catch (error) {
      console.error('无障碍审计失败:', error)
      this.emit('auditFailed', { error, timestamp: Date.now() })
    }

    return audit
  }

  /**
   * 启用键盘导航
   */
  enableKeyboardNavigation(): void {
    console.log('启用键盘导航')

    // 更新可聚焦元素列表
    this.updateFocusableElements()

    // 设置键盘事件监听
    document.addEventListener('keydown', this.handleKeyDown.bind(this))

    // 设置焦点可见性
    if (this.config.keyboard.focusVisible) {
      this.setupFocusVisible()
    }

    // 创建跳转链接
    if (this.config.keyboard.skipLinks) {
      this.createSkipLinks()
    }

    // 设置焦点陷阱
    if (this.config.keyboard.trapFocus) {
      this.setupFocusTrap()
    }

    this.emit('keyboardNavigationEnabled', { timestamp: Date.now() })
  }

  /**
   * 启用屏幕阅读器支持
   */
  enableScreenReader(): void {
    console.log('启用屏幕阅读器支持')

    // 创建公告区域
    if (this.config.screenReader.announcements) {
      this.createAnnouncer()
    }

    // 设置实时区域
    if (this.config.screenReader.liveRegions) {
      this.setupLiveRegions()
    }

    // 添加描述性文本
    if (this.config.screenReader.descriptions) {
      this.addDescriptiveText()
    }

    this.emit('screenReaderEnabled', { timestamp: Date.now() })
  }

  /**
   * 应用高对比度
   */
  applyHighContrast(enabled: boolean): void {
    const root = document.documentElement

    if (enabled) {
      root.classList.add('high-contrast')
      root.style.setProperty('--text-color', '#000000')
      root.style.setProperty('--bg-color', '#ffffff')
      root.style.setProperty('--border-color', '#000000')
      root.style.setProperty('--link-color', '#0000ff')
    } else {
      root.classList.remove('high-contrast')
      root.style.removeProperty('--text-color')
      root.style.removeProperty('--bg-color')
      root.style.removeProperty('--border-color')
      root.style.removeProperty('--link-color')
    }

    this.config.visual.highContrast = enabled
    this.emit('highContrastChanged', { enabled, timestamp: Date.now() })
  }

  /**
   * 应用视觉辅助
   */
  private applyVisualAssistance(): void {
    const root = document.documentElement

    // 高对比度
    if (this.config.visual.highContrast) {
      this.applyHighContrast(true)
    }

    // 大字体
    if (this.config.visual.largeText) {
      root.classList.add('large-text')
      root.style.fontSize = '120%'
    }

    // 减少动画
    if (this.config.visual.reducedMotion) {
      root.classList.add('reduce-motion')
      root.style.setProperty('--animation-duration', '0ms')
    }

    // 色盲辅助
    if (this.config.visual.colorBlindness) {
      root.classList.add('colorblind-friendly')
    }
  }

  /**
   * 启用语音控制
   */
  private enableVoiceControl(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('浏览器不支持语音识别')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    this.voiceRecognition = new SpeechRecognition()

    this.voiceRecognition.continuous = true
    this.voiceRecognition.interimResults = false
    this.voiceRecognition.lang = 'zh-CN'

    this.voiceRecognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
      this.processVoiceCommand(command)
    }

    this.voiceRecognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
    }

    // 开始监听
    this.voiceRecognition.start()
    console.log('语音控制已启用')
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Tab':
        this.handleTabNavigation(e)
        break
      case 'Enter':
      case ' ':
        this.handleActivation(e)
        break
      case 'Escape':
        this.handleEscape(e)
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(e)
        break
    }
  }

  /**
   * 处理Tab导航
   */
  private handleTabNavigation(e: KeyboardEvent): void {
    if (this.config.keyboard.trapFocus && this.focusableElements.length > 0) {
      e.preventDefault()
      
      if (e.shiftKey) {
        this.currentFocusIndex = this.currentFocusIndex <= 0 
          ? this.focusableElements.length - 1 
          : this.currentFocusIndex - 1
      } else {
        this.currentFocusIndex = this.currentFocusIndex >= this.focusableElements.length - 1 
          ? 0 
          : this.currentFocusIndex + 1
      }

      this.focusableElements[this.currentFocusIndex]?.focus()
    }
  }

  /**
   * 处理激活事件
   */
  private handleActivation(e: KeyboardEvent): void {
    const target = e.target as HTMLElement
    
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      target.click()
    }
  }

  /**
   * 处理Escape键
   */
  private handleEscape(e: KeyboardEvent): void {
    // 关闭模态框或返回上一级
    const modal = document.querySelector('[role="dialog"]') as HTMLElement
    if (modal) {
      modal.style.display = 'none'
      this.announce('对话框已关闭')
    }
  }

  /**
   * 处理方向键导航
   */
  private handleArrowNavigation(e: KeyboardEvent): void {
    const target = e.target as HTMLElement
    const role = target.getAttribute('role')

    if (role === 'menu' || role === 'menubar') {
      e.preventDefault()
      this.navigateMenu(e.key, target)
    }
  }

  /**
   * 导航菜单
   */
  private navigateMenu(key: string, menu: HTMLElement): void {
    const items = menu.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>
    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement)
    let nextIndex = currentIndex

    switch (key) {
      case 'ArrowDown':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
    }

    items[nextIndex]?.focus()
  }

  /**
   * 更新可聚焦元素列表
   */
  private updateFocusableElements(): void {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ')

    this.focusableElements = Array.from(document.querySelectorAll(selector))
  }

  /**
   * 设置焦点可见性
   */
  private setupFocusVisible(): void {
    const style = document.createElement('style')
    style.textContent = `
      .focus-visible {
        outline: 2px solid #005fcc;
        outline-offset: 2px;
      }
      
      *:focus:not(.focus-visible) {
        outline: none;
      }
    `
    document.head.appendChild(style)

    // 添加焦点可见性检测
    document.addEventListener('keydown', () => {
      document.body.classList.add('using-keyboard')
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard')
    })
  }

  /**
   * 创建跳转链接
   */
  private createSkipLinks(): void {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = '跳转到主要内容'
    skipLink.className = 'skip-link'
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
    `

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px'
    })

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px'
    })

    document.body.insertBefore(skipLink, document.body.firstChild)
    this.skipLinks.push(skipLink)
  }

  /**
   * 设置焦点陷阱
   */
  private setupFocusTrap(): void {
    // 在模态框中实现焦点陷阱
    document.addEventListener('focusin', (e) => {
      const modal = document.querySelector('[role="dialog"]')
      if (modal && !modal.contains(e.target as Node)) {
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement
        firstFocusable?.focus()
      }
    })
  }

  /**
   * 创建公告区域
   */
  private createAnnouncer(): void {
    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(this.announcer)
  }

  /**
   * 公告消息
   */
  private announce(message: string): void {
    if (this.announcer) {
      this.announcer.textContent = message
      
      // 清空消息以便下次公告
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = ''
        }
      }, 1000)
    }
  }

  /**
   * 设置实时区域
   */
  private setupLiveRegions(): void {
    const liveRegions = document.querySelectorAll('[data-live]')
    liveRegions.forEach(region => {
      const politeness = region.getAttribute('data-live') || 'polite'
      region.setAttribute('aria-live', politeness)
      region.setAttribute('aria-atomic', 'true')
    })
  }

  /**
   * 添加描述性文本
   */
  private addDescriptiveText(): void {
    // 为图片添加alt文本
    const images = document.querySelectorAll('img:not([alt])')
    images.forEach(img => {
      img.setAttribute('alt', '图片')
    })

    // 为按钮添加aria-label
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
    buttons.forEach(button => {
      const text = button.textContent?.trim()
      if (!text) {
        button.setAttribute('aria-label', '按钮')
      }
    })

    // 为表单控件添加标签
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`)
      if (!label && input.id) {
        input.setAttribute('aria-label', input.getAttribute('placeholder') || '输入框')
      }
    })
  }

  /**
   * 设置ARIA属性
   */
  private setupARIAAttributes(): void {
    // 设置地标角色
    const main = document.querySelector('main')
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main')
    }

    const nav = document.querySelector('nav')
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation')
    }

    // 设置按钮角色
    const clickableElements = document.querySelectorAll('[onclick]:not(button):not([role])')
    clickableElements.forEach(element => {
      element.setAttribute('role', 'button')
      element.setAttribute('tabindex', '0')
    })
  }

  /**
   * 设置偏好监听器
   */
  private setupPreferenceListeners(): void {
    // 监听高对比度偏好
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.applyHighContrast(e.matches)
    })

    // 监听减少动画偏好
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.config.visual.reducedMotion = e.matches
      this.applyVisualAssistance()
    })
  }

  /**
   * 处理语音命令
   */
  private processVoiceCommand(command: string): void {
    console.log('处理语音命令:', command)

    if (command.includes('点击') || command.includes('click')) {
      const button = document.querySelector('button')
      button?.click()
      this.announce('已执行点击操作')
    } else if (command.includes('滚动') || command.includes('scroll')) {
      window.scrollBy(0, 100)
      this.announce('已滚动页面')
    } else if (command.includes('导航') || command.includes('navigate')) {
      const firstLink = document.querySelector('a')
      firstLink?.focus()
      this.announce('已导航到第一个链接')
    }

    this.emit('voiceCommand', { command, timestamp: Date.now() })
  }

  /**
   * 检查无障碍问题
   */
  private async checkAccessibilityIssues(): Promise<any[]> {
    const issues: any[] = []

    // 检查缺失的alt文本
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])')
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'error',
        rule: 'img-alt',
        description: `${imagesWithoutAlt.length} 个图片缺少alt属性`,
        impact: 'serious',
        solution: '为所有图片添加描述性的alt属性'
      })
    }

    // 检查颜色对比度
    const lowContrastElements = this.checkColorContrast()
    if (lowContrastElements.length > 0) {
      issues.push({
        type: 'warning',
        rule: 'color-contrast',
        description: `${lowContrastElements.length} 个元素颜色对比度不足`,
        impact: 'moderate',
        solution: '提高文本和背景的颜色对比度'
      })
    }

    // 检查键盘可访问性
    const nonKeyboardElements = this.checkKeyboardAccessibility()
    if (nonKeyboardElements.length > 0) {
      issues.push({
        type: 'error',
        rule: 'keyboard-accessible',
        description: `${nonKeyboardElements.length} 个交互元素无法通过键盘访问`,
        impact: 'serious',
        solution: '为交互元素添加适当的tabindex和键盘事件处理'
      })
    }

    return issues
  }

  /**
   * 检查颜色对比度
   */
  private checkColorContrast(): Element[] {
    // 简化的对比度检查
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
    const lowContrastElements: Element[] = []

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // 这里应该实现实际的对比度计算
      // 简化处理，假设某些元素对比度不足
      if (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') {
        lowContrastElements.push(element)
      }
    })

    return lowContrastElements
  }

  /**
   * 检查键盘可访问性
   */
  private checkKeyboardAccessibility(): Element[] {
    const interactiveElements = document.querySelectorAll('[onclick], [onchange]')
    const nonKeyboardElements: Element[] = []

    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex')
      const role = element.getAttribute('role')
      
      if (tabIndex === '-1' || (!tabIndex && !role)) {
        nonKeyboardElements.push(element)
      }
    })

    return nonKeyboardElements
  }

  /**
   * 生成建议
   */
  private generateRecommendations(issues: any[]): string[] {
    const recommendations: string[] = []

    issues.forEach(issue => {
      switch (issue.rule) {
        case 'img-alt':
          recommendations.push('为所有图片添加有意义的alt属性')
          break
        case 'color-contrast':
          recommendations.push('确保文本和背景的对比度至少为4.5:1')
          break
        case 'keyboard-accessible':
          recommendations.push('确保所有交互元素都可以通过键盘访问')
          break
      }
    })

    return [...new Set(recommendations)]
  }

  /**
   * 计算无障碍评分
   */
  private calculateAccessibilityScore(issues: any[]): number {
    let score = 100

    issues.forEach(issue => {
      switch (issue.impact) {
        case 'critical':
          score -= 25
          break
        case 'serious':
          score -= 15
          break
        case 'moderate':
          score -= 10
          break
        case 'minor':
          score -= 5
          break
      }
    })

    return Math.max(0, score)
  }

  /**
   * 检查合规性
   */
  private checkCompliance(issues: any[]): { wcag2AA: boolean; wcag2AAA: boolean; section508: boolean } {
    const criticalIssues = issues.filter(issue => issue.impact === 'critical' || issue.impact === 'serious')
    const moderateIssues = issues.filter(issue => issue.impact === 'moderate')

    return {
      wcag2AA: criticalIssues.length === 0,
      wcag2AAA: criticalIssues.length === 0 && moderateIssues.length === 0,
      section508: criticalIssues.length === 0
    }
  }

  /**
   * 销毁无障碍管理器
   */
  destroy(): void {
    if (this.voiceRecognition) {
      this.voiceRecognition.stop()
    }

    if (this.announcer) {
      this.announcer.remove()
    }

    this.skipLinks.forEach(link => link.remove())
    this.skipLinks = []

    console.log('无障碍管理器已销毁')
    this.emit('destroyed', { timestamp: Date.now() })
  }
}

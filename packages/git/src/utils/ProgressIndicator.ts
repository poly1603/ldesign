/**
 * 进度步骤接口
 */
export interface ProgressStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime?: number
  endTime?: number
  error?: string
}

/**
 * 进度指示器选项
 */
export interface ProgressIndicatorOptions {
  showTimestamp?: boolean
  showDuration?: boolean
  showSpinner?: boolean
  clearOnComplete?: boolean
}

/**
 * 进度指示器类
 * 提供美观的命令行进度显示
 */
export class ProgressIndicator {
  private steps: Map<string, ProgressStep> = new Map()
  private options: ProgressIndicatorOptions
  private spinnerInterval: NodeJS.Timeout | null = null
  private spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  private spinnerIndex = 0

  constructor(options: ProgressIndicatorOptions = {}) {
    this.options = {
      showTimestamp: false,
      showDuration: true,
      showSpinner: true,
      clearOnComplete: false,
      ...options
    }
  }

  /**
   * 添加进度步骤
   * @param step - 步骤信息
   */
  addStep(step: Omit<ProgressStep, 'status'>): void {
    this.steps.set(step.id, {
      ...step,
      status: 'pending'
    })
  }

  /**
   * 添加多个步骤
   * @param steps - 步骤列表
   */
  addSteps(steps: Array<Omit<ProgressStep, 'status'>>): void {
    steps.forEach(step => this.addStep(step))
  }

  /**
   * 开始执行步骤
   * @param stepId - 步骤ID
   */
  startStep(stepId: string): void {
    const step = this.steps.get(stepId)
    if (!step) {
      throw new Error(`步骤 ${stepId} 不存在`)
    }

    // 停止之前的 spinner
    this.stopSpinner()

    step.status = 'running'
    step.startTime = Date.now()

    this.displayStep(step)

    // 启动 spinner
    if (this.options.showSpinner) {
      this.startSpinner(step)
    }
  }

  /**
   * 完成步骤
   * @param stepId - 步骤ID
   * @param message - 可选的完成消息
   */
  completeStep(stepId: string, message?: string): void {
    const step = this.steps.get(stepId)
    if (!step) {
      throw new Error(`步骤 ${stepId} 不存在`)
    }

    this.stopSpinner()

    step.status = 'completed'
    step.endTime = Date.now()

    if (message) {
      step.description = message
    }

    this.displayStep(step, true)
  }

  /**
   * 步骤失败
   * @param stepId - 步骤ID
   * @param error - 错误信息
   */
  failStep(stepId: string, error: string): void {
    const step = this.steps.get(stepId)
    if (!step) {
      throw new Error(`步骤 ${stepId} 不存在`)
    }

    this.stopSpinner()

    step.status = 'failed'
    step.endTime = Date.now()
    step.error = error

    this.displayStep(step, true)
  }

  /**
   * 跳过步骤
   * @param stepId - 步骤ID
   * @param reason - 跳过原因
   */
  skipStep(stepId: string, reason?: string): void {
    const step = this.steps.get(stepId)
    if (!step) {
      throw new Error(`步骤 ${stepId} 不存在`)
    }

    step.status = 'skipped'
    step.endTime = Date.now()

    if (reason) {
      step.description = reason
    }

    this.displayStep(step, true)
  }

  /**
   * 更新当前步骤的描述
   * @param stepId - 步骤ID
   * @param description - 新描述
   */
  updateStep(stepId: string, description: string): void {
    const step = this.steps.get(stepId)
    if (!step) {
      throw new Error(`步骤 ${stepId} 不存在`)
    }

    step.description = description

    if (step.status === 'running') {
      this.displayStep(step)
    }
  }

  /**
   * 显示步骤信息
   * @param step - 步骤
   * @param newLine - 是否换行
   */
  private displayStep(step: ProgressStep, newLine = false): void {
    const icon = this.getStatusIcon(step.status)
    const timestamp = this.options.showTimestamp ?
      `[${new Date().toLocaleTimeString()}] ` : ''
    const duration = this.getDurationText(step)

    let output = `${timestamp}${icon} ${step.name}`

    if (step.description) {
      output += ` - ${step.description}`
    }

    if (duration) {
      output += ` ${duration}`
    }

    if (step.error) {
      output += `\n   ❌ ${step.error}`
    }

    if (newLine || step.status !== 'running') {
      console.log(output)
    } else {
      // 使用 \r 覆盖当前行
      process.stdout.write(`\r${output}`)
    }
  }

  /**
   * 获取状态图标
   * @param status - 状态
   * @returns 图标
   */
  private getStatusIcon(status: ProgressStep['status']): string {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'running':
        return this.options.showSpinner ?
          this.spinnerFrames[this.spinnerIndex] : '🔄'
      case 'completed':
        return '✅'
      case 'failed':
        return '❌'
      case 'skipped':
        return '⏭️'
      default:
        return '❓'
    }
  }

  /**
   * 获取持续时间文本
   * @param step - 步骤
   * @returns 持续时间文本
   */
  private getDurationText(step: ProgressStep): string {
    if (!this.options.showDuration || !step.startTime) {
      return ''
    }

    const endTime = step.endTime || Date.now()
    const duration = endTime - step.startTime

    if (duration < 1000) {
      return `(${duration}ms)`
    } else {
      return `(${(duration / 1000).toFixed(1)}s)`
    }
  }

  /**
   * 启动 spinner
   * @param step - 当前步骤
   */
  private startSpinner(step: ProgressStep): void {
    if (!this.options.showSpinner) return

    this.spinnerInterval = setInterval(() => {
      this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length
      this.displayStep(step)
    }, 100)
  }

  /**
   * 停止 spinner
   */
  private stopSpinner(): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval)
      this.spinnerInterval = null
    }
  }

  /**
   * 显示总体进度
   */
  showSummary(): void {
    const steps = Array.from(this.steps.values())
    const completed = steps.filter(s => s.status === 'completed').length
    const failed = steps.filter(s => s.status === 'failed').length
    const skipped = steps.filter(s => s.status === 'skipped').length
    const total = steps.length

    console.log('\n📊 执行总结:')
    console.log(`   总步骤: ${total}`)
    console.log(`   ✅ 完成: ${completed}`)

    if (failed > 0) {
      console.log(`   ❌ 失败: ${failed}`)
    }

    if (skipped > 0) {
      console.log(`   ⏭️ 跳过: ${skipped}`)
    }

    // 显示失败的步骤详情
    const failedSteps = steps.filter(s => s.status === 'failed')
    if (failedSteps.length > 0) {
      console.log('\n❌ 失败步骤详情:')
      failedSteps.forEach(step => {
        console.log(`   - ${step.name}: ${step.error}`)
      })
    }

    // 计算总耗时
    const startTimes = steps.map(s => s.startTime).filter(Boolean) as number[]
    const endTimes = steps.map(s => s.endTime).filter(Boolean) as number[]

    if (startTimes.length > 0 && endTimes.length > 0) {
      const totalDuration = Math.max(...endTimes) - Math.min(...startTimes)
      console.log(`   ⏱️ 总耗时: ${(totalDuration / 1000).toFixed(1)}s`)
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stopSpinner()

    if (this.options.clearOnComplete) {
      // 清空控制台（可选）
      console.clear()
    }
  }

  /**
   * 获取所有步骤状态
   * @returns 步骤状态映射
   */
  getStepsStatus(): Map<string, ProgressStep> {
    return new Map(this.steps)
  }

  /**
   * 重置所有步骤
   */
  reset(): void {
    this.stopSpinner()
    this.steps.clear()
  }

  /**
   * 检查是否所有步骤都已完成
   * @returns 是否全部完成
   */
  isAllCompleted(): boolean {
    const steps = Array.from(this.steps.values())
    return steps.length > 0 && steps.every(s =>
      s.status === 'completed' || s.status === 'skipped'
    )
  }

  /**
   * 检查是否有失败的步骤
   * @returns 是否有失败
   */
  hasFailures(): boolean {
    return Array.from(this.steps.values()).some(s => s.status === 'failed')
  }
}

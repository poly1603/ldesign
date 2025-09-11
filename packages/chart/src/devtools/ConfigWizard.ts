/**
 * 图表配置向导
 * 
 * 提供交互式的图表配置生成功能，帮助开发者快速创建图表配置
 */

import type { ChartConfig, ChartType, ChartData } from '../core/types'

/**
 * 配置向导步骤
 */
export interface WizardStep {
  /** 步骤ID */
  id: string
  /** 步骤标题 */
  title: string
  /** 步骤描述 */
  description: string
  /** 是否必需 */
  required: boolean
  /** 验证函数 */
  validate?: (value: any) => boolean | string
}

/**
 * 配置向导选项
 */
export interface WizardOptions {
  /** 向导步骤 */
  steps: WizardStep[]
  /** 默认配置 */
  defaultConfig?: Partial<ChartConfig>
  /** 是否启用预览 */
  enablePreview?: boolean
}

/**
 * 向导结果
 */
export interface WizardResult {
  /** 生成的配置 */
  config: ChartConfig
  /** 配置代码 */
  code: string
  /** 预览数据 */
  previewData?: any
}

/**
 * 图表配置向导
 */
export class ConfigWizard {
  private _steps: WizardStep[] = []
  private _currentStep = 0
  private _answers: Record<string, any> = {}
  private _defaultConfig: Partial<ChartConfig> = {}

  constructor(options: WizardOptions = { steps: [] }) {
    this._steps = options.steps.length > 0 ? options.steps : this._getDefaultSteps()
    this._defaultConfig = options.defaultConfig || {}
  }

  /**
   * 开始向导
   * @returns 第一个步骤
   */
  start(): WizardStep {
    this._currentStep = 0
    this._answers = {}
    return this._steps[0]
  }

  /**
   * 获取当前步骤
   * @returns 当前步骤
   */
  getCurrentStep(): WizardStep | null {
    return this._steps[this._currentStep] || null
  }

  /**
   * 回答当前步骤
   * @param answer - 答案
   * @returns 是否成功
   */
  answer(answer: any): boolean | string {
    const currentStep = this.getCurrentStep()
    if (!currentStep) return false

    // 验证答案
    if (currentStep.validate) {
      const validation = currentStep.validate(answer)
      if (validation !== true) {
        return validation
      }
    }

    // 保存答案
    this._answers[currentStep.id] = answer
    return true
  }

  /**
   * 下一步
   * @returns 下一个步骤或null（如果已完成）
   */
  next(): WizardStep | null {
    if (this._currentStep < this._steps.length - 1) {
      this._currentStep++
      return this._steps[this._currentStep]
    }
    return null
  }

  /**
   * 上一步
   * @returns 上一个步骤或null（如果已是第一步）
   */
  previous(): WizardStep | null {
    if (this._currentStep > 0) {
      this._currentStep--
      return this._steps[this._currentStep]
    }
    return null
  }

  /**
   * 跳转到指定步骤
   * @param stepIndex - 步骤索引
   * @returns 指定步骤
   */
  goToStep(stepIndex: number): WizardStep | null {
    if (stepIndex >= 0 && stepIndex < this._steps.length) {
      this._currentStep = stepIndex
      return this._steps[this._currentStep]
    }
    return null
  }

  /**
   * 是否完成
   * @returns 是否完成
   */
  isComplete(): boolean {
    return this._currentStep >= this._steps.length - 1 && 
           this._steps.every(step => !step.required || this._answers[step.id] !== undefined)
  }

  /**
   * 获取进度
   * @returns 进度百分比
   */
  getProgress(): number {
    const answeredSteps = this._steps.filter(step => this._answers[step.id] !== undefined).length
    return (answeredSteps / this._steps.length) * 100
  }

  /**
   * 生成配置
   * @returns 向导结果
   */
  generateConfig(): WizardResult {
    const config = this._buildConfig()
    const code = this._generateCode(config)
    const previewData = this._generatePreviewData(config)

    return {
      config,
      code,
      previewData
    }
  }

  /**
   * 重置向导
   */
  reset(): void {
    this._currentStep = 0
    this._answers = {}
  }

  /**
   * 获取默认步骤
   * @returns 默认步骤列表
   */
  private _getDefaultSteps(): WizardStep[] {
    return [
      {
        id: 'chartType',
        title: '选择图表类型',
        description: '请选择您要创建的图表类型',
        required: true,
        validate: (value: ChartType) => {
          const validTypes = ['line', 'bar', 'pie', 'scatter', 'area', 'heatmap', 'radar', 'funnel', 'gauge']
          return validTypes.includes(value) || '请选择有效的图表类型'
        }
      },
      {
        id: 'dataSource',
        title: '配置数据源',
        description: '请选择数据源类型和格式',
        required: true,
        validate: (value: any) => {
          return value && (value.type === 'static' || value.type === 'api' || value.type === 'realtime') || '请选择数据源类型'
        }
      },
      {
        id: 'title',
        title: '设置图表标题',
        description: '为您的图表设置一个标题',
        required: false
      },
      {
        id: 'theme',
        title: '选择主题',
        description: '选择图表的视觉主题',
        required: false,
        validate: (value: string) => {
          const validThemes = ['light', 'dark', 'colorful', 'business', 'tech', 'nature', 'elegant']
          return !value || validThemes.includes(value) || '请选择有效的主题'
        }
      },
      {
        id: 'responsive',
        title: '响应式设置',
        description: '配置图表的响应式行为',
        required: false
      },
      {
        id: 'interactions',
        title: '交互功能',
        description: '启用图表的交互功能',
        required: false
      },
      {
        id: 'performance',
        title: '性能优化',
        description: '配置性能优化选项',
        required: false
      }
    ]
  }

  /**
   * 构建配置
   * @returns 图表配置
   */
  private _buildConfig(): ChartConfig {
    const config: ChartConfig = {
      type: this._answers.chartType || 'line',
      data: this._generateSampleData(this._answers.chartType),
      ...this._defaultConfig
    }

    // 应用答案到配置
    if (this._answers.title) {
      config.title = this._answers.title
    }

    if (this._answers.theme) {
      config.theme = this._answers.theme
    }

    if (this._answers.responsive) {
      config.responsive = this._answers.responsive
    }

    if (this._answers.performance) {
      config.performance = this._answers.performance
    }

    return config
  }

  /**
   * 生成代码
   * @param config - 图表配置
   * @returns 代码字符串
   */
  private _generateCode(config: ChartConfig): string {
    const configStr = JSON.stringify(config, null, 2)
    
    return `import { Chart } from '@ldesign/chart'

// 创建图表
const chart = new Chart('#chart-container', ${configStr})

// 可选：监听事件
chart.on('click', (params) => {
  console.log('图表点击事件:', params)
})

// 可选：更新数据
// chart.updateData(newData)

// 可选：导出图表
// chart.exportImage('png', { width: 800, height: 600 })`
  }

  /**
   * 生成示例数据
   * @param chartType - 图表类型
   * @returns 示例数据
   */
  private _generateSampleData(chartType: ChartType): ChartData {
    switch (chartType) {
      case 'pie':
        return {
          series: [{
            name: '示例数据',
            data: [
              { name: 'A', value: 30 },
              { name: 'B', value: 25 },
              { name: 'C', value: 20 },
              { name: 'D', value: 15 },
              { name: 'E', value: 10 }
            ]
          }]
        }
      
      case 'scatter':
        return {
          series: [{
            name: '示例数据',
            data: Array.from({ length: 20 }, (_, i) => ({
              name: `点${i + 1}`,
              value: [Math.random() * 100, Math.random() * 100]
            }))
          }]
        }
      
      default:
        return {
          categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
          series: [{
            name: '示例数据',
            data: [120, 200, 150, 80, 70, 110]
          }]
        }
    }
  }

  /**
   * 生成预览数据
   * @param config - 图表配置
   * @returns 预览数据
   */
  private _generatePreviewData(config: ChartConfig): any {
    return {
      config,
      sampleData: config.data,
      estimatedSize: this._estimateChartSize(config),
      recommendations: this._generateRecommendations(config)
    }
  }

  /**
   * 估算图表大小
   * @param config - 图表配置
   * @returns 估算大小
   */
  private _estimateChartSize(config: ChartConfig): { width: number; height: number } {
    // 简单的大小估算逻辑
    let width = 600
    let height = 400

    if (config.type === 'pie') {
      width = 400
      height = 400
    } else if (config.type === 'gauge') {
      width = 300
      height = 300
    }

    return { width, height }
  }

  /**
   * 生成建议
   * @param config - 图表配置
   * @returns 建议列表
   */
  private _generateRecommendations(config: ChartConfig): string[] {
    const recommendations: string[] = []

    if (!config.title) {
      recommendations.push('建议添加图表标题以提高可读性')
    }

    if (!config.responsive) {
      recommendations.push('建议启用响应式功能以适应不同屏幕尺寸')
    }

    if (config.type === 'line' || config.type === 'bar') {
      recommendations.push('考虑启用缩放功能以便用户查看详细数据')
    }

    if (!config.performance?.enableMonitoring) {
      recommendations.push('建议启用性能监控以优化图表性能')
    }

    return recommendations
  }
}

/**
 * 创建配置向导
 * @param options - 向导选项
 * @returns 配置向导实例
 */
export function createConfigWizard(options?: WizardOptions): ConfigWizard {
  return new ConfigWizard(options)
}

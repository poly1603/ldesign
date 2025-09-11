/**
 * 漏斗图图表
 * 
 * 提供漏斗图的数据适配和配置生成功能
 */

import type { EChartsOption } from 'echarts'
import type { ChartData } from '../core/types'
import { BaseChart } from './BaseChart'

/**
 * 漏斗图数据项
 */
export interface FunnelDataItem {
  /** 名称 */
  name: string
  /** 数值 */
  value: number
  /** 颜色 */
  color?: string
  /** 额外数据 */
  [key: string]: any
}

/**
 * 漏斗图配置
 */
export interface FunnelConfig {
  /** 漏斗图排序 */
  sort?: 'ascending' | 'descending' | 'none'
  /** 漏斗图方向 */
  orient?: 'vertical' | 'horizontal'
  /** 漏斗图位置 */
  left?: string | number
  /** 漏斗图顶部位置 */
  top?: string | number
  /** 漏斗图宽度 */
  width?: string | number
  /** 漏斗图高度 */
  height?: string | number
  /** 最小尺寸 */
  minSize?: string | number
  /** 最大尺寸 */
  maxSize?: string | number
  /** 间隙 */
  gap?: number
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'center' | 'inside' | 'outside'
  /** 是否显示引导线 */
  showLabelLine?: boolean
  /** 颜色配置 */
  colors?: string[]
}

/**
 * 漏斗图图表类
 */
export class FunnelChart extends BaseChart {
  /**
   * 适配数据
   * @param data - 原始数据
   * @returns 适配后的数据
   */
  adaptData(data: ChartData): any[] {
    if (!Array.isArray(data)) {
      throw new Error('漏斗图数据必须是数组格式')
    }

    return data.map((item: FunnelDataItem, index: number) => {
      if (typeof item === 'object' && item !== null) {
        return {
          name: item.name || `项目${index + 1}`,
          value: item.value,
          itemStyle: item.color ? { color: item.color } : undefined,
          ...item
        }
      }
      throw new Error(`漏斗图数据项 ${index} 格式不正确，需要包含 name 和 value 字段`)
    })
  }

  /**
   * 生成图表配置
   * @param data - 适配后的数据
   * @param config - 图表配置
   * @returns ECharts 配置
   */
  generateOption(data: any[], config: FunnelConfig = {}): EChartsOption {
    // 根据配置排序数据
    let sortedData = [...data]
    if (config.sort === 'ascending') {
      sortedData.sort((a, b) => a.value - b.value)
    } else if (config.sort === 'descending') {
      sortedData.sort((a, b) => b.value - a.value)
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value, percent } = params
          return `${params.marker}${name}<br/>数值: ${value}<br/>占比: ${percent}%`
        }
      },
      legend: {
        data: sortedData.map(item => item.name),
        orient: config.orient === 'horizontal' ? 'horizontal' : 'vertical',
        left: 'left'
      },
      series: [{
        name: '漏斗图',
        type: 'funnel',
        left: config.left || '10%',
        top: config.top || '60',
        width: config.width || '80%',
        height: config.height || '80%',
        minSize: config.minSize || '0%',
        maxSize: config.maxSize || '100%',
        sort: config.sort || 'descending',
        gap: config.gap || 2,
        label: {
          show: config.showLabel !== false,
          position: config.labelPosition || 'inside',
          formatter: '{b}: {c}'
        },
        labelLine: {
          show: config.showLabelLine === true,
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: sortedData
      }]
    }

    // 设置颜色
    if (config.colors && config.colors.length > 0) {
      option.color = config.colors
    }

    return option
  }

  /**
   * 获取图表类型
   */
  getType(): string {
    return 'funnel'
  }

  /**
   * 验证数据格式
   * @param data - 数据
   * @returns 是否有效
   */
  validateData(data: ChartData): boolean {
    if (!Array.isArray(data)) {
      return false
    }

    return data.every((item: any) => {
      return typeof item === 'object' && 
             item !== null && 
             typeof item.name === 'string' &&
             typeof item.value === 'number' &&
             item.value >= 0
    })
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): FunnelConfig {
    return {
      sort: 'descending',
      orient: 'vertical',
      left: '10%',
      top: '60',
      width: '80%',
      height: '80%',
      minSize: '0%',
      maxSize: '100%',
      gap: 2,
      showLabel: true,
      labelPosition: 'inside',
      showLabelLine: false,
      colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
    }
  }

  /**
   * 处理数据更新
   * @param oldData - 旧数据
   * @param newData - 新数据
   * @returns 更新配置
   */
  handleDataUpdate(oldData: any[], newData: any[]): Partial<EChartsOption> {
    const adaptedData = this.adaptData(newData)
    
    return {
      legend: {
        data: adaptedData.map(item => item.name)
      },
      series: [{
        data: adaptedData
      }]
    }
  }

  /**
   * 获取数据统计信息
   * @param data - 数据
   * @returns 统计信息
   */
  getDataStats(data: ChartData): any {
    if (!Array.isArray(data)) {
      return null
    }

    const values = data.map((item: FunnelDataItem) => item.value)
    const totalValue = values.reduce((sum, val) => sum + val, 0)
    
    // 计算转化率（相邻层级之间的比率）
    const conversionRates = []
    for (let i = 1; i < values.length; i++) {
      const rate = values[i] / values[i - 1]
      conversionRates.push({
        from: (data[i - 1] as FunnelDataItem).name,
        to: (data[i] as FunnelDataItem).name,
        rate: rate,
        percentage: (rate * 100).toFixed(2) + '%'
      })
    }

    return {
      totalItems: data.length,
      totalValue,
      maxValue: Math.max(...values),
      minValue: Math.min(...values),
      avgValue: totalValue / values.length,
      conversionRates,
      overallConversionRate: values.length > 1 ? values[values.length - 1] / values[0] : 1
    }
  }

  /**
   * 生成示例数据
   * @param stages - 漏斗阶段名称
   * @param baseValue - 基础数值
   * @returns 示例数据
   */
  generateSampleData(stages: string[], baseValue: number = 1000): FunnelDataItem[] {
    return stages.map((stage, index) => {
      // 每个阶段递减，模拟漏斗效果
      const conversionRate = Math.pow(0.7, index) // 每层70%的转化率
      return {
        name: stage,
        value: Math.round(baseValue * conversionRate)
      }
    })
  }

  /**
   * 计算转化率
   * @param data - 数据
   * @returns 转化率信息
   */
  calculateConversionRates(data: ChartData): any[] {
    if (!Array.isArray(data) || data.length < 2) {
      return []
    }

    const rates = []
    for (let i = 1; i < data.length; i++) {
      const current = data[i] as FunnelDataItem
      const previous = data[i - 1] as FunnelDataItem
      
      const rate = current.value / previous.value
      rates.push({
        fromStage: previous.name,
        toStage: current.name,
        fromValue: previous.value,
        toValue: current.value,
        conversionRate: rate,
        lossRate: 1 - rate,
        lossCount: previous.value - current.value
      })
    }

    return rates
  }
}

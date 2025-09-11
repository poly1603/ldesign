/**
 * 仪表盘图表
 * 
 * 提供仪表盘的数据适配和配置生成功能
 */

import type { EChartsOption } from 'echarts'
import type { ChartData } from '../core/types'
import { BaseChart } from './BaseChart'

/**
 * 仪表盘数据项
 */
export interface GaugeDataItem {
  /** 名称 */
  name: string
  /** 数值 */
  value: number
  /** 标题 */
  title?: string
  /** 详情 */
  detail?: string
  /** 额外数据 */
  [key: string]: any
}

/**
 * 仪表盘配置
 */
export interface GaugeConfig {
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 分割段数 */
  splitNumber?: number
  /** 仪表盘半径 */
  radius?: string | number
  /** 仪表盘中心位置 */
  center?: [string | number, string | number]
  /** 开始角度 */
  startAngle?: number
  /** 结束角度 */
  endAngle?: number
  /** 是否顺时针 */
  clockwise?: boolean
  /** 轴线配置 */
  axisLine?: {
    show?: boolean
    lineStyle?: {
      width?: number
      color?: Array<[number, string]>
    }
  }
  /** 分割线配置 */
  splitLine?: {
    show?: boolean
    length?: number
    lineStyle?: {
      width?: number
      color?: string
    }
  }
  /** 刻度配置 */
  axisTick?: {
    show?: boolean
    length?: number
    lineStyle?: {
      width?: number
      color?: string
    }
  }
  /** 轴标签配置 */
  axisLabel?: {
    show?: boolean
    distance?: number
    color?: string
    fontSize?: number
    formatter?: string | Function
  }
  /** 指针配置 */
  pointer?: {
    show?: boolean
    length?: string | number
    width?: number
    color?: string
  }
  /** 标题配置 */
  title?: {
    show?: boolean
    offsetCenter?: [string | number, string | number]
    color?: string
    fontSize?: number
  }
  /** 详情配置 */
  detail?: {
    show?: boolean
    offsetCenter?: [string | number, string | number]
    color?: string
    fontSize?: number
    formatter?: string | Function
  }
}

/**
 * 仪表盘图表类
 */
export class GaugeChart extends BaseChart {
  /**
   * 适配数据
   * @param data - 原始数据
   * @returns 适配后的数据
   */
  adaptData(data: ChartData): any[] {
    if (!Array.isArray(data)) {
      // 如果是单个数值，转换为数组
      if (typeof data === 'number') {
        return [{ name: '数值', value: data }]
      }
      // 如果是单个对象，转换为数组
      if (typeof data === 'object' && data !== null) {
        return [data]
      }
      throw new Error('仪表盘数据格式不正确')
    }

    return data.map((item: GaugeDataItem | number, index: number) => {
      if (typeof item === 'number') {
        return {
          name: `数值${index + 1}`,
          value: item
        }
      }
      
      if (typeof item === 'object' && item !== null) {
        return {
          name: item.name || `数值${index + 1}`,
          value: item.value,
          title: item.title,
          detail: item.detail,
          ...item
        }
      }
      
      throw new Error(`仪表盘数据项 ${index} 格式不正确`)
    })
  }

  /**
   * 生成图表配置
   * @param data - 适配后的数据
   * @param config - 图表配置
   * @returns ECharts 配置
   */
  generateOption(data: any[], config: GaugeConfig = {}): EChartsOption {
    const option: EChartsOption = {
      tooltip: {
        formatter: (params: any) => {
          const { name, value } = params
          return `${params.marker}${name}<br/>数值: ${value}`
        }
      },
      series: [{
        name: '仪表盘',
        type: 'gauge',
        min: config.min || 0,
        max: config.max || 100,
        splitNumber: config.splitNumber || 10,
        radius: config.radius || '75%',
        center: config.center || ['50%', '50%'],
        startAngle: config.startAngle || 225,
        endAngle: config.endAngle || -45,
        clockwise: config.clockwise !== false,
        axisLine: {
          show: config.axisLine?.show !== false,
          lineStyle: {
            width: config.axisLine?.lineStyle?.width || 30,
            color: config.axisLine?.lineStyle?.color || [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        },
        pointer: {
          show: config.pointer?.show !== false,
          length: config.pointer?.length || '75%',
          width: config.pointer?.width || 6,
          itemStyle: {
            color: config.pointer?.color || 'auto'
          }
        },
        axisTick: {
          show: config.axisTick?.show !== false,
          length: config.axisTick?.length || 15,
          lineStyle: {
            color: config.axisTick?.lineStyle?.color || 'auto',
            width: config.axisTick?.lineStyle?.width || 2
          }
        },
        splitLine: {
          show: config.splitLine?.show !== false,
          length: config.splitLine?.length || 30,
          lineStyle: {
            color: config.splitLine?.lineStyle?.color || 'auto',
            width: config.splitLine?.lineStyle?.width || 4
          }
        },
        axisLabel: {
          show: config.axisLabel?.show !== false,
          distance: config.axisLabel?.distance || -50,
          color: config.axisLabel?.color || 'auto',
          fontSize: config.axisLabel?.fontSize || 20,
          formatter: config.axisLabel?.formatter || '{value}'
        },
        title: {
          show: config.title?.show !== false,
          offsetCenter: config.title?.offsetCenter || [0, '-30%'],
          fontSize: config.title?.fontSize || 20,
          color: config.title?.color || '#464646'
        },
        detail: {
          show: config.detail?.show !== false,
          offsetCenter: config.detail?.offsetCenter || [0, '-20%'],
          fontSize: config.detail?.fontSize || 30,
          color: config.detail?.color || 'auto',
          formatter: config.detail?.formatter || '{value}%'
        },
        data: data
      }]
    }

    return option
  }

  /**
   * 获取图表类型
   */
  getType(): string {
    return 'gauge'
  }

  /**
   * 验证数据格式
   * @param data - 数据
   * @returns 是否有效
   */
  validateData(data: ChartData): boolean {
    // 支持单个数值
    if (typeof data === 'number') {
      return true
    }

    // 支持单个对象
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return typeof (data as any).value === 'number'
    }

    // 支持数组
    if (Array.isArray(data)) {
      return data.every((item: any) => {
        if (typeof item === 'number') {
          return true
        }
        return typeof item === 'object' && 
               item !== null && 
               typeof item.value === 'number'
      })
    }

    return false
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): GaugeConfig {
    return {
      min: 0,
      max: 100,
      splitNumber: 10,
      radius: '75%',
      center: ['50%', '50%'],
      startAngle: 225,
      endAngle: -45,
      clockwise: true,
      axisLine: {
        show: true,
        lineStyle: {
          width: 30,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      pointer: {
        show: true,
        length: '75%',
        width: 6
      },
      axisTick: {
        show: true,
        length: 15,
        lineStyle: {
          width: 2
        }
      },
      splitLine: {
        show: true,
        length: 30,
        lineStyle: {
          width: 4
        }
      },
      axisLabel: {
        show: true,
        distance: -50,
        fontSize: 20
      },
      title: {
        show: true,
        offsetCenter: [0, '-30%'],
        fontSize: 20,
        color: '#464646'
      },
      detail: {
        show: true,
        offsetCenter: [0, '-20%'],
        fontSize: 30,
        formatter: '{value}%'
      }
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
    const adaptedData = this.adaptData(data)
    const values = adaptedData.map(item => item.value)

    return {
      count: adaptedData.length,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      avgValue: values.reduce((sum, val) => sum + val, 0) / values.length,
      totalValue: values.reduce((sum, val) => sum + val, 0)
    }
  }

  /**
   * 生成示例数据
   * @param count - 数据项数量
   * @param min - 最小值
   * @param max - 最大值
   * @returns 示例数据
   */
  generateSampleData(count: number = 1, min: number = 0, max: number = 100): GaugeDataItem[] {
    const data: GaugeDataItem[] = []
    
    for (let i = 0; i < count; i++) {
      data.push({
        name: `指标${i + 1}`,
        value: Math.round(Math.random() * (max - min) + min)
      })
    }
    
    return data
  }

  /**
   * 创建多仪表盘配置
   * @param data - 数据
   * @param config - 配置
   * @returns 多仪表盘配置
   */
  createMultiGaugeOption(data: any[], config: GaugeConfig = {}): EChartsOption {
    const gaugeCount = data.length
    const cols = Math.ceil(Math.sqrt(gaugeCount))
    const rows = Math.ceil(gaugeCount / cols)
    
    const series = data.map((item, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      const centerX = (col + 0.5) / cols * 100 + '%'
      const centerY = (row + 0.5) / rows * 100 + '%'
      const radius = Math.min(80 / cols, 80 / rows) + '%'
      
      return {
        ...this.generateOption([item], config).series![0],
        center: [centerX, centerY],
        radius: radius
      }
    })

    return {
      tooltip: {
        formatter: (params: any) => {
          const { name, value } = params
          return `${params.marker}${name}<br/>数值: ${value}`
        }
      },
      series
    }
  }
}

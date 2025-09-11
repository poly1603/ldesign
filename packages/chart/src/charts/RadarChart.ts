/**
 * 雷达图图表
 * 
 * 提供雷达图的数据适配和配置生成功能
 */

import type { EChartsOption } from 'echarts'
import type { ChartData } from '../core/types'
import { BaseChart } from './BaseChart'

/**
 * 雷达图数据项
 */
export interface RadarDataItem {
  /** 系列名称 */
  name: string
  /** 数值数组 */
  values: number[]
  /** 额外数据 */
  [key: string]: any
}

/**
 * 雷达图指标
 */
export interface RadarIndicator {
  /** 指标名称 */
  name: string
  /** 最大值 */
  max?: number
  /** 最小值 */
  min?: number
  /** 颜色 */
  color?: string
}

/**
 * 雷达图配置
 */
export interface RadarConfig {
  /** 指标配置 */
  indicators?: RadarIndicator[]
  /** 雷达图形状 */
  shape?: 'polygon' | 'circle'
  /** 是否显示分割线 */
  splitLine?: {
    show?: boolean
    lineStyle?: {
      color?: string
      width?: number
      type?: 'solid' | 'dashed' | 'dotted'
    }
  }
  /** 是否显示分割区域 */
  splitArea?: {
    show?: boolean
    areaStyle?: {
      color?: string[]
    }
  }
  /** 坐标轴线配置 */
  axisLine?: {
    show?: boolean
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  /** 坐标轴标签配置 */
  axisLabel?: {
    show?: boolean
    color?: string
    fontSize?: number
  }
  /** 雷达图半径 */
  radius?: string | number
  /** 雷达图中心位置 */
  center?: [string | number, string | number]
}

/**
 * 雷达图图表类
 */
export class RadarChart extends BaseChart {
  /**
   * 适配数据
   * @param data - 原始数据
   * @returns 适配后的数据
   */
  adaptData(data: ChartData): any[] {
    if (!Array.isArray(data)) {
      throw new Error('雷达图数据必须是数组格式')
    }

    return data.map((item: RadarDataItem, index: number) => {
      if (typeof item === 'object' && item !== null && Array.isArray(item.values)) {
        return {
          name: item.name || `系列${index + 1}`,
          value: item.values,
          ...item
        }
      }
      throw new Error(`雷达图数据项 ${index} 格式不正确，需要包含 name 和 values 字段`)
    })
  }

  /**
   * 生成图表配置
   * @param data - 适配后的数据
   * @param config - 图表配置
   * @returns ECharts 配置
   */
  generateOption(data: any[], config: RadarConfig = {}): EChartsOption {
    // 如果没有提供指标配置，从数据中推断
    let indicators = config.indicators
    if (!indicators && data.length > 0) {
      const firstItem = data[0]
      if (Array.isArray(firstItem.value)) {
        indicators = firstItem.value.map((_: any, index: number) => ({
          name: `指标${index + 1}`,
          max: this._calculateMaxValue(data, index)
        }))
      }
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value } = params
          let content = `${params.marker}${name}<br/>`
          if (Array.isArray(value) && indicators) {
            value.forEach((val: number, index: number) => {
              content += `${indicators![index].name}: ${val}<br/>`
            })
          }
          return content
        }
      },
      legend: {
        data: data.map(item => item.name),
        top: 'bottom'
      },
      radar: {
        indicator: indicators || [],
        shape: config.shape || 'polygon',
        radius: config.radius || '75%',
        center: config.center || ['50%', '50%'],
        splitNumber: 5,
        splitLine: {
          show: config.splitLine?.show !== false,
          lineStyle: {
            color: config.splitLine?.lineStyle?.color || '#ccc',
            width: config.splitLine?.lineStyle?.width || 1,
            type: config.splitLine?.lineStyle?.type || 'solid'
          }
        },
        splitArea: {
          show: config.splitArea?.show === true,
          areaStyle: {
            color: config.splitArea?.areaStyle?.color || ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
          }
        },
        axisLine: {
          show: config.axisLine?.show !== false,
          lineStyle: {
            color: config.axisLine?.lineStyle?.color || '#ccc',
            width: config.axisLine?.lineStyle?.width || 1
          }
        },
        axisLabel: {
          show: config.axisLabel?.show !== false,
          color: config.axisLabel?.color || '#666',
          fontSize: config.axisLabel?.fontSize || 12
        }
      },
      series: [{
        name: '雷达图',
        type: 'radar',
        data: data,
        emphasis: {
          lineStyle: {
            width: 4
          }
        }
      }]
    }

    return option
  }

  /**
   * 获取图表类型
   */
  getType(): string {
    return 'radar'
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
             Array.isArray(item.values) &&
             item.values.every((val: any) => typeof val === 'number')
    })
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): RadarConfig {
    return {
      shape: 'polygon',
      radius: '75%',
      center: ['50%', '50%'],
      splitLine: {
        show: true,
        lineStyle: {
          color: '#ccc',
          width: 1,
          type: 'solid'
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ccc',
          width: 1
        }
      },
      axisLabel: {
        show: true,
        color: '#666',
        fontSize: 12
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

    const seriesCount = data.length
    const indicatorCount = data.length > 0 ? (data[0] as RadarDataItem).values.length : 0
    
    // 计算每个指标的统计信息
    const indicatorStats = []
    for (let i = 0; i < indicatorCount; i++) {
      const values = data.map((item: RadarDataItem) => item.values[i])
      indicatorStats.push({
        index: i,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length
      })
    }

    return {
      seriesCount,
      indicatorCount,
      indicatorStats,
      totalDataPoints: seriesCount * indicatorCount
    }
  }

  /**
   * 生成示例数据
   * @param seriesNames - 系列名称
   * @param indicatorNames - 指标名称
   * @returns 示例数据
   */
  generateSampleData(seriesNames: string[], indicatorNames: string[]): RadarDataItem[] {
    return seriesNames.map(name => ({
      name,
      values: indicatorNames.map(() => Math.round(Math.random() * 100))
    }))
  }

  /**
   * 计算指标的最大值
   * @param data - 数据
   * @param indicatorIndex - 指标索引
   * @returns 最大值
   */
  private _calculateMaxValue(data: any[], indicatorIndex: number): number {
    const values = data
      .map(item => item.value[indicatorIndex])
      .filter(val => typeof val === 'number')
    
    return values.length > 0 ? Math.max(...values) : 100
  }
}

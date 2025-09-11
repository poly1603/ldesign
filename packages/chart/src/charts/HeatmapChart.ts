/**
 * 热力图图表
 * 
 * 提供热力图的数据适配和配置生成功能
 */

import type { EChartsOption } from 'echarts'
import type { ChartData } from '../core/types'
import { BaseChart } from './BaseChart'

/**
 * 热力图数据项
 */
export interface HeatmapDataItem {
  /** X 轴值 */
  x: string | number
  /** Y 轴值 */
  y: string | number
  /** 数值 */
  value: number
  /** 额外数据 */
  [key: string]: any
}

/**
 * 热力图配置
 */
export interface HeatmapConfig {
  /** 颜色映射 */
  colorMap?: {
    min?: string
    max?: string
    colors?: string[]
  }
  /** 是否显示数值标签 */
  showLabel?: boolean
  /** 网格线配置 */
  grid?: {
    show?: boolean
    color?: string
    width?: number
  }
  /** 视觉映射配置 */
  visualMap?: {
    show?: boolean
    min?: number
    max?: number
    calculable?: boolean
    orient?: 'horizontal' | 'vertical'
    left?: string | number
    bottom?: string | number
  }
}

/**
 * 热力图图表类
 */
export class HeatmapChart extends BaseChart {
  /**
   * 适配数据
   * @param data - 原始数据
   * @returns 适配后的数据
   */
  adaptData(data: ChartData): any[] {
    if (!Array.isArray(data)) {
      throw new Error('热力图数据必须是数组格式')
    }

    return data.map((item: HeatmapDataItem, index: number) => {
      if (typeof item === 'object' && item !== null) {
        return [item.x, item.y, item.value]
      }
      throw new Error(`热力图数据项 ${index} 格式不正确，需要包含 x, y, value 字段`)
    })
  }

  /**
   * 生成图表配置
   * @param data - 适配后的数据
   * @param config - 图表配置
   * @returns ECharts 配置
   */
  generateOption(data: any[], config: HeatmapConfig = {}): EChartsOption {
    // 提取 X 和 Y 轴的唯一值
    const xValues = [...new Set(data.map(item => item[0]))].sort()
    const yValues = [...new Set(data.map(item => item[1]))].sort()
    
    // 计算数值范围
    const values = data.map(item => item[2])
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    const option: EChartsOption = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const [x, y, value] = params.data
          return `${params.marker}${x} - ${y}<br/>数值: ${value}`
        }
      },
      grid: {
        height: '50%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: xValues,
        splitArea: {
          show: config.grid?.show !== false
        }
      },
      yAxis: {
        type: 'category',
        data: yValues,
        splitArea: {
          show: config.grid?.show !== false
        }
      },
      visualMap: {
        min: config.visualMap?.min ?? minValue,
        max: config.visualMap?.max ?? maxValue,
        calculable: config.visualMap?.calculable !== false,
        orient: config.visualMap?.orient || 'vertical',
        left: config.visualMap?.left || 'left',
        bottom: config.visualMap?.bottom || '15%',
        show: config.visualMap?.show !== false,
        inRange: {
          color: config.colorMap?.colors || ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
      },
      series: [{
        name: '热力图',
        type: 'heatmap',
        data: data,
        label: {
          show: config.showLabel === true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
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
    return 'heatmap'
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
             (typeof item.x === 'string' || typeof item.x === 'number') &&
             (typeof item.y === 'string' || typeof item.y === 'number') &&
             typeof item.value === 'number'
    })
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): HeatmapConfig {
    return {
      colorMap: {
        colors: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      showLabel: false,
      grid: {
        show: true,
        color: '#ccc',
        width: 1
      },
      visualMap: {
        show: true,
        calculable: true,
        orient: 'vertical',
        left: 'left',
        bottom: '15%'
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
    if (!Array.isArray(data)) {
      return null
    }

    const values = data.map((item: HeatmapDataItem) => item.value)
    const xValues = [...new Set(data.map((item: HeatmapDataItem) => item.x))]
    const yValues = [...new Set(data.map((item: HeatmapDataItem) => item.y))]

    return {
      totalPoints: data.length,
      xCategories: xValues.length,
      yCategories: yValues.length,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      avgValue: values.reduce((sum, val) => sum + val, 0) / values.length,
      valueRange: Math.max(...values) - Math.min(...values)
    }
  }

  /**
   * 生成示例数据
   * @param xCategories - X 轴分类
   * @param yCategories - Y 轴分类
   * @returns 示例数据
   */
  generateSampleData(xCategories: string[], yCategories: string[]): HeatmapDataItem[] {
    const data: HeatmapDataItem[] = []
    
    for (let i = 0; i < xCategories.length; i++) {
      for (let j = 0; j < yCategories.length; j++) {
        data.push({
          x: xCategories[i],
          y: yCategories[j],
          value: Math.round(Math.random() * 100)
        })
      }
    }
    
    return data
  }
}

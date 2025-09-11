/**
 * 基础图表类
 * 
 * 定义所有图表类型的通用接口和基础功能
 */

import type { EChartsOption } from 'echarts'
import type { ChartData } from '../core/types'

/**
 * 图表接口
 */
export interface IChart {
  /** 适配数据 */
  adaptData(data: ChartData): any[]
  
  /** 生成图表配置 */
  generateOption(data: any[], config?: any): EChartsOption
  
  /** 获取图表类型 */
  getType(): string
  
  /** 验证数据格式 */
  validateData(data: ChartData): boolean
  
  /** 获取默认配置 */
  getDefaultConfig(): any
  
  /** 处理数据更新 */
  handleDataUpdate(oldData: any[], newData: any[]): Partial<EChartsOption>
  
  /** 获取数据统计信息 */
  getDataStats(data: ChartData): any
}

/**
 * 基础图表抽象类
 */
export abstract class BaseChart implements IChart {
  /**
   * 适配数据
   * @param data - 原始数据
   * @returns 适配后的数据
   */
  abstract adaptData(data: ChartData): any[]

  /**
   * 生成图表配置
   * @param data - 适配后的数据
   * @param config - 图表配置
   * @returns ECharts 配置
   */
  abstract generateOption(data: any[], config?: any): EChartsOption

  /**
   * 获取图表类型
   */
  abstract getType(): string

  /**
   * 验证数据格式
   * @param data - 数据
   * @returns 是否有效
   */
  abstract validateData(data: ChartData): boolean

  /**
   * 获取默认配置
   */
  abstract getDefaultConfig(): any

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

    return {
      count: data.length,
      type: this.getType()
    }
  }

  /**
   * 合并配置
   * @param defaultConfig - 默认配置
   * @param userConfig - 用户配置
   * @returns 合并后的配置
   */
  protected mergeConfig(defaultConfig: any, userConfig: any = {}): any {
    return this.deepMerge(defaultConfig, userConfig)
  }

  /**
   * 深度合并对象
   * @param target - 目标对象
   * @param source - 源对象
   * @returns 合并后的对象
   */
  protected deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (this.isObject(source[key]) && this.isObject(result[key])) {
          result[key] = this.deepMerge(result[key], source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }

  /**
   * 判断是否为对象
   * @param obj - 要判断的值
   * @returns 是否为对象
   */
  protected isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
  }

  /**
   * 格式化数值
   * @param value - 数值
   * @param precision - 精度
   * @returns 格式化后的字符串
   */
  protected formatNumber(value: number, precision: number = 2): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0'
    }
    
    return value.toFixed(precision)
  }

  /**
   * 格式化百分比
   * @param value - 数值
   * @param total - 总数
   * @param precision - 精度
   * @returns 格式化后的百分比字符串
   */
  protected formatPercentage(value: number, total: number, precision: number = 1): string {
    if (total === 0) {
      return '0%'
    }
    
    const percentage = (value / total) * 100
    return this.formatNumber(percentage, precision) + '%'
  }

  /**
   * 生成颜色数组
   * @param count - 颜色数量
   * @param baseColors - 基础颜色
   * @returns 颜色数组
   */
  protected generateColors(count: number, baseColors?: string[]): string[] {
    const defaultColors = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#5fb3d3'
    ]
    
    const colors = baseColors || defaultColors
    const result: string[] = []
    
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length])
    }
    
    return result
  }

  /**
   * 计算数据范围
   * @param values - 数值数组
   * @returns 数据范围
   */
  protected calculateDataRange(values: number[]): { min: number; max: number; range: number } {
    if (values.length === 0) {
      return { min: 0, max: 0, range: 0 }
    }
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    
    return { min, max, range }
  }

  /**
   * 生成刻度
   * @param min - 最小值
   * @param max - 最大值
   * @param count - 刻度数量
   * @returns 刻度数组
   */
  protected generateTicks(min: number, max: number, count: number = 5): number[] {
    if (min === max) {
      return [min]
    }
    
    const step = (max - min) / (count - 1)
    const ticks: number[] = []
    
    for (let i = 0; i < count; i++) {
      ticks.push(min + step * i)
    }
    
    return ticks
  }

  /**
   * 安全获取嵌套属性
   * @param obj - 对象
   * @param path - 属性路径
   * @param defaultValue - 默认值
   * @returns 属性值
   */
  protected safeGet(obj: any, path: string, defaultValue: any = undefined): any {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue
      }
      current = current[key]
    }
    
    return current
  }

  /**
   * 验证必需字段
   * @param data - 数据
   * @param requiredFields - 必需字段
   * @returns 验证结果
   */
  protected validateRequiredFields(data: any, requiredFields: string[]): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }
    
    return requiredFields.every(field => {
      return this.safeGet(data, field) !== undefined
    })
  }

  /**
   * 创建工具提示格式化函数
   * @param formatter - 自定义格式化函数
   * @returns 工具提示配置
   */
  protected createTooltipFormatter(formatter?: (params: any) => string): any {
    return {
      trigger: 'item',
      formatter: formatter || ((params: any) => {
        const { name, value, marker } = params
        return `${marker}${name}<br/>数值: ${value}`
      })
    }
  }

  /**
   * 创建图例配置
   * @param data - 数据
   * @param config - 图例配置
   * @returns 图例配置
   */
  protected createLegendConfig(data: any[], config: any = {}): any {
    return {
      data: data.map(item => item.name || item),
      orient: config.orient || 'horizontal',
      left: config.left || 'center',
      top: config.top || 'top',
      ...config
    }
  }

  /**
   * 创建网格配置
   * @param config - 网格配置
   * @returns 网格配置
   */
  protected createGridConfig(config: any = {}): any {
    return {
      left: config.left || '3%',
      right: config.right || '4%',
      bottom: config.bottom || '3%',
      top: config.top || '10%',
      containLabel: config.containLabel !== false,
      ...config
    }
  }
}

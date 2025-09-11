/**
 * 交互管理器
 * 
 * 提供图表的高级交互功能，包括：
 * - 缩放和平移
 * - 数据筛选和选择
 * - 刷选功能
 * - 数据钻取
 * - 图表联动
 */

import type { ECharts, EChartsOption } from 'echarts'
import type { ChartConfig, ChartData } from '../core/types'

/**
 * 交互配置接口
 */
export interface InteractionConfig {
  /** 是否启用缩放 */
  zoom?: boolean
  /** 是否启用平移 */
  pan?: boolean
  /** 是否启用刷选 */
  brush?: boolean
  /** 是否启用数据筛选 */
  dataFilter?: boolean
  /** 是否启用数据钻取 */
  dataDrill?: boolean
  /** 缩放配置 */
  zoomConfig?: {
    /** 缩放类型 */
    type?: 'inside' | 'slider' | 'both'
    /** 缩放轴 */
    axis?: 'x' | 'y' | 'both'
    /** 最小缩放比例 */
    minZoom?: number
    /** 最大缩放比例 */
    maxZoom?: number
  }
  /** 刷选配置 */
  brushConfig?: {
    /** 刷选类型 */
    type?: 'rect' | 'polygon' | 'lineX' | 'lineY'
    /** 是否显示工具栏 */
    showToolbar?: boolean
  }
}

/**
 * 选择事件数据
 */
export interface SelectionEventData {
  /** 选中的数据点 */
  selectedData: any[]
  /** 选中的系列索引 */
  seriesIndex: number[]
  /** 选中的数据索引 */
  dataIndex: number[]
}

/**
 * 缩放事件数据
 */
export interface ZoomEventData {
  /** 缩放开始位置 */
  start: number
  /** 缩放结束位置 */
  end: number
  /** 缩放轴 */
  axis: 'x' | 'y'
}

/**
 * 交互管理器类
 */
export class InteractionManager {
  /** ECharts 实例 */
  private _echarts: ECharts | null = null
  
  /** 图表配置 */
  private _config: ChartConfig | null = null
  
  /** 交互配置 */
  private _interactionConfig: InteractionConfig = {}
  
  /** 当前选中的数据 */
  private _selectedData: SelectionEventData | null = null
  
  /** 缩放历史 */
  private _zoomHistory: ZoomEventData[] = []
  
  /** 事件回调 */
  private _callbacks: Map<string, Function[]> = new Map()

  /**
   * 初始化交互管理器
   * @param echarts - ECharts 实例
   * @param config - 图表配置
   * @param interactionConfig - 交互配置
   */
  initialize(echarts: ECharts, config: ChartConfig, interactionConfig: InteractionConfig = {}): void {
    this._echarts = echarts
    this._config = config
    this._interactionConfig = { ...this._getDefaultConfig(), ...interactionConfig }
    
    this._setupInteractions()
  }

  /**
   * 启用缩放功能
   * @param config - 缩放配置
   */
  enableZoom(config?: InteractionConfig['zoomConfig']): void {
    if (!this._echarts) return
    
    const zoomConfig = { ...this._interactionConfig.zoomConfig, ...config }
    
    const option: EChartsOption = {
      dataZoom: []
    }
    
    // 添加内部缩放
    if (zoomConfig.type === 'inside' || zoomConfig.type === 'both') {
      option.dataZoom!.push({
        type: 'inside',
        xAxisIndex: zoomConfig.axis === 'y' ? undefined : 0,
        yAxisIndex: zoomConfig.axis === 'x' ? undefined : 0,
        minValueSpan: zoomConfig.minZoom || 0.1,
        maxValueSpan: zoomConfig.maxZoom || 1
      })
    }
    
    // 添加滑块缩放
    if (zoomConfig.type === 'slider' || zoomConfig.type === 'both') {
      option.dataZoom!.push({
        type: 'slider',
        xAxisIndex: zoomConfig.axis === 'y' ? undefined : 0,
        yAxisIndex: zoomConfig.axis === 'x' ? undefined : 0,
        start: 0,
        end: 100
      })
    }
    
    this._echarts.setOption(option)
    this._setupZoomEvents()
  }

  /**
   * 启用刷选功能
   * @param config - 刷选配置
   */
  enableBrush(config?: InteractionConfig['brushConfig']): void {
    if (!this._echarts) return
    
    const brushConfig = { ...this._interactionConfig.brushConfig, ...config }
    
    const option: EChartsOption = {
      brush: {
        toolbox: brushConfig.showToolbar ? ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'] : undefined,
        brushType: brushConfig.type || 'rect',
        brushMode: 'single'
      }
    }
    
    this._echarts.setOption(option)
    this._setupBrushEvents()
  }

  /**
   * 启用数据筛选
   */
  enableDataFilter(): void {
    if (!this._echarts) return
    
    this._setupDataFilterEvents()
  }

  /**
   * 筛选数据
   * @param filterFn - 筛选函数
   */
  filterData(filterFn: (dataItem: any, index: number) => boolean): void {
    if (!this._config || !this._echarts) return
    
    // 这里需要根据具体的数据结构来实现筛选逻辑
    // 暂时提供一个基础实现
    this._triggerCallback('dataFilter', { filterFn })
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    if (!this._echarts) return
    
    this._echarts.dispatchAction({
      type: 'brush',
      areas: []
    })
    
    this._selectedData = null
    this._triggerCallback('selectionClear', {})
  }

  /**
   * 重置缩放
   */
  resetZoom(): void {
    if (!this._echarts) return
    
    this._echarts.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100
    })
    
    this._zoomHistory = []
    this._triggerCallback('zoomReset', {})
  }

  /**
   * 注册事件回调
   * @param event - 事件名称
   * @param callback - 回调函数
   */
  on(event: string, callback: Function): void {
    if (!this._callbacks.has(event)) {
      this._callbacks.set(event, [])
    }
    this._callbacks.get(event)!.push(callback)
  }

  /**
   * 注销事件回调
   * @param event - 事件名称
   * @param callback - 回调函数
   */
  off(event: string, callback?: Function): void {
    if (!this._callbacks.has(event)) return
    
    if (callback) {
      const callbacks = this._callbacks.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      this._callbacks.delete(event)
    }
  }

  /**
   * 销毁交互管理器
   */
  dispose(): void {
    this._echarts = null
    this._config = null
    this._selectedData = null
    this._zoomHistory = []
    this._callbacks.clear()
  }

  /**
   * 获取默认配置
   */
  private _getDefaultConfig(): InteractionConfig {
    return {
      zoom: false,
      pan: false,
      brush: false,
      dataFilter: false,
      dataDrill: false,
      zoomConfig: {
        type: 'both',
        axis: 'both',
        minZoom: 0.1,
        maxZoom: 1
      },
      brushConfig: {
        type: 'rect',
        showToolbar: true
      }
    }
  }

  /**
   * 设置交互功能
   */
  private _setupInteractions(): void {
    if (!this._echarts) return
    
    // 根据配置启用相应的交互功能
    if (this._interactionConfig.zoom) {
      this.enableZoom()
    }
    
    if (this._interactionConfig.brush) {
      this.enableBrush()
    }
    
    if (this._interactionConfig.dataFilter) {
      this.enableDataFilter()
    }
  }

  /**
   * 设置缩放事件
   */
  private _setupZoomEvents(): void {
    if (!this._echarts) return
    
    this._echarts.on('dataZoom', (params: any) => {
      const zoomData: ZoomEventData = {
        start: params.start,
        end: params.end,
        axis: params.dataZoomId?.includes('y') ? 'y' : 'x'
      }
      
      this._zoomHistory.push(zoomData)
      this._triggerCallback('zoom', zoomData)
    })
  }

  /**
   * 设置刷选事件
   */
  private _setupBrushEvents(): void {
    if (!this._echarts) return
    
    this._echarts.on('brushSelected', (params: any) => {
      const selectionData: SelectionEventData = {
        selectedData: params.batch[0]?.selected || [],
        seriesIndex: params.batch[0]?.selected?.map((item: any) => item.seriesIndex) || [],
        dataIndex: params.batch[0]?.selected?.map((item: any) => item.dataIndex) || []
      }
      
      this._selectedData = selectionData
      this._triggerCallback('brushSelected', selectionData)
    })
  }

  /**
   * 设置数据筛选事件
   */
  private _setupDataFilterEvents(): void {
    if (!this._echarts) return
    
    // 监听点击事件进行数据筛选
    this._echarts.on('click', (params: any) => {
      this._triggerCallback('dataClick', {
        data: params.data,
        seriesIndex: params.seriesIndex,
        dataIndex: params.dataIndex
      })
    })
  }

  /**
   * 触发回调
   * @param event - 事件名称
   * @param data - 事件数据
   */
  private _triggerCallback(event: string, data: any): void {
    const callbacks = this._callbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }
}

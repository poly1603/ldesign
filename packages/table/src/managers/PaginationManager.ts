/**
 * 分页管理器
 * 
 * 负责表格分页功能的管理
 * 支持前端分页和后端分页
 * 提供完整的分页状态管理和数据处理
 */

import { Pagination, type PaginationConfig } from '../components/Pagination'
import type { TableRow, TableId } from '../types'

/**
 * 分页管理器配置
 */
export interface PaginationManagerConfig {
  /** 是否启用分页 */
  enabled: boolean
  /** 分页模式：frontend（前端分页）| backend（后端分页） */
  mode: 'frontend' | 'backend'
  /** 分页配置 */
  pagination: Partial<PaginationConfig>
  /** 分页容器选择器或元素 */
  container?: string | HTMLElement
}

/**
 * 分页状态
 */
export interface PaginationState {
  /** 当前页码 */
  current: number
  /** 每页条数 */
  pageSize: number
  /** 总条数 */
  total: number
  /** 总页数 */
  totalPages: number
}

/**
 * 分页管理器接口
 */
export interface IPaginationManager<T extends TableRow = TableRow> {
  /** 是否启用分页 */
  isEnabled(): boolean
  /** 启用分页 */
  enable(): void
  /** 禁用分页 */
  disable(): void
  /** 设置数据 */
  setData(data: T[]): void
  /** 获取当前页数据 */
  getCurrentPageData(): T[]
  /** 获取分页状态 */
  getState(): PaginationState
  /** 设置页码 */
  setPage(page: number): void
  /** 设置每页条数 */
  setPageSize(pageSize: number): void
  /** 设置总条数（后端分页时使用） */
  setTotal(total: number): void
  /** 销毁 */
  destroy(): void
}

/**
 * 分页管理器实现类
 */
export class PaginationManager<T extends TableRow = TableRow> implements IPaginationManager<T> {
  /** 配置 */
  private config: PaginationManagerConfig

  /** 原始数据 */
  private originalData: T[] = []

  /** 当前页数据 */
  private currentPageData: T[] = []

  /** 分页状态 */
  private state: PaginationState

  /** 分页组件实例 */
  private pagination: Pagination | null = null

  /** 事件监听器 */
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()

  /**
   * 构造函数
   * @param config 分页管理器配置
   */
  constructor(config: PaginationManagerConfig) {
    this.config = {
      enabled: true,
      mode: 'frontend',
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
        pageSizeOptions: [10, 20, 50, 100]
      },
      ...config
    }

    this.state = {
      current: this.config.pagination.current || 1,
      pageSize: this.config.pagination.pageSize || 10,
      total: this.config.pagination.total || 0,
      totalPages: 0
    }

    this.updateTotalPages()

    if (this.config.enabled && this.config.container) {
      this.initializePagination()
    }
  }

  /**
   * 初始化分页组件
   * @private
   */
  private initializePagination(): void {
    if (!this.config.container) return

    const paginationConfig: PaginationConfig = {
      ...this.config.pagination,
      current: this.state.current,
      pageSize: this.state.pageSize,
      total: this.state.total,
      onChange: (page, pageSize) => {
        this.handlePageChange(page, pageSize)
      },
      onShowSizeChange: (current, size) => {
        this.handlePageSizeChange(current, size)
      }
    }

    this.pagination = new Pagination(this.config.container, paginationConfig)
  }

  /**
   * 处理页码变化
   * @private
   */
  private handlePageChange(page: number, pageSize: number): void {
    this.state.current = page
    this.state.pageSize = pageSize
    this.updateCurrentPageData()

    // 触发事件
    this.emit('page-change', {
      page,
      pageSize,
      state: this.getState()
    })
  }

  /**
   * 处理每页条数变化
   * @private
   */
  private handlePageSizeChange(current: number, pageSize: number): void {
    this.state.current = current
    this.state.pageSize = pageSize
    this.updateTotalPages()
    this.updateCurrentPageData()

    // 触发事件
    this.emit('page-size-change', {
      page: current,
      pageSize,
      state: this.getState()
    })
  }

  /**
   * 更新总页数
   * @private
   */
  private updateTotalPages(): void {
    this.state.totalPages = Math.ceil(this.state.total / this.state.pageSize)
  }

  /**
   * 更新当前页数据
   * @private
   */
  private updateCurrentPageData(): void {
    if (this.config.mode === 'frontend') {
      const start = (this.state.current - 1) * this.state.pageSize
      const end = start + this.state.pageSize
      this.currentPageData = this.originalData.slice(start, end)
    }
    // 后端分页模式下，当前页数据由外部设置
  }

  /**
   * 更新分页组件
   * @private
   */
  private updatePagination(): void {
    if (this.pagination) {
      this.pagination.updateConfig({
        current: this.state.current,
        pageSize: this.state.pageSize,
        total: this.state.total
      })
    }
  }

  /**
   * 发射事件
   * @private
   */
  private emit(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in pagination manager event listener for ${eventName}:`, error)
        }
      })
    }
  }

  // ==================== 公共方法 ====================

  /**
   * 是否启用分页
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * 启用分页
   */
  enable(): void {
    this.config.enabled = true
    if (this.config.container && !this.pagination) {
      this.initializePagination()
    }
  }

  /**
   * 禁用分页
   */
  disable(): void {
    this.config.enabled = false
    if (this.pagination) {
      this.pagination.destroy()
      this.pagination = null
    }
  }

  /**
   * 设置数据
   */
  setData(data: T[]): void {
    this.originalData = [...data]
    
    if (this.config.mode === 'frontend') {
      this.state.total = data.length
      this.updateTotalPages()
      this.updateCurrentPageData()
      this.updatePagination()
    }
  }

  /**
   * 获取当前页数据
   */
  getCurrentPageData(): T[] {
    return this.config.enabled ? this.currentPageData : this.originalData
  }

  /**
   * 获取分页状态
   */
  getState(): PaginationState {
    return { ...this.state }
  }

  /**
   * 设置页码
   */
  setPage(page: number): void {
    if (page < 1 || page > this.state.totalPages) return

    this.state.current = page
    this.updateCurrentPageData()
    this.updatePagination()

    this.emit('page-change', {
      page,
      pageSize: this.state.pageSize,
      state: this.getState()
    })
  }

  /**
   * 设置每页条数
   */
  setPageSize(pageSize: number): void {
    if (pageSize < 1) return

    // 计算新的页码，保持当前数据位置
    const currentStart = (this.state.current - 1) * this.state.pageSize
    const newPage = Math.floor(currentStart / pageSize) + 1

    this.state.pageSize = pageSize
    this.state.current = newPage
    this.updateTotalPages()
    this.updateCurrentPageData()
    this.updatePagination()

    this.emit('page-size-change', {
      page: newPage,
      pageSize,
      state: this.getState()
    })
  }

  /**
   * 设置总条数（后端分页时使用）
   */
  setTotal(total: number): void {
    this.state.total = total
    this.updateTotalPages()
    this.updatePagination()
  }

  /**
   * 设置当前页数据（后端分页时使用）
   */
  setCurrentPageData(data: T[]): void {
    this.currentPageData = [...data]
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) return

    if (listener) {
      const listeners = this.eventListeners.get(eventName)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(eventName)
    }
  }

  /**
   * 销毁分页管理器
   */
  destroy(): void {
    if (this.pagination) {
      this.pagination.destroy()
      this.pagination = null
    }
    this.eventListeners.clear()
    this.originalData = []
    this.currentPageData = []
  }
}

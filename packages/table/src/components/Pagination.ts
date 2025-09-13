/**
 * 分页组件
 * 
 * 提供完整的分页功能，支持前端分页和后端分页
 * 包括页码导航、每页条数设置、跳转功能等
 */

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  /** 当前页码（从1开始） */
  current: number
  /** 每页条数 */
  pageSize: number
  /** 总条数 */
  total: number
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
  /** 是否显示总数信息 */
  showTotal?: boolean
  /** 每页条数选项 */
  pageSizeOptions?: number[]
  /** 是否简洁模式 */
  simple?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 页码变化回调 */
  onChange?: (page: number, pageSize: number) => void
  /** 每页条数变化回调 */
  onShowSizeChange?: (current: number, size: number) => void
}

/**
 * 分页组件类
 */
export class Pagination {
  /** 配置 */
  private config: PaginationConfig

  /** 容器元素 */
  private container: HTMLElement

  /** 分页元素 */
  private paginationElement: HTMLElement | null = null

  /** 事件监听器 */
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param config 分页配置
   */
  constructor(container: string | HTMLElement, config: PaginationConfig) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) as HTMLElement
      : container

    if (!this.container) {
      throw new Error('分页容器不存在')
    }

    this.config = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      pageSizeOptions: [10, 20, 50, 100],
      simple: false,
      disabled: false,
      ...config
    }

    this.render()
  }

  /**
   * 渲染分页组件
   */
  render(): void {
    // 清空容器
    this.container.innerHTML = ''

    // 创建分页元素
    this.paginationElement = document.createElement('div')
    this.paginationElement.className = 'ldesign-pagination'

    if (this.config.disabled) {
      this.paginationElement.classList.add('ldesign-pagination-disabled')
    }

    if (this.config.simple) {
      this.renderSimplePagination()
    } else {
      this.renderFullPagination()
    }

    this.container.appendChild(this.paginationElement)
  }

  /**
   * 渲染完整分页
   * @private
   */
  private renderFullPagination(): void {
    const wrapper = document.createElement('div')
    wrapper.className = 'ldesign-pagination-wrapper'

    // 渲染总数信息
    if (this.config.showTotal) {
      const totalInfo = this.createTotalInfo()
      wrapper.appendChild(totalInfo)
    }

    // 渲染页码导航
    const pageNav = this.createPageNavigation()
    wrapper.appendChild(pageNav)

    // 渲染每页条数选择器
    if (this.config.showSizeChanger) {
      const sizeChanger = this.createSizeChanger()
      wrapper.appendChild(sizeChanger)
    }

    // 渲染快速跳转
    if (this.config.showQuickJumper) {
      const quickJumper = this.createQuickJumper()
      wrapper.appendChild(quickJumper)
    }

    this.paginationElement!.appendChild(wrapper)
  }

  /**
   * 渲染简洁分页
   * @private
   */
  private renderSimplePagination(): void {
    const wrapper = document.createElement('div')
    wrapper.className = 'ldesign-pagination-simple'

    // 上一页按钮
    const prevButton = this.createButton('prev', '上一页', this.config.current <= 1)
    wrapper.appendChild(prevButton)

    // 页码信息
    const pageInfo = document.createElement('span')
    pageInfo.className = 'ldesign-pagination-simple-info'
    pageInfo.textContent = `${this.config.current} / ${this.getTotalPages()}`
    wrapper.appendChild(pageInfo)

    // 下一页按钮
    const nextButton = this.createButton('next', '下一页', this.config.current >= this.getTotalPages())
    wrapper.appendChild(nextButton)

    this.paginationElement!.appendChild(wrapper)
  }

  /**
   * 创建总数信息
   * @private
   */
  private createTotalInfo(): HTMLElement {
    const totalInfo = document.createElement('div')
    totalInfo.className = 'ldesign-pagination-total'
    
    const start = (this.config.current - 1) * this.config.pageSize + 1
    const end = Math.min(this.config.current * this.config.pageSize, this.config.total)
    
    totalInfo.innerHTML = `共 <span class="ldesign-pagination-total-number">${this.config.total}</span> 条，显示 ${start}-${end} 条`
    
    return totalInfo
  }

  /**
   * 创建页码导航
   * @private
   */
  private createPageNavigation(): HTMLElement {
    const nav = document.createElement('div')
    nav.className = 'ldesign-pagination-nav'

    const totalPages = this.getTotalPages()
    const current = this.config.current

    // 上一页按钮
    const prevButton = this.createButton('prev', '‹', current <= 1)
    nav.appendChild(prevButton)

    // 页码按钮
    const pageButtons = this.createPageButtons()
    pageButtons.forEach(button => nav.appendChild(button))

    // 下一页按钮
    const nextButton = this.createButton('next', '›', current >= totalPages)
    nav.appendChild(nextButton)

    return nav
  }

  /**
   * 创建页码按钮
   * @private
   */
  private createPageButtons(): HTMLElement[] {
    const buttons: HTMLElement[] = []
    const totalPages = this.getTotalPages()
    const current = this.config.current

    if (totalPages <= 7) {
      // 总页数少于等于7页，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(this.createPageButton(i, i === current))
      }
    } else {
      // 总页数大于7页，显示省略号
      buttons.push(this.createPageButton(1, current === 1))

      if (current > 4) {
        buttons.push(this.createEllipsis())
      }

      const start = Math.max(2, current - 2)
      const end = Math.min(totalPages - 1, current + 2)

      for (let i = start; i <= end; i++) {
        buttons.push(this.createPageButton(i, i === current))
      }

      if (current < totalPages - 3) {
        buttons.push(this.createEllipsis())
      }

      buttons.push(this.createPageButton(totalPages, current === totalPages))
    }

    return buttons
  }

  /**
   * 创建页码按钮
   * @private
   */
  private createPageButton(page: number, active: boolean): HTMLElement {
    const button = document.createElement('button')
    button.className = 'ldesign-pagination-item'
    button.textContent = String(page)
    button.disabled = this.config.disabled

    if (active) {
      button.classList.add('ldesign-pagination-item-active')
    }

    button.addEventListener('click', () => {
      if (!this.config.disabled && !active) {
        this.changePage(page)
      }
    })

    return button
  }

  /**
   * 创建省略号
   * @private
   */
  private createEllipsis(): HTMLElement {
    const ellipsis = document.createElement('span')
    ellipsis.className = 'ldesign-pagination-ellipsis'
    ellipsis.textContent = '...'
    return ellipsis
  }

  /**
   * 创建按钮
   * @private
   */
  private createButton(type: 'prev' | 'next', text: string, disabled: boolean): HTMLElement {
    const button = document.createElement('button')
    button.className = `ldesign-pagination-${type}`
    button.textContent = text
    button.disabled = this.config.disabled || disabled

    button.addEventListener('click', () => {
      if (!button.disabled) {
        const newPage = type === 'prev' ? this.config.current - 1 : this.config.current + 1
        this.changePage(newPage)
      }
    })

    return button
  }

  /**
   * 创建每页条数选择器
   * @private
   */
  private createSizeChanger(): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'ldesign-pagination-size-changer'

    const label = document.createElement('span')
    label.textContent = '每页'
    wrapper.appendChild(label)

    const select = document.createElement('select')
    select.className = 'ldesign-pagination-size-select'
    select.disabled = this.config.disabled

    this.config.pageSizeOptions!.forEach(size => {
      const option = document.createElement('option')
      option.value = String(size)
      option.textContent = String(size)
      option.selected = size === this.config.pageSize
      select.appendChild(option)
    })

    select.addEventListener('change', () => {
      const newSize = parseInt(select.value)
      this.changePageSize(newSize)
    })

    wrapper.appendChild(select)

    const suffix = document.createElement('span')
    suffix.textContent = '条'
    wrapper.appendChild(suffix)

    return wrapper
  }

  /**
   * 创建快速跳转
   * @private
   */
  private createQuickJumper(): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'ldesign-pagination-quick-jumper'

    const label = document.createElement('span')
    label.textContent = '跳至'
    wrapper.appendChild(label)

    const input = document.createElement('input')
    input.type = 'number'
    input.className = 'ldesign-pagination-quick-input'
    input.min = '1'
    input.max = String(this.getTotalPages())
    input.disabled = this.config.disabled

    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const page = parseInt(input.value)
        if (page >= 1 && page <= this.getTotalPages()) {
          this.changePage(page)
          input.value = ''
        }
      }
    })

    wrapper.appendChild(input)

    const suffix = document.createElement('span')
    suffix.textContent = '页'
    wrapper.appendChild(suffix)

    return wrapper
  }

  /**
   * 获取总页数
   * @private
   */
  private getTotalPages(): number {
    return Math.ceil(this.config.total / this.config.pageSize)
  }

  /**
   * 切换页码
   * @private
   */
  private changePage(page: number): void {
    if (page < 1 || page > this.getTotalPages() || page === this.config.current) {
      return
    }

    this.config.current = page
    this.render()

    // 触发回调
    if (this.config.onChange) {
      this.config.onChange(page, this.config.pageSize)
    }

    // 触发事件
    this.emit('change', { page, pageSize: this.config.pageSize })
  }

  /**
   * 切换每页条数
   * @private
   */
  private changePageSize(pageSize: number): void {
    if (pageSize === this.config.pageSize) {
      return
    }

    // 计算新的页码，保持当前数据位置
    const currentStart = (this.config.current - 1) * this.config.pageSize
    const newPage = Math.floor(currentStart / pageSize) + 1

    this.config.pageSize = pageSize
    this.config.current = newPage
    this.render()

    // 触发回调
    if (this.config.onShowSizeChange) {
      this.config.onShowSizeChange(newPage, pageSize)
    }

    // 触发事件
    this.emit('sizeChange', { page: newPage, pageSize })
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
          console.error(`Error in pagination event listener for ${eventName}:`, error)
        }
      })
    }
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
   * 更新配置
   */
  updateConfig(config: Partial<PaginationConfig>): void {
    this.config = { ...this.config, ...config }
    this.render()
  }

  /**
   * 获取当前配置
   */
  getConfig(): PaginationConfig {
    return { ...this.config }
  }

  /**
   * 销毁分页组件
   */
  destroy(): void {
    if (this.paginationElement) {
      this.container.removeChild(this.paginationElement)
      this.paginationElement = null
    }
    this.eventListeners.clear()
  }
}

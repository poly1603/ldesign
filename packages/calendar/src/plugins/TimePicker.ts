/**
 * 时间选择器插件
 */

import type { CalendarPlugin, PluginContext, TimePickerOptions } from './types'
import { DOMUtils } from '../utils/dom'

/**
 * 时间选择器插件类
 */
export class TimePickerPlugin implements CalendarPlugin {
  public readonly name = 'TimePickerPlugin'
  public readonly version = '1.0.0'
  public readonly description = '时间选择器插件，提供时间选择功能'
  public readonly author = 'ldesign'

  public readonly defaultOptions: TimePickerOptions = {
    enabled: true,
    priority: 10,
    config: {
      format: '24h',
      interval: 15,
      minTime: '00:00',
      maxTime: '23:59',
      showSeconds: false,
      showNow: true
    }
  }

  private context?: PluginContext
  private container?: HTMLElement
  private isVisible = false

  /**
   * 安装插件
   */
  public install(context: PluginContext): void {
    this.context = context
    this.createTimePicker()
    this.bindEvents()
  }

  /**
   * 卸载插件
   */
  public uninstall(context: PluginContext): void {
    this.destroy(context)
  }

  /**
   * 初始化插件
   */
  public init(context: PluginContext): void {
    // 插件初始化逻辑
  }

  /**
   * 销毁插件
   */
  public destroy(context: PluginContext): void {
    if (this.container) {
      this.container.remove()
      this.container = undefined
    }
    this.context = undefined
  }

  /**
   * 显示时间选择器
   */
  public show(targetElement: HTMLElement, currentTime?: string): void {
    if (!this.container || !this.context) return

    // 设置当前时间
    if (currentTime) {
      this.setTime(currentTime)
    }

    // 定位时间选择器
    this.positionTimePicker(targetElement)

    // 显示时间选择器
    this.container.style.display = 'block'
    this.isVisible = true

    // 添加点击外部关闭功能
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick)
    }, 0)

    this.context.emit('timepicker:show')
  }

  /**
   * 隐藏时间选择器
   */
  public hide(): void {
    if (!this.container) return

    this.container.style.display = 'none'
    this.isVisible = false

    // 移除点击外部关闭功能
    document.removeEventListener('click', this.handleOutsideClick)

    this.context?.emit('timepicker:hide')
  }

  /**
   * 设置时间
   */
  public setTime(time: string): void {
    if (!this.container) return

    const [hours, minutes, seconds] = time.split(':')
    
    const hourSelect = this.container.querySelector('.timepicker-hour') as HTMLSelectElement
    const minuteSelect = this.container.querySelector('.timepicker-minute') as HTMLSelectElement
    const secondSelect = this.container.querySelector('.timepicker-second') as HTMLSelectElement

    if (hourSelect) hourSelect.value = hours || '00'
    if (minuteSelect) minuteSelect.value = minutes || '00'
    if (secondSelect && seconds) secondSelect.value = seconds
  }

  /**
   * 获取当前时间
   */
  public getTime(): string {
    if (!this.container) return '00:00'

    const hourSelect = this.container.querySelector('.timepicker-hour') as HTMLSelectElement
    const minuteSelect = this.container.querySelector('.timepicker-minute') as HTMLSelectElement
    const secondSelect = this.container.querySelector('.timepicker-second') as HTMLSelectElement

    const hours = hourSelect?.value || '00'
    const minutes = minuteSelect?.value || '00'
    const seconds = secondSelect?.value || '00'

    const config = this.context?.options
    if (config?.showSeconds) {
      return `${hours}:${minutes}:${seconds}`
    }
    return `${hours}:${minutes}`
  }

  /**
   * 创建时间选择器
   */
  private createTimePicker(): void {
    if (!this.context) return

    const config = this.context.options
    
    this.container = DOMUtils.createElement('div', {
      className: 'ldesign-timepicker',
      style: {
        position: 'absolute',
        zIndex: '9999',
        display: 'none',
        backgroundColor: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '12px',
        minWidth: '200px'
      }
    })

    // 创建时间选择器内容
    const content = this.createTimePickerContent()
    this.container.appendChild(content)

    // 添加到页面
    document.body.appendChild(this.container)
  }

  /**
   * 创建时间选择器内容
   */
  private createTimePickerContent(): HTMLElement {
    if (!this.context) throw new Error('Context not available')

    const config = this.context.options
    const container = DOMUtils.createElement('div', { className: 'timepicker-content' })

    // 标题
    const title = DOMUtils.createElement('div', {
      className: 'timepicker-title',
      textContent: '选择时间',
      style: {
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '8px',
        color: '#262626'
      }
    })
    container.appendChild(title)

    // 时间选择区域
    const timeContainer = DOMUtils.createElement('div', {
      className: 'timepicker-time',
      style: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '12px'
      }
    })

    // 小时选择
    const hourSelect = this.createTimeSelect('hour', 0, 23, '时')
    timeContainer.appendChild(hourSelect)

    // 分隔符
    const separator1 = DOMUtils.createElement('span', {
      textContent: ':',
      style: { fontSize: '16px', fontWeight: 'bold' }
    })
    timeContainer.appendChild(separator1)

    // 分钟选择
    const minuteSelect = this.createTimeSelect('minute', 0, 59, '分', config.interval)
    timeContainer.appendChild(minuteSelect)

    // 秒选择（可选）
    if (config.showSeconds) {
      const separator2 = DOMUtils.createElement('span', {
        textContent: ':',
        style: { fontSize: '16px', fontWeight: 'bold' }
      })
      timeContainer.appendChild(separator2)

      const secondSelect = this.createTimeSelect('second', 0, 59, '秒')
      timeContainer.appendChild(secondSelect)
    }

    container.appendChild(timeContainer)

    // 按钮区域
    const buttonContainer = DOMUtils.createElement('div', {
      className: 'timepicker-buttons',
      style: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }
    })

    // 现在按钮（可选）
    if (config.showNow) {
      const nowButton = DOMUtils.createElement('button', {
        className: 'timepicker-now-btn',
        textContent: '现在',
        style: {
          padding: '4px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: '2px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '12px'
        }
      })
      nowButton.addEventListener('click', () => this.setCurrentTime())
      buttonContainer.appendChild(nowButton)
    }

    // 确定按钮
    const confirmButton = DOMUtils.createElement('button', {
      className: 'timepicker-confirm-btn',
      textContent: '确定',
      style: {
        padding: '4px 12px',
        border: 'none',
        borderRadius: '2px',
        backgroundColor: '#722ED1',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px'
      }
    })
    confirmButton.addEventListener('click', () => this.confirmTime())
    buttonContainer.appendChild(confirmButton)

    // 取消按钮
    const cancelButton = DOMUtils.createElement('button', {
      className: 'timepicker-cancel-btn',
      textContent: '取消',
      style: {
        padding: '4px 12px',
        border: '1px solid #d9d9d9',
        borderRadius: '2px',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '12px'
      }
    })
    cancelButton.addEventListener('click', () => this.hide())
    buttonContainer.appendChild(cancelButton)

    container.appendChild(buttonContainer)

    return container
  }

  /**
   * 创建时间选择下拉框
   */
  private createTimeSelect(type: string, min: number, max: number, label: string, interval = 1): HTMLElement {
    const container = DOMUtils.createElement('div', {
      style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }
    })

    const labelElement = DOMUtils.createElement('label', {
      textContent: label,
      style: {
        fontSize: '12px',
        color: '#8c8c8c',
        marginBottom: '4px'
      }
    })
    container.appendChild(labelElement)

    const select = DOMUtils.createElement('select', {
      className: `timepicker-${type}`,
      style: {
        padding: '4px',
        border: '1px solid #d9d9d9',
        borderRadius: '2px',
        fontSize: '14px',
        width: '50px'
      }
    }) as HTMLSelectElement

    for (let i = min; i <= max; i += interval) {
      const option = DOMUtils.createElement('option', {
        value: i.toString().padStart(2, '0'),
        textContent: i.toString().padStart(2, '0')
      })
      select.appendChild(option)
    }

    container.appendChild(select)
    return container
  }

  /**
   * 设置当前时间
   */
  private setCurrentTime(): void {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')

    const config = this.context?.options
    if (config?.showSeconds) {
      this.setTime(`${hours}:${minutes}:${seconds}`)
    } else {
      this.setTime(`${hours}:${minutes}`)
    }
  }

  /**
   * 确认时间选择
   */
  private confirmTime(): void {
    const time = this.getTime()
    this.context?.emit('timepicker:select', time)
    this.hide()
  }

  /**
   * 定位时间选择器
   */
  private positionTimePicker(targetElement: HTMLElement): void {
    if (!this.container) return

    const rect = targetElement.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()

    let top = rect.bottom + window.scrollY + 4
    let left = rect.left + window.scrollX

    // 检查是否超出视窗
    if (left + containerRect.width > window.innerWidth) {
      left = window.innerWidth - containerRect.width - 10
    }

    if (top + containerRect.height > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - containerRect.height - 4
    }

    this.container.style.top = `${top}px`
    this.container.style.left = `${left}px`
  }

  /**
   * 处理点击外部关闭
   */
  private handleOutsideClick = (event: MouseEvent): void => {
    if (!this.container || !this.isVisible) return

    const target = event.target as HTMLElement
    if (!this.container.contains(target)) {
      this.hide()
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.context) return

    // 监听日历事件，在需要时显示时间选择器
    this.context.on('event:create', (event: any) => {
      // 可以在这里添加自动显示时间选择器的逻辑
    })
  }
}

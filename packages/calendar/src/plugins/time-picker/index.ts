/**
 * 时间选择器插件
 * 
 * 提供时间选择功能：
 * - 时间输入组件
 * - 时间格式化
 * - 时间验证
 * - 时间范围限制
 */

import type { CalendarPlugin, TimePickerPluginConfig } from '../../types/plugin'
import type { ICalendar } from '../../types/calendar'

/**
 * 时间选择器类
 */
class TimePicker {
  private config: TimePickerPluginConfig
  private container: HTMLElement | null = null
  private isVisible: boolean = false
  private currentTime: string = '12:00'
  private onTimeChange?: (time: string) => void

  constructor(config: TimePickerPluginConfig) {
    this.config = config
  }

  /**
   * 创建时间选择器UI
   */
  createUI(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'ldesign-time-picker'
    container.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 12px;
      z-index: 1000;
      display: none;
    `

    // 创建时间输入框
    const timeInput = document.createElement('input')
    timeInput.type = 'time'
    timeInput.value = this.currentTime
    timeInput.step = this.config.step ? this.config.step * 60 : 900 // 转换为秒
    timeInput.min = this.config.minTime || '00:00'
    timeInput.max = this.config.maxTime || '23:59'
    timeInput.className = 'ldesign-time-picker-input'
    timeInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
    `

    // 绑定事件
    timeInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      this.setTime(target.value)
    })

    container.appendChild(timeInput)

    // 如果显示秒数，添加秒数选择
    if (this.config.showSeconds) {
      const secondsInput = document.createElement('input')
      secondsInput.type = 'number'
      secondsInput.min = '0'
      secondsInput.max = '59'
      secondsInput.value = '0'
      secondsInput.placeholder = '秒'
      secondsInput.className = 'ldesign-time-picker-seconds'
      secondsInput.style.cssText = `
        width: 60px;
        padding: 4px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 12px;
        margin-top: 8px;
      `
      container.appendChild(secondsInput)
    }

    // 创建快捷时间按钮
    const quickTimes = ['09:00', '12:00', '14:00', '18:00']
    const quickTimeContainer = document.createElement('div')
    quickTimeContainer.className = 'ldesign-time-picker-quick'
    quickTimeContainer.style.cssText = `
      margin-top: 8px;
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    `

    quickTimes.forEach(time => {
      const button = document.createElement('button')
      button.textContent = time
      button.className = 'ldesign-time-picker-quick-btn'
      button.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 12px;
      `
      button.addEventListener('click', () => {
        this.setTime(time)
        timeInput.value = time
      })
      quickTimeContainer.appendChild(button)
    })

    container.appendChild(quickTimeContainer)

    this.container = container
    return container
  }

  /**
   * 显示时间选择器
   */
  show(x: number = 0, y: number = 0): void {
    if (!this.container) {
      this.createUI()
    }

    if (this.container) {
      this.container.style.display = 'block'
      this.container.style.left = `${x}px`
      this.container.style.top = `${y}px`
      this.isVisible = true

      // 聚焦到输入框
      const input = this.container.querySelector('.ldesign-time-picker-input') as HTMLInputElement
      if (input) {
        input.focus()
      }
    }
  }

  /**
   * 隐藏时间选择器
   */
  hide(): void {
    if (this.container) {
      this.container.style.display = 'none'
      this.isVisible = false
    }
  }

  /**
   * 设置时间
   */
  setTime(time: string): void {
    if (this.isValidTime(time)) {
      this.currentTime = time
      if (this.onTimeChange) {
        this.onTimeChange(time)
      }
    }
  }

  /**
   * 获取时间
   */
  getTime(): string {
    return this.currentTime
  }

  /**
   * 设置时间变化回调
   */
  onTimeChangeCallback(callback: (time: string) => void): void {
    this.onTimeChange = callback
  }

  /**
   * 验证时间格式
   */
  private isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  /**
   * 销毁时间选择器
   */
  destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = null
    this.onTimeChange = undefined
  }
}

/**
 * 时间选择器插件
 */
export const TimePickerPlugin: CalendarPlugin = {
  metadata: {
    name: 'time-picker',
    version: '1.0.0',
    description: '时间选择器插件',
    author: 'ldesign',
  },

  options: {
    enabled: true,
    priority: 100,
    config: {
      format: 'HH:mm',
      step: 15,
      minTime: '00:00',
      maxTime: '23:59',
      showSeconds: false,
    } as TimePickerPluginConfig,
  },

  install(calendar: ICalendar, options?: any): void {
    console.log('时间选择器插件已安装')

    const config = { ...this.options?.config, ...options?.config } as TimePickerPluginConfig

    // 创建时间选择器实例
    const timePicker = new TimePicker(config)

      // 将时间选择器实例存储到日历中
      ; (calendar as any)._timePicker = timePicker

    // 绑定事件处理器
    this.bindEventHandlers(calendar, timePicker)

    // 创建时间选择器UI
    this.createTimePickerUI(calendar, timePicker)
  },

  uninstall(calendar: ICalendar): void {
    console.log('时间选择器插件已卸载')

    const timePicker = (calendar as any)._timePicker
    if (timePicker) {
      // 清理事件监听器
      this.unbindEventHandlers(calendar, timePicker)

      // 移除UI元素
      this.removeTimePickerUI(calendar)

      // 销毁时间选择器实例
      timePicker.destroy()

      // 从日历中移除引用
      delete (calendar as any)._timePicker
    }
  },

  hooks: {
    beforeInit: async (_calendar: ICalendar) => {
      console.log('时间选择器插件：beforeInit')
    },

    afterInit: async (_calendar: ICalendar) => {
      console.log('时间选择器插件：afterInit')
    },

    beforeDestroy: async (_calendar: ICalendar) => {
      console.log('时间选择器插件：beforeDestroy')
    },

    afterDestroy: async (_calendar: ICalendar) => {
      console.log('时间选择器插件：afterDestroy')
    },
  },

  /**
   * 绑定事件处理器
   */
  bindEventHandlers(calendar: ICalendar, timePicker: TimePicker): void {
    // 监听日历事件，在需要时显示时间选择器
    const container = (calendar as any).container
    if (container) {
      container.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement
        if (target.classList.contains('time-picker-trigger')) {
          const rect = target.getBoundingClientRect()
          timePicker.show(rect.left, rect.bottom + 5)
        }
      })

      // 点击其他地方隐藏时间选择器
      document.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement
        if (!target.closest('.ldesign-time-picker') && !target.classList.contains('time-picker-trigger')) {
          timePicker.hide()
        }
      })
    }
  },

  /**
   * 解绑事件处理器
   */
  unbindEventHandlers(_calendar: ICalendar, _timePicker: TimePicker): void {
    // 清理事件监听器
    // 这里应该移除之前添加的事件监听器
    // 为了简化，这里只是占位
  },

  /**
   * 创建时间选择器UI
   */
  createTimePickerUI(calendar: ICalendar, timePicker: TimePicker): void {
    const container = (calendar as any).container
    if (container) {
      const timePickerElement = timePicker.createUI()
      container.appendChild(timePickerElement)
    }
  },

  /**
   * 移除时间选择器UI
   */
  removeTimePickerUI(calendar: ICalendar): void {
    const container = (calendar as any).container
    if (container) {
      const timePickerElement = container.querySelector('.ldesign-time-picker')
      if (timePickerElement) {
        timePickerElement.remove()
      }
    }
  },

  api: {
    /**
     * 显示时间选择器
     * @param options 选项
     */
    show(options?: { x?: number; y?: number; time?: string }): void {
      const calendar = this.calendar as any
      const timePicker = calendar._timePicker as TimePicker
      if (timePicker) {
        if (options?.time) {
          timePicker.setTime(options.time)
        }
        timePicker.show(options?.x || 0, options?.y || 0)
      }
    },

    /**
     * 隐藏时间选择器
     */
    hide(): void {
      const calendar = this.calendar as any
      const timePicker = calendar._timePicker as TimePicker
      if (timePicker) {
        timePicker.hide()
      }
    },

    /**
     * 设置时间
     * @param time 时间
     */
    setTime(time: string): void {
      const calendar = this.calendar as any
      const timePicker = calendar._timePicker as TimePicker
      if (timePicker) {
        timePicker.setTime(time)
      }
    },

    /**
     * 获取时间
     */
    getTime(): string {
      const calendar = this.calendar as any
      const timePicker = calendar._timePicker as TimePicker
      if (timePicker) {
        return timePicker.getTime()
      }
      return '12:00'
    },

    /**
     * 设置时间变化回调
     * @param callback 回调函数
     */
    onTimeChange(callback: (time: string) => void): void {
      const calendar = this.calendar as any
      const timePicker = calendar._timePicker as TimePicker
      if (timePicker) {
        timePicker.onTimeChangeCallback(callback)
      }
    },
  },
}

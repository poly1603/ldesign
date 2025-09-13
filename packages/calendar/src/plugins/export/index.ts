/**
 * 导出插件
 * 
 * 提供数据导出功能：
 * - 导出为ICS格式
 * - 导出为CSV格式
 * - 导出为JSON格式
 * - 导出为PDF格式
 * - 导出为图片格式
 */

import type { CalendarPlugin, ExportPluginConfig } from '../../types/plugin'
import type { ICalendar } from '../../types/calendar'
import type { CalendarEvent } from '../../types/event'

/**
 * 导出管理器
 */
class ExportManager {
  private config: ExportPluginConfig
  private calendar: ICalendar

  constructor(calendar: ICalendar, config: ExportPluginConfig) {
    this.calendar = calendar
    this.config = config
  }

  /**
   * 导出为ICS格式
   */
  async exportToICS(events: CalendarEvent[]): Promise<Blob> {
    const icsContent = this.generateICSContent(events)
    return new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  }

  /**
   * 导出为CSV格式
   */
  async exportToCSV(events: CalendarEvent[]): Promise<Blob> {
    const csvContent = this.generateCSVContent(events)
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  }

  /**
   * 导出为JSON格式
   */
  async exportToJSON(events: CalendarEvent[]): Promise<Blob> {
    const jsonContent = JSON.stringify(events, null, 2)
    return new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
  }

  /**
   * 导出为PDF格式
   */
  async exportToPDF(events: CalendarEvent[]): Promise<Blob> {
    // 这里需要使用PDF生成库，如jsPDF
    // 为了简化，这里返回一个占位的PDF内容
    const pdfContent = this.generatePDFContent(events)
    return new Blob([pdfContent], { type: 'application/pdf' })
  }

  /**
   * 生成ICS内容
   */
  private generateICSContent(events: CalendarEvent[]): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ldesign//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    events.forEach(event => {
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${event.id}`)
      lines.push(`DTSTART:${this.formatDateForICS(new Date(event.start), event.allDay)}`)
      lines.push(`DTEND:${this.formatDateForICS(new Date(event.end), event.allDay)}`)
      lines.push(`SUMMARY:${this.escapeICSText(event.title)}`)

      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeICSText(event.description)}`)
      }

      if (event.location) {
        lines.push(`LOCATION:${this.escapeICSText(event.location)}`)
      }

      lines.push(`CREATED:${this.formatDateForICS(new Date())}`)
      lines.push(`LAST-MODIFIED:${this.formatDateForICS(new Date())}`)
      lines.push('END:VEVENT')
    })

    lines.push('END:VCALENDAR')
    return lines.join('\r\n')
  }

  /**
   * 生成CSV内容
   */
  private generateCSVContent(events: CalendarEvent[]): string {
    const headers = ['标题', '开始时间', '结束时间', '全天', '描述', '位置']
    const rows = [headers.join(',')]

    events.forEach(event => {
      const row = [
        this.escapeCSVField(event.title),
        this.escapeCSVField(new Date(event.start).toLocaleString('zh-CN')),
        this.escapeCSVField(new Date(event.end).toLocaleString('zh-CN')),
        event.allDay ? '是' : '否',
        this.escapeCSVField(event.description || ''),
        this.escapeCSVField(event.location || ''),
      ]
      rows.push(row.join(','))
    })

    return rows.join('\n')
  }

  /**
   * 生成PDF内容（占位实现）
   */
  private generatePDFContent(events: CalendarEvent[]): string {
    // 这里应该使用真正的PDF生成库
    // 为了演示，返回一个简单的文本内容
    let content = '日历事件导出\n\n'

    events.forEach((event, index) => {
      content += `${index + 1}. ${event.title}\n`
      content += `   时间: ${new Date(event.start).toLocaleString('zh-CN')} - ${new Date(event.end).toLocaleString('zh-CN')}\n`
      if (event.description) {
        content += `   描述: ${event.description}\n`
      }
      if (event.location) {
        content += `   位置: ${event.location}\n`
      }
      content += '\n'
    })

    return content
  }

  /**
   * 格式化日期为ICS格式
   */
  private formatDateForICS(date: Date, allDay: boolean = false): string {
    if (allDay) {
      return date.toISOString().split('T')[0].replace(/-/g, '')
    } else {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
  }

  /**
   * 转义ICS文本
   */
  private escapeICSText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  /**
   * 转义CSV字段
   */
  private escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }

  /**
   * 下载文件
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 生成文件名
   */
  generateFilename(format: string, customName?: string): string {
    if (customName) {
      return customName.endsWith(`.${format}`) ? customName : `${customName}.${format}`
    }

    const template = this.config.filenameTemplate || 'calendar-{date}'
    const date = new Date().toISOString().split('T')[0]
    return template.replace('{date}', date) + `.${format}`
  }
}

/**
 * 导出插件
 */
export const ExportPlugin: CalendarPlugin = {
  metadata: {
    name: 'export',
    version: '1.0.0',
    description: '导出插件',
    author: 'ldesign',
  },

  options: {
    enabled: true,
    priority: 80,
    config: {
      formats: ['ics', 'csv', 'json', 'pdf'],
      defaultFormat: 'ics',
      filenameTemplate: 'calendar-{date}',
      pdfConfig: {
        pageSize: 'A4',
        orientation: 'portrait',
        margin: 20,
      },
    } as ExportPluginConfig,
  },

  install(calendar: ICalendar, options?: any): void {
    console.log('导出插件已安装')

    const config = { ...this.options?.config, ...options?.config } as ExportPluginConfig

    // 创建导出管理器实例
    const exportManager = new ExportManager(calendar, config)

      // 将导出管理器存储到日历中
      ; (calendar as any)._exportManager = exportManager

    // 创建导出UI
    this.createExportUI(calendar, exportManager)
  },

  uninstall(calendar: ICalendar): void {
    console.log('导出插件已卸载')

    const exportManager = (calendar as any)._exportManager
    if (exportManager) {
      // 移除导出UI
      this.removeExportUI(calendar)

      // 从日历中移除引用
      delete (calendar as any)._exportManager
    }
  },

  /**
   * 创建导出UI
   */
  createExportUI(calendar: ICalendar, exportManager: ExportManager): void {
    const container = (calendar as any).container
    if (!container) return

    // 创建导出按钮
    const exportBtn = document.createElement('button')
    exportBtn.className = 'ldesign-export-btn'
    exportBtn.textContent = '导出'
    exportBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      z-index: 100;
    `

    // 创建导出菜单
    const exportMenu = document.createElement('div')
    exportMenu.className = 'ldesign-export-menu'
    exportMenu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 8px 0;
      min-width: 120px;
      display: none;
      z-index: 1000;
    `

    // 添加导出选项
    const formats = exportManager['config'].formats || ['ics', 'csv', 'json']
    formats.forEach(format => {
      const option = document.createElement('div')
      option.className = 'ldesign-export-option'
      option.textContent = format.toUpperCase()
      option.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
      `
      option.addEventListener('mouseenter', () => {
        option.style.backgroundColor = '#f5f5f5'
      })
      option.addEventListener('mouseleave', () => {
        option.style.backgroundColor = 'transparent'
      })
      option.addEventListener('click', () => {
        this.handleExport(calendar, format)
        exportMenu.style.display = 'none'
      })
      exportMenu.appendChild(option)
    })

    // 绑定事件
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      exportMenu.style.display = exportMenu.style.display === 'none' ? 'block' : 'none'
    })

    // 点击其他地方关闭菜单
    document.addEventListener('click', () => {
      exportMenu.style.display = 'none'
    })

    // 创建容器
    const exportContainer = document.createElement('div')
    exportContainer.className = 'ldesign-export-container'
    exportContainer.style.position = 'relative'
    exportContainer.appendChild(exportBtn)
    exportContainer.appendChild(exportMenu)

    container.appendChild(exportContainer)
  },

  /**
   * 移除导出UI
   */
  removeExportUI(calendar: ICalendar): void {
    const container = (calendar as any).container
    if (container) {
      const exportContainer = container.querySelector('.ldesign-export-container')
      if (exportContainer) {
        exportContainer.remove()
      }
    }
  },

  /**
   * 处理导出
   */
  async handleExport(calendar: ICalendar, format: string): Promise<void> {
    try {
      // 获取当前视图的事件
      const events = this.getCurrentEvents(calendar)

      // 执行导出
      const blob = await this.api.export(format, { events })

      // 下载文件
      const exportManager = (calendar as any)._exportManager as ExportManager
      const filename = exportManager.generateFilename(format)
      exportManager.downloadBlob(blob, filename)

      console.log(`导出 ${format.toUpperCase()} 格式成功`)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请稍后重试')
    }
  },

  /**
   * 获取当前事件
   */
  getCurrentEvents(calendar: ICalendar): CalendarEvent[] {
    // 这里需要从日历实例中获取当前视图的事件
    // 假设日历有 getEvents 方法
    return (calendar as any).getEvents?.() || []
  },

  api: {
    /**
     * 导出日历数据
     * @param format 导出格式
     * @param options 导出选项
     */
    async export(format: string, options?: { events?: CalendarEvent[] }): Promise<Blob> {
      const calendar = this.calendar as any
      const exportManager = calendar._exportManager as ExportManager
      if (!exportManager) {
        throw new Error('导出管理器未初始化')
      }

      const events = options?.events || this.getCurrentEvents(calendar)

      switch (format.toLowerCase()) {
        case 'ics':
          return await exportManager.exportToICS(events)
        case 'csv':
          return await exportManager.exportToCSV(events)
        case 'json':
          return await exportManager.exportToJSON(events)
        case 'pdf':
          return await exportManager.exportToPDF(events)
        default:
          throw new Error(`不支持的导出格式: ${format}`)
      }
    },

    /**
     * 下载导出文件
     * @param format 导出格式
     * @param filename 文件名
     * @param options 导出选项
     */
    async download(format: string, filename?: string, options?: { events?: CalendarEvent[] }): Promise<void> {
      const calendar = this.calendar as any
      const exportManager = calendar._exportManager as ExportManager
      if (!exportManager) {
        throw new Error('导出管理器未初始化')
      }

      const blob = await this.export(format, options)
      const finalFilename = filename || exportManager.generateFilename(format)
      exportManager.downloadBlob(blob, finalFilename)
    },

    /**
     * 获取支持的导出格式
     */
    getSupportedFormats(): string[] {
      const calendar = this.calendar as any
      const exportManager = calendar._exportManager as ExportManager
      if (exportManager) {
        return exportManager['config'].formats || ['ics', 'csv', 'json', 'pdf']
      }
      return ['ics', 'csv', 'json', 'pdf']
    },

    /**
     * 导出当前视图
     * @param format 导出格式
     * @param filename 文件名
     */
    async exportCurrentView(format: string, filename?: string): Promise<void> {
      const calendar = this.calendar as any
      const events = this.getCurrentEvents(calendar)
      await this.download(format, filename, { events })
    },

    /**
     * 导出指定日期范围的事件
     * @param format 导出格式
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param filename 文件名
     */
    async exportDateRange(format: string, startDate: Date, endDate: Date, filename?: string): Promise<void> {
      const calendar = this.calendar as any
      const allEvents = (calendar as any).getEvents?.() || []

      // 过滤指定日期范围的事件
      const events = allEvents.filter((event: CalendarEvent) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return (eventStart >= startDate && eventStart <= endDate) ||
          (eventEnd >= startDate && eventEnd <= endDate) ||
          (eventStart <= startDate && eventEnd >= endDate)
      })

      await this.download(format, filename, { events })
    },
  },
}

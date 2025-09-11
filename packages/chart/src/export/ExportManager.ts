/**
 * 图表导出管理器
 * 提供图表导出为图片、PDF、数据文件等功能
 */

import type { EChartsType } from 'echarts'
import type { ChartData, DataPoint, DataSeries } from '../core/types'

/**
 * 导出格式类型
 */
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'csv' | 'excel' | 'json'

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format: ExportFormat
  /** 文件名（不包含扩展名） */
  filename?: string
  /** 图片质量（0-1，仅对 PNG 有效） */
  quality?: number
  /** 图片背景色 */
  backgroundColor?: string
  /** 像素比例 */
  pixelRatio?: number
  /** 导出尺寸 */
  width?: number
  height?: number
  /** 是否包含标题 */
  includeTitle?: boolean
  /** 是否包含图例 */
  includeLegend?: boolean
}

/**
 * 图表导出管理器
 */
export class ExportManager {
  private echarts: EChartsType | null = null
  private chartData: ChartData | null = null
  private chartTitle: string = ''

  /**
   * 设置 ECharts 实例
   */
  setECharts(echarts: EChartsType): void {
    this.echarts = echarts
  }

  /**
   * 设置图表数据
   */
  setChartData(data: ChartData, title?: string): void {
    this.chartData = data
    this.chartTitle = title || ''
  }

  /**
   * 导出图表
   */
  async export(options: ExportOptions): Promise<string | Blob> {
    const { format } = options
    
    switch (format) {
      case 'png':
      case 'svg':
        return this.exportImage(options)
      case 'pdf':
        return this.exportPDF(options)
      case 'csv':
        return this.exportCSV(options)
      case 'excel':
        return this.exportExcel(options)
      case 'json':
        return this.exportJSON(options)
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }
  }

  /**
   * 导出为图片
   */
  private exportImage(options: ExportOptions): string {
    if (!this.echarts) {
      throw new Error('ECharts 实例未设置')
    }

    const {
      format = 'png',
      quality = 1,
      backgroundColor = 'white',
      pixelRatio = 2,
      width,
      height
    } = options

    const dataURL = this.echarts.getDataURL({
      type: format,
      quality,
      backgroundColor,
      pixelRatio,
      width,
      height
    })

    return dataURL
  }

  /**
   * 导出为 PDF
   */
  private async exportPDF(options: ExportOptions): Promise<Blob> {
    // 首先导出为图片
    const imageDataURL = this.exportImage({
      ...options,
      format: 'png'
    })

    // 使用 jsPDF 创建 PDF（需要动态导入）
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF()
      
      const img = new Image()
      img.src = imageDataURL
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const imgWidth = 210 // A4 宽度 mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          pdf.addImage(imageDataURL, 'PNG', 0, 0, imgWidth, imgHeight)
          
          const pdfBlob = pdf.output('blob')
          resolve(pdfBlob)
        }
        
        img.onerror = reject
      })
    } catch (error) {
      throw new Error('PDF 导出需要 jsPDF 库支持')
    }
  }

  /**
   * 导出为 CSV
   */
  private exportCSV(options: ExportOptions): string {
    if (!this.chartData) {
      throw new Error('图表数据未设置')
    }

    let csvContent = ''
    
    if (Array.isArray(this.chartData)) {
      // 简单数据格式
      csvContent = 'Name,Value\n'
      this.chartData.forEach((item: DataPoint) => {
        const value = Array.isArray(item.value) ? item.value.join('|') : item.value
        csvContent += `"${item.name}","${value}"\n`
      })
    } else {
      // 复杂数据格式
      const { categories, series } = this.chartData
      
      if (categories && categories.length > 0) {
        // 有分类的数据
        csvContent = 'Category,' + series.map(s => `"${s.name}"`).join(',') + '\n'
        
        categories.forEach((category, index) => {
          const row = [category]
          series.forEach(s => {
            const value = s.data[index] || ''
            row.push(String(value))
          })
          csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
        })
      } else {
        // 无分类的数据
        csvContent = 'Series,Index,Value\n'
        series.forEach(s => {
          s.data.forEach((value, index) => {
            csvContent += `"${s.name}","${index}","${value}"\n`
          })
        })
      }
    }

    return csvContent
  }

  /**
   * 导出为 Excel
   */
  private async exportExcel(options: ExportOptions): Promise<Blob> {
    try {
      const XLSX = await import('xlsx')
      
      if (!this.chartData) {
        throw new Error('图表数据未设置')
      }

      let worksheetData: any[][] = []
      
      if (Array.isArray(this.chartData)) {
        // 简单数据格式
        worksheetData = [['Name', 'Value']]
        this.chartData.forEach((item: DataPoint) => {
          const value = Array.isArray(item.value) ? item.value.join('|') : item.value
          worksheetData.push([item.name, value])
        })
      } else {
        // 复杂数据格式
        const { categories, series } = this.chartData
        
        if (categories && categories.length > 0) {
          // 有分类的数据
          worksheetData = [['Category', ...series.map(s => s.name)]]
          
          categories.forEach((category, index) => {
            const row = [category]
            series.forEach(s => {
              row.push(s.data[index] || '')
            })
            worksheetData.push(row)
          })
        } else {
          // 无分类的数据
          worksheetData = [['Series', 'Index', 'Value']]
          series.forEach(s => {
            s.data.forEach((value, index) => {
              worksheetData.push([s.name, index, value])
            })
          })
        }
      }

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart Data')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    } catch (error) {
      throw new Error('Excel 导出需要 xlsx 库支持')
    }
  }

  /**
   * 导出为 JSON
   */
  private exportJSON(options: ExportOptions): string {
    if (!this.chartData) {
      throw new Error('图表数据未设置')
    }

    const exportData = {
      title: this.chartTitle,
      data: this.chartData,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 下载文件
   */
  static downloadFile(content: string | Blob, filename: string, format: ExportFormat): void {
    const link = document.createElement('a')
    
    if (typeof content === 'string') {
      if (format === 'png' || format === 'svg') {
        // 图片数据 URL
        link.href = content
      } else {
        // 文本内容
        const mimeTypes = {
          csv: 'text/csv',
          json: 'application/json',
          png: 'image/png',
          svg: 'image/svg+xml',
          pdf: 'application/pdf',
          excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        
        const blob = new Blob([content], { type: mimeTypes[format] })
        link.href = URL.createObjectURL(blob)
      }
    } else {
      // Blob 内容
      link.href = URL.createObjectURL(content)
    }
    
    const extensions = {
      png: 'png',
      svg: 'svg',
      pdf: 'pdf',
      csv: 'csv',
      excel: 'xlsx',
      json: 'json'
    }
    
    link.download = `${filename}.${extensions[format]}`
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理 URL 对象
    if (typeof content !== 'string' || (!content.startsWith('data:') && !content.startsWith('blob:'))) {
      URL.revokeObjectURL(link.href)
    }
  }
}

/**
 * 创建导出管理器实例
 */
export function createExportManager(): ExportManager {
  return new ExportManager()
}

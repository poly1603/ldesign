/**
 * 导出插件
 * 
 * 为流程图编辑器添加多种格式的导出功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'

/**
 * 导出格式
 */
export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'json' | 'xml'

/**
 * 导出配置
 */
export interface ExportConfig {
  /** 默认文件名 */
  defaultFileName?: string
  /** 图片质量 (0-1) */
  quality?: number
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否包含背景 */
  includeBackground?: boolean
  /** 导出尺寸 */
  size?: {
    width?: number
    height?: number
  }
  /** 边距 */
  padding?: number
}

/**
 * 导出插件类
 */
export class ExportPlugin extends BasePlugin {
  readonly name = 'export'
  readonly version = '1.0.0'
  readonly description = '导出插件，支持多种格式导出'

  private config: ExportConfig

  /**
   * 构造函数
   * @param config 插件配置
   */
  constructor(config: ExportConfig = {}) {
    super()
    this.config = {
      defaultFileName: 'flowchart',
      quality: 1.0,
      backgroundColor: '#ffffff',
      includeBackground: true,
      padding: 20,
      ...config
    }
  }

  /**
   * 安装插件
   */
  protected onInstall(): void {
    this.addExportMethods()
    console.log('导出插件已安装，支持格式: PNG, JPG, SVG, JSON, XML')
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    console.log('导出插件已卸载')
  }

  /**
   * 添加导出方法到编辑器
   */
  private addExportMethods(): void {
    const editor = this.getEditor()
    
    // 将导出方法添加到编辑器实例
    ;(editor as any).exportAs = this.exportAs.bind(this)
    ;(editor as any).exportToPNG = this.exportToPNG.bind(this)
    ;(editor as any).exportToJPG = this.exportToJPG.bind(this)
    ;(editor as any).exportToSVG = this.exportToSVG.bind(this)
    ;(editor as any).exportToJSON = this.exportToJSON.bind(this)
    ;(editor as any).exportToXML = this.exportToXML.bind(this)
  }

  /**
   * 通用导出方法
   */
  public async exportAs(format: ExportFormat, fileName?: string, config?: Partial<ExportConfig>): Promise<void> {
    const exportConfig = { ...this.config, ...config }
    const finalFileName = fileName || `${exportConfig.defaultFileName}.${format}`

    try {
      switch (format) {
        case 'png':
          await this.exportToPNG(finalFileName, exportConfig)
          break
        case 'jpg':
          await this.exportToJPG(finalFileName, exportConfig)
          break
        case 'svg':
          await this.exportToSVG(finalFileName, exportConfig)
          break
        case 'json':
          await this.exportToJSON(finalFileName)
          break
        case 'xml':
          await this.exportToXML(finalFileName)
          break
        case 'pdf':
          await this.exportToPDF(finalFileName, exportConfig)
          break
        default:
          throw new Error(`不支持的导出格式: ${format}`)
      }
      
      this.showNotification(`导出成功: ${finalFileName}`, 'success')
    } catch (error) {
      console.error('导出失败:', error)
      this.showNotification(`导出失败: ${error}`, 'error')
      throw error
    }
  }

  /**
   * 导出为 PNG
   */
  public async exportToPNG(fileName?: string, config?: Partial<ExportConfig>): Promise<void> {
    const exportConfig = { ...this.config, ...config }
    const canvas = await this.createCanvas(exportConfig)
    
    canvas.toBlob((blob) => {
      if (blob) {
        this.downloadBlob(blob, fileName || `${exportConfig.defaultFileName}.png`)
      }
    }, 'image/png')
  }

  /**
   * 导出为 JPG
   */
  public async exportToJPG(fileName?: string, config?: Partial<ExportConfig>): Promise<void> {
    const exportConfig = { ...this.config, ...config }
    const canvas = await this.createCanvas(exportConfig)
    
    canvas.toBlob((blob) => {
      if (blob) {
        this.downloadBlob(blob, fileName || `${exportConfig.defaultFileName}.jpg`)
      }
    }, 'image/jpeg', exportConfig.quality)
  }

  /**
   * 导出为 SVG
   */
  public async exportToSVG(fileName?: string, config?: Partial<ExportConfig>): Promise<void> {
    const exportConfig = { ...this.config, ...config }
    const lf = this.getLogicFlow()
    
    // 获取 SVG 内容
    const svgElement = lf.container.querySelector('svg')
    if (!svgElement) {
      throw new Error('无法找到 SVG 元素')
    }

    // 克隆 SVG 并设置样式
    const clonedSvg = svgElement.cloneNode(true) as SVGElement
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    
    if (exportConfig.includeBackground) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', '100%')
      rect.setAttribute('height', '100%')
      rect.setAttribute('fill', exportConfig.backgroundColor!)
      clonedSvg.insertBefore(rect, clonedSvg.firstChild)
    }

    const svgString = new XMLSerializer().serializeToString(clonedSvg)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    
    this.downloadBlob(blob, fileName || `${exportConfig.defaultFileName}.svg`)
  }

  /**
   * 导出为 JSON
   */
  public async exportToJSON(fileName?: string): Promise<void> {
    const lf = this.getLogicFlow()
    const data = lf.getGraphData()
    
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    this.downloadBlob(blob, fileName || `${this.config.defaultFileName}.json`)
  }

  /**
   * 导出为 XML
   */
  public async exportToXML(fileName?: string): Promise<void> {
    const lf = this.getLogicFlow()
    const data = lf.getGraphData()
    
    const xml = this.convertToXML(data)
    const blob = new Blob([xml], { type: 'application/xml' })
    
    this.downloadBlob(blob, fileName || `${this.config.defaultFileName}.xml`)
  }

  /**
   * 导出为 PDF (简化实现)
   */
  public async exportToPDF(fileName?: string, config?: Partial<ExportConfig>): Promise<void> {
    // 这里需要集成 PDF 库，如 jsPDF
    // 简化实现：先导出为 PNG，然后提示用户
    this.showNotification('PDF 导出功能需要额外的库支持', 'warning')
    
    // 作为替代，导出 PNG
    await this.exportToPNG(fileName?.replace('.pdf', '.png'), config)
  }

  /**
   * 创建画布
   */
  private async createCanvas(config: ExportConfig): Promise<HTMLCanvasElement> {
    const lf = this.getLogicFlow()
    const container = lf.container
    
    // 获取容器尺寸
    const rect = container.getBoundingClientRect()
    const width = config.size?.width || rect.width
    const height = config.size?.height || rect.height

    // 创建画布
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = width + (config.padding! * 2)
    canvas.height = height + (config.padding! * 2)

    // 绘制背景
    if (config.includeBackground) {
      ctx.fillStyle = config.backgroundColor!
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // 使用 html2canvas 或类似库来渲染 DOM 到画布
    // 这里是简化实现
    ctx.save()
    ctx.translate(config.padding!, config.padding!)
    
    // 绘制流程图内容
    await this.drawFlowchartToCanvas(ctx, width, height)
    
    ctx.restore()
    
    return canvas
  }

  /**
   * 将流程图绘制到画布
   */
  private async drawFlowchartToCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): Promise<void> {
    const lf = this.getLogicFlow()
    const data = lf.getGraphData()

    // 简化实现：绘制基本的节点和边
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 绘制节点
    data.nodes.forEach(node => {
      this.drawNodeToCanvas(ctx, node)
    })

    // 绘制边
    data.edges.forEach(edge => {
      this.drawEdgeToCanvas(ctx, edge, data.nodes)
    })
  }

  /**
   * 绘制节点到画布
   */
  private drawNodeToCanvas(ctx: CanvasRenderingContext2D, node: any): void {
    const x = node.x
    const y = node.y

    // 根据节点类型设置颜色
    const colors: Record<string, string> = {
      start: '#52c41a',
      approval: '#1890ff',
      condition: '#faad14',
      end: '#ff4d4f',
      process: '#666666'
    }

    ctx.fillStyle = colors[node.type] || '#666666'
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2

    // 绘制节点形状
    if (node.type === 'start' || node.type === 'end') {
      // 圆形
      ctx.beginPath()
      ctx.arc(x, y, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    } else if (node.type === 'condition') {
      // 菱形
      ctx.beginPath()
      ctx.moveTo(x, y - 30)
      ctx.lineTo(x + 40, y)
      ctx.lineTo(x, y + 30)
      ctx.lineTo(x - 40, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else {
      // 矩形
      ctx.fillRect(x - 50, y - 25, 100, 50)
      ctx.strokeRect(x - 50, y - 25, 100, 50)
    }

    // 绘制文本
    ctx.fillStyle = '#fff'
    ctx.fillText(node.text || node.type, x, y)
  }

  /**
   * 绘制边到画布
   */
  private drawEdgeToCanvas(ctx: CanvasRenderingContext2D, edge: any, nodes: any[]): void {
    const sourceNode = nodes.find(n => n.id === edge.sourceNodeId)
    const targetNode = nodes.find(n => n.id === edge.targetNodeId)

    if (!sourceNode || !targetNode) return

    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(sourceNode.x, sourceNode.y)
    ctx.lineTo(targetNode.x, targetNode.y)
    ctx.stroke()

    // 绘制箭头
    this.drawArrow(ctx, sourceNode.x, sourceNode.y, targetNode.x, targetNode.y)
  }

  /**
   * 绘制箭头
   */
  private drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number): void {
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const arrowLength = 15
    const arrowAngle = Math.PI / 6

    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle - arrowAngle),
      toY - arrowLength * Math.sin(angle - arrowAngle)
    )
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle + arrowAngle),
      toY - arrowLength * Math.sin(angle + arrowAngle)
    )
    ctx.stroke()
  }

  /**
   * 下载 Blob
   */
  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * 转换为 XML
   */
  private convertToXML(data: any): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<flowchart>\n'
    
    // 节点
    xml += '  <nodes>\n'
    data.nodes.forEach((node: any) => {
      xml += `    <node id="${node.id}" type="${node.type}" x="${node.x}" y="${node.y}">\n`
      xml += `      <text>${node.text || ''}</text>\n`
      xml += '    </node>\n'
    })
    xml += '  </nodes>\n'
    
    // 边
    xml += '  <edges>\n'
    data.edges.forEach((edge: any) => {
      xml += `    <edge id="${edge.id}" source="${edge.sourceNodeId}" target="${edge.targetNodeId}">\n`
      xml += `      <text>${edge.text || ''}</text>\n`
      xml += '    </edge>\n'
    })
    xml += '  </edges>\n'
    
    xml += '</flowchart>'
    
    return xml
  }

  /**
   * 设置配置
   */
  public setConfig(config: Partial<ExportConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取支持的导出格式
   */
  public getSupportedFormats(): ExportFormat[] {
    return ['png', 'jpg', 'svg', 'json', 'xml']
  }
}

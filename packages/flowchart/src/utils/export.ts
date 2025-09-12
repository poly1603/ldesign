/**
 * 数据导出工具
 * 
 * 提供多种格式的流程图数据导出功能
 */

import type { FlowchartData, ApprovalNodeConfig, ApprovalEdgeConfig } from '../types'
import { validateFlowchart } from './validation'

/**
 * 导出格式
 */
export type ExportFormat = 'json' | 'xml' | 'svg' | 'png' | 'pdf' | 'bpmn'

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format: ExportFormat
  /** 文件名（不含扩展名） */
  filename?: string
  /** 是否包含验证信息 */
  includeValidation?: boolean
  /** 是否美化输出 */
  prettify?: boolean
  /** SVG导出选项 */
  svg?: {
    width?: number
    height?: number
    background?: string
  }
}

/**
 * 导出结果
 */
export interface ExportResult {
  /** 是否成功 */
  success: boolean
  /** 导出的数据 */
  data?: string | Blob
  /** 文件名 */
  filename?: string
  /** 错误信息 */
  error?: string
}

/**
 * 数据导出器
 */
export class FlowchartExporter {
  /**
   * 导出流程图数据
   */
  static async export(data: FlowchartData, options: ExportOptions): Promise<ExportResult> {
    try {
      const filename = options.filename || `flowchart_${Date.now()}`

      switch (options.format) {
        case 'json':
          return this.exportJSON(data, filename, options)
        case 'xml':
          return this.exportXML(data, filename, options)
        case 'svg':
          return this.exportSVG(data, filename, options)
        case 'bpmn':
          return this.exportBPMN(data, filename, options)
        default:
          return {
            success: false,
            error: `不支持的导出格式: ${options.format}`
          }
      }
    } catch (error) {
      return {
        success: false,
        error: `导出失败: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * 导出为JSON格式
   */
  private static exportJSON(
    data: FlowchartData,
    filename: string,
    options: ExportOptions
  ): ExportResult {
    let exportData: any = { ...data }

    // 添加验证信息
    if (options.includeValidation) {
      const validation = validateFlowchart(data)
      exportData.validation = validation
    }

    // 添加元数据
    exportData.metadata = {
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      format: 'ldesign-flowchart'
    }

    const jsonString = options.prettify 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData)

    return {
      success: true,
      data: jsonString,
      filename: `${filename}.json`
    }
  }

  /**
   * 导出为XML格式
   */
  private static exportXML(
    data: FlowchartData,
    filename: string,
    options: ExportOptions
  ): ExportResult {
    const nodes = data.nodes as ApprovalNodeConfig[]
    const edges = (data.edges || []) as ApprovalEdgeConfig[]

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<flowchart>\n'
    xml += '  <metadata>\n'
    xml += `    <exportTime>${new Date().toISOString()}</exportTime>\n`
    xml += '    <version>1.0.0</version>\n'
    xml += '    <format>ldesign-flowchart</format>\n'
    xml += '  </metadata>\n'

    // 导出节点
    xml += '  <nodes>\n'
    nodes.forEach(node => {
      xml += `    <node id="${this.escapeXML(node.id)}" type="${node.type}">\n`
      xml += `      <text>${this.escapeXML(node.text || '')}</text>\n`
      xml += `      <position x="${node.x}" y="${node.y}" />\n`
      
      if (node.properties) {
        xml += '      <properties>\n'
        Object.entries(node.properties).forEach(([key, value]) => {
          xml += `        <property name="${key}" value="${this.escapeXML(String(value))}" />\n`
        })
        xml += '      </properties>\n'
      }
      
      xml += '    </node>\n'
    })
    xml += '  </nodes>\n'

    // 导出边
    xml += '  <edges>\n'
    edges.forEach(edge => {
      xml += `    <edge id="${this.escapeXML(edge.id)}" source="${this.escapeXML(edge.sourceNodeId)}" target="${this.escapeXML(edge.targetNodeId)}">\n`
      
      if (edge.text) {
        xml += `      <text>${this.escapeXML(edge.text)}</text>\n`
      }
      
      if (edge.properties) {
        xml += '      <properties>\n'
        Object.entries(edge.properties).forEach(([key, value]) => {
          xml += `        <property name="${key}" value="${this.escapeXML(String(value))}" />\n`
        })
        xml += '      </properties>\n'
      }
      
      xml += '    </edge>\n'
    })
    xml += '  </edges>\n'

    // 添加验证信息
    if (options.includeValidation) {
      const validation = validateFlowchart(data)
      xml += '  <validation>\n'
      xml += `    <valid>${validation.valid}</valid>\n`
      
      if (validation.errors.length > 0) {
        xml += '    <errors>\n'
        validation.errors.forEach(error => {
          xml += `      <error type="${error.type}">${this.escapeXML(error.message)}</error>\n`
        })
        xml += '    </errors>\n'
      }
      
      if (validation.warnings.length > 0) {
        xml += '    <warnings>\n'
        validation.warnings.forEach(warning => {
          xml += `      <warning type="${warning.type}">${this.escapeXML(warning.message)}</warning>\n`
        })
        xml += '    </warnings>\n'
      }
      
      xml += '  </validation>\n'
    }

    xml += '</flowchart>'

    return {
      success: true,
      data: xml,
      filename: `${filename}.xml`
    }
  }

  /**
   * 导出为SVG格式
   */
  private static exportSVG(
    data: FlowchartData,
    filename: string,
    options: ExportOptions
  ): ExportResult {
    const nodes = data.nodes as ApprovalNodeConfig[]
    const edges = (data.edges || []) as ApprovalEdgeConfig[]

    // 计算画布尺寸
    const bounds = this.calculateBounds(nodes)
    const padding = 50
    const width = options.svg?.width || (bounds.width + padding * 2)
    const height = options.svg?.height || (bounds.height + padding * 2)
    const background = options.svg?.background || '#ffffff'

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`
    svg += `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n`
    svg += `  <rect width="100%" height="100%" fill="${background}"/>\n`

    // 定义样式
    svg += '  <defs>\n'
    svg += '    <style>\n'
    svg += '      .node-text { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; dominant-baseline: middle; }\n'
    svg += '      .edge-text { font-family: Arial, sans-serif; font-size: 10px; text-anchor: middle; }\n'
    svg += '    </style>\n'
    svg += '  </defs>\n'

    // 绘制边
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.sourceNodeId)
      const targetNode = nodes.find(n => n.id === edge.targetNodeId)
      
      if (sourceNode && targetNode) {
        const x1 = sourceNode.x - bounds.minX + padding
        const y1 = sourceNode.y - bounds.minY + padding
        const x2 = targetNode.x - bounds.minX + padding
        const y2 = targetNode.y - bounds.minY + padding

        svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>\n`
        
        if (edge.text) {
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          svg += `  <text x="${midX}" y="${midY}" class="edge-text" fill="#666">${this.escapeXML(edge.text)}</text>\n`
        }
      }
    })

    // 绘制节点
    nodes.forEach(node => {
      const x = node.x - bounds.minX + padding
      const y = node.y - bounds.minY + padding
      const width = node.width || 120
      const height = node.height || 60

      // 根据节点类型选择形状和颜色
      let shape = ''
      let fill = '#ffffff'
      let stroke = '#722ED1'

      switch (node.type) {
        case 'start':
          fill = '#f6ffed'
          stroke = '#52c41a'
          shape = `<circle cx="${x}" cy="${y}" r="${Math.min(width, height) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
          break
        case 'end':
          fill = '#fff2f0'
          stroke = '#ff4d4f'
          shape = `<circle cx="${x}" cy="${y}" r="${Math.min(width, height) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
          break
        case 'condition':
          fill = '#fffbe6'
          stroke = '#faad14'
          const halfW = width / 2
          const halfH = height / 2
          shape = `<polygon points="${x},${y - halfH} ${x + halfW},${y} ${x},${y + halfH} ${x - halfW},${y}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
          break
        default:
          fill = '#f9f0ff'
          stroke = '#722ED1'
          shape = `<rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
      }

      svg += `  ${shape}\n`
      
      if (node.text) {
        svg += `  <text x="${x}" y="${y}" class="node-text" fill="#333">${this.escapeXML(node.text)}</text>\n`
      }
    })

    // 添加箭头标记
    svg += '  <defs>\n'
    svg += '    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">\n'
    svg += '      <path d="M0,0 L0,6 L9,3 z" fill="#666"/>\n'
    svg += '    </marker>\n'
    svg += '  </defs>\n'

    svg += '</svg>'

    return {
      success: true,
      data: svg,
      filename: `${filename}.svg`
    }
  }

  /**
   * 导出为BPMN格式
   */
  private static exportBPMN(
    data: FlowchartData,
    filename: string,
    options: ExportOptions
  ): ExportResult {
    const nodes = data.nodes as ApprovalNodeConfig[]
    const edges = (data.edges || []) as ApprovalEdgeConfig[]

    let bpmn = '<?xml version="1.0" encoding="UTF-8"?>\n'
    bpmn += '<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI">\n'
    bpmn += '  <process id="Process_1" isExecutable="true">\n'

    // 转换节点
    nodes.forEach(node => {
      const bpmnType = this.getBPMNNodeType(node.type)
      bpmn += `    <${bpmnType} id="${node.id}" name="${this.escapeXML(node.text || '')}">\n`
      bpmn += `    </${bpmnType}>\n`
    })

    // 转换边
    edges.forEach(edge => {
      bpmn += `    <sequenceFlow id="${edge.id}" sourceRef="${edge.sourceNodeId}" targetRef="${edge.targetNodeId}">\n`
      if (edge.text) {
        bpmn += `      <name>${this.escapeXML(edge.text)}</name>\n`
      }
      bpmn += '    </sequenceFlow>\n'
    })

    bpmn += '  </process>\n'
    bpmn += '</definitions>'

    return {
      success: true,
      data: bpmn,
      filename: `${filename}.bpmn`
    }
  }

  /**
   * 计算节点边界
   */
  private static calculateBounds(nodes: ApprovalNodeConfig[]) {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      const width = node.width || 120
      const height = node.height || 60
      const left = node.x - width / 2
      const right = node.x + width / 2
      const top = node.y - height / 2
      const bottom = node.y + height / 2

      minX = Math.min(minX, left)
      minY = Math.min(minY, top)
      maxX = Math.max(maxX, right)
      maxY = Math.max(maxY, bottom)
    })

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * 转换为BPMN节点类型
   */
  private static getBPMNNodeType(nodeType: string): string {
    const typeMap: Record<string, string> = {
      'start': 'startEvent',
      'end': 'endEvent',
      'approval': 'userTask',
      'condition': 'exclusiveGateway',
      'process': 'serviceTask'
    }
    return typeMap[nodeType] || 'task'
  }

  /**
   * XML转义
   */
  private static escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

/**
 * 快速导出流程图
 */
export async function exportFlowchart(
  data: FlowchartData,
  format: ExportFormat,
  filename?: string
): Promise<ExportResult> {
  return FlowchartExporter.export(data, { format, filename })
}

/**
 * 下载导出的文件
 */
export function downloadExportedFile(result: ExportResult): void {
  if (!result.success || !result.data || !result.filename) {
    console.error('导出失败或数据无效')
    return
  }

  const blob = typeof result.data === 'string' 
    ? new Blob([result.data], { type: 'text/plain;charset=utf-8' })
    : result.data

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = result.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

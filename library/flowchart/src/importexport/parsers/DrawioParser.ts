/**
 * Draw.io格式解析器
 * 
 * 处理Draw.io XML格式的导入导出
 */

import type {
  FormatParser,
  FormatGenerator,
  SupportedFormat,
  ImportOptions,
  ExportOptions,
  FormatInfo
} from '../types'

/**
 * Draw.io格式解析器
 */
export class DrawioParser implements FormatParser {
  name = 'DrawioParser'
  supportedFormats: SupportedFormat[] = ['drawio']

  /**
   * 解析Draw.io XML数据
   */
  async parse(data: string | ArrayBuffer, options?: ImportOptions): Promise<any> {
    try {
      const xmlString = this.normalizeToString(data)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

      // 检查解析错误
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error('XML解析错误')
      }

      // 验证是否为Draw.io格式
      if (!this.isDrawioFormat(xmlDoc)) {
        throw new Error('不是有效的Draw.io格式')
      }

      // 提取图形数据
      const graphData = this.extractGraphData(xmlDoc)
      
      // 转换为LogicFlow格式
      const logicFlowData = this.convertToLogicFlow(graphData, options)

      return logicFlowData
    } catch (error) {
      throw new Error(`Draw.io解析失败: ${error.message}`)
    }
  }

  /**
   * 验证Draw.io数据格式
   */
  async validate(data: string | ArrayBuffer): Promise<boolean> {
    try {
      const xmlString = this.normalizeToString(data)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

      // 检查解析错误
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        return false
      }

      return this.isDrawioFormat(xmlDoc)
    } catch (error) {
      return false
    }
  }

  /**
   * 获取格式信息
   */
  async getFormatInfo(data: string | ArrayBuffer): Promise<Partial<FormatInfo>> {
    try {
      const xmlString = this.normalizeToString(data)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
      
      if (this.isDrawioFormat(xmlDoc)) {
        const mxfile = xmlDoc.querySelector('mxfile')
        const version = mxfile?.getAttribute('version') || '未知'
        
        return {
          format: 'drawio',
          version
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return {}
  }

  /**
   * 标准化数据为字符串
   */
  private normalizeToString(data: string | ArrayBuffer): string {
    if (typeof data === 'string') {
      return data
    }
    
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(data)
  }

  /**
   * 检查是否为Draw.io格式
   */
  private isDrawioFormat(xmlDoc: Document): boolean {
    // 检查根元素
    const mxfile = xmlDoc.querySelector('mxfile')
    if (mxfile) {
      return true
    }

    // 检查是否为单页面格式
    const mxGraphModel = xmlDoc.querySelector('mxGraphModel')
    if (mxGraphModel) {
      return true
    }

    return false
  }

  /**
   * 提取图形数据
   */
  private extractGraphData(xmlDoc: Document): any {
    const pages: any[] = []

    // 处理多页面格式
    const diagrams = xmlDoc.querySelectorAll('diagram')
    if (diagrams.length > 0) {
      diagrams.forEach((diagram, index) => {
        const pageData = this.extractPageData(diagram, index)
        if (pageData) {
          pages.push(pageData)
        }
      })
    } else {
      // 处理单页面格式
      const mxGraphModel = xmlDoc.querySelector('mxGraphModel')
      if (mxGraphModel) {
        const pageData = this.extractPageDataFromModel(mxGraphModel, 0)
        if (pageData) {
          pages.push(pageData)
        }
      }
    }

    return { pages }
  }

  /**
   * 提取页面数据
   */
  private extractPageData(diagram: Element, index: number): any {
    const name = diagram.getAttribute('name') || `页面${index + 1}`
    const id = diagram.getAttribute('id') || `page_${index}`
    
    // 解码图形模型
    const encodedData = diagram.textContent || ''
    let decodedData: string
    
    try {
      // Draw.io使用base64编码和URL编码
      decodedData = decodeURIComponent(atob(encodedData))
    } catch (error) {
      console.warn('解码图形数据失败:', error)
      return null
    }

    // 解析图形模型XML
    const parser = new DOMParser()
    const modelDoc = parser.parseFromString(decodedData, 'text/xml')
    const mxGraphModel = modelDoc.querySelector('mxGraphModel')
    
    if (!mxGraphModel) {
      return null
    }

    return this.extractPageDataFromModel(mxGraphModel, index, { name, id })
  }

  /**
   * 从图形模型提取页面数据
   */
  private extractPageDataFromModel(mxGraphModel: Element, index: number, pageInfo?: any): any {
    const root = mxGraphModel.querySelector('root')
    if (!root) {
      return null
    }

    const cells = root.querySelectorAll('mxCell')
    const nodes: any[] = []
    const edges: any[] = []

    cells.forEach(cell => {
      const cellData = this.parseMxCell(cell)
      if (cellData) {
        if (cellData.type === 'node') {
          nodes.push(cellData.data)
        } else if (cellData.type === 'edge') {
          edges.push(cellData.data)
        }
      }
    })

    return {
      name: pageInfo?.name || `页面${index + 1}`,
      id: pageInfo?.id || `page_${index}`,
      nodes,
      edges
    }
  }

  /**
   * 解析mxCell元素
   */
  private parseMxCell(cell: Element): any {
    const id = cell.getAttribute('id')
    const value = cell.getAttribute('value') || ''
    const style = cell.getAttribute('style') || ''
    const parent = cell.getAttribute('parent')
    const source = cell.getAttribute('source')
    const target = cell.getAttribute('target')

    // 跳过根节点和默认父节点
    if (id === '0' || id === '1' || !parent || parent === '0') {
      return null
    }

    // 获取几何信息
    const geometry = cell.querySelector('mxGeometry')
    const geomData = this.parseGeometry(geometry)

    // 判断是节点还是边
    if (source && target) {
      // 这是一条边
      return {
        type: 'edge',
        data: {
          id: id || this.generateId(),
          type: this.mapDrawioStyleToEdgeType(style),
          sourceNodeId: source,
          targetNodeId: target,
          text: this.decodeValue(value),
          style: this.parseDrawioStyle(style),
          points: geomData.points || []
        }
      }
    } else if (geomData.width && geomData.height) {
      // 这是一个节点
      return {
        type: 'node',
        data: {
          id: id || this.generateId(),
          type: this.mapDrawioStyleToNodeType(style),
          x: geomData.x || 0,
          y: geomData.y || 0,
          width: geomData.width,
          height: geomData.height,
          text: this.decodeValue(value),
          style: this.parseDrawioStyle(style)
        }
      }
    }

    return null
  }

  /**
   * 解析几何信息
   */
  private parseGeometry(geometry: Element | null): any {
    if (!geometry) {
      return {}
    }

    const result: any = {}

    // 基本几何属性
    const x = geometry.getAttribute('x')
    const y = geometry.getAttribute('y')
    const width = geometry.getAttribute('width')
    const height = geometry.getAttribute('height')

    if (x !== null) result.x = parseFloat(x)
    if (y !== null) result.y = parseFloat(y)
    if (width !== null) result.width = parseFloat(width)
    if (height !== null) result.height = parseFloat(height)

    // 解析路径点
    const points = geometry.querySelectorAll('mxPoint')
    if (points.length > 0) {
      result.points = Array.from(points).map(point => ({
        x: parseFloat(point.getAttribute('x') || '0'),
        y: parseFloat(point.getAttribute('y') || '0')
      }))
    }

    return result
  }

  /**
   * 解码值
   */
  private decodeValue(value: string): string {
    if (!value) return ''
    
    try {
      // Draw.io可能使用HTML编码
      const div = document.createElement('div')
      div.innerHTML = value
      return div.textContent || div.innerText || ''
    } catch (error) {
      return value
    }
  }

  /**
   * 解析Draw.io样式
   */
  private parseDrawioStyle(style: string): any {
    const styleObj: any = {}
    
    if (!style) return styleObj

    // 解析样式字符串
    const pairs = style.split(';')
    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      if (key && value) {
        styleObj[key.trim()] = value.trim()
      }
    })

    return styleObj
  }

  /**
   * 映射Draw.io样式到节点类型
   */
  private mapDrawioStyleToNodeType(style: string): string {
    // 根据样式判断节点类型
    if (style.includes('ellipse')) return 'circle'
    if (style.includes('rhombus')) return 'diamond'
    if (style.includes('triangle')) return 'triangle'
    if (style.includes('hexagon')) return 'hexagon'
    if (style.includes('cylinder')) return 'cylinder'
    
    return 'rect' // 默认矩形
  }

  /**
   * 映射Draw.io样式到边类型
   */
  private mapDrawioStyleToEdgeType(style: string): string {
    if (style.includes('curved')) return 'bezier'
    if (style.includes('orthogonal')) return 'polyline'
    
    return 'line' // 默认直线
  }

  /**
   * 转换为LogicFlow格式
   */
  private convertToLogicFlow(graphData: any, options?: ImportOptions): any {
    const result = {
      nodes: [] as any[],
      edges: [] as any[]
    }

    // 处理所有页面（目前只处理第一个页面）
    if (graphData.pages && graphData.pages.length > 0) {
      const firstPage = graphData.pages[0]
      result.nodes = firstPage.nodes || []
      result.edges = firstPage.edges || []
    }

    // 应用导入选项
    if (options?.offset) {
      result.nodes = result.nodes.map(node => ({
        ...node,
        x: node.x + options.offset!.x,
        y: node.y + options.offset!.y
      }))
    }

    if (!options?.preserveIds) {
      const idMap = new Map<string, string>()
      
      // 重新生成节点ID
      result.nodes = result.nodes.map(node => {
        const newId = this.generateId()
        idMap.set(node.id, newId)
        return { ...node, id: newId }
      })

      // 重新生成边ID并更新节点引用
      result.edges = result.edges.map(edge => {
        const newId = this.generateId()
        const newSourceNodeId = idMap.get(edge.sourceNodeId) || edge.sourceNodeId
        const newTargetNodeId = idMap.get(edge.targetNodeId) || edge.targetNodeId
        
        return {
          ...edge,
          id: newId,
          sourceNodeId: newSourceNodeId,
          targetNodeId: newTargetNodeId
        }
      })
    }

    return result
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `drawio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Draw.io格式生成器
 */
export class DrawioGenerator implements FormatGenerator {
  name = 'DrawioGenerator'
  supportedFormats: SupportedFormat[] = ['drawio']

  /**
   * 生成Draw.io XML数据
   */
  async generate(data: any, options?: ExportOptions): Promise<string> {
    try {
      // 验证输入数据
      if (!await this.validateInput(data)) {
        throw new Error('输入数据验证失败')
      }

      // 创建XML文档
      const xmlDoc = this.createDrawioXml(data, options)
      
      // 序列化XML
      const serializer = new XMLSerializer()
      const xmlString = serializer.serializeToString(xmlDoc)
      
      return xmlString
    } catch (error) {
      throw new Error(`Draw.io生成失败: ${error.message}`)
    }
  }

  /**
   * 获取默认选项
   */
  getDefaultOptions(): ExportOptions {
    return {
      format: 'drawio',
      scope: 'all',
      includeMetadata: true,
      compress: false
    }
  }

  /**
   * 验证输入数据
   */
  async validateInput(data: any): Promise<boolean> {
    if (!data || typeof data !== 'object') {
      return false
    }

    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return false
    }

    return true
  }

  /**
   * 创建Draw.io XML文档
   */
  private createDrawioXml(data: any, options?: ExportOptions): Document {
    const doc = document.implementation.createDocument(null, 'mxfile', null)
    const mxfile = doc.documentElement
    
    // 设置mxfile属性
    mxfile.setAttribute('host', 'LogicFlow')
    mxfile.setAttribute('modified', new Date().toISOString())
    mxfile.setAttribute('agent', 'LogicFlow Export')
    mxfile.setAttribute('version', '1.0')
    mxfile.setAttribute('etag', this.generateEtag())

    // 创建diagram元素
    const diagram = doc.createElement('diagram')
    diagram.setAttribute('id', 'page_1')
    diagram.setAttribute('name', '页面1')
    
    // 创建图形模型
    const graphModel = this.createGraphModel(doc, data, options)
    
    // 编码图形模型
    const serializer = new XMLSerializer()
    const modelXml = serializer.serializeToString(graphModel)
    const encodedModel = btoa(encodeURIComponent(modelXml))
    
    diagram.textContent = encodedModel
    mxfile.appendChild(diagram)

    return doc
  }

  /**
   * 创建图形模型
   */
  private createGraphModel(doc: Document, data: any, options?: ExportOptions): Element {
    const mxGraphModel = doc.createElement('mxGraphModel')
    mxGraphModel.setAttribute('dx', '0')
    mxGraphModel.setAttribute('dy', '0')
    mxGraphModel.setAttribute('grid', '1')
    mxGraphModel.setAttribute('gridSize', '10')
    mxGraphModel.setAttribute('guides', '1')
    mxGraphModel.setAttribute('tooltips', '1')
    mxGraphModel.setAttribute('connect', '1')
    mxGraphModel.setAttribute('arrows', '1')
    mxGraphModel.setAttribute('fold', '1')
    mxGraphModel.setAttribute('page', '1')
    mxGraphModel.setAttribute('pageScale', '1')
    mxGraphModel.setAttribute('pageWidth', '827')
    mxGraphModel.setAttribute('pageHeight', '1169')

    const root = doc.createElement('root')
    
    // 添加默认节点
    const defaultParent = doc.createElement('mxCell')
    defaultParent.setAttribute('id', '0')
    root.appendChild(defaultParent)

    const layer = doc.createElement('mxCell')
    layer.setAttribute('id', '1')
    layer.setAttribute('parent', '0')
    root.appendChild(layer)

    // 添加节点
    data.nodes.forEach((node: any) => {
      const cellElement = this.createNodeCell(doc, node)
      root.appendChild(cellElement)
    })

    // 添加边
    data.edges.forEach((edge: any) => {
      const cellElement = this.createEdgeCell(doc, edge)
      root.appendChild(cellElement)
    })

    mxGraphModel.appendChild(root)
    return mxGraphModel
  }

  /**
   * 创建节点单元格
   */
  private createNodeCell(doc: Document, node: any): Element {
    const cell = doc.createElement('mxCell')
    cell.setAttribute('id', node.id)
    cell.setAttribute('value', this.encodeValue(node.text || ''))
    cell.setAttribute('style', this.convertNodeStyleToDrawio(node))
    cell.setAttribute('vertex', '1')
    cell.setAttribute('parent', '1')

    const geometry = doc.createElement('mxGeometry')
    geometry.setAttribute('x', node.x.toString())
    geometry.setAttribute('y', node.y.toString())
    geometry.setAttribute('width', (node.width || 100).toString())
    geometry.setAttribute('height', (node.height || 60).toString())
    geometry.setAttribute('as', 'geometry')

    cell.appendChild(geometry)
    return cell
  }

  /**
   * 创建边单元格
   */
  private createEdgeCell(doc: Document, edge: any): Element {
    const cell = doc.createElement('mxCell')
    cell.setAttribute('id', edge.id)
    cell.setAttribute('value', this.encodeValue(edge.text || ''))
    cell.setAttribute('style', this.convertEdgeStyleToDrawio(edge))
    cell.setAttribute('edge', '1')
    cell.setAttribute('parent', '1')
    cell.setAttribute('source', edge.sourceNodeId)
    cell.setAttribute('target', edge.targetNodeId)

    const geometry = doc.createElement('mxGeometry')
    geometry.setAttribute('relative', '1')
    geometry.setAttribute('as', 'geometry')

    cell.appendChild(geometry)
    return cell
  }

  /**
   * 编码值
   */
  private encodeValue(value: string): string {
    if (!value) return ''
    
    // 转义HTML特殊字符
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
   * 转换节点样式到Draw.io格式
   */
  private convertNodeStyleToDrawio(node: any): string {
    const styles: string[] = []
    
    // 根据节点类型设置样式
    switch (node.type) {
      case 'circle':
        styles.push('ellipse')
        break
      case 'diamond':
        styles.push('rhombus')
        break
      case 'triangle':
        styles.push('triangle')
        break
      case 'hexagon':
        styles.push('hexagon')
        break
      default:
        styles.push('rounded=0')
        break
    }

    // 添加基本样式
    styles.push('whiteSpace=wrap')
    styles.push('html=1')

    return styles.join(';')
  }

  /**
   * 转换边样式到Draw.io格式
   */
  private convertEdgeStyleToDrawio(edge: any): string {
    const styles: string[] = []
    
    // 根据边类型设置样式
    switch (edge.type) {
      case 'bezier':
        styles.push('curved=1')
        break
      case 'polyline':
        styles.push('orthogonal=1')
        break
      default:
        styles.push('rounded=0')
        break
    }

    // 添加基本样式
    styles.push('orthogonalLoop=1')
    styles.push('jettySize=auto')
    styles.push('html=1')

    return styles.join(';')
  }

  /**
   * 生成ETag
   */
  private generateEtag(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

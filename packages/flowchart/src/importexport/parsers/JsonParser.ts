/**
 * JSON格式解析器
 * 
 * 处理LogicFlow原生JSON格式的导入导出
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
 * JSON格式解析器
 */
export class JsonParser implements FormatParser {
  name = 'JsonParser'
  supportedFormats: SupportedFormat[] = ['json']

  /**
   * 解析JSON数据
   */
  async parse(data: string | ArrayBuffer, options?: ImportOptions): Promise<any> {
    try {
      const jsonString = this.normalizeToString(data)
      const parsedData = JSON.parse(jsonString)

      // 验证数据结构
      if (!this.isValidLogicFlowData(parsedData)) {
        throw new Error('无效的LogicFlow JSON数据结构')
      }

      // 应用导入选项
      return this.applyImportOptions(parsedData, options)
    } catch (error) {
      throw new Error(`JSON解析失败: ${error.message}`)
    }
  }

  /**
   * 验证JSON数据格式
   */
  async validate(data: string | ArrayBuffer): Promise<boolean> {
    try {
      const jsonString = this.normalizeToString(data)
      const parsedData = JSON.parse(jsonString)
      return this.isValidLogicFlowData(parsedData)
    } catch (error) {
      return false
    }
  }

  /**
   * 获取格式信息
   */
  async getFormatInfo(data: string | ArrayBuffer): Promise<Partial<FormatInfo>> {
    try {
      const jsonString = this.normalizeToString(data)
      const parsedData = JSON.parse(jsonString)
      
      if (this.isValidLogicFlowData(parsedData)) {
        return {
          format: 'json',
          version: parsedData.version || '1.0'
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
    
    // 将ArrayBuffer转换为字符串
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(data)
  }

  /**
   * 验证是否为有效的LogicFlow数据
   */
  private isValidLogicFlowData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 检查必需的字段
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return false
    }

    // 验证节点结构
    for (const node of data.nodes) {
      if (!this.isValidNode(node)) {
        return false
      }
    }

    // 验证边结构
    for (const edge of data.edges) {
      if (!this.isValidEdge(edge)) {
        return false
      }
    }

    return true
  }

  /**
   * 验证节点结构
   */
  private isValidNode(node: any): boolean {
    return (
      node &&
      typeof node.id === 'string' &&
      typeof node.type === 'string' &&
      typeof node.x === 'number' &&
      typeof node.y === 'number'
    )
  }

  /**
   * 验证边结构
   */
  private isValidEdge(edge: any): boolean {
    return (
      edge &&
      typeof edge.id === 'string' &&
      typeof edge.type === 'string' &&
      typeof edge.sourceNodeId === 'string' &&
      typeof edge.targetNodeId === 'string'
    )
  }

  /**
   * 应用导入选项
   */
  private applyImportOptions(data: any, options?: ImportOptions): any {
    if (!options) {
      return data
    }

    let result = { ...data }

    // 应用坐标偏移
    if (options.offset) {
      result.nodes = result.nodes.map((node: any) => ({
        ...node,
        x: node.x + options.offset!.x,
        y: node.y + options.offset!.y
      }))
    }

    // 处理ID保留
    if (!options.preserveIds) {
      result = this.regenerateIds(result)
    }

    return result
  }

  /**
   * 重新生成ID
   */
  private regenerateIds(data: any): any {
    const idMap = new Map<string, string>()
    
    // 为节点生成新ID
    const newNodes = data.nodes.map((node: any) => {
      const newId = this.generateId()
      idMap.set(node.id, newId)
      return { ...node, id: newId }
    })

    // 为边生成新ID并更新节点引用
    const newEdges = data.edges.map((edge: any) => {
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

    return {
      ...data,
      nodes: newNodes,
      edges: newEdges
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * JSON格式生成器
 */
export class JsonGenerator implements FormatGenerator {
  name = 'JsonGenerator'
  supportedFormats: SupportedFormat[] = ['json']

  /**
   * 生成JSON数据
   */
  async generate(data: any, options?: ExportOptions): Promise<string> {
    try {
      // 验证输入数据
      if (!await this.validateInput(data)) {
        throw new Error('输入数据验证失败')
      }

      // 应用导出选项
      const processedData = this.applyExportOptions(data, options)

      // 生成JSON字符串
      const jsonString = JSON.stringify(processedData, null, options?.compress ? 0 : 2)
      
      return jsonString
    } catch (error) {
      throw new Error(`JSON生成失败: ${error.message}`)
    }
  }

  /**
   * 获取默认选项
   */
  getDefaultOptions(): ExportOptions {
    return {
      format: 'json',
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

    // 检查必需的字段
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return false
    }

    return true
  }

  /**
   * 应用导出选项
   */
  private applyExportOptions(data: any, options?: ExportOptions): any {
    if (!options) {
      return data
    }

    let result = { ...data }

    // 应用范围过滤
    if (options.scope === 'selected') {
      result = this.filterSelectedItems(result)
    } else if (options.scope === 'visible') {
      result = this.filterVisibleItems(result)
    }

    // 处理元数据
    if (!options.includeMetadata) {
      result = this.removeMetadata(result)
    } else {
      result = this.addMetadata(result)
    }

    return result
  }

  /**
   * 过滤选中的项目
   */
  private filterSelectedItems(data: any): any {
    // 这里应该根据实际的选中状态进行过滤
    // 暂时返回所有数据
    return data
  }

  /**
   * 过滤可见的项目
   */
  private filterVisibleItems(data: any): any {
    // 这里应该根据实际的可见状态进行过滤
    // 暂时返回所有数据
    return data
  }

  /**
   * 移除元数据
   */
  private removeMetadata(data: any): any {
    const { version, metadata, ...cleanData } = data
    return cleanData
  }

  /**
   * 添加元数据
   */
  private addMetadata(data: any): any {
    return {
      ...data,
      version: '1.0',
      metadata: {
        exportTime: new Date().toISOString(),
        exportedBy: 'LogicFlow',
        nodeCount: data.nodes?.length || 0,
        edgeCount: data.edges?.length || 0
      }
    }
  }
}

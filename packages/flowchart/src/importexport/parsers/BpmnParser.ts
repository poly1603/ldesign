/**
 * BPMN 2.0格式解析器
 * 
 * 处理BPMN 2.0 XML格式的导入导出
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
 * BPMN格式解析器
 */
export class BpmnParser implements FormatParser {
  name = 'BpmnParser'
  supportedFormats: SupportedFormat[] = ['bpmn']

  /**
   * 解析BPMN XML数据
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

      // 验证是否为BPMN格式
      if (!this.isBpmnFormat(xmlDoc)) {
        throw new Error('不是有效的BPMN格式')
      }

      // 提取BPMN数据
      const bpmnData = this.extractBpmnData(xmlDoc)
      
      // 转换为LogicFlow格式
      const logicFlowData = this.convertToLogicFlow(bpmnData, options)

      return logicFlowData
    } catch (error) {
      throw new Error(`BPMN解析失败: ${error.message}`)
    }
  }

  /**
   * 验证BPMN数据格式
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

      return this.isBpmnFormat(xmlDoc)
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
      
      if (this.isBpmnFormat(xmlDoc)) {
        const definitions = xmlDoc.querySelector('definitions')
        const version = definitions?.getAttribute('expressionLanguage') || '2.0'
        
        return {
          format: 'bpmn',
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
   * 检查是否为BPMN格式
   */
  private isBpmnFormat(xmlDoc: Document): boolean {
    const definitions = xmlDoc.querySelector('definitions')
    if (!definitions) {
      return false
    }

    // 检查命名空间
    const xmlns = definitions.getAttribute('xmlns')
    const targetNamespace = definitions.getAttribute('targetNamespace')
    
    return xmlns?.includes('bpmn') || targetNamespace?.includes('bpmn') || false
  }

  /**
   * 提取BPMN数据
   */
  private extractBpmnData(xmlDoc: Document): any {
    const definitions = xmlDoc.querySelector('definitions')
    if (!definitions) {
      throw new Error('找不到BPMN definitions元素')
    }

    const processes: any[] = []
    const diagrams: any[] = []

    // 提取流程定义
    const processElements = definitions.querySelectorAll('process')
    processElements.forEach((process, index) => {
      const processData = this.extractProcessData(process, index)
      if (processData) {
        processes.push(processData)
      }
    })

    // 提取图形信息
    const diagramElements = definitions.querySelectorAll('BPMNDiagram')
    diagramElements.forEach((diagram, index) => {
      const diagramData = this.extractDiagramData(diagram, index)
      if (diagramData) {
        diagrams.push(diagramData)
      }
    })

    return { processes, diagrams }
  }

  /**
   * 提取流程数据
   */
  private extractProcessData(process: Element, index: number): any {
    const id = process.getAttribute('id') || `process_${index}`
    const name = process.getAttribute('name') || `流程${index + 1}`
    const isExecutable = process.getAttribute('isExecutable') === 'true'

    const elements: any[] = []

    // 提取所有流程元素
    const children = process.children
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const elementData = this.parseProcessElement(child)
      if (elementData) {
        elements.push(elementData)
      }
    }

    return {
      id,
      name,
      isExecutable,
      elements
    }
  }

  /**
   * 解析流程元素
   */
  private parseProcessElement(element: Element): any {
    const tagName = element.tagName
    const id = element.getAttribute('id')
    const name = element.getAttribute('name') || ''

    const baseData = {
      id,
      name,
      type: this.mapBpmnElementType(tagName)
    }

    // 根据元素类型解析特定属性
    switch (tagName) {
      case 'startEvent':
      case 'endEvent':
      case 'intermediateThrowEvent':
      case 'intermediateCatchEvent':
        return {
          ...baseData,
          category: 'event',
          eventType: this.getEventType(element)
        }

      case 'task':
      case 'userTask':
      case 'serviceTask':
      case 'scriptTask':
      case 'manualTask':
        return {
          ...baseData,
          category: 'activity',
          taskType: tagName
        }

      case 'exclusiveGateway':
      case 'parallelGateway':
      case 'inclusiveGateway':
      case 'eventBasedGateway':
        return {
          ...baseData,
          category: 'gateway',
          gatewayType: tagName
        }

      case 'sequenceFlow':
        return {
          ...baseData,
          category: 'flow',
          sourceRef: element.getAttribute('sourceRef'),
          targetRef: element.getAttribute('targetRef'),
          conditionExpression: this.getConditionExpression(element)
        }

      default:
        return {
          ...baseData,
          category: 'other'
        }
    }
  }

  /**
   * 获取事件类型
   */
  private getEventType(element: Element): string {
    // 检查事件定义
    const eventDefinitions = element.children
    for (let i = 0; i < eventDefinitions.length; i++) {
      const def = eventDefinitions[i]
      switch (def.tagName) {
        case 'messageEventDefinition':
          return 'message'
        case 'timerEventDefinition':
          return 'timer'
        case 'errorEventDefinition':
          return 'error'
        case 'signalEventDefinition':
          return 'signal'
        case 'terminateEventDefinition':
          return 'terminate'
      }
    }
    return 'none'
  }

  /**
   * 获取条件表达式
   */
  private getConditionExpression(element: Element): string {
    const conditionExpression = element.querySelector('conditionExpression')
    return conditionExpression?.textContent || ''
  }

  /**
   * 提取图形数据
   */
  private extractDiagramData(diagram: Element, index: number): any {
    const id = diagram.getAttribute('id') || `diagram_${index}`
    const name = diagram.getAttribute('name') || `图形${index + 1}`

    const plane = diagram.querySelector('BPMNPlane')
    if (!plane) {
      return null
    }

    const shapes: any[] = []
    const edges: any[] = []

    // 提取形状
    const shapeElements = plane.querySelectorAll('BPMNShape')
    shapeElements.forEach(shape => {
      const shapeData = this.parseShape(shape)
      if (shapeData) {
        shapes.push(shapeData)
      }
    })

    // 提取边
    const edgeElements = plane.querySelectorAll('BPMNEdge')
    edgeElements.forEach(edge => {
      const edgeData = this.parseEdge(edge)
      if (edgeData) {
        edges.push(edgeData)
      }
    })

    return {
      id,
      name,
      shapes,
      edges
    }
  }

  /**
   * 解析形状
   */
  private parseShape(shape: Element): any {
    const id = shape.getAttribute('id')
    const bpmnElement = shape.getAttribute('bpmnElement')
    const isHorizontal = shape.getAttribute('isHorizontal') === 'true'

    const bounds = shape.querySelector('Bounds')
    if (!bounds) {
      return null
    }

    return {
      id,
      bpmnElement,
      isHorizontal,
      x: parseFloat(bounds.getAttribute('x') || '0'),
      y: parseFloat(bounds.getAttribute('y') || '0'),
      width: parseFloat(bounds.getAttribute('width') || '100'),
      height: parseFloat(bounds.getAttribute('height') || '60')
    }
  }

  /**
   * 解析边
   */
  private parseEdge(edge: Element): any {
    const id = edge.getAttribute('id')
    const bpmnElement = edge.getAttribute('bpmnElement')

    const waypoints: any[] = []
    const waypointElements = edge.querySelectorAll('waypoint')
    waypointElements.forEach(waypoint => {
      waypoints.push({
        x: parseFloat(waypoint.getAttribute('x') || '0'),
        y: parseFloat(waypoint.getAttribute('y') || '0')
      })
    })

    return {
      id,
      bpmnElement,
      waypoints
    }
  }

  /**
   * 映射BPMN元素类型
   */
  private mapBpmnElementType(bpmnType: string): string {
    const typeMap: Record<string, string> = {
      'startEvent': 'start',
      'endEvent': 'end',
      'task': 'task',
      'userTask': 'user-task',
      'serviceTask': 'service-task',
      'scriptTask': 'script-task',
      'manualTask': 'manual-task',
      'exclusiveGateway': 'exclusive-gateway',
      'parallelGateway': 'parallel-gateway',
      'inclusiveGateway': 'inclusive-gateway',
      'eventBasedGateway': 'event-gateway',
      'sequenceFlow': 'sequence-flow'
    }

    return typeMap[bpmnType] || bpmnType
  }

  /**
   * 转换为LogicFlow格式
   */
  private convertToLogicFlow(bpmnData: any, options?: ImportOptions): any {
    const result = {
      nodes: [] as any[],
      edges: [] as any[]
    }

    if (!bpmnData.processes || bpmnData.processes.length === 0) {
      return result
    }

    const process = bpmnData.processes[0] // 使用第一个流程
    const diagram = bpmnData.diagrams && bpmnData.diagrams.length > 0 ? bpmnData.diagrams[0] : null

    // 创建元素映射
    const elementMap = new Map()
    process.elements.forEach((element: any) => {
      elementMap.set(element.id, element)
    })

    // 创建形状映射
    const shapeMap = new Map()
    if (diagram) {
      diagram.shapes.forEach((shape: any) => {
        shapeMap.set(shape.bpmnElement, shape)
      })
    }

    // 转换节点
    process.elements.forEach((element: any) => {
      if (element.category !== 'flow') {
        const shape = shapeMap.get(element.id)
        const node = this.convertElementToNode(element, shape)
        if (node) {
          result.nodes.push(node)
        }
      }
    })

    // 转换边
    process.elements.forEach((element: any) => {
      if (element.category === 'flow') {
        const edge = this.convertElementToEdge(element, diagram)
        if (edge) {
          result.edges.push(edge)
        }
      }
    })

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
   * 转换元素为节点
   */
  private convertElementToNode(element: any, shape: any): any {
    if (!shape) {
      return null
    }

    return {
      id: element.id,
      type: element.type,
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      text: element.name,
      properties: {
        bpmnType: element.category,
        taskType: element.taskType,
        eventType: element.eventType,
        gatewayType: element.gatewayType
      }
    }
  }

  /**
   * 转换元素为边
   */
  private convertElementToEdge(element: any, diagram: any): any {
    if (!element.sourceRef || !element.targetRef) {
      return null
    }

    // 查找对应的图形边
    let points: any[] = []
    if (diagram) {
      const diagramEdge = diagram.edges.find((edge: any) => edge.bpmnElement === element.id)
      if (diagramEdge) {
        points = diagramEdge.waypoints
      }
    }

    return {
      id: element.id,
      type: 'line',
      sourceNodeId: element.sourceRef,
      targetNodeId: element.targetRef,
      text: element.name,
      points,
      properties: {
        conditionExpression: element.conditionExpression
      }
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `bpmn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * BPMN格式生成器
 */
export class BpmnGenerator implements FormatGenerator {
  name = 'BpmnGenerator'
  supportedFormats: SupportedFormat[] = ['bpmn']

  /**
   * 生成BPMN XML数据
   */
  async generate(data: any, options?: ExportOptions): Promise<string> {
    try {
      // 验证输入数据
      if (!await this.validateInput(data)) {
        throw new Error('输入数据验证失败')
      }

      // 创建BPMN XML文档
      const xmlDoc = this.createBpmnXml(data, options)
      
      // 序列化XML
      const serializer = new XMLSerializer()
      const xmlString = serializer.serializeToString(xmlDoc)
      
      return xmlString
    } catch (error) {
      throw new Error(`BPMN生成失败: ${error.message}`)
    }
  }

  /**
   * 获取默认选项
   */
  getDefaultOptions(): ExportOptions {
    return {
      format: 'bpmn',
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
   * 创建BPMN XML文档
   */
  private createBpmnXml(data: any, options?: ExportOptions): Document {
    const doc = document.implementation.createDocument(
      'http://www.omg.org/spec/BPMN/20100524/MODEL',
      'definitions',
      null
    )
    
    const definitions = doc.documentElement
    
    // 设置命名空间和属性
    definitions.setAttribute('xmlns', 'http://www.omg.org/spec/BPMN/20100524/MODEL')
    definitions.setAttribute('xmlns:bpmndi', 'http://www.omg.org/spec/BPMN/20100524/DI')
    definitions.setAttribute('xmlns:dc', 'http://www.omg.org/spec/DD/20100524/DC')
    definitions.setAttribute('xmlns:di', 'http://www.omg.org/spec/DD/20100524/DI')
    definitions.setAttribute('id', 'definitions_1')
    definitions.setAttribute('targetNamespace', 'http://logicflow.org/bpmn')
    definitions.setAttribute('exporter', 'LogicFlow')
    definitions.setAttribute('exporterVersion', '1.0')

    // 创建流程
    const process = this.createProcess(doc, data)
    definitions.appendChild(process)

    // 创建图形
    const diagram = this.createDiagram(doc, data)
    definitions.appendChild(diagram)

    return doc
  }

  /**
   * 创建流程
   */
  private createProcess(doc: Document, data: any): Element {
    const process = doc.createElement('process')
    process.setAttribute('id', 'process_1')
    process.setAttribute('name', '流程')
    process.setAttribute('isExecutable', 'true')

    // 添加节点
    data.nodes.forEach((node: any) => {
      const element = this.createProcessElement(doc, node)
      if (element) {
        process.appendChild(element)
      }
    })

    // 添加边
    data.edges.forEach((edge: any) => {
      const element = this.createSequenceFlow(doc, edge)
      if (element) {
        process.appendChild(element)
      }
    })

    return process
  }

  /**
   * 创建流程元素
   */
  private createProcessElement(doc: Document, node: any): Element | null {
    const bpmnType = this.mapNodeTypeToBpmn(node.type)
    if (!bpmnType) {
      return null
    }

    const element = doc.createElement(bpmnType)
    element.setAttribute('id', node.id)
    if (node.text) {
      element.setAttribute('name', node.text)
    }

    return element
  }

  /**
   * 创建序列流
   */
  private createSequenceFlow(doc: Document, edge: any): Element {
    const sequenceFlow = doc.createElement('sequenceFlow')
    sequenceFlow.setAttribute('id', edge.id)
    sequenceFlow.setAttribute('sourceRef', edge.sourceNodeId)
    sequenceFlow.setAttribute('targetRef', edge.targetNodeId)
    
    if (edge.text) {
      sequenceFlow.setAttribute('name', edge.text)
    }

    return sequenceFlow
  }

  /**
   * 创建图形
   */
  private createDiagram(doc: Document, data: any): Element {
    const diagram = doc.createElement('bpmndi:BPMNDiagram')
    diagram.setAttribute('id', 'diagram_1')

    const plane = doc.createElement('bpmndi:BPMNPlane')
    plane.setAttribute('id', 'plane_1')
    plane.setAttribute('bpmnElement', 'process_1')

    // 添加形状
    data.nodes.forEach((node: any) => {
      const shape = this.createShape(doc, node)
      plane.appendChild(shape)
    })

    // 添加边
    data.edges.forEach((edge: any) => {
      const edgeElement = this.createEdge(doc, edge)
      plane.appendChild(edgeElement)
    })

    diagram.appendChild(plane)
    return diagram
  }

  /**
   * 创建形状
   */
  private createShape(doc: Document, node: any): Element {
    const shape = doc.createElement('bpmndi:BPMNShape')
    shape.setAttribute('id', `${node.id}_di`)
    shape.setAttribute('bpmnElement', node.id)

    const bounds = doc.createElement('dc:Bounds')
    bounds.setAttribute('x', node.x.toString())
    bounds.setAttribute('y', node.y.toString())
    bounds.setAttribute('width', (node.width || 100).toString())
    bounds.setAttribute('height', (node.height || 60).toString())

    shape.appendChild(bounds)
    return shape
  }

  /**
   * 创建边
   */
  private createEdge(doc: Document, edge: any): Element {
    const edgeElement = doc.createElement('bpmndi:BPMNEdge')
    edgeElement.setAttribute('id', `${edge.id}_di`)
    edgeElement.setAttribute('bpmnElement', edge.id)

    // 添加路径点
    if (edge.points && edge.points.length > 0) {
      edge.points.forEach((point: any) => {
        const waypoint = doc.createElement('di:waypoint')
        waypoint.setAttribute('x', point.x.toString())
        waypoint.setAttribute('y', point.y.toString())
        edgeElement.appendChild(waypoint)
      })
    }

    return edgeElement
  }

  /**
   * 映射节点类型到BPMN
   */
  private mapNodeTypeToBpmn(nodeType: string): string | null {
    const typeMap: Record<string, string> = {
      'start': 'startEvent',
      'end': 'endEvent',
      'task': 'task',
      'user-task': 'userTask',
      'service-task': 'serviceTask',
      'script-task': 'scriptTask',
      'manual-task': 'manualTask',
      'exclusive-gateway': 'exclusiveGateway',
      'parallel-gateway': 'parallelGateway',
      'inclusive-gateway': 'inclusiveGateway',
      'event-gateway': 'eventBasedGateway'
    }

    return typeMap[nodeType] || null
  }
}

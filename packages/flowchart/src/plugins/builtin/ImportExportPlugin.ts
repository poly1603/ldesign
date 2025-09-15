/**
 * 导入导出插件
 * 
 * 为LogicFlow编辑器提供多格式导入导出功能
 */

import { BasePlugin } from '../BasePlugin'
import { ImportExportManager } from '../../importexport/ImportExportManager'
import { JsonParser, JsonGenerator } from '../../importexport/parsers/JsonParser'
import { DrawioParser, DrawioGenerator } from '../../importexport/parsers/DrawioParser'
import { BpmnParser, BpmnGenerator } from '../../importexport/parsers/BpmnParser'
import type LogicFlow from '@logicflow/core'
import type {
  ImportExportConfig,
  ImportOptions,
  ExportOptions,
  SupportedFormat,
  ImportResult,
  ExportResult,
  BatchImportResult,
  BatchExportResult,
  BatchOperationOptions
} from '../../importexport/types'

/**
 * 导入导出插件配置
 */
export interface ImportExportPluginConfig extends ImportExportConfig {
  /** 是否显示导入导出工具栏 */
  showToolbar?: boolean
  /** 工具栏位置 */
  toolbarPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** 是否启用拖拽导入 */
  enableDragImport?: boolean
  /** 是否启用快捷键 */
  enableShortcuts?: boolean
  /** 自定义按钮配置 */
  customButtons?: CustomButtonConfig[]
}

/**
 * 自定义按钮配置
 */
export interface CustomButtonConfig {
  /** 按钮ID */
  id: string
  /** 按钮文本 */
  text: string
  /** 按钮图标 */
  icon?: string
  /** 支持的格式 */
  format: SupportedFormat
  /** 操作类型 */
  action: 'import' | 'export'
  /** 默认选项 */
  defaultOptions?: ImportOptions | ExportOptions
  /** 点击回调 */
  onClick?: (plugin: ImportExportPlugin) => void
}

/**
 * 导入导出插件
 */
export class ImportExportPlugin extends BasePlugin {
  static pluginName = 'ImportExportPlugin'
  
  private manager: ImportExportManager
  private config: ImportExportPluginConfig
  private toolbarElement?: HTMLElement
  private fileInput?: HTMLInputElement

  constructor(config: ImportExportPluginConfig) {
    super()
    
    this.config = {
      defaultImportOptions: {
        merge: false,
        preserveIds: false,
        validate: true,
        errorHandling: 'lenient'
      },
      defaultExportOptions: {
        scope: 'all',
        includeMetadata: true,
        compress: false
      },
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enabledFormats: ['json', 'drawio', 'bpmn', 'png', 'svg'],
      enableBatchOperations: true,
      showToolbar: true,
      toolbarPosition: 'top',
      enableDragImport: true,
      enableShortcuts: true,
      cache: {
        enabled: true,
        maxSize: 100,
        ttl: 30 * 60 * 1000
      },
      ...config
    }

    this.manager = new ImportExportManager(this.config)
  }

  /**
   * 安装插件
   */
  install(lf: LogicFlow): void {
    super.install(lf)
    
    // 初始化管理器
    this.initializeManager()
    
    // 创建工具栏
    if (this.config.showToolbar) {
      this.createToolbar()
    }
    
    // 设置拖拽导入
    if (this.config.enableDragImport) {
      this.setupDragImport()
    }
    
    // 设置快捷键
    if (this.config.enableShortcuts) {
      this.setupShortcuts()
    }
    
    // 注册API方法
    this.registerApiMethods()
    
    console.log('导入导出插件已安装')
  }

  /**
   * 卸载插件
   */
  uninstall(): void {
    // 移除工具栏
    if (this.toolbarElement) {
      this.toolbarElement.remove()
      this.toolbarElement = undefined
    }
    
    // 移除文件输入
    if (this.fileInput) {
      this.fileInput.remove()
      this.fileInput = undefined
    }
    
    // 移除事件监听器
    this.removeEventListeners()
    
    super.uninstall()
    console.log('导入导出插件已卸载')
  }

  /**
   * 导入文件
   */
  async importFile(file: File, options?: ImportOptions): Promise<ImportResult> {
    try {
      const mergedOptions: ImportOptions = {
        ...this.config.defaultImportOptions,
        ...options
      }

      const result = await this.manager.import(file, mergedOptions)
      
      if (result.success && result.data) {
        // 应用到LogicFlow
        if (mergedOptions.merge) {
          this.mergeData(result.data)
        } else {
          this.replaceData(result.data)
        }
        
        // 触发事件
        this.emit('import:success', result)
      } else {
        this.emit('import:error', result.errors)
      }
      
      return result
    } catch (error) {
      const errorResult: ImportResult = {
        success: false,
        stats: { totalNodes: 0, importedNodes: 0, totalEdges: 0, importedEdges: 0, skippedItems: 0, processingTime: 0 },
        errors: [{ code: 'IMPORT_ERROR', message: error.message }],
        warnings: [],
        timestamp: Date.now()
      }
      
      this.emit('import:error', errorResult.errors)
      return errorResult
    }
  }

  /**
   * 导出数据
   */
  async exportData(format: SupportedFormat, options?: ExportOptions): Promise<ExportResult> {
    try {
      const data = this.getCurrentData(options?.scope)
      
      const mergedOptions: ExportOptions = {
        ...this.config.defaultExportOptions,
        format,
        ...options
      }

      const result = await this.manager.export(data, mergedOptions)
      
      if (result.success && result.data) {
        // 下载文件
        this.downloadFile(result.data, result.filename || `export.${format}`, format)
        
        // 触发事件
        this.emit('export:success', result)
      } else {
        this.emit('export:error', result.errors)
      }
      
      return result
    } catch (error) {
      const errorResult: ExportResult = {
        success: false,
        stats: { exportedNodes: 0, exportedEdges: 0, outputSize: 0, processingTime: 0 },
        errors: [{ code: 'EXPORT_ERROR', message: error.message }],
        warnings: [],
        timestamp: Date.now()
      }
      
      this.emit('export:error', errorResult.errors)
      return errorResult
    }
  }

  /**
   * 批量导入
   */
  async batchImport(
    files: File[],
    options?: ImportOptions,
    batchOptions?: BatchOperationOptions
  ): Promise<BatchImportResult> {
    return await this.manager.batchImport(files, options, batchOptions)
  }

  /**
   * 批量导出
   */
  async batchExport(
    dataList: any[],
    options: ExportOptions,
    batchOptions?: BatchOperationOptions
  ): Promise<BatchExportResult> {
    return await this.manager.batchExport(dataList, options, batchOptions)
  }

  /**
   * 获取支持的格式
   */
  getSupportedFormats() {
    return this.manager.getSupportedFormats()
  }

  /**
   * 检测文件格式
   */
  async detectFormat(file: File): Promise<SupportedFormat | null> {
    return await this.manager.detectFormat(file)
  }

  /**
   * 初始化管理器
   */
  private async initializeManager(): Promise<void> {
    await this.manager.initialize()
    
    // 注册内置解析器和生成器
    this.manager.registerParser(new JsonParser())
    this.manager.registerGenerator(new JsonGenerator())
    this.manager.registerParser(new DrawioParser())
    this.manager.registerGenerator(new DrawioGenerator())
    this.manager.registerParser(new BpmnParser())
    this.manager.registerGenerator(new BpmnGenerator())
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    const container = this.lf?.getContainer()
    if (!container) return

    this.toolbarElement = document.createElement('div')
    this.toolbarElement.className = 'lf-import-export-toolbar'
    this.toolbarElement.style.cssText = this.getToolbarStyles()

    // 创建导入按钮
    const importButton = this.createButton('导入', 'import', () => this.showImportDialog())
    this.toolbarElement.appendChild(importButton)

    // 创建导出按钮组
    const exportGroup = this.createExportButtonGroup()
    this.toolbarElement.appendChild(exportGroup)

    // 创建自定义按钮
    if (this.config.customButtons) {
      this.config.customButtons.forEach(buttonConfig => {
        const button = this.createCustomButton(buttonConfig)
        this.toolbarElement.appendChild(button)
      })
    }

    // 添加到容器
    container.appendChild(this.toolbarElement)
  }

  /**
   * 创建按钮
   */
  private createButton(text: string, className: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button')
    button.textContent = text
    button.className = `lf-import-export-btn lf-${className}-btn`
    button.onclick = onClick
    return button
  }

  /**
   * 创建导出按钮组
   */
  private createExportButtonGroup(): HTMLElement {
    const group = document.createElement('div')
    group.className = 'lf-export-group'

    const formats: SupportedFormat[] = ['json', 'drawio', 'bpmn', 'png', 'svg']
    
    formats.forEach(format => {
      if (this.config.enabledFormats.includes(format)) {
        const button = this.createButton(
          format.toUpperCase(),
          `export-${format}`,
          () => this.exportData(format)
        )
        group.appendChild(button)
      }
    })

    return group
  }

  /**
   * 创建自定义按钮
   */
  private createCustomButton(config: CustomButtonConfig): HTMLElement {
    const button = this.createButton(config.text, config.id, () => {
      if (config.onClick) {
        config.onClick(this)
      } else if (config.action === 'import') {
        this.showImportDialog()
      } else if (config.action === 'export') {
        this.exportData(config.format, config.defaultOptions as ExportOptions)
      }
    })

    if (config.icon) {
      button.innerHTML = `<i class="${config.icon}"></i> ${config.text}`
    }

    return button
  }

  /**
   * 显示导入对话框
   */
  private showImportDialog(): void {
    if (!this.fileInput) {
      this.fileInput = document.createElement('input')
      this.fileInput.type = 'file'
      this.fileInput.accept = this.getAcceptedFileTypes()
      this.fileInput.multiple = this.config.enableBatchOperations
      this.fileInput.style.display = 'none'
      
      this.fileInput.onchange = (event) => {
        const files = (event.target as HTMLInputElement).files
        if (files && files.length > 0) {
          if (files.length === 1) {
            this.importFile(files[0])
          } else {
            this.batchImport(Array.from(files))
          }
        }
      }
      
      document.body.appendChild(this.fileInput)
    }
    
    this.fileInput.click()
  }

  /**
   * 设置拖拽导入
   */
  private setupDragImport(): void {
    const container = this.lf?.getContainer()
    if (!container) return

    container.addEventListener('dragover', (event) => {
      event.preventDefault()
      container.classList.add('lf-drag-over')
    })

    container.addEventListener('dragleave', (event) => {
      event.preventDefault()
      container.classList.remove('lf-drag-over')
    })

    container.addEventListener('drop', async (event) => {
      event.preventDefault()
      container.classList.remove('lf-drag-over')

      const files = Array.from(event.dataTransfer?.files || [])
      if (files.length > 0) {
        if (files.length === 1) {
          await this.importFile(files[0])
        } else {
          await this.batchImport(files)
        }
      }
    })
  }

  /**
   * 设置快捷键
   */
  private setupShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'o':
            event.preventDefault()
            this.showImportDialog()
            break
          case 's':
            event.preventDefault()
            this.exportData('json')
            break
          case 'e':
            if (event.shiftKey) {
              event.preventDefault()
              this.exportData('png')
            }
            break
        }
      }
    })
  }

  /**
   * 注册API方法
   */
  private registerApiMethods(): void {
    if (!this.lf) return

    // 扩展LogicFlow实例的方法
    Object.assign(this.lf, {
      importFile: this.importFile.bind(this),
      exportData: this.exportData.bind(this),
      batchImport: this.batchImport.bind(this),
      batchExport: this.batchExport.bind(this),
      getSupportedFormats: this.getSupportedFormats.bind(this),
      detectFormat: this.detectFormat.bind(this)
    })
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    // 这里可以移除之前添加的事件监听器
  }

  /**
   * 合并数据到当前流程图
   */
  private mergeData(data: any): void {
    if (!this.lf || !data) return

    // 获取当前数据
    const currentData = this.lf.getGraphData()
    
    // 合并节点
    const allNodes = [...currentData.nodes, ...data.nodes]
    
    // 合并边
    const allEdges = [...currentData.edges, ...data.edges]
    
    // 应用合并后的数据
    this.lf.render({
      nodes: allNodes,
      edges: allEdges
    })
  }

  /**
   * 替换当前数据
   */
  private replaceData(data: any): void {
    if (!this.lf || !data) return
    
    this.lf.render(data)
  }

  /**
   * 获取当前数据
   */
  private getCurrentData(scope?: 'all' | 'selected' | 'visible'): any {
    if (!this.lf) return { nodes: [], edges: [] }

    switch (scope) {
      case 'selected':
        return this.getSelectedData()
      case 'visible':
        return this.getVisibleData()
      default:
        return this.lf.getGraphData()
    }
  }

  /**
   * 获取选中的数据
   */
  private getSelectedData(): any {
    if (!this.lf) return { nodes: [], edges: [] }

    const selectedElements = this.lf.getSelectElements()
    return {
      nodes: selectedElements.nodes || [],
      edges: selectedElements.edges || []
    }
  }

  /**
   * 获取可见的数据
   */
  private getVisibleData(): any {
    // 这里应该根据视口范围过滤数据
    // 暂时返回所有数据
    return this.getCurrentData('all')
  }

  /**
   * 下载文件
   */
  private downloadFile(data: string | Blob | ArrayBuffer, filename: string, format: SupportedFormat): void {
    let blob: Blob

    if (data instanceof Blob) {
      blob = data
    } else if (data instanceof ArrayBuffer) {
      blob = new Blob([data])
    } else {
      blob = new Blob([data], { type: this.getMimeType(format) })
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * 获取MIME类型
   */
  private getMimeType(format: SupportedFormat): string {
    const mimeTypes: Record<SupportedFormat, string> = {
      json: 'application/json',
      visio: 'application/vnd.visio',
      drawio: 'application/xml',
      bpmn: 'application/xml',
      png: 'image/png',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      xml: 'application/xml',
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }

    return mimeTypes[format] || 'application/octet-stream'
  }

  /**
   * 获取接受的文件类型
   */
  private getAcceptedFileTypes(): string {
    const extensions: string[] = []
    
    this.config.enabledFormats.forEach(format => {
      const formatInfo = this.manager.getSupportedFormats().find(f => f.format === format)
      if (formatInfo) {
        extensions.push(...formatInfo.extensions)
      }
    })

    return extensions.join(',')
  }

  /**
   * 获取工具栏样式
   */
  private getToolbarStyles(): string {
    const position = this.config.toolbarPosition || 'top'
    
    const baseStyles = `
      position: absolute;
      z-index: 1000;
      display: flex;
      gap: 8px;
      padding: 8px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `

    const positionStyles = {
      top: 'top: 10px; left: 10px;',
      bottom: 'bottom: 10px; left: 10px;',
      left: 'top: 50%; left: 10px; transform: translateY(-50%); flex-direction: column;',
      right: 'top: 50%; right: 10px; transform: translateY(-50%); flex-direction: column;'
    }

    return baseStyles + positionStyles[position]
  }
}

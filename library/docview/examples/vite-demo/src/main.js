// 导入样式
import './styles/main.css'

// 导入模拟的 docview 库 (在实际项目中应该从 @ldesign/docview 导入)
import { DocumentViewer } from './mock-docview.js'

// 应用状态
class AppState {
  constructor() {
    this.viewer = null
    this.currentFile = null
    this.documentInfo = null
    this.isEditable = false
    this.showToolbar = true
  }
}

// 应用主类
class DocViewApp {
  constructor() {
    this.state = new AppState()
    this.initializeElements()
    this.bindEvents()
    this.showToast('应用已启动，请选择文档进行预览', 'success')
  }

  // 初始化 DOM 元素引用
  initializeElements() {
    // 文件相关
    this.fileInput = document.getElementById('fileInput')
    this.selectFileBtn = document.getElementById('selectFileBtn')
    this.fileName = document.getElementById('fileName')
    
    // 示例文件按钮
    this.loadWordDemo = document.getElementById('loadWordDemo')
    this.loadExcelDemo = document.getElementById('loadExcelDemo')
    this.loadPptDemo = document.getElementById('loadPptDemo')
    
    // 选项
    this.editableCheckbox = document.getElementById('editableCheckbox')
    this.toolbarCheckbox = document.getElementById('toolbarCheckbox')
    
    // 操作按钮
    this.saveBtn = document.getElementById('saveBtn')
    this.downloadBtn = document.getElementById('downloadBtn')
    this.printBtn = document.getElementById('printBtn')
    this.retryBtn = document.getElementById('retryBtn')
    
    // 容器和覆盖层
    this.documentViewer = document.getElementById('documentViewer')
    this.loadingOverlay = document.getElementById('loadingOverlay')
    this.errorOverlay = document.getElementById('errorOverlay')
    this.errorMessage = document.getElementById('errorMessage')
    
    // 信息面板
    this.infoPanel = document.getElementById('infoPanel')
    this.docType = document.getElementById('docType')
    this.docName = document.getElementById('docName')
    this.docSize = document.getElementById('docSize')
    this.docPages = document.getElementById('docPages')
    this.docModified = document.getElementById('docModified')
    this.docStatus = document.getElementById('docStatus')
    
    // Toast
    this.toast = document.getElementById('toast')
    this.toastMessage = document.getElementById('toastMessage')
    this.toastClose = document.getElementById('toastClose')
  }

  // 绑定事件
  bindEvents() {
    // 文件选择
    this.selectFileBtn.addEventListener('click', () => this.fileInput.click())
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e))
    
    // 示例文件
    this.loadWordDemo.addEventListener('click', () => this.loadDemoFile('word'))
    this.loadExcelDemo.addEventListener('click', () => this.loadDemoFile('excel'))
    this.loadPptDemo.addEventListener('click', () => this.loadDemoFile('ppt'))
    
    // 选项变化
    this.editableCheckbox.addEventListener('change', (e) => this.handleEditableChange(e))
    this.toolbarCheckbox.addEventListener('change', (e) => this.handleToolbarChange(e))
    
    // 操作按钮
    this.saveBtn.addEventListener('click', () => this.handleSave())
    this.downloadBtn.addEventListener('click', () => this.handleDownload())
    this.printBtn.addEventListener('click', () => this.handlePrint())
    this.retryBtn.addEventListener('click', () => this.handleRetry())
    
    // Toast 关闭
    this.toastClose.addEventListener('click', () => this.hideToast())
    
    // 拖拽上传
    this.setupDragAndDrop()
  }

  // 设置拖拽上传
  setupDragAndDrop() {
    const dropZone = this.documentViewer

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault()
      dropZone.classList.add('drag-over')
    })

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault()
      dropZone.classList.remove('drag-over')
    })

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault()
      dropZone.classList.remove('drag-over')
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.loadFile(files[0])
      }
    })
  }

  // 处理文件选择
  handleFileSelect(event) {
    const file = event.target.files[0]
    if (file) {
      this.loadFile(file)
    }
  }

  // 加载文件
  async loadFile(file) {
    try {
      this.state.currentFile = file
      this.fileName.textContent = file.name
      this.showLoading()
      this.updateStatus('loading', '加载中...')

      // 创建或重新创建查看器
      if (this.state.viewer) {
        this.state.viewer.destroy()
      }

      this.state.viewer = new DocumentViewer({
        container: this.documentViewer,
        editable: this.state.isEditable,
        toolbar: {
          show: this.state.showToolbar,
          position: 'top'
        },
        theme: {
          primaryColor: '#007bff',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          borderColor: '#dee2e6'
        },
        callbacks: {
          onLoad: (info) => this.handleDocumentLoad(info),
          onError: (error) => this.handleDocumentError(error),
          onChange: (content) => this.handleDocumentChange(content),
          onSave: (content) => this.handleDocumentSave(content)
        }
      })

      await this.state.viewer.loadDocument(file)

    } catch (error) {
      this.handleDocumentError(error)
    }
  }

  // 加载示例文件
  async loadDemoFile(type) {
    try {
      this.showToast(`正在加载 ${type.toUpperCase()} 示例文件...`, 'info')
      
      // 创建模拟文件数据
      const demoData = this.createDemoData(type)
      await this.loadFile(demoData)
      
    } catch (error) {
      this.showToast('加载示例文件失败: ' + error.message, 'error')
    }
  }

  // 创建示例数据
  createDemoData(type) {
    const demoContent = {
      word: this.createWordDemo(),
      excel: this.createExcelDemo(),
      ppt: this.createPptDemo()
    }

    const extensions = {
      word: '.docx',
      excel: '.xlsx',
      ppt: '.pptx'
    }

    const mimeTypes = {
      word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }

    const content = demoContent[type]
    const blob = new Blob([content], { type: mimeTypes[type] })
    
    // 创建 File 对象
    const file = new File([blob], `示例文档${extensions[type]}`, {
      type: mimeTypes[type],
      lastModified: Date.now()
    })

    return file
  }

  // 创建 Word 示例内容
  createWordDemo() {
    return `
      <h1>Word 文档示例</h1>
      <p>这是一个 Word 文档的示例内容。</p>
      <h2>功能特性</h2>
      <ul>
        <li>支持文本格式化</li>
        <li>支持表格显示</li>
        <li>支持图片显示</li>
        <li>支持基础编辑</li>
      </ul>
      <h2>表格示例</h2>
      <table border="1">
        <tr>
          <th>姓名</th>
          <th>年龄</th>
          <th>职业</th>
        </tr>
        <tr>
          <td>张三</td>
          <td>25</td>
          <td>工程师</td>
        </tr>
        <tr>
          <td>李四</td>
          <td>30</td>
          <td>设计师</td>
        </tr>
      </table>
      <p><strong>注意:</strong> 这是一个模拟的 Word 文档内容，用于演示文档查看器的功能。</p>
    `
  }

  // 创建 Excel 示例内容
  createExcelDemo() {
    // 这里返回一个简单的 CSV 格式数据，实际应该是 Excel 格式
    return `姓名,年龄,职业,薪资
张三,25,工程师,8000
李四,30,设计师,7500
王五,28,产品经理,9000
赵六,32,项目经理,10000`
  }

  // 创建 PPT 示例内容
  createPptDemo() {
    return `
      <div class="slide">
        <h1>PowerPoint 演示文稿示例</h1>
        <p>欢迎使用 LDesign DocView</p>
      </div>
      <div class="slide">
        <h2>主要功能</h2>
        <ul>
          <li>文档预览</li>
          <li>在线编辑</li>
          <li>多格式支持</li>
          <li>响应式设计</li>
        </ul>
      </div>
      <div class="slide">
        <h2>技术特性</h2>
        <p>基于现代 Web 技术构建</p>
        <p>支持 TypeScript</p>
        <p>框架无关设计</p>
      </div>
    `
  }

  // 文档加载成功处理
  handleDocumentLoad(info) {
    this.state.documentInfo = info
    this.hideLoading()
    this.updateDocumentInfo(info)
    this.enableActions()
    this.updateStatus('ready', '就绪')
    this.showToast('文档加载成功', 'success')
  }

  // 文档加载错误处理
  handleDocumentError(error) {
    console.error('文档加载错误:', error)
    this.hideLoading()
    this.showError(error.message)
    this.updateStatus('error', '加载失败')
    this.showToast('文档加载失败: ' + error.message, 'error')
  }

  // 文档内容变化处理
  handleDocumentChange(content) {
    console.log('文档内容变化:', content)
    this.showToast('文档内容已修改', 'info')
  }

  // 文档保存处理
  handleDocumentSave(content) {
    console.log('文档保存:', content)
    this.showToast('文档已保存', 'success')
  }

  // 处理编辑模式变化
  handleEditableChange(event) {
    this.state.isEditable = event.target.checked
    if (this.state.viewer) {
      this.state.viewer.setEditable(this.state.isEditable)
    }
    this.showToast(`编辑模式已${this.state.isEditable ? '启用' : '禁用'}`, 'info')
  }

  // 处理工具栏显示变化
  handleToolbarChange(event) {
    this.state.showToolbar = event.target.checked
    // 重新加载文档以应用工具栏设置
    if (this.state.currentFile) {
      this.loadFile(this.state.currentFile)
    }
  }

  // 处理保存
  async handleSave() {
    try {
      if (!this.state.viewer) return
      
      const content = this.state.viewer.getContent()
      if (content) {
        // 这里可以实现保存到服务器的逻辑
        console.log('保存内容:', content)
        this.showToast('文档已保存到本地', 'success')
      }
    } catch (error) {
      this.showToast('保存失败: ' + error.message, 'error')
    }
  }

  // 处理下载
  async handleDownload() {
    try {
      if (!this.state.viewer) return
      
      const blob = await this.state.viewer.save()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = this.state.documentInfo?.name || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      this.showToast('文档下载完成', 'success')
    } catch (error) {
      this.showToast('下载失败: ' + error.message, 'error')
    }
  }

  // 处理打印
  handlePrint() {
    try {
      if (!this.state.viewer) return
      
      const content = this.state.viewer.getContent()
      if (content?.html) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>打印文档</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  @media print { body { margin: 0; } }
                  table { border-collapse: collapse; width: 100%; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                </style>
              </head>
              <body>${content.html}</body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
          this.showToast('打印任务已发送', 'success')
        }
      }
    } catch (error) {
      this.showToast('打印失败: ' + error.message, 'error')
    }
  }

  // 处理重试
  handleRetry() {
    if (this.state.currentFile) {
      this.loadFile(this.state.currentFile)
    }
  }

  // 显示加载状态
  showLoading() {
    this.loadingOverlay.classList.remove('hidden')
    this.errorOverlay.classList.add('hidden')
  }

  // 隐藏加载状态
  hideLoading() {
    this.loadingOverlay.classList.add('hidden')
  }

  // 显示错误
  showError(message) {
    this.errorMessage.textContent = message
    this.errorOverlay.classList.remove('hidden')
    this.loadingOverlay.classList.add('hidden')
  }

  // 更新文档信息
  updateDocumentInfo(info) {
    this.docType.textContent = this.getDocumentTypeName(info.type)
    this.docName.textContent = info.name
    this.docSize.textContent = this.formatFileSize(info.size)
    this.docPages.textContent = info.pageCount || '-'
    this.docModified.textContent = info.lastModified.toLocaleString()
    this.infoPanel.classList.remove('hidden')
  }

  // 启用操作按钮
  enableActions() {
    this.saveBtn.disabled = false
    this.downloadBtn.disabled = false
    this.printBtn.disabled = false
  }

  // 更新状态
  updateStatus(type, text) {
    this.docStatus.textContent = text
    this.docStatus.className = `value status-${type}`
  }

  // 显示 Toast
  showToast(message, type = 'info') {
    this.toastMessage.textContent = message
    this.toast.className = `toast ${type}`
    this.toast.classList.remove('hidden')
    
    // 3秒后自动隐藏
    setTimeout(() => this.hideToast(), 3000)
  }

  // 隐藏 Toast
  hideToast() {
    this.toast.classList.add('hidden')
  }

  // 获取文档类型名称
  getDocumentTypeName(type) {
    const typeMap = {
      word: 'Word 文档',
      excel: 'Excel 表格',
      powerpoint: 'PowerPoint 演示文稿'
    }
    return typeMap[type] || type
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
  new DocViewApp()
})

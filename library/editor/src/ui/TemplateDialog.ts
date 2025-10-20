/**
 * 模板选择器对话框
 */

import type { Template, TemplateCategory } from '../template/types'
import { TemplateManager } from '../template/TemplateManager'

export class TemplateDialog {
  private container: HTMLElement
  private templateManager: TemplateManager
  private onSelect?: (template: Template) => void
  private selectedCategory: TemplateCategory | 'all' = 'all'
  private searchQuery: string = ''

  constructor(templateManager: TemplateManager) {
    this.templateManager = templateManager
    this.container = this.createDialog()
  }

  /**
   * 显示对话框
   */
  show(onSelect?: (template: Template) => void): void {
    this.onSelect = onSelect
    document.body.appendChild(this.container)
    this.loadTemplates()
  }

  /**
   * 隐藏对话框
   */
  hide(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }

  /**
   * 创建对话框结构
   */
  private createDialog(): HTMLElement {
    const dialog = document.createElement('div')
    dialog.className = 'template-dialog-overlay'
    dialog.innerHTML = `
      <div class="template-dialog">
        <div class="template-dialog-header">
          <h2>选择模板</h2>
          <button class="template-dialog-close" aria-label="关闭">×</button>
        </div>
        
        <div class="template-dialog-toolbar">
          <div class="template-search">
            <input type="text" placeholder="搜索模板..." class="template-search-input">
          </div>
          <div class="template-categories">
            <button class="category-btn active" data-category="all">全部</button>
            <button class="category-btn" data-category="business">商务</button>
            <button class="category-btn" data-category="personal">个人</button>
            <button class="category-btn" data-category="creative">创意</button>
            <button class="category-btn" data-category="education">教育</button>
            <button class="category-btn" data-category="technical">技术</button>
            <button class="category-btn" data-category="custom">自定义</button>
          </div>
        </div>
        
        <div class="template-dialog-content">
          <div class="template-grid"></div>
        </div>
        
        <div class="template-dialog-footer">
          <button class="btn-secondary" id="import-template">导入模板</button>
          <button class="btn-secondary" id="create-from-current">从当前内容创建</button>
          <button class="btn-primary" id="manage-templates">管理模板</button>
        </div>
      </div>
    `

    // 添加样式
    this.addStyles()

    // 绑定事件
    this.bindEvents(dialog)

    return dialog
  }

  /**
   * 绑定事件
   */
  private bindEvents(dialog: HTMLElement): void {
    // 关闭按钮
    const closeBtn = dialog.querySelector('.template-dialog-close')
    closeBtn?.addEventListener('click', () => this.hide())

    // 点击遮罩层关闭
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        this.hide()
      }
    })

    // 搜索
    const searchInput = dialog.querySelector('.template-search-input') as HTMLInputElement
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value
      this.loadTemplates()
    })

    // 分类切换
    const categoryBtns = dialog.querySelectorAll('.category-btn')
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        categoryBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        this.selectedCategory = (btn as HTMLElement).dataset.category as any
        this.loadTemplates()
      })
    })

    // 导入模板
    const importBtn = dialog.querySelector('#import-template')
    importBtn?.addEventListener('click', () => this.handleImport())

    // 从当前内容创建
    const createBtn = dialog.querySelector('#create-from-current')
    createBtn?.addEventListener('click', () => this.handleCreateFromCurrent())

    // 管理模板
    const manageBtn = dialog.querySelector('#manage-templates')
    manageBtn?.addEventListener('click', () => this.showManageDialog())
  }

  /**
   * 加载模板列表
   */
  private async loadTemplates(): Promise<void> {
    const grid = this.container.querySelector('.template-grid')
    if (!grid) return

    grid.innerHTML = '<div class="loading">加载中...</div>'

    try {
      let templates: Template[] = []

      if (this.searchQuery) {
        templates = await this.templateManager.searchTemplates(this.searchQuery)
      } else if (this.selectedCategory === 'all') {
        templates = await this.templateManager.getAllTemplates()
      } else {
        templates = await this.templateManager.getTemplatesByCategory(this.selectedCategory as TemplateCategory)
      }

      if (templates.length === 0) {
        grid.innerHTML = '<div class="empty-state">没有找到模板</div>'
        return
      }

      grid.innerHTML = templates.map(template => this.renderTemplateCard(template)).join('')

      // 绑定模板卡片点击事件
      grid.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
          const templateId = (card as HTMLElement).dataset.templateId
          if (templateId) {
            this.selectTemplate(templateId)
          }
        })
      })
    } catch (error) {
      console.error('Failed to load templates:', error)
      grid.innerHTML = '<div class="error">加载模板失败</div>'
    }
  }

  /**
   * 渲染模板卡片
   */
  private renderTemplateCard(template: Template): string {
    const { metadata } = template
    const icon = this.getTemplateIcon(metadata.category)
    const badges = [
      metadata.isBuiltin ? '<span class="badge badge-builtin">内置</span>' : '',
      metadata.isCustom ? '<span class="badge badge-custom">自定义</span>' : ''
    ].filter(Boolean).join('')

    return `
      <div class="template-card" data-template-id="${metadata.id}">
        <div class="template-icon">${icon}</div>
        <h3 class="template-name">${metadata.name}</h3>
        <p class="template-desc">${metadata.description || '无描述'}</p>
        <div class="template-meta">
          ${badges}
          ${metadata.tags ? metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
        </div>
      </div>
    `
  }

  /**
   * 获取模板图标
   */
  private getTemplateIcon(category: TemplateCategory): string {
    const icons: Record<TemplateCategory, string> = {
      [TemplateCategory.BUSINESS]: '📊',
      [TemplateCategory.PERSONAL]: '👤',
      [TemplateCategory.CREATIVE]: '🎨',
      [TemplateCategory.EDUCATION]: '📚',
      [TemplateCategory.TECHNICAL]: '💻',
      [TemplateCategory.CUSTOM]: '⚙️'
    }
    return icons[category] || '📄'
  }

  /**
   * 选择模板
   */
  private async selectTemplate(templateId: string): Promise<void> {
    const template = await this.templateManager.getTemplate(templateId)
    if (template) {
      if (template.variables && template.variables.length > 0) {
        // 如果有变量，显示变量填充对话框
        this.showVariableDialog(template)
      } else {
        // 直接应用模板
        this.applyTemplate(template)
      }
    }
  }

  /**
   * 显示变量填充对话框
   */
  private showVariableDialog(template: Template): void {
    const dialog = document.createElement('div')
    dialog.className = 'variable-dialog-overlay'
    
    const variableInputs = template.variables?.map(v => `
      <div class="variable-input-group">
        <label for="${v.key}">
          ${v.label}
          ${v.required ? '<span class="required">*</span>' : ''}
        </label>
        ${this.renderVariableInput(v)}
      </div>
    `).join('') || ''

    dialog.innerHTML = `
      <div class="variable-dialog">
        <div class="variable-dialog-header">
          <h3>填充模板变量 - ${template.metadata.name}</h3>
          <button class="close-btn">×</button>
        </div>
        <div class="variable-dialog-content">
          ${variableInputs}
        </div>
        <div class="variable-dialog-footer">
          <button class="btn-secondary cancel-btn">取消</button>
          <button class="btn-primary apply-btn">应用模板</button>
        </div>
      </div>
    `

    document.body.appendChild(dialog)

    // 绑定事件
    dialog.querySelector('.close-btn')?.addEventListener('click', () => {
      document.body.removeChild(dialog)
    })

    dialog.querySelector('.cancel-btn')?.addEventListener('click', () => {
      document.body.removeChild(dialog)
    })

    dialog.querySelector('.apply-btn')?.addEventListener('click', () => {
      const variables: Record<string, any> = {}
      
      template.variables?.forEach(v => {
        const input = dialog.querySelector(`[name="${v.key}"]`) as HTMLInputElement
        if (input) {
          variables[v.key] = input.value || v.defaultValue || ''
        }
      })

      document.body.removeChild(dialog)
      this.applyTemplate(template, variables)
    })
  }

  /**
   * 渲染变量输入控件
   */
  private renderVariableInput(variable: any): string {
    switch (variable.type) {
      case 'text':
        return `<input type="text" name="${variable.key}" value="${variable.defaultValue || ''}" />`
      case 'date':
        return `<input type="date" name="${variable.key}" value="${variable.defaultValue || ''}" />`
      case 'select':
        const options = variable.options?.map((opt: any) => 
          `<option value="${opt.value}">${opt.label}</option>`
        ).join('') || ''
        return `<select name="${variable.key}">${options}</select>`
      case 'boolean':
        return `<input type="checkbox" name="${variable.key}" ${variable.defaultValue ? 'checked' : ''} />`
      default:
        return `<input type="text" name="${variable.key}" value="${variable.defaultValue || ''}" />`
    }
  }

  /**
   * 应用模板
   */
  private applyTemplate(template: Template, variables?: Record<string, any>): void {
    if (this.onSelect) {
      this.onSelect(template)
    }
    this.hide()
  }

  /**
   * 处理导入
   */
  private handleImport(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const jsonStr = event.target?.result as string
            await this.templateManager.importTemplate(jsonStr)
            alert('模板导入成功！')
            this.loadTemplates()
          } catch (error) {
            alert('模板导入失败：' + error)
          }
        }
        reader.readAsText(file)
      }
    })
    
    input.click()
  }

  /**
   * 从当前内容创建模板
   */
  private handleCreateFromCurrent(): void {
    // 这个功能需要访问编辑器实例，将在插件中实现
    this.hide()
    if ((window as any).editor) {
      // 触发创建模板事件
      (window as any).editor.emit('template:create-from-content')
    }
  }

  /**
   * 显示模板管理对话框
   */
  private showManageDialog(): void {
    const overlay = document.createElement('div')
    overlay.className = 'template-manage-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `
    
    const dialog = document.createElement('div')
    dialog.className = 'template-manage-dialog'
    dialog.style.cssText = `
      background: white;
      border-radius: 8px;
      width: 700px;
      max-height: 600px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    `
    
    // 头部
    const header = document.createElement('div')
    header.className = 'dialog-header'
    header.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `
    header.innerHTML = `
      <h2 style="margin: 0; font-size: 18px;">模板管理</h2>
      <button class="close-btn" style="border: none; background: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
    `
    
    // 内容区域
    const content = document.createElement('div')
    content.className = 'dialog-content'
    content.style.cssText = `
      padding: 20px;
      flex: 1;
      overflow-y: auto;
    `
    
    // 模板列表
    const templates = this.templateManager.getTemplates()
    
    templates.forEach(template => {
      const item = document.createElement('div')
      item.className = 'template-item'
      item.style.cssText = `
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `
      
      const info = document.createElement('div')
      info.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">${template.name}</div>
        <div style="font-size: 12px; color: #666;">${template.category}</div>
      `
      
      const actions = document.createElement('div')
      actions.style.cssText = 'display: flex; gap: 8px;'
      
      // 编辑按钮
      const editBtn = document.createElement('button')
      editBtn.textContent = '编辑'
      editBtn.style.cssText = `
        padding: 6px 12px;
        border: 1px solid #3b82f6;
        background: white;
        color: #3b82f6;
        border-radius: 4px;
        cursor: pointer;
      `
      editBtn.addEventListener('click', () => {
        this.showEditTemplateDialog(template)
      })
      
      // 删除按钮
      const deleteBtn = document.createElement('button')
      deleteBtn.textContent = '删除'
      deleteBtn.style.cssText = `
        padding: 6px 12px;
        border: 1px solid #ef4444;
        background: white;
        color: #ef4444;
        border-radius: 4px;
        cursor: pointer;
      `
      deleteBtn.addEventListener('click', () => {
        if (confirm(`确定要删除模板 "${template.name}" 吗？`)) {
          this.templateManager.deleteTemplate(template.id)
          item.remove()
        }
      })
      
      actions.appendChild(editBtn)
      actions.appendChild(deleteBtn)
      
      item.appendChild(info)
      item.appendChild(actions)
      content.appendChild(item)
    })
    
    // 底部按钮
    const footer = document.createElement('div')
    footer.style.cssText = `
      padding: 16px 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
    `
    
    const addBtn = document.createElement('button')
    addBtn.textContent = '+ 新建模板'
    addBtn.style.cssText = `
      padding: 8px 16px;
      border: none;
      background: #3b82f6;
      color: white;
      border-radius: 6px;
      cursor: pointer;
    `
    addBtn.addEventListener('click', () => {
      this.showCreateTemplateDialog()
    })
    
    const closeBtn = document.createElement('button')
    closeBtn.textContent = '关闭'
    closeBtn.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      background: white;
      color: #374151;
      border-radius: 6px;
      cursor: pointer;
    `
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay)
    })
    
    footer.appendChild(addBtn)
    footer.appendChild(closeBtn)
    
    dialog.appendChild(header)
    dialog.appendChild(content)
    dialog.appendChild(footer)
    overlay.appendChild(dialog)
    
    // 关闭按钮事件
    header.querySelector('.close-btn')?.addEventListener('click', () => {
      document.body.removeChild(overlay)
    })
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay)
      }
    })
    
    document.body.appendChild(overlay)
  }
  
  /**
   * 显示创建模板对话框
   */
  private showCreateTemplateDialog(): void {
    // 简化实现，实际应该有完整的表单
    const name = prompt('请输入模板名称:')
    if (!name) return
    
    const content = prompt('请输入模板内容:')
    if (!content) return
    
    this.templateManager.saveTemplate({
      id: `custom-${Date.now()}`,
      name,
      content,
      category: 'custom'
    })
    
    alert('模板已创建！')
  }
  
  /**
   * 显示编辑模板对话框
   */
  private showEditTemplateDialog(template: any): void {
    const name = prompt('请输入模板名称:', template.name)
    if (!name) return
    
    const content = prompt('请输入模板内容:', template.content)
    if (!content) return
    
    this.templateManager.saveTemplate({
      ...template,
      name,
      content
    })
    
    alert('模板已更新！')
  }

  /**
   * 添加样式
   */
  private addStyles(): void {
    if (document.getElementById('template-dialog-styles')) return

    const style = document.createElement('style')
    style.id = 'template-dialog-styles'
    style.textContent = `
      .template-dialog-overlay,
      .variable-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }

      .template-dialog,
      .variable-dialog {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 900px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .template-dialog-header,
      .variable-dialog-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .template-dialog-header h2,
      .variable-dialog-header h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }

      .template-dialog-close,
      .close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .template-dialog-close:hover,
      .close-btn:hover {
        color: #333;
      }

      .template-dialog-toolbar {
        padding: 15px 20px;
        border-bottom: 1px solid #e0e0e0;
      }

      .template-search {
        margin-bottom: 15px;
      }

      .template-search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .template-categories {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .category-btn {
        padding: 6px 12px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .category-btn:hover {
        background: #f5f5f5;
      }

      .category-btn.active {
        background: #3498db;
        color: white;
        border-color: #3498db;
      }

      .template-dialog-content,
      .variable-dialog-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }

      .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }

      .template-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }

      .template-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .template-icon {
        font-size: 36px;
        margin-bottom: 12px;
      }

      .template-name {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #333;
      }

      .template-desc {
        font-size: 14px;
        color: #666;
        margin: 0 0 12px 0;
        line-height: 1.4;
      }

      .template-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
      }

      .badge-builtin {
        background: #e3f2fd;
        color: #1976d2;
      }

      .badge-custom {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .tag {
        font-size: 12px;
        padding: 2px 8px;
        background: #f5f5f5;
        color: #666;
        border-radius: 4px;
      }

      .template-dialog-footer,
      .variable-dialog-footer {
        padding: 15px 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .variable-dialog-footer {
        justify-content: flex-end;
        gap: 10px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #3498db;
        color: white;
      }

      .btn-primary:hover {
        background: #2980b9;
      }

      .btn-secondary {
        background: white;
        color: #333;
        border: 1px solid #ddd;
      }

      .btn-secondary:hover {
        background: #f5f5f5;
      }

      .variable-input-group {
        margin-bottom: 15px;
      }

      .variable-input-group label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        color: #333;
      }

      .variable-input-group input,
      .variable-input-group select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .required {
        color: #e74c3c;
      }

      .loading,
      .empty-state,
      .error {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      .error {
        color: #e74c3c;
      }
    `
    document.head.appendChild(style)
  }
}

/**
 * 显示模板选择对话框
 */
export function showTemplateDialog(
  templateManager: TemplateManager,
  onSelect?: (template: Template) => void
): TemplateDialog {
  const dialog = new TemplateDialog(templateManager)
  dialog.show(onSelect)
  return dialog
}
/**
 * 物料仓库管理面板
 * 
 * 提供物料仓库的管理界面，包括物料的增删改查、分类管理、导入导出等功能
 */

import type { CustomMaterial, MaterialCategory, MaterialRepository } from '../../types'
import { MaterialRepositoryManager } from '../../materials/MaterialRepositoryManager'
import { MaterialEditor } from './MaterialEditor'
import { getToolbarIcon } from '../../utils/icons'

export interface MaterialRepositoryPanelConfig {
  container: HTMLElement
  repositoryManager: MaterialRepositoryManager
  onMaterialSelect?: (material: CustomMaterial) => void
  onClose?: () => void
}

/**
 * 物料仓库管理面板类
 */
export class MaterialRepositoryPanel {
  private container: HTMLElement
  private config: MaterialRepositoryPanelConfig
  private repositoryManager: MaterialRepositoryManager
  private panelElement: HTMLElement | null = null
  private materialEditor: MaterialEditor | null = null
  private currentCategory: string = 'all'

  constructor(config: MaterialRepositoryPanelConfig) {
    this.container = config.container
    this.config = config
    this.repositoryManager = config.repositoryManager
    this.init()
  }

  /**
   * 初始化面板
   */
  private init(): void {
    this.addStyles()
    this.createPanel()
    this.bindEvents()
    this.loadMaterials()
  }

  /**
   * 添加样式
   */
  private addStyles(): void {
    const styleId = 'ldesign-material-repository-panel-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .ldesign-material-repository-panel {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .repository-panel-content {
        width: 90%;
        max-width: 1200px;
        height: 85%;
        max-height: 900px;
        background: var(--ldesign-bg-color-container, #ffffff);
        border-radius: var(--ls-border-radius-xl, 16px);
        box-shadow: var(--ldesign-shadow-3, 0 8px 30px rgba(0, 0, 0, 0.12));
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .repository-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--ls-padding-lg, 28px) var(--ls-padding-base, 20px);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        background: linear-gradient(135deg, var(--ldesign-brand-color-1, #f1ecf9) 0%, var(--ldesign-bg-color-component, #fafafa) 100%);
        position: relative;
      }

      .repository-panel-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--ldesign-brand-color, #722ED1), var(--ldesign-brand-color-6, #7334cb));
      }

      .repository-panel-header h2 {
        margin: 0;
        font-size: var(--ls-font-size-xl, 24px);
        font-weight: 700;
        color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .repository-panel-header h2::before {
        content: '';
        width: 6px;
        height: 24px;
        background: var(--ldesign-brand-color, #722ED1);
        border-radius: 3px;
      }

      .repository-panel-actions {
        display: flex;
        gap: var(--ls-spacing-sm, 12px);
      }

      .repository-panel-actions button {
        padding: var(--ls-padding-sm, 12px) var(--ls-padding-base, 20px);
        border: 2px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: var(--ls-border-radius-base, 6px);
        background: var(--ldesign-bg-color-container, #ffffff);
        cursor: pointer;
        font-size: var(--ls-font-size-sm, 16px);
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .repository-panel-actions button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      .repository-panel-actions button:hover::before {
        left: 100%;
      }

      .repository-panel-actions button:hover {
        background: var(--ldesign-bg-color-container-hover, #fafafa);
        border-color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-1px);
        box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
      }

      .btn-primary {
        background: var(--ldesign-brand-color, #722ED1) !important;
        color: white !important;
        border-color: var(--ldesign-brand-color, #722ED1) !important;
      }

      .btn-primary:hover {
        background: var(--ldesign-brand-color-hover, #5e2aa7) !important;
        border-color: var(--ldesign-brand-color-hover, #5e2aa7) !important;
        transform: translateY(-2px);
        box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
      }

      .repository-panel-body {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .repository-sidebar {
        width: 250px;
        border-right: 1px solid var(--ldesign-border-color, #e5e5e5);
        background: var(--ldesign-bg-color-component, #fafafa);
        display: flex;
        flex-direction: column;
      }

      .sidebar-section {
        padding: var(--ls-padding-base, 20px);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
      }

      .sidebar-section h3 {
        margin: 0 0 var(--ls-margin-sm, 12px) 0;
        font-size: var(--ls-font-size-base, 18px);
        color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
      }

      .category-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .category-item {
        padding: var(--ls-padding-xs, 6px) var(--ls-padding-sm, 12px);
        margin-bottom: var(--ls-margin-xs, 6px);
        border-radius: var(--ls-border-radius-sm, 3px);
        cursor: pointer;
        transition: background-color 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .category-item:hover {
        background: var(--ldesign-bg-color-container-hover, #fafafa);
      }

      .category-item.active {
        background: var(--ldesign-brand-color, #722ED1);
        color: white;
      }

      .category-count {
        font-size: var(--ls-font-size-xs, 14px);
        opacity: 0.7;
      }

      .repository-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .materials-toolbar {
        padding: var(--ls-padding-base, 20px);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .search-box {
        flex: 1;
        max-width: 300px;
        padding: var(--ls-padding-xs, 6px) var(--ls-padding-sm, 12px);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: var(--ls-border-radius-sm, 3px);
        font-size: var(--ls-font-size-sm, 16px);
      }

      .materials-grid {
        flex: 1;
        padding: var(--ls-padding-base, 20px);
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--ls-spacing-base, 20px);
      }

      .material-card {
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: var(--ls-border-radius-base, 6px);
        padding: var(--ls-padding-base, 20px);
        background: var(--ldesign-bg-color-container, #ffffff);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .material-card:hover {
        border-color: var(--ldesign-brand-color, #722ED1);
        box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 0.05));
      }

      .material-preview {
        width: 80px;
        height: 60px;
        margin-bottom: var(--ls-margin-sm, 12px);
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--ldesign-border-level-1-color, #e5e5e5);
        border-radius: var(--ls-border-radius-sm, 3px);
        background: var(--ldesign-bg-color-component, #fafafa);
      }

      .material-name {
        font-size: var(--ls-font-size-sm, 16px);
        font-weight: 500;
        color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
        margin-bottom: var(--ls-margin-xs, 6px);
      }

      .material-description {
        font-size: var(--ls-font-size-xs, 14px);
        color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
        margin-bottom: var(--ls-margin-sm, 12px);
        line-height: 1.4;
      }

      .material-actions {
        display: flex;
        gap: var(--ls-spacing-xs, 6px);
        margin-top: auto;
      }

      .material-actions button {
        padding: var(--ls-padding-xs, 6px);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: var(--ls-border-radius-sm, 3px);
        background: var(--ldesign-bg-color-container, #ffffff);
        cursor: pointer;
        font-size: var(--ls-font-size-xs, 14px);
        transition: all 0.2s ease;
      }

      .material-actions button:hover {
        background: var(--ldesign-bg-color-container-hover, #fafafa);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
      }

      .empty-state-icon {
        font-size: 48px;
        margin-bottom: var(--ls-margin-base, 20px);
        opacity: 0.5;
      }

      .empty-state-text {
        font-size: var(--ls-font-size-base, 18px);
        margin-bottom: var(--ls-margin-sm, 12px);
      }

      .empty-state-description {
        font-size: var(--ls-font-size-sm, 16px);
        opacity: 0.7;
      }

      /* 暗色主题适配 */
      [data-theme="dark"] .repository-panel-content {
        background: var(--ldesign-bg-color-container, #1f1f1f);
      }

      [data-theme="dark"] .repository-panel-header {
        background: var(--ldesign-bg-color-component, #2a2a2a);
        border-color: var(--ldesign-border-color, #404040);
      }

      [data-theme="dark"] .repository-sidebar {
        background: var(--ldesign-bg-color-component, #2a2a2a);
        border-color: var(--ldesign-border-color, #404040);
      }

      [data-theme="dark"] .material-card {
        background: var(--ldesign-bg-color-container, #1f1f1f);
        border-color: var(--ldesign-border-color, #404040);
      }

      [data-theme="dark"] .material-preview {
        background: var(--ldesign-bg-color-component, #2a2a2a);
        border-color: var(--ldesign-border-color, #404040);
      }

      /* 滚动条美化 */
      .materials-grid::-webkit-scrollbar {
        width: 8px;
      }

      .materials-grid::-webkit-scrollbar-track {
        background: var(--ldesign-bg-color-component, #fafafa);
      }

      .materials-grid::-webkit-scrollbar-thumb {
        background: var(--ldesign-gray-color-4, #adadad);
        border-radius: 4px;
      }

      .materials-grid::-webkit-scrollbar-thumb:hover {
        background: var(--ldesign-gray-color-5, #969696);
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 创建面板DOM结构
   */
  private createPanel(): void {
    this.panelElement = document.createElement('div')
    this.panelElement.className = 'ldesign-material-repository-panel'
    this.panelElement.innerHTML = `
      <div class="repository-panel-content">
        <div class="repository-panel-header">
          <h2>${getToolbarIcon('material-repository')} 物料仓库</h2>
          <div class="repository-panel-actions">
            <button class="btn-new-material btn-primary">${getToolbarIcon('add')} 新建物料</button>
            <button class="btn-import">${getToolbarIcon('import')} 导入</button>
            <button class="btn-export">${getToolbarIcon('export')} 导出</button>
            <button class="btn-close">${getToolbarIcon('close')}</button>
          </div>
        </div>
        
        <div class="repository-panel-body">
          <div class="repository-sidebar">
            <div class="sidebar-section">
              <h3>分类</h3>
              <ul class="category-list">
                <li class="category-item active" data-category="all">
                  <span>全部物料</span>
                  <span class="category-count">0</span>
                </li>
              </ul>
            </div>
            
            <div class="sidebar-section">
              <h3>操作</h3>
              <button class="btn-new-category" style="width: 100%; margin-bottom: 8px;">➕ 新建分类</button>
              <button class="btn-manage-categories" style="width: 100%;">⚙️ 管理分类</button>
            </div>
          </div>
          
          <div class="repository-main">
            <div class="materials-toolbar">
              <input type="text" class="search-box" placeholder="搜索物料...">
              <div>
                <button class="btn-grid-view">⊞ 网格</button>
                <button class="btn-list-view">☰ 列表</button>
              </div>
            </div>
            
            <div class="materials-grid">
              <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">暂无物料</div>
                <div class="empty-state-description">点击"新建物料"开始创建您的第一个自定义物料</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.container.appendChild(this.panelElement)
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.panelElement) return

    // 关闭按钮
    const closeBtn = this.panelElement.querySelector('.btn-close')
    closeBtn?.addEventListener('click', () => this.close())

    // 点击背景关闭
    this.panelElement.addEventListener('click', (e) => {
      if (e.target === this.panelElement) {
        this.close()
      }
    })

    // 新建物料
    const newMaterialBtn = this.panelElement.querySelector('.btn-new-material')
    newMaterialBtn?.addEventListener('click', () => this.showMaterialEditor())

    // 导入导出
    const importBtn = this.panelElement.querySelector('.btn-import')
    importBtn?.addEventListener('click', () => this.importRepository())

    const exportBtn = this.panelElement.querySelector('.btn-export')
    exportBtn?.addEventListener('click', () => this.exportRepository())

    // 搜索
    const searchBox = this.panelElement.querySelector('.search-box')
    searchBox?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value
      this.searchMaterials(query)
    })

    // 分类切换
    const categoryList = this.panelElement.querySelector('.category-list')
    categoryList?.addEventListener('click', (e) => {
      const categoryItem = (e.target as HTMLElement).closest('.category-item')
      if (categoryItem) {
        const category = categoryItem.getAttribute('data-category')
        if (category) {
          this.switchCategory(category)
        }
      }
    })

    // 新建分类
    const newCategoryBtn = this.panelElement.querySelector('.btn-new-category')
    newCategoryBtn?.addEventListener('click', () => this.showNewCategoryDialog())

    // 物料仓库事件监听
    this.repositoryManager.on('material:add', () => this.loadMaterials())
    this.repositoryManager.on('material:update', () => this.loadMaterials())
    this.repositoryManager.on('material:delete', () => this.loadMaterials())
    this.repositoryManager.on('category:add', () => this.loadCategories())
    this.repositoryManager.on('category:update', () => this.loadCategories())
    this.repositoryManager.on('category:delete', () => this.loadCategories())
  }

  /**
   * 加载分类
   */
  private loadCategories(): void {
    const categoryList = this.panelElement?.querySelector('.category-list')
    if (!categoryList) return

    const categories = this.repositoryManager.getCategories()
    const allMaterials = this.repositoryManager.getAllMaterials()

    let html = `
      <li class="category-item ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
        <span>全部物料</span>
        <span class="category-count">${allMaterials.length}</span>
      </li>
    `

    categories.forEach(category => {
      html += `
        <li class="category-item ${this.currentCategory === category.id ? 'active' : ''}" data-category="${category.id}">
          <span>${category.icon || '📁'} ${category.name}</span>
          <span class="category-count">${category.materials.length}</span>
        </li>
      `
    })

    categoryList.innerHTML = html
  }

  /**
   * 加载物料
   */
  private loadMaterials(): void {
    this.loadCategories()

    const materialsGrid = this.panelElement?.querySelector('.materials-grid')
    if (!materialsGrid) return

    let materials: CustomMaterial[]

    if (this.currentCategory === 'all') {
      materials = this.repositoryManager.getAllMaterials()
    } else {
      materials = this.repositoryManager.getMaterialsByCategory(this.currentCategory)
    }

    if (materials.length === 0) {
      materialsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-text">暂无物料</div>
          <div class="empty-state-description">点击"新建物料"开始创建您的第一个自定义物料</div>
        </div>
      `
      return
    }

    const html = materials.map(material => this.createMaterialCardHTML(material)).join('')
    materialsGrid.innerHTML = html

    // 绑定物料卡片事件
    materialsGrid.querySelectorAll('.material-card').forEach(card => {
      const materialId = card.getAttribute('data-material-id')
      if (materialId) {
        card.addEventListener('click', () => this.selectMaterial(materialId))

        // 编辑按钮
        const editBtn = card.querySelector('.btn-edit')
        editBtn?.addEventListener('click', (e) => {
          e.stopPropagation()
          this.editMaterial(materialId)
        })

        // 删除按钮
        const deleteBtn = card.querySelector('.btn-delete')
        deleteBtn?.addEventListener('click', (e) => {
          e.stopPropagation()
          this.deleteMaterial(materialId)
        })
      }
    })
  }

  /**
   * 创建物料卡片HTML
   */
  private createMaterialCardHTML(material: CustomMaterial): string {
    return `
      <div class="material-card" data-material-id="${material.id}">
        <div class="material-preview">
          ${this.createMaterialPreviewSVG(material)}
        </div>
        <div class="material-name">${material.name}</div>
        <div class="material-description">${material.description || '无描述'}</div>
        <div class="material-actions">
          <button class="btn-edit" title="编辑">✏️</button>
          <button class="btn-delete" title="删除">🗑️</button>
        </div>
      </div>
    `
  }

  /**
   * 创建物料预览SVG
   */
  private createMaterialPreviewSVG(material: CustomMaterial): string {
    const { shape, width, height, style, icon } = material
    const previewWidth = 60
    const previewHeight = 40
    const centerX = previewWidth / 2
    const centerY = previewHeight / 2

    let shapeElement = ''

    switch (shape) {
      case 'rect':
        shapeElement = `<rect x="${centerX - 20}" y="${centerY - 15}" width="40" height="30" 
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
        break
      case 'circle':
        shapeElement = `<circle cx="${centerX}" cy="${centerY}" r="15" 
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
        break
      case 'diamond':
        shapeElement = `<polygon points="${centerX},${centerY - 15} ${centerX + 20},${centerY} ${centerX},${centerY + 15} ${centerX - 20},${centerY}" 
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
        break
      default:
        shapeElement = `<rect x="${centerX - 20}" y="${centerY - 15}" width="40" height="30" 
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
    }

    let iconElement = ''
    if (icon && icon.content) {
      iconElement = `<text x="${centerX}" y="${centerY - 5}" text-anchor="middle" font-size="10" fill="${icon.color || '#333'}">${icon.content}</text>`
    }

    const textElement = `<text x="${centerX}" y="${centerY + 8}" text-anchor="middle" font-size="8" fill="${style.fontColor || '#333'}">${material.name}</text>`

    return `
      <svg width="${previewWidth}" height="${previewHeight}" viewBox="0 0 ${previewWidth} ${previewHeight}">
        ${shapeElement}
        ${iconElement}
        ${textElement}
      </svg>
    `
  }

  /**
   * 切换分类
   */
  private switchCategory(category: string): void {
    this.currentCategory = category

    // 更新分类选中状态
    this.panelElement?.querySelectorAll('.category-item').forEach(item => {
      item.classList.remove('active')
    })

    const activeItem = this.panelElement?.querySelector(`[data-category="${category}"]`)
    activeItem?.classList.add('active')

    this.loadMaterials()
  }

  /**
   * 搜索物料
   */
  private searchMaterials(query: string): void {
    const materialsGrid = this.panelElement?.querySelector('.materials-grid')
    if (!materialsGrid) return

    if (!query.trim()) {
      this.loadMaterials()
      return
    }

    const materials = this.repositoryManager.searchMaterials(query)

    if (materials.length === 0) {
      materialsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">未找到相关物料</div>
          <div class="empty-state-description">尝试使用其他关键词搜索</div>
        </div>
      `
      return
    }

    const html = materials.map(material => this.createMaterialCardHTML(material)).join('')
    materialsGrid.innerHTML = html
  }

  /**
   * 显示物料编辑器
   */
  private showMaterialEditor(material?: CustomMaterial): void {
    const editorContainer = document.createElement('div')
    editorContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
    `

    const editorContent = document.createElement('div')
    editorContent.style.cssText = `
      width: 90%;
      max-width: 1000px;
      height: 80%;
      max-height: 700px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    `

    editorContainer.appendChild(editorContent)
    document.body.appendChild(editorContainer)

    this.materialEditor = new MaterialEditor({
      container: editorContent,
      material,
      categories: this.repositoryManager.getCategories(),
      onSave: (savedMaterial) => {
        if (material) {
          // 更新现有物料
          this.repositoryManager.updateMaterial(material.id, savedMaterial)
        } else {
          // 添加新物料
          this.repositoryManager.addMaterial(savedMaterial.category, savedMaterial)
        }
        this.closeMaterialEditor()
      },
      onCancel: () => {
        this.closeMaterialEditor()
      }
    })

    // 点击背景关闭
    editorContainer.addEventListener('click', (e) => {
      if (e.target === editorContainer) {
        this.closeMaterialEditor()
      }
    })
  }

  /**
   * 关闭物料编辑器
   */
  private closeMaterialEditor(): void {
    if (this.materialEditor) {
      this.materialEditor.destroy()
      this.materialEditor = null
    }

    const editorContainer = document.querySelector('.ldesign-material-repository-panel + div')
    if (editorContainer && editorContainer.parentNode) {
      editorContainer.parentNode.removeChild(editorContainer)
    }
  }

  /**
   * 选择物料
   */
  private selectMaterial(materialId: string): void {
    const material = this.repositoryManager.getMaterial(materialId)
    if (material) {
      this.config.onMaterialSelect?.(material)
      this.close()
    }
  }

  /**
   * 编辑物料
   */
  private editMaterial(materialId: string): void {
    const material = this.repositoryManager.getMaterial(materialId)
    if (material) {
      this.showMaterialEditor(material)
    }
  }

  /**
   * 删除物料
   */
  private deleteMaterial(materialId: string): void {
    const material = this.repositoryManager.getMaterial(materialId)
    if (material && confirm(`确定要删除物料"${material.name}"吗？此操作不可撤销。`)) {
      this.repositoryManager.deleteMaterial(materialId)
    }
  }

  /**
   * 显示新建分类对话框
   */
  private showNewCategoryDialog(): void {
    const name = prompt('请输入分类名称:')
    if (name && name.trim()) {
      const id = `category_${Date.now()}`
      this.repositoryManager.addCategory({
        id,
        name: name.trim(),
        description: '',
        icon: '📁',
        order: this.repositoryManager.getCategories().length + 1
      })
    }
  }

  /**
   * 导入仓库
   */
  private importRepository(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (this.repositoryManager.importRepository(content)) {
            alert('导入成功！')
            this.loadMaterials()
          } else {
            alert('导入失败，请检查文件格式！')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  /**
   * 导出仓库
   */
  private exportRepository(): void {
    const data = this.repositoryManager.exportRepository()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `material-repository-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
  }

  /**
   * 关闭面板
   */
  close(): void {
    this.config.onClose?.()
    if (this.panelElement && this.panelElement.parentNode) {
      this.panelElement.parentNode.removeChild(this.panelElement)
    }
    this.panelElement = null
  }

  /**
   * 销毁面板
   */
  destroy(): void {
    this.closeMaterialEditor()
    this.close()
  }
}

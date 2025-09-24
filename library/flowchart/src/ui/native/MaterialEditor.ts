/**
 * 物料编辑器
 * 
 * 提供可视化的物料编辑界面
 */

import type { CustomMaterial, MaterialStyle, MaterialIcon, MaterialCategory } from '../../types'
import { getCustomMaterialIcon } from '../../utils/icons'

export interface MaterialEditorConfig {
  container: HTMLElement
  material?: CustomMaterial
  categories?: MaterialCategory[]
  onSave?: (material: CustomMaterial) => void
  onCancel?: () => void
  onPreview?: (material: CustomMaterial) => void
}

/**
 * 物料编辑器类
 */
export class MaterialEditor {
  private container: HTMLElement
  private config: MaterialEditorConfig
  private editorElement: HTMLElement | null = null
  private currentMaterial: CustomMaterial
  private previewElement: HTMLElement | null = null

  constructor(config: MaterialEditorConfig) {
    this.container = config.container
    this.config = config
    this.currentMaterial = config.material || this.createDefaultMaterial()
    this.init()
  }

  /**
   * 创建默认物料
   */
  private createDefaultMaterial(): CustomMaterial {
    return {
      id: `material_${Date.now()}`,
      name: '新物料',
      category: 'custom',
      description: '',
      shape: 'rect',
      width: 120,
      height: 60,
      style: {
        fill: '#ffffff',
        stroke: '#722ED1',
        strokeWidth: 2,
        fontSize: 14,
        fontColor: '#333333'
      },
      draggable: true,
      tags: [],
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * 初始化编辑器
   */
  private init(): void {
    this.addStyles()
    this.createEditor()
    this.bindEvents()
    this.updatePreview()
  }

  /**
   * 添加样式
   */
  private addStyles(): void {
    const styleId = 'ldesign-material-editor-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .ldesign-material-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--ldesign-bg-color-container, #ffffff);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: var(--ls-border-radius-lg, 12px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
        overflow: hidden;
      }

      .material-editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--ls-padding-base, 20px) var(--ls-padding-lg, 28px);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        background: linear-gradient(135deg, var(--ldesign-brand-color-1, #f1ecf9) 0%, var(--ldesign-bg-color-component, #fafafa) 100%);
        position: relative;
      }

      .material-editor-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--ldesign-brand-color, #722ED1), var(--ldesign-brand-color-6, #7334cb));
      }

      .material-editor-header h3 {
        margin: 0;
        font-size: var(--ls-font-size-xl, 24px);
        font-weight: 700;
        color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .editor-actions {
        display: flex;
        gap: var(--ls-spacing-xs, 6px);
      }

      .editor-actions button {
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

      .editor-actions button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      .editor-actions button:hover::before {
        left: 100%;
      }

      .editor-actions button:hover {
        background: var(--ldesign-bg-color-container-hover, #fafafa);
        border-color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-1px);
        box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
      }

      .btn-save {
        background: var(--ldesign-brand-color, #722ED1) !important;
        color: white !important;
        border-color: var(--ldesign-brand-color, #722ED1) !important;
      }

      .btn-save:hover {
        background: var(--ldesign-brand-color-hover, #5e2aa7) !important;
        border-color: var(--ldesign-brand-color-hover, #5e2aa7) !important;
        transform: translateY(-2px);
        box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
      }

      .btn-cancel {
        background: var(--ldesign-error-color, #e54848) !important;
        color: white !important;
        border-color: var(--ldesign-error-color, #e54848) !important;
      }

      .btn-cancel:hover {
        background: var(--ldesign-error-color-hover, #ec6f6f) !important;
        border-color: var(--ldesign-error-color-hover, #ec6f6f) !important;
        transform: translateY(-2px);
        box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
      }

      .material-editor-content {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .editor-form {
        flex: 1;
        padding: var(--ls-padding-base, 20px);
        overflow-y: auto;
        max-height: 600px;
      }

      .editor-preview {
        width: 250px;
        padding: var(--ls-padding-base, 20px);
        border-left: 1px solid var(--ldesign-border-color, #e5e5e5);
        background: var(--ldesign-bg-color-component, #fafafa);
      }

      .form-section {
        margin-bottom: var(--ls-margin-lg, 28px);
        padding-bottom: var(--ls-padding-base, 20px);
        border-bottom: 1px solid var(--ldesign-border-level-1-color, #e5e5e5);
      }

      .form-section:last-child {
        border-bottom: none;
      }

      .form-section h4 {
        margin: 0 0 var(--ls-margin-sm, 12px) 0;
        font-size: var(--ls-font-size-base, 18px);
        color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
        font-weight: 600;
      }

      .form-group {
        margin-bottom: var(--ls-margin-sm, 12px);
      }

      .form-row {
        display: flex;
        gap: var(--ls-spacing-sm, 12px);
      }

      .form-row .form-group {
        flex: 1;
      }

      .form-group label {
        display: block;
        margin-bottom: var(--ls-margin-xs, 6px);
        font-size: var(--ls-font-size-sm, 16px);
        color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
        font-weight: 500;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: var(--ls-padding-xs, 6px) var(--ls-padding-sm, 12px);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: var(--ls-border-radius-sm, 3px);
        font-size: var(--ls-font-size-sm, 16px);
        background: var(--ldesign-bg-color-container, #ffffff);
        transition: border-color 0.2s ease;
        box-sizing: border-box;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--ldesign-brand-color, #722ED1);
        box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus, rgba(114, 46, 209, 0.2));
      }

      .form-group input[type="color"] {
        width: 60px;
        height: 36px;
        padding: 2px;
        border-radius: var(--ls-border-radius-sm, 3px);
        cursor: pointer;
      }

      .form-group input[type="range"] {
        flex: 1;
        margin-right: var(--ls-margin-xs, 6px);
      }

      .opacity-value {
        min-width: 40px;
        font-size: var(--ls-font-size-sm, 16px);
        color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
      }

      .form-group input[type="checkbox"] {
        width: auto;
        margin-right: var(--ls-margin-xs, 6px);
      }

      .preview-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 150px;
        background: var(--ldesign-bg-color-container, #ffffff);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: var(--ls-border-radius-base, 6px);
        margin-top: var(--ls-margin-sm, 12px);
      }

      .material-preview {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .icon-content-group,
      .icon-style-group {
        display: none;
      }

      /* 暗色主题适配 */
      [data-theme="dark"] .ldesign-material-editor {
        background: var(--ldesign-bg-color-container, #1f1f1f);
        border-color: var(--ldesign-border-color, #404040);
      }

      [data-theme="dark"] .material-editor-header {
        background: var(--ldesign-bg-color-component, #2a2a2a);
        border-color: var(--ldesign-border-color, #404040);
      }

      [data-theme="dark"] .editor-preview {
        background: var(--ldesign-bg-color-component, #2a2a2a);
        border-color: var(--ldesign-border-color, #404040);
      }

      [data-theme="dark"] .preview-container {
        background: var(--ldesign-bg-color-container, #1f1f1f);
        border-color: var(--ldesign-border-color, #404040);
      }

      [data-theme="dark"] .form-group input,
      [data-theme="dark"] .form-group select,
      [data-theme="dark"] .form-group textarea {
        background: var(--ldesign-bg-color-container, #1f1f1f);
        border-color: var(--ldesign-border-color, #404040);
        color: var(--ldesign-text-color-primary, rgba(255, 255, 255, 0.9));
      }

      /* 滚动条美化 */
      .editor-form::-webkit-scrollbar {
        width: 6px;
      }

      .editor-form::-webkit-scrollbar-track {
        background: var(--ldesign-bg-color-component, #fafafa);
      }

      .editor-form::-webkit-scrollbar-thumb {
        background: var(--ldesign-gray-color-4, #adadad);
        border-radius: 3px;
      }

      .editor-form::-webkit-scrollbar-thumb:hover {
        background: var(--ldesign-gray-color-5, #969696);
      }

      [data-theme="dark"] .editor-form::-webkit-scrollbar-track {
        background: var(--ldesign-bg-color-component, #2a2a2a);
      }

      [data-theme="dark"] .editor-form::-webkit-scrollbar-thumb {
        background: var(--ldesign-gray-color-6, #808080);
      }

      [data-theme="dark"] .editor-form::-webkit-scrollbar-thumb:hover {
        background: var(--ldesign-gray-color-7, #696969);
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 创建编辑器DOM结构
   */
  private createEditor(): void {
    this.editorElement = document.createElement('div')
    this.editorElement.className = 'ldesign-material-editor'
    this.editorElement.innerHTML = `
      <div class="material-editor-header">
        <h3>${getCustomMaterialIcon()} 物料编辑器</h3>
        <div class="editor-actions">
          <button class="btn-preview" title="预览">预览</button>
          <button class="btn-save" title="保存">保存</button>
          <button class="btn-cancel" title="取消">取消</button>
        </div>
      </div>
      
      <div class="material-editor-content">
        <div class="editor-form">
          <div class="form-section">
            <h4>基础信息</h4>
            <div class="form-group">
              <label>物料名称</label>
              <input type="text" class="material-name" value="${this.currentMaterial.name}">
            </div>
            <div class="form-group">
              <label>物料分类</label>
              <select class="material-category">
                ${this.createCategoryOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea class="material-description" rows="3">${this.currentMaterial.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label>标签</label>
              <input type="text" class="material-tags" value="${(this.currentMaterial.tags || []).join(', ')}" placeholder="用逗号分隔">
            </div>
          </div>

          <div class="form-section">
            <h4>形状配置</h4>
            <div class="form-group">
              <label>形状类型</label>
              <select class="material-shape">
                <option value="rect" ${this.currentMaterial.shape === 'rect' ? 'selected' : ''}>矩形</option>
                <option value="circle" ${this.currentMaterial.shape === 'circle' ? 'selected' : ''}>圆形</option>
                <option value="diamond" ${this.currentMaterial.shape === 'diamond' ? 'selected' : ''}>菱形</option>
                <option value="ellipse" ${this.currentMaterial.shape === 'ellipse' ? 'selected' : ''}>椭圆</option>
                <option value="polygon" ${this.currentMaterial.shape === 'polygon' ? 'selected' : ''}>多边形</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>宽度</label>
                <input type="number" class="material-width" value="${this.currentMaterial.width}" min="20" max="500">
              </div>
              <div class="form-group">
                <label>高度</label>
                <input type="number" class="material-height" value="${this.currentMaterial.height}" min="20" max="500">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>样式配置</h4>
            <div class="form-row">
              <div class="form-group">
                <label>填充色</label>
                <input type="color" class="style-fill" value="${this.currentMaterial.style.fill || '#ffffff'}">
              </div>
              <div class="form-group">
                <label>边框色</label>
                <input type="color" class="style-stroke" value="${this.currentMaterial.style.stroke || '#722ED1'}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>边框宽度</label>
                <input type="number" class="style-stroke-width" value="${this.currentMaterial.style.strokeWidth || 2}" min="0" max="10">
              </div>
              <div class="form-group">
                <label>透明度</label>
                <input type="range" class="style-opacity" value="${(this.currentMaterial.style.opacity || 1) * 100}" min="0" max="100">
                <span class="opacity-value">${Math.round((this.currentMaterial.style.opacity || 1) * 100)}%</span>
              </div>
            </div>
            <div class="form-group">
              <label>边框样式</label>
              <select class="style-stroke-dasharray">
                <option value="" ${!this.currentMaterial.style.strokeDasharray ? 'selected' : ''}>实线</option>
                <option value="5,5" ${this.currentMaterial.style.strokeDasharray === '5,5' ? 'selected' : ''}>虚线</option>
                <option value="10,5" ${this.currentMaterial.style.strokeDasharray === '10,5' ? 'selected' : ''}>长虚线</option>
                <option value="2,2" ${this.currentMaterial.style.strokeDasharray === '2,2' ? 'selected' : ''}>点线</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h4>文本样式</h4>
            <div class="form-row">
              <div class="form-group">
                <label>字体大小</label>
                <input type="number" class="style-font-size" value="${this.currentMaterial.style.fontSize || 14}" min="8" max="48">
              </div>
              <div class="form-group">
                <label>字体颜色</label>
                <input type="color" class="style-font-color" value="${this.currentMaterial.style.fontColor || '#333333'}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>字体粗细</label>
                <select class="style-font-weight">
                  <option value="normal" ${this.currentMaterial.style.fontWeight === 'normal' ? 'selected' : ''}>正常</option>
                  <option value="bold" ${this.currentMaterial.style.fontWeight === 'bold' ? 'selected' : ''}>粗体</option>
                  <option value="lighter" ${this.currentMaterial.style.fontWeight === 'lighter' ? 'selected' : ''}>细体</option>
                </select>
              </div>
              <div class="form-group">
                <label>字体族</label>
                <select class="style-font-family">
                  <option value="Arial" ${this.currentMaterial.style.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                  <option value="Microsoft YaHei" ${this.currentMaterial.style.fontFamily === 'Microsoft YaHei' ? 'selected' : ''}>微软雅黑</option>
                  <option value="SimSun" ${this.currentMaterial.style.fontFamily === 'SimSun' ? 'selected' : ''}>宋体</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>图标配置</h4>
            <div class="form-group">
              <label>图标类型</label>
              <select class="icon-type">
                <option value="" ${!this.currentMaterial.icon ? 'selected' : ''}>无图标</option>
                <option value="text" ${this.currentMaterial.icon?.type === 'text' ? 'selected' : ''}>文本</option>
                <option value="emoji" ${this.currentMaterial.icon?.type === 'emoji' ? 'selected' : ''}>表情符号</option>
                <option value="svg" ${this.currentMaterial.icon?.type === 'svg' ? 'selected' : ''}>SVG</option>
              </select>
            </div>
            <div class="form-group icon-content-group" ${!this.currentMaterial.icon ? 'style="display:none"' : ''}>
              <label>图标内容</label>
              <input type="text" class="icon-content" value="${this.currentMaterial.icon?.content || ''}" placeholder="输入图标内容">
            </div>
            <div class="form-row icon-style-group" ${!this.currentMaterial.icon ? 'style="display:none"' : ''}>
              <div class="form-group">
                <label>图标大小</label>
                <input type="number" class="icon-size" value="${this.currentMaterial.icon?.size || 16}" min="8" max="48">
              </div>
              <div class="form-group">
                <label>图标颜色</label>
                <input type="color" class="icon-color" value="${this.currentMaterial.icon?.color || '#333333'}">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>行为配置</h4>
            <div class="form-group">
              <label>
                <input type="checkbox" class="material-draggable" ${this.currentMaterial.draggable ? 'checked' : ''}>
                可拖拽
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" class="material-resizable" ${this.currentMaterial.resizable ? 'checked' : ''}>
                可调整大小
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" class="material-rotatable" ${this.currentMaterial.rotatable ? 'checked' : ''}>
                可旋转
              </label>
            </div>
          </div>
        </div>

        <div class="editor-preview">
          <h4>预览</h4>
          <div class="preview-container">
            <div class="material-preview"></div>
          </div>
        </div>
      </div>
    `

    this.container.appendChild(this.editorElement)
    this.previewElement = this.editorElement.querySelector('.material-preview')
  }

  /**
   * 创建分类选项
   */
  private createCategoryOptions(): string {
    const categories = this.config.categories || [
      { id: 'custom', name: '自定义节点' }
    ]

    return categories.map(cat =>
      `<option value="${cat.id}" ${this.currentMaterial.category === cat.id ? 'selected' : ''}>${cat.name}</option>`
    ).join('')
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.editorElement) return

    // 保存按钮
    const saveBtn = this.editorElement.querySelector('.btn-save')
    saveBtn?.addEventListener('click', () => this.handleSave())

    // 取消按钮
    const cancelBtn = this.editorElement.querySelector('.btn-cancel')
    cancelBtn?.addEventListener('click', () => this.handleCancel())

    // 预览按钮
    const previewBtn = this.editorElement.querySelector('.btn-preview')
    previewBtn?.addEventListener('click', () => this.handlePreview())

    // 表单字段变化事件
    const inputs = this.editorElement.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      input.addEventListener('input', () => this.handleInputChange())
      input.addEventListener('change', () => this.handleInputChange())
    })

    // 图标类型变化
    const iconType = this.editorElement.querySelector('.icon-type')
    iconType?.addEventListener('change', () => this.handleIconTypeChange())

    // 透明度滑块
    const opacitySlider = this.editorElement.querySelector('.style-opacity')
    opacitySlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      const opacityValue = this.editorElement?.querySelector('.opacity-value')
      if (opacityValue) {
        opacityValue.textContent = `${value}%`
      }
    })
  }

  /**
   * 处理输入变化
   */
  private handleInputChange(): void {
    this.updateMaterialFromForm()
    this.updatePreview()
  }

  /**
   * 处理图标类型变化
   */
  private handleIconTypeChange(): void {
    const iconType = (this.editorElement?.querySelector('.icon-type') as HTMLSelectElement)?.value
    const contentGroup = this.editorElement?.querySelector('.icon-content-group') as HTMLElement
    const styleGroup = this.editorElement?.querySelector('.icon-style-group') as HTMLElement

    if (iconType) {
      contentGroup.style.display = 'block'
      styleGroup.style.display = 'flex'
    } else {
      contentGroup.style.display = 'none'
      styleGroup.style.display = 'none'
    }

    this.handleInputChange()
  }

  /**
   * 从表单更新物料数据
   */
  private updateMaterialFromForm(): void {
    if (!this.editorElement) return

    // 基础信息
    this.currentMaterial.name = (this.editorElement.querySelector('.material-name') as HTMLInputElement).value
    this.currentMaterial.category = (this.editorElement.querySelector('.material-category') as HTMLSelectElement).value
    this.currentMaterial.description = (this.editorElement.querySelector('.material-description') as HTMLTextAreaElement).value

    const tagsValue = (this.editorElement.querySelector('.material-tags') as HTMLInputElement).value
    this.currentMaterial.tags = tagsValue ? tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    // 形状配置
    this.currentMaterial.shape = (this.editorElement.querySelector('.material-shape') as HTMLSelectElement).value as any
    this.currentMaterial.width = parseInt((this.editorElement.querySelector('.material-width') as HTMLInputElement).value)
    this.currentMaterial.height = parseInt((this.editorElement.querySelector('.material-height') as HTMLInputElement).value)

    // 样式配置
    this.currentMaterial.style = {
      ...this.currentMaterial.style,
      fill: (this.editorElement.querySelector('.style-fill') as HTMLInputElement).value,
      stroke: (this.editorElement.querySelector('.style-stroke') as HTMLInputElement).value,
      strokeWidth: parseInt((this.editorElement.querySelector('.style-stroke-width') as HTMLInputElement).value),
      opacity: parseInt((this.editorElement.querySelector('.style-opacity') as HTMLInputElement).value) / 100,
      strokeDasharray: (this.editorElement.querySelector('.style-stroke-dasharray') as HTMLSelectElement).value || undefined,
      fontSize: parseInt((this.editorElement.querySelector('.style-font-size') as HTMLInputElement).value),
      fontColor: (this.editorElement.querySelector('.style-font-color') as HTMLInputElement).value,
      fontWeight: (this.editorElement.querySelector('.style-font-weight') as HTMLSelectElement).value,
      fontFamily: (this.editorElement.querySelector('.style-font-family') as HTMLSelectElement).value
    }

    // 图标配置
    const iconType = (this.editorElement.querySelector('.icon-type') as HTMLSelectElement).value
    if (iconType) {
      this.currentMaterial.icon = {
        type: iconType as any,
        content: (this.editorElement.querySelector('.icon-content') as HTMLInputElement).value,
        size: parseInt((this.editorElement.querySelector('.icon-size') as HTMLInputElement).value),
        color: (this.editorElement.querySelector('.icon-color') as HTMLInputElement).value,
        position: 'center'
      }
    } else {
      this.currentMaterial.icon = undefined
    }

    // 行为配置
    this.currentMaterial.draggable = (this.editorElement.querySelector('.material-draggable') as HTMLInputElement).checked
    this.currentMaterial.resizable = (this.editorElement.querySelector('.material-resizable') as HTMLInputElement).checked
    this.currentMaterial.rotatable = (this.editorElement.querySelector('.material-rotatable') as HTMLInputElement).checked

    // 更新时间
    this.currentMaterial.updatedAt = new Date().toISOString()
  }

  /**
   * 更新预览
   */
  private updatePreview(): void {
    if (!this.previewElement) return

    const { shape, width, height, style, icon } = this.currentMaterial

    // 创建预览SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '200')
    svg.setAttribute('height', '120')
    svg.setAttribute('viewBox', '0 0 200 120')

    // 计算居中位置
    const centerX = 100
    const centerY = 60
    const previewWidth = Math.min(width, 160)
    const previewHeight = Math.min(height, 80)

    // 创建形状元素
    let shapeElement: SVGElement

    switch (shape) {
      case 'rect':
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        shapeElement.setAttribute('x', String(centerX - previewWidth / 2))
        shapeElement.setAttribute('y', String(centerY - previewHeight / 2))
        shapeElement.setAttribute('width', String(previewWidth))
        shapeElement.setAttribute('height', String(previewHeight))
        if (style.borderRadius) {
          shapeElement.setAttribute('rx', String(style.borderRadius))
        }
        break
      case 'circle':
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        const radius = Math.min(previewWidth, previewHeight) / 2
        shapeElement.setAttribute('cx', String(centerX))
        shapeElement.setAttribute('cy', String(centerY))
        shapeElement.setAttribute('r', String(radius))
        break
      case 'ellipse':
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
        shapeElement.setAttribute('cx', String(centerX))
        shapeElement.setAttribute('cy', String(centerY))
        shapeElement.setAttribute('rx', String(previewWidth / 2))
        shapeElement.setAttribute('ry', String(previewHeight / 2))
        break
      case 'diamond':
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
        const points = [
          `${centerX},${centerY - previewHeight / 2}`,
          `${centerX + previewWidth / 2},${centerY}`,
          `${centerX},${centerY + previewHeight / 2}`,
          `${centerX - previewWidth / 2},${centerY}`
        ].join(' ')
        shapeElement.setAttribute('points', points)
        break
      default:
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        shapeElement.setAttribute('x', String(centerX - previewWidth / 2))
        shapeElement.setAttribute('y', String(centerY - previewHeight / 2))
        shapeElement.setAttribute('width', String(previewWidth))
        shapeElement.setAttribute('height', String(previewHeight))
    }

    // 应用样式
    shapeElement.setAttribute('fill', style.fill || '#ffffff')
    shapeElement.setAttribute('stroke', style.stroke || '#722ED1')
    shapeElement.setAttribute('stroke-width', String(style.strokeWidth || 2))
    if (style.strokeDasharray) {
      shapeElement.setAttribute('stroke-dasharray', style.strokeDasharray)
    }
    if (style.opacity !== undefined) {
      shapeElement.setAttribute('opacity', String(style.opacity))
    }

    svg.appendChild(shapeElement)

    // 添加图标
    if (icon && icon.content) {
      const iconElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      iconElement.setAttribute('x', String(centerX))
      iconElement.setAttribute('y', String(centerY - 10))
      iconElement.setAttribute('text-anchor', 'middle')
      iconElement.setAttribute('dominant-baseline', 'middle')
      iconElement.setAttribute('font-size', String(icon.size || 16))
      iconElement.setAttribute('fill', icon.color || '#333333')
      iconElement.textContent = icon.content
      svg.appendChild(iconElement)
    }

    // 添加文本
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textElement.setAttribute('x', String(centerX))
    textElement.setAttribute('y', String(centerY + 15))
    textElement.setAttribute('text-anchor', 'middle')
    textElement.setAttribute('dominant-baseline', 'middle')
    textElement.setAttribute('font-size', String(style.fontSize || 14))
    textElement.setAttribute('fill', style.fontColor || '#333333')
    textElement.setAttribute('font-weight', style.fontWeight || 'normal')
    textElement.setAttribute('font-family', style.fontFamily || 'Arial')
    textElement.textContent = this.currentMaterial.name
    svg.appendChild(textElement)

    // 更新预览容器
    this.previewElement.innerHTML = ''
    this.previewElement.appendChild(svg)
  }

  /**
   * 处理保存
   */
  private handleSave(): void {
    this.updateMaterialFromForm()
    this.config.onSave?.(this.currentMaterial)
  }

  /**
   * 处理取消
   */
  private handleCancel(): void {
    this.config.onCancel?.()
  }

  /**
   * 处理预览
   */
  private handlePreview(): void {
    this.updateMaterialFromForm()
    this.config.onPreview?.(this.currentMaterial)
  }

  /**
   * 获取当前物料
   */
  getCurrentMaterial(): CustomMaterial {
    this.updateMaterialFromForm()
    return { ...this.currentMaterial }
  }

  /**
   * 设置物料数据
   */
  setMaterial(material: CustomMaterial): void {
    this.currentMaterial = { ...material }
    this.updateFormFromMaterial()
    this.updatePreview()
  }

  /**
   * 从物料数据更新表单
   */
  private updateFormFromMaterial(): void {
    if (!this.editorElement) return

    // 重新创建编辑器以更新表单值
    const parent = this.editorElement.parentNode
    if (parent) {
      parent.removeChild(this.editorElement)
      this.createEditor()
      this.bindEvents()
    }
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.editorElement && this.editorElement.parentNode) {
      this.editorElement.parentNode.removeChild(this.editorElement)
    }
    this.editorElement = null
    this.previewElement = null
  }
}

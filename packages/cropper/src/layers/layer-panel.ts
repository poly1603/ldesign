/**
 * @file 图层面板组件
 * @description 图层面板UI组件，提供图层管理界面
 */

import type { Layer, LayerSystem, LayerType, LayerEventData } from './layer-system'

/**
 * 图层面板配置
 */
export interface LayerPanelConfig {
  /** 面板宽度 */
  width: number
  /** 面板位置 */
  position: 'left' | 'right'
  /** 是否可折叠 */
  collapsible: boolean
  /** 主题 */
  theme: 'light' | 'dark'
  /** 图层项目高度 */
  itemHeight: number
  /** 最大显示图层数 */
  maxVisibleLayers: number
}

/**
 * 拖拽数据
 */
interface DragData {
  layerId: string
  startIndex: number
  dragElement: HTMLElement
  placeholder: HTMLElement
}

/**
 * 图层面板类
 */
export class LayerPanel {
  /** 图层系统 */
  private layerSystem: LayerSystem

  /** 面板容器 */
  private container: HTMLElement

  /** 图层列表容器 */
  private layerList: HTMLElement

  /** 工具栏容器 */
  private toolbar: HTMLElement

  /** 配置选项 */
  private config: LayerPanelConfig

  /** 拖拽数据 */
  private dragData: DragData | null = null

  /** 右键菜单 */
  private contextMenu: HTMLElement | null = null

  /** 事件监听器 */
  private eventListeners = new Map<string, Function>()

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: LayerPanelConfig = {
    width: 300,
    position: 'right',
    collapsible: true,
    theme: 'light',
    itemHeight: 60,
    maxVisibleLayers: 20
  }

  /**
   * 构造函数
   */
  constructor(
    layerSystem: LayerSystem, 
    container: HTMLElement, 
    config: Partial<LayerPanelConfig> = {}
  ) {
    this.layerSystem = layerSystem
    this.container = container
    this.config = { ...LayerPanel.DEFAULT_CONFIG, ...config }
    
    this.init()
    this.bindEvents()
  }

  /**
   * 初始化面板
   */
  private init(): void {
    this.container.className = `layer-panel layer-panel--${this.config.theme} layer-panel--${this.config.position}`
    this.container.style.width = `${this.config.width}px`
    
    // 创建面板结构
    this.container.innerHTML = `
      <div class="layer-panel__header">
        <h3 class="layer-panel__title">图层</h3>
        <div class="layer-panel__header-actions">
          <button class="layer-panel__btn layer-panel__btn--add" title="添加图层">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2v10M2 12h10m10 0H12m0-10v20" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="layer-panel__btn layer-panel__btn--delete" title="删除图层" disabled>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="layer-panel__toolbar"></div>
      <div class="layer-panel__list"></div>
      <div class="layer-panel__footer">
        <div class="layer-panel__stats">
          <span class="layer-panel__layer-count">0 图层</span>
        </div>
      </div>
    `

    this.toolbar = this.container.querySelector('.layer-panel__toolbar')!
    this.layerList = this.container.querySelector('.layer-panel__list')!

    this.createToolbar()
    this.createStyles()
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    this.toolbar.innerHTML = `
      <div class="layer-panel__blend-mode">
        <label>混合模式:</label>
        <select class="layer-panel__blend-select">
          <option value="normal">正常</option>
          <option value="multiply">正片叠底</option>
          <option value="screen">滤色</option>
          <option value="overlay">叠加</option>
          <option value="soft-light">柔光</option>
          <option value="hard-light">强光</option>
          <option value="color-dodge">颜色减淡</option>
          <option value="color-burn">颜色加深</option>
          <option value="darken">变暗</option>
          <option value="lighten">变亮</option>
          <option value="difference">差值</option>
          <option value="exclusion">排除</option>
        </select>
      </div>
      <div class="layer-panel__opacity">
        <label>不透明度:</label>
        <input type="range" class="layer-panel__opacity-slider" min="0" max="100" value="100">
        <span class="layer-panel__opacity-value">100%</span>
      </div>
    `
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 图层系统事件
    this.eventListeners.set('layerAdded', this.onLayerAdded.bind(this))
    this.eventListeners.set('layerRemoved', this.onLayerRemoved.bind(this))
    this.eventListeners.set('layerUpdated', this.onLayerUpdated.bind(this))
    this.eventListeners.set('layerSelected', this.onLayerSelected.bind(this))
    this.eventListeners.set('layerDeselected', this.onLayerDeselected.bind(this))

    for (const [event, handler] of this.eventListeners) {
      this.layerSystem.on(event, handler)
    }

    // 面板事件
    this.bindPanelEvents()
  }

  /**
   * 绑定面板事件
   */
  private bindPanelEvents(): void {
    // 添加图层按钮
    const addBtn = this.container.querySelector('.layer-panel__btn--add')!
    addBtn.addEventListener('click', () => this.showAddLayerMenu())

    // 删除图层按钮
    const deleteBtn = this.container.querySelector('.layer-panel__btn--delete')!
    deleteBtn.addEventListener('click', () => this.deleteSelectedLayers())

    // 混合模式选择
    const blendSelect = this.container.querySelector('.layer-panel__blend-select')! as HTMLSelectElement
    blendSelect.addEventListener('change', () => {
      const selectedLayers = this.layerSystem.getSelectedLayers()
      selectedLayers.forEach(layer => {
        this.layerSystem.updateLayer(layer.id, { blendMode: blendSelect.value as any })
      })
    })

    // 不透明度滑块
    const opacitySlider = this.container.querySelector('.layer-panel__opacity-slider')! as HTMLInputElement
    const opacityValue = this.container.querySelector('.layer-panel__opacity-value')!
    
    opacitySlider.addEventListener('input', () => {
      const opacity = parseInt(opacitySlider.value) / 100
      opacityValue.textContent = `${opacitySlider.value}%`
      
      const selectedLayers = this.layerSystem.getSelectedLayers()
      selectedLayers.forEach(layer => {
        this.layerSystem.updateLayer(layer.id, { opacity })
      })
    })
  }

  /**
   * 图层添加事件
   */
  private onLayerAdded(data: LayerEventData): void {
    this.addLayerItem(data.layer)
    this.updateStats()
  }

  /**
   * 图层删除事件
   */
  private onLayerRemoved(data: LayerEventData): void {
    this.removeLayerItem(data.layerId)
    this.updateStats()
  }

  /**
   * 图层更新事件
   */
  private onLayerUpdated(data: LayerEventData): void {
    this.updateLayerItem(data.layer)
  }

  /**
   * 图层选择事件
   */
  private onLayerSelected(data: LayerEventData): void {
    this.updateLayerSelection()
    this.updateToolbar()
  }

  /**
   * 图层取消选择事件
   */
  private onLayerDeselected(data: LayerEventData): void {
    this.updateLayerSelection()
    this.updateToolbar()
  }

  /**
   * 添加图层项目
   */
  private addLayerItem(layer: Layer): void {
    const item = document.createElement('div')
    item.className = 'layer-panel__item'
    item.dataset.layerId = layer.id
    item.style.height = `${this.config.itemHeight}px`
    
    item.innerHTML = `
      <div class="layer-panel__item-preview">
        ${this.getLayerIcon(layer.type)}
      </div>
      <div class="layer-panel__item-info">
        <div class="layer-panel__item-name" contenteditable="true">${layer.name}</div>
        <div class="layer-panel__item-details">
          ${this.getLayerTypeText(layer.type)} · ${Math.round(layer.opacity * 100)}%
        </div>
      </div>
      <div class="layer-panel__item-controls">
        <button class="layer-panel__item-visibility ${layer.visible ? 'visible' : 'hidden'}" title="显示/隐藏">
          <svg viewBox="0 0 24 24" width="16" height="16">
            ${layer.visible ? 
              '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' :
              '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
            }
          </svg>
        </button>
        <button class="layer-panel__item-lock ${layer.locked ? 'locked' : 'unlocked'}" title="锁定/解锁">
          <svg viewBox="0 0 24 24" width="16" height="16">
            ${layer.locked ?
              '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>' :
              '<rect x="3" y="11" width="18" height="10" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/>'
            }
          </svg>
        </button>
      </div>
    `

    // 绑定图层项事件
    this.bindLayerItemEvents(item, layer)

    // 插入到列表顶部（新图层在上方）
    this.layerList.insertBefore(item, this.layerList.firstChild)
  }

  /**
   * 绑定图层项事件
   */
  private bindLayerItemEvents(item: HTMLElement, layer: Layer): void {
    // 点击选择图层
    item.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey) {
        this.layerSystem.selectLayer(layer.id, true)
      } else {
        this.layerSystem.selectLayer(layer.id, false)
      }
    })

    // 右键菜单
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.showContextMenu(e, layer)
    })

    // 图层名称编辑
    const nameElement = item.querySelector('.layer-panel__item-name')!
    nameElement.addEventListener('blur', () => {
      const newName = (nameElement as HTMLElement).textContent?.trim() || layer.name
      if (newName !== layer.name) {
        this.layerSystem.updateLayer(layer.id, { name: newName })
      }
    })

    nameElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        (nameElement as HTMLElement).blur()
      }
    })

    // 显示/隐藏按钮
    const visibilityBtn = item.querySelector('.layer-panel__item-visibility')!
    visibilityBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.layerSystem.updateLayer(layer.id, { visible: !layer.visible })
    })

    // 锁定/解锁按钮
    const lockBtn = item.querySelector('.layer-panel__item-lock')!
    lockBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.layerSystem.updateLayer(layer.id, { locked: !layer.locked })
    })

    // 拖拽事件
    item.draggable = true
    item.addEventListener('dragstart', (e) => this.onDragStart(e, layer))
    item.addEventListener('dragover', (e) => this.onDragOver(e))
    item.addEventListener('drop', (e) => this.onDrop(e))
    item.addEventListener('dragend', () => this.onDragEnd())
  }

  /**
   * 移除图层项目
   */
  private removeLayerItem(layerId: string): void {
    const item = this.layerList.querySelector(`[data-layer-id="${layerId}"]`)
    if (item) {
      item.remove()
    }
  }

  /**
   * 更新图层项目
   */
  private updateLayerItem(layer: Layer): void {
    const item = this.layerList.querySelector(`[data-layer-id="${layer.id}"]`)
    if (!item) return

    // 更新名称
    const nameElement = item.querySelector('.layer-panel__item-name')!
    if (nameElement.textContent !== layer.name) {
      nameElement.textContent = layer.name
    }

    // 更新详情
    const detailsElement = item.querySelector('.layer-panel__item-details')!
    detailsElement.textContent = `${this.getLayerTypeText(layer.type)} · ${Math.round(layer.opacity * 100)}%`

    // 更新可见性按钮
    const visibilityBtn = item.querySelector('.layer-panel__item-visibility')!
    visibilityBtn.className = `layer-panel__item-visibility ${layer.visible ? 'visible' : 'hidden'}`
    visibilityBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16">
        ${layer.visible ? 
          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' :
          '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
        }
      </svg>
    `

    // 更新锁定按钮
    const lockBtn = item.querySelector('.layer-panel__item-lock')!
    lockBtn.className = `layer-panel__item-lock ${layer.locked ? 'locked' : 'unlocked'}`
    lockBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16">
        ${layer.locked ?
          '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>' :
          '<rect x="3" y="11" width="18" height="10" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/>'
        }
      </svg>
    `
  }

  /**
   * 更新图层选择状态
   */
  private updateLayerSelection(): void {
    const selectedLayers = this.layerSystem.getSelectedLayers()
    const selectedIds = new Set(selectedLayers.map(l => l.id))

    // 更新所有图层项的选中状态
    this.layerList.querySelectorAll('.layer-panel__item').forEach(item => {
      const layerId = item.getAttribute('data-layer-id')!
      item.classList.toggle('selected', selectedIds.has(layerId))
    })

    // 更新删除按钮状态
    const deleteBtn = this.container.querySelector('.layer-panel__btn--delete')! as HTMLButtonElement
    deleteBtn.disabled = selectedLayers.length === 0
  }

  /**
   * 更新工具栏
   */
  private updateToolbar(): void {
    const selectedLayers = this.layerSystem.getSelectedLayers()
    
    if (selectedLayers.length === 1) {
      const layer = selectedLayers[0]
      
      // 更新混合模式选择
      const blendSelect = this.container.querySelector('.layer-panel__blend-select')! as HTMLSelectElement
      blendSelect.value = layer.blendMode

      // 更新不透明度滑块
      const opacitySlider = this.container.querySelector('.layer-panel__opacity-slider')! as HTMLInputElement
      const opacityValue = this.container.querySelector('.layer-panel__opacity-value')!
      const opacity = Math.round(layer.opacity * 100)
      opacitySlider.value = opacity.toString()
      opacityValue.textContent = `${opacity}%`
    }

    // 禁用/启用工具栏控件
    const blendSelect = this.container.querySelector('.layer-panel__blend-select')! as HTMLSelectElement
    const opacitySlider = this.container.querySelector('.layer-panel__opacity-slider')! as HTMLInputElement
    const disabled = selectedLayers.length === 0
    
    blendSelect.disabled = disabled
    opacitySlider.disabled = disabled
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const layerCount = this.layerSystem.getLayers().length
    const statsElement = this.container.querySelector('.layer-panel__layer-count')!
    statsElement.textContent = `${layerCount} 图层`
  }

  /**
   * 显示添加图层菜单
   */
  private showAddLayerMenu(): void {
    const menu = document.createElement('div')
    menu.className = 'layer-panel__add-menu'
    menu.innerHTML = `
      <div class="layer-panel__add-menu-item" data-type="text">
        ${this.getLayerIcon('text')} 文字图层
      </div>
      <div class="layer-panel__add-menu-item" data-type="shape">
        ${this.getLayerIcon('shape')} 形状图层
      </div>
      <div class="layer-panel__add-menu-item" data-type="border">
        ${this.getLayerIcon('border')} 边框图层
      </div>
      <div class="layer-panel__add-menu-item" data-type="sticker">
        ${this.getLayerIcon('sticker')} 贴纸图层
      </div>
    `

    // 定位菜单
    const addBtn = this.container.querySelector('.layer-panel__btn--add')!
    const rect = addBtn.getBoundingClientRect()
    menu.style.position = 'fixed'
    menu.style.top = `${rect.bottom + 5}px`
    menu.style.left = `${rect.left}px`

    document.body.appendChild(menu)

    // 绑定菜单事件
    menu.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.layer-panel__add-menu-item')
      if (target) {
        const type = target.getAttribute('data-type')!
        this.addLayer(type as LayerType)
      }
      menu.remove()
    })

    // 点击外部关闭菜单
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove()
        document.removeEventListener('click', closeMenu)
      }
    }
    setTimeout(() => document.addEventListener('click', closeMenu), 0)
  }

  /**
   * 添加图层
   */
  private addLayer(type: LayerType): void {
    switch (type) {
      case 'text':
        this.layerSystem.createTextLayer('双击编辑文字')
        break
      case 'shape':
        this.layerSystem.createShapeLayer({ type: 'rectangle' })
        break
      case 'border':
        this.layerSystem.createBorderLayer()
        break
      case 'sticker':
        this.layerSystem.createStickerLayer({
          stickerId: 'default',
          category: 'emoji',
          imageUrl: '',
          name: '贴纸',
          colorizable: true
        })
        break
    }
  }

  /**
   * 删除选中图层
   */
  private deleteSelectedLayers(): void {
    const selectedLayers = this.layerSystem.getSelectedLayers()
    selectedLayers.forEach(layer => {
      this.layerSystem.removeLayer(layer.id)
    })
  }

  /**
   * 显示右键菜单
   */
  private showContextMenu(e: MouseEvent, layer: Layer): void {
    if (this.contextMenu) {
      this.contextMenu.remove()
    }

    this.contextMenu = document.createElement('div')
    this.contextMenu.className = 'layer-panel__context-menu'
    this.contextMenu.innerHTML = `
      <div class="layer-panel__context-menu-item" data-action="duplicate">复制图层</div>
      <div class="layer-panel__context-menu-item" data-action="delete">删除图层</div>
      <div class="layer-panel__context-menu-separator"></div>
      <div class="layer-panel__context-menu-item" data-action="moveTop">移到顶部</div>
      <div class="layer-panel__context-menu-item" data-action="moveUp">向上移动</div>
      <div class="layer-panel__context-menu-item" data-action="moveDown">向下移动</div>
      <div class="layer-panel__context-menu-item" data-action="moveBottom">移到底部</div>
    `

    // 定位菜单
    this.contextMenu.style.position = 'fixed'
    this.contextMenu.style.top = `${e.clientY}px`
    this.contextMenu.style.left = `${e.clientX}px`

    document.body.appendChild(this.contextMenu)

    // 绑定菜单事件
    this.contextMenu.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.layer-panel__context-menu-item')
      if (target) {
        const action = target.getAttribute('data-action')!
        this.handleContextMenuAction(action, layer)
      }
      this.contextMenu?.remove()
      this.contextMenu = null
    })

    // 点击外部关闭菜单
    const closeMenu = (e: MouseEvent) => {
      if (this.contextMenu && !this.contextMenu.contains(e.target as Node)) {
        this.contextMenu.remove()
        this.contextMenu = null
        document.removeEventListener('click', closeMenu)
      }
    }
    setTimeout(() => document.addEventListener('click', closeMenu), 0)
  }

  /**
   * 处理右键菜单动作
   */
  private handleContextMenuAction(action: string, layer: Layer): void {
    const layers = this.layerSystem.getLayers()
    const currentIndex = layers.findIndex(l => l.id === layer.id)

    switch (action) {
      case 'duplicate':
        this.layerSystem.duplicateLayer(layer.id)
        break
      case 'delete':
        this.layerSystem.removeLayer(layer.id)
        break
      case 'moveTop':
        this.layerSystem.moveLayer(layer.id, layers.length - 1)
        break
      case 'moveUp':
        if (currentIndex < layers.length - 1) {
          this.layerSystem.moveLayer(layer.id, currentIndex + 1)
        }
        break
      case 'moveDown':
        if (currentIndex > 0) {
          this.layerSystem.moveLayer(layer.id, currentIndex - 1)
        }
        break
      case 'moveBottom':
        this.layerSystem.moveLayer(layer.id, 0)
        break
    }
  }

  /**
   * 拖拽开始
   */
  private onDragStart(e: DragEvent, layer: Layer): void {
    const item = e.currentTarget as HTMLElement
    const layers = this.layerSystem.getLayers()
    const startIndex = layers.findIndex(l => l.id === layer.id)

    this.dragData = {
      layerId: layer.id,
      startIndex,
      dragElement: item,
      placeholder: this.createPlaceholder()
    }

    e.dataTransfer?.setData('text/plain', layer.id)
    item.style.opacity = '0.5'
  }

  /**
   * 拖拽悬停
   */
  private onDragOver(e: DragEvent): void {
    e.preventDefault()
    
    if (!this.dragData) return

    const item = e.currentTarget as HTMLElement
    const rect = item.getBoundingClientRect()
    const y = e.clientY
    const itemMiddle = rect.top + rect.height / 2

    // 决定插入位置
    if (y < itemMiddle) {
      item.parentNode?.insertBefore(this.dragData.placeholder, item)
    } else {
      item.parentNode?.insertBefore(this.dragData.placeholder, item.nextSibling)
    }
  }

  /**
   * 拖拽放置
   */
  private onDrop(e: DragEvent): void {
    e.preventDefault()
    
    if (!this.dragData) return

    const placeholder = this.dragData.placeholder
    const newIndex = Array.from(this.layerList.children).indexOf(placeholder)
    
    if (newIndex !== -1) {
      // 由于图层列表是倒序显示的，需要转换索引
      const layers = this.layerSystem.getLayers()
      const actualIndex = layers.length - 1 - newIndex
      this.layerSystem.moveLayer(this.dragData.layerId, actualIndex)
    }
  }

  /**
   * 拖拽结束
   */
  private onDragEnd(): void {
    if (!this.dragData) return

    this.dragData.dragElement.style.opacity = ''
    this.dragData.placeholder.remove()
    this.dragData = null
  }

  /**
   * 创建占位元素
   */
  private createPlaceholder(): HTMLElement {
    const placeholder = document.createElement('div')
    placeholder.className = 'layer-panel__placeholder'
    placeholder.style.height = `${this.config.itemHeight}px`
    return placeholder
  }

  /**
   * 获取图层图标
   */
  private getLayerIcon(type: LayerType | string): string {
    switch (type) {
      case 'text':
        return '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-2v12a3 3 0 01-3 3H9a3 3 0 01-3-3V6H4a1 1 0 110-2h3z" fill="currentColor"/></svg>'
      case 'shape':
        return '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
      case 'border':
        return '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 3h18v18H3V3zm2 2v14h14V5H5z" fill="currentColor"/></svg>'
      case 'sticker':
        return '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="9" cy="9" r="2" fill="currentColor"/><circle cx="15" cy="9" r="2" fill="currentColor"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
      case 'image':
        return '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
      default:
        return '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="3" width="18" height="18" fill="currentColor" opacity="0.3"/></svg>'
    }
  }

  /**
   * 获取图层类型文本
   */
  private getLayerTypeText(type: LayerType): string {
    switch (type) {
      case LayerType.TEXT:
        return '文字'
      case LayerType.SHAPE:
        return '形状'
      case LayerType.BORDER:
        return '边框'
      case LayerType.STICKER:
        return '贴纸'
      case LayerType.IMAGE:
        return '图片'
      default:
        return '图层'
    }
  }

  /**
   * 创建样式
   */
  private createStyles(): void {
    const styleId = 'layer-panel-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .layer-panel {
        background: #f8f9fa;
        border-left: 1px solid #e9ecef;
        display: flex;
        flex-direction: column;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
      }

      .layer-panel--dark {
        background: #2d3748;
        border-left-color: #4a5568;
        color: #e2e8f0;
      }

      .layer-panel__header {
        padding: 12px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
      }

      .layer-panel--dark .layer-panel__header {
        background: #1a202c;
        border-bottom-color: #4a5568;
      }

      .layer-panel__title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .layer-panel__header-actions {
        display: flex;
        gap: 4px;
      }

      .layer-panel__btn {
        background: none;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layer-panel__btn:hover {
        background: #f7fafc;
      }

      .layer-panel__btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .layer-panel--dark .layer-panel__btn {
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .layer-panel--dark .layer-panel__btn:hover {
        background: #2d3748;
      }

      .layer-panel__toolbar {
        padding: 12px;
        border-bottom: 1px solid #e9ecef;
        background: #fff;
      }

      .layer-panel--dark .layer-panel__toolbar {
        background: #1a202c;
        border-bottom-color: #4a5568;
      }

      .layer-panel__blend-mode,
      .layer-panel__opacity {
        margin-bottom: 12px;
      }

      .layer-panel__blend-mode:last-child,
      .layer-panel__opacity:last-child {
        margin-bottom: 0;
      }

      .layer-panel__blend-mode label,
      .layer-panel__opacity label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .layer-panel__blend-select,
      .layer-panel__opacity-slider {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: #fff;
      }

      .layer-panel--dark .layer-panel__blend-select {
        background: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .layer-panel__opacity {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .layer-panel__opacity label {
        margin: 0;
        white-space: nowrap;
      }

      .layer-panel__opacity-value {
        font-weight: 600;
        min-width: 35px;
        text-align: right;
      }

      .layer-panel__list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }

      .layer-panel__item {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        margin-bottom: 4px;
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .layer-panel__item:hover {
        border-color: #cbd5e0;
        background: #f7fafc;
      }

      .layer-panel__item.selected {
        border-color: #3182ce;
        background: #ebf8ff;
      }

      .layer-panel--dark .layer-panel__item {
        background: #2d3748;
        border-color: #4a5568;
      }

      .layer-panel--dark .layer-panel__item:hover {
        background: #4a5568;
      }

      .layer-panel--dark .layer-panel__item.selected {
        border-color: #63b3ed;
        background: #2c5282;
      }

      .layer-panel__item-preview {
        width: 40px;
        height: 40px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .layer-panel--dark .layer-panel__item-preview {
        background: #1a202c;
        border-color: #4a5568;
      }

      .layer-panel__item-info {
        flex: 1;
        min-width: 0;
      }

      .layer-panel__item-name {
        font-weight: 500;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .layer-panel__item-name:focus {
        outline: none;
        background: rgba(49, 130, 206, 0.1);
        border-radius: 2px;
      }

      .layer-panel__item-details {
        font-size: 11px;
        color: #718096;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .layer-panel--dark .layer-panel__item-details {
        color: #a0aec0;
      }

      .layer-panel__item-controls {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .layer-panel__item:hover .layer-panel__item-controls,
      .layer-panel__item.selected .layer-panel__item-controls {
        opacity: 1;
      }

      .layer-panel__item-visibility,
      .layer-panel__item-lock {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        color: #718096;
      }

      .layer-panel__item-visibility:hover,
      .layer-panel__item-lock:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .layer-panel--dark .layer-panel__item-visibility,
      .layer-panel--dark .layer-panel__item-lock {
        color: #a0aec0;
      }

      .layer-panel--dark .layer-panel__item-visibility:hover,
      .layer-panel--dark .layer-panel__item-lock:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .layer-panel__footer {
        padding: 8px 12px;
        border-top: 1px solid #e9ecef;
        background: #f8f9fa;
      }

      .layer-panel--dark .layer-panel__footer {
        background: #2d3748;
        border-top-color: #4a5568;
      }

      .layer-panel__layer-count {
        font-size: 11px;
        color: #718096;
      }

      .layer-panel--dark .layer-panel__layer-count {
        color: #a0aec0;
      }

      .layer-panel__add-menu,
      .layer-panel__context-menu {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        min-width: 150px;
        overflow: hidden;
      }

      .layer-panel--dark .layer-panel__add-menu,
      .layer-panel--dark .layer-panel__context-menu {
        background: #2d3748;
        border-color: #4a5568;
      }

      .layer-panel__add-menu-item,
      .layer-panel__context-menu-item {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }

      .layer-panel__add-menu-item:hover,
      .layer-panel__context-menu-item:hover {
        background: #f7fafc;
      }

      .layer-panel--dark .layer-panel__add-menu-item:hover,
      .layer-panel--dark .layer-panel__context-menu-item:hover {
        background: #4a5568;
      }

      .layer-panel__context-menu-separator {
        height: 1px;
        background: #e2e8f0;
        margin: 4px 0;
      }

      .layer-panel--dark .layer-panel__context-menu-separator {
        background: #4a5568;
      }

      .layer-panel__placeholder {
        background: rgba(49, 130, 206, 0.2);
        border: 2px dashed #3182ce;
        border-radius: 6px;
        margin-bottom: 4px;
      }
    `
    
    document.head.appendChild(style)
  }

  /**
   * 刷新图层列表
   */
  refresh(): void {
    this.layerList.innerHTML = ''
    const layers = this.layerSystem.getLayers()
    
    // 反向遍历以正确显示图层顺序（最新的在上方）
    for (let i = layers.length - 1; i >= 0; i--) {
      this.addLayerItem(layers[i])
    }
    
    this.updateStats()
    this.updateLayerSelection()
    this.updateToolbar()
  }

  /**
   * 销毁面板
   */
  destroy(): void {
    // 移除事件监听器
    for (const [event, handler] of this.eventListeners) {
      this.layerSystem.off(event, handler)
    }

    // 清理右键菜单
    if (this.contextMenu) {
      this.contextMenu.remove()
    }

    // 清空容器
    this.container.innerHTML = ''
  }
}

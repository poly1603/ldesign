import { BasePlugin } from '../base-plugin'
import { LDesignEditor } from '../../core/editor'
import { ToolbarItem } from '../../types'

/**
 * 表格配置接口
 */
export interface TableConfig {
  /** 是否启用表格功能 */
  enabled?: boolean
  /** 默认表格行数 */
  defaultRows?: number
  /** 默认表格列数 */
  defaultCols?: number
  /** 最大表格行数 */
  maxRows?: number
  /** 最大表格列数 */
  maxCols?: number
  /** 是否显示表格边框 */
  showBorders?: boolean
  /** 默认表格样式 */
  defaultStyle?: {
    borderColor?: string
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
  }
}

/**
 * 表格插件类
 * 提供表格的创建、编辑、样式设置等功能
 */
export class TablePlugin extends BasePlugin {
  name = 'table'
  
  private config: Required<TableConfig>
  private tableDialog: HTMLElement | null = null
  private contextMenu: HTMLElement | null = null
  private styleDialog: HTMLElement | null = null
  private currentTable: HTMLTableElement | null = null

  constructor(editor: LDesignEditor, config: TableConfig = {}) {
    super(editor)
    
    // 设置默认配置
    this.config = {
      enabled: true,
      defaultRows: 3,
      defaultCols: 3,
      maxRows: 20,
      maxCols: 10,
      showBorders: true,
      defaultStyle: {
        borderColor: '#ddd',
        backgroundColor: 'transparent',
        textAlign: 'left'
      },
      ...config
    }
  }

  /**
   * 初始化插件
   */
  init(): void {
    if (!this.config.enabled) return

    this.registerCommands()
    this.registerEventHandlers()
    this.createTableDialog()
    this.createContextMenu()
    this.createStyleDialog()
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    this.removeTableDialog()
    this.removeContextMenu()
    this.removeStyleDialog()
    super.destroy()
  }

  /**
   * 获取工具栏项
   */
  getToolbarItems(): ToolbarItem[] {
    if (!this.config.enabled) return []

    return [
      {
        id: 'table',
        type: 'button',
        label: '表格',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="3" width="12" height="10" fill="none" stroke="currentColor" stroke-width="1"/>
          <line x1="2" y1="7" x2="14" y2="7" stroke="currentColor" stroke-width="1"/>
          <line x1="6" y1="3" x2="6" y2="13" stroke="currentColor" stroke-width="1"/>
          <line x1="10" y1="3" x2="10" y2="13" stroke="currentColor" stroke-width="1"/>
        </svg>`,
        title: '插入表格',
        command: 'insertTable',
        group: 'table'
      }
    ]
  }

  /**
   * 注册命令
   */
  private registerCommands(): void {
    // 插入表格命令
    this.editor.commands.register({
      name: 'insertTable',
      execute: () => this.showTableDialog()
    })

    // 插入行命令
    this.editor.commands.register({
      name: 'insertTableRow',
      execute: (position: 'before' | 'after' = 'after') => this.insertTableRow(position)
    })

    // 删除行命令
    this.editor.commands.register({
      name: 'deleteTableRow',
      execute: () => this.deleteTableRow()
    })

    // 插入列命令
    this.editor.commands.register({
      name: 'insertTableColumn',
      execute: (position: 'before' | 'after' = 'after') => this.insertTableColumn(position)
    })

    // 删除列命令
    this.editor.commands.register({
      name: 'deleteTableColumn',
      execute: () => this.deleteTableColumn()
    })

    // 删除表格命令
    this.editor.commands.register({
      name: 'deleteTable',
      execute: () => this.deleteTable()
    })

    // 设置表格样式命令
    this.editor.commands.register({
      name: 'setTableStyle',
      execute: (style: any) => this.setTableStyle(style)
    })

    // 显示表格样式对话框命令
    this.editor.commands.register({
      name: 'showTableStyleDialog',
      execute: () => this.showTableStyleDialog()
    })
  }

  /**
   * 注册事件处理器
   */
  private registerEventHandlers(): void {
    // 监听右键点击事件
    this.editor.on('contextmenu', (event) => {
      const target = event.target as HTMLElement
      const table = target.closest('table')
      
      if (table) {
        event.preventDefault()
        this.currentTable = table
        this.showContextMenu(event.clientX, event.clientY)
      } else {
        this.hideContextMenu()
      }
    })

    // 监听点击事件，隐藏上下文菜单
    this.editor.on('click', () => {
      this.hideContextMenu()
    })
  }

  /**
   * 显示表格创建对话框
   */
  private showTableDialog(): void {
    if (!this.tableDialog) return

    this.tableDialog.style.display = 'block'
    
    // 重置表格选择
    const cells = this.tableDialog.querySelectorAll('.table-cell')
    cells.forEach(cell => cell.classList.remove('selected'))
    
    // 更新显示文本
    const display = this.tableDialog.querySelector('.table-size-display')
    if (display) {
      display.textContent = `${this.config.defaultRows} × ${this.config.defaultCols}`
    }
  }

  /**
   * 隐藏表格创建对话框
   */
  private hideTableDialog(): void {
    if (!this.tableDialog) return
    this.tableDialog.style.display = 'none'
  }

  /**
   * 创建表格对话框
   */
  private createTableDialog(): void {
    this.tableDialog = document.createElement('div')
    this.tableDialog.className = 'ldesign-table-dialog'
    this.tableDialog.innerHTML = `
      <div class="table-dialog-content">
        <div class="table-dialog-header">
          <h3>插入表格</h3>
          <button class="dialog-close" type="button">×</button>
        </div>
        <div class="table-dialog-body">
          <div class="table-size-selector">
            <div class="table-grid"></div>
            <div class="table-size-display">${this.config.defaultRows} × ${this.config.defaultCols}</div>
          </div>
          <div class="table-options">
            <label>
              <input type="checkbox" id="table-borders" checked="${this.config.showBorders}">
              显示边框
            </label>
          </div>
        </div>
        <div class="table-dialog-footer">
          <button class="btn btn-secondary dialog-cancel">取消</button>
          <button class="btn btn-primary dialog-confirm">确定</button>
        </div>
      </div>
    `

    // 生成表格选择网格
    const grid = this.tableDialog.querySelector('.table-grid')
    if (grid) {
      this.createTableGrid(grid as HTMLElement)
    }

    // 绑定事件
    this.bindTableDialogEvents()

    // 添加到编辑器容器
    this.editor.container.appendChild(this.tableDialog)
  }

  /**
   * 创建表格选择网格
   */
  private createTableGrid(container: HTMLElement): void {
    container.innerHTML = ''
    
    for (let row = 0; row < this.config.maxRows; row++) {
      for (let col = 0; col < this.config.maxCols; col++) {
        const cell = document.createElement('div')
        cell.className = 'table-cell'
        cell.dataset.row = row.toString()
        cell.dataset.col = col.toString()
        
        cell.addEventListener('mouseenter', () => {
          this.highlightTableCells(row + 1, col + 1)
        })
        
        cell.addEventListener('click', () => {
          this.createTable(row + 1, col + 1)
          this.hideTableDialog()
        })
        
        container.appendChild(cell)
      }
    }
  }

  /**
   * 高亮表格单元格
   */
  private highlightTableCells(rows: number, cols: number): void {
    if (!this.tableDialog) return

    const cells = this.tableDialog.querySelectorAll('.table-cell')
    const display = this.tableDialog.querySelector('.table-size-display')
    
    cells.forEach((cell) => {
      const row = parseInt((cell as HTMLElement).dataset.row || '0')
      const col = parseInt((cell as HTMLElement).dataset.col || '0')
      
      if (row < rows && col < cols) {
        cell.classList.add('selected')
      } else {
        cell.classList.remove('selected')
      }
    })
    
    if (display) {
      display.textContent = `${rows} × ${cols}`
    }
  }

  /**
   * 创建表格
   */
  private createTable(rows: number, cols: number): void {
    const showBorders = (this.tableDialog?.querySelector('#table-borders') as HTMLInputElement)?.checked ?? this.config.showBorders

    let html = '<table'
    
    if (showBorders) {
      html += ' style="border-collapse: collapse; border: 1px solid ' + this.config.defaultStyle.borderColor + ';"'
    }
    
    html += '><tbody>'
    
    for (let i = 0; i < rows; i++) {
      html += '<tr>'
      for (let j = 0; j < cols; j++) {
        const cellStyle = showBorders ? 
          ` style="border: 1px solid ${this.config.defaultStyle.borderColor}; padding: 8px; text-align: ${this.config.defaultStyle.textAlign};"` : 
          ' style="padding: 8px;"'
        html += `<td${cellStyle}><br></td>`
      }
      html += '</tr>'
    }
    
    html += '</tbody></table>'
    
    // 插入表格到编辑器
    this.editor.commands.execute('insertHTML', html)
    
    // 记录历史
    this.editor.history?.record('插入表格')
  }

  /**
   * 绑定表格对话框事件
   */
  private bindTableDialogEvents(): void {
    if (!this.tableDialog) return

    // 关闭按钮
    const closeBtn = this.tableDialog.querySelector('.dialog-close')
    const cancelBtn = this.tableDialog.querySelector('.dialog-cancel')
    
    closeBtn?.addEventListener('click', () => this.hideTableDialog())
    cancelBtn?.addEventListener('click', () => this.hideTableDialog())

    // 确定按钮
    const confirmBtn = this.tableDialog.querySelector('.dialog-confirm')
    confirmBtn?.addEventListener('click', () => {
      this.createTable(this.config.defaultRows, this.config.defaultCols)
      this.hideTableDialog()
    })

    // 点击外部关闭
    this.tableDialog.addEventListener('click', (e) => {
      if (e.target === this.tableDialog) {
        this.hideTableDialog()
      }
    })
  }

  /**
   * 移除表格对话框
   */
  private removeTableDialog(): void {
    if (this.tableDialog) {
      this.tableDialog.remove()
      this.tableDialog = null
    }
  }

  /**
   * 创建右键菜单
   */
  private createContextMenu(): void {
    this.contextMenu = document.createElement('div')
    this.contextMenu.className = 'ldesign-table-context-menu'
    this.contextMenu.style.display = 'none'
    this.contextMenu.innerHTML = `
      <div class="context-menu-item" data-command="insertTableRow" data-position="before">在上方插入行</div>
      <div class="context-menu-item" data-command="insertTableRow" data-position="after">在下方插入行</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-command="insertTableColumn" data-position="before">在左侧插入列</div>
      <div class="context-menu-item" data-command="insertTableColumn" data-position="after">在右侧插入列</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-command="deleteTableRow">删除当前行</div>
      <div class="context-menu-item" data-command="deleteTableColumn">删除当前列</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-command="showTableStyleDialog">表格样式</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-command="deleteTable">删除表格</div>
    `

    // 绑定事件
    this.contextMenu.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.context-menu-item')
      if (item) {
        const command = item.getAttribute('data-command')
        const position = item.getAttribute('data-position')
        
        if (command) {
          this.editor.commands.execute(command, position)
          this.hideContextMenu()
        }
      }
    })

    document.body.appendChild(this.contextMenu)
  }

  /**
   * 显示右键菜单
   */
  private showContextMenu(x: number, y: number): void {
    if (!this.contextMenu) return

    this.contextMenu.style.display = 'block'
    this.contextMenu.style.left = x + 'px'
    this.contextMenu.style.top = y + 'px'

    // 确保菜单不会超出视口
    const rect = this.contextMenu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (rect.right > viewportWidth) {
      this.contextMenu.style.left = (x - rect.width) + 'px'
    }

    if (rect.bottom > viewportHeight) {
      this.contextMenu.style.top = (y - rect.height) + 'px'
    }
  }

  /**
   * 隐藏右键菜单
   */
  private hideContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.style.display = 'none'
    }
  }

  /**
   * 移除右键菜单
   */
  private removeContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.remove()
      this.contextMenu = null
    }
  }

  /**
   * 插入表格行
   */
  private insertTableRow(position: 'before' | 'after'): void {
    if (!this.currentTable) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // 找到当前单元格
    const range = selection.getRangeAt(0)
    const currentCell = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? range.startContainer as Element
      : range.startContainer.parentElement
    
    const cell = currentCell?.closest('td, th')
    if (!cell) return

    const currentRow = cell.closest('tr')
    if (!currentRow) return

    // 创建新行
    const newRow = document.createElement('tr')
    const cellCount = currentRow.children.length
    
    for (let i = 0; i < cellCount; i++) {
      const newCell = document.createElement('td')
      const oldCell = currentRow.children[i] as HTMLTableCellElement
      
      // 复制样式
      if (oldCell.style.cssText) {
        newCell.style.cssText = oldCell.style.cssText
      }
      
      newCell.innerHTML = '<br>'
      newRow.appendChild(newCell)
    }

    // 插入新行
    if (position === 'before') {
      currentRow.parentNode?.insertBefore(newRow, currentRow)
    } else {
      currentRow.parentNode?.insertBefore(newRow, currentRow.nextSibling)
    }

    // 记录历史
    this.editor.history?.record('插入表格行')
  }

  /**
   * 删除表格行
   */
  private deleteTableRow(): void {
    if (!this.currentTable) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const currentCell = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? range.startContainer as Element
      : range.startContainer.parentElement
    
    const cell = currentCell?.closest('td, th')
    if (!cell) return

    const currentRow = cell.closest('tr')
    if (!currentRow) return

    const tbody = currentRow.parentNode
    if (!tbody) return

    // 检查是否为最后一行
    if (tbody.children.length <= 1) {
      // 如果只剩一行，删除整个表格
      this.deleteTable()
      return
    }

    // 删除行
    currentRow.remove()

    // 记录历史
    this.editor.history?.record('删除表格行')
  }

  /**
   * 插入表格列
   */
  private insertTableColumn(position: 'before' | 'after'): void {
    if (!this.currentTable) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const currentCell = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? range.startContainer as Element
      : range.startContainer.parentElement
    
    const cell = currentCell?.closest('td, th')
    if (!cell) return

    const currentRow = cell.closest('tr')
    if (!currentRow) return

    // 找到列索引
    const cellIndex = Array.from(currentRow.children).indexOf(cell as Element)
    const insertIndex = position === 'before' ? cellIndex : cellIndex + 1

    // 为每一行插入新单元格
    const tbody = this.currentTable.querySelector('tbody, table')
    if (!tbody) return

    const rows = tbody.querySelectorAll('tr')
    rows.forEach(row => {
      const newCell = document.createElement(row.querySelector('th') ? 'th' : 'td')
      
      // 复制样式
      const referenceCell = row.children[cellIndex] as HTMLTableCellElement
      if (referenceCell && referenceCell.style.cssText) {
        newCell.style.cssText = referenceCell.style.cssText
      }
      
      newCell.innerHTML = '<br>'
      
      if (insertIndex >= row.children.length) {
        row.appendChild(newCell)
      } else {
        row.insertBefore(newCell, row.children[insertIndex])
      }
    })

    // 记录历史
    this.editor.history?.record('插入表格列')
  }

  /**
   * 删除表格列
   */
  private deleteTableColumn(): void {
    if (!this.currentTable) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const currentCell = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? range.startContainer as Element
      : range.startContainer.parentElement
    
    const cell = currentCell?.closest('td, th')
    if (!cell) return

    const currentRow = cell.closest('tr')
    if (!currentRow) return

    // 检查是否为最后一列
    if (currentRow.children.length <= 1) {
      // 如果只剩一列，删除整个表格
      this.deleteTable()
      return
    }

    // 找到列索引
    const cellIndex = Array.from(currentRow.children).indexOf(cell as Element)

    // 删除每一行的对应单元格
    const tbody = this.currentTable.querySelector('tbody, table')
    if (!tbody) return

    const rows = tbody.querySelectorAll('tr')
    rows.forEach(row => {
      if (row.children[cellIndex]) {
        row.children[cellIndex].remove()
      }
    })

    // 记录历史
    this.editor.history?.record('删除表格列')
  }

  /**
   * 删除整个表格
   */
  private deleteTable(): void {
    if (!this.currentTable) return

    this.currentTable.remove()
    this.currentTable = null
    this.hideContextMenu()

    // 记录历史
    this.editor.history?.record('删除表格')
  }

  /**
   * 设置表格样式
   */
  private setTableStyle(style: any): void {
    if (!this.currentTable) return

    // 设置表格样式
    if (style.borderColor) {
      this.currentTable.style.borderColor = style.borderColor
      this.currentTable.style.border = `1px solid ${style.borderColor}`
      
      // 设置所有单元格边框颜色
      const cells = this.currentTable.querySelectorAll('td, th')
      cells.forEach(cell => {
        (cell as HTMLElement).style.borderColor = style.borderColor
        ;(cell as HTMLElement).style.border = `1px solid ${style.borderColor}`
      })
    }

    if (style.backgroundColor) {
      this.currentTable.style.backgroundColor = style.backgroundColor
    }

    if (style.textAlign) {
      const cells = this.currentTable.querySelectorAll('td, th')
      cells.forEach(cell => {
        (cell as HTMLElement).style.textAlign = style.textAlign
      })
    }

    if (style.width) {
      this.currentTable.style.width = style.width
    }

    if (style.borderCollapse !== undefined) {
      this.currentTable.style.borderCollapse = style.borderCollapse ? 'collapse' : 'separate'
    }

    if (style.padding) {
      const cells = this.currentTable.querySelectorAll('td, th')
      cells.forEach(cell => {
        (cell as HTMLElement).style.padding = style.padding
      })
    }

    // 记录历史
    this.editor.history?.record('设置表格样式')
  }

  /**
   * 获取当前选中的单元格
   */
  private getCurrentCell(): HTMLTableCellElement | null {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    const element = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? range.startContainer as Element
      : range.startContainer.parentElement
    
    return element?.closest('td, th') as HTMLTableCellElement || null
  }

  /**
   * 合并单元格
   */
  private mergeCells(): void {
    // TODO: 实现单元格合并功能
    // 这是一个复杂功能，需要处理选区、colspan、rowspan等
    console.log('合并单元格功能待实现')
  }

  /**
   * 拆分单元格
   */
  private splitCells(): void {
    // TODO: 实现单元格拆分功能
    // 需要处理colspan和rowspan的拆分
    console.log('拆分单元格功能待实现')
  }

  /**
   * 显示表格样式对话框
   */
  private showTableStyleDialog(): void {
    if (!this.styleDialog || !this.currentTable) return

    // 获取当前表格样式
    const tableStyle = window.getComputedStyle(this.currentTable)
    const cell = this.currentTable.querySelector('td, th') as HTMLElement
    const cellStyle = cell ? window.getComputedStyle(cell) : null

    // 填充当前值
    const borderColorInput = this.styleDialog.querySelector('#table-border-color') as HTMLInputElement
    const bgColorInput = this.styleDialog.querySelector('#table-bg-color') as HTMLInputElement
    const textAlignSelect = this.styleDialog.querySelector('#table-text-align') as HTMLSelectElement
    const paddingInput = this.styleDialog.querySelector('#table-padding') as HTMLInputElement
    const widthInput = this.styleDialog.querySelector('#table-width') as HTMLInputElement

    if (borderColorInput && tableStyle.borderColor) {
      // 将 RGB 颜色转换为 HEX
      const rgb = tableStyle.borderColor.match(/rgb\((\d+), (\d+), (\d+)\)/)
      if (rgb) {
        const hex = '#' + [rgb[1], rgb[2], rgb[3]].map(x => {
          const h = parseInt(x).toString(16)
          return h.length === 1 ? '0' + h : h
        }).join('')
        borderColorInput.value = hex
      }
    }

    if (bgColorInput && tableStyle.backgroundColor) {
      const rgb = tableStyle.backgroundColor.match(/rgb\((\d+), (\d+), (\d+)\)/)
      if (rgb) {
        const hex = '#' + [rgb[1], rgb[2], rgb[3]].map(x => {
          const h = parseInt(x).toString(16)
          return h.length === 1 ? '0' + h : h
        }).join('')
        bgColorInput.value = hex
      }
    }

    if (textAlignSelect && cellStyle?.textAlign) {
      textAlignSelect.value = cellStyle.textAlign
    }

    if (paddingInput && cellStyle?.padding) {
      paddingInput.value = cellStyle.padding.replace('px', '')
    }

    if (widthInput && tableStyle.width) {
      widthInput.value = tableStyle.width.replace('px', '')
    }

    this.styleDialog.style.display = 'block'
  }

  /**
   * 隐藏表格样式对话框
   */
  private hideTableStyleDialog(): void {
    if (!this.styleDialog) return
    this.styleDialog.style.display = 'none'
  }

  /**
   * 创建表格样式对话框
   */
  private createStyleDialog(): void {
    this.styleDialog = document.createElement('div')
    this.styleDialog.className = 'ldesign-table-style-dialog'
    this.styleDialog.innerHTML = `
      <div class="style-dialog-content">
        <div class="style-dialog-header">
          <h3>表格样式设置</h3>
          <button class="dialog-close" type="button">×</button>
        </div>
        <div class="style-dialog-body">
          <div class="form-group">
            <label for="table-border-color">边框颜色：</label>
            <input type="color" id="table-border-color" value="#dddddd">
          </div>
          <div class="form-group">
            <label for="table-bg-color">背景颜色：</label>
            <input type="color" id="table-bg-color" value="#ffffff">
          </div>
          <div class="form-group">
            <label for="table-text-align">文本对齐：</label>
            <select id="table-text-align">
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
          <div class="form-group">
            <label for="table-padding">内边距 (px)：</label>
            <input type="number" id="table-padding" value="8" min="0" max="50">
          </div>
          <div class="form-group">
            <label for="table-width">表格宽度 (px)：</label>
            <input type="number" id="table-width" value="" placeholder="自动" min="100">
          </div>
        </div>
        <div class="style-dialog-footer">
          <button class="btn btn-secondary dialog-cancel">取消</button>
          <button class="btn btn-primary dialog-apply">应用</button>
        </div>
      </div>
    `

    // 绑定事件
    this.bindStyleDialogEvents()

    // 添加到编辑器容器
    this.editor.container.appendChild(this.styleDialog)
  }

  /**
   * 绑定表格样式对话框事件
   */
  private bindStyleDialogEvents(): void {
    if (!this.styleDialog) return

    // 关闭按钮
    const closeBtn = this.styleDialog.querySelector('.dialog-close')
    const cancelBtn = this.styleDialog.querySelector('.dialog-cancel')
    
    closeBtn?.addEventListener('click', () => this.hideTableStyleDialog())
    cancelBtn?.addEventListener('click', () => this.hideTableStyleDialog())

    // 应用按钮
    const applyBtn = this.styleDialog.querySelector('.dialog-apply')
    applyBtn?.addEventListener('click', () => {
      this.applyTableStyle()
      this.hideTableStyleDialog()
    })

    // 点击外部关闭
    this.styleDialog.addEventListener('click', (e) => {
      if (e.target === this.styleDialog) {
        this.hideTableStyleDialog()
      }
    })
  }

  /**
   * 应用表格样式
   */
  private applyTableStyle(): void {
    if (!this.styleDialog) return

    const borderColor = (this.styleDialog.querySelector('#table-border-color') as HTMLInputElement).value
    const backgroundColor = (this.styleDialog.querySelector('#table-bg-color') as HTMLInputElement).value
    const textAlign = (this.styleDialog.querySelector('#table-text-align') as HTMLSelectElement).value
    const padding = (this.styleDialog.querySelector('#table-padding') as HTMLInputElement).value
    const width = (this.styleDialog.querySelector('#table-width') as HTMLInputElement).value

    const style: any = {
      borderColor,
      backgroundColor,
      textAlign,
      padding: padding ? `${padding}px` : '8px'
    }

    if (width) {
      style.width = `${width}px`
    }

    this.setTableStyle(style)
  }

  /**
   * 移除表格样式对话框
   */
  private removeStyleDialog(): void {
    if (this.styleDialog) {
      this.styleDialog.remove()
      this.styleDialog = null
    }
  }
}

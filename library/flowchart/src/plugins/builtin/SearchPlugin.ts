/**
 * 搜索插件
 * 
 * 为流程图编辑器提供高级搜索功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'
import {
  SearchEngine,
  type SearchConfig,
  type SearchCriteria,
  type SearchResultSet,
  type SearchQuery,
  type SearchFilter
} from '../../search'

/**
 * 搜索插件配置
 */
export interface SearchPluginConfig extends Partial<SearchConfig> {
  /** 是否显示搜索面板 */
  showSearchPanel?: boolean
  /** 搜索面板位置 */
  searchPanelPosition?: 'top' | 'right' | 'bottom' | 'left'
  /** 是否启用快捷键 */
  enableShortcuts?: boolean
  /** 搜索快捷键 */
  searchShortcut?: string
}

/**
 * 搜索插件类
 */
export class SearchPlugin extends BasePlugin<SearchPluginConfig> {
  readonly name = 'search'
  readonly version = '1.0.0'
  readonly description = '高级搜索功能插件'

  private searchEngine?: SearchEngine
  private searchPanel?: HTMLElement
  private config?: SearchPluginConfig
  private isEnabled: boolean = false

  /**
   * 安装插件
   */
  protected onInstall(): void {
    if (!this.editor) {
      throw new Error('编辑器实例未找到')
    }

    // 监听编辑器事件
    this.setupEditorEventListeners()
    
    console.log('搜索插件安装完成')
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.disableSearch()
    this.removeEditorEventListeners()
    this.removeSearchPanel()
    
    console.log('搜索插件卸载完成')
  }

  /**
   * 启用搜索功能
   */
  async enableSearch(config?: SearchPluginConfig): Promise<void> {
    if (this.isEnabled) {
      return
    }

    this.config = {
      enableFullTextSearch: true,
      enablePropertySearch: true,
      enableTagSearch: true,
      indexingStrategy: 'realtime',
      maxResults: 100,
      searchTimeout: 5000,
      enableSearchHistory: true,
      maxSearchHistory: 50,
      enableSearchSuggestions: true,
      minSearchLength: 2,
      showSearchPanel: true,
      searchPanelPosition: 'right',
      enableShortcuts: true,
      searchShortcut: 'Ctrl+F',
      ...config
    }

    try {
      // 创建搜索引擎
      this.searchEngine = new SearchEngine(this.config)
      
      // 设置搜索引擎事件监听器
      this.setupSearchEngineEventListeners()
      
      // 构建初始索引
      const flowchartData = this.editor!.getData()
      await this.searchEngine.buildIndex(flowchartData)
      
      // 创建搜索面板
      if (this.config.showSearchPanel) {
        this.createSearchPanel()
      }
      
      // 设置快捷键
      if (this.config.enableShortcuts) {
        this.setupShortcuts()
      }
      
      this.isEnabled = true
      
      // 触发搜索启用事件
      this.editor!.emit('search:enabled')
      
      console.log('搜索功能启用成功')
    } catch (error) {
      console.error('启用搜索功能失败:', error)
      throw error
    }
  }

  /**
   * 禁用搜索功能
   */
  disableSearch(): void {
    if (!this.isEnabled) {
      return
    }

    try {
      // 移除搜索面板
      this.removeSearchPanel()
      
      // 移除快捷键
      this.removeShortcuts()
      
      // 移除事件监听器
      this.removeSearchEngineEventListeners()
      
      this.searchEngine = undefined
      this.isEnabled = false
      
      // 触发搜索禁用事件
      this.editor!.emit('search:disabled')
      
      console.log('搜索功能已禁用')
    } catch (error) {
      console.error('禁用搜索功能失败:', error)
    }
  }

  /**
   * 执行搜索
   */
  async search(criteria: SearchCriteria): Promise<SearchResultSet> {
    if (!this.searchEngine) {
      throw new Error('搜索功能未启用')
    }

    return this.searchEngine.search(criteria)
  }

  /**
   * 快速搜索
   */
  async quickSearch(text: string): Promise<SearchResultSet> {
    if (!this.searchEngine) {
      throw new Error('搜索功能未启用')
    }

    const criteria: SearchCriteria = {
      query: { text },
      filters: [],
      sorting: { field: 'score', direction: 'desc' },
      pagination: { page: 0, pageSize: 20 }
    }

    return this.search(criteria)
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(query: string): Promise<any[]> {
    if (!this.searchEngine) {
      return []
    }

    return this.searchEngine.getSuggestions(query)
  }

  /**
   * 获取搜索历史
   */
  getSearchHistory(): any[] {
    if (!this.searchEngine) {
      return []
    }

    return this.searchEngine.getSearchHistory()
  }

  /**
   * 显示搜索面板
   */
  showSearchPanel(): void {
    if (this.searchPanel) {
      this.searchPanel.style.display = 'block'
    }
  }

  /**
   * 隐藏搜索面板
   */
  hideSearchPanel(): void {
    if (this.searchPanel) {
      this.searchPanel.style.display = 'none'
    }
  }

  /**
   * 切换搜索面板显示状态
   */
  toggleSearchPanel(): void {
    if (!this.searchPanel) return

    if (this.searchPanel.style.display === 'none') {
      this.showSearchPanel()
    } else {
      this.hideSearchPanel()
    }
  }

  /**
   * 设置编辑器事件监听器
   */
  private setupEditorEventListeners(): void {
    if (!this.editor) return

    // 监听数据变化，更新索引
    this.editor.on('data:change', this.handleDataChange)
    this.editor.on('node:add', this.handleNodeAdd)
    this.editor.on('node:update', this.handleNodeUpdate)
    this.editor.on('node:delete', this.handleNodeDelete)
    this.editor.on('edge:add', this.handleEdgeAdd)
    this.editor.on('edge:update', this.handleEdgeUpdate)
    this.editor.on('edge:delete', this.handleEdgeDelete)
  }

  /**
   * 移除编辑器事件监听器
   */
  private removeEditorEventListeners(): void {
    if (!this.editor) return

    this.editor.off('data:change', this.handleDataChange)
    this.editor.off('node:add', this.handleNodeAdd)
    this.editor.off('node:update', this.handleNodeUpdate)
    this.editor.off('node:delete', this.handleNodeDelete)
    this.editor.off('edge:add', this.handleEdgeAdd)
    this.editor.off('edge:update', this.handleEdgeUpdate)
    this.editor.off('edge:delete', this.handleEdgeDelete)
  }

  /**
   * 设置搜索引擎事件监听器
   */
  private setupSearchEngineEventListeners(): void {
    if (!this.searchEngine) return

    this.searchEngine.on('search:completed', this.handleSearchCompleted)
    this.searchEngine.on('search:failed', this.handleSearchFailed)
    this.searchEngine.on('index:updated', this.handleIndexUpdated)
  }

  /**
   * 移除搜索引擎事件监听器
   */
  private removeSearchEngineEventListeners(): void {
    if (!this.searchEngine) return

    this.searchEngine.off('search:completed', this.handleSearchCompleted)
    this.searchEngine.off('search:failed', this.handleSearchFailed)
    this.searchEngine.off('index:updated', this.handleIndexUpdated)
  }

  /**
   * 创建搜索面板
   */
  private createSearchPanel(): void {
    // 这里应该创建一个完整的搜索UI面板
    // 简化实现，实际应该包含搜索框、过滤器、结果列表等
    this.searchPanel = document.createElement('div')
    this.searchPanel.className = 'flowchart-search-panel'
    this.searchPanel.innerHTML = `
      <div class="search-header">
        <h3>搜索</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="search-input">
        <input type="text" placeholder="搜索节点、连线..." />
        <button class="search-btn">搜索</button>
      </div>
      <div class="search-filters">
        <!-- 过滤器将在这里动态添加 -->
      </div>
      <div class="search-results">
        <!-- 搜索结果将在这里显示 -->
      </div>
    `
    
    // 添加样式
    this.addSearchPanelStyles()
    
    // 添加事件监听器
    this.setupSearchPanelEventListeners()
    
    // 添加到编辑器容器
    const editorContainer = this.editor!.getContainer()
    editorContainer.appendChild(this.searchPanel)
  }

  /**
   * 移除搜索面板
   */
  private removeSearchPanel(): void {
    if (this.searchPanel) {
      this.searchPanel.remove()
      this.searchPanel = undefined
    }
  }

  /**
   * 添加搜索面板样式
   */
  private addSearchPanelStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .flowchart-search-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 300px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
      }
      
      .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .search-input {
        padding: 10px;
        display: flex;
        gap: 5px;
      }
      
      .search-input input {
        flex: 1;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
      }
      
      .search-results {
        max-height: 400px;
        overflow-y: auto;
        padding: 10px;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 设置搜索面板事件监听器
   */
  private setupSearchPanelEventListeners(): void {
    if (!this.searchPanel) return

    // 关闭按钮
    const closeBtn = this.searchPanel.querySelector('.close-btn')
    closeBtn?.addEventListener('click', () => this.hideSearchPanel())

    // 搜索按钮和输入框
    const searchBtn = this.searchPanel.querySelector('.search-btn')
    const searchInput = this.searchPanel.querySelector('.search-input input') as HTMLInputElement

    const performSearch = async () => {
      const query = searchInput.value.trim()
      if (query) {
        try {
          const results = await this.quickSearch(query)
          this.displaySearchResults(results)
        } catch (error) {
          console.error('搜索失败:', error)
        }
      }
    }

    searchBtn?.addEventListener('click', performSearch)
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch()
      }
    })
  }

  /**
   * 显示搜索结果
   */
  private displaySearchResults(resultSet: SearchResultSet): void {
    if (!this.searchPanel) return

    const resultsContainer = this.searchPanel.querySelector('.search-results')
    if (!resultsContainer) return

    resultsContainer.innerHTML = ''

    if (resultSet.results.length === 0) {
      resultsContainer.innerHTML = '<p>未找到匹配的结果</p>'
      return
    }

    const resultsList = document.createElement('div')
    resultsList.className = 'results-list'

    for (const result of resultSet.results) {
      const resultItem = document.createElement('div')
      resultItem.className = 'result-item'
      resultItem.innerHTML = `
        <div class="result-title">${(result.element as any).text || (result.element as any).label || result.id}</div>
        <div class="result-type">${result.type} - ${(result.element as any).type}</div>
        <div class="result-score">匹配度: ${Math.round(result.score * 100)}%</div>
      `
      
      // 点击结果项时高亮对应元素
      resultItem.addEventListener('click', () => {
        this.highlightElement(result.id)
      })
      
      resultsList.appendChild(resultItem)
    }

    resultsContainer.appendChild(resultsList)
  }

  /**
   * 高亮元素
   */
  private highlightElement(elementId: string): void {
    // 这里应该调用编辑器的高亮方法
    this.editor!.emit('search:highlight', elementId)
  }

  /**
   * 设置快捷键
   */
  private setupShortcuts(): void {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * 移除快捷键
   */
  private removeShortcuts(): void {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  // 事件处理器
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault()
      this.toggleSearchPanel()
    }
  }

  private handleDataChange = async (): Promise<void> => {
    if (this.searchEngine && this.config?.indexingStrategy === 'realtime') {
      const data = this.editor!.getData()
      await this.searchEngine.buildIndex(data)
    }
  }

  private handleNodeAdd = async (data: any): Promise<void> => {
    if (this.searchEngine && this.config?.indexingStrategy === 'realtime') {
      await this.searchEngine.updateIndex(data)
    }
  }

  private handleNodeUpdate = async (data: any): Promise<void> => {
    if (this.searchEngine && this.config?.indexingStrategy === 'realtime') {
      await this.searchEngine.updateIndex(data)
    }
  }

  private handleNodeDelete = async (data: any): Promise<void> => {
    if (this.searchEngine && this.config?.indexingStrategy === 'realtime') {
      await this.searchEngine.removeFromIndex(data.id)
    }
  }

  private handleEdgeAdd = async (data: any): Promise<void> => {
    if (this.searchEngine && this.config?.indexingStrategy === 'realtime') {
      await this.searchEngine.updateIndex(data)
    }
  }

  private handleEdgeUpdate = async (data: any): Promise<void> => {
    if (this.searchEngine && this.config?.indexingStrategy === 'realtime') {
      await this.searchEngine.updateIndex(data)
    }
  }

  private handleEdgeDelete = async (data: any): Promise<void> => {
    if (this.searchEngine && this.config?.indexingStrategy === 'realtime') {
      await this.searchEngine.removeFromIndex(data.id)
    }
  }

  private handleSearchCompleted = (resultSet: SearchResultSet): void => {
    this.editor!.emit('search:completed', resultSet)
  }

  private handleSearchFailed = (error: Error): void => {
    this.editor!.emit('search:failed', error)
  }

  private handleIndexUpdated = (stats: any): void => {
    this.editor!.emit('search:index:updated', stats)
  }
}

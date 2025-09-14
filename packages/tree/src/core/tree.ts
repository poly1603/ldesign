/**
 * 树形组件主类
 * 
 * 提供完整的树形组件功能，包括渲染、交互、状态管理等
 */

import type {
  TreeNode,
  TreeNodeData,
  TreeNodeId
} from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'
import { DEFAULT_TREE_OPTIONS } from '../types/tree-options'
import type { TreeInstance } from '../types/tree-plugin'
import type { TreeState } from '../types/tree-state'
import { TreeNodeImpl } from './tree-node'
import { TreeStateManager } from './state-manager'
import { TreeEventEmitterImpl } from './event-emitter'
import { DragDropManager } from '../features/drag-drop'
import { SearchManager } from '../features/search'
import { AsyncLoaderManager } from '../features/async-loader'
import { VirtualScrollManager } from '../features/virtual-scroll'
import { SelectionManager } from '../features/selection'
import { NodeOperationsManager } from '../features/node-operations'

/**
 * 树形组件主类
 */
export default class Tree implements TreeInstance {
  public readonly options: TreeOptions
  public readonly stateManager: TreeStateManager
  public readonly eventEmitter: TreeEventEmitterImpl
  public readonly container: HTMLElement

  private renderer: TreeRenderer
  private dragDropManager: DragDropManager
  private searchManager: SearchManager
  private asyncLoaderManager: AsyncLoaderManager
  private virtualScrollManager: VirtualScrollManager
  private selectionManager: SelectionManager
  private nodeOperationsManager: NodeOperationsManager
  private destroyed: boolean = false

  /**
   * 构造函数
   * @param options 组件配置选项
   */
  constructor(options: Partial<TreeOptions> & { container: string | HTMLElement }) {
    // 合并默认配置
    this.options = this.mergeOptions(options)

    // 获取容器元素
    this.container = this.resolveContainer(options.container)

    // 初始化状态管理器
    this.stateManager = new TreeStateManager(this.options)

    // 初始化事件发射器
    this.eventEmitter = new TreeEventEmitterImpl()

    // 初始化渲染器
    this.renderer = new TreeRenderer(this)

    // 初始化功能管理器
    this.dragDropManager = new DragDropManager(this.options)
    this.searchManager = new SearchManager(this.options)
    this.asyncLoaderManager = new AsyncLoaderManager(this.options)
    this.virtualScrollManager = new VirtualScrollManager(this.options)
    this.selectionManager = new SelectionManager(this.options)
    this.nodeOperationsManager = new NodeOperationsManager(this.options)

    // 设置功能管理器回调
    this.setupFeatureCallbacks()

    // 初始化组件
    this.init()
  }

  /**
   * 合并配置选项
   */
  private mergeOptions(options: Partial<TreeOptions>): TreeOptions {
    return {
      ...DEFAULT_TREE_OPTIONS,
      ...options,
      selection: {
        ...DEFAULT_TREE_OPTIONS.selection,
        ...options.selection,
      },
      expansion: {
        ...DEFAULT_TREE_OPTIONS.expansion,
        ...options.expansion,
      },
      drag: {
        ...DEFAULT_TREE_OPTIONS.drag,
        ...options.drag,
      },
      search: {
        ...DEFAULT_TREE_OPTIONS.search,
        ...options.search,
      },
      async: {
        ...DEFAULT_TREE_OPTIONS.async,
        ...options.async,
      },
      virtual: {
        ...DEFAULT_TREE_OPTIONS.virtual,
        ...options.virtual,
      },
      style: {
        ...DEFAULT_TREE_OPTIONS.style,
        ...options.style,
      },
      accessibility: {
        ...DEFAULT_TREE_OPTIONS.accessibility,
        ...options.accessibility,
      },
      performance: {
        ...DEFAULT_TREE_OPTIONS.performance,
        ...options.performance,
      },
      i18n: {
        ...DEFAULT_TREE_OPTIONS.i18n,
        ...options.i18n,
      },
    }
  }

  /**
   * 解析容器元素
   */
  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container)
      if (!element) {
        throw new Error(`Container element not found: ${container}`)
      }
      return element as HTMLElement
    }
    return container
  }

  /**
   * 初始化组件
   */
  private init(): void {
    // 设置容器样式类
    this.container.classList.add('ldesign-tree')
    if (this.options.style?.className) {
      this.container.classList.add(this.options.style.className)
    }

    // 初始化数据
    if (this.options.data) {
      this.setData(this.options.data)
    }

    // 绑定事件
    this.bindEvents()

    // 初始化渲染
    this.renderer.render()

    // 标记为已初始化
    this.stateManager.dispatch({
      type: 'INIT',
      payload: {
        options: this.options,
        data: this.stateManager.getState().rootNodes,
      },
    })
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听状态变更
    this.stateManager.subscribe((state, action) => {
      this.handleStateChange(state, action)
    })

    // 绑定DOM事件
    this.bindDOMEvents()
  }

  /**
   * 绑定DOM事件
   */
  private bindDOMEvents(): void {
    // 点击事件
    this.container.addEventListener('click', this.handleClick.bind(this))

    // 双击事件
    this.container.addEventListener('dblclick', this.handleDoubleClick.bind(this))

    // 右键事件
    this.container.addEventListener('contextmenu', this.handleContextMenu.bind(this))

    // 键盘事件
    if (this.options.accessibility?.keyboard) {
      this.container.addEventListener('keydown', this.handleKeyDown.bind(this))
      this.container.addEventListener('keyup', this.handleKeyUp.bind(this))
    }

    // 拖拽事件
    if (this.options.drag?.enabled) {
      this.bindDragEvents()
    }

    // 滚动事件（虚拟滚动）
    if (this.options.virtual?.enabled) {
      this.container.addEventListener('scroll', this.handleScroll.bind(this))
    }
  }

  /**
   * 绑定拖拽事件
   */
  private bindDragEvents(): void {
    this.container.addEventListener('dragstart', this.handleDragStart.bind(this))
    this.container.addEventListener('dragover', this.handleDragOver.bind(this))
    this.container.addEventListener('dragenter', this.handleDragEnter.bind(this))
    this.container.addEventListener('dragleave', this.handleDragLeave.bind(this))
    this.container.addEventListener('drop', this.handleDrop.bind(this))
    this.container.addEventListener('dragend', this.handleDragEnd.bind(this))
  }

  /**
   * 处理状态变更
   */
  private handleStateChange(state: any, action: any): void {
    // 如果组件已销毁，不进行渲染
    if (this.destroyed) {
      return
    }

    // 更新功能管理器的节点映射
    this.dragDropManager.updateNodeMap(state.nodeMap)
    this.searchManager.updateNodeMap(state.nodeMap)
    this.asyncLoaderManager.updateNodeMap(state.nodeMap)
    this.selectionManager.updateNodeMap(state.nodeMap)
    this.nodeOperationsManager.updateData(state.nodeMap, state.rootNodes)

    // 重新渲染
    this.renderer.render()

    // 触发相应的事件
    this.emitStateChangeEvents(action)
  }

  /**
   * 触发状态变更事件
   */
  private emitStateChangeEvents(action: any): void {
    switch (action.type) {
      case 'SELECT_NODE':
        this.eventEmitter.emit('select', this.eventEmitter.createEvent('select', {
          node: this.getNode(action.payload.nodeId)!,
          selectedNodes: this.getSelectedNodes(),
          selectedIds: Array.from(this.stateManager.getState().selectedIds),
        }))
        break

      case 'EXPAND_NODE':
        this.eventEmitter.emit('expand', this.eventEmitter.createEvent('expand', {
          node: this.getNode(action.payload.nodeId)!,
          expandedNodes: this.getExpandedNodes(),
          expandedIds: Array.from(this.stateManager.getState().expandedIds),
        }))
        break

      // 其他事件...
    }
  }

  /**
   * 处理点击事件
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    const node = this.getNode(nodeId)

    if (!node) {
      return
    }

    // 处理展开/收起按钮点击
    if (target.closest('.tree-node-expand-button')) {
      this.toggleExpand(nodeId)
      return
    }

    // 处理复选框点击
    if (target.closest('.tree-node-checkbox')) {
      this.toggleSelect(nodeId)
      return
    }

    // 处理节点内容点击
    if (target.closest('.tree-node-content')) {
      this.selectNode(nodeId, !node.selected)

      // 触发点击事件
      this.eventEmitter.emit('click', this.eventEmitter.createEvent('click', {
        node,
        originalEvent: event,
      }))
    }
  }

  /**
   * 处理双击事件
   */
  private handleDoubleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    const node = this.getNode(nodeId)

    if (!node) {
      return
    }

    // 双击展开/收起节点
    this.toggleExpand(nodeId)

    // 触发双击事件
    this.eventEmitter.emit('dblclick', this.eventEmitter.createEvent('dblclick', {
      node,
      originalEvent: event,
    }))
  }

  /**
   * 处理右键事件
   */
  private handleContextMenu(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    const node = this.getNode(nodeId)

    if (!node) {
      return
    }

    // 触发右键事件
    this.eventEmitter.emit('contextmenu', this.eventEmitter.createEvent('contextmenu', {
      node,
      originalEvent: event,
    }))
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.options.accessibility?.keyboard) {
      return
    }

    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    const node = this.getNode(nodeId)

    if (!node) {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        this.navigateToNext(node)
        break

      case 'ArrowUp':
        event.preventDefault()
        this.navigateToPrevious(node)
        break

      case 'ArrowRight':
        event.preventDefault()
        if (node.children.length > 0 && !node.expanded) {
          this.expandNode(nodeId, true)
        } else {
          this.navigateToNext(node)
        }
        break

      case 'ArrowLeft':
        event.preventDefault()
        if (node.expanded) {
          this.expandNode(nodeId, false)
        } else if (node.parent) {
          this.focusNode(node.parent.id)
        }
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        if (this.options.selection?.mode !== 'none') {
          this.toggleSelect(nodeId)
        }
        break

      case 'Home':
        event.preventDefault()
        this.navigateToFirst()
        break

      case 'End':
        event.preventDefault()
        this.navigateToLast()
        break
    }
  }

  /**
   * 处理键盘抬起事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // 键盘抬起事件处理（如果需要）
  }

  /**
   * 处理拖拽开始事件
   */
  private handleDragStart(event: DragEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    this.dragDropManager.handleDragStart(event, nodeId)
  }

  /**
   * 处理拖拽悬停事件
   */
  private handleDragOver(event: DragEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    this.dragDropManager.handleDragOver(event, nodeId)
  }

  /**
   * 处理拖拽进入事件
   */
  private handleDragEnter(event: DragEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    this.dragDropManager.handleDragEnter(event, nodeId)
  }

  /**
   * 处理拖拽离开事件
   */
  private handleDragLeave(event: DragEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    this.dragDropManager.handleDragLeave(event, nodeId)
  }

  /**
   * 处理拖拽放置事件
   */
  private handleDrop(event: DragEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    this.dragDropManager.handleDrop(event, nodeId)
  }

  /**
   * 处理拖拽结束事件
   */
  private handleDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement

    if (!nodeElement) {
      return
    }

    const nodeId = nodeElement.dataset.nodeId!
    this.dragDropManager.handleDragEnd(event, nodeId)
  }

  /**
   * 处理滚动事件
   */
  private handleScroll(event: Event): void {
    if (!this.options.virtual?.enabled) {
      return
    }

    const target = event.target as HTMLElement
    this.stateManager.dispatch({
      type: 'UPDATE_VIRTUAL_SCROLL',
      payload: {
        scrollTop: target.scrollTop,
        containerHeight: target.clientHeight,
      },
    })
  }

  // 公共API方法

  /**
   * 设置数据
   */
  setData(data: TreeNodeData[]): void {
    const nodes = data.map((item, index) => new TreeNodeImpl(item, undefined, index))
    this.stateManager.dispatch({
      type: 'SET_DATA',
      payload: { data: nodes },
    })
  }

  /**
   * 获取当前状态
   */
  getState() {
    return this.stateManager.getState()
  }

  /**
   * 获取节点
   */
  getNode(id: TreeNodeId): TreeNode | undefined {
    return this.stateManager.getNode(id)
  }

  /**
   * 获取所有节点
   */
  getAllNodes(): TreeNode[] {
    return this.stateManager.getState().flatNodes
  }

  /**
   * 获取根节点
   */
  getRootNodes(): TreeNode[] {
    return this.stateManager.getState().rootNodes
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): TreeNode[] {
    return this.stateManager.getSelectedNodes()
  }

  /**
   * 获取展开的节点
   */
  getExpandedNodes(): TreeNode[] {
    return this.stateManager.getExpandedNodes()
  }

  /**
   * 选择节点
   */
  selectNode(id: TreeNodeId, selected: boolean = true): void {
    this.stateManager.dispatch({
      type: 'SELECT_NODE',
      payload: {
        nodeId: id,
        selected,
        cascade: this.options.selection?.cascade,
      },
    })
  }

  /**
   * 切换选择节点
   */
  toggleSelect(id: TreeNodeId): void {
    const node = this.getNode(id)
    if (node) {
      this.selectNode(id, !node.selected)
    }
  }

  /**
   * 展开节点
   */
  expandNode(id: TreeNodeId, expanded: boolean = true): void {
    this.stateManager.dispatch({
      type: 'EXPAND_NODE',
      payload: {
        nodeId: id,
        expanded,
      },
    })
  }

  /**
   * 切换展开节点
   */
  toggleExpand(id: TreeNodeId): void {
    const node = this.getNode(id)
    if (node) {
      this.expandNode(id, !node.expanded)
    }
  }

  /**
   * 添加节点
   */
  addNode(data: TreeNodeData, parent?: TreeNodeId, index?: number): TreeNode {
    const parentNode = parent ? this.getNode(parent) : undefined
    const node = new TreeNodeImpl(data, parentNode, index)

    this.stateManager.dispatch({
      type: 'ADD_NODE',
      payload: {
        node,
        parent: parentNode,
        index,
      },
    })

    return node
  }

  /**
   * 移除节点
   */
  removeNode(id: TreeNodeId): boolean {
    const node = this.getNode(id)
    if (!node) {
      return false
    }

    this.stateManager.dispatch({
      type: 'REMOVE_NODE',
      payload: { nodeId: id },
    })

    return true
  }

  /**
   * 更新节点
   */
  updateNode(id: TreeNodeId, data: Partial<TreeNode>): boolean {
    const node = this.getNode(id)
    if (!node) {
      return false
    }

    this.stateManager.dispatch({
      type: 'UPDATE_NODE',
      payload: {
        nodeId: id,
        data,
      },
    })

    return true
  }

  /**
   * 移动节点
   */
  moveNode(id: TreeNodeId, targetId?: TreeNodeId, position: 'before' | 'after' | 'inside' = 'inside'): boolean {
    const node = this.getNode(id)
    const target = targetId ? this.getNode(targetId) : null

    if (!node || (targetId && !target)) {
      return false
    }

    this.stateManager.dispatch({
      type: 'MOVE_NODE',
      payload: {
        nodeId: id,
        targetId,
        position,
      },
    })

    return true
  }

  /**
   * 搜索节点
   */
  search(keyword: string): TreeNode[] {
    // 更新搜索管理器的节点映射
    this.searchManager.updateNodeMap(this.stateManager.getState().nodeMap)

    // 执行搜索
    const results = this.searchManager.setSearchKeyword(keyword)

    // 更新状态管理器
    this.stateManager.dispatch({
      type: 'SEARCH',
      payload: { keyword },
    })

    // 触发搜索事件
    this.eventEmitter.emit('search', this.eventEmitter.createEvent('search', {
      keyword,
      results: results.map(r => r.node),
      matchedCount: results.length,
    }))

    return results.map(r => r.node)
  }

  /**
   * 清空搜索
   */
  clearSearch(): void {
    this.searchManager.clearSearch()

    this.stateManager.dispatch({
      type: 'CLEAR_SEARCH',
    })

    // 触发清空搜索事件
    this.eventEmitter.emit('searchClear', this.eventEmitter.createEvent('searchClear', {}))
  }

  /**
   * 异步加载节点的子节点
   */
  async loadChildren(nodeId: TreeNodeId, force: boolean = false): Promise<boolean> {
    const result = await this.asyncLoaderManager.loadChildren(nodeId, force)
    return result.success
  }

  /**
   * 重新加载节点
   */
  async reloadNode(nodeId: TreeNodeId): Promise<boolean> {
    const result = await this.asyncLoaderManager.reloadNode(nodeId)
    return result.success
  }

  /**
   * 全选节点
   */
  selectAll(): void {
    const selectedIds = this.selectionManager.selectAll()
    this.stateManager.dispatch({
      type: 'SELECT_ALL',
      payload: { selectedIds },
    })
  }

  /**
   * 取消全选
   */
  deselectAll(): void {
    const selectedIds = this.selectionManager.deselectAll()
    this.stateManager.dispatch({
      type: 'DESELECT_ALL',
      payload: { selectedIds },
    })
  }

  /**
   * 反选
   */
  invertSelection(): void {
    const selectedIds = this.selectionManager.invertSelection()
    this.stateManager.dispatch({
      type: 'INVERT_SELECTION',
      payload: { selectedIds },
    })
  }

  /**
   * 滚动到指定节点
   */
  scrollToNode(nodeId: TreeNodeId, align: 'start' | 'center' | 'end' = 'start'): void {
    if (this.options.virtual?.enabled) {
      this.virtualScrollManager.scrollToNode(nodeId, align)
    } else {
      // 普通滚动
      const nodeElement = this.container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
      if (nodeElement) {
        nodeElement.scrollIntoView({
          behavior: 'smooth',
          block: align === 'center' ? 'center' : align === 'end' ? 'end' : 'start',
        })
      }
    }
  }

  /**
   * 刷新组件
   */
  refresh(): void {
    this.renderer.render()
  }

  /**
   * 导航到下一个节点
   */
  private navigateToNext(currentNode: TreeNode): void {
    const visibleNodes = this.stateManager.getVisibleNodes()
    const currentIndex = visibleNodes.findIndex(node => node.id === currentNode.id)

    if (currentIndex < visibleNodes.length - 1) {
      const nextNode = visibleNodes[currentIndex + 1]
      this.focusNode(nextNode.id)
    }
  }

  /**
   * 导航到上一个节点
   */
  private navigateToPrevious(currentNode: TreeNode): void {
    const visibleNodes = this.stateManager.getVisibleNodes()
    const currentIndex = visibleNodes.findIndex(node => node.id === currentNode.id)

    if (currentIndex > 0) {
      const prevNode = visibleNodes[currentIndex - 1]
      this.focusNode(prevNode.id)
    }
  }

  /**
   * 导航到第一个节点
   */
  private navigateToFirst(): void {
    const visibleNodes = this.stateManager.getVisibleNodes()
    if (visibleNodes.length > 0) {
      this.focusNode(visibleNodes[0].id)
    }
  }

  /**
   * 导航到最后一个节点
   */
  private navigateToLast(): void {
    const visibleNodes = this.stateManager.getVisibleNodes()
    if (visibleNodes.length > 0) {
      this.focusNode(visibleNodes[visibleNodes.length - 1].id)
    }
  }

  /**
   * 聚焦到指定节点
   */
  private focusNode(nodeId: TreeNodeId): void {
    const nodeElement = this.container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
    if (nodeElement) {
      nodeElement.focus()
    }
  }

  /**
   * 设置功能管理器回调
   */
  private setupFeatureCallbacks(): void {
    this.setupDragDropCallbacks()
    this.setupAsyncLoaderCallbacks()
    this.setupVirtualScrollCallbacks()
  }

  /**
   * 设置拖拽回调
   */
  private setupDragDropCallbacks(): void {
    this.dragDropManager.setCallbacks({
      onDragStart: (data) => {
        // 触发拖拽开始事件
        this.eventEmitter.emit('dragStart', this.eventEmitter.createEvent('dragStart', {
          node: data.dragNode,
          originalEvent: data.originalEvent,
        }))
        return true
      },

      onDragOver: (data) => {
        // 触发拖拽悬停事件
        this.eventEmitter.emit('dragOver', this.eventEmitter.createEvent('dragOver', {
          dragNode: data.dragNode,
          targetNode: data.targetNode,
          position: data.position,
          originalEvent: data.originalEvent,
        }))
        return true
      },

      onDrop: (data) => {
        // 触发拖拽放置事件
        const dropEvent = this.eventEmitter.createEvent('drop', {
          dragNode: data.dragNode,
          targetNode: data.targetNode,
          position: data.position,
          originalEvent: data.originalEvent,
        })

        this.eventEmitter.emit('drop', dropEvent)

        // 如果事件被取消，阻止默认行为
        if (dropEvent.cancelled) {
          return false
        }

        // 更新状态管理器
        this.stateManager.dispatch({
          type: 'MOVE_NODE',
          payload: {
            nodeId: data.dragNode.id,
            targetId: data.targetNode?.id,
            position: data.position,
          },
        })

        return true
      },

      onDragEnd: (data) => {
        // 触发拖拽结束事件
        this.eventEmitter.emit('dragEnd', this.eventEmitter.createEvent('dragEnd', {
          dragNode: data.dragNode,
          targetNode: data.targetNode,
          position: data.position,
          originalEvent: data.originalEvent,
        }))
      },
    })
  }

  /**
   * 设置异步加载回调
   */
  private setupAsyncLoaderCallbacks(): void {
    // 设置异步加载器
    if (this.options.async?.loader) {
      this.asyncLoaderManager.setAsyncLoader(this.options.async.loader)
    }

    this.asyncLoaderManager.setCallbacks({
      onBeforeLoad: (node) => {
        // 触发加载前事件
        const event = this.eventEmitter.createEvent('beforeLoad', { node })
        this.eventEmitter.emit('beforeLoad', event)
        return !event.cancelled
      },

      onAfterLoad: (node, result) => {
        // 更新状态管理器
        if (result.success && result.data) {
          this.stateManager.dispatch({
            type: 'FINISH_LOADING',
            payload: {
              nodeId: node.id,
              children: result.data.map(data => new TreeNodeImpl(data, node)),
            },
          })
        } else if (!result.success) {
          this.stateManager.dispatch({
            type: 'FINISH_LOADING',
            payload: {
              nodeId: node.id,
              error: new Error(result.error || '加载失败'),
            },
          })
        }

        // 触发加载后事件
        this.eventEmitter.emit('afterLoad', this.eventEmitter.createEvent('afterLoad', {
          node,
          success: result.success,
          data: result.data,
          error: result.error,
        }))
      },

      onLoadError: (node, error) => {
        // 触发加载错误事件
        this.eventEmitter.emit('loadError', this.eventEmitter.createEvent('loadError', {
          node,
          error,
        }))
      },
    })
  }

  /**
   * 设置虚拟滚动回调
   */
  private setupVirtualScrollCallbacks(): void {
    if (!this.options.virtual?.enabled) {
      return
    }

    this.virtualScrollManager.setCallbacks({
      onScroll: (scrollTop, range) => {
        // 触发虚拟滚动事件
        this.eventEmitter.emit('virtualScroll', this.eventEmitter.createEvent('virtualScroll', {
          scrollTop,
          range,
        }))
      },

      onRangeChange: (range) => {
        // 更新状态管理器的虚拟滚动状态
        this.stateManager.dispatch({
          type: 'UPDATE_VIRTUAL_SCROLL',
          payload: {
            scrollTop: this.virtualScrollManager.getCurrentRange().visibleStart * (this.options.virtual?.itemHeight || 32),
            containerHeight: this.options.virtual?.height || 400,
          },
        })
      },
    })
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    // 标记为已销毁，防止后续渲染
    this.destroyed = true

    // 移除事件监听器
    this.container.removeEventListener('click', this.handleClick)
    this.container.removeEventListener('dblclick', this.handleDoubleClick)
    this.container.removeEventListener('contextmenu', this.handleContextMenu)
    this.container.removeEventListener('keydown', this.handleKeyDown)
    this.container.removeEventListener('keyup', this.handleKeyUp)
    this.container.removeEventListener('scroll', this.handleScroll)

    if (this.options.drag?.enabled) {
      this.container.removeEventListener('dragstart', this.handleDragStart)
      this.container.removeEventListener('dragover', this.handleDragOver)
      this.container.removeEventListener('dragenter', this.handleDragEnter)
      this.container.removeEventListener('dragleave', this.handleDragLeave)
      this.container.removeEventListener('drop', this.handleDrop)
      this.container.removeEventListener('dragend', this.handleDragEnd)
    }

    // 销毁功能管理器
    this.dragDropManager.cancelDrag()
    this.searchManager.clearSearch()
    this.asyncLoaderManager.destroy()
    this.virtualScrollManager.destroy()
    this.selectionManager.clear()
    this.nodeOperationsManager.clearClipboard()

    // 销毁状态管理器和事件发射器
    this.stateManager.destroy()
    this.eventEmitter.destroy()

    // 清空容器
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-tree')
    if (this.options.style?.className) {
      this.container.classList.remove(this.options.style.className)
    }
  }
}

/**
 * 树形渲染器类
 */
class TreeRenderer {
  private tree: Tree

  constructor(tree: Tree) {
    this.tree = tree
  }

  /**
   * 渲染树形组件
   */
  render(): void {
    const state = this.tree.getState()
    const { visibleNodes, virtualState } = state

    if (virtualState.enabled) {
      this.renderVirtual(visibleNodes, virtualState)
    } else {
      this.renderNormal(visibleNodes)
    }
  }

  /**
   * 普通渲染
   */
  private renderNormal(nodes: TreeNode[]): void {
    const fragment = document.createDocumentFragment()

    for (const node of nodes) {
      const nodeElement = this.renderNode(node)
      fragment.appendChild(nodeElement)
    }

    this.tree.container.innerHTML = ''
    this.tree.container.appendChild(fragment)
  }

  /**
   * 虚拟滚动渲染
   */
  private renderVirtual(nodes: TreeNode[], virtualState: any): void {
    const { startIndex, endIndex, totalHeight, offsetY } = virtualState
    const visibleNodes = nodes.slice(startIndex, endIndex + 1)

    // 创建虚拟滚动容器
    const scrollContainer = document.createElement('div')
    scrollContainer.className = 'tree-virtual-scroll-container'
    scrollContainer.style.height = `${totalHeight}px`
    scrollContainer.style.position = 'relative'

    // 创建可见内容容器
    const contentContainer = document.createElement('div')
    contentContainer.className = 'tree-virtual-content'
    contentContainer.style.transform = `translateY(${offsetY}px)`

    // 渲染可见节点
    for (const node of visibleNodes) {
      const nodeElement = this.renderNode(node)
      contentContainer.appendChild(nodeElement)
    }

    scrollContainer.appendChild(contentContainer)

    this.tree.container.innerHTML = ''
    this.tree.container.appendChild(scrollContainer)
  }

  /**
   * 渲染单个节点
   */
  private renderNode(node: TreeNode): HTMLElement {
    const nodeElement = document.createElement('div')
    nodeElement.className = 'tree-node'
    nodeElement.dataset.nodeId = String(node.id)
    nodeElement.style.paddingLeft = `${node.level * (this.tree.options.style?.indent || 24)}px`

    // 添加状态类名
    if (node.selected) nodeElement.classList.add('tree-node-selected')
    if (node.expanded) nodeElement.classList.add('tree-node-expanded')
    if (node.disabled) nodeElement.classList.add('tree-node-disabled')
    if (node.dragging) nodeElement.classList.add('tree-node-dragging')
    if (node.dropTarget) nodeElement.classList.add('tree-node-drop-target')
    if (node.loading) nodeElement.classList.add('tree-node-loading')
    if (node.error) nodeElement.classList.add('tree-node-error')
    if (node.className) nodeElement.classList.add(node.className)

    // 创建节点内容容器
    const contentContainer = document.createElement('div')
    contentContainer.className = 'tree-node-content'

    // 渲染展开/收起按钮
    if (node.children.length > 0 || node.hasChildren) {
      const expandButton = document.createElement('button')
      expandButton.className = 'tree-node-expand-button'
      expandButton.innerHTML = node.expanded ? '▼' : '▶'
      expandButton.setAttribute('aria-label', node.expanded ? '收起' : '展开')
      contentContainer.appendChild(expandButton)
    } else {
      const spacer = document.createElement('span')
      spacer.className = 'tree-node-expand-spacer'
      contentContainer.appendChild(spacer)
    }

    // 渲染复选框
    if (this.tree.options.selection?.mode === 'multiple' || this.tree.options.selection?.mode === 'cascade') {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.className = 'tree-node-checkbox'
      checkbox.checked = node.selected
      checkbox.indeterminate = node.indeterminate
      checkbox.disabled = node.disabled || !node.selectable
      checkbox.setAttribute('aria-label', `选择 ${node.label}`)
      contentContainer.appendChild(checkbox)
    }

    // 渲染图标
    if (node.icon) {
      const icon = document.createElement('span')
      icon.className = `tree-node-icon ${node.icon}`
      icon.setAttribute('aria-hidden', 'true')
      contentContainer.appendChild(icon)
    }

    // 渲染标签
    const label = document.createElement('span')
    label.className = 'tree-node-label'
    label.textContent = node.label
    contentContainer.appendChild(label)

    // 渲染加载指示器
    if (node.loading) {
      const loading = document.createElement('span')
      loading.className = 'tree-node-loading-indicator'
      loading.textContent = '...'
      loading.setAttribute('aria-label', '加载中')
      contentContainer.appendChild(loading)
    }

    // 渲染错误指示器
    if (node.error) {
      const error = document.createElement('span')
      error.className = 'tree-node-error-indicator'
      error.title = node.error
      error.textContent = '!'
      error.setAttribute('aria-label', `错误: ${node.error}`)
      contentContainer.appendChild(error)
    }

    nodeElement.appendChild(contentContainer)

    // 设置拖拽属性
    if (node.draggable && this.tree.options.drag?.enabled) {
      nodeElement.draggable = true
    }

    // 设置无障碍访问属性
    if (this.tree.options.accessibility?.enabled) {
      nodeElement.setAttribute('role', 'treeitem')
      nodeElement.setAttribute('aria-level', String(node.level + 1))
      nodeElement.setAttribute('aria-expanded', String(node.expanded))
      nodeElement.setAttribute('aria-selected', String(node.selected))
      nodeElement.setAttribute('aria-disabled', String(node.disabled))
      if (node.children.length > 0 || node.hasChildren) {
        nodeElement.setAttribute('aria-expanded', String(node.expanded))
      }
      nodeElement.tabIndex = node.selected ? 0 : -1
    }

    // 应用自定义样式
    if (node.style) {
      Object.assign(nodeElement.style, node.style)
    }

    return nodeElement
  }
}

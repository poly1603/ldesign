/**
 * Angular 适配器
 * 
 * 提供Angular组件包装器，使树形组件能够在Angular应用中使用
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  forwardRef,
  NgModule,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Tree } from '../core/tree'
import type { TreeOptions, TreeNodeData } from '../types'

/**
 * Angular 树形组件
 */
@Component({
  selector: 'ldesign-tree',
  template: `
    <div 
      #container 
      class="ldesign-tree-angular"
      [class.ldesign-tree--dark]="theme === 'dark'"
      [class.ldesign-tree--compact]="theme === 'compact'"
      [class.ldesign-tree--comfortable]="theme === 'comfortable'"
      [class.ldesign-tree--small]="size === 'small'"
      [class.ldesign-tree--large]="size === 'large'"
      [class.ldesign-tree--disabled]="disabled"
      [class.ldesign-tree--loading]="loading"
    ></div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LDesignTreeComponent),
      multi: true,
    },
  ],
})
export class LDesignTreeComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>

  // 输入属性
  @Input() data: TreeNodeData[] = []
  @Input() options: Partial<TreeOptions> = {}
  @Input() selectedKeys: string[] = []
  @Input() expandedKeys: string[] = []
  @Input() selectionMode: 'single' | 'multiple' | 'cascade' = 'single'
  @Input() showCheckbox: boolean = false
  @Input() draggable: boolean = false
  @Input() searchable: boolean = false
  @Input() searchKeyword: string = ''
  @Input() virtualScroll: boolean = false
  @Input() asyncLoad?: (node: any) => Promise<TreeNodeData[]>
  @Input() theme: 'light' | 'dark' | 'compact' | 'comfortable' = 'light'
  @Input() size: 'small' | 'medium' | 'large' = 'medium'
  @Input() disabled: boolean = false
  @Input() loading: boolean = false
  @Input() emptyText: string = '暂无数据'

  // 输出事件
  @Output() selectedKeysChange = new EventEmitter<string[]>()
  @Output() expandedKeysChange = new EventEmitter<string[]>()
  @Output() searchKeywordChange = new EventEmitter<string>()
  @Output() select = new EventEmitter<string[]>()
  @Output() expand = new EventEmitter<string>()
  @Output() collapse = new EventEmitter<string>()
  @Output() check = new EventEmitter<string[]>()
  @Output() uncheck = new EventEmitter<string[]>()
  @Output() dragStart = new EventEmitter<string>()
  @Output() dragEnd = new EventEmitter<string>()
  @Output() drop = new EventEmitter<any>()
  @Output() search = new EventEmitter<{ keyword: string; results: any[] }>()
  @Output() load = new EventEmitter<{ nodeId: string; data: TreeNodeData[] }>()
  @Output() error = new EventEmitter<Error>()

  private treeInstance?: Tree
  private onChange = (value: any) => {}
  private onTouched = () => {}

  ngOnInit() {
    this.initTree()
  }

  ngOnDestroy() {
    if (this.treeInstance) {
      this.treeInstance.destroy()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.treeInstance) return

    // 监听数据变化
    if (changes['data'] && !changes['data'].firstChange) {
      this.treeInstance.setData(this.data)
    }

    // 监听选中状态变化
    if (changes['selectedKeys'] && !changes['selectedKeys'].firstChange) {
      this.treeInstance.setSelectedNodes(this.selectedKeys)
    }

    // 监听展开状态变化
    if (changes['expandedKeys'] && !changes['expandedKeys'].firstChange) {
      this.treeInstance.setExpandedNodes(this.expandedKeys)
    }

    // 监听搜索关键词变化
    if (changes['searchKeyword'] && !changes['searchKeyword'].firstChange) {
      this.treeInstance.search(this.searchKeyword)
    }

    // 监听配置变化
    if (this.hasOptionsChanged(changes)) {
      this.treeInstance.updateOptions(this.getTreeOptions())
    }
  }

  // ControlValueAccessor 实现
  writeValue(value: string[]): void {
    this.selectedKeys = value || []
    if (this.treeInstance) {
      this.treeInstance.setSelectedNodes(this.selectedKeys)
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
    if (this.treeInstance) {
      this.treeInstance.updateOptions({ disabled: isDisabled })
    }
  }

  // 私有方法
  private initTree() {
    if (!this.containerRef?.nativeElement) return

    this.treeInstance = new Tree(this.containerRef.nativeElement, this.getTreeOptions())

    // 绑定事件
    this.treeInstance.on('select', (nodeIds: string[]) => {
      this.selectedKeys = nodeIds
      this.selectedKeysChange.emit(nodeIds)
      this.select.emit(nodeIds)
      this.onChange(nodeIds)
      this.onTouched()
    })

    this.treeInstance.on('expand', (nodeId: string) => {
      if (!this.expandedKeys.includes(nodeId)) {
        this.expandedKeys = [...this.expandedKeys, nodeId]
        this.expandedKeysChange.emit(this.expandedKeys)
      }
      this.expand.emit(nodeId)
    })

    this.treeInstance.on('collapse', (nodeId: string) => {
      this.expandedKeys = this.expandedKeys.filter(id => id !== nodeId)
      this.expandedKeysChange.emit(this.expandedKeys)
      this.collapse.emit(nodeId)
    })

    this.treeInstance.on('check', (nodeIds: string[]) => {
      this.check.emit(nodeIds)
    })

    this.treeInstance.on('uncheck', (nodeIds: string[]) => {
      this.uncheck.emit(nodeIds)
    })

    this.treeInstance.on('dragStart', (nodeId: string) => {
      this.dragStart.emit(nodeId)
    })

    this.treeInstance.on('dragEnd', (nodeId: string) => {
      this.dragEnd.emit(nodeId)
    })

    this.treeInstance.on('drop', (data: any) => {
      this.drop.emit(data)
    })

    this.treeInstance.on('search', (keyword: string, results: any[]) => {
      this.searchKeyword = keyword
      this.searchKeywordChange.emit(keyword)
      this.search.emit({ keyword, results })
    })

    this.treeInstance.on('load', (nodeId: string, data: TreeNodeData[]) => {
      this.load.emit({ nodeId, data })
    })

    this.treeInstance.on('error', (error: Error) => {
      this.error.emit(error)
    })

    // 设置初始数据
    if (this.data.length > 0) {
      this.treeInstance.setData(this.data)
    }

    // 设置初始选中状态
    if (this.selectedKeys.length > 0) {
      this.treeInstance.setSelectedNodes(this.selectedKeys)
    }

    // 设置初始展开状态
    if (this.expandedKeys.length > 0) {
      this.treeInstance.setExpandedNodes(this.expandedKeys)
    }

    // 设置初始搜索关键词
    if (this.searchKeyword) {
      this.treeInstance.search(this.searchKeyword)
    }
  }

  private getTreeOptions(): TreeOptions {
    return {
      selection: {
        mode: this.selectionMode,
        showCheckbox: this.showCheckbox,
      },
      dragDrop: {
        enabled: this.draggable,
      },
      search: {
        enabled: this.searchable,
      },
      virtualScroll: {
        enabled: this.virtualScroll,
      },
      async: {
        enabled: !!this.asyncLoad,
        loader: this.asyncLoad,
      },
      theme: this.theme,
      size: this.size,
      disabled: this.disabled,
      loading: this.loading,
      emptyText: this.emptyText,
      ...this.options,
    }
  }

  private hasOptionsChanged(changes: SimpleChanges): boolean {
    const optionKeys = [
      'selectionMode',
      'showCheckbox',
      'draggable',
      'searchable',
      'virtualScroll',
      'asyncLoad',
      'theme',
      'size',
      'disabled',
      'loading',
      'emptyText',
      'options',
    ]

    return optionKeys.some(key => changes[key] && !changes[key].firstChange)
  }

  // 公共方法
  getTreeInstance(): Tree | undefined {
    return this.treeInstance
  }

  setData(data: TreeNodeData[]): void {
    this.treeInstance?.setData(data)
  }

  getData(): TreeNodeData[] {
    return this.treeInstance?.getData() || []
  }

  addNode(nodeData: TreeNodeData, parentId?: string): void {
    this.treeInstance?.addNode(nodeData, parentId)
  }

  removeNode(nodeId: string): void {
    this.treeInstance?.removeNode(nodeId)
  }

  updateNode(nodeId: string, nodeData: Partial<TreeNodeData>): void {
    this.treeInstance?.updateNode(nodeId, nodeData)
  }

  selectNode(nodeId: string): void {
    this.treeInstance?.selectNode(nodeId)
  }

  unselectNode(nodeId: string): void {
    this.treeInstance?.unselectNode(nodeId)
  }

  selectAll(): void {
    this.treeInstance?.selectAll()
  }

  unselectAll(): void {
    this.treeInstance?.unselectAll()
  }

  getSelectedNodes(): string[] {
    return this.treeInstance?.getSelectedNodes() || []
  }

  expandNode(nodeId: string): void {
    this.treeInstance?.expandNode(nodeId)
  }

  collapseNode(nodeId: string): void {
    this.treeInstance?.collapseNode(nodeId)
  }

  expandAll(): void {
    this.treeInstance?.expandAll()
  }

  collapseAll(): void {
    this.treeInstance?.collapseAll()
  }

  searchNodes(keyword: string): void {
    this.treeInstance?.search(keyword)
  }

  clearSearch(): void {
    this.treeInstance?.clearSearch()
  }

  scrollToNode(nodeId: string): void {
    this.treeInstance?.scrollToNode(nodeId)
  }

  refresh(): void {
    this.treeInstance?.refresh()
  }
}

/**
 * Angular 模块
 */
@NgModule({
  declarations: [LDesignTreeComponent],
  exports: [LDesignTreeComponent],
})
export class LDesignTreeModule {}

// 默认导出
export default LDesignTreeComponent

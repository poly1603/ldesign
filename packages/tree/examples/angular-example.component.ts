import { Component, ViewChild, OnInit } from '@angular/core'
import { LDesignTreeComponent } from '../src/adapters/angular'
import type { TreeNodeData } from '../src/types'

@Component({
  selector: 'app-angular-example',
  template: `
    <div class="angular-example">
      <div class="header">
        <h1>LDesign Tree - Angular 示例</h1>
        <p>在Angular应用中使用树形组件</p>
      </div>

      <div class="content">
        <!-- 基础示例 -->
        <div class="demo-section">
          <h2>基础用法</h2>
          <ldesign-tree
            #basicTree
            [data]="treeData"
            [(selectedKeys)]="selectedKeys"
            [(expandedKeys)]="expandedKeys"
            selectionMode="multiple"
            [showCheckbox]="true"
            (select)="handleSelect($event)"
            (expand)="handleExpand($event)"
            (collapse)="handleCollapse($event)"
          ></ldesign-tree>
          
          <div class="controls">
            <button (click)="expandAll()">展开全部</button>
            <button (click)="collapseAll()">收起全部</button>
            <button (click)="selectAll()">全选</button>
            <button (click)="clearSelection()">清空选择</button>
          </div>
          
          <div *ngIf="selectedKeys.length > 0" class="info">
            已选择: {{ selectedKeys.join(', ') }}
          </div>
        </div>

        <!-- 搜索示例 -->
        <div class="demo-section">
          <h2>搜索功能</h2>
          <div class="search-controls">
            <input
              [(ngModel)]="searchKeyword"
              type="text"
              placeholder="搜索节点..."
              class="search-input"
            />
            <button (click)="clearSearch()">清空搜索</button>
          </div>
          
          <ldesign-tree
            #searchTree
            [data]="treeData"
            [(searchKeyword)]="searchKeyword"
            [searchable]="true"
            (search)="handleSearch($event)"
          ></ldesign-tree>
          
          <div *ngIf="searchResults.length > 0" class="info">
            搜索 "{{ searchKeyword }}" 找到 {{ searchResults.length }} 个结果
          </div>
        </div>

        <!-- 拖拽示例 -->
        <div class="demo-section">
          <h2>拖拽排序</h2>
          <ldesign-tree
            #dragTree
            [data]="dragTreeData"
            [draggable]="true"
            (drop)="handleDrop($event)"
          ></ldesign-tree>
          
          <div class="controls">
            <button (click)="resetDragTree()">重置数据</button>
          </div>
          
          <div *ngIf="dropInfo" class="info">
            {{ dropInfo }}
          </div>
        </div>

        <!-- 异步加载示例 -->
        <div class="demo-section">
          <h2>异步加载</h2>
          <ldesign-tree
            #asyncTree
            [data]="asyncTreeData"
            [asyncLoad]="loadChildren"
            (load)="handleLoad($event)"
          ></ldesign-tree>
          
          <div *ngIf="loadInfo" class="info">
            {{ loadInfo }}
          </div>
        </div>

        <!-- 主题切换示例 -->
        <div class="demo-section">
          <h2>主题切换</h2>
          <div class="theme-controls">
            <label>
              <input
                [(ngModel)]="currentTheme"
                type="radio"
                value="light"
              />
              浅色主题
            </label>
            <label>
              <input
                [(ngModel)]="currentTheme"
                type="radio"
                value="dark"
              />
              暗色主题
            </label>
            <label>
              <input
                [(ngModel)]="currentTheme"
                type="radio"
                value="compact"
              />
              紧凑主题
            </label>
            <label>
              <input
                [(ngModel)]="currentTheme"
                type="radio"
                value="comfortable"
              />
              舒适主题
            </label>
          </div>
          
          <ldesign-tree
            [data]="treeData"
            [theme]="currentTheme"
            selectionMode="single"
          ></ldesign-tree>
        </div>

        <!-- 表单集成示例 -->
        <div class="demo-section">
          <h2>表单集成</h2>
          <form #treeForm="ngForm">
            <div class="form-group">
              <label>选择节点:</label>
              <ldesign-tree
                name="treeSelection"
                [(ngModel)]="formValue"
                [data]="treeData"
                selectionMode="multiple"
                [showCheckbox]="true"
                required
              ></ldesign-tree>
              <div *ngIf="treeForm.invalid && treeForm.touched" class="error">
                请至少选择一个节点
              </div>
            </div>
            
            <div class="controls">
              <button type="submit" [disabled]="treeForm.invalid">提交</button>
              <button type="button" (click)="resetForm()">重置</button>
            </div>
          </form>
          
          <div *ngIf="formValue.length > 0" class="info">
            表单值: {{ formValue.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .angular-example {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
    }

    .demo-section {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      background: white;
    }

    .demo-section h2 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 10px;
    }

    .controls {
      margin: 15px 0;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .search-controls {
      margin-bottom: 15px;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .theme-controls {
      margin-bottom: 15px;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .theme-controls label {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    button {
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    button:hover:not(:disabled) {
      border-color: #40a9ff;
      color: #40a9ff;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      width: 200px;
    }

    .info {
      margin-top: 15px;
      padding: 12px;
      background: #f6ffed;
      border: 1px solid #b7eb8f;
      border-radius: 4px;
      color: #52c41a;
    }

    .error {
      margin-top: 5px;
      color: #ff4d4f;
      font-size: 14px;
    }
  `]
})
export class AngularExampleComponent implements OnInit {
  @ViewChild('basicTree') basicTree!: LDesignTreeComponent
  @ViewChild('searchTree') searchTree!: LDesignTreeComponent
  @ViewChild('dragTree') dragTree!: LDesignTreeComponent
  @ViewChild('asyncTree') asyncTree!: LDesignTreeComponent

  // 数据属性
  treeData: TreeNodeData[] = [
    {
      id: '1',
      label: '根节点 1',
      children: [
        {
          id: '1-1',
          label: '子节点 1-1',
          children: [
            { id: '1-1-1', label: '叶子节点 1-1-1' },
            { id: '1-1-2', label: '叶子节点 1-1-2' },
          ]
        },
        {
          id: '1-2',
          label: '子节点 1-2',
          children: [
            { id: '1-2-1', label: '叶子节点 1-2-1' },
          ]
        }
      ]
    },
    {
      id: '2',
      label: '根节点 2',
      children: [
        { id: '2-1', label: '子节点 2-1' },
        { id: '2-2', label: '子节点 2-2' },
      ]
    },
    {
      id: '3',
      label: '根节点 3',
      children: [
        {
          id: '3-1',
          label: '子节点 3-1',
          children: [
            { id: '3-1-1', label: '叶子节点 3-1-1' },
            { id: '3-1-2', label: '叶子节点 3-1-2' },
            { id: '3-1-3', label: '叶子节点 3-1-3' },
          ]
        }
      ]
    }
  ]

  // 状态属性
  selectedKeys: string[] = []
  expandedKeys: string[] = ['1', '2']
  searchKeyword: string = ''
  searchResults: any[] = []
  dragTreeData: TreeNodeData[] = []
  dropInfo: string = ''
  loadInfo: string = ''
  currentTheme: 'light' | 'dark' | 'compact' | 'comfortable' = 'light'
  formValue: string[] = []

  // 异步树数据
  asyncTreeData: TreeNodeData[] = [
    {
      id: 'async-1',
      label: '异步节点 1',
      hasChildren: true
    },
    {
      id: 'async-2',
      label: '异步节点 2',
      hasChildren: true
    }
  ]

  ngOnInit() {
    this.dragTreeData = JSON.parse(JSON.stringify(this.treeData))
  }

  // 事件处理方法
  handleSelect(keys: string[]) {
    console.log('选择节点:', keys)
  }

  handleExpand(nodeId: string) {
    console.log('展开节点:', nodeId)
  }

  handleCollapse(nodeId: string) {
    console.log('收起节点:', nodeId)
  }

  handleSearch(event: { keyword: string; results: any[] }) {
    this.searchResults = event.results
    console.log('搜索结果:', event.keyword, event.results)
  }

  handleDrop(data: any) {
    this.dropInfo = `节点 "${data.dragNode.label}" 移动到 "${data.dropNode.label}" ${data.position}`
    console.log('拖拽完成:', data)
  }

  handleLoad(event: { nodeId: string; data: TreeNodeData[] }) {
    this.loadInfo = `节点 "${event.nodeId}" 加载了 ${event.data.length} 个子节点`
    console.log('异步加载完成:', event.nodeId, event.data)
  }

  // 异步加载函数
  loadChildren = async (node: any): Promise<TreeNodeData[]> => {
    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: `${node.id}-1`,
        label: `${node.label} - 子节点 1`
      },
      {
        id: `${node.id}-2`,
        label: `${node.label} - 子节点 2`
      },
      {
        id: `${node.id}-3`,
        label: `${node.label} - 子节点 3`
      }
    ]
  }

  // 控制方法
  expandAll() {
    this.basicTree.expandAll()
  }

  collapseAll() {
    this.basicTree.collapseAll()
  }

  selectAll() {
    this.basicTree.selectAll()
  }

  clearSelection() {
    this.selectedKeys = []
    this.basicTree.unselectAll()
  }

  clearSearch() {
    this.searchKeyword = ''
    this.searchResults = []
  }

  resetDragTree() {
    this.dragTreeData = JSON.parse(JSON.stringify(this.treeData))
    this.dropInfo = ''
  }

  resetForm() {
    this.formValue = []
  }
}

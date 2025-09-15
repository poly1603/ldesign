/**
 * 版本控制插件
 * 
 * 为流程图编辑器提供版本管理功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'
import {
  VersionManager,
  BranchManager,
  type Version,
  type Branch,
  type VersionControlConfig,
  type CreateVersionOptions,
  type MergeOptions,
  type VersionComparison
} from '../../version'

/**
 * 版本控制插件配置
 */
export interface VersionControlPluginConfig extends Partial<VersionControlConfig> {
  /** 是否显示版本控制面板 */
  showVersionPanel?: boolean
  /** 面板位置 */
  panelPosition?: 'top' | 'right' | 'bottom' | 'left'
  /** 是否启用快捷键 */
  enableShortcuts?: boolean
  /** 是否启用自动保存版本 */
  enableAutoSave?: boolean
  /** 自动保存间隔（毫秒） */
  autoSaveInterval?: number
}

/**
 * 版本控制插件类
 */
export class VersionControlPlugin extends BasePlugin<VersionControlPluginConfig> {
  readonly name = 'version-control'
  readonly version = '1.0.0'
  readonly description = '版本控制功能插件'

  private versionManager?: VersionManager
  private branchManager?: BranchManager
  private versionPanel?: HTMLElement
  private config?: VersionControlPluginConfig
  private isEnabled: boolean = false
  private autoSaveTimer?: number

  /**
   * 安装插件
   */
  protected onInstall(): void {
    if (!this.editor) {
      throw new Error('编辑器实例未找到')
    }

    // 监听编辑器事件
    this.setupEditorEventListeners()
    
    console.log('版本控制插件安装完成')
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.disableVersionControl()
    this.removeEditorEventListeners()
    this.removeVersionPanel()
    
    console.log('版本控制插件卸载完成')
  }

  /**
   * 启用版本控制功能
   */
  async enableVersionControl(config?: VersionControlPluginConfig): Promise<void> {
    if (this.isEnabled) {
      return
    }

    this.config = {
      autoVersioning: false,
      autoVersionInterval: 300000, // 5分钟
      maxVersionHistory: 100,
      enableCompression: true,
      defaultBranch: 'main',
      versionNamingStrategy: 'semantic',
      enableVersionTags: true,
      showVersionPanel: true,
      panelPosition: 'right',
      enableShortcuts: true,
      enableAutoSave: false,
      autoSaveInterval: 60000, // 1分钟
      ...config
    }

    try {
      // 创建版本管理器
      this.versionManager = new VersionManager(this.config)
      this.branchManager = new BranchManager(this.versionManager)
      
      // 设置事件监听器
      this.setupVersionControlEventListeners()
      
      // 创建版本控制面板
      if (this.config.showVersionPanel) {
        this.createVersionPanel()
      }
      
      // 设置快捷键
      if (this.config.enableShortcuts) {
        this.setupShortcuts()
      }
      
      // 启用自动保存
      if (this.config.enableAutoSave) {
        this.startAutoSave()
      }
      
      // 创建初始版本
      await this.createInitialVersion()
      
      this.isEnabled = true
      
      // 触发版本控制启用事件
      this.editor!.emit('version-control:enabled')
      
      console.log('版本控制功能启用成功')
    } catch (error) {
      console.error('启用版本控制功能失败:', error)
      throw error
    }
  }

  /**
   * 禁用版本控制功能
   */
  disableVersionControl(): void {
    if (!this.isEnabled) {
      return
    }

    try {
      // 停止自动保存
      this.stopAutoSave()
      
      // 移除版本控制面板
      this.removeVersionPanel()
      
      // 移除快捷键
      this.removeShortcuts()
      
      // 移除事件监听器
      this.removeVersionControlEventListeners()
      
      this.versionManager = undefined
      this.branchManager = undefined
      this.isEnabled = false
      
      // 触发版本控制禁用事件
      this.editor!.emit('version-control:disabled')
      
      console.log('版本控制功能已禁用')
    } catch (error) {
      console.error('禁用版本控制功能失败:', error)
    }
  }

  /**
   * 创建版本
   */
  async createVersion(options: Partial<CreateVersionOptions> = {}): Promise<Version> {
    if (!this.versionManager) {
      throw new Error('版本控制功能未启用')
    }

    const flowchartData = this.editor!.getData()
    const createOptions: CreateVersionOptions = {
      author: 'user',
      ...options
    }

    return this.versionManager.createVersion(flowchartData, createOptions)
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory(): Promise<Version[]> {
    if (!this.versionManager) {
      return []
    }

    return this.versionManager.getVersionHistory()
  }

  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(versionId: string): Promise<void> {
    if (!this.versionManager) {
      throw new Error('版本控制功能未启用')
    }

    const version = await this.versionManager.rollbackToVersion(versionId)
    
    // 应用版本数据到编辑器
    this.editor!.setData(version.data)
  }

  /**
   * 比较版本
   */
  async compareVersions(sourceId: string, targetId: string): Promise<VersionComparison> {
    if (!this.versionManager) {
      throw new Error('版本控制功能未启用')
    }

    return this.versionManager.compareVersions(sourceId, targetId)
  }

  /**
   * 创建分支
   */
  async createBranch(name: string, baseVersionId?: string): Promise<Branch> {
    if (!this.branchManager || !this.versionManager) {
      throw new Error('版本控制功能未启用')
    }

    const currentVersion = this.versionManager.getCurrentVersion()
    const baseId = baseVersionId || currentVersion?.id

    if (!baseId) {
      throw new Error('无法确定基础版本')
    }

    return this.branchManager.createBranch(name, baseId, {
      author: 'user'
    })
  }

  /**
   * 切换分支
   */
  async switchBranch(name: string): Promise<void> {
    if (!this.branchManager || !this.versionManager) {
      throw new Error('版本控制功能未启用')
    }

    const branch = await this.branchManager.switchBranch(name)
    
    // 获取分支的最新版本数据
    const latestVersion = await this.versionManager.getVersion(branch.latestVersionId)
    if (latestVersion) {
      this.editor!.setData(latestVersion.data)
    }
  }

  /**
   * 合并分支
   */
  async mergeBranch(options: MergeOptions): Promise<any> {
    if (!this.branchManager) {
      throw new Error('版本控制功能未启用')
    }

    return this.branchManager.mergeBranch(options)
  }

  /**
   * 获取分支列表
   */
  async getBranches(): Promise<Branch[]> {
    if (!this.branchManager) {
      return []
    }

    return this.branchManager.getBranches()
  }

  /**
   * 设置编辑器事件监听器
   */
  private setupEditorEventListeners(): void {
    if (!this.editor) return

    // 监听数据变化
    this.editor.on('data:change', this.handleDataChange)
  }

  /**
   * 移除编辑器事件监听器
   */
  private removeEditorEventListeners(): void {
    if (!this.editor) return

    this.editor.off('data:change', this.handleDataChange)
  }

  /**
   * 设置版本控制事件监听器
   */
  private setupVersionControlEventListeners(): void {
    if (!this.versionManager || !this.branchManager) return

    this.versionManager.on('version:created', this.handleVersionCreated)
    this.versionManager.on('version:updated', this.handleVersionUpdated)
    this.branchManager.on('branch:created', this.handleBranchCreated)
    this.branchManager.on('branch:switched', this.handleBranchSwitched)
  }

  /**
   * 移除版本控制事件监听器
   */
  private removeVersionControlEventListeners(): void {
    if (!this.versionManager || !this.branchManager) return

    this.versionManager.off('version:created', this.handleVersionCreated)
    this.versionManager.off('version:updated', this.handleVersionUpdated)
    this.branchManager.off('branch:created', this.handleBranchCreated)
    this.branchManager.off('branch:switched', this.handleBranchSwitched)
  }

  /**
   * 创建版本控制面板
   */
  private createVersionPanel(): void {
    this.versionPanel = document.createElement('div')
    this.versionPanel.className = 'flowchart-version-panel'
    this.versionPanel.innerHTML = `
      <div class="version-panel-header">
        <h3>版本控制</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="version-tabs">
        <button class="tab-btn active" data-tab="versions">版本</button>
        <button class="tab-btn" data-tab="branches">分支</button>
      </div>
      <div class="version-content">
        <div class="tab-content active" id="versions-tab">
          <div class="version-actions">
            <button class="create-version-btn">创建版本</button>
            <button class="auto-save-btn">自动保存</button>
          </div>
          <div class="version-list">
            <!-- 版本列表将在这里动态生成 -->
          </div>
        </div>
        <div class="tab-content" id="branches-tab">
          <div class="branch-actions">
            <button class="create-branch-btn">创建分支</button>
            <button class="merge-branch-btn">合并分支</button>
          </div>
          <div class="branch-list">
            <!-- 分支列表将在这里动态生成 -->
          </div>
        </div>
      </div>
    `
    
    // 添加样式
    this.addVersionPanelStyles()
    
    // 添加事件监听器
    this.setupVersionPanelEventListeners()
    
    // 添加到编辑器容器
    const editorContainer = this.editor!.getContainer()
    editorContainer.appendChild(this.versionPanel)
    
    // 初始化面板内容
    this.updateVersionPanel()
  }

  /**
   * 移除版本控制面板
   */
  private removeVersionPanel(): void {
    if (this.versionPanel) {
      this.versionPanel.remove()
      this.versionPanel = undefined
    }
  }

  /**
   * 添加版本控制面板样式
   */
  private addVersionPanelStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .flowchart-version-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 300px;
        height: 500px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }
      
      .version-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .version-tabs {
        display: flex;
        border-bottom: 1px solid #eee;
      }
      
      .tab-btn {
        flex: 1;
        padding: 10px;
        border: none;
        background: none;
        cursor: pointer;
      }
      
      .tab-btn.active {
        background: #f5f5f5;
        border-bottom: 2px solid #007bff;
      }
      
      .version-content {
        flex: 1;
        overflow: hidden;
      }
      
      .tab-content {
        display: none;
        height: 100%;
        padding: 10px;
        overflow-y: auto;
      }
      
      .tab-content.active {
        display: block;
      }
      
      .version-actions, .branch-actions {
        margin-bottom: 10px;
      }
      
      .version-actions button, .branch-actions button {
        margin-right: 5px;
        padding: 5px 10px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        cursor: pointer;
      }
      
      .version-item, .branch-item {
        padding: 8px;
        border: 1px solid #eee;
        border-radius: 3px;
        margin-bottom: 5px;
        cursor: pointer;
      }
      
      .version-item:hover, .branch-item:hover {
        background: #f5f5f5;
      }
      
      .version-item.current, .branch-item.current {
        background: #e3f2fd;
        border-color: #2196f3;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 设置版本控制面板事件监听器
   */
  private setupVersionPanelEventListeners(): void {
    if (!this.versionPanel) return

    // 关闭按钮
    const closeBtn = this.versionPanel.querySelector('.close-btn')
    closeBtn?.addEventListener('click', () => this.removeVersionPanel())

    // 标签切换
    const tabBtns = this.versionPanel.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab')
        this.switchTab(tab!)
      })
    })

    // 创建版本按钮
    const createVersionBtn = this.versionPanel.querySelector('.create-version-btn')
    createVersionBtn?.addEventListener('click', async () => {
      try {
        await this.createVersion({
          name: `Version ${Date.now()}`,
          description: '手动创建的版本'
        })
        this.updateVersionPanel()
      } catch (error) {
        console.error('创建版本失败:', error)
      }
    })

    // 创建分支按钮
    const createBranchBtn = this.versionPanel.querySelector('.create-branch-btn')
    createBranchBtn?.addEventListener('click', async () => {
      const branchName = prompt('请输入分支名称:')
      if (branchName) {
        try {
          await this.createBranch(branchName)
          this.updateVersionPanel()
        } catch (error) {
          console.error('创建分支失败:', error)
        }
      }
    })
  }

  /**
   * 切换标签
   */
  private switchTab(tab: string): void {
    if (!this.versionPanel) return

    // 更新标签按钮状态
    const tabBtns = this.versionPanel.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab)
    })

    // 更新内容显示
    const tabContents = this.versionPanel.querySelectorAll('.tab-content')
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tab}-tab`)
    })
  }

  /**
   * 更新版本控制面板
   */
  private async updateVersionPanel(): Promise<void> {
    if (!this.versionPanel) return

    try {
      // 更新版本列表
      await this.updateVersionList()
      
      // 更新分支列表
      await this.updateBranchList()
    } catch (error) {
      console.error('更新版本控制面板失败:', error)
    }
  }

  /**
   * 更新版本列表
   */
  private async updateVersionList(): Promise<void> {
    if (!this.versionPanel || !this.versionManager) return

    const versionList = this.versionPanel.querySelector('.version-list')
    if (!versionList) return

    const versions = await this.getVersionHistory()
    const currentVersion = this.versionManager.getCurrentVersion()

    versionList.innerHTML = versions.map(version => `
      <div class="version-item ${version.id === currentVersion?.id ? 'current' : ''}" data-version-id="${version.id}">
        <div class="version-name">${version.name || version.version}</div>
        <div class="version-info">
          <small>${version.author} • ${new Date(version.createdAt).toLocaleString()}</small>
        </div>
        <div class="version-description">${version.description || ''}</div>
      </div>
    `).join('')

    // 添加版本项点击事件
    const versionItems = versionList.querySelectorAll('.version-item')
    versionItems.forEach(item => {
      item.addEventListener('click', async () => {
        const versionId = item.getAttribute('data-version-id')
        if (versionId) {
          try {
            await this.rollbackToVersion(versionId)
            this.updateVersionPanel()
          } catch (error) {
            console.error('回滚版本失败:', error)
          }
        }
      })
    })
  }

  /**
   * 更新分支列表
   */
  private async updateBranchList(): Promise<void> {
    if (!this.versionPanel || !this.branchManager) return

    const branchList = this.versionPanel.querySelector('.branch-list')
    if (!branchList) return

    const branches = await this.getBranches()
    const currentBranch = this.branchManager.getCurrentBranch()

    branchList.innerHTML = branches.map(branch => `
      <div class="branch-item ${branch.name === currentBranch?.name ? 'current' : ''}" data-branch-name="${branch.name}">
        <div class="branch-name">${branch.name} ${branch.isMain ? '(主分支)' : ''}</div>
        <div class="branch-info">
          <small>${branch.author} • ${new Date(branch.createdAt).toLocaleString()}</small>
        </div>
        <div class="branch-description">${branch.description || ''}</div>
      </div>
    `).join('')

    // 添加分支项点击事件
    const branchItems = branchList.querySelectorAll('.branch-item')
    branchItems.forEach(item => {
      item.addEventListener('click', async () => {
        const branchName = item.getAttribute('data-branch-name')
        if (branchName) {
          try {
            await this.switchBranch(branchName)
            this.updateVersionPanel()
          } catch (error) {
            console.error('切换分支失败:', error)
          }
        }
      })
    })
  }

  /**
   * 创建初始版本
   */
  private async createInitialVersion(): Promise<void> {
    if (!this.versionManager) return

    try {
      const currentVersion = this.versionManager.getCurrentVersion()
      if (!currentVersion) {
        await this.createVersion({
          name: 'Initial Version',
          description: '初始版本',
          author: 'system',
          isMajor: true
        })
      }
    } catch (error) {
      console.error('创建初始版本失败:', error)
    }
  }

  /**
   * 启动自动保存
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }

    this.autoSaveTimer = window.setInterval(async () => {
      try {
        await this.createVersion({
          name: `Auto Save ${new Date().toLocaleString()}`,
          description: '自动保存的版本',
          author: 'system',
          tags: ['auto-save']
        })
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }, this.config?.autoSaveInterval || 60000)
  }

  /**
   * 停止自动保存
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = undefined
    }
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
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      this.createVersion({
        name: `Manual Save ${new Date().toLocaleString()}`,
        description: '手动保存的版本'
      })
    }
  }

  private handleDataChange = (): void => {
    // 数据变化时的处理逻辑
    // 可以在这里实现自动版本创建等功能
  }

  private handleVersionCreated = (version: Version): void => {
    this.editor!.emit('version:created', version)
    this.updateVersionPanel()
  }

  private handleVersionUpdated = (version: Version): void => {
    this.editor!.emit('version:updated', version)
    this.updateVersionPanel()
  }

  private handleBranchCreated = (branch: Branch): void => {
    this.editor!.emit('branch:created', branch)
    this.updateVersionPanel()
  }

  private handleBranchSwitched = (branch: Branch): void => {
    this.editor!.emit('branch:switched', branch)
    this.updateVersionPanel()
  }
}

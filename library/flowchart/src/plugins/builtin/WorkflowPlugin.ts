/**
 * 工作流插件
 * 
 * 为流程图编辑器提供工作流执行功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'
import {
  WorkflowEngine,
  MemoryWorkflowStorage,
  type ProcessDefinition,
  type ProcessInstance,
  type ProcessContext,
  type Task,
  type TaskResult,
  type TaskQuery,
  type WorkflowConfig,
  type WorkflowStats
} from '../../workflow'

/**
 * 工作流插件配置
 */
export interface WorkflowPluginConfig extends Partial<WorkflowConfig> {
  /** 是否显示工作流面板 */
  showWorkflowPanel?: boolean
  /** 面板位置 */
  panelPosition?: 'top' | 'right' | 'bottom' | 'left'
  /** 是否启用实时监控 */
  enableRealTimeMonitoring?: boolean
  /** 是否显示执行轨迹 */
  showExecutionTrace?: boolean
}

/**
 * 工作流插件类
 */
export class WorkflowPlugin extends BasePlugin<WorkflowPluginConfig> {
  readonly name = 'workflow'
  readonly version = '1.0.0'
  readonly description = '工作流执行引擎插件'

  private workflowEngine?: WorkflowEngine
  private workflowPanel?: HTMLElement
  private config?: WorkflowPluginConfig
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
    
    console.log('工作流插件安装完成')
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.disableWorkflow()
    this.removeEditorEventListeners()
    this.removeWorkflowPanel()
    
    console.log('工作流插件卸载完成')
  }

  /**
   * 启用工作流功能
   */
  async enableWorkflow(config?: WorkflowPluginConfig): Promise<void> {
    if (this.isEnabled) {
      return
    }

    this.config = {
      enabled: true,
      defaultTimeout: 300000, // 5分钟
      maxConcurrentInstances: 100,
      taskAssignmentStrategy: 'round_robin',
      enableAudit: true,
      storage: {
        type: 'memory'
      },
      showWorkflowPanel: true,
      panelPosition: 'right',
      enableRealTimeMonitoring: true,
      showExecutionTrace: true,
      ...config
    }

    try {
      // 创建工作流引擎
      this.workflowEngine = new WorkflowEngine(this.config)
      
      // 初始化引擎
      await this.workflowEngine.initialize()
      
      // 设置事件监听器
      this.setupWorkflowEventListeners()
      
      // 创建工作流面板
      if (this.config.showWorkflowPanel) {
        this.createWorkflowPanel()
      }
      
      this.isEnabled = true
      
      // 触发工作流启用事件
      this.editor!.emit('workflow:enabled')
      
      console.log('工作流功能启用成功')
    } catch (error) {
      console.error('启用工作流功能失败:', error)
      throw error
    }
  }

  /**
   * 禁用工作流功能
   */
  async disableWorkflow(): Promise<void> {
    if (!this.isEnabled) {
      return
    }

    try {
      // 移除工作流面板
      this.removeWorkflowPanel()
      
      // 移除事件监听器
      this.removeWorkflowEventListeners()
      
      // 销毁工作流引擎
      if (this.workflowEngine) {
        await this.workflowEngine.destroy()
        this.workflowEngine = undefined
      }
      
      this.isEnabled = false
      
      // 触发工作流禁用事件
      this.editor!.emit('workflow:disabled')
      
      console.log('工作流功能已禁用')
    } catch (error) {
      console.error('禁用工作流功能失败:', error)
    }
  }

  /**
   * 部署流程定义
   */
  async deployProcess(name: string, description?: string): Promise<ProcessDefinition> {
    if (!this.workflowEngine) {
      throw new Error('工作流功能未启用')
    }

    const flowchartData = this.editor!.getFlowchartData()
    
    const definition: ProcessDefinition = {
      id: this.generateProcessId(),
      name,
      version: '1.0.0',
      description: description || '',
      flowchartData,
      config: {
        allowParallel: true,
        priority: 'normal',
        notifications: {
          enableEmail: false,
          enableSMS: false,
          enableInApp: true,
          templates: {}
        },
        audit: {
          enabled: true,
          level: 'detailed',
          retentionDays: 90
        }
      },
      createdAt: Date.now(),
      createdBy: 'current-user', // TODO: 获取当前用户
      enabled: true,
      variables: [],
      forms: []
    }

    await this.workflowEngine.deployProcess(definition)
    
    // 更新工作流面板
    this.updateWorkflowPanel()
    
    return definition
  }

  /**
   * 启动流程实例
   */
  async startProcess(
    processDefinitionId: string,
    variables: Record<string, any> = {},
    businessData: Record<string, any> = {}
  ): Promise<ProcessInstance> {
    if (!this.workflowEngine) {
      throw new Error('工作流功能未启用')
    }

    const context: ProcessContext = {
      processInstance: {} as ProcessInstance, // 将在引擎中设置
      variables,
      user: {
        id: 'current-user',
        username: 'current-user',
        displayName: '当前用户',
        email: 'user@example.com',
        roles: ['user'],
        organizations: []
      },
      organization: {
        id: 'default-org',
        name: '默认组织',
        type: 'company',
        level: 1
      },
      businessData
    }

    const instance = await this.workflowEngine.startProcess(processDefinitionId, context)
    
    // 更新工作流面板
    this.updateWorkflowPanel()
    
    return instance
  }

  /**
   * 执行任务
   */
  async executeTask(taskId: string, result: 'approve' | 'reject' | 'complete', data?: Record<string, any>): Promise<void> {
    if (!this.workflowEngine) {
      throw new Error('工作流功能未启用')
    }

    const taskResult: TaskResult = {
      taskId,
      result,
      data,
      executor: 'current-user',
      executeTime: Date.now()
    }

    await this.workflowEngine.executeTask(taskId, taskResult)
    
    // 更新工作流面板
    this.updateWorkflowPanel()
  }

  /**
   * 获取流程实例
   */
  async getProcessInstance(instanceId: string): Promise<ProcessInstance | null> {
    if (!this.workflowEngine) {
      return null
    }

    return this.workflowEngine.getProcessInstance(instanceId)
  }

  /**
   * 获取任务列表
   */
  async getTasks(query?: Partial<TaskQuery>): Promise<Task[]> {
    if (!this.workflowEngine) {
      return []
    }

    return this.workflowEngine.getTasks(query || {})
  }

  /**
   * 暂停流程实例
   */
  async suspendProcess(instanceId: string): Promise<void> {
    if (!this.workflowEngine) {
      throw new Error('工作流功能未启用')
    }

    await this.workflowEngine.suspendProcess(instanceId)
    this.updateWorkflowPanel()
  }

  /**
   * 恢复流程实例
   */
  async resumeProcess(instanceId: string): Promise<void> {
    if (!this.workflowEngine) {
      throw new Error('工作流功能未启用')
    }

    await this.workflowEngine.resumeProcess(instanceId)
    this.updateWorkflowPanel()
  }

  /**
   * 终止流程实例
   */
  async terminateProcess(instanceId: string, reason?: string): Promise<void> {
    if (!this.workflowEngine) {
      throw new Error('工作流功能未启用')
    }

    await this.workflowEngine.terminateProcess(instanceId, reason)
    this.updateWorkflowPanel()
  }

  /**
   * 获取工作流统计
   */
  async getStats(): Promise<WorkflowStats | null> {
    if (!this.workflowEngine) {
      return null
    }

    return this.workflowEngine.getStats()
  }

  /**
   * 设置编辑器事件监听器
   */
  private setupEditorEventListeners(): void {
    if (!this.editor) return

    // 监听流程图数据变化
    this.editor.on('data:changed', this.handleDataChanged)
  }

  /**
   * 移除编辑器事件监听器
   */
  private removeEditorEventListeners(): void {
    if (!this.editor) return

    this.editor.off('data:changed', this.handleDataChanged)
  }

  /**
   * 设置工作流事件监听器
   */
  private setupWorkflowEventListeners(): void {
    if (!this.workflowEngine) return

    this.workflowEngine.on('process:started', this.handleProcessStarted)
    this.workflowEngine.on('process:completed', this.handleProcessCompleted)
    this.workflowEngine.on('process:terminated', this.handleProcessTerminated)
    this.workflowEngine.on('task:created', this.handleTaskCreated)
    this.workflowEngine.on('task:completed', this.handleTaskCompleted)
  }

  /**
   * 移除工作流事件监听器
   */
  private removeWorkflowEventListeners(): void {
    if (!this.workflowEngine) return

    this.workflowEngine.off('process:started', this.handleProcessStarted)
    this.workflowEngine.off('process:completed', this.handleProcessCompleted)
    this.workflowEngine.off('process:terminated', this.handleProcessTerminated)
    this.workflowEngine.off('task:created', this.handleTaskCreated)
    this.workflowEngine.off('task:completed', this.handleTaskCompleted)
  }

  /**
   * 创建工作流面板
   */
  private createWorkflowPanel(): void {
    this.workflowPanel = document.createElement('div')
    this.workflowPanel.className = 'flowchart-workflow-panel'
    this.workflowPanel.innerHTML = `
      <div class="workflow-panel-header">
        <h3>工作流管理</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="workflow-tabs">
        <button class="tab-btn active" data-tab="processes">流程</button>
        <button class="tab-btn" data-tab="tasks">任务</button>
        <button class="tab-btn" data-tab="monitoring">监控</button>
      </div>
      <div class="workflow-content">
        <div class="tab-content active" id="processes-tab">
          <div class="process-actions">
            <button class="deploy-process-btn">部署流程</button>
            <button class="start-process-btn">启动流程</button>
          </div>
          <div class="process-list">
            <!-- 流程列表将在这里动态生成 -->
          </div>
        </div>
        <div class="tab-content" id="tasks-tab">
          <div class="task-actions">
            <button class="refresh-tasks-btn">刷新任务</button>
          </div>
          <div class="task-list">
            <!-- 任务列表将在这里动态生成 -->
          </div>
        </div>
        <div class="tab-content" id="monitoring-tab">
          <div class="monitoring-content">
            <!-- 监控内容将在这里显示 -->
          </div>
        </div>
      </div>
    `
    
    // 添加样式
    this.addWorkflowPanelStyles()
    
    // 添加事件监听器
    this.setupWorkflowPanelEventListeners()
    
    // 添加到编辑器容器
    const editorContainer = this.editor!.getContainer()
    editorContainer.appendChild(this.workflowPanel)
    
    // 初始化面板内容
    this.updateWorkflowPanel()
  }

  /**
   * 移除工作流面板
   */
  private removeWorkflowPanel(): void {
    if (this.workflowPanel) {
      this.workflowPanel.remove()
      this.workflowPanel = undefined
    }
  }

  /**
   * 添加工作流面板样式
   */
  private addWorkflowPanelStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .flowchart-workflow-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 400px;
        height: 700px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }
      
      .workflow-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .workflow-tabs {
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
      
      .workflow-content {
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
      
      .process-actions, .task-actions {
        margin-bottom: 10px;
      }
      
      .process-actions button, .task-actions button {
        margin-right: 5px;
        padding: 5px 10px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        cursor: pointer;
      }
      
      .process-item, .task-item {
        padding: 8px;
        border: 1px solid #eee;
        border-radius: 3px;
        margin-bottom: 5px;
        cursor: pointer;
      }
      
      .process-item:hover, .task-item:hover {
        background: #f5f5f5;
      }
      
      .process-item.running {
        border-left: 4px solid #28a745;
      }
      
      .process-item.completed {
        border-left: 4px solid #007bff;
      }
      
      .process-item.terminated {
        border-left: 4px solid #dc3545;
      }
      
      .task-item.assigned {
        border-left: 4px solid #ffc107;
      }
      
      .task-item.completed {
        border-left: 4px solid #28a745;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 设置工作流面板事件监听器
   */
  private setupWorkflowPanelEventListeners(): void {
    if (!this.workflowPanel) return

    // 关闭按钮
    const closeBtn = this.workflowPanel.querySelector('.close-btn')
    closeBtn?.addEventListener('click', () => this.removeWorkflowPanel())

    // 标签切换
    const tabBtns = this.workflowPanel.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab')
        this.switchTab(tab!)
      })
    })

    // 部署流程按钮
    const deployBtn = this.workflowPanel.querySelector('.deploy-process-btn')
    deployBtn?.addEventListener('click', () => this.showDeployProcessDialog())

    // 启动流程按钮
    const startBtn = this.workflowPanel.querySelector('.start-process-btn')
    startBtn?.addEventListener('click', () => this.showStartProcessDialog())

    // 刷新任务按钮
    const refreshBtn = this.workflowPanel.querySelector('.refresh-tasks-btn')
    refreshBtn?.addEventListener('click', () => this.updateWorkflowPanel())
  }

  /**
   * 切换标签
   */
  private switchTab(tab: string): void {
    if (!this.workflowPanel) return

    // 更新标签按钮状态
    const tabBtns = this.workflowPanel.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab)
    })

    // 更新内容显示
    const tabContents = this.workflowPanel.querySelectorAll('.tab-content')
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tab}-tab`)
    })
  }

  /**
   * 更新工作流面板
   */
  private async updateWorkflowPanel(): Promise<void> {
    if (!this.workflowPanel) return

    try {
      // 更新流程列表
      await this.updateProcessList()
      
      // 更新任务列表
      await this.updateTaskList()
      
      // 更新监控信息
      await this.updateMonitoring()
    } catch (error) {
      console.error('更新工作流面板失败:', error)
    }
  }

  /**
   * 更新流程列表
   */
  private async updateProcessList(): Promise<void> {
    // TODO: 实现流程列表更新
  }

  /**
   * 更新任务列表
   */
  private async updateTaskList(): Promise<void> {
    // TODO: 实现任务列表更新
  }

  /**
   * 更新监控信息
   */
  private async updateMonitoring(): Promise<void> {
    // TODO: 实现监控信息更新
  }

  /**
   * 显示部署流程对话框
   */
  private showDeployProcessDialog(): void {
    // TODO: 实现部署流程对话框
  }

  /**
   * 显示启动流程对话框
   */
  private showStartProcessDialog(): void {
    // TODO: 实现启动流程对话框
  }

  /**
   * 生成流程ID
   */
  private generateProcessId(): string {
    return `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 事件处理器
  private handleDataChanged = (): void => {
    // 流程图数据变化时的处理
  }

  private handleProcessStarted = (instance: ProcessInstance): void => {
    this.editor!.emit('workflow:process-started', instance)
    this.updateWorkflowPanel()
  }

  private handleProcessCompleted = (instance: ProcessInstance): void => {
    this.editor!.emit('workflow:process-completed', instance)
    this.updateWorkflowPanel()
  }

  private handleProcessTerminated = (instance: ProcessInstance): void => {
    this.editor!.emit('workflow:process-terminated', instance)
    this.updateWorkflowPanel()
  }

  private handleTaskCreated = (task: Task): void => {
    this.editor!.emit('workflow:task-created', task)
    this.updateWorkflowPanel()
  }

  private handleTaskCompleted = (task: Task, result: TaskResult): void => {
    this.editor!.emit('workflow:task-completed', task, result)
    this.updateWorkflowPanel()
  }
}

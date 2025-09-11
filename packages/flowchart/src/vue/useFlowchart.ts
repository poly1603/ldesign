/**
 * Vue 3 Composition API Hook for Flowchart Editor
 * 
 * 提供响应式的流程图编辑器功能
 */

import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { FlowchartEditor } from '../core/FlowchartEditor'
import type { 
  FlowchartEditorConfig, 
  FlowchartData, 
  ApprovalNodeConfig, 
  FlowchartTheme 
} from '../types'

export interface UseFlowchartOptions extends Omit<FlowchartEditorConfig, 'container'> {
  // 自动初始化
  autoInit?: boolean
  // 自动销毁
  autoDestroy?: boolean
}

export interface UseFlowchartReturn {
  // 编辑器实例
  editor: Ref<FlowchartEditor | null>
  
  // 状态
  isReady: Ref<boolean>
  selectedNode: Ref<ApprovalNodeConfig | null>
  currentTheme: Ref<FlowchartTheme>
  isReadonly: Ref<boolean>
  
  // 初始化方法
  init: (container: HTMLElement | string) => Promise<void>
  destroy: () => void
  
  // 数据操作
  getData: () => FlowchartData | undefined
  setData: (data: FlowchartData) => void
  clearData: () => void
  
  // 节点操作
  addNode: (config: ApprovalNodeConfig) => string | undefined
  updateNode: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => void
  deleteNode: (nodeId: string) => void
  getNode: (nodeId: string) => ApprovalNodeConfig | undefined
  
  // 边操作
  addEdge: (config: any) => string | undefined
  deleteEdge: (edgeId: string) => void
  
  // 视图操作
  zoomToFit: () => void
  zoomIn: () => void
  zoomOut: () => void
  
  // 历史操作
  undo: () => void
  redo: () => void
  
  // 主题操作
  setTheme: (theme: FlowchartTheme) => void
  
  // 模式操作
  setReadonly: (readonly: boolean) => void
  
  // 导出操作
  exportImage: (type?: 'png' | 'jpeg') => Promise<string | undefined>
  exportData: () => string | undefined
}

/**
 * 使用流程图编辑器的组合式API
 */
export function useFlowchart(options: UseFlowchartOptions = {}): UseFlowchartReturn {
  // 响应式状态
  const editor = ref<FlowchartEditor | null>(null)
  const isReady = ref(false)
  const selectedNode = ref<ApprovalNodeConfig | null>(null)
  const currentTheme = ref<FlowchartTheme>(options.theme || 'default')
  const isReadonly = ref(options.readonly || false)

  /**
   * 初始化编辑器
   */
  const init = async (container: HTMLElement | string): Promise<void> => {
    if (editor.value) {
      console.warn('编辑器已经初始化，请先调用destroy()方法')
      return
    }

    try {
      const config: FlowchartEditorConfig = {
        container,
        ...options
      }

      editor.value = new FlowchartEditor(config)

      // 绑定事件监听器
      editor.value.on('node:select', (node) => {
        selectedNode.value = node
      })

      editor.value.on('theme:change', (theme) => {
        currentTheme.value = theme
      })

      editor.value.on('data:change', () => {
        // 数据变化时可以触发其他响应式更新
      })

      // 渲染编辑器
      editor.value.render()
      isReady.value = true

      console.log('✅ 流程图编辑器初始化成功')
    } catch (error) {
      console.error('❌ 流程图编辑器初始化失败:', error)
      throw error
    }
  }

  /**
   * 销毁编辑器
   */
  const destroy = (): void => {
    if (editor.value) {
      editor.value.destroy()
      editor.value = null
      isReady.value = false
      selectedNode.value = null
      console.log('✅ 流程图编辑器已销毁')
    }
  }

  // 数据操作方法
  const getData = (): FlowchartData | undefined => {
    return editor.value?.getData()
  }

  const setData = (data: FlowchartData): void => {
    editor.value?.setData(data)
  }

  const clearData = (): void => {
    editor.value?.clearData()
  }

  // 节点操作方法
  const addNode = (config: ApprovalNodeConfig): string | undefined => {
    return editor.value?.addNode(config)
  }

  const updateNode = (nodeId: string, updates: Partial<ApprovalNodeConfig>): void => {
    editor.value?.updateNode(nodeId, updates)
  }

  const deleteNode = (nodeId: string): void => {
    editor.value?.deleteNode(nodeId)
  }

  const getNode = (nodeId: string): ApprovalNodeConfig | undefined => {
    return editor.value?.getNode(nodeId)
  }

  // 边操作方法
  const addEdge = (config: any): string | undefined => {
    return editor.value?.addEdge(config)
  }

  const deleteEdge = (edgeId: string): void => {
    editor.value?.deleteEdge(edgeId)
  }

  // 视图操作方法
  const zoomToFit = (): void => {
    editor.value?.zoomToFit()
  }

  const zoomIn = (): void => {
    editor.value?.zoomIn()
  }

  const zoomOut = (): void => {
    editor.value?.zoomOut()
  }

  // 历史操作方法
  const undo = (): void => {
    editor.value?.undo()
  }

  const redo = (): void => {
    editor.value?.redo()
  }

  // 主题操作方法
  const setTheme = (theme: FlowchartTheme): void => {
    if (editor.value) {
      editor.value.setTheme(theme)
      currentTheme.value = theme
    }
  }

  // 模式操作方法
  const setReadonly = (readonly: boolean): void => {
    if (editor.value) {
      editor.value.setReadonly(readonly)
      isReadonly.value = readonly
    }
  }

  // 导出操作方法
  const exportImage = async (type: 'png' | 'jpeg' = 'png'): Promise<string | undefined> => {
    return editor.value?.exportImage(type)
  }

  const exportData = (): string | undefined => {
    return editor.value?.exportData()
  }

  // 监听选项变化
  watch(() => options.readonly, (newVal) => {
    if (newVal !== undefined) {
      setReadonly(newVal)
    }
  })

  watch(() => options.theme, (newVal) => {
    if (newVal) {
      setTheme(newVal)
    }
  })

  // 生命周期管理
  if (options.autoDestroy !== false) {
    onUnmounted(() => {
      destroy()
    })
  }

  return {
    // 状态
    editor,
    isReady,
    selectedNode,
    currentTheme,
    isReadonly,
    
    // 方法
    init,
    destroy,
    getData,
    setData,
    clearData,
    addNode,
    updateNode,
    deleteNode,
    getNode,
    addEdge,
    deleteEdge,
    zoomToFit,
    zoomIn,
    zoomOut,
    undo,
    redo,
    setTheme,
    setReadonly,
    exportImage,
    exportData
  }
}

/**
 * 创建流程图编辑器实例的便捷方法
 */
export function createFlowchartEditor(
  container: HTMLElement | string,
  options: UseFlowchartOptions = {}
): Promise<UseFlowchartReturn> {
  const flowchart = useFlowchart({ ...options, autoInit: false })
  
  return flowchart.init(container).then(() => flowchart)
}

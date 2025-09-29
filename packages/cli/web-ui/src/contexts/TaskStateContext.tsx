import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// 输出行接口
export interface OutputLine {
  timestamp: string
  content: string
  type: 'info' | 'error' | 'success'
}

// 服务器信息接口
export interface ServerInfo {
  localUrl?: string
  networkUrl?: string
  qrCode?: string
  port?: string
}

// 任务状态接口
export interface TaskState {
  taskId: string
  taskType: 'dev' | 'build' | 'preview'
  environment: string
  status: 'idle' | 'running' | 'error' | 'completed'
  outputLines: OutputLine[]
  serverInfo: ServerInfo
  startTime?: Date
  endTime?: Date
}

// 全局任务状态接口
interface GlobalTaskState {
  tasks: { [taskId: string]: TaskState }
  activeTask?: string
}

// Context 接口
interface TaskStateContextType {
  // 状态
  tasks: { [taskId: string]: TaskState }
  activeTask?: string

  // 方法
  getTask: (taskId: string) => TaskState | undefined
  createTask: (taskId: string, taskType: 'dev' | 'build' | 'preview', environment: string) => void
  updateTaskStatus: (taskId: string, status: TaskState['status']) => void
  addOutputLine: (taskId: string, line: OutputLine) => void
  updateServerInfo: (taskId: string, serverInfo: Partial<ServerInfo>) => void
  clearTaskOutput: (taskId: string) => void
  setActiveTask: (taskId: string) => void
  removeTask: (taskId: string) => void
  clearAllTasks: () => void
}

const TaskStateContext = createContext<TaskStateContextType | undefined>(undefined)

export const useTaskState = () => {
  const context = useContext(TaskStateContext)
  if (!context) {
    throw new Error('useTaskState must be used within a TaskStateProvider')
  }
  return context
}

// 本地存储键
const STORAGE_KEY = 'ldesign-task-state'
const MAX_OUTPUT_LINES = 1000 // 限制日志条数

// 从本地存储加载状态
const loadStateFromStorage = (): GlobalTaskState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('从本地存储恢复任务状态:', parsed)

      // 验证和修复数据格式
      const validatedState: GlobalTaskState = { tasks: {} }

      if (parsed.tasks && typeof parsed.tasks === 'object') {
        Object.keys(parsed.tasks).forEach(taskId => {
          const task = parsed.tasks[taskId]
          if (task && typeof task === 'object') {
            validatedState.tasks[taskId] = {
              taskId: task.taskId || taskId,
              taskType: task.taskType || 'dev',
              environment: task.environment || 'development',
              status: task.status || 'idle',
              outputLines: Array.isArray(task.outputLines) ? task.outputLines : [],
              serverInfo: task.serverInfo || {},
              startTime: task.startTime ? new Date(task.startTime) : undefined,
              endTime: task.endTime ? new Date(task.endTime) : undefined
            }
          }
        })
      }

      if (parsed.activeTask && typeof parsed.activeTask === 'string') {
        validatedState.activeTask = parsed.activeTask
      }

      return validatedState
    }
  } catch (error) {
    console.error('Failed to load task state from storage:', error)
  }
  return { tasks: {} }
}

// 保存状态到本地存储
const saveStateToStorage = (state: GlobalTaskState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save task state to storage:', error)
  }
}

interface TaskStateProviderProps {
  children: React.ReactNode
}

export const TaskStateProvider: React.FC<TaskStateProviderProps> = ({ children }) => {
  // 初始化时从本地存储恢复状态，确保页面刷新后能保持之前的任务状态和日志
  const [state, setState] = useState<GlobalTaskState>(() => {
    const restoredState = loadStateFromStorage()
    console.log('TaskStateProvider初始化，恢复状态:', restoredState)
    return restoredState
  })

  // 保存状态到本地存储
  useEffect(() => {
    saveStateToStorage(state)
  }, [state])

  // 监听清理所有数据事件
  useEffect(() => {
    const handleClearAllData = () => {
      console.log('处理清理所有数据事件')
      setState({ tasks: {}, activeTask: undefined })
      localStorage.removeItem(STORAGE_KEY)
    }

    window.addEventListener('clear-all-data', handleClearAllData)
    return () => {
      window.removeEventListener('clear-all-data', handleClearAllData)
    }
  }, [])

  // 获取任务
  const getTask = useCallback((taskId: string): TaskState | undefined => {
    return state.tasks[taskId]
  }, [state.tasks])

  // 创建任务
  const createTask = useCallback((taskId: string, taskType: 'dev' | 'build' | 'preview', environment: string) => {
    console.log(`Creating task ${taskId} (${taskType}, ${environment})`)
    setState(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          taskId,
          taskType,
          environment,
          status: 'idle',
          outputLines: [],
          serverInfo: {},
          startTime: new Date()
        }
      }
    }))
  }, [])

  // 更新任务状态
  const updateTaskStatus = useCallback((taskId: string, status: TaskState['status']) => {
    setState(prev => {
      const existingTask = prev.tasks[taskId]
      if (!existingTask) {
        console.warn(`Task ${taskId} not found, cannot update status`)
        return prev
      }

      console.log(`Updating task ${taskId} status to ${status}`)

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...existingTask,
            status,
            endTime: status === 'completed' || status === 'error' ? new Date() : existingTask.endTime
          }
        }
      }
    })
  }, [])

  // 添加输出行
  const addOutputLine = useCallback((taskId: string, line: OutputLine) => {
    setState(prev => {
      const task = prev.tasks[taskId]
      if (!task) return prev

      // 确保outputLines是数组
      const currentOutputLines = Array.isArray(task.outputLines) ? task.outputLines : []
      const newOutputLines = [...currentOutputLines, line]

      // 限制日志条数
      if (newOutputLines.length > MAX_OUTPUT_LINES) {
        newOutputLines.splice(0, newOutputLines.length - MAX_OUTPUT_LINES)
      }

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...task,
            outputLines: newOutputLines
          }
        }
      }
    })
  }, [])

  // 更新服务器信息
  const updateServerInfo = useCallback((taskId: string, serverInfo: Partial<ServerInfo>) => {
    setState(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          serverInfo: {
            ...prev.tasks[taskId]?.serverInfo,
            ...serverInfo
          }
        }
      }
    }))
  }, [])

  // 清空任务输出
  const clearTaskOutput = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          outputLines: []
        }
      }
    }))
  }, [])

  // 设置活动任务
  const setActiveTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      activeTask: taskId
    }))
  }, [])

  // 移除任务
  const removeTask = useCallback((taskId: string) => {
    setState(prev => {
      const newTasks = { ...prev.tasks }
      delete newTasks[taskId]
      return {
        ...prev,
        tasks: newTasks,
        activeTask: prev.activeTask === taskId ? undefined : prev.activeTask
      }
    })
  }, [])

  // 清理所有任务
  const clearAllTasks = useCallback(() => {
    console.log('清理所有任务状态')
    setState({ tasks: {}, activeTask: undefined })
    // 同时清理本地存储
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value: TaskStateContextType = {
    tasks: state.tasks,
    activeTask: state.activeTask,
    getTask,
    createTask,
    updateTaskStatus,
    addOutputLine,
    updateServerInfo,
    clearTaskOutput,
    setActiveTask,
    removeTask,
    clearAllTasks
  }

  return (
    <TaskStateContext.Provider value={value}>
      {children}
    </TaskStateContext.Provider>
  )
}

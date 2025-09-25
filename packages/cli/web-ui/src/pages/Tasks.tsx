import React, { useState, useEffect } from 'react'
import {
  Play,
  Square,
  Terminal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface TaskStatus {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime?: string
  endTime?: string
  exitCode?: number
  output: string[]
  error?: string
}

interface TaskOutput {
  taskId: string
  output: string
  type: 'stdout' | 'stderr'
  timestamp: string
}

const Tasks: React.FC = () => {
  const { socket } = useSocket()
  const [tasks, setTasks] = useState<TaskStatus[]>([])
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [taskOutputs, setTaskOutputs] = useState<Map<string, TaskOutput[]>>(new Map())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({
    name: 'build',
    options: {}
  })

  useEffect(() => {
    if (!socket) return

    // 监听任务列表更新
    socket.on('tasks:list', (taskList: TaskStatus[]) => {
      setTasks(taskList)
    })

    // 监听任务状态更新
    socket.on('task:update', (task: TaskStatus) => {
      setTasks(prev => {
        const index = prev.findIndex(t => t.id === task.id)
        if (index >= 0) {
          const newTasks = [...prev]
          newTasks[index] = task
          return newTasks
        } else {
          return [...prev, task]
        }
      })
    })

    // 监听任务输出
    socket.on('task:output', (output: TaskOutput) => {
      setTaskOutputs(prev => {
        const newMap = new Map(prev)
        const taskOutputs = newMap.get(output.taskId) || []
        newMap.set(output.taskId, [...taskOutputs, output])
        return newMap
      })
    })

    return () => {
      socket.off('tasks:list')
      socket.off('task:update')
      socket.off('task:output')
    }
  }, [socket])

  const handleRunTask = async () => {
    try {
      const result = await api.runTask(taskForm.name, taskForm.options)
      toast.success(`任务 ${taskForm.name} 已启动`)
      setShowTaskForm(false)
      
      // 订阅任务输出
      if (socket && result.taskId) {
        socket.emit('subscribe:task', result.taskId)
      }
    } catch (error) {
      toast.error(`启动任务失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleStopTask = async (taskId: string) => {
    try {
      await api.stopTask(taskId)
      toast.success('任务已停止')
    } catch (error) {
      toast.error(`停止任务失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedTaskData = selectedTask ? tasks.find(t => t.id === selectedTask) : null
  const selectedTaskOutput = selectedTask ? taskOutputs.get(selectedTask) || [] : []

  return (
    <div className="space-y-6">
      {/* 任务控制 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">任务管理</h2>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            运行任务
          </button>
        </div>

        {/* 任务表单 */}
        {showTaskForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">新建任务</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务类型
                </label>
                <select
                  value={taskForm.name}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="init">初始化项目</option>
                  <option value="build">构建项目</option>
                  <option value="dev">开发服务器</option>
                  <option value="test">运行测试</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleRunTask}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  启动
                </button>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 任务列表 */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无运行中的任务
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedTask === task.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}
                `}
                onClick={() => setSelectedTask(task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-500">ID: {task.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    
                    {task.status === 'running' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStopTask(task.id)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 任务详情和输出 */}
      {selectedTaskData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              任务详情 - {selectedTaskData.name}
            </h2>
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">实时输出</span>
            </div>
          </div>

          {/* 任务信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">状态</div>
              <div className={`font-medium ${getStatusColor(selectedTaskData.status)}`}>
                {selectedTaskData.status}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">开始时间</div>
              <div className="font-medium">
                {selectedTaskData.startTime ? new Date(selectedTaskData.startTime).toLocaleString() : '-'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">结束时间</div>
              <div className="font-medium">
                {selectedTaskData.endTime ? new Date(selectedTaskData.endTime).toLocaleString() : '-'}
              </div>
            </div>
          </div>

          {/* 输出日志 */}
          <div className="terminal">
            {selectedTaskOutput.length === 0 ? (
              <div className="text-gray-500">暂无输出</div>
            ) : (
              selectedTaskOutput.map((output, index) => (
                <div key={index} className={`log-line ${output.type === 'stderr' ? 'log-error' : ''}`}>
                  {output.output}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks

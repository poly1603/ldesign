import React, { useState, useEffect, useRef } from 'react'
import { Play, Square, Monitor, Trash2 } from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'
import { useTaskState } from '../contexts/TaskStateContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import QRCodeDisplay from '../components/QRCodeDisplay'
// @ts-ignore
import Convert from 'ansi-to-html'

interface Environment {
  key: string
  name: string
  description: string
  icon: string
  port: number
  features: string
}

interface ProcessStatus {
  [key: string]: 'idle' | 'running' | 'error'
}

// 初始化ANSI转换器
const convert = new Convert({
  fg: '#ffffff',
  bg: '#000000',
  newline: false,
  escapeXML: true,
  stream: false
})

// 处理输出内容 - 后端已经清理了控制序列，但保留了颜色
const processOutputContent = (content: string): { html: string; isQRCode: boolean } => {
  // 检测是否是二维码内容
  const isQRCode = /[▄█▀]/.test(content)
  // 转换ANSI颜色代码为HTML
  const html = convert.toHtml(content)
  return { html, isQRCode }
}


const DevPage: React.FC = () => {
  const { socket, isConnected } = useSocket()
  const {
    getTask,
    createTask,
    updateTaskStatus,
    addOutputLine,
    updateServerInfo,
    clearTaskOutput,
    setActiveTask,
    clearAllTasks
  } = useTaskState()

  // 环境选择状态 - 从localStorage恢复，确保刷新后保持选择
  const [selectedEnv, setSelectedEnv] = useState(() => {
    try {
      const stored = localStorage.getItem('ldesign-cli-selected-env')
      return stored || 'development'
    } catch {
      return 'development'
    }
  })
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({})
  const [autoScroll, setAutoScroll] = useState(true)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const currentTaskIdRef = useRef<string | null>(null)
  const lastLogIdRef = useRef<number | undefined>(undefined)

  // 环境配置
  const environments: Environment[] = [
    {
      key: 'development',
      name: '开发环境',
      description: '本地开发环境，包含调试工具和热重载',
      icon: '🔧',
      port: 3340,
      features: '调试模式 + 热重载'
    },
    {
      key: 'test',
      name: '测试环境',
      description: '测试环境配置，用于功能测试和集成测试',
      icon: '🧪',
      port: 3341,
      features: '测试模式 + Mock数据'
    },
    {
      key: 'staging',
      name: '预发布环境',
      description: '预发布环境，接近生产环境的配置',
      icon: '🎭',
      port: 3342,
      features: '预发布 + 性能监控'
    },
    {
      key: 'production',
      name: '生产环境',
      description: '生产环境配置，用于最终部署',
      icon: '🚀',
      port: 3000,
      features: '生产模式 + 优化'
    }
  ]

  const processKey = `dev-${selectedEnv}`

  // 获取或创建当前任务
  const currentTask = getTask(processKey)
  const outputLines = currentTask?.outputLines || []
  const serverInfo = currentTask?.serverInfo || {}

  const isProcessRunning = processStatus[processKey] === 'running' || currentTask?.status === 'running'
  const hasOutput = outputLines.length > 0

  // 从全局状态恢复任务状态
  useEffect(() => {
    if (currentTask && currentTask.status === 'running') {
      setProcessStatus(prev => ({
        ...prev,
        [processKey]: 'running'
      }))
    }
  }, [currentTask, processKey])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [outputLines, autoScroll])

  // 获取环境对应的服务器类型
  const getServerType = () => {
    switch (selectedEnv) {
      case 'development':
        return '开发服务器'
      case 'testing':
        return '测试服务器'
      case 'staging':
        return '预发布服务器'
      case 'production':
        return '生产服务器'
      default:
        return '开发服务器'
    }
  }

  // Socket事件监听
  useEffect(() => {
    if (!socket) return

    // 监听清理所有数据事件
    const handleClearAllData = () => {
      console.log('收到清理所有数据事件，清理本地状态');
      // 清理本地状态
      clearAllTasks();
      setProcessStatus({});
    };

    const handleTaskUpdate = (data: any) => {
      console.log('handleTaskUpdate received:', data)
      // 后端发送的是TaskStatus对象，包含id字段
      const taskId = data.id
      if (!taskId) {
        console.warn('No taskId found in task update data:', data)
        return
      }

      const taskIdParts = taskId.split('-')
      if (taskIdParts.length >= 2) {
        const command = taskIdParts[0]
        const environment = taskIdParts[1]
        const key = `${command}-${environment}`

        console.log(`Processing task update for ${key}, status: ${data.status}`)

        // 如果是当前环境，记录当前真实 taskId，便于增量拉取
        if (key === processKey) {
          currentTaskIdRef.current = taskId
        }

        // 更新本地状态（用于UI响应）
        setProcessStatus(prev => ({
          ...prev,
          [key]: data.status
        }))

        // 更新全局任务状态
        if (!getTask(key)) {
          createTask(key, command as any, environment)
        }
        updateTaskStatus(key, data.status === 'running' ? 'running' : data.status === 'failed' ? 'error' : 'completed')
      }
    }

    const handleTaskOutput = (data: any) => {
      // 从 taskId 中提取命令和环境信息
      const taskIdParts = data.taskId.split('-')
      if (taskIdParts.length >= 2) {
        const command = taskIdParts[0]
        const environment = taskIdParts[1]
        const key = `${command}-${environment}`
        if (key === processKey) {
          const output = data.output

          // 确保任务存在
          if (!getTask(key)) {
            console.log(`Creating task ${key} from handleTaskOutput`)
            createTask(key, command as any, environment)
            // 设置任务为运行状态
            updateTaskStatus(key, 'running')
          }

          // 后端已经处理了行缓冲和清理，直接添加到输出
          // output 现在是一个完整的、已清理的行
          if (output.trim()) {
            addOutputLine(key, {
              timestamp: new Date().toLocaleTimeString(),
              content: output,
              type: data.type === 'stderr' ? 'error' : 'info'
            })
          }

          // 检测是否包含二维码块，如果包含则更新 serverInfo.qrCode（不影响日志显示）
          if (/[▄█▀]/.test(output)) {
            updateServerInfo(key, { qrCode: output })
          }

          // 提取服务器信息 - 先清理ANSI代码，然后使用最宽松的匹配模式
          const cleanOutput = output
            .replace(/\x1b\[[0-9;]*m/g, '')  // 清理 \x1b[XXm 格式
            .replace(/\[\d+m/g, '')          // 清理 [XXm 格式
            .replace(/\[[\d;]*m/g, '')       // 清理 [XX;XXm 格式
            .replace(/\[\d+;\d+m/g, '')      // 清理 [XX;XXm 格式
            .replace(/\[2m/g, '')            // 清理 [2m (粗体开始)
            .replace(/\[22m/g, '')           // 清理 [22m (粗体结束)
            .replace(/\[36m/g, '')           // 清理 [36m (青色)
            .replace(/\[39m/g, '')           // 清理 [39m (默认前景色)
            .replace(/\[90m/g, '')           // 清理 [90m (暗灰色)
            .replace(/\[1m/g, '')            // 清理 [1m (粗体)
            .replace(/\[0m/g, '')            // 清理 [0m (重置)
            .replace(/\[32m/g, '')           // 清理 [32m (绿色)
            .trim()
          const localMatch = cleanOutput.match(/本地[:\s]*(http:\/\/[^\s\n\r]+)/i)
          const networkMatch = cleanOutput.match(/网络[:\s]*(http:\/\/[^\s\n\r]+)/i)
          const portMatch = cleanOutput.match(/localhost:(\d+)/)

          if (localMatch || networkMatch) {
            console.log('🔍 服务器信息匹配成功:', { localMatch, networkMatch, portMatch })

            // 更新全局服务器信息
            updateServerInfo(key, {
              localUrl: localMatch ? localMatch[1].trim() : undefined,
              networkUrl: networkMatch ? networkMatch[1].trim() : undefined,
              port: portMatch ? portMatch[1] : undefined
            })

            if (localMatch) {
              toast.success(`🌐 本地开发地址: ${localMatch[1].trim()}`)
            }
            if (networkMatch) {
              toast.success(`📱 网络开发地址: ${networkMatch[1].trim()}`)
            }
          } else {
            console.log('❌ 服务器信息匹配失败')
            console.log('输出内容长度:', output.length)
            console.log('输出内容前200字符:', output.substring(0, 200))
            console.log('是否包含"本地":', output.includes('本地'))
            console.log('是否包含"网络":', output.includes('网络'))
            console.log('是否包含"localhost":', output.includes('localhost'))
          }

          // 检测二维码
          if (output.includes('▄') || output.includes('█') || output.includes('▀')) {
            updateServerInfo(key, { qrCode: output })
          }
        }
      }
    }

    socket.on('task:update', handleTaskUpdate)
    socket.on('task:output', handleTaskOutput)
    socket.on('clear-all-data', handleClearAllData)

    return () => {
      socket.off('task:update', handleTaskUpdate)
      socket.off('task:output', handleTaskOutput)
      socket.off('clear-all-data', handleClearAllData)
    }
  }, [socket, processKey])

  // 保存环境选择到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ldesign-cli-selected-env', selectedEnv)
    } catch (error) {
      console.warn('Failed to save selected environment to localStorage:', error)
    }
  }, [selectedEnv])

  // 环境切换时设置活动任务
  useEffect(() => {
    setActiveTask(processKey)
  }, [selectedEnv, processKey, setActiveTask])

  // 从后端API恢复状态（只在需要时恢复）
  useEffect(() => {
    const restoreStateFromBackend = async (retryCount = 0) => {
      const maxRetries = 3
      const retryDelay = 1000 * (retryCount + 1) // 递增延迟

      try {
        // 检查是否已经有了合适的状态，如果有则跳过恢复
        const existingTask = getTask(processKey)
        if (existingTask && existingTask.outputLines.length > 0) {
          console.log(`Task ${processKey} already has output, skipping restore to prevent clearing logs`)
          // 但仍然需要恢复taskId和状态，以便增量日志拉取能正常工作
          if (existingTask.taskId) {
            currentTaskIdRef.current = existingTask.taskId
            const status = existingTask.status === 'running' ? 'running' : existingTask.status === 'error' ? 'error' : 'idle'
            setProcessStatus(prev => ({
              ...prev,
              [processKey]: status
            }))
          }
          return
        }

        console.log(`Attempting to restore state for: dev-${selectedEnv} (attempt ${retryCount + 1})`)

        // 确保任务存在于TaskState中
        if (!getTask(processKey)) {
          console.log(`Creating task ${processKey} in TaskState`)
          createTask(processKey, 'dev', selectedEnv)
        }

        const task = await api.getTaskByTypeAndEnv('dev', selectedEnv)
        if (task && typeof task === 'object' && task.taskId) {
          console.log(`Restoring state from backend:`, task)
          currentTaskIdRef.current = task.taskId

          // 恢复进程状态 - 安全地访问status属性
          const taskStatus = task.status || 'idle'
          const status = taskStatus === 'running' ? 'running' : taskStatus === 'error' ? 'error' : 'idle'
          setProcessStatus(prev => ({
            ...prev,
            [processKey]: status
          }))

          // 更新TaskState中的任务状态
          updateTaskStatus(processKey, status === 'running' ? 'running' : status === 'error' ? 'error' : 'idle')

          // 判断是否已有输出，避免重复恢复；不再清空前端日志，防止“被覆盖”的感觉
          const currentTask = getTask(processKey)
          const hasExistingOutput = currentTask && currentTask.outputLines.length > 0

          // 恢复输出行 - 仅在没有现有输出时追加历史
          if (!hasExistingOutput) {
            // 安全地处理outputLines，确保它是数组
            const outputLines = Array.isArray(task.outputLines) ? task.outputLines : []
            outputLines.forEach((line: any) => {
              // 验证line对象的完整性
              if (line && typeof line === 'object' && line.content && line.timestamp && line.type) {
                const isQRCodeOutput = line.content.includes('▄') || line.content.includes('█') || line.content.includes('▀')
                if (!isQRCodeOutput) {
                  addOutputLine(processKey, {
                    timestamp: line.timestamp,
                    content: line.content,
                    type: line.type
                  })
                }
              } else {
                console.warn('Invalid output line format:', line)
              }
            })
          }

          // 恢复服务器信息 - 安全地处理serverInfo
          if (task.serverInfo && typeof task.serverInfo === 'object') {
            updateServerInfo(processKey, {
              localUrl: task.serverInfo.localUrl,
              networkUrl: task.serverInfo.networkUrl,
              port: task.serverInfo.port
            })
          }

          // 读取最新一条日志的id，随后做一次性增量回补，避免刷新间隙丢日志
          try {
            const latest = await api.getLogs(task.taskId, { limit: 1 })
            const last = latest?.logs?.[0]
            if (last) lastLogIdRef.current = last.id
            // 1s 后做一次 after 拉取，补齐刷新间隙
            setTimeout(async () => {
              try {
                const after = lastLogIdRef.current
                const inc = await api.getLogs(task.taskId, { after, limit: 500 })
                const newLogs = Array.isArray(inc?.logs) ? inc.logs : []
                if (newLogs.length) {
                  newLogs.forEach((log: any) => {
                    // 验证log对象的完整性
                    if (log && typeof log === 'object' && log.content && log.ts && log.type && log.id) {
                      const isQRCodeOutput = log.content.includes('▄') || log.content.includes('█') || log.content.includes('▀')
                      if (!isQRCodeOutput) {
                        addOutputLine(processKey, {
                          timestamp: log.ts,
                          content: log.content,
                          type: log.type === 'stderr' ? 'error' : log.type
                        })
                      }
                      lastLogIdRef.current = log.id
                    } else {
                      console.warn('Invalid log format:', log)
                    }
                  })
                }
              } catch (e) {
                console.warn('增量日志拉取失败：', e)
              }
            }, 1000)
          } catch (e) {
            console.warn('获取最新日志ID失败：', e)
          }

          console.log(`State restored successfully for ${processKey}`)
        } else {
          console.log(`No existing task found for: dev-${selectedEnv}`)
          // 即使没有找到任务，也要确保TaskState中有对应的任务
          if (!getTask(processKey)) {
            createTask(processKey, 'dev', selectedEnv)
          }
        }
      } catch (error) {
        console.error(`Failed to restore state from backend (attempt ${retryCount + 1}):`, error)

        // 如果还有重试次数，则进行重试
        if (retryCount < maxRetries) {
          console.log(`Retrying state restoration in ${retryDelay}ms...`)
          setTimeout(() => {
            restoreStateFromBackend(retryCount + 1)
          }, retryDelay)
        } else {
          console.error('Max retries reached, giving up state restoration')
          // 即使恢复失败，也要确保TaskState中有对应的任务
          if (!getTask(processKey)) {
            createTask(processKey, 'dev', selectedEnv)
          }
        }
      }
    }

    // 延迟一点时间再恢复，确保组件完全初始化
    const timer = setTimeout(() => {
      restoreStateFromBackend()
    }, 100)

    return () => clearTimeout(timer)
  }, [processKey, selectedEnv])

  // 当 Socket 断开时，启动增量日志轮询，避免错过输出
  useEffect(() => {
    if (isConnected) return
    const taskId = currentTaskIdRef.current
    if (!taskId) return

    let timer: any = null
    const tick = async () => {
      try {
        const after = lastLogIdRef.current
        const data = await api.getLogs(taskId, after ? { after, limit: 500 } : { limit: 200 })
        const logs = data?.logs || []
        if (logs.length) {
          logs.forEach((log: any) => {
            const isQRCodeOutput = log.content.includes('▄') || log.content.includes('█') || log.content.includes('▀')
            if (!isQRCodeOutput) {
              addOutputLine(processKey, {
                timestamp: log.ts,
                content: log.content,
                type: log.type === 'stderr' ? 'error' : log.type
              })
            }
            lastLogIdRef.current = log.id
          })
        }
      } catch (e) {
        console.warn('轮询拉取日志失败：', e)
      }
    }

    timer = setInterval(tick, 2000)
    tick()
    return () => clearInterval(timer)
  }, [isConnected, processKey])

  // Socket 正常时做低频校验（每30秒补一次，防极端丢包）
  useEffect(() => {
    if (!isConnected) return
    const taskId = currentTaskIdRef.current
    if (!taskId) return

    let timer: any = null
    const tick = async () => {
      try {
        const after = lastLogIdRef.current
        // 低频校验数量可以较小
        const data = await api.getLogs(taskId, after ? { after, limit: 200 } : { limit: 200 })
        const logs = data?.logs || []
        if (logs.length) {
          logs.forEach((log: any) => {
            const isQRCodeOutput = log.content.includes('▄') || log.content.includes('█') || log.content.includes('▀')
            if (!isQRCodeOutput) {
              addOutputLine(processKey, {
                timestamp: log.ts,
                content: log.content,
                type: log.type === 'stderr' ? 'error' : log.type
              })
            }
            lastLogIdRef.current = log.id
          })
        }
      } catch (e) {
        console.warn('低频日志校验失败：', e)
      }
    }

    timer = setInterval(tick, 30000)
    return () => clearInterval(timer)
  }, [isConnected, processKey])

  const executeCommand = async () => {
    if (!isConnected) {
      toast.error('服务器未连接')
      return
    }

    // 重置增量拉取状态
    currentTaskIdRef.current = null
    lastLogIdRef.current = undefined

    // 重置服务器信息（不清空日志，避免启动后日志被清空）
    updateServerInfo(processKey, {
      localUrl: undefined,
      networkUrl: undefined,
      qrCode: undefined,
      port: undefined
    })

    try {
      const result = await api.runTask('dev', {
        environment: selectedEnv
        // 不设置 cwd，使用默认的 context.cwd (app 目录)
      })

      toast.success('开发服务器启动中...')
      console.log('Dev command started:', result)
    } catch (error) {
      toast.error(`启动失败: ${error instanceof Error ? error.message : '未知错误'}`)
      addOutputLine(processKey, {
        timestamp: new Date().toLocaleTimeString(),
        content: `启动失败: ${error}`,
        type: 'error'
      })
    }
  }

  const stopProcess = async () => {
    if (!isConnected) {
      toast.error('服务器未连接')
      return
    }

    try {
      const result = await api.stopTask('dev', {
        environment: selectedEnv
      })

      // 清理服务器信息
      updateServerInfo(processKey, {
        localUrl: undefined,
        networkUrl: undefined,
        qrCode: undefined,
        port: undefined
      })

      toast.success('正在停止开发服务器...')
      console.log('Dev command stopped:', result)
    } catch (error) {
      toast.error(`停止失败: ${error instanceof Error ? error.message : '未知错误'}`)
      addOutputLine(processKey, {
        timestamp: new Date().toLocaleTimeString(),
        content: `停止失败: ${error}`,
        type: 'error'
      })
    }
  }

  const clearOutput = () => {
    clearTaskOutput(processKey)
  }

  const getStatusText = () => {
    const status = processStatus[processKey] || 'idle'
    switch (status) {
      case 'running': return '运行中'
      case 'error': return '错误'
      default: return '已停止'
    }
  }

  const getStatusColor = () => {
    const status = processStatus[processKey] || 'idle'
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🚀</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">项目启动</h1>
              <p className="text-gray-600">启动开发服务器，支持热重载和实时预览</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">当前环境:</div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {selectedEnv.toUpperCase()}
            </div>
            <div className={`flex items-center space-x-1 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? '服务器已连接' : '服务器未连接'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 环境选择 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">选择环境</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {environments.map((env) => (
            <button
              key={env.key}
              onClick={() => setSelectedEnv(env.key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedEnv === env.key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{env.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{env.name}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{env.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  端口: {env.port}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {env.features}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedEnv.toUpperCase()} {getServerType()}
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={executeCommand}
            disabled={isProcessRunning || !isConnected}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isProcessRunning || !isConnected
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            <Play className="w-4 h-4" />
            <span>{isProcessRunning ? '启动中...' : '启动开发'}</span>
          </button>

          {isProcessRunning && (
            <button
              onClick={stopProcess}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>停止</span>
            </button>
          )}

          {/* 打开页面按钮 */}
          {(serverInfo.localUrl || serverInfo.networkUrl) && (
            <button
              onClick={() => {
                const url = serverInfo.localUrl || serverInfo.networkUrl
                if (url) {
                  window.open(url, '_blank')
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              <span>打开页面</span>
            </button>
          )}

          <button
            onClick={clearOutput}
            disabled={!hasOutput}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${!hasOutput
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>清空</span>
          </button>

        </div>
      </div>

      {/* 服务器信息显示区域 - 只在服务运行时显示 */}
      {isProcessRunning && (serverInfo.localUrl || serverInfo.networkUrl) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-green-600" />
            服务器地址
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 本地地址 */}
            {serverInfo.localUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">本地访问地址</h4>
                    <p className="text-sm text-green-600 mt-1">推荐使用此地址访问</p>
                  </div>
                  <div className="text-right">
                    <a
                      href={serverInfo.localUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 font-mono text-sm underline"
                    >
                      {serverInfo.localUrl}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(serverInfo.localUrl!)
                        toast.success('地址已复制到剪贴板')
                      }}
                      className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 网络地址 */}
            {serverInfo.networkUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-800">网络访问地址</h4>
                    <p className="text-sm text-blue-600 mt-1">局域网内其他设备可访问</p>
                  </div>
                  <div className="text-right">
                    <a
                      href={serverInfo.networkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-800 font-mono text-sm underline"
                    >
                      {serverInfo.networkUrl}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(serverInfo.networkUrl!)
                        toast.success('地址已复制到剪贴板')
                      }}
                      className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 二维码显示 */}
          {serverInfo.networkUrl && (
            <div className="mt-6">
              <QRCodeDisplay
                url={serverInfo.networkUrl}
                title="手机扫码访问"
                description="使用手机扫描二维码快速访问开发服务器"
                size={180}
                showCopy={true}
              />
            </div>
          )}
        </div>
      )}

      {/* 输出区域 - 始终显示 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>dev 命令输出</span>
          </h4>
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span>自动滚动</span>
          </label>
        </div>
        <div ref={logContainerRef} className="h-[600px] overflow-y-auto bg-gray-900 text-gray-100 font-mono text-sm">
          {!hasOutput && !isProcessRunning && (
            <div className="p-4 text-gray-400 italic">点击启动按钮开始执行命令...</div>
          )}
          {!hasOutput && isProcessRunning && (
            <div className="p-4 text-gray-400 italic">等待命令输出...</div>
          )}
          {outputLines.map((line, index) => {
            const { html, isQRCode } = processOutputContent(line.content)
            return (
              <div
                key={index}
                className={`flex px-4 py-1 border-b border-gray-800 ${line.type === 'error' ? 'bg-red-900/20 text-red-300' :
                  line.type === 'success' ? 'bg-green-900/20 text-green-300' :
                    'text-gray-100'
                  } ${isQRCode ? 'font-mono text-xs leading-none' : ''}`}
              >
                <span className="w-20 text-gray-500 mr-4 flex-shrink-0">
                  {line.timestamp}
                </span>
                <span
                  className={`flex-1 ${isQRCode ? 'whitespace-pre font-mono' : 'whitespace-pre-wrap break-words'}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DevPage

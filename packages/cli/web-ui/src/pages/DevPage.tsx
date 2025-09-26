import React, { useState, useEffect, useRef } from 'react'
import { Play, Square, Monitor, Trash2 } from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'
import { useTaskState } from '../contexts/TaskStateContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'
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

// 处理ANSI转义序列和二维码的函数
const processOutputContent = (content: string): { html: string; isQRCode: boolean } => {
  // 检查是否是二维码行
  const isQRCode = content.includes('▄') || content.includes('█') || content.includes('▀')

  if (isQRCode) {
    // 对于二维码，保持原始字符，只移除颜色代码
    const cleanContent = content.replace(/\x1b\[[0-9;]*m/g, '')
    return { html: cleanContent, isQRCode: true }
  }

  // 对于普通文本，转换ANSI颜色代码
  const html = convert.toHtml(content)
  return { html, isQRCode: false }
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
    setActiveTask
  } = useTaskState()

  const [selectedEnv, setSelectedEnv] = useState('development')
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({})
  const [autoScroll, setAutoScroll] = useState(true)
  const logContainerRef = useRef<HTMLDivElement>(null)

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
      console.log('handleTaskOutput received:', data)
      // 从taskId中提取命令和环境信息
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

          // 添加输出行到全局状态
          addOutputLine(key, {
            timestamp: new Date().toLocaleTimeString(),
            content: output,
            type: data.type === 'stderr' ? 'error' : 'info'
          })

          // 检测开发服务器启动成功标志
          if (output.includes('✔ 开发服务器已启动') || output.includes('开发服务器启动成功')) {
            console.log('Dev server started successfully, updating task status to completed')
            updateTaskStatus(key, 'completed')
            toast.success('🎉 开发服务器启动成功！')
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

    return () => {
      socket.off('task:update', handleTaskUpdate)
      socket.off('task:output', handleTaskOutput)
    }
  }, [socket, processKey])

  // 环境切换时设置活动任务
  useEffect(() => {
    setActiveTask(processKey)
  }, [selectedEnv, processKey, setActiveTask])

  // 从后端API恢复状态
  useEffect(() => {
    const restoreStateFromBackend = async () => {
      try {
        console.log(`Attempting to restore state for: dev-${selectedEnv}`)
        const task = await api.getTaskByTypeAndEnv('dev', selectedEnv)
        if (task) {
          console.log(`Restoring state from backend:`, task)

          // 恢复进程状态
          const status = task.status === 'running' ? 'running' : 'idle'
          setProcessStatus(prev => ({
            ...prev,
            [processKey]: status
          }))

          // 恢复输出行 - 使用全局状态管理
          task.outputLines.forEach((line: any) => {
            addOutputLine(processKey, {
              timestamp: line.timestamp,
              content: line.content,
              type: line.type
            })
          })

          // 恢复服务器信息 - 先尝试从后端数据，如果没有则从输出日志中解析
          let serverInfoRestored = false
          if (task.serverInfo.localUrl || task.serverInfo.networkUrl) {
            updateServerInfo(processKey, {
              localUrl: task.serverInfo.localUrl,
              networkUrl: task.serverInfo.networkUrl,
              port: task.serverInfo.port
            })
            serverInfoRestored = true
          }

          // 如果后端没有服务器信息，从输出日志中重新解析
          if (!serverInfoRestored) {
            const allOutput = task.outputLines.map((line: any) => line.content).join('\n')
            const cleanOutput = allOutput
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
              console.log('🔍 从输出日志中解析服务器信息成功:', { localMatch, networkMatch, portMatch })
              updateServerInfo(processKey, {
                localUrl: localMatch ? localMatch[1].trim() : undefined,
                networkUrl: networkMatch ? networkMatch[1].trim() : undefined,
                port: portMatch ? portMatch[1] : undefined
              })
            }

            // 检测二维码
            if (allOutput.includes('▄') || allOutput.includes('█') || allOutput.includes('▀')) {
              updateServerInfo(processKey, { qrCode: allOutput })
            }
          }

          console.log(`State restored successfully for ${processKey}`)
        } else {
          console.log(`No existing task found for: dev-${selectedEnv}`)
        }
      } catch (error) {
        console.error('Failed to restore state from backend:', error)
      }
    }

    restoreStateFromBackend()
  }, [processKey, selectedEnv])

  const executeCommand = async () => {
    if (!isConnected) {
      toast.error('服务器未连接')
      return
    }

    // 清空之前的日志
    clearTaskOutput(processKey)

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
          {serverInfo.qrCode && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">手机扫码访问</h4>
              <div className="bg-white p-2 rounded border inline-block">
                <pre className="text-xs font-mono leading-none text-black whitespace-pre">
                  {serverInfo.qrCode.replace(/\x1b\[[0-9;]*m/g, '')}
                </pre>
              </div>
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
                  className={`flex-1 ${isQRCode ? 'whitespace-pre font-mono' : 'break-all'}`}
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

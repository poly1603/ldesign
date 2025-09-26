import React, { useState, useEffect, useRef } from 'react'
import { Hammer, Square, Monitor, Trash2 } from 'lucide-react'
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
  output: string
  features: string
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
    const cleanContent = content
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
    return { html: cleanContent, isQRCode: true }
  }

  // 对于普通文本，转换ANSI颜色代码
  const html = convert.toHtml(content)
  return { html, isQRCode: false }
}

const BuildPage: React.FC = () => {
  const { socket, isConnected } = useSocket()
  const {
    getTask,
    createTask,
    updateTaskStatus,
    addOutputLine,
    clearTaskOutput,
    updateServerInfo
  } = useTaskState()

  const [selectedEnv, setSelectedEnv] = useState('production')
  const [autoScroll, setAutoScroll] = useState(true)
  const [buildTimes, setBuildTimes] = useState<{ [key: string]: string }>({})
  const logContainerRef = useRef<HTMLDivElement>(null)

  // 环境配置
  const environments: Environment[] = [
    {
      key: 'development',
      name: '开发构建',
      description: '开发环境构建，包含源码映射和调试信息',
      icon: '🔧',
      output: 'dist-dev',
      features: 'SourceMap + 调试信息'
    },
    {
      key: 'test',
      name: '测试构建',
      description: '测试环境构建，用于自动化测试和质量检查',
      icon: '🧪',
      output: 'dist-test',
      features: '测试优化 + 覆盖率'
    },
    {
      key: 'staging',
      name: '预发布构建',
      description: '预发布环境构建，接近生产环境的优化',
      icon: '🎭',
      output: 'dist-staging',
      features: '预发布优化 + 监控'
    },
    {
      key: 'production',
      name: '生产构建',
      description: '生产环境构建，完全优化和压缩',
      icon: '🚀',
      output: 'site',
      features: '完全优化 + 压缩'
    }
  ]

  const processKey = `build-${selectedEnv}`
  const currentTask = getTask(processKey)
  const isProcessRunning = currentTask?.status === 'running'
  const hasOutput = (currentTask?.outputLines?.length || 0) > 0
  const outputLines = currentTask?.outputLines || []

  // 获取环境对应的构建类型
  const getBuildType = () => {
    switch (selectedEnv) {
      case 'development':
        return '开发构建'
      case 'testing':
        return '测试构建'
      case 'staging':
        return '预发布构建'
      case 'production':
        return '生产构建'
      default:
        return '构建任务'
    }
  }

  // 获取构建时间
  const getBuildTime = async (envKey: string) => {
    try {
      const response = await api.getBuildTime(envKey)
      return response.buildTime
    } catch (error) {
      console.error('获取构建时间失败:', error)
      return null
    }
  }

  // 状态恢复逻辑
  useEffect(() => {
    const restoreState = async () => {
      try {
        console.log('Attempting to restore state for:', processKey)
        const taskState = await api.getTaskByTypeAndEnv('build', selectedEnv)
        if (taskState) {
          console.log('Restoring state from backend:', taskState)

          // 确保任务存在
          if (!getTask(processKey)) {
            createTask(processKey, 'build', selectedEnv)
          }

          // 恢复任务状态
          updateTaskStatus(processKey, taskState.status)

          // 恢复输出日志
          if (taskState.outputLines && taskState.outputLines.length > 0) {
            // 清空现有输出
            clearTaskOutput(processKey)
            // 添加所有输出行
            taskState.outputLines.forEach((line: any) => {
              addOutputLine(processKey, {
                timestamp: line.timestamp,
                content: line.content,
                type: line.type
              })
            })
          }

          // 恢复服务器信息
          if (taskState.serverInfo) {
            updateServerInfo(processKey, taskState.serverInfo)
          }

          console.log('State restored successfully for', processKey)
        }

        // 获取当前环境的构建时间
        const buildTime = await getBuildTime(selectedEnv)
        if (buildTime) {
          setBuildTimes(prev => ({
            ...prev,
            [selectedEnv]: buildTime
          }))
        }
      } catch (error) {
        console.error('Failed to restore state:', error)
      }
    }

    restoreState()
  }, [processKey, selectedEnv])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [outputLines, autoScroll])

  // Socket事件监听
  useEffect(() => {
    if (!socket) return

    const handleTaskUpdate = (data: any) => {
      // 从taskId中提取命令和环境信息
      const taskIdParts = data.id.split('-')
      if (taskIdParts.length >= 2) {
        const command = taskIdParts[0]
        const environment = taskIdParts[1]
        const key = `${command}-${environment}`

        console.log(`Updating task ${key} status to ${data.status}`)
        updateTaskStatus(key, data.status)
      }
    }

    const handleTaskOutput = (data: any) => {
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
            createTask(key, command as any, environment)
          }

          // 添加输出行到全局状态
          addOutputLine(key, {
            timestamp: new Date().toLocaleTimeString(),
            content: output,
            type: data.type === 'stderr' ? 'error' : 'info'
          })

          // 检测构建成功标志
          if (output.includes('✓ built in') || output.includes('[INFO] 构建成功完成!')) {
            toast.success('🎉 构建成功完成！')
          }

          // 检测输出目录信息
          if (output.includes('[INFO] 输出目录:')) {
            const match = output.match(/输出目录:\s*(.+)/)
            if (match) {
              const outputDir = match[1].trim()
              toast.success(`📁 构建文件已保存到: ${outputDir}`)
            }
          }

          // 检测文件统计信息
          if (output.includes('[INFO] 总大小:')) {
            const match = output.match(/总大小:\s*(.+)/)
            if (match) {
              const totalSize = match[1].trim()
              toast.success(`📊 构建完成，总大小: ${totalSize}`)
            }
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





  const executeCommand = async () => {
    if (!isConnected) {
      toast.error('服务器未连接')
      return
    }

    // 清空之前的日志
    clearTaskOutput(processKey)

    try {
      const result = await api.runTask('build', {
        environment: selectedEnv
        // 不设置 cwd，使用默认的 context.cwd (app 目录)
      })

      toast.success('构建任务启动中...')
      console.log('Build command started:', result)
    } catch (error) {
      toast.error(`构建失败: ${error instanceof Error ? error.message : '未知错误'}`)

      // 确保任务存在
      if (!getTask(processKey)) {
        createTask(processKey, 'build', selectedEnv)
      }

      addOutputLine(processKey, {
        timestamp: new Date().toLocaleTimeString(),
        content: `构建失败: ${error}`,
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
      const result = await api.stopTask('build', {
        environment: selectedEnv
      })

      toast.success('正在停止构建任务...')
      console.log('Build command stopped:', result)
    } catch (error) {
      toast.error(`停止失败: ${error instanceof Error ? error.message : '未知错误'}`)

      // 确保任务存在
      if (!getTask(processKey)) {
        createTask(processKey, 'build', selectedEnv)
      }

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
    const status = currentTask?.status || 'idle'
    switch (status) {
      case 'running': return '构建中'
      case 'error': return '构建失败'
      case 'completed': return '构建完成'
      default: return '已停止'
    }
  }

  const getStatusColor = () => {
    const status = currentTask?.status || 'idle'
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'completed': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📦</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">项目打包</h1>
              <p className="text-gray-600">构建生产版本，优化代码和资源</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">当前环境:</div>
            <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">选择构建环境</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {environments.map((env) => (
            <button
              key={env.key}
              onClick={() => setSelectedEnv(env.key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedEnv === env.key
                ? 'border-orange-500 bg-orange-50'
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
                  输出: {env.output}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {env.features}
                </span>
                {/* 构建时间 */}
                {buildTimes[env.key] && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                    {buildTimes[env.key]}
                  </span>
                )}
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
              {selectedEnv.toUpperCase()} {getBuildType()}
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
              : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
          >
            <Hammer className="w-4 h-4" />
            <span>{isProcessRunning ? '构建中...' : '开始构建'}</span>
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

      {/* 输出区域 - 始终显示 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>build 命令输出</span>
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
            <div className="p-4 text-gray-400 italic">点击构建按钮开始执行命令...</div>
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

export default BuildPage

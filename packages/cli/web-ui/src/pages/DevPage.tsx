import React, { useState, useEffect } from 'react'
import { Play, Square, Monitor, Trash2 } from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'
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

interface OutputLine {
  timestamp: string
  content: string
  type: 'info' | 'error' | 'success'
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
  const [selectedEnv, setSelectedEnv] = useState('development')
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({})
  const [outputLines, setOutputLines] = useState<OutputLine[]>([])
  const [autoScroll, setAutoScroll] = useState(true)

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
  const isProcessRunning = processStatus[processKey] === 'running'
  const hasOutput = outputLines.length > 0

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
      // 从taskId中提取命令和环境信息
      const taskIdParts = data.id.split('-')
      if (taskIdParts.length >= 2) {
        const command = taskIdParts[0]
        const environment = taskIdParts[1]
        const key = `${command}-${environment}`
        setProcessStatus(prev => ({
          ...prev,
          [key]: data.status
        }))
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
          addOutputLine(data.output, data.type === 'stderr' ? 'error' : 'info')
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

  // 环境切换时清空输出
  useEffect(() => {
    setOutputLines([])
  }, [selectedEnv])

  const addOutputLine = (content: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setOutputLines(prev => [...prev, { timestamp, content, type }])
  }

  const executeCommand = async () => {
    if (!isConnected) {
      toast.error('服务器未连接')
      return
    }

    try {
      const result = await api.runTask('dev', {
        environment: selectedEnv
        // 不设置 cwd，使用默认的 context.cwd (app 目录)
      })

      toast.success('开发服务器启动中...')
      console.log('Dev command started:', result)
    } catch (error) {
      toast.error(`启动失败: ${error instanceof Error ? error.message : '未知错误'}`)
      addOutputLine(`启动失败: ${error}`, 'error')
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

      toast.success('正在停止开发服务器...')
      console.log('Dev command stopped:', result)
    } catch (error) {
      toast.error(`停止失败: ${error instanceof Error ? error.message : '未知错误'}`)
      addOutputLine(`停止失败: ${error}`, 'error')
    }
  }

  const clearOutput = () => {
    setOutputLines([])
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
        <div className="h-96 overflow-y-auto bg-gray-900 text-gray-100 font-mono text-sm">
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

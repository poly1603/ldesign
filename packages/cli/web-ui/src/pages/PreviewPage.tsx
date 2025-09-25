import React, { useState, useEffect } from 'react'
import { Eye, Square, Monitor, Trash2, ExternalLink } from 'lucide-react'
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
  buildExists?: boolean
}

interface ProcessStatus {
  [key: string]: 'idle' | 'running' | 'error'
}

interface OutputLine {
  timestamp: string
  content: string
  type: 'info' | 'error' | 'success'
}

interface ServerInfo {
  localUrl?: string
  networkUrl?: string
  qrCode?: string
  port?: string
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

const PreviewPage: React.FC = () => {
  const { socket, isConnected } = useSocket()
  const [selectedEnv, setSelectedEnv] = useState('production')
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({})
  const [outputLines, setOutputLines] = useState<OutputLine[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [serverInfo, setServerInfo] = useState<ServerInfo>({})

  // 环境配置
  const environments: Environment[] = [
    {
      key: 'development',
      name: '开发预览',
      description: '预览开发构建结果，包含调试信息',
      icon: '🔧',
      port: 8881,
      features: '开发模式 + 调试'
    },
    {
      key: 'test',
      name: '测试预览',
      description: '预览测试构建结果，用于功能验证',
      icon: '🧪',
      port: 8882,
      features: '测试模式 + 验证'
    },
    {
      key: 'staging',
      name: '预发布预览',
      description: '预览预发布构建结果，接近生产环境',
      icon: '🎭',
      port: 8883,
      features: '预发布 + 监控'
    },
    {
      key: 'production',
      name: '生产预览',
      description: '预览生产构建结果，完全优化版本',
      icon: '🚀',
      port: 8888,
      features: '生产模式 + 优化'
    }
  ]

  const processKey = `preview-${selectedEnv}`
  const isProcessRunning = processStatus[processKey] === 'running'
  const hasOutput = outputLines.length > 0

  // 获取环境对应的预览类型
  const getPreviewType = () => {
    switch (selectedEnv) {
      case 'development':
        return '开发预览'
      case 'testing':
        return '测试预览'
      case 'staging':
        return '预发布预览'
      case 'production':
        return '生产预览'
      default:
        return '预览服务器'
    }
  }
  const currentEnv = environments.find(env => env.key === selectedEnv)

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
          const output = data.output
          addOutputLine(output, data.type === 'stderr' ? 'error' : 'info')

          // 检测预览服务器启动成功标志
          if (output.includes('[INFO] 预览服务器启动成功!') || output.includes('✔ 预览服务器已启动')) {
            toast.success('🎉 预览服务器启动成功！')
          }

          // 提取服务器信息 - 使用最宽松的匹配模式
          const localMatch = output.match(/本地[:\s]*(http:\/\/[^<\s\n\r]+)/i)
          const networkMatch = output.match(/网络[:\s]*(http:\/\/[^<\s\n\r]+)/i)
          const portMatch = output.match(/localhost:(\d+)/)

          if (localMatch || networkMatch) {
            console.log('🔍 预览服务器信息匹配成功:', { localMatch, networkMatch, portMatch })
            setServerInfo(prev => ({
              ...prev,
              localUrl: localMatch ? localMatch[1].trim() : prev.localUrl,
              networkUrl: networkMatch ? networkMatch[1].trim() : prev.networkUrl,
              port: portMatch ? portMatch[1] : prev.port
            }))

            if (localMatch) {
              toast.success(`🌐 本地预览地址: ${localMatch[1].trim()}`)
            }
            if (networkMatch) {
              toast.success(`📱 网络预览地址: ${networkMatch[1].trim()}`)
            }
          } else {
            console.log('❌ 预览服务器信息匹配失败')
            console.log('输出内容长度:', output.length)
            console.log('输出内容前200字符:', output.substring(0, 200))
            console.log('是否包含"本地":', output.includes('本地'))
            console.log('是否包含"网络":', output.includes('网络'))
            console.log('是否包含"localhost":', output.includes('localhost'))
          }

          // 检测二维码
          if (output.includes('▄') || output.includes('█') || output.includes('▀')) {
            setServerInfo(prev => ({
              ...prev,
              qrCode: output
            }))
          }

          // 检测构建产物统计信息
          if (output.includes('[INFO] 总文件数:')) {
            const fileCountMatch = output.match(/总文件数:\s*(\d+)/)
            const totalSizeMatch = output.match(/总大小:\s*([^\s]+)/)
            if (fileCountMatch && totalSizeMatch) {
              const fileCount = fileCountMatch[1]
              const totalSize = totalSizeMatch[1]
              toast.success(`📊 预览就绪: ${fileCount}个文件，${totalSize}`)
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
      const result = await api.runTask('preview', {
        environment: selectedEnv
        // 不设置 cwd，使用默认的 context.cwd (app 目录)
      })

      toast.success('预览服务器启动中...')
      console.log('Preview command started:', result)
    } catch (error) {
      toast.error(`预览失败: ${error instanceof Error ? error.message : '未知错误'}`)
      addOutputLine(`预览失败: ${error}`, 'error')
    }
  }

  const stopProcess = async () => {
    if (!isConnected) {
      toast.error('服务器未连接')
      return
    }

    try {
      const result = await api.stopTask('preview', {
        environment: selectedEnv
      })

      toast.success('正在停止预览服务器...')
      console.log('Preview command stopped:', result)
    } catch (error) {
      toast.error(`停止失败: ${error instanceof Error ? error.message : '未知错误'}`)
      addOutputLine(`停止失败: ${error}`, 'error')
    }
  }

  const clearOutput = () => {
    setOutputLines([])
  }

  const openPreview = () => {
    if (currentEnv && isProcessRunning) {
      const url = `http://localhost:${currentEnv.port}`
      window.open(url, '_blank')
    }
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
            <div className="text-4xl">👁️</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">项目预览</h1>
              <p className="text-gray-600">预览构建结果，测试生产环境</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">当前环境:</div>
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">选择预览环境</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {environments.map((env) => (
            <button
              key={env.key}
              onClick={() => setSelectedEnv(env.key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedEnv === env.key
                ? 'border-purple-500 bg-purple-50'
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
              {selectedEnv.toUpperCase()} {getPreviewType()}
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
              : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isProcessRunning ? '启动中...' : '开始预览'}</span>
          </button>

          {isProcessRunning && (
            <>
              <button
                onClick={stopProcess}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>停止</span>
              </button>

              <button
                onClick={openPreview}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>打开预览</span>
              </button>
            </>
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

      {/* 服务器信息显示区域 */}
      {(serverInfo.localUrl || serverInfo.networkUrl) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-green-600" />
            预览服务器地址
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
                    <p className="text-xs text-orange-600 mt-1">⚠️ 如无法访问，请检查防火墙设置</p>
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
            <span>preview 命令输出</span>
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
            <div className="p-4 text-gray-400 italic">点击预览按钮开始执行命令...</div>
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

export default PreviewPage

import React, { useState, useEffect } from 'react'
import {
  Puzzle,
  Trash2,
  Settings,
  Power,
  PowerOff,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface Plugin {
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  enabled: boolean
  installed: boolean
  config?: any
  commands?: string[]
  middleware?: string[]
}

const Plugins: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    loadPlugins()
    loadAvailablePlugins()
  }, [])

  const loadPlugins = async () => {
    try {
      setLoading(true)
      const data = await api.getPlugins()
      setPlugins(data)
    } catch (error) {
      toast.error(`加载插件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailablePlugins = async () => {
    try {
      const data = await api.getAvailablePlugins()
      setAvailablePlugins(data)
    } catch (error) {
      console.error('加载可用插件失败:', error)
    }
  }

  const handleInstallPlugin = async (name: string) => {
    try {
      await api.installPlugin(name)
      toast.success(`插件 ${name} 安装成功`)
      loadPlugins()
      loadAvailablePlugins()
    } catch (error) {
      toast.error(`安装插件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleUninstallPlugin = async (name: string) => {
    try {
      await api.uninstallPlugin(name)
      toast.success(`插件 ${name} 卸载成功`)
      loadPlugins()
      loadAvailablePlugins()
    } catch (error) {
      toast.error(`卸载插件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleTogglePlugin = async (name: string, enabled: boolean) => {
    try {
      await api.togglePlugin(name, enabled)
      toast.success(`插件 ${name} 已${enabled ? '启用' : '禁用'}`)
      loadPlugins()
    } catch (error) {
      toast.error(`切换插件状态失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleConfigurePlugin = (plugin: Plugin) => {
    setSelectedPlugin(plugin)
    setShowConfig(true)
  }

  const handleSaveConfig = async (config: any) => {
    if (!selectedPlugin) return

    try {
      await api.updatePluginConfig(selectedPlugin.name, config)
      toast.success(`插件 ${selectedPlugin.name} 配置已保存`)
      setShowConfig(false)
      setSelectedPlugin(null)
      loadPlugins()
    } catch (error) {
      toast.error(`保存配置失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* 已安装插件 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">已安装插件</h2>
          <span className="text-sm text-gray-500">{plugins.length} 个插件</span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        ) : plugins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无已安装的插件
          </div>
        ) : (
          <div className="space-y-4">
            {plugins.map((plugin) => (
              <div key={plugin.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Puzzle className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{plugin.name}</h3>
                        <span className="text-sm text-gray-500">v{plugin.version}</span>
                        {plugin.enabled ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {plugin.description && (
                        <p className="text-sm text-gray-600 mt-1">{plugin.description}</p>
                      )}
                      {plugin.author && (
                        <p className="text-xs text-gray-500 mt-1">作者: {plugin.author}</p>
                      )}
                      {plugin.commands && plugin.commands.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">命令: </span>
                          {plugin.commands.map((cmd, index) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1">
                              {cmd}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {plugin.homepage && (
                      <a
                        href={plugin.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="访问主页"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleConfigurePlugin(plugin)}
                      className="text-gray-600 hover:text-gray-800"
                      title="配置插件"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleTogglePlugin(plugin.name, !plugin.enabled)}
                      className={`${plugin.enabled ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                      title={plugin.enabled ? '禁用插件' : '启用插件'}
                    >
                      {plugin.enabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleUninstallPlugin(plugin.name)}
                      className="text-red-600 hover:text-red-800"
                      title="卸载插件"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 可用插件 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">可用插件</h2>
          <span className="text-sm text-gray-500">{availablePlugins.length} 个可用</span>
        </div>

        {availablePlugins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无可用插件
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlugins.map((plugin) => (
              <div key={plugin.name} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Puzzle className="h-6 w-6 text-purple-500 mr-2" />
                    <div>
                      <h3 className="font-medium text-gray-900">{plugin.name}</h3>
                      <span className="text-sm text-gray-500">v{plugin.version}</span>
                    </div>
                  </div>
                  {plugin.installed ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      已安装
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInstallPlugin(plugin.name)}
                      className="text-blue-600 hover:text-blue-800"
                      title="安装插件"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {plugin.description && (
                  <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                )}
                
                {plugin.author && (
                  <p className="text-xs text-gray-500">作者: {plugin.author}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 插件配置弹窗 */}
      {showConfig && selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                配置插件: {selectedPlugin.name}
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <textarea
                defaultValue={JSON.stringify(selectedPlugin.config || {}, null, 2)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="插件配置 (JSON 格式)"
                onChange={(e) => {
                  try {
                    JSON.parse(e.target.value)
                    // 验证 JSON 格式
                  } catch (error) {
                    // JSON 格式错误
                  }
                }}
              />
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                    try {
                      const config = JSON.parse(textarea.value)
                      handleSaveConfig(config)
                    } catch (error) {
                      toast.error('配置格式错误，请检查 JSON 语法')
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  保存配置
                </button>
                <button
                  onClick={() => setShowConfig(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Plugins

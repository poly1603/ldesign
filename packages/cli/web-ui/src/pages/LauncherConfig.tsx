import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Settings, Check, X, ChevronDown, ChevronRight, Copy, RefreshCw } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
// @ts-ignore
import MonacoEditor from '@monaco-editor/react'

interface LauncherConfigInfo {
  environment: string
  path: string
  exists: boolean
}

interface ConfigSection {
  name: string
  key: string
  description: string
  fields: ConfigField[]
  collapsed?: boolean
}

interface ConfigField {
  name: string
  key: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'array' | 'object'
  description?: string
  defaultValue?: any
  options?: { label: string; value: any }[]
  placeholder?: string
}

const LauncherConfig: React.FC = () => {
  const [configs, setConfigs] = useState<LauncherConfigInfo[]>([])
  const [selectedEnv, setSelectedEnv] = useState('base')
  const [configContent, setConfigContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'code' | 'form'>('code')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // 配置结构定义
  const configSections: ConfigSection[] = [
    {
      name: '基础配置',
      key: 'launcher',
      description: 'Launcher 核心配置',
      fields: [
        { name: '预设', key: 'preset', type: 'select', options: [
          { label: 'LDesign', value: 'ldesign' },
          { label: 'Vue', value: 'vue' },
          { label: 'React', value: 'react' },
          { label: 'None', value: '' }
        ], defaultValue: 'ldesign' },
        { name: '模式', key: 'mode', type: 'select', options: [
          { label: '开发模式', value: 'development' },
          { label: '测试模式', value: 'test' },
          { label: '预发布模式', value: 'staging' },
          { label: '生产模式', value: 'production' }
        ] },
      ]
    },
    {
      name: '服务器配置',
      key: 'server',
      description: '开发服务器设置',
      fields: [
        { name: '端口', key: 'port', type: 'number', defaultValue: 3340, placeholder: '3340' },
        { name: '主机', key: 'host', type: 'string', defaultValue: 'localhost', placeholder: 'localhost' },
        { name: '自动打开', key: 'open', type: 'boolean', defaultValue: false },
        { name: 'CORS', key: 'cors', type: 'boolean', defaultValue: true },
        { name: 'HTTPS', key: 'https', type: 'boolean', defaultValue: false },
      ]
    },
    {
      name: '构建配置',
      key: 'build',
      description: '项目构建设置',
      fields: [
        { name: '输出目录', key: 'outDir', type: 'string', defaultValue: 'dist', placeholder: 'dist' },
        { name: 'Source Map', key: 'sourcemap', type: 'boolean', defaultValue: true },
        { name: '代码压缩', key: 'minify', type: 'select', options: [
          { label: '启用', value: true },
          { label: '禁用', value: false },
          { label: 'Terser', value: 'terser' },
          { label: 'ESBuild', value: 'esbuild' }
        ], defaultValue: true },
        { name: '目标环境', key: 'target', type: 'string', defaultValue: 'esnext', placeholder: 'esnext' },
        { name: '清空输出', key: 'emptyOutDir', type: 'boolean', defaultValue: true },
      ]
    },
    {
      name: '预览配置',
      key: 'preview',
      description: '预览服务器设置',
      fields: [
        { name: '端口', key: 'port', type: 'number', defaultValue: 8888, placeholder: '8888' },
        { name: '主机', key: 'host', type: 'string', defaultValue: 'localhost', placeholder: 'localhost' },
        { name: '自动打开', key: 'open', type: 'boolean', defaultValue: false },
      ]
    },
    {
      name: '优化配置',
      key: 'optimizeDeps',
      description: '依赖预构建优化',
      fields: [
        { name: '包含依赖', key: 'include', type: 'array', defaultValue: [], placeholder: '需要预构建的依赖' },
        { name: '排除依赖', key: 'exclude', type: 'array', defaultValue: [], placeholder: '排除预构建的依赖' },
      ]
    },
  ]

  // 环境标签映射
  const envLabels: { [key: string]: { name: string; color: string; icon: string } } = {
    base: { name: '基础配置', color: 'blue', icon: '📋' },
    development: { name: '开发环境', color: 'green', icon: '🔧' },
    test: { name: '测试环境', color: 'yellow', icon: '🧪' },
    staging: { name: '预发布环境', color: 'purple', icon: '🎭' },
    production: { name: '生产环境', color: 'red', icon: '🚀' }
  }

  // 加载配置列表
  const loadConfigs = async () => {
    try {
      const result = await api.getLauncherConfigs()
      setConfigs(result)
    } catch (error) {
      toast.error('加载配置列表失败')
      console.error(error)
    }
  }

  // 加载配置内容
  const loadConfigContent = async (environment: string) => {
    setLoading(true)
    try {
      const result = await api.getLauncherConfig(environment)
      setConfigContent(result.content)
      setOriginalContent(result.content)
      if (!result.exists) {
        toast(`配置文件不存在，已加载默认模板`, { icon: 'ℹ️' })
      }
    } catch (error) {
      toast.error('加载配置失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 保存配置
  const saveConfig = async () => {
    setSaving(true)
    try {
      await api.saveLauncherConfig(selectedEnv, configContent)
      setOriginalContent(configContent)
      toast.success('配置保存成功')
      // 重新加载配置列表以更新存在状态
      await loadConfigs()
    } catch (error) {
      toast.error('保存配置失败')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // 重置配置
  const resetConfig = () => {
    setConfigContent(originalContent)
  }

  // 复制配置
  const copyConfig = () => {
    navigator.clipboard.writeText(configContent)
    toast.success('配置已复制到剪贴板')
  }

  // 解析配置内容为对象（简化版） - 暂时未使用
  // const parseConfig = (content: string): any => {
  //   try {
  //     return {
  //       launcher: { preset: 'ldesign' },
  //       server: { port: 3340, host: 'localhost', open: false },
  //       build: { outDir: 'dist', sourcemap: true, minify: true },
  //       preview: { port: 8888, host: 'localhost' }
  //     }
  //   } catch (error) {
  //     console.error('解析配置失败', error)
  //     return {}
  //   }
  // }

  // 生成配置代码 - 暂时未使用
  // const generateConfigCode = (config: any): string => {
  //   const sections = []
  //   
  //   if (config.launcher) {
  //     sections.push(`  // 基础配置
  // launcher: ${JSON.stringify(config.launcher, null, 4).replace(/\n/g, '\n  ')}`)
  //   }
  //   
  //   if (config.server) {
  //     sections.push(`  // 服务器配置
  // server: ${JSON.stringify(config.server, null, 4).replace(/\n/g, '\n  ')}`)
  //   }
  //   
  //   if (config.build) {
  //     sections.push(`  // 构建配置
  // build: ${JSON.stringify(config.build, null, 4).replace(/\n/g, '\n  ')}`)
  //   }
  //   
  //   if (config.preview) {
  //     sections.push(`  // 预览配置
  // preview: ${JSON.stringify(config.preview, null, 4).replace(/\n/g, '\n  ')}`)
  //   }
  //   
  //   return `import { defineConfig } from '@ldesign/launcher'
  //
  // export default defineConfig({
  // ${sections.join(',\n\n')}
  // })`
  // }

  // 切换节折叠状态
  const toggleSection = (key: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key)
    } else {
      newCollapsed.add(key)
    }
    setCollapsedSections(newCollapsed)
  }

  // 初始加载
  useEffect(() => {
    loadConfigs()
  }, [])

  // 切换环境时加载配置
  useEffect(() => {
    if (selectedEnv) {
      loadConfigContent(selectedEnv)
    }
  }, [selectedEnv])

  const hasChanges = configContent !== originalContent

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Launcher 配置管理</h1>
              <p className="text-gray-600">管理项目的 launcher.config.ts 配置文件</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadConfigContent(selectedEnv)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 环境选择 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">配置文件</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(envLabels).map(([env, label]) => {
            const config = configs.find(c => 
              env === 'base' ? c.environment === 'base' : c.environment === env
            )
            const isSelected = selectedEnv === env
            
            return (
              <button
                key={env}
                onClick={() => setSelectedEnv(env)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{label.icon}</div>
                <div className="font-medium text-gray-900">{label.name}</div>
                <div className="mt-2">
                  {config?.exists ? (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      已存在
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-gray-400">
                      <X className="w-3 h-3 mr-1" />
                      未创建
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 视图切换 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {envLabels[selectedEnv]?.name || '配置'} - {configs.find(c => c.environment === selectedEnv)?.path || 'launcher.config.ts'}
            </h2>
            {hasChanges && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                有未保存的更改
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'code' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                代码视图
              </button>
              <button
                onClick={() => setViewMode('form')}
                disabled
                className={`px-3 py-1 rounded ${
                  viewMode === 'form' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="表单视图（开发中）"
              >
                表单视图
              </button>
            </div>
          </div>
        </div>

        {/* 编辑器区域 */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : viewMode === 'code' ? (
          <div className="border rounded-lg overflow-hidden">
            <MonacoEditor
              height="600px"
              language="typescript"
              value={configContent}
              onChange={(value) => setConfigContent(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        ) : (
          <div className="border rounded-lg p-6 h-96 overflow-y-auto">
            <div className="text-gray-500 text-center mt-20">
              表单视图正在开发中...
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={copyConfig}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              复制
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <button
                onClick={resetConfig}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </button>
            )}
            <button
              onClick={saveConfig}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-md flex items-center ${
                hasChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* 配置说明 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">配置说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configSections.map(section => (
            <div key={section.key} className="border rounded-lg p-4">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between mb-2"
              >
                <h3 className="font-medium text-gray-900">{section.name}</h3>
                {collapsedSections.has(section.key) ? (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <p className="text-sm text-gray-600 mb-3">{section.description}</p>
              {!collapsedSections.has(section.key) && (
                <div className="space-y-2">
                  {section.fields.map(field => (
                    <div key={field.key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{field.name}</span>
                      <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {field.key}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LauncherConfig
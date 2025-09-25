import React, { useState } from 'react'
import { Save, RotateCcw, Settings } from 'lucide-react'
import { useProject } from '../contexts/ProjectContext'
import toast from 'react-hot-toast'

const Config: React.FC = () => {
  const { config, updateConfig } = useProject()
  const [editedConfig, setEditedConfig] = useState(JSON.stringify(config || {}, null, 2))
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      const newConfig = JSON.parse(editedConfig)
      await updateConfig(newConfig)
      toast.success('配置保存成功')
      setIsEditing(false)
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('配置格式错误，请检查 JSON 语法')
      } else {
        toast.error(`保存配置失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setEditedConfig(JSON.stringify(config || {}, null, 2))
    setIsEditing(false)
  }

  const configSections = [
    {
      title: '基础配置',
      description: '项目的基本信息和设置',
      fields: ['name', 'version', 'description', 'environment']
    },
    {
      title: '构建配置',
      description: '项目构建相关的配置',
      fields: ['build']
    },
    {
      title: '开发服务器',
      description: '开发环境服务器配置',
      fields: ['dev']
    },
    {
      title: '插件配置',
      description: '已安装的插件和配置',
      fields: ['plugins']
    },
    {
      title: '中间件配置',
      description: '中间件相关配置',
      fields: ['middleware']
    }
  ]

  return (
    <div className="space-y-6">
      {/* 配置概览 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">配置管理</h2>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重置
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                编辑配置
              </button>
            )}
          </div>
        </div>

        {/* 配置分类 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {configSections.map((section) => (
            <div key={section.title} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{section.description}</p>
              <div className="space-y-1">
                {section.fields.map((field) => {
                  const hasValue = config && config[field] !== undefined
                  return (
                    <div key={field} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{field}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        hasValue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {hasValue ? '已配置' : '未配置'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 配置编辑器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">配置编辑器</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">JSON 配置</h3>
              <p className="text-sm text-gray-500">直接编辑项目配置文件</p>
            </div>
            {isEditing && (
              <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded">
                编辑模式
              </div>
            )}
          </div>

          <textarea
            value={editedConfig}
            onChange={(e) => setEditedConfig(e.target.value)}
            readOnly={!isEditing}
            className={`
              w-full h-96 p-4 border rounded-lg font-mono text-sm
              ${isEditing 
                ? 'border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                : 'border-gray-300 bg-gray-50'
              }
            `}
            placeholder="配置内容..."
          />

          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">编辑提示</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 请确保 JSON 格式正确</li>
                <li>• 修改后点击"保存"按钮应用更改</li>
                <li>• 可以点击"重置"按钮恢复原始配置</li>
                <li>• 配置更改会立即生效</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 配置示例 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">配置示例</h2>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`{
  "name": "my-project",
  "version": "1.0.0",
  "description": "My awesome project",
  "environment": "development",
  "build": {
    "outDir": "dist",
    "sourcemap": true,
    "minify": false
  },
  "dev": {
    "port": 3000,
    "host": "localhost",
    "open": true
  },
  "plugins": [
    "./plugins/my-plugin.js"
  ],
  "middleware": [
    {
      "name": "logger",
      "priority": 100
    }
  ]
}`}</pre>
        </div>
      </div>
    </div>
  )
}

export default Config

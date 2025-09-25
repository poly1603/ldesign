import React, { useState, useEffect } from 'react'
import { FileText as FileTemplate, Download, Eye, Plus } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface TemplateInfo {
  name: string
  description: string
  path: string
  files: string[]
}

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null)
  const [showInitForm, setShowInitForm] = useState(false)
  const [initForm, setInitForm] = useState({
    template: '',
    name: '',
    directory: '',
    force: false,
    skipInstall: false,
    packageManager: 'npm'
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await api.getTemplates()
      setTemplates(data)
    } catch (error) {
      toast.error(`加载模板列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInitProject = async () => {
    try {
      const result = await api.initProject(initForm)
      toast.success('项目初始化已开始')
      setShowInitForm(false)
      console.log('Init started:', result)
    } catch (error) {
      toast.error(`初始化项目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleUseTemplate = (template: TemplateInfo) => {
    setInitForm(prev => ({
      ...prev,
      template: template.path,
      name: template.name.toLowerCase().replace(/\s+/g, '-')
    }))
    setShowInitForm(true)
  }

  return (
    <div className="space-y-6">
      {/* 模板列表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">项目模板</h2>
          <button
            onClick={() => setShowInitForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建项目
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">加载模板中...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无可用模板
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.path}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <FileTemplate className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                
                <div className="text-xs text-gray-500 mb-4">
                  {template.files.length} 个文件
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    预览
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex items-center text-green-600 hover:text-green-800 text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    使用
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 项目初始化表单 */}
      {showInitForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">初始化新项目</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                模板
              </label>
              <select
                value={initForm.template}
                onChange={(e) => setInitForm(prev => ({ ...prev, template: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">选择模板</option>
                {templates.map((template) => (
                  <option key={template.path} value={template.path}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                项目名称
              </label>
              <input
                type="text"
                value={initForm.name}
                onChange={(e) => setInitForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="my-project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目录
              </label>
              <input
                type="text"
                value={initForm.directory}
                onChange={(e) => setInitForm(prev => ({ ...prev, directory: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="./my-project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                包管理器
              </label>
              <select
                value={initForm.packageManager}
                onChange={(e) => setInitForm(prev => ({ ...prev, packageManager: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="npm">npm</option>
                <option value="yarn">yarn</option>
                <option value="pnpm">pnpm</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={initForm.force}
                onChange={(e) => setInitForm(prev => ({ ...prev, force: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">强制覆盖已存在的目录</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={initForm.skipInstall}
                onChange={(e) => setInitForm(prev => ({ ...prev, skipInstall: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">跳过依赖安装</span>
            </label>
          </div>
          
          <div className="mt-6 flex items-center space-x-3">
            <button
              onClick={handleInitProject}
              disabled={!initForm.template || !initForm.name}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              开始初始化
            </button>
            <button
              onClick={() => setShowInitForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 模板详情 */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              模板详情 - {selectedTemplate.name}
            </h2>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
          
          <h3 className="font-medium text-gray-900 mb-2">包含文件:</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <ul className="space-y-1 text-sm font-mono">
              {selectedTemplate.files.map((file) => (
                <li key={file} className="text-gray-700">{file}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Templates

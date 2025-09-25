import React, { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Zap
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface Dependency {
  name: string
  version: string
  type: 'dependencies' | 'devDependencies' | 'peerDependencies'
  description?: string
  homepage?: string
  latest?: string
  outdated?: boolean
  vulnerabilities?: number
  author?: string
  license?: string
  repository?: string
  keywords?: string[]
  publishedAt?: string
}

interface SearchResult {
  name: string
  version: string
  description?: string
  author?: string
  keywords?: string[]
  date?: string
  score?: number
}

interface UpgradeResult {
  name: string
  from: string
  to: string
  success: boolean
  error?: string
}

const Dependencies: React.FC = () => {
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    version: 'latest',
    type: 'dependencies' as const
  })

  useEffect(() => {
    loadDependencies()
  }, [])

  const loadDependencies = async () => {
    try {
      setLoading(true)
      const data = await api.getDependencies()
      setDependencies(data)
    } catch (error) {
      toast.error(`加载依赖失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDependency = async () => {
    try {
      await api.addDependency(addForm.name, addForm.version, addForm.type)
      toast.success(`已添加依赖: ${addForm.name}`)
      setShowAddForm(false)
      setAddForm({ name: '', version: 'latest', type: 'dependencies' })
      loadDependencies()
    } catch (error) {
      toast.error(`添加依赖失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleRemoveDependency = async (name: string, type: string) => {
    try {
      await api.removeDependency(name, type)
      toast.success(`已移除依赖: ${name}`)
      loadDependencies()
    } catch (error) {
      toast.error(`移除依赖失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleUpdateDependency = async (name: string, version: string, type: string) => {
    try {
      await api.updateDependency(name, version, type)
      toast.success(`已更新依赖: ${name}`)
      loadDependencies()
    } catch (error) {
      toast.error(`更新依赖失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleUpgradeAll = async () => {
    try {
      setUpgrading(true)
      const response = await api.upgradeAllDependencies()
      const results = response.results as UpgradeResult[]

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      if (successCount > 0) {
        toast.success(`成功升级 ${successCount} 个依赖`)
      }
      if (failCount > 0) {
        toast.error(`${failCount} 个依赖升级失败`)
        // 显示失败详情
        results.filter(r => !r.success).forEach(r => {
          toast.error(`${r.name}: ${r.error}`)
        })
      }

      loadDependencies()
    } catch (error) {
      toast.error(`一键升级失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setUpgrading(false)
    }
  }

  const handleSearchPackages = async (query: string) => {
    if (!query.trim()) return

    try {
      setSearchLoading(true)
      const results = await api.searchPackages(query, 20)
      setSearchResults(results)
    } catch (error) {
      toast.error(`搜索失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAddFromSearch = (pkg: SearchResult) => {
    setAddForm({
      name: pkg.name,
      version: pkg.version,
      type: 'dependencies'
    })
    setShowSearchModal(false)
    setShowAddForm(true)
  }

  const filteredDependencies = dependencies.filter(dep => {
    const matchesSearch = dep.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || dep.type === selectedType
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dependencies':
        return 'bg-blue-100 text-blue-800'
      case 'devDependencies':
        return 'bg-green-100 text-green-800'
      case 'peerDependencies':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (dep: Dependency) => {
    if (dep.vulnerabilities && dep.vulnerabilities > 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    if (dep.outdated) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      {/* 头部操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">依赖管理</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDependencies}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              搜索包
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加依赖
            </button>
            {dependencies.some(dep => dep.outdated) && (
              <button
                onClick={handleUpgradeAll}
                disabled={upgrading}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center disabled:opacity-50"
              >
                {upgrading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                一键升级
              </button>
            )}
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索依赖..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">所有类型</option>
            <option value="dependencies">生产依赖</option>
            <option value="devDependencies">开发依赖</option>
            <option value="peerDependencies">同级依赖</option>
          </select>
        </div>
      </div>

      {/* 添加依赖表单 */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">添加新依赖</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                包名
              </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如: react"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                版本
              </label>
              <input
                type="text"
                value={addForm.version}
                onChange={(e) => setAddForm(prev => ({ ...prev, version: e.target.value }))}
                placeholder="例如: ^18.0.0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                类型
              </label>
              <select
                value={addForm.type}
                onChange={(e) => setAddForm(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="dependencies">生产依赖</option>
                <option value="devDependencies">开发依赖</option>
                <option value="peerDependencies">同级依赖</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleAddDependency}
              disabled={!addForm.name}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              添加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 依赖列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            依赖列表 ({filteredDependencies.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        ) : filteredDependencies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? '没有找到匹配的依赖' : '暂无依赖'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDependencies.map((dep) => (
              <div key={`${dep.name}-${dep.type}`} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{dep.name}</h4>
                        {getStatusIcon(dep)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(dep.type)}`}>
                          {dep.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">v{dep.version}</span>
                        {dep.latest && dep.latest !== dep.version && (
                          <span className="text-sm text-yellow-600">
                            最新: v{dep.latest}
                          </span>
                        )}
                        {dep.vulnerabilities && dep.vulnerabilities > 0 && (
                          <span className="text-sm text-red-600">
                            {dep.vulnerabilities} 个安全漏洞
                          </span>
                        )}
                      </div>
                      {dep.description && (
                        <p className="text-sm text-gray-500 mt-1">{dep.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {dep.homepage && (
                      <a
                        href={dep.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {dep.outdated && (
                      <button
                        onClick={() => handleUpdateDependency(dep.name, dep.latest || 'latest', dep.type)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="更新到最新版本"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveDependency(dep.name, dep.type)}
                      className="text-red-600 hover:text-red-800"
                      title="移除依赖"
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

      {/* 搜索包模态框 */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">搜索 npm 包</h3>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchPackages(searchQuery)}
                    placeholder="搜索包名..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleSearchPackages(searchQuery)}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? '搜索中...' : '搜索'}
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {searchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">搜索中...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? '没有找到匹配的包' : '输入关键词开始搜索'}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((pkg) => (
                    <div key={pkg.name} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                            <span className="text-sm text-gray-500">v{pkg.version}</span>
                            {pkg.score && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                评分: {Math.round(pkg.score * 100)}
                              </span>
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {pkg.author && <span>作者: {pkg.author}</span>}
                            {pkg.date && <span>更新: {new Date(pkg.date).toLocaleDateString()}</span>}
                          </div>
                          {pkg.keywords && pkg.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pkg.keywords.slice(0, 5).map((keyword) => (
                                <span key={keyword} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddFromSearch(pkg)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          添加
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dependencies

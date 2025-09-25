import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Package,
  GitBranch,
  Activity,
  RefreshCw
} from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface ProjectStats {
  files: {
    total: number
    byType: Record<string, number>
    largest: { name: string; size: number }[]
  }
  dependencies: {
    total: number
    production: number
    development: number
    outdated: number
    vulnerabilities: number
  }
  git: {
    commits: number
    branches: number
    contributors: number
    lastCommit: string
  }
  build: {
    size: number
    time: number
    lastBuild: string
  }
  performance: {
    bundleSize: number
    loadTime: number
    score: number
  }
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await api.getProjectStats()
      setStats(data)
    } catch (error) {
      toast.error(`加载项目统计失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadStats()
      toast.success('统计数据已刷新')
    } catch (error) {
      toast.error(`刷新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setRefreshing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-600">加载统计数据...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">无法加载项目统计数据</p>
        <button
          onClick={loadStats}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">项目分析</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          刷新数据
        </button>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总文件数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.files.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">依赖数量</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dependencies.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <GitBranch className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Git 提交</p>
              <p className="text-2xl font-bold text-gray-900">{stats.git.commits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">性能评分</p>
              <p className="text-2xl font-bold text-gray-900">{stats.performance.score}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 文件类型分布 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">文件类型分布</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.files.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">.{type}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / stats.files.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 依赖健康度 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">依赖健康度</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">生产依赖</span>
              <span className="text-sm font-medium text-gray-900">{stats.dependencies.production}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">开发依赖</span>
              <span className="text-sm font-medium text-gray-900">{stats.dependencies.development}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">过期依赖</span>
              <span className={`text-sm font-medium ${stats.dependencies.outdated > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {stats.dependencies.outdated}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">安全漏洞</span>
              <span className={`text-sm font-medium ${stats.dependencies.vulnerabilities > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.dependencies.vulnerabilities}
              </span>
            </div>
          </div>
        </div>

        {/* Git 统计 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <GitBranch className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Git 统计</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">分支数量</span>
              <span className="text-sm font-medium text-gray-900">{stats.git.branches}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">贡献者</span>
              <span className="text-sm font-medium text-gray-900">{stats.git.contributors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">最后提交</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(stats.git.lastCommit).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* 构建性能 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">构建性能</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">构建大小</span>
              <span className="text-sm font-medium text-gray-900">{formatFileSize(stats.build.size)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">构建时间</span>
              <span className="text-sm font-medium text-gray-900">{formatTime(stats.build.time)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">包大小</span>
              <span className="text-sm font-medium text-gray-900">{formatFileSize(stats.performance.bundleSize)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">加载时间</span>
              <span className="text-sm font-medium text-gray-900">{formatTime(stats.performance.loadTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 最大文件 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">最大文件</h3>
        </div>
        <div className="space-y-2">
          {stats.files.largest.map((file, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-900 font-mono">{file.name}</span>
              <span className="text-sm text-gray-600">{formatFileSize(file.size)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Hammer,
  Server,
  TestTube,
  Folder,
  Settings,
  ArrowRight,
  Eye,
  Package
} from 'lucide-react'
import { useProject } from '../contexts/ProjectContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const Dashboard: React.FC = () => {
  const { project } = useProject()
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  const quickActions = [
    {
      name: '初始化项目',
      description: '创建新的项目结构',
      icon: Play,
      color: 'bg-blue-500',
      action: 'init'
    },
    {
      name: '构建项目',
      description: '编译和打包项目',
      icon: Hammer,
      color: 'bg-green-500',
      action: 'build'
    },
    {
      name: '开发服务器',
      description: '启动开发环境',
      icon: Server,
      color: 'bg-purple-500',
      action: 'dev'
    },
    {
      name: '运行测试',
      description: '执行项目测试',
      icon: TestTube,
      color: 'bg-orange-500',
      action: 'test'
    }
  ]

  const handleQuickAction = async (action: string) => {
    if (runningTasks.has(action)) {
      toast.error('任务正在运行中')
      return
    }

    try {
      setRunningTasks(prev => new Set(prev).add(action))

      const options = getDefaultOptions(action)
      const result = await api.runTask(action, options)

      toast.success(`${action} 任务已启动`)
      console.log('Task started:', result)

      // 可以跳转到任务页面查看详情
      // navigate('/tasks')

    } catch (error) {
      toast.error(`启动 ${action} 任务失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(action)
        return newSet
      })
    }
  }

  const getDefaultOptions = (action: string) => {
    switch (action) {
      case 'init':
        return {
          template: 'default',
          name: 'my-project'
        }
      case 'build':
        return {
          mode: 'production',
          clean: true
        }
      case 'dev':
        return {
          port: 3000,
          open: true
        }
      case 'test':
        return {
          coverage: true
        }
      default:
        return {}
    }
  }

  return (
    <div className="space-y-6">
      {/* 项目管理导航 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">项目管理</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dev"
            className="group p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                <Play className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">
                  项目启动
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-blue-700">
                  启动开发服务器，支持热重载和实时预览
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/build"
            className="group p-6 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 group-hover:bg-orange-200 rounded-lg transition-colors">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-900">
                  项目打包
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-orange-700">
                  构建生产版本，优化代码和资源
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/preview"
            className="group p-6 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-lg transition-colors">
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900">
                  项目预览
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-purple-700">
                  预览构建结果，测试生产环境
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 项目概览 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">项目概览</h2>

        {project ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">项目名称</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">v{project.version}</h3>
                  <p className="text-sm text-gray-500">版本号</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {project.hasConfig ? '已配置' : '未配置'}
                  </h3>
                  <p className="text-sm text-gray-500">配置状态</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">正在加载项目信息...</p>
          </div>
        )}
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const isRunning = runningTasks.has(action.action)

            return (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                disabled={isRunning}
                className={`
                  relative p-4 rounded-lg border-2 border-transparent
                  hover:border-gray-200 transition-all duration-200
                  ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  {isRunning ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <h3 className="font-medium text-gray-900 text-left mb-1">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-500 text-left">
                  {action.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">项目初始化完成</span>
            </div>
            <span className="text-xs text-gray-500">2 分钟前</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">配置文件已更新</span>
            </div>
            <span className="text-xs text-gray-500">5 分钟前</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">开发服务器已启动</span>
            </div>
            <span className="text-xs text-gray-500">10 分钟前</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

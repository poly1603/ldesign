import React from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Package,
  Monitor,
  Activity,
  FileText,
  Settings,
  ArrowRight,
  Folder,
  Package2,
  Puzzle,
  BarChart3,
  File,
  Zap,
  Rocket,
  Code,
  Globe
} from 'lucide-react'
import { useProject } from '../contexts/ProjectContext'
import { useTaskState } from '../contexts/TaskStateContext'

const Dashboard: React.FC = () => {
  const { project } = useProject()
  const { tasks } = useTaskState()

  // 主要功能模块
  const primaryModules = [
    {
      name: '项目启动',
      description: '启动开发服务器，支持热重载和实时预览',
      icon: Play,
      color: 'from-blue-500 to-blue-600',
      href: '/dev',
      status: getModuleStatus('dev')
    },
    {
      name: '项目打包',
      description: '构建生产版本，优化代码和资源',
      icon: Package,
      color: 'from-green-500 to-green-600',
      href: '/build',
      status: getModuleStatus('build')
    },
    {
      name: '项目预览',
      description: '预览构建结果，测试生产环境',
      icon: Monitor,
      color: 'from-purple-500 to-purple-600',
      href: '/preview',
      status: getModuleStatus('preview')
    }
  ]

  // 管理工具模块
  const managementModules = [
    {
      name: '任务管理',
      description: '查看和管理所有运行中的任务',
      icon: Activity,
      href: '/tasks',
      badge: getRunningTasksCount()
    },
    {
      name: '文件管理',
      description: '浏览和管理项目文件',
      icon: FileText,
      href: '/files'
    },
    {
      name: '项目配置',
      description: '管理项目配置和环境变量',
      icon: Settings,
      href: '/config'
    }
  ]

  // 扩展功能模块
  const extensionModules = [
    {
      name: '模板管理',
      description: '管理和使用项目模板',
      icon: File,
      href: '/templates'
    },
    {
      name: '依赖管理',
      description: '管理项目依赖和包',
      icon: Package2,
      href: '/dependencies'
    },
    {
      name: '插件管理',
      description: '安装和配置项目插件',
      icon: Puzzle,
      href: '/plugins'
    },
    {
      name: '项目分析',
      description: '查看项目统计和性能分析',
      icon: BarChart3,
      href: '/analytics'
    }
  ]

  // 获取模块状态
  function getModuleStatus(type: 'dev' | 'build' | 'preview') {
    const runningTasks = Object.values(tasks).filter(task =>
      task.taskType === type && task.status === 'running'
    )
    return runningTasks.length > 0 ? 'running' : 'idle'
  }

  // 获取运行中的任务数量
  function getRunningTasksCount() {
    const runningCount = Object.values(tasks).filter(task =>
      task.status === 'running'
    ).length
    return runningCount > 0 ? runningCount : undefined
  }

  // 快速启动操作
  const quickStartActions = [
    {
      name: '开发环境',
      description: '快速启动开发服务器',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      action: () => window.location.href = '/dev'
    },
    {
      name: '生产构建',
      description: '构建生产版本',
      icon: Rocket,
      color: 'from-green-500 to-green-600',
      action: () => window.location.href = '/build'
    },
    {
      name: '代码预览',
      description: '预览构建结果',
      icon: Globe,
      color: 'from-purple-500 to-purple-600',
      action: () => window.location.href = '/preview'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              欢迎使用 LDesign CLI
            </h1>
            <p className="text-blue-100 text-lg">
              {project ? `项目：${project.name} v${project.version}` : '正在加载项目信息...'}
            </p>
          </div>
          <div className="hidden md:block">
            <Code className="h-20 w-20 text-blue-200" />
          </div>
        </div>
      </div>

      {/* 快速启动 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Zap className="h-6 w-6 text-yellow-500 mr-2" />
          快速启动
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStartActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`group relative overflow-hidden rounded-lg bg-gradient-to-r ${action.color} p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <action.icon className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{action.name}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="absolute top-4 right-4 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* 主要功能模块 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Rocket className="h-6 w-6 text-blue-500 mr-2" />
          核心功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryModules.map((module, index) => (
            <Link
              key={index}
              to={module.href}
              className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 transition-all duration-300 hover:border-transparent hover:shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${module.color}`}>
                    <module.icon className="h-8 w-8 text-white" />
                  </div>
                  {module.status === 'running' && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">运行中</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 mb-2">
                  {module.name}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-500">
                  {module.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 管理工具 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="h-6 w-6 text-gray-500 mr-2" />
          管理工具
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {managementModules.map((module, index) => (
            <Link
              key={index}
              to={module.href}
              className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                    <module.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                      {module.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
                {module.badge && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {module.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 扩展功能 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Puzzle className="h-6 w-6 text-purple-500 mr-2" />
          扩展功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {extensionModules.map((module, index) => (
            <Link
              key={index}
              to={module.href}
              className="group p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
            >
              <div className="text-center">
                <div className="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-lg mx-auto w-fit mb-3 transition-colors">
                  <module.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-purple-900 mb-1">
                  {module.name}
                </h3>
                <p className="text-xs text-gray-500 group-hover:text-purple-700">
                  {module.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 项目状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 项目信息 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Folder className="h-5 w-5 text-blue-500 mr-2" />
            项目信息
          </h2>
          {project ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">项目名称</span>
                <span className="text-sm text-gray-900">{project.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">版本号</span>
                <span className="text-sm text-gray-900">v{project.version}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">配置状态</span>
                <span className={`text-sm font-medium ${project.hasConfig ? 'text-green-600' : 'text-orange-600'}`}>
                  {project.hasConfig ? '已配置' : '未配置'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">正在加载项目信息...</p>
            </div>
          )}
        </div>

        {/* 任务状态 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 text-green-500 mr-2" />
            任务状态
          </h2>
          <div className="space-y-3">
            {Object.values(tasks).length > 0 ? (
              Object.values(tasks).slice(0, 3).map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'running' ? 'bg-green-500 animate-pulse' :
                      task.status === 'error' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}></div>
                    <span className="text-sm text-gray-900">
                      {task.taskType} - {task.environment}
                    </span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${task.status === 'running' ? 'bg-green-100 text-green-800' :
                    task.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {task.status === 'running' ? '运行中' :
                      task.status === 'error' ? '错误' : '空闲'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">暂无运行中的任务</p>
              </div>
            )}
            {Object.values(tasks).length > 3 && (
              <Link
                to="/tasks"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-3"
              >
                查看全部任务 ({Object.values(tasks).length})
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

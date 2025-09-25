import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Play,
  FileText,
  Settings,
  FileText as FileTemplate,
  Package,
  Puzzle,
  BarChart3,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'
import { useProject } from '../contexts/ProjectContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { connected } = useSocket()
  const { project, loading } = useProject()

  const navigation = [
    { name: '概览', href: '/', icon: Home },
    { name: '任务', href: '/tasks', icon: Play },
    { name: '文件', href: '/files', icon: FileText },
    { name: '配置', href: '/config', icon: Settings },
    { name: '模板', href: '/templates', icon: FileTemplate },
    { name: '依赖', href: '/dependencies', icon: Package },
    { name: '插件', href: '/plugins', icon: Puzzle },
    { name: '分析', href: '/analytics', icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary-600 text-white">
          <h1 className="text-xl font-bold">LDesign CLI</h1>
        </div>

        {/* 项目信息 */}
        <div className="p-4 border-b border-gray-200">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ) : project ? (
            <div>
              <h2 className="font-semibold text-gray-900 truncate">
                {project.name}
              </h2>
              <p className="text-sm text-gray-500">v{project.version}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              未找到项目
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* 连接状态 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600">已连接</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-red-600">未连接</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {navigation.find(item => item.href === location.pathname)?.name || '概览'}
            </h1>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

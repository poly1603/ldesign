import type { DashboardTemplateProps } from '../../types'

/**
 * 移动端Dashboard模板配置
 */
export const config = {
  name: 'default',
  displayName: '移动端默认Dashboard',
  description: '适用于移动端的默认Dashboard布局模板',
  category: 'dashboard',
  device: 'mobile',
  preview: '/previews/dashboard/mobile-default.png',

  // 默认属性
  defaultProps: {
    title: '移动管理',
    logoUrl: '',
    primaryColor: '#1890ff',
    secondaryColor: '#40a9ff',
    showSidebar: false, // 移动端默认不显示侧边栏
    collapsibleSidebar: true,
    sidebarCollapsed: true,
    showBreadcrumb: false, // 移动端默认不显示面包屑
    showUserInfo: true,
    showNotifications: true,
    enableAnimations: true,
    userInfo: {
      name: '用户',
      avatar: '',
      role: '用户',
    },
  } as DashboardTemplateProps,

  // 支持的插槽
  slots: [
    {
      name: 'header-logo',
      description: '头部Logo区域',
      required: false,
    },
    {
      name: 'header-actions',
      description: '头部操作区域',
      required: false,
    },
    {
      name: 'header-user',
      description: '头部用户信息区域',
      required: false,
    },
    {
      name: 'bottom-nav',
      description: '底部导航区域',
      required: false,
    },
    {
      name: 'content',
      description: '主要内容区域',
      required: true,
    },
    {
      name: 'drawer-menu',
      description: '抽屉菜单区域',
      required: false,
    },
  ],

  // 响应式断点
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
  },
}

export default config

import type { DashboardTemplateProps } from '../../types'

/**
 * 平板端Dashboard模板配置
 */
export const config = {
  name: 'default',
  displayName: '平板端默认Dashboard',
  description: '适用于平板端的默认Dashboard布局模板',
  category: 'dashboard',
  device: 'tablet',
  preview: '/previews/dashboard/tablet-default.png',

  // 默认属性
  defaultProps: {
    title: '平板管理',
    logoUrl: '',
    primaryColor: '#1890ff',
    secondaryColor: '#40a9ff',
    showSidebar: true,
    collapsibleSidebar: true,
    sidebarCollapsed: false,
    showBreadcrumb: true,
    showUserInfo: true,
    showNotifications: true,
    enableAnimations: true,
    userInfo: {
      name: '管理员',
      avatar: '',
      role: '管理员',
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
      name: 'header-nav',
      description: '头部导航区域',
      required: false,
    },
    {
      name: 'header-user',
      description: '头部用户信息区域',
      required: false,
    },
    {
      name: 'sidebar-menu',
      description: '侧边栏菜单区域',
      required: false,
    },
    {
      name: 'content',
      description: '主要内容区域',
      required: true,
    },
    {
      name: 'footer',
      description: '底部区域',
      required: false,
    },
  ],

  // 响应式断点
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
}

export default config

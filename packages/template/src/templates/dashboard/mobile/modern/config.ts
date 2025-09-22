import type { DashboardTemplateProps } from '../../types'

/**
 * 移动端现代风格Dashboard模板配置
 */
export const config = {
  name: 'modern',
  displayName: '现代风格Dashboard (移动)',
  description: '适配移动设备的现代化设计风格Dashboard布局',
  category: 'dashboard',
  device: 'mobile',
  preview: '/previews/dashboard/mobile-modern.png',

  // 默认属性
  defaultProps: {
    title: '移动管理台',
    logoUrl: '',
    primaryColor: '#722ED1',
    secondaryColor: '#9254DE',
    showSidebar: false,
    collapsibleSidebar: false,
    sidebarCollapsed: false,
    showBreadcrumb: false,
    showUserInfo: true,
    showNotifications: false,
    enableAnimations: true,
    userInfo: {
      name: '管理员',
      avatar: '',
      role: '超级管理员',
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
    {
      name: 'extra',
      description: '额外内容区域',
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

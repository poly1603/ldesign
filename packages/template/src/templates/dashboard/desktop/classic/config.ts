import type { DashboardTemplateProps } from '../../types'

/**
 * 桌面端经典风格Dashboard模板配置
 */
export const config = {
  name: 'classic',
  displayName: '经典风格Dashboard',
  description: '传统企业级Dashboard布局，采用经典的方正设计和稳重配色',
  category: 'dashboard',
  device: 'desktop',
  preview: '/previews/dashboard/desktop-classic.png',

  // 默认属性
  defaultProps: {
    title: '企业管理系统',
    logoUrl: '',
    primaryColor: '#1890ff',
    secondaryColor: '#40a9ff',
    showSidebar: true,
    collapsibleSidebar: true,
    sidebarCollapsed: false,
    showBreadcrumb: true,
    showUserInfo: true,
    showNotifications: true,
    enableAnimations: false,
    userInfo: {
      name: '管理员',
      avatar: '',
      role: '系统管理员',
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

import type { DashboardTemplateProps } from '../../types'

/**
 * 桌面端极简风格Dashboard模板配置
 */
export const config = {
  name: 'minimal',
  displayName: '极简风格Dashboard',
  description: '极简主义设计风格的Dashboard布局，注重内容展示和用户体验',
  category: 'dashboard',
  device: 'desktop',
  preview: '/previews/dashboard/desktop-minimal.png',

  // 默认属性
  defaultProps: {
    title: '简约工作台',
    logoUrl: '',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    showSidebar: true,
    collapsibleSidebar: true,
    sidebarCollapsed: false,
    showBreadcrumb: false,
    showUserInfo: true,
    showNotifications: false,
    enableAnimations: true,
    userInfo: {
      name: '用户',
      avatar: '',
      role: '成员',
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

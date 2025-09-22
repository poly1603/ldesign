import type { DashboardTemplateProps } from '../../types'

/**
 * 桌面端Dashboard模板配置
 */
export const config = {
  name: 'default',
  displayName: '桌面端Dashboard布局框架',
  description: '简化的Dashboard布局框架，提供基础的头部、侧边栏、内容区域和底部布局。所有内容通过插槽自定义，适合快速搭建各种后台管理界面。',
  category: 'dashboard',
  device: 'desktop',
  preview: '/previews/dashboard/desktop-default.png',

  // 默认属性
  defaultProps: {
    primaryColor: 'var(--ldesign-brand-color)',
    secondaryColor: 'var(--ldesign-brand-color-6)',
    showSidebar: true,
    collapsibleSidebar: true,
    sidebarCollapsed: false,
    enableAnimations: true,
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

  // 功能特性
  features: [
    '基础布局框架',
    '可折叠侧边栏',
    '完全插槽化',
    '响应式设计',
    '自定义主题色',
    '轻量级实现',
  ],

  // 响应式断点
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
}

export default config

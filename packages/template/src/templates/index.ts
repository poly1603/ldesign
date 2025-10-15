/**
 * 内置模板自动注册
 */

import type { TemplateManager } from '../runtime/manager'

/**
 * 注册所有内置模板
 */
export function registerBuiltinTemplates(manager: TemplateManager): void {
  // ===== 登录模板 =====

  // Desktop 登录模板
  manager.register(
    'login',
    'desktop',
    'default',
    {
      displayName: '默认登录页',
      description: '简洁大方的桌面端登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'desktop', 'default'],
      isDefault: true,
    },
    () => import('./login/desktop/default/index.vue'),
  )

  manager.register(
    'login',
    'desktop',
    'split',
    {
      displayName: '分栏式登录页',
      description: '左右分栏布局的登录页面，适合展示品牌形象',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'desktop', 'split', 'modern'],
      isDefault: false,
    },
    () => import('./login/desktop/split/index.vue'),
  )

  // Mobile 登录模板
  manager.register(
    'login',
    'mobile',
    'default',
    {
      displayName: '移动端登录页',
      description: '适配移动设备的登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'mobile', 'default'],
      isDefault: true,
    },
    () => import('./login/mobile/default/index.vue'),
  )

  manager.register(
    'login',
    'mobile',
    'card',
    {
      displayName: '卡片式登录页',
      description: '带有顶部装饰背景的卡片式登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'mobile', 'card', 'modern'],
      isDefault: false,
    },
    () => import('./login/mobile/card/index.vue'),
  )

  // Tablet 登录模板
  manager.register(
    'login',
    'tablet',
    'simple',
    {
      displayName: '平板简单登录页',
      description: '适合平板设备的简洁登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'tablet', 'simple'],
      isDefault: true,
    },
    () => import('./login/tablet/simple/index.vue'),
  )

  manager.register(
    'login',
    'tablet',
    'landscape',
    {
      displayName: '平板横屏登录页',
      description: '适合平板横屏模式的分栏式登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'tablet', 'landscape', 'split'],
      isDefault: false,
    },
    () => import('./login/tablet/landscape/index.vue'),
  )

  // ===== 仪表板模板 =====

  // Desktop 仪表板模板
  manager.register(
    'dashboard',
    'desktop',
    'default',
    {
      displayName: '默认仪表板',
      description: '功能完整的桌面端仪表板',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['dashboard', 'desktop', 'default'],
      isDefault: true,
    },
    () => import('./dashboard/desktop/default/index.vue'),
  )

  manager.register(
    'dashboard',
    'desktop',
    'sidebar',
    {
      displayName: '侧边栏仪表板',
      description: '带有可折叠侧边栏的仪表板布局',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['dashboard', 'desktop', 'sidebar', 'modern'],
      isDefault: false,
    },
    () => import('./dashboard/desktop/sidebar/index.vue'),
  )

  // Mobile 仪表板模板
  manager.register(
    'dashboard',
    'mobile',
    'simple',
    {
      displayName: '移动端仪表板',
      description: '适配移动设备的简洁仪表板',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['dashboard', 'mobile', 'simple'],
      isDefault: true,
    },
    () => import('./dashboard/mobile/simple/index.vue'),
  )

  manager.register(
    'dashboard',
    'mobile',
    'tabs',
    {
      displayName: '标签式仪表板',
      description: '带有顶部标签切换的移动端仪表板',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['dashboard', 'mobile', 'tabs'],
      isDefault: false,
    },
    () => import('./dashboard/mobile/tabs/index.vue'),
  )

  // Tablet 仪表板模板
  manager.register(
    'dashboard',
    'tablet',
    'simple',
    {
      displayName: '平板仪表板',
      description: '适合平板设备的仪表板布局',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['dashboard', 'tablet', 'simple'],
      isDefault: true,
    },
    () => import('./dashboard/tablet/simple/index.vue'),
  )

  manager.register(
    'dashboard',
    'tablet',
    'grid',
    {
      displayName: '网格布局仪表板',
      description: '网格式布局的平板仪表板，适合展示多个数据卡片',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['dashboard', 'tablet', 'grid'],
      isDefault: false,
    },
    () => import('./dashboard/tablet/grid/index.vue'),
  )
}

export type {
  DashboardDesktopSidebarProps,
  DashboardMenuItem,
  DashboardMobileProps,
  DashboardMobileTabsProps,
  DashboardStat,
  DashboardTabletGridProps,
  DashboardTabletProps,
  DashboardTemplateProps,
} from './dashboard/types'

// 导出模板类型
export type {
  LoginDesktopSplitProps,
  LoginMobileCardProps,
  LoginTabletProps,
  LoginTemplateProps,
} from './login/types'

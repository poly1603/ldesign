/**
 * 模板导出文件
 *
 * 导出所有可用的模板组件
 */

// 登录模板 - 桌面端
export { default as LoginDesktopClassic } from './login/desktop/classic'
export { default as LoginDesktopDefault } from './login/desktop/default'
export { default as LoginDesktopModern } from './login/desktop/modern'

// 登录模板 - 移动端
export { default as LoginMobileCard } from './login/mobile/card'
export { default as LoginMobileDefault } from './login/mobile/default'
export { default as LoginMobileSimple } from './login/mobile/simple'

// 登录模板 - 平板端
export { default as LoginTabletAdaptive } from './login/tablet/adaptive'
export { default as LoginTabletDefault } from './login/tablet/default'
export { default as LoginTabletSplit } from './login/tablet/split'

// 静态导入所有模板组件
import LoginDesktopClassic from './login/desktop/classic'
import LoginDesktopDefault from './login/desktop/default'
import LoginDesktopModern from './login/desktop/modern'
import LoginMobileCard from './login/mobile/card'
import LoginMobileDefault from './login/mobile/default'
import LoginMobileSimple from './login/mobile/simple'
import LoginTabletAdaptive from './login/tablet/adaptive'
import LoginTabletDefault from './login/tablet/default'
import LoginTabletSplit from './login/tablet/split'

// 模板映射表 - 直接引用组件而不是动态导入
export const templateMap = {
  login: {
    desktop: {
      classic: LoginDesktopClassic,
      default: LoginDesktopDefault,
      modern: LoginDesktopModern,
    },
    mobile: {
      card: LoginMobileCard,
      default: LoginMobileDefault,
      simple: LoginMobileSimple,
    },
    tablet: {
      adaptive: LoginTabletAdaptive,
      default: LoginTabletDefault,
      split: LoginTabletSplit,
    },
  },
}

// 模板元数据
export const templateMetadata = {
  login: {
    desktop: {
      classic: {
        name: '经典登录',
        description: '传统的登录界面设计',
        category: 'login',
        device: 'desktop',
        template: 'classic',
      },
      default: {
        name: '默认登录',
        description: '简洁的默认登录界面',
        category: 'login',
        device: 'desktop',
        template: 'default',
      },
      modern: {
        name: '现代登录',
        description: '现代化的登录界面设计',
        category: 'login',
        device: 'desktop',
        template: 'modern',
      },
    },
    mobile: {
      card: {
        name: '卡片登录',
        description: '移动端卡片式登录界面',
        category: 'login',
        device: 'mobile',
        template: 'card',
      },
      default: {
        name: '默认登录',
        description: '移动端默认登录界面',
        category: 'login',
        device: 'mobile',
        template: 'default',
      },
      simple: {
        name: '简洁登录',
        description: '移动端简洁登录界面',
        category: 'login',
        device: 'mobile',
        template: 'simple',
      },
    },
    tablet: {
      adaptive: {
        name: '自适应登录',
        description: '平板端自适应登录界面',
        category: 'login',
        device: 'tablet',
        template: 'adaptive',
      },
      default: {
        name: '默认登录',
        description: '平板端默认登录界面',
        category: 'login',
        device: 'tablet',
        template: 'default',
      },
      split: {
        name: '分屏登录',
        description: '平板端分屏登录界面',
        category: 'login',
        device: 'tablet',
        template: 'split',
      },
    },
  },
}

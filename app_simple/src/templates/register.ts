/**
 * 注册内置模板
 * 直接导入源码文件
 */
import type { TemplateManager } from '@ldesign/template'

// 直接导入模板组件 - 由于构建输出问题，暂时使用本地组件
import LoginDesktopDefault from '../../packages/template/src/templates/login/desktop/default/index.vue'
import LoginDesktopSplit from '../../packages/template/src/templates/login/desktop/split/index.vue'
import LoginMobileDefault from '../../packages/template/src/templates/login/mobile/default/index.vue'
import LoginMobileCard from '../../packages/template/src/templates/login/mobile/card/index.vue'
import LoginTabletSimple from '../../packages/template/src/templates/login/tablet/simple/index.vue'
import LoginTabletLandscape from '../../packages/template/src/templates/login/tablet/landscape/index.vue'

export function registerBuiltinTemplates(manager: TemplateManager): void {
  console.log('[registerBuiltinTemplates] 开始注册 @ldesign/template 内置模板...')

  // ===== 桌面端登录模板 =====
  // 默认登录模板
  try {
    const id = manager.register(
      'login',
      'desktop',
      'default',
      {
        displayName: '默认登录页',
        description: '简洁大方的桌面端登录页面',
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['login', 'desktop', 'default', 'simple'],
        isDefault: true,
      },
      LoginDesktopDefault,
    )
    console.log('[registerBuiltinTemplates] Desktop default 模板注册成功:', id)
  } catch (error) {
    console.error('[registerBuiltinTemplates] Desktop default 模板注册失败:', error)
  }

  // 分屏登录模板
  try {
    const id = manager.register(
      'login',
      'desktop',
      'split',
      {
        displayName: '分屏登录页',
        description: '左右分屏的桌面端登录页面',
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['login', 'desktop', 'split', 'modern'],
        isDefault: false,
      },
      LoginDesktopSplit,
    )
    console.log('[registerBuiltinTemplates] Desktop split 模板注册成功:', id)
  } catch (error) {
    console.error('[registerBuiltinTemplates] Desktop split 模板注册失败:', error)
  }

  // ===== 移动端登录模板 =====
  // 默认移动端登录模板
  try {
    const id = manager.register(
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
      LoginMobileDefault,
    )
    console.log('[registerBuiltinTemplates] Mobile default 模板注册成功:', id)
  } catch (error) {
    console.error('[registerBuiltinTemplates] Mobile default 模板注册失败:', error)
  }

  // 卡片式移动端登录模板
  try {
    const id = manager.register(
      'login',
      'mobile',
      'card',
      {
        displayName: '卡片式登录页',
        description: '卡片风格的移动端登录页面',
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['login', 'mobile', 'card', 'modern'],
        isDefault: false,
      },
      LoginMobileCard,
    )
    console.log('[registerBuiltinTemplates] Mobile card 模板注册成功:', id)
  } catch (error) {
    console.error('[registerBuiltinTemplates] Mobile card 模板注册失败:', error)
  }

  // ===== 平板端登录模板 =====
  // 简单平板登录模板
  try {
    const id = manager.register(
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
      LoginTabletSimple,
    )
    console.log('[registerBuiltinTemplates] Tablet simple 模板注册成功:', id)
  } catch (error) {
    console.error('[registerBuiltinTemplates] Tablet simple 模板注册失败:', error)
  }

  // 横屏平板登录模板
  try {
    const id = manager.register(
      'login',
      'tablet',
      'landscape',
      {
        displayName: '横屏登录页',
        description: '适合平板横屏的登录页面',
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['login', 'tablet', 'landscape', 'wide'],
        isDefault: false,
      },
      LoginTabletLandscape,
    )
    console.log('[registerBuiltinTemplates] Tablet landscape 模板注册成功:', id)
  } catch (error) {
    console.error('[registerBuiltinTemplates] Tablet landscape 模板注册失败:', error)
  }
  
  console.log('[registerBuiltinTemplates] 所有模板注册完成')
  
  // 输出已注册的登录模板统计
  const loginTemplates = manager.query({ category: 'login' })
  console.log(`[registerBuiltinTemplates] 已注册 ${loginTemplates.length} 个登录模板:`)
  const templatesByDevice = {
    desktop: loginTemplates.filter(t => t.metadata.device === 'desktop'),
    mobile: loginTemplates.filter(t => t.metadata.device === 'mobile'),
    tablet: loginTemplates.filter(t => t.metadata.device === 'tablet'),
  }
  console.log(`  - 桌面端: ${templatesByDevice.desktop.length} 个模板`)
  console.log(`  - 移动端: ${templatesByDevice.mobile.length} 个模板`)
  console.log(`  - 平板端: ${templatesByDevice.tablet.length} 个模板`)
}

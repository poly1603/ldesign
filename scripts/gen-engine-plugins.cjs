/**
 * 为现有 16 个包添加 engine 插件目录
 * 同时清理结构问题（build artifacts, 重复文件等）
 */
const fs = require('fs')
const path = require('path')
const base = path.join(__dirname, '..', 'packages')

function w(f, c) {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, c.replace(/\r\n/g, '\n'), 'utf8')
}
function coreSrc(pkg, ...parts) { return path.join(base, pkg, 'packages/core/src', ...parts) }

// =====================================================================
// Plugin generation helper
// =====================================================================
function genEnginePlugin(pkg, config) {
  const { name, stateKeys, eventKeys, importLine, installBody, uninstallBody, optionsType, optionsExtends } = config

  // engine/types.ts
  w(coreSrc(pkg, 'engine/types.ts'), `${optionsExtends ? `import type { ${optionsExtends.type} } from '${optionsExtends.from}'\n\n` : ''}export interface ${name}EnginePluginOptions${optionsExtends ? ` extends Partial<${optionsExtends.type}>` : ''} {
  dependencies?: string[]${optionsType || ''}
}
`)

  // engine/plugin.ts
  const stateKeysStr = Object.entries(stateKeys).map(([k, v]) => `  ${k}: '${v}' as const,`).join('\n')
  const eventKeysStr = Object.entries(eventKeys).map(([k, v]) => `  ${k}: '${v}' as const,`).join('\n')

  w(coreSrc(pkg, 'engine/plugin.ts'), `/**
 * @ldesign/${pkg} Engine 插件
 */
import type { ${name}EnginePluginOptions } from './types'
${importLine}

export const ${pkg}StateKeys = {
${stateKeysStr}
} as const

export const ${pkg}EventKeys = {
${eventKeysStr}
} as const

export function create${name}EnginePlugin(options: ${name}EnginePluginOptions = {}) {
${config.locals || ''}
  return {
    name: '${pkg}',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
${installBody}
      engine.events?.emit(${pkg}EventKeys.INSTALLED, { name: '${pkg}' })
      engine.logger?.info('[${name} Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
${uninstallBody}
      engine.events?.emit(${pkg}EventKeys.UNINSTALLED, {})
      engine.logger?.info('[${name} Plugin] uninstalled')
    },
  }
}
`)

  // engine/index.ts
  w(coreSrc(pkg, 'engine/index.ts'), `export { create${name}EnginePlugin, ${pkg}StateKeys, ${pkg}EventKeys } from './plugin'
export type { ${name}EnginePluginOptions } from './types'
`)
  console.log(`✅ ${pkg}/engine`)
}

// =====================================================================
// 1. auth
// =====================================================================
genEnginePlugin('auth', {
  name: 'Auth',
  importLine: "import { AuthManager } from '../auth/AuthManager'",
  stateKeys: { MANAGER: 'auth:manager', USER: 'auth:user', TOKEN: 'auth:token', AUTHENTICATED: 'auth:authenticated' },
  eventKeys: { INSTALLED: 'auth:installed', UNINSTALLED: 'auth:uninstalled', LOGIN: 'auth:login', LOGOUT: 'auth:logout', TOKEN_REFRESHED: 'auth:tokenRefreshed' },
  locals: '  let manager: AuthManager | null = null',
  installBody: `      manager = new AuthManager(options as any)
      engine.state?.set(authStateKeys.MANAGER, manager)`,
  uninstallBody: `      manager = null
      engine.state?.delete(authStateKeys.MANAGER)
      engine.state?.delete(authStateKeys.USER)
      engine.state?.delete(authStateKeys.TOKEN)`,
  optionsType: `
  /** 认证配置 */
  tokenKey?: string
  refreshTokenKey?: string`,
})

// =====================================================================
// 2. logger
// =====================================================================
genEnginePlugin('logger', {
  name: 'Logger',
  importLine: "import { Logger } from '../logger/logger'",
  stateKeys: { INSTANCE: 'logger:instance' },
  eventKeys: { INSTALLED: 'logger:installed', UNINSTALLED: 'logger:uninstalled' },
  locals: '  let logger: Logger | null = null',
  installBody: `      logger = new Logger(options as any)
      engine.state?.set(loggerStateKeys.INSTANCE, logger)`,
  uninstallBody: `      logger = null
      engine.state?.delete(loggerStateKeys.INSTANCE)`,
  optionsType: `
  /** 日志等级 */
  level?: string
  /** 前缀 */
  prefix?: string`,
})

// =====================================================================
// 3. cache
// =====================================================================
genEnginePlugin('cache', {
  name: 'Cache',
  importLine: "import { CacheManager } from '../cache-manager'",
  stateKeys: { MANAGER: 'cache:manager' },
  eventKeys: { INSTALLED: 'cache:installed', UNINSTALLED: 'cache:uninstalled' },
  locals: '  let manager: CacheManager<any> | null = null',
  installBody: `      manager = new CacheManager(options as any)
      engine.state?.set(cacheStateKeys.MANAGER, manager)`,
  uninstallBody: `      if (manager) { await manager.clear(); manager = null }
      engine.state?.delete(cacheStateKeys.MANAGER)`,
  optionsType: `
  /** 最大缓存大小 */
  maxSize?: number
  /** 默认 TTL */
  defaultTTL?: number`,
})

// =====================================================================
// 4. store
// =====================================================================
genEnginePlugin('store', {
  name: 'Store',
  importLine: "import { createEventBus } from '../core/event-bus'",
  stateKeys: { BUS: 'store:bus' },
  eventKeys: { INSTALLED: 'store:installed', UNINSTALLED: 'store:uninstalled' },
  locals: '  let bus: ReturnType<typeof createEventBus> | null = null',
  installBody: `      bus = createEventBus()
      engine.state?.set(storeStateKeys.BUS, bus)`,
  uninstallBody: `      bus = null
      engine.state?.delete(storeStateKeys.BUS)`,
})

// =====================================================================
// 5. notification
// =====================================================================
genEnginePlugin('notification', {
  name: 'Notification',
  importLine: `import { NotificationManager } from '../managers/notification-manager'
import { ToastManager } from '../managers/toast-manager'
import { MessageManager } from '../managers/message-manager'`,
  stateKeys: { NOTIFICATION: 'notification:manager', TOAST: 'notification:toast', MESSAGE: 'notification:message' },
  eventKeys: { INSTALLED: 'notification:installed', UNINSTALLED: 'notification:uninstalled', NOTIFY: 'notification:notify' },
  locals: `  let notificationMgr: NotificationManager | null = null
  let toastMgr: ToastManager | null = null
  let messageMgr: MessageManager | null = null`,
  installBody: `      notificationMgr = new NotificationManager()
      toastMgr = new ToastManager()
      messageMgr = new MessageManager()
      engine.state?.set(notificationStateKeys.NOTIFICATION, notificationMgr)
      engine.state?.set(notificationStateKeys.TOAST, toastMgr)
      engine.state?.set(notificationStateKeys.MESSAGE, messageMgr)`,
  uninstallBody: `      notificationMgr?.destroy(); toastMgr?.destroy(); messageMgr?.destroy()
      notificationMgr = null; toastMgr = null; messageMgr = null
      engine.state?.delete(notificationStateKeys.NOTIFICATION)
      engine.state?.delete(notificationStateKeys.TOAST)
      engine.state?.delete(notificationStateKeys.MESSAGE)`,
})

// =====================================================================
// 6. tracker
// =====================================================================
genEnginePlugin('tracker', {
  name: 'Tracker',
  importLine: "import { createPerformanceCollector } from '../collectors/performance-collector'",
  stateKeys: { COLLECTOR: 'tracker:collector' },
  eventKeys: { INSTALLED: 'tracker:installed', UNINSTALLED: 'tracker:uninstalled', TRACK: 'tracker:track' },
  locals: '  let collector: any = null',
  installBody: `      collector = createPerformanceCollector(options as any)
      engine.state?.set(trackerStateKeys.COLLECTOR, collector)`,
  uninstallBody: `      collector?.destroy?.(); collector = null
      engine.state?.delete(trackerStateKeys.COLLECTOR)`,
})

// =====================================================================
// 7. permission
// =====================================================================
genEnginePlugin('permission', {
  name: 'Permission',
  importLine: "import { createPermissionManager } from '../permission/PermissionManager'",
  stateKeys: { MANAGER: 'permission:manager' },
  eventKeys: { INSTALLED: 'permission:installed', UNINSTALLED: 'permission:uninstalled', CHANGED: 'permission:changed' },
  locals: '  let manager: any = null',
  installBody: `      manager = createPermissionManager(options as any)
      engine.state?.set(permissionStateKeys.MANAGER, manager)`,
  uninstallBody: `      manager?.destroy?.(); manager = null
      engine.state?.delete(permissionStateKeys.MANAGER)`,
})

// =====================================================================
// 8. error (core version - complementing the vue engine-plugin)
// =====================================================================
genEnginePlugin('error', {
  name: 'Error',
  importLine: `import { ErrorCatcher } from '../catcher/error-catcher'
import { ErrorReporter } from '../reporter/error-reporter'`,
  stateKeys: { CATCHER: 'error:catcher', REPORTER: 'error:reporter' },
  eventKeys: { INSTALLED: 'error:installed', UNINSTALLED: 'error:uninstalled', CAUGHT: 'error:caught' },
  locals: `  let catcher: ErrorCatcher | null = null
  let reporter: ErrorReporter | null = null`,
  installBody: `      catcher = new ErrorCatcher(options as any)
      reporter = new ErrorReporter(options as any)
      catcher.install()
      engine.state?.set(errorStateKeys.CATCHER, catcher)
      engine.state?.set(errorStateKeys.REPORTER, reporter)`,
  uninstallBody: `      catcher?.uninstall?.(); reporter?.destroy?.()
      catcher = null; reporter = null
      engine.state?.delete(errorStateKeys.CATCHER)
      engine.state?.delete(errorStateKeys.REPORTER)`,
  optionsType: `
  /** 错误上报端点 */
  endpoint?: string
  /** 是否启用 */
  enabled?: boolean`,
})

// =====================================================================
// 9. size
// =====================================================================
genEnginePlugin('size', {
  name: 'Size',
  importLine: "import { SizeManager } from '../core/SizeManager'",
  stateKeys: { MANAGER: 'size:manager' },
  eventKeys: { INSTALLED: 'size:installed', UNINSTALLED: 'size:uninstalled', CHANGED: 'size:changed' },
  locals: '  let manager: SizeManager | null = null',
  installBody: `      manager = new SizeManager(options as any)
      engine.state?.set(sizeStateKeys.MANAGER, manager)`,
  uninstallBody: `      manager?.destroy?.(); manager = null
      engine.state?.delete(sizeStateKeys.MANAGER)`,
})

// =====================================================================
// 10. device
// =====================================================================
genEnginePlugin('device', {
  name: 'Device',
  importLine: "import { DeviceDetector } from '../core/DeviceDetector'",
  stateKeys: { DETECTOR: 'device:detector', INFO: 'device:info' },
  eventKeys: { INSTALLED: 'device:installed', UNINSTALLED: 'device:uninstalled', CHANGED: 'device:changed' },
  locals: '  let detector: DeviceDetector | null = null',
  installBody: `      detector = new DeviceDetector(options as any)
      engine.state?.set(deviceStateKeys.DETECTOR, detector)
      engine.state?.set(deviceStateKeys.INFO, detector.getDeviceInfo?.() ?? {})`,
  uninstallBody: `      detector?.destroy?.(); detector = null
      engine.state?.delete(deviceStateKeys.DETECTOR)
      engine.state?.delete(deviceStateKeys.INFO)`,
})

// =====================================================================
// 11. i18n (engine plugin for core, already has keys in engine types)
// =====================================================================
genEnginePlugin('i18n', {
  name: 'I18n',
  importLine: "import { createI18n } from '../core'",
  stateKeys: { INSTANCE: 'i18n:instance', LOCALE: 'i18n:locale', FALLBACK_LOCALE: 'i18n:fallbackLocale' },
  eventKeys: { INSTALLED: 'i18n:installed', UNINSTALLED: 'i18n:uninstalled', LOCALE_CHANGED: 'i18n:localeChanged' },
  locals: '  let instance: any = null',
  installBody: `      instance = createI18n(options as any)
      engine.state?.set(i18nStateKeys.INSTANCE, instance)
      engine.state?.set(i18nStateKeys.LOCALE, (options as any).locale ?? 'zh-CN')`,
  uninstallBody: `      instance?.destroy?.(); instance = null
      engine.state?.delete(i18nStateKeys.INSTANCE)
      engine.state?.delete(i18nStateKeys.LOCALE)`,
  optionsType: `
  /** 默认语言 */
  locale?: string
  /** 回退语言 */
  fallbackLocale?: string`,
})

// =====================================================================
// 12. color (engine plugin, separate from Vue plugin in plugin/)
// =====================================================================
genEnginePlugin('color', {
  name: 'Color',
  importLine: "import { ThemeManager } from '../themes/themeManager'",
  stateKeys: { MANAGER: 'color:manager', PRIMARY: 'color:primaryColor', MODE: 'color:mode', THEME_NAME: 'color:themeName' },
  eventKeys: { INSTALLED: 'color:installed', UNINSTALLED: 'color:uninstalled', THEME_CHANGED: 'color:themeChanged', MODE_CHANGED: 'color:modeChanged' },
  locals: '  let manager: ThemeManager | null = null',
  installBody: `      manager = new ThemeManager(options as any)
      engine.state?.set(colorStateKeys.MANAGER, manager)
      manager.onChange((theme) => {
        engine.state?.set(colorStateKeys.PRIMARY, theme.primaryColor)
        engine.state?.set(colorStateKeys.THEME_NAME, theme.themeName)
        engine.events?.emit(colorEventKeys.THEME_CHANGED, theme)
      })`,
  uninstallBody: `      manager?.destroy?.(); manager = null
      engine.state?.delete(colorStateKeys.MANAGER)
      engine.state?.delete(colorStateKeys.PRIMARY)
      engine.state?.delete(colorStateKeys.MODE)
      engine.state?.delete(colorStateKeys.THEME_NAME)`,
  optionsType: `
  /** CSS 变量前缀 */
  prefix?: string
  /** 默认主题色 */
  defaultTheme?: string
  /** 自动应用 */
  autoApply?: boolean`,
})

// =====================================================================
// 13. router (engine plugin)
// =====================================================================
genEnginePlugin('router', {
  name: 'Router',
  importLine: "import { createRouterServiceContainer } from '../di/service-container'",
  stateKeys: { CONTAINER: 'router:container', MODE: 'router:mode', BASE: 'router:base' },
  eventKeys: { INSTALLED: 'router:installed', UNINSTALLED: 'router:uninstalled', NAVIGATED: 'router:navigated', BEFORE_NAVIGATE: 'router:beforeNavigate', AFTER_NAVIGATE: 'router:afterNavigate' },
  locals: '  let container: any = null',
  installBody: `      container = createRouterServiceContainer()
      engine.state?.set(routerStateKeys.CONTAINER, container)
      if ((options as any).mode) engine.state?.set(routerStateKeys.MODE, (options as any).mode)
      if ((options as any).base) engine.state?.set(routerStateKeys.BASE, (options as any).base)`,
  uninstallBody: `      container?.dispose?.(); container = null
      engine.state?.delete(routerStateKeys.CONTAINER)
      engine.state?.delete(routerStateKeys.MODE)
      engine.state?.delete(routerStateKeys.BASE)`,
  optionsType: `
  /** 路由模式 */
  mode?: 'history' | 'hash' | 'memory'
  /** 基础路径 */
  base?: string`,
})

// =====================================================================
// 14. bookmark
// =====================================================================
genEnginePlugin('bookmark', {
  name: 'Bookmark',
  importLine: "import { BookmarkManager } from '../managers/bookmark-manager'",
  stateKeys: { MANAGER: 'bookmark:manager' },
  eventKeys: { INSTALLED: 'bookmark:installed', UNINSTALLED: 'bookmark:uninstalled', ADDED: 'bookmark:added', REMOVED: 'bookmark:removed' },
  locals: '  let manager: BookmarkManager | null = null',
  installBody: `      manager = new BookmarkManager(options as any)
      engine.state?.set(bookmarkStateKeys.MANAGER, manager)`,
  uninstallBody: `      manager?.destroy?.(); manager = null
      engine.state?.delete(bookmarkStateKeys.MANAGER)`,
})

// =====================================================================
// 15. breadcrumb
// =====================================================================
genEnginePlugin('breadcrumb', {
  name: 'Breadcrumb',
  importLine: "import { BreadcrumbManager } from '../managers/breadcrumb-manager'",
  stateKeys: { MANAGER: 'breadcrumb:manager' },
  eventKeys: { INSTALLED: 'breadcrumb:installed', UNINSTALLED: 'breadcrumb:uninstalled', CHANGED: 'breadcrumb:changed' },
  locals: '  let manager: BreadcrumbManager | null = null',
  installBody: `      manager = new BreadcrumbManager(options as any)
      engine.state?.set(breadcrumbStateKeys.MANAGER, manager)`,
  uninstallBody: `      manager?.destroy?.(); manager = null
      engine.state?.delete(breadcrumbStateKeys.MANAGER)`,
})

// =====================================================================
// 16. menu
// =====================================================================
genEnginePlugin('menu', {
  name: 'Menu',
  importLine: "import { MenuManager } from '../managers/menu-manager'",
  stateKeys: { MANAGER: 'menu:manager' },
  eventKeys: { INSTALLED: 'menu:installed', UNINSTALLED: 'menu:uninstalled', CHANGED: 'menu:changed' },
  locals: '  let manager: MenuManager | null = null',
  installBody: `      manager = new MenuManager(options as any)
      engine.state?.set(menuStateKeys.MANAGER, manager)`,
  uninstallBody: `      manager?.destroy?.(); manager = null
      engine.state?.delete(menuStateKeys.MANAGER)`,
})

// =====================================================================
// Cleanup structural issues
// =====================================================================
function cleanupStructural() {
  // 1. Remove .d.ts build artifacts from cache/core/src
  const cacheSrc = coreSrc('cache')
  if (fs.existsSync(cacheSrc)) {
    const files = fs.readdirSync(cacheSrc)
    files.forEach(f => {
      if ((f.endsWith('.d.ts') || f.endsWith('.d.ts.map')) && !f.includes('/')) {
        const fp = path.join(cacheSrc, f)
        if (fs.statSync(fp).isFile()) {
          fs.unlinkSync(fp)
          console.log(`🗑️  removed cache/core/src/${f}`)
        }
      }
    })
    // Also clean subdirectories
    const subdirs = ['constants', 'plugins', 'serializers', 'storage', 'strategies', 'types', 'utils']
    subdirs.forEach(dir => {
      const dirPath = path.join(cacheSrc, dir)
      if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(f => {
          if (f.endsWith('.d.ts') || f.endsWith('.d.ts.map')) {
            fs.unlinkSync(path.join(dirPath, f))
          }
        })
      }
    })
    console.log('🧹 cleaned cache .d.ts artifacts')
  }

  // 2. Remove duplicate EventEmitter.ts from device/core/src root
  const deviceRoot = path.join(coreSrc('device'), 'EventEmitter.ts')
  if (fs.existsSync(deviceRoot)) {
    fs.unlinkSync(deviceRoot)
    console.log('🗑️  removed device/core/src/EventEmitter.ts (duplicate of core/EventEmitter.ts)')
  }

  // 3. Remove root types.ts from device if types/ dir exists
  const deviceTypes = path.join(coreSrc('device'), 'types.ts')
  const deviceTypesDir = path.join(coreSrc('device'), 'types')
  if (fs.existsSync(deviceTypes) && fs.existsSync(deviceTypesDir)) {
    fs.unlinkSync(deviceTypes)
    console.log('🗑️  removed device/core/src/types.ts (types/ dir exists)')
  }
}

cleanupStructural()
console.log('\n🎉 All engine plugins generated + structural cleanup done!')

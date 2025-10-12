/**
 * 国际化配置
 * 
 * 简单优雅的 i18n 配置
 */

import { 
  createI18n,
  type I18nOptions 
} from '@ldesign/i18n'

/**
 * 支持的语言列表
 */
export const SUPPORTED_LOCALES = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
} as const

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES

/**
 * 默认语言
 */
export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN'

/**
 * 获取浏览器语言
 */
function getBrowserLocale(): SupportedLocale {
  const browserLang = navigator.language || navigator.language
  
  // 精确匹配
  if (browserLang in SUPPORTED_LOCALES) {
    return browserLang as SupportedLocale
  }
  
  // 模糊匹配（如 zh 匹配 zh-CN）
  const shortLang = browserLang.split('-')[0]
  for (const locale in SUPPORTED_LOCALES) {
    if (locale.startsWith(shortLang)) {
      return locale as SupportedLocale
    }
  }
  
  return DEFAULT_LOCALE
}

/**
 * 获取保存的语言偏好
 */
function getSavedLocale(): SupportedLocale | null {
  const saved = localStorage.getItem('ldesign_locale')
  if (saved && saved in SUPPORTED_LOCALES) {
    return saved as SupportedLocale
  }
  return null
}

/**
 * 保存语言偏好
 */
export function saveLocale(locale: SupportedLocale): void {
  localStorage.setItem('ldesign_locale', locale)
}

/**
 * 创建并配置 i18n 实例
 * 
 * 使用最简单的方式，但保留扩展能力
 */
export async function createI18nInstance() {
  // 确定初始语言
  const initialLocale = getSavedLocale() || getBrowserLocale()
  
  // 创建 i18n 实例（最简配置）
  const i18n = createI18n({
    locale: initialLocale,
    fallbackLocale: DEFAULT_LOCALE,
    
    // 初始消息（可以为空，后续动态加载）
    messages: {
      'zh-CN': {
        common: {
          welcome: '欢迎',
          home: '首页',
          about: '关于',
          dashboard: '仪表盘',
          login: '登录',
          logout: '退出登录',
          loading: '加载中...',
          error: '错误',
          success: '成功',
          confirm: '确认',
          cancel: '取消',
        },
        nav: {
          brand: 'LDesign 路由应用',
          user: '用户',
        },
        page: {
          home: {
            title: '首页',
            subtitle: '欢迎使用 LDesign',
            description: '一个现代化的前端框架',
          },
          about: {
            title: '关于我们',
            content: '我们致力于打造最好的开发体验',
          },
          dashboard: {
            title: '仪表盘',
            welcome: '欢迎回来，{username}！',
            stats: '统计数据',
          },
          login: {
            title: '登录',
            username: '用户名',
            password: '密码',
            submit: '登录',
            error: '用户名或密码错误',
          },
          notFound: {
            title: '页面未找到',
            message: '抱歉，您访问的页面不存在',
            backHome: '返回首页',
          }
        },
        footer: {
          copyright: '© 2024 LDesign Router App - 由 @ldesign/engine & @ldesign/i18n 强力驱动',
        },
        features: {
          title: '核心特性',
          performance: {
            title: '高性能',
            description: '智能预取、缓存优化、懒加载等多种性能优化策略',
          },
          security: {
            title: '安全可靠',
            description: '内置认证守卫、权限控制、XSS 防护等安全功能',
          },
          responsive: {
            title: '响应式',
            description: '支持多设备适配，移动端、桌面端、平板端完美适应',
          },
          animation: {
            title: '动画系统',
            description: '丰富的过渡动画效果，让路由切换更加流畅自然',
          },
          engine: {
            title: 'Engine 集成',
            description: '与 @ldesign/engine 深度集成，提供完整的应用开发体验',
          },
          developer: {
            title: '开发友好',
            description: '完善的 TypeScript 支持、开发工具、调试面板',
          },
        },
        stats: {
          routes: '路由数量',
          visits: '访问次数',
          cache: '缓存大小',
        }
      },
      'en-US': {
        common: {
          welcome: 'Welcome',
          home: 'Home',
          about: 'About',
          dashboard: 'Dashboard',
          login: 'Login',
          logout: 'Logout',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          confirm: 'Confirm',
          cancel: 'Cancel',
        },
        nav: {
          brand: 'LDesign Router App',
          user: 'User',
        },
        page: {
          home: {
            title: 'Home',
            subtitle: 'Welcome to LDesign',
            description: 'A modern frontend framework',
          },
          about: {
            title: 'About Us',
            content: 'We are committed to creating the best development experience',
          },
          dashboard: {
            title: 'Dashboard',
            welcome: 'Welcome back, {username}!',
            stats: 'Statistics',
          },
          login: {
            title: 'Login',
            username: 'Username',
            password: 'Password',
            submit: 'Sign In',
            error: 'Invalid username or password',
          },
          notFound: {
            title: 'Page Not Found',
            message: 'Sorry, the page you visited does not exist',
            backHome: 'Back to Home',
          }
        },
        footer: {
          copyright: '© 2024 LDesign Router App - Powered by @ldesign/engine & @ldesign/i18n',
        },
        features: {
          title: 'Core Features',
          performance: {
            title: 'High Performance',
            description: 'Smart prefetching, cache optimization, lazy loading and more',
          },
          security: {
            title: 'Secure & Reliable',
            description: 'Built-in auth guards, permission control, XSS protection',
          },
          responsive: {
            title: 'Responsive',
            description: 'Multi-device support, perfect for mobile, desktop and tablet',
          },
          animation: {
            title: 'Animation System',
            description: 'Rich transition effects for smooth route navigation',
          },
          engine: {
            title: 'Engine Integration',
            description: 'Deep integration with @ldesign/engine for complete dev experience',
          },
          developer: {
            title: 'Developer Friendly',
            description: 'Full TypeScript support, dev tools, debug panel',
          },
        },
        stats: {
          routes: 'Routes',
          visits: 'Visits',
          cache: 'Cache Size',
        }
      },
      'ja-JP': {
        common: {
          welcome: 'ようこそ',
          home: 'ホーム',
          about: '私たちについて',
          dashboard: 'ダッシュボード',
          login: 'ログイン',
          logout: 'ログアウト',
          loading: '読み込み中...',
          error: 'エラー',
          success: '成功',
          confirm: '確認',
          cancel: 'キャンセル',
        },
        nav: {
          brand: 'LDesign ルーターアプリ',
          user: 'ユーザー',
        },
        page: {
          home: {
            title: 'ホーム',
            subtitle: 'LDesignへようこそ',
            description: 'モダンなフロントエンドフレームワーク',
          },
          about: {
            title: '私たちについて',
            content: '最高の開発体験を作ることに取り組んでいます',
          },
          dashboard: {
            title: 'ダッシュボード',
            welcome: 'おかえりなさい、{username}さん！',
            stats: '統計',
          },
          login: {
            title: 'ログイン',
            username: 'ユーザー名',
            password: 'パスワード',
            submit: 'サインイン',
            error: 'ユーザー名またはパスワードが正しくありません',
          },
          notFound: {
            title: 'ページが見つかりません',
            message: '申し訳ありませんが、アクセスしたページは存在しません',
            backHome: 'ホームに戻る',
          }
        },
        footer: {
          copyright: '© 2024 LDesign Router App - @ldesign/engine & @ldesign/i18n 提供',
        },
        features: {
          title: 'コア機能',
          performance: {
            title: 'ハイパフォーマンス',
            description: 'スマートプリフェッチ、キャッシュ最適化、遅延読み込みなど',
          },
          security: {
            title: '安全・信頼性',
            description: '認証ガード、権限制御、XSS保護機能内蔵',
          },
          responsive: {
            title: 'レスポンシブ',
            description: 'マルチデバイス対応、モバイル・デスクトップ・タブレットに完全対応',
          },
          animation: {
            title: 'アニメーションシステム',
            description: '豊富なトランジション効果でスムーズなルートナビゲーション',
          },
          engine: {
            title: 'Engine統合',
            description: '@ldesign/engineとの深い統合で完全な開発体験',
          },
          developer: {
            title: '開発者フレンドリー',
            description: '完全なTypeScriptサポート、開発ツール、デバッグパネル',
          },
        },
        stats: {
          routes: 'ルート数',
          visits: 'アクセス数',
          cache: 'キャッシュサイズ',
        }
      }
    }
  })

  // 保留高级功能接口，但暂不启用
  // TODO: 待相关模块完善后启用高级功能
  // if (import.meta.env.PROD) {
  //   // 1. 内存优化
  //   // 2. 缓存插件
  //   // 3. AI 翻译
  // }

  // 监听语言变化，保存偏好
  i18n.on('languageChanged', ({ locale }) => {
    saveLocale(locale as SupportedLocale)
    document.documentElement.lang = locale
  })

  return i18n
}

/**
 * 创建 i18n Vue 插件（用于 engine）
 */
export async function createI18nPlugin() {
  const i18n = await createI18nInstance()
  
  return {
    name: 'i18n',
    version: '1.0.0',
    
    // 安装到 Vue app (通过 PluginContext)
    install(context: any) {
      console.log('[i18n] Installing plugin with context:', context)
      
      // 如果 context 有 engine，监听 app:created 事件
      if (context && context.engine) {
        const engine = context.engine
        console.log('[i18n] Found engine, checking for app...')
        
        // 尝试获取现有的 app
        let app = engine.getApp ? engine.getApp() : engine._app
        
        if (app) {
          console.log('[i18n] App already exists, installing now')
          installToApp(app)
        } else {
          console.log('[i18n] App not yet created, waiting for app:created event')
          // 监听 app 创建事件
          engine.events.on('app:created', (createdApp: any) => {
            console.log('[i18n] app:created event fired, installing to app')
            installToApp(createdApp)
          })
        }
      } else if (context && context.config) {
        // 这可能是 Vue app 本身
        console.log('[i18n] Context appears to be Vue app directly')
        installToApp(context)
      } else {
        console.error('[i18n] Unknown context type:', context)
        return
      }
      
      function installToApp(app: any) {
        // 确保 globalProperties 存在
        if (!app.config) {
          app.config = {}
        }
        if (!app.config.globalProperties) {
          app.config.globalProperties = {}
        }
        
        // 提供全局属性
        app.config.globalProperties.$t = i18n.t.bind(i18n)
        app.config.globalProperties.$i18n = i18n
        
        // 提供全局方法 - 使用 app.provide
        if (app.provide) {
          app.provide('i18n', i18n)
        }
        
        console.log('[i18n] Plugin installed successfully to app')
      }
    }
  }
}

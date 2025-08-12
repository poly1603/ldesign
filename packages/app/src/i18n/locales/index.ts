/**
 * 应用自定义语言包
 *
 * 这里定义了应用特有的翻译内容，会与 @ldesign/i18n 的内置语言包合并
 */

import type { LanguagePackage } from '@ldesign/i18n'

// 中文语言包
const zhCN: LanguagePackage = {
  info: {
    name: '简体中文',
    nativeName: '简体中文',
    code: 'zh-CN',
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
  },
  translations: {
    // 应用通用
    app: {
      name: 'LDesign 应用',
      title: 'LDesign 演示应用',
      description: '基于 Vue 3 + TypeScript + LDesign 生态系统的现代化应用',
      version: '版本',
      loading: '加载中...',
      error: '出错了',
      success: '成功',
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      refresh: '刷新',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      submit: '提交',
      reset: '重置',
    },

    // 导航和菜单
    nav: {
      home: '首页',
      login: '登录',
      logout: '退出登录',
      profile: '个人资料',
      settings: '设置',
      about: '关于',
      help: '帮助',
      language: '语言',
    },

    // 页面标题
    pages: {
      home: {
        title: '首页',
        welcome: '欢迎回来！',
        description: '您已成功登录 LDesign 演示应用',
      },
      login: {
        title: '登录',
        username: '用户名',
        password: '密码',
        loginButton: '登录',
        forgotPassword: '忘记密码？',
        rememberMe: '记住我',
        loginSuccess: '登录成功',
        loginFailed: '登录失败',
        invalidCredentials: '用户名或密码错误',
      },
    },

    // 用户信息
    user: {
      info: '用户信息',
      username: '用户名',
      loginTime: '登录时间',
      deviceInfo: '设备信息',
      lastLogin: '最后登录',
      status: '状态',
      online: '在线',
      offline: '离线',
    },

    // 设备相关
    device: {
      type: '设备类型',
      mobile: '移动设备',
      tablet: '平板设备',
      desktop: '桌面设备',
      orientation: '屏幕方向',
      portrait: '竖屏',
      landscape: '横屏',
    },

    // 路由信息
    route: {
      info: '路由信息',
      currentPath: '当前路径',
      routeName: '路由名称',
      pageTitle: '页面标题',
    },

    // 功能特性
    features: {
      title: '功能特性',
      routing: '智能路由系统',
      template: '多设备模板适配',
      engine: '应用引擎集成',
      deviceDetection: '设备类型检测',
      notification: '通知系统',
      logging: '日志记录',
      i18n: '国际化支持',
    },

    // 消息提示
    messages: {
      confirmLogout: '确定要退出登录吗？',
      logoutSuccess: '退出登录成功',
      pageRefreshed: '页面已刷新',
      languageChanged: '语言已切换',
      operationSuccess: '操作成功',
      operationFailed: '操作失败',
      networkError: '网络错误',
      serverError: '服务器错误',
      unknownError: '未知错误',
    },

    // 时间相关
    time: {
      now: '现在',
      today: '今天',
      yesterday: '昨天',
      tomorrow: '明天',
      thisWeek: '本周',
      lastWeek: '上周',
      thisMonth: '本月',
      lastMonth: '上月',
      thisYear: '今年',
      lastYear: '去年',
    },
  },
}

// 英文语言包
const en: LanguagePackage = {
  info: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
  },
  translations: {
    // Application general
    app: {
      name: 'LDesign App',
      title: 'LDesign Demo Application',
      description:
        'Modern application based on Vue 3 + TypeScript + LDesign ecosystem',
      version: 'Version',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      refresh: 'Refresh',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
    },

    // Navigation and menu
    nav: {
      home: 'Home',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      about: 'About',
      help: 'Help',
      language: 'Language',
    },

    // Page titles
    pages: {
      home: {
        title: 'Home',
        welcome: 'Welcome back!',
        description:
          'You have successfully logged into the LDesign demo application',
      },
      login: {
        title: 'Login',
        username: 'Username',
        password: 'Password',
        loginButton: 'Login',
        forgotPassword: 'Forgot password?',
        rememberMe: 'Remember me',
        loginSuccess: 'Login successful',
        loginFailed: 'Login failed',
        invalidCredentials: 'Invalid username or password',
      },
    },

    // User information
    user: {
      info: 'User Information',
      username: 'Username',
      loginTime: 'Login Time',
      deviceInfo: 'Device Info',
      lastLogin: 'Last Login',
      status: 'Status',
      online: 'Online',
      offline: 'Offline',
    },

    // Device related
    device: {
      type: 'Device Type',
      mobile: 'Mobile Device',
      tablet: 'Tablet Device',
      desktop: 'Desktop Device',
      orientation: 'Screen Orientation',
      portrait: 'Portrait',
      landscape: 'Landscape',
    },

    // Route information
    route: {
      info: 'Route Information',
      currentPath: 'Current Path',
      routeName: 'Route Name',
      pageTitle: 'Page Title',
    },

    // Features
    features: {
      title: 'Features',
      routing: 'Smart Routing System',
      template: 'Multi-device Template Adaptation',
      engine: 'Application Engine Integration',
      deviceDetection: 'Device Type Detection',
      notification: 'Notification System',
      logging: 'Logging',
      i18n: 'Internationalization Support',
    },

    // Messages
    messages: {
      confirmLogout: 'Are you sure you want to logout?',
      logoutSuccess: 'Logout successful',
      pageRefreshed: 'Page refreshed',
      languageChanged: 'Language changed',
      operationSuccess: 'Operation successful',
      operationFailed: 'Operation failed',
      networkError: 'Network error',
      serverError: 'Server error',
      unknownError: 'Unknown error',
    },

    // Time related
    time: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisYear: 'This Year',
      lastYear: 'Last Year',
    },
  },
}

// 日文语言包
const ja: LanguagePackage = {
  info: {
    name: 'Japanese',
    nativeName: '日本語',
    code: 'ja',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
  },
  translations: {
    // アプリケーション一般
    app: {
      name: 'LDesign アプリ',
      title: 'LDesign デモアプリケーション',
      description:
        'Vue 3 + TypeScript + LDesign エコシステムベースのモダンアプリケーション',
      version: 'バージョン',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      confirm: '確認',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      refresh: '更新',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      submit: '送信',
      reset: 'リセット',
    },

    // ナビゲーションとメニュー
    nav: {
      home: 'ホーム',
      login: 'ログイン',
      logout: 'ログアウト',
      profile: 'プロフィール',
      settings: '設定',
      about: 'について',
      help: 'ヘルプ',
      language: '言語',
    },

    // ページタイトル
    pages: {
      home: {
        title: 'ホーム',
        welcome: 'おかえりなさい！',
        description: 'LDesign デモアプリケーションに正常にログインしました',
      },
      login: {
        title: 'ログイン',
        username: 'ユーザー名',
        password: 'パスワード',
        loginButton: 'ログイン',
        forgotPassword: 'パスワードを忘れましたか？',
        rememberMe: 'ログイン状態を保持',
        loginSuccess: 'ログイン成功',
        loginFailed: 'ログイン失敗',
        invalidCredentials: 'ユーザー名またはパスワードが正しくありません',
      },
    },

    // ユーザー情報
    user: {
      info: 'ユーザー情報',
      username: 'ユーザー名',
      loginTime: 'ログイン時間',
      deviceInfo: 'デバイス情報',
      lastLogin: '最終ログイン',
      status: 'ステータス',
      online: 'オンライン',
      offline: 'オフライン',
    },

    // デバイス関連
    device: {
      type: 'デバイスタイプ',
      mobile: 'モバイルデバイス',
      tablet: 'タブレットデバイス',
      desktop: 'デスクトップデバイス',
      orientation: '画面の向き',
      portrait: '縦向き',
      landscape: '横向き',
    },

    // ルート情報
    route: {
      info: 'ルート情報',
      currentPath: '現在のパス',
      routeName: 'ルート名',
      pageTitle: 'ページタイトル',
    },

    // 機能
    features: {
      title: '機能',
      routing: 'スマートルーティングシステム',
      template: 'マルチデバイステンプレート対応',
      engine: 'アプリケーションエンジン統合',
      deviceDetection: 'デバイスタイプ検出',
      notification: '通知システム',
      logging: 'ログ記録',
      i18n: '国際化サポート',
    },

    // メッセージ
    messages: {
      confirmLogout: 'ログアウトしてもよろしいですか？',
      logoutSuccess: 'ログアウト成功',
      pageRefreshed: 'ページが更新されました',
      languageChanged: '言語が変更されました',
      operationSuccess: '操作成功',
      operationFailed: '操作失敗',
      networkError: 'ネットワークエラー',
      serverError: 'サーバーエラー',
      unknownError: '不明なエラー',
    },

    // 時間関連
    time: {
      now: '今',
      today: '今日',
      yesterday: '昨日',
      tomorrow: '明日',
      thisWeek: '今週',
      lastWeek: '先週',
      thisMonth: '今月',
      lastMonth: '先月',
      thisYear: '今年',
      lastYear: '昨年',
    },
  },
}

// 导出应用语言包
export const appLocales = {
  'zh-CN': zhCN,
  en,
  ja,
}

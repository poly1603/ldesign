/**
 * Template System 内置国际化
 */

export interface TemplateLocale {
  title: string
  category: {
    login: string
    dashboard: string
    error: string
    profile: string
    settings: string
    [key: string]: string
  }
  device: {
    desktop: string
    tablet: string
    mobile: string
  }
  actions: {
    selectTemplate: string
    previewTemplate: string
    applyTemplate: string
    loadMore: string
    clearCache: string
    savePreference: string
  }
  messages: {
    loading: string
    noTemplates: string
    loadError: string
    applySuccess: string
    preferenceSaved: string
  }
}

export const zhCN: TemplateLocale = {
  title: '模板管理',
  category: {
    login: '登录',
    dashboard: '仪表盘',
    error: '错误页',
    profile: '个人中心',
    settings: '设置'
  },
  device: {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端'
  },
  actions: {
    selectTemplate: '选择模板',
    previewTemplate: '预览模板',
    applyTemplate: '应用模板',
    loadMore: '加载更多',
    clearCache: '清除缓存',
    savePreference: '保存偏好'
  },
  messages: {
    loading: '正在加载模板...',
    noTemplates: '暂无可用模板',
    loadError: '模板加载失败',
    applySuccess: '模板应用成功',
    preferenceSaved: '偏好设置已保存'
  }
}

export const enUS: TemplateLocale = {
  title: 'Template Management',
  category: {
    login: 'Login',
    dashboard: 'Dashboard',
    error: 'Error',
    profile: 'Profile',
    settings: 'Settings'
  },
  device: {
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile'
  },
  actions: {
    selectTemplate: 'Select Template',
    previewTemplate: 'Preview Template',
    applyTemplate: 'Apply Template',
    loadMore: 'Load More',
    clearCache: 'Clear Cache',
    savePreference: 'Save Preference'
  },
  messages: {
    loading: 'Loading templates...',
    noTemplates: 'No templates available',
    loadError: 'Failed to load template',
    applySuccess: 'Template applied successfully',
    preferenceSaved: 'Preference saved'
  }
}

// 其他语言包可以按需添加
export const jaJP: TemplateLocale = {
  title: 'テンプレート管理',
  category: {
    login: 'ログイン',
    dashboard: 'ダッシュボード',
    error: 'エラー',
    profile: 'プロファイル',
    settings: '設定'
  },
  device: {
    desktop: 'デスクトップ',
    tablet: 'タブレット',
    mobile: 'モバイル'
  },
  actions: {
    selectTemplate: 'テンプレートを選択',
    previewTemplate: 'プレビュー',
    applyTemplate: 'テンプレートを適用',
    loadMore: 'もっと読み込む',
    clearCache: 'キャッシュをクリア',
    savePreference: '設定を保存'
  },
  messages: {
    loading: 'テンプレートを読み込み中...',
    noTemplates: 'テンプレートがありません',
    loadError: 'テンプレートの読み込みに失敗しました',
    applySuccess: 'テンプレートが正常に適用されました',
    preferenceSaved: '設定が保存されました'
  }
}

// 语言映射
export const locales: Record<string, TemplateLocale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP
}

// 获取语言包
export function getLocale(locale: string): TemplateLocale {
  return locales[locale] || enUS
}

// 支持的语言列表
export const supportedLocales = Object.keys(locales)

// 语言键类型
export type LocaleKey = keyof typeof locales
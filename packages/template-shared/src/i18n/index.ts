/**
 * 国际化模块
 * 跨框架共享的语言包结构定义
 */

/**
 * 语言包键类型
 */
export type LocaleKey =
  | 'common.confirm'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.add'
  | 'common.search'
  | 'common.reset'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.warning'
  | 'common.info'
  | 'common.close'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.submit'
  | 'common.upload'
  | 'common.download'
  | 'template.loading'
  | 'template.error'
  | 'template.notFound'
  | 'template.selectTemplate'
  | 'template.defaultTemplate'
  | 'template.customTemplate'
  | 'template.preview'
  | 'template.apply'
  | 'template.category'
  | 'template.device'
  | 'template.version'
  | 'template.author'
  | 'template.description'
  | 'template.lastModified'
  | 'error.loadFailed'
  | 'error.networkError'
  | 'error.timeout'
  | 'error.invalidData'
  | 'error.permissionDenied'
  | 'error.versionMismatch'
  | 'error.dependencyMissing'

/**
 * 语言包接口
 */
export interface TemplateLocale {
  common: {
    confirm: string
    cancel: string
    save: string
    delete: string
    edit: string
    add: string
    search: string
    reset: string
    loading: string
    error: string
    success: string
    warning: string
    info: string
    close: string
    back: string
    next: string
    previous: string
    submit: string
    upload: string
    download: string
  }
  template: {
    loading: string
    error: string
    notFound: string
    selectTemplate: string
    defaultTemplate: string
    customTemplate: string
    preview: string
    apply: string
    category: string
    device: string
    version: string
    author: string
    description: string
    lastModified: string
  }
  error: {
    loadFailed: string
    networkError: string
    timeout: string
    invalidData: string
    permissionDenied: string
    versionMismatch: string
    dependencyMissing: string
  }
}

/**
 * 英文语言包
 */
export const enUS: TemplateLocale = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    upload: 'Upload',
    download: 'Download',
  },
  template: {
    loading: 'Loading template...',
    error: 'Failed to load template',
    notFound: 'Template not found',
    selectTemplate: 'Select Template',
    defaultTemplate: 'Default Template',
    customTemplate: 'Custom Template',
    preview: 'Preview',
    apply: 'Apply',
    category: 'Category',
    device: 'Device',
    version: 'Version',
    author: 'Author',
    description: 'Description',
    lastModified: 'Last Modified',
  },
  error: {
    loadFailed: 'Failed to load resource',
    networkError: 'Network error occurred',
    timeout: 'Request timeout',
    invalidData: 'Invalid data format',
    permissionDenied: 'Permission denied',
    versionMismatch: 'Version mismatch',
    dependencyMissing: 'Required dependency missing',
  },
}

/**
 * 中文语言包
 */
export const zhCN: TemplateLocale = {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    reset: '重置',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    upload: '上传',
    download: '下载',
  },
  template: {
    loading: '正在加载模板...',
    error: '模板加载失败',
    notFound: '未找到模板',
    selectTemplate: '选择模板',
    defaultTemplate: '默认模板',
    customTemplate: '自定义模板',
    preview: '预览',
    apply: '应用',
    category: '分类',
    device: '设备',
    version: '版本',
    author: '作者',
    description: '描述',
    lastModified: '最后修改',
  },
  error: {
    loadFailed: '资源加载失败',
    networkError: '网络错误',
    timeout: '请求超时',
    invalidData: '数据格式无效',
    permissionDenied: '权限不足',
    versionMismatch: '版本不匹配',
    dependencyMissing: '缺少必要的依赖',
  },
}

/**
 * 日文语言包
 */
export const jaJP: TemplateLocale = {
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    add: '追加',
    search: '検索',
    reset: 'リセット',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    warning: '警告',
    info: '情報',
    close: '閉じる',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    submit: '送信',
    upload: 'アップロード',
    download: 'ダウンロード',
  },
  template: {
    loading: 'テンプレートを読み込んでいます...',
    error: 'テンプレートの読み込みに失敗しました',
    notFound: 'テンプレートが見つかりません',
    selectTemplate: 'テンプレートを選択',
    defaultTemplate: 'デフォルトテンプレート',
    customTemplate: 'カスタムテンプレート',
    preview: 'プレビュー',
    apply: '適用',
    category: 'カテゴリー',
    device: 'デバイス',
    version: 'バージョン',
    author: '作成者',
    description: '説明',
    lastModified: '最終更新',
  },
  error: {
    loadFailed: 'リソースの読み込みに失敗しました',
    networkError: 'ネットワークエラーが発生しました',
    timeout: 'リクエストタイムアウト',
    invalidData: '無効なデータ形式',
    permissionDenied: '権限がありません',
    versionMismatch: 'バージョンが一致しません',
    dependencyMissing: '必要な依存関係がありません',
  },
}

/**
 * 支持的语言列表
 */
export const supportedLocales = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'ja-JP': jaJP,
} as const

/**
 * 默认语言
 */
export const defaultLocale = 'en-US'

/**
 * 获取语言包
 */
export function getLocale(locale: string): TemplateLocale {
  return (supportedLocales as any)[locale] || supportedLocales[defaultLocale]
}

/**
 * 格式化消息
 */
export function formatMessage(
  locale: TemplateLocale,
  key: LocaleKey,
  params?: Record<string, any>
): string {
  const keys = key.split('.')
  let value: any = locale

  for (const k of keys) {
    value = value?.[k]
  }

  if (typeof value !== 'string') {
    return key
  }

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, key) => params[key] || '')
  }

  return value
}

export default {}

/**
 * 国际化（i18n）系统
 * 支持多语言切换和动态加载
 */

import { EventEmitter } from '../core/EventEmitter'

export interface I18nConfig {
  defaultLocale: string
  fallbackLocale: string
  messages: Record<string, LocaleMessages>
}

export interface LocaleMessages {
  [key: string]: string | LocaleMessages
}

export class I18nManager extends EventEmitter {
  private currentLocale: string
  private fallbackLocale: string
  private messages: Map<string, LocaleMessages> = new Map()
  private loadedLocales: Set<string> = new Set()

  constructor(config?: Partial<I18nConfig>) {
    super()
    this.currentLocale = config?.defaultLocale || 'zh-CN'
    this.fallbackLocale = config?.fallbackLocale || 'en-US'
    
    if (config?.messages) {
      Object.entries(config.messages).forEach(([locale, messages]) => {
        this.addMessages(locale, messages)
      })
    }
    
    // 加载默认语言包
    this.loadBuiltinLocales()
  }

  /**
   * 加载内置语言包
   */
  private loadBuiltinLocales() {
    // 中文
    this.addMessages('zh-CN', {
      editor: {
        toolbar: {
          bold: '加粗',
          italic: '斜体',
          underline: '下划线',
          strikethrough: '删除线',
          heading: '标题',
          paragraph: '段落',
          blockquote: '引用',
          codeBlock: '代码块',
          bulletList: '无序列表',
          orderedList: '有序列表',
          taskList: '任务列表',
          link: '链接',
          image: '图片',
          video: '视频',
          table: '表格',
          horizontalRule: '分割线',
          undo: '撤销',
          redo: '重做',
          alignLeft: '左对齐',
          alignCenter: '居中对齐',
          alignRight: '右对齐',
          alignJustify: '两端对齐',
          indent: '增加缩进',
          outdent: '减少缩进',
          textColor: '文字颜色',
          backgroundColor: '背景颜色',
          fontSize: '字号',
          fontFamily: '字体',
          lineHeight: '行高',
          fullscreen: '全屏',
          findReplace: '查找替换',
          ai: 'AI 助手',
          template: '模板',
          export: '导出',
          print: '打印',
          help: '帮助'
        },
        dialog: {
          confirm: '确定',
          cancel: '取消',
          close: '关闭',
          save: '保存',
          delete: '删除',
          edit: '编辑',
          insert: '插入',
          upload: '上传',
          browse: '浏览'
        },
        placeholder: {
          search: '搜索...',
          find: '查找内容',
          replace: '替换为',
          url: '输入链接地址',
          imageUrl: '输入图片地址',
          videoUrl: '输入视频地址',
          altText: '替代文本',
          title: '标题',
          width: '宽度',
          height: '高度'
        },
        message: {
          success: '操作成功',
          error: '操作失败',
          warning: '警告',
          info: '提示',
          loading: '加载中...',
          copySuccess: '已复制到剪贴板',
          copyError: '复制失败',
          saveSuccess: '保存成功',
          saveError: '保存失败',
          deleteConfirm: '确定要删除吗？',
          unsavedChanges: '有未保存的更改，是否继续？'
        },
        ai: {
          title: 'AI 助手',
          optimize: '优化文本',
          translate: '翻译',
          summarize: '总结',
          expand: '扩写',
          shorten: '缩写',
          fixGrammar: '修正语法',
          changeTone: '改变语气',
          generateIdeas: '生成创意',
          loading: 'AI 正在思考...',
          error: 'AI 服务出错'
        }
      }
    })

    // 英文
    this.addMessages('en-US', {
      editor: {
        toolbar: {
          bold: 'Bold',
          italic: 'Italic',
          underline: 'Underline',
          strikethrough: 'Strikethrough',
          heading: 'Heading',
          paragraph: 'Paragraph',
          blockquote: 'Blockquote',
          codeBlock: 'Code Block',
          bulletList: 'Bullet List',
          orderedList: 'Ordered List',
          taskList: 'Task List',
          link: 'Link',
          image: 'Image',
          video: 'Video',
          table: 'Table',
          horizontalRule: 'Horizontal Rule',
          undo: 'Undo',
          redo: 'Redo',
          alignLeft: 'Align Left',
          alignCenter: 'Align Center',
          alignRight: 'Align Right',
          alignJustify: 'Justify',
          indent: 'Indent',
          outdent: 'Outdent',
          textColor: 'Text Color',
          backgroundColor: 'Background Color',
          fontSize: 'Font Size',
          fontFamily: 'Font Family',
          lineHeight: 'Line Height',
          fullscreen: 'Fullscreen',
          findReplace: 'Find & Replace',
          ai: 'AI Assistant',
          template: 'Template',
          export: 'Export',
          print: 'Print',
          help: 'Help'
        },
        dialog: {
          confirm: 'OK',
          cancel: 'Cancel',
          close: 'Close',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          insert: 'Insert',
          upload: 'Upload',
          browse: 'Browse'
        },
        placeholder: {
          search: 'Search...',
          find: 'Find',
          replace: 'Replace with',
          url: 'Enter URL',
          imageUrl: 'Enter image URL',
          videoUrl: 'Enter video URL',
          altText: 'Alt text',
          title: 'Title',
          width: 'Width',
          height: 'Height'
        },
        message: {
          success: 'Success',
          error: 'Error',
          warning: 'Warning',
          info: 'Info',
          loading: 'Loading...',
          copySuccess: 'Copied to clipboard',
          copyError: 'Failed to copy',
          saveSuccess: 'Saved successfully',
          saveError: 'Failed to save',
          deleteConfirm: 'Are you sure to delete?',
          unsavedChanges: 'You have unsaved changes. Continue?'
        },
        ai: {
          title: 'AI Assistant',
          optimize: 'Optimize Text',
          translate: 'Translate',
          summarize: 'Summarize',
          expand: 'Expand',
          shorten: 'Shorten',
          fixGrammar: 'Fix Grammar',
          changeTone: 'Change Tone',
          generateIdeas: 'Generate Ideas',
          loading: 'AI is thinking...',
          error: 'AI service error'
        }
      }
    })

    // 日文
    this.addMessages('ja-JP', {
      editor: {
        toolbar: {
          bold: '太字',
          italic: '斜体',
          underline: '下線',
          strikethrough: '取り消し線',
          heading: '見出し',
          paragraph: '段落',
          blockquote: '引用',
          codeBlock: 'コードブロック',
          bulletList: '箇条書き',
          orderedList: '番号付きリスト',
          taskList: 'タスクリスト',
          link: 'リンク',
          image: '画像',
          video: '動画',
          table: '表',
          horizontalRule: '水平線',
          undo: '元に戻す',
          redo: 'やり直す',
          alignLeft: '左揃え',
          alignCenter: '中央揃え',
          alignRight: '右揃え',
          alignJustify: '両端揃え',
          indent: 'インデント',
          outdent: 'インデント解除',
          textColor: '文字色',
          backgroundColor: '背景色',
          fontSize: 'フォントサイズ',
          fontFamily: 'フォント',
          lineHeight: '行の高さ',
          fullscreen: '全画面',
          findReplace: '検索と置換',
          ai: 'AIアシスタント',
          template: 'テンプレート',
          export: 'エクスポート',
          print: '印刷',
          help: 'ヘルプ'
        },
        dialog: {
          confirm: 'OK',
          cancel: 'キャンセル',
          close: '閉じる',
          save: '保存',
          delete: '削除',
          edit: '編集',
          insert: '挿入',
          upload: 'アップロード',
          browse: '参照'
        },
        placeholder: {
          search: '検索...',
          find: '検索',
          replace: '置換',
          url: 'URLを入力',
          imageUrl: '画像URLを入力',
          videoUrl: '動画URLを入力',
          altText: '代替テキスト',
          title: 'タイトル',
          width: '幅',
          height: '高さ'
        },
        message: {
          success: '成功',
          error: 'エラー',
          warning: '警告',
          info: '情報',
          loading: '読み込み中...',
          copySuccess: 'クリップボードにコピーしました',
          copyError: 'コピーに失敗しました',
          saveSuccess: '保存しました',
          saveError: '保存に失敗しました',
          deleteConfirm: '削除してもよろしいですか？',
          unsavedChanges: '未保存の変更があります。続行しますか？'
        },
        ai: {
          title: 'AIアシスタント',
          optimize: 'テキストを最適化',
          translate: '翻訳',
          summarize: '要約',
          expand: '拡張',
          shorten: '短縮',
          fixGrammar: '文法を修正',
          changeTone: 'トーンを変更',
          generateIdeas: 'アイデアを生成',
          loading: 'AIが考えています...',
          error: 'AIサービスエラー'
        }
      }
    })
  }

  /**
   * 添加语言包
   */
  addMessages(locale: string, messages: LocaleMessages) {
    this.messages.set(locale, messages)
    this.loadedLocales.add(locale)
  }

  /**
   * 动态加载语言包
   */
  async loadLocale(locale: string): Promise<void> {
    if (this.loadedLocales.has(locale)) {
      return
    }

    try {
      // 动态导入语言包
      const messages = await import(`./locales/${locale}.json`)
      this.addMessages(locale, messages.default)
    } catch (error) {
      console.error(`Failed to load locale: ${locale}`, error)
    }
  }

  /**
   * 切换语言
   */
  async setLocale(locale: string) {
    if (!this.loadedLocales.has(locale)) {
      await this.loadLocale(locale)
    }

    const oldLocale = this.currentLocale
    this.currentLocale = locale
    
    this.emit('localeChange', { oldLocale, newLocale: locale })
  }

  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.currentLocale
  }

  /**
   * 获取支持的语言列表
   */
  getAvailableLocales(): string[] {
    return Array.from(this.loadedLocales)
  }

  /**
   * 翻译文本
   */
  t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.')
    let message = this.getMessage(this.currentLocale, keys)

    if (!message && this.currentLocale !== this.fallbackLocale) {
      message = this.getMessage(this.fallbackLocale, keys)
    }

    if (!message) {
      return key
    }

    // 替换参数
    if (params && typeof message === 'string') {
      Object.entries(params).forEach(([param, value]) => {
        message = (message as string).replace(`{${param}}`, String(value))
      })
    }

    return message as string
  }

  /**
   * 获取消息
   */
  private getMessage(locale: string, keys: string[]): string | undefined {
    const messages = this.messages.get(locale)
    if (!messages) return undefined

    let current: any = messages
    for (const key of keys) {
      if (current[key] === undefined) {
        return undefined
      }
      current = current[key]
    }

    return typeof current === 'string' ? current : undefined
  }

  /**
   * 检查是否有某个翻译键
   */
  has(key: string): boolean {
    const keys = key.split('.')
    return !!this.getMessage(this.currentLocale, keys)
  }
}

// 单例实例
let i18nInstance: I18nManager | null = null

/**
 * 获取或创建 i18n 实例
 */
export function getI18n(config?: Partial<I18nConfig>): I18nManager {
  if (!i18nInstance) {
    i18nInstance = new I18nManager(config)
  }
  return i18nInstance
}

/**
 * 便捷翻译函数
 */
export function t(key: string, params?: Record<string, any>): string {
  return getI18n().t(key, params)
}

/**
 * 导出类型
 */
export type { I18nConfig, LocaleMessages }
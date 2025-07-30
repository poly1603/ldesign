import common from './common'
import validation from './validation'
import menu from './menu'
import date from './date'
import type { LanguagePackage } from '@/core/types'

/**
 * 中文语言包
 */
const zhCNLanguagePackage: LanguagePackage = {
  info: {
    name: '中文',
    nativeName: '中文（简体）',
    code: 'zh-CN',
    region: 'CN',
    direction: 'ltr',
    dateFormat: 'YYYY年M月D日',
  },
  translations: {
    common,
    validation,
    menu,
    date,
  },
}

export default zhCNLanguagePackage

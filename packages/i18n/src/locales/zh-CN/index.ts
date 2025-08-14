import type { LanguagePackage } from '../../core/types'

import common from './common'
import date from './date'
import menu from './menu'
import validation from './validation'

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

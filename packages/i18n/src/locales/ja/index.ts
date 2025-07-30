import type { LanguagePackage } from '@/core/types'
import common from './common'
import validation from './validation'
import menu from './menu'
import date from './date'

/**
 * 日语语言包
 */
const jaLanguagePackage: LanguagePackage = {
  info: {
    name: '日本語',
    nativeName: '日本語',
    code: 'ja',
    region: 'JP',
    direction: 'ltr',
    dateFormat: 'YYYY年M月D日'
  },
  translations: {
    common,
    validation,
    menu,
    date
  }
}

export default jaLanguagePackage

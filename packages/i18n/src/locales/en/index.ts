import type { LanguagePackage } from '@/core/types'

import common from './common'
import date from './date'
import menu from './menu'
import validation from './validation'

/**
 * 英语语言包
 */
const enLanguagePackage: LanguagePackage = {
  info: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    region: 'US',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
  },
  translations: {
    common,
    validation,
    menu,
    date,
  },
}

export default enLanguagePackage

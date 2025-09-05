import type { BuiltInLanguagePackage } from '../types'
import common from './common'
import validation from './validation'
import datetime from './datetime'
import error from './error'
import notification from './notification'
import ui from './ui'
import business from './business'

export const en: BuiltInLanguagePackage = {
  info: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    region: 'US',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    flag: '🇺🇸',
  },
  translations: {
    common,
    validation,
    datetime,
    error,
    notification,
    ui,
    business,
  },
}

export default en

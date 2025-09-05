import type { BuiltInLanguagePackage } from '../types'
import common from './common'
import validation from './validation'
import datetime from './datetime'
import error from './error'
import notification from './notification'
import ui from './ui'
import business from './business'

export const ja: BuiltInLanguagePackage = {
  info: {
    name: 'Japanese',
    nativeName: '日本語',
    code: 'ja',
    region: 'JP',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    flag: '🇯🇵',
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

export default ja

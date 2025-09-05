import type { BuiltInLanguagePackage } from '../types'
import common from './common'
import validation from './validation'
import datetime from './datetime'
import error from './error'
import notification from './notification'
import ui from './ui'
import business from './business'

export const ko: BuiltInLanguagePackage = {
  info: {
    name: 'Korean',
    nativeName: '한국어',
    code: 'ko',
    region: 'KR',
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
    flag: '🇰🇷',
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

export default ko

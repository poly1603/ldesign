import type { BuiltInLanguagePackage } from '../types'
import business from './business'
import common from './common'
import datetime from './datetime'
import error from './error'
import notification from './notification'
import ui from './ui'
import validation from './validation'

export const de: BuiltInLanguagePackage = {
  info: {
    name: 'German',
    nativeName: 'Deutsch',
    code: 'de',
    region: 'DE',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    flag: '🇩🇪',
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

export default de

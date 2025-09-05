import type { BuiltInLanguagePackage } from '../types'
import common from './common'
import validation from './validation'
import datetime from './datetime'
import error from './error'
import notification from './notification'
import ui from './ui'
import business from './business'

export const zhCN: BuiltInLanguagePackage = {
  info: {
    name: 'Chinese (Simplified)',
    nativeName: '中文（简体）',
    code: 'zh-CN',
    region: 'CN',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    flag: '🇨🇳',
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

export default zhCN

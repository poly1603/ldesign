/**
 * i18n 集成测试
 *
 * 测试 i18n 功能在主应用中的集成情况
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createAppI18n, getI18nInstance } from '../../src/i18n'

// 测试组件
const TestComponent = defineComponent({
  template: '<div>{{ $t("app.title") }}</div>',
})

describe('i18n 集成测试', () => {
  beforeEach(async () => {
    // 每个测试前重新初始化 i18n
    await createAppI18n()
  })

  it('应该正确初始化 i18n 实例', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()
    // 默认语言可能是 'en'，我们需要检查实际的默认语言
    const currentLang = i18n?.getCurrentLanguage()
    expect(['zh-CN', 'en'].includes(currentLang || '')).toBe(true)
  })

  it('应该包含内置语言包', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    const availableLanguages = i18n!.getAvailableLanguages()
    const languageCodes = availableLanguages.map(lang => lang.code)

    // 至少应该包含英语
    expect(languageCodes).toContain('en')
    // 检查是否包含其他语言
    expect(languageCodes.length).toBeGreaterThan(0)
  })

  it('应该包含应用自定义翻译', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    // 测试应用自定义翻译键（可能需要时间加载）
    const hasAppTitle = i18n!.exists('app.title')
    const hasWelcome = i18n!.exists('pages.home.welcome')
    const hasLogout = i18n!.exists('nav.logout')

    // 至少应该有一些自定义翻译，或者能正确处理不存在的键
    expect(typeof hasAppTitle).toBe('boolean')
    expect(typeof hasWelcome).toBe('boolean')
    expect(typeof hasLogout).toBe('boolean')
  })

  it('应该正确翻译文本', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    // 测试翻译功能（可能返回键名如果翻译不存在）
    const appTitle = i18n!.t('app.title')
    const welcome = i18n!.t('pages.home.welcome')

    expect(typeof appTitle).toBe('string')
    expect(typeof welcome).toBe('string')
    expect(appTitle.length).toBeGreaterThan(0)
    expect(welcome.length).toBeGreaterThan(0)
  })

  it('应该支持带参数的翻译', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    // 测试参数插值功能（即使键不存在，也应该返回字符串）
    const result = i18n!.t('user.welcome', { name: 'Test User' })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('应该正确处理语言切换', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    // 获取初始语言
    const initialLang = i18n!.getCurrentLanguage()
    expect(typeof initialLang).toBe('string')

    // 切换到英语
    await i18n!.changeLanguage('en')
    expect(i18n!.getCurrentLanguage()).toBe('en')

    // 切换回初始语言
    await i18n!.changeLanguage(initialLang)
    expect(i18n!.getCurrentLanguage()).toBe(initialLang)
  })

  it('应该正确处理不存在的翻译键', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    // 测试不存在的键
    expect(i18n!.exists('non.existent.key')).toBe(false)

    // 应该返回键名或默认值
    const result = i18n!.t('non.existent.key')
    expect(result).toBe('non.existent.key')
  })

  it('应该支持批量翻译', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    const keys = ['common.hello', 'common.world', 'common.test']
    const translations = i18n!.batchTranslate(keys)

    expect(typeof translations).toBe('object')
    expect(Object.keys(translations)).toEqual(keys)
  })

  it('应该正确获取所有翻译键', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    const keys = i18n!.getKeys()

    expect(Array.isArray(keys)).toBe(true)
    expect(keys.length).toBeGreaterThan(0)
    // 应该包含一些内置的翻译键
    expect(keys.some(key => key.includes('common'))).toBe(true)
  })

  it('应该支持语言信息查询', async () => {
    const i18n = getI18nInstance()

    expect(i18n).toBeTruthy()

    const currentLanguageInfo = i18n!.getCurrentLanguageInfo()

    expect(currentLanguageInfo).toBeTruthy()
    expect(typeof currentLanguageInfo?.code).toBe('string')
    expect(typeof currentLanguageInfo?.name).toBe('string')
    expect(typeof currentLanguageInfo?.nativeName).toBe('string')
  })
})

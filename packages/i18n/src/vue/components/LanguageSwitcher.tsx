/**
 * 语言切换器组件 (TSX版本)
 *
 * 提供语言切换功能的下拉选择组件
 */

import { computed, defineComponent, h, ref } from 'vue'
import { useI18n } from '../composables'
import type { LanguageInfo } from '../../core/types'

export default defineComponent({
  name: 'LanguageSwitcher',
  props: {
    /** UI模式：下拉菜单或对话框 */
    mode: {
      type: String as () => 'dropdown' | 'dialog',
      default: 'dropdown',
    },
    /** 是否显示国旗图标 */
    showFlag: {
      type: Boolean,
      default: true,
    },
    /** 是否显示语言代码 */
    showCode: {
      type: Boolean,
      default: false,
    },
    /** 是否禁用 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { locale, availableLanguages, changeLanguage } = useI18n()
    const isOpen = ref(false)
    const isChanging = ref(false)

    // 当前语言信息
    const currentLanguage = computed(() => {
      const languages = availableLanguages.value as LanguageInfo[]
      return languages.find((lang) => lang.code === locale.value) || {
        code: locale.value,
        name: locale.value,
        nativeName: locale.value,
        region: '',
        direction: 'ltr',
        dateFormat: 'YYYY-MM-DD',
      }
    })

    // 语言选项
    const languageOptions = computed(() => {
      const languages = availableLanguages.value as LanguageInfo[]
      return languages.map((lang) => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flag: getLanguageFlag(lang.code),
      }))
    })

    // 获取语言对应的国旗图标
    function getLanguageFlag(code: string): string {
      const flagMap: Record<string, string> = {
        'zh-CN': '🇨🇳',
        'zh-TW': '🇹🇼',
        'en': '🇺🇸',
        'en-US': '🇺🇸',
        'en-GB': '🇬🇧',
        'ja': '🇯🇵',
        'ko': '🇰🇷',
        'fr': '🇫🇷',
        'de': '🇩🇪',
        'es': '🇪🇸',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'ru': '🇷🇺',
        'ar': '🇸🇦',
        'hi': '🇮🇳',
        'th': '🇹🇭',
        'vi': '🇻🇳',
      }
      return flagMap[code] || '🌐'
    }

    // 切换语言
    async function handleLanguageChange(languageCode: string) {
      if (props.disabled || isChanging.value || languageCode === locale.value) {
        return
      }

      try {
        isChanging.value = true
        await changeLanguage(languageCode)
        close()
        console.warn(`🌐 语言已切换到: ${languageCode}`)
      }
      catch (error) {
        console.error('❌ 语言切换失败:', error)
      }
      finally {
        isChanging.value = false
      }
    }

    // 切换打开/关闭状态
    function toggle() {
      if (props.disabled || isChanging.value) {
        return
      }
      isOpen.value = !isOpen.value
    }

    // 关闭
    function close() {
      isOpen.value = false
    }

    // 键盘事件处理
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
      }
    }

    return () => {
      const triggerContent = [
        props.showFlag ? h('span', { class: 'language-flag' }, getLanguageFlag(locale.value)) : null,
        h('span', { class: 'language-name' }, currentLanguage.value.nativeName),
        props.showCode ? h('span', { class: 'language-code' }, `(${locale.value})`) : null,
        h('span', {
          class: ['language-arrow', { 'is-open': isOpen.value }],
        }, '▼'),
      ].filter(Boolean)

      const languageList = languageOptions.value.map((option) =>
        h('button', {
          key: option.code,
          class: [
            'language-option',
            { 'is-active': option.code === locale.value },
          ],
          disabled: props.disabled || isChanging.value,
          onClick: () => handleLanguageChange(option.code),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '8px 16px',
            border: 'none',
            background: option.code === locale.value ? '#eff6ff' : 'transparent',
            color: option.code === locale.value ? '#1d4ed8' : '#374151',
            fontSize: '14px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          },
          onMouseenter: (e: Event) => {
            if (option.code !== locale.value) {
              (e.target as HTMLElement).style.background = '#f3f4f6'
            }
          },
          onMouseleave: (e: Event) => {
            if (option.code !== locale.value) {
              (e.target as HTMLElement).style.background = 'transparent'
            }
          },
        }, [
          props.showFlag ? h('span', {
            class: 'language-flag',
            style: { fontSize: '16px', lineHeight: '1' }
          }, option.flag) : null,
          h('span', {
            class: 'language-info',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              flex: '1'
            }
          }, [
            h('span', {
              class: 'language-native',
              style: { fontWeight: '500', lineHeight: '1.2' }
            }, option.nativeName),
            h('span', {
              class: 'language-english',
              style: { fontSize: '12px', color: '#6b7280', lineHeight: '1.2' }
            }, option.name),
          ]),
          option.code === locale.value ? h('span', {
            class: 'language-check',
            style: { color: '#059669', fontWeight: '600' }
          }, '✓') : null,
        ].filter(Boolean)),
      )

      // 默认下拉模式
      return h('div', {
        class: ['language-switcher', 'language-switcher--dropdown'],
        onKeydown: handleKeydown,
        style: {
          position: 'relative',
          display: 'inline-block',
        }
      }, [
        h('button', {
          class: ['language-switcher__trigger', { 'is-disabled': props.disabled || isChanging.value }],
          disabled: props.disabled || isChanging.value,
          onClick: toggle,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '120px',
          }
        }, triggerContent),

        isOpen.value ? h('div', {
          class: 'language-switcher__dropdown',
          onClick: (e: Event) => e.stopPropagation(),
          style: {
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            zIndex: '1000',
            marginTop: '4px',
            padding: '4px 0',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxHeight: '300px',
            overflowY: 'auto',
          }
        }, languageList) : null,
      ])
    }
  },
})

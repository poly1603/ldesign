/**
 * 语言切换器组件
 *
 * 提供语言切换功能的下拉选择组件
 */

import { computed, defineComponent, ref } from 'vue'
import { useLanguageSwitcher } from '../composables'
import './LanguageSwitcher.less'

export default defineComponent({
  name: 'LanguageSwitcher',
  setup() {
    const { locale, availableLanguages, switchLanguage } = useLanguageSwitcher()
    const isOpen = ref(false)

    // 当前语言信息
    const currentLanguage = computed(() => {
      return availableLanguages.value.find(
        (lang: any) => lang.code === locale.value,
      )
    })

    // 语言选项
    const languageOptions = computed(() => {
      return availableLanguages.value.map((lang: any) => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flag: getLanguageFlag(lang.code),
      }))
    })

    // 获取语言对应的旗帜图标
    function getLanguageFlag(code: string): string {
      const flagMap: Record<string, string> = {
        'zh-CN': '🇨🇳',
        'en': '🇺🇸',
        'ja': '🇯🇵',
      }
      return flagMap[code] || '🌐'
    }

    // 切换语言
    async function handleLanguageChange(languageCode: string) {
      try {
        await switchLanguage(languageCode)
        isOpen.value = false
        console.log(`🌐 语言已切换到: ${languageCode}`)
      }
      catch (error) {
        console.error('❌ 语言切换失败:', error)
      }
    }

    // 切换下拉菜单
    function toggleDropdown() {
      isOpen.value = !isOpen.value
    }

    // 关闭下拉菜单
    function closeDropdown() {
      isOpen.value = false
    }

    return () => (
      <div class="language-switcher">
        <button
          class="language-switcher__trigger"
          onClick={toggleDropdown}
          onBlur={closeDropdown}
        >
          <span class="language-flag">{getLanguageFlag(locale.value)}</span>
          <span class="language-name">
            {currentLanguage.value?.nativeName || locale.value}
          </span>
          <span class={['language-arrow', { 'is-open': isOpen.value }]}>▼</span>
        </button>

        {isOpen.value && (
          <div class="language-switcher__dropdown">
            {languageOptions.value.map((option: any) => (
              <button
                key={option.code}
                class={[
                  'language-option',
                  { 'is-active': option.code === locale.value },
                ]}
                onClick={() => handleLanguageChange(option.code)}
              >
                <span class="language-flag">{option.flag}</span>
                <span class="language-info">
                  <span class="language-native">{option.nativeName}</span>
                  <span class="language-english">{option.name}</span>
                </span>
                {option.code === locale.value && (
                  <span class="language-check">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  },
})

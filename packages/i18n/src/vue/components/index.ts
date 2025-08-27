/**
 * Vue 组件导出
 */

import { defineComponent, ref, computed, getCurrentInstance, onMounted } from 'vue'

// 创建LanguageSwitcher组件
export const LanguageSwitcher = defineComponent({
  name: 'LanguageSwitcher',
  props: {
    locales: {
      type: Array,
      default: () => [
        { code: 'en', name: 'English' },
        { code: 'zh-CN', name: '中文' },
        { code: 'ja', name: '日本語' }
      ]
    }
  },
  setup(props) {
    // 当前语言
    const currentLocale = ref('zh-CN')

    // 获取Vue实例
    const instance = getCurrentInstance()

    onMounted(() => {
      // 从全局属性获取当前语言
      if (instance?.appContext.config.globalProperties.$i18n) {
        const i18n = instance.appContext.config.globalProperties.$i18n
        currentLocale.value = i18n.getCurrentLanguage()
      }
    })

    const availableLocales = computed(() => props.locales)

    const handleLanguageChange = async (event: Event) => {
      const target = event.target as HTMLSelectElement
      const locale = target.value

      // 通过全局属性切换语言
      if (instance?.appContext.config.globalProperties.$i18n) {
        const i18n = instance.appContext.config.globalProperties.$i18n
        await i18n.changeLanguage(locale)
        currentLocale.value = locale
        console.log('LanguageSwitcher: Language changed to:', locale)
      } else {
        console.warn('LanguageSwitcher: $i18n not found')
      }
    }

    return {
      currentLocale,
      availableLocales,
      handleLanguageChange
    }
  },
  template: `
    <div class="language-switcher">
      <select
        :value="currentLocale"
        @change="handleLanguageChange"
        class="language-select"
      >
        <option
          v-for="locale in availableLocales"
          :key="locale.code"
          :value="locale.code"
        >
          {{ locale.name }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: inline-block;
    }

    .language-select {
      padding: 4px 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }

    .language-select:hover {
      border-color: #999;
    }

    .language-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  `]
})

/**
 * 国际化 Composable
 */

import { ref, computed } from 'vue';
import { messages } from '../i18n';

const STORAGE_KEY = 'lowcode-locale';

/**
 * 支持的语言列表
 */
export type Locale = 'zh-CN' | 'en-US';

/**
 * 语言选项
 */
export interface LocaleOption {
  label: string;
  value: Locale;
}

/**
 * 可用的语言选项
 */
export const LOCALE_OPTIONS: LocaleOption[] = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
];

/**
 * 从 localStorage 加载语言配置
 */
function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'zh-CN' || stored === 'en-US')) {
      return stored as Locale;
    }
  } catch (error) {
    console.error('Failed to load locale:', error);
  }

  // 检测浏览器语言
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
}

/**
 * 保存语言配置到 localStorage
 */
function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch (error) {
    console.error('Failed to save locale:', error);
  }
}

// 全局语言状态
const currentLocale = ref<Locale>(loadLocale());

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // 返回 key 作为 fallback
    }
  }

  return typeof result === 'string' ? result : path;
}

/**
 * 使用国际化
 */
export function useI18n() {
  /**
   * 当前语言的消息对象
   */
  const currentMessages = computed(() => {
    return messages[currentLocale.value];
  });

  /**
   * 翻译函数
   * @param key - 翻译键，支持点号分隔的嵌套键，如 'editor.toolbar.save'
   * @param params - 可选的参数对象，用于替换翻译文本中的占位符
   */
  function t(key: string, params?: Record<string, any>): string {
    let text = getNestedValue(currentMessages.value, key);

    // 如果提供了参数，替换占位符
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }

    return text;
  }

  /**
   * 设置语言
   */
  function setLocale(locale: Locale) {
    currentLocale.value = locale;
    saveLocale(locale);
  }

  /**
   * 切换语言
   */
  function toggleLocale() {
    const newLocale = currentLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(newLocale);
  }

  return {
    // 状态
    locale: currentLocale,
    localeOptions: LOCALE_OPTIONS,
    messages: currentMessages,

    // 方法
    t,
    setLocale,
    toggleLocale
  };
}



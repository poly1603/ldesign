/**
 * Vue I18n 组件
 * 提供声明式的国际化组件
 */

import { computed, defineComponent, h, type PropType } from 'vue'
import { useI18n } from './plugin'

/**
 * I18nT 组件 - 用于翻译文本
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <I18nT keypath="hello" />
 *
 *   <!-- 带参数 -->
 *   <I18nT keypath="welcome" :params="{ name: 'John' }" />
 *
 *   <!-- 指定标签 -->
 *   <I18nT keypath="title" tag="h1" />
 *
 *   <!-- 带插槽 -->
 *   <I18nT keypath="message">
 *     <template #name>
 *       <strong>John</strong>
 *     </template>
 *   </I18nT>
 * </template>
 * ```
 */
export const I18nT = defineComponent({
  name: 'I18nT',
  props: {
    /**
     * 翻译键路径
     */
    keypath: {
      type: String,
      required: true,
    },
    /**
     * 翻译参数
     */
    params: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
    /**
     * 渲染的 HTML 标签
     */
    tag: {
      type: String,
      default: 'span',
    },
    /**
     * 指定语言（可选）
     */
    locale: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const { t } = useI18n()

    // 计算翻译结果
    const translatedText = computed(() => {
      return t(props.keypath, props.params)
    })

    return () => {
      // 如果有插槽，处理插槽内容
      if (slots.default) {
        // 简单的插槽处理，实际项目中可能需要更复杂的插值处理
        return h(props.tag, {}, slots.default())
      }

      // 渲染翻译文本
      return h(props.tag, {}, translatedText.value)
    }
  },
})

/**
 * I18nN 组件 - 用于数字格式化
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 基础数字格式化 -->
 *   <I18nN :value="1234.56" />
 *
 *   <!-- 货币格式化 -->
 *   <I18nN :value="1234.56" format="currency" currency="USD" />
 *
 *   <!-- 百分比格式化 -->
 *   <I18nN :value="0.85" format="percent" />
 * </template>
 * ```
 */
export const I18nN = defineComponent({
  name: 'I18nN',
  props: {
    /**
     * 要格式化的数值
     */
    value: {
      type: Number,
      required: true,
    },
    /**
     * 格式化类型
     */
    format: {
      type: String as PropType<'number' | 'currency' | 'percent'>,
      default: 'number',
    },
    /**
     * 货币代码（当 format 为 currency 时使用）
     */
    currency: {
      type: String,
      default: 'USD',
    },
    /**
     * 渲染的 HTML 标签
     */
    tag: {
      type: String,
      default: 'span',
    },
    /**
     * 指定语言（可选）
     */
    locale: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const { locale } = useI18n()

    // 计算格式化结果
    const formattedValue = computed(() => {
      const currentLocale = props.locale || locale.value

      try {
        switch (props.format) {
          case 'currency':
            return new Intl.NumberFormat(currentLocale, {
              style: 'currency',
              currency: props.currency,
            }).format(props.value)

          case 'percent':
            return new Intl.NumberFormat(currentLocale, {
              style: 'percent',
            }).format(props.value)

          default:
            return new Intl.NumberFormat(currentLocale).format(props.value)
        }
      }
      catch (error) {
        console.warn('数字格式化失败:', error)
        return props.value.toString()
      }
    })

    return () => {
      return h(props.tag, {}, formattedValue.value)
    }
  },
})

/**
 * I18nD 组件 - 用于日期时间格式化
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 基础日期格式化 -->
 *   <I18nD :value="new Date()" />
 *
 *   <!-- 自定义格式 -->
 *   <I18nD :value="new Date()" format="long" />
 *
 *   <!-- 时间格式化 -->
 *   <I18nD :value="new Date()" format="time" />
 * </template>
 * ```
 */
export const I18nD = defineComponent({
  name: 'I18nD',
  props: {
    /**
     * 要格式化的日期
     */
    value: {
      type: [Date, String, Number] as PropType<Date | string | number>,
      required: true,
    },
    /**
     * 格式化类型
     */
    format: {
      type: String as PropType<'short' | 'medium' | 'long' | 'full' | 'time'>,
      default: 'medium',
    },
    /**
     * 渲染的 HTML 标签
     */
    tag: {
      type: String,
      default: 'span',
    },
    /**
     * 指定语言（可选）
     */
    locale: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const { locale } = useI18n()

    // 计算格式化结果
    const formattedValue = computed(() => {
      const currentLocale = props.locale || locale.value
      const date = new Date(props.value)

      try {
        if (props.format === 'time') {
          return new Intl.DateTimeFormat(currentLocale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(date)
        }

        const dateStyle = props.format as 'short' | 'medium' | 'long' | 'full'
        return new Intl.DateTimeFormat(currentLocale, {
          dateStyle,
        }).format(date)
      }
      catch (error) {
        console.warn('日期格式化失败:', error)
        return date.toString()
      }
    })

    return () => {
      return h(props.tag, {}, formattedValue.value)
    }
  },
})

/**
 * 默认导出所有组件
 */
export default {
  I18nT,
  I18nN,
  I18nD,
}

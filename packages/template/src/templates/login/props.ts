import type { PropType } from 'vue'
import type { LoginTemplateProps } from './type'

export default {
  title: {
    type: String as PropType<LoginTemplateProps['title']>,
    default: '系统',
  },
  loginPanel: {
    type: [Function, Boolean] as PropType<LoginTemplateProps['loginPanel']>,
    default: true,
  },
}

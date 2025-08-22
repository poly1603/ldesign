import type { PropType } from 'vue'
import type { LoginTemplateProps } from './type'

export default {
  loginPanel: {
    type: [Function, Boolean] as PropType<LoginTemplateProps['loginPanel']>,
    default: true,
  },
}

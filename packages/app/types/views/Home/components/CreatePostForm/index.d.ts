import { JSX } from '../../../../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import * as vue from 'vue'
import { PropType } from 'vue'
import { NewPost } from '../../types/index.js'

interface CreatePostFormProps {
  newPost: NewPost
  loading: boolean
  onUpdatePost: (post: NewPost) => void
  onCreatePost: () => void
}
declare const _default: vue.DefineComponent<
  vue.ExtractPropTypes<{
    newPost: {
      type: PropType<NewPost>
      required: true
    }
    loading: {
      type: BooleanConstructor
      default: boolean
    }
    onUpdatePost: {
      type: PropType<(post: NewPost) => void>
      required: true
    }
    onCreatePost: {
      type: PropType<() => void>
      required: true
    }
  }>,
  () => JSX.Element,
  {},
  {},
  {},
  vue.ComponentOptionsMixin,
  vue.ComponentOptionsMixin,
  {},
  string,
  vue.PublicProps,
  Readonly<
    vue.ExtractPropTypes<{
      newPost: {
        type: PropType<NewPost>
        required: true
      }
      loading: {
        type: BooleanConstructor
        default: boolean
      }
      onUpdatePost: {
        type: PropType<(post: NewPost) => void>
        required: true
      }
      onCreatePost: {
        type: PropType<() => void>
        required: true
      }
    }>
  > &
    Readonly<{}>,
  {
    loading: boolean
  },
  {},
  {},
  {},
  string,
  vue.ComponentProvideOptions,
  true,
  {},
  any
>

export { _default as default }
export type { CreatePostFormProps }

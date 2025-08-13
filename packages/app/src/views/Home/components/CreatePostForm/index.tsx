import type { NewPost } from '../../types'
import { computed, defineComponent, type PropType, ref } from 'vue'
import './CreatePostForm.less'

export interface CreatePostFormProps {
  newPost: NewPost
  loading: boolean
  onUpdatePost: (post: NewPost) => void
  onCreatePost: () => void
}

export default defineComponent({
  name: 'CreatePostForm',
  props: {
    newPost: {
      type: Object as PropType<NewPost>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    onUpdatePost: {
      type: Function as PropType<(post: NewPost) => void>,
      required: true,
    },
    onCreatePost: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    const titleRef = ref<HTMLInputElement>()
    const bodyRef = ref<HTMLTextAreaElement>()

    // 表单验证
    const isValid = computed(() => {
      return (
        props.newPost.title.trim().length > 0 &&
        props.newPost.body.trim().length > 0
      )
    })

    // 字符计数
    const titleLength = computed(() => props.newPost.title.length)
    const bodyLength = computed(() => props.newPost.body.length)

    const handleTitleChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      props.onUpdatePost({
        ...props.newPost,
        title: target.value,
      })
    }

    const handleBodyChange = (e: Event) => {
      const target = e.target as HTMLTextAreaElement
      props.onUpdatePost({
        ...props.newPost,
        body: target.value,
      })
    }

    const handleSubmit = (e: Event) => {
      e.preventDefault()
      if (isValid.value && !props.loading) {
        props.onCreatePost()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter 提交表单
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit(e)
      }
    }

    return () => (
      <div class='create-post-form'>
        <div class='form-header'>
          <h4 class='form-title'>
            <span class='title-icon'>✍️</span>
            创建新文章
          </h4>
          <div class='form-status'>
            {props.loading && (
              <div class='loading-indicator'>
                <div class='loading-spinner'></div>
                <span>创建中...</span>
              </div>
            )}
          </div>
        </div>

        <form class='form-content' onSubmit={handleSubmit}>
          <div class='form-group'>
            <label class='form-label' for='post-title'>
              <span class='label-icon'>📝</span>
              文章标题
              <span class='char-count'>
                {titleLength.value}
                /100
              </span>
            </label>
            <input
              ref={titleRef}
              id='post-title'
              type='text'
              class='form-input'
              placeholder='请输入文章标题...'
              value={props.newPost.title}
              onInput={handleTitleChange}
              onKeydown={handleKeyDown}
              maxlength={100}
              disabled={props.loading}
            />
          </div>

          <div class='form-group'>
            <label class='form-label' for='post-body'>
              <span class='label-icon'>📄</span>
              文章内容
              <span class='char-count'>
                {bodyLength.value}
                /500
              </span>
            </label>
            <textarea
              ref={bodyRef}
              id='post-body'
              class='form-textarea'
              placeholder='请输入文章内容...'
              value={props.newPost.body}
              onInput={handleBodyChange}
              onKeydown={handleKeyDown}
              maxlength={500}
              rows={4}
              disabled={props.loading}
            />
          </div>

          <div class='form-actions'>
            <button
              type='submit'
              class={[
                'form-submit',
                { disabled: !isValid.value || props.loading },
              ]}
              disabled={!isValid.value || props.loading}
            >
              <span class='btn-icon'>{props.loading ? '⏳' : '🚀'}</span>
              <span class='btn-text'>
                {props.loading ? '创建中...' : '创建文章'}
              </span>
            </button>

            <div class='form-hint'>
              <span class='hint-icon'>💡</span>
              <span class='hint-text'>
                提示：使用 Ctrl/Cmd + Enter 快速提交
              </span>
            </div>
          </div>
        </form>
      </div>
    )
  },
})

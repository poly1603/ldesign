import { ref, defineComponent, h, onMounted } from 'vue'
import { createCaptcha, validateCaptcha, type CaptchaData } from '../utils/captcha'

export interface CaptchaComponentProps {
  modelValue?: string
  placeholder?: string
  required?: boolean
  class?: string
}

export interface CaptchaComponentEmits {
  'update:modelValue': [value: string]
  'validate': [isValid: boolean]
}

/**
 * 验证码组件
 */
export const CaptchaComponent = defineComponent<CaptchaComponentProps, CaptchaComponentEmits>({
  name: 'CaptchaComponent',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入验证码'
    },
    required: {
      type: Boolean,
      default: true
    },
    class: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'validate'],
  setup(props, { emit }) {
    const captchaData = ref<CaptchaData | null>(null)
    const userInput = ref(props.modelValue || '')
    const isValid = ref(false)

    // 生成新的验证码
    const refreshCaptcha = () => {
      captchaData.value = createCaptcha()
      userInput.value = ''
      isValid.value = false
      emit('update:modelValue', '')
      emit('validate', false)
    }

    // 验证用户输入
    const validateInput = () => {
      if (!captchaData.value) return false
      
      const valid = validateCaptcha(userInput.value, captchaData.value.code)
      isValid.value = valid
      emit('validate', valid)
      return valid
    }

    // 处理输入变化
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      userInput.value = target.value
      emit('update:modelValue', target.value)
      
      // 实时验证
      if (target.value.length >= 4) {
        validateInput()
      } else {
        isValid.value = false
        emit('validate', false)
      }
    }

    // 初始化
    onMounted(() => {
      refreshCaptcha()
    })

    return () => h('div', { class: `captcha-component ${props.class}` }, [
      // 验证码图片区域
      h('div', { class: 'captcha-image-container' }, [
        captchaData.value ? h('img', {
          src: captchaData.value.imageData,
          alt: '验证码',
          class: 'captcha-image',
          onClick: refreshCaptcha,
          title: '点击刷新验证码'
        }) : h('div', { class: 'captcha-loading' }, '生成中...'),
        
        h('button', {
          type: 'button',
          class: 'captcha-refresh-btn',
          onClick: refreshCaptcha,
          title: '刷新验证码'
        }, '🔄')
      ]),
      
      // 验证码输入框
      h('div', { class: 'captcha-input-container' }, [
        h('input', {
          type: 'text',
          value: userInput.value,
          placeholder: props.placeholder,
          class: `captcha-input ${isValid.value ? 'valid' : ''} ${userInput.value && !isValid.value ? 'invalid' : ''}`,
          maxlength: 4,
          onInput: handleInput,
          required: props.required,
          autocomplete: 'off'
        }),
        
        // 验证状态指示器
        userInput.value ? h('span', {
          class: `captcha-status ${isValid.value ? 'valid' : 'invalid'}`
        }, isValid.value ? '✓' : '✗') : null
      ])
    ])
  }
})

export default CaptchaComponent

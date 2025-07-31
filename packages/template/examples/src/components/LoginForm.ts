import { ref, defineComponent, h } from 'vue'
import { CaptchaComponent } from './CaptchaComponent'

export interface LoginFormProps {
  class?: string
  variant?: 'classic' | 'modern' | 'tablet' | 'mobile' | 'card'
}

export interface LoginFormEmits {
  'login': [data: any]
}

/**
 * 通用登录表单组件
 */
export const LoginForm = defineComponent<LoginFormProps, LoginFormEmits>({
  name: 'LoginForm',
  props: {
    class: {
      type: String,
      default: ''
    },
    variant: {
      type: String as () => 'classic' | 'modern' | 'tablet' | 'mobile' | 'card',
      default: 'classic'
    }
  },
  emits: ['login'],
  setup(props, { emit }) {
    const loginType = ref<'username' | 'phone'>('username')
    const form = ref({ 
      username: '', 
      phone: '', 
      password: '', 
      captcha: '' 
    })
    const captchaValid = ref(false)

    const handleSubmit = () => {
      const account = loginType.value === 'username' ? form.value.username : form.value.phone
      
      if (!account || !form.value.password) {
        alert('请输入账号和密码')
        return
      }
      
      if (!captchaValid.value) {
        alert('请输入正确的验证码')
        return
      }
      
      emit('login', { 
        type: loginType.value,
        account,
        password: form.value.password 
      })
    }

    const validatePhone = (phone: string) => {
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(phone)
    }

    return () => h('div', { class: `login-form-wrapper ${props.class}` }, [
      // 登录方式切换
      h('div', { class: 'login-type-switch' }, [
        h('button', {
          class: `type-btn ${loginType.value === 'username' ? 'active' : ''}`,
          onClick: () => loginType.value = 'username'
        }, '用户名登录'),
        h('button', {
          class: `type-btn ${loginType.value === 'phone' ? 'active' : ''}`,
          onClick: () => loginType.value = 'phone'
        }, '手机号登录')
      ]),
      
      h('form', {
        class: 'login-form',
        onSubmit: (e: Event) => {
          e.preventDefault()
          handleSubmit()
        }
      }, [
        // 账号输入
        h('div', { class: 'form-group' }, [
          h('label', loginType.value === 'username' ? '用户名' : '手机号'),
          h('input', {
            class: `form-input ${props.variant} ${loginType.value === 'phone' && form.value.phone && !validatePhone(form.value.phone) ? 'invalid' : ''}`,
            type: loginType.value === 'phone' ? 'tel' : 'text',
            placeholder: loginType.value === 'username' ? '请输入用户名' : '请输入手机号',
            value: loginType.value === 'username' ? form.value.username : form.value.phone,
            onInput: (e: any) => {
              if (loginType.value === 'username') {
                form.value.username = e.target.value
              } else {
                form.value.phone = e.target.value
              }
            }
          })
        ]),
        
        // 密码输入
        h('div', { class: 'form-group' }, [
          h('label', '密码'),
          h('input', {
            class: `form-input ${props.variant}`,
            type: 'password',
            placeholder: '请输入密码',
            value: form.value.password,
            onInput: (e: any) => form.value.password = e.target.value
          })
        ]),
        
        // 验证码
        h('div', { class: 'form-group' }, [
          h('label', '验证码'),
          h(CaptchaComponent, {
            modelValue: form.value.captcha,
            'onUpdate:modelValue': (value: string) => form.value.captcha = value,
            onValidate: (valid: boolean) => captchaValid.value = valid,
            class: 'form-captcha'
          })
        ]),
        
        h('button', {
          class: `login-btn ${props.variant}`,
          type: 'submit'
        }, '登录')
      ]),
      
      // 第三方登录
      h('div', { class: 'third-party-login' }, [
        h('div', { class: 'divider' }, [
          h('span', '或使用以下方式登录')
        ]),
        h('div', { class: 'third-party-buttons' }, [
          h('button', { class: 'third-party-btn wechat' }, [
            h('span', { class: 'icon' }, '💬'),
            h('span', '微信')
          ]),
          h('button', { class: 'third-party-btn qq' }, [
            h('span', { class: 'icon' }, '🐧'),
            h('span', 'QQ')
          ]),
          h('button', { class: 'third-party-btn alipay' }, [
            h('span', { class: 'icon' }, '💰'),
            h('span', '支付宝')
          ])
        ])
      ])
    ])
  }
})

export default LoginForm

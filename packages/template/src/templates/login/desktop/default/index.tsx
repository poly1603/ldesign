import { defineComponent, reactive, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'DefaultLoginTemplate',
  props: {
    title: {
      type: String,
      default: '登录',
    },
    subtitle: {
      type: String,
      default: '请输入您的账号信息',
    },
    logo: {
      type: String,
      default: '',
    },
    showRememberMe: {
      type: Boolean,
      default: true,
    },
    showForgotPassword: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['login', 'register', 'forgotPassword'],
  setup(props: any, { emit }: any) {
    const loading = ref(false)
    const form = reactive({
      username: '',
      password: '',
      remember: false,
    })

    const handleLogin = async () => {
      if (!form.username || !form.password) {
        console.warn('请输入用户名和密码')
        return
      }

      loading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        emit('login', { ...form })
      } catch (error) {
        console.error('Login failed:', error)
      } finally {
        loading.value = false
      }
    }

    const handleRegister = () => {
      emit('register')
    }

    const handleForgotPassword = () => {
      emit('forgotPassword', { username: form.username })
    }

    return () => (
      <div class="default-login">
        <div class="default-login__container">
          <div class="default-login__header">
            {props.logo && <img src={props.logo} alt="Logo" class="default-login__logo" />}
            <h1 class="default-login__title">{props.title}</h1>
            <p class="default-login__subtitle">{props.subtitle}</p>
          </div>

          <form
            class="default-login__form"
            onSubmit={(e: Event) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <div class="default-login__form-group">
              <label class="default-login__label">用户名</label>
              <input type="text" placeholder="请输入用户名" v-model={form.username} class="default-login__input" />
            </div>

            <div class="default-login__form-group">
              <label class="default-login__label">密码</label>
              <input type="password" placeholder="请输入密码" v-model={form.password} class="default-login__input" />
            </div>

            <div class="default-login__form-options">
              {props.showRememberMe && (
                <label class="default-login__checkbox">
                  <input type="checkbox" v-model={form.remember} />
                  记住密码
                </label>
              )}
              {props.showForgotPassword && (
                <a href="#" onClick={handleForgotPassword} class="default-login__forgot">
                  忘记密码？
                </a>
              )}
            </div>

            <button type="submit" class="default-login__submit" disabled={loading.value}>
              {loading.value ? '登录中...' : '登录'}
            </button>
          </form>

          <div class="default-login__footer">
            <span>没有账号？</span>
            <a href="#" onClick={handleRegister}>
              立即注册
            </a>
          </div>
        </div>
      </div>
    )
  },
})

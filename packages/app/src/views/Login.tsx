import { useRouter } from '@ldesign/router'
import { TemplateRenderer } from '@ldesign/template'
import { defineComponent, ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()
    const { login, isLoading, authError } = useAuth()

    // 登录表单状态
    const loginForm = ref({
      username: '',
      password: '',
      captcha: '',
    })

    // 验证码图片
    const captchaImage = ref('')
    const showCaptcha = ref(false)

    // 处理登录
    const handleLogin = async (data: any) => {
      console.log('登录数据:', data)

      // 验证必填字段
      if (!data.username || !data.password) {
        // eslint-disable-next-line no-alert
        alert('请输入用户名和密码')
        return
      }

      try {
        // 调用真实登录 API
        const result = await login({
          username: data.username,
          password: data.password,
          captcha: data.captcha,
        })

        if (result.success) {
          console.log('✅ 登录成功')
          // 登录成功，跳转到首页
          await router.push('/')
        } else {
          console.error('❌ 登录失败:', result.message)
          // eslint-disable-next-line no-alert
          alert(result.message || '登录失败')
        }
      } catch (error) {
        console.error('❌ 登录异常:', error)
        // eslint-disable-next-line no-alert
        alert('登录失败，请稍后重试')
      }
    }

    // 获取验证码
    const getCaptcha = async () => {
      try {
        // 这里可以调用验证码接口
        // const captcha = await apiService.getCaptcha()
        // captchaImage.value = captcha.data.image
        showCaptcha.value = true
        console.log('获取验证码')
      } catch (error) {
        console.error('获取验证码失败:', error)
      }
    }

    // 组件挂载时初始化
    onMounted(() => {
      // 可以在这里获取验证码或其他初始化操作
      console.log('登录页面已挂载')
    })

    return {
      TemplateRenderer,
      handleLogin,
      getCaptcha,
      loginForm,
      captchaImage,
      showCaptcha,
      isLoading,
      authError,
    }
  },

  render() {
    const {
      TemplateRenderer,
      handleLogin,
      getCaptcha,
      isLoading,
      authError,
      showCaptcha,
      captchaImage,
    } = this

    return (
      <div class='login-container'>
        <TemplateRenderer
          category='login'
          onLogin={handleLogin}
          onGetCaptcha={getCaptcha}
          loading={isLoading}
          error={authError}
          showCaptcha={showCaptcha}
          captchaImage={captchaImage}
        />
        {/* 可以在这里添加额外的登录相关 UI */}
      </div>
    )
  },
})

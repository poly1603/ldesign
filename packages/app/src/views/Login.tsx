import type { LoginEvent } from '../components/LoginPanel/types'
import { useRouter } from '@ldesign/router'
import { TemplateRenderer } from '@ldesign/template'
import { defineComponent, h, ref } from 'vue'
import LoginPanel from '../components/LoginPanel'

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const selectorMode = ref<'modal' | 'dropdown' | 'buttons'>('modal')

    // 登录处理函数
    const handleLogin = async (event: LoginEvent) => {
      loading.value = true

      try {
        console.log('登录事件:', event)
        const { mode, data } = event

        // 模拟登录过程
        await new Promise(resolve => setTimeout(resolve, 1500))

        if (mode === 'username') {
          console.log('用户名登录:', data)
        } else {
          console.log('手机号登录:', data)
        }

        // 登录成功，跳转到首页
        router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 注册处理函数
    const handleRegister = () => {
      console.log('跳转到注册页面')
      // 这里可以跳转到注册页面
    }

    // 忘记密码处理函数
    const handleForgotPassword = () => {
      console.log('跳转到忘记密码页面')
      // 这里可以跳转到忘记密码页面
    }

    // 第三方登录处理函数
    const handleThirdPartyLogin = (provider: string) => {
      console.log('第三方登录:', provider)
      // 这里可以处理第三方登录逻辑
    }

    // 验证码刷新处理函数
    const handleCaptchaRefresh = () => {
      console.log('刷新验证码')
    }

    // 短信验证码发送处理函数
    const handleSmsCodeSend = (phone: string) => {
      console.log('发送短信验证码到:', phone)
      // 这里可以调用短信验证码发送接口
    }

    // 创建 LoginPanel 组件实例
    const createLoginPanel = () => {
      return h(LoginPanel, {
        title: 'LDesign 登录',
        subtitle: '欢迎回来，请登录您的账户',
        logo: '/logo.png',
        loading: loading.value,
        showRememberMe: true,
        showForgotPassword: true,
        showRegisterLink: true,
        thirdPartyLogin: {
          enabled: true,
          providers: [
            { name: 'wechat', icon: '🔗', color: '#07c160' },
            { name: 'qq', icon: '🔗', color: '#12b7f5' },
            { name: 'weibo', icon: '🔗', color: '#e6162d' },
          ],
        },
        theme: {
          mode: 'light',
          effect: 'normal',
        },
        onLogin: handleLogin,
        onRegister: handleRegister,
        'onForgot-password': handleForgotPassword,
        'onThird-party-login': handleThirdPartyLogin,
        'onCaptcha-refresh': handleCaptchaRefresh,
        'onSms-send': handleSmsCodeSend,
      })
    }

    return () => (
      <div
        style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}
      >
        {/* 模板选择器按钮 */}
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              color: '#666',
              fontWeight: '500',
            }}
          >
            模板选择器:
          </div>
        </div>

        {/* 模板渲染器 */}
        <TemplateRenderer
          category='login'
          selectorMode={selectorMode.value}
          showSelector={true}
          selectorSize='medium'
          showDeviceInfo={true}
          config={{
            // 将 LoginPanel 组件传递给模板
            loginPanel: createLoginPanel(),
            // 其他配置
            title: 'LDesign 登录',
            subtitle: '欢迎回来',
            logo: '/logo.png',
            showRememberMe: true,
            showForgotPassword: true,
            showRegisterLink: true,
            allowThirdPartyLogin: true,
            loading: loading.value,
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onThirdPartyLogin={handleThirdPartyLogin}
        />
      </div>
    )
  },
})

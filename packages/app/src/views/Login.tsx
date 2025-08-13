import { useRouter } from '@ldesign/router'
import { TemplateRenderer } from '@ldesign/template'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()

    // 处理登录
    const handleLogin = async (data: any) => {
      console.log('登录数据:', data)

      // 模拟登录验证
      if (data.username && data.password) {
        // 登录成功，跳转到首页
        await router.push('/')
      } else {
        // eslint-disable-next-line no-alert
        alert('请输入用户名和密码')
      }
    }

    return {
      TemplateRenderer,
      handleLogin,
    }
  },

  render() {
    const { TemplateRenderer, handleLogin } = this

    return <TemplateRenderer category='login' onLogin={handleLogin} />
  },
})

import { defineComponent, ref } from 'vue'
import { useRouter } from '@ldesign/router'
import { TemplateRenderer } from '@ldesign/template'

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()
    const loading = ref(false)

    // 简单的登录处理
    const handleLogin = async (data: any) => {
      loading.value = true

      // 模拟登录过程
      setTimeout(() => {
        console.log('登录数据:', data)
        loading.value = false
        // 直接跳转到首页
        router.push('/')
      }, 1000)
    }

    return () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🔑 登录页面</h1>

        <div style={{ margin: '20px 0' }}>
          <p>这是一个简化的登录页面演示</p>
          <p>展示了 @ldesign/template 模板系统的集成</p>
        </div>

        <TemplateRenderer
          category='login'
          onLogin={handleLogin}
          loading={loading.value}
        />

        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🏠 返回首页
          </button>
        </div>
      </div>
    )
  },
})

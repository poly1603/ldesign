import { defineComponent, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'SimpleLoginTemplate',
  props: {
    title: {
      type: String,
      default: '登录'
    },
    showLogo: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const username = ref('')
    const password = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      if (!username.value || !password.value) {
        alert('请输入用户名和密码')
        return
      }

      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        alert(`移动端登录成功！用户名: ${username.value}`)
      }, 1000)
    }

    return {
      username,
      password,
      loading,
      handleLogin
    }
  },
  render() {
    return (
      <div class="simple-login-template">
        <div class="login-header">
          {this.showLogo && (
            <div class="header-logo">
              <div class="logo-icon">📱</div>
            </div>
          )}
          <h1 class="header-title">{this.title}</h1>
          <p class="header-subtitle">移动端简洁版</p>
        </div>
        
        <div class="login-content">
          <form class="login-form" onSubmit={(e) => { e.preventDefault(); this.handleLogin() }}>
            <div class="input-group">
              <input 
                type="text" 
                v-model={this.username}
                placeholder="用户名" 
                class="mobile-input"
                disabled={this.loading}
              />
            </div>
            
            <div class="input-group">
              <input 
                type="password" 
                v-model={this.password}
                placeholder="密码" 
                class="mobile-input"
                disabled={this.loading}
              />
            </div>
            
            <button 
              type="submit" 
              class={['mobile-btn', { 'loading': this.loading }]}
              disabled={this.loading}
            >
              {this.loading ? '登录中...' : '立即登录'}
            </button>
          </form>
          
          <div class="quick-actions">
            <button class="quick-btn">快速登录</button>
            <button class="quick-btn">忘记密码</button>
          </div>
        </div>
        
        <div class="login-footer">
          <p class="footer-text">首次使用？<a href="#" class="footer-link">立即注册</a></p>
        </div>
      </div>
    )
  }
})

import { defineComponent, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'DefaultLoginTemplate',
  props: {
    title: {
      type: String,
      default: '欢迎登录'
    },
    showLogo: {
      type: Boolean,
      default: true
    },
    showRememberMe: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const username = ref('')
    const password = ref('')
    const rememberMe = ref(false)
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
        alert(`登录成功！用户名: ${username.value}`)
      }, 1000)
    }

    return {
      username,
      password,
      rememberMe,
      loading,
      handleLogin
    }
  },
  render() {
    return (
      <div class="default-login-template">
        {this.showLogo && (
          <div class="login-logo">
            <div class="logo-icon">🎨</div>
            <h1 class="logo-text">LDesign</h1>
          </div>
        )}
        
        <div class="login-card">
          <h2 class="login-title">{this.title}</h2>
          <p class="login-subtitle">桌面端默认登录模板</p>
          
          <form class="login-form" onSubmit={(e) => { e.preventDefault(); this.handleLogin() }}>
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input 
                type="text" 
                v-model={this.username}
                placeholder="请输入用户名" 
                class="form-input"
                disabled={this.loading}
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">密码</label>
              <input 
                type="password" 
                v-model={this.password}
                placeholder="请输入密码" 
                class="form-input"
                disabled={this.loading}
              />
            </div>
            
            {this.showRememberMe && (
              <div class="form-group form-checkbox">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model={this.rememberMe}
                    disabled={this.loading}
                  />
                  <span class="checkbox-text">记住我</span>
                </label>
              </div>
            )}
            
            <button 
              type="submit" 
              class={['login-btn', { 'loading': this.loading }]}
              disabled={this.loading}
            >
              {this.loading ? '登录中...' : '登录'}
            </button>
          </form>
          
          <div class="login-footer">
            <a href="#" class="footer-link">忘记密码？</a>
            <a href="#" class="footer-link">注册账号</a>
          </div>
        </div>
      </div>
    )
  }
})

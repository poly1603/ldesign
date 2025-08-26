import { computed, ref } from 'vue'

// 简单的用户状态管理（演示用）
const isLoggedIn = ref(false)
const username = ref('')
const loginTime = ref<Date | null>(null)

export function useUserStore() {
  const login = (user: string) => {
    isLoggedIn.value = true
    username.value = user
    loginTime.value = new Date()

    // 保存到localStorage（演示用）
    localStorage.setItem('user', JSON.stringify({
      username: user,
      loginTime: loginTime.value.toISOString(),
    }))
  }

  const logout = () => {
    isLoggedIn.value = false
    username.value = ''
    loginTime.value = null

    // 清除localStorage
    localStorage.removeItem('user')
  }

  const checkAuth = () => {
    // 检查localStorage中的用户信息
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        isLoggedIn.value = true
        username.value = userData.username
        loginTime.value = new Date(userData.loginTime)
      }
      catch {
        // 如果数据损坏，清除它
        localStorage.removeItem('user')
      }
    }
  }

  const userInfo = computed(() => ({
    isLoggedIn: isLoggedIn.value,
    username: username.value,
    loginTime: loginTime.value,
  }))

  // 初始化时检查认证状态
  checkAuth()

  return {
    isLoggedIn: computed(() => isLoggedIn.value),
    username: computed(() => username.value),
    loginTime: computed(() => loginTime.value),
    userInfo,
    login,
    logout,
    checkAuth,
  }
}

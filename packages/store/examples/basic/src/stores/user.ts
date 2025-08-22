import {
  Action,
  AsyncAction,
  BaseStore,
  Getter,
  PersistentState,
  State,
} from '@ldesign/store'

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
}

export class UserStore extends BaseStore {
  @PersistentState({ default: null })
  user: User | null = null

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null

  constructor(id: string = 'user') {
    super(id)
  }

  @Action()
  setUser(user: User) {
    this.user = user
    this.error = null
  }

  @Action()
  clearUser() {
    this.user = null
    this.error = null
  }

  @Action()
  setError(error: string) {
    this.error = error
    this.loading = false
  }

  @AsyncAction()
  async login(email: string, password: string) {
    this.loading = true
    this.error = null

    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟登录逻辑
      if (email === 'admin@example.com' && password === 'admin') {
        this.setUser({
          id: 1,
          name: '管理员',
          email: 'admin@example.com',
          role: 'admin',
        })
      }
      else if (email === 'user@example.com' && password === 'user') {
        this.setUser({
          id: 2,
          name: '普通用户',
          email: 'user@example.com',
          role: 'user',
        })
      }
      else {
        throw new Error('邮箱或密码错误')
      }
    }
    catch (error) {
      this.setError(error instanceof Error ? error.message : '登录失败')
    }
    finally {
      this.loading = false
    }
  }

  @AsyncAction()
  async logout() {
    this.loading = true
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500))
      this.clearUser()
    }
    finally {
      this.loading = false
    }
  }

  @Getter()
  get isLoggedIn() {
    return this.user !== null
  }

  @Getter()
  get userName() {
    return this.user?.name || '未登录'
  }

  @Getter()
  get userRole() {
    return this.user?.role || 'guest'
  }

  @Getter()
  get isAdmin() {
    return this.user?.role === 'admin'
  }

  @Getter()
  get displayName() {
    if (!this.user)
      return '游客'
    return `${this.user.name} (${this.getRoleText()})`
  }

  private getRoleText() {
    switch (this.user?.role) {
      case 'admin':
        return '管理员'
      case 'user':
        return '用户'
      default:
        return '游客'
    }
  }
}

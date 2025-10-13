/**
 * 认证相关语言项
 */

export default {
  login: {
    title: '欢迎回来',
    subtitle: '登录到您的账户',
    username: '用户名',
    password: '密码',
    rememberMe: '记住我',
    forgotPassword: '忘记密码？',
    submit: '登录',
    noAccount: '还没有账户？',
    createAccount: '创建账户',
    or: '或',
    loginWith: '使用 {provider} 登录',
    success: '登录成功！',
    error: '登录失败，请检查您的用户名和密码'
  },
  
  register: {
    title: '创建新账户',
    subtitle: '加入我们的社区',
    username: '用户名',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    agreeTerms: '我同意服务条款和隐私政策',
    submit: '注册',
    hasAccount: '已有账户？',
    goToLogin: '去登录',
    success: '注册成功！请登录',
    error: '注册失败，请稍后重试'
  },
  
  logout: {
    confirm: '确定要退出登录吗？',
    success: '已成功退出登录',
    error: '退出失败'
  },
  
  profile: {
    title: '个人资料',
    basicInfo: '基本信息',
    changePassword: '修改密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmNewPassword: '确认新密码',
    updateProfile: '更新资料',
    updatePassword: '更新密码',
    uploadAvatar: '上传头像',
    success: '资料更新成功',
    passwordSuccess: '密码修改成功',
    error: '更新失败，请稍后重试'
  },
  
  errors: {
    invalidCredentials: '用户名或密码错误',
    userNotFound: '用户不存在',
    emailExists: '邮箱已被注册',
    usernameExists: '用户名已存在',
    weakPassword: '密码强度不够',
    passwordMismatch: '两次密码输入不一致',
    sessionExpired: '会话已过期，请重新登录',
    unauthorized: '未授权访问',
    forbidden: '禁止访问'
  }
}
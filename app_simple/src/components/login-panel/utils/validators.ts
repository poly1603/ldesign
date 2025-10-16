// 验证工具函数

// 用户名验证
export const validateUsername = (value: string): boolean => {
  const pattern = /^[a-zA-Z0-9_]{4,20}$/
  return pattern.test(value)
}

// 密码验证
export const validatePassword = (value: string): boolean => {
  // 至少8位，包含字母和数字
  const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return pattern.test(value)
}

// 手机号验证
export const validatePhone = (value: string): boolean => {
  const pattern = /^1[3-9]\d{9}$/
  return pattern.test(value)
}

// 验证码验证
export const validateCaptcha = (value: string, length: number = 4): boolean => {
  const pattern = new RegExp(`^[A-Za-z0-9]{${length}}$`)
  return pattern.test(value)
}

// 短信验证码验证
export const validateSmsCode = (value: string): boolean => {
  const pattern = /^\d{6}$/
  return pattern.test(value)
}

// 邮箱验证
export const validateEmail = (value: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value)
}

// 通用非空验证
export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

// 验证规则集合
export const validationRules = {
  username: {
    required: { message: '请输入用户名', validator: validateRequired },
    pattern: { message: '用户名格式不正确（4-20位字母、数字或下划线）', validator: validateUsername }
  },
  password: {
    required: { message: '请输入密码', validator: validateRequired },
    pattern: { message: '密码至少8位，包含字母和数字', validator: validatePassword }
  },
  phone: {
    required: { message: '请输入手机号', validator: validateRequired },
    pattern: { message: '请输入正确的手机号', validator: validatePhone }
  },
  captcha: {
    required: { message: '请输入验证码', validator: validateRequired },
    pattern: { message: '验证码格式不正确', validator: validateCaptcha }
  },
  smsCode: {
    required: { message: '请输入短信验证码', validator: validateRequired },
    pattern: { message: '请输入6位数字验证码', validator: validateSmsCode }
  }
}
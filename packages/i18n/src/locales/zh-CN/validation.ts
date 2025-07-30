/**
 * 中文表单验证信息
 */
export const validation = {
  // 基础验证
  required: '此字段为必填项',
  invalid: '无效值',

  // 字符串验证
  minLength: '至少需要 {{min}} 个字符',
  maxLength: '最多只能 {{max}} 个字符',
  exactLength: '必须是 {{length}} 个字符',
  pattern: '格式无效',

  // 数字验证
  number: '必须是数字',
  integer: '必须是整数',
  decimal: '必须是小数',
  min: '最小值为 {{min}}',
  max: '最大值为 {{max}}',
  range: '必须在 {{min}} 到 {{max}} 之间',
  positive: '必须是正数',
  negative: '必须是负数',

  // 邮箱验证
  email: '邮箱地址无效',
  emailFormat: '请输入有效的邮箱地址',

  // 密码验证
  password: '密码无效',
  passwordTooWeak: '密码强度太弱',
  passwordMismatch: '密码不匹配',
  passwordMinLength: '密码至少需要 {{min}} 个字符',
  passwordRequireUppercase: '密码必须包含至少一个大写字母',
  passwordRequireLowercase: '密码必须包含至少一个小写字母',
  passwordRequireNumber: '密码必须包含至少一个数字',
  passwordRequireSpecial: '密码必须包含至少一个特殊字符',

  // URL 验证
  url: '无效的网址',
  urlFormat: '请输入有效的网址',

  // 日期验证
  date: '无效的日期',
  dateFormat: '日期格式无效',
  dateMin: '日期必须晚于 {{min}}',
  dateMax: '日期必须早于 {{max}}',
  dateRange: '日期必须在 {{min}} 到 {{max}} 之间',
  dateFuture: '日期必须是未来时间',
  datePast: '日期必须是过去时间',

  // 时间验证
  time: '无效的时间',
  timeFormat: '时间格式无效',

  // 文件验证
  file: '无效的文件',
  fileSize: '文件大小必须小于 {{max}}',
  fileType: '文件类型无效',
  fileRequired: '请选择文件',

  // 选择验证
  select: '请进行选择',
  selectMin: '请至少选择 {{min}} 项',
  selectMax: '最多只能选择 {{max}} 项',
  selectRange: '请选择 {{min}} 到 {{max}} 项',

  // 复选框验证
  checkbox: '请勾选此项',
  checkboxRequired: '此复选框为必选项',

  // 单选框验证
  radio: '请进行选择',
  radioRequired: '请选择一个选项',

  // 自定义验证
  unique: '此值已存在',
  exists: '此值不存在',
  match: '值不匹配',

  // 网络验证
  network: '网络错误',
  timeout: '请求超时',
  serverError: '服务器验证错误',

  // 表单状态
  validating: '验证中...',
  validated: '验证完成',
  validationFailed: '验证失败',

  // 字段特定验证
  username: {
    required: '用户名为必填项',
    minLength: '用户名至少需要 {{min}} 个字符',
    maxLength: '用户名最多只能 {{max}} 个字符',
    pattern: '用户名只能包含字母、数字和下划线',
    exists: '此用户名已被使用',
    invalid: '用户名无效',
  },

  phone: {
    required: '手机号为必填项',
    invalid: '手机号无效',
    format: '请输入有效的手机号',
  },

  address: {
    required: '地址为必填项',
    invalid: '地址无效',
    zipCode: '邮政编码无效',
    country: '请选择国家',
    state: '请选择省份/州',
  },

  creditCard: {
    required: '信用卡号为必填项',
    invalid: '信用卡号无效',
    expired: '信用卡已过期',
    cvv: 'CVV 码无效',
  },

  // 业务逻辑验证
  age: {
    required: '年龄为必填项',
    min: '年龄至少为 {{min}} 岁',
    max: '年龄最多为 {{max}} 岁',
    invalid: '年龄无效',
  },

  quantity: {
    required: '数量为必填项',
    min: '最小数量为 {{min}}',
    max: '最大数量为 {{max}}',
    outOfStock: '库存不足',
    insufficient: '可用数量不足',
  },

  price: {
    required: '价格为必填项',
    min: '价格至少为 {{min}}',
    max: '价格最多为 {{max}}',
    invalid: '价格格式无效',
  },
}

export default validation

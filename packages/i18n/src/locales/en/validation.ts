/**
 * 英语表单验证信息
 */
export const validation = {
  // 基础验证
  required: 'This field is required',
  invalid: 'Invalid value',

  // 字符串验证
  minLength: 'Must be at least {{min}} characters',
  maxLength: 'Must be no more than {{max}} characters',
  exactLength: 'Must be exactly {{length}} characters',
  pattern: 'Invalid format',

  // 数字验证
  number: 'Must be a number',
  integer: 'Must be an integer',
  decimal: 'Must be a decimal number',
  min: 'Must be at least {{min}}',
  max: 'Must be no more than {{max}}',
  range: 'Must be between {{min}} and {{max}}',
  positive: 'Must be a positive number',
  negative: 'Must be a negative number',

  // 邮箱验证
  email: 'Invalid email address',
  emailFormat: 'Please enter a valid email address',

  // 密码验证
  password: 'Invalid password',
  passwordTooWeak: 'Password is too weak',
  passwordMismatch: 'Passwords do not match',
  passwordMinLength: 'Password must be at least {{min}} characters',
  passwordRequireUppercase: 'Password must contain at least one uppercase letter',
  passwordRequireLowercase: 'Password must contain at least one lowercase letter',
  passwordRequireNumber: 'Password must contain at least one number',
  passwordRequireSpecial: 'Password must contain at least one special character',

  // URL 验证
  url: 'Invalid URL',
  urlFormat: 'Please enter a valid URL',

  // 日期验证
  date: 'Invalid date',
  dateFormat: 'Invalid date format',
  dateMin: 'Date must be after {{min}}',
  dateMax: 'Date must be before {{max}}',
  dateRange: 'Date must be between {{min}} and {{max}}',
  dateFuture: 'Date must be in the future',
  datePast: 'Date must be in the past',

  // 时间验证
  time: 'Invalid time',
  timeFormat: 'Invalid time format',

  // 文件验证
  file: 'Invalid file',
  fileSize: 'File size must be less than {{max}}',
  fileType: 'Invalid file type',
  fileRequired: 'Please select a file',

  // 选择验证
  select: 'Please make a selection',
  selectMin: 'Please select at least {{min}} items',
  selectMax: 'Please select no more than {{max}} items',
  selectRange: 'Please select between {{min}} and {{max}} items',

  // 复选框验证
  checkbox: 'Please check this box',
  checkboxRequired: 'This checkbox is required',

  // 单选框验证
  radio: 'Please make a selection',
  radioRequired: 'Please select an option',

  // 自定义验证
  unique: 'This value already exists',
  exists: 'This value does not exist',
  match: 'Values do not match',

  // 网络验证
  network: 'Network error occurred',
  timeout: 'Request timed out',
  serverError: 'Server validation error',

  // 表单状态
  validating: 'Validating...',
  validated: 'Validation complete',
  validationFailed: 'Validation failed',

  // 字段特定验证
  username: {
    required: 'Username is required',
    minLength: 'Username must be at least {{min}} characters',
    maxLength: 'Username must be no more than {{max}} characters',
    pattern: 'Username can only contain letters, numbers, and underscores',
    exists: 'This username is already taken',
    invalid: 'Invalid username',
  },

  phone: {
    required: 'Phone number is required',
    invalid: 'Invalid phone number',
    format: 'Please enter a valid phone number',
  },

  address: {
    required: 'Address is required',
    invalid: 'Invalid address',
    zipCode: 'Invalid zip code',
    country: 'Please select a country',
    state: 'Please select a state/province',
  },

  creditCard: {
    required: 'Credit card number is required',
    invalid: 'Invalid credit card number',
    expired: 'Credit card has expired',
    cvv: 'Invalid CVV code',
  },

  // 业务逻辑验证
  age: {
    required: 'Age is required',
    min: 'Must be at least {{min}} years old',
    max: 'Must be no more than {{max}} years old',
    invalid: 'Invalid age',
  },

  quantity: {
    required: 'Quantity is required',
    min: 'Minimum quantity is {{min}}',
    max: 'Maximum quantity is {{max}}',
    outOfStock: 'Out of stock',
    insufficient: 'Insufficient quantity available',
  },

  price: {
    required: 'Price is required',
    min: 'Price must be at least {{min}}',
    max: 'Price must be no more than {{max}}',
    invalid: 'Invalid price format',
  },
}

export default validation

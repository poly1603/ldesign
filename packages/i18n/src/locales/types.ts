/**
 * 内置翻译键类型定义
 *
 * 定义所有内置翻译键的结构，确保类型安全
 */

/**
 * 通用词汇翻译键
 */
export interface CommonTranslations {
  /** 确认相关 */
  ok: string
  confirm: string
  cancel: string
  yes: string
  no: string

  /** 操作相关 */
  save: string
  delete: string
  edit: string
  create: string
  update: string
  add: string
  remove: string
  submit: string
  reset: string
  clear: string
  close: string
  open: string

  /** 搜索相关 */
  search: string
  filter: string
  sort: string

  /** 导航相关 */
  back: string
  next: string
  previous: string
  first: string
  last: string
  home: string

  /** 其他常用 */
  loading: string
  processing: string
  waiting: string
  done: string
  success: string
  error: string
  warning: string
  info: string
  help: string
  more: string
  less: string
  all: string
  none: string
  select: string
  selectAll: string
  unselectAll: string

  /** 复制粘贴 */
  copy: string
  paste: string
  cut: string

  /** 文件操作 */
  upload: string
  download: string
  export: string
  import: string
  print: string

  /** 数据状态 */
  empty: string
  noData: string
  noResults: string

  /** 分页 */
  page: string
  pageSize: string
  total: string
  totalPages: string
  currentPage: string

  /** 布尔值 */
  true: string
  false: string
  enabled: string
  disabled: string
  on: string
  off: string
  active: string
  inactive: string

  /** 时间相关 */
  today: string
  yesterday: string
  tomorrow: string
  now: string

  /** 操作结果 */
  operationSuccess: string
  operationFailed: string
  operationCanceled: string
}

/**
 * 表单验证翻译键
 */
export interface ValidationTranslations {
  required: string
  email: string
  url: string
  number: string
  integer: string
  decimal: string
  alpha: string
  alphaNum: string
  minLength: string
  maxLength: string
  length: string
  min: string
  max: string
  between: string
  date: string
  dateFormat: string
  before: string
  after: string
  confirmed: string
  different: string
  accepted: string
  regex: string
  fileSize: string
  fileType: string
  dimensions: string
  unique: string
  exists: string
  array: string
  boolean: string
  string: string
  numeric: string
  json: string
  ip: string
  ipv4: string
  ipv6: string
  phone: string
  mobile: string
  creditCard: string
  custom: string

  /** 密码相关 */
  passwordStrength: string
  passwordWeak: string
  passwordMedium: string
  passwordStrong: string
  passwordMismatch: string
  passwordTooShort: string
  passwordRequiresUppercase: string
  passwordRequiresLowercase: string
  passwordRequiresNumber: string
  passwordRequiresSpecial: string
}

/**
 * 时间日期翻译键
 */
export interface DateTimeTranslations {
  /** 单位 */
  year: string
  years: string
  month: string
  months: string
  week: string
  weeks: string
  day: string
  days: string
  hour: string
  hours: string
  minute: string
  minutes: string
  second: string
  seconds: string
  millisecond: string
  milliseconds: string

  /** 相对时间 */
  ago: string
  later: string
  justNow: string
  soon: string

  /** 星期 */
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string

  /** 月份 */
  january: string
  february: string
  march: string
  april: string
  may: string
  june: string
  july: string
  august: string
  september: string
  october: string
  november: string
  december: string

  /** 时间段 */
  morning: string
  noon: string
  afternoon: string
  evening: string
  night: string
  midnight: string

  /** 格式化相关 */
  dateFormat: string
  timeFormat: string
  dateTimeFormat: string

  /** 选择器相关 */
  selectDate: string
  selectTime: string
  selectDateTime: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

/**
 * 错误消息翻译键
 */
export interface ErrorTranslations {
  /** HTTP 错误 */
  error400: string
  error401: string
  error403: string
  error404: string
  error405: string
  error408: string
  error409: string
  error410: string
  error422: string
  error429: string
  error500: string
  error502: string
  error503: string
  error504: string

  /** 网络错误 */
  networkError: string
  connectionLost: string
  connectionTimeout: string
  serverError: string
  clientError: string

  /** 通用错误 */
  unknownError: string
  systemError: string
  businessError: string
  validationError: string
  permissionDenied: string
  resourceNotFound: string
  serviceUnavailable: string

  /** 操作错误 */
  loadFailed: string
  saveFailed: string
  deleteFailed: string
  updateFailed: string
  createFailed: string

  /** 文件错误 */
  fileNotFound: string
  fileTooLarge: string
  fileTypeNotAllowed: string
  fileUploadFailed: string
  fileDownloadFailed: string

  /** 数据错误 */
  dataFormatError: string
  dataParseError: string
  dataValidationError: string
  dataDuplicateError: string

  /** 错误处理 */
  retry: string
  reportError: string
  errorDetails: string
  errorCode: string
  errorMessage: string
}

/**
 * 消息通知翻译键
 */
export interface NotificationTranslations {
  /** 成功消息 */
  saveSuccess: string
  deleteSuccess: string
  updateSuccess: string
  createSuccess: string
  uploadSuccess: string
  downloadSuccess: string
  copySuccess: string

  /** 警告消息 */
  unsavedChanges: string
  confirmDelete: string
  confirmCancel: string
  confirmLogout: string
  dataWillBeLost: string

  /** 提示消息 */
  pleaseWait: string
  pleaseSelect: string
  pleaseEnter: string
  pleaseUpload: string
  pleaseConfirm: string

  /** 信息消息 */
  newVersion: string
  maintenanceNotice: string
  systemUpdate: string

  /** 权限消息 */
  loginRequired: string
  insufficientPermission: string
  sessionExpired: string
  accountLocked: string
  accountDisabled: string
}

/**
 * 用户界面翻译键
 */
export interface UITranslations {
  /** 表格相关 */
  table: {
    columns: string
    rows: string
    cells: string
    noData: string
    actions: string
    selectRow: string
    expandRow: string
    collapseRow: string
    sortAscending: string
    sortDescending: string
    clearSort: string
    filter: string
    clearFilter: string
  }

  /** 表单相关 */
  form: {
    field: string
    fields: string
    optional: string
    required: string
    helpText: string
    placeholder: string
    validation: string
    submit: string
    reset: string
    clear: string
  }

  /** 对话框相关 */
  dialog: {
    title: string
    content: string
    confirm: string
    cancel: string
    close: string
  }

  /** 菜单相关 */
  menu: {
    expand: string
    collapse: string
    more: string
  }

  /** 标签页相关 */
  tabs: {
    tab: string
    tabs: string
    closeTab: string
    closeOtherTabs: string
    closeAllTabs: string
  }

  /** 分页相关 */
  pagination: {
    first: string
    previous: string
    next: string
    last: string
    goto: string
    pageSize: string
    total: string
    showing: string
    of: string
    items: string
  }

  /** 进度相关 */
  progress: {
    loading: string
    uploading: string
    downloading: string
    processing: string
    completed: string
  }
}

/**
 * 业务领域翻译键
 */
export interface BusinessTranslations {
  /** 用户相关 */
  user: {
    username: string
    password: string
    email: string
    phone: string
    name: string
    firstName: string
    lastName: string
    nickname: string
    avatar: string
    profile: string
    settings: string
    preferences: string
    account: string
    role: string
    permissions: string
    status: string
    lastLogin: string
    registeredAt: string
  }

  /** 认证相关 */
  auth: {
    login: string
    logout: string
    register: string
    forgotPassword: string
    resetPassword: string
    changePassword: string
    verifyEmail: string
    twoFactorAuth: string
    rememberMe: string
    keepMeLoggedIn: string
  }

  /** 文件相关 */
  file: {
    file: string
    files: string
    folder: string
    folders: string
    name: string
    size: string
    type: string
    path: string
    createdAt: string
    modifiedAt: string
    upload: string
    download: string
    preview: string
    share: string
  }

  /** 设置相关 */
  settings: {
    general: string
    appearance: string
    language: string
    theme: string
    darkMode: string
    lightMode: string
    notification: string
    privacy: string
    security: string
    about: string
  }
}

/**
 * 完整的内置翻译键结构
 */
export interface BuiltInTranslations {
  common: CommonTranslations
  validation: ValidationTranslations
  datetime: DateTimeTranslations
  error: ErrorTranslations
  notification: NotificationTranslations
  ui: UITranslations
  business: BusinessTranslations
}

/**
 * 内置语言包类型
 */
export interface BuiltInLanguagePackage {
  info: {
    name: string
    nativeName: string
    code: string
    region?: string
    direction: 'ltr' | 'rtl'
    dateFormat: string
    flag?: string
  }
  translations: BuiltInTranslations
}

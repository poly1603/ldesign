/**
 * Locale基础模板系统
 * 
 * 提供所有语言共享的基础结构和模板
 * 减少各语言文件中的重复代码
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

/**
 * 基础翻译接口
 */
export interface BaseTranslations {
  common: CommonTranslations
  ui: UITranslations
  validation: ValidationTranslations
  error: ErrorTranslations
  notification: NotificationTranslations
  datetime: DateTimeTranslations
  business: BusinessTranslations
}

/**
 * 通用翻译
 */
export interface CommonTranslations {
  yes: string
  no: string
  ok: string
  cancel: string
  confirm: string
  delete: string
  edit: string
  save: string
  reset: string
  search: string
  filter: string
  sort: string
  loading: string
  noData: string
  error: string
  success: string
  warning: string
  info: string
  close: string
  open: string
  select: string
  selectAll: string
  unselectAll: string
  expand: string
  collapse: string
  more: string
  less: string
  total: string
  items: string
  page: string
  of: string
  previous: string
  next: string
  first: string
  last: string
  refresh: string
  export: string
  import: string
  download: string
  upload: string
  print: string
  share: string
  copy: string
  paste: string
  cut: string
  undo: string
  redo: string
  clear: string
  selectDate: string
  selectTime: string
  selectDateTime: string
  today: string
  yesterday: string
  tomorrow: string
  thisWeek: string
  lastWeek: string
  nextWeek: string
  thisMonth: string
  lastMonth: string
  nextMonth: string
  thisYear: string
  lastYear: string
  nextYear: string
}

/**
 * UI组件翻译
 */
export interface UITranslations {
  table: {
    columns: string
    rows: string
    cells: string
    actions: string
    noDataText: string
    loadingText: string
    sortAsc: string
    sortDesc: string
    filterBy: string
    clearFilter: string
    itemsPerPage: string
    jumpTo: string
    showColumns: string
    exportTable: string
    density: string
    compact: string
    default: string
    comfortable: string
  }
  form: {
    required: string
    optional: string
    clear: string
    reset: string
    submit: string
    submitting: string
    submitted: string
    maxLength: string
    minLength: string
    maxValue: string
    minValue: string
    pattern: string
    email: string
    url: string
    integer: string
    decimal: string
    alpha: string
    alphanumeric: string
    contains: string
    startsWith: string
    endsWith: string
  }
  modal: {
    title: string
    close: string
    confirm: string
    cancel: string
    loading: string
    minimized: string
    maximized: string
    fullscreen: string
    exitFullscreen: string
  }
  pagination: {
    previous: string
    next: string
    first: string
    last: string
    goto: string
    pageSize: string
    total: string
    page: string
    of: string
    items: string
    itemsPerPage: string
    showingXtoYofZ: string
  }
  datepicker: {
    selectDate: string
    selectTime: string
    selectMonth: string
    selectYear: string
    selectDecade: string
    today: string
    clear: string
    close: string
    previousMonth: string
    nextMonth: string
    previousYear: string
    nextYear: string
    previousDecade: string
    nextDecade: string
    prevCentury: string
    nextCentury: string
    pickHour: string
    incrementHour: string
    decrementHour: string
    pickMinute: string
    incrementMinute: string
    decrementMinute: string
    pickSecond: string
    incrementSecond: string
    decrementSecond: string
    togglePeriod: string
    selectTime12h: string
    selectTime24h: string
  }
  select: {
    noMatch: string
    loading: string
    placeholder: string
    noData: string
  }
  upload: {
    selectFile: string
    selectFiles: string
    uploadFile: string
    uploadFiles: string
    dragDropText: string
    dragDropHint: string
    fileSize: string
    fileType: string
    fileName: string
    removeFile: string
    uploadSuccess: string
    uploadError: string
    uploading: string
    paused: string
    retry: string
    cancel: string
    preview: string
  }
  tree: {
    expand: string
    collapse: string
    selectAll: string
    unselectAll: string
    selectNode: string
    unselectNode: string
    expandAll: string
    collapseAll: string
    noData: string
    loading: string
  }
  tabs: {
    more: string
    closeTab: string
    closeOtherTabs: string
    closeLeftTabs: string
    closeRightTabs: string
    closeAllTabs: string
    refresh: string
  }
  menu: {
    expand: string
    collapse: string
    select: string
  }
  alert: {
    close: string
    moreInfo: string
    lessInfo: string
  }
  confirm: {
    title: string
    message: string
    confirmButton: string
    cancelButton: string
  }
  notification: {
    close: string
    closeAll: string
    moreInfo: string
  }
  progress: {
    percent: string
    completed: string
    inProgress: string
    notStarted: string
    failed: string
  }
  loading: {
    text: string
    spinner: string
    overlay: string
  }
}

/**
 * 验证消息翻译
 */
export interface ValidationTranslations {
  required: string
  email: string
  url: string
  date: string
  dateISO: string
  number: string
  digits: string
  creditcard: string
  equalTo: string
  maxlength: string
  minlength: string
  rangelength: string
  range: string
  max: string
  min: string
  step: string
  maxWords: string
  minWords: string
  rangeWords: string
  letterswithbasicpunc: string
  alphanumeric: string
  lettersonly: string
  nowhitespace: string
  zipcode: string
  phoneUS: string
  ipv4: string
  ipv6: string
  pattern: string
  different: string
  inclusion: string
  exclusion: string
  acceptance: string
  strong: string
  moderate: string
  weak: string
  veryWeak: string
  passwordStrength: string
  passwordMatch: string
  fileType: string
  fileSize: string
  dimensions: string
  ratio: string
  json: string
  xml: string
  regex: string
  alpha: string
  alphaNumeric: string
  alphaSpace: string
  alphaDash: string
  numeric: string
  integer: string
  decimal: string
  between: string
  boolean: string
  array: string
  object: string
  string: string
  confirmed: string
  before: string
  after: string
  beforeOrEqual: string
  afterOrEqual: string
  same: string
  unique: string
  exists: string
  distinct: string
  gt: string
  gte: string
  lt: string
  lte: string
  requiredIf: string
  requiredUnless: string
  requiredWith: string
  requiredWithAll: string
  requiredWithout: string
  requiredWithoutAll: string
}

/**
 * 错误消息翻译
 */
export interface ErrorTranslations {
  general: string
  network: string
  timeout: string
  notFound: string
  forbidden: string
  unauthorized: string
  badRequest: string
  serverError: string
  unknown: string
  offline: string
  tooManyRequests: string
  invalidInput: string
  invalidFormat: string
  missingParameter: string
  duplicateEntry: string
  fileTooLarge: string
  unsupportedFileType: string
  quotaExceeded: string
  operationFailed: string
  accessDenied: string
  sessionExpired: string
  accountLocked: string
  invalidCredentials: string
  weakPassword: string
  emailAlreadyExists: string
  usernameAlreadyExists: string
  invalidToken: string
  expiredToken: string
  invalidCode: string
  expiredCode: string
  connectionFailed: string
  serviceUnavailable: string
  maintenanceMode: string
  deprecated: string
  notImplemented: string
  conflict: string
  preconditionFailed: string
  payloadTooLarge: string
  unsupportedMediaType: string
  unprocessableEntity: string
  locked: string
  failedDependency: string
  upgradeRequired: string
  preconditionRequired: string
  requestHeaderFieldsTooLarge: string
  unavailableForLegalReasons: string
  internalServerError: string
  notImplementedError: string
  badGateway: string
  serviceUnavailableError: string
  gatewayTimeout: string
  insufficientStorage: string
  networkAuthenticationRequired: string
}

/**
 * 通知消息翻译
 */
export interface NotificationTranslations {
  success: {
    title: string
    saved: string
    updated: string
    deleted: string
    created: string
    sent: string
    copied: string
    imported: string
    exported: string
    uploaded: string
    downloaded: string
    completed: string
    approved: string
    rejected: string
    published: string
    unpublished: string
    activated: string
    deactivated: string
    connected: string
    disconnected: string
    loggedIn: string
    loggedOut: string
    registered: string
    subscribed: string
    unsubscribed: string
  }
  error: {
    title: string
    saveFailed: string
    updateFailed: string
    deleteFailed: string
    createFailed: string
    sendFailed: string
    copyFailed: string
    importFailed: string
    exportFailed: string
    uploadFailed: string
    downloadFailed: string
    completeFailed: string
    approveFailed: string
    rejectFailed: string
    publishFailed: string
    unpublishFailed: string
    activateFailed: string
    deactivateFailed: string
    connectFailed: string
    disconnectFailed: string
    loginFailed: string
    logoutFailed: string
    registerFailed: string
    subscribeFailed: string
    unsubscribeFailed: string
  }
  warning: {
    title: string
    unsavedChanges: string
    confirmDelete: string
    confirmAction: string
    noPermission: string
    limitExceeded: string
    deprecatedFeature: string
    maintenanceMode: string
    slowConnection: string
    largeFile: string
    unsupportedBrowser: string
    cookiesDisabled: string
    popupBlocked: string
    adBlockDetected: string
  }
  info: {
    title: string
    loading: string
    processing: string
    waiting: string
    syncing: string
    refreshing: string
    newVersion: string
    updateAvailable: string
    maintenance: string
    scheduled: string
    reminder: string
    tip: string
    hint: string
    help: string
  }
}

/**
 * 日期时间翻译
 */
export interface DateTimeTranslations {
  weekdays: {
    short: string[]
    long: string[]
  }
  months: {
    short: string[]
    long: string[]
  }
  formats: {
    date: string
    time: string
    dateTime: string
    fullDate: string
    longDate: string
    shortDate: string
    fullTime: string
    shortTime: string
    year: string
    month: string
    day: string
    hour: string
    minute: string
    second: string
    millisecond: string
    timezone: string
  }
  relative: {
    future: string
    past: string
    now: string
    second: string
    seconds: string
    minute: string
    minutes: string
    hour: string
    hours: string
    day: string
    days: string
    week: string
    weeks: string
    month: string
    months: string
    year: string
    years: string
    yesterday: string
    today: string
    tomorrow: string
    lastWeek: string
    nextWeek: string
    lastMonth: string
    nextMonth: string
    lastYear: string
    nextYear: string
  }
  meridiem: {
    am: string
    pm: string
    AM: string
    PM: string
  }
}

/**
 * 业务相关翻译
 */
export interface BusinessTranslations {
  user: {
    profile: string
    settings: string
    account: string
    preferences: string
    notifications: string
    privacy: string
    security: string
    billing: string
    subscription: string
    logout: string
    login: string
    register: string
    forgotPassword: string
    resetPassword: string
    changePassword: string
    updateProfile: string
    deleteAccount: string
    confirmEmail: string
    verifyPhone: string
    twoFactorAuth: string
  }
  product: {
    name: string
    description: string
    price: string
    quantity: string
    category: string
    brand: string
    sku: string
    inStock: string
    outOfStock: string
    addToCart: string
    removeFromCart: string
    checkout: string
    buyNow: string
    wishlist: string
    compare: string
    review: string
    rating: string
    discount: string
    promotion: string
    newArrival: string
    bestSeller: string
    featured: string
    sale: string
  }
  order: {
    id: string
    status: string
    pending: string
    processing: string
    shipped: string
    delivered: string
    cancelled: string
    refunded: string
    total: string
    subtotal: string
    tax: string
    shipping: string
    discount: string
    coupon: string
    payment: string
    billing: string
    shipping_address: string
    tracking: string
    invoice: string
    receipt: string
    return: string
    exchange: string
  }
  payment: {
    method: string
    creditCard: string
    debitCard: string
    paypal: string
    bankTransfer: string
    cash: string
    cashOnDelivery: string
    cryptocurrency: string
    cardNumber: string
    cardHolder: string
    expiryDate: string
    cvv: string
    billingAddress: string
    saveCard: string
    useNewCard: string
    processingPayment: string
    paymentSuccessful: string
    paymentFailed: string
    refund: string
    refundRequested: string
    refundProcessing: string
    refundCompleted: string
  }
}

/**
 * 创建语言包的工厂函数
 */
export function createLocalePackage(translations: BaseTranslations): BaseTranslations {
  return {
    common: { ...translations.common },
    ui: { ...translations.ui },
    validation: { ...translations.validation },
    error: { ...translations.error },
    notification: { ...translations.notification },
    datetime: { ...translations.datetime },
    business: { ...translations.business }
  }
}

/**
 * 语言包模板生成器
 */
export class LocaleTemplateGenerator {
  private static templates = new Map<string, Partial<BaseTranslations>>()

  /**
   * 注册语言模板
   */
  static registerTemplate(locale: string, template: Partial<BaseTranslations>): void {
    this.templates.set(locale, template)
  }

  /**
   * 生成完整的语言包
   */
  static generate(locale: string, overrides: Partial<BaseTranslations> = {}): BaseTranslations {
    const baseTemplate = this.templates.get(locale) || {}
    return this.deepMerge(baseTemplate, overrides) as BaseTranslations
  }

  /**
   * 深度合并对象
   */
  private static deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  /**
   * 验证语言包完整性
   */
  static validate(locale: BaseTranslations): {
    valid: boolean
    missing: string[]
    extra: string[]
  } {
    const missing: string[] = []
    const extra: string[] = []
    
    // 这里可以实现完整性检查逻辑
    
    return {
      valid: missing.length === 0 && extra.length === 0,
      missing,
      extra
    }
  }

  /**
   * 生成TypeScript类型定义
   */
  static generateTypes(locale: BaseTranslations): string {
    const generateInterface = (obj: any, name: string, indent = 0): string => {
      const spaces = '  '.repeat(indent)
      let result = `${spaces}export interface ${name} {\n`
      
      for (const key in obj) {
        const value = obj[key]
        const safeKey = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key) ? key : `'${key}'`
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          result += `${spaces}  ${safeKey}: {\n`
          for (const subKey in value) {
            const subValue = value[subKey]
            const safeSubKey = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(subKey) ? subKey : `'${subKey}'`
            result += `${spaces}    ${safeSubKey}: ${typeof subValue}\n`
          }
          result += `${spaces}  }\n`
        } else if (Array.isArray(value)) {
          result += `${spaces}  ${safeKey}: string[]\n`
        } else {
          result += `${spaces}  ${safeKey}: ${typeof value}\n`
        }
      }
      
      result += `${spaces}}\n`
      return result
    }
    
    return generateInterface(locale, 'LocaleTranslations')
  }
}

/**
 * 默认语言包值（用于快速填充）
 */
export const defaultValues: Partial<BaseTranslations> = {
  common: {
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    reset: 'Reset',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    loading: 'Loading...',
    noData: 'No data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    close: 'Close',
    open: 'Open',
    select: 'Select',
    selectAll: 'Select all',
    unselectAll: 'Unselect all',
    expand: 'Expand',
    collapse: 'Collapse',
    more: 'More',
    less: 'Less',
    total: 'Total',
    items: 'items',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    first: 'First',
    last: 'Last',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    print: 'Print',
    share: 'Share',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    clear: 'Clear',
    selectDate: 'Select date',
    selectTime: 'Select time',
    selectDateTime: 'Select date and time',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    nextWeek: 'Next week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    nextMonth: 'Next month',
    thisYear: 'This year',
    lastYear: 'Last year',
    nextYear: 'Next year'
  }
}

export default {
  createLocalePackage,
  LocaleTemplateGenerator,
  defaultValues
}
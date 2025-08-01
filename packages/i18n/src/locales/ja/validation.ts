/**
 * 日语表单验证信息
 */
export const validation = {
  // 基础验证
  required: 'この項目は必須です',
  invalid: '無効な値',

  // 字符串验证
  minLength: '{{min}} 文字以上で入力してください',
  maxLength: '{{max}} 文字以下で入力してください',
  exactLength: '{{length}} 文字で入力してください',
  pattern: '形式が無効です',

  // 数字验证
  number: '数値を入力してください',
  integer: '整数を入力してください',
  decimal: '小数を入力してください',
  min: '{{min}} 以上の値を入力してください',
  max: '{{max}} 以下の値を入力してください',
  range: '{{min}} から {{max}} の間の値を入力してください',
  positive: '正の数を入力してください',
  negative: '負の数を入力してください',

  // 邮箱验证
  email: '無効なメールアドレスです',
  emailFormat: '有効なメールアドレスを入力してください',

  // 密码验证
  password: '無効なパスワードです',
  passwordTooWeak: 'パスワードが弱すぎます',
  passwordMismatch: 'パスワードが一致しません',
  passwordMinLength: 'パスワードは {{min}} 文字以上である必要があります',
  passwordRequireUppercase: 'パスワードには大文字を含める必要があります',
  passwordRequireLowercase: 'パスワードには小文字を含める必要があります',
  passwordRequireNumber: 'パスワードには数字を含める必要があります',
  passwordRequireSpecial: 'パスワードには特殊文字を含める必要があります',

  // URL 验证
  url: '無効なURLです',
  urlFormat: '有効なURLを入力してください',

  // 日期验证
  date: '無効な日付です',
  dateFormat: '日付の形式が無効です',
  dateMin: '{{min}} より後の日付を入力してください',
  dateMax: '{{max}} より前の日付を入力してください',
  dateRange: '{{min}} から {{max}} の間の日付を入力してください',
  dateFuture: '未来の日付を入力してください',
  datePast: '過去の日付を入力してください',

  // 时间验证
  time: '無効な時刻です',
  timeFormat: '時刻の形式が無効です',

  // 文件验证
  file: '無効なファイルです',
  fileSize: 'ファイルサイズは {{max}} 未満である必要があります',
  fileType: '無効なファイルタイプです',
  fileRequired: 'ファイルを選択してください',

  // 选择验证
  select: '選択してください',
  selectMin: '{{min}} 個以上選択してください',
  selectMax: '{{max}} 個以下で選択してください',
  selectRange: '{{min}} から {{max}} 個の間で選択してください',

  // 复选框验证
  checkbox: 'このボックスをチェックしてください',
  checkboxRequired: 'このチェックボックスは必須です',

  // 单选框验证
  radio: '選択してください',
  radioRequired: 'オプションを選択してください',

  // 自定义验证
  unique: 'この値は既に存在します',
  exists: 'この値は存在しません',
  match: '値が一致しません',

  // 网络验证
  network: 'ネットワークエラーが発生しました',
  timeout: 'リクエストがタイムアウトしました',
  serverError: 'サーバー検証エラー',

  // 表单状态
  validating: '検証中...',
  validated: '検証完了',
  validationFailed: '検証に失敗しました',
}

export default validation

import type { ErrorTranslations } from '../types'

const error: ErrorTranslations = {
  error400: '不正なリクエスト',
  error401: '認証されていません',
  error403: 'アクセスが禁止されています',
  error404: '見つかりません',
  error405: '許可されていないメソッド',
  error408: 'リクエストタイムアウト',
  error409: '競合',
  error410: '削除されました',
  error422: '処理不能なエンティティ',
  error429: 'リクエストが多すぎます',
  error500: 'サーバー内部エラー',
  error502: '不正なゲートウェイ',
  error503: 'サービス利用不可',
  error504: 'ゲートウェイタイムアウト',

  networkError: 'ネットワークエラー',
  connectionLost: '接続が失われました',
  connectionTimeout: '接続タイムアウト',
  serverError: 'サーバーエラー',
  clientError: 'クライアントエラー',

  unknownError: '不明なエラー',
  systemError: 'システムエラー',
  businessError: '業務エラー',
  validationError: '検証エラー',
  permissionDenied: '権限がありません',
  resourceNotFound: 'リソースが見つかりません',
  serviceUnavailable: 'サービス利用不可',

  loadFailed: '読み込みに失敗しました',
  saveFailed: '保存に失敗しました',
  deleteFailed: '削除に失敗しました',
  updateFailed: '更新に失敗しました',
  createFailed: '作成に失敗しました',

  fileNotFound: 'ファイルが見つかりません',
  fileTooLarge: 'ファイルが大きすぎます',
  fileTypeNotAllowed: '許可されていないファイル形式です',
  fileUploadFailed: 'ファイルのアップロードに失敗しました',
  fileDownloadFailed: 'ファイルのダウンロードに失敗しました',

  dataFormatError: 'データ形式エラー',
  dataParseError: 'データ解析エラー',
  dataValidationError: 'データ検証エラー',
  dataDuplicateError: 'データの重複',

  retry: '再試行',
  reportError: 'エラーを報告',
  errorDetails: 'エラーの詳細',
  errorCode: 'エラーコード',
  errorMessage: 'エラーメッセージ',
}

export default error

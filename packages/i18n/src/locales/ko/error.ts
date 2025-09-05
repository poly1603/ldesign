import type { ErrorTranslations } from '../types'

const error: ErrorTranslations = {
  error400: '잘못된 요청',
  error401: '인증되지 않음',
  error403: '접근 금지',
  error404: '찾을 수 없음',
  error405: '허용되지 않는 메서드',
  error408: '요청 시간 초과',
  error409: '충돌',
  error410: '삭제됨',
  error422: '처리할 수 없는 엔티티',
  error429: '요청이 너무 많음',
  error500: '내부 서버 오류',
  error502: '잘못된 게이트웨이',
  error503: '서비스를 사용할 수 없음',
  error504: '게이트웨이 시간 초과',

  networkError: '네트워크 오류',
  connectionLost: '연결이 끊어졌습니다',
  connectionTimeout: '연결 시간 초과',
  serverError: '서버 오류',
  clientError: '클라이언트 오류',

  unknownError: '알 수 없는 오류',
  systemError: '시스템 오류',
  businessError: '비즈니스 오류',
  validationError: '검증 오류',
  permissionDenied: '권한 거부됨',
  resourceNotFound: '리소스를 찾을 수 없음',
  serviceUnavailable: '서비스를 사용할 수 없음',

  loadFailed: '로드 실패',
  saveFailed: '저장 실패',
  deleteFailed: '삭제 실패',
  updateFailed: '업데이트 실패',
  createFailed: '생성 실패',

  fileNotFound: '파일을 찾을 수 없음',
  fileTooLarge: '파일이 너무 큼',
  fileTypeNotAllowed: '허용되지 않는 파일 형식',
  fileUploadFailed: '파일 업로드 실패',
  fileDownloadFailed: '파일 다운로드 실패',

  dataFormatError: '데이터 형식 오류',
  dataParseError: '데이터 파싱 오류',
  dataValidationError: '데이터 검증 오류',
  dataDuplicateError: '데이터 중복',

  retry: '다시 시도',
  reportError: '오류 보고',
  errorDetails: '오류 상세',
  errorCode: '오류 코드',
  errorMessage: '오류 메시지',
}

export default error

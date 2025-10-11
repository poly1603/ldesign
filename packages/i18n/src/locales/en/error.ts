import type { ErrorTranslations } from '../types'

const error: ErrorTranslations = {
  error400: 'Bad Request',
  error401: 'Unauthorized',
  error403: 'Forbidden',
  error404: 'Not Found',
  error405: 'Method Not Allowed',
  error408: 'Request Timeout',
  error409: 'Conflict',
  error410: 'Gone',
  error422: 'Unprocessable Entity',
  error429: 'Too Many Requests',
  error500: 'Internal Server Error',
  error502: 'Bad Gateway',
  error503: 'Service Unavailable',
  error504: 'Gateway Timeout',

  networkError: 'Network Error',
  connectionLost: 'Connection Lost',
  connectionTimeout: 'Connection Timeout',
  serverError: 'Server Error',
  clientError: 'Client Error',

  unknownError: 'Unknown Error',
  systemError: 'System Error',
  businessError: 'Business Error',
  validationError: 'Validation Error',
  permissionDenied: 'Permission Denied',
  resourceNotFound: 'Resource Not Found',
  serviceUnavailable: 'Service Unavailable',

  loadFailed: 'Load Failed',
  saveFailed: 'Save Failed',
  deleteFailed: 'Delete Failed',
  updateFailed: 'Update Failed',
  createFailed: 'Create Failed',

  fileNotFound: 'File Not Found',
  fileTooLarge: 'File Too Large',
  fileTypeNotAllowed: 'File Type Not Allowed',
  fileUploadFailed: 'File Upload Failed',
  fileDownloadFailed: 'File Download Failed',

  dataFormatError: 'Data Format Error',
  dataParseError: 'Data Parse Error',
  dataValidationError: 'Data Validation Error',
  dataDuplicateError: 'Data Duplicate',

  retry: 'Retry',
  reportError: 'Report Error',
  errorDetails: 'Error Details',
  errorCode: 'Error Code',
  errorMessage: 'Error Message',
}

export default error

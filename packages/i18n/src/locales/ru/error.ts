import type { ErrorTranslations } from '../types'

const error: ErrorTranslations = {
  error400: 'Неверный запрос',
  error401: 'Неавторизовано',
  error403: 'Доступ запрещен',
  error404: 'Не найдено',
  error405: 'Метод не разрешен',
  error408: 'Тайм-аут запроса',
  error409: 'Конфликт',
  error410: 'Удалено',
  error422: 'Невозможно обработать сущность',
  error429: 'Слишком много запросов',
  error500: 'Внутренняя ошибка сервера',
  error502: 'Ошибочный шлюз',
  error503: 'Сервис недоступен',
  error504: 'Тайм-аут шлюза',

  networkError: 'Сетевая ошибка',
  connectionLost: 'Соединение потеряно',
  connectionTimeout: 'Тайм-аут соединения',
  serverError: 'Ошибка сервера',
  clientError: 'Ошибка клиента',

  unknownError: 'Неизвестная ошибка',
  systemError: 'Системная ошибка',
  businessError: 'Бизнес-ошибка',
  validationError: 'Ошибка проверки',
  permissionDenied: 'Доступ запрещен',
  resourceNotFound: 'Ресурс не найден',
  serviceUnavailable: 'Сервис недоступен',

  loadFailed: 'Не удалось загрузить',
  saveFailed: 'Не удалось сохранить',
  deleteFailed: 'Не удалось удалить',
  updateFailed: 'Не удалось обновить',
  createFailed: 'Не удалось создать',

  fileNotFound: 'Файл не найден',
  fileTooLarge: 'Файл слишком большой',
  fileTypeNotAllowed: 'Недопустимый тип файла',
  fileUploadFailed: 'Не удалось загрузить файл',
  fileDownloadFailed: 'Не удалось скачать файл',

  dataFormatError: 'Ошибка формата данных',
  dataParseError: 'Ошибка разбора данных',
  dataValidationError: 'Ошибка проверки данных',
  dataDuplicateError: 'Дублирование данных',

  retry: 'Повторить',
  reportError: 'Сообщить об ошибке',
  errorDetails: 'Подробности ошибки',
  errorCode: 'Код ошибки',
  errorMessage: 'Сообщение об ошибке',
}

export default error

import type { ErrorTranslations } from '../types'

const error: ErrorTranslations = {
  error400: 'Fehlerhafte Anfrage',
  error401: 'Nicht autorisiert',
  error403: 'Verboten',
  error404: 'Nicht gefunden',
  error405: 'Methode nicht erlaubt',
  error408: 'Zeitüberschreitung der Anfrage',
  error409: 'Konflikt',
  error410: 'Nicht mehr verfügbar',
  error422: 'Nicht verarbeitbare Entität',
  error429: 'Zu viele Anfragen',
  error500: 'Interner Serverfehler',
  error502: 'Fehlerhaftes Gateway',
  error503: 'Dienst nicht verfügbar',
  error504: 'Gateway-Zeitüberschreitung',

  networkError: 'Netzwerkfehler',
  connectionLost: 'Verbindung unterbrochen',
  connectionTimeout: 'Zeitüberschreitung der Verbindung',
  serverError: 'Serverfehler',
  clientError: 'Clientfehler',

  unknownError: 'Unbekannter Fehler',
  systemError: 'Systemfehler',
  businessError: 'Geschäftsfehler',
  validationError: 'Validierungsfehler',
  permissionDenied: 'Zugriff verweigert',
  resourceNotFound: 'Ressource nicht gefunden',
  serviceUnavailable: 'Dienst nicht verfügbar',

  loadFailed: 'Laden fehlgeschlagen',
  saveFailed: 'Speichern fehlgeschlagen',
  deleteFailed: 'Löschen fehlgeschlagen',
  updateFailed: 'Aktualisierung fehlgeschlagen',
  createFailed: 'Erstellung fehlgeschlagen',

  fileNotFound: 'Datei nicht gefunden',
  fileTooLarge: 'Datei zu groß',
  fileTypeNotAllowed: 'Dateityp nicht erlaubt',
  fileUploadFailed: 'Hochladen fehlgeschlagen',
  fileDownloadFailed: 'Herunterladen fehlgeschlagen',

  dataFormatError: 'Datenformatfehler',
  dataParseError: 'Datenanalysefehler',
  dataValidationError: 'Datenvalidierungsfehler',
  dataDuplicateError: 'Doppelte Daten',

  retry: 'Erneut versuchen',
  reportError: 'Fehler melden',
  errorDetails: 'Fehlerdetails',
  errorCode: 'Fehlercode',
  errorMessage: 'Fehlermeldung',
}

export default error

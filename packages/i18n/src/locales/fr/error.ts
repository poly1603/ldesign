import type { ErrorTranslations } from '../types'

const error: ErrorTranslations = {
  error400: 'Mauvaise requête',
  error401: 'Non autorisé',
  error403: 'Interdit',
  error404: 'Introuvable',
  error405: 'Méthode non autorisée',
  error408: 'Délai d’attente de la requête dépassé',
  error409: 'Conflit',
  error410: 'Supprimé',
  error422: 'Entité non traitable',
  error429: 'Trop de requêtes',
  error500: 'Erreur interne du serveur',
  error502: 'Mauvaise passerelle',
  error503: 'Service indisponible',
  error504: 'Délai d’attente de la passerelle dépassé',

  networkError: 'Erreur réseau',
  connectionLost: 'Connexion perdue',
  connectionTimeout: 'Délai de connexion dépassé',
  serverError: 'Erreur serveur',
  clientError: 'Erreur client',

  unknownError: 'Erreur inconnue',
  systemError: 'Erreur système',
  businessError: 'Erreur métier',
  validationError: 'Erreur de validation',
  permissionDenied: 'Permission refusée',
  resourceNotFound: 'Ressource introuvable',
  serviceUnavailable: 'Service indisponible',

  loadFailed: 'Échec du chargement',
  saveFailed: 'Échec de l’enregistrement',
  deleteFailed: 'Échec de la suppression',
  updateFailed: 'Échec de la mise à jour',
  createFailed: 'Échec de la création',

  fileNotFound: 'Fichier introuvable',
  fileTooLarge: 'Fichier trop volumineux',
  fileTypeNotAllowed: 'Type de fichier non autorisé',
  fileUploadFailed: 'Échec du téléversement',
  fileDownloadFailed: 'Échec du téléchargement',

  dataFormatError: 'Erreur de format des données',
  dataParseError: 'Erreur d’analyse des données',
  dataValidationError: 'Erreur de validation des données',
  dataDuplicateError: 'Données en double',

  retry: 'Réessayer',
  reportError: 'Signaler une erreur',
  errorDetails: 'Détails de l’erreur',
  errorCode: 'Code d’erreur',
  errorMessage: 'Message d’erreur',
}

export default error

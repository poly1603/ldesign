import type { UITranslations } from '../types'

const ui: UITranslations = {
  table: {
    columns: 'Colonnes',
    rows: 'Lignes',
    cells: 'Cellules',
    noData: 'Aucune donnée',
    actions: 'Actions',
    selectRow: 'Sélectionner la ligne',
    expandRow: 'Développer la ligne',
    collapseRow: 'Réduire la ligne',
    sortAscending: 'Tri croissant',
    sortDescending: 'Tri décroissant',
    clearSort: 'Effacer le tri',
    filter: 'Filtrer',
    clearFilter: 'Effacer le filtre',
  },

  form: {
    field: 'Champ',
    fields: 'Champs',
    optional: 'Optionnel',
    required: 'Obligatoire',
    helpText: 'Texte d’aide',
    placeholder: 'Veuillez saisir',
    validation: 'Validation',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    clear: 'Effacer',
  },

  dialog: {
    title: 'Titre',
    content: 'Contenu',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    close: 'Fermer',
  },

  menu: {
    expand: 'Développer',
    collapse: 'Réduire',
    more: 'Plus',
  },

  tabs: {
    tab: 'Onglet',
    tabs: 'Onglets',
    closeTab: 'Fermer l’onglet',
    closeOtherTabs: 'Fermer les autres onglets',
    closeAllTabs: 'Fermer tous les onglets',
  },

  pagination: {
    first: 'Premier',
    previous: 'Précédent',
    next: 'Suivant',
    last: 'Dernier',
    goto: 'Aller à',
    pageSize: 'Taille de page',
    total: 'Total',
    showing: 'Affichage',
    of: 'de',
    items: 'éléments',
  },

  progress: {
    loading: 'Chargement',
    uploading: 'Téléversement',
    downloading: 'Téléchargement',
    processing: 'Traitement',
    completed: 'Terminé',
  },
}

export default ui

import type { UITranslations } from '../types'

const ui: UITranslations = {
  table: {
    columns: 'Spalten',
    rows: 'Zeilen',
    cells: 'Zellen',
    noData: 'Keine Daten',
    actions: 'Aktionen',
    selectRow: 'Zeile auswählen',
    expandRow: 'Zeile erweitern',
    collapseRow: 'Zeile reduzieren',
    sortAscending: 'Aufsteigend sortieren',
    sortDescending: 'Absteigend sortieren',
    clearSort: 'Sortierung löschen',
    filter: 'Filtern',
    clearFilter: 'Filter löschen',
  },

  form: {
    field: 'Feld',
    fields: 'Felder',
    optional: 'Optional',
    required: 'Erforderlich',
    helpText: 'Hilfetext',
    placeholder: 'Bitte eingeben',
    validation: 'Validierung',
    submit: 'Senden',
    reset: 'Zurücksetzen',
    clear: 'Leeren',
  },

  dialog: {
    title: 'Titel',
    content: 'Inhalt',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    close: 'Schließen',
  },

  menu: {
    expand: 'Erweitern',
    collapse: 'Reduzieren',
    more: 'Mehr',
  },

  tabs: {
    tab: 'Reiter',
    tabs: 'Reiter',
    closeTab: 'Reiter schließen',
    closeOtherTabs: 'Andere Reiter schließen',
    closeAllTabs: 'Alle Reiter schließen',
  },

  pagination: {
    first: 'Erste',
    previous: 'Vorherige',
    next: 'Nächste',
    last: 'Letzte',
    goto: 'Gehe zu',
    pageSize: 'Seitengröße',
    total: 'Gesamt',
    showing: 'Anzeige',
    of: 'von',
    items: 'Elemente',
  },

  progress: {
    loading: 'Wird geladen',
    uploading: 'Wird hochgeladen',
    downloading: 'Wird heruntergeladen',
    processing: 'Wird verarbeitet',
    completed: 'Abgeschlossen',
  },
}

export default ui

import type { UITranslations } from '../types'

const ui: UITranslations = {
  table: {
    columns: '列',
    rows: '行',
    cells: 'セル',
    noData: 'データがありません',
    actions: 'アクション',
    selectRow: '行を選択',
    expandRow: '行を展開',
    collapseRow: '行を折りたたむ',
    sortAscending: '昇順',
    sortDescending: '降順',
    clearSort: '並び替えをクリア',
    filter: 'フィルター',
    clearFilter: 'フィルターをクリア',
  },

  form: {
    field: 'フィールド',
    fields: 'フィールド',
    optional: '任意',
    required: '必須',
    helpText: 'ヘルプテキスト',
    placeholder: '入力してください',
    validation: '検証',
    submit: '送信',
    reset: 'リセット',
    clear: 'クリア',
  },

  dialog: {
    title: 'タイトル',
    content: '内容',
    confirm: '確認',
    cancel: 'キャンセル',
    close: '閉じる',
  },

  menu: {
    expand: '展開',
    collapse: '折りたたむ',
    more: 'もっと見る',
  },

  tabs: {
    tab: 'タブ',
    tabs: 'タブ',
    closeTab: 'タブを閉じる',
    closeOtherTabs: '他のタブを閉じる',
    closeAllTabs: 'すべてのタブを閉じる',
  },

  pagination: {
    first: '最初へ',
    previous: '前へ',
    next: '次へ',
    last: '最後へ',
    goto: '移動',
    pageSize: 'ページサイズ',
    total: '合計',
    showing: '表示',
    of: '/',
    items: '件',
  },

  progress: {
    loading: '読み込み中',
    uploading: 'アップロード中',
    downloading: 'ダウンロード中',
    processing: '処理中',
    completed: '完了',
  },
}

export default ui

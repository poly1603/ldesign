import type { UITranslations } from '../types'

const ui: UITranslations = {
  table: {
    columns: 'Столбцы',
    rows: 'Строки',
    cells: 'Ячейки',
    noData: 'Нет данных',
    actions: 'Действия',
    selectRow: 'Выбрать строку',
    expandRow: 'Развернуть строку',
    collapseRow: 'Свернуть строку',
    sortAscending: 'По возрастанию',
    sortDescending: 'По убыванию',
    clearSort: 'Сбросить сортировку',
    filter: 'Фильтр',
    clearFilter: 'Сбросить фильтр',
  },

  form: {
    field: 'Поле',
    fields: 'Поля',
    optional: 'Необязательно',
    required: 'Обязательно',
    helpText: 'Справочный текст',
    placeholder: 'Пожалуйста, введите',
    validation: 'Проверка',
    submit: 'Отправить',
    reset: 'Сбросить',
    clear: 'Очистить',
  },

  dialog: {
    title: 'Заголовок',
    content: 'Содержимое',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    close: 'Закрыть',
  },

  menu: {
    expand: 'Развернуть',
    collapse: 'Свернуть',
    more: 'Еще',
  },

  tabs: {
    tab: 'Вкладка',
    tabs: 'Вкладки',
    closeTab: 'Закрыть вкладку',
    closeOtherTabs: 'Закрыть другие вкладки',
    closeAllTabs: 'Закрыть все вкладки',
  },

  pagination: {
    first: 'Первая',
    previous: 'Предыдущая',
    next: 'Следующая',
    last: 'Последняя',
    goto: 'Перейти к',
    pageSize: 'Размер страницы',
    total: 'Всего',
    showing: 'Показано',
    of: 'из',
    items: 'элементов',
  },

  progress: {
    loading: 'Загрузка',
    uploading: 'Загрузка файла',
    downloading: 'Скачивание',
    processing: 'Обработка',
    completed: 'Завершено',
  },
}

export default ui

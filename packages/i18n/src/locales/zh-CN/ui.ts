import type { UITranslations } from '../types'

const ui: UITranslations = {
  table: {
    columns: '列',
    rows: '行',
    cells: '单元格',
    noData: '暂无数据',
    actions: '操作',
    selectRow: '选择行',
    expandRow: '展开行',
    collapseRow: '收起行',
    sortAscending: '升序',
    sortDescending: '降序',
    clearSort: '清除排序',
    filter: '筛选',
    clearFilter: '清除筛选',
  },

  form: {
    field: '字段',
    fields: '字段',
    optional: '可选',
    required: '必填',
    helpText: '帮助文本',
    placeholder: '请输入',
    validation: '验证',
    submit: '提交',
    reset: '重置',
    clear: '清空',
  },

  dialog: {
    title: '标题',
    content: '内容',
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
  },

  menu: {
    expand: '展开',
    collapse: '收起',
    more: '更多',
  },

  tabs: {
    tab: '标签',
    tabs: '标签页',
    closeTab: '关闭标签',
    closeOtherTabs: '关闭其他标签',
    closeAllTabs: '关闭所有标签',
  },

  pagination: {
    first: '首页',
    previous: '上一页',
    next: '下一页',
    last: '末页',
    goto: '跳转到',
    pageSize: '每页显示',
    total: '共',
    showing: '显示',
    of: '/',
    items: '条',
  },

  progress: {
    loading: '加载中',
    uploading: '上传中',
    downloading: '下载中',
    processing: '处理中',
    completed: '已完成',
  },
}

export default ui


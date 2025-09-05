import type { UITranslations } from '../types'

const ui: UITranslations = {
  table: {
    columns: '열',
    rows: '행',
    cells: '셀',
    noData: '데이터 없음',
    actions: '작업',
    selectRow: '행 선택',
    expandRow: '행 펼치기',
    collapseRow: '행 접기',
    sortAscending: '오름차순',
    sortDescending: '내림차순',
    clearSort: '정렬 해제',
    filter: '필터',
    clearFilter: '필터 해제',
  },

  form: {
    field: '필드',
    fields: '필드',
    optional: '선택 사항',
    required: '필수',
    helpText: '도움말',
    placeholder: '입력해 주세요',
    validation: '검증',
    submit: '제출',
    reset: '초기화',
    clear: '지우기',
  },

  dialog: {
    title: '제목',
    content: '내용',
    confirm: '확인',
    cancel: '취소',
    close: '닫기',
  },

  menu: {
    expand: '펼치기',
    collapse: '접기',
    more: '더보기',
  },

  tabs: {
    tab: '탭',
    tabs: '탭',
    closeTab: '탭 닫기',
    closeOtherTabs: '다른 탭 닫기',
    closeAllTabs: '모든 탭 닫기',
  },

  pagination: {
    first: '처음',
    previous: '이전',
    next: '다음',
    last: '마지막',
    goto: '이동',
    pageSize: '페이지 크기',
    total: '총계',
    showing: '표시',
    of: '/',
    items: '개',
  },

  progress: {
    loading: '로딩 중',
    uploading: '업로드 중',
    downloading: '다운로드 중',
    processing: '처리 중',
    completed: '완료',
  },
}

export default ui

/**
 * 日语日期时间格式
 */
export const date = {
  // 日期格式
  formats: {
    short: 'YYYY/M/D',
    medium: 'YYYY年M月D日',
    long: 'YYYY年M月D日',
    full: 'YYYY年M月D日 dddd',
    iso: 'YYYY-MM-DD',
    time: 'HH:mm',
    timeWithSeconds: 'HH:mm:ss',
    datetime: 'YYYY/M/D HH:mm',
    datetimeWithSeconds: 'YYYY/M/D HH:mm:ss',
  },

  // 月份名称
  months: {
    full: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    short: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
  },

  // 星期名称
  weekdays: {
    full: [
      '日曜日',
      '月曜日',
      '火曜日',
      '水曜日',
      '木曜日',
      '金曜日',
      '土曜日',
    ],
    short: ['日', '月', '火', '水', '木', '金', '土'],
    min: ['日', '月', '火', '水', '木', '金', '土'],
  },

  // 相对时间
  relative: {
    now: '今',
    justNow: 'たった今',
    secondsAgo: '{{count}} 秒前',
    minuteAgo: '1 分前',
    minutesAgo: '{{count}} 分前',
    hourAgo: '1 時間前',
    hoursAgo: '{{count}} 時間前',
    dayAgo: '昨日',
    daysAgo: '{{count}} 日前',
    weekAgo: '1 週間前',
    weeksAgo: '{{count}} 週間前',
    monthAgo: '1 ヶ月前',
    monthsAgo: '{{count}} ヶ月前',
    yearAgo: '1 年前',
    yearsAgo: '{{count}} 年前',

    // 未来时间
    inSeconds: '{{count}} 秒後',
    inMinute: '1 分後',
    inMinutes: '{{count}} 分後',
    inHour: '1 時間後',
    inHours: '{{count}} 時間後',
    tomorrow: '明日',
    inDays: '{{count}} 日後',
    inWeek: '1 週間後',
    inWeeks: '{{count}} 週間後',
    inMonth: '1 ヶ月後',
    inMonths: '{{count}} ヶ月後',
    inYear: '1 年後',
    inYears: '{{count}} 年後',
  },

  // 时间段
  periods: {
    am: '午前',
    pm: '午後',
    morning: '朝',
    afternoon: '午後',
    evening: '夕方',
    night: '夜',
    midnight: '深夜',
    noon: '正午',
  },

  // 日期选择器
  picker: {
    selectDate: '日付を選択',
    selectTime: '時刻を選択',
    selectDateTime: '日時を選択',
    today: '今日',
    clear: 'クリア',
    ok: 'OK',
    cancel: 'キャンセル',
    previousMonth: '前月',
    nextMonth: '翌月',
    previousYear: '前年',
    nextYear: '翌年',
    previousDecade: '前の10年',
    nextDecade: '次の10年',
    yearSelect: '年を選択',
    monthSelect: '月を選択',
    dateSelect: '日を選択',
    timeSelect: '時刻を選択',
    hourSelect: '時を選択',
    minuteSelect: '分を選択',
    secondSelect: '秒を選択',
  },

  // 日历
  calendar: {
    today: '今日',
    month: '月',
    week: '週',
    day: '日',
    agenda: '予定',
    date: '日付',
    time: '時刻',
    event: 'イベント',
    allDay: '終日',
    noEventsInRange: 'この期間にイベントはありません',
    showMore: '他 {{count}} 件を表示',
    previous: '前',
    next: '次',
  },

  // 持续时间
  duration: {
    seconds: '{{count}} 秒',
    minutes: '{{count}} 分',
    hours: '{{count}} 時間',
    days: '{{count}} 日',
    weeks: '{{count}} 週',
    months: '{{count}} ヶ月',
    years: '{{count}} 年',
  },

  // 时区
  timezone: {
    utc: 'UTC',
    local: 'ローカル時間',
    selectTimezone: 'タイムゾーンを選択',
  },
}

export default date

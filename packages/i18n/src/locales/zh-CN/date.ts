/**
 * 中文日期时间格式
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
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
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
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ],
    short: [
      '周日',
      '周一',
      '周二',
      '周三',
      '周四',
      '周五',
      '周六',
    ],
    min: [
      '日',
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
    ],
  },

  // 相对时间
  relative: {
    now: '现在',
    justNow: '刚刚',
    secondsAgo: '{{count}} 秒前',
    minuteAgo: '1 分钟前',
    minutesAgo: '{{count}} 分钟前',
    hourAgo: '1 小时前',
    hoursAgo: '{{count}} 小时前',
    dayAgo: '昨天',
    daysAgo: '{{count}} 天前',
    weekAgo: '1 周前',
    weeksAgo: '{{count}} 周前',
    monthAgo: '1 个月前',
    monthsAgo: '{{count}} 个月前',
    yearAgo: '1 年前',
    yearsAgo: '{{count}} 年前',

    // 未来时间
    inSeconds: '{{count}} 秒后',
    inMinute: '1 分钟后',
    inMinutes: '{{count}} 分钟后',
    inHour: '1 小时后',
    inHours: '{{count}} 小时后',
    tomorrow: '明天',
    inDays: '{{count}} 天后',
    inWeek: '1 周后',
    inWeeks: '{{count}} 周后',
    inMonth: '1 个月后',
    inMonths: '{{count}} 个月后',
    inYear: '1 年后',
    inYears: '{{count}} 年后',
  },

  // 时间段
  periods: {
    am: '上午',
    pm: '下午',
    morning: '早上',
    afternoon: '下午',
    evening: '晚上',
    night: '夜晚',
    midnight: '午夜',
    noon: '中午',
  },

  // 日期选择器
  picker: {
    selectDate: '选择日期',
    selectTime: '选择时间',
    selectDateTime: '选择日期和时间',
    today: '今天',
    clear: '清除',
    ok: '确定',
    cancel: '取消',
    previousMonth: '上个月',
    nextMonth: '下个月',
    previousYear: '上一年',
    nextYear: '下一年',
    previousDecade: '上个十年',
    nextDecade: '下个十年',
    yearSelect: '选择年份',
    monthSelect: '选择月份',
    dateSelect: '选择日期',
    timeSelect: '选择时间',
    hourSelect: '选择小时',
    minuteSelect: '选择分钟',
    secondSelect: '选择秒',
  },

  // 日历
  calendar: {
    today: '今天',
    month: '月',
    week: '周',
    day: '日',
    agenda: '日程',
    date: '日期',
    time: '时间',
    event: '事件',
    allDay: '全天',
    noEventsInRange: '此时间范围内没有事件',
    showMore: '显示更多 {{count}} 个',
    previous: '上一个',
    next: '下一个',
  },

  // 持续时间
  duration: {
    seconds: '{{count}} 秒',
    minutes: '{{count}} 分钟',
    hours: '{{count}} 小时',
    days: '{{count}} 天',
    weeks: '{{count}} 周',
    months: '{{count}} 个月',
    years: '{{count}} 年',
  },

  // 时区
  timezone: {
    utc: 'UTC',
    local: '本地时间',
    selectTimezone: '选择时区',
  },
}

export default date

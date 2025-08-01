/**
 * 英语日期时间格式
 */
export const date = {
  // 日期格式
  formats: {
    short: 'M/D/YYYY',
    medium: 'MMM D, YYYY',
    long: 'MMMM D, YYYY',
    full: 'dddd, MMMM D, YYYY',
    iso: 'YYYY-MM-DD',
    time: 'h:mm A',
    timeWithSeconds: 'h:mm:ss A',
    datetime: 'M/D/YYYY h:mm A',
    datetimeWithSeconds: 'M/D/YYYY h:mm:ss A',
  },

  // 月份名称
  months: {
    full: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    short: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
  },

  // 星期名称
  weekdays: {
    full: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    short: [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ],
    min: [
      'Su',
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
    ],
  },

  // 相对时间
  relative: {
    now: 'now',
    justNow: 'just now',
    secondsAgo: '{{count}} seconds ago',
    minuteAgo: 'a minute ago',
    minutesAgo: '{{count}} minutes ago',
    hourAgo: 'an hour ago',
    hoursAgo: '{{count}} hours ago',
    dayAgo: 'yesterday',
    daysAgo: '{{count}} days ago',
    weekAgo: 'a week ago',
    weeksAgo: '{{count}} weeks ago',
    monthAgo: 'a month ago',
    monthsAgo: '{{count}} months ago',
    yearAgo: 'a year ago',
    yearsAgo: '{{count}} years ago',

    // 未来时间
    inSeconds: 'in {{count}} seconds',
    inMinute: 'in a minute',
    inMinutes: 'in {{count}} minutes',
    inHour: 'in an hour',
    inHours: 'in {{count}} hours',
    tomorrow: 'tomorrow',
    inDays: 'in {{count}} days',
    inWeek: 'in a week',
    inWeeks: 'in {{count}} weeks',
    inMonth: 'in a month',
    inMonths: 'in {{count}} months',
    inYear: 'in a year',
    inYears: 'in {{count}} years',
  },

  // 时间段
  periods: {
    am: 'AM',
    pm: 'PM',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night',
    midnight: 'midnight',
    noon: 'noon',
  },

  // 日期选择器
  picker: {
    selectDate: 'Select date',
    selectTime: 'Select time',
    selectDateTime: 'Select date and time',
    today: 'Today',
    clear: 'Clear',
    ok: 'OK',
    cancel: 'Cancel',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    previousDecade: 'Previous decade',
    nextDecade: 'Next decade',
    yearSelect: 'Select year',
    monthSelect: 'Select month',
    dateSelect: 'Select date',
    timeSelect: 'Select time',
    hourSelect: 'Select hour',
    minuteSelect: 'Select minute',
    secondSelect: 'Select second',
  },

  // 日历
  calendar: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Time',
    event: 'Event',
    allDay: 'All day',
    noEventsInRange: 'No events in this range',
    showMore: 'Show {{count}} more',
    previous: 'Previous',
    next: 'Next',
  },

  // 持续时间
  duration: {
    seconds: '{{count, plural, =1{# second} other{# seconds}}}',
    minutes: '{{count, plural, =1{# minute} other{# minutes}}}',
    hours: '{{count, plural, =1{# hour} other{# hours}}}',
    days: '{{count, plural, =1{# day} other{# days}}}',
    weeks: '{{count, plural, =1{# week} other{# weeks}}}',
    months: '{{count, plural, =1{# month} other{# months}}}',
    years: '{{count, plural, =1{# year} other{# years}}}',
  },

  // 时区
  timezone: {
    utc: 'UTC',
    local: 'Local time',
    selectTimezone: 'Select timezone',
  },
}

export default date

/**
 * Vue 3 集成
 */

import { ref, reactive, computed, onMounted, onUnmounted, watch, type Ref, type App } from 'vue'
import { Calendar } from '../core/Calendar'
import type { CalendarConfig, CalendarEvent, ViewType, DateInput } from '../types'
import { DateUtils } from '../utils/date'
import type { Dayjs } from 'dayjs'

/**
 * Vue Calendar 组件 Props
 */
export interface CalendarProps extends Partial<CalendarConfig> {
  /** v-model 绑定的日期 */
  modelValue?: DateInput
  /** 事件数据 */
  events?: CalendarEvent[]
}

/**
 * Vue Calendar 组件 Emits
 */
export interface CalendarEmits {
  /** 更新 v-model */
  'update:modelValue': (date: Dayjs) => void
  /** 日期选择 */
  'date-select': (date: Dayjs, dates: Dayjs[]) => void
  /** 事件点击 */
  'event-click': (event: CalendarEvent, element: HTMLElement) => void
  /** 事件创建 */
  'event-create': (event: Partial<CalendarEvent>) => void
  /** 事件更新 */
  'event-update': (event: CalendarEvent, changes: Partial<CalendarEvent>) => void
  /** 事件删除 */
  'event-delete': (event: CalendarEvent) => void
  /** 视图变化 */
  'view-change': (view: ViewType, date: Dayjs) => void
  /** 日期变化 */
  'date-change': (date: Dayjs) => void
}

/**
 * useCalendar Composition API Hook
 */
export function useCalendar(
  container: Ref<HTMLElement | undefined>,
  config: Ref<CalendarConfig> = ref({})
) {
  // 响应式状态
  const calendar = ref<Calendar | null>(null)
  const currentDate = ref<Dayjs>(DateUtils.now())
  const currentView = ref<ViewType>('month')
  const selectedDates = ref<Dayjs[]>([])
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isInitialized = computed(() => calendar.value !== null)
  const hasEvents = computed(() => events.value.length > 0)
  const selectedDate = computed(() => selectedDates.value[0] || null)

  // 初始化日历
  const init = () => {
    if (!container.value) {
      error.value = 'Container element not found'
      return
    }

    try {
      loading.value = true
      calendar.value = new Calendar(container.value, config.value)
      
      // 绑定事件监听器
      bindEventListeners()
      
      // 同步初始状态
      syncState()
      
      loading.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize calendar'
      loading.value = false
    }
  }

  // 绑定事件监听器
  const bindEventListeners = () => {
    if (!calendar.value) return

    calendar.value.on('dateSelect', (date: Dayjs, dates: Dayjs[]) => {
      selectedDates.value = dates
      currentDate.value = date
    })

    calendar.value.on('viewChange', (view: ViewType, date: Dayjs) => {
      currentView.value = view
      currentDate.value = date
    })

    calendar.value.on('dateChange', (date: Dayjs) => {
      currentDate.value = date
    })
  }

  // 同步状态
  const syncState = () => {
    if (!calendar.value) return

    currentDate.value = calendar.value.getCurrentDate()
    currentView.value = calendar.value.getCurrentView()
    selectedDates.value = calendar.value.getSelectedDates()
  }

  // 日历操作方法
  const goToDate = (date: DateInput) => {
    calendar.value?.goToDate(date)
  }

  const goToToday = () => {
    calendar.value?.goToToday()
  }

  const changeView = (view: ViewType) => {
    calendar.value?.changeView(view)
  }

  const prev = () => {
    calendar.value?.prev()
  }

  const next = () => {
    calendar.value?.next()
  }

  const selectDate = (date: DateInput) => {
    calendar.value?.selectDate(DateUtils.dayjs(date))
  }

  // 事件管理方法
  const addEvent = (event: Partial<CalendarEvent>) => {
    if (!calendar.value) return null
    
    const eventManager = calendar.value.getEventManager()
    const newEvent = eventManager.addEvent(event)
    events.value = eventManager.getAllEvents()
    return newEvent
  }

  const updateEvent = (id: string, changes: Partial<CalendarEvent>) => {
    if (!calendar.value) return null
    
    const eventManager = calendar.value.getEventManager()
    const updatedEvent = eventManager.updateEvent(id, changes)
    events.value = eventManager.getAllEvents()
    return updatedEvent
  }

  const deleteEvent = (id: string) => {
    if (!calendar.value) return false
    
    const eventManager = calendar.value.getEventManager()
    const result = eventManager.deleteEvent(id)
    events.value = eventManager.getAllEvents()
    return result
  }

  const getEvent = (id: string) => {
    if (!calendar.value) return null
    
    const eventManager = calendar.value.getEventManager()
    return eventManager.getEvent(id)
  }

  const getEventsForDate = (date: DateInput) => {
    if (!calendar.value) return []
    
    const eventManager = calendar.value.getEventManager()
    return eventManager.getEventsForDate(date)
  }

  const getEventsInRange = (start: DateInput, end: DateInput) => {
    if (!calendar.value) return []
    
    const eventManager = calendar.value.getEventManager()
    return eventManager.getEventsInRange(start, end)
  }

  // 主题管理方法
  const setTheme = (theme: string) => {
    if (!calendar.value) return
    
    const themeManager = calendar.value.getThemeManager()
    themeManager.applyTheme(theme as any)
  }

  const getCurrentTheme = () => {
    if (!calendar.value) return 'default'
    
    const themeManager = calendar.value.getThemeManager()
    return themeManager.getCurrentTheme()
  }

  // 配置管理方法
  const updateConfig = (newConfig: Partial<CalendarConfig>) => {
    if (!calendar.value) return
    
    const configManager = calendar.value.getConfigManager()
    configManager.setMultiple(newConfig)
  }

  const getConfig = () => {
    if (!calendar.value) return {}
    
    const configManager = calendar.value.getConfigManager()
    return configManager.getAll()
  }

  // 刷新日历
  const refresh = () => {
    calendar.value?.render()
  }

  // 销毁日历
  const destroy = () => {
    calendar.value?.destroy()
    calendar.value = null
    selectedDates.value = []
    events.value = []
    error.value = null
  }

  // 监听配置变化
  watch(config, (newConfig) => {
    if (calendar.value) {
      updateConfig(newConfig)
    }
  }, { deep: true })

  // 生命周期
  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    // 状态
    calendar: readonly(calendar),
    currentDate: readonly(currentDate),
    currentView: readonly(currentView),
    selectedDates: readonly(selectedDates),
    selectedDate,
    events: readonly(events),
    loading: readonly(loading),
    error: readonly(error),
    isInitialized,
    hasEvents,

    // 日历操作
    init,
    goToDate,
    goToToday,
    changeView,
    prev,
    next,
    selectDate,
    refresh,
    destroy,

    // 事件管理
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getEventsForDate,
    getEventsInRange,

    // 主题管理
    setTheme,
    getCurrentTheme,

    // 配置管理
    updateConfig,
    getConfig
  }
}

/**
 * Calendar Vue 组件定义
 */
export const CalendarComponent = {
  name: 'LDesignCalendar',
  props: {
    modelValue: {
      type: [Date, String, Number, Object] as any,
      default: () => new Date()
    },
    events: {
      type: Array as () => CalendarEvent[],
      default: () => []
    },
    view: {
      type: String as () => ViewType,
      default: 'month'
    },
    locale: {
      type: String,
      default: 'zh-CN'
    },
    theme: {
      type: String,
      default: 'default'
    },
    showLunar: {
      type: Boolean,
      default: true
    },
    showHolidays: {
      type: Boolean,
      default: true
    },
    showWeekNumbers: {
      type: Boolean,
      default: false
    },
    showToday: {
      type: Boolean,
      default: true
    },
    showNavigation: {
      type: Boolean,
      default: true
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    firstDayOfWeek: {
      type: Number,
      default: 1
    },
    selectionMode: {
      type: String,
      default: 'single'
    },
    enableDragDrop: {
      type: Boolean,
      default: true
    },
    enableResize: {
      type: Boolean,
      default: true
    },
    enableKeyboard: {
      type: Boolean,
      default: true
    },
    enableTouch: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'update:modelValue',
    'date-select',
    'event-click',
    'event-create',
    'event-update',
    'event-delete',
    'view-change',
    'date-change'
  ],
  setup(props: CalendarProps, { emit }: { emit: any }) {
    const containerRef = ref<HTMLElement>()
    
    // 构建配置对象
    const config = computed(() => ({
      date: props.modelValue,
      view: props.view,
      locale: props.locale,
      theme: props.theme,
      showLunar: props.showLunar,
      showHolidays: props.showHolidays,
      showWeekNumbers: props.showWeekNumbers,
      showToday: props.showToday,
      showNavigation: props.showNavigation,
      showToolbar: props.showToolbar,
      firstDayOfWeek: props.firstDayOfWeek,
      selectionMode: props.selectionMode,
      enableDragDrop: props.enableDragDrop,
      enableResize: props.enableResize,
      enableKeyboard: props.enableKeyboard,
      enableTouch: props.enableTouch
    }))

    const {
      calendar,
      currentDate,
      currentView,
      selectedDates,
      loading,
      error,
      isInitialized,
      addEvent,
      updateEvent,
      deleteEvent
    } = useCalendar(containerRef, config)

    // 监听事件数据变化
    watch(() => props.events, (newEvents) => {
      if (!calendar.value || !newEvents) return
      
      const eventManager = calendar.value.getEventManager()
      
      // 清除现有事件
      const existingEvents = eventManager.getAllEvents()
      existingEvents.forEach(event => {
        eventManager.deleteEvent(event.id)
      })
      
      // 添加新事件
      newEvents.forEach(event => {
        eventManager.addEvent(event)
      })
      
      // 刷新视图
      calendar.value.render()
    }, { deep: true })

    // 监听选中日期变化
    watch(selectedDates, (dates) => {
      if (dates.length > 0) {
        emit('update:modelValue', dates[0])
        emit('date-select', dates[0], dates)
      }
    })

    // 监听视图变化
    watch(currentView, (view) => {
      emit('view-change', view, currentDate.value)
    })

    // 监听日期变化
    watch(currentDate, (date) => {
      emit('date-change', date)
    })

    // 绑定事件监听器
    onMounted(() => {
      if (calendar.value) {
        calendar.value.on('eventClick', (event: CalendarEvent, element: HTMLElement) => {
          emit('event-click', event, element)
        })
      }
    })

    return {
      containerRef,
      loading,
      error,
      isInitialized
    }
  },
  template: `
    <div ref="containerRef" class="ldesign-calendar-vue-wrapper">
      <div v-if="loading" class="ldesign-calendar-loading">
        加载中...
      </div>
      <div v-if="error" class="ldesign-calendar-error">
        {{ error }}
      </div>
    </div>
  `
}

/**
 * Vue 插件安装函数
 */
export function install(app: App) {
  app.component('LDesignCalendar', CalendarComponent)
}

/**
 * 默认导出
 */
export default {
  install,
  Calendar: CalendarComponent,
  useCalendar
}

// 类型导出
export type {
  CalendarProps,
  CalendarEmits
}

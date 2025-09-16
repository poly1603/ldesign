/**
 * 日期详细信息弹窗组件
 */

import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import { DOMUtils } from '../utils/dom'
import { LunarUtils } from '../utils/lunar'
import { DateUtils } from '../utils/date'
import type { CalendarEvent, DateInput } from '../types'

dayjs.extend(dayOfYear)

export interface DetailModalOptions {
  date: DateInput
  events?: CalendarEvent[]
  onClose?: () => void
  onCreateEvent?: (date: DateInput) => void
  onEditEvent?: (event: CalendarEvent) => void
}

export class DetailModal {
  private overlay: HTMLElement | null = null
  private modal: HTMLElement | null = null
  private options: DetailModalOptions | null = null
  private currentTab: 'info' | 'events' | 'lunar' = 'info'

  /**
   * 显示弹窗
   */
  public show(options: DetailModalOptions): void {
    this.options = options
    this.createElement()
    this.bindEvents()
  }

  /**
   * 隐藏弹窗
   */
  public hide(): void {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
      this.modal = null
    }
    this.options = null
  }

  /**
   * 创建弹窗元素
   */
  private createElement(): void {
    if (!this.options) return

    // 创建遮罩层
    this.overlay = DOMUtils.createElement('div', 'ldesign-calendar-modal-overlay')
    
    // 创建弹窗
    this.modal = DOMUtils.createElement('div', 'ldesign-calendar-modal ldesign-calendar-detail-modal')
    
    // 创建头部
    const header = this.createHeader()
    this.modal.appendChild(header)
    
    // 创建标签页
    const tabs = this.createTabs()
    this.modal.appendChild(tabs)
    
    // 创建主体
    const body = this.createBody()
    this.modal.appendChild(body)
    
    this.overlay.appendChild(this.modal)
    document.body.appendChild(this.overlay)
  }

  /**
   * 创建头部
   */
  private createHeader(): HTMLElement {
    const header = DOMUtils.createElement('div', 'ldesign-calendar-modal-header')
    
    const date = DateUtils.dayjs(this.options!.date)
    const title = DOMUtils.createElement('h3', 'ldesign-calendar-modal-title')
    title.textContent = `${date.format('YYYY年MM月DD日')} ${date.format('dddd')}`
    
    const closeBtn = DOMUtils.createElement('button', 'ldesign-calendar-modal-close')
    closeBtn.innerHTML = '×'
    closeBtn.addEventListener('click', () => this.handleClose())
    
    header.appendChild(title)
    header.appendChild(closeBtn)
    
    return header
  }

  /**
   * 创建标签页
   */
  private createTabs(): HTMLElement {
    const tabsContainer = DOMUtils.createElement('div', 'ldesign-calendar-detail-tabs')
    
    const tabs = [
      { id: 'info', label: '基本信息' },
      { id: 'events', label: '日程安排' },
      { id: 'lunar', label: '农历信息' }
    ]
    
    tabs.forEach(tab => {
      const tabElement = DOMUtils.createElement('div', 'ldesign-calendar-detail-tab')
      tabElement.textContent = tab.label
      tabElement.dataset.tab = tab.id
      
      if (tab.id === this.currentTab) {
        tabElement.classList.add('active')
      }
      
      tabElement.addEventListener('click', () => this.switchTab(tab.id as any))
      
      tabsContainer.appendChild(tabElement)
    })
    
    return tabsContainer
  }

  /**
   * 创建主体
   */
  private createBody(): HTMLElement {
    const body = DOMUtils.createElement('div', 'ldesign-calendar-modal-body')
    
    const content = DOMUtils.createElement('div', 'ldesign-calendar-detail-content')
    this.updateContent(content)
    
    body.appendChild(content)
    
    return body
  }

  /**
   * 切换标签页
   */
  private switchTab(tab: 'info' | 'events' | 'lunar'): void {
    this.currentTab = tab
    
    // 更新标签页状态
    const tabs = this.modal?.querySelectorAll('.ldesign-calendar-detail-tab')
    tabs?.forEach(tabElement => {
      if (tabElement.getAttribute('data-tab') === tab) {
        tabElement.classList.add('active')
      } else {
        tabElement.classList.remove('active')
      }
    })
    
    // 更新内容
    const content = this.modal?.querySelector('.ldesign-calendar-detail-content')
    if (content) {
      this.updateContent(content as HTMLElement)
    }
  }

  /**
   * 更新内容
   */
  private updateContent(container: HTMLElement): void {
    container.innerHTML = ''
    
    switch (this.currentTab) {
      case 'info':
        this.renderInfoTab(container)
        break
      case 'events':
        this.renderEventsTab(container)
        break
      case 'lunar':
        this.renderLunarTab(container)
        break
    }
  }

  /**
   * 渲染基本信息标签页
   */
  private renderInfoTab(container: HTMLElement): void {
    const date = DateUtils.dayjs(this.options!.date)
    const lunarInfo = LunarUtils.getLunarInfo(this.options!.date)
    
    const grid = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-grid')
    
    // 公历信息
    const solarCard = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-card')
    const solarTitle = DOMUtils.createElement('h4', 'ldesign-calendar-detail-info-title')
    solarTitle.textContent = '公历信息'
    const solarContent = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-content')
    solarContent.innerHTML = `
      <p>日期：${date.format('YYYY年MM月DD日')}</p>
      <p>星期：${date.format('dddd')}</p>
      <p>第${date.week()}周</p>
      <p>第${date.dayOfYear()}天</p>
    `
    solarCard.appendChild(solarTitle)
    solarCard.appendChild(solarContent)
    
    // 农历信息
    const lunarCard = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-card')
    const lunarTitle = DOMUtils.createElement('h4', 'ldesign-calendar-detail-info-title')
    lunarTitle.textContent = '农历信息'
    const lunarContent = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-content')
    lunarContent.innerHTML = `
      <p>农历：${lunarInfo.year}${lunarInfo.month}${lunarInfo.day}</p>
      <p>生肖：${lunarInfo.zodiac}</p>
      <p>天干地支：${lunarInfo.ganzhi?.year}</p>
      ${lunarInfo.term ? `<p>节气：${lunarInfo.term}</p>` : ''}
      ${lunarInfo.festival ? `<p>节日：${lunarInfo.festival}</p>` : ''}
    `
    lunarCard.appendChild(lunarTitle)
    lunarCard.appendChild(lunarContent)
    
    grid.appendChild(solarCard)
    grid.appendChild(lunarCard)
    container.appendChild(grid)
  }

  /**
   * 渲染事件标签页
   */
  private renderEventsTab(container: HTMLElement): void {
    const events = this.options!.events || []
    
    // 添加新建按钮
    const addButton = DOMUtils.createElement('button', 'ldesign-calendar-btn ldesign-calendar-btn-primary')
    addButton.innerHTML = '➕ 新建日程'
    addButton.style.marginBottom = '16px'
    addButton.addEventListener('click', () => {
      this.options?.onCreateEvent?.(this.options.date)
      this.hide()
    })
    container.appendChild(addButton)
    
    if (events.length === 0) {
      const noEvents = DOMUtils.createElement('div')
      noEvents.textContent = '今日暂无日程安排'
      noEvents.style.textAlign = 'center'
      noEvents.style.color = '#8c8c8c'
      noEvents.style.padding = '40px 0'
      container.appendChild(noEvents)
      return
    }
    
    // 事件列表
    events.forEach(event => {
      const eventCard = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-card')
      eventCard.style.cursor = 'pointer'
      eventCard.style.marginBottom = '12px'
      
      const title = DOMUtils.createElement('h4', 'ldesign-calendar-detail-info-title')
      title.textContent = event.title
      title.style.color = event.color || '#722ED1'
      
      const content = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-content')
      
      let timeText = ''
      if (event.allDay) {
        timeText = '全天'
      } else {
        const startTime = DateUtils.dayjs(event.start).format('HH:mm')
        const endTime = event.end ? DateUtils.dayjs(event.end).format('HH:mm') : ''
        timeText = endTime ? `${startTime} - ${endTime}` : startTime
      }
      
      content.innerHTML = `
        <p>时间：${timeText}</p>
        ${event.description ? `<p>描述：${event.description}</p>` : ''}
        ${event.category ? `<p>分类：${event.category}</p>` : ''}
      `
      
      eventCard.appendChild(title)
      eventCard.appendChild(content)
      
      eventCard.addEventListener('click', () => {
        this.options?.onEditEvent?.(event)
        this.hide()
      })
      
      container.appendChild(eventCard)
    })
  }

  /**
   * 渲染农历标签页
   */
  private renderLunarTab(container: HTMLElement): void {
    const lunarInfo = LunarUtils.getLunarInfo(this.options!.date)
    
    const grid = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-grid')
    
    // 天干地支
    const ganzhiCard = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-card')
    const ganzhiTitle = DOMUtils.createElement('h4', 'ldesign-calendar-detail-info-title')
    ganzhiTitle.textContent = '天干地支'
    const ganzhiContent = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-content')
    ganzhiContent.innerHTML = `
      <p>年：${lunarInfo.ganzhi?.year || '未知'}</p>
      <p>月：${lunarInfo.ganzhi?.month || '未知'}</p>
      <p>日：${lunarInfo.ganzhi?.day || '未知'}</p>
    `
    ganzhiCard.appendChild(ganzhiTitle)
    ganzhiCard.appendChild(ganzhiContent)
    
    // 宜忌
    const suitableCard = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-card')
    const suitableTitle = DOMUtils.createElement('h4', 'ldesign-calendar-detail-info-title')
    suitableTitle.textContent = '宜忌'
    const suitableContent = DOMUtils.createElement('div', 'ldesign-calendar-detail-info-content')
    suitableContent.innerHTML = `
      <p style="color: #52c41a;"><strong>宜：</strong>${lunarInfo.suitable?.join('、') || '无特别宜做之事'}</p>
      <p style="color: #ff4d4f;"><strong>忌：</strong>${lunarInfo.avoid?.join('、') || '无特别忌做之事'}</p>
    `
    suitableCard.appendChild(suitableTitle)
    suitableCard.appendChild(suitableContent)
    
    grid.appendChild(ganzhiCard)
    grid.appendChild(suitableCard)
    container.appendChild(grid)
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.overlay) return
    
    // 点击遮罩层关闭
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.handleClose()
      }
    })
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleClose()
      }
    })
  }

  /**
   * 处理关闭
   */
  private handleClose(): void {
    this.options?.onClose?.()
    this.hide()
  }
}

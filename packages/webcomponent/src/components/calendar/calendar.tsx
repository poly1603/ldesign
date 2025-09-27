import { Component, Prop, State, Event, EventEmitter, h, Element, Watch } from '@stencil/core';
import { formatDate, parseDate, generateCalendarDates, WEEKDAY_NAMES, generateMonthList } from '../datepicker/datepicker.utils';

type CalEvent = {
  id?: string;
  title: string;
  date?: string;           // YYYY-MM-DD（用于月视图简化展示）
  start?: string;          // ISO 字符串，例如 2025-09-02T09:00:00
  end?: string;            // ISO 字符串
  allDay?: boolean;
  color?: string;          // css color
  type?: 'dot' | 'bg';     // 渲染风格（暂未使用，预留）
};

@Component({ tag: 'ldesign-calendar', styleUrl: 'calendar.less', shadow: false })
export class LdesignCalendar {
  @Element() el!: HTMLElement;

  // value
  @Prop({ mutable: true }) value?: string;
  @Prop() defaultValue?: string;

  // options
  @Prop() format: string = 'YYYY-MM-DD';
  @Prop() firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1;
  @Prop() showWeekNumbers: boolean = false;
  @Prop() minDate?: string;
  @Prop() maxDate?: string;
  @Prop() disabledDate?: (d: Date) => boolean;

  /** 是否显示农历（默认关闭）。若浏览器支持 Intl Chinese Calendar，将自动使用内置格式化 */
  @Prop() showLunar: boolean = false;
  /** 自定义农历格式化（优先级高于内置），返回文本，例如 “初九” 或 “正月初一” */
  @Prop() lunarFormatter?: (d: Date) => string;

  /** 事件数据（JSON 字符串），例如：[{"date":"2025-09-27","title":"发布","color":"#1677ff"}] */
  @Prop() events?: string;
  /** 事件数据（JS 设置），与 events 二选一，前者用于 attribute，后者用于 property */
  @Prop() eventsData?: Array<{ date: string; title: string; color?: string; type?: 'dot' | 'bg' }>;
  /** 单元格最多展示的事件条数 */
  @Prop() maxEventsPerCell: number = 3;

  /** 视图：月/周/日/年 */
  @Prop({ mutable: true }) view: 'month' | 'week' | 'day' | 'year' = 'month';
  /** 时间轴起止与步长（周/日视图） */
  @Prop() hourStart: number = 8;
  @Prop() hourEnd: number = 20;
  @Prop() stepMinutes: number = 30; // 每格分钟
  @Prop() showAllDay: boolean = true;
  @Prop() maxAllDayRows: number = 3;
  @Prop() draggableEvents: boolean = false;
  @Prop() resizableEvents: boolean = false;

  // events
  @Event() ldesignChange!: EventEmitter<string>;
  @Event() ldesignEventClick!: EventEmitter<{ event: any }>; // 点击日程项
  @Event() ldesignEventDrop!: EventEmitter<{ id?: string; title: string; oldStart?: string; oldEnd?: string; newStart: string; newEnd: string; allDay?: boolean }>; // 拖拽重排
  @Event() ldesignEventResize!: EventEmitter<{ id?: string; title: string; oldStart?: string; oldEnd?: string; newStart: string; newEnd: string }>; // 改变时长

  // state
  @State() viewYear: number = new Date().getFullYear();
  @State() viewMonth: number = new Date().getMonth();
  @State() selected?: Date;
  // 触发刷新以渲染按需加载的农历
  @State() private _lunarTick: number = 0;

  private lunarProvider?: { format: (d: Date) => string };

  private get parsedMin() { const d = parseDate(this.minDate as any); return d || undefined; }
  private get parsedMax() { const d = parseDate(this.maxDate as any); return d || undefined; }
  private get isControlled() { return this.el?.hasAttribute('value'); }

  private get allEvents(): CalEvent[] {
    let arr: CalEvent[] = [];
    try {
      if (this.eventsData && Array.isArray(this.eventsData)) arr = this.eventsData;
      else if (this.events && typeof this.events === 'string') arr = JSON.parse(this.events);
    } catch {}
    return Array.isArray(arr) ? arr : [];
  }
  private get eventMap(): Map<string, CalEvent[]> {
    const m = new Map<string, CalEvent[]>();
    for (const e of this.allEvents) {
      let key = (e?.date || '').trim();
      if (!key && e.start) {
        const d = new Date(e.start);
        if (!isNaN(d.getTime())) key = formatDate(d, 'YYYY-MM-DD');
      }
      if (!key) continue;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return m;
  }

  @Watch('value') onValueChanged(v?: string) {
    const d = parseDate(v as any) || parseDate(this.defaultValue as any);
    if (d) {
      this.selected = d;
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
    }
  }

  componentWillLoad() {
    const init = this.value ?? this.defaultValue;
    const d = parseDate(init as any);
    if (d) {
      this.selected = d;
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
    }
  }

  componentDidLoad() {
    if (this.showLunar) this.ensureLunar();
  }

  @Watch('showLunar')
  onShowLunar(v: boolean) { if (v) this.ensureLunar(); }

  private async ensureLunar() {
    if (this.lunarProvider) return;
    try {
      const mod: any = await import(/* @vite-ignore */ '../../utils/lunar-mini');
      const fmt = mod?.format || mod?.default;
      if (typeof fmt === 'function') {
        this.lunarProvider = { format: fmt };
        this._lunarTick++; // 触发一次刷新
      }
    } catch {}
  }

  private prevMonth = () => {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear -= 1; } else { this.viewMonth -= 1; }
  };
  private nextMonth = () => {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear += 1; } else { this.viewMonth += 1; }
  };
  private prevYear = () => { this.viewYear -= 1; };
  private nextYear = () => { this.viewYear += 1; };

  private get anchorDate(): Date { return this.selected || new Date(this.viewYear, this.viewMonth, 1); }
  private setAnchor(d: Date) { this.viewYear = d.getFullYear(); this.viewMonth = d.getMonth(); this.selected = new Date(d); }

  private prevPrimary = () => {
    if (this.view === 'month') return this.prevMonth();
    if (this.view === 'year') return this.prevYear();
    const d = new Date(this.anchorDate);
    d.setDate(d.getDate() + (this.view === 'week' ? -7 : -1));
    this.setAnchor(d);
  };
  private nextPrimary = () => {
    if (this.view === 'month') return this.nextMonth();
    if (this.view === 'year') return this.nextYear();
    const d = new Date(this.anchorDate);
    d.setDate(d.getDate() + (this.view === 'week' ? 7 : 1));
    this.setAnchor(d);
  };

  private yearsAround(center: number, span = 10): number[] { const res:number[]=[]; for(let y=center-span;y<=center+span;y++) res.push(y); return res; }

  private handleDateClick = (d: Date, disabled: boolean) => {
    if (disabled) return;
    this.selected = d;
    const out = formatDate(d, this.format);
    if (!this.isControlled) this.value = out as any;
    this.ldesignChange.emit(out);
  };

  private getLunarText(d: Date): string | null {
    if (!this.showLunar) return null;
    try {
      if (typeof this.lunarFormatter === 'function') return this.lunarFormatter(d);
      if (!this.lunarProvider) this.ensureLunar();
      if (this.lunarProvider) return this.lunarProvider.format(d);
      // 回退：使用内置国际化（若浏览器支持 Chinese Calendar）
      const df = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { day: 'numeric' } as any);
      return df.format(d);
    } catch { return null; }
  }

  private renderHeader() {
    const years = this.yearsAround(this.viewYear, 10);
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <div class="ldc-header">
        <div class="ldc-toolbar-left">
          <button class={{ 'ldc-nav': true, 'ldc-nav--double': true }} onClick={this.prevYear} type="button" aria-label="上一年">
            <ldesign-icon name="chevrons-left" size="small" />
          </button>
          <button class={{ 'ldc-nav': true }} onClick={this.prevPrimary} type="button" aria-label="上一周期">
            <ldesign-icon name="chevron-left" size="small" />
          </button>
        </div>
        <div class="ldc-toolbar-center">
          <select class="ldc-select" onInput={(e: any) => { const v = parseInt((e.target as HTMLSelectElement).value, 10); this.viewYear = isNaN(v) ? this.viewYear : v; }}>
            {years.map(y => <option value={String(y)} selected={y === this.viewYear}>{y}年</option>)}
          </select>
          {this.view === 'month' ? (
            <select class="ldc-select" onInput={(e: any) => { const v = parseInt((e.target as HTMLSelectElement).value, 10); this.viewMonth = isNaN(v) ? this.viewMonth : v; }}>
              {months.map(m => <option value={String(m)} selected={m === this.viewMonth}>{m + 1}月</option>)}
            </select>
          ) : null}
          <div class="ldc-seg">
            <button class={{ 'ldc-seg-item': true, 'active': this.view === 'month' }} type="button" onClick={() => this.view = 'month'}>月</button>
            <button class={{ 'ldc-seg-item': true, 'active': this.view === 'year' }} type="button" onClick={() => this.view = 'year'}>年</button>
          </div>
        </div>
        <div class="ldc-toolbar-right">
          <button class={{ 'ldc-nav': true }} onClick={this.nextPrimary} type="button" aria-label="下一周期">
            <ldesign-icon name="chevron-right" size="small" />
          </button>
          <button class={{ 'ldc-nav': true, 'ldc-nav--double': true }} onClick={this.nextYear} type="button" aria-label="下一年">
            <ldesign-icon name="chevrons-right" size="small" />
          </button>
        </div>
      </div>
    );
  }

  private renderWeekdays() {
    const names = [...WEEKDAY_NAMES];
    const heads = Array.from({ length: 7 }, (_, i) => names[(i + this.firstDayOfWeek) % 7]);
    return (
      <div class={{ 'ldc-weekdays': true, 'ldc-weekdays--with-weeks': this.showWeekNumbers }}>
        {this.showWeekNumbers ? <div class="ldc-weeknum-header">周</div> : null}
        {heads.map((n, i) => (
          <div class={{ 'ldc-weekday': true }} key={`w-${i}`}>{n}</div>
        ))}
      </div>
    );
  }

  // ---- 周/日视图：计算与渲染 ----
  private getWeekStart(d: Date): Date {
    const date = new Date(d);
    const day = (date.getDay() - this.firstDayOfWeek + 7) % 7;
    date.setDate(date.getDate() - day);
    date.setHours(0,0,0,0);
    return date;
  }
  private getDaysOfWeek(anchor: Date): Date[] {
    const start = this.getWeekStart(anchor);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  private minutesInDay(h: number, m: number) { return h * 60 + m; }
  private toMinutes(date: Date) { return this.minutesInDay(date.getHours(), date.getMinutes()); }
  private quantize(min: number, step: number) { const s = Math.max(1, Math.floor(step || 1)); return Math.round(min / s) * s; }

  // 拖拽状态（周/日视图，纵向）
  private dragging?: { weekStart: Date; dayRects: DOMRect[]; dayIndexStart: number; day: Date; ev: CalEvent; duration: number; startMin0: number; colRect: DOMRect };
  private resizing?: { mode: 'start' | 'end'; weekStart: Date; dayRects: DOMRect[]; dayIndexStart: number; day: Date; ev: CalEvent; originalStart: Date; originalEnd: Date; colRect: DOMRect };
  private monthDragging?: { ev: CalEvent; oldDate: string };
  private monthBarDragging?: { ev: CalEvent; lengthDays: number; oldStart: string };
  private monthBarResizing?: { ev: CalEvent; mode: 'start'|'end'; rowStartKey: string; lengthDays: number; oldStartKey: string };
  private ghost?: HTMLElement;
  private getCanvasFromCol(col: HTMLElement): HTMLElement | null { return col.querySelector('.ldc-day-canvas'); }
  private ensureGhost(canvas: HTMLElement) {
    if (this.ghost && this.ghost.parentElement === canvas) return this.ghost;
    if (this.ghost?.parentElement) this.ghost.parentElement.removeChild(this.ghost);
    const g = document.createElement('div'); g.className = 'ldc-drag-ghost'; canvas.appendChild(g); this.ghost = g; return g;
  }
  private clearGhost() { try { if (this.ghost?.parentElement) this.ghost.parentElement.removeChild(this.ghost); } catch {}; this.ghost = undefined; }

  private onEventBlockMouseDown = (e: MouseEvent, day: Date, ev: CalEvent) => {
    if (!this.draggableEvents) return;
    if (e.button !== 0) return;
    const col = (e.currentTarget as HTMLElement)?.closest('.ldc-day-col') as HTMLElement | null;
    if (!col) return;
    const body = col.parentElement as HTMLElement | null; // .ldc-schedule-body
    const cols = body ? Array.from(body.querySelectorAll('.ldc-day-col')) as HTMLElement[] : [col];
    const rects = cols.map(c => c.getBoundingClientRect());
    const dayIndexStart = Math.max(0, cols.indexOf(col));

    const rect = col.getBoundingClientRect();
    const totalMin = (this.hourEnd - this.hourStart) * 60;
    const start = ev.start ? new Date(ev.start) : new Date(day);
    const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + 60 * 60 * 1000);
    const dur = Math.max(15, this.toMinutes(end) - this.toMinutes(start));
    const y = e.clientY - rect.top;
    const startMin0 = Math.max(0, Math.min(totalMin - dur, (y / rect.height) * totalMin));
    this.dragging = { weekStart: this.getWeekStart(day), dayRects: rects, dayIndexStart, day, ev, duration: dur, startMin0, colRect: rect };
    const canvas = this.getCanvasFromCol(col); if (canvas) this.ensureGhost(canvas);
    document.addEventListener('mousemove', this.onDocMouseMove);
    document.addEventListener('mouseup', this.onDocMouseUp, { once: true });
    e.preventDefault();
  };
  private onDocMouseMove = (e: MouseEvent) => {
    const totalMin = (this.hourEnd - this.hourStart) * 60;
    if (this.dragging) {
      const d = this.dragging;
      // 确定当前列
      let idx = d.dayRects.findIndex(r => e.clientX >= r.left && e.clientX <= r.right);
      if (idx < 0) {
        let best = 0; let minDist = Infinity; d.dayRects.forEach((r,i)=>{ const cx=(r.left+r.right)/2; const dist=Math.abs(e.clientX-cx); if(dist<minDist){minDist=dist;best=i;} }); idx = best;
      }
      const targetRect = d.dayRects[idx] || d.colRect;
      const y = Math.max(0, Math.min(targetRect.height, e.clientY - targetRect.top));
      const sMin = Math.max(0, Math.min(totalMin - d.duration, this.quantize((y/targetRect.height)*totalMin, this.stepMinutes)));
      const top = (sMin/totalMin)*100; const height = (d.duration/totalMin)*100;
      // 插入到对应列的 canvas
      const el = this.el; const cols = Array.from(el.querySelectorAll('.ldc-day-col')) as HTMLElement[]; const col = cols[idx] || cols[d.dayIndexStart];
      const canvas = col?.querySelector('.ldc-day-canvas') as HTMLElement | null;
      if (canvas) {
        const g = this.ensureGhost(canvas);
        Object.assign(g.style, { top: `${top}%`, height: `${height}%`, left: `0%`, width: `100%` });
      }
      e.preventDefault(); return;
    }
    if (this.resizing) {
      const rz = this.resizing;
      let idx = rz.dayRects.findIndex(r => e.clientX >= r.left && e.clientX <= r.right);
      if (idx < 0) { let best=0,minDist=Infinity; rz.dayRects.forEach((r,i)=>{const cx=(r.left+r.right)/2; const dist=Math.abs(e.clientX-cx); if(dist<minDist){minDist=dist;best=i;}}); idx=best; }
      const targetRect = rz.dayRects[idx] || rz.colRect;
      const y = Math.max(0, Math.min(targetRect.height, e.clientY - targetRect.top));
      const min = this.quantize((y/targetRect.height)*totalMin, this.stepMinutes);
      const dayBase = new Date(rz.weekStart); dayBase.setDate(rz.weekStart.getDate() + idx);
      const baseStart = new Date(dayBase.getFullYear(), dayBase.getMonth(), dayBase.getDate(), this.hourStart, 0, 0, 0);
      const point = new Date(baseStart); point.setMinutes(baseStart.getMinutes() + Math.max(0, Math.min(totalMin, min)));
      let newStart = new Date(rz.originalStart); let newEnd = new Date(rz.originalEnd);
      if (rz.mode === 'start') {
        const minDelta=15; const latest=new Date(newEnd); latest.setMinutes(newEnd.getMinutes()-minDelta); if (point<latest) newStart=point; else newStart=latest;
      } else {
        const minDelta=15; const earliest=new Date(newStart); earliest.setMinutes(newStart.getMinutes()+minDelta); if (point>earliest) newEnd=point; else newEnd=earliest;
      }
      const sMin = Math.max(0, Math.min(totalMin, this.toMinutes(newStart)-this.hourStart*60));
      const eMin = Math.max(0, Math.min(totalMin, this.toMinutes(newEnd)-this.hourStart*60));
      const top = (Math.min(sMin,eMin)/totalMin)*100; const height = (Math.max(15, Math.abs(eMin-sMin))/totalMin)*100;
      const el = this.el; const cols = Array.from(el.querySelectorAll('.ldc-day-col')) as HTMLElement[]; const col = cols[idx] || cols[rz.dayIndexStart];
      const canvas = col?.querySelector('.ldc-day-canvas') as HTMLElement | null;
      if (canvas) { const g = this.ensureGhost(canvas); Object.assign(g.style, { top: `${top}%`, height: `${height}%`, left: `0%`, width: `100%` }); }
      e.preventDefault(); return;
    }
  };
  private onDocMouseUp = (e: MouseEvent) => {
    const rz = this.resizing; this.resizing = undefined;
    const d = this.dragging; this.dragging = undefined;
    document.removeEventListener('mousemove', this.onDocMouseMove);
    this.clearGhost();
    if (rz) {
      // 完成 Resize
      const totalMin = (this.hourEnd - this.hourStart) * 60;
      // 列判定
      let idx = rz.dayRects.findIndex(r => e.clientX >= r.left && e.clientX <= r.right);
      if (idx < 0) {
        let best = 0; let minDist = Infinity;
        rz.dayRects.forEach((r, i) => { const cx = (r.left + r.right) / 2; const dist = Math.abs(e.clientX - cx); if (dist < minDist) { minDist = dist; best = i; } });
        idx = best;
      }
      const targetRect = rz.dayRects[idx] || rz.colRect;
      let y = Math.max(0, Math.min(targetRect.height, e.clientY - targetRect.top));
      let min = (y / targetRect.height) * totalMin;
      min = this.quantize(min, this.stepMinutes);
      const dayBase = new Date(rz.weekStart); dayBase.setDate(rz.weekStart.getDate() + idx);
      const baseStart = new Date(dayBase.getFullYear(), dayBase.getMonth(), dayBase.getDate(), this.hourStart, 0, 0, 0);
      const point = new Date(baseStart); point.setMinutes(baseStart.getMinutes() + Math.max(0, Math.min(totalMin, min)));
      let newStart = new Date(rz.originalStart); let newEnd = new Date(rz.originalEnd);
      if (rz.mode === 'start') {
        // 新起点不能超过原终点 - 最小块
        const minDelta = 15; const latest = new Date(newEnd); latest.setMinutes(newEnd.getMinutes() - minDelta);
        if (point < latest) newStart = point; else newStart = latest;
      } else {
        const minDelta = 15; const earliest = new Date(newStart); earliest.setMinutes(newStart.getMinutes() + minDelta);
        if (point > earliest) newEnd = point; else newEnd = earliest;
      }
      this.ldesignEventResize.emit({ id: rz.ev.id, title: rz.ev.title, oldStart: rz.originalStart.toISOString(), oldEnd: rz.originalEnd.toISOString(), newStart: newStart.toISOString(), newEnd: newEnd.toISOString() });
      e.preventDefault();
      return;
    }
    if (!d) return;

    // 选择最终列（可跨列）
    let idx = d.dayRects.findIndex(r => e.clientX >= r.left && e.clientX <= r.right);
    if (idx < 0) {
      let best = 0; let minDist = Infinity;
      d.dayRects.forEach((r, i) => { const cx = (r.left + r.right) / 2; const dist = Math.abs(e.clientX - cx); if (dist < minDist) { minDist = dist; best = i; } });
      idx = best;
    }
    const targetRect = d.dayRects[idx] || d.colRect;

    const totalMin = (this.hourEnd - this.hourStart) * 60;
    let y = Math.max(0, Math.min(targetRect.height, e.clientY - targetRect.top));
    let startMin = (y / targetRect.height) * totalMin;
    startMin = Math.max(0, Math.min(totalMin - d.duration, this.quantize(startMin, this.stepMinutes)));

    const newDay = new Date(d.weekStart); newDay.setDate(d.weekStart.getDate() + idx);
    const newStart = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), 0, 0, 0, 0);
    newStart.setMinutes(this.hourStart * 60 + startMin);
    const newEnd = new Date(newStart); newEnd.setMinutes(newStart.getMinutes() + d.duration);

    const oldStart = d.ev.start ? new Date(d.ev.start) : undefined;
    const oldEnd = d.ev.end ? new Date(d.ev.end) : undefined;
    this.ldesignEventDrop.emit({ id: d.ev.id, title: d.ev.title, oldStart: oldStart?.toISOString(), oldEnd: oldEnd?.toISOString(), newStart: newStart.toISOString(), newEnd: newEnd.toISOString(), allDay: !!d.ev.allDay });
    e.preventDefault();
  };

  private layoutDay(events: CalEvent[], day: Date) {
    // 过滤到当天且非全天的事件（跨日或全天的在 B 阶段处理，这里忽略或视为全天）
    const startOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    const timed = events.filter(e => e.start && e.end && !e.allDay).map(e => ({
      raw: e,
      start: new Date(e.start!),
      end: new Date(e.end!)
    })).filter(e => e.end >= startOfDay && e.start <= endOfDay);

    const totalMin = (this.hourEnd - this.hourStart) * 60;
    // 简单重叠布局
    timed.sort((a,b) => (+a.start) - (+b.start));
    const lanesEnd: number[] = [];
    const placed: any[] = [];
    for (const ev of timed) {
      const sMin = Math.max(0, this.toMinutes(ev.start) - this.hourStart * 60);
      const eMin = Math.min(totalMin, this.toMinutes(ev.end) - this.hourStart * 60);
      const dur = Math.max(15, eMin - sMin); // 至少 15 分钟高度
      let lane = 0;
      while (lane < lanesEnd.length && lanesEnd[lane] > sMin) lane++;
      lanesEnd[lane] = eMin;
      placed.push({ ev, lane, lanes: lanesEnd.length, sMin, eMin, dur });
    }
    return placed; // {lane, lanes, sMin, dur, ev}
  }

  private groupEventsByDay(range: Date[]): Map<string, CalEvent[]> {
    const map = new Map<string, CalEvent[]>();
    for (const d of range) { map.set(formatDate(d, 'YYYY-MM-DD'), []); }
    for (const e of this.allEvents) {
      if (e.date) {
        const key = e.date;
        if (map.has(key)) map.get(key)!.push(e);
      } else if (e.start) {
        const key = formatDate(new Date(e.start), 'YYYY-MM-DD');
        if (map.has(key)) map.get(key)!.push(e);
      }
    }
    return map;
  }

  private renderAllDayArea(days: Date[]) {
    if (!this.showAllDay) return null;
    const start = this.getWeekStart(days[0]);
    type Seg = { ev: CalEvent; s: number; e: number };
    const segs: Seg[] = [];
    for (const e of this.allEvents) {
      const hasTime = !!(e.start && e.end);
      if (!e.allDay && !hasTime) continue;
      const sDate = e.allDay && e.date ? new Date(e.date + 'T00:00:00') : (hasTime ? new Date(e.start!) : null);
      const eDate = hasTime ? new Date(e.end!) : (e.date ? new Date(e.date + 'T23:59:59') : null);
      if (!sDate || !eDate) continue;
      // 计算在本周内的起止索引（0..6），裁剪到周边界
      const sIdx = Math.max(0, Math.floor((+new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()) - +start)/86400000));
      const eIdx = Math.min(6, Math.floor((+new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()) - +start)/86400000));
      if (sIdx > 6 || eIdx < 0) continue;
      segs.push({ ev: e, s: sIdx, e: eIdx });
    }
    // 布局到车道
    segs.sort((a,b) => a.s - b.s || (b.e - b.s) - (a.e - a.s));
    const lanes: Seg[][] = [];
    for (const s of segs) {
      let placed = false;
      for (const lane of lanes) {
        if (lane.length === 0 || lane[lane.length-1].e < s.s) { lane.push(s); placed = true; break; }
      }
      if (!placed) lanes.push([s]);
    }
    const rows = Math.min(this.maxAllDayRows, lanes.length || 0);
    const overflowByDay = new Map<number, CalEvent[]>();
    if (lanes.length > rows) {
      const hidden = lanes.slice(rows);
      for (const lane of hidden) {
        for (const seg of lane) {
          for (let i = seg.s; i <= seg.e; i++) {
            if (!overflowByDay.has(i)) overflowByDay.set(i, []);
            overflowByDay.get(i)!.push(seg.ev);
          }
        }
      }
    }

    return (
      <div class="ldc-all-day" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', gridAutoRows: '24px' }}>
        <div class="ldc-time-gutter">全天</div>
        {Array.from({ length: rows }).map((_, r) => (
          <div class="ldc-all-day-row" style={{ gridColumn: '1 / -1' }}>
            <div />
            {days.map((_d, idx) => <div />)}
          </div>
        ))}
        {Array.from({ length: rows }).map((_, r) => (
          lanes[r]?.map(seg => (
            <div class="ldc-bar" style={{ gridColumn: `${seg.s + 2} / span ${seg.e - seg.s + 1}`, gridRow: `${r + 1}` }} title={seg.ev.title}>
              <span class="ldc-bar-dot" style={{ background: seg.ev.color || '#1677ff' }}></span>
              <span class="ldc-bar-title">{seg.ev.title}</span>
            </div>
          ))
        ))}
        {days.map((_d, idx) => (
          overflowByDay.has(idx) ? (
            <ldesign-popup append-to="body" placement="bottom-start" trigger="click" arrow={true}>
              <div slot="trigger" class="ldc-more" style={{ gridColumn: `${idx + 2} / span 1`, gridRow: `${rows + 1}` }}>+{overflowByDay.get(idx)!.length}</div>
              <div class="ldc-more-panel">
                {(overflowByDay.get(idx) || []).map(ev => (
                  <div class="ldc-more-item">
                    <span class="ldc-bar-dot" style={{ background: ev.color || '#1677ff' }}></span>
                    <span class="ldc-more-text" title={ev.title}>{ev.title}</span>
                  </div>
                ))}
              </div>
            </ldesign-popup>
          ) : null
        ))}
      </div>
    );
  }

  private openMore(dayIndex: number, items: CalEvent[]) {
    // 简单实现：用 alert 弹出列表（占位）。如需使用 ldesign-popup，可在后续增强
    const text = items.map(i => `• ${i.title}`).join('\n');
    try { alert(`更多日程\n\n${text}`); } catch {}
  }

  private onResizeHandleMouseDown = (e: MouseEvent, mode: 'start' | 'end', day: Date, ev: CalEvent) => {
    if (!this.resizableEvents || e.button !== 0) return;
    const col = (e.currentTarget as HTMLElement)?.closest('.ldc-day-col') as HTMLElement | null;
    if (!col) return;
    const body = col.parentElement as HTMLElement | null; // .ldc-schedule-body
    const cols = body ? Array.from(body.querySelectorAll('.ldc-day-col')) as HTMLElement[] : [col];
    const rects = cols.map(c => c.getBoundingClientRect());
    const dayIndexStart = Math.max(0, cols.indexOf(col));
    const rect = col.getBoundingClientRect();
    const originalStart = ev.start ? new Date(ev.start) : new Date(day);
    const originalEnd = ev.end ? new Date(ev.end) : new Date(originalStart.getTime() + 60 * 60 * 1000);
    this.resizing = { mode, weekStart: this.getWeekStart(day), dayRects: rects, dayIndexStart, day, ev, originalStart, originalEnd, colRect: rect };
    document.addEventListener('mousemove', this.onDocMouseMove);
    document.addEventListener('mouseup', this.onDocMouseUp, { once: true });
    e.preventDefault();
  };

  private renderWeekView() {
    const anchor = this.anchorDate;
    const days = this.getDaysOfWeek(anchor);
    const dayKeys = days.map(d => formatDate(d as any, 'YYYY-MM-DD'));
    const byDay = this.groupEventsByDay(days);
    const totalMin = (this.hourEnd - this.hourStart) * 60;
    const slotPx = 24; // 每 stepMinutes 的像素高度
    const bodyH = (totalMin / this.stepMinutes) * slotPx;
    const hours = Array.from({ length: this.hourEnd - this.hourStart }, (_, i) => this.hourStart + i);

    return (
      <div class="ldc-schedule">
        <div class="ldc-schedule-header">
          <div class="ldc-time-gutter" />
          {days.map((d, idx) => (
            <div class="ldc-day-header" key={`dh-${idx}`}>
              <div class="ldc-day-header-top">
                <div class="ldc-day-week">{WEEKDAY_NAMES[(d.getDay()+7)%7]}</div>
                <div class="ldc-day-date">{String(d.getDate()).padStart(2,'0')}</div>
              </div>
            </div>
          ))}
        </div>
        {this.renderAllDayArea(days)}
        <div class="ldc-schedule-body" style={{ height: `${bodyH}px` }}>
          <div class="ldc-time-gutter">
            {hours.map(h => (
              <div class="ldc-hour" style={{ height: `${(60/this.stepMinutes)*slotPx}px` }}>{String(h).padStart(2,'0')}:00</div>
            ))}
          </div>
          {days.map((d, idx) => {
            const key = dayKeys[idx];
            const placed = this.layoutDay(byDay.get(key) || [], d);
            return (
              <div class="ldc-day-col" key={`dc-${idx}`}>
                <div class="ldc-day-canvas">
                  {hours.map((h, i) => (
                    <div class="ldc-hour-line" style={{ top: `${((i*60)/totalMin)*100}%` }} />
                  ))}
                  {placed.map((p) => {
                    const top = (p.sMin/totalMin)*100;
                    const height = (p.dur/totalMin)*100;
                    const width = 100 / p.lanes;
                    const left = width * p.lane;
                    return (
                      <div class={{ 'ldc-event-block': true, 'draggable': this.draggableEvents, 'resizable': this.resizableEvents }} onMouseDown={(evm) => this.onEventBlockMouseDown(evm as any, d, p.ev.raw)} style={{ top: `${top}%`, height: `${height}%`, left: `${left}%`, width: `${width}%`, borderLeft: `3px solid ${p.ev.raw.color || '#1677ff'}` }} title={p.ev.raw.title}>
                        {this.resizableEvents && (<div class="ldc-resize-handle ldc-resize-handle--start" onMouseDown={(evm) => this.onResizeHandleMouseDown(evm as any, 'start', d, p.ev.raw)} />)}
                        <div class="ldc-event-block-title">{p.ev.raw.title}</div>
                        {this.resizableEvents && (<div class="ldc-resize-handle ldc-resize-handle--end" onMouseDown={(evm) => this.onResizeHandleMouseDown(evm as any, 'end', d, p.ev.raw)} />)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  private renderDayView() {
    const a = this.anchorDate;
    // day view 等价于 week 的单列
    return (
      <div class="ldc-day-view">
        {this.renderWeekView()}
      </div>
    );
  }

  private renderEventsFor(key: string) {
    const list = this.eventMap.get(key) || [];
    const max = Math.max(0, this.maxEventsPerCell);
    const items = list.slice(0, max);
    const overflow = list.length - items.length;
    return (
      <div class="ldc-events">
        {items.map((ev) => (
          <div class={{ 'ldc-event': true, 'draggable': this.draggableEvents }}
               onClick={(e) => { e.stopPropagation(); this.ldesignEventClick.emit({ event: ev }); }}
               onMouseDown={(e) => this.onMonthEventMouseDown(e as any, key, ev)}>
            <span class="ldc-event-dot" style={{ background: ev.color || '#1677ff' }} />
            <span class="ldc-event-title" title={ev.title}>{ev.title}</span>
          </div>
        ))}
        {overflow > 0 ? <div class="ldc-event-more">+{overflow}</div> : null}
      </div>
    );
  }

  private isMultiOrAllDay(e: CalEvent): boolean {
    if (e.allDay) return true;
    if (e.start && e.end) {
      const s = new Date(e.start); const t = new Date(e.end);
      const sd = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const td = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      return (+td - +sd) >= 86400000; // >= 1 day
    }
    return false;
  }

  private renderMonthBars(rows: any[][]) {
    const firstRowFirst = rows[0]?.[0]?.date as Date;
    if (!firstRowFirst) return null;
    return (
      <div class="ldc-month-bars">
        {rows.map((week, idx) => {
          const rowStart = new Date(week[0].date.getFullYear(), week[0].date.getMonth(), week[0].date.getDate());
          type Seg = { ev: CalEvent; s: number; e: number };
          const segs: Seg[] = [];
          for (const e of this.allEvents) {
            if (!this.isMultiOrAllDay(e)) continue;
            let sDate: Date | null = null; let eDate: Date | null = null;
            if (e.start && e.end) { sDate = new Date(e.start); eDate = new Date(e.end); }
            else if (e.date) { sDate = new Date(e.date + 'T00:00:00'); eDate = new Date(e.date + 'T23:59:59'); }
            if (!sDate || !eDate) continue;
            const sIdx = Math.max(0, Math.floor((+new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()) - +rowStart)/86400000));
            const eIdx = Math.min(6, Math.floor((+new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()) - +rowStart)/86400000));
            if (sIdx > 6 || eIdx < 0) continue;
            segs.push({ ev: e, s: sIdx, e: eIdx });
          }
          segs.sort((a,b)=> a.s - b.s || (b.e-a.e));
          const lanes: Seg[][] = [];
          for (const s of segs) {
            let placed=false; for (const lane of lanes) { if (lane.length===0 || lane[lane.length-1].e < s.s) { lane.push(s); placed=true; break; } }
            if (!placed) lanes.push([s]);
          }
          const rowsLimit = this.maxAllDayRows;
          const overflowPerDay = new Map<number, CalEvent[]>();
          if (lanes.length > rowsLimit) {
            const hidden = lanes.slice(rowsLimit);
            for (const lane of hidden) for (const seg of lane) for (let i=seg.s;i<=seg.e;i++) { if(!overflowPerDay.has(i)) overflowPerDay.set(i, []); overflowPerDay.get(i)!.push(seg.ev); }
          }
          return (
            <div class="ldc-month-bars-row" key={`mb-${idx}`}>
              {Array.from({ length: rowsLimit }).map((_, r) => (
                lanes[r]?.map(seg => (
                  <div class="ldc-month-bar" title={seg.ev.title} style={{ gridColumn: `${seg.s + 1} / span ${seg.e - seg.s + 1}` }}
                       onMouseDown={(evm) => this.onMonthBarMouseDown(evm as any, seg.ev, rowStart, seg.e - seg.s + 1)}>
                    {this.resizableEvents && (
                      <div class="ldc-month-handle ldc-month-handle--start" onMouseDown={(evm) => this.onMonthBarResizeMouseDown(evm as any, seg.ev, 'start', rowStart, seg.e - seg.s + 1)} />
                    )}
                    <span class="ldc-bar-dot" style={{ background: seg.ev.color || '#1677ff' }}></span>
                    <span class="ldc-bar-title">{seg.ev.title}</span>
                    {this.resizableEvents && (
                      <div class="ldc-month-handle ldc-month-handle--end" onMouseDown={(evm) => this.onMonthBarResizeMouseDown(evm as any, seg.ev, 'end', rowStart, seg.e - seg.s + 1)} />
                    )}
                  </div>
                ))
              ))}
              {week.map((_d, i)=> (
                overflowPerDay.has(i) ? (
                  <ldesign-popup append-to="body" placement="bottom-start" trigger="click" arrow={true}>
                    <div slot="trigger" class="ldc-month-more" style={{ gridColumn: `${i + 1} / span 1` }}>+{overflowPerDay.get(i)!.length}</div>
                    <div class="ldc-more-panel">
                      {(overflowPerDay.get(i) || []).map(ev => (
                        <div class="ldc-more-item">
                          <span class="ldc-bar-dot" style={{ background: ev.color || '#1677ff' }}></span>
                          <span class="ldc-more-text" title={ev.title}>{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  </ldesign-popup>
                ) : null
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  private onMonthEventMouseDown(e: MouseEvent, oldKey: string, ev: CalEvent) {
    if (!this.draggableEvents) return;
    if (e.button !== 0) return;
    this.monthDragging = { ev, oldDate: oldKey };
    const up = (evt: MouseEvent) => {
      const el = this.el;
      const days = Array.from(el.querySelectorAll('.ldc-week-row .ldc-day')) as HTMLElement[];
      let targetKey = '';
      for (const d of days) {
        const r = d.getBoundingClientRect();
        if (evt.clientX >= r.left && evt.clientX <= r.right && evt.clientY >= r.top && evt.clientY <= r.bottom) {
          targetKey = d.getAttribute('data-date') || '';
          break;
        }
      }
      if (this.monthDragging && targetKey && targetKey !== this.monthDragging.oldDate) {
        const old = this.monthDragging.oldDate;
        const newStart = new Date(targetKey + 'T00:00:00');
        const newEnd = new Date(targetKey + 'T23:59:59');
        const oldStart = new Date(old + 'T00:00:00');
        const oldEnd = new Date(old + 'T23:59:59');
        this.ldesignEventDrop.emit({ id: this.monthDragging.ev.id, title: this.monthDragging.ev.title, oldStart: oldStart.toISOString(), oldEnd: oldEnd.toISOString(), newStart: newStart.toISOString(), newEnd: newEnd.toISOString(), allDay: true });
      }
      this.monthDragging = undefined;
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mouseup', up, { once: true });
  }

  private onMonthBarResizeMouseDown(e: MouseEvent, ev: CalEvent, mode: 'start'|'end', rowStart: Date, spanDays: number) {
    if (!this.resizableEvents) return;
    if (e.button !== 0) return;
    const rowStartKey = formatDate(rowStart as any, 'YYYY-MM-DD');
    const oldStart = ev.start ? new Date(ev.start) : (ev.date ? new Date(ev.date + 'T00:00:00') : new Date(rowStart));
    this.monthBarResizing = { ev, mode, rowStartKey, lengthDays: Math.max(1, spanDays), oldStartKey: formatDate(oldStart as any, 'YYYY-MM-DD') };
    const onUp = (evt: MouseEvent) => {
      const el = this.el;
      // 仅在当前周行内寻找目标单元格（更稳妥）
      const rows = Array.from(el.querySelectorAll('.ldc-month-bars-row')) as HTMLElement[];
      // 找到与 rowStartKey 对应的那一行（通过相邻 .ldc-days 的同周行单元格匹配）
      const dayRows = Array.from(el.querySelectorAll('.ldc-week-row')) as HTMLElement[];
      let targetRowIdx = -1;
      for (let i=0;i<dayRows.length;i++) {
        const firstCell = dayRows[i].querySelector('.ldc-day') as HTMLElement | null;
        const key = firstCell?.getAttribute('data-date') || '';
        if (key === rowStartKey) { targetRowIdx = i; break; }
      }
      let targetKey = '';
      if (targetRowIdx >= 0) {
        const cells = Array.from(dayRows[targetRowIdx].querySelectorAll('.ldc-day')) as HTMLElement[];
        for (const c of cells) {
          const r = c.getBoundingClientRect();
          if (evt.clientX >= r.left && evt.clientX <= r.right && evt.clientY >= r.top && evt.clientY <= r.bottom) { targetKey = c.getAttribute('data-date') || ''; break; }
        }
      }
      if (this.monthBarResizing && targetKey) {
        const { mode, lengthDays, oldStartKey } = this.monthBarResizing;
        let newStart = new Date(oldStartKey + 'T00:00:00');
        let newEnd = new Date(oldStartKey + 'T23:59:59');
        if (mode === 'start') {
          newStart = new Date(targetKey + 'T00:00:00');
          newEnd = new Date(newStart); newEnd.setDate(newEnd.getDate() + lengthDays - 1); newEnd.setHours(23,59,59,0);
        } else {
          const startDate = new Date(oldStartKey + 'T00:00:00');
          newEnd = new Date(targetKey + 'T23:59:59');
          // 确保结束不小于开始
          if (newEnd < startDate) newEnd = new Date(startDate);
          newStart = startDate;
        }
        const oldStartDate = new Date(oldStartKey + 'T00:00:00');
        const oldEndDate = new Date(oldStartKey + 'T23:59:59'); oldEndDate.setDate(oldEndDate.getDate() + lengthDays - 1); oldEndDate.setHours(23,59,59,0);
        this.ldesignEventResize.emit({ id: this.monthBarResizing.ev.id, title: this.monthBarResizing.ev.title, oldStart: oldStartDate.toISOString(), oldEnd: oldEndDate.toISOString(), newStart: newStart.toISOString(), newEnd: newEnd.toISOString() });
      }
      this.monthBarResizing = undefined;
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mouseup', onUp, { once: true });
    e.stopPropagation();
  }

  private onMonthBarMouseDown(e: MouseEvent, ev: CalEvent, rowStart: Date, spanDays: number) {
    if (!this.draggableEvents) return;
    if (e.button !== 0) return;
    const oldStart = ev.start ? new Date(ev.start) : (ev.date ? new Date(ev.date + 'T00:00:00') : new Date(rowStart));
    const length = Math.max(1, spanDays);
    this.monthBarDragging = { ev, lengthDays: length, oldStart: formatDate(oldStart as any, 'YYYY-MM-DD') };
    const onUp = (evt: MouseEvent) => {
      const el = this.el;
      const cells = Array.from(el.querySelectorAll('.ldc-week-row .ldc-day')) as HTMLElement[];
      let targetKey = '';
      for (const c of cells) {
        const r = c.getBoundingClientRect();
        if (evt.clientX >= r.left && evt.clientX <= r.right && evt.clientY >= r.top && evt.clientY <= r.bottom) {
          targetKey = c.getAttribute('data-date') || '';
          break;
        }
      }
      if (this.monthBarDragging && targetKey) {
        const newStart = new Date(targetKey + 'T00:00:00');
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + this.monthBarDragging.lengthDays - 1);
        newEnd.setHours(23,59,59,0);
        const oldKey = this.monthBarDragging.oldStart;
        const oldStartDate = new Date(oldKey + 'T00:00:00');
        const oldEndDate = new Date(oldStartDate);
        oldEndDate.setDate(oldEndDate.getDate() + this.monthBarDragging.lengthDays - 1);
        oldEndDate.setHours(23,59,59,0);
        this.ldesignEventDrop.emit({ id: this.monthBarDragging.ev.id, title: this.monthBarDragging.ev.title, oldStart: oldStartDate.toISOString(), oldEnd: oldEndDate.toISOString(), newStart: newStart.toISOString(), newEnd: newEnd.toISOString(), allDay: true });
      }
      this.monthBarDragging = undefined;
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mouseup', onUp, { once: true });
  }

  private renderMonthGrid() {
    const dates = generateCalendarDates(
      this.viewYear,
      this.viewMonth,
      this.selected || null,
      this.parsedMin,
      this.parsedMax,
      this.disabledDate,
      this.showWeekNumbers,
      this.firstDayOfWeek
    );

    const rows: Array<any[]> = [];
    for (let i = 0; i < dates.length; i += 7) {
      rows.push(dates.slice(i, i + 7));
    }

    return (
      <div>
        {this.renderMonthBars(rows)}
        <div class={{ 'ldc-days': true, 'ldc-days--with-weeks': this.showWeekNumbers }}>
          {rows.map((week, rIdx) => (
            <div class="ldc-week-row" key={`r-${rIdx}`}>
              {this.showWeekNumbers ? (
                <div class="ldc-weeknum">{week[0].weekNumber}</div>
              ) : null}
              {week.map((d, cIdx) => {
                const key = formatDate(d.date as any, 'YYYY-MM-DD');
                const lunar = this.getLunarText(d.date);
                return (
                  <button
                    key={`d-${rIdx}-${cIdx}`}
                    data-date={key}
                    class={{
                      'ldc-day': true,
                      'other': !d.isCurrentMonth,
                      'today': d.isToday,
                      'selected': d.isSelected,
                      'disabled': d.isDisabled,
                    }}
                    disabled={d.isDisabled}
                    onClick={() => this.handleDateClick(d.date, d.isDisabled)}
                    type="button"
                    aria-label={`${d.year}-${d.month + 1}-${d.day}`}
                  >
                    <div class="ldc-day-top">
                      <span class="ldc-day-num">{String(d.day).padStart(2,'0')}</span>
                    </div>
                    {this.showLunar ? <div class="ldc-lunar">{lunar}</div> : null}
                    {this.renderEventsFor(key)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  private renderYearGrid() {
    const months = generateMonthList(this.viewYear, this.selected || null, this.parsedMin, this.parsedMax);
    return (
      <div class="ldc-year-grid">
        {months.map((m) => (
          <button class={{ 'ldc-month-item': true, 'selected': m.isSelected, 'current': m.isCurrent, 'disabled': m.isDisabled }} disabled={m.isDisabled} type="button" onClick={() => { this.viewMonth = m.month; this.view = 'month'; }}>
            {m.label}
          </button>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div class="ldesign-calendar">
        {this.renderHeader()}
        <div class={{ 'ldc-date': true, 'ldc-date--with-weeks': this.showWeekNumbers }}>
          {this.view === 'month' ? (
            [this.renderWeekdays(), this.renderMonthGrid()]
          ) : this.view === 'year' ? (
            this.renderYearGrid()
          ) : this.view === 'week' ? (
            this.renderWeekView()
          ) : (
            this.renderDayView()
          )}
        </div>
      </div>
    );
  }
}

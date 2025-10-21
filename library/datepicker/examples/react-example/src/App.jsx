import { useState, useCallback } from 'react';
import { DatePicker } from '@ldesign/datepicker-react';
import { zhCN, enUS, jaJP, createShortcuts } from '@ldesign/datepicker-shared';

function App() {
  // 主题
  const [theme, setTheme] = useState('light');
  
  // 语言
  const [currentLang, setCurrentLang] = useState('zh-CN');
  const languages = [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
    { label: '日本語', value: 'ja-JP' },
  ];
  
  const locales = {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP,
  };
  
  const locale = locales[currentLang];
  
  // 所有选择器的值
  const [values, setValues] = useState({
    date: null,
    daterange: [null, null],
    month: null,
    monthrange: [null, null],
    year: null,
    yearrange: [null, null],
    datetime: null,
    datetimerange: [null, null],
    time: null,
    week: null,
    quarter: null,
    dates: [],
    disabled: null,
    shortcuts: [null, null],
    format: null,
    clearable: null,
  });
  
  // 事件日志
  const [eventLogs, setEventLogs] = useState([]);
  
  // 快捷选项
  const shortcutsPresets = createShortcuts();
  const shortcuts = [
    shortcutsPresets.today,
    shortcutsPresets.last7Days,
    shortcutsPresets.last30Days,
    shortcutsPresets.thisMonth,
    shortcutsPresets.lastMonth,
  ];
  
  // 禁用日期函数
  const disabledDate = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 禁用过去的日期
    if (date < today) return true;
    
    // 禁用周末
    const day = date.getDay();
    return day === 0 || day === 6;
  }, []);
  
  // 主题切换
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    addLog('主题切换', `切换到${newTheme === 'light' ? '亮色' : '暗色'}主题`);
  };
  
  // 语言切换
  const switchLanguage = (lang) => {
    setCurrentLang(lang);
    addLog('语言切换', `切换到${languages.find(l => l.value === lang)?.label}`);
  };
  
  // 值更新
  const updateValue = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };
  
  // 添加日志
  const addLog = (type, message) => {
    const now = new Date();
    const time = now.toLocaleTimeString();
    setEventLogs(prev => {
      const newLogs = [{ time, type, message }, ...prev];
      return newLogs.slice(0, 10);
    });
  };
  
  // 格式化输出
  const formatOutput = (value) => {
    return value ? value.toLocaleDateString() : '未选择';
  };
  
  const formatRangeOutput = (value) => {
    if (!value || !Array.isArray(value)) return '未选择';
    const [start, end] = value;
    return `${start ? start.toLocaleDateString() : ''} 至 ${end ? end.toLocaleDateString() : ''}`;
  };
  
  const formatMonthOutput = (value) => {
    return value ? `${value.getFullYear()}年${value.getMonth() + 1}月` : '未选择';
  };
  
  const formatYearOutput = (value) => {
    return value ? `${value.getFullYear()}年` : '未选择';
  };
  
  const formatDatetimeOutput = (value) => {
    return value ? value.toLocaleString() : '未选择';
  };
  
  const formatTimeOutput = (value) => {
    return value ? value.toLocaleTimeString() : '未选择';
  };
  
  const formatMonthRangeOutput = (value) => {
    if (!value || !Array.isArray(value)) return '未选择';
    const [start, end] = value;
    return `${start ? formatMonthOutput(start) : ''} 至 ${end ? formatMonthOutput(end) : ''}`;
  };
  
  const formatYearRangeOutput = (value) => {
    if (!value || !Array.isArray(value)) return '未选择';
    const [start, end] = value;
    return `${start ? formatYearOutput(start) : ''} 至 ${end ? formatYearOutput(end) : ''}`;
  };
  
  const formatDatetimeRangeOutput = (value) => {
    if (!value || !Array.isArray(value)) return '未选择';
    const [start, end] = value;
    return `${start ? start.toLocaleString() : ''} 至 ${end ? end.toLocaleString() : ''}`;
  };
  
  const formatWeekOutput = (value) => {
    if (!value) return '未选择';
    const weekNumber = getWeekNumber(value);
    return `${value.getFullYear()}年 第${weekNumber}周`;
  };
  
  const formatQuarterOutput = (value) => {
    if (!value) return '未选择';
    const quarter = Math.floor(value.getMonth() / 3) + 1;
    return `${value.getFullYear()}年 Q${quarter}`;
  };
  
  const formatDatesOutput = (value) => {
    if (!value || !Array.isArray(value) || value.length === 0) return '未选择';
    if (value.length === 1) return value[0].toLocaleDateString();
    return `已选择 ${value.length} 个日期`;
  };
  
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  
  return (
    <div className="container">
      <h1>🗓️ LDesign DatePicker</h1>
      <p className="subtitle">React 完整功能演示 - 16种选择模式 + Hooks</p>
      
      {/* 控制按钮 */}
      <div className="controls">
        <button className="btn" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? '暗色主题' : '亮色主题'}
        </button>
        {languages.map(lang => (
          <button
            key={lang.value}
            className={`btn ${currentLang === lang.value ? 'active' : ''}`}
            onClick={() => switchLanguage(lang.value)}
          >
            {lang.label}
          </button>
        ))}
      </div>
      
      <div className="grid">
        {/* 1. 基础日期选择 */}
        <div className="card">
          <h3 className="card-title">
            <span>📅 基础日期选择</span>
          </h3>
          <p className="description">最常用的单个日期选择模式</p>
          <DatePicker
            value={values.date}
            onChange={(val) => {
              updateValue('date', val);
              addLog('change', `date: ${val}`);
            }}
            type="date"
            locale={locale}
            placeholder="请选择日期"
          />
          <div className="output">
            <div className="output-label">选中值：</div>
            {formatOutput(values.date)}
          </div>
        </div>
        
        {/* 2. 日期范围 */}
        <div className="card">
          <h3 className="card-title">
            <span>📆 日期范围选择</span>
          </h3>
          <p className="description">选择开始和结束日期</p>
          <DatePicker
            value={values.daterange}
            onChange={(val) => updateValue('daterange', val)}
            type="daterange"
            locale={locale}
            startPlaceholder="开始日期"
            endPlaceholder="结束日期"
            rangeSeparator="→"
          />
          <div className="output">
            <div className="output-label">选中范围：</div>
            {formatRangeOutput(values.daterange)}
          </div>
        </div>
        
        {/* 3. 月份选择 */}
        <div className="card">
          <h3 className="card-title">
            <span>📊 月份选择</span>
          </h3>
          <p className="description">按月份粒度选择</p>
          <DatePicker
            value={values.month}
            onChange={(val) => updateValue('month', val)}
            type="month"
            locale={locale}
            placeholder="选择月份"
          />
          <div className="output">
            <div className="output-label">选中月份：</div>
            {formatMonthOutput(values.month)}
          </div>
        </div>
        
        {/* 4. 年份选择 */}
        <div className="card">
          <h3 className="card-title">
            <span>📈 年份选择</span>
          </h3>
          <p className="description">按年份粒度选择</p>
          <DatePicker
            value={values.year}
            onChange={(val) => updateValue('year', val)}
            type="year"
            locale={locale}
            placeholder="选择年份"
          />
          <div className="output">
            <div className="output-label">选中年份：</div>
            {formatYearOutput(values.year)}
          </div>
        </div>
        
        {/* 5. 日期时间 */}
        <div className="card">
          <h3 className="card-title">
            <span>⏰ 日期时间选择</span>
          </h3>
          <p className="description">同时选择日期和时间</p>
          <DatePicker
            value={values.datetime}
            onChange={(val) => updateValue('datetime', val)}
            type="datetime"
            locale={locale}
            placeholder="选择日期时间"
          />
          <div className="output">
            <div className="output-label">选中时间：</div>
            {formatDatetimeOutput(values.datetime)}
          </div>
        </div>
        
        {/* 6. 时间选择 */}
        <div className="card">
          <h3 className="card-title">
            <span>🕐 时间选择</span>
          </h3>
          <p className="description">仅选择时间</p>
          <DatePicker
            value={values.time}
            onChange={(val) => updateValue('time', val)}
            type="time"
            locale={locale}
            placeholder="选择时间"
          />
          <div className="output">
            <div className="output-label">选中时间：</div>
            {formatTimeOutput(values.time)}
          </div>
        </div>
        
        {/* 7. 禁用日期 */}
        <div className="card">
          <h3 className="card-title">
            <span>🚫 禁用日期</span>
            <span className="feature-badge">高级</span>
          </h3>
          <p className="description">禁用周末和过去的日期</p>
          <DatePicker
            value={values.disabled}
            onChange={(val) => updateValue('disabled', val)}
            type="date"
            locale={locale}
            disabledDate={disabledDate}
            placeholder="只能选择未来工作日"
          />
          <div className="output">
            <div className="output-label">禁用规则：</div>
            ✓ 周末被禁用<br />
            ✓ 过去的日期被禁用
          </div>
        </div>
        
        {/* 8. 快捷选项 */}
        <div className="card">
          <h3 className="card-title">
            <span>⚡ 快捷选项</span>
            <span className="feature-badge">高级</span>
          </h3>
          <p className="description">预设常用的日期范围</p>
          <DatePicker
            value={values.shortcuts}
            onChange={(val) => updateValue('shortcuts', val)}
            type="daterange"
            locale={locale}
            shortcuts={shortcuts}
            startPlaceholder="开始"
            endPlaceholder="结束"
          />
          <div className="output">
            <div className="output-label">可用快捷选项：</div>
            今天、最近7天、最近30天、本月、上月
          </div>
        </div>
        
        {/* 9. 月份范围 */}
        <div className="card">
          <h3 className="card-title">
            <span>📅 月份范围</span>
          </h3>
          <p className="description">选择月份范围（双面板）</p>
          <DatePicker
            value={values.monthrange}
            onChange={(val) => updateValue('monthrange', val)}
            type="monthrange"
            locale={locale}
            startPlaceholder="开始月份"
            endPlaceholder="结束月份"
          />
          <div className="output">
            <div className="output-label">选中范围：</div>
            {formatMonthRangeOutput(values.monthrange)}
          </div>
        </div>
        
        {/* 10. 年份范围 */}
        <div className="card">
          <h3 className="card-title">
            <span>📊 年份范围</span>
          </h3>
          <p className="description">选择年份范围（双面板）</p>
          <DatePicker
            value={values.yearrange}
            onChange={(val) => updateValue('yearrange', val)}
            type="yearrange"
            locale={locale}
            startPlaceholder="开始年份"
            endPlaceholder="结束年份"
          />
          <div className="output">
            <div className="output-label">选中范围：</div>
            {formatYearRangeOutput(values.yearrange)}
          </div>
        </div>
        
        {/* 11. 日期时间范围 */}
        <div className="card">
          <h3 className="card-title">
            <span>⏰ 日期时间范围</span>
            <span className="feature-badge">NEW</span>
          </h3>
          <p className="description">选择带时间的日期范围</p>
          <DatePicker
            value={values.datetimerange}
            onChange={(val) => updateValue('datetimerange', val)}
            type="datetimerange"
            locale={locale}
            startPlaceholder="开始时间"
            endPlaceholder="结束时间"
          />
          <div className="output">
            <div className="output-label">选中范围：</div>
            {formatDatetimeRangeOutput(values.datetimerange)}
          </div>
        </div>
        
        {/* 12. 星期选择 */}
        <div className="card">
          <h3 className="card-title">
            <span>📅 星期选择</span>
            <span className="feature-badge">NEW</span>
          </h3>
          <p className="description">按周选择，自动选择整周</p>
          <DatePicker
            value={values.week}
            onChange={(val) => updateValue('week', val)}
            type="week"
            locale={locale}
            placeholder="选择星期"
          />
          <div className="output">
            <div className="output-label">选中周：</div>
            {formatWeekOutput(values.week)}
          </div>
        </div>
        
        {/* 13. 季度选择 */}
        <div className="card">
          <h3 className="card-title">
            <span>📊 季度选择</span>
            <span className="feature-badge">NEW</span>
          </h3>
          <p className="description">按季度选择</p>
          <DatePicker
            value={values.quarter}
            onChange={(val) => updateValue('quarter', val)}
            type="quarter"
            locale={locale}
            placeholder="选择季度"
          />
          <div className="output">
            <div className="output-label">选中季度：</div>
            {formatQuarterOutput(values.quarter)}
          </div>
        </div>
        
        {/* 14. 多个日期选择 */}
        <div className="card">
          <h3 className="card-title">
            <span>📅 多个日期选择</span>
            <span className="feature-badge">NEW</span>
          </h3>
          <p className="description">可选择多个不连续日期</p>
          <DatePicker
            value={values.dates}
            onChange={(val) => updateValue('dates', val)}
            type="dates"
            locale={locale}
            placeholder="选择多个日期"
          />
          <div className="output">
            <div className="output-label">选中日期：</div>
            {formatDatesOutput(values.dates)}
          </div>
        </div>
        
        {/* 15. 自定义格式 */}
        <div className="card">
          <h3 className="card-title">
            <span>🎨 自定义格式</span>
          </h3>
          <p className="description">自定义日期显示格式</p>
          <DatePicker
            value={values.format}
            onChange={(val) => updateValue('format', val)}
            type="date"
            locale={locale}
            format="YYYY年MM月DD日"
            placeholder="自定义格式"
          />
          <div className="output">
            <div className="output-label">格式：</div>
            YYYY年MM月DD日
          </div>
        </div>
        
        {/* 16. 可清空 */}
        <div className="card">
          <h3 className="card-title">
            <span>🗑️ 可清空</span>
          </h3>
          <p className="description">显示清空按钮</p>
          <DatePicker
            value={values.clearable}
            onChange={(val) => updateValue('clearable', val)}
            type="date"
            locale={locale}
            clearable
            placeholder="可清空"
            onClear={() => addLog('clear', '清空选择')}
          />
          <div className="output">
            <div className="output-label">选中值：</div>
            {formatOutput(values.clearable)}
          </div>
        </div>
      </div>
      
      {/* 事件日志 */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h3 className="card-title">📋 事件日志（最近10条）</h3>
        <div className="output" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {eventLogs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <span style={{ color: '#999' }}>{log.time}</span> -{' '}
              <span style={{ color: '#667eea' }}>{log.type}</span>: {log.message}
            </div>
          ))}
          {eventLogs.length === 0 && (
            <div style={{ color: '#999' }}>暂无事件记录</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;





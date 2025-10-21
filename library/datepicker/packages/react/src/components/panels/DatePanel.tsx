/**
 * React DatePanel Component
 */

import React, { useMemo } from 'react';
import { DatePanel as DatePanelCore } from '@ldesign/datepicker-core';
import type { DateCell } from '@ldesign/datepicker-shared';
import { zhCN } from '@ldesign/datepicker-shared';

interface DatePanelProps {
  core: any;
  state: any;
  config: any;
  onSelectDate: (date: Date) => void;
}

export const DatePanel: React.FC<DatePanelProps> = ({ core, state, config, onSelectDate }) => {
  const headerLabel = useMemo(() => {
    if (!state) return '';
    const date = state.currentDate;
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
  }, [state]);

  const weekdays = useMemo(() => {
    const panel = new DatePanelCore({
      year: 2024,
      month: 0,
      value: null,
      weekStartsOn: 1,
    });
    return panel.getWeekdayHeaders(zhCN.weekdaysMin);
  }, []);

  const cells = useMemo(() => {
    if (!state) return [];

    const date = state.currentDate;
    const value = state.value instanceof Date ? state.value : null;
    const rangeStart = state.rangeStart;
    const rangeEnd = Array.isArray(state.value) && state.value[1] ? state.value[1] : null;
    const hoverDate = state.hoverDate;

    const panel = new DatePanelCore({
      year: date.getFullYear(),
      month: date.getMonth(),
      value,
      rangeStart,
      rangeEnd,
      hoverDate,
      weekStartsOn: 1,
      disabledDate: config?.disabledDate,
    });

    return panel.generateCells();
  }, [state, config]);

  const getCellClass = (cell: DateCell): string => {
    const classes = ['ldate-cell', `ldate-cell--${cell.type}`];
    if (cell.selected) classes.push('ldate-cell--selected');
    if (cell.disabled) classes.push('ldate-cell--disabled');
    if (cell.inRange) classes.push('ldate-cell--in-range');
    if (cell.rangeStart) classes.push('ldate-cell--range-start');
    if (cell.rangeEnd) classes.push('ldate-cell--range-end');
    return classes.join(' ');
  };

  const handleCellClick = (cell: DateCell) => {
    if (!cell.disabled) {
      onSelectDate(cell.date);
    }
  };

  const handleCellHover = (cell: DateCell) => {
    if (!cell.disabled) {
      core?.setHoverDate(cell.date);
    }
  };

  const handlePrevYear = () => {
    for (let i = 0; i < 12; i++) {
      core?.navigatePrev();
    }
  };

  const handlePrevMonth = () => {
    core?.navigatePrev();
  };

  const handleNextMonth = () => {
    core?.navigateNext();
  };

  const handleNextYear = () => {
    for (let i = 0; i < 12; i++) {
      core?.navigateNext();
    }
  };

  const handleLabelClick = () => {
    core?.changeView('month');
  };

  return (
    <div className="ldate-panel ldate-date-panel">
      {/* 头部 */}
      <div className="ldate-panel__header">
        <span className="ldate-panel__arrow" onClick={handlePrevYear}>
          «
        </span>
        <span className="ldate-panel__arrow" onClick={handlePrevMonth}>
          ‹
        </span>
        <span className="ldate-panel__header-label" onClick={handleLabelClick}>
          {headerLabel}
        </span>
        <span className="ldate-panel__arrow" onClick={handleNextMonth}>
          ›
        </span>
        <span className="ldate-panel__arrow" onClick={handleNextYear}>
          »
        </span>
      </div>

      {/* 星期标题 */}
      <div className="ldate-date-panel__week">
        {weekdays.map((day, index) => (
          <div key={index} className="ldate-date-panel__week-day">
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="ldate-date-panel__body">
        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="ldate-date-panel__row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={getCellClass(cell)}
                onClick={() => handleCellClick(cell)}
                onMouseEnter={() => handleCellHover(cell)}
              >
                {cell.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};






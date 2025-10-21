/**
 * React MonthPanel Component
 */

import React, { useMemo } from 'react';
import { MonthPanel as MonthPanelCore } from '@ldesign/datepicker-core';
import type { MonthCell } from '@ldesign/datepicker-shared';
import { zhCN } from '@ldesign/datepicker-shared';

interface MonthPanelProps {
  core: any;
  state: any;
  config: any;
  onSelectMonth: (month: number) => void;
}

export const MonthPanel: React.FC<MonthPanelProps> = ({ core, state, config, onSelectMonth }) => {
  const headerLabel = useMemo(() => {
    if (!state) return '';
    return `${state.currentDate.getFullYear()}年`;
  }, [state]);

  const cells = useMemo(() => {
    if (!state) return [];

    const date = state.currentDate;
    const value = state.value instanceof Date ? state.value : null;

    const panel = new MonthPanelCore({
      year: date.getFullYear(),
      value,
      monthsShort: zhCN.monthsShort,
      disabledDate: config?.disabledDate,
    });

    return panel.generateCells();
  }, [state, config]);

  const getCellClass = (cell: MonthCell): string => {
    const classes = ['ldate-cell', 'ldate-month-cell'];
    if (cell.selected) classes.push('ldate-cell--selected');
    if (cell.disabled) classes.push('ldate-cell--disabled');
    if (cell.inRange) classes.push('ldate-cell--in-range');
    if (cell.rangeStart) classes.push('ldate-cell--range-start');
    if (cell.rangeEnd) classes.push('ldate-cell--range-end');
    return classes.join(' ');
  };

  const handleCellClick = (cell: MonthCell) => {
    if (!cell.disabled) {
      onSelectMonth(cell.month);
    }
  };

  const handlePrevYear = () => {
    core?.navigatePrev();
  };

  const handleNextYear = () => {
    core?.navigateNext();
  };

  const handleLabelClick = () => {
    core?.changeView('year');
  };

  return (
    <div className="ldate-panel ldate-month-panel">
      {/* 头部 */}
      <div className="ldate-panel__header">
        <span className="ldate-panel__arrow" onClick={handlePrevYear}>
          «
        </span>
        <span className="ldate-panel__header-label" onClick={handleLabelClick}>
          {headerLabel}
        </span>
        <span className="ldate-panel__arrow" onClick={handleNextYear}>
          »
        </span>
      </div>

      {/* 月份网格 */}
      <div className="ldate-month-panel__body">
        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="ldate-month-panel__row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={getCellClass(cell)}
                onClick={() => handleCellClick(cell)}
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






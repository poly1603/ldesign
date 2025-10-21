/**
 * React YearPanel Component
 */

import React, { useMemo } from 'react';
import { YearPanel as YearPanelCore } from '@ldesign/datepicker-core';
import type { YearCell } from '@ldesign/datepicker-shared';

interface YearPanelProps {
  core: any;
  state: any;
  config: any;
  onSelectYear: (year: number) => void;
}

export const YearPanel: React.FC<YearPanelProps> = ({ core, state, config, onSelectYear }) => {
  const headerLabel = useMemo(() => {
    if (!state) return '';

    const panel = new YearPanelCore({
      year: state.currentDate.getFullYear(),
      value: null,
    });

    const [start, end] = panel.getYearRange();
    return `${start} - ${end}`;
  }, [state]);

  const cells = useMemo(() => {
    if (!state) return [];

    const date = state.currentDate;
    const value = state.value instanceof Date ? state.value : null;

    const panel = new YearPanelCore({
      year: date.getFullYear(),
      value,
      disabledDate: config?.disabledDate,
    });

    return panel.generateCells();
  }, [state, config]);

  const getCellClass = (cell: YearCell): string => {
    const classes = ['ldate-cell', 'ldate-year-cell'];
    if (cell.selected) classes.push('ldate-cell--selected');
    if (cell.disabled) classes.push('ldate-cell--disabled');
    if (cell.inRange) classes.push('ldate-cell--in-range');
    if (cell.rangeStart) classes.push('ldate-cell--range-start');
    if (cell.rangeEnd) classes.push('ldate-cell--range-end');
    return classes.join(' ');
  };

  const handleCellClick = (cell: YearCell) => {
    if (!cell.disabled) {
      onSelectYear(cell.year);
    }
  };

  const handlePrevDecade = () => {
    core?.navigatePrev();
  };

  const handleNextDecade = () => {
    core?.navigateNext();
  };

  return (
    <div className="ldate-panel ldate-year-panel">
      {/* 头部 */}
      <div className="ldate-panel__header">
        <span className="ldate-panel__arrow" onClick={handlePrevDecade}>
          «
        </span>
        <span className="ldate-panel__header-label">{headerLabel}</span>
        <span className="ldate-panel__arrow" onClick={handleNextDecade}>
          »
        </span>
      </div>

      {/* 年份网格 */}
      <div className="ldate-year-panel__body">
        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="ldate-year-panel__row">
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






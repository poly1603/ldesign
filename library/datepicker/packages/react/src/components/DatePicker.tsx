/**
 * React DatePicker Component
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDatePicker } from '../hooks/useDatePicker';
import { formatDate } from '@ldesign/datepicker-shared';
import type { PickerType, PickerValue } from '@ldesign/datepicker-shared';
import { DatePanel } from './panels/DatePanel';
import { MonthPanel } from './panels/MonthPanel';
import { YearPanel } from './panels/YearPanel';
import { TimePanel } from './panels/TimePanel';
import '@ldesign/datepicker-core/dist/style.css';

export interface DatePickerProps {
  value?: PickerValue;
  type?: PickerType;
  format?: string;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  rangeSeparator?: string;
  clearable?: boolean;
  editable?: boolean;
  disabled?: boolean;
  onChange?: (value: PickerValue) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  onVisibleChange?: (visible: boolean) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  type = 'date',
  format,
  placeholder = '选择日期',
  startPlaceholder = '开始日期',
  endPlaceholder = '结束日期',
  rangeSeparator = '至',
  clearable = true,
  editable = true,
  disabled = false,
  onChange,
  onFocus,
  onBlur,
  onClear,
  onVisibleChange,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const [popperStyle, setPopperStyle] = useState<React.CSSProperties>({});

  const {
    core,
    visible,
    state,
    config,
    selectDate,
    clear,
    setVisible,
    changeView,
    navigatePrev,
    navigateNext,
    setHoverDate,
  } = useDatePicker(
    {
      type,
      format,
      placeholder,
      clearable,
      editable,
      onChange,
      onFocus,
      onBlur,
      onClear,
      onVisibleChange,
    },
    onChange
  );

  const isRange = type.endsWith('range');

  // 格式化显示值
  const getDisplayValue = (): string => {
    if (!value) return '';
    if (value instanceof Date) {
      return formatDate(value, format || 'YYYY-MM-DD');
    }
    return '';
  };

  const getDisplayStartValue = (): string => {
    if (!value || !Array.isArray(value)) return '';
    const [start] = value;
    return start ? formatDate(start, format || 'YYYY-MM-DD') : '';
  };

  const getDisplayEndValue = (): string => {
    if (!value || !Array.isArray(value)) return '';
    const [, end] = value;
    return end ? formatDate(end, format || 'YYYY-MM-DD') : '';
  };

  // 更新弹出层位置
  useEffect(() => {
    if (visible && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      setPopperStyle({
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        minWidth: `${rect.width}px`,
      });
    }
  }, [visible]);

  // 监听外部点击
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        popperRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !popperRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [visible, setVisible]);

  // 事件处理
  const handleInputClick = () => {
    if (!disabled) {
      setVisible(!visible);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clear();
  };

  const handleSelectDate = (date: Date) => {
    selectDate(date);
  };

  const handleSelectMonth = (month: number) => {
    if (state) {
      const newDate = new Date(state.currentDate.getFullYear(), month, 1);
      selectDate(newDate);
    }
  };

  const handleSelectYear = (year: number) => {
    if (state) {
      const newDate = new Date(year, state.currentDate.getMonth(), 1);
      selectDate(newDate);
    }
  };

  const handleSelectTime = (time: Date) => {
    selectDate(time);
  };

  return (
    <div className="ldate-picker" ref={pickerRef}>
      {/* 输入框 */}
      <div className="ldate-input" onClick={handleInputClick}>
        {!isRange ? (
          <input
            className="ldate-input__inner"
            value={getDisplayValue()}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={!editable}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        ) : (
          <div className="ldate-range-input">
            <input
              className="ldate-range-input__inner"
              value={getDisplayStartValue()}
              placeholder={startPlaceholder}
              disabled={disabled}
              readOnly={!editable}
              onFocus={onFocus}
            />
            <span className="ldate-range-separator">{rangeSeparator}</span>
            <input
              className="ldate-range-input__inner"
              value={getDisplayEndValue()}
              placeholder={endPlaceholder}
              disabled={disabled}
              readOnly={!editable}
              onFocus={onFocus}
            />
          </div>
        )}

        {/* 清除按钮 */}
        {clearable && value && !disabled && (
          <span className="ldate-input__suffix" onClick={handleClear}>
            ✕
          </span>
        )}
      </div>

      {/* 下拉面板 */}
      {visible &&
        createPortal(
          <div className="ldate-popper ldate-zoom-enter" style={popperStyle} ref={popperRef}>
            {state?.view === 'date' && (
              <DatePanel
                core={core}
                state={state}
                config={config}
                onSelectDate={handleSelectDate}
              />
            )}

            {state?.view === 'month' && (
              <MonthPanel
                core={core}
                state={state}
                config={config}
                onSelectMonth={handleSelectMonth}
              />
            )}

            {state?.view === 'year' && (
              <YearPanel
                core={core}
                state={state}
                config={config}
                onSelectYear={handleSelectYear}
              />
            )}

            {state?.view === 'time' && (
              <TimePanel
                core={core}
                state={state}
                config={config}
                onSelectTime={handleSelectTime}
              />
            )}
          </div>,
          document.body
        )}
    </div>
  );
};






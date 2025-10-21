/**
 * React TimePanel Component
 */

import React, { useMemo } from 'react';
import { TimePanel as TimePanelCore } from '@ldesign/datepicker-core';
import type { TimeCell } from '@ldesign/datepicker-shared';

interface TimePanelProps {
  core: any;
  state: any;
  config: any;
  onSelectTime: (time: Date) => void;
}

export const TimePanel: React.FC<TimePanelProps> = ({ core, state, config, onSelectTime }) => {
  const value = useMemo(() => {
    return state?.value instanceof Date ? state.value : new Date();
  }, [state]);

  const panel = useMemo(() => {
    return new TimePanelCore({
      value,
      use12Hours: config?.use12Hours,
    });
  }, [value, config]);

  const hours = useMemo(() => panel.generateHours(), [panel]);
  const minutes = useMemo(() => panel.generateMinutes(), [panel]);
  const seconds = useMemo(() => panel.generateSeconds(), [panel]);

  const getItemClass = (item: TimeCell): string => {
    const classes = ['ldate-time-item'];
    if (item.selected) classes.push('ldate-time-item--selected');
    if (item.disabled) classes.push('ldate-time-item--disabled');
    return classes.join(' ');
  };

  const handleHourClick = (hour: TimeCell) => {
    if (!hour.disabled) {
      const newTime = new Date(value);
      newTime.setHours(hour.value);
      onSelectTime(newTime);
    }
  };

  const handleMinuteClick = (minute: TimeCell) => {
    if (!minute.disabled) {
      const newTime = new Date(value);
      newTime.setMinutes(minute.value);
      onSelectTime(newTime);
    }
  };

  const handleSecondClick = (second: TimeCell) => {
    if (!second.disabled) {
      const newTime = new Date(value);
      newTime.setSeconds(second.value);
      onSelectTime(newTime);
    }
  };

  return (
    <div className="ldate-panel ldate-time-panel">
      {/* 小时 */}
      <div className="ldate-time-column">
        <div className="ldate-time-column__title">时</div>
        <div className="ldate-time-column__list">
          {hours.map((hour) => (
            <div
              key={hour.value}
              className={getItemClass(hour)}
              onClick={() => handleHourClick(hour)}
            >
              {hour.text}
            </div>
          ))}
        </div>
      </div>

      {/* 分钟 */}
      <div className="ldate-time-column">
        <div className="ldate-time-column__title">分</div>
        <div className="ldate-time-column__list">
          {minutes.map((minute) => (
            <div
              key={minute.value}
              className={getItemClass(minute)}
              onClick={() => handleMinuteClick(minute)}
            >
              {minute.text}
            </div>
          ))}
        </div>
      </div>

      {/* 秒 */}
      <div className="ldate-time-column">
        <div className="ldate-time-column__title">秒</div>
        <div className="ldate-time-column__list">
          {seconds.map((second) => (
            <div
              key={second.value}
              className={getItemClass(second)}
              onClick={() => handleSecondClick(second)}
            >
              {second.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};






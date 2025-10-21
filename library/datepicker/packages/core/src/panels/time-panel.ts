/**
 * 时间面板
 */

import type { TimeCell } from '@ldesign/datepicker-shared';

export interface TimePanelOptions {
  value: Date | null;
  use12Hours?: boolean;
  disabledHours?: number[];
  disabledMinutes?: number[];
  disabledSeconds?: number[];
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
}

export class TimePanel {
  private options: Required<TimePanelOptions>;

  constructor(options: TimePanelOptions) {
    this.options = {
      value: options.value,
      use12Hours: options.use12Hours ?? false,
      disabledHours: options.disabledHours ?? [],
      disabledMinutes: options.disabledMinutes ?? [],
      disabledSeconds: options.disabledSeconds ?? [],
      hourStep: options.hourStep ?? 1,
      minuteStep: options.minuteStep ?? 1,
      secondStep: options.secondStep ?? 1,
    };
  }

  /**
   * 生成小时列表
   */
  generateHours(): TimeCell[] {
    const { value, use12Hours, disabledHours, hourStep } = this.options;
    const hours: TimeCell[] = [];
    const maxHour = use12Hours ? 12 : 24;
    
    for (let i = 0; i < maxHour; i += hourStep) {
      const hour = use12Hours && i === 0 ? 12 : i;
      const actualHour = value ? value.getHours() : -1;
      const displayHour = use12Hours ? actualHour % 12 || 12 : actualHour;
      
      hours.push({
        value: hour,
        text: this.padZero(hour),
        disabled: disabledHours.includes(hour),
        selected: hour === displayHour,
      });
    }
    
    return hours;
  }

  /**
   * 生成分钟列表
   */
  generateMinutes(): TimeCell[] {
    const { value, disabledMinutes, minuteStep } = this.options;
    const minutes: TimeCell[] = [];
    const currentMinute = value ? value.getMinutes() : -1;
    
    for (let i = 0; i < 60; i += minuteStep) {
      minutes.push({
        value: i,
        text: this.padZero(i),
        disabled: disabledMinutes.includes(i),
        selected: i === currentMinute,
      });
    }
    
    return minutes;
  }

  /**
   * 生成秒列表
   */
  generateSeconds(): TimeCell[] {
    const { value, disabledSeconds, secondStep } = this.options;
    const seconds: TimeCell[] = [];
    const currentSecond = value ? value.getSeconds() : -1;
    
    for (let i = 0; i < 60; i += secondStep) {
      seconds.push({
        value: i,
        text: this.padZero(i),
        disabled: disabledSeconds.includes(i),
        selected: i === currentSecond,
      });
    }
    
    return seconds;
  }

  /**
   * 获取上午/下午
   */
  getMeridiem(): 'AM' | 'PM' | null {
    const { value, use12Hours } = this.options;
    
    if (!use12Hours || !value) return null;
    
    return value.getHours() >= 12 ? 'PM' : 'AM';
  }

  /**
   * 补零
   */
  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
}






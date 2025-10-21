/**
 * DatePickerCore 状态管理测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DatePickerCore } from '../state';

describe('DatePickerCore', () => {
  let core: DatePickerCore;

  beforeEach(() => {
    core = new DatePickerCore({
      type: 'date',
    });
  });

  describe('初始化', () => {
    it('should create instance with default config', () => {
      expect(core).toBeDefined();
      expect(core.getConfig().type).toBe('date');
    });

    it('should initialize with default state', () => {
      const state = core.getState();
      expect(state.value).toBeNull();
      expect(state.visible).toBe(false);
      expect(state.view).toBe('date');
    });
  });

  describe('setValue', () => {
    it('should update value', () => {
      const date = new Date(2024, 0, 1);
      core.setValue(date);

      expect(core.getState().value).toBe(date);
    });

    it('should emit change event', (done) => {
      const date = new Date(2024, 0, 1);
      
      core.on('change', (value) => {
        expect(value).toBe(date);
        done();
      });

      core.setValue(date);
    });
  });

  describe('setVisible', () => {
    it('should toggle visibility', () => {
      expect(core.getState().visible).toBe(false);
      
      core.setVisible(true);
      expect(core.getState().visible).toBe(true);
      
      core.setVisible(false);
      expect(core.getState().visible).toBe(false);
    });

    it('should emit visible-change event', (done) => {
      core.on('visible-change', (visible) => {
        expect(visible).toBe(true);
        done();
      });

      core.setVisible(true);
    });
  });

  describe('selectDate', () => {
    it('should select date in single mode', () => {
      const date = new Date(2024, 0, 1);
      core.selectDate(date);

      expect(core.getState().value).toBe(date);
    });

    it('should not select disabled date', () => {
      const coreWithDisabled = new DatePickerCore({
        type: 'date',
        disabledDate: (date) => date.getDate() === 1,
      });

      const date = new Date(2024, 0, 1);
      coreWithDisabled.selectDate(date);

      expect(coreWithDisabled.getState().value).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear value', () => {
      const date = new Date(2024, 0, 1);
      core.setValue(date);
      
      core.clear();
      expect(core.getState().value).toBeNull();
    });

    it('should emit clear event', (done) => {
      core.on('clear', () => {
        done();
      });

      core.clear();
    });
  });

  describe('navigation', () => {
    it('should navigate to previous month', () => {
      const initialDate = new Date(2024, 5, 1); // June 2024
      core.getState().currentDate = initialDate;

      core.navigatePrev();
      
      const currentDate = core.getState().currentDate;
      expect(currentDate.getMonth()).toBe(4); // May
    });

    it('should navigate to next month', () => {
      const initialDate = new Date(2024, 5, 1); // June 2024
      core.getState().currentDate = initialDate;

      core.navigateNext();
      
      const currentDate = core.getState().currentDate;
      expect(currentDate.getMonth()).toBe(6); // July
    });
  });
});






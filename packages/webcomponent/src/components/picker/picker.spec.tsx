import { newSpecPage } from '@stencil/core/testing';
import { LdesignPicker } from './picker';

describe('ldesign-picker', () => {
  const mockOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' }
  ];

  describe('Component Initialization', () => {
    it('renders with default props', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      expect(page.root).toEqualHtml(`
        <ldesign-picker class="ldesign-picker">
          <mock:shadow-root>
            <div class="ldesign-picker__picker"></div>
          </mock:shadow-root>
        </ldesign-picker>
      `);
    });

    it('renders with options', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      const items = page.root.shadowRoot.querySelectorAll('.ldesign-picker__item');
      expect(items.length).toBe(5);
    });

    it('sets initial value correctly', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker value="banana"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      expect(page.rootInstance.current).toBe('banana');
      expect(page.rootInstance.visual).toBe('banana');
    });

    it('handles defaultValue when no value is provided', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker default-value="cherry"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      expect(page.rootInstance.current).toBe('cherry');
    });
  });

  describe('Search Functionality', () => {
    it('filters options when searching', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker searchable="true"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      // Simulate search
      page.rootInstance.performSearch('app');
      await page.waitForChanges();
      
      expect(page.rootInstance.filteredOptions).toHaveLength(1);
      expect(page.rootInstance.filteredOptions[0].value).toBe('apple');
      expect(page.rootInstance.isSearching).toBe(true);
    });

    it('performs case-insensitive search by default', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker searchable="true"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      page.rootInstance.performSearch('BANANA');
      await page.waitForChanges();
      
      expect(page.rootInstance.filteredOptions).toHaveLength(1);
      expect(page.rootInstance.filteredOptions[0].value).toBe('banana');
    });

    it('clears search results when query is empty', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker searchable="true"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      page.rootInstance.performSearch('app');
      await page.waitForChanges();
      
      page.rootInstance.performSearch('');
      await page.waitForChanges();
      
      expect(page.rootInstance.filteredOptions).toEqual(mockOptions);
      expect(page.rootInstance.isSearching).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles quick jump with letter keys', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker keyboard-quick-jump="true"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      // Simulate typing 'd' for 'Date'
      page.rootInstance.onQuickJumpKey('d');
      
      expect(page.rootInstance.quickJumpBuffer).toBe('d');
    });

    it('clears quick jump buffer after timeout', async () => {
      jest.useFakeTimers();
      
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker keyboard-quick-jump="true"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      page.rootInstance.onQuickJumpKey('d');
      expect(page.rootInstance.quickJumpBuffer).toBe('d');
      
      jest.advanceTimersByTime(1000);
      expect(page.rootInstance.quickJumpBuffer).toBe('');
      
      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      const picker = page.root.shadowRoot.querySelector('.ldesign-picker__picker');
      expect(picker.getAttribute('role')).toBe('listbox');
      expect(picker.getAttribute('aria-label')).toBe('选项列表');
      
      const items = page.root.shadowRoot.querySelectorAll('.ldesign-picker__item');
      items.forEach(item => {
        expect(item.getAttribute('role')).toBe('option');
      });
    });

    it('updates aria-activedescendant when value changes', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      page.rootInstance.visual = 'banana';
      await page.waitForChanges();
      
      const picker = page.root.shadowRoot.querySelector('.ldesign-picker__picker');
      expect(picker.getAttribute('aria-activedescendant')).toBe('picker-item-banana');
    });
  });

  describe('Theme Support', () => {
    it('applies theme attribute correctly', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker theme="dark"></ldesign-picker>`,
      });
      
      expect(page.root.getAttribute('theme')).toBe('dark');
    });

    it('applies 3D class when enabled', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker enable3d="true"></ldesign-picker>`,
      });
      
      expect(page.root).toHaveClass('ldesign-picker--3d');
    });
  });

  describe('Events', () => {
    it('emits ldesignChange event when value changes', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      const changeSpy = jest.fn();
      page.root.addEventListener('ldesignChange', changeSpy);
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      page.rootInstance.commitValue('banana');
      
      expect(changeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            value: 'banana',
            option: mockOptions[1]
          })
        })
      );
    });

    it('emits ldesignPick event during selection', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      const pickSpy = jest.fn();
      page.root.addEventListener('ldesignPick', pickSpy);
      
      page.rootInstance.options = mockOptions;
      page.rootInstance.visual = 'cherry';
      await page.waitForChanges();
      
      page.rootInstance.emitPick('touch');
      
      expect(pickSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            value: 'cherry',
            context: { trigger: 'touch' }
          })
        })
      );
    });
  });

  describe('Public Methods', () => {
    it('scrollToValue scrolls to specified value', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      const setIndexSpy = jest.spyOn(page.rootInstance, 'setIndex' as any);
      
      await page.rootInstance.scrollToValue('date', { animate: false });
      
      expect(setIndexSpy).toHaveBeenCalledWith(3, expect.objectContaining({
        animate: false,
        trigger: 'scroll'
      }));
    });

    it('scrollToIndex scrolls to specified index', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      const setIndexSpy = jest.spyOn(page.rootInstance, 'setIndex' as any);
      
      await page.rootInstance.scrollToIndex(2, { animate: true });
      
      expect(setIndexSpy).toHaveBeenCalledWith(2, expect.objectContaining({
        animate: true,
        trigger: 'scroll'
      }));
    });

    it('centerToCurrent centers to current value', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker value="cherry"></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      const centerCurrentSpy = jest.spyOn(page.rootInstance, 'centerCurrent' as any);
      
      await page.rootInstance.centerToCurrent(true);
      
      expect(centerCurrentSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('Performance Optimizations', () => {
    it('throttles updates in drag mode', async () => {
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker></ldesign-picker>`,
      });
      
      page.rootInstance.options = mockOptions;
      await page.waitForChanges();
      
      const rafSpy = jest.spyOn(window, 'requestAnimationFrame');
      
      // Simulate rapid drag movements
      for (let i = 0; i < 10; i++) {
        (page.rootInstance as any).setTrackTransform(i * 10, false, 'drag');
      }
      
      // Should throttle and use RAF
      expect(rafSpy).toHaveBeenCalled();
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback when enabled', async () => {
      const vibrateMock = jest.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true
      });
      
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker haptic-feedback="true" haptic-intensity="15"></ldesign-picker>`,
      });
      
      page.rootInstance.onItemChange();
      
      expect(vibrateMock).toHaveBeenCalledWith(15);
    });

    it('does not trigger haptic when disabled', async () => {
      const vibrateMock = jest.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true
      });
      
      const page = await newSpecPage({
        components: [LdesignPicker],
        html: `<ldesign-picker haptic-feedback="false"></ldesign-picker>`,
      });
      
      page.rootInstance.onItemChange();
      
      expect(vibrateMock).not.toHaveBeenCalled();
    });
  });
});
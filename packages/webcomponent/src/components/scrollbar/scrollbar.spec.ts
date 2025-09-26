import { newSpecPage } from '@stencil/core/testing';
import { LdesignScrollbar } from './scrollbar';

/**
 * Unit-like specs for ldesign-scrollbar
 */
describe('ldesign-scrollbar (spec)', () => {
  it('renders and default structure exists', async () => {
    const page = await newSpecPage({
      components: [LdesignScrollbar],
      html: `<ldesign-scrollbar style="height:200px"><div style="height:600px"></div></ldesign-scrollbar>`,
    });
    const host = page.root as HTMLElement;
    expect(host).toBeTruthy();
    const wrap = host.querySelector('.ld-scrollbar__wrap') as HTMLElement | null;
    expect(wrap).not.toBeNull();
  });

  it('applies type=track and always', async () => {
    const page = await newSpecPage({
      components: [LdesignScrollbar],
      html: `<ldesign-scrollbar type="track" always style="height:200px"><div style="height:600px"></div></ldesign-scrollbar>`,
    });
    const root = page.root as HTMLElement;
    const container = root.querySelector('.ld-scrollbar') as HTMLElement | null;
    expect(container?.classList.contains('ld-scrollbar--track')).toBe(true);
    expect(container?.classList.contains('ld-scrollbar--always')).toBe(true);
  });

  it('setCssVars updates styles', async () => {
    const page = await newSpecPage({
      components: [LdesignScrollbar],
      html: `<ldesign-scrollbar style="height:200px"><div style="height:600px"></div></ldesign-scrollbar>`,
    });
    const el = page.root as any;
    await el.setCssVars({ '--ld-scrollbar-size': 12, 'ld-scrollbar-thumb-bg': '#000' });
    // style set on host
    expect((page.root as HTMLElement).style.getPropertyValue('--ld-scrollbar-size')).toBe('12px');
  });

  it('exposes programmatic methods', async () => {
    const page = await newSpecPage({
      components: [LdesignScrollbar],
      html: `<ldesign-scrollbar style="height:200px"><div style="height:800px"></div></ldesign-scrollbar>`,
    });
    const el = page.root as any;
    expect(typeof el.scrollToPercent).toBe('function');
    expect(typeof el.scrollIntoViewWithin).toBe('function');
  });
});
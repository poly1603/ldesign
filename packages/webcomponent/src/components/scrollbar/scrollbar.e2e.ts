import { newE2EPage } from '@stencil/core/testing';

/**
 * Basic E2E tests for ldesign-scrollbar.
 * Note: we only assert DOM/class behaviors that are stable without relying on actual layout.
 */
describe('ldesign-scrollbar (e2e)', () => {
  it('hydration and bars render', async () => {
    const page = await newE2EPage({ html: `<ldesign-scrollbar type="track" always style="height:200px"><div style="height:600px"></div></ldesign-scrollbar>` });
    const el = await page.find('ldesign-scrollbar');
    expect(el).toHaveClass('hydrated');
    const barV = await page.find('ldesign-scrollbar >>> .ld-scrollbar__bar.is-vertical');
    expect(barV).not.toBeNull();
  });
});
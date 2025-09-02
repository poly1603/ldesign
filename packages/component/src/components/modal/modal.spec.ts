import { newSpecPage } from '@stencil/core/testing';
import { Modal } from './modal';

describe('ld-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal></ld-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <ld-modal>
        <mock:shadow-root>
        </mock:shadow-root>
      </ld-modal>
    `);
  });

  it('renders with title', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" title="Test Modal">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.title).toBe('Test Modal');
    expect(modal.visible).toBe(true);
  });

  it('handles visible property changes', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal title="Test Modal">Content</ld-modal>`,
    });

    const modal = page.root as any;

    // Initially not visible
    expect(modal.visible).toBe(false);

    // Show modal
    modal.visible = true;
    await page.waitForChanges();
    expect(modal.visible).toBe(true);

    // Hide modal
    modal.visible = false;
    await page.waitForChanges();
    expect(modal.visible).toBe(false);
  });

  it('emits events correctly', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" title="Test Modal">Content</ld-modal>`,
    });

    const modal = page.root as any;
    const openSpy = jest.fn();
    const closeSpy = jest.fn();
    const okSpy = jest.fn();
    const cancelSpy = jest.fn();

    modal.addEventListener('ldOpen', openSpy);
    modal.addEventListener('ldClose', closeSpy);
    modal.addEventListener('ldOk', okSpy);
    modal.addEventListener('ldCancel', cancelSpy);

    // Test open event
    modal.visible = true;
    await page.waitForChanges();
    expect(openSpy).toHaveBeenCalled();

    // Test close event
    modal.visible = false;
    await page.waitForChanges();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('supports different animations', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" animation="zoom">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.animation).toBe('zoom');

    modal.animation = 'slide-up';
    await page.waitForChanges();
    expect(modal.animation).toBe('slide-up');
  });

  it('supports custom width and height', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" width="800" height="600">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.width).toBe(800);
    expect(modal.height).toBe(600);
  });

  it('supports fullscreen mode', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" fullscreen="true">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.fullscreen).toBe(true);
  });

  it('supports centered mode', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" centered="true">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.centered).toBe(true);
  });

  it('supports custom button text', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" ok-text="Save" cancel-text="Discard">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.okText).toBe('Save');
    expect(modal.cancelText).toBe('Discard');
  });

  it('supports confirm loading state', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" confirm-loading="true">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.confirmLoading).toBe(true);
  });

  it('supports hiding footer', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" footer="false">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.footer).toBe(false);
  });

  it('supports hiding close button', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" closable="false">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.closable).toBe(false);
  });

  it('supports mask configuration', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" mask="false">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.mask).toBe(false);
  });

  it('supports mask closable configuration', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" mask-closable="false">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.maskClosable).toBe(false);
  });

  it('supports keyboard configuration', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" keyboard="false">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.keyboard).toBe(false);
  });

  it('supports draggable configuration', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" draggable="true">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.draggable).toBe(true);
  });

  it('supports resizable configuration', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" resizable="true">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.resizable).toBe(true);
  });

  it('supports custom z-index', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" z-index="2000">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.zIndex).toBe(2000);
  });

  it('supports custom class', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal visible="true" custom-class="my-modal">Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.customClass).toBe('my-modal');
  });

  it('has correct default values', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal>Content</ld-modal>`,
    });

    const modal = page.root as any;
    expect(modal.visible).toBe(false);
    expect(modal.width).toBe(520);
    expect(modal.closable).toBe(true);
    expect(modal.mask).toBe(true);
    expect(modal.maskClosable).toBe(true);
    expect(modal.keyboard).toBe(true);
    expect(modal.centered).toBe(false);
    expect(modal.draggable).toBe(false);
    expect(modal.resizable).toBe(false);
    expect(modal.fullscreen).toBe(false);
    expect(modal.footer).toBe(true);
    expect(modal.okText).toBe('确定');
    expect(modal.cancelText).toBe('取消');
    expect(modal.okType).toBe('primary');
    expect(modal.confirmLoading).toBe(false);
    expect(modal.zIndex).toBe(1000);
    expect(modal.animation).toBe('fade');
  });

  it('calls open and close methods', async () => {
    const page = await newSpecPage({
      components: [Modal],
      html: `<ld-modal>Content</ld-modal>`,
    });

    const modal = page.root as any;

    // Test open method
    await modal.open();
    expect(modal.visible).toBe(true);

    // Test close method
    await modal.close();
    expect(modal.visible).toBe(false);
  });
});

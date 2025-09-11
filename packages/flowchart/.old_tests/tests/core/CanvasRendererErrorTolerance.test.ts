/**
 * CanvasRenderer 渲染容错：某对象抛错不影响后续
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer, RenderLayer } from '@/core/CanvasRenderer.js';

function makeCtx() {
  return {
    canvas: { width: 800, height: 600, style: {} },
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('CanvasRenderer 渲染容错', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const originalError = console.error;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

    ctx = makeCtx();
    canvas.getContext = vi.fn(() => ctx);

    // 静音报错
    console.error = vi.fn();
  });

  it('render 抛错不影响后续对象', () => {
    const renderer = new CanvasRenderer(canvas, { showGrid: false });

    const ok1 = { layer: RenderLayer.NODES, priority: 1, visible: true, bounds: { x: 0, y: 0, width: 10, height: 10 }, render: vi.fn() } as any;
    const bad = { layer: RenderLayer.NODES, priority: 2, visible: true, bounds: { x: 0, y: 0, width: 10, height: 10 }, render: vi.fn(() => { throw new Error('boom'); }) } as any;
    const ok2 = { layer: RenderLayer.NODES, priority: 3, visible: true, bounds: { x: 0, y: 0, width: 10, height: 10 }, render: vi.fn() } as any;

    renderer.addRenderObject('ok1', ok1);
    renderer.addRenderObject('bad', bad);
    renderer.addRenderObject('ok2', ok2);

    renderer.render();

    expect(ok1.render).toHaveBeenCalled();
    expect(bad.render).toHaveBeenCalled();
    expect(ok2.render).toHaveBeenCalled();
  });

  afterEach(() => {
    console.error = originalError;
  });
});

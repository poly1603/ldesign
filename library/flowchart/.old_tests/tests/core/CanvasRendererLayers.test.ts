/**
 * CanvasRenderer 按层与优先级排序渲染覆盖
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer, RenderLayer } from '@/core/CanvasRenderer.js';
import type { Viewport } from '@/types/index.js';

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

describe('CanvasRenderer 按层渲染顺序', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

    ctx = makeCtx();
    canvas.getContext = vi.fn(() => ctx);
  });

  it('先按 layer，再按 priority 升序渲染', () => {
    const renderer = new CanvasRenderer(canvas, { showGrid: false });
    const order: string[] = [];

    const obj = (id: string, layer: RenderLayer, priority: number) => ({
      layer,
      priority,
      visible: true,
      bounds: { x: 0, y: 0, width: 10, height: 10 },
      render: vi.fn((ctx: CanvasRenderingContext2D, vp: Viewport) => order.push(id))
    });

    renderer.addRenderObject('a', obj('a', RenderLayer.NODES, 10) as any);
    renderer.addRenderObject('b', obj('b', RenderLayer.EDGES, 5) as any);
    renderer.addRenderObject('c', obj('c', RenderLayer.NODES, 5) as any);
    renderer.addRenderObject('d', obj('d', RenderLayer.UI, 1) as any);

    // 不传 renderData，走 renderByLayers
    renderer.render();

    // 期望：EDGES(5)->NODES(5)->NODES(10)->UI(1)
    expect(order).toEqual(['b', 'c', 'a', 'd']);
  });
});

/**
 * CanvasRenderer 网格：不同 scale 的线宽与偏移起点
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer } from '@/core/CanvasRenderer.js';

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
    globalAlpha: 1,
    strokeStyle: '#000',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('CanvasRenderer 网格线宽与偏移', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

    ctx = makeCtx();
    canvas.getContext = vi.fn(() => ctx);
  });

  it('scale=2 时 lineWidth = 1/2，偏移 (15,7) 起点应为 (-20,-20)', () => {
    const renderer = new CanvasRenderer(canvas, { showGrid: true });

    const viewport = { scale: 2, offset: { x: 15, y: 7 }, size: { width: 800, height: 600 } } as any;
    renderer.render(viewport, { nodes: [], edges: [] } as any);

    // 线宽 1/scale
    expect((ctx as any).lineWidth).toBeCloseTo(0.5, 5);

    // moveTo(-20,-20) 应出现（第一条垂直/水平线起点）
    const calls = ((ctx as any).moveTo as any).mock.calls;
    const hasStart = calls.some((c: any[]) => c[0] === -20 && c[1] === -20);
    expect(hasStart).toBe(true);
  });
});

/**
 * CanvasRenderer 网格渲染覆盖：gridSize 阈值、基本绘制
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer } from '@/core/CanvasRenderer.js';

function makeCtx() {
  return {
    canvas: { width: 800, height: 600, style: {} },
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    setLineDash: vi.fn(),
    globalAlpha: 1,
    strokeStyle: '#000',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('CanvasRenderer 网格渲染', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

    ctx = makeCtx();
    canvas.getContext = vi.fn(() => ctx);
  });

  it('gridSize >= 5 时应绘制网格线', () => {
    const renderer = new CanvasRenderer(canvas, { showGrid: true });

    // 初次渲染
    renderer.render(undefined, { nodes: [], edges: [] } as any);

    expect((ctx as any).beginPath).toHaveBeenCalled();
    expect((ctx as any).moveTo).toHaveBeenCalled();
    expect((ctx as any).lineTo).toHaveBeenCalled();
    expect((ctx as any).stroke).toHaveBeenCalled();
  });

  it('gridSize < 5 时不绘制网格线（早返回）', () => {
    const renderer = new CanvasRenderer(canvas, { showGrid: true });
    renderer.setGridSize(1);

    // 重置计数
    (ctx as any).beginPath.mockClear();
    (ctx as any).moveTo.mockClear();
    (ctx as any).lineTo.mockClear();
    (ctx as any).stroke.mockClear();

    renderer.render(undefined, { nodes: [], edges: [] } as any);

    expect((ctx as any).moveTo).not.toHaveBeenCalled();
    expect((ctx as any).lineTo).not.toHaveBeenCalled();
    // 允许其他调用存在，但不应出现网格绘制引起的 moveTo/lineTo
  });
});

/**
 * CanvasRenderer 渲染分支覆盖：selectionBox / guides / tempConnection
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

describe('CanvasRenderer 渲染分支', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

    ctx = makeCtx();
    canvas.getContext = vi.fn(() => ctx);
  });

  it('selectionBox / guides / tempConnection 分支调用', () => {
    const renderer = new CanvasRenderer(canvas, { showGrid: true });

    const node = { render: vi.fn() } as any;
    const edge = { render: vi.fn() } as any;

    renderer.render(undefined, {
      nodes: [node],
      edges: [edge],
      selectionBox: { visible: true, x: 5, y: 6, width: 10, height: 12 },
      guides: { vertical: [100], horizontal: [120] },
      // 通过 any 注入 tempConnection 分支
      tempConnection: { start: { x: 10, y: 10 }, end: { x: 20, y: 25 } } as any,
    } as any);

    // 选择框会调用 strokeRect
    expect((ctx as any).strokeRect).toHaveBeenCalled();

    // setLineDash 被用于 selectionBox([4,4])、guides([6,6])、tempConnection([8,6])
    const dashCalls = ((ctx as any).setLineDash as any).mock.calls.map((c: any[]) => JSON.stringify(c[0]));
    expect(dashCalls).toContain(JSON.stringify([4, 4]));
    expect(dashCalls).toContain(JSON.stringify([6, 6]));
    expect(dashCalls).toContain(JSON.stringify([8, 6]));

    // tempConnection 会 moveTo/lineTo
    expect((ctx as any).moveTo).toHaveBeenCalled();
    expect((ctx as any).lineTo).toHaveBeenCalled();

    // 节点/边的 render 也被调用
    expect(node.render).toHaveBeenCalled();
    expect(edge.render).toHaveBeenCalled();
  });
});

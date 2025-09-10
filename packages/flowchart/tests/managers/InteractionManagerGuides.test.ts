/**
 * InteractionManager 对齐线（含水平）
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionManager } from '@/managers/InteractionManager.js';
import type { Viewport } from '@/types/index.js';
import { SelectionManager } from '@/managers/SelectionManager.js';
import { NodeFactory } from '@/nodes/NodeFactory.js';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

describe('InteractionManager guides 垂直 + 水平', () => {
  let canvas: HTMLCanvasElement;
  let viewport: Viewport;
  let sel: SelectionManager;
  let im: InteractionManager;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 600;
    canvas.style.width = '800px'; canvas.style.height = '600px';
    document.body.appendChild(canvas);
    viewport = { offset: { x: 0, y: 0 }, scale: 1 } as any;
    sel = new SelectionManager();
    im = new InteractionManager(canvas, viewport, sel as any);
  });

  it('拖拽对齐：应同时出现 vertical 与 horizontal 指引', async () => {
    const nf = new NodeFactory();
    const n1 = nf.createNode('process' as any, { id: 'p1', type: 'process' as any, position: { x: 100, y: 100 }, label: 'P1', properties: {} } as any);
    const n2 = nf.createNode('process' as any, { id: 'p2', type: 'process' as any, position: { x: 300, y: 100 }, label: 'P2', properties: {} } as any);
    sel.setSelectableNodes([n1, n2] as any);

    const guides: any[] = [];
    im.on('guides-change', (g) => guides.push(g));

    // 在 n2 左上角按下，然后移动到 (100,100) 与 n1 左边&顶部完全对齐
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 300, clientY: 100 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));

    await sleep(20);

    const last = guides[guides.length - 1];
    expect(last).toBeDefined();
    expect(Array.isArray(last.vertical)).toBe(true);
    expect(Array.isArray(last.horizontal)).toBe(true);
    expect(last.vertical.includes(100)).toBe(true);
    expect(last.horizontal.includes(100)).toBe(true);

    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100 }));
  });
});

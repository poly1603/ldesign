/**
 * InteractionManager PAN 模式覆盖：setMode(PAN) 后拖拽更新视口与发出事件
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionManager, InteractionMode } from '@/managers/InteractionManager.js';
import { SelectionManager } from '@/managers/SelectionManager.js';
import { EventType } from '@/types/index.js';
import type { Viewport } from '@/types/index.js';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

describe('InteractionManager PAN 模式', () => {
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

  it('应更新 viewport.offset 并发出 CANVAS_PAN 事件', async () => {
    im.setMode(InteractionMode.PAN);

    const pans: any[] = [];
    im.on(EventType.CANVAS_PAN, (e) => pans.push(e));

    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 35 }));

    await sleep(20);

    expect(pans.length).toBeGreaterThan(0);
    // dx=20, dy=25, scale=1 -> offset 应为 {20,25}
    expect(viewport.offset.x).toBe(20);
    expect(viewport.offset.y).toBe(25);

    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 30, clientY: 35 }));
  });
});

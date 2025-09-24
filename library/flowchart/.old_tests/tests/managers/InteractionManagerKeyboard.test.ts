/**
 * InteractionManager 键盘事件覆盖：Delete / Ctrl+A / Escape 及通用 keydown/keyup
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InteractionManager } from '@/managers/InteractionManager.js';
import { SelectionManager } from '@/managers/SelectionManager.js';
import type { Viewport } from '@/types/index.js';

function makeDummyNode(id: string) {
  const size = { width: 100, height: 60 };
  return {
    id,
    type: 'process',
    position: { x: 100, y: 100 },
    size,
    draggable: true,
    select: vi.fn(),
    deselect: vi.fn(),
    getBounds: () => ({ x: 100, y: 100, width: size.width, height: size.height }),
    hitTest: () => false,
    startDrag: vi.fn(),
    drag: vi.fn(),
    endDrag: vi.fn(),
  } as any;
}

describe('InteractionManager 键盘事件', () => {
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

  it('Delete 应触发 delete 事件并携带当前选中项', () => {
    const n1 = makeDummyNode('d1');
    const n2 = makeDummyNode('d2');
    sel.setSelectableNodes([n1, n2] as any);
    sel.selectMultiple([n1, n2]);

    const deletes: any[] = [];
    im.on('delete', (e) => deletes.push(e));

    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));

    expect(deletes.length).toBe(1);
    expect(deletes[0].selectedItems.length).toBe(2);
    const ids = deletes[0].selectedItems.map((x: any) => x.id).sort();
    expect(ids).toEqual(['d1', 'd2']);
  });

  it('Ctrl+A 应调用 SelectionManager.selectAll', () => {
    const n1 = makeDummyNode('a1');
    const n2 = makeDummyNode('a2');
    sel.setSelectableNodes([n1, n2] as any);

    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }));

    const selected = sel.getSelectedItems();
    expect(selected.length).toBe(2);
  });

  it('Escape 应清空选择', () => {
    const n1 = makeDummyNode('e1');
    sel.setSelectableNodes([n1] as any);
    sel.selectMultiple([n1]);

    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(sel.getSelectedItems().length).toBe(0);
  });

  it('未处理的键应转为 keydown/keyup 事件', () => {
    const downs: any[] = [];
    const ups: any[] = [];
    im.on('keydown', (e) => downs.push(e));
    im.on('keyup', (e) => ups.push(e));

    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    canvas.dispatchEvent(new KeyboardEvent('keyup', { key: 'x' }));

    expect(downs.length).toBe(1);
    expect(ups.length).toBe(1);
  });
});

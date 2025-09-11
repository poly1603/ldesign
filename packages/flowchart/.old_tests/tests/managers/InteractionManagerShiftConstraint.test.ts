/**
 * InteractionManager Shift 约束：
 * - 直角边转折点（waypoint）在 Shift 下水平/垂直锁定
 * - 贝塞尔控制点在 Shift 下水平/垂直锁定
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionManager } from '@/managers/InteractionManager.js';
import type { Viewport } from '@/types/index.js';
import { SelectionManager } from '@/managers/SelectionManager.js';
import { NodeFactory } from '@/nodes/NodeFactory.js';
import { EdgeFactory } from '@/edges/EdgeFactory.js';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

describe('InteractionManager Shift 约束', () => {
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

  it('正交边 waypoint Shift 水平锁定（dx>dy -> y 不变）', async () => {
    const nf = new NodeFactory();
    const ef = new EdgeFactory();
    const a = nf.createNode('process' as any, { id: 'w1a', type: 'process' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    const b = nf.createNode('process' as any, { id: 'w1b', type: 'process' as any, position: { x: 300, y: 100 }, label: 'B', properties: {} } as any);
    sel.setSelectableNodes([a, b] as any);

    const edge = ef.createEdge('orthogonal' as any, { id: 'we', type: 'orthogonal' as any, source: 'w1a', target: 'w1b', style: {}, properties: {} } as any) as any;
    // 设定 waypoints，并计算路径
    edge.setWaypoints([{ x: 200, y: 100 }]);
    edge.calculatePath({ x: a.position.x + (a.size?.width || 100), y: a.position.y + (a.size?.height || 60) / 2 }, { x: b.position.x, y: b.position.y + (b.size?.height || 60) / 2 });
    sel.setSelectableEdges([edge] as any);

    const drags: any[] = [];
    im.on('edge-waypoint-drag', (e) => drags.push(e));

    // 命中 waypoint (200,100)
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 100 }));
    // 移动到 (260,130) 且按下 Shift -> dx=60, dy=30 -> y 应锁定为起始 100
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 260, clientY: 130, shiftKey: true }));
    await sleep(20);
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 260, clientY: 130 }));

    expect(drags.length).toBeGreaterThan(0);
    const last = drags[drags.length - 1];
    // waypoints 中对应索引点 y 应为 100
    expect(last.waypoints[last.index].y).toBe(100);
  });

  it('贝塞尔控制点 Shift 垂直/水平锁定', async () => {
    const nf = new NodeFactory();
    const ef = new EdgeFactory();
    const a = nf.createNode('process' as any, { id: 'bsa', type: 'process' as any, position: { x: 100, y: 200 }, label: 'BA', properties: {} } as any);
    const b = nf.createNode('process' as any, { id: 'bsb', type: 'process' as any, position: { x: 300, y: 200 }, label: 'BB', properties: {} } as any);
    sel.setSelectableNodes([a, b] as any);

    const edge = ef.createEdge('bezier' as any, { id: 'be2', type: 'bezier' as any, source: 'bsa', target: 'bsb', style: {}, properties: {} } as any) as any;
    edge.setCustomControlPoints([{ x: 150, y: 150 }, { x: 250, y: 250 }]);
    edge.calculatePath({ x: a.position.x + (a.size?.width || 100), y: a.position.y + (a.size?.height || 60) / 2 }, { x: b.position.x, y: b.position.y + (b.size?.height || 60) / 2 });
    sel.setSelectableEdges([edge] as any);

    const drags: any[] = [];
    im.on('edge-control-drag', (e) => drags.push(e));

    // 命中 cp1 (150,150)
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 150, clientY: 150 }));
    // 移动到 (180,220) 且按下 Shift -> dx=30, dy=70 -> 应锁定 x = start.x = 150
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 180, clientY: 220, shiftKey: true }));
    await sleep(20);
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 180, clientY: 220 }));

    expect(drags.length).toBeGreaterThan(0);
    const last = drags[drags.length - 1];
    expect(last.controlPoints[last.index].x).toBe(150);
  });
});

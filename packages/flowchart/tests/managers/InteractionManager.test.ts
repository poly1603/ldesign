/**
 * InteractionManager 基础事件测试：mousemove 与 wheel 触发对应事件
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionManager } from '@/managers/InteractionManager.js';
import type { Viewport } from '@/types/index.js';
import { SelectionManager } from '@/managers/SelectionManager.js';
import { EventType } from '@/types/index.js';
import { NodeFactory } from '@/nodes/NodeFactory.js';
import { EdgeFactory } from '@/edges/EdgeFactory.js';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

describe('InteractionManager 事件', () => {
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

  it('mousemove 应发出 CANVAS_MOUSE_MOVE，wheel 应更新缩放并发出 CANVAS_ZOOM', async () => {
    const moves: any[] = [];
    const zooms: any[] = [];
    im.on(EventType.CANVAS_MOUSE_MOVE, (e) => moves.push(e));
    im.on(EventType.CANVAS_ZOOM, (e) => zooms.push(e));

    // 触发鼠标移动
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 120 }));
    // 触发滚轮（缩小）
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 1 }));

    await sleep(20); // 等待节流/防抖

    expect(moves.length).toBeGreaterThan(0);
    expect(zooms.length).toBeGreaterThan(0);
    // 缩放应从 1 变化
    expect(viewport.scale).not.toBe(1);
  });
});

describe('InteractionManager 对齐线与选择框', () => {
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

  it('拖拽节点时应触发 guides-change（对齐线）', async () => {
    // 构造两个节点并注册到选择管理器
    const nodeFactory = new NodeFactory();
    const n1 = nodeFactory.createNode('process' as any, { id: 'n1', type: 'process' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    const n2 = nodeFactory.createNode('process' as any, { id: 'n2', type: 'process' as any, position: { x: 300, y: 100 }, label: 'B', properties: {} } as any);
    sel.setSelectableNodes([n1, n2] as any);

    const guidesEvents: any[] = [];
    im.on('guides-change', (g) => guidesEvents.push(g));

    // 在 n2 左上角按下（确保 offset=0），然后拖动到与 n1 左边对齐
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 300, clientY: 100 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
    await sleep(30);

    expect(guidesEvents.length).toBeGreaterThan(0);
    const last = guidesEvents[guidesEvents.length - 1];
    expect(Array.isArray(last.vertical)).toBe(true);
    // 期望包含 100 这条对齐线
    expect(last.vertical.includes(100)).toBe(true);

    // 释放鼠标，结束拖拽
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100 }));
  });

  it('选择框：按下空白处拖出矩形应选中矩形内节点', async () => {
    const nodeFactory = new NodeFactory();
    const n1 = nodeFactory.createNode('process' as any, { id: 's1', type: 'process' as any, position: { x: 100, y: 100 }, label: 'S1', properties: {} } as any);
    const n2 = nodeFactory.createNode('process' as any, { id: 's2', type: 'process' as any, position: { x: 400, y: 100 }, label: 'S2', properties: {} } as any);
    sel.setSelectableNodes([n1, n2] as any);

    // 在空白处 (0,0) 按下，移动到 (250,220)，应仅包含 n1
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 220 }));
    await sleep(20);
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 250, clientY: 220 }));

    const selected = sel.getSelectedNodes();
    expect(selected.length).toBe(1);
    expect(selected[0]?.id).toBe('s1');
  });
});

describe('InteractionManager 端点重连与贝塞尔控制点拖拽', () => {
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

  it('端点重连：在端点按下->移动到目标端口->抬起，触发 reconnect-start/preview/end', async () => {
    const nf = new NodeFactory();
    const ef = new EdgeFactory();
    const a = nf.createNode('process' as any, { id: 'a', type: 'process' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    const b = nf.createNode('process' as any, { id: 'b', type: 'process' as any, position: { x: 300, y: 100 }, label: 'B', properties: {} } as any);
    sel.setSelectableNodes([a, b] as any);

    const edge = ef.createEdge('straight' as any, { id: 'e', type: 'straight' as any, source: 'a', target: 'b', style: {}, properties: {} } as any) as any;
    // 计算路径，使得端点为 (a.output) 与 (b.input) 附近
    edge.calculatePath({ x: a.position.x + (a.size?.width || 100), y: a.position.y + (a.size?.height || 60) / 2 }, { x: b.position.x, y: b.position.y + (b.size?.height || 60) / 2 });
    sel.setSelectableEdges([edge] as any);

    const starts: any[] = [];
    const previews: any[] = [];
    const ends: any[] = [];
    im.on('reconnect-start', (e) => starts.push(e));
    im.on('reconnect-preview', (e) => previews.push(e));
    im.on('reconnect-end', (e) => ends.push(e));

    // 在 edge 终点附近按下（目标端点）
    const endPt = edge.path.points[edge.path.points.length - 1];
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: endPt.x, clientY: endPt.y }));
    // 移动到节点 A 的输出端口附近（使其预览到另一个端口）
    const leftPort = { x: a.position.x + (a.size?.width || 100), y: a.position.y + (a.size?.height || 60) / 2 };
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: leftPort.x, clientY: leftPort.y }));
    await sleep(20);
    // 抬起，结束重连
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: leftPort.x, clientY: leftPort.y }));

    expect(starts.length).toBeGreaterThan(0);
    expect(previews.length).toBeGreaterThan(0);
    expect(ends.length).toBeGreaterThan(0);
  });

  it('端点重连取消：在端点按下->移动到空白->抬起，触发 reconnect-cancel', async () => {
    const nf = new NodeFactory();
    const ef = new EdgeFactory();
    const a = nf.createNode('process' as any, { id: 'a2', type: 'process' as any, position: { x: 100, y: 100 }, label: 'A2', properties: {} } as any);
    const b = nf.createNode('process' as any, { id: 'b2', type: 'process' as any, position: { x: 300, y: 100 }, label: 'B2', properties: {} } as any);
    sel.setSelectableNodes([a, b] as any);

    const edge = ef.createEdge('straight' as any, { id: 'e2', type: 'straight' as any, source: 'a2', target: 'b2', style: {}, properties: {} } as any) as any;
    edge.calculatePath({ x: a.position.x + (a.size?.width || 100), y: a.position.y + (a.size?.height || 60) / 2 }, { x: b.position.x, y: b.position.y + (b.size?.height || 60) / 2 });
    sel.setSelectableEdges([edge] as any);

    const cancels: any[] = [];
    im.on('reconnect-cancel', (e) => cancels.push(e));

    const startPt = edge.path.points[0];
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: startPt.x, clientY: startPt.y }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }));
    await sleep(20);
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 50, clientY: 50 }));

    expect(cancels.length).toBeGreaterThan(0);
  });

  it('贝塞尔控制点拖拽：mousedown 命中控制点 -> mousemove -> mouseup，触发 edge-control-drag & end', async () => {
    const nf = new NodeFactory();
    const ef = new EdgeFactory();
    const a = nf.createNode('process' as any, { id: 'ba', type: 'process' as any, position: { x: 100, y: 200 }, label: 'BA', properties: {} } as any);
    const b = nf.createNode('process' as any, { id: 'bb', type: 'process' as any, position: { x: 300, y: 200 }, label: 'BB', properties: {} } as any);
    sel.setSelectableNodes([a, b] as any);

    const edge = ef.createEdge('bezier' as any, { id: 'be', type: 'bezier' as any, source: 'ba', target: 'bb', style: {}, properties: {} } as any) as any;
    edge.setCustomControlPoints([{ x: 150, y: 150 }, { x: 250, y: 250 }]);
    edge.calculatePath({ x: a.position.x + (a.size?.width || 100), y: a.position.y + (a.size?.height || 60) / 2 }, { x: b.position.x, y: b.position.y + (b.size?.height || 60) / 2 });
    sel.setSelectableEdges([edge] as any);

    const drags: any[] = [];
    const dragEnds: any[] = [];
    im.on('edge-control-drag', (e) => drags.push(e));
    im.on('edge-control-drag-end', (e) => dragEnds.push(e));

    // 命中第一个控制点 (150,150)
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 150, clientY: 150 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 160, clientY: 160 }));
    await sleep(20);
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 160, clientY: 160 }));

    expect(drags.length).toBeGreaterThan(0);
    expect(dragEnds.length).toBeGreaterThan(0);
  });
});

it('contextmenu 应触发自定义 contextmenu 事件并携带点位', () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 600;
  canvas.style.width = '800px'; canvas.style.height = '600px';
  document.body.appendChild(canvas);
  const viewport = { offset: { x: 0, y: 0 }, scale: 1 } as any;
  const sel = new SelectionManager();
  const im = new InteractionManager(canvas, viewport, sel as any);

  const events: any[] = [];
  im.on('contextmenu', (e) => events.push(e));

  canvas.dispatchEvent(new MouseEvent('contextmenu', { clientX: 200, clientY: 220, button: 2 }));
  expect(events.length).toBe(1);
  expect(typeof events[0].point.x).toBe('number');
});


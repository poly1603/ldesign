/**
 * FlowchartEditor 连接成功 + 重复连接约束
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';
import { InteractionMode } from '@/managers/InteractionManager.js';
import { NodeFactory } from '@/nodes/NodeFactory.js';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }

describe('FlowchartEditor 连接成功与重复约束', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('na.output -> nb.input 成功连接后，重复连接应被拒绝', async () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    // 添加两个节点
    editor.addNode({ id: 'na', type: 'process' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    editor.addNode({ id: 'nb', type: 'process' as any, position: { x: 300, y: 100 }, label: 'B', properties: {} } as any);

    const im = (editor as any).interactionManager;
    const canvas: HTMLCanvasElement = (editor as any).canvas;
    const nf = new NodeFactory();

    const naData = (editor as any).dataManager.getNode('na');
    const nbData = (editor as any).dataManager.getNode('nb');
    const naInst = nf.createNode(naData.type as any, naData) as any;
    const nbInst = nf.createNode(nbData.type as any, nbData) as any;

    const src = naInst.getPortPosition?.('output') || { x: 150, y: 130 };
    const dst = nbInst.getPortPosition?.('input') || { x: 300, y: 130 };

    // 第一次连接：应成功
    im.setMode(InteractionMode.CONNECT);
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: src.x, clientY: src.y }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: dst.x, clientY: dst.y }));
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: dst.x, clientY: dst.y }));
    await sleep(20);

    const edges1 = (editor as any).dataManager.getEdges();
    expect(edges1.length).toBe(1);

    // 监控渲染调用，确保不再生成 tempConnection
    const renders: any[] = [];
    (editor as any).renderer.render = vi.fn((vp: any, payload: any) => renders.push({ vp, payload }));

    // 第二次连接：重复，应被拒绝
    im.setMode(InteractionMode.CONNECT);
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: src.x, clientY: src.y }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: dst.x, clientY: dst.y }));
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: dst.x, clientY: dst.y }));
    await sleep(20);

    const edges2 = (editor as any).dataManager.getEdges();
    expect(edges2.length).toBe(1);

    const call = last(renders);
    expect(call).toBeDefined();
    // 最终渲染不应携带 tempConnection
    expect(call.payload.tempConnection).toBeUndefined();
  });
});

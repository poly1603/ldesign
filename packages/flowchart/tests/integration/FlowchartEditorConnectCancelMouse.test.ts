/**
 * FlowchartEditor 连接取消（鼠标操作）：CONNECT 模式下按下端口->移动空白->抬起，触发 connect-cancel 并清理 tempConnection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';
import { InteractionMode } from '@/managers/InteractionManager.js';
import { NodeFactory } from '@/nodes/NodeFactory.js';

function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }

describe('FlowchartEditor 连接取消（鼠标）', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('空白处抬起 -> connect-cancel，render 不应携带 tempConnection', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    // 添加两个节点
    editor.addNode({ id: 'na', type: 'process' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    editor.addNode({ id: 'nb', type: 'process' as any, position: { x: 300, y: 100 }, label: 'B', properties: {} } as any);

    // 监视 renderer.render 调用
    const renders: any[] = [];
    (editor as any).renderer.render = vi.fn((vp: any, payload: any) => renders.push({ vp, payload }));

    const im = (editor as any).interactionManager;
    im.setMode(InteractionMode.CONNECT);

    // 计算 A 的 output 端口坐标
    const nf = new NodeFactory();
    const srcData = (editor as any).dataManager.getNode('na');
    const srcInst = nf.createNode(srcData.type as any, srcData) as any;
    const portPos = srcInst.getPortPosition?.('output') || { x: 150, y: 130 };

    // 按下端口附近 -> 移动到空白 -> 抬起
    const canvas: HTMLCanvasElement = (editor as any).canvas;
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: portPos.x, clientY: portPos.y }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }));
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 50, clientY: 50 }));

    const call = last(renders);
    expect(call).toBeDefined();
    expect(call.payload.tempConnection).toBeUndefined();
  });
});

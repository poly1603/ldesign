/**
 * FlowchartEditor 临时连接渲染（tempConnection）测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';

function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }

describe('FlowchartEditor tempConnection 渲染', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('connect-start/preview 应设置 tempConnection 并传给 renderer.render', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    // 添加两个节点
    editor.addNode({ id: 'na', type: 'start' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    editor.addNode({ id: 'nb', type: 'end' as any, position: { x: 300, y: 100 }, label: 'B', properties: {} } as any);

    // 监视 renderer.render 调用
    const renders: any[] = [];
    (editor as any).renderer.render = vi.fn((vp: any, payload: any) => renders.push({ vp, payload }));

    const im = (editor as any).interactionManager;

    // 启动连接，从 A 的 output 端口
    im.emit('connect-start', { sourceId: 'na', sourcePort: 'output', point: { x: 150, y: 130 } });
    // 预览移动到某坐标
    im.emit('connect-preview', { point: { x: 200, y: 150 } });

    const call = last(renders);
    expect(call).toBeDefined();
    expect(call.payload.tempConnection).toBeDefined();
    expect(typeof call.payload.tempConnection.start.x).toBe('number');
    expect(typeof call.payload.tempConnection.end.x).toBe('number');
  });
});

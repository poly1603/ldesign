/**
 * FlowchartEditor 缩放适配(zoomToFit) 集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';

describe('FlowchartEditor zoomToFit', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('无节点时调用 zoomToFit 不应改变缩放', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    const before = editor.getZoom();
    editor.zoomToFit();
    const after = editor.getZoom();

    expect(after).toBe(before);
  });

  it('存在多个节点时 zoomToFit 应调整缩放与偏移', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    editor.addNode({ id: 'n1', type: 'start' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    editor.addNode({ id: 'n2', type: 'end' as any, position: { x: 600, y: 400 }, label: 'B', properties: {} } as any);

    const beforeScale = editor.getZoom();
    editor.zoomToFit();
    const afterScale = editor.getZoom();

    expect(afterScale).not.toBe(beforeScale);

    const vp = (editor as any).viewport;
    expect(typeof vp.offset.x).toBe('number');
    expect(typeof vp.offset.y).toBe('number');
  });
});

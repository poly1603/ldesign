/**
 * FlowchartEditor 删除选中项集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';

function centerOf(x: number, y: number, w = 100, h = 60) { return { cx: x + w / 2, cy: y + h / 2 }; }

describe('FlowchartEditor 删除选中项', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('removeNode 直接删除节点', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    editor.addNode({ id: 'x', type: 'start' as any, position: { x: 100, y: 100 }, label: 'X', properties: {} } as any);
    editor.addNode({ id: 'y', type: 'end' as any, position: { x: 300, y: 100 }, label: 'Y', properties: {} } as any);

    const { cx, cy } = centerOf(100, 100);

    // 直接删除节点
    editor.removeNode('x');

    const data = editor.getData();
    expect(data.nodes.find(n => n.id === 'x')).toBeUndefined();
    expect(data.nodes.find(n => n.id === 'y')).toBeDefined();
  });
});

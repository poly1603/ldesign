/**
 * PropertyPanel × FlowchartEditor 集成：通过面板修改节点属性，验证 DataManager 更新
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';

function findFieldByLabel(root: Element, label: string): HTMLElement | null {
  const fields = Array.from(root.querySelectorAll('.property-field')) as HTMLElement[];
  for (const f of fields) {
    const labelEl = f.querySelector('label');
    if ((labelEl?.textContent || '').trim() === label) return f;
  }
  return null;
}

describe('PropertyPanel × FlowchartEditor 集成', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('通过属性面板修改“标签”和“边框颜色”应更新编辑器数据', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    // 添加节点
    editor.addNode({
      id: 'n1',
      type: 'start' as any,
      position: { x: 100, y: 100 },
      label: '原始',
      properties: {}
    } as any);

    // 构造一个节点实例并设置为面板当前项
    const nodeData = editor.getData().nodes[0]!;
    const nodeFactory = (editor as any).nodeFactory as any;
    const nodeInst = nodeFactory.createNode(nodeData.type, nodeData);

    const panel = (editor as any).propertyPanel as any;
    panel.setCurrentItem(nodeInst);

    const panelRoot = container.querySelector('.flowchart-property-panel') as HTMLElement;

    // 改标签
    const labelField = findFieldByLabel(panelRoot, '标签')!;
    const labelInput = labelField.querySelector('input') as HTMLInputElement;
    labelInput.value = '标题X';
    labelInput.dispatchEvent(new Event('input'));

    // 改边框颜色
    const strokeField = findFieldByLabel(panelRoot, '边框颜色')!;
    const colorInput = strokeField.querySelector('input[type="color"]') as HTMLInputElement;
    colorInput.value = '#ff0000';
    colorInput.dispatchEvent(new Event('input'));

    // 断言数据已更新
    const data = editor.getData();
    expect(data.nodes[0]!.label).toBe('标题X');
    expect(data.nodes[0]!.style?.strokeColor).toBe('#ff0000');
  });
});


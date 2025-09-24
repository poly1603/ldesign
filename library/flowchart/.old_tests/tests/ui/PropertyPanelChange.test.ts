/**
 * PropertyPanel 字段变化触发 property:change 事件（节点）
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PropertyPanel } from '@/ui/PropertyPanel.js';
import { NodeType } from '@/types/index.js';

function findFieldByLabel(root: Element, label: string): HTMLElement | null {
  const fields = Array.from(root.querySelectorAll('.property-field')) as HTMLElement[];
  for (const f of fields) {
    const labelEl = f.querySelector('label');
    if ((labelEl?.textContent || '').trim() === label) return f;
  }
  return null;
}

describe('PropertyPanel 字段变化', () => {
  let container: HTMLElement;
  let panel: PropertyPanel;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '280px';
    container.style.height = '400px';
    document.body.appendChild(container);

    panel = new PropertyPanel({ container });
  });

  it('修改“标签”和“X坐标”应发出正确的 updateData', () => {
    // 构造一个最小节点对象（通过 any 绕过严格类型）
    const fakeNode: any = {
      id: 'n1',
      type: NodeType.PROCESS,
      // 关键：顶层需要带有 position 属性，以便被识别为“节点”
      position: { x: 10, y: 20 },
      getData: () => ({
        id: 'n1',
        type: 'process',
        position: { x: 10, y: 20 },
        size: { width: 100, height: 60 },
        label: '初始',
        style: {},
        properties: {}
      })
    };

    const events: any[] = [];
    panel.on('property:change', (e) => events.push(e));

    panel.setCurrentItem(fakeNode);

    // 改“标签”
    const labelField = findFieldByLabel(container, '标签')!;
    const labelInput = labelField.querySelector('input') as HTMLInputElement;
    labelInput.value = '新标签';
    labelInput.dispatchEvent(new Event('input'));

    // 改“X坐标” -> 使用首个 number 输入框定位（顺序为 x, y, width, height ...）
    const numberInputs = container.querySelectorAll('.property-field input[type="number"]');
    const xInput = numberInputs[0] as HTMLInputElement;
    expect(xInput).toBeDefined();
    xInput.value = '123';
    xInput.dispatchEvent(new Event('input'));

    // 至少产生两条变更事件
    expect(events.length).toBeGreaterThanOrEqual(2);

    const labelEvt = events.find(e => e.key === 'label');
    expect(labelEvt.updateData.label).toBe('新标签');

    const xEvt = events.find(e => e.key === 'x');
    expect(xEvt.updateData.position.x).toBe(123);
  });
});


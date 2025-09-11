/**
 * PropertyPanel × FlowchartEditor 集成（审批节点）：修改审批相关字段，验证数据更新
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

describe('PropertyPanel × FlowchartEditor 集成（审批节点）', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('修改审批字段（类型/委托/审批人/超时/处理）应发出正确的 property:change 事件并附带更新数据', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    // 添加审批节点
    editor.addNode({
      id: 'ap1',
      type: 'approval' as any,
      position: { x: 120, y: 180 },
      label: '审批A',
      properties: {
        approvalConfig: { type: 'single', approvers: [] }
      }
    } as any);

    // 将审批节点设置为面板当前项
    const nodeData = editor.getData().nodes[0]!;
    const nodeFactory = (editor as any).nodeFactory as any;
    const nodeInst = nodeFactory.createNode(nodeData.type, nodeData);

    const panel = (editor as any).propertyPanel as any;
    const changes: any[] = [];
    panel.on('property:change', (e: any) => changes.push(e));
    panel.setCurrentItem(nodeInst);

    const panelRoot = container.querySelector('.flowchart-property-panel') as HTMLElement;

    // 审批类型 -> multiple
    const typeField = findFieldByLabel(panelRoot, '审批类型')!;
    const typeSelect = typeField.querySelector('select') as HTMLSelectElement;
    // 选择 multiple
    const opt = Array.from(typeSelect.options).find(o => o.value === 'multiple');
    if (opt) opt.selected = true;
    typeSelect.value = 'multiple';
    typeSelect.dispatchEvent(new Event('input'));
    typeSelect.dispatchEvent(new Event('change'));

    // 允许委托 -> 勾选
    const delegateField = findFieldByLabel(panelRoot, '允许委托')!;
    const delegateCheckbox = delegateField.querySelector('input[type="checkbox"]') as HTMLInputElement;
    delegateCheckbox.checked = true;
    delegateCheckbox.dispatchEvent(new Event('change'));

    // 审批人(逗号分隔或JSON)
    const approversField = findFieldByLabel(panelRoot, '审批人(逗号分隔或JSON)')!;
    const approversTextarea = approversField.querySelector('textarea') as HTMLTextAreaElement;
    approversTextarea.value = '张三, 李四';
    approversTextarea.dispatchEvent(new Event('input'));

    // 超时时间(小时)
    const timeoutField = findFieldByLabel(panelRoot, '超时时间(小时)')!;
    const timeoutInput = timeoutField.querySelector('input[type="number"]') as HTMLInputElement;
    timeoutInput.value = '24';
    timeoutInput.dispatchEvent(new Event('input'));

    // 超时处理
    const actionField = findFieldByLabel(panelRoot, '超时处理')!;
    const actionSelect = actionField.querySelector('select') as HTMLSelectElement;
    const opt2 = Array.from(actionSelect.options).find(o => o.value === 'auto-approve');
    if (opt2) opt2.selected = true;
    actionSelect.value = 'auto-approve';
    actionSelect.dispatchEvent(new Event('input'));
    actionSelect.dispatchEvent(new Event('change'));

    // 断言事件与更新数据
    const getChange = (k: string) => changes.reverse().find(c => c.key === k) || changes.find(c => c.key === k);
    const typeEvt = getChange('approvalType');
    if (typeEvt) {
      expect(typeEvt.updateData.properties.approvalConfig.type).toBe('multiple');
    }
    const delEvt = getChange('allowDelegate');
    expect(delEvt.updateData.properties.approvalConfig.allowDelegate).toBe(true);

    const apprEvt = getChange('approversText');
    expect(Array.isArray(apprEvt.updateData.properties.approvalConfig.approvers)).toBe(true);
    expect(apprEvt.updateData.properties.approvalConfig.approvers.length).toBe(2);

    const timeoutEvt = getChange('timeout');
    expect(timeoutEvt.updateData.properties.approvalConfig.timeout).toBe(24);

    const actionEvt = getChange('timeoutAction');
    if (actionEvt) {
      expect(typeof actionEvt.updateData.properties.approvalConfig.timeoutAction).toBe('string');
    }
  });
});

describe('PropertyPanel × FlowchartEditor 集成（审批节点）- 更多字段', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('允许加签与升级处理人(JSON) 应正确映射到 updateData', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    editor.addNode({
      id: 'ap2',
      type: 'approval' as any,
      position: { x: 50, y: 60 },
      label: '审批B',
      properties: { approvalConfig: { type: 'single', approvers: [] } }
    } as any);

    const nodeData = editor.getData().nodes[0]!;
    const nodeFactory = (editor as any).nodeFactory as any;
    const nodeInst = nodeFactory.createNode(nodeData.type, nodeData);
    const panel = (editor as any).propertyPanel as any;
    const changes: any[] = [];
    panel.on('property:change', (e: any) => changes.push(e));
    panel.setCurrentItem(nodeInst);

    const panelRoot = container.querySelector('.flowchart-property-panel') as HTMLElement;

    // 允许加签 -> 勾选
    const addSignField = ((): HTMLElement => {
      const fields = Array.from(panelRoot.querySelectorAll('.property-field')) as HTMLElement[];
      return fields.find(f => (f.querySelector('label')?.textContent || '') === '允许加签')!;
    })();
    const addSignCheckbox = addSignField.querySelector('input[type="checkbox"]') as HTMLInputElement;
    addSignCheckbox.checked = true;
    addSignCheckbox.dispatchEvent(new Event('change'));

    // 升级处理人通过 JSON（使用 approversText 字段输入 JSON 以复用解析逻辑）
    const approversTextField = ((): HTMLElement => {
      const fields = Array.from(panelRoot.querySelectorAll('.property-field')) as HTMLElement[];
      return fields.find(f => (f.querySelector('label')?.textContent || '') === '审批人(逗号分隔或JSON)')!;
    })();
    const approversTextarea = approversTextField.querySelector('textarea') as HTMLTextAreaElement;
    approversTextarea.value = '[{"id":"u1","name":"A"},{"id":"u2","name":"B"}]';
    approversTextarea.dispatchEvent(new Event('input'));

    // 断言事件负载
    const getChange = (k: string) => changes.reverse().find(c => c.key === k) || changes.find(c => c.key === k);
    const addSignEvt = getChange('allowAddSign');
    expect(addSignEvt.updateData.properties.approvalConfig.allowAddSign).toBe(true);

    const apprEvt = getChange('approversText');
    expect(apprEvt.updateData.properties.approvalConfig.approvers.length).toBe(2);
    expect(apprEvt.updateData.properties.approvalConfig.approvers[0].name).toBe('A');
  });
});


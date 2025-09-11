/**
 * StatusBar 与 FlowchartEditor 集成测试（快捷按钮）
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';

function findSpanByLabel(root: Element, label: string): HTMLElement | null {
  const spans = Array.from(root.querySelectorAll('span'));
  for (const el of spans) {
    if ((el.textContent || '').includes(label)) return el as HTMLElement;
  }
  return null;
}

describe('StatusBar 快捷按钮集成', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('点击“吸附”文字应切换吸附开关并更新指示', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    const bar = container.querySelector('.flowchart-status-bar')!;
    const snapItem = findSpanByLabel(bar, '吸附')!;
    const strong = snapItem.querySelector('strong')!;

    // 初始应为关闭
    expect(strong.textContent).toBe('关');

    // 点击切换为开
    snapItem.click();
    expect(strong.textContent).toContain('开');
  });

  it('点击“步长”按钮应循环吸附步长并更新显示', () => {
    const config: FlowchartEditorConfig = { container, enableSnap: true, snapSize: 10 } as any;
    editor = new FlowchartEditor(config);

    const bar = container.querySelector('.flowchart-status-bar')!;
    const sizeBtn = bar.querySelector('.sb-snap-size') as HTMLButtonElement;
    const snapItem = findSpanByLabel(bar, '吸附')!;
    const strong = snapItem.querySelector('strong')!;

    // 初始为 10
    expect(sizeBtn.textContent).toBe('10');
    expect(strong.textContent).toContain('10');

    // 点击循环到 16
    sizeBtn.click();
    expect(sizeBtn.textContent).toBe('16');
    expect(strong.textContent).toContain('16');
  });

  it('点击缩放按钮应改变编辑器缩放级别（zoom-in / zoom-reset），并同步状态栏缩放文本', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    const bar = container.querySelector('.flowchart-status-bar')!;
    const zoomInBtn = bar.querySelector('.sb-zoom-in') as HTMLButtonElement;
    const zoomResetBtn = bar.querySelector('.sb-zoom-reset') as HTMLButtonElement;

    const before = editor.getZoom();
    zoomInBtn.click();
    const after = editor.getZoom();
    expect(after).toBeGreaterThan(before);

    // 重置为 100%
    editor.setZoom(2);
    zoomResetBtn.click();
    expect(editor.getZoom()).toBe(1);

    // 验证“缩放”文本为 100%
    const zoomItem = Array.from(bar.querySelectorAll('span')).find(el => (el.textContent || '').includes('缩放'))!;
    const zoomText = zoomItem.querySelector('strong')!.textContent || '';
    expect(zoomText).toBe('100%');
  });

  it('点击“适配”应根据内容计算最佳缩放并更新状态栏文本', () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    // 添加一些节点使内容区域非空
    editor.addNode({ id: 'n1', type: 'start' as any, position: { x: 100, y: 100 }, label: 'A', properties: {} } as any);
    editor.addNode({ id: 'n2', type: 'end' as any, position: { x: 500, y: 400 }, label: 'B', properties: {} } as any);

    // 先设置一个不同的缩放
    editor.setZoom(2);

    const bar = container.querySelector('.flowchart-status-bar')!;
    const zoomFitBtn = bar.querySelector('.sb-zoom-fit') as HTMLButtonElement;

    const beforeText = Array.from(bar.querySelectorAll('span'))
      .find(el => (el.textContent || '').includes('缩放'))!
      .querySelector('strong')!.textContent;

    zoomFitBtn.click();

    const afterText = Array.from(bar.querySelectorAll('span'))
      .find(el => (el.textContent || '').includes('缩放'))!
      .querySelector('strong')!.textContent;

    // 断言“缩放”文本已发生变化（适配后应不同于之前的 200%）
    expect(afterText).not.toBe(beforeText);
  });
});


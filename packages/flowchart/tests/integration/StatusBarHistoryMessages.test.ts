/**
 * StatusBar 历史消息集成测试（执行/撤销/重做）
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';

function getMessageText(root: HTMLElement): string {
  // 右侧容器包含消息文本
  const right = root.querySelector('.flowchart-status-bar > div:last-child') as HTMLElement | null;
  return (right?.textContent || '').trim();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('StatusBar 历史消息（执行/撤销/重做）', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (editor) editor.destroy();
    if (container.parentNode) container.parentNode.removeChild(container);
  });

  it('执行命令后应显示“已执行：添加节点”，撤销后“已撤销：添加节点”，重做后“已重做：添加节点”', async () => {
    const config: FlowchartEditorConfig = { container } as any;
    editor = new FlowchartEditor(config);

    // 执行：添加节点 -> 触发 HISTORY_EXECUTE
    editor.addNode({
      id: 'n1',
      type: 'start' as any,
      position: { x: 100, y: 100 },
      label: '开始',
      properties: {}
    } as any);

    // 等待 rAF 刷新消息
    await sleep(30);
    const msgAfterExec = getMessageText(container);
    expect(msgAfterExec).toContain('已执行：添加节点');

    // 节流：等待超过 StatusBar 的节流阈值(150ms)
    await sleep(170);

    // 撤销 -> 触发 HISTORY_UNDO
    const undone = editor.undo();
    expect(undone).toBe(true);
    await sleep(30);
    const msgAfterUndo = getMessageText(container);
    expect(msgAfterUndo).toContain('已撤销：添加节点');

    // 节流：再次等待超过阈值
    await sleep(170);

    // 重做 -> 触发 HISTORY_REDO
    const redone = editor.redo();
    expect(redone).toBe(true);
    await sleep(30);
    const msgAfterRedo = getMessageText(container);
    expect(msgAfterRedo).toContain('已重做：添加节点');
  });
});


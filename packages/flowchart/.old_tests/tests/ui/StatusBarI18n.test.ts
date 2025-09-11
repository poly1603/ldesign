/**
 * StatusBar i18n 文案与提示 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StatusBar } from '@/ui/StatusBar.js';

function findSpanByLabel(root: Element, label: string): HTMLElement | null {
  const spans = Array.from(root.querySelectorAll('span'));
  for (const el of spans) {
    if ((el.textContent || '').includes(label)) return el as HTMLElement;
  }
  return null;
}

describe('StatusBar i18n 文案与提示', () => {
  let container: HTMLElement;
  let barRoot: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // 创建状态栏
    new StatusBar({ container });
    barRoot = container.querySelector('.flowchart-status-bar') as HTMLElement;
  });

  it('缩放与吸附按钮的 title/文本应使用 i18n 中文文案', () => {
    const zoomOutBtn = barRoot.querySelector('.sb-zoom-out') as HTMLButtonElement;
    const zoomResetBtn = barRoot.querySelector('.sb-zoom-reset') as HTMLButtonElement;
    const zoomFitBtn = barRoot.querySelector('.sb-zoom-fit') as HTMLButtonElement;
    const zoomInBtn = barRoot.querySelector('.sb-zoom-in') as HTMLButtonElement;
    const snapSizeBtn = barRoot.querySelector('.sb-snap-size') as HTMLButtonElement;

    // title 检查
    expect(zoomOutBtn.title).toBe('缩小');
    expect(zoomResetBtn.title).toBe('重置缩放');
    expect(zoomFitBtn.title).toBe('适配');
    expect(zoomInBtn.title).toBe('放大');
    expect(snapSizeBtn.title).toBe('切换吸附步长');

    // 文本检查（缩放适配按钮使用中文文本）
    expect(zoomFitBtn.textContent).toBe('适配');

    // 吸附指示器的提示
    const snapItem = findSpanByLabel(barRoot, '吸附')!;
    expect(snapItem.title).toBe('点击切换网格吸附');
  });
});


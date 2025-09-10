/**
 * StatusBar 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatusBar } from '@/ui/StatusBar.js';

describe('StatusBar 组件', () => {
  let container: HTMLElement;
  let statusBar: StatusBar;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // 立即执行 requestAnimationFrame 回调，便于断言文本内容
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(16);
      return 1 as any;
    });

    statusBar = new StatusBar({ container });
  });

  it('应当渲染基本指示器并支持设置值', () => {
    // 设置模式
    statusBar.setMode('平移');
    const modeItem = Array.from(container.querySelectorAll('.flowchart-status-bar span'))
      .find(el => el.textContent?.includes('模式'))!;
    expect(modeItem.querySelector('strong')?.textContent).toContain('平移');

    // 设置缩放
    statusBar.setZoom(1.5);
    const zoomItem = Array.from(container.querySelectorAll('.flowchart-status-bar span'))
      .find(el => el.textContent?.includes('缩放'))!;
    expect(zoomItem.querySelector('strong')?.textContent).toContain('150');

    // 设置吸附
    statusBar.setSnap(true, 16);
    const snapItem = Array.from(container.querySelectorAll('.flowchart-status-bar span'))
      .find(el => el.textContent?.includes('吸附'))!;
    expect(snapItem.querySelector('strong')?.textContent).toContain('16');

    // 设置选中与坐标
    statusBar.setSelectionInfo(2, 3);
    const selItem = Array.from(container.querySelectorAll('.flowchart-status-bar span'))
      .find(el => el.textContent?.includes('选中'))!;
    expect(selItem.querySelector('strong')?.textContent).toContain('节点 2');

    statusBar.setCursorPosition({ x: 12.3, y: 45.6 }, false);
    const curItem = Array.from(container.querySelectorAll('.flowchart-status-bar span'))
      .find(el => el.textContent?.includes('坐标'))!;
    expect(curItem.querySelector('strong')?.textContent).toContain('12.3');
  });

  it('应当发出缩放与吸附相关事件', () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onZoomReset = vi.fn();
    const onZoomFit = vi.fn();
    const onToggleSnap = vi.fn();
    const onCycleSnap = vi.fn();

    statusBar.on('zoom-in', onZoomIn);
    statusBar.on('zoom-out', onZoomOut);
    statusBar.on('zoom-reset', onZoomReset);
    statusBar.on('zoom-fit', onZoomFit);
    statusBar.on('toggle-snap', onToggleSnap);
    statusBar.on('cycle-snap-size', onCycleSnap);

    // 点击按钮
    (container.querySelector('.sb-zoom-in') as HTMLButtonElement).click();
    (container.querySelector('.sb-zoom-out') as HTMLButtonElement).click();
    (container.querySelector('.sb-zoom-reset') as HTMLButtonElement).click();
    (container.querySelector('.sb-zoom-fit') as HTMLButtonElement).click();

    // 点击吸附文字触发开关
    const snapItem = Array.from(container.querySelectorAll('.flowchart-status-bar span'))
      .find(el => el.textContent?.includes('吸附'))!;
    (snapItem as HTMLElement).click();

    // 点击步长按钮
    (container.querySelector('.sb-snap-size') as HTMLButtonElement).click();

    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onZoomReset).toHaveBeenCalledTimes(1);
    expect(onZoomFit).toHaveBeenCalledTimes(1);
    expect(onToggleSnap).toHaveBeenCalledTimes(1);
    expect(onCycleSnap).toHaveBeenCalledTimes(1);
  });

  it('应当支持消息展示与清空', () => {
    statusBar.setMessage('操作完成', 50);
    const msgEl = container.querySelector('.flowchart-status-bar div:last-child') as HTMLElement;
    expect(msgEl.textContent).toContain('操作完成');

    statusBar.clearMessage();
    expect(msgEl.textContent).toBe('');
  });

  it('在吸附为真时，坐标应四舍五入并显示“(吸附)”标记', () => {
    statusBar.setCursorPosition({ x: 12.6, y: 7.4 }, true);
    const curItem = Array.from(container.querySelectorAll('.flowchart-status-bar span'))
      .find(el => el.textContent?.includes('坐标'))!;
    const text = curItem.querySelector('strong')?.textContent || '';
    expect(text).toContain('13, 7');
    expect(text).toContain('(吸附)');
  });
});


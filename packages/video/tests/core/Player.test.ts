/**
 * Player 核心类测试
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Player } from '../../src/core/Player';

describe('Player', () => {
  let container: HTMLElement;
  let player: Player;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-player';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 清理
    if (player) {
      player.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    test('应该正确初始化播放器', () => {
      player = new Player({
        container: '#test-player',
        src: 'test.mp4'
      });

      expect(player).toBeDefined();
      expect(player.container).toBe(container);
    });

    test('应该设置默认配置', () => {
      player = new Player({
        container: '#test-player',
        src: 'test.mp4'
      });

      expect(player.config.autoplay).toBe(false);
      expect(player.config.controls).toBe(true);
      expect(player.config.volume).toBe(1);
    });
  });

  describe('播放控制', () => {
    beforeEach(() => {
      player = new Player({
        container: '#test-player',
        src: 'test.mp4'
      });
    });

    test('应该能够播放视频', async () => {
      const playSpy = vi.spyOn(player.element, 'play');
      await player.play();
      expect(playSpy).toHaveBeenCalled();
    });

    test('应该能够暂停视频', () => {
      const pauseSpy = vi.spyOn(player.element, 'pause');
      player.pause();
      expect(pauseSpy).toHaveBeenCalled();
    });

    test('应该能够设置音量', () => {
      player.volume = 0.5;
      expect(player.element.volume).toBe(0.5);
    });

    test('应该能够静音', () => {
      player.muted = true;
      expect(player.element.muted).toBe(true);
    });

    test('应该能够取消静音', () => {
      player.muted = true;
      player.muted = false;
      expect(player.element.muted).toBe(false);
    });
  });

  describe('事件处理', () => {
    beforeEach(() => {
      player = new Player({
        container: '#test-player',
        src: 'test.mp4'
      });
    });

    test('应该能够监听事件', () => {
      const callback = vi.fn();
      player.on('media:play', callback);

      // 触发事件
      player.element.dispatchEvent(new Event('play'));

      expect(callback).toHaveBeenCalled();
    });

    test('应该能够移除事件监听器', () => {
      const callback = vi.fn();
      player.on('media:play', callback);
      player.off('media:play', callback);

      // 触发事件
      player.element.dispatchEvent(new Event('play'));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('销毁', () => {
    test('应该能够正确销毁播放器', () => {
      player = new Player({
        container: '#test-player',
        src: 'test.mp4'
      });

      const element = player.element;
      player.destroy();

      expect(element.parentNode).toBeNull();
    });
  });
});

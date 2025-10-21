/**
 * 快捷键系统 Composable
 */

import { onMounted, onUnmounted } from 'vue';

/**
 * 快捷键定义
 */
export interface Shortcut {
  /** 快捷键名称 */
  name: string;
  /** 快捷键组合（如 'ctrl+s'、'ctrl+shift+z'） */
  keys: string;
  /** 快捷键描述 */
  description: string;
  /** 快捷键回调 */
  handler: () => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 标准化键名
 */
function normalizeKey(key: string): string {
  const map: Record<string, string> = {
    'control': 'ctrl',
    'command': 'meta',
    'cmd': 'meta',
    'option': 'alt',
    'return': 'enter',
    'escape': 'esc',
    'delete': 'del'
  };

  return map[key.toLowerCase()] || key.toLowerCase();
}

/**
 * 解析键盘事件为快捷键字符串
 */
function parseKeyboardEvent(event: KeyboardEvent): string {
  const keys: string[] = [];

  if (event.ctrlKey || event.metaKey) {
    keys.push('ctrl');
  }
  if (event.altKey) {
    keys.push('alt');
  }
  if (event.shiftKey) {
    keys.push('shift');
  }

  // 添加主键
  const mainKey = normalizeKey(event.key);
  if (!['control', 'meta', 'alt', 'shift'].includes(mainKey)) {
    keys.push(mainKey);
  }

  return keys.join('+');
}

/**
 * 使用快捷键
 */
export function useShortcuts(shortcuts: Shortcut[]) {
  // 快捷键映射表
  const shortcutMap = new Map<string, Shortcut>();

  // 构建快捷键映射
  shortcuts.forEach(shortcut => {
    const normalizedKeys = shortcut.keys
      .toLowerCase()
      .split('+')
      .map(k => normalizeKey(k.trim()))
      .sort()
      .join('+');
    shortcutMap.set(normalizedKeys, shortcut);
  });

  /**
   * 键盘事件处理器
   */
  function handleKeyDown(event: KeyboardEvent) {
    // 如果焦点在输入框、文本框等元素上，不处理快捷键（除了 Esc）
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditable = ['input', 'textarea', 'select'].includes(tagName) ||
      target.isContentEditable;

    if (isEditable && event.key !== 'Escape') {
      return;
    }

    // 解析当前按键组合
    const pressedKeys = parseKeyboardEvent(event);

    // 查找匹配的快捷键
    const shortcut = shortcutMap.get(pressedKeys);

    if (shortcut && !shortcut.disabled) {
      // 阻止默认行为
      event.preventDefault();
      event.stopPropagation();

      // 执行快捷键处理器
      try {
        shortcut.handler();
      } catch (error) {
        console.error(`Shortcut handler error (${shortcut.name}):`, error);
      }
    }
  }

  /**
   * 注册快捷键
   */
  function register() {
    window.addEventListener('keydown', handleKeyDown, true);
  }

  /**
   * 注销快捷键
   */
  function unregister() {
    window.removeEventListener('keydown', handleKeyDown, true);
  }

  /**
   * 获取所有快捷键列表
   */
  function getShortcuts(): Shortcut[] {
    return Array.from(shortcutMap.values());
  }

  /**
   * 格式化快捷键显示文本
   */
  function formatShortcut(keys: string): string {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    return keys
      .split('+')
      .map(key => {
        const normalized = normalizeKey(key.trim());
        if (normalized === 'ctrl') {
          return isMac ? '⌘' : 'Ctrl';
        }
        if (normalized === 'alt') {
          return isMac ? '⌥' : 'Alt';
        }
        if (normalized === 'shift') {
          return isMac ? '⇧' : 'Shift';
        }
        return key.charAt(0).toUpperCase() + key.slice(1);
      })
      .join(isMac ? '' : '+');
  }

  // 自动注册和注销
  onMounted(() => {
    register();
  });

  onUnmounted(() => {
    unregister();
  });

  return {
    register,
    unregister,
    getShortcuts,
    formatShortcut
  };
}

/**
 * 创建标准编辑器快捷键
 */
export function createEditorShortcuts(handlers: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
}): Shortcut[] {
  const shortcuts: Shortcut[] = [];

  if (handlers.onSave) {
    shortcuts.push({
      name: 'save',
      keys: 'ctrl+s',
      description: '保存',
      handler: handlers.onSave
    });
  }

  if (handlers.onUndo) {
    shortcuts.push({
      name: 'undo',
      keys: 'ctrl+z',
      description: '撤销',
      handler: handlers.onUndo
    });
  }

  if (handlers.onRedo) {
    shortcuts.push(
      {
        name: 'redo',
        keys: 'ctrl+y',
        description: '重做',
        handler: handlers.onRedo
      },
      {
        name: 'redo-alt',
        keys: 'ctrl+shift+z',
        description: '重做',
        handler: handlers.onRedo
      }
    );
  }

  if (handlers.onDelete) {
    shortcuts.push(
      {
        name: 'delete',
        keys: 'delete',
        description: '删除',
        handler: handlers.onDelete
      },
      {
        name: 'delete-backspace',
        keys: 'backspace',
        description: '删除',
        handler: handlers.onDelete
      }
    );
  }

  if (handlers.onCopy) {
    shortcuts.push({
      name: 'copy',
      keys: 'ctrl+c',
      description: '复制',
      handler: handlers.onCopy
    });
  }

  if (handlers.onPaste) {
    shortcuts.push({
      name: 'paste',
      keys: 'ctrl+v',
      description: '粘贴',
      handler: handlers.onPaste
    });
  }

  if (handlers.onSelectAll) {
    shortcuts.push({
      name: 'select-all',
      keys: 'ctrl+a',
      description: '全选',
      handler: handlers.onSelectAll
    });
  }

  if (handlers.onEscape) {
    shortcuts.push({
      name: 'escape',
      keys: 'escape',
      description: '取消选择',
      handler: handlers.onEscape
    });
  }

  return shortcuts;
}



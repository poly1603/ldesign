# 插件开发指南

## 概述

LDesign Video Player 采用了基于 xgplayer 设计理念的插件系统，提供了强大而灵活的扩展能力。本指南将帮助您了解如何开发自定义插件。

## 插件架构

### 基础插件类

所有插件都继承自 `Plugin` 基类：

```typescript
import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata } from '../types';

export class MyPlugin extends Plugin {
  constructor(player: IPlayer, config: MyPluginConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'myPlugin',
      version: '1.0.0',
      type: 'ui', // 或 'functional'
      description: 'My custom plugin'
    };

    super(player, config, metadata);
  }

  async init(): Promise<void> {
    await super.init();
    // 插件初始化逻辑
  }

  async destroy(): Promise<void> {
    // 清理逻辑
    await super.destroy();
  }
}
```

### 插件类型

- **UI 插件** (`type: 'ui'`): 提供用户界面元素
- **功能插件** (`type: 'functional'`): 提供功能增强，无界面

### 插件配置

```typescript
export interface MyPluginConfig extends UIPluginConfig {
  // 自定义配置选项
  customOption?: string;
  enabled?: boolean;
}
```

## 高级插件管理器

### 使用 AdvancedPluginManager

```typescript
import { AdvancedPluginManager } from './plugins/AdvancedPluginManager';

const pluginManager = new AdvancedPluginManager(player);

// 注册插件
pluginManager.register(myPlugin, {
  name: 'myPlugin',
  version: '1.0.0',
  type: 'ui',
  description: 'My plugin',
  dependencies: [
    { name: 'playButton', optional: false }
  ],
  priority: 100,
  hooks: {
    beforeInit: async () => {
      console.log('Plugin initializing...');
    },
    afterInit: async () => {
      console.log('Plugin initialized');
    }
  }
});

// 加载插件
await pluginManager.load('myPlugin');
```

### 插件依赖管理

```typescript
// 定义依赖关系
const metadata: ExtendedPluginMetadata = {
  name: 'advancedControls',
  version: '1.0.0',
  type: 'ui',
  description: 'Advanced control panel',
  dependencies: [
    { name: 'playButton', version: '1.0.0' },
    { name: 'volumeControl', optional: true }
  ],
  conflicts: ['basicControls']
};
```

### 生命周期钩子

```typescript
const hooks: PluginLifecycleHooks = {
  beforeInit: async () => {
    // 初始化前的准备工作
  },
  afterInit: async () => {
    // 初始化完成后的处理
  },
  onPlayerReady: async () => {
    // 播放器就绪时的处理
  },
  onPlayerError: async (error: Error) => {
    // 播放器错误时的处理
  }
};
```

## 实用插件示例

### 1. 键盘快捷键插件

```typescript
import { KeyboardShortcuts } from './plugins/KeyboardShortcuts';

const shortcuts = new KeyboardShortcuts(player, {
  enableDefaultShortcuts: true,
  shortcuts: [
    {
      key: 'r',
      action: (player) => player.seek(0),
      description: '重新开始播放'
    }
  ]
});

await shortcuts.init();
```

### 2. 手势控制插件

```typescript
import { GestureControl, GestureType } from './plugins/GestureControl';

const gestureControl = new GestureControl(player, {
  enableDefaultGestures: true,
  gestures: [
    {
      type: GestureType.SWIPE_UP,
      action: (player) => {
        // 自定义上滑动作
      }
    }
  ]
});

await gestureControl.init();
```

### 3. 迷你播放器插件

```typescript
import { MiniPlayer, MiniPlayerMode } from './plugins/MiniPlayer';

const miniPlayer = new MiniPlayer(player, {
  mode: MiniPlayerMode.FLOATING,
  autoEnter: true,
  draggable: true
});

await miniPlayer.init();
```

## 插件开发最佳实践

### 1. 错误处理

```typescript
export class MyPlugin extends Plugin {
  async init(): Promise<void> {
    try {
      await super.init();
      // 初始化逻辑
    } catch (error) {
      console.error('Plugin initialization failed:', error);
      this.emit('plugin:error', { error });
      throw error;
    }
  }
}
```

### 2. 事件管理

```typescript
export class MyPlugin extends Plugin {
  private boundHandler?: (event: Event) => void;

  async init(): Promise<void> {
    await super.init();
    
    // 绑定事件处理器
    this.boundHandler = this.handleEvent.bind(this);
    this.player.on('timeupdate', this.boundHandler);
  }

  private handleEvent(event: Event): void {
    // 处理事件
  }

  async destroy(): Promise<void> {
    // 清理事件监听器
    if (this.boundHandler) {
      this.player.off('timeupdate', this.boundHandler);
    }
    
    await super.destroy();
  }
}
```

### 3. DOM 元素管理

```typescript
export class MyPlugin extends Plugin {
  private element?: HTMLElement;

  async init(): Promise<void> {
    await super.init();
    this.createElement();
  }

  private createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'my-plugin-element';
    this.player.container.appendChild(this.element);
  }

  async destroy(): Promise<void> {
    // 清理 DOM 元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    await super.destroy();
  }
}
```

### 4. 配置验证

```typescript
export class MyPlugin extends Plugin {
  constructor(player: IPlayer, config: MyPluginConfig = {}) {
    // 验证配置
    const validatedConfig = this.validateConfig(config);
    super(player, validatedConfig, metadata);
  }

  private validateConfig(config: MyPluginConfig): MyPluginConfig {
    const defaultConfig: MyPluginConfig = {
      enabled: true,
      customOption: 'default'
    };

    return { ...defaultConfig, ...config };
  }
}
```

## 插件测试

### 单元测试示例

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MyPlugin } from '../MyPlugin';
import { createMockPlayer } from '../../tests/mocks';

describe('MyPlugin', () => {
  let player: any;
  let plugin: MyPlugin;

  beforeEach(() => {
    player = createMockPlayer();
    plugin = new MyPlugin(player);
  });

  it('should initialize correctly', async () => {
    await plugin.init();
    expect(plugin.isInitialized).toBe(true);
  });

  it('should handle events correctly', async () => {
    await plugin.init();
    const spy = vi.spyOn(plugin, 'handleEvent');
    
    player.emit('timeupdate', { currentTime: 10 });
    expect(spy).toHaveBeenCalled();
  });
});
```

## 插件发布

### 1. 导出插件

```typescript
// 在 plugins/index.ts 中添加
export { MyPlugin, createMyPlugin } from './MyPlugin';
export type { MyPluginConfig } from './MyPlugin';
```

### 2. 创建工厂函数

```typescript
export function createMyPlugin(player: IPlayer, config?: MyPluginConfig): MyPlugin {
  return new MyPlugin(player, config);
}
```

### 3. 添加到插件工厂

```typescript
// 在 PluginFactory 中添加
createMyPlugin(config?: MyPluginConfig): MyPlugin {
  return new MyPlugin(this.player, config);
}
```

## 调试技巧

### 1. 启用调试模式

```typescript
const plugin = new MyPlugin(player, {
  debug: true
});
```

### 2. 使用事件监听

```typescript
plugin.on('plugin:error', (data) => {
  console.error('Plugin error:', data);
});

plugin.on('plugin:initialized', () => {
  console.log('Plugin initialized successfully');
});
```

### 3. 性能监控

```typescript
const pluginManager = new AdvancedPluginManager(player);
const stats = pluginManager.getPerformanceStats();
console.log('Plugin performance:', stats);
```

## 常见问题

### Q: 如何处理插件之间的通信？

A: 使用事件系统进行插件间通信：

```typescript
// 插件 A 发送事件
this.emit('custom:event', { data: 'hello' });

// 插件 B 监听事件
this.player.on('custom:event', (data) => {
  console.log('Received:', data);
});
```

### Q: 如何确保插件的加载顺序？

A: 使用优先级和依赖关系：

```typescript
const metadata: ExtendedPluginMetadata = {
  // ...
  priority: 100, // 数值越大，优先级越高
  dependencies: [{ name: 'requiredPlugin' }]
};
```

### Q: 如何处理插件的异步初始化？

A: 在 init 方法中使用 async/await：

```typescript
async init(): Promise<void> {
  await super.init();
  await this.loadExternalResource();
  this.setupEventListeners();
}
```

## 总结

LDesign Video Player 的插件系统提供了强大的扩展能力，支持：

- 灵活的插件架构
- 高级插件管理
- 依赖关系管理
- 生命周期钩子
- 事件系统
- 性能监控

通过遵循本指南的最佳实践，您可以开发出高质量、可维护的插件。

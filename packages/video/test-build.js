// 测试构建结果 - 直接测试单个模块
import { Player } from './es/core/Player.js';
import { EventManager } from './es/core/EventManager.js';

console.log('🎬 LDesign Video Player 构建测试');
console.log('================================');

// 测试核心功能
console.log('✅ 核心模块导入成功');
console.log('- Player:', typeof Player);
console.log('- EventManager:', typeof EventManager);

// 测试 EventManager 实例化
try {
  const eventManager = new EventManager();
  console.log('✅ EventManager 实例化成功');
  console.log('- eventManager:', eventManager.constructor.name);
} catch (error) {
  console.error('❌ EventManager 实例化失败:', error.message);
}

// 测试插件导入
try {
  const { PlayButton } = await import('./es/plugins/index.js');
  console.log('✅ 插件模块导入成功');
  console.log('- PlayButton:', typeof PlayButton);
} catch (error) {
  console.error('❌ 插件模块导入失败:', error.message);
}

// 测试主题导入
try {
  const { defaultTheme } = await import('./es/themes/default.js');
  console.log('✅ 主题模块导入成功');
  console.log('- defaultTheme:', typeof defaultTheme);
} catch (error) {
  console.error('❌ 主题模块导入失败:', error.message);
}

// 测试 Player 实例化
try {
  const player = new Player({
    container: document.createElement('div'),
    src: 'test.mp4'
  });
  console.log('✅ Player 实例化成功');
  console.log('- player:', player.constructor.name);
} catch (error) {
  console.error('❌ Player 实例化失败:', error.message);
}

console.log('================================');
console.log('🎉 构建测试完成！');

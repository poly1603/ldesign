/**
 * @ldesign/i18n - Context-Aware Translation Example
 * 展示如何使用上下文感知翻译系统根据不同环境智能选择翻译
 */

import {
  createContextAwareTranslator,
  TranslationContext,
  TranslationVariant,
  ContextRule
} from '../src/core/context-aware';

console.log('==================================================');
console.log('           上下文感知翻译系统示例                ');
console.log('==================================================\n');

// 创建上下文感知翻译器
const translator = createContextAwareTranslator();

// ========== 1. 注册翻译变体 ==========
console.log('1. 注册不同场景的翻译变体\n');

// 欢迎语的多种变体
const greetingVariants: TranslationVariant[] = [
  // 正式商务场合
  {
    id: 'greeting-formal',
    value: 'Good morning. How may I assist you today?',
    context: {
      businessContext: 'formal',
      timeOfDay: 'morning'
    },
    priority: 20,
    conditions: [
      { field: 'businessContext', operator: 'equals', value: 'formal', weight: 10 },
      { field: 'timeOfDay', operator: 'equals', value: 'morning', weight: 5 }
    ]
  },
  // 休闲场合
  {
    id: 'greeting-casual',
    value: "Hey there! What's up?",
    context: {
      businessContext: 'casual',
      userRole: 'user'
    },
    priority: 15,
    conditions: [
      { field: 'businessContext', operator: 'equals', value: 'casual', weight: 8 }
    ]
  },
  // 移动端简短版本
  {
    id: 'greeting-mobile',
    value: 'Hi! 👋',
    context: {
      deviceType: 'mobile'
    },
    priority: 18,
    conditions: [
      { field: 'deviceType', operator: 'equals', value: 'mobile', weight: 12 }
    ]
  },
  // 技术文档
  {
    id: 'greeting-technical',
    value: 'Welcome to the technical documentation',
    context: {
      businessContext: 'technical',
      pageType: 'dashboard'
    },
    priority: 16
  },
  // 营销页面
  {
    id: 'greeting-marketing',
    value: '🎉 Welcome! Discover amazing features!',
    context: {
      businessContext: 'marketing',
      pageType: 'landing'
    },
    priority: 17
  },
  // 夜间模式
  {
    id: 'greeting-night',
    value: 'Good evening! Still working late?',
    context: {
      timeOfDay: 'night'
    },
    priority: 14,
    conditions: [
      { field: 'timeOfDay', operator: 'equals', value: 'night', weight: 6 }
    ]
  },
  // 管理员特定
  {
    id: 'greeting-admin',
    value: 'Administrator Dashboard - Welcome back',
    context: {
      userRole: 'admin',
      pageType: 'dashboard'
    },
    priority: 22,
    conditions: [
      { field: 'userRole', operator: 'equals', value: 'admin', weight: 15 }
    ]
  },
  // 高对比度/辅助功能模式
  {
    id: 'greeting-accessible',
    value: 'Welcome. Navigation: Use Tab key to browse.',
    context: {
      accessibility: {
        screenReader: true
      }
    },
    priority: 19,
    conditions: [
      { field: 'accessibility.screenReader', operator: 'equals', value: true, weight: 20 }
    ]
  }
];

// 注册所有欢迎语变体
greetingVariants.forEach(variant => {
  translator.registerVariant('greeting', variant);
});

// 按钮文本的多种变体
const saveButtonVariants: TranslationVariant[] = [
  // 移动端简短版
  {
    id: 'save-mobile',
    value: 'Save',
    context: {
      deviceType: 'mobile',
      screenSize: 'small'
    },
    priority: 20
  },
  // 桌面端详细版
  {
    id: 'save-desktop',
    value: 'Save Changes',
    context: {
      deviceType: 'desktop'
    },
    priority: 15
  },
  // 结账页面特定
  {
    id: 'save-checkout',
    value: 'Save and Continue to Payment',
    context: {
      pageType: 'checkout'
    },
    priority: 25
  },
  // 设置页面
  {
    id: 'save-settings',
    value: 'Apply Settings',
    context: {
      pageType: 'settings'
    },
    priority: 22
  },
  // 紧急保存（自动保存失败时）
  {
    id: 'save-urgent',
    value: '⚠️ Save Now (Auto-save failed)',
    context: {
      custom: {
        autoSaveFailed: true
      }
    },
    priority: 30
  }
];

saveButtonVariants.forEach(variant => {
  translator.registerVariant('button.save', variant);
});

// 错误消息的多种变体
const errorVariants: TranslationVariant[] = [
  // 技术用户
  {
    id: 'error-technical',
    value: 'Error 500: Internal server exception at /api/endpoint',
    context: {
      userRole: 'developer',
      businessContext: 'technical'
    },
    priority: 20
  },
  // 普通用户
  {
    id: 'error-user-friendly',
    value: "Oops! Something went wrong. We're working on it!",
    context: {
      userRole: 'user',
      businessContext: 'casual'
    },
    priority: 15
  },
  // 移动端
  {
    id: 'error-mobile',
    value: 'Error. Tap to retry.',
    context: {
      deviceType: 'mobile'
    },
    priority: 18
  },
  // 正式场合
  {
    id: 'error-formal',
    value: 'We apologize for the inconvenience. Please try again later.',
    context: {
      businessContext: 'formal'
    },
    priority: 16
  }
];

errorVariants.forEach(variant => {
  translator.registerVariant('error.general', variant);
});

console.log('✅ 注册了多个翻译变体\n');

// ========== 2. 测试不同上下文场景 ==========
console.log('2. 测试不同上下文场景下的翻译选择\n');

// 场景1：移动设备上的普通用户
console.log('场景1：移动设备上的普通用户');
translator.setContext({
  deviceType: 'mobile',
  screenSize: 'small',
  userRole: 'user',
  businessContext: 'casual',
  timeOfDay: 'morning'
});

console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('  错误信息:', translator.getBestVariant('error.general'));
console.log('');

// 场景2：桌面端的管理员
console.log('场景2：桌面端的管理员');
translator.setContext({
  deviceType: 'desktop',
  screenSize: 'xlarge',
  userRole: 'admin',
  businessContext: 'formal',
  pageType: 'dashboard'
});

console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('  错误信息:', translator.getBestVariant('error.general'));
console.log('');

// 场景3：开发者在技术文档页
console.log('场景3：开发者在技术文档页');
translator.setContext({
  deviceType: 'desktop',
  userRole: 'developer',
  businessContext: 'technical',
  pageType: 'dashboard'
});

console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('  错误信息:', translator.getBestVariant('error.general'));
console.log('');

// 场景4：营销落地页
console.log('场景4：营销落地页');
translator.setContext({
  deviceType: 'desktop',
  businessContext: 'marketing',
  pageType: 'landing',
  timeOfDay: 'afternoon'
});

console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('  错误信息:', translator.getBestVariant('error.general'));
console.log('');

// 场景5：深夜工作的用户
console.log('场景5：深夜工作的用户');
translator.setContext({
  deviceType: 'desktop',
  timeOfDay: 'night',
  userRole: 'user',
  businessContext: 'casual'
});

console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('  错误信息:', translator.getBestVariant('error.general'));
console.log('');

// 场景6：使用屏幕阅读器的用户
console.log('场景6：使用屏幕阅读器的用户');
translator.setContext({
  deviceType: 'desktop',
  accessibility: {
    screenReader: true,
    highContrast: true
  },
  userRole: 'user'
});

console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('  错误信息:', translator.getBestVariant('error.general'));
console.log('');

// 场景7：结账页面
console.log('场景7：结账页面');
translator.setContext({
  deviceType: 'desktop',
  pageType: 'checkout',
  businessContext: 'formal',
  userRole: 'user'
});

console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('  错误信息:', translator.getBestVariant('error.general'));
console.log('');

// 场景8：自动保存失败
console.log('场景8：自动保存失败的紧急情况');
translator.setContext({
  deviceType: 'desktop',
  custom: {
    autoSaveFailed: true
  },
  userRole: 'user'
});

console.log('  保存按钮:', translator.getBestVariant('button.save'));
console.log('');

// ========== 3. 批量翻译 ==========
console.log('3. 批量翻译测试\n');

translator.setContext({
  deviceType: 'tablet',
  userRole: 'premium',
  businessContext: 'casual',
  timeOfDay: 'afternoon'
});

const batchKeys = ['greeting', 'button.save', 'error.general'];
const batchResults = translator.translateBatch(batchKeys);

console.log('批量翻译结果:');
Object.entries(batchResults).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});
console.log('');

// ========== 4. 动态规则注册 ==========
console.log('4. 动态注册上下文规则\n');

// 注册季节性规则
const seasonalRule: ContextRule = {
  id: 'seasonal-greetings',
  name: 'Seasonal Greetings',
  description: 'Special greetings for different seasons',
  conditions: [
    { field: 'season', operator: 'equals', value: 'winter', weight: 10 }
  ],
  variants: new Map([
    ['greeting', '❄️ Winter greetings! Stay warm!'],
    ['button.save', 'Save for the holidays']
  ]),
  priority: 25,
  enabled: true
};

translator.registerRule(seasonalRule);

// 注册地区特定规则
const regionalRule: ContextRule = {
  id: 'regional-content',
  name: 'Regional Content',
  description: 'Region-specific translations',
  conditions: [
    { field: 'region', operator: 'equals', value: 'Asia/Shanghai', weight: 15 }
  ],
  variants: new Map([
    ['greeting', '您好！欢迎访问'],
    ['button.save', '保存']
  ]),
  priority: 30,
  enabled: true
};

translator.registerRule(regionalRule);

console.log('✅ 注册了季节性和地区规则\n');

// 测试季节性规则
translator.setContext({
  season: 'winter',
  deviceType: 'desktop'
});

console.log('冬季场景:');
console.log('  欢迎语:', translator.getBestVariant('greeting'));
console.log('');

// ========== 5. 获取所有匹配的变体 ==========
console.log('5. 获取所有匹配的变体（用于调试）\n');

translator.setContext({
  deviceType: 'mobile',
  userRole: 'admin',
  businessContext: 'technical'
});

const allVariants = translator.getAllMatchingVariants('greeting');
console.log('当前上下文下所有匹配的欢迎语变体:');
allVariants.forEach((variant, index) => {
  console.log(`  ${index + 1}. [${variant.id}] ${variant.value}`);
});
console.log('');

// ========== 6. 性能测试 ==========
console.log('6. 性能测试\n');

const contexts: TranslationContext[] = [
  { deviceType: 'mobile', userRole: 'user' },
  { deviceType: 'desktop', userRole: 'admin' },
  { deviceType: 'tablet', businessContext: 'marketing' },
  { deviceType: 'mobile', accessibility: { screenReader: true } }
];

console.time('性能测试 - 1000次翻译');
for (let i = 0; i < 250; i++) {
  for (const context of contexts) {
    translator.setContext(context);
    translator.getBestVariant('greeting');
  }
}
console.timeEnd('性能测试 - 1000次翻译');
console.log('');

// ========== 7. 导出和导入配置 ==========
console.log('7. 配置导出和导入\n');

const config = translator.exportConfiguration();
console.log('导出的配置:');
console.log(`  变体数量: ${config.variants.length}`);
console.log(`  规则数量: ${config.rules.length}`);
console.log('');

// 创建新的翻译器并导入配置
const newTranslator = createContextAwareTranslator();
newTranslator.importConfiguration(config);
console.log('✅ 配置已导入到新翻译器\n');

// ========== 8. 实际应用示例 ==========
console.log('8. 实际应用示例：电商网站\n');

// 模拟电商网站的不同页面和用户状态
class EcommerceTranslation {
  private translator = createContextAwareTranslator();

  constructor() {
    this.setupTranslations();
  }

  private setupTranslations() {
    // 产品页面
    this.translator.registerVariant('product.addToCart', {
      id: 'add-cart-standard',
      value: 'Add to Cart',
      context: { pageType: 'product' },
      priority: 10
    });

    this.translator.registerVariant('product.addToCart', {
      id: 'add-cart-mobile',
      value: 'Add',
      context: { deviceType: 'mobile' },
      priority: 15
    });

    this.translator.registerVariant('product.addToCart', {
      id: 'add-cart-premium',
      value: 'Add to Cart (Free Shipping!)',
      context: { userRole: 'premium' },
      priority: 20
    });

    // 库存状态
    this.translator.registerVariant('stock.status', {
      id: 'stock-available',
      value: 'In Stock',
      context: { custom: { stockLevel: 'high' } },
      priority: 10
    });

    this.translator.registerVariant('stock.status', {
      id: 'stock-low',
      value: 'Only {{count}} left!',
      context: { custom: { stockLevel: 'low' } },
      priority: 15
    });

    this.translator.registerVariant('stock.status', {
      id: 'stock-out',
      value: 'Out of Stock',
      context: { custom: { stockLevel: 'none' } },
      priority: 20
    });
  }

  simulateUserJourney() {
    console.log('用户旅程模拟:');
    
    // 1. 访客浏览产品
    console.log('\n1️⃣ 访客在移动端浏览产品');
    this.translator.setContext({
      deviceType: 'mobile',
      userRole: 'guest',
      pageType: 'product',
      custom: { stockLevel: 'high' }
    });
    console.log('  添加购物车按钮:', this.translator.getBestVariant('product.addToCart'));
    console.log('  库存状态:', this.translator.getBestVariant('stock.status'));

    // 2. 用户登录成为会员
    console.log('\n2️⃣ 用户登录（高级会员）');
    this.translator.setContext({
      deviceType: 'mobile',
      userRole: 'premium',
      pageType: 'product',
      custom: { stockLevel: 'low', count: 3 }
    });
    console.log('  添加购物车按钮:', this.translator.getBestVariant('product.addToCart'));
    console.log('  库存状态:', this.translator.getBestVariant('stock.status'));

    // 3. 切换到桌面端
    console.log('\n3️⃣ 用户切换到桌面端继续购物');
    this.translator.setContext({
      deviceType: 'desktop',
      userRole: 'premium',
      pageType: 'product',
      custom: { stockLevel: 'none' }
    });
    console.log('  添加购物车按钮:', this.translator.getBestVariant('product.addToCart'));
    console.log('  库存状态:', this.translator.getBestVariant('stock.status'));
  }
}

const ecommerce = new EcommerceTranslation();
ecommerce.simulateUserJourney();

console.log('\n==================================================');
console.log('              示例运行完成！                       ');
console.log('==================================================\n');

console.log('📋 总结：');
console.log('• 上下文感知翻译可根据用户、设备、环境等因素智能选择最合适的翻译');
console.log('• 支持多维度的上下文条件和权重配置');
console.log('• 内置缓存机制提高性能');
console.log('• 支持A/B测试和性能追踪');
console.log('• 可导出/导入配置，便于跨项目复用');
console.log('• 适用于需要个性化、精准翻译的复杂应用场景');

// 导出供其他模块使用
export { translator, EcommerceTranslation };
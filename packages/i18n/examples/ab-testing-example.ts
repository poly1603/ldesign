/**
 * @ldesign/i18n - A/B Testing Example
 * 展示如何使用A/B测试系统测试不同翻译版本的效果
 */

import {
  createABTestManager,
  ABTestVariant,
  ABTestExperiment
} from '../src/core/ab-testing';

console.log('==================================================');
console.log('             翻译A/B测试系统示例                  ');
console.log('==================================================\n');

// 创建A/B测试管理器
const testManager = createABTestManager();

// ========== 1. 创建按钮文案测试 ==========
console.log('1. 创建按钮文案A/B测试实验\n');

// 定义变体
const buttonVariants: ABTestVariant[] = [
  {
    id: 'control',
    name: 'Control - Original',
    description: '原始版本的按钮文案',
    translations: new Map([
      ['button.subscribe', 'Subscribe'],
      ['button.start_trial', 'Start Free Trial'],
      ['button.learn_more', 'Learn More']
    ]),
    weight: 50,
    enabled: true
  },
  {
    id: 'variant_a',
    name: 'Variant A - Action-Oriented',
    description: '更强调行动的文案',
    translations: new Map([
      ['button.subscribe', 'Get Started Now'],
      ['button.start_trial', 'Try It Free - No Card Required'],
      ['button.learn_more', 'Discover Features']
    ]),
    weight: 25,
    enabled: true
  },
  {
    id: 'variant_b',
    name: 'Variant B - Benefit-Focused',
    description: '强调好处的文案',
    translations: new Map([
      ['button.subscribe', 'Unlock All Features'],
      ['button.start_trial', 'Get 30 Days Free'],
      ['button.learn_more', 'See How It Works']
    ]),
    weight: 25,
    enabled: true
  }
];

// 创建实验
const buttonExperiment = testManager.createExperiment({
  name: 'Button Text Optimization',
  description: '测试不同按钮文案对转化率的影响',
  variants: buttonVariants,
  targetKeys: ['button.subscribe', 'button.start_trial', 'button.learn_more'],
  targetLocales: ['en-US'],
  targetAudience: {
    percentage: 100, // 所有用户参与
    segments: ['new_users']
  }
});

console.log(`✅ 创建实验: ${buttonExperiment.name}`);
console.log(`   变体数量: ${buttonExperiment.variants.length}`);
console.log(`   测试键值: ${buttonExperiment.targetKeys.join(', ')}\n`);

// ========== 2. 启动实验 ==========
console.log('2. 启动A/B测试实验\n');

testManager.startExperiment(buttonExperiment.id);

// ========== 3. 模拟用户行为 ==========
console.log('3. 模拟用户访问和交互\n');

// 模拟多个用户会话
const simulateUserBehavior = () => {
  const sessionCount = 1000;
  const conversionRate = {
    control: 0.05,
    variant_a: 0.08,
    variant_b: 0.07
  };

  console.log(`模拟 ${sessionCount} 个用户会话...`);

  for (let i = 0; i < sessionCount; i++) {
    const sessionId = `session_${i}`;
    
    // 获取分配的变体
    const translation = testManager.getVariant(
      sessionId,
      buttonExperiment.id,
      'button.subscribe'
    );

    // 模拟点击行为
    if (Math.random() < 0.3) {
      testManager.recordInteraction(
        sessionId,
        buttonExperiment.id,
        'click',
        'button.subscribe'
      );
    }

    // 模拟转化（根据不同变体的转化率）
    const variant = testManager['sessions'].get(sessionId)?.assignedVariants.get(buttonExperiment.id);
    const rate = conversionRate[variant as keyof typeof conversionRate] || 0.05;
    
    if (Math.random() < rate) {
      testManager.recordConversion(sessionId, buttonExperiment.id);
    }
  }

  console.log('✅ 用户行为模拟完成\n');
};

simulateUserBehavior();

// ========== 4. 查看实时指标 ==========
console.log('4. 实时指标监控\n');

const showMetrics = () => {
  const experiment = testManager['experiments'].get(buttonExperiment.id)!;
  
  console.log('📊 当前指标:');
  experiment.variants.forEach(variant => {
    const impressions = experiment.metrics.impressions.get(variant.id) || 0;
    const conversions = experiment.metrics.conversions.get(variant.id) || 0;
    const rate = impressions > 0 ? (conversions / impressions * 100).toFixed(2) : '0.00';
    
    console.log(`   ${variant.name}:`);
    console.log(`     展示次数: ${impressions}`);
    console.log(`     转化次数: ${conversions}`);
    console.log(`     转化率: ${rate}%`);
  });
  console.log('');
};

showMetrics();

// ========== 5. 结束实验并分析结果 ==========
console.log('5. 结束实验并分析结果\n');

const results = testManager.endExperiment(buttonExperiment.id);

console.log('🔬 统计分析结果:');
results.forEach(result => {
  const variant = buttonExperiment.variants.find(v => v.id === result.variantId);
  console.log(`\n   ${variant?.name}:`);
  console.log(`     相对提升: ${result.improvement > 0 ? '+' : ''}${result.improvement.toFixed(2)}%`);
  console.log(`     置信度: ${result.confidence.toFixed(1)}%`);
  console.log(`     P值: ${result.pValue.toFixed(4)}`);
  console.log(`     统计显著: ${result.isSignificant ? '✅ 是' : '❌ 否'}`);
});
console.log('');

// ========== 6. 获取实验报告 ==========
console.log('6. 生成完整实验报告\n');

const report = testManager.getExperimentReport(buttonExperiment.id);

console.log('📋 实验报告摘要:');
console.log(`   ${report.summary}\n`);

console.log('💡 建议:');
report.recommendations.forEach(rec => {
  console.log(`   ${rec}`);
});
console.log('');

// ========== 7. 创建多语言标题测试 ==========
console.log('7. 创建多语言标题A/B测试\n');

const titleVariants: ABTestVariant[] = [
  {
    id: 'formal',
    name: 'Formal Tone',
    description: '正式的语气',
    translations: new Map([
      ['hero.title', 'Enterprise Solution for Global Teams'],
      ['hero.subtitle', 'Streamline Your International Operations']
    ]),
    weight: 33,
    enabled: true
  },
  {
    id: 'casual',
    name: 'Casual Tone',
    description: '轻松的语气',
    translations: new Map([
      ['hero.title', 'Work Together, Anywhere in the World'],
      ['hero.subtitle', 'The Easy Way to Go Global']
    ]),
    weight: 33,
    enabled: true
  },
  {
    id: 'innovative',
    name: 'Innovative Tone',
    description: '创新的语气',
    translations: new Map([
      ['hero.title', 'The Future of Global Collaboration'],
      ['hero.subtitle', 'Break Boundaries, Build Success']
    ]),
    weight: 34,
    enabled: true
  }
];

const titleExperiment = testManager.createExperiment({
  name: 'Homepage Title Tone Test',
  description: '测试不同语气的标题对用户参与度的影响',
  variants: titleVariants,
  targetKeys: ['hero.title', 'hero.subtitle'],
  targetLocales: ['en-US'],
  targetAudience: {
    percentage: 50, // 只有50%的用户参与测试
    segments: ['returning_users']
  }
});

console.log(`✅ 创建新实验: ${titleExperiment.name}`);
console.log(`   参与用户: ${titleExperiment.targetAudience?.percentage}%`);
console.log(`   用户分组: ${titleExperiment.targetAudience?.segments?.join(', ')}\n`);

// ========== 8. 高级功能展示 ==========
console.log('8. 高级功能展示\n');

// 8.1 自定义指标
console.log('8.1 记录自定义指标');
const sessionId = 'advanced_session_1';
testManager.recordInteraction(
  sessionId,
  buttonExperiment.id,
  'custom',
  undefined,
  { name: 'scroll_depth', value: 0.75 }
);
console.log('   ✅ 记录了页面滚动深度: 75%\n');

// 8.2 分段测试
console.log('8.2 创建分段测试');
const segmentedExperiment = testManager.createExperiment({
  name: 'Mobile vs Desktop CTA Test',
  description: '针对不同设备的行动召唤文案测试',
  variants: [
    {
      id: 'mobile_short',
      name: 'Mobile - Short',
      translations: new Map([['cta', 'Buy Now']]),
      weight: 50,
      enabled: true
    },
    {
      id: 'mobile_urgency',
      name: 'Mobile - Urgency',
      translations: new Map([['cta', 'Limited Time!']]),
      weight: 50,
      enabled: true
    }
  ],
  targetKeys: ['cta'],
  targetLocales: ['en-US'],
  targetAudience: {
    percentage: 100,
    segments: ['mobile_users'],
    conditions: {
      device: 'mobile',
      new_user: true
    }
  }
});
console.log(`   ✅ 创建了针对移动端新用户的测试\n`);

// ========== 9. 多实验并行 ==========
console.log('9. 多实验并行管理\n');

// 启动多个实验
testManager.startExperiment(titleExperiment.id);
testManager.startExperiment(segmentedExperiment.id);

console.log('当前运行的实验:');
const experiments = [buttonExperiment, titleExperiment, segmentedExperiment];
experiments.forEach(exp => {
  const status = testManager['experiments'].get(exp.id)?.status;
  console.log(`   - ${exp.name}: ${status === 'running' ? '🟢 运行中' : '🔴 ' + status}`);
});
console.log('');

// ========== 10. 最佳实践建议 ==========
console.log('10. A/B测试最佳实践\n');

const bestPractices = [
  '📏 样本量: 确保每个变体至少有1000个样本',
  '⏱️ 测试时长: 运行至少1-2周以覆盖不同用户行为模式',
  '🎯 单一变量: 每次只测试一个变化以准确归因',
  '📊 统计显著性: 等待95%置信度再做决策',
  '👥 用户分组: 考虑不同用户群体的差异',
  '🔄 迭代优化: 基于结果持续改进',
  '📝 文档记录: 记录所有测试假设和结果',
  '⚠️ 避免偏见: 注意季节性和外部因素影响'
];

console.log('💡 A/B测试最佳实践:');
bestPractices.forEach(practice => {
  console.log(`   ${practice}`);
});

console.log('\n==================================================');
console.log('              A/B测试示例完成！                   ');
console.log('==================================================\n');

console.log('📈 总结：');
console.log('• A/B测试帮助数据驱动的翻译优化决策');
console.log('• 支持多变体测试和流量分配控制');
console.log('• 内置统计分析确保结果可信度');
console.log('• 实时指标监控和自动获胜者选择');
console.log('• 支持自定义指标和用户分组');
console.log('• 可并行运行多个实验');

// 导出供其他模块使用
export { testManager, buttonExperiment, titleExperiment };
/**
 * @ldesign/i18n - Quality Scorer Example
 * 展示如何使用翻译质量自动评分系统
 */

import { createQualityScorer, QualityScore } from '../src/core/quality-scorer';

console.log('==================================================');
console.log('           翻译质量自动评分系统示例               ');
console.log('==================================================\n');

// 创建质量评分器
const scorer = createQualityScorer({
  weights: {
    accuracy: 0.30,        // 准确性权重最高
    fluency: 0.20,         // 流畅度次之
    consistency: 0.15,
    completeness: 0.15,
    culturalAppropriateness: 0.08,
    technicalAccuracy: 0.08,
    readability: 0.04
  },
  thresholds: {
    excellent: 90,
    good: 75,
    acceptable: 60,
    poor: 0
  },
  strictMode: true,
  locale: 'en-US'
});

// ========== 1. 评估单个翻译 ==========
console.log('1. 评估单个翻译质量\n');

const evaluateSingleTranslation = async () => {
  const source = 'Welcome to our platform! Click the "Get Started" button to begin your journey.';
  const goodTranslation = '欢迎来到我们的平台！点击"开始使用"按钮开启您的旅程。';
  const poorTranslation = '欢迎平台！点击开始。';

  console.log('原文:', source);
  console.log('');

  // 评估好的翻译
  console.log('📊 评估翻译 1 (较好):');
  console.log('译文:', goodTranslation);
  
  const goodScore = await scorer.evaluate(
    source,
    goodTranslation,
    'en-US',
    'zh-CN',
    {
      category: 'ui',
      glossary: new Map([
        ['platform', '平台'],
        ['Get Started', '开始使用']
      ])
    }
  );

  displayScore(goodScore);

  // 评估差的翻译
  console.log('\n📊 评估翻译 2 (较差):');
  console.log('译文:', poorTranslation);
  
  const poorScore = await scorer.evaluate(
    source,
    poorTranslation,
    'en-US',
    'zh-CN',
    {
      category: 'ui',
      glossary: new Map([
        ['platform', '平台'],
        ['Get Started', '开始使用']
      ])
    }
  );

  displayScore(poorScore);
};

// ========== 2. 批量评估 ==========
console.log('\n2. 批量翻译质量评估\n');

const evaluateBatch = async () => {
  const translations = [
    {
      source: 'Save your changes',
      translation: '保存您的更改',
      sourceLocale: 'en-US' as any,
      targetLocale: 'zh-CN' as any
    },
    {
      source: 'Error: Invalid email format',
      translation: '错误：电子邮件格式无效',
      sourceLocale: 'en-US' as any,
      targetLocale: 'zh-CN' as any
    },
    {
      source: 'Processing... Please wait {{seconds}} seconds',
      translation: '处理中... 请等待 {{seconds}} 秒',
      sourceLocale: 'en-US' as any,
      targetLocale: 'zh-CN' as any
    },
    {
      source: 'Your order #12345 has been confirmed',
      translation: '您的订单已确认',  // 缺少订单号
      sourceLocale: 'en-US' as any,
      targetLocale: 'zh-CN' as any
    }
  ];

  const results = await scorer.evaluateBatch(translations);

  console.log('批量评估结果:');
  translations.forEach((t, i) => {
    const score = results[i];
    console.log(`\n${i + 1}. "${t.source}"`);
    console.log(`   译文: "${t.translation}"`);
    console.log(`   总分: ${score.overall.toFixed(1)}/100`);
    console.log(`   评级: ${getGrade(score.overall)}`);
    
    if (score.issues.length > 0) {
      console.log(`   问题: ${score.issues.length} 个`);
      score.issues.forEach(issue => {
        console.log(`     - [${issue.severity}] ${issue.message}`);
      });
    }
  });
};

// ========== 3. 技术文档翻译评估 ==========
console.log('\n3. 技术文档翻译质量评估\n');

const evaluateTechnicalTranslation = async () => {
  const source = `
    The API endpoint accepts a POST request with a JSON payload.
    Example: \`curl -X POST https://api.example.com/data -d '{"key": "value"}'\`
    The response will be a 200 OK status with the processed data.
  `;
  
  const translation = `
    API 端点接受带有 JSON 负载的 POST 请求。
    示例：\`curl -X POST https://api.example.com/data -d '{"key": "value"}'\`
    响应将是 200 OK 状态和处理后的数据。
  `;

  console.log('技术文档评估:');
  
  const score = await scorer.evaluate(
    source,
    translation,
    'en-US',
    'zh-CN',
    {
      domain: 'technical',
      category: 'api-documentation'
    }
  );

  console.log('各维度得分:');
  console.log(`  准确性: ${score.accuracy.toFixed(1)}/100`);
  console.log(`  流畅度: ${score.fluency.toFixed(1)}/100`);
  console.log(`  技术准确性: ${score.technicalAccuracy.toFixed(1)}/100`);
  console.log(`  完整性: ${score.completeness.toFixed(1)}/100`);
  
  if (score.technicalAccuracy >= 90) {
    console.log('✅ 代码片段和技术术语保留完好');
  }
};

// ========== 4. 文化适应性评估 ==========
console.log('\n4. 文化适应性评估\n');

const evaluateCulturalAppropriateness = async () => {
  const examples = [
    {
      source: 'The meeting is scheduled for 12/25/2024 at 2:30 PM',
      goodTranslation: '会议安排在2024年12月25日下午2:30',
      poorTranslation: '会议在 12/25/2024 2:30 PM'
    },
    {
      source: 'The price is $99.99',
      goodTranslation: '价格是 ￥699.99',
      poorTranslation: '价格是 $99.99'
    }
  ];

  console.log('文化适应性测试:');
  
  for (const example of examples) {
    console.log(`\n原文: "${example.source}"`);
    
    const goodScore = await scorer.evaluate(
      example.source,
      example.goodTranslation,
      'en-US',
      'zh-CN'
    );
    
    const poorScore = await scorer.evaluate(
      example.source,
      example.poorTranslation,
      'en-US',
      'zh-CN'
    );
    
    console.log(`  适当本地化: "${example.goodTranslation}"`);
    console.log(`    文化得分: ${goodScore.culturalAppropriateness.toFixed(1)}/100`);
    
    console.log(`  未本地化: "${example.poorTranslation}"`);
    console.log(`    文化得分: ${poorScore.culturalAppropriateness.toFixed(1)}/100`);
  }
};

// ========== 5. 问题检测演示 ==========
console.log('\n5. 翻译问题检测\n');

const demonstrateIssueDetection = async () => {
  const problematicTranslations = [
    {
      source: 'Click {{button}} to continue',
      translation: '点击继续',  // 缺少占位符
      expectedIssue: '占位符丢失'
    },
    {
      source: 'Order #12345',
      translation: '订单 #54321',  // 数字不匹配
      expectedIssue: '数字不一致'
    },
    {
      source: '<strong>Important:</strong> Read carefully',
      translation: '重要：仔细阅读',  // HTML标签丢失
      expectedIssue: 'HTML格式丢失'
    },
    {
      source: 'Short text',
      translation: '这是一段非常非常非常长的翻译文本，远远超过了原文的长度',
      expectedIssue: '译文过长'
    }
  ];

  console.log('问题检测示例:');
  
  for (const example of problematicTranslations) {
    const score = await scorer.evaluate(
      example.source,
      example.translation,
      'en-US',
      'zh-CN'
    );
    
    console.log(`\n❌ ${example.expectedIssue}:`);
    console.log(`   原文: "${example.source}"`);
    console.log(`   译文: "${example.translation}"`);
    console.log(`   检测到的问题:`);
    
    score.issues.forEach(issue => {
      console.log(`     - [${issue.type}] ${issue.category}: ${issue.message}`);
    });
  }
};

// ========== 6. 改进建议生成 ==========
console.log('\n6. 翻译改进建议\n');

const generateImprovementSuggestions = async () => {
  const translation = {
    source: 'Welcome to our professional business platform. Please login to access your dashboard.',
    translation: '欢迎平台。登录。',
    sourceLocale: 'en-US' as any,
    targetLocale: 'zh-CN' as any
  };

  console.log('需要改进的翻译:');
  console.log(`原文: "${translation.source}"`);
  console.log(`译文: "${translation.translation}"`);
  
  const score = await scorer.evaluate(
    translation.source,
    translation.translation,
    translation.sourceLocale,
    translation.targetLocale
  );

  console.log(`\n质量评分: ${score.overall.toFixed(1)}/100 (${getGrade(score.overall)})`);
  console.log('\n💡 改进建议:');
  
  score.suggestions.forEach((suggestion, index) => {
    console.log(`\n${index + 1}. [${suggestion.priority.toUpperCase()}优先级]`);
    console.log(`   ${suggestion.description}`);
    console.log(`   预期提升: +${suggestion.expectedImprovement}分`);
    
    if (suggestion.example) {
      console.log(`   示例: ${suggestion.example}`);
    }
  });

  // 提供改进后的翻译示例
  const improvedTranslation = '欢迎来到我们的专业商务平台。请登录以访问您的仪表板。';
  console.log(`\n建议的改进翻译: "${improvedTranslation}"`);
  
  const improvedScore = await scorer.evaluate(
    translation.source,
    improvedTranslation,
    translation.sourceLocale,
    translation.targetLocale
  );
  
  console.log(`改进后评分: ${improvedScore.overall.toFixed(1)}/100 (${getGrade(improvedScore.overall)})`);
  console.log(`提升: +${(improvedScore.overall - score.overall).toFixed(1)}分 ✨`);
};

// ========== 7. 置信度分析 ==========
console.log('\n7. 评分置信度分析\n');

const analyzeConfidence = async () => {
  const scenarios = [
    {
      name: '长文本，无问题',
      source: 'This is a comprehensive documentation that explains the entire system architecture and implementation details.',
      translation: '这是一份全面的文档，解释了整个系统架构和实现细节。'
    },
    {
      name: '短文本',
      source: 'OK',
      translation: '好的'
    },
    {
      name: '多个问题',
      source: 'Click {{button}} to save <strong>important</strong> data',
      translation: '点击保存数据'
    }
  ];

  console.log('不同场景下的评分置信度:');
  
  for (const scenario of scenarios) {
    const score = await scorer.evaluate(
      scenario.source,
      scenario.translation,
      'en-US',
      'zh-CN'
    );
    
    console.log(`\n${scenario.name}:`);
    console.log(`  质量分数: ${score.overall.toFixed(1)}/100`);
    console.log(`  置信度: ${score.confidence.toFixed(1)}%`);
    console.log(`  可靠性: ${getConfidenceLevel(score.confidence)}`);
  }
};

// ========== 辅助函数 ==========

function displayScore(score: QualityScore): void {
  console.log('');
  console.log(`  📈 总分: ${score.overall.toFixed(1)}/100 (${getGrade(score.overall)})`);
  console.log(`  ├─ 准确性: ${score.accuracy.toFixed(1)}`);
  console.log(`  ├─ 流畅度: ${score.fluency.toFixed(1)}`);
  console.log(`  ├─ 一致性: ${score.consistency.toFixed(1)}`);
  console.log(`  ├─ 完整性: ${score.completeness.toFixed(1)}`);
  console.log(`  ├─ 文化适应: ${score.culturalAppropriateness.toFixed(1)}`);
  console.log(`  ├─ 技术准确: ${score.technicalAccuracy.toFixed(1)}`);
  console.log(`  └─ 可读性: ${score.readability.toFixed(1)}`);
  
  if (score.issues.length > 0) {
    console.log(`\n  ⚠️ 发现 ${score.issues.length} 个问题:`);
    score.issues.slice(0, 3).forEach(issue => {
      console.log(`     - [${issue.severity}] ${issue.message}`);
    });
    if (score.issues.length > 3) {
      console.log(`     ... 还有 ${score.issues.length - 3} 个问题`);
    }
  }
  
  if (score.suggestions.length > 0) {
    console.log(`\n  💡 建议:`);
    score.suggestions.slice(0, 2).forEach(suggestion => {
      console.log(`     - ${suggestion.description}`);
    });
  }
  
  console.log(`\n  🎯 置信度: ${score.confidence.toFixed(1)}%`);
}

function getGrade(score: number): string {
  if (score >= 90) return '🌟 优秀';
  if (score >= 75) return '✅ 良好';
  if (score >= 60) return '⚠️ 及格';
  return '❌ 需改进';
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 90) return '非常可靠';
  if (confidence >= 75) return '较可靠';
  if (confidence >= 60) return '一般可靠';
  return '参考性较低';
}

// ========== 运行示例 ==========

async function runExamples() {
  await evaluateSingleTranslation();
  await evaluateBatch();
  await evaluateTechnicalTranslation();
  await evaluateCulturalAppropriateness();
  await demonstrateIssueDetection();
  await generateImprovementSuggestions();
  await analyzeConfidence();
  
  console.log('\n==================================================');
  console.log('              质量评分示例完成！                   ');
  console.log('==================================================\n');
  
  console.log('📋 总结：');
  console.log('• 自动评估翻译质量的7个维度');
  console.log('• 检测占位符、格式、术语等多种问题');
  console.log('• 提供具体的改进建议和预期提升');
  console.log('• 支持批量评估和技术文档特殊处理');
  console.log('• 考虑文化适应性和本地化规范');
  console.log('• 置信度评分确保结果可靠性');
}

// 执行示例
runExamples().catch(console.error);

export { scorer };
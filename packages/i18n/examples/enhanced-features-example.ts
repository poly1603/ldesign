/**
 * @ldesign/i18n Enhanced Features Example
 * 展示框架增强功能的完整示例
 */

import { I18n, createI18n } from '../src';
import { AdvancedFormatter } from '../src/core/advanced-formatter';
import { commonKeysPresets, getCommonKeys } from '../src/presets/common-keys';
import { KeyValidator, TypeGenerator, createDevelopmentValidator } from '../src/utils/key-validator';
import { createAITranslator, AITranslatorPlugin } from '../src/plugins/ai-translator';

// ========================
// 1. 使用内置的常用翻译键
// ========================

console.log('=== 内置常用翻译键示例 ===');

const i18nWithPresets = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'en': {
      ...commonKeysPresets.en,
      // 自定义消息
      custom: {
        greeting: 'Hello, {name}!',
        itemCount: 'You have {count} item | You have {count} items'
      }
    },
    'zh-CN': {
      ...commonKeysPresets['zh-CN'],
      custom: {
        greeting: '你好，{name}！',
        itemCount: '你有 {count} 个项目'
      }
    }
  }
});

// 使用内置的常用翻译键
console.log(i18nWithPresets.t('actions.save')); // "保存"
console.log(i18nWithPresets.t('status.loading')); // "加载中..."
console.log(i18nWithPresets.t('validation.required')); // "此字段为必填项"
console.log(i18nWithPresets.t('errors.network')); // "网络错误，请检查您的连接。"
console.log(i18nWithPresets.t('ui.table.noData')); // "暂无数据"
console.log(i18nWithPresets.t('notifications.success.saved')); // "保存成功"

// ========================
// 2. 高级格式化功能
// ========================

console.log('\n=== 高级格式化功能示例 ===');

const formatter = new AdvancedFormatter('zh-CN');

// 数字格式化
console.log('数字格式化:', formatter.formatNumber(1234567.89, { 
  minimumFractionDigits: 2 
})); // "1,234,567.89"

// 货币格式化
console.log('货币格式化 (USD):', formatter.formatCurrency(1234.56, { 
  currency: 'USD' 
})); // "$1,234.56"

console.log('货币格式化 (CNY):', formatter.formatCurrency(1234.56, { 
  currency: 'CNY' 
})); // "¥1,234.56"

// 百分比格式化
console.log('百分比格式化:', formatter.formatPercent(0.1234)); // "12.34%"

// 日期格式化
const date = new Date('2024-03-15T10:30:00');
console.log('日期格式化 (short):', formatter.formatDate(date, { 
  preset: 'short' 
})); // "24/03/15"

console.log('日期格式化 (long):', formatter.formatDate(date, { 
  preset: 'long' 
})); // "2024年3月15日"

// 相对时间格式化
const pastDate = new Date(Date.now() - 3600000); // 1小时前
console.log('相对时间:', formatter.formatRelativeTime(pastDate)); // "1 小时前"

// 持续时间格式化
console.log('持续时间:', formatter.formatDuration(3661000)); // "1 小时, 1 分钟"

// 文件大小格式化
console.log('文件大小:', formatter.formatFileSize(1536, { 
  binary: true 
})); // "1.5 KiB"

// 序数词格式化
console.log('序数词 (en):', new AdvancedFormatter('en').formatOrdinal(1)); // "1st"
console.log('序数词 (zh):', formatter.formatOrdinal(1)); // "第1"

// 列表格式化
console.log('列表格式化:', formatter.formatList(['苹果', '香蕉', '橙子'], {
  type: 'conjunction'
})); // "苹果、香蕉和橙子"

// 电话号码格式化
console.log('电话号码:', formatter.formatPhoneNumber('13812345678')); // "138-1234-5678"

// 大数字缩写
console.log('数字缩写:', formatter.abbreviateNumber(1234567, { 
  decimals: 1 
})); // "1.2M"

// 自定义格式化器
formatter.registerFormatter('emoji', {
  format: (value: any) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      love: '❤️',
      success: '✅',
      error: '❌'
    };
    return emojiMap[value] || value;
  }
});

console.log('自定义emoji格式化:', formatter.format('success', 'emoji')); // "✅"

// ========================
// 3. 在i18n中集成格式化
// ========================

console.log('\n=== 集成格式化示例 ===');

const i18nWithFormatter = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      price: '价格：{amount:currency}',
      discount: '折扣：{rate:percent}',
      date: '日期：{date:date:long}',
      fileSize: '文件大小：{size:filesize}',
      phoneNumber: '联系电话：{phone:phone}',
      ordinal: '第 {position:ordinal} 名',
      status: '状态：{status:status}'
    }
  },
  formatters: {
    currency: {
      format: (value: number, format: string, locale: string) => {
        return formatter.formatCurrency(value, { currency: 'CNY' });
      }
    },
    percent: {
      format: (value: number) => formatter.formatPercent(value)
    },
    date: {
      format: (value: Date, format: string) => {
        const [, , preset] = format.split(':');
        return formatter.formatDate(value, { preset });
      }
    },
    filesize: {
      format: (value: number) => formatter.formatFileSize(value)
    },
    phone: {
      format: (value: string) => formatter.formatPhoneNumber(value)
    },
    ordinal: {
      format: (value: number) => formatter.formatOrdinal(value)
    },
    status: {
      format: (value: string) => formatter.format(value, 'status')
    }
  }
});

// 使用带格式化的翻译
console.log(i18nWithFormatter.t('price', { amount: 1234.56 })); 
// "价格：¥1,234.56"

console.log(i18nWithFormatter.t('discount', { rate: 0.15 })); 
// "折扣：15.00%"

console.log(i18nWithFormatter.t('date', { date: new Date('2024-03-15') })); 
// "日期：2024年3月15日"

// ========================
// 4. 翻译键验证
// ========================

console.log('\n=== 翻译键验证示例 ===');

const referenceMessages = {
  greeting: 'Hello, {name}!',
  auth: {
    login: 'Login',
    logout: 'Logout',
    password: 'Password must be at least {min} characters'
  },
  items: {
    count: '{count} item | {count} items'
  }
};

const validator = new KeyValidator(referenceMessages);

// 验证其他语言的翻译
const zhMessages = {
  greeting: '你好，{name}！',
  auth: {
    login: '登录',
    // logout 缺失
    password: '密码至少需要 {min} 个字符'
  },
  items: {
    count: '{count} 个项目'
  },
  extraKey: '额外的键' // 额外的键
};

const validationResult = validator.validate(zhMessages, 'zh-CN');

console.log('验证结果:');
console.log('- 是否有效:', validationResult.valid); // false
console.log('- 缺失的键:', validationResult.missingKeys); // ['auth.logout']
console.log('- 额外的键:', validationResult.extraKeys); // ['extraKey']
console.log('- 警告:', validationResult.warnings);

// 生成TypeScript类型
const typeDefinitions = TypeGenerator.generateTypes(referenceMessages);
console.log('\n生成的TypeScript类型:');
console.log(typeDefinitions.split('\n').slice(0, 10).join('\n') + '\n...');

// 开发时验证
const devValidator = createDevelopmentValidator(referenceMessages);
console.log('\n开发时验证:');
devValidator.checkKey('greeting'); // 有效
devValidator.checkKey('auth.login'); // 有效
devValidator.checkKey('auth.loging'); // 无效，会提示建议

// ========================
// 5. AI辅助翻译
// ========================

console.log('\n=== AI辅助翻译示例 ===');

// 创建带AI翻译的i18n实例
const aiTranslator = createAITranslator({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY || 'demo-key', // 使用环境变量
  autoTranslate: true,
  cacheTranslations: true
});

const i18nWithAI = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'en': {
      welcome: 'Welcome to our application!',
      features: {
        ai: 'AI-powered translation',
        validation: 'Key validation',
        formatting: 'Advanced formatting'
      }
    },
    'zh-CN': {
      // 中文翻译缺失，将由AI自动翻译
    }
  },
  plugins: [aiTranslator]
});

// AI自动翻译示例（使用模拟服务）
async function demonstrateAITranslation() {
  await i18nWithAI.init();

  // 当访问缺失的翻译时，AI会自动翻译
  console.log('原文:', i18nWithAI.t('welcome')); 
  // AI会自动从英文翻译

  // 手动触发AI翻译
  if ((i18nWithAI as any).aiTranslate) {
    const translated = await (i18nWithAI as any).aiTranslate(
      'Hello World',
      'en',
      'zh'
    );
    console.log('AI翻译结果:', translated); // "[AI] Hello World (zh)"
  }

  // 批量翻译缺失的键
  if ((i18nWithAI as any).aiTranslateAll) {
    const translations = await (i18nWithAI as any).aiTranslateAll('zh-CN');
    console.log('批量翻译结果:', translations);
  }

  // 检测语言
  if ((i18nWithAI as any).aiDetectLanguage) {
    const detectedLang = await (i18nWithAI as any).aiDetectLanguage('你好世界');
    console.log('检测到的语言:', detectedLang); // "zh"
  }

  // 获取翻译建议
  if ((i18nWithAI as any).aiSuggest) {
    const suggestions = await (i18nWithAI as any).aiSuggest(
      'Welcome',
      'greeting context'
    );
    console.log('翻译建议:', suggestions);
  }
}

// ========================
// 6. 综合应用示例
// ========================

console.log('\n=== 综合应用示例 ===');

async function comprehensiveExample() {
  // 创建一个功能齐全的i18n实例
  const i18n = createI18n({
    locale: 'zh-CN',
    fallbackLocale: 'en',
    messages: {
      'en': {
        ...commonKeysPresets.en,
        app: {
          title: 'My Application',
          description: 'A powerful i18n example',
          userCount: 'Total users: {count:abbreviate}',
          lastLogin: 'Last login: {date:relative}',
          storage: 'Storage used: {size:filesize}',
          completion: 'Progress: {percent:percent}',
          rank: 'Your rank: {position:ordinal}'
        }
      },
      'zh-CN': {
        ...commonKeysPresets['zh-CN'],
        app: {
          title: '我的应用',
          description: '强大的国际化示例',
          userCount: '用户总数：{count:abbreviate}',
          lastLogin: '上次登录：{date:relative}',
          storage: '已用存储：{size:filesize}',
          completion: '进度：{percent:percent}',
          rank: '您的排名：{position:ordinal}'
        }
      }
    },
    plugins: [aiTranslator]
  });

  // 初始化
  await i18n.init();

  // 使用内置键
  console.log('保存按钮:', i18n.t('actions.save')); // "保存"
  console.log('加载状态:', i18n.t('status.loading')); // "加载中..."

  // 使用自定义键和格式化
  console.log(i18n.t('app.userCount', { 
    count: i18n.format(1234567, 'abbreviate') 
  })); // "用户总数：1.2M"

  console.log(i18n.t('app.lastLogin', { 
    date: i18n.format(new Date(Date.now() - 7200000), 'relative') 
  })); // "上次登录：2 小时前"

  console.log(i18n.t('app.storage', { 
    size: i18n.format(5242880, 'filesize') 
  })); // "已用存储：5.0 MB"

  console.log(i18n.t('app.completion', { 
    percent: i18n.format(0.75, 'percent') 
  })); // "进度：75%"

  console.log(i18n.t('app.rank', { 
    position: i18n.format(3, 'ordinal') 
  })); // "您的排名：第3"

  // 切换语言
  await i18n.setLocale('en');
  console.log('\n切换到英文:');
  console.log(i18n.t('app.title')); // "My Application"
  console.log(i18n.t('actions.save')); // "Save"
}

// ========================
// 运行示例
// ========================

// 运行异步示例
Promise.resolve().then(async () => {
  console.log('\n=== 运行异步示例 ===');
  await demonstrateAITranslation();
  await comprehensiveExample();
}).catch(console.error);

// 导出供其他模块使用
export {
  i18nWithPresets,
  i18nWithFormatter,
  i18nWithAI,
  formatter,
  validator,
  aiTranslator
};
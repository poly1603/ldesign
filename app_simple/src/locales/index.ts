/**
 * 语言包索引
 */

import zhCN from './zh-CN';
import enUS from './en-US';

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
};

export const availableLocales = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

export default messages;
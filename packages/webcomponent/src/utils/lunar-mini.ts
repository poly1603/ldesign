// 极简农历格式化（演示用）：按公历日简单映射为“初X / 十X / 廿X / 三十”
// 实际项目建议替换为更准确的农历库，再由 calendar 按需动态 import 该库。

export function format(d: Date): string {
  const day = d.getDate();
  const n1 = ['初','十','廿','三十'];
  const n2 = ['一','二','三','四','五','六','七','八','九','十'];
  if (day === 10) return '初十';
  if (day === 20) return '二十';
  if (day === 30) return '三十';
  const prefix = n1[Math.floor((day-1)/10)] || '';
  const suffix = n2[(day-1)%10] || '';
  return prefix + suffix;
}

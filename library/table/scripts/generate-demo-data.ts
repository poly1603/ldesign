/**
 * 生成演示数据工具
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  company: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'pending';
}

const firstNames = [
  '张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗'
];

const lastNames = [
  '伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军',
  '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平'
];

const companies = [
  '阿里巴巴', '腾讯', '百度', '字节跳动', '美团',
  '京东', '小米', '华为', '网易', '滴滴',
  '拼多多', '快手', '哔哩哔哩', '新浪', '搜狐'
];

const positions = [
  '工程师', '高级工程师', '技术专家', '产品经理', '项目经理',
  '设计师', '运营', '市场', '销售', '客服',
  'HR', '财务', '行政', 'CEO', 'CTO'
];

const departments = [
  '技术部', '产品部', '设计部', '运营部', '市场部',
  '销售部', '客服部', '人力资源部', '财务部', '行政部'
];

const cities = [
  '北京市朝阳区', '上海市浦东新区', '广州市天河区', '深圳市南山区',
  '杭州市西湖区', '成都市武侯区', '重庆市渝中区', '武汉市武昌区',
  '南京市鼓楼区', '西安市雁塔区', '苏州市姑苏区', '天津市河西区'
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split('T')[0];
}

function generateUser(id: number): User {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const name = firstName + lastName;
  const age = 22 + Math.floor(Math.random() * 38); // 22-59
  
  return {
    id,
    name,
    age,
    email: `${name.toLowerCase()}${id}@example.com`,
    phone: `138${String(id).padStart(8, '0').slice(0, 8)}`,
    address: randomItem(cities),
    company: randomItem(companies),
    position: randomItem(positions),
    department: randomItem(departments),
    salary: Math.floor(Math.random() * 30000) + 5000, // 5k-35k
    hireDate: randomDate(new Date(2015, 0, 1), new Date()),
    status: randomItem(['active', 'active', 'active', 'inactive', 'pending'] as const),
  };
}

function generateData(count: number): User[] {
  const data: User[] = [];
  for (let i = 1; i <= count; i++) {
    data.push(generateUser(i));
  }
  return data;
}

// 生成不同规模的数据集
const sizes = {
  small: 100,
  medium: 1000,
  large: 10000,
  huge: 100000,
};

console.log('开始生成演示数据...\n');

Object.entries(sizes).forEach(([name, count]) => {
  console.log(`生成 ${name} 数据集 (${count.toLocaleString()} 条)...`);
  const data = generateData(count);
  
  const outputPath = resolve(
    __dirname,
    `../examples/demo-data-${name}.json`
  );
  
  writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ 已保存到: ${outputPath}\n`);
});

// 生成TypeScript类型定义
const typeDef = `/**
 * 演示数据类型定义
 */

export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  company: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'pending';
}

export type UserData = User[];
`;

const typeDefPath = resolve(__dirname, '../examples/demo-data.d.ts');
writeFileSync(typeDefPath, typeDef, 'utf-8');
console.log(`✓ 类型定义已保存到: ${typeDefPath}\n`);

console.log('所有数据生成完成！');




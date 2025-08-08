import type { FormData } from '@/types/form'

/**
 * 模拟数据，用于演示和测试
 */
export const mockFormData: Partial<FormData> = {
  firstName: '张',
  lastName: '三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  gender: 'male',
  birthDate: '1990-01-01',
  country: 'china',
  province: '北京市',
  city: '北京市',
  address: '朝阳区某某街道某某号',
  zipCode: '100000',
  company: '某某科技有限公司',
  position: '前端工程师',
  industry: 'it',
  experience: '3-5',
  salary: 15000,
  interests: ['reading', 'programming', 'music'],
  newsletter: true,
  notifications: true,
  language: 'zh',
  bio: '热爱技术，专注于前端开发，有丰富的 Vue.js 和 TypeScript 开发经验。',
  website: 'https://example.com',
  socialMedia: '@zhangsan',
}

/**
 * 多个测试用户数据
 */
export const mockUsers: Array<Partial<FormData>> = [
  {
    firstName: '李',
    lastName: '四',
    email: 'lisi@example.com',
    phone: '13900139000',
    gender: 'female',
    country: 'china',
    company: '某某设计公司',
    position: 'UI设计师',
    industry: 'service',
    interests: ['design', 'photography', 'travel'],
    bio: '专业的UI/UX设计师，擅长用户体验设计和视觉设计。',
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    gender: 'male',
    country: 'usa',
    company: 'Tech Corp',
    position: 'Software Engineer',
    industry: 'it',
    language: 'en',
    interests: ['programming', 'gaming', 'sports'],
    bio: 'Experienced software engineer with expertise in full-stack development.',
  },
  {
    firstName: '田中',
    lastName: '太郎',
    email: 'tanaka@example.com',
    phone: '09012345678',
    gender: 'male',
    country: 'japan',
    company: 'テック株式会社',
    position: 'プロダクトマネージャー',
    industry: 'it',
    language: 'ja',
    interests: ['technology', 'reading', 'cooking'],
    bio: 'プロダクト開発に情熱を注ぐマネージャーです。',
  },
]

/**
 * 获取随机模拟数据
 */
export function getRandomMockData(): Partial<FormData> {
  const randomIndex = Math.floor(Math.random() * mockUsers.length)
  return mockUsers[randomIndex]
}

/**
 * 生成随机表单数据（用于压力测试）
 */
export function generateRandomFormData(): Partial<FormData> {
  const firstNames = [
    '张',
    '李',
    '王',
    '刘',
    '陈',
    'John',
    'Jane',
    'Mike',
    'Sarah',
    '田中',
    '佐藤',
  ]
  const lastNames = [
    '三',
    '四',
    '五',
    '六',
    '七',
    'Doe',
    'Smith',
    'Johnson',
    'Brown',
    '太郎',
    '花子',
  ]
  const companies = [
    '科技公司',
    '设计公司',
    '咨询公司',
    'Tech Corp',
    'Design Studio',
    'テック株式会社',
  ]
  const positions = [
    '工程师',
    '设计师',
    '产品经理',
    'Engineer',
    'Designer',
    'エンジニア',
  ]

  const randomFirstName =
    firstNames[Math.floor(Math.random() * firstNames.length)]
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const randomCompany = companies[Math.floor(Math.random() * companies.length)]
  const randomPosition = positions[Math.floor(Math.random() * positions.length)]

  return {
    firstName: randomFirstName,
    lastName: randomLastName,
    email: `${randomFirstName.toLowerCase()}${randomLastName.toLowerCase()}@example.com`,
    phone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    country: ['china', 'usa', 'japan'][Math.floor(Math.random() * 3)],
    company: randomCompany,
    position: randomPosition,
    industry: ['it', 'finance', 'education', 'healthcare'][
      Math.floor(Math.random() * 4)
    ],
    salary: Math.floor(Math.random() * 50000) + 5000,
    newsletter: Math.random() > 0.5,
    notifications: Math.random() > 0.3,
    language: ['zh', 'en', 'ja'][Math.floor(Math.random() * 3)],
  }
}

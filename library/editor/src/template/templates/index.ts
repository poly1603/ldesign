/**
 * 内置模板集合
 */

import { Template, TemplateCategory } from '../types'

// 会议纪要模板
const meetingMinutesTemplate: Template = {
  metadata: {
    id: 'builtin-meeting-minutes',
    name: '会议纪要',
    description: '标准会议纪要模板，包含会议基本信息和讨论内容',
    category: TemplateCategory.BUSINESS,
    tags: ['会议', '纪要', '商务'],
    author: 'System',
    isBuiltin: true
  },
  content: `
    <h1>会议纪要</h1>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; width: 120px;">会议主题</td>
        <td style="padding: 8px; border: 1px solid #ddd;">{{meetingTitle}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">会议时间</td>
        <td style="padding: 8px; border: 1px solid #ddd;">{{meetingDate}} {{meetingTime}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">会议地点</td>
        <td style="padding: 8px; border: 1px solid #ddd;">{{location}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">主持人</td>
        <td style="padding: 8px; border: 1px solid #ddd;">{{host}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">参会人员</td>
        <td style="padding: 8px; border: 1px solid #ddd;">{{attendees}}</td>
      </tr>
    </table>
    
    <h2>会议议程</h2>
    <ol>
      <li>议题一</li>
      <li>议题二</li>
      <li>议题三</li>
    </ol>
    
    <h2>会议内容</h2>
    <h3>1. 议题一</h3>
    <p>讨论内容...</p>
    <p><strong>决议：</strong></p>
    
    <h3>2. 议题二</h3>
    <p>讨论内容...</p>
    <p><strong>决议：</strong></p>
    
    <h3>3. 议题三</h3>
    <p>讨论内容...</p>
    <p><strong>决议：</strong></p>
    
    <h2>下一步行动</h2>
    <ul>
      <li>行动项1 - 负责人：{{person1}} - 截止日期：{{deadline1}}</li>
      <li>行动项2 - 负责人：{{person2}} - 截止日期：{{deadline2}}</li>
    </ul>
    
    <p style="margin-top: 30px;">
      <strong>记录人：</strong>{{recorder}}<br>
      <strong>日期：</strong>{{date}}
    </p>
  `,
  variables: [
    { key: 'meetingTitle', label: '会议主题', type: 'text', required: true },
    { key: 'meetingDate', label: '会议日期', type: 'date', required: true },
    { key: 'meetingTime', label: '会议时间', type: 'text', defaultValue: '14:00' },
    { key: 'location', label: '会议地点', type: 'text', defaultValue: '会议室' },
    { key: 'host', label: '主持人', type: 'text' },
    { key: 'attendees', label: '参会人员', type: 'text' },
    { key: 'recorder', label: '记录人', type: 'text' },
    { key: 'date', label: '记录日期', type: 'date' }
  ]
}

// 简历模板
const resumeTemplate: Template = {
  metadata: {
    id: 'builtin-resume',
    name: '个人简历',
    description: '专业的个人简历模板',
    category: TemplateCategory.PERSONAL,
    tags: ['简历', '求职', '个人'],
    author: 'System',
    isBuiltin: true
  },
  content: `
    <div style="max-width: 800px; margin: 0 auto;">
      <h1 style="text-align: center; color: #2c3e50;">{{name}}</h1>
      <p style="text-align: center; color: #666;">
        {{phone}} | {{email}} | {{location}}
      </p>
      
      <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">个人简介</h2>
      <p>{{summary}}</p>
      
      <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">教育背景</h2>
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 10px 0 5px 0;">{{school}} <span style="float: right; font-weight: normal;">{{eduDate}}</span></h3>
        <p style="margin: 5px 0;">{{degree}} - {{major}}</p>
        <p style="margin: 5px 0;">GPA: {{gpa}}</p>
      </div>
      
      <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">工作经历</h2>
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 10px 0 5px 0;">{{company1}} - {{position1}} <span style="float: right; font-weight: normal;">{{workDate1}}</span></h3>
        <ul>
          <li>工作职责1</li>
          <li>工作职责2</li>
          <li>工作成果</li>
        </ul>
      </div>
      
      <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">专业技能</h2>
      <ul>
        <li><strong>编程语言：</strong>{{skills1}}</li>
        <li><strong>框架工具：</strong>{{skills2}}</li>
        <li><strong>其他技能：</strong>{{skills3}}</li>
      </ul>
      
      <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px;">项目经验</h2>
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 10px 0 5px 0;">{{projectName}} <span style="float: right; font-weight: normal;">{{projectDate}}</span></h3>
        <p><strong>项目描述：</strong>{{projectDesc}}</p>
        <p><strong>技术栈：</strong>{{techStack}}</p>
        <p><strong>个人贡献：</strong></p>
        <ul>
          <li>贡献1</li>
          <li>贡献2</li>
        </ul>
      </div>
    </div>
  `,
  variables: [
    { key: 'name', label: '姓名', type: 'text', required: true },
    { key: 'phone', label: '电话', type: 'text' },
    { key: 'email', label: '邮箱', type: 'text' },
    { key: 'location', label: '所在地', type: 'text' },
    { key: 'summary', label: '个人简介', type: 'text' }
  ]
}

// 项目报告模板
const projectReportTemplate: Template = {
  metadata: {
    id: 'builtin-project-report',
    name: '项目报告',
    description: '标准项目报告模板',
    category: TemplateCategory.BUSINESS,
    tags: ['报告', '项目', '商务'],
    author: 'System',
    isBuiltin: true
  },
  content: `
    <h1 style="text-align: center;">{{projectName}} 项目报告</h1>
    <p style="text-align: center; color: #666;">报告日期：{{reportDate}}</p>
    
    <h2>1. 执行摘要</h2>
    <p>{{summary}}</p>
    
    <h2>2. 项目背景</h2>
    <p>{{background}}</p>
    
    <h2>3. 项目目标</h2>
    <ul>
      <li>主要目标1</li>
      <li>主要目标2</li>
      <li>主要目标3</li>
    </ul>
    
    <h2>4. 项目范围</h2>
    <h3>4.1 包含内容</h3>
    <ul>
      <li>范围项1</li>
      <li>范围项2</li>
    </ul>
    
    <h3>4.2 排除内容</h3>
    <ul>
      <li>排除项1</li>
      <li>排除项2</li>
    </ul>
    
    <h2>5. 实施计划</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 8px;">阶段</th>
          <th style="border: 1px solid #ddd; padding: 8px;">任务</th>
          <th style="border: 1px solid #ddd; padding: 8px;">负责人</th>
          <th style="border: 1px solid #ddd; padding: 8px;">截止日期</th>
          <th style="border: 1px solid #ddd; padding: 8px;">状态</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">第一阶段</td>
          <td style="border: 1px solid #ddd; padding: 8px;">需求分析</td>
          <td style="border: 1px solid #ddd; padding: 8px;">{{person1}}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">{{date1}}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">进行中</td>
        </tr>
      </tbody>
    </table>
    
    <h2>6. 风险评估</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 8px;">风险</th>
          <th style="border: 1px solid #ddd; padding: 8px;">可能性</th>
          <th style="border: 1px solid #ddd; padding: 8px;">影响</th>
          <th style="border: 1px solid #ddd; padding: 8px;">应对措施</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">风险1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">中</td>
          <td style="border: 1px solid #ddd; padding: 8px;">高</td>
          <td style="border: 1px solid #ddd; padding: 8px;">措施1</td>
        </tr>
      </tbody>
    </table>
    
    <h2>7. 预算</h2>
    <p>总预算：{{budget}}</p>
    
    <h2>8. 结论与建议</h2>
    <p>{{conclusion}}</p>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p><strong>报告人：</strong>{{author}}</p>
      <p><strong>部门：</strong>{{department}}</p>
    </div>
  `,
  variables: [
    { key: 'projectName', label: '项目名称', type: 'text', required: true },
    { key: 'reportDate', label: '报告日期', type: 'date', required: true },
    { key: 'summary', label: '执行摘要', type: 'text' },
    { key: 'background', label: '项目背景', type: 'text' },
    { key: 'budget', label: '项目预算', type: 'text' },
    { key: 'author', label: '报告人', type: 'text' },
    { key: 'department', label: '部门', type: 'text' }
  ]
}

// 博客文章模板
const blogPostTemplate: Template = {
  metadata: {
    id: 'builtin-blog-post',
    name: '博客文章',
    description: '标准博客文章模板，包含标题、元信息和内容结构',
    category: TemplateCategory.CREATIVE,
    tags: ['博客', '文章', '创作'],
    author: 'System',
    isBuiltin: true
  },
  content: `
    <h1>{{title}}</h1>
    <div style="color: #666; font-size: 14px; margin: 10px 0;">
      <span>作者：{{author}}</span> | 
      <span>发布日期：{{publishDate}}</span> | 
      <span>分类：{{category}}</span>
    </div>
    
    <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
      <strong>摘要：</strong>{{abstract}}
    </div>
    
    <h2>引言</h2>
    <p>{{introduction}}</p>
    
    <h2>主要内容</h2>
    <h3>第一部分</h3>
    <p>内容详述...</p>
    
    <h3>第二部分</h3>
    <p>内容详述...</p>
    
    <h3>第三部分</h3>
    <p>内容详述...</p>
    
    <h2>结论</h2>
    <p>{{conclusion}}</p>
    
    <h2>参考资料</h2>
    <ol>
      <li>参考文献1</li>
      <li>参考文献2</li>
    </ol>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p><strong>标签：</strong>{{tags}}</p>
      <p><strong>版权声明：</strong>本文为原创文章，转载请注明出处。</p>
    </div>
  `,
  variables: [
    { key: 'title', label: '文章标题', type: 'text', required: true },
    { key: 'author', label: '作者', type: 'text', required: true },
    { key: 'publishDate', label: '发布日期', type: 'date' },
    { key: 'category', label: '分类', type: 'text' },
    { key: 'tags', label: '标签', type: 'text' },
    { key: 'abstract', label: '摘要', type: 'text' },
    { key: 'introduction', label: '引言', type: 'text' },
    { key: 'conclusion', label: '结论', type: 'text' }
  ]
}

// 空白模板
const blankTemplate: Template = {
  metadata: {
    id: 'builtin-blank',
    name: '空白文档',
    description: '从空白文档开始创作',
    category: TemplateCategory.PERSONAL,
    tags: ['空白', '基础'],
    author: 'System',
    isBuiltin: true
  },
  content: `<p><br></p>`,
  variables: []
}

// 导出所有内置模板
export const builtinTemplates: Template[] = [
  meetingMinutesTemplate,
  resumeTemplate,
  projectReportTemplate,
  blogPostTemplate,
  blankTemplate
]

// 按分类导出
export const templatesByCategory = {
  [TemplateCategory.BUSINESS]: [meetingMinutesTemplate, projectReportTemplate],
  [TemplateCategory.PERSONAL]: [resumeTemplate, blankTemplate],
  [TemplateCategory.CREATIVE]: [blogPostTemplate],
  [TemplateCategory.EDUCATION]: [],
  [TemplateCategory.TECHNICAL]: [],
  [TemplateCategory.CUSTOM]: []
}
/**
 * 示例数据配置
 * 
 * @description
 * 提供各种示例场景的字段配置和数据，用于演示不同的表单功能
 */

import type { QueryFormField } from '@ldesign/form'

/**
 * 基础查询表单字段配置
 */
export const basicQueryFields: QueryFormField[] = [
  {
    name: 'name',
    label: '姓名',
    type: 'text',
    placeholder: '请输入姓名'
  },
  {
    name: 'email',
    label: '邮箱',
    type: 'email',
    placeholder: '请输入邮箱地址'
  },
  {
    name: 'department',
    label: '部门',
    type: 'select',
    placeholder: '请选择部门',
    options: [
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' },
      { label: '运营部', value: 'operation' }
    ]
  }
]

/**
 * 高级查询表单字段配置（8个字段，用于测试内联布局）
 */
export const advancedQueryFields: QueryFormField[] = [
  {
    name: 'name',
    label: '姓名',
    type: 'text',
    placeholder: '请输入姓名'
  },
  {
    name: 'email',
    label: '邮箱',
    type: 'email',
    placeholder: '请输入邮箱地址'
  },
  {
    name: 'phone',
    label: '手机号',
    type: 'text',
    placeholder: '请输入手机号'
  },
  {
    name: 'department',
    label: '部门',
    type: 'select',
    placeholder: '请选择部门',
    options: [
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' },
      { label: '运营部', value: 'operation' }
    ]
  },
  {
    name: 'position',
    label: '职位',
    type: 'select',
    placeholder: '请选择职位',
    options: [
      { label: '前端工程师', value: 'frontend' },
      { label: '后端工程师', value: 'backend' },
      { label: '产品经理', value: 'pm' },
      { label: 'UI设计师', value: 'ui' }
    ]
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '在职', value: 'active' },
      { label: '离职', value: 'inactive' },
      { label: '试用期', value: 'probation' }
    ]
  },
  {
    name: 'startDate',
    label: '入职日期',
    type: 'date',
    placeholder: '请选择入职日期'
  },
  {
    name: 'endDate',
    label: '离职日期',
    type: 'date',
    placeholder: '请选择离职日期'
  }
]

/**
 * 动态字段配置示例
 */
export const dynamicQueryFields: QueryFormField[] = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'text',
    placeholder: '请输入搜索关键词'
  },
  {
    name: 'category',
    label: '分类',
    type: 'select',
    placeholder: '请选择分类',
    options: [
      { label: '全部', value: '' },
      { label: '文章', value: 'article' },
      { label: '视频', value: 'video' },
      { label: '图片', value: 'image' }
    ]
  },
  {
    name: 'author',
    label: '作者',
    type: 'text',
    placeholder: '请输入作者名称'
  },
  {
    name: 'publishDate',
    label: '发布日期',
    type: 'date',
    placeholder: '请选择发布日期'
  },
  {
    name: 'tags',
    label: '标签',
    type: 'text',
    placeholder: '请输入标签，多个标签用逗号分隔'
  }
]

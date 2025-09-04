<script lang="tsx" setup>
import { SearchParameters } from '@ldesign/base'
import { Divider, Input, RadioGroup, Select, Space, Switch } from '@ldesign/desktop-next'
import { LDesignForm } from '@ldesign/form'
import { LDesignPage } from '@ldesign/layout'
import { request } from '@ldesign/request'
import { reactive, ref } from 'vue'

const el = ref(null)

const form = reactive({
  loginname: '测试系统名称',
  logindepict: '测试登录页描述内容',
  loginstate: '01',
  loginstate1: '1',
  orgtype: '',
  orgno: '',
  orgnature: '',
  customLoadSelect: '',
})

const options = ref<any[]>([{
  label: '登录页名称',
  component: Input,
  name: 'loginname',
  props: {
    placeholder: '请输入登录页名称',
  },
}, {
  label: '登录页描述',
  component: Input,
  name: 'logindepict',
  props: {
  },
}, {
  label: '启用情况静态',
  component: RadioGroup,
  span: 2,
  name: 'loginstate1',
  props: {
    options: [{
      label: '启用',
      value: '1',
    }, {
      label: '未启用',
      value: '0',
    }],
  },
}, {
  label: '启用情况',
  component: RadioGroup,
  name: 'loginstate',
  code: 'ORG_orgnature',
  span: 2,
}, {
  label: '自定义请求加载代码表',
  component: Select,
  name: 'customLoadSelect',
  load: async () => {
    const par = new SearchParameters()
    par.setName('organcategory')
    const res = await request.post({
      name: 'ORG_commonSearchs',
      data: {
        par,
      },
    })

    const result = res?.result?.map(a => ({
      label: a.categoryname,
      value: a.categorycode,
    }))

    form.customLoadSelect = result?.[0].value
    return result || []
  },
  props: {
    onChange: autoFill,
  },
}, {
  label: '机构性质',
  component: Select,
  name: 'orgnature',
  code: 'ORG_orgnature',
  relation: {
    name: 'orgtype',
    type: 0,
  },
  props: {
    onChange: autoFill,
  },
}, {
  label: '机构类型',
  component: Select,
  name: 'orgtype',
  code: 'ORG_orgtype',
  props: {
    onChange: autoFill,
  },
}, {
  label: '机构类型代码',
  component: Input,
  name: 'orgno',
}])

function autoFill() {
  form.orgno = `${form.customLoadSelect}${form.orgnature}${form.orgtype}`
}

const readonly = ref(false)

function submit() {
}
</script>

<template>
  <LDesignPage>
    <Space>
      <span>只读：</span>
      <Switch v-model="readonly" />
    </Space>
    <Divider />
    <LDesignForm
      ref="el"
      v-model="form"
      :readonly="readonly"
      :options="options"
    />
    <button @click="submit">
      提交
    </button>
  </LDesignPage>
</template>

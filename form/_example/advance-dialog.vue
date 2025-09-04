<template>
  <div>
    <Button @click="onClick">弹窗</Button>
    <LDesignPopFrame v-model:visible="visible" height="600px" @confirm="onConfirm">
      <LDesignForm :options="options" v-model="form" :rules="rules" @change="onChange" @submit="onSubmit" />
    </LDesignPopFrame>
  </div>
</template>
<script lang="tsx" setup>
import { SearchParameters } from '@ldesign/base';
import { Input, RadioGroup, Button, Select, Space, Switch, Divider } from '@ldesign/desktop-next';
import { LDesignForm, type LDesignFormOptions } from '@ldesign/form'
import { LDesignPopFrame } from '@ldesign/layout';
import { request } from '@ldesign/request';
import { ref, reactive } from 'vue';

const visible = ref(false)

const form = reactive({
  loginname: '',
  logindepict: '',
  loginstate: '',
  loginstate1: '',
  orgtype: '',
  orgno: '',
  orgnature: '',
  customLoadSelect: ''
})

function setOrgValue () {
  form.orgno = `${form.customLoadSelect}${form.orgnature}${form.orgtype}`
}

const rules = {
  loginname: [{
    required: true,
    message: '登录页名称不能为空',
    trigger: 'submit'
  }]
}

const options = ref<LDesignFormOptions[]>([{
  label: '登录页名称',
  component: Input,
  name: 'loginname',
  props: {
    placeholder: '请输入登录页名称'
  }
}, {
  label: '登录页描述',
  component: Input,
  name: 'logindepict',
  props: {
  }
}, {
  label: '启用情况静态',
  component: RadioGroup,
  name: 'loginstate1',
  props: {
    options: [{
      label: '启用',
      value: '1'
    }, {
      label: '未启用',
      value: '0'
    }],
    defaultValue: '0',
  }
}, {
  label: '启用情况',
  component: RadioGroup,
  name: 'loginstate',
  code: 'ORG_orgnature',
  props: {
    defaultValue: '01',
  }
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
        par
      }
    })
    return res?.result
  },
  props: {
    keys: {
      'label': 'categoryname',
      'value': 'categorycode'
    },
    onChange: setOrgValue
  }
}, {
  label: '机构性质',
  component: Select,
  name: 'orgnature',
  code: 'ORG_orgnature',
  relation: {
    name: 'orgtype',
    type: 0
  },
  props: {
    onChange: setOrgValue,
  }
}, {
  label: '机构类型',
  component: Select,
  name: 'orgtype',
  code: 'ORG_orgtype',
  props: {
    onChange: setOrgValue,
  }
}, {
  label: '机构类型代码',
  component: Input,
  name: 'orgno',
}])

function onChange(v, ctx) {
  // console.log(v, ctx)
}

function onSubmit(v, ctx) {
  // console.log(v, ctx)
}

function onClick() {
  visible.value = true
}

function onConfirm({ form }) {
  return new Promise(async (resolve, reject) => {
    const v = await form.validate()
    console.log(v)
    if (v.validateResult === true) {
      setTimeout(() => {
        if (Math.random() > 0.6) {
          resolve({
            message: '添加成功',
            type: 'success',
          })
        }
        else {
          reject(new Error('添加失败，请稍后重试！'))
        }
      }, 1000)
    } else {
      reject(new Error(v.firstError))
    }
  })
}
</script>
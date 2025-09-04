<template>
  <div>
    <Space>
      <span>文字位置</span>
      <RadioGroup v-model="labelAlign">
        <Radio value="left">左</Radio>
        <Radio value="right">右</Radio>
        <Radio value="top">顶部</Radio>
      </RadioGroup>
    </Space>
    <p>视觉分组</p>
    <LDesignForm :adjustSpan="false" buttonPosition="block" :labelAlign="labelAlign" :options="options" variant="entry" v-model="form" @change="onChange" />
    <p>真正的分组</p>
    <LDesignForm
      :options="formOptions1"
    />
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Radio, Space, Select } from '@ldesign/desktop-next';
import { LDesignForm, LDesignUpload, type LDesignFormOptions } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { ref, reactive } from 'vue';
import { LDesignTitle } from '@ldesign/layout';

const form = reactive({
  name: '',
  sex: '1',
  name1: ''
})
const labelAlign = ref<any>('left')
const visible = ref(false)

// const form = ref({
//   name: '',
//   sex: ''
// })

const formOptions1 = ref([{
  title: '基础信息',
  name: 'base',
  visible: true,
  buttonPosition: 'block',
  previewRows: 2,
  children: [{
    label: '这是一个很长的标题',
    labelWidth: 80,
    name: 'name',
    component: Input,
    props: {
      defaultValue: '张三',
    },
  }, {
    label: '性别',
    name: 'sex',
    component: RadioGroup,
    props: {
      options: [
        { label: '男', value: '1' },
        { label: '女', value: '2' },
      ],
      defaultValue: '1',
    },
  }, {
    label: '志愿者状态',
    name: 'auditstate',
    component: Select,
    code: 'wsld_volauditstate',
  }, {
    label: '个人特长',
    name: 'pspecialty',
    component: Select,
    code: 'wsld_pspecialty',
  }, {
    name: 'servicestime',
    component: Select,
    span: '100%',
    code: 'wsld_servicestime2',
  }, {
    label: '活动类别(最多选择5个)',
    labelWidth: 80,
    name: 'servicestype',
    component: Select,
    span: '100%',
    code: 'wsld_sz_servicetype',
    props: {
      max: 5,
    },
  }, {
    label: '职业',
    name: 'worklevel',
    span: 1,
    component: Select,
    code: 'wsld_workstatesz',
  }, {
    label: '文化程度',
    name: 'degree',
    span: 1,
    component: Select,
    code: 'wsld_edu',
  }, {
    label: '政治面貌',
    name: 'politics',
    span: 1,
    component: Select,
    code: 'wsld_political',
  }, {
    label: '户籍所在地',
    name: 'domicile',
    span: 1,
    component: Select,
    code: 'wsld_domicile',
  }, {
    label: '证件类型1',
    name: 'cardtype1',
    component: LDesignUpload,
  // rules: [{ required: true, message: '请填写证件类型' }],
  }],
}, {
  title: '更多信息',
  visible: false,
  name: 'extra',
  previewRows: 2,
  children: [{
    label: '这是一个很长的标题',
    labelWidth: 80,
    name: 'name1',
    component: Input,
    props: {
      defaultValue: '张三',
    },
  }, {
    label: '性别',
    name: 'sex1',
    component: RadioGroup,
    props: {
      options: [
        { label: '男', value: '1' },
        { label: '女', value: '2' },
      ],
      defaultValue: '1',
    },
  }, {
    label: '志愿者状态',
    name: 'auditstate1',
    component: Select,
    code: 'wsld_volauditstate',
  }, {
    label: '个人特长',
    name: 'pspecialty1',
    component: Select,
    code: 'wsld_pspecialty',
  }, {
    label: '服务时间',
    name: 'servicestime1',
    component: Select,
    span: '100%',
    code: 'wsld_servicestime2',
  }, {
    label: '活动类别(最多选择5个)',
    name: 'servicestype1',
    component: Select,
    span: '100%',
    code: 'wsld_sz_servicetype',
    props: {
      max: 5,
    },
  }, {
    label: '职业',
    name: 'worklevel1',
    span: 1,
    component: Select,
    code: 'wsld_workstatesz',
  }, {
    label: '文化程度',
    name: 'degree1',
    span: 1,
    component: Select,
    code: 'wsld_edu',
  }, {
    label: '政治面貌',
    name: 'politics1',
    span: 1,
    component: Select,
    code: 'wsld_political',
  }, {
    label: '户籍所在地',
    name: 'domicile1',
    span: 1,
    component: Select,
    code: 'wsld_domicile',
  }, {
    label: '国籍',
    name: 'country1',
    span: 1,
    component: Select,
    code: 'wsld_country',
  }, {
    label: '民族',
    name: 'nation1',
    span: 1,
    component: Select,
    code: 'wsld_nation',
  }, {
    label: '证件类型',
    name: 'cardtype1',
    component: Select,
    code: 'wsld_cardtype',
  // rules: [{ required: true, message: '请填写证件类型' }],
  }, {
    label: '证件类型1',
    name: 'cardtype11',
    component: LDesignUpload,
  // rules: [{ required: true, message: '请填写证件类型' }],
  }],
}])

const options = ref<LDesignFormOptions[]>([{
  component: LDesignTitle,
  props: {
    default: '组织信息',
  },
  labelWidth: 0,
  span: '100%',
}, {
  label: '姓名',
  component: Input,
  name: 'name',
  span: '30%',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
      form.name = 'test'
    }} />
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1',
  span: '70%',
  props: {
  }
}, {
  component: LDesignTitle,
  props: {
    default: '组织信息',
  },
  labelWidth: 0,
  span: '100%',
}, {
  label: '性别',
  component: Select,
  name: 'sex',
  span: 1,
  props: {
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }],
    onChange(v) {
      form.name = `${new Date().getSeconds()}`
      // form.value.name = `${form.value.name}${v}`
    }
  }
}, {
  component: LDesignTitle,
  props: {
    default: '组织信息1',
  },
  labelWidth: 0,
  span: '100%',
}, {
  label: '性别',
  component: RadioGroup,
  name: 'sex',
  props: {
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }],
    onChange(v) {
      form.name = `${new Date().getSeconds()}`
      // form.value.name = `${form.value.name}${v}`
    }
  }
}])

function onChange(v, ctx) {
}

function onClick() {
  visible.value = true
}

</script>
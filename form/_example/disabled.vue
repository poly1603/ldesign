<template>
  <div>
    <p>全局只读</p>
    <LDesignForm
      :options="options"
      disabled
    />
    <p>部分只读</p>
    <LDesignForm
      :options="options1"
    />
  </div>
</template>
<script lang="ts" setup>
import { DatePicker, Input, RadioGroup, Select } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import type {LDesignFormOptions} from '@ldesign/form'
import { ref } from 'vue';


const options = ref<LDesignFormOptions[]>([{
  label: '姓名',
  component: Input,
  props: {
    value: '刘勇'
  },
  name: 'name'
}, {
  label: '性别',
  component: RadioGroup,
  name: 'sex',
  props: {
    value: '1',
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
  }
}, {
  label: '爱好',
  component: Select,
  name: 'hobby',
  props: {
    value: 'lanqiu',
    options: [{
      label: '篮球',
      value: 'lanqiu'
    }]
  }
}, {
  label: '出生日期',
  name: 'birthday',
  component: DatePicker,
  style: {
    width: '100%'
  },
  props: {
    value: '2024/10/1'
  }
}, {
  label: '住址',
  name: 'address',
  component: Input,
  props: {
    value: '湖北省武汉市江夏区'
  }
}, {
  label: 'QQ',
  name: 'qq',
  component: Input,
  props: {
    value: '54854651465485'
  }
}])

const options1 = ref<LDesignFormOptions[]>([{
  label: '姓名',
  component: Input,
  props: {
    value: '刘勇',
    disabled: true,
  },
  name: 'name'
}, {
  label: '性别',
  component: RadioGroup,
  name: 'sex',
  props: {
    value: '1',
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
  }
}, {
  label: '爱好',
  component: Select,
  name: 'hobby',
  props: {
    value: 'lanqiu',
    options: [{
      label: '篮球',
      value: 'lanqiu'
    }]
  }
}, {
  label: '出生日期',
  name: 'birthday',
  component: DatePicker,
  style: {
    width: '100%'
  },
  props: {
    value: '2024/10/1'
  }
}, {
  label: '住址',
  name: 'address',
  component: Input,
  props: {
    value: '湖北省武汉市江夏区'
  }
}, {
  label: 'QQ',
  name: 'qq',
  component: Input,
  props: {
    value: '54854651465485'
  }
}])
</script>
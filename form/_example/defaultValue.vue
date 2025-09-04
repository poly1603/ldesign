<template>
  <div>
    <LDesignForm :options="options" :default-value="form" @change="onChange" />
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, } from '@ldesign/desktop-next';
import { LDesignForm } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { ref, reactive } from 'vue';

const form = reactive({
  name: '张三',
  sex: '1',
  name1: '李四'
})

const options = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
      form.name = 'test'
    }} />,
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1',
  props: {
  }
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
  }
}])

function onChange(v, ctx) {
}

</script>
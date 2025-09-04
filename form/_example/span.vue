<template>
  <div>
    <p>数字</p>
    <LDesignForm :options="options" />
    <p>字符串</p>
    <LDesignForm :options="options1" />
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup, Select } from '@ldesign/desktop-next';
import { LDesignForm } from '@ldesign/form'
import { ref } from 'vue';


const options = ref([{
  label: '姓名',
  component: Input,
  name: 'name',
  span: 2
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
    }]
  }
}])

const options1 = ref([{
  label: '姓名',
  component: Input,
  name: 'name',
  span: '40%'
}, {
  label: '性别',
  component: Select,
  name: 'sex',
  span: '60%',
  props: {
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
  }
}, {
  label: '姓名',
  component: Input,
  name: 'name1',
  span: '30%'
}, {
  label: '性别',
  component: Select,
  name: 'sex1',
  span: '30%',
  props: {
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
  }
}, {
  label: '性别',
  component: Select,
  name: 'sex1',
  span: '40%',
  props: {
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
  }
}])

</script>
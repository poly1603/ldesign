<template>
  <div>
    <h4>双向绑定赋值</h4>
    <LDesignForm
      :options="options"
      v-model="form"
    />

    <h4>属性赋值</h4>
    <LDesignForm
      :options="option1"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref, reactive } from 'vue';

const form = reactive({
  name: 'test',
  sex: '1'
})

const options = ref([{
  label: '姓名',
  component: Input,
  name: 'name'
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

const option1 = ref([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    value: '刘勇'
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
    defaultValue: '1'
  }
}])

</script>
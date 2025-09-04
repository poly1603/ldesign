<template>
  <div>
    <div>{{ form }}</div>
    <LDesignForm
      :options="options"
      v-model="form"
    />
    <Divider/>
    {{ form1 }}
    {{ condition11 ? 'yes' : 'false' }}
    <RadioGroup v-model="form1.name">
      <Radio value="0">1</Radio>
      <Radio value="1">2</Radio>
    </RadioGroup>
    <LDesignForm
      :options="options1"
      v-model="form1"
    />
  </div>
</template>
<script lang="ts" setup>
import { Divider, Input, RadioGroup, Radio } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref, reactive, computed, watch } from 'vue';

// const form = reactive({
//   name: '',
//   sex: '0'
// })

const form = ref<any>({
  name: '0',
  sex: '1'
})

const form1 = reactive({
  name: '0',
  sex: '1'
})

const condition1 = computed(() => form.value.name === '0')

const condition2 = computed(() => form.value.name === '1')

const condition11 = computed(() => {
  return form1.name === '0'
})

const condition22 = computed(() => form1.name === '1')

const options = computed(() => [{
  label: '姓名',
  component: RadioGroup,
  name: 'name',
  props: {
    options: [{
      label: '条件一',
      value: '0'
    }, {
      label: '条件二',
      value: '1'
    }]
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
    }]
  }
}, {
  label: '条件1',
  component: Input,
  name: 'sex1',
  props: {
    defaultValue: ''
  },
  visible: condition1.value
}, {
  label: '条件2',
  component: Input,
  name: 'sex2',
  props: {
    defaultValue: ''
  },
  visible: condition2.value
}, {
  label: '条件21',
  component: Input,
  name: 'sex21',
  props: {
    defaultValue: ''
  },
  visible: condition2.value
}])

const options1 = computed(() => [{
  label: '姓名',
  component: RadioGroup,
  name: 'name',
  props: {
    options: [{
      label: '条件一',
      value: '0'
    }, {
      label: '条件二',
      value: '1'
    }]
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
    }]
  }
}, {
  label: '条件1',
  component: Input,
  name: 'sex1',
  props: {
    defaultValue: ''
  },
  visible: condition11.value
}, {
  label: '条件2',
  component: Input,
  name: 'sex2',
  props: {
    defaultValue: ''
  },
  visible: condition22.value
}, {
  label: '条件21',
  component: Input,
  name: 'sex21',
  props: {
    defaultValue: ''
  },
  visible: condition2.value
}])

</script>
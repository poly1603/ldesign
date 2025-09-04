<template>
  <div>
    <h4>插槽方式</h4>
    <LDesignForm
      :options="options"
      @reset="onReset"
    >
      <template #reset="{reset}">
        <Button theme="default" variant="outline" @click="reset">reset</Button>
      </template>
    </LDesignForm>
    <h4>属性方式</h4>
    <LDesignForm
      :options="options"
      reset="reset"
      @reset="onReset"
    >
    </LDesignForm>
    <br/>
    <LDesignForm
      :options="options"
      :reset="{
        default: 'reset'
      }"
      @reset="onReset"
    >
    </LDesignForm>
    <h4>函数方式</h4>
    <LDesignForm
      :options="options"
      :reset="renderCustomReset"
      @reset="onReset"
    >
    </LDesignForm>
    <h4>不显示重置按钮</h4>
    <LDesignForm
      :options="options"
      :reset="false"
      @reset="onReset"
    >
    </LDesignForm>
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';


const options = ref([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    defaultValue: ''
  }
}, {
  label: '性别',
  component: RadioGroup,
  name: 'sex',
  props: {
    defaultValue: '0',
    options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
  }
}])

function renderCustomReset (_, ctx) {
  return (
    <Button theme="default" variant="outline" onClick={ctx.reset}>reset</Button>
  )
}

function onReset (value) {
  console.log(value)
}

</script>
<template>
  <div class="ldate-panel ldate-time-panel">
    <!-- 小时 -->
    <div class="ldate-time-column">
      <div class="ldate-time-column__title">时</div>
      <div 
        class="ldate-time-picker" 
        ref="hourPickerRef"
        @wheel.prevent="handleWheel($event, 'hour')"
      >
        <div class="ldate-time-picker__mask">
          <div class="ldate-time-picker__mask-top"></div>
          <div class="ldate-time-picker__indicator"></div>
          <div class="ldate-time-picker__mask-bottom"></div>
        </div>
        <div 
          class="ldate-time-picker__content" 
          :style="{ transform: `translateY(${hourTranslateY}px)` }"
          ref="hourContentRef"
        >
          <div
            v-for="hour in hours"
            :key="hour.value"
            :class="getItemClass(hour, selectedHour)"
            @click="handleHourClick(hour)"
          >
            {{ hour.text }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分钟 -->
    <div class="ldate-time-column">
      <div class="ldate-time-column__title">分</div>
      <div 
        class="ldate-time-picker" 
        ref="minutePickerRef"
        @wheel.prevent="handleWheel($event, 'minute')"
      >
        <div class="ldate-time-picker__mask">
          <div class="ldate-time-picker__mask-top"></div>
          <div class="ldate-time-picker__indicator"></div>
          <div class="ldate-time-picker__mask-bottom"></div>
        </div>
        <div 
          class="ldate-time-picker__content"
          :style="{ transform: `translateY(${minuteTranslateY}px)` }"
          ref="minuteContentRef"
        >
          <div
            v-for="minute in minutes"
            :key="minute.value"
            :class="getItemClass(minute, selectedMinute)"
            @click="handleMinuteClick(minute)"
          >
            {{ minute.text }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 秒 -->
    <div class="ldate-time-column">
      <div class="ldate-time-column__title">秒</div>
      <div 
        class="ldate-time-picker" 
        ref="secondPickerRef"
        @wheel.prevent="handleWheel($event, 'second')"
      >
        <div class="ldate-time-picker__mask">
          <div class="ldate-time-picker__mask-top"></div>
          <div class="ldate-time-picker__indicator"></div>
          <div class="ldate-time-picker__mask-bottom"></div>
        </div>
        <div 
          class="ldate-time-picker__content"
          :style="{ transform: `translateY(${secondTranslateY}px)` }"
          ref="secondContentRef"
        >
          <div
            v-for="second in seconds"
            :key="second.value"
            :class="getItemClass(second, selectedSecond)"
            @click="handleSecondClick(second)"
          >
            {{ second.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { TimePanel as TimePanelCore } from '@ldesign/datepicker-core';
import type { TimeCell } from '@ldesign/datepicker-shared';

const props = defineProps<{
  core: any;
  state: any;
  config: any;
}>();

const emit = defineEmits<{
  'select-time': [time: Date];
}>();

// Refs
const hourPickerRef = ref<HTMLElement>();
const minutePickerRef = ref<HTMLElement>();
const secondPickerRef = ref<HTMLElement>();
const hourContentRef = ref<HTMLElement>();
const minuteContentRef = ref<HTMLElement>();
const secondContentRef = ref<HTMLElement>();

// 滚动位置
const hourTranslateY = ref(0);
const minuteTranslateY = ref(0);
const secondTranslateY = ref(0);

// 当前选中值
const selectedHour = ref(new Date().getHours());
const selectedMinute = ref(new Date().getMinutes());
const selectedSecond = ref(new Date().getSeconds());

// 项目高度（固定为 36px）
const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 7; // 可见项数量
const OFFSET = Math.floor(VISIBLE_ITEMS / 2); // 偏移量

// Computed
const value = computed(() => {
  return props.state?.value instanceof Date ? props.state.value : new Date();
});

const panel = computed(() => {
  return new TimePanelCore({
    value: value.value,
    use12Hours: props.config?.use12Hours,
  });
});

const hours = computed(() => panel.value.generateHours());
const minutes = computed(() => panel.value.generateMinutes());
const seconds = computed(() => panel.value.generateSeconds());

// Methods
const getItemClass = (item: TimeCell, selected: number) => {
  return [
    'ldate-time-picker__item',
    {
      'ldate-time-picker__item--selected': item.value === selected,
      'ldate-time-picker__item--disabled': item.disabled,
    },
  ];
};

const scrollToValue = (value: number, type: 'hour' | 'minute' | 'second') => {
  const translateY = OFFSET * ITEM_HEIGHT - value * ITEM_HEIGHT;
  
  if (type === 'hour') {
    hourTranslateY.value = translateY;
  } else if (type === 'minute') {
    minuteTranslateY.value = translateY;
  } else if (type === 'second') {
    secondTranslateY.value = translateY;
  }
};

const handleWheel = (event: WheelEvent, type: 'hour' | 'minute' | 'second') => {
  const delta = event.deltaY > 0 ? 1 : -1;
  
  if (type === 'hour') {
    const newHour = Math.max(0, Math.min(23, selectedHour.value + delta));
    if (newHour !== selectedHour.value) {
      selectedHour.value = newHour;
      scrollToValue(newHour, 'hour');
      emitTimeChange();
    }
  } else if (type === 'minute') {
    const newMinute = Math.max(0, Math.min(59, selectedMinute.value + delta));
    if (newMinute !== selectedMinute.value) {
      selectedMinute.value = newMinute;
      scrollToValue(newMinute, 'minute');
      emitTimeChange();
    }
  } else if (type === 'second') {
    const newSecond = Math.max(0, Math.min(59, selectedSecond.value + delta));
    if (newSecond !== selectedSecond.value) {
      selectedSecond.value = newSecond;
      scrollToValue(newSecond, 'second');
      emitTimeChange();
    }
  }
};

const handleHourClick = (hour: TimeCell) => {
  if (!hour.disabled) {
    selectedHour.value = hour.value;
    scrollToValue(hour.value, 'hour');
    emitTimeChange();
  }
};

const handleMinuteClick = (minute: TimeCell) => {
  if (!minute.disabled) {
    selectedMinute.value = minute.value;
    scrollToValue(minute.value, 'minute');
    emitTimeChange();
  }
};

const handleSecondClick = (second: TimeCell) => {
  if (!second.disabled) {
    selectedSecond.value = second.value;
    scrollToValue(second.value, 'second');
    emitTimeChange();
  }
};

const emitTimeChange = () => {
  const newTime = new Date(value.value);
  newTime.setHours(selectedHour.value);
  newTime.setMinutes(selectedMinute.value);
  newTime.setSeconds(selectedSecond.value);
  emit('select-time', newTime);
};

// 初始化
onMounted(() => {
  nextTick(() => {
    selectedHour.value = value.value.getHours();
    selectedMinute.value = value.value.getMinutes();
    selectedSecond.value = value.value.getSeconds();
    
    scrollToValue(selectedHour.value, 'hour');
    scrollToValue(selectedMinute.value, 'minute');
    scrollToValue(selectedSecond.value, 'second');
  });
});

// 监听外部值变化
watch(() => props.state?.value, (newValue) => {
  if (newValue instanceof Date) {
    selectedHour.value = newValue.getHours();
    selectedMinute.value = newValue.getMinutes();
    selectedSecond.value = newValue.getSeconds();
    
    nextTick(() => {
      scrollToValue(selectedHour.value, 'hour');
      scrollToValue(selectedMinute.value, 'minute');
      scrollToValue(selectedSecond.value, 'second');
    });
  }
}, { deep: true });
</script>
